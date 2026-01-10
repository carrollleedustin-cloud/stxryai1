'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from '@/components/ui/AppIcon';
import { PremiumGate } from './PremiumGate';

interface StoryExportProps {
  storyId: string;
  storyTitle: string;
  storyContent: string;
  onExport?: (format: string) => void;
}

export function StoryExport({ storyId, storyTitle, storyContent, onExport }: StoryExportProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState<string | null>(null);

  const formats = [
    { id: 'pdf', label: 'PDF', icon: '📄', description: 'Standard PDF document' },
    { id: 'epub', label: 'EPUB', icon: '📱', description: 'eBook format' },
    { id: 'html', label: 'HTML', icon: '🌐', description: 'Web page format' },
    { id: 'markdown', label: 'Markdown', icon: '📝', description: 'Markdown format' },
    { id: 'json', label: 'JSON', icon: '💾', description: 'Structured data' },
    { id: 'txt', label: 'Plain Text', icon: '📃', description: 'Simple text file' },
  ];

  const handleExport = async (format: string) => {
    setIsExporting(true);
    setSelectedFormat(format);

    try {
      // TODO: Replace with actual export service
      // await exportService.exportStory(storyId, format);

      // Simulate export
      await new Promise((resolve) => setTimeout(resolve, 2000));

      onExport?.(format);
      setIsOpen(false);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
      setSelectedFormat(null);
    }
  };

  return (
    <PremiumGate
      feature="story_export"
      fallback={
        <motion.button
          disabled
          className="px-4 py-2 bg-gray-600 text-white rounded-lg font-medium flex items-center gap-2 opacity-50 cursor-not-allowed"
        >
          <Icon name="ArrowDownTrayIcon" size={20} />
          Export Story (Premium)
        </motion.button>
      }
    >
      <motion.button
        onClick={() => setIsOpen(true)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium flex items-center gap-2"
      >
        <Icon name="ArrowDownTrayIcon" size={20} />
        Export Story
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-card border border-border rounded-xl shadow-2xl z-50 overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-foreground flex items-center gap-2">
                    <Icon name="ArrowDownTrayIcon" size={24} />
                    Export Story
                  </h3>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 hover:bg-muted rounded-lg transition-colors"
                  >
                    <Icon name="XMarkIcon" size={20} />
                  </button>
                </div>

                <div className="mb-4 p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Exporting</p>
                  <p className="font-semibold text-foreground">{storyTitle}</p>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-6">
                  {formats.map((format) => (
                    <motion.button
                      key={format.id}
                      onClick={() => handleExport(format.id)}
                      disabled={isExporting}
                      whileHover={!isExporting ? { scale: 1.02 } : {}}
                      whileTap={!isExporting ? { scale: 0.98 } : {}}
                      className={`p-4 rounded-lg border-2 text-left transition-all ${
                        selectedFormat === format.id
                          ? 'border-primary bg-primary/10'
                          : 'border-border hover:border-primary/50'
                      } ${isExporting ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <div className="text-3xl mb-2">{format.icon}</div>
                      <div className="font-medium text-foreground mb-1">{format.label}</div>
                      <div className="text-xs text-muted-foreground">{format.description}</div>
                      {selectedFormat === format.id && isExporting && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="mt-2 flex items-center gap-2 text-sm text-primary"
                        >
                          <motion.div
                            className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                          />
                          Exporting...
                        </motion.div>
                      )}
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </PremiumGate>
  );
}
