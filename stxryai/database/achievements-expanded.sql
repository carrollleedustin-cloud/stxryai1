-- ============================================================================
-- EXPANDED ACHIEVEMENTS SYSTEM
-- Version: 2.0.0
-- Date: January 2026
-- Description: Comprehensive achievement system with 100+ achievements
-- ============================================================================

-- Clear existing achievements (for fresh install)
TRUNCATE achievements CASCADE;

-- ============================================================================
-- WRITING ACHIEVEMENTS
-- ============================================================================

INSERT INTO achievements (title, description, icon, rarity, xp_reward, requirement_type, requirement_value) VALUES
-- Beginner
('First Words', 'Write your first 100 words', '✍️', 'common', 50, 'words_written', 100),
('First Steps', 'Create your first story', '🌟', 'common', 100, 'stories_created', 1),
('Chapter One', 'Complete your first chapter', '📖', 'common', 75, 'chapters_written', 1),

-- Intermediate
('Wordsmith', 'Write 10,000 words', '📝', 'rare', 500, 'words_written', 10000),
('Prolific Writer', 'Create 10 stories', '📚', 'rare', 500, 'stories_created', 10),
('Chapter Master', 'Write 50 chapters', '📑', 'rare', 750, 'chapters_written', 50),
('Daily Dedication', 'Write for 7 consecutive days', '🔥', 'rare', 600, 'writing_streak', 7),

-- Advanced
('Novelist', 'Write 50,000 words', '📕', 'epic', 2000, 'words_written', 50000),
('Master Storyteller', 'Create 50 stories', '👑', 'epic', 2500, 'stories_created', 50),
('Marathon Writer', 'Write for 30 consecutive days', '🏃', 'epic', 3000, 'writing_streak', 30),
('Genre Explorer', 'Write stories in 10 different genres', '🌈', 'epic', 2000, 'genres_written', 10),

-- Legendary
('Literary Legend', 'Write 100,000 words', '🏆', 'legendary', 5000, 'words_written', 100000),
('Epic Saga Creator', 'Create 100 stories', '⭐', 'legendary', 10000, 'stories_created', 100),
('Year of Writing', 'Write for 365 consecutive days', '📅', 'legendary', 15000, 'writing_streak', 365),

-- Mythic
('Wordsmith God', 'Write 1,000,000 words', '👼', 'mythic', 50000, 'words_written', 1000000),
('Infinite Creator', 'Create 500 stories', '♾️', 'mythic', 100000, 'stories_created', 500);

-- ============================================================================
-- READING ACHIEVEMENTS
-- ============================================================================

INSERT INTO achievements (title, description, icon, rarity, xp_reward, requirement_type, requirement_value) VALUES
-- Beginner
('First Read', 'Read your first story', '📖', 'common', 50, 'stories_read', 1),
('Bookworm', 'Read 10 stories', '🐛', 'common', 100, 'stories_read', 10),
('Speed Reader', 'Read a story in under 30 minutes', '⚡', 'common', 150, 'fast_read', 1),

-- Intermediate
('Avid Reader', 'Read 50 stories', '🎓', 'rare', 500, 'stories_read', 50),
('Genre Enthusiast', 'Read stories from 10 genres', '🎭', 'rare', 600, 'genres_read', 10),
('Marathon Reader', 'Read for 5 hours straight', '📚', 'rare', 700, 'reading_session_minutes', 300),
('Completionist', 'Finish 25 stories', '✅', 'rare', 500, 'stories_completed', 25),

-- Advanced
('Literary Scholar', 'Read 200 stories', '🎓', 'epic', 2500, 'stories_read', 200),
('Dedicated Reader', 'Read every day for 30 days', '📅', 'epic', 3000, 'reading_streak', 30),
('Perfect Completion', 'Finish 100 stories', '💯', 'epic', 4000, 'stories_completed', 100),

-- Legendary
('Bibliophile', 'Read 500 stories', '📚', 'legendary', 10000, 'stories_read', 500),
('Reading Champion', 'Read every day for 365 days', '🏆', 'legendary', 20000, 'reading_streak', 365),

-- Mythic
('Eternal Reader', 'Read 1,000 stories', '🌌', 'mythic', 50000, 'stories_read', 1000);

-- ============================================================================
-- SOCIAL ACHIEVEMENTS
-- ============================================================================

