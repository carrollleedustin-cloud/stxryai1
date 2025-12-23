import { Tabs } from 'expo-router';
import { View, StyleSheet, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import Animated, { 
  useAnimatedStyle, 
  withSpring, 
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

/**
 * TAB NAVIGATION LAYOUT
 * A beautiful, animated bottom navigation bar.
 * Feels magical and responsive.
 */

type TabIconProps = {
  name: keyof typeof Ionicons.glyphMap;
  color: string;
  focused: boolean;
};

function TabIcon({ name, color, focused }: TabIconProps) {
  const scale = useSharedValue(1);
  
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
  
  if (focused) {
    scale.value = withSpring(1.2, { damping: 12 });
  } else {
    scale.value = withSpring(1);
  }
  
  return (
    <Animated.View style={animatedStyle}>
      <Ionicons name={name} size={24} color={color} />
    </Animated.View>
  );
}

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  
  const handleTabPress = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };
  
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          position: 'absolute',
          bottom: insets.bottom + 16,
          left: 20,
          right: 20,
          height: 70,
          borderRadius: 35,
          backgroundColor: 'rgba(20, 20, 35, 0.95)',
          borderTopWidth: 0,
          shadowColor: '#9b5de5',
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.25,
          shadowRadius: 20,
          elevation: 10,
          paddingBottom: 0,
        },
        tabBarBackground: () => (
          Platform.OS === 'ios' ? (
            <BlurView
              intensity={80}
              style={StyleSheet.absoluteFill}
              tint="dark"
            />
          ) : (
            <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(20, 20, 35, 0.98)' }]} />
          )
        ),
        tabBarActiveTintColor: '#00ffd5',
        tabBarInactiveTintColor: 'rgba(255, 255, 255, 0.4)',
        tabBarShowLabel: false,
        tabBarItemStyle: {
          paddingVertical: 12,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        listeners={{ tabPress: handleTabPress }}
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name={focused ? 'home' : 'home-outline'} color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="library"
        listeners={{ tabPress: handleTabPress }}
        options={{
          title: 'Library',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name={focused ? 'library' : 'library-outline'} color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="create"
        listeners={{ tabPress: handleTabPress }}
        options={{
          title: 'Create',
          tabBarIcon: ({ color, focused }) => (
            <View style={styles.createButton}>
              <Ionicons name="add" size={28} color="#000" />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="discover"
        listeners={{ tabPress: handleTabPress }}
        options={{
          title: 'Discover',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name={focused ? 'compass' : 'compass-outline'} color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        listeners={{ tabPress: handleTabPress }}
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name={focused ? 'person' : 'person-outline'} color={color} focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  createButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#00ffd5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
    shadowColor: '#00ffd5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
});


