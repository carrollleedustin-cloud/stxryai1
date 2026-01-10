'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import {
  messagingService,
  type Conversation,
  type Message,
  type TypingIndicator,
} from '@/services/messagingService';
import { useAuth } from '@/contexts/AuthContext';
import Icon from '@/components/ui/AppIcon';
import { toast } from 'react-hot-toast';

interface MessagingInterfaceProps {
  className?: string;
}

export function MessagingInterface({ className = '' }: MessagingInterfaceProps) {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [typingIndicators, setTypingIndicators] = useState<TypingIndicator[]>([]);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (!user) return;
    loadConversations();
  }, [user]);

  useEffect(() => {
    if (selectedConversation) {
      loadMessages();
      loadTypingIndicators();
      const interval = setInterval(() => {
        loadTypingIndicators();
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [selectedConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadConversations = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const data = await messagingService.getUserConversations(user.id);
      setConversations(data);
    } catch (error) {
      console.error('Failed to load conversations:', error);
      toast.error('Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async () => {
    if (!selectedConversation || !user) return;

    try {
      const data = await messagingService.getConversationMessages(selectedConversation.id);
      setMessages(data);

      // Mark as read
      if (data.length > 0) {
        await messagingService.markMessagesRead(
          selectedConversation.id,
          user.id,
          data[data.length - 1].id
        );
      }
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  };

  const loadTypingIndicators = async () => {
    if (!selectedConversation) return;

    try {
      const data = await messagingService.getTypingIndicators(selectedConversation.id);
      setTypingIndicators(data.filter((t) => t.userId !== user?.id));
    } catch (error) {
      // Silently fail for typing indicators
    }
  };

  const handleSendMessage = async () => {
    if (!user || !selectedConversation || !newMessage.trim()) return;

    try {
      // Stop typing indicator
      if (isTyping) {
        await messagingService.setTyping(selectedConversation.id, user.id, false);
        setIsTyping(false);
      }

      await messagingService.sendMessage(selectedConversation.id, user.id, {
        content: newMessage,
        messageType: 'text',
      });

      setNewMessage('');
      loadMessages();
      loadConversations(); // Update last message
    } catch (error: any) {
      console.error('Failed to send message:', error);
      toast.error(error.message || 'Failed to send message');
    }
  };

  const handleTyping = async (value: string) => {
    if (!user || !selectedConversation) return;

    setNewMessage(value);

    if (value.trim() && !isTyping) {
      setIsTyping(true);
      await messagingService.setTyping(selectedConversation.id, user.id, true);
    } else if (!value.trim() && isTyping) {
      setIsTyping(false);
      await messagingService.setTyping(selectedConversation.id, user.id, false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  if (!user) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <p className="text-muted-foreground">Please log in to use messaging</p>
      </div>
    );
  }

  return (
    <div
      className={`flex h-[600px] bg-card border-2 border-border rounded-xl overflow-hidden ${className}`}
    >
      {/* Conversations List */}
      <div className="w-80 border-r border-border flex flex-col">
        <div className="p-4 border-b border-border">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Icon name="ChatBubbleLeftRightIcon" size={24} />
            Messages
          </h2>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-4 space-y-2">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-16 bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse"
                />
              ))}
            </div>
          ) : conversations.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              <p>No conversations yet</p>
            </div>
          ) : (
            conversations.map((conversation) => (
              <motion.button
                key={conversation.id}
                onClick={() => setSelectedConversation(conversation)}
                className={`w-full p-4 text-left border-b border-border hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${
                  selectedConversation?.id === conversation.id ? 'bg-gray-100 dark:bg-gray-800' : ''
                }`}
                whileHover={{ x: 2 }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                    {conversation.conversationType === 'direct'
                      ? conversation.participants.find((p) => p !== user.id)?.[0]?.toUpperCase() ||
                        'U'
                      : conversation.conversationName?.[0]?.toUpperCase() || 'G'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-foreground truncate">
                      {conversation.conversationType === 'direct'
                        ? 'User' // Would show actual username
                        : conversation.conversationName}
                    </div>
                    <div className="text-sm text-muted-foreground truncate">
                      {conversation.lastMessagePreview || 'No messages yet'}
                    </div>
                  </div>
                  {conversation.lastMessageAt && (
                    <div className="text-xs text-muted-foreground">
                      {new Date(conversation.lastMessageAt).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </motion.button>
            ))
          )}
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Messages Header */}
            <div className="p-4 border-b border-border">
              <h3 className="font-bold text-foreground">
                {selectedConversation.conversationType === 'direct'
                  ? 'Direct Message'
                  : selectedConversation.conversationName}
              </h3>
            </div>

            {/* Messages List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <MessageItem
                  key={message.id}
                  message={message}
                  isOwn={message.senderId === user.id}
                />
              ))}

              {/* Typing Indicators */}
              <AnimatePresence>
                {typingIndicators.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-2 text-muted-foreground text-sm"
                  >
                    <span>Someone is typing</span>
                    <div className="flex gap-1">
                      {[0, 1, 2].map((i) => (
                        <motion.div
                          key={i}
                          className="w-2 h-2 bg-muted-foreground rounded-full"
                          animate={{ y: [0, -4, 0] }}
                          transition={{
                            duration: 0.6,
                            repeat: Infinity,
                            delay: i * 0.2,
                          }}
                        />
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-border">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => handleTyping(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-2 border border-border rounded-lg bg-background text-foreground"
                />
                <motion.button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Icon name="PaperAirplaneIcon" size={20} />
                </motion.button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <Icon name="ChatBubbleLeftRightIcon" size={48} className="mx-auto mb-4 opacity-50" />
              <p>Select a conversation to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

interface MessageItemProps {
  message: Message;
  isOwn: boolean;
}

function MessageItem({ message, isOwn }: MessageItemProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
    >
      <div
        className={`max-w-[70%] rounded-lg p-3 ${
          isOwn
            ? 'bg-primary text-primary-foreground'
            : 'bg-gray-100 dark:bg-gray-800 text-foreground'
        }`}
      >
        {message.replyToId && message.replyPreview && (
          <div className="text-xs opacity-75 mb-1 border-l-2 pl-2">{message.replyPreview}</div>
        )}
        <p className="whitespace-pre-wrap">{message.content}</p>
        <div className="flex items-center gap-2 mt-1 text-xs opacity-75">
          <span>{new Date(message.createdAt).toLocaleTimeString()}</span>
          {message.isEdited && <span>(edited)</span>}
          {isOwn && message.readBy.length > 0 && <Icon name="CheckIcon" size={12} />}
        </div>
      </div>
    </motion.div>
  );
}
