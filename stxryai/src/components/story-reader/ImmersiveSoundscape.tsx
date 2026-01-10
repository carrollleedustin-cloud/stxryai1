'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

/**
 * IMMERSIVE SOUNDSCAPE
 * Dynamic audio experience that responds to reading patterns and emotional content
 */
interface ImmersiveSoundscapeProps {
  isEnabled?: boolean;
  volume?: number;
  emotionalState?: string;
  readingSpeed?: number;
  chapterProgress?: number;
  theme?: 'void' | 'sepia' | 'light';
}

interface AudioLayer {
  id: string;
  audio: HTMLAudioElement | null;
  volume: number;
  fadeSpeed: number;
  isPlaying: boolean;
}

export const ImmersiveSoundscape: React.FC<ImmersiveSoundscapeProps> = ({
  isEnabled = true,
  volume = 0.3,
  emotionalState = 'neutral',
  readingSpeed = 1,
  chapterProgress = 0,
  theme = 'void',
}) => {
  const audioContextRef = useRef<AudioContext | null>(null);
  const [audioLayers, setAudioLayers] = useState<Record<string, AudioLayer>>({});
  const [isInitialized, setIsInitialized] = useState(false);

  // Audio layers configuration
  const audioLayersConfig = {
    ambient: {
      neutral: '/audio/ambient-neutral.mp3',
      joy: '/audio/ambient-joyful.mp3',
      fear: '/audio/ambient-tense.mp3',
      anger: '/audio/ambient-intense.mp3',
      sadness: '/audio/ambient-melancholy.mp3',
      surprise: '/audio/ambient-mysterious.mp3',
      love: '/audio/ambient-romantic.mp3',
    },
    heartbeat: {
      neutral: '/audio/heartbeat-normal.mp3',
      fear: '/audio/heartbeat-rapid.mp3',
      anger: '/audio/heartbeat-intense.mp3',
      joy: '/audio/heartbeat-elevated.mp3',
    },
    environmental: {
      forest: '/audio/env-forest.mp3',
      storm: '/audio/env-storm.mp3',
      city: '/audio/env-city.mp3',
      mystical: '/audio/env-mystical.mp3',
    },
    ui: {
      pageTurn: '/audio/ui-page-turn.mp3',
      choiceSelect: '/audio/ui-choice-select.mp3',
      achievement: '/audio/ui-achievement.mp3',
      notification: '/audio/ui-notification.mp3',
    },
  } as const;

  // Initialize Web Audio API
  useEffect(() => {
    if (!isEnabled || isInitialized) return;

    const initAudio = async () => {
      try {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();

        // Create audio layers
        const layers: Record<string, AudioLayer> = {};

        // Ambient layer
        layers.ambient = {
          id: 'ambient',
          audio: new Audio(),
          volume: 0.4,
          fadeSpeed: 0.02,
          isPlaying: false,
        };

        // Heartbeat layer
        layers.heartbeat = {
          id: 'heartbeat',
          audio: new Audio(),
          volume: 0.2,
          fadeSpeed: 0.05,
          isPlaying: false,
        };

        // Environmental layer
        layers.environmental = {
          id: 'environmental',
          audio: new Audio(),
          volume: 0.3,
          fadeSpeed: 0.03,
          isPlaying: false,
        };

        setAudioLayers(layers);
        setIsInitialized(true);
      } catch (error) {
        console.warn('Web Audio API not supported:', error);
      }
    };

    initAudio();
  }, [isEnabled, isInitialized]);

  // Update ambient audio based on emotional state
  useEffect(() => {
    if (!isInitialized || !audioLayers.ambient) return;

    const ambientAudio = audioLayers.ambient.audio;
    if (!ambientAudio) return;

    const audioSrc =
      audioLayersConfig.ambient[emotionalState as keyof typeof audioLayersConfig.ambient] ||
      audioLayersConfig.ambient.neutral;

    if (ambientAudio.src !== audioSrc) {
      ambientAudio.src = audioSrc;
      ambientAudio.loop = true;
      ambientAudio.volume = audioLayers.ambient.volume * volume;

      if (isEnabled) {
        ambientAudio.play().catch(() => {
          // Handle autoplay restrictions
        });
        setAudioLayers((prev) => ({
          ...prev,
          ambient: { ...prev.ambient, isPlaying: true },
        }));
      }
    }
  }, [emotionalState, isInitialized, audioLayers, volume, isEnabled]);

  // Update heartbeat based on emotional intensity
  useEffect(() => {
    if (!isInitialized || !audioLayers.heartbeat) return;

    const heartbeatAudio = audioLayers.heartbeat.audio;
    if (!heartbeatAudio) return;

    const shouldPlayHeartbeat = ['fear', 'anger', 'joy'].includes(emotionalState);
    const heartbeatSrc =
      audioLayersConfig.heartbeat[emotionalState as keyof typeof audioLayersConfig.heartbeat] ||
      audioLayersConfig.heartbeat.neutral;

    if (shouldPlayHeartbeat && heartbeatAudio.src !== heartbeatSrc) {
      heartbeatAudio.src = heartbeatSrc;
      heartbeatAudio.loop = true;
      heartbeatAudio.volume =
        audioLayers.heartbeat.volume * volume * (emotionalState === 'fear' ? 1.2 : 0.8);

      if (isEnabled) {
        heartbeatAudio.play().catch(() => {});
        setAudioLayers((prev) => ({
          ...prev,
          heartbeat: { ...prev.heartbeat, isPlaying: true },
        }));
      }
    } else if (!shouldPlayHeartbeat && audioLayers.heartbeat.isPlaying) {
      // Fade out heartbeat
      const fadeOut = () => {
        if (heartbeatAudio.volume > 0.01) {
          heartbeatAudio.volume -= 0.01;
          requestAnimationFrame(fadeOut);
        } else {
          heartbeatAudio.pause();
          setAudioLayers((prev) => ({
            ...prev,
            heartbeat: { ...prev.heartbeat, isPlaying: false },
          }));
        }
      };
      fadeOut();
    }
  }, [emotionalState, isInitialized, audioLayers, volume, isEnabled]);

  // Play UI sound effects
  const playUISound = (soundType: keyof typeof audioLayersConfig.ui) => {
    if (!isEnabled || !isInitialized) return;

    const audio = new Audio(audioLayersConfig.ui[soundType]);
    audio.volume = volume * 0.6;
    audio.play().catch(() => {});
  };

  // Reading speed affects audio pitch
  useEffect(() => {
    if (!isInitialized) return;

    Object.values(audioLayers).forEach((layer) => {
      if (layer.audio && layer.isPlaying) {
        // Adjust playback rate based on reading speed
        const speedMultiplier = 0.8 + (readingSpeed - 0.5) * 0.4;
        layer.audio.playbackRate = speedMultiplier;
      }
    });
  }, [readingSpeed, audioLayers, isInitialized]);

  // Chapter progress affects environmental audio
  useEffect(() => {
    if (!isInitialized || !audioLayers.environmental || chapterProgress < 10) return;

    const environmentalAudio = audioLayers.environmental.audio;
    if (!environmentalAudio) return;

    // Choose environment based on progress and theme
    let envType: keyof typeof audioLayersConfig.environmental = 'mystical';

    if (chapterProgress < 30) envType = 'forest';
    else if (chapterProgress < 70) envType = theme === 'void' ? 'mystical' : 'city';
    else envType = 'storm';

    const envSrc = audioLayersConfig.environmental[envType];

    if (environmentalAudio.src !== envSrc) {
      environmentalAudio.src = envSrc;
      environmentalAudio.loop = true;
      environmentalAudio.volume = audioLayers.environmental.volume * volume * 0.5;

      if (isEnabled && Math.random() < 0.3) {
        // 30% chance to play environmental audio
        environmentalAudio.play().catch(() => {});
        setAudioLayers((prev) => ({
          ...prev,
          environmental: { ...prev.environmental, isPlaying: true },
        }));

        // Auto-fade after 30 seconds
        setTimeout(() => {
          const fadeOut = () => {
            if (environmentalAudio.volume > 0.01) {
              environmentalAudio.volume -= 0.005;
              requestAnimationFrame(fadeOut);
            } else {
              environmentalAudio.pause();
              setAudioLayers((prev) => ({
                ...prev,
                environmental: { ...prev.environmental, isPlaying: false },
              }));
            }
          };
          fadeOut();
        }, 30000);
      }
    }
  }, [chapterProgress, theme, isInitialized, audioLayers, volume, isEnabled]);

  // Cleanup
  useEffect(() => {
    return () => {
      Object.values(audioLayers).forEach((layer) => {
        if (layer.audio) {
          layer.audio.pause();
          layer.audio.src = '';
        }
      });
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [audioLayers]);

  // Expose UI sound functions to parent components
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).playStorySound = playUISound;
    }
  }, [isEnabled, isInitialized]);

  return (
    <motion.div
      className="fixed bottom-4 right-4 z-50"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: isEnabled ? 1 : 0.5, scale: isEnabled ? 1 : 0.8 }}
      transition={{ duration: 0.3 }}
    >
      {/* Sound visualization */}
      <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-black/20 backdrop-blur-sm border border-white/10">
        <motion.div
          animate={{
            scale: audioLayers.ambient?.isPlaying ? [1, 1.2, 1] : 1,
            opacity: audioLayers.ambient?.isPlaying ? 1 : 0.5,
          }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-2 h-2 rounded-full bg-cyan-400"
        />
        <motion.div
          animate={{
            scale: audioLayers.heartbeat?.isPlaying ? [1, 1.3, 1] : 1,
            opacity: audioLayers.heartbeat?.isPlaying ? 1 : 0.5,
          }}
          transition={{ duration: 0.8, repeat: Infinity }}
          className="w-2 h-2 rounded-full bg-red-400"
        />
        <motion.div
          animate={{
            scale: audioLayers.environmental?.isPlaying ? [1, 1.1, 1] : 1,
            opacity: audioLayers.environmental?.isPlaying ? 1 : 0.5,
          }}
          transition={{ duration: 4, repeat: Infinity }}
          className="w-2 h-2 rounded-full bg-green-400"
        />
      </div>
    </motion.div>
  );
};

// Utility function to play UI sounds from anywhere in the app
export const playStorySound = (
  soundType: 'pageTurn' | 'choiceSelect' | 'achievement' | 'notification'
) => {
  if (typeof window !== 'undefined' && (window as any).playStorySound) {
    (window as any).playStorySound(soundType);
  }
};

export default ImmersiveSoundscape;
