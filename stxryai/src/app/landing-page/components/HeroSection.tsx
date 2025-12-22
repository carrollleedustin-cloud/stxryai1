'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, BookOpen, ChevronRight, Sparkles, LogIn } from 'lucide-react';

interface HeroSectionProps {
  onStartReading: () => void;
  onSignIn?: () => void;
}

const HeroSection = ({ onStartReading, onSignIn }: HeroSectionProps) => {
  const [isHydrated, setIsHydrated] = useState(false);
  const [currentChoice, setCurrentChoice] = useState(0);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const choices = [
    'Enter the abandoned mansion...',
    'Follow the mysterious stranger...',
    'Investigate the strange noise...',
    'Open the ancient book...',
  ];

  const ANIMATION_INTERVAL = 3000;

  useEffect(() => {
    if (!isHydrated) return;

    const interval = setInterval(() => {
      setCurrentChoice((prev) => (prev + 1) % choices.length);
    }, ANIMATION_INTERVAL);

    return () => clearInterval(interval);
  }, [isHydrated, choices.length]);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-background via-card to-background">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/30 rounded-full blur-3xl animate-pulse" />
        <div
          className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/20 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: '1s' }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/30 mb-8">
            <Sparkles aria-hidden="true" size={20} className="text-accent" />
            <span className="text-sm font-medium text-accent">AI-Powered Interactive Fiction</span>
          </div>

          <h1 className="font-heading text-5xl sm:text-6xl lg:text-7xl font-bold text-foreground mb-6">
            Your Choices Shape
            <span className="block mt-2 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              Infinite Stories
            </span>
          </h1>

          <p className="text-xl sm:text-2xl text-muted-foreground max-w-3xl mx-auto mb-12">
            Experience AI-generated interactive fiction where every decision creates a unique
            narrative path. Join thousands of readers exploring limitless story possibilities.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <button
              onClick={onStartReading}
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-primary to-secondary text-primary-foreground rounded-lg font-semibold text-lg shadow-elevation-2 hover:shadow-elevation-1 transition-smooth flex items-center justify-center space-x-2"
            >
              <span>Get Started Free</span>
              <ArrowRight aria-hidden="true" size={20} />
            </button>
            {onSignIn && (
              <button
                onClick={onSignIn}
                className="w-full sm:w-auto px-8 py-4 bg-card border-2 border-primary text-foreground rounded-lg font-semibold text-lg hover:bg-primary/10 transition-smooth flex items-center justify-center space-x-2"
              >
                <LogIn aria-hidden="true" size={20} />
                <span>Sign In</span>
              </button>
            )}
            <Link
              href="/story-library"
              className="w-full sm:w-auto px-8 py-4 bg-card border-2 border-border text-foreground rounded-lg font-semibold text-lg hover:bg-muted/50 transition-smooth flex items-center justify-center space-x-2"
            >
              <BookOpen aria-hidden="true" size={20} />
              <span>Explore Stories</span>
            </Link>
          </div>

          {isHydrated && (
            <div className="max-w-2xl mx-auto">
              <div className="glassmorphism rounded-xl p-8 border border-border shadow-elevation-2">
                <p className="text-sm text-muted-foreground mb-4">Live Story Preview</p>
                <p className="text-xl text-foreground mb-6">
                  "The door creaks open, revealing a dimly lit corridor. Shadows dance on the walls
                  as you step inside..."
                </p>
                <div className="space-y-3">
                  {choices.map((choice, index) => (
                    <button
                      key={index}
                      className={`w-full px-6 py-4 rounded-lg text-left transition-smooth ${
                        index === currentChoice
                          ? 'bg-gradient-to-r from-primary/30 to-secondary/30 border-2 border-primary text-foreground font-semibold'
                          : 'bg-muted/30 border border-border text-muted-foreground hover:bg-muted/50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{choice}</span>
                        {index === currentChoice && (
                          <ChevronRight aria-hidden="true" size={20} className="text-primary" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
