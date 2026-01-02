import { View, Text, StyleSheet, Pressable, TextInput, ScrollView, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';

const { width } = Dimensions.get('window');

/**
 * CREATE SCREEN
 * Start a new AI-assisted story.
 */

export default function CreateScreen() {
  const insets = useSafeAreaInsets();
  const [title, setTitle] = useState('');
  const [prompt, setPrompt] = useState('');

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
        <Animated.View 
          entering={FadeInDown.duration(800)}
          style={styles.header}
        >
          <Text style={styles.title}>Create New Story</Text>
          <Text style={styles.subtitle}>Let AI help you bring your ideas to life</Text>
        </Animated.View>

        <View style={styles.form}>
          <Animated.View entering={FadeInUp.delay(200).duration(600)} style={styles.inputGroup}>
            <Text style={styles.label}>Story Title</Text>
            <BlurView intensity={10} style={styles.inputBlur}>
              <TextInput
                style={styles.input}
                placeholder="Once upon a time..."
                placeholderTextColor="rgba(255,255,255,0.2)"
                value={title}
                onChangeText={setTitle}
              />
            </BlurView>
          </Animated.View>

          <Animated.View entering={FadeInUp.delay(400).duration(600)} style={styles.inputGroup}>
            <Text style={styles.label}>What's the story about?</Text>
            <BlurView intensity={10} style={styles.textAreaBlur}>
              <TextInput
                style={styles.textArea}
                placeholder="Describe your plot, characters, or setting..."
                placeholderTextColor="rgba(255,255,255,0.2)"
                multiline
                numberOfLines={6}
                textAlignVertical="top"
                value={prompt}
                onChangeText={setPrompt}
              />
            </BlurView>
          </Animated.View>

          <Animated.View entering={FadeInUp.delay(600).duration(600)}>
             <Text style={styles.label}>Choose Style</Text>
             <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.styleScroll}>
                <StyleChip icon="✨" label="Classic" active />
                <StyleChip icon="🎭" label="Dramatic" />
                <StyleChip icon="🕵️" label="Noir" />
                <StyleChip icon="🚀" label="Futuristic" />
             </ScrollView>
          </Animated.View>

          <Animated.View entering={FadeInUp.delay(800).duration(600)} style={styles.buttonContainer}>
            <Pressable style={styles.createButton}>
              <LinearGradient
                colors={['#00ffd5', '#9b5de5']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.buttonGradient}
              >
                <Text style={styles.buttonText}>Generate Story Foundation</Text>
                <Ionicons name="sparkles" size={20} color="#000" style={styles.buttonIcon} />
              </LinearGradient>
            </Pressable>
          </Animated.View>
        </View>
      </ScrollView>
    </View>
  );
}

function StyleChip({ icon, label, active }: any) {
    return (
        <Pressable style={[styles.styleChip, active && styles.activeStyleChip]}>
            <Text style={styles.styleIcon}>{icon}</Text>
            <Text style={[styles.styleLabel, active && styles.activeStyleLabel]}>{label}</Text>
        </Pressable>
    )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    paddingHorizontal: 25,
    paddingVertical: 30,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.5)',
    marginTop: 8,
  },
  form: {
    paddingHorizontal: 25,
  },
  inputGroup: {
    marginBottom: 25,
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#00ffd5',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 10,
    marginLeft: 5,
  },
  inputBlur: {
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
  },
  input: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    color: '#fff',
    fontSize: 16,
  },
  textAreaBlur: {
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
  },
  textArea: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    color: '#fff',
    fontSize: 16,
    height: 150,
  },
  styleScroll: {
    flexDirection: 'row',
    marginBottom: 30,
  },
  styleChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    marginRight: 10,
  },
  activeStyleChip: {
    backgroundColor: 'rgba(0, 255, 213, 0.1)',
    borderColor: 'rgba(0, 255, 213, 0.3)',
  },
  styleIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  styleLabel: {
    color: 'rgba(255,255,255,0.6)',
    fontWeight: '600',
  },
  activeStyleLabel: {
    color: '#00ffd5',
  },
  buttonContainer: {
    marginTop: 10,
  },
  createButton: {
    borderRadius: 20,
    overflow: 'hidden',
    height: 60,
  },
  buttonGradient: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonIcon: {
    marginLeft: 10,
  },
});
