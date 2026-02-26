import type { Metadata } from 'next'
import Link from 'next/link'
import { Stars } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Terms of Service — Astrotattwa',
  description: 'Terms of Service for Astrotattwa — the rules and conditions for using our platform.',
}

export default function TermsPage() {
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
          <h1 className="text-3xl font-bold">Terms of Service</h1>
          <p className="text-muted-foreground">
            By accessing or using Astrotattwa, you agree to these Terms.
          </p>
        </div>

        <Section title="1. Acceptance">
          <p className="text-sm text-muted-foreground">
            By accessing or using Astrotattwa, you agree to these Terms.
          </p>
        </Section>

        <Section title="2. Nature of Service">
          <p className="text-sm text-muted-foreground">
            Astrotattwa provides Vedic astrology charts, timelines, and interpretative reports.
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            All content is for informational and educational purposes only.
          </p>
        </Section>

        <Section title="3. No Professional Advice">
          <p className="text-sm text-muted-foreground">
            Astrological insights provided through the platform are not medical, financial, legal, or professional advice.
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Users should exercise independent judgment.
          </p>
        </Section>

        <Section title="4. User Obligations">
          <p className="text-sm text-muted-foreground">
            You agree to:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground mt-2">
            <li>Provide accurate birth information</li>
            <li>Maintain account confidentiality</li>
            <li>Use the platform lawfully</li>
            <li>Refrain from attempting unauthorized access</li>
          </ul>
          <p className="text-sm text-muted-foreground mt-3">
            Violation may result in account suspension.
          </p>
        </Section>

        <Section title="5. Intellectual Property">
          <p className="text-sm text-muted-foreground">
            All platform content, including software, design, reports, and branding, remains the property of Astrotattwa.
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Unauthorized reproduction or distribution is prohibited.
          </p>
        </Section>

        <Section title="6. Limitation of Liability">
          <p className="text-sm text-muted-foreground">
            Astrotattwa is provided &quot;as is&quot; without warranties of any kind.
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            We are not liable for:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground mt-2">
            <li>Decisions made based on generated reports</li>
            <li>Service interruptions</li>
            <li>Losses arising from use of the platform</li>
          </ul>
        </Section>

        <Section title="7. Termination">
          <p className="text-sm text-muted-foreground">
            We may suspend or terminate accounts for misuse or violation of these Terms.
          </p>
        </Section>

        <Section title="8. Governing Law">
          <p className="text-sm text-muted-foreground">
            These Terms are governed by the laws of India.
          </p>
        </Section>

        <Section title="9. Modifications">
          <p className="text-sm text-muted-foreground">
            We may update these Terms from time to time.
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Continued use of the service constitutes acceptance of revised Terms.
          </p>
        </Section>

        <Section title="10. Contact">
          <div className="text-sm text-muted-foreground space-y-1">
            <p>
              <a href="mailto:support@astrotattwa.com" className="text-primary hover:underline">
                support@astrotattwa.com
              </a>
            </p>
            <p>
              <a href="https://astrotattwa.com" className="text-primary hover:underline">
                https://astrotattwa.com
              </a>
            </p>
          </div>
        </Section>

        <div className="border-t pt-6 flex items-center justify-between text-sm text-muted-foreground">
          <Link href="/" className="hover:text-foreground">← Back to home</Link>
          <Link href="/privacy" className="hover:text-foreground">Privacy Policy →</Link>
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
