import type { Meta, StoryObj } from '@storybook/react';
import MobileBottomNav from './MobileBottomNav';

const meta = {
  title: 'Mobile/MobileBottomNav',
  component: MobileBottomNav,
  parameters: {
    layout: 'fullscreen',
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof MobileBottomNav>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    variant: 'default',
  },
};

export const Floating: Story = {
  args: {
    variant: 'floating',
  },
};

export const WithBadges: Story = {
  args: {
    variant: 'default',
    items: [
      { id: 'home', label: 'Home', icon: '🏠', path: '/' },
      { id: 'discover', label: 'Discover', icon: '🔍', path: '/discover' },
      { id: 'create', label: 'Create', icon: '✍️', path: '/create', badge: 3 },
      { id: 'library', label: 'Library', icon: '📚', path: '/library' },
      { id: 'profile', label: 'Profile', icon: '👤', path: '/profile', badge: 12 },
    ],
  },
};

export const CustomItems: Story = {
  args: {
    variant: 'default',
    items: [
      { id: 'feed', label: 'Feed', icon: '📰', path: '/feed' },
      { id: 'trending', label: 'Trending', icon: '🔥', path: '/trending' },
      { id: 'bookmarks', label: 'Saved', icon: '🔖', path: '/bookmarks' },
      { id: 'settings', label: 'Settings', icon: '⚙️', path: '/settings' },
    ],
  },
};
