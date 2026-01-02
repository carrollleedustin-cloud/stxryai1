import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Animated as RNAnimated, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import Animated, { 
  FadeIn, 
  FadeOut, 
  SlideInUp, 
  useAnimatedStyle, 
  useSharedValue, 
  withTiming, 
  withSpring 
} from 'react-native-reanimated';
import { mobileGamificationService } from '../../src/services/gamificationService';
import { mobileNarrativeService, MobileNarrativeContext } from '../../src/services/narrativeService';
import { mobileMoodService, MoodProfile } from '../../src/services/moodService';
import { WorldIntelOverlay } from '../../src/components/WorldIntelOverlay';

const { width, height } = Dimensions.get('window');

const MOCK_CHAPTER = {
  title: 'Chapter 1: The Call of the Void',
  content: `The wind howled through the cracked spires of Aetheria, carrying with it the scent of ozone and ancient magic. Lyra stood at the edge of the floating platform, her cloak billowing like a shadow against the twilight sky.

Below, the nebulous clouds of the Great Void swirled in endless patterns of violet and gold. Somewhere in that expanse, the Echo Core was calling. She could feel its resonance in her very bones—a low, rhythmic pulse that matched the beating of her heart.

"You're not really going down there, are you?" 

The voice belonged to Kael, his mechanical wing whirring softly as he landed beside her. His goggles reflected the shimmering void below.

Lyra didn't turn. "The prophecy didn't say it would be easy, Kael. It only said it would be necessary."

"Prophecies are just stories told by old men who are too tired to change the world themselves," Kael countered, though there was no real conviction in his tone. He reached into his satchel and pulled out a small, glowing crystal. "At least take this. It's a localized light-source. Might keep the Void-Stalkers at bay for a while."

Lyra finally looked at him, a faint smile playing on her lips. "Always the pragmatist."

She took the crystal. It felt warm in her hand, a tiny sun in a world of growing darkness. With one last look at the spires of her home, she stepped into the emptiness.`,
};

export default function ReaderScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [readingProgress, setReadingProgress] = useState(0);
  const [scrollAnim] = useState(new RNAnimated.Value(0));
  const [showIntel, setShowIntel] = useState(false);
  const [context, setContext] = useState<MobileNarrativeContext | null>(null);
  const [mood, setMood] = useState<MoodProfile>(mobileMoodService.getMoodProfile('mysterious'));
  const [moodAnim] = useState(new RNAnimated.Value(0));
  const [zenMode, setZenMode] = useState(false);
  const [fontSize, setFontSize] = useState(18);

  const handleScroll = RNAnimated.event(
    [{ nativeEvent: { contentOffset: { y: scrollAnim } } }],
    { useNativeDriver: false }
  );

  const toggleZen = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setZenMode(!zenMode);
  };

  useEffect(() => {
    // Award XP for opening a story (minimal)
    mobileGamificationService.updateStreak('user-123');

    // Fetch narrative context
    const fetchContext = async () => {
      const seriesId = 'series-123'; // In a real app, this comes from story metadata
      const data = await mobileNarrativeService.getStoryContext(seriesId);
      setContext(data);
    };

    fetchContext();

    // Analyze mood from content
    const detectedMood = mobileMoodService.analyzeMood(MOCK_CHAPTER.content);
    setMood(detectedMood);

    // Fade in mood elements
    RNAnimated.timing(moodAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);

  const progressWidth = scrollAnim.interpolate({
    inputRange: [0, height * 2], // Rough estimate of content height
    outputRange: ['0%', '100%'],
    extrapolate: 'clamp',
  });

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={mood.colors}
        style={StyleSheet.absoluteFill}
      />
      
      {/* Header */}
      <BlurView intensity={30} tint="dark" style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{MOCK_CHAPTER.title}</Text>
        <TouchableOpacity 
          style={styles.settingsButton}
          onPress={toggleZen}
        >
          <Ionicons name={zenMode ? "eye-off-outline" : "eye-outline"} size={22} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.settingsButton}
          onPress={() => setShowIntel(true)}
        >
          <Ionicons name="book-outline" size={22} color="#00ffd5" />
        </TouchableOpacity>
      </BlurView>

      <RNAnimated.View style={[styles.moodIndicator, { opacity: moodAnim }]}>
        <BlurView intensity={20} tint="light" style={styles.moodBadge}>
          <Text style={[styles.moodText, { color: mood.colors[1] }]}>{mood.label}</Text>
        </BlurView>
      </RNAnimated.View>

      <RNAnimated.ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        <Text style={styles.chapterTitle}>{MOCK_CHAPTER.title}</Text>
        <View style={styles.divider} />
        <Text style={styles.contentText}>{MOCK_CHAPTER.content}</Text>
        
        <View style={styles.footer}>
          <TouchableOpacity style={styles.nextButton}>
            <LinearGradient
              colors={['#00ffd5', '#008cff']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.gradientButton}
            >
              <Text style={styles.nextButtonText}>Next Chapter</Text>
              <Ionicons name="chevron-forward" size={20} color="#000" />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </RNAnimated.ScrollView>

      {/* World Intel Overlay */}
      <WorldIntelOverlay 
        isVisible={showIntel} 
        onClose={() => setShowIntel(false)} 
        context={context}
      />

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <RNAnimated.View style={[styles.progressBar, { width: progressWidth }]} />
      </View>
    </View>
  );
}

import { SafeAreaView } from 'react-native-safe-area-context';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f1a',
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 100,
    paddingTop: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    zIndex: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 15,
  },
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  moodIndicator: {
    position: 'absolute',
    top: 110,
    right: 20,
    zIndex: 5,
  },
  moodBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  moodText: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingTop: 140,
    paddingHorizontal: 25,
    paddingBottom: 60,
  },
  chapterTitle: {
    color: '#00ffd5',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    width: '40%',
    alignSelf: 'center',
    marginBottom: 30,
  },
  contentText: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 18,
    lineHeight: 32,
    letterSpacing: 0.3,
  },
  footer: {
    marginTop: 60,
    alignItems: 'center',
  },
  nextButton: {
    width: '100%',
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
  },
  gradientButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextButtonText: {
    color: '#000',
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 8,
  },
  progressContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#00ffd5',
  },
  intelContainer: {
    flex: 1,
    padding: 20,
  },
  intelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  intelTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#00ffd5',
    fontFamily: 'System',
  },
  intelScroll: {
    flex: 1,
  },
  intelSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 15,
    opacity: 0.8,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  rippleCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#00ffd5',
  },
  rippleTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  rippleDesc: {
    fontSize: 14,
    color: '#ccc',
    marginBottom: 10,
  },
  intensityBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  intensityText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#000',
    textTransform: 'uppercase',
  },
  charRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  charAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  charInitial: {
    color: '#00ffd5',
    fontWeight: 'bold',
  },
  charName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  charRole: {
    fontSize: 12,
    color: '#aaa',
  },
  elementCard: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  elementName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#00ffd5',
    marginBottom: 2,
  },
  elementDesc: {
    fontSize: 13,
    color: '#999',
  },
});
