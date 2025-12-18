'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from '@/components/ui/AppIcon';

interface VoiceSettings {
  voice: string;
  speed: number;
  pitch: number;
  volume: number;
  language: string;
}

interface AIVoiceNarrationProps {
  text: string;
  onPlay?: () => void;
  onPause?: () => void;
  onStop?: () => void;
}

export function AIVoiceNarration({ text, onPlay, onPause, onStop }: AIVoiceNarrationProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [settings, setSettings] = useState<VoiceSettings>({
    voice: 'alloy',
    speed: 1.0,
    pitch: 1.0,
    volume: 1.0,
    language: 'en-US',
  });
  const [voices, setVoices] = useState<Array<{ id: string; name: string; gender: string }>>([
    { id: 'alloy', name: 'Alloy', gender: 'neutral' },
    { id: 'echo', name: 'Echo', gender: 'male' },
    { id: 'fable', name: 'Fable', gender: 'female' },
    { id: 'onyx', name: 'Onyx', gender: 'male' },
    { id: 'nova', name: 'Nova', gender: 'female' },
    { id: 'shimmer', name: 'Shimmer', gender: 'female' },
  ]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handlePlay = async () => {
    if (!text.trim()) return;

    try {
      // TODO: Replace with actual TTS API call
      // const audioUrl = await ttsService.generateSpeech(text, settings);
      // if (audioRef.current) {
      //   audioRef.current.src = audioUrl;
      //   audioRef.current.play();
      // }

      setIsPlaying(true);
      setIsPaused(false);
      onPlay?.();
    } catch (error) {
      console.error('Playback failed:', error);
    }
  };

  const handlePause = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setIsPaused(true);
    onPause?.();
  };

  const handleResume = () => {
    if (audioRef.current) {
      audioRef.current.play();
    }
    setIsPaused(false);
  };

  const handleStop = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlaying(false);
    setIsPaused(false);
    setCurrentTime(0);
    onStop?.();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
          <Icon name="SpeakerWaveIcon" size={24} className="text-primary" />
          AI Voice Narration
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Premium</span>
          <span className="px-2 py-1 bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-xs font-bold rounded-full">
            PRO
          </span>
        </div>
      </div>

      {/* Voice Settings */}
      <div className="p-4 bg-card border border-border rounded-lg space-y-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Voice</label>
          <div className="grid grid-cols-3 gap-2">
            {voices.map((voice) => (
              <motion.button
                key={voice.id}
                onClick={() => setSettings({ ...settings, voice: voice.id })}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`p-3 rounded-lg border-2 transition-all ${
                  settings.voice === voice.id
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <div className="font-medium text-foreground text-sm">{voice.name}</div>
                <div className="text-xs text-muted-foreground">{voice.gender}</div>
              </motion.button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Speed: {settings.speed.toFixed(1)}x
            </label>
            <input
              type="range"
              min="0.5"
              max="2.0"
              step="0.1"
              value={settings.speed}
              onChange={(e) => setSettings({ ...settings, speed: parseFloat(e.target.value) })}
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Pitch: {settings.pitch.toFixed(1)}
            </label>
            <input
              type="range"
              min="0.5"
              max="2.0"
              step="0.1"
              value={settings.pitch}
              onChange={(e) => setSettings({ ...settings, pitch: parseFloat(e.target.value) })}
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Volume: {Math.round(settings.volume * 100)}%
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={settings.volume}
              onChange={(e) => setSettings({ ...settings, volume: parseFloat(e.target.value) })}
              className="w-full"
            />
          </div>
        </div>
      </div>

      {/* Playback Controls */}
      <div className="p-4 bg-card border border-border rounded-lg">
        <div className="flex items-center gap-4 mb-4">
          {!isPlaying ? (
            <motion.button
              onClick={handlePlay}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full flex items-center justify-center"
            >
              <Icon name="PlayIcon" size={24} />
            </motion.button>
          ) : isPaused ? (
            <motion.button
              onClick={handleResume}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full flex items-center justify-center"
            >
              <Icon name="PlayIcon" size={24} />
            </motion.button>
          ) : (
            <motion.button
              onClick={handlePause}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full flex items-center justify-center"
            >
              <Icon name="PauseIcon" size={24} />
            </motion.button>
          )}

          <motion.button
            onClick={handleStop}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-10 h-10 bg-muted text-foreground rounded-full flex items-center justify-center"
          >
            <Icon name="StopIcon" size={20} />
          </motion.button>

          <div className="flex-1">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
            <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                initial={{ width: 0 }}
                animate={{ width: duration > 0 ? `${(currentTime / duration) * 100}%` : 0 }}
              />
            </div>
          </div>
        </div>
      </div>

      <audio ref={audioRef} onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)} />
    </div>
  );
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

