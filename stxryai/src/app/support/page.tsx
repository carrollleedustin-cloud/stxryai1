// app/support/page.tsx
import React from 'react';

export default function SupportPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-6">Support</h1>
      <p className="text-lg text-gray-700 dark:text-gray-300">
        This is a placeholder for the Support page.
        Here you will find FAQs, contact information, and resources to help you with the platform.
      </p>
      <p className="mt-4 text-gray-600 dark:text-gray-400">
        If you need immediate assistance, please email us at support@stxry.ai.
      </p>
    </div>
  );
}
