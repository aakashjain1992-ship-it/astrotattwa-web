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
          <span className="text-sm text-muted-foreground">Last updated: February 16, 2026</span>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-3xl px-4 py-10 space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Terms of Service</h1>
          <p className="text-muted-foreground">
            By accessing or using Astrotattwa (&quot;the Service&quot;) at astrotattwa.com, you agree to be bound by these Terms of Service. Please read them carefully before using our platform.
          </p>
        </div>

        <Section title="1. Acceptance of Terms">
          <p className="text-sm text-muted-foreground">
            By creating an account or using Astrotattwa, you confirm that you are at least 13 years of age and agree to these Terms of Service and our Privacy Policy. If you do not agree, please do not use our Service.
          </p>
        </Section>

        <Section title="2. Description of Service">
          <p className="text-sm text-muted-foreground">
            Astrotattwa provides Vedic astrology calculations, birth chart visualizations, and AI-generated astrological reports. The Service is provided for informational and entertainment purposes only.
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            <strong>Important disclaimer:</strong> Astrology is not a science. Our calculations, charts, and reports are provided for personal reflection and entertainment purposes only. Nothing on Astrotattwa should be construed as medical, financial, legal, or professional advice. Do not make important life decisions based solely on astrological information.
          </p>
        </Section>

        <Section title="3. User Accounts">
          <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
            <li>You are responsible for maintaining the confidentiality of your account credentials</li>
            <li>You are responsible for all activity that occurs under your account</li>
            <li>You must provide accurate and complete information when creating your account</li>
            <li>You may not create accounts for others without their permission</li>
            <li>You must notify us immediately of any unauthorized use of your account</li>
            <li>We reserve the right to suspend or terminate accounts that violate these Terms</li>
          </ul>
        </Section>

        <Section title="4. Free and Paid Features">
          <SubSection title="Free features">
            <p className="text-sm text-muted-foreground">
              The following features are permanently free and will remain so:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground mt-1">
              <li>Birth chart calculations (all planetary positions)</li>
              <li>Chart visualizations (D1, D9, and all divisional charts)</li>
              <li>Vimshottari Dasha calculations</li>
              <li>Saving up to 10 birth charts</li>
            </ul>
          </SubSection>
          <SubSection title="Paid features">
            <p className="text-sm text-muted-foreground">
              Detailed AI-generated reports are available for purchase. Prices are displayed at the time of purchase and are in Indian Rupees (₹) unless otherwise stated.
            </p>
          </SubSection>
        </Section>

        <Section title="5. Payments and Refunds">
          <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
            <li>All payments are processed securely through Razorpay (India) or Stripe (international)</li>
            <li>We do not store your payment card details</li>
            <li>Prices are inclusive of applicable taxes unless stated otherwise</li>
            <li><strong>Refund policy:</strong> You may request a full refund within 7 days of purchase if you have not yet accessed or downloaded the report. Once a report has been opened or downloaded, no refund is available</li>
            <li>To request a refund, contact <a href="mailto:support@astrotattwa.com" className="text-primary hover:underline">support@astrotattwa.com</a> with your order details</li>
          </ul>
        </Section>

        <Section title="6. Acceptable Use">
          <p className="text-sm text-muted-foreground">You agree not to:</p>
          <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground mt-2">
            <li>Use the Service for any unlawful purpose</li>
            <li>Attempt to gain unauthorized access to our systems or other users&apos; accounts</li>
            <li>Use automated tools to scrape, crawl, or extract data from our platform</li>
            <li>Reverse engineer or attempt to extract the source code of our software</li>
            <li>Resell or redistribute content from Astrotattwa without written permission</li>
            <li>Upload or transmit any malicious code or content</li>
            <li>Impersonate any person or entity</li>
          </ul>
        </Section>

        <Section title="7. Intellectual Property">
          <p className="text-sm text-muted-foreground">
            All content on Astrotattwa — including but not limited to text, graphics, charts, software, and AI-generated reports — is owned by or licensed to Astrotattwa and is protected by intellectual property laws.
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            When you purchase a report, you receive a personal, non-transferable license to use that report for your own personal purposes. You may not resell, redistribute, or publish reports without our written consent.
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Your birth data and personal information remain yours. We do not claim ownership over data you provide to us.
          </p>
        </Section>

        <Section title="8. Accuracy of Calculations">
          <p className="text-sm text-muted-foreground">
            We use the Swiss Ephemeris with Lahiri Ayanamsa to provide accurate Vedic astrology calculations. While we strive for precision, slight variations may exist compared to other software due to differences in ayanamsa calculations or rounding. We do not warrant that our calculations are error-free.
          </p>
        </Section>

        <Section title="9. Limitation of Liability">
          <p className="text-sm text-muted-foreground">
            To the maximum extent permitted by applicable law, Astrotattwa shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the Service, including but not limited to decisions made based on astrological information provided by our platform.
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Our total liability to you for any claims arising from use of the Service shall not exceed the amount you paid us in the 12 months preceding the claim.
          </p>
        </Section>

        <Section title="10. Termination">
          <p className="text-sm text-muted-foreground">
            You may delete your account at any time from your account settings. Upon deletion, your personal data will be removed within 30 days, except where retention is required by law.
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            We may suspend or terminate your access to the Service at our discretion if you violate these Terms, without prior notice.
          </p>
        </Section>

        <Section title="11. Governing Law">
          <p className="text-sm text-muted-foreground">
            These Terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of the courts in India.
          </p>
        </Section>

        <Section title="12. Changes to Terms">
          <p className="text-sm text-muted-foreground">
            We reserve the right to update these Terms at any time. We will notify you of material changes by email or prominent notice on our website. Continued use of the Service after changes constitutes acceptance of the new Terms.
          </p>
        </Section>

        <Section title="13. Contact Us">
          <p className="text-sm text-muted-foreground">
            For questions about these Terms, contact us at:
          </p>
          <div className="mt-2 text-sm text-muted-foreground space-y-1">
            <p><strong>Email:</strong> <a href="mailto:support@astrotattwa.com" className="text-primary hover:underline">support@astrotattwa.com</a></p>
            <p><strong>Website:</strong> <a href="https://astrotattwa.com" className="text-primary hover:underline">astrotattwa.com</a></p>
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

function SubSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold">{title}</h3>
      {children}
    </div>
  )
}
