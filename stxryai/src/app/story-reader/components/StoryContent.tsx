'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import ReportModal from '@/components/moderation/ReportModal';
import { PrismPanel } from '@/components/ui/prism/PrismPanel';
import { PrismText } from '@/components/ui/prism/PrismText';
import { motion } from 'framer-motion';

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
      <PrismPanel tone="glass" className="relative overflow-hidden shadow-elevation-3 group">
        {/* Holographic background effect */}
        <div className="holographic-wrapper absolute inset-0 opacity-20 pointer-events-none">
           <div className="holographic-shimmer" style={{ '--speed': '8s' } as any} />
        </div>
        
        {/* Particle field for atmosphere */}
        <div className="particle-field bg-[url('/particles.png')] bg-repeat opacity-10 animate-float" />

        <header className="relative px-6 pt-8 pb-6 md:px-12 md:pt-12 md:pb-8 z-10">
          <div className="flex items-start justify-between gap-6">
            <div className="min-w-0 space-y-4">
              <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-black/40 px-4 py-1.5 text-xs font-bold tracking-widest uppercase text-white/60 backdrop-blur-md">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-fuchsia-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-fuchsia-500"></span>
                </span>
                <span>Chapter {chapterNumber}</span>
              </div>
              
              <PrismText variant="h1" gradient="silver" className="leading-tight drop-shadow-lg">
                {chapter?.title || 'Untitled Chapter'}
              </PrismText>
            </div>

            <button
              onClick={() => setIsReportModalOpen(true)}
              className="shrink-0 rounded-full border border-white/5 bg-white/5 px-4 py-2 text-xs font-semibold text-white/40 hover:bg-white/10 hover:text-red-400 transition-all duration-300"
            >
              Report
            </button>
          </div>
        </header>

        <div className="relative px-6 pb-8 md:px-12 md:pb-12 z-10">
          <div
            ref={contentRef}
            className="scrollbar-modern max-h-[70vh] md:max-h-[calc(100vh-20rem)] overflow-y-auto pr-4"
          >
            <div className="prose prose-invert max-w-none prose-lg prose-p:leading-loose prose-headings:font-display prose-headings:tracking-tight">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              >
                <p 
                  className="whitespace-pre-wrap text-slate-200 drop-shadow-sm" 
                  style={{ fontSize: `${fontSize}px`, lineHeight: 1.8 }}
                >
                  {chapter?.content || 'No content available.'}
                </p>
              </motion.div>

              {/* AI-generated segments (whisper channel) */}
              {aiSegments && aiSegments.length > 0 && (
                <motion.aside 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                  className="mt-12 relative overflow-hidden rounded-2xl border border-fuchsia-500/20 bg-fuchsia-900/10 p-6"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-fuchsia-500/5 to-purple-600/5 animate-pulse" />
                  <div className="relative z-10">
                    <div className="mb-4 flex items-center gap-2 text-xs font-bold tracking-widest text-fuchsia-400 uppercase">
                      <span className="inline-block h-1.5 w-1.5 rounded-full bg-fuchsia-400 shadow-[0_0_10px_currentColor]" />
                      <span>AI Resonance</span>
                    </div>
                    <div className="space-y-4 border-l-2 border-fuchsia-500/30 pl-4">
                      {aiSegments.map((segment, index) => (
                        <p
                          key={index}
                          className="m-0 text-fuchsia-100/80 italic font-medium"
                          style={{ fontSize: `${Math.max(14, fontSize * 0.92)}px` }}
                        >
                          "{segment}"
                        </p>
                      ))}
                    </div>
                  </div>
                </motion.aside>
              )}
            </div>
          </div>
        </div>
        
        {/* Bottom fade for scroll indication */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/80 to-transparent pointer-events-none z-20" />
      </PrismPanel>
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
