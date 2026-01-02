'use client';

import React from 'react';
import AppImage from '@/components/ui/AppImage';

interface ContinueReadingWidgetProps {
  progress: any;
  onClick: () => void;
}

export default function ContinueReadingWidget({ progress, onClick }: ContinueReadingWidgetProps) {
  const story = progress.stories;

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-xl shadow-lg overflow-hidden cursor-pointer transform transition-all duration-300 hover:scale-105"
    >
      <div className="relative h-32">
        <AppImage
          src={story?.cover_image || ''}
          alt={`Cover for ${story?.title || 'Unknown Story'}`}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-2 left-3 right-3">
          <h3 className="text-white font-bold text-lg line-clamp-1">
            {story?.title || 'Unknown Story'}
          </h3>
        </div>
      </div>

      <div className="p-4">
        <div className="mb-3">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Progress</span>
            <span className="font-semibold">{progress.progress_percentage || 0}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress.progress_percentage || 0}%` }}
            />
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>⏱️ {progress.reading_time || 0} min read</span>
          <span className="text-purple-600 font-medium">Continue →</span>
        </div>
      </div>
    </div>
  );
}
