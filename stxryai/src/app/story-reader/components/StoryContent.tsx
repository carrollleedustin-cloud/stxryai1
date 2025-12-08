'use client';

import React from 'react';

interface StoryContentProps {
  chapter: any;
  chapterNumber: number;
}

export default function StoryContent({ chapter, chapterNumber }: StoryContentProps) {
  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 md:p-12">
      <div className="mb-6">
        <span className="inline-block px-4 py-2 bg-purple-100 text-purple-800 rounded-full text-sm font-semibold mb-4">
          Chapter {chapterNumber}
        </span>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">{chapter?.title || 'Untitled Chapter'}</h1>
      </div>

      <div className="prose prose-lg max-w-none">
        <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
          {chapter?.content || 'No content available.'}
        </p>
      </div>
    </div>
  );
}