'use client';

import React from 'react';
import Header from '@/components/common/Header';

const HelpPage: React.FC = () => {
  const faqs = [
    {
      question: 'What is Stxryai?',
      answer:
        'Stxryai is an AI-powered interactive fiction platform where you can read and create stories that branch and evolve based on your choices.',
    },
    {
      question: 'How do I create a story?',
      answer:
        'Navigate to the Story Creation Studio from the navigation bar. You can start by creating a new draft, adding chapters, and defining choices.',
    },
    {
      question: 'What are energy points?',
      answer:
        'Energy points are used to make choices in stories. They regenerate over time, and you can get more by upgrading to a premium plan.',
    },
    {
      question: 'How do I report inappropriate content?',
      answer:
        'You can report stories, comments, or users by clicking the "Report" button next to the content. Our moderation team will review the report.',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">Help Center</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Find answers to frequently asked questions.
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <div className="space-y-8">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-card border border-border rounded-lg p-6">
                <h2 className="text-xl font-semibold text-foreground mb-2">{faq.question}</h2>
                <p className="text-muted-foreground">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default HelpPage;
