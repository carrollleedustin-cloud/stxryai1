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

export default function StoryContent({
  chapter,
  chapterNumber,
  fontSize,
  onScrollDepthChange,
  aiSegments,
}: StoryContentProps) {
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null); // Ref for the content div

  // Debounce function to limit calls
  const debounce = useCallback((func: (...args: any[]) => void, delay: number) => {
    let timeout: NodeJS.Timeout;
    return function (...args: any[]) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), delay);
    };
  }, []);

  const handleScroll = useCallback(
    debounce(() => {
      if (contentRef.current && onScrollDepthChange) {
        const { scrollTop, scrollHeight, clientHeight } = contentRef.current;
        const depth = Math.min(100, Math.round(((scrollTop + clientHeight) / scrollHeight) * 100));
        onScrollDepthChange(depth);
      }
    }, 100),
    [debounce, onScrollDepthChange]
  ); // Debounce for 100ms

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
      <section className="relative overflow-hidden rounded-3xl border border-border bg-card/60 backdrop-blur-glass shadow-elevation-2">
        {/* subtle aurora wash */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-60"
          style={{
            background:
              'radial-gradient(1200px circle at 20% 10%, rgba(139, 92, 246, 0.25) 0%, transparent 55%), radial-gradient(900px circle at 80% 20%, rgba(6, 182, 212, 0.18) 0%, transparent 55%), radial-gradient(1000px circle at 50% 90%, rgba(236, 72, 153, 0.14) 0%, transparent 60%)',
          }}
        />

        <header className="relative px-6 pt-6 pb-4 md:px-10 md:pt-10 md:pb-6">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="inline-flex items-center gap-2 rounded-full border border-border bg-background/40 px-3 py-1 text-xs font-semibold tracking-wide text-foreground/80">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-accent shadow-glow" />
                <span>Chapter {chapterNumber}</span>
              </div>
              <h1 className="mt-4 font-heading text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl">
                {chapter?.title || 'Untitled Chapter'}
              </h1>
            </div>

            <button
              onClick={() => setIsReportModalOpen(true)}
              className="shrink-0 rounded-full border border-border bg-background/30 px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:bg-background/50 hover:text-error transition-smooth"
            >
              Report
            </button>
          </div>
        </header>

        <div className="relative px-6 pb-6 md:px-10 md:pb-10">
          <div
            ref={contentRef}
            className="scrollbar-modern max-h-[70vh] md:max-h-[calc(100vh-18rem)] overflow-y-auto pr-2"
          >
            <div className="prose max-w-none dark:prose-invert prose-headings:font-heading prose-headings:tracking-tight prose-p:leading-[1.9]">
              <p className="whitespace-pre-wrap text-foreground/90" style={{ fontSize: `${fontSize}px` }}>
                {chapter?.content || 'No content available.'}
              </p>

              {/* AI-generated segments (whisper channel) */}
              {aiSegments && aiSegments.length > 0 && (
                <aside className="mt-10 rounded-2xl border border-border bg-background/30 p-5">
                  <div className="mb-3 flex items-center gap-2 text-xs font-semibold tracking-wide text-muted-foreground">
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-secondary" />
                    <span>AI resonance</span>
                  </div>
                  <div className="space-y-3">
                    {aiSegments.map((segment, index) => (
                      <p
                        key={index}
                        className="m-0 text-foreground/70 italic"
                        style={{ fontSize: `${Math.max(12, fontSize * 0.92)}px` }}
                      >
                        {segment}
                      </p>
                    ))}
                  </div>
                </aside>
              )}
            </div>
          </div>
        </div>
      </section>
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
