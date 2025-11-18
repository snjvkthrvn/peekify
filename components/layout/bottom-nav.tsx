"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Calendar, User, Bell } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/feed', icon: Home, label: 'Feed' },
  { href: '/calendar', icon: Calendar, label: 'Calendar' },
  { href: '/profile', icon: User, label: 'Profile' },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 z-50 bg-background-secondary/95 backdrop-blur-sm border-t border-border md:hidden safe-area-pb"
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center gap-1 px-6 py-2 rounded-lg transition-colors',
                'min-w-[64px] min-h-[48px]', // Accessibility: minimum touch target size
                'focus:outline-none focus:ring-2 focus:ring-accent-primary',
                isActive
                  ? 'text-accent-primary bg-accent-primary/10'
                  : 'text-foreground-tertiary hover:text-foreground hover:bg-background-tertiary'
              )}
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon className="h-6 w-6" aria-hidden="true" />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
