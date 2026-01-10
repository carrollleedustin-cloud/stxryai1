'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Icon from '@/components/ui/AppIcon';
import { draftService, type StoryDraft } from '@/services/draftService';
import { collaborationService, type StoryCollaborator } from '@/services/collaborationService';
import { templateService, type WritingTemplate } from '@/services/templateService';
import { marketingService, type MarketingCampaign } from '@/services/marketingService';
import { toast } from 'react-hot-toast';

interface CreatorToolsDashboardProps {
  className?: string;
}

export function CreatorToolsDashboard({ className = '' }: CreatorToolsDashboardProps) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<
    'drafts' | 'collaboration' | 'templates' | 'marketing'
  >('drafts');
  const [drafts, setDrafts] = useState<StoryDraft[]>([]);
  const [collaborations, setCollaborations] = useState<StoryCollaborator[]>([]);
  const [templates, setTemplates] = useState<WritingTemplate[]>([]);
  const [campaigns, setCampaigns] = useState<MarketingCampaign[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    loadData();
  }, [user, activeTab]);

  const loadData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      switch (activeTab) {
        case 'drafts':
          const draftsData = await draftService.getStoryDrafts(user.id);
          setDrafts(draftsData);
          break;
        case 'collaboration':
          const invitations = await collaborationService.getUserInvitations(user.id);
          setCollaborations(invitations);
          break;
        case 'templates':
          const templatesData = await templateService.getUserTemplates(user.id);
          setTemplates(templatesData);
          break;
        case 'marketing':
          const campaignsData = await marketingService.getCreatorCampaigns(user.id);
          setCampaigns(campaignsData);
          break;
      }
    } catch (error) {
      console.error('Failed to load data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-gray-200 dark:bg-gray-800 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Icon name="WrenchScrewdriverIcon" size={28} />
          Creator Tools
        </h2>
        <p className="text-muted-foreground">
          Enhanced editing, collaboration, and marketing tools
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border">
        {(['drafts', 'collaboration', 'templates', 'marketing'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 font-medium capitalize transition-colors ${
              activeTab === tab
                ? 'text-primary border-b-2 border-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Drafts Tab */}
      {activeTab === 'drafts' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-foreground">Story Drafts</h3>
            <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium">
              New Draft
            </button>
          </div>
          {drafts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No drafts yet</p>
            </div>
          ) : (
            drafts.map((draft, index) => (
              <motion.div
                key={draft.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-card border-2 border-border rounded-xl p-6"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="text-lg font-bold text-foreground mb-2">{draft.title}</h4>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>v{draft.versionNumber}</span>
                      <span>{draft.wordCount.toLocaleString()} words</span>
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          draft.draftStatus === 'ready'
                            ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                            : draft.draftStatus === 'review'
                              ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
                              : 'bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200'
                        }`}
                      >
                        {draft.draftStatus}
                      </span>
                    </div>
                  </div>
                  <div className="text-right text-sm text-muted-foreground">
                    {new Date(draft.lastEditedAt).toLocaleDateString()}
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      )}

      {/* Collaboration Tab */}
      {activeTab === 'collaboration' && (
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-foreground">Collaboration Invitations</h3>
          {collaborations.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No pending invitations</p>
            </div>
          ) : (
            collaborations.map((collab, index) => (
              <motion.div
                key={collab.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-card border-2 border-border rounded-xl p-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-foreground">Story Collaboration</h4>
                    <p className="text-sm text-muted-foreground">Role: {collab.role}</p>
                  </div>
                  <div className="flex gap-2">
                    <button className="px-4 py-2 bg-green-500 text-white rounded-lg">Accept</button>
                    <button className="px-4 py-2 bg-gray-200 dark:bg-gray-800 text-foreground rounded-lg">
                      Decline
                    </button>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      )}

      {/* Templates Tab */}
      {activeTab === 'templates' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-foreground">Writing Templates</h3>
            <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium">
              Create Template
            </button>
          </div>
          {templates.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No templates yet</p>
            </div>
          ) : (
            templates.map((template, index) => (
              <motion.div
                key={template.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-card border-2 border-border rounded-xl p-6"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-lg font-bold text-foreground mb-2">{template.name}</h4>
                    <p className="text-sm text-muted-foreground mb-2">{template.description}</p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>Used {template.usageCount} times</span>
                      {template.isPublic && (
                        <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-xs">
                          Public
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      )}

      {/* Marketing Tab */}
      {activeTab === 'marketing' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-foreground">Marketing Campaigns</h3>
            <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium">
              New Campaign
            </button>
          </div>
          {campaigns.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No campaigns yet</p>
            </div>
          ) : (
            campaigns.map((campaign, index) => (
              <motion.div
                key={campaign.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-card border-2 border-border rounded-xl p-6"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-lg font-bold text-foreground mb-2">
                      {campaign.campaignName}
                    </h4>
                    <p className="text-sm text-muted-foreground mb-2">{campaign.description}</p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="capitalize">{campaign.campaignType}</span>
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          campaign.campaignStatus === 'active'
                            ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                            : campaign.campaignStatus === 'scheduled'
                              ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
                              : 'bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200'
                        }`}
                      >
                        {campaign.campaignStatus}
                      </span>
                    </div>
                  </div>
                  <div className="text-right text-sm text-muted-foreground">
                    Reach: {campaign.reachCount.toLocaleString()}
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
