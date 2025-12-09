'use client';

/**
 * Import Story Component
 * Import stories from various formats (text, markdown, JSON, etc.)
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { importStory } from '@/lib/story/duplication';

interface ImportStoryProps {
  onImport: (storyData: any) => void;
  onCancel: () => void;
}

type ImportMethod = 'paste' | 'file' | 'url';

export default function ImportStory({ onImport, onCancel }: ImportStoryProps) {
  const [method, setMethod] = useState<ImportMethod>('paste');
  const [content, setContent] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [url, setUrl] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  const handlePasteImport = async () => {
    setError('');
    setIsProcessing(true);

    try {
      // Try to parse as JSON first (exported story)
      try {
        const story = importStory(content);
        onImport(story);
        return;
      } catch {
        // Not JSON, parse as plain text
        const parsedStory = parseTextToStory(content);
        onImport(parsedStory);
      }
    } catch (err) {
      setError('Failed to parse content. Please check the format.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileImport = async () => {
    if (!file) return;

    setError('');
    setIsProcessing(true);

    try {
      const text = await file.text();

      // Handle different file types
      if (file.name.endsWith('.json')) {
        const story = importStory(text);
        onImport(story);
      } else if (file.name.endsWith('.md') || file.name.endsWith('.markdown')) {
        const story = parseMarkdownToStory(text);
        onImport(story);
      } else {
        const story = parseTextToStory(text);
        onImport(story);
      }
    } catch (err) {
      setError(`Failed to import ${file.name}. Please check the file format.`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUrlImport = async () => {
    if (!url) return;

    setError('');
    setIsProcessing(true);

    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch URL');

      const text = await response.text();

      // Try JSON first, then fallback to text parsing
      try {
        const story = importStory(text);
        onImport(story);
      } catch {
        const story = parseTextToStory(text);
        onImport(story);
      }
    } catch (err) {
      setError('Failed to fetch content from URL. Please check the URL and try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-background rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-8"
      >
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2">📥 Import Story</h2>
          <p className="text-muted-foreground">
            Import stories from text, markdown, JSON, or external sources
          </p>
        </div>

        {/* Method Selection */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setMethod('paste')}
            className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${
              method === 'paste'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted hover:bg-muted/70'
            }`}
          >
            📋 Paste Text
          </button>
          <button
            onClick={() => setMethod('file')}
            className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${
              method === 'file'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted hover:bg-muted/70'
            }`}
          >
            📁 Upload File
          </button>
          <button
            onClick={() => setMethod('url')}
            className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${
              method === 'url'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted hover:bg-muted/70'
            }`}
          >
            🔗 From URL
          </button>
        </div>

        {/* Content Area */}
        <div className="mb-6">
          {method === 'paste' && (
            <div>
              <label className="block text-sm font-medium mb-2">
                Paste your story content
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Paste your story here... (Supports plain text, markdown, or exported JSON)"
                rows={12}
                className="w-full px-4 py-3 rounded-lg border-2 border-border bg-background focus:outline-none focus:border-primary resize-none font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground mt-2">
                💡 Tip: For best results, use # for chapter titles and separate paragraphs with blank lines
              </p>
            </div>
          )}

          {method === 'file' && (
            <div>
              <label className="block text-sm font-medium mb-2">
                Upload a file
              </label>
              <div
                className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer"
                onClick={() => document.getElementById('file-input')?.click()}
              >
                {file ? (
                  <div>
                    <div className="text-4xl mb-2">📄</div>
                    <div className="font-medium">{file.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {(file.size / 1024).toFixed(2)} KB
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setFile(null);
                      }}
                      className="text-sm text-primary hover:underline mt-2"
                    >
                      Remove file
                    </button>
                  </div>
                ) : (
                  <div>
                    <div className="text-4xl mb-2">📁</div>
                    <div className="font-medium mb-1">Click to upload or drag and drop</div>
                    <div className="text-sm text-muted-foreground">
                      Supports: .txt, .md, .json (max 5MB)
                    </div>
                  </div>
                )}
              </div>
              <input
                id="file-input"
                type="file"
                accept=".txt,.md,.markdown,.json"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="hidden"
              />
            </div>
          )}

          {method === 'url' && (
            <div>
              <label className="block text-sm font-medium mb-2">
                Enter URL
              </label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com/story.txt"
                className="w-full px-4 py-3 rounded-lg border-2 border-border bg-background focus:outline-none focus:border-primary"
              />
              <p className="text-xs text-muted-foreground mt-2">
                ⚠️ The URL must point to a publicly accessible text, markdown, or JSON file
              </p>
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 rounded-lg bg-red-500/10 border border-red-500/20">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Format Guide */}
        <div className="mb-6 p-4 rounded-lg bg-muted/50">
          <h4 className="font-medium mb-2">📖 Supported Formats</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• <strong>JSON:</strong> Exported stories from StxryAI</li>
            <li>• <strong>Markdown:</strong> # for titles, ## for chapters</li>
            <li>• <strong>Plain Text:</strong> Auto-detected chapter breaks</li>
            <li>• <strong>URL:</strong> Direct link to .txt, .md, or .json file</li>
          </ul>
        </div>

        {/* Actions */}
        <div className="flex justify-between">
          <button
            onClick={onCancel}
            className="px-6 py-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            Cancel
          </button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              if (method === 'paste') handlePasteImport();
              else if (method === 'file') handleFileImport();
              else if (method === 'url') handleUrlImport();
            }}
            disabled={
              isProcessing ||
              (method === 'paste' && !content.trim()) ||
              (method === 'file' && !file) ||
              (method === 'url' && !url.trim())
            }
            className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? (
              <span className="flex items-center gap-2">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
                />
                Processing...
              </span>
            ) : (
              '→ Import Story'
            )}
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}

// Helper functions to parse different formats

function parseTextToStory(text: string): any {
  const lines = text.split('\n').filter(line => line.trim());

  // Try to detect title (first non-empty line or line starting with #)
  let title = 'Imported Story';
  let startIdx = 0;

  if (lines[0].startsWith('#')) {
    title = lines[0].replace(/^#+\s*/, '').trim();
    startIdx = 1;
  } else {
    title = lines[0].trim();
    startIdx = 1;
  }

  // Try to detect chapters (lines starting with ## or "Chapter")
  const chapters: any[] = [];
  let currentChapter: any = null;
  let chapterOrder = 0;

  for (let i = startIdx; i < lines.length; i++) {
    const line = lines[i];

    // Check if it's a chapter heading
    if (line.match(/^##\s+/) || line.match(/^Chapter\s+\d+/i)) {
      // Save previous chapter
      if (currentChapter) {
        chapters.push(currentChapter);
      }

      // Start new chapter
      currentChapter = {
        id: `chapter_${chapterOrder}`,
        title: line.replace(/^##\s+/, '').replace(/^Chapter\s+\d+:?\s*/i, '').trim(),
        content: '',
        order: chapterOrder++
      };
    } else if (currentChapter) {
      // Add content to current chapter
      currentChapter.content += line + '\n';
    } else {
      // Before first chapter, add to description or create default chapter
      if (!currentChapter) {
        currentChapter = {
          id: `chapter_${chapterOrder}`,
          title: 'Chapter 1',
          content: line + '\n',
          order: chapterOrder++
        };
      }
    }
  }

  // Save last chapter
  if (currentChapter) {
    chapters.push(currentChapter);
  }

  // If no chapters detected, create one chapter with all content
  if (chapters.length === 0) {
    chapters.push({
      id: 'chapter_0',
      title: 'Chapter 1',
      content: lines.slice(startIdx).join('\n'),
      order: 0
    });
  }

  return {
    id: `imported_${Date.now()}`,
    title,
    description: 'Imported from text',
    genre: 'General',
    tags: ['imported'],
    chapters,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
}

function parseMarkdownToStory(markdown: string): any {
  // Similar to parseTextToStory but with better markdown support
  const lines = markdown.split('\n');

  // Extract title from first # heading
  let title = 'Imported Story';
  let description = '';
  const chapters: any[] = [];
  let currentChapter: any = null;
  let chapterOrder = 0;

  for (const line of lines) {
    if (line.startsWith('# ')) {
      // Main title
      if (!title || title === 'Imported Story') {
        title = line.replace(/^#\s+/, '').trim();
      }
    } else if (line.startsWith('## ')) {
      // Chapter heading
      if (currentChapter) {
        chapters.push(currentChapter);
      }
      currentChapter = {
        id: `chapter_${chapterOrder}`,
        title: line.replace(/^##\s+/, '').trim(),
        content: '',
        order: chapterOrder++
      };
    } else if (currentChapter) {
      currentChapter.content += line + '\n';
    } else if (line.trim()) {
      description += line + ' ';
    }
  }

  if (currentChapter) {
    chapters.push(currentChapter);
  }

  return {
    id: `imported_${Date.now()}`,
    title,
    description: description.trim() || 'Imported from markdown',
    genre: 'General',
    tags: ['imported', 'markdown'],
    chapters: chapters.length > 0 ? chapters : [{
      id: 'chapter_0',
      title: 'Chapter 1',
      content: markdown,
      order: 0
    }],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
}
