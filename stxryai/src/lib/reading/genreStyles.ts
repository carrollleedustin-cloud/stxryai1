/**
 * Genre-Based Reading Styles
 * Dynamic font, color, and animation settings based on story genre
 */

export interface GenreStyle {
  // Typography
  fontFamily: string;
  fontSize: {
    base: string;
    title: string;
    narrator: string;
  };
  fontWeight: {
    normal: string;
    bold: string;
  };
  lineHeight: string;
  letterSpacing: string;

  // Colors & Themes
  backgroundColor: string;
  textColor: string;
  accentColor: string;
  borderColor: string;
  shadowColor: string;

  // Effects
  textShadow?: string;
  backgroundPattern?: string;
  animations: {
    pageTransition: string;
    textReveal: string;
    choiceHover: string;
  };

  // Narrator Voice Style
  narratorStyle: {
    fontStyle: string;
    color: string;
    background: string;
    borderLeft: string;
    padding: string;
    icon: string;
  };
}

export const genreStyles: Record<string, GenreStyle> = {
  // Children's Genres
  'childrens-adventure': {
    fontFamily: '"Comic Neue", "Comic Sans MS", cursive',
    fontSize: {
      base: '1.25rem',
      title: '2.5rem',
      narrator: '1.1rem',
    },
    fontWeight: { normal: '400', bold: '700' },
    lineHeight: '1.8',
    letterSpacing: '0.02em',
    backgroundColor: '#FFF9E6',
    textColor: '#2C1810',
    accentColor: '#FF6B9D',
    borderColor: '#FFD93D',
    shadowColor: 'rgba(255, 107, 157, 0.3)',
    backgroundPattern: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255, 217, 61, 0.05) 10px, rgba(255, 217, 61, 0.05) 20px)',
    animations: {
      pageTransition: 'bounce',
      textReveal: 'fadeInUp',
      choiceHover: 'wiggle',
    },
    narratorStyle: {
      fontStyle: 'normal',
      color: '#6A4C93',
      background: 'linear-gradient(to right, rgba(255, 217, 61, 0.1), transparent)',
      borderLeft: '4px solid #FFD93D',
      padding: '1rem 1.5rem',
      icon: '📖',
    },
  },

  'childrens-educational': {
    fontFamily: '"Nunito", "Arial Rounded MT Bold", sans-serif',
    fontSize: {
      base: '1.2rem',
      title: '2.25rem',
      narrator: '1.05rem',
    },
    fontWeight: { normal: '400', bold: '700' },
    lineHeight: '1.75',
    letterSpacing: '0.01em',
    backgroundColor: '#F0F8FF',
    textColor: '#1A1A2E',
    accentColor: '#4ECDC4',
    borderColor: '#95E1D3',
    shadowColor: 'rgba(78, 205, 196, 0.3)',
    backgroundPattern: 'radial-gradient(circle at 20% 50%, rgba(149, 225, 211, 0.1) 0%, transparent 50%)',
    animations: {
      pageTransition: 'slideIn',
      textReveal: 'fadeIn',
      choiceHover: 'pulse',
    },
    narratorStyle: {
      fontStyle: 'normal',
      color: '#0E7C7B',
      background: 'rgba(78, 205, 196, 0.1)',
      borderLeft: '4px solid #4ECDC4',
      padding: '1rem 1.5rem',
      icon: '🎓',
    },
  },

  'middle-grade': {
    fontFamily: '"Quicksand", "Century Gothic", sans-serif',
    fontSize: {
      base: '1.125rem',
      title: '2rem',
      narrator: '1rem',
    },
    fontWeight: { normal: '400', bold: '600' },
    lineHeight: '1.7',
    letterSpacing: '0.01em',
    backgroundColor: '#FFF8F0',
    textColor: '#2D3748',
    accentColor: '#9F7AEA',
    borderColor: '#D6BCFA',
    shadowColor: 'rgba(159, 122, 234, 0.2)',
    backgroundPattern: 'linear-gradient(to bottom, transparent 95%, rgba(214, 188, 250, 0.1) 95%)',
    animations: {
      pageTransition: 'slideIn',
      textReveal: 'fadeInUp',
      choiceHover: 'lift',
    },
    narratorStyle: {
      fontStyle: 'normal',
      color: '#6B46C1',
      background: 'rgba(159, 122, 234, 0.08)',
      borderLeft: '3px solid #9F7AEA',
      padding: '0.875rem 1.25rem',
      icon: '📚',
    },
  },

  // Fantasy
  fantasy: {
    fontFamily: '"Cinzel", "Palatino Linotype", serif',
    fontSize: {
      base: '1.125rem',
      title: '2.5rem',
      narrator: '1.05rem',
    },
    fontWeight: { normal: '400', bold: '600' },
    lineHeight: '1.8',
    letterSpacing: '0.03em',
    backgroundColor: '#1A1A2E',
    textColor: '#E8D5C4',
    accentColor: '#8B5CF6',
    borderColor: '#7C3AED',
    shadowColor: 'rgba(139, 92, 246, 0.5)',
    textShadow: '0 0 10px rgba(139, 92, 246, 0.3)',
    backgroundPattern: 'radial-gradient(ellipse at top, rgba(139, 92, 246, 0.15), transparent 70%)',
    animations: {
      pageTransition: 'fade',
      textReveal: 'mysticalReveal',
      choiceHover: 'glow',
    },
    narratorStyle: {
      fontStyle: 'italic',
      color: '#C4B5FD',
      background: 'linear-gradient(to right, rgba(139, 92, 246, 0.2), transparent)',
      borderLeft: '3px solid #8B5CF6',
      padding: '1rem 1.5rem',
      icon: '🧙',
    },
  },

  // Sci-Fi
  scifi: {
    fontFamily: '"Orbitron", "Rajdhani", monospace',
    fontSize: {
      base: '1.0625rem',
      title: '2.25rem',
      narrator: '1rem',
    },
    fontWeight: { normal: '400', bold: '600' },
    lineHeight: '1.75',
    letterSpacing: '0.05em',
    backgroundColor: '#0A0E27',
    textColor: '#00F5FF',
    accentColor: '#00F5FF',
    borderColor: '#0EA5E9',
    shadowColor: 'rgba(0, 245, 255, 0.4)',
    textShadow: '0 0 5px rgba(0, 245, 255, 0.3)',
    backgroundPattern: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 245, 255, 0.03) 2px, rgba(0, 245, 255, 0.03) 4px)',
    animations: {
      pageTransition: 'glitch',
      textReveal: 'scanline',
      choiceHover: 'cyberpulse',
    },
    narratorStyle: {
      fontStyle: 'normal',
      color: '#38BDF8',
      background: 'rgba(0, 245, 255, 0.1)',
      borderLeft: '2px solid #00F5FF',
      padding: '0.875rem 1.25rem',
      icon: '🚀',
    },
  },

  // Horror
  horror: {
    fontFamily: '"Creepster", "Special Elite", cursive',
    fontSize: {
      base: '1.0625rem',
      title: '2.5rem',
      narrator: '1rem',
    },
    fontWeight: { normal: '400', bold: '600' },
    lineHeight: '1.75',
    letterSpacing: '0.02em',
    backgroundColor: '#0D0D0D',
    textColor: '#D4D4D4',
    accentColor: '#DC2626',
    borderColor: '#991B1B',
    shadowColor: 'rgba(220, 38, 38, 0.5)',
    textShadow: '0 0 8px rgba(220, 38, 38, 0.2)',
    backgroundPattern: 'radial-gradient(circle at 50% 50%, rgba(220, 38, 38, 0.05), transparent 50%)',
    animations: {
      pageTransition: 'fadeShudder',
      textReveal: 'creepIn',
      choiceHover: 'tremble',
    },
    narratorStyle: {
      fontStyle: 'italic',
      color: '#EF4444',
      background: 'rgba(220, 38, 38, 0.1)',
      borderLeft: '3px solid #DC2626',
      padding: '1rem 1.5rem',
      icon: '👻',
    },
  },

  // Mystery
  mystery: {
    fontFamily: '"Courier Prime", "Courier New", monospace',
    fontSize: {
      base: '1.0625rem',
      title: '2.25rem',
      narrator: '1rem',
    },
    fontWeight: { normal: '400', bold: '600' },
    lineHeight: '1.7',
    letterSpacing: '0.01em',
    backgroundColor: '#1F2937',
    textColor: '#E5E7EB',
    accentColor: '#F59E0B',
    borderColor: '#D97706',
    shadowColor: 'rgba(245, 158, 11, 0.3)',
    backgroundPattern: 'linear-gradient(90deg, transparent 95%, rgba(245, 158, 11, 0.05) 95%)',
    animations: {
      pageTransition: 'typewriter',
      textReveal: 'fadeInSlow',
      choiceHover: 'underlineGrow',
    },
    narratorStyle: {
      fontStyle: 'normal',
      color: '#FCD34D',
      background: 'rgba(245, 158, 11, 0.1)',
      borderLeft: '3px solid #F59E0B',
      padding: '1rem 1.5rem',
      icon: '🔍',
    },
  },

  // Romance
  romance: {
    fontFamily: '"Playfair Display", "Georgia", serif',
    fontSize: {
      base: '1.125rem',
      title: '2.5rem',
      narrator: '1.05rem',
    },
    fontWeight: { normal: '400', bold: '600' },
    lineHeight: '1.85',
    letterSpacing: '0.02em',
    backgroundColor: '#FFF5F7',
    textColor: '#4A5568',
    accentColor: '#EC4899',
    borderColor: '#F9A8D4',
    shadowColor: 'rgba(236, 72, 153, 0.2)',
    backgroundPattern: 'radial-gradient(circle at 80% 20%, rgba(249, 168, 212, 0.1), transparent 40%)',
    animations: {
      pageTransition: 'fadeIn',
      textReveal: 'softReveal',
      choiceHover: 'heartbeat',
    },
    narratorStyle: {
      fontStyle: 'italic',
      color: '#DB2777',
      background: 'linear-gradient(to right, rgba(236, 72, 153, 0.08), transparent)',
      borderLeft: '3px solid #EC4899',
      padding: '1rem 1.5rem',
      icon: '💖',
    },
  },

  // Cyberpunk
  cyberpunk: {
    fontFamily: '"Share Tech Mono", "Roboto Mono", monospace',
    fontSize: {
      base: '1.0625rem',
      title: '2.25rem',
      narrator: '1rem',
    },
    fontWeight: { normal: '400', bold: '700' },
    lineHeight: '1.7',
    letterSpacing: '0.04em',
    backgroundColor: '#0F0F23',
    textColor: '#FF00FF',
    accentColor: '#00FFFF',
    borderColor: '#FF00FF',
    shadowColor: 'rgba(255, 0, 255, 0.5)',
    textShadow: '0 0 10px rgba(255, 0, 255, 0.4), 0 0 20px rgba(0, 255, 255, 0.2)',
    backgroundPattern: 'repeating-linear-gradient(0deg, transparent, transparent 1px, rgba(255, 0, 255, 0.05) 1px, rgba(255, 0, 255, 0.05) 2px)',
    animations: {
      pageTransition: 'glitchSlide',
      textReveal: 'neonFlicker',
      choiceHover: 'neonPulse',
    },
    narratorStyle: {
      fontStyle: 'normal',
      color: '#00FFFF',
      background: 'rgba(0, 255, 255, 0.1)',
      borderLeft: '2px solid #00FFFF',
      padding: '0.875rem 1.25rem',
      icon: '🌃',
    },
  },

  // Steampunk
  steampunk: {
    fontFamily: '"IM Fell English", "Times New Roman", serif',
    fontSize: {
      base: '1.125rem',
      title: '2.5rem',
      narrator: '1.05rem',
    },
    fontWeight: { normal: '400', bold: '600' },
    lineHeight: '1.8',
    letterSpacing: '0.02em',
    backgroundColor: '#2C1810',
    textColor: '#E8D5C4',
    accentColor: '#B8860B',
    borderColor: '#8B6914',
    shadowColor: 'rgba(184, 134, 11, 0.3)',
    backgroundPattern: 'repeating-linear-gradient(45deg, transparent, transparent 20px, rgba(184, 134, 11, 0.05) 20px, rgba(184, 134, 11, 0.05) 40px)',
    animations: {
      pageTransition: 'steamFade',
      textReveal: 'mechanicalType',
      choiceHover: 'gearTurn',
    },
    narratorStyle: {
      fontStyle: 'italic',
      color: '#DAA520',
      background: 'linear-gradient(to right, rgba(184, 134, 11, 0.15), transparent)',
      borderLeft: '4px solid #B8860B',
      padding: '1rem 1.5rem',
      icon: '⚙️',
    },
  },

  // Default for other genres
  default: {
    fontFamily: '"Inter", "Roboto", sans-serif',
    fontSize: {
      base: '1.0625rem',
      title: '2.25rem',
      narrator: '1rem',
    },
    fontWeight: { normal: '400', bold: '600' },
    lineHeight: '1.75',
    letterSpacing: '0.01em',
    backgroundColor: '#FFFFFF',
    textColor: '#1F2937',
    accentColor: '#3B82F6',
    borderColor: '#93C5FD',
    shadowColor: 'rgba(59, 130, 246, 0.2)',
    animations: {
      pageTransition: 'fadeIn',
      textReveal: 'fadeInUp',
      choiceHover: 'lift',
    },
    narratorStyle: {
      fontStyle: 'italic',
      color: '#4B5563',
      background: 'rgba(59, 130, 246, 0.05)',
      borderLeft: '3px solid #3B82F6',
      padding: '1rem 1.5rem',
      icon: '📝',
    },
  },
};

