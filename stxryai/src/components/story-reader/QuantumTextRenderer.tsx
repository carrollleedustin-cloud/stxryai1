'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * QUANTUM TEXT RENDERER
 * Revolutionary text rendering with particle physics and quantum effects
 */
interface QuantumTextRendererProps {
  text: string;
  fontSize: number;
  theme: 'void' | 'sepia' | 'light';
  onWordHover?: (word: string, position: { x: number; y: number }) => void;
  onEmotionDetected?: (emotion: string, intensity: number) => void;
  enableParticleEffects?: boolean;
  readingSpeed?: number;
}

export const QuantumTextRenderer: React.FC<QuantumTextRendererProps> = ({
  text,
  fontSize,
  theme,
  onWordHover,
  onEmotionDetected,
  enableParticleEffects = true,
  readingSpeed = 1,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const [hoveredWord, setHoveredWord] = useState<string | null>(null);
  const [particles, setParticles] = useState<Array<{
    x: number;
    y: number;
    vx: number;
    vy: number;
    life: number;
    color: string;
    size: number;
  }>>([]);

  // Emotion detection patterns
  const emotionPatterns = {
    joy: /\b(happy|excited|delighted|thrilled|ecstatic|joyful|cheerful)\b/gi,
    fear: /\b(scared|terrified|afraid|frightened|horrified|dreadful)\b/gi,
    anger: /\b(angry|furious|enraged|infuriated|outraged)\b/gi,
    sadness: /\b(sad|depressed|heartbroken|grief|mournful|melancholy)\b/gi,
    surprise: /\b(shocked|astonished|amazed|stunned|bewildered)\b/gi,
    love: /\b(love|adore|cherish|devoted|passionate|affection)\b/gi,
  };

  // Particle system for quantum effects
  useEffect(() => {
    if (!enableParticleEffects || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      setParticles(prev => prev
        .map(particle => ({
          ...particle,
          x: particle.x + particle.vx,
          y: particle.y + particle.vy,
          life: particle.life - 0.02,
          vy: particle.vy + 0.1, // gravity
        }))
        .filter(particle => particle.life > 0)
      );

      particles.forEach(particle => {
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = particle.color;
        ctx.globalAlpha = particle.life;
        ctx.fill();
      });

      requestAnimationFrame(animate);
    };

    animate();
  }, [particles, enableParticleEffects]);

  // Detect emotions in text
  useEffect(() => {
    if (!onEmotionDetected) return;

    const words = text.toLowerCase().split(/\s+/);
    let detectedEmotions: Record<string, number> = {};

    Object.entries(emotionPatterns).forEach(([emotion, pattern]) => {
      const matches = text.match(pattern);
      if (matches) {
        detectedEmotions[emotion] = matches.length;
      }
    });

    // Find dominant emotion
    const dominantEmotion = Object.entries(detectedEmotions)
      .sort(([,a], [,b]) => b - a)[0];

    if (dominantEmotion) {
      onEmotionDetected(dominantEmotion[0], dominantEmotion[1]);
    }
  }, [text, onEmotionDetected]);

  // Create particles on word hover
  const handleWordHover = (word: string, event: React.MouseEvent) => {
    if (!enableParticleEffects) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;

    setHoveredWord(word);
    onWordHover?.(word, { x, y });

    // Create quantum particles
    const newParticles = Array.from({ length: 8 }, () => ({
      x,
      y,
      vx: (Math.random() - 0.5) * 4,
      vy: (Math.random() - 0.5) * 4,
      life: 1,
      color: theme === 'void' ? '#00f5d4' : theme === 'sepia' ? '#c9a227' : '#6b4423',
      size: Math.random() * 3 + 1,
    }));

    setParticles(prev => [...prev, ...newParticles]);
  };

  // Split text into words with quantum effects
  const renderQuantumText = () => {
    const words = text.split(/\s+/);
    const paragraphs = text.split('\n\n');

    return paragraphs.map((paragraph, paraIndex) => (
      <motion.p
        key={paraIndex}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.8,
          delay: paraIndex * 0.1,
          ease: [0.16, 1, 0.3, 1]
        }}
        className="mb-6 leading-relaxed"
        style={{
          fontSize: `${fontSize}px`,
          lineHeight: 1.8,
        }}
      >
        {paragraph.split(/\s+/).map((word, wordIndex) => {
          const globalIndex = words.indexOf(word);
          const isEmotional = Object.values(emotionPatterns).some(pattern =>
            pattern.test(word)
          );

          return (
            <motion.span
              key={`${paraIndex}-${wordIndex}`}
              className="relative inline-block cursor-pointer transition-all duration-300"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                duration: 0.5,
                delay: globalIndex * 0.02 * readingSpeed,
              }}
              whileHover={{
                scale: 1.05,
                textShadow: theme === 'void'
                  ? '0 0 20px rgba(0, 245, 212, 0.5)'
                  : theme === 'sepia'
                  ? '0 0 20px rgba(201, 162, 39, 0.5)'
                  : '0 0 20px rgba(107, 68, 35, 0.5)',
              }}
              onMouseEnter={(e) => handleWordHover(word, e)}
              onMouseLeave={() => setHoveredWord(null)}
              style={{
                color: isEmotional ? (
                  theme === 'void' ? '#ff6b9d' :
                  theme === 'sepia' ? '#d4c5a9' :
                  '#8b4513'
                ) : undefined,
              }}
            >
              {word}{' '}
            </motion.span>
          );
        })}
      </motion.p>
    ));
  };

  return (
    <div className="relative">
      {/* Quantum particle canvas */}
      {enableParticleEffects && (
        <canvas
          ref={canvasRef}
          className="absolute inset-0 pointer-events-none z-10"
          width={typeof window !== 'undefined' ? window.innerWidth : 1200}
          height={typeof window !== 'undefined' ? window.innerHeight : 800}
        />
      )}

      {/* Text content */}
      <div ref={textRef} className="relative z-20">
        {renderQuantumText()}
      </div>

      {/* Hovered word tooltip */}
      <AnimatePresence>
        {hoveredWord && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -10 }}
            className="absolute z-30 px-3 py-2 rounded-lg bg-black/80 text-white text-sm font-medium pointer-events-none"
            style={{
              left: '50%',
              top: '-40px',
              transform: 'translateX(-50%)',
            }}
          >
            {hoveredWord}
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-black/80" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default QuantumTextRenderer;