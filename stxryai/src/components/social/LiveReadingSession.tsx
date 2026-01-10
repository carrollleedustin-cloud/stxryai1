'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from '@/components/ui/AppIcon';

interface Participant {
  id: string;
  name: string;
  avatar?: string;
  currentChapter: number;
  progress: number;
  isHost: boolean;
}

interface LiveReadingSessionProps {
  sessionId: string;
  storyId: string;
  storyTitle: string;
  onJoin?: () => void;
  onLeave?: () => void;
  onStart?: () => void;
  isHost?: boolean;
}

export function LiveReadingSession({
  sessionId,
  storyId,
  storyTitle,
  onJoin,
  onLeave,
  onStart,
  isHost = false,
}: LiveReadingSessionProps) {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [isActive, setIsActive] = useState(false);
  const [currentChapter, setCurrentChapter] = useState(1);
  const [chatMessages, setChatMessages] = useState<
    Array<{ user: string; message: string; time: string }>
  >([]);
  const [newMessage, setNewMessage] = useState('');

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    setChatMessages([
      ...chatMessages,
      { user: 'You', message: newMessage, time: new Date().toLocaleTimeString() },
    ]);
    setNewMessage('');
  };

  return (
    <div className="space-y-4">
      <div className="p-6 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl text-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-2xl font-bold mb-2 flex items-center gap-2">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-3 h-3 bg-white rounded-full"
              />
              Live Reading Session
            </h3>
            <p className="text-purple-100">{storyTitle}</p>
          </div>
          {isHost && !isActive && (
            <motion.button
              onClick={() => {
                setIsActive(true);
                onStart?.();
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-4 py-2 bg-white text-purple-600 rounded-lg font-medium"
            >
              Start Session
            </motion.button>
          )}
        </div>

        {/* Participants */}
        <div className="flex items-center gap-2 mb-4">
          <Icon name="UsersIcon" size={20} className="text-white" />
          <span className="font-medium">{participants.length} participants</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Reading Area */}
        <div className="lg:col-span-2 space-y-4">
          <div className="p-6 bg-card border border-border rounded-xl">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-bold text-foreground">Chapter {currentChapter}</h4>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Icon name="UsersIcon" size={16} />
                <span>{participants.length} reading together</span>
              </div>
            </div>
            {/* Story content would go here */}
            <div className="prose dark:prose-invert max-w-none">
              <p className="text-foreground">
                Story content will appear here during the live session...
              </p>
            </div>
          </div>

          {/* Progress Sync */}
          <div className="p-4 bg-muted rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-foreground">Synchronized Progress</span>
              <span className="text-xs text-muted-foreground">
                {participants.filter((p) => p.progress > 80).length} / {participants.length} caught
                up
              </span>
            </div>
            <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                initial={{ width: 0 }}
                animate={{
                  width: `${participants.reduce((acc, p) => acc + p.progress, 0) / participants.length || 0}%`,
                }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Participants List */}
          <div className="p-4 bg-card border border-border rounded-xl">
            <h4 className="font-bold text-foreground mb-3">Participants</h4>
            <div className="space-y-2">
              {participants.map((participant) => (
                <div
                  key={participant.id}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white text-sm font-bold">
                    {participant.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-foreground">
                        {participant.name}
                      </span>
                      {participant.isHost && (
                        <span className="px-2 py-0.5 bg-primary text-primary-foreground text-xs rounded-full">
                          Host
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Chapter {participant.currentChapter} • {participant.progress}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Live Chat */}
          <div className="p-4 bg-card border border-border rounded-xl flex flex-col h-96">
            <h4 className="font-bold text-foreground mb-3">Live Chat</h4>
            <div className="flex-1 overflow-y-auto space-y-2 mb-3">
              {chatMessages.map((msg, idx) => (
                <div key={idx} className="text-sm">
                  <span className="font-medium text-foreground">{msg.user}:</span>{' '}
                  <span className="text-muted-foreground">{msg.message}</span>
                  <span className="text-xs text-muted-foreground ml-2">{msg.time}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Type a message..."
                className="flex-1 px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              />
              <motion.button
                onClick={handleSendMessage}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg"
              >
                <Icon name="PaperAirplaneIcon" size={16} />
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
