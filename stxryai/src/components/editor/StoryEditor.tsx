'use client';

import { motion } from 'framer-motion';
import { useState, useRef } from 'react';

interface EditorContent {
  title: string;
  chapters: Chapter[];
  metadata: {
    genre: string;
    difficulty: 'easy' | 'medium' | 'hard';
    tags: string[];
  };
}

interface Chapter {
  id: string;
  title: string;
  content: string;
  choices: Choice[];
}

interface Choice {
  id: string;
  text: string;
  nextChapterId: string | null;
}

interface StoryEditorProps {
  initialContent?: EditorContent;
  onSave?: (content: EditorContent) => void;
  onPublish?: (content: EditorContent) => void;
  onPreview?: (content: EditorContent) => void;
}

export default function StoryEditor({
  initialContent,
  onSave,
  onPublish,
  onPreview,
}: StoryEditorProps) {
  const [content, setContent] = useState<EditorContent>(initialContent || {
    title: '',
    chapters: [{
      id: '1',
      title: 'Chapter 1',
      content: '',
      choices: [],
    }],
    metadata: {
      genre: '',
      difficulty: 'medium',
      tags: [],
    },
  });

  const [activeChapter, setActiveChapter] = useState(0);
  const [showToolbar, setShowToolbar] = useState(true);
  const editorRef = useRef<HTMLDivElement>(null);

  const currentChapter = content.chapters[activeChapter];

  // Formatting functions
  const formatText = (command: string, value?: string) => {
    document.execCommand(command, false, value);
  };

  const addChapter = () => {
    const newChapter: Chapter = {
      id: (content.chapters.length + 1).toString(),
      title: `Chapter ${content.chapters.length + 1}`,
      content: '',
      choices: [],
    };
    setContent({
      ...content,
      chapters: [...content.chapters, newChapter],
    });
    setActiveChapter(content.chapters.length);
  };

  const addChoice = () => {
    const updatedChapters = [...content.chapters];
    updatedChapters[activeChapter].choices.push({
      id: `choice-${Date.now()}`,
      text: '',
      nextChapterId: null,
    });
    setContent({ ...content, chapters: updatedChapters });
  };

  const updateChapterContent = (newContent: string) => {
    const updatedChapters = [...content.chapters];
    updatedChapters[activeChapter].content = newContent;
    setContent({ ...content, chapters: updatedChapters });
  };

  return (
    <div className="h-screen flex flex-col bg-gray-900">
      {/* Top Toolbar */}
      <div className="bg-black/50 backdrop-blur-sm border-b border-white/10 p-4">
        <div className="flex items-center justify-between">
          {/* Title Input */}
          <input
            type="text"
            value={content.title}
            onChange={(e) => setContent({ ...content, title: e.target.value })}
            placeholder="Story Title"
            className="text-2xl font-bold bg-transparent text-white border-none outline-none placeholder-gray-500"
          />

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={() => onSave?.(content)}
              className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-all"
            >
              💾 Save Draft
            </button>
            <button
              onClick={() => onPreview?.(content)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
            >
              👁️ Preview
            </button>
            <button
              onClick={() => onPublish?.(content)}
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all"
            >
              🚀 Publish
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Chapter Sidebar */}
        <div className="w-64 bg-black/30 border-r border-white/10 overflow-y-auto">
          <div className="p-4">
            <h3 className="text-white font-semibold mb-3">Chapters</h3>
            <div className="space-y-2">
              {content.chapters.map((chapter, index) => (
                <button
                  key={chapter.id}
                  onClick={() => setActiveChapter(index)}
                  className={`w-full text-left p-3 rounded-lg transition-all ${
                    activeChapter === index
                      ? 'bg-purple-600 text-white'
                      : 'bg-white/5 text-gray-300 hover:bg-white/10'
                  }`}
                >
                  <div className="font-medium">{chapter.title}</div>
                  <div className="text-xs opacity-70 mt-1">
                    {chapter.content.length} chars • {chapter.choices.length} choices
                  </div>
                </button>
              ))}
              <button
                onClick={addChapter}
                className="w-full p-3 border-2 border-dashed border-white/20 rounded-lg text-gray-400 hover:border-purple-600 hover:text-purple-400 transition-all"
              >
                + Add Chapter
              </button>
            </div>
          </div>
        </div>

        {/* Editor Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Formatting Toolbar */}
          {showToolbar && (
            <div className="bg-black/30 border-b border-white/10 p-3 flex gap-2 overflow-x-auto">
              <ToolbarButton icon="B" label="Bold" onClick={() => formatText('bold')} />
              <ToolbarButton icon="I" label="Italic" onClick={() => formatText('italic')} />
              <ToolbarButton icon="U" label="Underline" onClick={() => formatText('underline')} />
              <div className="w-px bg-white/10 mx-2" />
              <ToolbarButton icon="H1" label="Heading 1" onClick={() => formatText('formatBlock', '<h1>')} />
              <ToolbarButton icon="H2" label="Heading 2" onClick={() => formatText('formatBlock', '<h2>')} />
              <ToolbarButton icon="¶" label="Paragraph" onClick={() => formatText('formatBlock', '<p>')} />
              <div className="w-px bg-white/10 mx-2" />
              <ToolbarButton icon="•" label="Bullet List" onClick={() => formatText('insertUnorderedList')} />
              <ToolbarButton icon="1." label="Numbered List" onClick={() => formatText('insertOrderedList')} />
              <div className="w-px bg-white/10 mx-2" />
              <ToolbarButton icon="↶" label="Undo" onClick={() => formatText('undo')} />
              <ToolbarButton icon="↷" label="Redo" onClick={() => formatText('redo')} />
            </div>
          )}

          {/* Content Editor */}
          <div className="flex-1 overflow-y-auto p-8">
            <div className="max-w-4xl mx-auto">
              {/* Chapter Title */}
              <input
                type="text"
                value={currentChapter.title}
                onChange={(e) => {
                  const updated = [...content.chapters];
                  updated[activeChapter].title = e.target.value;
                  setContent({ ...content, chapters: updated });
                }}
                className="text-3xl font-bold bg-transparent text-white border-none outline-none placeholder-gray-500 w-full mb-6"
                placeholder="Chapter Title"
              />

              {/* Rich Text Editor */}
              <div
                ref={editorRef}
                contentEditable
                onInput={(e) => updateChapterContent(e.currentTarget.innerHTML)}
                dangerouslySetInnerHTML={{ __html: currentChapter.content }}
                className="min-h-[400px] text-gray-200 text-lg leading-relaxed outline-none focus:outline-none prose prose-invert max-w-none"
                style={{ caretColor: 'white' }}
              />

              {/* Choices Section */}
              <div className="mt-12 pt-8 border-t border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-white">Reader Choices</h3>
                  <button
                    onClick={addChoice}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all text-sm"
                  >
                    + Add Choice
                  </button>
                </div>

                <div className="space-y-3">
                  {currentChapter.choices.map((choice, index) => (
                    <ChoiceEditor
                      key={choice.id}
                      choice={choice}
                      index={index}
                      chapters={content.chapters}
                      onChange={(updated) => {
                        const updatedChapters = [...content.chapters];
                        updatedChapters[activeChapter].choices[index] = updated;
                        setContent({ ...content, chapters: updatedChapters });
                      }}
                      onDelete={() => {
                        const updatedChapters = [...content.chapters];
                        updatedChapters[activeChapter].choices = updatedChapters[activeChapter].choices.filter((_, i) => i !== index);
                        setContent({ ...content, chapters: updatedChapters });
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Metadata Sidebar */}
        <div className="w-80 bg-black/30 border-l border-white/10 overflow-y-auto p-4">
          <h3 className="text-white font-semibold mb-4">Story Settings</h3>

          {/* Genre */}
          <div className="mb-4">
            <label className="text-sm text-gray-400 mb-2 block">Genre</label>
            <select
              value={content.metadata.genre}
              onChange={(e) => setContent({
                ...content,
                metadata: { ...content.metadata, genre: e.target.value }
              })}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
            >
              <option value="">Select Genre</option>
              <option value="sci-fi">Sci-Fi</option>
              <option value="fantasy">Fantasy</option>
              <option value="mystery">Mystery</option>
              <option value="romance">Romance</option>
              <option value="horror">Horror</option>
              <option value="thriller">Thriller</option>
            </select>
          </div>

          {/* Difficulty */}
          <div className="mb-4">
            <label className="text-sm text-gray-400 mb-2 block">Difficulty</label>
            <div className="flex gap-2">
              {['easy', 'medium', 'hard'].map((diff) => (
                <button
                  key={diff}
                  onClick={() => setContent({
                    ...content,
                    metadata: { ...content.metadata, difficulty: diff as any }
                  })}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm transition-all ${
                    content.metadata.difficulty === diff
                      ? 'bg-purple-600 text-white'
                      : 'bg-white/5 text-gray-300 hover:bg-white/10'
                  }`}
                >
                  {diff}
                </button>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="mt-6 pt-6 border-t border-white/10">
            <h4 className="text-sm font-semibold text-white mb-3">Statistics</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-400">
                <span>Chapters</span>
                <span className="text-white">{content.chapters.length}</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Total Choices</span>
                <span className="text-white">
                  {content.chapters.reduce((sum, ch) => sum + ch.choices.length, 0)}
                </span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Word Count</span>
                <span className="text-white">
                  {content.chapters.reduce((sum, ch) => {
                    const text = ch.content.replace(/<[^>]*>/g, '');
                    return sum + text.split(/\s+/).filter(Boolean).length;
                  }, 0)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Toolbar Button Component
function ToolbarButton({ icon, label, onClick }: { icon: string; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      title={label}
      className="px-3 py-1.5 bg-white/10 text-white rounded hover:bg-white/20 transition-all font-semibold text-sm"
    >
      {icon}
    </button>
  );
}

// Choice Editor Component
function ChoiceEditor({
  choice,
  index,
  chapters,
  onChange,
  onDelete,
}: {
  choice: Choice;
  index: number;
  chapters: Chapter[];
  onChange: (choice: Choice) => void;
  onDelete: () => void;
}) {
  return (
    <div className="bg-white/5 rounded-lg p-4 border border-white/10">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold flex-shrink-0">
          {index + 1}
        </div>
        <div className="flex-1 space-y-3">
          <input
            type="text"
            value={choice.text}
            onChange={(e) => onChange({ ...choice, text: e.target.value })}
            placeholder="Choice text (e.g., 'Investigate the sound')"
            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 outline-none focus:border-purple-600"
          />
          <div className="flex gap-2">
            <select
              value={choice.nextChapterId || ''}
              onChange={(e) => onChange({ ...choice, nextChapterId: e.target.value || null })}
              className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm"
            >
              <option value="">Select next chapter</option>
              {chapters.map((ch) => (
                <option key={ch.id} value={ch.id}>
                  → {ch.title}
                </option>
              ))}
            </select>
            <button
              onClick={onDelete}
              className="px-3 py-2 bg-red-600/20 text-red-400 rounded-lg hover:bg-red-600/30 transition-all"
            >
              🗑️
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