INSERT INTO achievements (title, description, icon, rarity, xp_reward, requirement_type, requirement_value) VALUES
-- Beginner
('Social Butterfly', 'Follow 10 users', '🦋', 'common', 100, 'follows', 10),
('First Comment', 'Leave your first comment', '💬', 'common', 50, 'comments_written', 1),
('First Review', 'Write your first review', '⭐', 'common', 75, 'reviews_written', 1),

-- Intermediate
('Community Member', 'Follow 50 users', '👥', 'rare', 500, 'follows', 50),
('Conversationalist', 'Leave 100 comments', '💭', 'rare', 600, 'comments_written', 100),
('Critic', 'Write 25 reviews', '✍️', 'rare', 500, 'reviews_written', 25),
('Popular Creator', 'Get 100 followers', '🌟', 'rare', 800, 'followers', 100),

-- Advanced
('Influencer', 'Get 500 followers', '📢', 'epic', 3000, 'followers', 500),
('Community Leader', 'Get 1,000 followers', '👑', 'epic', 5000, 'followers', 1000),
('Master Reviewer', 'Write 100 reviews', '📝', 'epic', 2500, 'reviews_written', 100),

-- Legendary
('Celebrity', 'Get 5,000 followers', '⭐', 'legendary', 15000, 'followers', 5000),
('Legendary Critic', 'Write 500 reviews', '🏆', 'legendary', 10000, 'reviews_written', 500);

-- ============================================================================
-- ENGAGEMENT ACHIEVEMENTS
-- ============================================================================

INSERT INTO achievements (title, description, icon, rarity, xp_reward, requirement_type, requirement_value) VALUES
-- Beginner
('Early Bird', 'Log in before 6 AM', '🌅', 'common', 100, 'early_login', 1),
('Night Owl', 'Log in after midnight', '🦉', 'common', 100, 'late_login', 1),
('Weekend Warrior', 'Be active on weekends', '🎮', 'common', 150, 'weekend_active', 1),

-- Intermediate
('Daily Visitor', 'Log in for 7 consecutive days', '📆', 'rare', 500, 'login_streak', 7),
('Dedicated User', 'Log in for 30 consecutive days', '🔥', 'rare', 1000, 'login_streak', 30),
('Power User', 'Spend 50 hours on platform', '⚡', 'rare', 800, 'time_spent_hours', 50),

-- Advanced
('Loyal Member', 'Log in for 100 consecutive days', '💎', 'epic', 4000, 'login_streak', 100),
('Platform Veteran', 'Spend 200 hours on platform', '🎖️', 'epic', 3000, 'time_spent_hours', 200),

-- Legendary
('Eternal Dedication', 'Log in for 365 consecutive days', '♾️', 'legendary', 20000, 'login_streak', 365);

-- ============================================================================
-- CREATIVE ACHIEVEMENTS
-- ============================================================================

INSERT INTO achievements (title, description, icon, rarity, xp_reward, requirement_type, requirement_value) VALUES
-- Beginner
('First Choice', 'Create your first interactive choice', '🔀', 'common', 100, 'choices_created', 1),
('Character Creator', 'Create your first character', '👤', 'common', 75, 'characters_created', 1),
('World Builder', 'Create your first world element', '🌍', 'common', 100, 'world_elements', 1),

-- Intermediate
('Choice Master', 'Create 100 interactive choices', '🎯', 'rare', 600, 'choices_created', 100),
('Character Ensemble', 'Create 25 characters', '👥', 'rare', 700, 'characters_created', 25),
('Universe Architect', 'Create 50 world elements', '🏗️', 'rare', 800, 'world_elements', 50),

-- Advanced
('Branching Genius', 'Create 500 interactive choices', '🌳', 'epic', 3000, 'choices_created', 500),
('Character Master', 'Create 100 characters', '🎭', 'epic', 3500, 'characters_created', 100),
('World Creator', 'Create 200 world elements', '🌌', 'epic', 4000, 'world_elements', 200);

-- ============================================================================
-- QUALITY ACHIEVEMENTS
-- ============================================================================

INSERT INTO achievements (title, description, icon, rarity, xp_reward, requirement_type, requirement_value) VALUES
-- Rating-based
('Rising Star', 'Get your first 5-star rating', '⭐', 'common', 200, 'five_star_ratings', 1),
('Crowd Favorite', 'Get 10 five-star ratings', '🌟', 'rare', 800, 'five_star_ratings', 10),
('Masterpiece Creator', 'Get 50 five-star ratings', '👑', 'epic', 3000, 'five_star_ratings', 50),
('Legendary Author', 'Get 100 five-star ratings', '🏆', 'legendary', 10000, 'five_star_ratings', 100),

