'use client';

import React from 'react';
import AppImage from '@/components/ui/AppImage';

interface StoryCardProps {
  story: any;
  onClick: () => void;
}

export default function StoryCard({ story, onClick }: StoryCardProps) {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-xl shadow-lg overflow-hidden cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-2xl"
    >
      <div className="relative h-48">
        <AppImage
          src={story.cover_image_url}
          alt={`Cover image for ${story.title}`}
          className="w-full h-full object-cover"
        />
        {story.is_premium && (
          <div className="absolute top-3 right-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full text-sm font-semibold shadow-lg">
            Premium
          </div>
        )}
      </div>

      <div className="p-5">
        <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">{story.title}</h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{story.description}</p>

        <div className="flex items-center justify-between mb-4">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
            {story.genre}
          </span>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            {story.difficulty}
          </span>
        </div>

        <div className="flex items-center justify-between text-sm text-gray-500 border-t pt-4">
          <div className="flex items-center gap-1">
            <span>⭐</span>
            <span className="font-medium">{story.rating?.toFixed(1) || '0.0'}</span>
            <span>({story.review_count || 0})</span>
          </div>
          <div className="flex items-center gap-1">
            <span>👥</span>
            <span>{story.play_count?.toLocaleString() || 0} plays</span>
          </div>
        </div>

        {story.estimated_duration && (
          <div className="mt-3 text-sm text-gray-500">
            ⏱️ {story.estimated_duration} min read
          </div>
        )}
      </div>
    </div>
  );
}