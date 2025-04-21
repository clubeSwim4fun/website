import { cn } from '@/utilities/ui'
import defaultAvatar from 'public/static-images/default-avatar.png'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'

export const UserAvatar: React.FC<{
  avatarUrl?: string
  className?: string
  fallbackText?: string
}> = ({ avatarUrl, className, fallbackText }) => {
  return (
    <div className={cn('w-auto lg:max-h-none flex justify-center', className)}>
      <Avatar className="rounded-full w-fit h-fit min-w-52 min-h-52 max-w-60 lg:max-w-none shadow-2xl ring-2 ring-gray-400">
        <AvatarImage src={avatarUrl || defaultAvatar.src} />
        <AvatarFallback className="text-3xl h-fit w-fit min-w-52 min-h-52 items-center text-center">
          {fallbackText?.toUpperCase() || 'U'}
        </AvatarFallback>
      </Avatar>
    </div>
  )
}