-- View-based
('Viral Story', 'Get 1,000 views on a story', '🔥', 'rare', 1000, 'story_views', 1000),
('Bestseller', 'Get 10,000 views on a story', '📈', 'epic', 5000, 'story_views', 10000),
('Phenomenon', 'Get 100,000 views on a story', '💫', 'legendary', 25000, 'story_views', 100000);

-- ============================================================================
-- COLLABORATION ACHIEVEMENTS
-- ============================================================================

INSERT INTO achievements (title, description, icon, rarity, xp_reward, requirement_type, requirement_value) VALUES
('Team Player', 'Collaborate on your first story', '🤝', 'common', 150, 'collaborations', 1),
('Co-Author', 'Collaborate on 10 stories', '👥', 'rare', 700, 'collaborations', 10),
('Collaboration Master', 'Collaborate on 50 stories', '🎭', 'epic', 3500, 'collaborations', 50);

-- ============================================================================
-- SPECIAL ACHIEVEMENTS
-- ============================================================================

INSERT INTO achievements (title, description, icon, rarity, xp_reward, requirement_type, requirement_value) VALUES
-- Time-based
('Early Adopter', 'Join in the first month', '🚀', 'legendary', 5000, 'early_adopter', 1),
('Founding Member', 'Join in the first week', '👑', 'mythic', 10000, 'founding_member', 1),

-- Event-based
('Event Participant', 'Participate in a platform event', '🎉', 'rare', 500, 'events_joined', 1),
('Event Champion', 'Win a platform event', '🏆', 'epic', 2000, 'events_won', 1),

-- Milestone-based
('Milestone Maker', 'Reach level 10', '🎯', 'rare', 500, 'level_reached', 10),
('Power Level', 'Reach level 50', '⚡', 'epic', 3000, 'level_reached', 50),
('Maximum Power', 'Reach level 100', '💪', 'legendary', 10000, 'level_reached', 100),

-- Pet-based
('Pet Parent', 'Hatch your first pet', '🥚', 'common', 100, 'pets_hatched', 1),
('Pet Collector', 'Collect 5 different pet types', '🎨', 'rare', 800, 'pet_types_collected', 5),
('Evolution Master', 'Evolve a pet to legendary stage', '✨', 'epic', 3000, 'pet_legendary', 1),
('Pet Whisperer', 'Max out all pet stats', '💫', 'legendary', 5000, 'pet_max_stats', 1),

-- AI-based
('AI Assisted', 'Use AI assistance for the first time', '🤖', 'common', 100, 'ai_uses', 1),
('AI Collaborator', 'Use AI assistance 100 times', '🧠', 'rare', 800, 'ai_uses', 100),
('AI Master', 'Use AI assistance 500 times', '🎯', 'epic', 3500, 'ai_uses', 500),

-- Collection-based
('Collector', 'Create your first collection', '📦', 'common', 100, 'collections_created', 1),
('Curator', 'Create 10 collections', '🎨', 'rare', 600, 'collections_created', 10),
('Master Curator', 'Create 50 collections', '🏛️', 'epic', 2500, 'collections_created', 50);

-- ============================================================================
-- CHALLENGE ACHIEVEMENTS
-- ============================================================================

INSERT INTO achievements (title, description, icon, rarity, xp_reward, requirement_type, requirement_value) VALUES
('Challenge Accepted', 'Complete your first challenge', '🎯', 'common', 150, 'challenges_completed', 1),
('Challenge Seeker', 'Complete 10 challenges', '🔍', 'rare', 700, 'challenges_completed', 10),
('Challenge Master', 'Complete 50 challenges', '🏅', 'epic', 3000, 'challenges_completed', 50),
('Challenge Legend', 'Complete 100 challenges', '👑', 'legendary', 10000, 'challenges_completed', 100);

-- ============================================================================
-- STREAK ACHIEVEMENTS
-- ============================================================================

