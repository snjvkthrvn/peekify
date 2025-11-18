import Image from 'next/image'
import { cn } from '@/lib/utils'

interface AlbumArtProps {
  src: string
  alt: string
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'hero'
  className?: string
  priority?: boolean
}

const sizeMap = {
  sm: 'h-20 w-20',
  md: 'h-52 w-52',
  lg: 'h-96 w-96',
  xl: 'h-[400px] w-[400px]',
  hero: 'w-full aspect-square',
}

export function AlbumArt({ src, alt, size = 'md', className, priority = false }: AlbumArtProps) {
  return (
    <div className={cn('relative rounded-xl overflow-hidden bg-background-tertiary shadow-lg', sizeMap[size], className)}>
      <Image
        src={src || '/placeholder.svg?height=400&width=400&query=album+art'}
        alt={alt}
        fill
        className="object-cover"
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        priority={priority}
        loading={priority ? 'eager' : 'lazy'}
      />
    </div>
  )
}
