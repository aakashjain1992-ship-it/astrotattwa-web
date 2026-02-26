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
          <span className="text-sm text-muted-foreground">Last updated: February 26, 2026</span>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-3xl px-4 py-10 space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Privacy Policy</h1>
          <p className="text-muted-foreground">
            Astrotattwa (&quot;we&quot;, &quot;our&quot;, &quot;us&quot;) values your privacy. This Privacy Policy explains how we collect, use, protect, and process your information when you access or use{' '}
            <a href="https://astrotattwa.com" className="text-primary hover:underline">
              https://astrotattwa.com
            </a>
            .
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            By using our services, you agree to this policy.
          </p>
        </div>

        <Section title="1. Overview">
          <p className="text-sm text-muted-foreground">
            Astrotattwa (&quot;we&quot;, &quot;our&quot;, &quot;us&quot;) values your privacy. This Privacy Policy explains how we collect, use, protect, and process your information when you access or use{' '}
            <a href="https://astrotattwa.com" className="text-primary hover:underline">
              https://astrotattwa.com
            </a>
            .
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            By using our services, you agree to this policy.
          </p>
        </Section>

        <Section title="2. Information We Collect">
          <SubSection title="A. Information You Provide">
            <p className="text-sm text-muted-foreground">
              When creating an account or using our services, you may provide:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground mt-2">
              <li>Name</li>
              <li>Email address</li>
              <li>Birth details (date, time, place of birth)</li>
              <li>Account preferences</li>
              <li>Communications with us</li>
            </ul>
            <p className="text-sm text-muted-foreground mt-2">
              Birth details are required solely to generate astrological charts and reports.
            </p>
          </SubSection>

          <SubSection title="B. Automatically Collected Information">
            <p className="text-sm text-muted-foreground">
              For security and operational purposes, we may collect:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground mt-2">
              <li>IP address</li>
              <li>Country (derived from network data)</li>
              <li>Device and browser information</li>
              <li>Login activity logs</li>
            </ul>
            <p className="text-sm text-muted-foreground mt-2">
              This information is used exclusively for security, fraud prevention, and service integrity. We do not use tracking cookies for advertising purposes.
            </p>
          </SubSection>
        </Section>

        <Section title="3. Legal Basis for Processing (GDPR)">
          <p className="text-sm text-muted-foreground">
            If you are located in the European Economic Area (EEA), we process your data under the following lawful bases:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground mt-2">
            <li><strong>Contractual necessity</strong> – to provide astrology services you request</li>
            <li><strong>Legitimate interest</strong> – to secure and improve our platform</li>
            <li><strong>Consent</strong> – where applicable</li>
          </ul>
        </Section>

        <Section title="4. How We Use Your Information">
          <p className="text-sm text-muted-foreground">
            Your data is used to:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground mt-2">
            <li>Create and manage your account</li>
            <li>Generate personalized astrological charts and reports</li>
            <li>Maintain security and prevent unauthorized access</li>
            <li>Respond to inquiries</li>
            <li>Comply with legal obligations</li>
          </ul>
          <p className="text-sm text-muted-foreground mt-3">
            We do <strong>not</strong> sell, rent, or trade personal information.
          </p>
        </Section>

        <Section title="5. AI-Generated Content">
          <p className="text-sm text-muted-foreground">
            Astrotattwa may use automated systems to generate chart interpretations based solely on birth-related inputs necessary to produce the requested output.
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            No unrelated personal data or financial information is processed in this context.
          </p>
        </Section>

        <Section title="6. Data Sharing">
          <p className="text-sm text-muted-foreground">
            We may share data:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground mt-2">
            <li>With essential service providers that help operate our platform</li>
            <li>If required by law</li>
            <li>To prevent fraud or protect our rights</li>
          </ul>
          <p className="text-sm text-muted-foreground mt-3">
            We do not share personal data for advertising purposes.
          </p>
        </Section>

        <Section title="7. Data Retention">
          <p className="text-sm text-muted-foreground">
            We retain your information:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground mt-2">
            <li>While your account remains active</li>
            <li>As required to provide services</li>
            <li>As necessary to comply with legal obligations</li>
          </ul>
          <p className="text-sm text-muted-foreground mt-3">
            You may request deletion of your account at any time.
          </p>
        </Section>

        <Section title="8. International Data Transfers">
          <p className="text-sm text-muted-foreground">
            Your information may be processed in jurisdictions outside your country of residence.
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Where required, we implement appropriate safeguards consistent with applicable data protection laws.
          </p>
        </Section>

        <Section title="9. Your Rights">
          <p className="text-sm text-muted-foreground">
            Depending on your jurisdiction, you may have the right to:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground mt-2">
            <li>Access your personal data</li>
            <li>Correct inaccuracies</li>
            <li>Request deletion</li>
            <li>Restrict processing</li>
            <li>Withdraw consent</li>
            <li>Lodge a complaint with a supervisory authority</li>
          </ul>
          <p className="text-sm text-muted-foreground mt-3">
            To exercise your rights, contact:{' '}
            <a href="mailto:support@astrotattwa.com" className="text-primary hover:underline">
              support@astrotattwa.com
            </a>
          </p>
        </Section>

        <Section title="10. Children's Privacy">
          <p className="text-sm text-muted-foreground">
            Astrotattwa is not intended for individuals under 13 years of age. We do not knowingly collect data from children.
          </p>
        </Section>

        <Section title="11. Changes to This Policy">
          <p className="text-sm text-muted-foreground">
            We may update this Privacy Policy periodically. Changes will be reflected with an updated date.
          </p>
        </Section>

        <Section title="12. Contact">
          <div className="text-sm text-muted-foreground space-y-1">
            <p><strong>Astrotattwa</strong></p>
            <p>
              Email:{' '}
              <a href="mailto:support@astrotattwa.com" className="text-primary hover:underline">
                support@astrotattwa.com
              </a>
            </p>
            <p>
              Website:{' '}
              <a href="https://astrotattwa.com" className="text-primary hover:underline">
                https://astrotattwa.com
              </a>
            </p>
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
