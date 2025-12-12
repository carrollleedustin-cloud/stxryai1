import { render, RenderOptions } from '@testing-library/react';
import { ReactElement } from 'react';

// Mock data generators for testing

export const mockStory = (overrides = {}) => ({
  id: 'story-1',
  title: 'The Adventure Begins',
  author: 'John Doe',
  authorId: 'user-1',
  coverImage: '/images/story-cover.jpg',
  genre: 'Fantasy',
  rating: 4.5,
  reads: 12500,
  chapters: 15,
  isPremium: false,
  description: 'An epic fantasy adventure that will take you to another world.',
  tags: ['adventure', 'magic', 'dragons'],
  difficulty: 'medium' as const,
  duration: 45,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-15'),
  ...overrides,
});

export const mockChapter = (overrides = {}) => ({
  id: 'chapter-1',
  storyId: 'story-1',
  title: 'Chapter 1: The Beginning',
  content: '<p>Once upon a time in a land far away...</p>',
  chapterNumber: 1,
  wordCount: 2500,
  choices: [],
  createdAt: new Date('2024-01-01'),
  ...overrides,
});

export const mockUser = (overrides = {}) => ({
  id: 'user-1',
  email: 'test@example.com',
  username: 'testuser',
  displayName: 'Test User',
  avatar: '/images/avatar.jpg',
  bio: 'I love reading stories!',
  tier: 'free' as const,
  xp: 1500,
  level: 5,
  energy: 50,
  maxEnergy: 100,
  createdAt: new Date('2024-01-01'),
  ...overrides,
});

export const mockNotification = (overrides = {}) => ({
  id: 'notif-1',
  userId: 'user-1',
  type: 'comment' as const,
  title: 'New comment on your story',
  message: 'Someone commented on "The Adventure Begins"',
  read: false,
  link: '/story/story-1',
  createdAt: new Date(),
  ...overrides,
});

export const mockAchievement = (overrides = {}) => ({
  id: 'achievement-1',
  title: 'First Story',
  description: 'Create your first story',
  icon: '📖',
  rarity: 'common' as const,
  xpReward: 100,
  unlockedAt: new Date(),
  progress: 1,
  maxProgress: 1,
  ...overrides,
});

export const mockCollection = (overrides = {}) => ({
  id: 'collection-1',
  userId: 'user-1',
  name: 'Favorites',
  description: 'My favorite stories',
  icon: '❤️',
  color: 'from-red-500 to-pink-500',
  isPublic: true,
  storyCount: 5,
  createdAt: new Date('2024-01-01'),
  ...overrides,
});

export const mockAnalytics = (overrides = {}) => ({
  storyId: 'story-1',
  views: 15000,
  uniqueReaders: 8500,
  completionRate: 0.65,
  averageRating: 4.5,
  totalRatings: 234,
  revenue: 125.50,
  period: 'month' as const,
  ...overrides,
});

// Generate array of mock data
export const mockStoryArray = (count = 5, overrides = {}) =>
  Array.from({ length: count }, (_, i) =>
    mockStory({
      id: `story-${i + 1}`,
      title: `Story ${i + 1}`,
      ...overrides,
    })
  );

export const mockChapterArray = (count = 10, storyId = 'story-1') =>
  Array.from({ length: count }, (_, i) =>
    mockChapter({
      id: `chapter-${i + 1}`,
      storyId,
      title: `Chapter ${i + 1}`,
      chapterNumber: i + 1,
    })
  );

export const mockNotificationArray = (count = 5, overrides = {}) =>
  Array.from({ length: count }, (_, i) =>
    mockNotification({
      id: `notif-${i + 1}`,
      ...overrides,
    })
  );

// Custom render function with providers
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  initialState?: any;
}

export function renderWithProviders(
  ui: ReactElement,
  options?: CustomRenderOptions
) {
  function Wrapper({ children }: { children: React.ReactNode }) {
    // Add your providers here (Redux, Context, etc.)
    return <>{children}</>;
  }

  return render(ui, { wrapper: Wrapper, ...options });
}

// Async utilities
export const waitForLoadingToFinish = () =>
  new Promise((resolve) => setTimeout(resolve, 0));

export const flushPromises = () =>
  new Promise((resolve) => setImmediate(resolve));

