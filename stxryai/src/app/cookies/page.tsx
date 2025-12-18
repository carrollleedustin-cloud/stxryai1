import type { Metadata } from 'next';
import { createMetadata } from '../metadata';

export const metadata: Metadata = createMetadata({
  title: 'Cookie Policy',
  description: 'Cookie Policy for StxryAI - How we use cookies and tracking technologies',
  url: '/cookies',
  noIndex: false,
});

export default function CookiesPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="prose prose-lg dark:prose-invert max-w-none">
        <h1 className="text-4xl font-bold mb-6">Cookie Policy</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-8">
          Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">1. What Are Cookies?</h2>
          <p>
            Cookies are small text files that are placed on your device when you visit a website. They are widely used
            to make websites work more efficiently and provide information to website owners.
          </p>
          <p className="mt-4">
            StxryAI uses cookies and similar tracking technologies to enhance your experience, analyze usage, and
            support our Service.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">2. Types of Cookies We Use</h2>

          <h3 className="text-xl font-semibold mb-3 mt-4">2.1 Essential Cookies</h3>
          <p>
            These cookies are necessary for the Service to function properly. They enable core functionality such as
            authentication, security, and account management. These cookies cannot be disabled.
          </p>
          <ul className="list-disc pl-6 mt-4">
            <li>Session management and authentication</li>
            <li>Security and fraud prevention</li>
            <li>Load balancing and performance</li>
          </ul>

          <h3 className="text-xl font-semibold mb-3 mt-4">2.2 Functional Cookies</h3>
          <p>
            These cookies enable enhanced functionality and personalization, such as remembering your preferences and
            settings.
          </p>
          <ul className="list-disc pl-6 mt-4">
            <li>User preferences (theme, font size, reading settings)</li>
            <li>Language and region settings</li>
            <li>Reading progress and bookmarks</li>
          </ul>

          <h3 className="text-xl font-semibold mb-3 mt-4">2.3 Analytics Cookies</h3>
          <p>
            These cookies help us understand how visitors interact with our Service by collecting and reporting
            information anonymously.
          </p>
          <ul className="list-disc pl-6 mt-4">
            <li>Page views and navigation patterns</li>
            <li>Feature usage and engagement metrics</li>
            <li>Error tracking and performance monitoring</li>
          </ul>
          <p className="mt-4">
            We use Google Analytics and PostHog for analytics. You can opt out of Google Analytics by installing the{' '}
            <a
              href="https://tools.google.com/dlpage/gaoptout"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 underline"
            >
              Google Analytics Opt-out Browser Add-on
            </a>
            .
          </p>

          <h3 className="text-xl font-semibold mb-3 mt-4">2.4 Advertising Cookies</h3>
          <p>
            These cookies are used to deliver relevant advertisements and track ad performance. They are only used for
            free-tier users (premium users have an ad-free experience).
          </p>
          <ul className="list-disc pl-6 mt-4">
            <li>Ad targeting and personalization</li>
            <li>Ad performance measurement</li>
            <li>Frequency capping</li>
          </ul>
          <p className="mt-4">
            We use Google AdSense for advertising. You can manage ad preferences through{' '}
            <a
              href="https://adssettings.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 underline"
            >
              Google Ad Settings
            </a>
            .
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">3. Third-Party Cookies</h2>
          <p>We use services from third parties that may set cookies on your device:</p>
          <ul className="list-disc pl-6 mt-4">
            <li>
              <strong>Google Analytics:</strong> Website analytics and usage tracking
            </li>
            <li>
              <strong>Google AdSense:</strong> Advertising services (free users only)
            </li>
            <li>
              <strong>PostHog:</strong> Product analytics and user behavior tracking
            </li>
            <li>
              <strong>Supabase:</strong> Authentication and database services
            </li>
            <li>
              <strong>Stripe:</strong> Payment processing (when making purchases)
            </li>
          </ul>
          <p className="mt-4">
            These third parties have their own privacy policies and cookie practices. We encourage you to review their
            policies.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">4. Managing Cookies</h2>
          <p>You have several options for managing cookies:</p>

          <h3 className="text-xl font-semibold mb-3 mt-4">4.1 Browser Settings</h3>
          <p>
            Most browsers allow you to control cookies through their settings. You can set your browser to refuse
            cookies or alert you when cookies are being sent. However, disabling cookies may limit your ability to use
            certain features of our Service.
          </p>
          <p className="mt-4">Browser-specific instructions:</p>
          <ul className="list-disc pl-6 mt-4">
            <li>
              <a
                href="https://support.google.com/chrome/answer/95647"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 underline"
              >
                Google Chrome
              </a>
            </li>
            <li>
              <a
                href="https://support.mozilla.org/en-US/kb/enable-and-disable-cookies-website-preferences"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 underline"
              >
                Mozilla Firefox
              </a>
            </li>
            <li>
              <a
                href="https://support.apple.com/guide/safari/manage-cookies-and-website-data-sfri11471/mac"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 underline"
              >
                Safari
              </a>
            </li>
            <li>
              <a
                href="https://support.microsoft.com/en-us/microsoft-edge/delete-cookies-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 underline"
              >
                Microsoft Edge
              </a>
            </li>
          </ul>

          <h3 className="text-xl font-semibold mb-3 mt-4">4.2 Opt-Out Tools</h3>
          <p>You can opt out of certain tracking through these tools:</p>
          <ul className="list-disc pl-6 mt-4">
            <li>
              <a
                href="https://tools.google.com/dlpage/gaoptout"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 underline"
              >
                Google Analytics Opt-out
              </a>
            </li>
            <li>
              <a
                href="https://adssettings.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 underline"
              >
                Google Ad Settings
              </a>
            </li>
            <li>
              <a
                href="http://www.youronlinechoices.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 underline"
              >
                Your Online Choices (EU)
              </a>
            </li>
          </ul>

          <h3 className="text-xl font-semibold mb-3 mt-4">4.3 Account Settings</h3>
          <p>
            You can manage certain cookie preferences through your account settings on StxryAI, including analytics
            and advertising preferences.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">5. Do Not Track Signals</h2>
          <p>
            Some browsers include a &quot;Do Not Track&quot; (DNT) feature that signals to websites you visit that you
            do not want to have your online activity tracked. Currently, there is no standard for how DNT signals are
            interpreted. StxryAI does not currently respond to DNT browser signals.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">6. Changes to This Cookie Policy</h2>
          <p>
            We may update this Cookie Policy from time to time. We will notify you of material changes by posting the
            updated policy on this page and updating the &quot;Last updated&quot; date.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">7. Contact Us</h2>
          <p>If you have questions about our use of cookies, please contact us:</p>
          <ul className="list-none pl-0 mt-4">
            <li>
              <strong>Email:</strong> privacy@stxryai.com
            </li>
            <li>
              <strong>Support:</strong> support@stxryai.com
            </li>
          </ul>
        </section>
      </div>
    </div>
  );
}
