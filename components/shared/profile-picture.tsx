import Image from 'next/image'
import { cn } from '@/lib/utils'

interface ProfilePictureProps {
  src?: string
  alt: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const sizeMap = {
  xs: 'h-6 w-6',
  sm: 'h-8 w-8',
  md: 'h-12 w-12',
  lg: 'h-20 w-20',
  xl: 'h-30 w-30',
}

export function ProfilePicture({ src, alt, size = 'md', className }: ProfilePictureProps) {
  const initials = alt
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <div className={cn('relative rounded-full overflow-hidden border-2 border-background', sizeMap[size], className)}>
      {src ? (
        <Image src={src || "/placeholder.svg"} alt={alt} fill className="object-cover" />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-accent-primary to-accent-secondary flex items-center justify-center text-background font-semibold text-sm">
          {initials}
        </div>
      )}
    </div>
  )
}
