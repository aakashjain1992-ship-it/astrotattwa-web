import type { Metadata } from 'next'
import Link from 'next/link'
import { Stars } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Privacy Policy — Astrotattwa',
  description: 'Privacy Policy for Astrotattwa — how we collect, use, and protect your data.',
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="mx-auto max-w-3xl px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Stars className="h-5 w-5 text-primary" />
            <span className="font-semibold">Astrotattwa</span>
          </Link>
          <span className="text-sm text-muted-foreground">Last updated: February 16, 2026</span>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-3xl px-4 py-10 space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Privacy Policy</h1>
          <p className="text-muted-foreground">
            This Privacy Policy explains how Astrotattwa (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) collects, uses, and protects your personal information when you use our website at astrotattwa.com.
          </p>
        </div>

        <Section title="1. Information We Collect">
          <SubSection title="Information you provide">
            <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
              <li>Account information: name, email address, and password when you register</li>
              <li>Birth data: date of birth, time of birth, and place of birth for chart calculations</li>
              <li>Profile information you optionally provide</li>
            </ul>
          </SubSection>
          <SubSection title="Information collected automatically">
            <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
              <li>Usage data: pages visited, features used, and time spent on the platform</li>
              <li>Device information: browser type, operating system, and screen resolution</li>
              <li>IP address and approximate location (country/city level)</li>
              <li>Cookies and similar tracking technologies (see Section 6)</li>
            </ul>
          </SubSection>
          <SubSection title="Information from third parties">
            <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
              <li>If you sign in with Google, we receive your name, email address, and profile picture from Google</li>
            </ul>
          </SubSection>
        </Section>

        <Section title="2. How We Use Your Information">
          <p className="text-sm text-muted-foreground">We use your information to:</p>
          <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground mt-2">
            <li>Create and manage your account</li>
            <li>Calculate and display your Vedic astrology birth charts</li>
            <li>Generate AI-powered astrological reports (paid feature)</li>
            <li>Send transactional emails such as account verification and password reset</li>
            <li>Process payments for premium reports</li>
            <li>Improve our platform and fix technical issues</li>
            <li>Comply with legal obligations</li>
          </ul>
          <p className="text-sm text-muted-foreground mt-3">
            We do <strong>not</strong> sell your personal data to third parties. We do <strong>not</strong> use your birth data for any purpose other than providing the service you requested.
          </p>
        </Section>

        <Section title="3. Data Storage and Security">
          <p className="text-sm text-muted-foreground">
            Your data is stored securely on Supabase (PostgreSQL database) hosted on servers in the United States. We use industry-standard security measures including:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground mt-2">
            <li>HTTPS encryption for all data in transit</li>
            <li>Row Level Security (RLS) ensuring you can only access your own data</li>
            <li>Encrypted password storage (passwords are never stored in plain text)</li>
            <li>Regular security audits</li>
          </ul>
          <p className="text-sm text-muted-foreground mt-3">
            While we take all reasonable precautions, no method of transmission over the internet is 100% secure. We cannot guarantee absolute security.
          </p>
        </Section>

        <Section title="4. Sharing Your Information">
          <p className="text-sm text-muted-foreground">We share your information only with:</p>
          <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground mt-2">
            <li><strong>Supabase</strong> — database and authentication infrastructure</li>
            <li><strong>Google</strong> — if you use Google sign-in (governed by Google&apos;s Privacy Policy)</li>
            <li><strong>Resend</strong> — email delivery service for transactional emails</li>
            <li><strong>Razorpay / Stripe</strong> — payment processing (we do not store card details)</li>
            <li><strong>OpenAI / Anthropic</strong> — AI report generation (anonymized chart data only)</li>
          </ul>
          <p className="text-sm text-muted-foreground mt-3">
            We may also share information if required by law, court order, or to protect the rights and safety of our users.
          </p>
        </Section>

        <Section title="5. Your Rights">
          <p className="text-sm text-muted-foreground">You have the right to:</p>
          <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground mt-2">
            <li><strong>Access</strong> — request a copy of the personal data we hold about you</li>
            <li><strong>Correction</strong> — update or correct inaccurate information</li>
            <li><strong>Deletion</strong> — request deletion of your account and all associated data</li>
            <li><strong>Portability</strong> — receive your data in a machine-readable format</li>
            <li><strong>Objection</strong> — opt out of certain types of data processing</li>
          </ul>
          <p className="text-sm text-muted-foreground mt-3">
            To exercise any of these rights, contact us at <a href="mailto:privacy@astrotattwa.com" className="text-primary hover:underline">privacy@astrotattwa.com</a>. We will respond within 30 days.
          </p>
        </Section>

        <Section title="6. Cookies">
          <p className="text-sm text-muted-foreground">
            We use cookies and similar technologies for:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground mt-2">
            <li><strong>Essential cookies</strong> — required for authentication and security (cannot be disabled)</li>
            <li><strong>Analytics cookies</strong> — help us understand how users interact with the platform</li>
          </ul>
          <p className="text-sm text-muted-foreground mt-3">
            You can control non-essential cookies through your browser settings.
          </p>
        </Section>

        <Section title="7. Children's Privacy">
          <p className="text-sm text-muted-foreground">
            Astrotattwa is not intended for users under the age of 13. We do not knowingly collect personal information from children. If you believe a child has provided us with personal information, please contact us and we will delete it promptly.
          </p>
        </Section>

        <Section title="8. Changes to This Policy">
          <p className="text-sm text-muted-foreground">
            We may update this Privacy Policy from time to time. We will notify you of significant changes by email or by posting a prominent notice on our website. Your continued use of Astrotattwa after changes constitutes acceptance of the updated policy.
          </p>
        </Section>

        <Section title="9. Contact Us">
          <p className="text-sm text-muted-foreground">
            If you have questions about this Privacy Policy or your data, contact us at:
          </p>
          <div className="mt-2 text-sm text-muted-foreground space-y-1">
            <p><strong>Email:</strong> <a href="mailto:privacy@astrotattwa.com" className="text-primary hover:underline">privacy@astrotattwa.com</a></p>
            <p><strong>Website:</strong> <a href="https://astrotattwa.com" className="text-primary hover:underline">astrotattwa.com</a></p>
          </div>
        </Section>

        <div className="border-t pt-6 flex items-center justify-between text-sm text-muted-foreground">
          <Link href="/" className="hover:text-foreground">← Back to home</Link>
          <Link href="/terms" className="hover:text-foreground">Terms of Service →</Link>
        </div>
      </main>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="text-xl font-semibold">{title}</h2>
      {children}
    </section>
  )
}

function SubSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold">{title}</h3>
      {children}
    </div>
  )
}
