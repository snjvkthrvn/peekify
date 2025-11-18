import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/contexts/auth-context'
import { RevealProvider } from '@/contexts/reveal-context'
import { QueryProvider } from '@/contexts/query-provider'
import { ThemeProvider } from '@/contexts/theme-context'
import { Toaster } from '@/components/ui/toaster'
import { ErrorBoundary } from '@/components/error-boundary'
import Script from 'next/script'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Replay - Your Daily Music Diary',
  description: 'Transform your Spotify listening into shareable moments. Track your daily music and discover what friends are listening to.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Replay',
  },
  openGraph: {
    type: 'website',
    title: 'Replay - Your Daily Music Diary',
    description: 'Transform your Spotify listening into shareable moments',
    siteName: 'Replay',
    images: ['/og-image.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Replay - Your Daily Music Diary',
    description: 'Transform your Spotify listening into shareable moments',
    images: ['/og-image.png'],
  },
    generator: 'v0.app'
}

export const viewport: Viewport = {
  themeColor: '#1DB954',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <ErrorBoundary>
          <ThemeProvider>
            <QueryProvider>
              <AuthProvider>
                <RevealProvider>
                  {children}
                </RevealProvider>
              </AuthProvider>
            </QueryProvider>
          </ThemeProvider>
        </ErrorBoundary>
        <Toaster />
        
        <Script id="register-sw" strategy="afterInteractive">
          {`
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', () => {
                navigator.serviceWorker.register('/service-worker.js')
                  .then(reg => {
                    console.log('[v0] Service Worker registered')
                    // Request notification permission on load if not granted
                    if ('Notification' in window && Notification.permission === 'default') {
                      Notification.requestPermission()
                    }
                  })
                  .catch(err => console.error('[v0] Service Worker registration failed:', err))
              })
            }
          `}
        </Script>
        
        <Script id="pwa-install-prompt" strategy="afterInteractive">
          {`
            let deferredPrompt;
            window.addEventListener('beforeinstallprompt', (e) => {
              e.preventDefault();
              deferredPrompt = e;
              window.dispatchEvent(new CustomEvent('pwa-installable', { detail: e }));
            });
          `}
        </Script>
      </body>
    </html>
  )
}
