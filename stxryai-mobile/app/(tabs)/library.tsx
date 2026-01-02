import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

const MOCK_STORIES = [
  {
    id: '1',
    title: 'The Echoes of Aetheria',
    author: 'Stxry AI',
    cover: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=500&auto=format&fit=crop',
    category: 'Fantasy',
    rating: 4.8,
    reads: '12.4k',
    progress: 45,
  },
  {
    id: '2',
    title: 'Neon Shadows',
    author: 'CyberPunk_Lord',
    cover: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=500&auto=format&fit=crop',
    category: 'Sci-Fi',
    rating: 4.5,
    reads: '8.2k',
    progress: 0,
  },
  {
    id: '3',
    title: 'Midnight Whispers',
    author: 'GhostWriter',
    cover: 'https://images.unsplash.com/photo-1501139083538-0139583c060f?q=80&w=500&auto=format&fit=crop',
    category: 'Mystery',
    rating: 4.9,
    reads: '25.1k',
    progress: 82,
  },
  {
    id: '4',
    title: 'Solar Winds',
    author: 'Astra_Nomad',
    cover: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?q=80&w=500&auto=format&fit=crop',
    category: 'Sci-Fi',
    rating: 4.2,
    reads: '5.6k',
    progress: 15,
  }
];

export default function LibraryScreen() {
  const router = useRouter();

  const renderStoryCard = ({ item }: { item: typeof MOCK_STORIES[0] }) => (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => router.push(`/reader/${item.id}`)}
    >
      <Image source={{ uri: item.cover }} style={styles.cover} />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.8)']}
        style={styles.gradient}
      />
      <View style={styles.cardContent}>
        <Text style={styles.storyTitle} numberOfLines={1}>{item.title}</Text>
        <View style={styles.metaRow}>
          <Text style={styles.category}>{item.category}</Text>
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={12} color="#ffd700" />
            <Text style={styles.ratingText}>{item.rating}</Text>
          </View>
        </View>
        {item.progress > 0 && (
          <View style={styles.progressContainer}>
            <View style={[styles.progressBar, { width: `${item.progress}%` }]} />
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#1a1a2e', '#16213e']}
        style={StyleSheet.absoluteFill}
      />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Library</Text>
        <TouchableOpacity style={styles.searchButton}>
          <Ionicons name="search" size={24} color="#00ffd5" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={MOCK_STORIES}
        renderItem={renderStoryCard}
        keyExtractor={item => item.id}
        numColumns={2}
        contentContainerStyle={styles.listContent}
        columnWrapperStyle={styles.columnWrapper}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 0.5,
  },
  searchButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingHorizontal: 15,
    paddingBottom: 100,
  },
  columnWrapper: {
    justifyContent: 'space-between',
  },
  card: {
    width: (width - 45) / 2,
    height: 240,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 15,
    backgroundColor: '#1f1f3a',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  cover: {
    width: '100%',
    height: '100%',
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '60%',
  },
  cardContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
  },
  storyTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  category: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 10,
    fontWeight: '600',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  ratingText: {
    color: '#ffd700',
    fontSize: 10,
    fontWeight: 'bold',
    marginLeft: 2,
  },
  progressContainer: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 2,
    marginTop: 8,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#00ffd5',
  }
});
