'use client';

import { useState } from 'react';
import Icon from '@/components/ui/AppIcon';
import AppImage from '@/components/ui/AppImage';
import Link from 'next/link';

interface ReadingList {
  id: string;
  name: string;
  description: string;
  storyCount: number;
  isPublic: boolean;
  coverImages: string[];
  createdAt: string;
  updatedAt: string;
}

interface ReadingListsProps {
  lists: ReadingList[];
  onCreateList?: () => void;
  onEditList?: (listId: string) => void;
  onDeleteList?: (listId: string) => void;
  onTogglePrivacy?: (listId: string) => void;
}

const ReadingLists = ({
  lists,
  onCreateList,
  onEditList,
  onDeleteList,
  onTogglePrivacy,
}: ReadingListsProps) => {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Icon name="BookmarkIcon" size={24} className="text-primary" />
          <h2 className="font-heading text-xl font-bold text-foreground">Reading Lists</h2>
          <span className="px-2 py-1 text-xs font-semibold bg-primary/20 text-primary rounded-full">
            {lists.length}
          </span>
        </div>
        <button
          onClick={onCreateList}
          className="flex items-center space-x-2 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-smooth"
        >
          <Icon name="PlusIcon" size={18} />
          <span className="font-medium">New List</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {lists.map((list) => (
          <div
            key={list.id}
            className="relative bg-muted/30 hover:bg-muted/50 rounded-lg overflow-hidden transition-smooth group"
          >
            <Link href={`/story-library?list=${list.id}`} className="block p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-smooth truncate">
                    {list.name}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {list.description}
                  </p>
                </div>
                <div className="relative ml-2">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      setActiveMenu(activeMenu === list.id ? null : list.id);
                    }}
                    className="p-1 hover:bg-muted rounded transition-smooth"
                  >
                    <Icon name="EllipsisVerticalIcon" size={16} className="text-muted-foreground" />
                  </button>

                  {activeMenu === list.id && (
                    <>
                      <div className="fixed inset-0 z-[190]" onClick={() => setActiveMenu(null)} />
                      <div className="absolute right-0 mt-1 w-48 bg-card border border-border rounded-lg shadow-elevation-2 z-[200] overflow-hidden">
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            onEditList?.(list.id);
                            setActiveMenu(null);
                          }}
                          className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-foreground hover:bg-muted/50 transition-smooth"
                        >
                          <Icon name="PencilIcon" size={16} />
                          <span>Edit List</span>
                        </button>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            onTogglePrivacy?.(list.id);
                            setActiveMenu(null);
                          }}
                          className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-foreground hover:bg-muted/50 transition-smooth"
                        >
                          <Icon
                            name={list.isPublic ? 'LockClosedIcon' : 'LockOpenIcon'}
                            size={16}
                          />
                          <span>Make {list.isPublic ? 'Private' : 'Public'}</span>
                        </button>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            onDeleteList?.(list.id);
                            setActiveMenu(null);
                          }}
                          className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-error hover:bg-error/10 transition-smooth"
                        >
                          <Icon name="TrashIcon" size={16} />
                          <span>Delete List</span>
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-1 mb-3 h-24">
                {list.coverImages.slice(0, 3).map((image, index) => (
                  <div key={index} className="relative rounded overflow-hidden bg-muted">
                    <AppImage
                      src={image}
                      alt={`Story cover ${index + 1} from ${list.name} reading list`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
                {list.coverImages.length === 0 && (
                  <div className="col-span-3 flex items-center justify-center h-full bg-muted rounded">
                    <Icon name="BookOpenIcon" size={32} className="text-muted-foreground" />
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center space-x-1 text-muted-foreground">
                  <Icon name="BookOpenIcon" size={14} />
                  <span>{list.storyCount} stories</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Icon
                    name={list.isPublic ? 'GlobeAltIcon' : 'LockClosedIcon'}
                    size={14}
                    className={list.isPublic ? 'text-success' : 'text-muted-foreground'}
                  />
                  <span className="text-muted-foreground">
                    {list.isPublic ? 'Public' : 'Private'}
                  </span>
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>

      {lists.length === 0 && (
        <div className="text-center py-12">
          <Icon name="BookmarkIcon" size={48} className="text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground mb-4">Create your first reading list</p>
          <button
            onClick={onCreateList}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-smooth"
          >
            <Icon name="PlusIcon" size={18} />
            <span className="font-medium">Create List</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default ReadingLists;