INSERT INTO achievements (title, description, icon, rarity, xp_reward, requirement_type, requirement_value) VALUES
('Week Warrior', 'Maintain a 7-day streak', '🔥', 'common', 200, 'any_streak', 7),
('Month Master', 'Maintain a 30-day streak', '📅', 'rare', 1000, 'any_streak', 30),
('Quarter Champion', 'Maintain a 90-day streak', '💪', 'epic', 4000, 'any_streak', 90),
('Year Legend', 'Maintain a 365-day streak', '🏆', 'legendary', 20000, 'any_streak', 365);

-- ============================================================================
-- INTERACTION ACHIEVEMENTS
-- ============================================================================

INSERT INTO achievements (title, description, icon, rarity, xp_reward, requirement_type, requirement_value) VALUES
('Helpful Commenter', 'Leave 50 helpful comments', '💬', 'rare', 500, 'helpful_comments', 50),
('Review Expert', 'Write 50 detailed reviews', '📝', 'rare', 600, 'detailed_reviews', 50),
('Bookmark Collector', 'Bookmark 100 stories', '🔖', 'rare', 400, 'bookmarks', 100),
('List Maker', 'Create 20 reading lists', '📋', 'rare', 500, 'reading_lists', 20);

-- ============================================================================
-- PREMIUM ACHIEVEMENTS
-- ============================================================================

INSERT INTO achievements (title, description, icon, rarity, xp_reward, requirement_type, requirement_value) VALUES
('Premium Member', 'Subscribe to Premium', '💎', 'rare', 1000, 'premium_subscription', 1),
('Creator Pro', 'Subscribe to Creator Pro', '👑', 'epic', 2000, 'creator_pro_subscription', 1),
('Loyal Subscriber', 'Maintain subscription for 6 months', '🎖️', 'epic', 3000, 'subscription_months', 6),
('Lifetime Supporter', 'Maintain subscription for 1 year', '⭐', 'legendary', 10000, 'subscription_months', 12);

-- ============================================================================
-- SPECIAL ACHIEVEMENTS
-- ============================================================================

INSERT INTO achievements (title, description, icon, rarity, xp_reward, requirement_type, requirement_value) VALUES
-- Easter eggs
('Secret Finder', 'Discover a hidden feature', '🔍', 'rare', 500, 'secrets_found', 1),
('Easter Egg Hunter', 'Find all easter eggs', '🥚', 'legendary', 5000, 'easter_eggs', 10),

-- Platform milestones
('Beta Tester', 'Participate in beta testing', '🧪', 'epic', 2000, 'beta_tester', 1),
('Bug Hunter', 'Report 10 bugs', '🐛', 'rare', 800, 'bugs_reported', 10),
('Feature Suggester', 'Have a feature suggestion implemented', '💡', 'epic', 3000, 'features_suggested', 1),

-- Community
('Club Founder', 'Create a club', '🏛️', 'rare', 700, 'clubs_created', 1),
('Club Leader', 'Grow a club to 100 members', '👥', 'epic', 3000, 'club_members', 100),
('Forum Moderator', 'Become a forum moderator', '🛡️', 'epic', 2500, 'moderator_status', 1),

-- Content quality
('Trending Creator', 'Have a story trend for 7 days', '📈', 'epic', 4000, 'trending_days', 7),
('Hall of Fame', 'Get inducted into Hall of Fame', '🏛️', 'legendary', 15000, 'hall_of_fame', 1),
('Platform Legend', 'Achieve legendary status', '⭐', 'mythic', 50000, 'legendary_status', 1);

-- ============================================================================
-- COMPLETION MESSAGE
-- ============================================================================

DO $$
DECLARE
  achievement_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO achievement_count FROM achievements;
  RAISE NOTICE 'Achievements system initialized!';
  RAISE NOTICE 'Total achievements created: %', achievement_count;
  RAISE NOTICE 'Rarity distribution:';
  RAISE NOTICE '  Common: % achievements', (SELECT COUNT(*) FROM achievements WHERE rarity = 'common');
  RAISE NOTICE '  Rare: % achievements', (SELECT COUNT(*) FROM achievements WHERE rarity = 'rare');
  RAISE NOTICE '  Epic: % achievements', (SELECT COUNT(*) FROM achievements WHERE rarity = 'epic');
  RAISE NOTICE '  Legendary: % achievements', (SELECT COUNT(*) FROM achievements WHERE rarity = 'legendary');
  RAISE NOTICE '  Mythic: % achievements', (SELECT COUNT(*) FROM achievements WHERE rarity = 'mythic');
END $$;
