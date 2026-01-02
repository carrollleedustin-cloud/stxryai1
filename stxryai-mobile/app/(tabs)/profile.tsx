import { View, Text, ScrollView, StyleSheet, Pressable, Image, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import Animated, { 
  FadeInDown, 
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { mobileGamificationService, PlayerProgress } from '../../src/services/gamificationService';

const { width } = Dimensions.get('window');

/**
 * PROFILE SCREEN
 * Showcases the user's achievements, social activity, and stats.
 */

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const [progress, setProgress] = useState<PlayerProgress | null>(null);
  const [activeTab, setActiveTab] = useState<'activity' | 'achievements' | 'clubs'>('activity');

  useEffect(() => {
    mobileGamificationService.getProgress('user-123').then(setProgress);
  }, []);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <LinearGradient
        colors={['#0f0f1e', '#0a0a14', '#000000']}
        style={StyleSheet.absoluteFill}
      />
      
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Profile Header */}
        <Animated.View 
          entering={FadeInDown.duration(800)}
          style={styles.header}
        >
          <View style={styles.avatarContainer}>
            <LinearGradient
              colors={['#00ffd5', '#9b5de5']}
              style={styles.avatarGradient}
            >
              <View style={styles.avatarInner}>
                <Text style={styles.avatarText}>A</Text>
              </View>
            </LinearGradient>
            <Pressable style={styles.editBadge}>
              <Ionicons name="pencil" size={14} color="#000" />
            </Pressable>
          </View>
          
          <Text style={styles.name}>Alex Rivera</Text>
          <Text style={styles.handle}>@arivera_story</Text>
          
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>1.2k</Text>
              <Text style={styles.statLabel}>Followers</Text>
            </View>
            <View style={[styles.statItem, styles.statDivider]}>
              <Text style={styles.statValue}>452</Text>
              <Text style={styles.statLabel}>Following</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>12</Text>
              <Text style={styles.statLabel}>Stories</Text>
            </View>
          </View>
        </Animated.View>

        {/* Level Card */}
        {progress && (
          <Animated.View 
            entering={FadeInDown.delay(200).duration(600)}
            style={styles.levelCard}
          >
            <BlurView intensity={20} style={styles.levelBlur}>
              <View style={styles.levelHeader}>
                <View>
                  <Text style={styles.levelLabel}>Level {progress.level}</Text>
                  <Text style={styles.levelName}>Narrative Architect</Text>
                </View>
                <MaterialCommunityIcons name="shield-check" size={32} color="#00ffd5" />
              </View>
              
              <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: '65%' }]} />
                </View>
                <View style={styles.progressLabels}>
                  <Text style={styles.progressText}>{progress.xp} XP</Text>
                  <Text style={styles.progressText}>350 XP to next level</Text>
                </View>
              </View>
            </BlurView>
          </Animated.View>
        )}

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          {['activity', 'achievements', 'clubs'].map((tab) => (
            <Pressable 
              key={tab}
              onPress={() => setActiveTab(tab as any)}
              style={[
                styles.tab,
                activeTab === tab && styles.activeTab
              ]}
            >
              <Text style={[
                styles.tabText,
                activeTab === tab && styles.activeTabText
              ]}>
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Tab Content */}
        <View style={styles.content}>
          {activeTab === 'activity' && (
            <Animated.View entering={FadeInUp.duration(400)}>
              <ActivityItem 
                icon="📖" 
                title="Started Reading" 
                detail="The Midnight Library" 
                time="2h ago" 
                color="#00ffd5"
              />
              <ActivityItem 
                icon="🏆" 
                title="Earned Achievement" 
                detail="Night Owl - Read for 3 nights in a row" 
                time="Yesterday" 
                color="#FFD700"
              />
              <ActivityItem 
                icon="🤝" 
                title="New Follower" 
                detail="Sarah Jenkins followed you" 
                time="2 days ago" 
                color="#9b5de5"
              />
              <ActivityItem 
                icon="💬" 
                title="Commented on" 
                detail="Dragon's Quest: 'That plot twist was insane!'" 
                time="3 days ago" 
                color="#f15bb5"
              />
            </Animated.View>
          )}

          {activeTab === 'achievements' && (
            <View style={styles.grid}>
              {[1, 2, 3, 4, 5, 6].map(i => (
                <View key={i} style={styles.achievementBadge}>
                  <View style={styles.badgeIconPlaceholder}>
                    <Ionicons name="medal" size={30} color={i % 2 === 0 ? '#00ffd5' : '#9b5de5'} />
                  </View>
                  <Text style={styles.badgeName}>Achievement {i}</Text>
                </View>
              ))}
            </View>
          )}

          {activeTab === 'clubs' && (
            <View style={styles.clubsList}>
              <ClubItem name="Dark Fiction Society" members="2.4k" category="Horror" />
              <ClubItem name="Sci-Fi Explorers" members="1.8k" category="Sci-Fi" />
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

function ActivityItem({ icon, title, detail, time, color }: any) {
  return (
    <View style={styles.activityItem}>
      <View style={[styles.activityIcon, { backgroundColor: color + '20' }]}>
        <Text style={styles.activityEmoji}>{icon}</Text>
      </View>
      <View style={styles.activityContent}>
        <View style={styles.activityHeader}>
          <Text style={styles.activityTitle}>{title}</Text>
          <Text style={styles.activityTime}>{time}</Text>
        </View>
        <Text style={styles.activityDetail}>{detail}</Text>
        
        <View style={styles.activityActions}>
          <Pressable style={styles.actionButton}>
            <Ionicons name="heart-outline" size={16} color="rgba(255,255,255,0.4)" />
            <Text style={styles.actionText}>Like</Text>
          </Pressable>
          <Pressable style={styles.actionButton}>
            <Ionicons name="chatbubble-outline" size={16} color="rgba(255,255,255,0.4)" />
            <Text style={styles.actionText}>Reply</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

function ClubItem({ name, members, category }: any) {
  return (
    <View style={styles.clubItem}>
      <View style={styles.clubInfo}>
        <Text style={styles.clubName}>{name}</Text>
        <Text style={styles.clubMeta}>{category} • {members} members</Text>
      </View>
      <Pressable style={styles.viewButton}>
        <Text style={styles.viewButtonText}>Visit</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatarGradient: {
    width: 100,
    height: 100,
    borderRadius: 50,
    padding: 3,
  },
  avatarInner: {
    flex: 1,
    borderRadius: 47,
    backgroundColor: '#0f0f1e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#fff',
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#00ffd5',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#000',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  handle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.4)',
    marginBottom: 20,
  },
  statsRow: {
    flexDirection: 'row',
    width: '80%',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statDivider: {
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.4)',
    marginTop: 2,
  },
  levelCard: {
    marginHorizontal: 20,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 30,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 213, 0.2)',
  },
  levelBlur: {
    padding: 20,
  },
  levelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  levelLabel: {
    color: '#00ffd5',
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  levelName: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  progressContainer: {
    marginTop: 5,
  },
  progressBar: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 3,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#00ffd5',
    borderRadius: 3,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressText: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.4)',
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  tab: {
    paddingVertical: 10,
    marginRight: 25,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#00ffd5',
  },
  tabText: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.4)',
    fontWeight: '600',
  },
  activeTabText: {
    color: '#fff',
  },
  content: {
    paddingHorizontal: 20,
  },
  activityItem: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  activityIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  activityEmoji: {
    fontSize: 20,
  },
  activityContent: {
    flex: 1,
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  activityTitle: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
  },
  activityTime: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: 12,
  },
  activityDetail: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
    lineHeight: 20,
  },
  activityActions: {
    flexDirection: 'row',
    marginTop: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  actionText: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 12,
    marginLeft: 5,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  achievementBadge: {
    width: '48%',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  badgeIconPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  badgeName: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
  clubsList: {
    gap: 12,
  },
  clubItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 16,
    borderRadius: 16,
  },
  clubInfo: {
    flex: 1,
  },
  clubName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  clubMeta: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 12,
  },
  viewButton: {
    backgroundColor: 'rgba(0, 255, 213, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 213, 0.3)',
  },
  viewButtonText: {
    color: '#00ffd5',
    fontSize: 13,
    fontWeight: 'bold',
  },
});
