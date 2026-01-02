'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams } from 'next/navigation';
import VoidBackground from '@/components/void/VoidBackground';
import { EtherealNav, TemporalHeading, StaggerContainer, StaggerItem } from '@/components/void';
import { HolographicCard, RevealOnScroll, GradientBorder } from '@/components/void/AdvancedEffects';
import SpectralButton from '@/components/void/SpectralButton';
import { worldExplorerService, WorldSummary, LoreEntry } from '@/services/worldExplorerService';
import Icon from '@/components/ui/AppIcon';
import { toast } from 'sonner';

export default function WorldHubPage() {
  const { seriesId } = useParams() as { seriesId: string };
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<WorldSummary | null>(null);
  const [worldData, setWorldData] = useState<any>(null);
  const [loreEntries, setLoreEntries] = useState<LoreEntry[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'lore' | 'map' | 'ripples'>('overview');

  useEffect(() => {
    async function fetchData() {
      try {
        const [data, sum] = await Promise.all([
          worldExplorerService.getWorldData(seriesId),
          worldExplorerService.generateWorldSummary(seriesId).catch(() => null)
        ]);
        setWorldData(data);
        setSummary(sum);
      } catch (error) {
        console.error('Error fetching world data:', error);
        toast.error('Failed to load world data');
      } finally {
        setLoading(false);
      }
    }

    if (seriesId) fetchData();
  }, [seriesId]);

  const handleGenerateLore = async () => {
    const topic = prompt('What aspect of the world would you like to explore? (e.g., "The Forgotten Gods", "Ancient Technology")');
    if (!topic) return;

    setIsGenerating(true);
    try {
      const entry = await worldExplorerService.generateLoreEntry(seriesId, topic);
      setLoreEntries([entry, ...loreEntries]);
      setActiveTab('lore');
      toast.success(`Discovered lore: ${entry.title}`);
    } catch (error) {
      toast.error('The archives are currently inaccessible.');
    } finally {
      setIsGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-void-absolute flex items-center justify-center">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-2 border-t-spectral-cyan rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-void-absolute text-text-primary overflow-x-hidden">
      <VoidBackground />
      <EtherealNav />

      <main className="relative z-10 max-w-7xl mx-auto px-6 pt-32 pb-20">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div>
            <TemporalHeading level={1} className="text-5xl md:text-7xl mb-2">
              World Hub
            </TemporalHeading>
            <p className="text-text-ghost font-ui tracking-widest uppercase text-sm">
              The Living Archives of {seriesId}
            </p>
          </div>

          <SpectralButton 
            variant="primary" 
            onClick={handleGenerateLore}
            disabled={isGenerating}
          >
            {isGenerating ? 'Consulting Archivist...' : 'Discover Lore'}
          </SpectralButton>
        </div>

        <div className="flex gap-4 mb-12 border-b border-membrane pb-4 overflow-x-auto">
          {['overview', 'lore', 'map', 'ripples'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-6 py-2 rounded-full font-ui text-sm transition-all ${
                activeTab === tab 
                  ? 'bg-spectral-cyan/20 text-spectral-cyan border border-spectral-cyan/50' 
                  : 'text-text-ghost hover:text-text-primary'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-8"
            >
              <div className="lg:col-span-2 space-y-8">
                <HolographicCard>
                  <h3 className="text-2xl font-display mb-4">World Overview</h3>
                  <p className="text-text-muted leading-relaxed">
                    {summary?.overview || "The chronicles of this world are still being written. Continue your narrative to expand the archive."}
                  </p>
                </HolographicCard>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {summary?.majorFactions.map((faction, i) => (
                    <RevealOnScroll key={i} delay={i * 0.1}>
                      <GradientBorder>
                        <div className="p-6 bg-void-surface/50">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="text-xl font-display text-spectral-cyan">{faction.name}</h4>
                            <span className="text-xs font-ui text-text-ghost bg-white/5 px-2 py-1 rounded">
                              Power: {faction.influence}/10
                            </span>
                          </div>
                          <p className="text-sm text-text-muted">{faction.description}</p>
                        </div>
                      </GradientBorder>
                    </RevealOnScroll>
                  ))}
                </div>
              </div>

              <div className="space-y-6">
                <HolographicCard className="bg-void-surface/30">
                  <h3 className="text-xl font-display mb-4 flex items-center gap-2">
                    <Icon name="activity" className="text-spectral-pink" />
                    Atmosphere
                  </h3>
                  <div className="p-4 rounded-lg bg-spectral-pink/5 border border-spectral-pink/20">
                    <p className="text-spectral-pink italic font-serif text-lg">
                      "{summary?.thematicAtmosphere || 'Mysterious and Unfolding'}"
                    </p>
                  </div>
                </HolographicCard>

                <div className="p-6 rounded-2xl bg-void-surface/50 border border-membrane">
                  <h3 className="text-lg font-display mb-4">Key Conflicts</h3>
                  <div className="space-y-4">
                    {summary?.keyConflicts.map((conflict, i) => (
                      <div key={i} className="flex gap-4">
                        <div className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${
                          conflict.status === 'active' ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]' : 
                          conflict.status === 'looming' ? 'bg-yellow-500' : 'bg-green-500'
                        }`} />
                        <div>
                          <p className="font-ui text-sm font-bold">{conflict.title}</p>
                          <p className="text-xs text-text-ghost">{conflict.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'lore' && (
            <motion.div
              key="lore"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {loreEntries.length === 0 && (
                <div className="col-span-full py-20 text-center">
                  <Icon name="book-open" className="w-12 h-12 mx-auto mb-4 text-text-ghost opacity-20" />
                  <p className="text-text-ghost italic">The scrolls are currently empty. Discover new lore to populate the archive.</p>
                </div>
              )}
              {loreEntries.map((entry) => (
                <HolographicCard key={entry.id} className="h-full flex flex-col">
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-[10px] font-ui uppercase tracking-widest text-spectral-cyan bg-spectral-cyan/10 px-2 py-0.5 rounded border border-spectral-cyan/20">
                      {entry.category}
                    </span>
                  </div>
                  <h4 className="text-xl font-display mb-3">{entry.title}</h4>
                  <p className="text-sm text-text-muted leading-relaxed line-clamp-6 mb-4">
                    {entry.content}
                  </p>
                  <div className="mt-auto flex flex-wrap gap-2">
                    {entry.relatedElements.map((rel, i) => (
                      <span key={i} className="text-[10px] text-text-ghost italic">#{rel}</span>
                    ))}
                  </div>
                </HolographicCard>
              ))}
            </motion.div>
          )}

          {activeTab === 'ripples' && (
            <motion.div
              key="ripples"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="max-w-3xl mx-auto">
                <h3 className="text-2xl font-display mb-8 text-center">Active World Ripples</h3>
                {worldData?.ripples.length === 0 ? (
                  <p className="text-center text-text-ghost italic">No major choices have rippled through the world yet.</p>
                ) : (
                  <div className="space-y-4">
                    {worldData?.ripples.map((ripple: any, i: number) => (
                      <div key={i} className="p-6 rounded-2xl bg-void-surface/50 border border-membrane relative overflow-hidden group">
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-spectral-pink" />
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-display text-lg mb-1">{ripple.title || 'Narrative Consequence'}</h4>
                            <p className="text-text-muted">{ripple.description}</p>
                          </div>
                          <div className="text-xs font-ui text-text-ghost bg-white/5 px-3 py-1 rounded-full">
                            Persistent
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'map' && (
            <motion.div
              key="map"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              {worldData?.locations.map((loc: any, i: number) => (
                <HolographicCard key={i}>
                  <h4 className="text-lg font-display mb-2">{loc.name}</h4>
                  <p className="text-xs text-spectral-cyan mb-3 font-ui uppercase tracking-tighter">
                    {loc.type || 'Location'} • {loc.region || 'Unknown Realm'}
                  </p>
                  <p className="text-sm text-text-muted">{loc.description || 'A place of whispers and shadows.'}</p>
                </HolographicCard>
              ))}
              {worldData?.locations.length === 0 && (
                <div className="col-span-full py-20 text-center text-text-ghost italic">
                  No locations have been mapped in this series yet.
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
