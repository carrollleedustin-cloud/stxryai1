'use client';

import React, { useState } from 'react';
import ReportModal from '@/components/moderation/ReportModal';

interface StoryContentProps {
  chapter: any;
  chapterNumber: number;
  fontSize: number;
}

export default function StoryContent({ chapter, chapterNumber, fontSize }: StoryContentProps) {
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  return (
    <>
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 md:p-12">
        <div className="flex justify-between items-start mb-6">
          <div>
            <span className="inline-block px-4 py-2 bg-purple-100 text-purple-800 rounded-full text-sm font-semibold mb-4">
              Chapter {chapterNumber}
            </span>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">{chapter?.title || 'Untitled Chapter'}</h1>
          </div>
          <button
            onClick={() => setIsReportModalOpen(true)}
            className="text-sm text-gray-500 hover:text-red-600"
          >
            Report
          </button>
        </div>

        <div className="prose prose-lg max-w-none">
          <p className="text-gray-700 leading-relaxed whitespace-pre-wrap" style={{ fontSize: `${fontSize}px` }}>
            {chapter?.content || 'No content available.'}
          </p>
        </div>
      </div>
      {chapter && (
        <ReportModal
          isOpen={isReportModalOpen}
          onClose={() => setIsReportModalOpen(false)}
          contentId={chapter.id}
          contentType="chapter"
        />
      )}
    </>
  );
}