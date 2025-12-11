'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

interface ExportOptions {
  format: 'pdf' | 'epub' | 'txt' | 'json';
  includeChoices: boolean;
  includeMetadata: boolean;
  includeComments: boolean;
}

interface StoryExportShareProps {
  storyId: string;
  storyTitle: string;
  onExport?: (options: ExportOptions) => void;
  onShare?: (platform: string) => void;
}

export default function StoryExportShare({
  storyId,
  storyTitle,
  onExport,
  onShare,
}: StoryExportShareProps) {
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'export' | 'share' | 'embed'>('share');
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: 'pdf',
    includeChoices: true,
    includeMetadata: true,
    includeComments: false,
  });

  const shareUrl = `https://stxryai.com/story/${storyId}`;
  const embedCode = `<iframe src="${shareUrl}/embed" width="100%" height="600" frameborder="0"></iframe>`;

  const handleExport = () => {
    onExport?.(exportOptions);
    setShowModal(false);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    // Show toast notification
  };

  const handleCopyEmbed = () => {
    navigator.clipboard.writeText(embedCode);
    // Show toast notification
  };

  return (
    <>
      {/* Trigger Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setShowModal(true)}
        className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all"
      >
        <div className="flex items-center gap-2">
          <span>📤</span>
          <span>Export & Share</span>
        </div>
      </motion.button>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowModal(false)}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gray-900 rounded-2xl p-6 border border-white/10 shadow-2xl max-w-2xl w-full"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-white">Export & Share</h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-white text-2xl"
                >
                  ✕
                </button>
              </div>

              {/* Tabs */}
              <div className="flex gap-2 mb-6 border-b border-white/10">
                {['share', 'export', 'embed'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab as any)}
                    className={`px-6 py-3 font-medium transition-all border-b-2 ${
                      activeTab === tab
                        ? 'text-white border-purple-600'
                        : 'text-gray-400 border-transparent hover:text-white'
                    }`}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              {activeTab === 'share' && (
                <ShareTab storyTitle={storyTitle} shareUrl={shareUrl} onShare={onShare} onCopyLink={handleCopyLink} />
              )}
              {activeTab === 'export' && (
                <ExportTab options={exportOptions} setOptions={setExportOptions} onExport={handleExport} />
              )}
              {activeTab === 'embed' && (
                <EmbedTab embedCode={embedCode} onCopyEmbed={handleCopyEmbed} />
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// Share Tab
function ShareTab({
  storyTitle,
  shareUrl,
  onShare,
  onCopyLink,
}: {
  storyTitle: string;
  shareUrl: string;
  onShare?: (platform: string) => void;
  onCopyLink: () => void;
}) {
  const platforms = [
    { name: 'Twitter', icon: '🐦', color: 'from-blue-400 to-blue-600', url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(storyTitle)}&url=${encodeURIComponent(shareUrl)}` },
    { name: 'Facebook', icon: '📘', color: 'from-blue-600 to-blue-800', url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}` },
    { name: 'Reddit', icon: '🤖', color: 'from-orange-600 to-red-600', url: `https://reddit.com/submit?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(storyTitle)}` },
    { name: 'LinkedIn', icon: '💼', color: 'from-blue-700 to-blue-900', url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}` },
    { name: 'WhatsApp', icon: '💬', color: 'from-green-500 to-green-700', url: `https://wa.me/?text=${encodeURIComponent(storyTitle + ' ' + shareUrl)}` },
    { name: 'Email', icon: '📧', color: 'from-gray-600 to-gray-800', url: `mailto:?subject=${encodeURIComponent(storyTitle)}&body=${encodeURIComponent(shareUrl)}` },
  ];

  return (
    <div className="space-y-6">
      {/* Social Platforms */}
      <div>
        <label className="text-sm font-medium text-gray-300 mb-3 block">Share on Social Media</label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {platforms.map((platform) => (
            <motion.a
              key={platform.name}
              href={platform.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => onShare?.(platform.name)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`flex items-center justify-center gap-2 p-4 bg-gradient-to-r ${platform.color} text-white rounded-lg font-medium transition-all shadow-lg hover:shadow-xl`}
            >
              <span className="text-2xl">{platform.icon}</span>
              <span>{platform.name}</span>
            </motion.a>
          ))}
        </div>
      </div>

      {/* Copy Link */}
      <div>
        <label className="text-sm font-medium text-gray-300 mb-2 block">Copy Link</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={shareUrl}
            readOnly
            className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white"
          />
          <button
            onClick={onCopyLink}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium"
          >
            Copy
          </button>
        </div>
      </div>
    </div>
  );
}

// Export Tab
function ExportTab({
  options,
  setOptions,
  onExport,
}: {
  options: ExportOptions;
  setOptions: (options: ExportOptions) => void;
  onExport: () => void;
}) {
  const formats = [
    { id: 'pdf', name: 'PDF', icon: '📄', description: 'Portable Document Format' },
    { id: 'epub', name: 'EPUB', icon: '📖', description: 'E-book format for readers' },
    { id: 'txt', name: 'TXT', icon: '📝', description: 'Plain text file' },
    { id: 'json', name: 'JSON', icon: '💾', description: 'Developer-friendly format' },
  ];

  return (
    <div className="space-y-6">
      {/* Format Selection */}
      <div>
        <label className="text-sm font-medium text-gray-300 mb-3 block">Select Format</label>
        <div className="grid grid-cols-2 gap-3">
          {formats.map((format) => (
            <button
              key={format.id}
              onClick={() => setOptions({ ...options, format: format.id as any })}
              className={`p-4 rounded-lg border-2 transition-all text-left ${
                options.format === format.id
                  ? 'bg-purple-600/20 border-purple-600'
                  : 'bg-white/5 border-white/10 hover:border-white/20'
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">{format.icon}</span>
                <span className="font-bold text-white">{format.name}</span>
              </div>
              <p className="text-xs text-gray-400">{format.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Export Options */}
      <div>
        <label className="text-sm font-medium text-gray-300 mb-3 block">Include in Export</label>
        <div className="space-y-3">
          <label className="flex items-center gap-3 p-3 bg-white/5 rounded-lg cursor-pointer hover:bg-white/10">
            <input
              type="checkbox"
              checked={options.includeChoices}
              onChange={(e) => setOptions({ ...options, includeChoices: e.target.checked })}
              className="w-5 h-5 accent-purple-600"
            />
            <div>
              <div className="font-medium text-white">Choice Tree</div>
              <div className="text-xs text-gray-400">Include all story branches and choices</div>
            </div>
          </label>

          <label className="flex items-center gap-3 p-3 bg-white/5 rounded-lg cursor-pointer hover:bg-white/10">
            <input
              type="checkbox"
              checked={options.includeMetadata}
              onChange={(e) => setOptions({ ...options, includeMetadata: e.target.checked })}
              className="w-5 h-5 accent-purple-600"
            />
            <div>
              <div className="font-medium text-white">Metadata</div>
              <div className="text-xs text-gray-400">Author, date, tags, and story info</div>
            </div>
          </label>

          <label className="flex items-center gap-3 p-3 bg-white/5 rounded-lg cursor-pointer hover:bg-white/10">
            <input
              type="checkbox"
              checked={options.includeComments}
              onChange={(e) => setOptions({ ...options, includeComments: e.target.checked })}
              className="w-5 h-5 accent-purple-600"
            />
            <div>
              <div className="font-medium text-white">Comments</div>
              <div className="text-xs text-gray-400">Reader comments and discussions</div>
            </div>
          </label>
        </div>
      </div>

      {/* Export Button */}
      <button
        onClick={onExport}
        className="w-full px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg"
      >
        <div className="flex items-center justify-center gap-2">
          <span>⬇️</span>
          <span>Export as {options.format.toUpperCase()}</span>
        </div>
      </button>
    </div>
  );
}

// Embed Tab
function EmbedTab({ embedCode, onCopyEmbed }: { embedCode: string; onCopyEmbed: () => void }) {
  return (
    <div className="space-y-6">
      <div>
        <label className="text-sm font-medium text-gray-300 mb-2 block">Embed Code</label>
        <p className="text-gray-400 text-sm mb-4">
          Copy this code to embed the story on your website or blog
        </p>
        <div className="relative">
          <textarea
            value={embedCode}
            readOnly
            rows={4}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white font-mono text-sm resize-none"
          />
          <button
            onClick={onCopyEmbed}
            className="absolute top-2 right-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm font-medium"
          >
            Copy
          </button>
        </div>
      </div>

      {/* Preview */}
      <div>
        <label className="text-sm font-medium text-gray-300 mb-2 block">Preview</label>
        <div className="bg-white/5 rounded-lg p-4 border border-white/10">
          <div className="aspect-video bg-gradient-to-br from-purple-900 to-indigo-900 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <div className="text-6xl mb-4">📖</div>
              <p className="text-white font-semibold">Story Embed Preview</p>
              <p className="text-gray-400 text-sm">Interactive story will appear here</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
