import { Music } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function PrivacyPage() {
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
            <h1 className="text-4xl font-bold">Privacy Policy</h1>
          </div>
          <p className="text-foreground-secondary">Last updated: {new Date().toLocaleDateString()}</p>
        </div>

        <div className="prose prose-invert max-w-none space-y-6">
          <section>
            <h2 className="text-2xl font-semibold mb-4">Introduction</h2>
            <p className="text-foreground-secondary">
              Peekify ("we", "our", or "us") respects your privacy and is committed to protecting your personal data.
              This privacy policy explains how we collect, use, and share information when you use our service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Information We Collect</h2>
            <h3 className="text-xl font-semibold mb-2">From Spotify</h3>
            <ul className="list-disc list-inside space-y-2 text-foreground-secondary">
              <li>Your Spotify profile information (display name, email, profile picture)</li>
              <li>Your listening history (recently played tracks)</li>
              <li>Your top tracks and artists</li>
              <li>Currently playing track information</li>
            </ul>

            <h3 className="text-xl font-semibold mb-2 mt-4">From Your Use of Peekify</h3>
            <ul className="list-disc list-inside space-y-2 text-foreground-secondary">
              <li>Posts, comments, and reactions you create</li>
              <li>Profile information you provide</li>
              <li>Device and browser information</li>
              <li>Usage patterns and preferences</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">How We Use Your Information</h2>
            <ul className="list-disc list-inside space-y-2 text-foreground-secondary">
              <li>To provide and improve our service</li>
              <li>To generate daily music recaps and statistics</li>
              <li>To enable social features (feed, comments, reactions)</li>
              <li>To send notifications about activity on your posts</li>
              <li>To personalize your experience</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Data Sharing</h2>
            <p className="text-foreground-secondary">
              We do not sell your personal information. We only share data:
            </p>
            <ul className="list-disc list-inside space-y-2 text-foreground-secondary">
              <li>With other users as part of the social features (posts, comments, reactions)</li>
              <li>With service providers who help us operate our service (hosting, analytics)</li>
              <li>When required by law or to protect our rights</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Your Rights</h2>
            <ul className="list-disc list-inside space-y-2 text-foreground-secondary">
              <li>Access your personal data</li>
              <li>Update or correct your information</li>
              <li>Delete your account and data</li>
              <li>Opt out of notifications</li>
              <li>Revoke Spotify access at any time</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Data Security</h2>
            <p className="text-foreground-secondary">
              We use industry-standard security measures to protect your data, including:
            </p>
            <ul className="list-disc list-inside space-y-2 text-foreground-secondary">
              <li>Encrypted connections (HTTPS)</li>
              <li>Secure token-based authentication</li>
              <li>Regular security audits</li>
              <li>Limited data retention</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Third-Party Services</h2>
            <p className="text-foreground-secondary">
              We use the following third-party services:
            </p>
            <ul className="list-disc list-inside space-y-2 text-foreground-secondary">
              <li><strong>Spotify:</strong> Music data and authentication</li>
              <li><strong>Neon:</strong> Database hosting</li>
              <li><strong>Upstash:</strong> Caching and session management</li>
              <li><strong>Supabase:</strong> File storage</li>
              <li><strong>Firebase:</strong> Push notifications</li>
              <li><strong>Vercel:</strong> Frontend hosting and analytics</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
            <p className="text-foreground-secondary">
              If you have questions about this Privacy Policy or your data, please contact us at:
            </p>
            <p className="text-accent-primary">
              <Link href="/support">Support Page</Link>
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Changes to This Policy</h2>
            <p className="text-foreground-secondary">
              We may update this privacy policy from time to time. We will notify you of any changes by posting
              the new policy on this page and updating the "Last updated" date.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