// Helper function to get style for a genre
export function getGenreStyle(genre: string): GenreStyle {
  const normalizedGenre = genre.toLowerCase().replace(/\s+/g, '-');
  return genreStyles[normalizedGenre] || genreStyles.default;
}

// CSS Animation keyframes
export const animationKeyframes = `
@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes wiggle {
  0%, 100% { transform: rotate(0deg); }
  25% { transform: rotate(-3deg); }
  75% { transform: rotate(3deg); }
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes lift {
  from { transform: translateY(0); box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
  to { transform: translateY(-4px); box-shadow: 0 10px 20px rgba(0,0,0,0.15); }
}

@keyframes mysticalReveal {
  from {
    opacity: 0;
    filter: blur(10px);
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    filter: blur(0);
    transform: scale(1);
  }
}

@keyframes glow {
  0%, 100% { box-shadow: 0 0 10px var(--glow-color, rgba(139, 92, 246, 0.5)); }
  50% { box-shadow: 0 0 20px var(--glow-color, rgba(139, 92, 246, 0.8)); }
}

@keyframes glitch {
  0% { transform: translate(0); }
  20% { transform: translate(-2px, 2px); }
  40% { transform: translate(-2px, -2px); }
  60% { transform: translate(2px, 2px); }
  80% { transform: translate(2px, -2px); }
  100% { transform: translate(0); }
}

@keyframes scanline {
  from {
    opacity: 0;
    clip-path: inset(0 0 100% 0);
  }
  to {
    opacity: 1;
    clip-path: inset(0 0 0 0);
  }
}

@keyframes cyberpulse {
  0%, 100% {
    box-shadow: 0 0 5px var(--accent-color), 0 0 10px var(--accent-color);
  }
  50% {
    box-shadow: 0 0 10px var(--accent-color), 0 0 20px var(--accent-color);
  }
}

@keyframes fadeShudder {
  0% { opacity: 0; transform: translateX(0); }
  10% { transform: translateX(-2px); }
  20% { transform: translateX(2px); }
  30% { transform: translateX(-2px); }
  40% { transform: translateX(2px); }
  50% { transform: translateX(0); }
  100% { opacity: 1; transform: translateX(0); }
}

@keyframes creepIn {
  from {
    opacity: 0;
    transform: translateY(10px);
    filter: blur(3px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
    filter: blur(0);
  }
}

@keyframes tremble {
  0%, 100% { transform: translate(0, 0); }
  10% { transform: translate(-1px, -1px); }
  20% { transform: translate(1px, 1px); }
  30% { transform: translate(-1px, 1px); }
  40% { transform: translate(1px, -1px); }
  50% { transform: translate(-1px, 0); }
  60% { transform: translate(1px, 0); }
  70% { transform: translate(0, -1px); }
  80% { transform: translate(0, 1px); }
  90% { transform: translate(0, 0); }
}

@keyframes typewriter {
  from { opacity: 0; width: 0; }
  to { opacity: 1; width: 100%; }
}

@keyframes underlineGrow {
  from { text-decoration-color: transparent; }
  to { text-decoration-color: currentColor; }
}

@keyframes heartbeat {
  0%, 100% { transform: scale(1); }
  10% { transform: scale(1.1); }
  20% { transform: scale(1); }
  30% { transform: scale(1.1); }
  40% { transform: scale(1); }
}

@keyframes softReveal {
  from {
    opacity: 0;
    transform: translateY(10px);
    filter: blur(5px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
    filter: blur(0);
  }
}

@keyframes neonFlicker {
  0%, 100% { opacity: 1; }
  10% { opacity: 0.8; }
  20% { opacity: 1; }
  30% { opacity: 0.9; }
  40% { opacity: 1; }
}

@keyframes neonPulse {
  0%, 100% {
    box-shadow: 0 0 5px var(--accent-color), 0 0 10px var(--accent-color), inset 0 0 5px var(--accent-color);
  }
  50% {
    box-shadow: 0 0 10px var(--accent-color), 0 0 20px var(--accent-color), inset 0 0 10px var(--accent-color);
  }
}

@keyframes gearTurn {
  from { transform: rotate(0deg); }
  to { transform: rotate(15deg); }
}
`;
