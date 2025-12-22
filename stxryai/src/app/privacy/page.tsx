import type { Metadata } from 'next';
import { createMetadata } from '../metadata';

export const metadata: Metadata = createMetadata({
  title: 'Privacy Policy',
  description: 'Privacy Policy for StxryAI - How we collect, use, and protect your data',
  url: '/privacy',
  noIndex: false,
});

export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="prose prose-lg dark:prose-invert max-w-none">
        <h1 className="text-4xl font-bold mb-6">Privacy Policy</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-8">
          Last updated: January 1, 2024
        </p>

        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-8">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            <strong>Legal Notice:</strong> This is a template Privacy Policy. Please review with legal counsel before
            launching to production. Customize all sections to match your specific data practices, jurisdiction, and
            compliance requirements (GDPR, CCPA, etc.).
          </p>
        </div>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
          <p>
            StxryAI (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) is committed to protecting your privacy. This
            Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our
            interactive fiction platform and services.
          </p>
          <p className="mt-4">
            By using StxryAI, you agree to the collection and use of information in accordance with this policy. If you
            do not agree with our policies and practices, please do not use our Service.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">2. Information We Collect</h2>

          <h3 className="text-xl font-semibold mb-3 mt-4">2.1 Information You Provide</h3>
          <p>We collect information that you provide directly to us, including:</p>
          <ul className="list-disc pl-6 mt-4">
            <li>
              <strong>Account Information:</strong> Username, email address, password (hashed), and profile information
            </li>
            <li>
              <strong>Content:</strong> Stories, chapters, comments, reviews, and other content you create or post
            </li>
            <li>
              <strong>Payment Information:</strong> Billing address, payment method details (processed by third-party
              payment processors)
            </li>
            <li>
              <strong>Communications:</strong> Messages you send to us, support requests, and feedback
            </li>
            <li>
              <strong>Preferences:</strong> Reading preferences, genre interests, and customization settings
            </li>
          </ul>

          <h3 className="text-xl font-semibold mb-3 mt-4">2.2 Automatically Collected Information</h3>
          <p>When you use our Service, we automatically collect certain information, including:</p>
          <ul className="list-disc pl-6 mt-4">
            <li>
              <strong>Usage Data:</strong> Pages visited, features used, reading progress, time spent on pages
            </li>
            <li>
              <strong>Device Information:</strong> Device type, operating system, browser type, IP address, device
              identifiers
            </li>
            <li>
              <strong>Log Data:</strong> Access times, error logs, and performance data
            </li>
            <li>
              <strong>Location Data:</strong> General location information (country/region level) based on IP address
            </li>
          </ul>

          <h3 className="text-xl font-semibold mb-3 mt-4">2.3 Cookies and Tracking Technologies</h3>
          <p>
            We use cookies, web beacons, and similar tracking technologies to collect information. See our{' '}
            <a href="/cookies" className="text-blue-600 dark:text-blue-400 underline">
              Cookie Policy
            </a>{' '}
            for more details.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">3. How We Use Your Information</h2>
          <p>We use the information we collect for the following purposes:</p>
          <ul className="list-disc pl-6 mt-4">
            <li>
              <strong>Service Operation:</strong> To provide, maintain, and improve our Service
            </li>
            <li>
              <strong>Account Management:</strong> To create and manage your account, process transactions, and send
              account-related communications
            </li>
            <li>
              <strong>Content Delivery:</strong> To display your stories, enable reading features, and facilitate
              content discovery
            </li>
            <li>
              <strong>Personalization:</strong> To personalize your experience, recommend content, and customize
              features
            </li>
            <li>
              <strong>AI Services:</strong> To generate story content, provide writing assistance, and improve AI
              capabilities
            </li>
            <li>
              <strong>Communication:</strong> To send you updates, newsletters, and respond to your inquiries
            </li>
            <li>
              <strong>Analytics:</strong> To analyze usage patterns, improve our Service, and conduct research
            </li>
            <li>
              <strong>Security:</strong> To detect, prevent, and address security issues and fraudulent activity
            </li>
            <li>
              <strong>Legal Compliance:</strong> To comply with legal obligations and enforce our Terms of Service
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">4. Information Sharing and Disclosure</h2>
          <p>We do not sell your personal information. We may share your information in the following circumstances:</p>

          <h3 className="text-xl font-semibold mb-3 mt-4">4.1 Public Content</h3>
          <p>
            Content you publish on StxryAI (stories, comments, reviews) is publicly visible and may be shared, indexed by
            search engines, and accessed by other users.
          </p>

          <h3 className="text-xl font-semibold mb-3 mt-4">4.2 Service Providers</h3>
          <p>We share information with third-party service providers who perform services on our behalf:</p>
          <ul className="list-disc pl-6 mt-4">
            <li>
              <strong>Hosting & Infrastructure:</strong> Supabase (database and authentication)
            </li>
            <li>
              <strong>Payment Processing:</strong> Stripe (payment transactions)
            </li>
            <li>
              <strong>AI Services:</strong> Anthropic, OpenAI (AI content generation)
            </li>
            <li>
              <strong>Analytics:</strong> Google Analytics, PostHog (usage analytics)
            </li>
            <li>
              <strong>Email Services:</strong> Resend (transactional emails)
            </li>
            <li>
              <strong>Advertising:</strong> Google AdSense (ad serving for free users)
            </li>
          </ul>
          <p className="mt-4">
            These service providers are contractually obligated to protect your information and use it only for the
            purposes we specify.
          </p>

          <h3 className="text-xl font-semibold mb-3 mt-4">4.3 Legal Requirements</h3>
          <p>
            We may disclose information if required by law, court order, or government regulation, or to protect our
            rights, property, or safety, or that of our users or others.
          </p>

          <h3 className="text-xl font-semibold mb-3 mt-4">4.4 Business Transfers</h3>
          <p>
            In the event of a merger, acquisition, or sale of assets, your information may be transferred to the new
            entity.
          </p>

          <h3 className="text-xl font-semibold mb-3 mt-4">4.5 With Your Consent</h3>
          <p>We may share information with your explicit consent or at your direction.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">5. Data Security</h2>
          <p>
            We implement appropriate technical and organizational security measures to protect your information,
            including:
          </p>
          <ul className="list-disc pl-6 mt-4">
            <li>Encryption of data in transit (HTTPS/TLS)</li>
            <li>Encryption of sensitive data at rest</li>
            <li>Secure authentication and access controls</li>
            <li>Regular security assessments and updates</li>
            <li>Limited access to personal information on a need-to-know basis</li>
          </ul>
          <p className="mt-4">
            However, no method of transmission over the Internet or electronic storage is 100% secure. While we strive
            to protect your information, we cannot guarantee absolute security.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">6. Data Retention</h2>
          <p>We retain your information for as long as necessary to:</p>
          <ul className="list-disc pl-6 mt-4">
            <li>Provide our Service to you</li>
            <li>Comply with legal obligations</li>
            <li>Resolve disputes and enforce agreements</li>
            <li>Maintain business records</li>
          </ul>
          <p className="mt-4">
            When you delete your account, we will delete or anonymize your personal information, except where we are
            required to retain it for legal purposes. Public content may remain visible if it has been shared or
            referenced by others.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">7. Your Rights and Choices</h2>
          <p>Depending on your location, you may have the following rights regarding your personal information:</p>

          <h3 className="text-xl font-semibold mb-3 mt-4">7.1 Access and Portability</h3>
          <p>You can access and download your personal data through your account settings or by contacting us.</p>

          <h3 className="text-xl font-semibold mb-3 mt-4">7.2 Correction</h3>
          <p>You can update your account information and preferences through your account settings.</p>

          <h3 className="text-xl font-semibold mb-3 mt-4">7.3 Deletion</h3>
          <p>
            You can delete your account and request deletion of your personal information, subject to legal retention
            requirements.
          </p>

          <h3 className="text-xl font-semibold mb-3 mt-4">7.4 Objection and Restriction</h3>
          <p>
            You can object to certain processing of your information or request restriction of processing in certain
            circumstances.
          </p>

          <h3 className="text-xl font-semibold mb-3 mt-4">7.5 Opt-Out</h3>
          <p>
            You can opt out of marketing communications by using the unsubscribe link in emails or adjusting your
            notification preferences in account settings.
          </p>

          <h3 className="text-xl font-semibold mb-3 mt-4">7.6 Cookie Preferences</h3>
          <p>
            You can manage cookie preferences through your browser settings. See our{' '}
            <a href="/cookies" className="text-blue-600 dark:text-blue-400 underline">
              Cookie Policy
            </a>{' '}
            for details.
          </p>

          <p className="mt-4">
            To exercise these rights, contact us at privacy@stxryai.com. We will respond to your request within 30 days
            (or as required by applicable law).
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">8. Children&apos;s Privacy</h2>
          <p>
            StxryAI is designed to be family-friendly and welcomes users of all ages. For users under 13 (or the age of
            majority in their jurisdiction), we:
          </p>
          <ul className="list-disc pl-6 mt-4">
            <li>Collect only information necessary to provide the Service</li>
            <li>Do not knowingly collect personal information without parental consent where required</li>
            <li>Provide age-appropriate content and features</li>
            <li>Comply with applicable children&apos;s privacy laws (COPPA, GDPR-K, etc.)</li>
          </ul>
          <p className="mt-4">
            Parents or guardians can review, request deletion of, or refuse further collection of their child&apos;s
            information by contacting us at privacy@stxryai.com.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">9. International Data Transfers</h2>
          <p>
            Your information may be transferred to and processed in countries other than your country of residence. These
            countries may have data protection laws that differ from those in your country. We ensure appropriate
            safeguards are in place to protect your information in accordance with this Privacy Policy.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">10. Third-Party Links and Services</h2>
          <p>
            Our Service may contain links to third-party websites or integrate with third-party services. We are not
            responsible for the privacy practices of these third parties. We encourage you to review their privacy
            policies.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">11. Changes to This Privacy Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. We will notify you of material changes by:
          </p>
          <ul className="list-disc pl-6 mt-4">
            <li>Posting the updated policy on this page</li>
            <li>Sending an email notification to registered users</li>
            <li>Displaying a notice on our Service</li>
          </ul>
          <p className="mt-4">
            Your continued use of the Service after such changes constitutes acceptance of the updated Privacy Policy.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">12. California Privacy Rights (CCPA)</h2>
          <p>
            If you are a California resident, you have additional rights under the California Consumer Privacy Act
            (CCPA):
          </p>
          <ul className="list-disc pl-6 mt-4">
            <li>Right to know what personal information is collected, used, and shared</li>
            <li>Right to delete personal information</li>
            <li>Right to opt-out of the sale of personal information (we do not sell personal information)</li>
            <li>Right to non-discrimination for exercising your privacy rights</li>
          </ul>
          <p className="mt-4">To exercise these rights, contact us at privacy@stxryai.com.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">13. European Privacy Rights (GDPR)</h2>
          <p>
            If you are located in the European Economic Area (EEA), you have additional rights under the General Data
            Protection Regulation (GDPR):
          </p>
          <ul className="list-disc pl-6 mt-4">
            <li>Right of access to your personal data</li>
            <li>Right to rectification of inaccurate data</li>
            <li>Right to erasure (&quot;right to be forgotten&quot;)</li>
            <li>Right to restrict processing</li>
            <li>Right to data portability</li>
            <li>Right to object to processing</li>
            <li>Right to withdraw consent</li>
            <li>Right to lodge a complaint with a supervisory authority</li>
          </ul>
          <p className="mt-4">To exercise these rights, contact us at privacy@stxryai.com.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">14. Contact Us</h2>
          <p>If you have questions, concerns, or requests regarding this Privacy Policy, please contact us:</p>
          <ul className="list-none pl-0 mt-4">
            <li>
              <strong>Email:</strong> privacy@stxryai.com
            </li>
            <li>
              <strong>Support:</strong> support@stxryai.com
            </li>
            <li>
              <strong>Data Protection Officer:</strong> dpo@stxryai.com
            </li>
          </ul>
        </section>
      </div>
    </div>
  );
}
