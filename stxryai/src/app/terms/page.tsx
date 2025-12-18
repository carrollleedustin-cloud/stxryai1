import type { Metadata } from 'next';
import { createMetadata } from '../metadata';

export const metadata: Metadata = createMetadata({
  title: 'Terms of Service',
  description: 'Terms of Service for StxryAI - Interactive Fiction Platform',
  url: '/terms',
  noIndex: false,
});

export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="prose prose-lg dark:prose-invert max-w-none">
        <h1 className="text-4xl font-bold mb-6">Terms of Service</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-8">
          Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>

        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-8">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            <strong>Legal Notice:</strong> This is a template Terms of Service. Please review with legal counsel before
            launching to production. Customize all sections to match your specific business model and jurisdiction.
          </p>
        </div>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
          <p>
            By accessing and using StxryAI (&quot;the Service&quot;), you accept and agree to be bound by the terms and
            provision of this agreement. If you do not agree to abide by the above, please do not use this service.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">2. Description of Service</h2>
          <p>
            StxryAI is an interactive fiction platform that allows users to create, read, and share AI-powered
            interactive stories. The Service includes:
          </p>
          <ul className="list-disc pl-6 mt-4">
            <li>Story creation and editing tools</li>
            <li>AI-powered story generation and assistance</li>
            <li>Reading and discovery features</li>
            <li>Social features including comments, reviews, and community engagement</li>
            <li>Premium subscription features (where applicable)</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">3. User Accounts</h2>
          <h3 className="text-xl font-semibold mb-3 mt-4">3.1 Account Creation</h3>
          <p>
            To use certain features of the Service, you must register for an account. You agree to provide accurate,
            current, and complete information during registration and to update such information to keep it accurate,
            current, and complete.
          </p>

          <h3 className="text-xl font-semibold mb-3 mt-4">3.2 Account Security</h3>
          <p>
            You are responsible for maintaining the confidentiality of your account credentials and for all activities
            that occur under your account. You agree to notify us immediately of any unauthorized use of your account.
          </p>

          <h3 className="text-xl font-semibold mb-3 mt-4">3.3 Age Requirements</h3>
          <p>
            The Service is available to users of all ages. Users under 13 (or the age of majority in their jurisdiction)
            should have parental supervision when using the Service.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">4. User Content and Intellectual Property</h2>
          <h3 className="text-xl font-semibold mb-3 mt-4">4.1 Your Content</h3>
          <p>
            You retain ownership of all content you create, upload, or post on the Service (&quot;User Content&quot;).
            By submitting User Content, you grant StxryAI a worldwide, non-exclusive, royalty-free license to use,
            reproduce, modify, adapt, publish, translate, and distribute your User Content for the purpose of operating
            and promoting the Service.
          </p>

          <h3 className="text-xl font-semibold mb-3 mt-4">4.2 Content Standards</h3>
          <p>You agree not to post, upload, or transmit any User Content that:</p>
          <ul className="list-disc pl-6 mt-4">
            <li>Violates any law or regulation</li>
            <li>Infringes on the rights of others, including intellectual property rights</li>
            <li>Is defamatory, harassing, abusive, or harmful</li>
            <li>Contains hate speech or discriminatory content</li>
            <li>Is pornographic, sexually explicit, or inappropriate for all ages</li>
            <li>Contains malware, viruses, or other harmful code</li>
          </ul>

          <h3 className="text-xl font-semibold mb-3 mt-4">4.3 Content Moderation</h3>
          <p>
            We reserve the right to review, edit, or remove any User Content that violates these Terms or is otherwise
            objectionable, at our sole discretion.
          </p>

          <h3 className="text-xl font-semibold mb-3 mt-4">4.4 AI-Generated Content</h3>
          <p>
            Content generated using our AI features is subject to the same terms as User Content. You are responsible
            for reviewing and ensuring AI-generated content complies with these Terms before publishing.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">5. Premium Features and Payments</h2>
          <h3 className="text-xl font-semibold mb-3 mt-4">5.1 Subscription Plans</h3>
          <p>
            StxryAI may offer premium subscription plans with additional features. Subscription fees, billing cycles, and
            features are subject to change with notice.
          </p>

          <h3 className="text-xl font-semibold mb-3 mt-4">5.2 Payment Terms</h3>
          <p>
            By subscribing to a premium plan, you agree to pay the applicable fees. Payments are processed through
            third-party payment processors. All fees are non-refundable unless required by law or stated otherwise.
          </p>

          <h3 className="text-xl font-semibold mb-3 mt-4">5.3 Cancellation</h3>
          <p>
            You may cancel your subscription at any time. Cancellation takes effect at the end of your current billing
            period. You will retain access to premium features until the end of the paid period.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">6. Prohibited Uses</h2>
          <p>You agree not to use the Service:</p>
          <ul className="list-disc pl-6 mt-4">
            <li>For any illegal purpose or in violation of any laws</li>
            <li>To transmit spam, chain letters, or unsolicited communications</li>
            <li>To impersonate any person or entity</li>
            <li>To interfere with or disrupt the Service or servers</li>
            <li>To attempt to gain unauthorized access to any part of the Service</li>
            <li>To use automated systems to access the Service without permission</li>
            <li>To reverse engineer, decompile, or disassemble any part of the Service</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">7. Intellectual Property Rights</h2>
          <p>
            The Service, including its original content, features, and functionality, is owned by StxryAI and is
            protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.
            You may not copy, modify, distribute, sell, or lease any part of the Service without our prior written
            consent.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">8. Disclaimers and Limitation of Liability</h2>
          <h3 className="text-xl font-semibold mb-3 mt-4">8.1 Service Availability</h3>
          <p>
            The Service is provided &quot;as is&quot; and &quot;as available&quot; without warranties of any kind,
            either express or implied. We do not guarantee that the Service will be uninterrupted, secure, or error-free.
          </p>

          <h3 className="text-xl font-semibold mb-3 mt-4">8.2 AI Content Disclaimer</h3>
          <p>
            AI-generated content may contain errors, inaccuracies, or inappropriate material. We are not responsible for
            AI-generated content and recommend users review all AI-generated content before publishing.
          </p>

          <h3 className="text-xl font-semibold mb-3 mt-4">8.3 Limitation of Liability</h3>
          <p>
            To the maximum extent permitted by law, StxryAI shall not be liable for any indirect, incidental, special,
            consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or
            indirectly, or any loss of data, use, goodwill, or other intangible losses resulting from your use of the
            Service.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">9. Indemnification</h2>
          <p>
            You agree to indemnify and hold harmless StxryAI, its officers, directors, employees, and agents from any
            claims, damages, losses, liabilities, and expenses (including legal fees) arising out of or relating to
            your use of the Service, your User Content, or your violation of these Terms.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">10. Termination</h2>
          <h3 className="text-xl font-semibold mb-3 mt-4">10.1 Termination by You</h3>
          <p>You may terminate your account at any time by contacting us or using account deletion features.</p>

          <h3 className="text-xl font-semibold mb-3 mt-4">10.2 Termination by Us</h3>
          <p>
            We reserve the right to suspend or terminate your account and access to the Service immediately, without
            prior notice, for conduct that we believe violates these Terms or is harmful to other users, us, or third
            parties.
          </p>

          <h3 className="text-xl font-semibold mb-3 mt-4">10.3 Effect of Termination</h3>
          <p>
            Upon termination, your right to use the Service will immediately cease. We may delete your account and User
            Content, though some information may be retained as required by law or for legitimate business purposes.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">11. Changes to Terms</h2>
          <p>
            We reserve the right to modify these Terms at any time. We will notify users of material changes via email
            or through the Service. Your continued use of the Service after such modifications constitutes acceptance of
            the updated Terms.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">12. Governing Law and Dispute Resolution</h2>
          <p>
            These Terms shall be governed by and construed in accordance with the laws of [Your Jurisdiction], without
            regard to its conflict of law provisions. Any disputes arising from these Terms or the Service shall be
            resolved through [Arbitration/Courts] in [Your Location].
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">13. Contact Information</h2>
          <p>
            If you have any questions about these Terms, please contact us at:
          </p>
          <ul className="list-none pl-0 mt-4">
            <li>Email: legal@stxryai.com</li>
            <li>Support: support@stxryai.com</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">14. Severability</h2>
          <p>
            If any provision of these Terms is found to be unenforceable or invalid, that provision shall be limited or
            eliminated to the minimum extent necessary, and the remaining provisions shall remain in full force and
            effect.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">15. Entire Agreement</h2>
          <p>
            These Terms, together with our Privacy Policy and any other legal notices published on the Service, constitute
            the entire agreement between you and StxryAI regarding the use of the Service.
          </p>
        </section>
      </div>
    </div>
  );
}
