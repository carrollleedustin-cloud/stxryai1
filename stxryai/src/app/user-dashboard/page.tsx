import type { Metadata } from 'next';
import DashboardInteractive from './components/DashboardInteractive';

export const metadata: Metadata = {
  title: 'Dashboard - Stxryai',
  description: 'Your personalized story dashboard with AI-curated recommendations, reading progress, and social activity updates.'
};

export default function UserDashboardPage() {
  const mockUser = {
    name: "Sarah Mitchell",
    email: "sarah.mitchell@example.com",
    avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_13c02ebea-1764802362702.png",
    isPremium: false
  };

  const mockRecommendations = [
  {
    id: "story-001",
    title: "The Midnight Architect",
    coverImage: "https://images.unsplash.com/photo-1722536858410-bd2d817fe877",
    coverAlt: "Dark gothic cathedral with purple moonlight streaming through stained glass windows",
    genre: ["Horror", "Mystery", "Supernatural"],
    description: "A mysterious architect designs buildings that exist between reality and nightmare. Each structure holds secrets that challenge the boundaries of sanity.",
    progress: 67,
    totalChoices: 342,
    rating: 4.8,
    isNew: false,
    isPremium: false
  },
  {
    id: "story-002",
    title: "Echoes of the Void",
    coverImage: "https://images.unsplash.com/photo-1728160641449-e64ea3e7f7ab",
    coverAlt: "Astronaut floating in deep space with purple nebula and distant stars",
    genre: ["Sci-Fi", "Thriller", "Psychological"],
    description: "In the depths of space, a lone astronaut discovers that the void is not empty—it's listening, watching, and slowly consuming everything.",
    totalChoices: 287,
    rating: 4.9,
    isNew: true,
    isPremium: true
  },
  {
    id: "story-003",
    title: "The Crimson Masquerade",
    coverImage: "https://images.unsplash.com/photo-1681180228918-4d5ef8163098",
    coverAlt: "Elegant venetian mask with red feathers and gold trim on dark velvet background",
    genre: ["Romance", "Mystery", "Fantasy"],
    description: "At an eternal masquerade ball, identities shift like shadows. Love and betrayal dance together in a game where nothing is as it seems.",
    progress: 23,
    totalChoices: 198,
    rating: 4.6,
    isNew: false,
    isPremium: false
  },
  {
    id: "story-004",
    title: "Fractured Realities",
    coverImage: "https://images.unsplash.com/photo-1724689323187-d71a445e775e",
    coverAlt: "Shattered mirror reflecting multiple distorted realities with purple and blue light",
    genre: ["Sci-Fi", "Psychological", "Thriller"],
    description: "A quantum physicist discovers that every choice creates a new reality—and something is hunting across all of them.",
    totalChoices: 421,
    rating: 4.7,
    isNew: true,
    isPremium: false
  },
  {
    id: "story-005",
    title: "The Last Lighthouse",
    coverImage: "https://images.unsplash.com/photo-1715394600768-99825450d8a8",
    coverAlt: "Solitary lighthouse on rocky cliff during stormy purple twilight with crashing waves",
    genre: ["Horror", "Mystery", "Supernatural"],
    description: "The lighthouse keeper's log reveals impossible events. Each night, the light guides something from the depths—something that shouldn't exist.",
    progress: 89,
    totalChoices: 156,
    rating: 4.9,
    isNew: false,
    isPremium: true
  },
  {
    id: "story-006",
    title: "Neon Shadows",
    coverImage: "https://images.unsplash.com/photo-1698679324756-63617972acb3",
    coverAlt: "Cyberpunk city street with neon purple and blue lights reflecting on wet pavement",
    genre: ["Sci-Fi", "Noir", "Cyberpunk"],
    description: "In a city where memories can be bought and sold, a detective searches for stolen dreams while losing their own identity.",
    totalChoices: 389,
    rating: 4.8,
    isNew: false,
    isPremium: false
  },
  {
    id: "story-007",
    title: "The Obsidian Crown",
    coverImage: "https://img.rocket.new/generatedImages/rocket_gen_img_12be01d51-1764760932649.png",
    coverAlt: "Ancient black crown with purple gemstones on dark throne in candlelit chamber",
    genre: ["Fantasy", "Dark Fantasy", "Political"],
    description: "A cursed crown grants ultimate power at the cost of sanity. Three heirs must decide if ruling is worth losing themselves.",
    totalChoices: 267,
    rating: 4.7,
    isNew: true,
    isPremium: true
  },
  {
    id: "story-008",
    title: "Whispers in Static",
    coverImage: "https://images.unsplash.com/photo-1634651754953-1565eca58d5c",
    coverAlt: "Vintage radio with purple glow and static interference in dark room",
    genre: ["Horror", "Supernatural", "Mystery"],
    description: "An old radio picks up broadcasts from the past—and the voices are calling for help from events that never happened.",
    progress: 45,
    totalChoices: 223,
    rating: 4.6,
    isNew: false,
    isPremium: false
  }];


  const mockStats = {
    storiesCompleted: 12,
    choicesMade: 847,
    readingStreak: 7,
    totalReadingTime: 1847,
    achievements: [
    {
      id: "ach-001",
      name: "Story Explorer",
      icon: "MapIcon",
      progress: 12,
      total: 20,
      unlocked: false
    },
    {
      id: "ach-002",
      name: "Choice Master",
      icon: "ChatBubbleLeftRightIcon",
      progress: 847,
      total: 1000,
      unlocked: false
    },
    {
      id: "ach-003",
      name: "Week Warrior",
      icon: "FireIcon",
      progress: 7,
      total: 7,
      unlocked: true
    },
    {
      id: "ach-004",
      name: "Night Reader",
      icon: "MoonIcon",
      progress: 1847,
      total: 2000,
      unlocked: false
    }]

  };

  const mockActivities = [
  {
    id: "act-001",
    type: "friend_completed" as const,
    user: {
      name: "Alex Chen",
      avatar: "https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg"
    },
    content: "completed",
    storyTitle: "The Midnight Architect",
    storyId: "story-001",
    timestamp: "2025-12-05T12:15:00Z"
  },
  {
    id: "act-002",
    type: "club_update" as const,
    user: {
      name: "Horror Enthusiasts Club"
    },
    content: "started a new discussion about",
    storyTitle: "The Last Lighthouse",
    storyId: "story-005",
    timestamp: "2025-12-05T11:30:00Z"
  },
  {
    id: "act-003",
    type: "new_story" as const,
    user: {
      name: "Stxryai",
      avatar: "https://images.pexels.com/photos/1181244/pexels-photo-1181244.jpeg"
    },
    content: "published a new story:",
    storyTitle: "The Obsidian Crown",
    storyId: "story-007",
    timestamp: "2025-12-05T10:00:00Z"
  },
  {
    id: "act-004",
    type: "achievement" as const,
    user: {
      name: "Maria Rodriguez",
      avatar: "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg"
    },
    content: "unlocked the \'Choice Master\' achievement",
    timestamp: "2025-12-05T09:45:00Z"
  },
  {
    id: "act-005",
    type: "friend_completed" as const,
    user: {
      name: "James Wilson",
      avatar: "https://images.pexels.com/photos/1516680/pexels-photo-1516680.jpeg"
    },
    content: "completed",
    storyTitle: "Echoes of the Void",
    storyId: "story-002",
    timestamp: "2025-12-05T08:20:00Z"
  }];


  const mockCurrentStories = [
  {
    id: "story-001",
    title: "The Midnight Architect",
    coverImage: "https://images.unsplash.com/photo-1722536858410-bd2d817fe877",
    coverAlt: "Dark gothic cathedral with purple moonlight streaming through stained glass windows",
    progress: 67,
    lastRead: "2025-12-05T11:00:00Z",
    currentChapter: "Chapter 8: The Impossible Blueprint"
  },
  {
    id: "story-003",
    title: "The Crimson Masquerade",
    coverImage: "https://images.unsplash.com/photo-1681180228918-4d5ef8163098",
    coverAlt: "Elegant venetian mask with red feathers and gold trim on dark velvet background",
    progress: 23,
    lastRead: "2025-12-04T19:30:00Z",
    currentChapter: "Chapter 3: The Dance of Shadows"
  },
  {
    id: "story-005",
    title: "The Last Lighthouse",
    coverImage: "https://images.unsplash.com/photo-1715394600768-99825450d8a8",
    coverAlt: "Solitary lighthouse on rocky cliff during stormy purple twilight with crashing waves",
    progress: 89,
    lastRead: "2025-12-03T22:15:00Z",
    currentChapter: "Chapter 12: The Final Signal"
  }];


  const mockCollections = [
  {
    id: "col-001",
    name: "Dark Mysteries",
    description: "Stories that blur the line between reality and nightmare",
    storyCount: 8,
    coverImages: [
    "https://images.pexels.com/photos/2387793/pexels-photo-2387793.jpeg",
    "https://images.pexels.com/photos/1532771/pexels-photo-1532771.jpeg",
    "https://images.pexels.com/photos/1714208/pexels-photo-1714208.jpeg"],

    coverAlts: [
    "Dark gothic cathedral with purple moonlight",
    "Solitary lighthouse during stormy twilight",
    "Vintage radio with purple glow"],

    isPublic: true
  },
  {
    id: "col-002",
    name: "Sci-Fi Adventures",
    description: "Explore the unknown reaches of space and technology",
    storyCount: 5,
    coverImages: [
    "https://images.pexels.com/photos/1252890/pexels-photo-1252890.jpeg",
    "https://images.pexels.com/photos/1089438/pexels-photo-1089438.jpeg",
    "https://images.pexels.com/photos/2387418/pexels-photo-2387418.jpeg"],

    coverAlts: [
    "Astronaut floating in deep space with purple nebula",
    "Shattered mirror reflecting multiple realities",
    "Cyberpunk city street with neon lights"],

    isPublic: false
  }];


  const mockChoiceData = {
    choicesUsed: 8,
    choicesLimit: 10,
    resetTime: "2025-12-06T00:00:00Z"
  };

  return (
    <DashboardInteractive
      mockUser={mockUser}
      mockRecommendations={mockRecommendations}
      mockStats={mockStats}
      mockActivities={mockActivities}
      mockCurrentStories={mockCurrentStories}
      mockCollections={mockCollections}
      mockChoiceData={mockChoiceData} />);


}