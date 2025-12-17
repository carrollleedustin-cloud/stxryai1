'use client';

import { useState } from 'react';
import Link from 'next/link';
import AppImage from '@/components/ui/AppImage';
import Icon from '@/components/ui/AppIcon';

interface StoryCollectionSectionProps {
  collections: Array<{
    id: string;
    name: string;
    description: string;
    storyCount: number;
    coverImages: string[];
    coverAlts: string[];
    isPublic: boolean;
  }>;
  isPremium: boolean;
}

const StoryCollectionSection = ({ collections, isPremium }: StoryCollectionSectionProps) => {
  const [expandedCollection, setExpandedCollection] = useState<string | null>(null);

  if (collections.length === 0) {
    return (
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-heading font-semibold text-foreground">My Collections</h2>
          <Icon name="FolderIcon" size={24} className="text-primary" />
        </div>
        <div className="text-center py-8">
          <Icon name="FolderPlusIcon" size={48} className="text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground mb-4">
            Create collections to organize your favorite stories
          </p>
          {!isPremium && (
            <p className="text-xs text-accent mb-4">
              Premium feature - Upgrade to create collections
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-heading font-semibold text-foreground">My Collections</h2>
        <div className="flex items-center space-x-2">
          <Icon name="FolderIcon" size={24} className="text-primary" />
          {isPremium && (
            <button className="p-2 rounded-lg hover:bg-muted/50 transition-smooth">
              <Icon name="PlusIcon" size={20} className="text-primary" />
            </button>
          )}
        </div>
      </div>

      <div className="space-y-4">
        {collections.map((collection) => (
          <div
            key={collection.id}
            className="border border-border rounded-lg overflow-hidden hover:border-primary/50 transition-smooth"
          >
            <button
              onClick={() =>
                setExpandedCollection(expandedCollection === collection.id ? null : collection.id)
              }
              className="w-full p-4 flex items-center space-x-4 hover:bg-muted/30 transition-smooth"
            >
              <div className="flex -space-x-2">
                {collection.coverImages.slice(0, 3).map((image, index) => (
                  <div
                    key={index}
                    className="w-12 h-16 rounded-md overflow-hidden border-2 border-card bg-muted"
                  >
                    <AppImage
                      src={image}
                      alt={collection.coverAlts[index]}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>

              <div className="flex-1 text-left min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <h3 className="text-sm font-semibold text-foreground truncate">
                    {collection.name}
                  </h3>
                  {collection.isPublic && (
                    <Icon
                      name="GlobeAltIcon"
                      size={14}
                      className="text-muted-foreground flex-shrink-0"
                    />
                  )}
                </div>
                <p className="text-xs text-muted-foreground line-clamp-1">
                  {collection.description}
                </p>
                <p className="text-xs text-primary mt-1">
                  {collection.storyCount} {collection.storyCount === 1 ? 'story' : 'stories'}
                </p>
              </div>

              <Icon
                name="ChevronDownIcon"
                size={20}
                className={`text-muted-foreground transition-smooth flex-shrink-0 ${
                  expandedCollection === collection.id ? 'rotate-180' : ''
                }`}
              />
            </button>

            {expandedCollection === collection.id && (
              <div className="border-t border-border p-4 bg-muted/20">
                <div className="flex items-center justify-between">
                  <Link
                    href={`/story-library?collection=${collection.id}`}
                    className="text-sm font-medium text-primary hover:text-secondary transition-smooth"
                  >
                    View all stories
                  </Link>
                  {isPremium && (
                    <div className="flex items-center space-x-2">
                      <button className="p-2 rounded-lg hover:bg-muted/50 transition-smooth">
                        <Icon name="PencilIcon" size={16} className="text-muted-foreground" />
                      </button>
                      <button className="p-2 rounded-lg hover:bg-error/10 transition-smooth">
                        <Icon name="TrashIcon" size={16} className="text-error" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default StoryCollectionSection;