// Local storage mock
export const mockLocalStorage = () => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
    get length() {
      return Object.keys(store).length;
    },
    key: (index: number) => {
      const keys = Object.keys(store);
      return keys[index] || null;
    },
  };
};

// Setup and teardown for localStorage
export const setupLocalStorageMock = () => {
  const localStorageMock = mockLocalStorage();
  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
    writable: true,
  });
  return localStorageMock;
};

// Intersection Observer mock
export const mockIntersectionObserver = () => {
  const mockIntersectionObserver = jest.fn();
  mockIntersectionObserver.mockReturnValue({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
  });
  window.IntersectionObserver = mockIntersectionObserver as any;
};

// Resize Observer mock
export const mockResizeObserver = () => {
  const mockResizeObserver = jest.fn();
  mockResizeObserver.mockReturnValue({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
  });
  window.ResizeObserver = mockResizeObserver as any;
};

// Match Media mock
export const mockMatchMedia = (matches = false) => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation((query) => ({
      matches,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });
};

// Router mock for Next.js
export const mockRouter = (overrides = {}) => ({
  push: jest.fn(),
  replace: jest.fn(),
  prefetch: jest.fn(),
  back: jest.fn(),
  pathname: '/',
  query: {},
  asPath: '/',
  route: '/',
  ...overrides,
});

// Supabase mock
export const mockSupabaseClient = () => ({
  auth: {
    getUser: jest.fn().mockResolvedValue({ data: { user: mockUser() }, error: null }),
    signIn: jest.fn().mockResolvedValue({ data: {}, error: null }),
    signOut: jest.fn().mockResolvedValue({ error: null }),
  },
  from: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  insert: jest.fn().mockReturnThis(),
  update: jest.fn().mockReturnThis(),
  delete: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  single: jest.fn().mockResolvedValue({ data: mockStory(), error: null }),
});

// Animation mock (for framer-motion)
export const mockAnimations = () => {
  // Disable animations in tests
  jest.mock('framer-motion', () => ({
    ...jest.requireActual('framer-motion'),
    motion: new Proxy(
      {},
      {
        get: (_, prop) => {
          return React.forwardRef((props: any, ref) =>
            React.createElement(prop as string, { ...props, ref })
          );
        },
      }
    ),
  }));
};

// Custom matchers
export const customMatchers = {
  toHaveBeenCalledWithMatch: (received: jest.Mock, expected: any) => {
    const calls = received.mock.calls;
    const pass = calls.some((call) =>
      call.some((arg: any) => {
        if (typeof expected === 'object') {
          return Object.keys(expected).every((key) => arg[key] === expected[key]);
        }
        return arg === expected;
      })
    );

    return {
      pass,
      message: () =>
        pass
          ? `Expected mock not to have been called with match ${JSON.stringify(expected)}`
          : `Expected mock to have been called with match ${JSON.stringify(expected)}`,
    };
  },
};

// Accessibility testing helper
export const checkA11y = async (container: HTMLElement) => {
  // Check for basic accessibility issues
  const issues: string[] = [];

  // Check for images without alt text
  const images = container.querySelectorAll('img');
  images.forEach((img) => {
    if (!img.alt) {
      issues.push(`Image without alt text: ${img.src}`);
    }
  });

  // Check for buttons without accessible name
  const buttons = container.querySelectorAll('button');
  buttons.forEach((button) => {
    if (!button.textContent?.trim() && !button.getAttribute('aria-label')) {
      issues.push('Button without accessible name');
    }
  });

  // Check for form inputs without labels
  const inputs = container.querySelectorAll('input, textarea, select');
  inputs.forEach((input) => {
    const id = input.getAttribute('id');
    if (id) {
      const label = container.querySelector(`label[for="${id}"]`);
      if (!label && !input.getAttribute('aria-label')) {
        issues.push(`Input without label: ${id}`);
      }
    }
  });

  return issues;
};

// Performance testing helper
export const measureRenderTime = async (component: ReactElement) => {
  const start = performance.now();
  render(component);
  const end = performance.now();
  return end - start;
};

// Snapshot testing helper
export const createSnapshot = (component: ReactElement) => {
  const { container } = render(component);
  return container.firstChild;
};

export * from '@testing-library/react';
export { default as userEvent } from '@testing-library/user-event';
