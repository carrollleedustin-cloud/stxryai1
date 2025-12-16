'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import ReportModal from '@/components/moderation/ReportModal';

interface StoryContentProps {
  chapter: any;
  chapterNumber: number;
  fontSize: number;
  onScrollDepthChange?: (depth: number) => void;
  aiSegments?: string[]; // New prop
}

export default function StoryContent({ chapter, chapterNumber, fontSize, onScrollDepthChange, aiSegments }: StoryContentProps) {
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null); // Ref for the content div

  // Debounce function to limit calls
  const debounce = useCallback((func: (...args: any[]) => void, delay: number) => {
    let timeout: NodeJS.Timeout;
    return function(...args: any[]) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), delay);
    };
  }, []);

  const handleScroll = useCallback(debounce(() => {
    if (contentRef.current && onScrollDepthChange) {
      const { scrollTop, scrollHeight, clientHeight } = contentRef.current;
      const depth = Math.min(100, Math.round(((scrollTop + clientHeight) / scrollHeight) * 100));
      onScrollDepthChange(depth);
    }
  }, 100), [debounce, onScrollDepthChange]); // Debounce for 100ms

  useEffect(() => {
    const contentElement = contentRef.current;
    if (contentElement) {
      contentElement.addEventListener('scroll', handleScroll);
      // Initial check in case content is short or already scrolled
      handleScroll();
    }

    return () => {
      if (contentElement) {
        contentElement.removeEventListener('scroll', handleScroll);
      }
    };
  }, [chapter?.id, handleScroll]); // Re-attach listener when chapter changes

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

        <div ref={contentRef} className="prose prose-lg max-w-none overflow-y-auto max-h-[70vh]">
          <p className="text-gray-700 leading-relaxed whitespace-pre-wrap" style={{ fontSize: `${fontSize}px` }}>
            {chapter?.content || 'No content available.'}
          </p>

          {/* Render AI-generated segments */}
          {aiSegments && aiSegments.length > 0 && (
            <div className="mt-8 pt-4 border-t border-gray-200">
              {aiSegments.map((segment, index) => (
                <p key={index} className="text-gray-500 leading-relaxed italic mb-2" style={{ fontSize: `${fontSize * 0.9}px` }}>
                  {segment}
                </p>
              ))}
            </div>
          )}
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