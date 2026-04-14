import type { Metadata } from 'next'
import { Header, Footer } from '@/components/layout'

export const metadata: Metadata = {
  title: 'Terms of Service — Astrotattwa',
  description: 'Terms of Service for Astrotattwa — the rules and conditions for using our platform.',
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      {/* Spacer for fixed header (Header is 64px tall) */}
      <div className="h-16" />

      {/* Content */}
      <main className="flex-1 mx-auto max-w-3xl px-4 py-10 space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold mb-4">Terms of Service</h1>
          <span className="text-xs text-muted-foreground">Last updated: April 14, 2026</span>
        </div>

        {/* Preamble */}
        <section className="space-y-3">
          <div className="text-sm text-muted-foreground space-y-3">
            <p>
              This document is an electronic record in terms of the Information Technology Act, 2000
              and the rules thereunder, as amended from time to time. This electronic record is generated
              by a computer system and does not require any physical or digital signatures.
            </p>
            <p>
              This document is published in accordance with Rule 3(1) of the Information Technology
              (Intermediaries Guidelines) Rules, 2011, which requires publishing the rules, regulations,
              privacy policy, and Terms of Use for access to{' '}
              <a href="https://astrotattwa.com" className="text-primary hover:underline">
                https://astrotattwa.com
              </a>{' '}
              (&apos;Platform&apos;).
            </p>
            <p>
              The Platform is owned and operated by Astrotattwa, with its registered office at
              B-Block, Yamuna Vihar, Delhi – 110053, India (hereinafter referred to as
              &quot;Astrotattwa&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;).
            </p>
            <p className="font-semibold text-foreground">
              ACCESSING, BROWSING, OR OTHERWISE USING THIS PLATFORM INDICATES YOUR AGREEMENT TO ALL
              TERMS AND CONDITIONS HEREIN. PLEASE READ CAREFULLY BEFORE PROCEEDING.
            </p>
          </div>
        </section>

        {/* Age Restriction */}
        <section className="space-y-3 border border-border rounded-md p-4 bg-muted/30">
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">Age Restriction: </span>
            If you are below 18 years of age, you are prohibited from using, purchasing, or contracting
            through this Platform. By accessing or using this Platform, you confirm that you are at
            least 18 years old. Persons who are incompetent to contract within the meaning of the
            Indian Contract Act, 1872 are not eligible to use or transact through this Platform.
          </p>
        </section>

        <Section title="1. Acceptance">
          <p className="text-sm text-muted-foreground">
            By accessing or using Astrotattwa, you agree to these Terms of Use. These Terms constitute
            a legally binding and enforceable contract between you and Astrotattwa. By initiating any
            transaction on this Platform, you are entering into a legally binding contract with
            Astrotattwa for the selected service.
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Any terms proposed by you that conflict with these Terms are expressly rejected and shall
            have no force or effect. Continued use of the Platform constitutes acceptance of the
            most current version of these Terms.
          </p>
        </Section>

        <Section title="2. Nature of Service">
          <p className="text-sm text-muted-foreground">
            Astrotattwa provides Vedic astrology charts, timelines, interpretative reports, and
            access to paid consultations with astrologers. Certain portions of the Platform are
            available for free. Access to personalized services requires payment.
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            All content is for informational and educational purposes only.
          </p>
        </Section>

        <Section title="3. No Professional Advice">
          <p className="text-sm text-muted-foreground">
            Astrological insights provided through the Platform are not medical, financial, legal,
            or professional advice. Users should exercise independent judgment and consult qualified
            professionals for such matters.
          </p>
        </Section>

        <Section title="4. User Obligations">
          <p className="text-sm text-muted-foreground">
            You agree to provide true, accurate, and complete birth and account information, and to
            keep it updated. You agree to maintain account confidentiality and accept responsibility
            for all activity on your account.
          </p>
          <p className="text-sm text-muted-foreground mt-2">You further agree to:</p>
          <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground mt-2">
            <li>Use the Platform lawfully and not for any unlawful, illegal, or forbidden purpose</li>
            <li>Refrain from attempting unauthorized access to the Platform or its systems</li>
            <li>Not infringe upon the intellectual property rights of Astrotattwa or any third party</li>
            <li>Not use a false identity or mislead us or third parties</li>
          </ul>
          <p className="text-sm text-muted-foreground mt-3">
            Violation of any of the above may result in immediate account suspension or termination
            and legal action under applicable Indian law.
          </p>
        </Section>

        <Section title="5. Site Security">
          <p className="text-sm text-muted-foreground">
            You are prohibited from violating or attempting to violate the security of this Platform, including:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground mt-2">
            <li>Accessing data or accounts not intended for or authorized to you</li>
            <li>Probing, scanning, or testing the vulnerability of any system or network without authorization</li>
            <li>Interfering with service to any user, host, or network via viruses, malware, flooding, spamming, or similar means</li>
            <li>Reproducing, reselling, or exploiting any portion of the Service without express written permission</li>
          </ul>
          <p className="text-sm text-muted-foreground mt-3">
            Astrotattwa reserves the right to recover damages, collection charges, and legal expenses
            from any person using this Platform fraudulently, and to initiate legal proceedings under
            applicable law.
          </p>
        </Section>

        <Section title="6. Intellectual Property">
          <p className="text-sm text-muted-foreground">
            All content on this Platform — including software, design, reports, branding, layout,
            graphics, images, and text — is proprietary to Astrotattwa. You have no authority to
            claim any intellectual property rights, title, or interest in any content on this Platform.
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            You will not reproduce, publish, transmit, distribute, display, modify, create derivative
            works from, sell, or exploit in any way any content of this Platform or its related software.
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Unauthorized use of the Platform or its content may lead to action under these Terms
            and/or applicable law.
          </p>
        </Section>

        <Section title="7. Prohibited Uses">
          <p className="text-sm text-muted-foreground">
            In addition to other restrictions in these Terms, you are prohibited from using this
            Platform or its content:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground mt-2">
            <li>For any unlawful purpose or to solicit others to perform unlawful acts</li>
            <li>To violate any applicable laws or regulations</li>
            <li>To harass, abuse, harm, defame, intimidate, or discriminate against any person or group</li>
            <li>To submit false or misleading information</li>
            <li>To upload or transmit viruses or malicious code of any kind</li>
            <li>To collect or track the personal information of others without consent</li>
            <li>To spam, phish, scrape, or crawl the Platform</li>
            <li>To interfere with or circumvent the security features of the Platform</li>
          </ul>
          <p className="text-sm text-muted-foreground mt-3">
            Astrotattwa reserves the right to terminate access for any user violating these
            prohibitions, without prior notice.
          </p>
        </Section>

        <Section title="8. Privacy Policy">
          <p className="text-sm text-muted-foreground">
            Your submission of personal information through this Platform is governed by our{' '}
            <a href="https://astrotattwa.com/privacy-policy/" className="text-primary hover:underline">
              Privacy Policy
            </a>
            . By using this Platform, you consent to the collection and use of your information
            as described therein.
          </p>
        </Section>

        <Section title="9. Errors, Inaccuracies and Omissions">
          <p className="text-sm text-muted-foreground">
            Occasionally there may be information on the Platform that contains typographical errors,
            inaccuracies, or omissions — including in pricing, service descriptions, or availability.
            We reserve the right to correct any such errors and to change or update information
            at any time without prior notice.
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            We undertake no obligation to update or clarify information on the Platform except
            as required by law.
          </p>
        </Section>

        <Section title="10. Limitation of Liability">
          <p className="text-sm text-muted-foreground">
            Astrotattwa is provided &quot;as is&quot; and &quot;as available&quot; without warranties of any kind,
            either express or implied. We do not guarantee that the Platform will be uninterrupted,
            timely, secure, or error-free.
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            In no case shall Astrotattwa, its officers, employees, affiliates, agents, or service
            providers be liable for any direct, indirect, incidental, punitive, special, or
            consequential damages of any kind — including lost profits, lost revenue, loss of data,
            or replacement costs — arising from:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground mt-2">
            <li>Decisions made based on generated reports or consultations</li>
            <li>Service interruptions or technical errors</li>
            <li>Losses of any kind arising from use of the Platform</li>
            <li>Inaccuracies or errors in any content</li>
          </ul>
          <p className="text-sm text-muted-foreground mt-3">
            Your use of the Platform is solely and entirely at your own risk.
          </p>
        </Section>

        <Section title="11. Services & Payments">
          <p className="text-sm text-muted-foreground">
            Astrotattwa offers the following paid services:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground mt-2">
            <li>Detailed Personalized Astrological Reports</li>
            <li>Booking paid consultations with astrologers</li>
          </ul>
          <p className="text-sm text-muted-foreground mt-3">
            All prices are listed in Indian Rupees (INR) and are inclusive of applicable taxes
            unless stated otherwise. Prices are subject to change without notice. You will be
            charged the price listed at the time of purchase.
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Payments are processed securely through our payment gateway. Astrotattwa reserves
            the right to refuse or cancel any order at its sole discretion.
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            In the event of a payment failure or pending transaction, do not reattempt payment
            until the status is confirmed. If a deduction occurs without order confirmation,
            contact{' '}
            <a href="mailto:support@astrotattwa.com" className="text-primary hover:underline">
              support@astrotattwa.com
            </a>{' '}
            within 48 hours with your transaction reference and we will investigate and resolve
            the issue.
          </p>
        </Section>

        <Section title="12. Billing Accuracy">
          <p className="text-sm text-muted-foreground">
            You agree to provide current, complete, and accurate billing and account information
            for all purchases. You confirm that:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground mt-2">
            <li>The payment card or method used is lawfully owned by you, or you are authorized to use it</li>
            <li>Sufficient funds or credit are available to cover the transaction</li>
            <li>By providing payment details and initiating a transaction, you authorize Astrotattwa to process the applicable charge</li>
          </ul>
          <p className="text-sm text-muted-foreground mt-3">
            You agree to promptly update your account and billing information to ensure
            successful transactions.
          </p>
        </Section>

        <Section title="13. Refund & Cancellation Policy">
          <p className="text-sm text-muted-foreground font-medium">
            All purchases on Astrotattwa are final and non-refundable.
          </p>
          <p className="text-sm text-muted-foreground mt-3 font-medium">Reports:</p>
          <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground mt-1">
            <li>
              Personalized astrological reports will be delivered to your registered email
              address within 5 working days of confirmed payment.
            </li>
            <li>Once a report has been delivered, no refund will be issued under any circumstances.</li>
            <li>
              If a report is not delivered within 5 working days, contact{' '}
              <a href="mailto:support@astrotattwa.com" className="text-primary hover:underline">
                support@astrotattwa.com
              </a>
              .
            </li>
          </ul>
          <p className="text-sm text-muted-foreground mt-3 font-medium">Consultations:</p>
          <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground mt-1">
            <li>
              Once a consultation is booked and confirmed, no refund will be issued by
              Astrotattwa under any circumstances.
            </li>
            <li>
              Any request for rescheduling or cancellation must be raised directly with the
              booked astrologer. Such decisions are entirely at the astrologer&apos;s sole discretion.
            </li>
            <li>
              Astrotattwa bears no responsibility or liability in any dispute between users and
              astrologers regarding scheduling, delivery, or cancellation.
            </li>
          </ul>
          <p className="text-sm text-muted-foreground mt-3">
            There is no physical shipping involved in any service offered on this Platform.
            All deliverables are digital. No return or exchange policy applies.
          </p>
        </Section>

        <Section title="14. Disclaimer on Astrological Predictions">
          <p className="text-sm text-muted-foreground">
            Astrotattwa and its team, including affiliated astrologers, shall not be held liable
            for any outcome, decision, loss, or harm — financial, personal, emotional, or
            otherwise — arising from astrological predictions, reports, or consultations
            provided through this Platform.
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Astrology is an ancient interpretive science and not an exact discipline. All
            predictions are indicative in nature and must not be treated as certainties.
            Users are solely responsible for any actions taken based on content provided.
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            By using this Platform and purchasing any service, you expressly waive any and
            all claims against Astrotattwa arising from astrological content or advice.
          </p>
        </Section>

        <Section title="15. Hate Speech & Conduct">
          <p className="text-sm text-muted-foreground">
            Users are prohibited from engaging in or promoting content that incites violence
            or hatred against individuals or groups based on race, religion, gender, age,
            nationality, disability, sexual orientation, caste, or any other characteristic
            associated with systemic discrimination.
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Violations will result in immediate account termination without refund.
          </p>
        </Section>

        <Section title="16. Indemnification">
          <p className="text-sm text-muted-foreground">
            You shall indemnify and hold harmless Astrotattwa, its affiliates, officers, directors,
            agents, and employees from any claim, demand, action, or penalty — including reasonable
            legal fees — made by any third party due to or arising out of your breach of these Terms,
            our Privacy Policy, or your violation of any law, rule, regulation, or third-party rights
            (including intellectual property rights).
          </p>
        </Section>

        <Section title="17. Severability">
          <p className="text-sm text-muted-foreground">
            If any provision of these Terms is found to be unlawful, void, or unenforceable,
            that provision shall be enforceable to the fullest extent permitted by applicable law,
            and the unenforceable portion shall be deemed severed. The remaining provisions shall
            continue in full force and effect.
          </p>
        </Section>

        <Section title="18. Termination">
          <p className="text-sm text-muted-foreground">
            We may suspend or terminate your account at any time, without notice, for misuse,
            violation of these Terms, or any conduct that we determine, in our sole judgment,
            to be harmful to the Platform or other users.
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Upon termination, your right to use the Platform ceases immediately. Obligations
            and liabilities incurred prior to termination survive the end of this agreement.
          </p>
        </Section>

        <Section title="19. Entire Agreement">
          <p className="text-sm text-muted-foreground">
            These Terms of Use, together with our Privacy Policy and any other policies posted
            on this Platform, constitute the entire agreement between you and Astrotattwa
            regarding your use of the Platform, and supersede all prior agreements,
            communications, or proposals — oral or written.
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Our failure to enforce any right or provision of these Terms shall not constitute
            a waiver of that right or provision.
          </p>
        </Section>

        <Section title="20. Force Majeure">
          <p className="text-sm text-muted-foreground">
            Astrotattwa shall not be liable for any failure or delay in performance of its
            obligations where such failure or delay results from causes beyond its reasonable
            control, including but not limited to acts of God, war, civil disturbance, riots,
            strikes, government restrictions, pandemic, internet outages, or other unforeseen
            circumstances.
          </p>
        </Section>

        <Section title="21. Governing Law & Dispute Resolution">
          <p className="text-sm text-muted-foreground">
            These Terms and any dispute or claim relating to them shall be governed by and
            construed in accordance with the laws of India.
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Any disputes shall first be attempted to be resolved amicably through direct
            negotiation. If unresolved within 30 days, disputes shall be submitted to binding
            arbitration under the Arbitration and Conciliation Act, 1996. The seat of
            arbitration shall be Delhi, India. The arbitrator&apos;s decision shall be final
            and binding on both parties.
          </p>
        </Section>

        <Section title="22. Third-Party Links">
          <p className="text-sm text-muted-foreground">
            The Platform may contain links to third-party websites. Astrotattwa is not
            responsible for the content, accuracy, or practices of any third-party sites.
            Accessing such links is at your own risk and subject to those sites&apos; own terms
            and policies.
          </p>
        </Section>

        <Section title="23. Changes to Terms">
          <p className="text-sm text-muted-foreground">
            We reserve the right to update or replace any part of these Terms at any time
            by posting changes on this page. It is your responsibility to review this page
            periodically. Continued use of the Platform after changes are posted constitutes
            your acceptance of the revised Terms.
          </p>
        </Section>

        <Section title="24. Contact">
          <div className="text-sm text-muted-foreground space-y-1">
            <p>All concerns or communications relating to these Terms must be directed to:</p>
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
