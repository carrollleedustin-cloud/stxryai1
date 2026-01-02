import { View, Text, ScrollView, StyleSheet, Pressable, TextInput, Dimensions, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';

const { width } = Dimensions.get('window');

/**
 * DISCOVER SCREEN
 * Browse trending stories, clubs, and authors.
 */

const categories = [
  { id: '1', name: 'Fantasy', emoji: '🐉', color: '#9b5de5' },
  { id: '2', name: 'Sci-Fi', emoji: '🚀', color: '#00bbf9' },
  { id: '3', name: 'Horror', emoji: '👻', color: '#f15bb5' },
  { id: '4', name: 'Mystery', emoji: '🔍', color: '#ff6b6b' },
];

const trendingStories = [
  { id: '1', title: 'The Chronos Key', author: 'Elena Vance', category: 'Sci-Fi', rating: 4.9 },
  { id: '2', title: 'Whispers of Willow', author: 'Marcus Thorne', category: 'Fantasy', rating: 4.7 },
  { id: '3', title: 'Midnight Protocol', author: 'Nova Sky', category: 'Cyberpunk', rating: 4.8 },
];

export default function DiscoverScreen() {
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState('');

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <LinearGradient
        colors={['#000000', '#0a0a14', '#0f0f1e']}
        style={StyleSheet.absoluteFill}
      />
      
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Search Bar */}
        <Animated.View 
          entering={FadeInDown.duration(600)}
          style={styles.searchContainer}
        >
          <BlurView intensity={20} style={styles.searchBlur}>
            <Ionicons name="search" size={20} color="rgba(255,255,255,0.4)" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search stories, clubs, or authors..."
              placeholderTextColor="rgba(255,255,255,0.4)"
              value={search}
              onChangeText={setSearch}
            />
          </BlurView>
        </Animated.View>

        {/* Categories */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Categories</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesScroll}>
            {categories.map((cat, index) => (
              <Animated.View 
                key={cat.id} 
                entering={FadeInRight.delay(index * 100).duration(500)}
              >
                <Pressable style={[styles.categoryCard, { borderColor: cat.color + '40' }]}>
                  <Text style={styles.categoryEmoji}>{cat.emoji}</Text>
                  <Text style={styles.categoryName}>{cat.name}</Text>
                </Pressable>
              </Animated.View>
            ))}
          </ScrollView>
        </View>

        {/* Trending Stories */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Trending Now</Text>
            <Pressable>
              <Text style={styles.seeAll}>See All</Text>
            </Pressable>
          </View>
          
          <View style={styles.storiesGrid}>
            {trendingStories.map((story, index) => (
              <Animated.View 
                key={story.id} 
                entering={FadeInDown.delay(300 + index * 100).duration(600)}
                style={styles.storyCard}
              >
                <View style={styles.storyCoverPlaceholder}>
                   <LinearGradient
                    colors={['#1a1a2e', '#16213e']}
                    style={StyleSheet.absoluteFill}
                  />
                  <Ionicons name="book" size={40} color="rgba(255,255,255,0.1)" />
                  <View style={styles.ratingBadge}>
                    <Ionicons name="star" size={10} color="#FFD700" />
                    <Text style={styles.ratingText}>{story.rating}</Text>
                  </View>
                </View>
                <View style={styles.storyInfo}>
                  <Text style={styles.storyTitle} numberOfLines={1}>{story.title}</Text>
                  <Text style={styles.storyAuthor}>{story.author}</Text>
                  <Text style={styles.storyCategory}>{story.category}</Text>
                </View>
              </Animated.View>
            ))}
          </View>
        </View>

        {/* Recommended Clubs */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recommended Clubs</Text>
          <View style={styles.clubCard}>
            <BlurView intensity={10} style={styles.clubBlur}>
              <View style={styles.clubIcon}>
                <Text style={styles.clubEmoji}>👥</Text>
              </View>
              <View style={styles.clubContent}>
                <Text style={styles.clubName}>Writers Workshop</Text>
                <Text style={styles.clubMeta}>1.2k members • Private</Text>
              </View>
              <Pressable style={styles.joinButton}>
                <Text style={styles.joinButtonText}>Join</Text>
              </Pressable>
            </BlurView>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 30,
  },
  searchBlur: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    color: '#fff',
    fontSize: 16,
  },
  section: {
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  seeAll: {
    color: '#00ffd5',
    fontSize: 14,
    fontWeight: '600',
  },
  categoriesScroll: {
    paddingLeft: 20,
    paddingRight: 10,
  },
  categoryCard: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    marginRight: 12,
    alignItems: 'center',
    minWidth: 100,
  },
  categoryEmoji: {
    fontSize: 24,
    marginBottom: 8,
  },
  categoryName: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  storiesGrid: {
    paddingHorizontal: 20,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  storyCard: {
    width: (width - 50) / 2,
    marginBottom: 20,
  },
  storyCoverPlaceholder: {
    width: '100%',
    height: 220,
    borderRadius: 15,
    backgroundColor: '#1a1a2e',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  ratingBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.6)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  ratingText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
    marginLeft: 3,
  },
  storyInfo: {
    marginTop: 10,
  },
  storyTitle: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
  },
  storyAuthor: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 12,
    marginTop: 2,
  },
  storyCategory: {
    color: '#00ffd5',
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    marginTop: 4,
  },
  clubCard: {
    marginHorizontal: 20,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  clubBlur: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
  },
  clubIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(155, 93, 229, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  clubEmoji: {
    fontSize: 24,
  },
  clubContent: {
    flex: 1,
  },
  clubName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  clubMeta: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 12,
    marginTop: 2,
  },
  joinButton: {
    backgroundColor: 'rgba(0, 255, 213, 0.1)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 213, 0.3)',
  },
  joinButtonText: {
    color: '#00ffd5',
    fontSize: 13,
    fontWeight: 'bold',
  },
});
