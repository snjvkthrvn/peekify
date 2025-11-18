import { Music } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function TermsPage() {
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
            <h1 className="text-4xl font-bold">Terms of Service</h1>
          </div>
          <p className="text-foreground-secondary">Last updated: {new Date().toLocaleDateString()}</p>
        </div>

        <div className="prose prose-invert max-w-none space-y-6">
          <section>
            <h2 className="text-2xl font-semibold mb-4">Acceptance of Terms</h2>
            <p className="text-foreground-secondary">
              By accessing and using Peekify, you accept and agree to be bound by the terms and provision of this agreement.
              If you do not agree to these terms, please do not use our service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Description of Service</h2>
            <p className="text-foreground-secondary">
              Peekify is a social platform that connects to your Spotify account to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-foreground-secondary">
              <li>Track and display your listening history</li>
              <li>Generate daily music recaps and statistics</li>
              <li>Enable sharing and social interactions around music</li>
              <li>Provide insights into your listening habits</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Account Requirements</h2>
            <ul className="list-disc list-inside space-y-2 text-foreground-secondary">
              <li>You must have a valid Spotify account</li>
              <li>You must be at least 13 years old</li>
              <li>You are responsible for maintaining account security</li>
              <li>One person or entity may not maintain more than one account</li>
              <li>You must provide accurate and current information</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">User Conduct</h2>
            <p className="text-foreground-secondary">You agree NOT to:</p>
            <ul className="list-disc list-inside space-y-2 text-foreground-secondary">
              <li>Post harmful, offensive, or illegal content</li>
              <li>Harass, abuse, or harm other users</li>
              <li>Impersonate others or misrepresent your identity</li>
              <li>Violate intellectual property rights</li>
              <li>Attempt to gain unauthorized access to the service</li>
              <li>Use automated systems to access the service</li>
              <li>Spam or send unsolicited messages</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Content Ownership</h2>
            <p className="text-foreground-secondary">
              <strong>Your Content:</strong> You retain ownership of content you post. By posting, you grant us a
              license to display and distribute your content within the service.
            </p>
            <p className="text-foreground-secondary mt-4">
              <strong>Our Content:</strong> Peekify and its original content, features, and functionality are owned
              by us and are protected by copyright, trademark, and other laws.
            </p>
            <p className="text-foreground-secondary mt-4">
              <strong>Spotify Data:</strong> Music data, album art, and track information are owned by Spotify and
              respective rights holders. We use this data under Spotify's terms of service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Privacy</h2>
            <p className="text-foreground-secondary">
              Your privacy is important to us. Please review our{' '}
              <Link href="/privacy" className="text-accent-primary hover:underline">
                Privacy Policy
              </Link>{' '}
              to understand how we collect, use, and protect your information.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Termination</h2>
            <p className="text-foreground-secondary">
              We may terminate or suspend your account at any time for violations of these terms.
              You may delete your account at any time through the settings page.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Disclaimer of Warranties</h2>
            <p className="text-foreground-secondary">
              The service is provided "as is" without warranties of any kind, either express or implied.
              We do not guarantee that the service will be error-free, secure, or uninterrupted.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Limitation of Liability</h2>
            <p className="text-foreground-secondary">
              Peekify shall not be liable for any indirect, incidental, special, consequential, or punitive damages
              resulting from your use or inability to use the service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Changes to Terms</h2>
            <p className="text-foreground-secondary">
              We reserve the right to modify these terms at any time. We will notify users of any material changes.
              Your continued use of the service after changes constitutes acceptance of the new terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Third-Party Services</h2>
            <p className="text-foreground-secondary">
              This service integrates with Spotify and is subject to Spotify's terms of service. We are not
              responsible for Spotify's actions or policies.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Contact</h2>
            <p className="text-foreground-secondary">
              For questions about these Terms of Service, please visit our{' '}
              <Link href="/support" className="text-accent-primary hover:underline">
                Support Page
              </Link>.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
