import { useEffect, useMemo, useRef, useState } from 'react'
import type { ClientMessage, RoomState, ServerMessage } from '~/types/Messages'
import assertNever from '~/utils/assertNever'

import usePartySocket from 'partysocket/react'
import type { UserMedia } from './useUserMedia'

export default function useRoom({
	roomName,
	userMedia,
}: {
	roomName: string
	userMedia: UserMedia
}) {
	const [roomState, setRoomState] = useState<RoomState>({
		users: [],
		ai: { enabled: false },
	})

	const userLeftFunctionRef = useRef(() => {})

	useEffect(() => {
		return () => userLeftFunctionRef.current()
	}, [])

	// Adicionar ref para preservar o status de host durante reconexões
	const isHostRef = useRef(false)

	const websocket = usePartySocket({
		party: 'rooms',
		room: roomName,
		onMessage: (e) => {
			const message = JSON.parse(e.data) as ServerMessage
			switch (message.type) {
				case 'roomState':
					 // Preservar o status de host durante atualizações de estado
					if (message.state.users.some(u => u.id === websocket.id && u.isHost)) {
						isHostRef.current = true
					}
					// prevent updating state if nothing has changed
					if (JSON.stringify(message.state) === JSON.stringify(roomState)) break
					setRoomState(message.state)
					break
				case 'error':
					console.error('Received error message from WebSocket')
					console.error(message.error)
					break
				case 'directMessage':
					break
				case 'muteMic':
					userMedia.turnMicOff()
					break
				case 'partyserver-pong':
				case 'aiSdp':
					// do nothing
					break
				default:
					assertNever(message)
					break
			}
		},
	})

	userLeftFunctionRef.current = () =>
		websocket.send(JSON.stringify({ type: 'userLeft' } satisfies ClientMessage))

	useEffect(() => {
		function onBeforeUnload() {
			userLeftFunctionRef.current()
		}
		window.addEventListener('beforeunload', onBeforeUnload)
		return () => {
			window.removeEventListener('beforeunload', onBeforeUnload)
		}
	}, [websocket])

	// setup a heartbeat
	useEffect(() => {
		const interval = setInterval(() => {
			websocket.send(
				JSON.stringify({ type: 'heartbeat' } satisfies ClientMessage)
			)
		}, 5_000)

		return () => clearInterval(interval)
	}, [websocket])

	const identity = useMemo(
		() => {
			const user = roomState.users.find((u) => u.id === websocket.id)
			console.log('Setting identity:', {
				userId: websocket.id,
				found: !!user,
				isHost: user?.isHost || isHostRef.current,
				preservedHost: isHostRef.current
			})
			
			// Garantir que isHost é preservado e convertido para booleano
			return user ? {
				...user,
				isHost: !!(user.isHost || isHostRef.current)
			} : undefined
		},
		[roomState.users, websocket.id]
	)

	const otherUsers = useMemo(
		() => roomState.users.filter((u) => u.id !== websocket.id && u.joined),
		[roomState.users, websocket.id]
	)

	return { identity, otherUsers, websocket, roomState }
}
