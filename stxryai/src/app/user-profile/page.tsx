import type { Metadata } from 'next';
import UserProfileInteractive from './components/UserProfileInteractive';

export const metadata: Metadata = {
  title: 'User Profile - Stxryai',
  description:
    'View comprehensive reading statistics, achievements, social connections, and personalized play style analysis on your Stxryai profile.',
};

export default function UserProfilePage() {
  const mockUser = {
    id: 'user-001',
    name: 'Alexandra Chen',
    username: 'darkstoryteller',
    avatar: 'https://img.rocket.new/generatedImages/rocket_gen_img_17f211366-1764756733705.png',
    bio: 'Passionate reader of dark fantasy and psychological thrillers. Always exploring new narrative branches and hidden story paths.',
    isPremium: true,
    joinDate: 'March 2024',
    location: 'San Francisco, CA',
    website: 'https://example.com',
  };

  const mockStats = {
    storiesCompleted: 47,
    totalChoices: 3842,
    readingStreak: 23,
    achievements: 28,
  };

  const mockAchievements = [
    {
      id: 'ach-001',
      name: 'First Steps',
      description: 'Complete your first story',
      icon: 'BookOpenIcon',
      rarity: 'common' as const,
      unlockedAt: '03/15/2024',
    },
    {
      id: 'ach-002',
      name: 'Choice Master',
      description: 'Make 1000 story choices',
      icon: 'BoltIcon',
      rarity: 'rare' as const,
      unlockedAt: '04/22/2024',
    },
    {
      id: 'ach-003',
      name: 'Dark Explorer',
      description: 'Complete 10 horror stories',
      icon: 'MoonIcon',
      rarity: 'epic' as const,
      unlockedAt: '05/10/2024',
    },
    {
      id: 'ach-004',
      name: 'Legendary Reader',
      description: 'Complete 50 stories',
      icon: 'TrophyIcon',
      rarity: 'legendary' as const,
      unlockedAt: '11/28/2024',
      progress: 47,
      maxProgress: 50,
    },
    {
      id: 'ach-005',
      name: 'Social Butterfly',
      description: 'Join 5 reading clubs',
      icon: 'UserGroupIcon',
      rarity: 'rare' as const,
      unlockedAt: '06/18/2024',
    },
    {
      id: 'ach-006',
      name: 'Streak Champion',
      description: 'Maintain a 30-day reading streak',
      icon: 'FireIcon',
      rarity: 'epic' as const,
      unlockedAt: '08/05/2024',
      progress: 23,
      maxProgress: 30,
    },
  ];

  const mockStories = [
    {
      id: 'story-001',
      title: 'The Midnight Carnival',
      cover: 'https://img.rocket.new/generatedImages/rocket_gen_img_1db6afbd8-1764938885435.png',
      genre: 'Horror',
      completionRate: 100,
      totalChoices: 87,
      lastRead: '2 hours ago',
      rating: 4.8,
    },
    {
      id: 'story-002',
      title: 'Echoes of Tomorrow',
      cover: 'https://img.rocket.new/generatedImages/rocket_gen_img_183a032ac-1764646537259.png',
      genre: 'Sci-Fi',
      completionRate: 65,
      totalChoices: 42,
      lastRead: '1 day ago',
      rating: 4.5,
    },
    {
      id: 'story-003',
      title: 'The Last Kingdom',
      cover: 'https://img.rocket.new/generatedImages/rocket_gen_img_138fc9e37-1764938880707.png',
      genre: 'Fantasy',
      completionRate: 100,
      totalChoices: 156,
      lastRead: '3 days ago',
      rating: 5.0,
    },
    {
      id: 'story-004',
      title: 'Whispers in the Dark',
      cover: 'https://images.pexels.com/photos/2832040/pexels-photo-2832040.jpeg',
      genre: 'Mystery',
      completionRate: 38,
      totalChoices: 29,
      lastRead: '5 days ago',
    },
  ];

  const mockChoicePatterns = {
    cautious: 35,
    bold: 28,
    balanced: 25,
    chaotic: 12,
  };

  const mockGenrePreferences = [
    { name: 'Horror', value: 42 },
    { name: 'Sci-Fi', value: 35 },
    { name: 'Fantasy', value: 38 },
    { name: 'Mystery', value: 28 },
    { name: 'Romance', value: 15 },
  ];

  const mockReadingTimes = [
    { hour: '12AM', sessions: 8 },
    { hour: '3AM', sessions: 12 },
    { hour: '6AM', sessions: 5 },
    { hour: '9AM', sessions: 15 },
    { hour: '12PM', sessions: 22 },
    { hour: '3PM', sessions: 18 },
    { hour: '6PM', sessions: 35 },
    { hour: '9PM', sessions: 45 },
  ];

  const mockFriends = [
    {
      id: 'friend-001',
      name: 'Marcus Rodriguez',
      username: 'scifiexplorer',
      avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg',
      isOnline: true,
      currentStory: 'Echoes of Tomorrow',
      lastActive: 'now',
    },
    {
      id: 'friend-002',
      name: 'Emily Watson',
      username: 'mysteryreader',
      avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg',
      isOnline: true,
      currentStory: 'The Detective Chronicles',
      lastActive: 'now',
    },
    {
      id: 'friend-003',
      name: 'David Kim',
      username: 'fantasyfan',
      avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg',
      isOnline: false,
      lastActive: '2 hours ago',
    },
    {
      id: 'friend-004',
      name: 'Sarah Johnson',
      username: 'horrorfanatic',
      avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg',
      isOnline: false,
      lastActive: '1 day ago',
    },
  ];

  const mockClubs = [
    {
      id: 'club-001',
      name: 'Dark Fiction Society',
      description: 'A community for lovers of dark, psychological, and horror fiction',
      logo: 'https://images.pexels.com/photos/2832382/pexels-photo-2832382.jpeg',
      memberCount: 1247,
      role: 'admin' as const,
      joinedDate: 'March 2024',
      activityLevel: 5,
    },
    {
      id: 'club-002',
      name: 'Sci-Fi Explorers',
      description: 'Exploring the boundaries of science fiction narratives',
      logo: 'https://images.pexels.com/photos/2832034/pexels-photo-2832034.jpeg',
      memberCount: 892,
      role: 'moderator' as const,
      joinedDate: 'April 2024',
      activityLevel: 4,
    },
    {
      id: 'club-003',
      name: 'Fantasy Realm',
      description: 'Epic adventures in magical worlds',
      logo: 'https://images.pexels.com/photos/2832039/pexels-photo-2832039.jpeg',
      memberCount: 2156,
      role: 'member' as const,
      joinedDate: 'May 2024',
      activityLevel: 3,
    },
  ];

  const mockLists = [
    {
      id: 'list-001',
      name: 'Dark Favorites',
      description: 'My collection of the darkest and most twisted stories',
      storyCount: 12,
      isPublic: true,
      coverImages: [
        'https://images.pexels.com/photos/2832382/pexels-photo-2832382.jpeg',
        'https://images.pexels.com/photos/2832040/pexels-photo-2832040.jpeg',
        'https://images.pexels.com/photos/2832383/pexels-photo-2832383.jpeg',
      ],

      createdAt: '03/20/2024',
      updatedAt: '12/01/2024',
    },
    {
      id: 'list-002',
      name: 'Weekend Reads',
      description: 'Stories to binge on lazy weekends',
      storyCount: 8,
      isPublic: false,
      coverImages: [
        'https://images.pexels.com/photos/2832034/pexels-photo-2832034.jpeg',
        'https://images.pexels.com/photos/2832039/pexels-photo-2832039.jpeg',
        'https://images.pexels.com/photos/2832041/pexels-photo-2832041.jpeg',
      ],

      createdAt: '05/15/2024',
      updatedAt: '11/28/2024',
    },
    {
      id: 'list-003',
      name: 'Must Read Classics',
      description: 'Timeless stories that everyone should experience',
      storyCount: 15,
      isPublic: true,
      coverImages: [
        'https://images.pexels.com/photos/2832042/pexels-photo-2832042.jpeg',
        'https://images.pexels.com/photos/2832043/pexels-photo-2832043.jpeg',
        'https://images.pexels.com/photos/2832044/pexels-photo-2832044.jpeg',
      ],

      createdAt: '07/10/2024',
      updatedAt: '11/30/2024',
    },
  ];

  return (
    <UserProfileInteractive
      initialUser={mockUser}
      initialStats={mockStats}
      initialAchievements={mockAchievements}
      initialStories={mockStories}
      initialChoicePatterns={mockChoicePatterns}
      initialGenrePreferences={mockGenrePreferences}
      initialReadingTimes={mockReadingTimes}
      initialFriends={mockFriends}
      initialClubs={mockClubs}
      initialLists={mockLists}
    />
  );
}
