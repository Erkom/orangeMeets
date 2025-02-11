import {
	ArrowDownOnSquareIcon,
	ArrowUpOnSquareIcon,
	ArrowsPointingInIcon,
	ArrowsPointingOutIcon,
	BugAntIcon,
	CheckIcon,
	ChevronDownIcon,
	ChevronUpIcon,
	ClipboardDocumentCheckIcon,
	ClipboardDocumentIcon,
	Cog6ToothIcon,
	ComputerDesktopIcon,
	EllipsisVerticalIcon,
	ExclamationCircleIcon,
	HandRaisedIcon,
	MicrophoneIcon,
	MinusIcon,
	PhoneXMarkIcon,
	PlusIcon,
	ServerStackIcon,
	SignalIcon,
	SignalSlashIcon,
	UserGroupIcon,
	VideoCameraIcon,
	VideoCameraSlashIcon,
	WifiIcon,
	XCircleIcon,
} from '@heroicons/react/20/solid'
import type { FC } from 'react'
import { cn } from '~/utils/style'
import { MicrophoneSlashIcon } from './custom/MicrophoneSlashIcon'

const iconMap = {
	micOn: MicrophoneIcon,
	micOff: MicrophoneSlashIcon,
	videoOn: VideoCameraIcon,
	videoOff: VideoCameraSlashIcon,
	screenshare: ComputerDesktopIcon,
	arrowsOut: ArrowsPointingOutIcon,
	arrowsIn: ArrowsPointingInIcon,
	cog: Cog6ToothIcon,
	xCircle: XCircleIcon,
	bug: BugAntIcon,
	phoneXMark: PhoneXMarkIcon,
	handRaised: HandRaisedIcon,
	userGroup: UserGroupIcon,
	PlusIcon,
	MinusIcon,
	CheckIcon,
	ChevronUpIcon,
	ChevronDownIcon,
	EllipsisVerticalIcon,
	ClipboardDocumentCheckIcon,
	ClipboardDocumentIcon,
	SignalIcon,
	SignalSlashIcon,
	ExclamationCircleIcon,
	ServerStackIcon,
	ArrowDownOnSquareIcon,
	ArrowUpOnSquareIcon,
	WifiIcon,
}

type IconType =
  | 'micOn'
  | 'micOff'
  | 'videoOn'
  | 'videoOff'
  | 'screenshare'
  | 'arrowsOut'
  | 'arrowsIn'
  | 'cog'
  | 'xCircle'
  | 'bug'
  | 'phoneXMark'
  | 'handRaised'
  | 'userGroup'
  | 'PlusIcon'
  | 'MinusIcon'
  | 'CheckIcon'
  | 'ChevronUpIcon'
  | 'ChevronDownIcon'
  | 'EllipsisVerticalIcon'
  | 'ClipboardDocumentCheckIcon'
  | 'ClipboardDocumentIcon'
  | 'SignalIcon'
  | 'SignalSlashIcon'
  | 'ExclamationCircleIcon'
  | 'ServerStackIcon'
  | 'ArrowDownOnSquareIcon'
  | 'ArrowUpOnSquareIcon'
  | 'WifiIcon'
  | 'crown'
  | 'userMinus'

interface IconProps {
	type: IconType
}

export const Icon: FC<
	IconProps & Omit<JSX.IntrinsicElements['svg'], 'ref'>
> = ({ type, className, ...rest }) => {
	switch (type) {
		case 'crown':
			return (
				<svg
					{...rest}
					className={cn('h-[1em] w-[1em]', className)}
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 24 24"
					fill="currentColor"
					stroke="none"
				>
					<path d="M2.5 6.5C2.5 5.94772 2.94772 5.5 3.5 5.5C4.05228 5.5 4.5 5.94772 4.5 6.5C4.5 7.05228 4.05228 7.5 3.5 7.5C2.94772 7.5 2.5 7.05228 2.5 6.5Z"/>
					<path d="M19.5 6.5C19.5 5.94772 19.9477 5.5 20.5 5.5C21.0523 5.5 21.5 5.94772 21.5 6.5C21.5 7.05228 21.0523 7.5 20.5 7.5C19.9477 7.5 19.5 7.05228 19.5 6.5Z"/>
					<path d="M11 4C11 3.44772 11.4477 3 12 3C12.5523 3 13 3.44772 13 4C13 4.55228 12.5523 5 12 5C11.4477 5 11 4.55228 11 4Z"/>
					<path fill-rule="evenodd" clip-rule="evenodd" d="M6.32258 7.27419L11.6774 5.5L12 5.38711L12.3226 5.5L17.6774 7.27419L18.2704 7.48052L18.4768 8.07348L20.5 15H3.5L5.52322 8.07348L5.72956 7.48052L6.32258 7.27419ZM6.72581 8.27419L4.90161 14.5H19.0984L17.2742 8.27419L12.3226 6.61289L12 6.5L11.6774 6.61289L6.72581 8.27419Z"/>
					<path d="M4 16H20V19C20 19.5523 19.5523 20 19 20H5C4.44772 20 4 19.5523 4 19V16Z"/>
				</svg>
			)
		case 'userMinus':
			return (
				<svg {...rest} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
					<path d="M16 21V19C16 16.7909 14.2091 15 12 15H5C2.79086 15 1 16.7909 1 19V21" />
					<path fillRule="evenodd" clipRule="evenodd" d="M8.5 11C10.7091 11 12.5 9.20914 12.5 7C12.5 4.79086 10.7091 3 8.5 3C6.29086 3 4.5 4.79086 4.5 7C4.5 9.20914 6.29086 11 8.5 11Z" />
					<path d="M17 8H23" />
				</svg>
			)
		default:
			const Component = iconMap[type]
			return <Component className={cn('h-[1em]', className)} {...rest} />
	}
}
