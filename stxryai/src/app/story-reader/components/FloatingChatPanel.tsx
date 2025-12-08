'use client';

import { useState, useEffect, useRef } from 'react';
import Icon from '@/components/ui/AppIcon';
import AppImage from '@/components/ui/AppImage';

interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  message: string;
  timestamp: Date;
  hasSpoiler: boolean;
  sceneNumber?: number;
}

interface FloatingChatPanelProps {
  storyId: string;
  currentScene: number;
  isPremium: boolean;
}

const FloatingChatPanel = ({ storyId, currentScene, isPremium }: FloatingChatPanelProps) => {
  const [isHydrated, setIsHydrated] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [showSpoilers, setShowSpoilers] = useState(false);
  const [activeTab, setActiveTab] = useState<'scene' | 'global'>('scene');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsHydrated(true);

    const mockMessages: ChatMessage[] = [
    {
      id: '1',
      userId: 'user1',
      userName: 'Sarah Chen',
      userAvatar: "https://images.unsplash.com/photo-1696498781171-77adec5261fe",
      message: 'This choice completely changed the story direction!',
      timestamp: new Date(Date.now() - 300000),
      hasSpoiler: false,
      sceneNumber: currentScene
    },
    {
      id: '2',
      userId: 'user2',
      userName: 'Marcus Johnson',
      message: 'Warning: Major plot twist ahead if you choose the left path',
      timestamp: new Date(Date.now() - 180000),
      hasSpoiler: true,
      sceneNumber: currentScene
    },
    {
      id: '3',
      userId: 'user3',
      userName: 'Elena Rodriguez',
      userAvatar: "https://img.rocket.new/generatedImages/rocket_gen_img_15d4e023e-1764852457551.png",
      message: 'The writing in this scene is absolutely incredible',
      timestamp: new Date(Date.now() - 60000),
      hasSpoiler: false,
      sceneNumber: currentScene
    }];


    setMessages(mockMessages);
  }, [currentScene]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const message: ChatMessage = {
      id: `msg-${Date.now()}`,
      userId: 'current-user',
      userName: 'You',
      message: newMessage,
      timestamp: new Date(),
      hasSpoiler: false,
      sceneNumber: currentScene
    };

    setMessages([...messages, message]);
    setNewMessage('');
  };

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  if (!isHydrated) {
    return null;
  }

  return (
    <>
      {!isOpen &&
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 right-6 z-[250] w-14 h-14 bg-primary rounded-full shadow-elevation-2 flex items-center justify-center hover:scale-110 transition-smooth border-2 border-primary/30">

          <Icon name="ChatBubbleLeftRightIcon" size={24} className="text-primary-foreground" />
          <span className="absolute -top-1 -right-1 w-6 h-6 bg-error rounded-full flex items-center justify-center text-xs font-bold text-error-foreground">
            {messages.length}
          </span>
        </button>
      }

      {isOpen &&
      <div className="fixed bottom-24 right-6 z-[250] w-96 max-w-[calc(100vw-3rem)] h-[500px] bg-card/95 backdrop-blur-glass border border-border rounded-lg shadow-elevation-2 flex flex-col overflow-hidden">
          <div className="p-4 border-b border-border bg-gradient-to-r from-primary/10 to-secondary/10">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Icon name="ChatBubbleLeftRightIcon" size={20} className="text-primary" />
                <h3 className="text-sm font-semibold text-foreground">Story Chat</h3>
              </div>
              <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded hover:bg-muted/50 transition-smooth">

                <Icon name="XMarkIcon" size={20} className="text-muted-foreground" />
              </button>
            </div>

            <div className="flex space-x-2">
              <button
              onClick={() => setActiveTab('scene')}
              className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-smooth ${
              activeTab === 'scene' ? 'bg-primary text-primary-foreground' : 'bg-muted/30 text-muted-foreground hover:bg-muted/50'}`
              }>

                Scene {currentScene}
              </button>
              <button
              onClick={() => setActiveTab('global')}
              className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-smooth ${
              activeTab === 'global' ? 'bg-primary text-primary-foreground' : 'bg-muted/30 text-muted-foreground hover:bg-muted/50'}`
              }>

                Global
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.
          filter((msg) => activeTab === 'global' || msg.sceneNumber === currentScene).
          map((msg) =>
          <div key={msg.id} className="flex space-x-3">
                  <div className="flex-shrink-0">
                    {msg.userAvatar ?
              <AppImage
                src={msg.userAvatar}
                alt={`${msg.userName} profile picture`}
                className="w-8 h-8 rounded-full object-cover" /> :


              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                        <span className="text-xs font-semibold text-primary-foreground">
                          {msg.userName.charAt(0)}
                        </span>
                      </div>
              }
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-xs font-medium text-foreground">{msg.userName}</span>
                      <span className="text-xs text-muted-foreground">
                        {formatTimestamp(msg.timestamp)}
                      </span>
                    </div>

                    {msg.hasSpoiler && !showSpoilers ?
              <div className="px-3 py-2 bg-warning/10 border border-warning/30 rounded-lg">
                        <div className="flex items-center space-x-2 text-warning text-xs">
                          <Icon name="EyeSlashIcon" size={14} />
                          <span>Spoiler hidden</span>
                        </div>
                      </div> :

              <p className="text-sm text-foreground/90 break-words">{msg.message}</p>
              }
                  </div>
                </div>
          )}
            <div ref={messagesEndRef} />
          </div>

          {messages.some((m) => m.hasSpoiler) &&
        <div className="px-4 py-2 border-t border-border bg-muted/30">
              <button
            onClick={() => setShowSpoilers(!showSpoilers)}
            className="flex items-center space-x-2 text-xs font-medium text-warning hover:text-accent transition-smooth">

                <Icon name={showSpoilers ? 'EyeSlashIcon' : 'EyeIcon'} size={14} />
                <span>{showSpoilers ? 'Hide spoilers' : 'Show spoilers'}</span>
              </button>
            </div>
        }

          <div className="p-4 border-t border-border">
            <div className="flex space-x-2">
              <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Share your thoughts..."
              className="flex-1 px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary" />

              <button
              onClick={handleSendMessage}
              disabled={!newMessage.trim()}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-smooth disabled:opacity-50 disabled:cursor-not-allowed">

                <Icon name="PaperAirplaneIcon" size={18} />
              </button>
            </div>
          </div>
        </div>
      }
    </>);

};

export default FloatingChatPanel;