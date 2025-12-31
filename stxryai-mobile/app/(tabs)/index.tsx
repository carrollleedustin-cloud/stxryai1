import { View, Text, ScrollView, StyleSheet, Pressable, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { 
  FadeInDown, 
  FadeInRight,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  interpolate,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.7;

/**
 * HOME SCREEN
 * The main landing screen of the app.
 * Features personalized recommendations and continue reading.
 */

// Sample data
const continueReading = {
  id: '1',
  title: 'The Midnight Library',
  author: 'Matt Haig',
  progress: 67,
  cover: null,
};

const featuredStories = [
  { id: '1', title: 'Dragon\'s Quest', genre: 'Fantasy', rating: 4.8 },
  { id: '2', title: 'Star Voyager', genre: 'Sci-Fi', rating: 4.6 },
  { id: '3', title: 'The Secret Garden', genre: 'Adventure', rating: 4.9 },
];

const categories = [
  { id: '1', name: 'Fantasy', emoji: '🐉', color: '#9b5de5' },
  { id: '2', name: 'Sci-Fi', emoji: '🚀', color: '#00bbf9' },
  { id: '3', name: 'Mystery', emoji: '🔍', color: '#f15bb5' },
  { id: '4', name: 'Adventure', emoji: '⛵', color: '#00f5d4' },
  { id: '5', name: 'Romance', emoji: '💕', color: '#ff6b6b' },
];

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  
  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Background gradient */}
      <LinearGradient
        colors={['#000000', '#0a0a14', '#0f0f1e']}
        style={StyleSheet.absoluteFill}
      />
      
      {/* Ambient glow */}
      <View style={styles.ambientGlow} />
      
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* Header */}
        <Animated.View 
          entering={FadeInDown.delay(100).duration(600)}
          style={styles.header}
        >
          <View>
            <Text style={styles.greeting}>Good evening</Text>
            <Text style={styles.username}>Alex 👋</Text>
          </View>
          <Pressable style={styles.notificationButton}>
            <Ionicons name="notifications-outline" size={24} color="#fff" />
            <View style={styles.notificationBadge} />
          </Pressable>
        </Animated.View>
        
        {/* Continue Reading */}
        <Animated.View entering={FadeInDown.delay(200).duration(600)}>
          <Text style={styles.sectionTitle}>Continue Reading</Text>
          <Pressable 
            style={styles.continueCard}
            onPress={() => router.push(`/story/${continueReading.id}`)}
          >
            <LinearGradient
              colors={['rgba(155, 93, 229, 0.2)', 'rgba(0, 245, 212, 0.1)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
            <View style={styles.continueContent}>
              <View style={styles.coverPlaceholder}>
                <Text style={styles.coverEmoji}>📖</Text>
              </View>
              <View style={styles.continueInfo}>
                <Text style={styles.continueTitle}>{continueReading.title}</Text>
                <Text style={styles.continueAuthor}>{continueReading.author}</Text>
                <View style={styles.progressContainer}>
                  <View style={styles.progressBar}>
                    <LinearGradient
                      colors={['#9b5de5', '#00f5d4']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={[styles.progressFill, { width: `${continueReading.progress}%` }]}
                    />
                  </View>
                  <Text style={styles.progressText}>{continueReading.progress}%</Text>
                </View>
              </View>
              <View style={styles.playButton}>
                <Ionicons name="play" size={20} color="#000" />
              </View>
            </View>
          </Pressable>
        </Animated.View>
        
        {/* Categories */}
        <Animated.View entering={FadeInDown.delay(300).duration(600)}>
          <Text style={styles.sectionTitle}>Explore</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesContainer}
          >
            {categories.map((cat, index) => (
              <Animated.View
                key={cat.id}
                entering={FadeInRight.delay(300 + index * 100).duration(400)}
              >
                <Pressable 
                  style={[styles.categoryButton, { borderColor: cat.color + '50' }]}
                  onPress={() => router.push(`/discover?category=${cat.id}`)}
                >
                  <Text style={styles.categoryEmoji}>{cat.emoji}</Text>
                  <Text style={styles.categoryName}>{cat.name}</Text>
                </Pressable>
              </Animated.View>
            ))}
          </ScrollView>
        </Animated.View>
        
        {/* Featured Stories */}
        <Animated.View entering={FadeInDown.delay(400).duration(600)}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Featured Stories</Text>
            <Pressable>
              <Text style={styles.seeAll}>See All</Text>
            </Pressable>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.storiesContainer}
            snapToInterval={CARD_WIDTH + 16}
            decelerationRate="fast"
          >
            {featuredStories.map((story, index) => (
              <Animated.View
                key={story.id}
                entering={FadeInRight.delay(400 + index * 100).duration(500)}
              >
                <Pressable 
                  style={styles.storyCard}
                  onPress={() => router.push(`/story/${story.id}`)}
                >
                  <LinearGradient
                    colors={['#1a1a2e', '#16213e']}
                    style={styles.storyCardGradient}
                  >
                    <View style={styles.storyCardCover}>
                      <Text style={styles.storyCardEmoji}>
                        {story.genre === 'Fantasy' ? '🐉' : story.genre === 'Sci-Fi' ? '🚀' : '🌿'}
                      </Text>
                    </View>
                    <Text style={styles.storyCardTitle}>{story.title}</Text>
                    <Text style={styles.storyCardGenre}>{story.genre}</Text>
                    <View style={styles.storyCardRating}>
                      <Ionicons name="star" size={14} color="#ffc040" />
                      <Text style={styles.ratingText}>{story.rating}</Text>
                    </View>
                  </LinearGradient>
                </Pressable>
              </Animated.View>
            ))}
          </ScrollView>
        </Animated.View>
        
        {/* Kids Zone Banner */}
        <Animated.View entering={FadeInDown.delay(500).duration(600)}>
          <Pressable 
            style={styles.kidsBanner}
            onPress={() => router.push('/kids-zone')}
          >
            <LinearGradient
              colors={['rgba(155, 93, 229, 0.3)', 'rgba(241, 91, 181, 0.3)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
            <View style={styles.kidsContent}>
              <Text style={styles.kidsEmoji}>✨</Text>
              <View>
                <Text style={styles.kidsTitle}>Kids Zone</Text>
                <Text style={styles.kidsSubtitle}>Magical stories for young readers</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#fff" />
          </Pressable>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  ambientGlow: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(155, 93, 229, 0.1)',
    top: -100,
    right: -100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  greeting: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    // fontFamily: 'Sora-Regular', // Uncomment when fonts are loaded
  },
  username: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
    // fontFamily: 'Sora-Bold', // Uncomment when fonts are loaded
    marginTop: 4,
  },
  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ff4080',
  },
  sectionTitle: {
    fontSize: 20,
    color: '#fff',
    fontWeight: '600',
    // fontFamily: 'Sora-SemiBold', // Uncomment when fonts are loaded
    paddingHorizontal: 20,
    marginTop: 24,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingRight: 20,
  },
  seeAll: {
    fontSize: 14,
    color: '#00f5d4',
    // fontFamily: 'Sora-Regular', // Uncomment when fonts are loaded
  },
  continueCard: {
    marginHorizontal: 20,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(155, 93, 229, 0.3)',
  },
  continueContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  coverPlaceholder: {
    width: 60,
    height: 80,
    borderRadius: 10,
    backgroundColor: 'rgba(155, 93, 229, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  coverEmoji: {
    fontSize: 28,
  },
  continueInfo: {
    flex: 1,
    marginLeft: 16,
  },
  continueTitle: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
    // fontFamily: 'Sora-SemiBold', // Uncomment when fonts are loaded
  },
  continueAuthor: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.5)',
    // fontFamily: 'Sora-Regular', // Uncomment when fonts are loaded
    marginTop: 4,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  progressBar: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
    // fontFamily: 'Sora-Regular', // Uncomment when fonts are loaded
    marginLeft: 12,
  },
  playButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#00f5d4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoriesContainer: {
    paddingHorizontal: 20,
    gap: 12,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    gap: 8,
  },
  categoryEmoji: {
    fontSize: 18,
  },
  categoryName: {
    fontSize: 14,
    color: '#fff',
    // fontFamily: 'Sora-Regular', // Uncomment when fonts are loaded
  },
  storiesContainer: {
    paddingHorizontal: 20,
    gap: 16,
  },
  storyCard: {
    width: CARD_WIDTH,
    borderRadius: 20,
    overflow: 'hidden',
  },
  storyCardGradient: {
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  storyCardCover: {
    width: '100%',
    height: 160,
    borderRadius: 12,
    backgroundColor: 'rgba(155, 93, 229, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  storyCardEmoji: {
    fontSize: 48,
  },
  storyCardTitle: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '600',
    // fontFamily: 'Sora-SemiBold', // Uncomment when fonts are loaded
    marginBottom: 4,
  },
  storyCardGenre: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.5)',
    // fontFamily: 'Sora-Regular', // Uncomment when fonts are loaded
  },
  storyCardRating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    gap: 4,
  },
  ratingText: {
    fontSize: 14,
    color: '#ffc040',
    fontWeight: '600',
    // fontFamily: 'Sora-SemiBold', // Uncomment when fonts are loaded
  },
  kidsBanner: {
    marginHorizontal: 20,
    marginTop: 24,
    padding: 20,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(155, 93, 229, 0.3)',
  },
  kidsContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  kidsEmoji: {
    fontSize: 32,
  },
  kidsTitle: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
    // fontFamily: 'Sora-Bold', // Uncomment when fonts are loaded
  },
  kidsSubtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.6)',
    // fontFamily: 'Sora-Regular', // Uncomment when fonts are loaded
    marginTop: 2,
  },
});


