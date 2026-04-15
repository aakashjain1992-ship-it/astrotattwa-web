import type { Metadata } from 'next'
import { Header, Footer } from '@/components/layout'

export const metadata: Metadata = {
  title: 'Privacy Policy — Astrotattwa',
  description: 'Privacy Policy for Astrotattwa — how we collect, use, and protect your data.',
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      {/* Spacer for fixed header (Header is 64px tall) */}
      <div className="h-16" />

      {/* Content */}
      <main className="flex-1 mx-auto max-w-3xl px-4 py-10 space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold mb-4">Privacy Policy</h1>
          <span className="text-xs text-muted-foreground">Last updated: April 14, 2026</span>
        </div>

        {/* Preamble */}
        <section className="space-y-3">
          <div className="text-sm text-muted-foreground space-y-3">
            <p>
              This Privacy Policy is published in accordance with Rule 3(1) of the Information
              Technology (Intermediaries Guidelines) Rules, 2011 and the Information Technology
              (Reasonable Security Practices and Procedures and Sensitive Personal Data or
              Information) Rules, 2011, which require publishing of the Privacy Policy for
              collection, use, storage, and transfer of sensitive personal data or information.
            </p>
            <p>
              Astrotattwa (&quot;we&quot;, &quot;our&quot;, &quot;us&quot;) is committed to protecting your personal data
              and conducting our operations in strict adherence to applicable data privacy and
              security laws. This Privacy Policy explains what data we collect, how we use it,
              how you can control it, and the measures we take to protect it when you use{' '}
              <a href="https://astrotattwa.com" className="text-primary hover:underline">
                https://astrotattwa.com
              </a>{' '}
              (&apos;Platform&apos;).
            </p>
            <p>
              This Platform is primarily intended for users in India, and your personal data will
              primarily be stored and processed in India. You may be able to browse certain sections
              of the Platform without registering with us.
            </p>
          </div>
        </section>

        <Section title="1. User Consent">
          <p className="text-sm text-muted-foreground">
            By accessing and using this Platform, you acknowledge that you have read, understood,
            and expressly consent to the collection, use, processing, and disclosure of your
            personal information as described in this Privacy Policy.
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            If you do not agree with any part of this policy, please refrain from using the Platform.
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Your continued use of the Platform constitutes your unconditional consent to the terms
            of this Privacy Policy. This policy should be read in conjunction with our{' '}
            <a href="https://astrotattwa.com/terms" className="text-primary hover:underline">
              Terms of Service
            </a>
            .
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            This Privacy Policy may be updated periodically. Changes will be effective upon
            posting, and it is your responsibility to review it regularly.
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            You may withdraw your consent at any time by writing to the Grievance Officer at{' '}
            <a href="mailto:support@astrotattwa.com" className="text-primary hover:underline">
              support@astrotattwa.com
            </a>{' '}
            with the subject line <strong>&quot;Withdrawal of consent for processing personal data&quot;</strong>.
            We may verify such requests before acting on them. Please note that withdrawal of
            consent will not be retrospective. In the event you withdraw consent, we reserve
            the right to restrict or deny services for which such information is necessary.
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
              <li>Billing and payment information (for paid services)</li>
              <li>Account preferences</li>
              <li>Communications with us</li>
            </ul>
            <p className="text-sm text-muted-foreground mt-3">
              Birth details are required solely to generate astrological charts and reports.
            </p>
            <p className="text-sm text-muted-foreground mt-3 font-medium">
              THE USER REPRESENTS AND CONFIRMS THAT ALL INFORMATION PROVIDED IS AUTHENTIC,
              ACCURATE, CURRENT, AND UPDATED. ASTROTATTWA SHALL NOT BE RESPONSIBLE FOR THE
              AUTHENTICITY OF INFORMATION PROVIDED BY THE USER. THE USER SHALL BE PERSONALLY
              LIABLE FOR ANY BREACH OF THIS REPRESENTATION.
            </p>
            <p className="text-sm text-muted-foreground mt-3">
              <strong>Fraud Warning:</strong> If you receive an email, call, or message from anyone
              claiming to be Astrotattwa and requesting sensitive information such as your
              debit/credit card PIN, net-banking password, or OTP — do not share it. Astrotattwa
              will never ask for such information. If you have already disclosed such information,
              report it immediately to the appropriate law enforcement agency.
            </p>
          </SubSection>

          <SubSection title="B. Automatically Collected Information (Device Information)">
            <p className="text-sm text-muted-foreground">
              When you visit the Platform, we automatically collect certain device and usage
              information, including:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground mt-2">
              <li>IP address and approximate location (country/city)</li>
              <li>Browser type and version</li>
              <li>Device type and operating system</li>
              <li>Pages visited and time spent</li>
              <li>Referring website or search terms</li>
              <li>Login activity and security logs</li>
            </ul>
            <p className="text-sm text-muted-foreground mt-3">
              This information is collected via cookies, log files, web beacons, tags, and pixels.
              It is used exclusively for security, fraud prevention, performance optimization, and
              service integrity. We do not use tracking data for advertising purposes.
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              We may also track your behaviour and preferences on the Platform. This information
              is compiled and analysed on an aggregated, anonymised basis to improve the Platform
              and our services.
            </p>
          </SubSection>

          <SubSection title="C. Payment Information">
            <p className="text-sm text-muted-foreground">
              For paid services, we collect billing name, email, and transaction references.
              Card and banking details are processed directly and securely by our payment gateway
              and are never stored on Astrotattwa servers.
            </p>
          </SubSection>
        </Section>

        <Section title="3. Legal Basis for Processing (GDPR)">
          <p className="text-sm text-muted-foreground">
            If you are located in the European Economic Area (EEA), we process your data under
            the following lawful bases:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground mt-2">
            <li><strong>Contractual necessity</strong> — to provide the astrology services you request</li>
            <li><strong>Legitimate interest</strong> — to secure and improve our platform</li>
            <li><strong>Consent</strong> — where applicable</li>
          </ul>
          <p className="text-sm text-muted-foreground mt-3">
            You may withdraw consent at any time by contacting us.
          </p>
        </Section>

        <Section title="4. How We Use Your Information">
          <p className="text-sm text-muted-foreground">Your data is used to:</p>
          <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground mt-2">
            <li>Create and manage your account</li>
            <li>Generate personalized astrological charts, reports, and horoscopes</li>
            <li>Process payments and fulfil service orders</li>
            <li>Maintain security and prevent unauthorized access</li>
            <li>Respond to support inquiries</li>
            <li>Comply with legal obligations</li>
          </ul>
          <p className="text-sm text-muted-foreground mt-3">
            We do <strong>not</strong> sell, rent, or trade your personal information to any third party.
            To the extent we use your personal data for marketing communications, we will provide
            you the ability to opt out of such uses at any time.
          </p>
        </Section>

        <Section title="5. AI-Generated Content">
          <p className="text-sm text-muted-foreground">
            Astrotattwa uses automated systems and AI to generate chart interpretations and
            horoscope content based solely on birth-related inputs and astrological data
            necessary to produce the requested output.
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            No unrelated personal data or financial information is processed in this context.
          </p>
        </Section>

        <Section title="6. Sharing Your Personal Information">
          <p className="text-sm text-muted-foreground">
            We may share your data only in the following limited circumstances:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground mt-2">
            <li>
              With essential service providers (e.g., hosting, authentication, payment processing)
              who are bound by confidentiality obligations and applicable data privacy laws
            </li>
            <li>If required by law, regulation, court order, or government authority</li>
            <li>To prevent fraud, enforce our Terms, or protect our legal rights</li>
          </ul>
          <p className="text-sm text-muted-foreground mt-3">
            All approved third-party providers are vetted for data protection compliance before
            being engaged and are prohibited from using your data for any purpose beyond the
            specific service they perform.
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            We do not share personal data for advertising or marketing purposes.
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            When third-party service providers (such as payment gateways) collect your personal
            data directly from you, you will be governed by their privacy policies. Astrotattwa
            is not responsible for the privacy practices or content of third-party policies, and
            we encourage you to read them before disclosing any information.
          </p>
        </Section>

        <Section title="7. Cookies and Tracking">
          <p className="text-sm text-muted-foreground">
            We use cookies and similar technologies to operate and improve the Platform.
            You can configure your browser to refuse cookies; however, some features of the
            Platform may not function correctly without them.
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Please note that we do not alter our data collection practices in response to a
            &quot;Do Not Track&quot; signal from your browser.
          </p>
        </Section>

        <Section title="8. Data Retention">
          <p className="text-sm text-muted-foreground">We retain your information:</p>
          <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground mt-2">
            <li>While your account remains active</li>
            <li>As required to provide and fulfil services</li>
            <li>As necessary to comply with legal obligations</li>
          </ul>
          <p className="text-sm text-muted-foreground mt-3">
            You may delete your account directly via your Profile &amp; Settings on the Platform,
            or by contacting{' '}
            <a href="mailto:support@astrotattwa.com" className="text-primary hover:underline">
              support@astrotattwa.com
            </a>
            . Deleting your account will result in the loss of all associated data. We may delay
            deletion if there are pending grievances, claims, or service obligations.
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            We retain personal data for no longer than is required for the purpose for which it
            was collected, or as required under applicable law. We may retain data in anonymised
            form for analytical and research purposes even after account deletion. Data required
            to fulfil legal obligations or resolve pending disputes may also be retained even
            after account deletion.
          </p>
          <p className="text-sm text-muted-foreground mt-3">You also have the right to:</p>
          <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground mt-2">
            <li>Access a copy of the personal data we hold about you</li>
            <li>Correct inaccurate or incomplete data</li>
            <li>Restrict how your data is processed</li>
            <li>Receive your data in a portable, structured format</li>
          </ul>
        </Section>

        <Section title="9. Data Security">
          <p className="text-sm text-muted-foreground">
            We implement security measures including encryption, access controls, and activity
            monitoring to protect your data against unauthorized access, alteration, disclosure,
            or destruction.
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            While we take all reasonable precautions, no method of internet transmission is 100%
            secure. You are responsible for maintaining the confidentiality of your account
            credentials.
          </p>
        </Section>

        <Section title="10. International Data Transfers">
          <p className="text-sm text-muted-foreground">
            Your information may be processed in jurisdictions outside your country of residence,
            including through cloud infrastructure and third-party service providers. Where
            required, we implement appropriate safeguards consistent with applicable data
            protection laws.
          </p>
        </Section>

        <Section title="11. Your Rights">
          <p className="text-sm text-muted-foreground">
            Depending on your jurisdiction, you may have the right to:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground mt-2">
            <li>Access your personal data</li>
            <li>Correct inaccuracies</li>
            <li>Request deletion</li>
            <li>Restrict or object to processing</li>
            <li>Withdraw consent</li>
            <li>Lodge a complaint with a supervisory authority</li>
          </ul>
          <p className="text-sm text-muted-foreground mt-3">
            To exercise any of these rights, contact:{' '}
            <a href="mailto:support@astrotattwa.com" className="text-primary hover:underline">
              support@astrotattwa.com
            </a>
          </p>
        </Section>

        <Section title="12. Children's Privacy">
          <p className="text-sm text-muted-foreground">
            This Platform is not intended for individuals under 18 years of age. Persons under
            18 are prohibited from using this Platform, in accordance with our Terms of Service.
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            We do not knowingly collect personal data from anyone under 18. If a parent or
            guardian becomes aware that a child under 18 has provided us with personal information,
            please contact us immediately and we will delete it from our systems.
          </p>
        </Section>

        <Section title="13. Changes to This Policy">
          <p className="text-sm text-muted-foreground">
            We may update this Privacy Policy periodically without prior notice to reflect changes
            in our practices or for legal and regulatory reasons. Changes will be effective upon
            posting and reflected with an updated date at the top of this page.
          </p>
        </Section>

        <Section title="14. Grievance Officer">
          <p className="text-sm text-muted-foreground">
            In accordance with the Information Technology Act, 2000 and the rules made thereunder,
            the name and contact details of the Grievance Officer are provided below:
          </p>
          <div className="text-sm text-muted-foreground mt-3 space-y-1">
            <p><strong className="text-foreground">Name:</strong> Aakash Jain</p>
            <p><strong className="text-foreground">Designation:</strong> Grievance Officer</p>
            <p><strong className="text-foreground">Organisation:</strong> Astrotattwa</p>
            <p>
              <strong className="text-foreground">Email:</strong>{' '}
              <a href="mailto:support@astrotattwa.com" className="text-primary hover:underline">
                support@astrotattwa.com
              </a>
            </p>
            <p><strong className="text-foreground">Hours:</strong> Monday – Friday, 9:00 – 18:00 IST</p>
          </div>
        </Section>

        <Section title="15. Contact">
          <div className="text-sm text-muted-foreground space-y-1">
            <p>For any questions, concerns, or complaints regarding this Privacy Policy:</p>
            <br />
            <p className="font-medium text-foreground">Astrotattwa</p>
            <p>B-Block, Yamuna Vihar, Delhi – 110053, India</p>
            <p>
              Phone:{' '}
              <a href="tel:+919910705518" className="text-primary hover:underline">
                +91 9910705518
              </a>
            </p>
            <p>
              Email:{' '}
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
      </main>

      <Footer />
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
    <div className="space-y-2 mt-3">
      <h3 className="text-sm font-semibold">{title}</h3>
      {children}
    </div>
  )
}
