import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';

const BADGES = [
  { id: '1', name: 'First Steps', description: 'Complete your first story', icon: '🎯', color: '#9b5de5', unlocked: true },
  { id: '2', name: 'Story Enthusiast', description: 'Read 10 stories', icon: '📚', color: '#00bbf9', unlocked: true },
  { id: '3', name: 'Early Bird', description: 'Read before 8 AM', icon: '🌅', color: '#f15bb5', unlocked: false },
  { id: '4', name: 'Path Weaver', description: 'Make 100 choices', icon: '🎲', color: '#00f5d4', unlocked: false },
  { id: '5', name: 'Night Owl', description: 'Read after midnight', icon: '🦉', color: '#ff6b6b', unlocked: true },
  { id: '6', name: 'Social Star', description: 'Share a story', icon: '✨', color: '#fee440', unlocked: false },
];

export default function BadgesScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <LinearGradient
        colors={['#000000', '#0a0a14', '#0f0f1e']}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.header}>
        <Text style={styles.title}>My Badges</Text>
        <Text style={styles.subtitle}>{BADGES.filter(b => b.unlocked).length} / {BADGES.length} Unlocked</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.badgeGrid}>
          {BADGES.map((badge, index) => (
            <Animated.View 
              key={badge.id} 
              entering={FadeInDown.delay(index * 100).duration(500)}
              style={[
                styles.badgeCard,
                !badge.unlocked && styles.badgeLocked
              ]}
            >
              <View style={[styles.iconContainer, { backgroundColor: badge.color + '20' }]}>
                <Text style={[styles.icon, !badge.unlocked && styles.grayscale]}>{badge.icon}</Text>
              </View>
              <Text style={styles.badgeName}>{badge.name}</Text>
              <Text style={styles.badgeDescription}>{badge.description}</Text>
              
              {!badge.unlocked && (
                <View style={styles.lockOverlay}>
                  <Ionicons name="lock-closed" size={16} color="rgba(255,255,255,0.4)" />
                </View>
              )}
            </Animated.View>
          ))}
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
  header: {
    padding: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#fff',
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.5)',
    marginTop: 4,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  badgeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  badgeCard: {
    width: '48%',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  badgeLocked: {
    opacity: 0.6,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  icon: {
    fontSize: 32,
  },
  grayscale: {
    opacity: 0.4,
  },
  badgeName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 4,
  },
  badgeDescription: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 12,
    textAlign: 'center',
  },
  lockOverlay: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
});
