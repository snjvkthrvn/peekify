"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Calendar, User, Settings, Music, LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/auth-context'

const navItems = [
  { href: '/feed', icon: Home, label: 'Feed' },
  { href: '/calendar', icon: Calendar, label: 'Calendar' },
  { href: '/profile', icon: User, label: 'Profile' },
  { href: '/settings', icon: Settings, label: 'Settings' },
]

export function SidebarNav() {
  const pathname = usePathname()
  const { logout } = useAuth()

  return (
    <aside 
      className="hidden md:flex flex-col w-64 border-r border-border bg-background-secondary p-6 sticky top-0 h-screen"
      role="navigation"
      aria-label="Main navigation"
    >
      {/* Logo */}
      <Link 
        href="/feed" 
        className="flex items-center gap-2 mb-8 focus:outline-none focus:ring-2 focus:ring-accent-primary rounded-lg p-2 -m-2"
        aria-label="Replay home"
      >
        <Music className="h-8 w-8 text-accent-primary" aria-hidden="true" />
        <span className="text-2xl font-bold">Replay</span>
      </Link>

      {/* Navigation */}
      <nav className="flex-1 space-y-2" role="list">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          
          return (
            <Link
              key={item.href}
              href={item.href}
              role="listitem"
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium',
                'focus:outline-none focus:ring-2 focus:ring-accent-primary',
                isActive
                  ? 'bg-accent-primary/10 text-accent-primary'
                  : 'text-foreground-secondary hover:bg-background-tertiary hover:text-foreground'
              )}
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon className="h-5 w-5" aria-hidden="true" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Logout */}
      <Button
        variant="ghost"
        className="justify-start gap-3 text-foreground-secondary hover:text-error hover:bg-error/10"
        onClick={logout}
        aria-label="Log out of your account"
      >
        <LogOut className="h-5 w-5" aria-hidden="true" />
        Logout
      </Button>
    </aside>
  )
}
