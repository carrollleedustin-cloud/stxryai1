'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, MessageSquare, Sparkles, Heart, Lightbulb, AlertTriangle } from 'lucide-react';

/**
 * AI COMPANION PANEL
 * Real-time AI companion that interacts with the reader
 */
interface AICompanionPanelProps {
  isVisible?: boolean;
  companionName?: string;
  personality?: 'wise' | 'playful' | 'mysterious' | 'encouraging';
  currentEmotion?: string;
  readingProgress?: number;
  onSendMessage?: (message: string) => void;
  onCompanionResponse?: (response: string) => void;
  theme?: 'void' | 'sepia' | 'light';
}

interface CompanionMessage {
  id: string;
  type: 'companion' | 'user' | 'system';
  content: string;
  timestamp: number;
  emotion?: string;
  actions?: string[];
}

export const AICompanionPanel: React.FC<AICompanionPanelProps> = ({
  isVisible = true,
  companionName = 'Aria',
  personality = 'wise',
  currentEmotion = 'neutral',
  readingProgress = 0,
  onSendMessage,
  onCompanionResponse,
  theme = 'void',
}) => {
  const [messages, setMessages] = useState<CompanionMessage[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [companionMood, setCompanionMood] = useState<
    'happy' | 'thoughtful' | 'concerned' | 'excited'
  >('thoughtful');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Personality configurations
  const personalities = {
    wise: {
      greeting: 'I am here to guide you through this narrative journey.',
      responses: {
        joy: [
          'How wonderful that this moment brings you joy!',
          "I'm glad you're enjoying this part.",
        ],
        fear: [
          'I sense your apprehension. Remember, every story has its challenges.',
          'Take heart, brave reader.',
        ],
        sadness: [
          'Some stories touch our hearts deeply. This too shall pass.',
          'Your emotions honor the depth of this tale.',
        ],
        surprise: ['Ah, the unexpected turns of fate!', 'What a delightful surprise!'],
        love: ['Love stories have the power to move us all.', 'Such tender moments...'],
      },
      suggestions: [
        'Consider how this moment reflects your own journey.',
        "What would you do in the protagonist's place?",
      ],
    },
    playful: {
      greeting: 'Hey there, story adventurer! Ready for some fun?',
      responses: {
        joy: ['Yay! I love seeing you smile while reading! 🎉', 'This part is awesome, right?'],
        fear: [
          "Ooh, spooky! Don't worry, I've got your back! 👻",
          "Boo! Just kidding, you're safe with me!",
        ],
        sadness: [
          "Aww, don't be sad! Want me to tell you a joke? 😊",
          'Cheer up! The story gets better!',
        ],
        surprise: ['Whoa! Plot twist! 🤯', "Didn't see that coming, did you?"],
        love: ['Aww, so romantic! 💕', 'Love is in the air! 🌹'],
      },
      suggestions: [
        'What if the story took a silly twist here?',
        'Imagine if the character did something funny!',
      ],
    },
    mysterious: {
      greeting: 'The shadows whisper secrets... Shall we uncover them together?',
      responses: {
        joy: [
          'The light of joy pierces even the darkest tales...',
          'Curious how happiness finds its way here.',
        ],
        fear: [
          'The darkness grows deeper... but so does your courage.',
          'Fear is but a shadow in the grand tapestry.',
        ],
        sadness: ['Tears water the seeds of wisdom...', 'In sorrow, we find the truest stories.'],
        surprise: [
          'The veil parts... revealing what was always there.',
          'Some secrets are meant to be discovered.',
        ],
        love: [
          'Love weaves through the fabric of reality...',
          'Even in shadows, love finds its light.',
        ],
      },
      suggestions: [
        'What hidden meanings lie beneath these words?',
        'The story conceals more than it reveals...',
      ],
    },
    encouraging: {
      greeting: "Every great reader started with a single page. You've got this!",
      responses: {
        joy: [
          "Keep that positive energy going! You're doing amazing! 🌟",
          'Your enthusiasm lights up the story!',
        ],
        fear: [
          "You're stronger than you know! You've faced tougher challenges! 💪",
          "Remember, you're the hero of your reading journey!",
        ],
        sadness: [
          "It's okay to feel deeply. Your empathy makes you a wonderful reader! 💝",
          "Strong readers feel deeply. You're doing great!",
        ],
        surprise: [
          'Wow! Your curiosity drives you forward! 🚀',
          'Every surprise is a chance to learn something new!',
        ],
        love: [
          'Your heart is so open to these stories! 📖❤️',
          'Love makes every story more beautiful!',
        ],
      },
      suggestions: [
        "You're making such great progress! Keep going!",
        'Every choice you make shows your wisdom!',
      ],
    },
  };

  const currentPersonality = personalities[personality];

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Generate contextual responses
  const generateResponse = (emotion: string, progress: number): string => {
    const responses =
      currentPersonality.responses[emotion as keyof typeof currentPersonality.responses] ||
      currentPersonality.responses.joy;

    let response = responses[Math.floor(Math.random() * responses.length)];

    // Add progress-based context
    if (progress > 80) {
      response +=
        personality === 'encouraging'
          ? " You're almost at the end - you've got this!"
          : personality === 'mysterious'
            ? ' The climax approaches...'
            : " The story's heart beats stronger as we near its end.";
    } else if (progress < 20) {
      response +=
        personality === 'playful'
          ? ' Just getting started - this is gonna be fun!'
          : ' The beginning holds so much promise...';
    }

    return response;
  };

  // Handle emotion changes
  useEffect(() => {
    if (currentEmotion !== 'neutral' && messages.length > 0) {
      setIsTyping(true);

      setTimeout(
        () => {
          const response = generateResponse(currentEmotion, readingProgress);
          const newMessage: CompanionMessage = {
            id: `companion-${Date.now()}`,
            type: 'companion',
            content: response,
            timestamp: Date.now(),
            emotion: currentEmotion,
          };

          setMessages((prev) => [...prev, newMessage]);
          setIsTyping(false);
          onCompanionResponse?.(response);
        },
        1000 + Math.random() * 2000
      ); // Random delay for natural feel
    }
  }, [currentEmotion, readingProgress]);

  // Update companion mood based on reading
  useEffect(() => {
    if (readingProgress > 90) {
      setCompanionMood('excited');
    } else if (currentEmotion === 'fear') {
      setCompanionMood('concerned');
    } else if (currentEmotion === 'joy') {
      setCompanionMood('happy');
    } else {
      setCompanionMood('thoughtful');
    }
  }, [readingProgress, currentEmotion]);

  // Send message
  const handleSendMessage = () => {
    if (!currentMessage.trim()) return;

    const userMessage: CompanionMessage = {
      id: `user-${Date.now()}`,
      type: 'user',
      content: currentMessage,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    onSendMessage?.(currentMessage);
    setCurrentMessage('');

    // Simulate companion thinking
    setIsTyping(true);
    setTimeout(
      () => {
        const responses = currentPersonality.suggestions;
        const response = responses[Math.floor(Math.random() * responses.length)];

        const companionMessage: CompanionMessage = {
          id: `companion-${Date.now()}`,
          type: 'companion',
          content: response,
          timestamp: Date.now(),
          actions: ['Tell me more', 'Ask a question', 'Share thoughts'],
        };

        setMessages((prev) => [...prev, companionMessage]);
        setIsTyping(false);
      },
      1500 + Math.random() * 1000
    );
  };

  // Theme colors
  const themeColors = {
    void: {
      bg: 'bg-void-elevated/95',
      border: 'border-membrane',
      text: 'text-text-primary',
      accent: 'text-spectral-cyan',
      companionBg: 'bg-spectral-cyan/10',
    },
    sepia: {
      bg: 'bg-amber-50/95',
      border: 'border-amber-200',
      text: 'text-amber-900',
      accent: 'text-amber-700',
      companionBg: 'bg-amber-100/50',
    },
    light: {
      bg: 'bg-white/95',
      border: 'border-gray-200',
      text: 'text-gray-900',
      accent: 'text-amber-800',
      companionBg: 'bg-amber-50/50',
    },
  };

  const colors = themeColors[theme];

  const getMoodIcon = () => {
    switch (companionMood) {
      case 'happy':
        return '😊';
      case 'concerned':
        return '🤔';
      case 'excited':
        return '🤩';
      default:
        return '🧠';
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, x: 300 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 300 }}
          transition={{ duration: 0.3 }}
          className={`fixed top-20 right-6 w-80 h-[600px] ${colors.bg} backdrop-blur-md rounded-2xl border ${colors.border} shadow-2xl z-50 flex flex-col`}
        >
          {/* Header */}
          <div className="p-4 border-b border-membrane/50">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-full ${colors.companionBg} flex items-center justify-center`}
              >
                <Bot className={`w-5 h-5 ${colors.accent}`} />
              </div>
              <div>
                <h3 className={`font-display text-sm ${colors.text}`}>{companionName}</h3>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-ghost-500 capitalize">{personality}</span>
                  <span className="text-lg">{getMoodIcon()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Welcome message */}
            {messages.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-3 rounded-xl ${colors.companionBg}`}
              >
                <p className={`text-sm ${colors.text}`}>{currentPersonality.greeting}</p>
              </motion.div>
            )}

            {/* Message list */}
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-xl ${
                    message.type === 'user'
                      ? 'bg-spectral-cyan/20 text-white'
                      : `${colors.companionBg} ${colors.text}`
                  }`}
                >
                  <p className="text-sm">{message.content}</p>

                  {/* Quick actions for companion messages */}
                  {message.actions && (
                    <div className="flex gap-2 mt-2">
                      {message.actions.map((action, index) => (
                        <button
                          key={index}
                          className="text-xs px-2 py-1 rounded bg-white/10 hover:bg-white/20 transition-colors"
                          onClick={() => setCurrentMessage(action)}
                        >
                          {action}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`flex justify-start`}
              >
                <div className={`p-3 rounded-xl ${colors.companionBg}`}>
                  <div className="flex gap-1">
                    <div
                      className="w-2 h-2 bg-current rounded-full animate-bounce"
                      style={{ animationDelay: '0ms' }}
                    />
                    <div
                      className="w-2 h-2 bg-current rounded-full animate-bounce"
                      style={{ animationDelay: '150ms' }}
                    />
                    <div
                      className="w-2 h-2 bg-current rounded-full animate-bounce"
                      style={{ animationDelay: '300ms' }}
                    />
                  </div>
                </div>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-membrane/50">
            <div className="flex gap-2">
              <input
                type="text"
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Ask me anything..."
                className={`flex-1 px-3 py-2 rounded-lg bg-void-mist/50 border border-membrane/50 text-sm ${colors.text} placeholder:text-ghost-500 focus:outline-none focus:border-spectral-cyan/50`}
              />
              <button
                onClick={handleSendMessage}
                disabled={!currentMessage.trim()}
                className="p-2 rounded-lg bg-spectral-cyan/20 hover:bg-spectral-cyan/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <MessageSquare className="w-4 h-4 text-spectral-cyan" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AICompanionPanel;
