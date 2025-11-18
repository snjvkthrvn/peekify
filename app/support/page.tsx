import { Music, Mail, Github, MessageCircle, HelpCircle } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function SupportPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="mb-8">
          <Link href="/">
            <Button variant="ghost" className="mb-4">
              ← Back to Home
            </Button>
          </Link>
          <div className="flex items-center gap-3 mb-4">
            <Music className="h-8 w-8 text-accent-primary" />
            <h1 className="text-4xl font-bold">Support</h1>
          </div>
          <p className="text-foreground-secondary">We're here to help! Choose how you'd like to get support.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="p-6 rounded-lg bg-background-secondary border border-border hover:border-accent-primary transition-colors">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-full bg-accent-primary/10 flex items-center justify-center flex-shrink-0">
                <HelpCircle className="h-6 w-6 text-accent-primary" />
              </div>
              <div>
                <h2 className="text-xl font-semibold mb-2">FAQ</h2>
                <p className="text-foreground-secondary mb-4">
                  Find answers to common questions about using Peekify, connecting Spotify, and managing your account.
                </p>
                <Button variant="outline" asChild>
                  <Link href="#faq">View FAQ</Link>
                </Button>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-lg bg-background-secondary border border-border hover:border-accent-primary transition-colors">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-full bg-accent-primary/10 flex items-center justify-center flex-shrink-0">
                <Github className="h-6 w-6 text-accent-primary" />
              </div>
              <div>
                <h2 className="text-xl font-semibold mb-2">GitHub Issues</h2>
                <p className="text-foreground-secondary mb-4">
                  Report bugs, request features, or browse known issues on our GitHub repository.
                </p>
                <Button variant="outline" asChild>
                  <a href="https://github.com/ishanlovescoding/peekify/issues" target="_blank" rel="noopener noreferrer">
                    Open GitHub
                  </a>
                </Button>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-lg bg-background-secondary border border-border hover:border-accent-primary transition-colors">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-full bg-accent-primary/10 flex items-center justify-center flex-shrink-0">
                <Mail className="h-6 w-6 text-accent-primary" />
              </div>
              <div>
                <h2 className="text-xl font-semibold mb-2">Email Support</h2>
                <p className="text-foreground-secondary mb-4">
                  For account issues, privacy concerns, or general inquiries, send us an email.
                </p>
                <Button variant="outline" asChild>
                  <a href="mailto:support@peekify.app">support@peekify.app</a>
                </Button>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-lg bg-background-secondary border border-border hover:border-accent-primary transition-colors">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-full bg-accent-primary/10 flex items-center justify-center flex-shrink-0">
                <MessageCircle className="h-6 w-6 text-accent-primary" />
              </div>
              <div>
                <h2 className="text-xl font-semibold mb-2">Community</h2>
                <p className="text-foreground-secondary mb-4">
                  Join our community to connect with other users, share feedback, and get help.
                </p>
                <Button variant="outline" disabled>
                  Coming Soon
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div id="faq" className="mt-12">
          <h2 className="text-3xl font-bold mb-6">Frequently Asked Questions</h2>

          <div className="space-y-6">
            <div className="p-6 rounded-lg bg-background-secondary">
              <h3 className="text-xl font-semibold mb-2">How do I connect my Spotify account?</h3>
              <p className="text-foreground-secondary">
                Click "Continue with Spotify" on the login page. You'll be redirected to Spotify to authorize Peekify
                to access your listening history. We only access what's necessary to provide our service.
              </p>
            </div>

            <div className="p-6 rounded-lg bg-background-secondary">
              <h3 className="text-xl font-semibold mb-2">What data does Peekify access from Spotify?</h3>
              <p className="text-foreground-secondary">
                We access your recently played tracks, top tracks/artists, currently playing track, and basic profile
                information (name, email, profile picture). We never access your playlists, saved tracks, or following list.
              </p>
            </div>

            <div className="p-6 rounded-lg bg-background-secondary">
              <h3 className="text-xl font-semibold mb-2">How do I sync my listening history?</h3>
              <p className="text-foreground-secondary">
                Your listening history is synced automatically. You can also manually trigger a sync from your profile
                page or the calendar view.
              </p>
            </div>

            <div className="p-6 rounded-lg bg-background-secondary">
              <h3 className="text-xl font-semibold mb-2">Can I delete my account and data?</h3>
              <p className="text-foreground-secondary">
                Yes! Go to Settings → Account → Delete Account. This will permanently remove all your data including
                listening history, posts, comments, and reactions. You can also revoke Peekify's access from your
                Spotify account settings.
              </p>
            </div>

            <div className="p-6 rounded-lg bg-background-secondary">
              <h3 className="text-xl font-semibold mb-2">How do daily recaps work?</h3>
              <p className="text-foreground-secondary">
                Every day at 9:30 PM UTC, we generate a recap of your listening activity including total minutes,
                track count, and top tracks/artists. You'll receive a push notification (if enabled) and can view
                the recap in your feed.
              </p>
            </div>

            <div className="p-6 rounded-lg bg-background-secondary">
              <h3 className="text-xl font-semibold mb-2">How do I enable push notifications?</h3>
              <p className="text-foreground-secondary">
                When you first use Peekify, your browser will ask for notification permission. You can also enable
                them later in Settings → Notifications. You'll receive notifications for comments, reactions, and
                daily recaps.
              </p>
            </div>

            <div className="p-6 rounded-lg bg-background-secondary">
              <h3 className="text-xl font-semibold mb-2">Is Peekify free?</h3>
              <p className="text-foreground-secondary">
                Yes! Peekify is completely free to use. We may introduce premium features in the future, but core
                functionality will always remain free.
              </p>
            </div>

            <div className="p-6 rounded-lg bg-background-secondary">
              <h3 className="text-xl font-semibold mb-2">Why isn't my recent listening showing up?</h3>
              <p className="text-foreground-secondary">
                Spotify's API updates recently played tracks with a slight delay (usually 1-2 minutes). Try manually
                syncing your history. If the issue persists, make sure you're actively using Spotify and that Peekify
                still has access to your account.
              </p>
            </div>

            <div className="p-6 rounded-lg bg-background-secondary">
              <h3 className="text-xl font-semibold mb-2">Can I use Peekify without Spotify Premium?</h3>
              <p className="text-foreground-secondary">
                Yes! Peekify works with both free and premium Spotify accounts. However, some listening data may be
                limited based on Spotify's API restrictions for free accounts.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-12 p-6 rounded-lg bg-background-secondary border border-accent-primary/20">
          <h2 className="text-2xl font-semibold mb-4">Still need help?</h2>
          <p className="text-foreground-secondary mb-4">
            If you couldn't find an answer to your question, please reach out to us:
          </p>
          <div className="flex flex-wrap gap-4">
            <Button asChild>
              <a href="mailto:support@peekify.app">
                <Mail className="h-4 w-4 mr-2" />
                Email Support
              </a>
            </Button>
            <Button variant="outline" asChild>
              <a href="https://github.com/ishanlovescoding/peekify/issues" target="_blank" rel="noopener noreferrer">
                <Github className="h-4 w-4 mr-2" />
                Report an Issue
              </a>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
