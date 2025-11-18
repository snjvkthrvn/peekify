import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Music, Calendar, Users, Sparkles } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Music className="h-8 w-8 text-accent-primary" />
            <span className="text-2xl font-bold">Replay</span>
          </div>
          <Link href="/auth/login">
            <Button variant="ghost">Sign In</Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 lg:py-32">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent-primary/10 text-accent-primary text-sm font-medium">
            <Sparkles className="h-4 w-4" />
            Your Daily Music Diary
          </div>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-balance">
            Transform Your Spotify Listening Into{' '}
            <span className="text-accent-primary">Shareable Moments</span>
          </h1>
          
          <p className="text-lg md:text-xl text-foreground-secondary max-w-2xl mx-auto text-balance">
            Automatically track your daily Spotify habits, reveal your song of the day at 9:30pm, and discover what friends are listening to.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link href="/auth/login">
              <Button size="lg" className="w-full sm:w-auto bg-accent-primary hover:bg-accent-primary/90 text-background font-semibold">
                Connect with Spotify
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="w-full sm:w-auto">
              Watch Demo
            </Button>
          </div>

          {/* Hero Image Placeholder */}
          <div className="pt-12">
            <div className="rounded-2xl bg-gradient-to-br from-accent-primary/20 to-accent-secondary/20 aspect-video flex items-center justify-center border border-border overflow-hidden">
              <img 
                src="/music-app-interface-with-album-art-and-social-feed.jpg" 
                alt="Replay App Interface"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20 border-t border-border">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
            How Replay Works
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="space-y-4 p-6 rounded-xl bg-background-secondary border border-border">
              <div className="h-12 w-12 rounded-xl bg-accent-primary/10 flex items-center justify-center">
                <Music className="h-6 w-6 text-accent-primary" />
              </div>
              <h3 className="text-xl font-semibold">Automatic Tracking</h3>
              <p className="text-foreground-secondary">
                We passively track your Spotify listening throughout the day. Just keep the tab open and listen as usual.
              </p>
            </div>

            <div className="space-y-4 p-6 rounded-xl bg-background-secondary border border-border">
              <div className="h-12 w-12 rounded-xl bg-accent-secondary/10 flex items-center justify-center">
                <Sparkles className="h-6 w-6 text-accent-secondary" />
              </div>
              <h3 className="text-xl font-semibold">Daily Reveal at 9:30pm</h3>
              <p className="text-foreground-secondary">
                Every evening, discover your most-played song of the day with beautiful animations and stats.
              </p>
            </div>

            <div className="space-y-4 p-6 rounded-xl bg-background-secondary border border-border">
              <div className="h-12 w-12 rounded-xl bg-success/10 flex items-center justify-center">
                <Calendar className="h-6 w-6 text-success" />
              </div>
              <h3 className="text-xl font-semibold">Visual Music Archive</h3>
              <p className="text-foreground-secondary">
                Build a beautiful calendar of your daily songs. Look back at any day and relive musical memories.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Social Section */}
      <section className="container mx-auto px-4 py-20 border-t border-border">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold">
                Share With Friends, Not Everyone
              </h2>
              <p className="text-lg text-foreground-secondary">
                See what your friends are really listening to. React with BeReal-style profile pictures and emojis. No pressure, just authentic music discovery.
              </p>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <Users className="h-6 w-6 text-accent-primary shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold">Friends-Only Feed</div>
                    <div className="text-sm text-foreground-secondary">Your music stays between you and your friends</div>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Sparkles className="h-6 w-6 text-accent-primary shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold">Profile Picture Reactions</div>
                    <div className="text-sm text-foreground-secondary">React with your face + emoji, just like BeReal</div>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Music className="h-6 w-6 text-accent-primary shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold">Add to Queue</div>
                    <div className="text-sm text-foreground-secondary">One tap to add any friend's song to your Spotify</div>
                  </div>
                </li>
              </ul>
            </div>
            <div className="rounded-2xl bg-gradient-to-br from-accent-secondary/20 to-accent-primary/20 aspect-square flex items-center justify-center border border-border overflow-hidden">
              <img 
                src="/social-music-feed-with-reactions.jpg" 
                alt="Social Feed"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20 border-t border-border">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          <h2 className="text-3xl md:text-5xl font-bold text-balance">
            Ready to Start Your Music Diary?
          </h2>
          <p className="text-lg text-foreground-secondary">
            Connect your Spotify account and start tracking your daily listening in seconds.
          </p>
          <Link href="/auth/login">
            <Button size="lg" className="bg-accent-primary hover:bg-accent-primary/90 text-background font-semibold">
              Get Started Free
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border mt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Music className="h-6 w-6 text-accent-primary" />
              <span className="font-semibold">Replay</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-foreground-secondary">
              <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
              <Link href="/terms" className="hover:text-foreground transition-colors">Terms</Link>
              <Link href="/support" className="hover:text-foreground transition-colors">Support</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
