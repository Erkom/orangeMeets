import type { Env } from '~/types/Env'
import type { ClientMessage, ServerMessage, User } from '~/types/Messages'
import { assertError } from '~/utils/assertError'
import assertNever from '~/utils/assertNever'
import { assertNonNullable } from '~/utils/assertNonNullable'
import getUsername from '~/utils/getUsername.server'

import {
	Server,
	type Connection,
	type ConnectionContext,
	type WSMessage,
} from 'partyserver'

/**
 * The ChatRoom Durable Object Class
 *
 * ChatRoom implements a Durable Object that coordinates an
 * individual chat room. Participants connect to the room using
 * WebSockets, and the room broadcasts messages from each participant
 * to all others.
 */
export class ChatRoom extends Server<Env> {
	static options = {
		hibernate: true,
	}

	// Adiciona campo para identificar o anfitrião
	private hostId: string | null = null;

	async onStart(): Promise<void> {
		// TODO: make this a part of partyserver
		this.ctx.setWebSocketAutoResponse(
			new WebSocketRequestResponsePair(
				JSON.stringify({ type: 'partyserver-ping' }),
				JSON.stringify({ type: 'partyserver-pong' })
			)
		)

		if (!this.ctx.storage.getAlarm()) {
			// start the alarm to broadcast state every 30 seconds
			this.ctx.storage.setAlarm(30000)
		}
	}

	async onConnect(
		connection: Connection<User>,
		ctx: ConnectionContext
	): Promise<void> {
		const username = await getUsername(ctx.request)
		assertNonNullable(username)

		const user: User = {
			id: connection.id,
			name: username,
			joined: false,
			raisedHand: false,
			speaking: false,
			tracks: {
				audioEnabled: false,
				videoEnabled: false,
				screenShareEnabled: false,
			},
		}

		connection.setState(user)
		
		// Define o primeiro usuário como anfitrião
		if (this.hostId === null) {
			this.hostId = connection.id;
		}

		this.broadcastState()
	}

	sendMessage<M extends ServerMessage>(connection: Connection, message: M) {
		connection.send(JSON.stringify(message))
	}

	broadcastState() {
		// Converte o iterador de conexões para um array
		const connections = Array.from(this.getConnections<User>());

		if (!Array.isArray(connections)) {
			console.error('connections is not an array:', connections);
			return;
		}

		connections.forEach(connection => {
			const userState = {
				users: connections.map((otherConnection) => {
					const user = otherConnection.state;
					if (connection.id === this.hostId || otherConnection.id === this.hostId) {
						// Anfitrião pode ver e ouvir todos e todos podem ver e ouvir o anfitrião
						return user;
					} else {
						// Não incluir outros participantes
						return {
							...user,
							tracks: {
								...user!.tracks,
								audioEnabled: false,
								videoEnabled: false,
							},
						};
					}
				}).filter((x) => !!x),
			};

			this.sendMessage(connection, {
				type: 'roomState',
				state: userState,
			} satisfies ServerMessage);
		});
	}

	async onMessage(
		connection: Connection<User>,
		message: WSMessage
	): Promise<void> {
		try {
			if (typeof message !== 'string') {
				console.warn('Received non-string message')
				return
			}

			let data: ClientMessage = JSON.parse(message)
			console.log('Received message:', data); // Log detalhado das mensagens recebidas

			switch (data.type) {
				case 'userLeft':
					// TODO: ?? 
					break
				case 'userUpdate':
					connection.setState(data.user)
					this.broadcastState()
					break
				case 'directMessage':
					const { to, message } = data

					for (const otherConnection of this.getConnections<User>()) {
						if (otherConnection.id === to) {
							this.sendMessage(otherConnection, {
								type: 'directMessage',
								from: connection.state!.name,
								message,
							})
							break
						}
					}
					console.warn(
						`User with id "${to}" not found, cannot send DM from "${connection.state!.name}"`
					)
					break

				case 'muteUser':
					for (const otherConnection of this.getConnections<User>()) {
						if (otherConnection.id === data.id) {
							otherConnection.setState({
								...otherConnection.state!,
								tracks: {
									...otherConnection.state!.tracks,
									audioEnabled: false,
								},
							})
							this.sendMessage(otherConnection, {
								type: 'muteMic',
							})

							this.broadcastState()
							break
						}
					}
					console.warn(
						`User with id "${data.id}" not found, cannot mute user from "${connection.state!.name}"`
					)

					break
				case 'partyserver-ping':
					// do nothing, this should never be received
					console.warn(
						"Received partyserver-ping from client. You shouldn't be seeing this message. Did you forget to enable hibernation?"
					)
					break
				default:
					console.error('Unhandled message type:', data.type); // Adiciona log detalhado para mensagens não tratadas
					assertNever(data)
					break
			}
		} catch (err) {
			assertError(err)
			// TODO: should this even be here?
			// Report any exceptions directly back to the client. As with our handleErrors() this
			// probably isn't what you'd want to do in production, but it's convenient when testing.
			this.sendMessage(connection, {
				type: 'error',
				error: err.stack,
			} satisfies ServerMessage)
		}
	}

	onClose() {
		this.broadcastState()
	}

	onError(): void | Promise<void> {
		this.broadcastState()
	}

	alarm(): void | Promise<void> {
		// technically we don't need to broadcast state on an alarm,
		// but let's keep it for a while and see if it's useful
		this.broadcastState()
		this.ctx.storage.setAlarm(30000)
	}
}
