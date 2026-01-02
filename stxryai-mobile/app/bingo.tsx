import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import Animated, { FadeIn, ZoomIn } from 'react-native-reanimated';

const { width } = Dimensions.get('window');
const TILE_SIZE = (width - 60) / 3;

// Mock Bingo Data (Similar to Web BingoService)
const MOCK_TILES = [
  { id: '1', label: 'Reader', desc: 'Read 1 story', completed: true },
  { id: '2', label: 'Critic', desc: 'Rate 3 stories', completed: false },
  { id: '3', label: 'Sharer', desc: 'Share a link', completed: false },
  { id: '4', label: 'Author', desc: 'Create a draft', completed: true },
  { id: '5', label: 'FREE', desc: 'Daily Bonus', completed: true },
  { id: '6', label: 'Talker', desc: 'Post a comment', completed: false },
  { id: '7', label: 'Explorer', desc: 'Find new genre', completed: false },
  { id: '8', label: 'Styler', desc: 'Pick an avatar', completed: true },
  { id: '9', label: 'Loyal', desc: '3 day streak', completed: false },
];

export default function BingoScreen() {
  const [tiles, setTiles] = useState(MOCK_TILES);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0f0f1a', '#1a1a2e']}
        style={StyleSheet.absoluteFill}
      />
      
      <BlurView intensity={30} tint="dark" style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Story Bingo</Text>
        <View style={{ width: 40 }} />
      </BlurView>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Animated.View entering={FadeIn.delay(200)} style={styles.infoCard}>
          <Text style={styles.infoTitle}>Weekly Challenge</Text>
          <Text style={styles.infoSubtitle}>Complete a row or column to earn 500 XP!</Text>
        </Animated.View>

        <View style={styles.grid}>
          {tiles.map((tile, index) => (
            <Animated.View 
              key={tile.id} 
              entering={ZoomIn.delay(index * 50)}
              style={[
                styles.tile,
                tile.completed && styles.tileCompleted
              ]}
            >
              <Text style={[styles.tileLabel, tile.completed && styles.tileLabelCompleted]}>
                {tile.label}
              </Text>
              {tile.completed && (
                <View style={styles.checkCircle}>
                  <Ionicons name="checkmark" size={12} color="#000" />
                </View>
              )}
            </Animated.View>
          ))}
        </View>

        <View style={styles.legend}>
          <Text style={styles.legendTitle}>How to play</Text>
          <View style={styles.legendRow}>
            <Ionicons name="flash" size={16} color="#00ffd5" />
            <Text style={styles.legendText}>Complete tasks to mark tiles</Text>
          </View>
          <View style={styles.legendRow}>
            <Ionicons name="trophy" size={16} color="#00ffd5" />
            <Text style={styles.legendText}>Get 3 in a row for a BIG reward</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f1a',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
  },
  scrollContent: {
    padding: 20,
  },
  infoCard: {
    backgroundColor: 'rgba(0, 255, 213, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 213, 0.3)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 30,
  },
  infoTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#00ffd5',
    marginBottom: 5,
  },
  infoSubtitle: {
    fontSize: 14,
    color: '#ccc',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  tile: {
    width: TILE_SIZE,
    height: TILE_SIZE,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    marginBottom: 15,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  tileCompleted: {
    backgroundColor: '#00ffd5',
    borderColor: '#00ffd5',
  },
  tileLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  tileLabelCompleted: {
    color: '#000',
  },
  checkCircle: {
    position: 'absolute',
    top: 5,
    right: 5,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  legend: {
    marginTop: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 16,
    padding: 20,
  },
  legendTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  legendText: {
    fontSize: 14,
    color: '#aaa',
    marginLeft: 10,
  },
});
