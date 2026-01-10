'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import VoidBackground from '@/components/void/VoidBackground';
import { EtherealNav, TemporalHeading, ParticleField } from '@/components/void';
import { HolographicCard, GradientBorder } from '@/components/void/AdvancedEffects';
import SpectralButton from '@/components/void/SpectralButton';
import Icon from '@/components/ui/AppIcon';
import { messagingService, Conversation, Message } from '@/services/messagingService';

// Mock data for demonstration
const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: '1',
    conversationType: 'direct',
    participants: ['user1', 'user2'],
    lastMessagePreview: 'Hey! Did you finish reading The Midnight Carnival?',
    lastMessageAt: new Date(Date.now() - 5 * 60000).toISOString(),
    isArchived: false,
    isMuted: false,
    metadata: {
      otherUser: {
        username: 'darkstoryteller',
        displayName: 'Alexandra Chen',
        avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg',
        isOnline: true,
      },
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    conversationType: 'direct',
    participants: ['user1', 'user3'],
    lastMessagePreview: 'The ending of that story was incredible!',
    lastMessageAt: new Date(Date.now() - 30 * 60000).toISOString(),
    isArchived: false,
    isMuted: false,
    metadata: {
      otherUser: {
        username: 'scifiexplorer',
        displayName: 'Marcus Rodriguez',
        avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg',
        isOnline: false,
      },
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '3',
    conversationType: 'group',
    conversationName: 'Horror Book Club',
    participants: ['user1', 'user2', 'user3', 'user4'],
    lastMessagePreview: 'Meeting tomorrow at 8pm for the discussion!',
    lastMessageAt: new Date(Date.now() - 2 * 3600000).toISOString(),
    isArchived: false,
    isMuted: false,
    metadata: { memberCount: 12, groupAvatar: '👻' },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '4',
    conversationType: 'group',
    conversationName: 'Sci-Fi Writers Guild',
    participants: ['user1', 'user5', 'user6'],
    lastMessagePreview: 'Check out my new chapter draft!',
    lastMessageAt: new Date(Date.now() - 24 * 3600000).toISOString(),
    isArchived: false,
    isMuted: true,
    metadata: { memberCount: 8, groupAvatar: '🚀' },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const MOCK_MESSAGES: Record<string, Message[]> = {
  '1': [
    {
      id: 'm1',
      conversationId: '1',
      senderId: 'user2',
      content: 'Hey! Have you started reading The Midnight Carnival yet?',
      messageType: 'text',
      isEdited: false,
      isDeleted: false,
      readBy: ['user1'],
      readAt: [],
      metadata: {},
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'm2',
      conversationId: '1',
      senderId: 'user1',
      content: "Yes! I'm on chapter 5 and it's getting intense 😱",
      messageType: 'text',
      isEdited: false,
      isDeleted: false,
      readBy: ['user2'],
      readAt: [],
      metadata: {},
      createdAt: new Date(Date.now() - 3500000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'm3',
      conversationId: '1',
      senderId: 'user2',
      content: "Wait until you get to the twist in chapter 8! Don't want to spoil it but 🤯",
      messageType: 'text',
      isEdited: false,
      isDeleted: false,
      readBy: ['user1'],
      readAt: [],
      metadata: {},
      createdAt: new Date(Date.now() - 3400000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'm4',
      conversationId: '1',
      senderId: 'user1',
      content: "Now I'm scared and excited at the same time lol",
      messageType: 'text',
      isEdited: false,
      isDeleted: false,
      readBy: ['user2'],
      readAt: [],
      metadata: {},
      createdAt: new Date(Date.now() - 3300000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'm5',
      conversationId: '1',
      senderId: 'user2',
      content: 'Hey! Did you finish reading The Midnight Carnival?',
      messageType: 'text',
      isEdited: false,
      isDeleted: false,
      readBy: [],
      readAt: [],
      metadata: {},
      createdAt: new Date(Date.now() - 5 * 60000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],
  '2': [
    {
      id: 'm6',
      conversationId: '2',
      senderId: 'user3',
      content: 'Just finished Echoes of Tomorrow!',
      messageType: 'text',
      isEdited: false,
      isDeleted: false,
      readBy: ['user1'],
      readAt: [],
      metadata: {},
      createdAt: new Date(Date.now() - 7200000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'm7',
      conversationId: '2',
      senderId: 'user1',
      content: "How was it? I've been meaning to read that one",
      messageType: 'text',
      isEdited: false,
      isDeleted: false,
      readBy: ['user3'],
      readAt: [],
      metadata: {},
      createdAt: new Date(Date.now() - 7100000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'm8',
      conversationId: '2',
      senderId: 'user3',
      content: 'The ending of that story was incredible!',
      messageType: 'text',
      isEdited: false,
      isDeleted: false,
      readBy: [],
      readAt: [],
      metadata: {},
      createdAt: new Date(Date.now() - 30 * 60000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],
  '3': [
    {
      id: 'm9',
      conversationId: '3',
      senderId: 'user4',
      content: 'What story should we read next?',
      messageType: 'text',
      isEdited: false,
      isDeleted: false,
      readBy: ['user1', 'user2', 'user3'],
      readAt: [],
      metadata: {},
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'm10',
      conversationId: '3',
      senderId: 'user2',
      content: 'I vote for Whispers in the Dark!',
      messageType: 'text',
      isEdited: false,
      isDeleted: false,
      readBy: ['user1', 'user3', 'user4'],
      readAt: [],
      metadata: {},
      createdAt: new Date(Date.now() - 85000000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'm11',
      conversationId: '3',
      senderId: 'user1',
      content: 'Sounds good to me! When should we start?',
      messageType: 'text',
      isEdited: false,
      isDeleted: false,
      readBy: ['user2', 'user3', 'user4'],
      readAt: [],
      metadata: {},
      createdAt: new Date(Date.now() - 84000000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'm12',
      conversationId: '3',
      senderId: 'user3',
      content: 'Meeting tomorrow at 8pm for the discussion!',
      messageType: 'text',
      isEdited: false,
      isDeleted: false,
      readBy: [],
      readAt: [],
      metadata: {},
      createdAt: new Date(Date.now() - 2 * 3600000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],
};

const REACTION_EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '🔥'];

export default function MessagesPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [conversations, setConversations] = useState<Conversation[]>(MOCK_CONVERSATIONS);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/authentication?redirect=/messages');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (selectedConversation) {
      setMessages(MOCK_MESSAGES[selectedConversation.id] || []);
      scrollToBottom();
    }
  }, [selectedConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedConversation) return;

    const message: Message = {
      id: `m${Date.now()}`,
      conversationId: selectedConversation.id,
      senderId: 'user1', // Current user
      content: newMessage,
      messageType: 'text',
      isEdited: false,
      isDeleted: false,
      readBy: [],
      readAt: [],
      metadata: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setMessages([...messages, message]);
    setNewMessage('');
    inputRef.current?.focus();

    // Simulate other user typing response
    setTimeout(() => {
      setOtherUserTyping(true);
      setTimeout(() => {
        setOtherUserTyping(false);
      }, 2000);
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const filteredConversations = conversations.filter((conv) => {
    if (!searchQuery) return true;
    const name =
      conv.conversationType === 'group'
        ? conv.conversationName
        : conv.metadata?.otherUser?.displayName;
    return name?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="w-16 h-16 border-4 border-t-4 border-spectral-cyan border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-text-primary relative overflow-hidden">
      <VoidBackground variant="subtle" />
      <ParticleField particleCount={30} color="rgba(0, 245, 212, 0.15)" maxSize={1.5} />
      <EtherealNav />

      <main className="relative z-10 pt-20 h-screen flex flex-col">
        <div className="flex-1 flex overflow-hidden max-w-8xl mx-auto w-full px-4">
          {/* Conversations Sidebar */}
          <motion.div
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className={`
              w-full md:w-96 flex-shrink-0 flex flex-col
              ${selectedConversation && !isMobileMenuOpen ? 'hidden md:flex' : 'flex'}
            `}
          >
            <GradientBorder className="flex-1 flex flex-col rounded-xl m-2 overflow-hidden">
              <div className="bg-void-100/30 backdrop-blur-md flex-1 flex flex-col">
                {/* Header */}
                <div className="p-4 border-b border-void-border">
                  <div className="flex items-center justify-between mb-4">
                    <h1 className="text-2xl font-bold text-aurora flex items-center">
                      <Icon
                        name="MessageCircleIcon"
                        className="mr-3 text-spectral-cyan"
                        size={24}
                      />
                      Messages
                    </h1>
                    <SpectralButton
                      onClick={() => setShowNewChatModal(true)}
                      variant="primary"
                      className="px-3 py-2"
                    >
                      <Icon name="PlusIcon" size={18} />
                    </SpectralButton>
                  </div>

                  {/* Search */}
                  <div className="relative">
                    <Icon
                      name="SearchIcon"
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary"
                      size={18}
                    />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search conversations..."
                      className="w-full pl-10 pr-4 py-2 bg-void-100/50 border border-void-border rounded-lg text-text-primary placeholder-text-secondary focus:outline-none focus:border-spectral-cyan"
                    />
                  </div>
                </div>

                {/* Conversation List */}
                <div className="flex-1 overflow-y-auto">
                  <AnimatePresence>
                    {filteredConversations.map((conv, index) => {
                      const isGroup = conv.conversationType === 'group';
                      const name = isGroup
                        ? conv.conversationName
                        : conv.metadata?.otherUser?.displayName;
                      const avatar = isGroup
                        ? conv.metadata?.groupAvatar
                        : conv.metadata?.otherUser?.avatar;
                      const isOnline = !isGroup && conv.metadata?.otherUser?.isOnline;

                      return (
                        <motion.div
                          key={conv.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          onClick={() => {
                            setSelectedConversation(conv);
                            setIsMobileMenuOpen(false);
                          }}
                          className={`
                            p-4 cursor-pointer transition-all border-b border-void-border/50
                            hover:bg-void-100/30
                            ${selectedConversation?.id === conv.id ? 'bg-spectral-cyan/10 border-l-2 border-l-spectral-cyan' : ''}
                          `}
                        >
                          <div className="flex items-center gap-3">
                            {/* Avatar */}
                            <div className="relative">
                              {isGroup ? (
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-2xl">
                                  {avatar}
                                </div>
                              ) : (
                                <img
                                  src={avatar}
                                  alt={name}
                                  className="w-12 h-12 rounded-full object-cover border-2 border-void-border"
                                />
                              )}
                              {isOnline && (
                                <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-void-900" />
                              )}
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <h3 className="font-medium text-text-primary truncate">{name}</h3>
                                <span className="text-xs text-text-secondary">
                                  {formatTime(conv.lastMessageAt || '')}
                                </span>
                              </div>
                              <p className="text-sm text-text-secondary truncate mt-1">
                                {conv.lastMessagePreview}
                              </p>
                              {isGroup && (
                                <div className="flex items-center gap-1 mt-1">
                                  <Icon
                                    name="UsersIcon"
                                    className="text-text-secondary"
                                    size={12}
                                  />
                                  <span className="text-xs text-text-secondary">
                                    {conv.metadata?.memberCount} members
                                  </span>
                                </div>
                              )}
                            </div>

                            {/* Status Indicators */}
                            {conv.isMuted && (
                              <Icon name="BellOffIcon" className="text-text-secondary" size={16} />
                            )}
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>

                  {filteredConversations.length === 0 && (
                    <div className="p-8 text-center">
                      <div className="text-4xl mb-3">💬</div>
                      <p className="text-text-secondary">No conversations found</p>
                    </div>
                  )}
                </div>
              </div>
            </GradientBorder>
          </motion.div>

          {/* Chat Area */}
          <motion.div
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className={`
              flex-1 flex flex-col
              ${!selectedConversation && !isMobileMenuOpen ? 'hidden md:flex' : 'flex'}
            `}
          >
            {selectedConversation ? (
              <GradientBorder className="flex-1 flex flex-col rounded-xl m-2 overflow-hidden">
                <div className="bg-void-100/30 backdrop-blur-md flex-1 flex flex-col">
                  {/* Chat Header */}
                  <div className="p-4 border-b border-void-border flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => {
                          setSelectedConversation(null);
                          setIsMobileMenuOpen(true);
                        }}
                        className="md:hidden p-2 hover:bg-void-100/50 rounded-lg"
                      >
                        <Icon name="ArrowLeftIcon" size={20} />
                      </button>

                      {selectedConversation.conversationType === 'group' ? (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-xl">
                          {selectedConversation.metadata?.groupAvatar}
                        </div>
                      ) : (
                        <div className="relative">
                          <img
                            src={selectedConversation.metadata?.otherUser?.avatar}
                            alt=""
                            className="w-10 h-10 rounded-full object-cover"
                          />
                          {selectedConversation.metadata?.otherUser?.isOnline && (
                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-void-900" />
                          )}
                        </div>
                      )}

                      <div>
                        <h2 className="font-semibold text-aurora">
                          {selectedConversation.conversationType === 'group'
                            ? selectedConversation.conversationName
                            : selectedConversation.metadata?.otherUser?.displayName}
                        </h2>
                        <p className="text-xs text-text-secondary">
                          {selectedConversation.conversationType === 'group'
                            ? `${selectedConversation.metadata?.memberCount} members`
                            : selectedConversation.metadata?.otherUser?.isOnline
                              ? 'Online'
                              : 'Offline'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button className="p-2 hover:bg-void-100/50 rounded-lg transition-colors">
                        <Icon name="PhoneIcon" className="text-text-secondary" size={20} />
                      </button>
                      <button className="p-2 hover:bg-void-100/50 rounded-lg transition-colors">
                        <Icon name="VideoIcon" className="text-text-secondary" size={20} />
                      </button>
                      <button className="p-2 hover:bg-void-100/50 rounded-lg transition-colors">
                        <Icon name="MoreVerticalIcon" className="text-text-secondary" size={20} />
                      </button>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map((message, index) => {
                      const isOwn = message.senderId === 'user1';
                      const showAvatar =
                        !isOwn &&
                        (index === 0 || messages[index - 1]?.senderId !== message.senderId);

                      return (
                        <motion.div
                          key={message.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`flex items-end gap-2 max-w-[70%] ${isOwn ? 'flex-row-reverse' : ''}`}
                          >
                            {!isOwn &&
                              showAvatar &&
                              selectedConversation.conversationType === 'group' && (
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex-shrink-0" />
                              )}

                            <div
                              className={`
                                relative group px-4 py-2 rounded-2xl
                                ${
                                  isOwn
                                    ? 'bg-gradient-to-r from-spectral-cyan to-purple-500 text-void-900'
                                    : 'bg-void-100/50 text-text-primary border border-void-border'
                                }
                              `}
                            >
                              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                              <p
                                className={`text-xs mt-1 ${isOwn ? 'text-void-900/70' : 'text-text-secondary'}`}
                              >
                                {formatTime(message.createdAt)}
                              </p>

                              {/* Reaction Button */}
                              <button
                                onClick={() =>
                                  setShowEmojiPicker(
                                    showEmojiPicker === message.id ? null : message.id
                                  )
                                }
                                className={`
                                  absolute -bottom-2 ${isOwn ? 'left-2' : 'right-2'}
                                  opacity-0 group-hover:opacity-100 transition-opacity
                                  p-1 bg-void-100/80 rounded-full border border-void-border
                                `}
                              >
                                <Icon name="SmileIcon" size={14} className="text-text-secondary" />
                              </button>

                              {/* Emoji Picker */}
                              <AnimatePresence>
                                {showEmojiPicker === message.id && (
                                  <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    className={`
                                      absolute -bottom-12 ${isOwn ? 'left-0' : 'right-0'}
                                      flex gap-1 p-2 bg-void-100/90 backdrop-blur-md rounded-full border border-void-border
                                    `}
                                  >
                                    {REACTION_EMOJIS.map((emoji) => (
                                      <button
                                        key={emoji}
                                        onClick={() => setShowEmojiPicker(null)}
                                        className="hover:scale-125 transition-transform"
                                      >
                                        {emoji}
                                      </button>
                                    ))}
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}

                    {/* Typing Indicator */}
                    {otherUserTyping && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex items-center gap-2"
                      >
                        <div className="px-4 py-2 bg-void-100/50 rounded-2xl border border-void-border">
                          <div className="flex gap-1">
                            <motion.div
                              animate={{ y: [0, -5, 0] }}
                              transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                              className="w-2 h-2 bg-spectral-cyan rounded-full"
                            />
                            <motion.div
                              animate={{ y: [0, -5, 0] }}
                              transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                              className="w-2 h-2 bg-spectral-cyan rounded-full"
                            />
                            <motion.div
                              animate={{ y: [0, -5, 0] }}
                              transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                              className="w-2 h-2 bg-spectral-cyan rounded-full"
                            />
                          </div>
                        </div>
                      </motion.div>
                    )}

                    <div ref={messagesEndRef} />
                  </div>

                  {/* Message Input */}
                  <div className="p-4 border-t border-void-border">
                    <div className="flex items-center gap-3">
                      <button className="p-2 hover:bg-void-100/50 rounded-lg transition-colors">
                        <Icon name="PlusCircleIcon" className="text-spectral-cyan" size={24} />
                      </button>

                      <div className="flex-1 relative">
                        <input
                          ref={inputRef}
                          type="text"
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          onKeyPress={handleKeyPress}
                          placeholder="Type a message..."
                          className="w-full px-4 py-3 bg-void-100/50 border border-void-border rounded-xl text-text-primary placeholder-text-secondary focus:outline-none focus:border-spectral-cyan"
                        />
                        <button className="absolute right-3 top-1/2 -translate-y-1/2">
                          <Icon
                            name="SmileIcon"
                            className="text-text-secondary hover:text-spectral-cyan transition-colors"
                            size={20}
                          />
                        </button>
                      </div>

                      <SpectralButton
                        onClick={handleSendMessage}
                        disabled={!newMessage.trim()}
                        variant="primary"
                        className="p-3"
                      >
                        <Icon name="SendIcon" size={20} />
                      </SpectralButton>
                    </div>
                  </div>
                </div>
              </GradientBorder>
            ) : (
              /* Empty State */
              <div className="flex-1 flex items-center justify-center m-2">
                <HolographicCard className="p-12 text-center max-w-md">
                  <div className="text-6xl mb-4">💬</div>
                  <h2 className="text-2xl font-bold text-aurora mb-2">Select a Conversation</h2>
                  <p className="text-text-secondary mb-6">
                    Choose a conversation from the sidebar or start a new chat with someone
                  </p>
                  <SpectralButton onClick={() => setShowNewChatModal(true)} variant="primary">
                    <Icon name="PlusIcon" className="mr-2" size={18} />
                    Start New Chat
                  </SpectralButton>
                </HolographicCard>
              </div>
            )}
          </motion.div>
        </div>
      </main>

      {/* New Chat Modal */}
      <AnimatePresence>
        {showNewChatModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-void-900/80 backdrop-blur-sm"
            onClick={() => setShowNewChatModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md"
            >
              <GradientBorder className="p-1 rounded-2xl">
                <div className="bg-void-100/90 backdrop-blur-xl rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-aurora">New Conversation</h2>
                    <button
                      onClick={() => setShowNewChatModal(false)}
                      className="p-2 hover:bg-void-100/50 rounded-lg"
                    >
                      <Icon name="XIcon" size={20} />
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm text-text-secondary mb-2">Search Users</label>
                      <div className="relative">
                        <Icon
                          name="SearchIcon"
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary"
                          size={18}
                        />
                        <input
                          type="text"
                          placeholder="Search by username..."
                          className="w-full pl-10 pr-4 py-3 bg-void-100/50 border border-void-border rounded-lg text-text-primary placeholder-text-secondary focus:outline-none focus:border-spectral-cyan"
                        />
                      </div>
                    </div>

                    <div className="pt-4">
                      <p className="text-sm text-text-secondary mb-3">Suggested</p>
                      <div className="space-y-2">
                        {['Alexandra Chen', 'Marcus Rodriguez', 'Emily Watson'].map((name, i) => (
                          <button
                            key={name}
                            className="w-full flex items-center gap-3 p-3 bg-void-100/30 hover:bg-void-100/50 rounded-lg transition-colors"
                          >
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-spectral-cyan to-purple-500" />
                            <div className="flex-1 text-left">
                              <p className="font-medium text-text-primary">{name}</p>
                              <p className="text-xs text-text-secondary">
                                @{name.toLowerCase().replace(' ', '')}
                              </p>
                            </div>
                            <Icon
                              name="MessageCircleIcon"
                              className="text-spectral-cyan"
                              size={18}
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="pt-4 border-t border-void-border">
                      <SpectralButton variant="secondary" className="w-full py-3">
                        <Icon name="UsersIcon" className="mr-2" size={18} />
                        Create Group Chat
                      </SpectralButton>
                    </div>
                  </div>
                </div>
              </GradientBorder>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
