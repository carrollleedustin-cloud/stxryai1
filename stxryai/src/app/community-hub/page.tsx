'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { communityService, ReadingClub, DiscussionForum, CommunityEvent, UserContent } from '../../services/communityService';
import Header from '../../components/common/Header';

interface TabType {
  id: string;
  label: string;
}

export default function CommunityHubPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('clubs');
  const [clubs, setClubs] = useState<ReadingClub[]>([]);
  const [forums, setForums] = useState<DiscussionForum[]>([]);
  const [events, setEvents] = useState<CommunityEvent[]>([]);
  const [userContent, setUserContent] = useState<UserContent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  const tabs: TabType[] = [
    { id: 'clubs', label: 'Reading Clubs' },
    { id: 'forums', label: 'Discussion Forums' },
    { id: 'events', label: 'Community Events' },
    { id: 'content', label: 'User Content' }
  ];

  useEffect(() => {
    loadCommunityData();
  }, [activeTab]);

  const loadCommunityData = async (): Promise<void> => {
    try {
      setLoading(true);
      setError('');

      if (activeTab === 'clubs') {
        const { data, error } = await communityService.getActiveClubs();
        if (error) throw error;
        setClubs(data || []);
      } else if (activeTab === 'forums') {
        const { data, error } = await communityService.getForumsByCategory('general');
        if (error) throw error;
        setForums(data || []);
      } else if (activeTab === 'events') {
        const { data, error } = await communityService.getUpcomingEvents();
        if (error) throw error;
        setEvents(data || []);
      } else if (activeTab === 'content') {
        const { data, error } = await communityService.getUserContent();
        if (error) throw error;
        setUserContent(data || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load community data');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinClub = async (clubId: string): Promise<void> => {
    if (!user) {
      setError('Please sign in to join clubs');
      return;
    }

    try {
      const { error } = await communityService.joinClub(clubId, user.id);
      if (error) throw error;
      
      // Reload clubs after joining
      loadCommunityData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to join club');
    }
  };

  const handleRSVP = async (eventId: string): Promise<void> => {
    if (!user) {
      setError('Please sign in to RSVP to events');
      return;
    }

    try {
      const { error } = await communityService.rsvpToEvent(eventId, user.id);
      if (error) throw error;
      
      // Reload events after RSVP
      loadCommunityData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to RSVP to event');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Community Hub</h1>
          <p className="text-gray-600">Connect with fellow readers, join discussions, and participate in community events</p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Tabs Navigation */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="flex space-x-8" aria-label="Tabs">
            {tabs?.map((tab) => (
              <button
                key={tab?.id}
                onClick={() => setActiveTab(tab?.id || '')}
                className={`
                  py-4 px-1 border-b-2 font-medium text-sm transition-colors
                  ${activeTab === tab?.id
                    ? 'border-purple-500 text-purple-600' :'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                {tab?.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          </div>
        )}

        {/* Content based on active tab */}
        {!loading && (
          <>
            {/* Reading Clubs Tab */}
            {activeTab === 'clubs' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {clubs?.length === 0 ? (
                  <div className="col-span-full text-center py-12 text-gray-500">
                    No active reading clubs found
                  </div>
                ) : (
                  clubs?.map((club) => (
                    <div key={club?.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                      <div className="h-48 bg-gradient-to-br from-purple-500 to-pink-500"></div>
                      <div className="p-6">
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">{club?.name}</h3>
                        <p className="text-gray-600 mb-4 line-clamp-2">{club?.description || 'No description available'}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-500">{club?.memberCount || 0} members</span>
                          <button
                            onClick={() => handleJoinClub(club?.id || '')}
                            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                          >
                            Join Club
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Discussion Forums Tab */}
            {activeTab === 'forums' && (
              <div className="space-y-4">
                {forums?.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    No discussion forums found
                  </div>
                ) : (
                  forums?.map((forum) => (
                    <div key={forum?.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">{forum?.title}</h3>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span className="flex items-center">
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                              </svg>
                              {forum?.replyCount || 0} replies
                            </span>
                            <span className="flex items-center">
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                              {forum?.viewCount || 0} views
                            </span>
                          </div>
                        </div>
                        <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
                          {forum?.category}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Community Events Tab */}
            {activeTab === 'events' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {events?.length === 0 ? (
                  <div className="col-span-full text-center py-12 text-gray-500">
                    No upcoming events found
                  </div>
                ) : (
                  events?.map((event) => (
                    <div key={event?.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                      <div className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">{event?.title}</h3>
                            <p className="text-gray-600 mb-3">{event?.description}</p>
                          </div>
                          <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium ml-4">
                            {event?.eventType}
                          </span>
                        </div>
                        <div className="space-y-2 mb-4">
                          <div className="flex items-center text-sm text-gray-600">
                            <svg className="w-5 h-5 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            {new Date(event?.startTime || '').toLocaleDateString()}
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <svg className="w-5 h-5 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            {event?.participantCount || 0} / {event?.maxParticipants || 'Unlimited'} participants
                          </div>
                        </div>
                        <button
                          onClick={() => handleRSVP(event?.id || '')}
                          className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                        >
                          RSVP to Event
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* User Content Tab */}
            {activeTab === 'content' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {userContent?.length === 0 ? (
                  <div className="col-span-full text-center py-12 text-gray-500">
                    No user content found
                  </div>
                ) : (
                  userContent?.map((content) => (
                    <div key={content?.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                      <div className="h-48 bg-gradient-to-br from-blue-500 to-purple-500"></div>
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-2">
                          <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs font-medium">
                            {content?.contentType}
                          </span>
                          <div className="flex items-center text-sm text-gray-500">
                            <svg className="w-4 h-4 mr-1 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            {content?.voteCount || 0}
                          </div>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{content?.title}</h3>
                        <p className="text-gray-600 text-sm line-clamp-2">{content?.description || 'No description available'}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}