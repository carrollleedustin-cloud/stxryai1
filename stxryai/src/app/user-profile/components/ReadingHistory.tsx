import { useState } from 'react';
import { UserReadingProgress } from '@/services/userProgressService';
import Link from 'next/link';
import Icon from '@/components/ui/AppIcon';
import AppImage from '@/components/ui/AppImage';

interface ReadingHistoryProps {
  stories: UserReadingProgress[];
}

const ReadingHistory = ({ stories }: ReadingHistoryProps) => {
  const [filter, setFilter] = useState<'all' | 'completed' | 'in-progress'>('all');

  const filteredStories = stories.filter((progress) => {
    if (filter === 'completed') return progress.is_completed;
    if (filter === 'in-progress') return !progress.is_completed;
    return true;
  });

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Icon name="BookOpenIcon" size={24} className="text-primary" />
          <h2 className="font-heading text-xl font-bold text-foreground">
            Reading History
          </h2>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 text-sm rounded-lg transition-smooth ${
              filter === 'all' ? 'bg-primary text-primary-foreground' : 'bg-muted/50 text-muted-foreground hover:bg-muted'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-3 py-1 text-sm rounded-lg transition-smooth ${
              filter === 'completed'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted/50 text-muted-foreground hover:bg-muted'
            }`}
          >
            Completed
          </button>
          <button
            onClick={() => setFilter('in-progress')}
            className={`px-3 py-1 text-sm rounded-lg transition-smooth ${
              filter === 'in-progress' ? 'bg-primary text-primary-foreground' : 'bg-muted/50 text-muted-foreground hover:bg-muted'
            }`}
          >
            In Progress
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {filteredStories.map((progress) => (
          <Link
            key={progress.id}
            href={`/story-reader?id=${progress.story_id}`}
            className="flex items-center space-x-4 p-4 bg-muted/30 hover:bg-muted/50 rounded-lg transition-smooth group"
          >
            <div className="relative w-16 h-24 flex-shrink-0 rounded-lg overflow-hidden">
              <AppImage
                src={progress.stories.cover_image || ''}
                alt={`Book cover for ${progress.stories.title}`}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-smooth truncate">
                    {progress.stories.title}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {progress.stories.genre}
                  </p>
                </div>
                {progress.stories.rating && (
                  <div className="flex items-center space-x-1 ml-2">
                    <Icon name="StarIcon" size={14} className="text-accent" />
                    <span className="text-xs font-medium text-foreground">
                      {progress.stories.rating}
                    </span>
                  </div>
                )}
              </div>

              <div className="mt-3">
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                  <span>{progress.progress_percentage}% Complete</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-secondary transition-smooth"
                    style={{ width: `${progress.progress_percentage}%` }}
                  />
                </div>
              </div>

              <p className="text-xs text-muted-foreground mt-2">
                Last read: {new Date(progress.last_read_at).toLocaleDateString()}
              </p>
            </div>

            <Icon
              name="ChevronRightIcon"
              size={20}
              className="text-muted-foreground group-hover:text-primary transition-smooth"
            />
          </Link>
        ))}
      </div>
    </div>
  );
};

export default ReadingHistory;