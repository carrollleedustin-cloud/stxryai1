/**
 * Story Export Service
 * Generates EPUB and PDF versions of stories for offline reading.
 */

import { supabase } from '@/lib/supabase/client';

// Types
export interface ExportOptions {
  format: 'epub' | 'pdf' | 'html' | 'txt' | 'markdown';
  includeChoices: boolean;
  includeCoverImage: boolean;
  includeAuthorNotes: boolean;
  includeTableOfContents: boolean;
  selectedPath?: string[]; // For branching stories, which path to export
  fontSize?: 'small' | 'medium' | 'large';
  fontFamily?: string;
  theme?: 'light' | 'dark' | 'sepia';
}

export interface ExportedStory {
  title: string;
  author: string;
  description: string;
  genre: string;
  coverImageUrl?: string;
  chapters: ExportedChapter[];
  metadata: StoryMetadata;
}

export interface ExportedChapter {
  id: string;
  title: string;
  content: string;
  order: number;
  choices?: ExportedChoice[];
  authorNotes?: string;
}

export interface ExportedChoice {
  text: string;
  leadsTo?: string;
  isSelected?: boolean;
}

export interface StoryMetadata {
  wordCount: number;
  chapterCount: number;
  estimatedReadingTime: number;
  createdAt: string;
  updatedAt: string;
  language: string;
  tags: string[];
}

export interface ExportJob {
  id: string;
  story_id: string;
  user_id: string;
  format: ExportOptions['format'];
  status: 'pending' | 'processing' | 'completed' | 'failed';
  download_url?: string;
  error_message?: string;
  created_at: string;
  completed_at?: string;
}

// Default export options
export const DEFAULT_EXPORT_OPTIONS: ExportOptions = {
  format: 'epub',
  includeChoices: true,
  includeCoverImage: true,
  includeAuthorNotes: false,
  includeTableOfContents: true,
  fontSize: 'medium',
  fontFamily: 'Georgia, serif',
  theme: 'light',
};

// Font size mappings for PDF
const FONT_SIZES = {
  small: 10,
  medium: 12,
  large: 14,
};

// Theme colors
const THEME_COLORS = {
  light: { background: '#ffffff', text: '#1a1a1a' },
  dark: { background: '#1a1a1a', text: '#f5f5f5' },
  sepia: { background: '#f4ecd8', text: '#5c4b37' },
};

export const storyExportService = {
  /**
   * Fetch complete story data for export
   */
  async fetchStoryForExport(storyId: string): Promise<ExportedStory | null> {
    const { data: story } = await supabase
      .from('stories')
      .select(`
        id,
        title,
        description,
        genre,
        cover_image_url,
        created_at,
        updated_at,
        author:author_id (display_name)
      `)
      .eq('id', storyId)
      .single();

    if (!story) return null;

    const { data: chapters } = await supabase
      .from('chapters')
      .select(`
        id,
        title,
        content,
        order,
        author_notes
      `)
      .eq('story_id', storyId)
      .order('order', { ascending: true });

    if (!chapters) return null;

    // Get choices for each chapter
    const exportedChapters: ExportedChapter[] = await Promise.all(
      chapters.map(async (chapter) => {
        const { data: choices } = await supabase
          .from('chapter_choices')
          .select('choice_text, leads_to_chapter_id')
          .eq('chapter_id', chapter.id);

        return {
          id: chapter.id,
          title: chapter.title,
          content: chapter.content,
          order: chapter.order,
          choices: choices?.map((c) => ({
            text: c.choice_text,
            leadsTo: c.leads_to_chapter_id,
          })),
          authorNotes: chapter.author_notes,
        };
      })
    );

    // Calculate metadata
    const totalWords = exportedChapters.reduce(
      (sum, ch) => sum + ch.content.split(/\s+/).length,
      0
    );

    const authorData = story.author as { display_name?: string } | null;

    return {
      title: story.title,
      author: authorData?.display_name || 'Unknown Author',
      description: story.description || '',
      genre: story.genre || 'General',
      coverImageUrl: story.cover_image_url,
      chapters: exportedChapters,
      metadata: {
        wordCount: totalWords,
        chapterCount: exportedChapters.length,
        estimatedReadingTime: Math.ceil(totalWords / 200),
        createdAt: story.created_at,
        updatedAt: story.updated_at,
        language: 'en',
        tags: [],
      },
    };
  },

  /**
   * Generate HTML content for story
   */
  generateHTML(story: ExportedStory, options: ExportOptions): string {
    const themeColors = THEME_COLORS[options.theme || 'light'];
    const fontSize = FONT_SIZES[options.fontSize || 'medium'];

    let html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${this.escapeHtml(story.title)}</title>
  <meta name="author" content="${this.escapeHtml(story.author)}">
  <meta name="description" content="${this.escapeHtml(story.description)}">
  <style>
    * { box-sizing: border-box; }
    body {
      font-family: ${options.fontFamily || 'Georgia, serif'};
      font-size: ${fontSize}pt;
      line-height: 1.6;
      color: ${themeColors.text};
      background-color: ${themeColors.background};
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }
    h1 { font-size: 2em; margin-bottom: 0.5em; text-align: center; }
    h2 { font-size: 1.5em; margin-top: 2em; border-bottom: 1px solid #ccc; padding-bottom: 0.5em; }
    .author { text-align: center; font-style: italic; margin-bottom: 2em; }
    .description { margin-bottom: 2em; padding: 1em; background: rgba(0,0,0,0.05); border-radius: 8px; }
    .chapter { margin-bottom: 3em; page-break-before: always; }
    .chapter:first-of-type { page-break-before: avoid; }
    .chapter-content { text-align: justify; }
    .chapter-content p { margin: 1em 0; text-indent: 2em; }
    .choices { margin-top: 2em; padding: 1em; background: rgba(0,0,0,0.03); border-radius: 8px; }
    .choices h3 { margin-top: 0; }
    .choice { padding: 0.5em; margin: 0.5em 0; border-left: 3px solid #666; padding-left: 1em; }
    .choice.selected { border-left-color: #4CAF50; background: rgba(76, 175, 80, 0.1); }
    .author-notes { margin-top: 1em; font-style: italic; color: #666; padding: 1em; border: 1px dashed #ccc; }
    .toc { margin: 2em 0; }
    .toc ul { list-style: none; padding-left: 0; }
    .toc li { padding: 0.5em 0; border-bottom: 1px dotted #ccc; }
    .toc a { text-decoration: none; color: inherit; }
    .cover { text-align: center; margin-bottom: 2em; }
    .cover img { max-width: 100%; max-height: 400px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.2); }
    .metadata { font-size: 0.9em; color: #666; margin-bottom: 2em; }
    @media print {
      body { max-width: none; padding: 0; }
      .chapter { page-break-before: always; }
    }
  </style>
</head>
<body>`;

    // Cover image
    if (options.includeCoverImage && story.coverImageUrl) {
      html += `
  <div class="cover">
    <img src="${story.coverImageUrl}" alt="Cover image for ${this.escapeHtml(story.title)}">
  </div>`;
    }

    // Title and author
    html += `
  <h1>${this.escapeHtml(story.title)}</h1>
  <p class="author">by ${this.escapeHtml(story.author)}</p>`;

    // Description
    if (story.description) {
      html += `
  <div class="description">
    <p>${this.escapeHtml(story.description)}</p>
  </div>`;
    }

    // Metadata
    html += `
  <div class="metadata">
    <p><strong>Genre:</strong> ${this.escapeHtml(story.genre)} |
       <strong>Words:</strong> ${story.metadata.wordCount.toLocaleString()} |
       <strong>Reading time:</strong> ~${story.metadata.estimatedReadingTime} min</p>
  </div>`;

    // Table of Contents
    if (options.includeTableOfContents && story.chapters.length > 1) {
      html += `
  <div class="toc">
    <h2>Table of Contents</h2>
    <ul>`;
      story.chapters.forEach((chapter, index) => {
        html += `
      <li><a href="#chapter-${index + 1}">${index + 1}. ${this.escapeHtml(chapter.title)}</a></li>`;
      });
      html += `
    </ul>
  </div>`;
    }

    // Chapters
    story.chapters.forEach((chapter, index) => {
      html += `
  <div class="chapter" id="chapter-${index + 1}">
    <h2>Chapter ${index + 1}: ${this.escapeHtml(chapter.title)}</h2>
    <div class="chapter-content">
      ${this.formatContent(chapter.content)}
    </div>`;

      // Choices
      if (options.includeChoices && chapter.choices && chapter.choices.length > 0) {
        html += `
    <div class="choices">
      <h3>Reader Choices:</h3>`;
        chapter.choices.forEach((choice) => {
          const selectedClass = choice.isSelected ? ' selected' : '';
          html += `
      <div class="choice${selectedClass}">
        ${this.escapeHtml(choice.text)}
      </div>`;
        });
        html += `
    </div>`;
      }

      // Author notes
      if (options.includeAuthorNotes && chapter.authorNotes) {
        html += `
    <div class="author-notes">
      <strong>Author's Notes:</strong> ${this.escapeHtml(chapter.authorNotes)}
    </div>`;
      }

      html += `
  </div>`;
    });

    html += `
</body>
</html>`;

    return html;
  },

  /**
   * Generate plain text version
   */
  generatePlainText(story: ExportedStory, options: ExportOptions): string {
    let text = '';

    // Title and author
    text += `${'='.repeat(60)}\n`;
    text += `${story.title.toUpperCase()}\n`;
    text += `by ${story.author}\n`;
    text += `${'='.repeat(60)}\n\n`;

    // Description
    if (story.description) {
      text += `${story.description}\n\n`;
    }

    // Metadata
    text += `Genre: ${story.genre}\n`;
    text += `Word Count: ${story.metadata.wordCount.toLocaleString()}\n`;
    text += `Reading Time: ~${story.metadata.estimatedReadingTime} minutes\n`;
    text += `${'-'.repeat(60)}\n\n`;

    // Table of Contents
    if (options.includeTableOfContents && story.chapters.length > 1) {
      text += `TABLE OF CONTENTS\n`;
      text += `${'-'.repeat(20)}\n`;
      story.chapters.forEach((chapter, index) => {
        text += `${index + 1}. ${chapter.title}\n`;
      });
      text += `\n${'='.repeat(60)}\n\n`;
    }

    // Chapters
    story.chapters.forEach((chapter, index) => {
      text += `\n${'='.repeat(60)}\n`;
      text += `CHAPTER ${index + 1}: ${chapter.title.toUpperCase()}\n`;
      text += `${'='.repeat(60)}\n\n`;

      // Content (strip HTML)
      text += this.stripHtml(chapter.content);
      text += '\n\n';

      // Choices
      if (options.includeChoices && chapter.choices && chapter.choices.length > 0) {
        text += `[READER CHOICES]\n`;
        chapter.choices.forEach((choice, i) => {
          const marker = choice.isSelected ? '→' : '-';
          text += `  ${marker} ${choice.text}\n`;
        });
        text += '\n';
      }

      // Author notes
      if (options.includeAuthorNotes && chapter.authorNotes) {
        text += `[Author's Notes: ${chapter.authorNotes}]\n\n`;
      }
    });

    text += `\n${'='.repeat(60)}\n`;
    text += `THE END\n`;
    text += `${'='.repeat(60)}\n`;

    return text;
  },

  /**
   * Generate Markdown version
   */
  generateMarkdown(story: ExportedStory, options: ExportOptions): string {
    let md = '';

    // Title and author
    md += `# ${story.title}\n\n`;
    md += `*by ${story.author}*\n\n`;

    // Cover image
    if (options.includeCoverImage && story.coverImageUrl) {
      md += `![Cover](${story.coverImageUrl})\n\n`;
    }

    // Description
    if (story.description) {
      md += `> ${story.description}\n\n`;
    }

    // Metadata
    md += `---\n\n`;
    md += `**Genre:** ${story.genre} | **Words:** ${story.metadata.wordCount.toLocaleString()} | **Reading time:** ~${story.metadata.estimatedReadingTime} min\n\n`;
    md += `---\n\n`;

    // Table of Contents
    if (options.includeTableOfContents && story.chapters.length > 1) {
      md += `## Table of Contents\n\n`;
      story.chapters.forEach((chapter, index) => {
        md += `${index + 1}. [${chapter.title}](#chapter-${index + 1})\n`;
      });
      md += `\n---\n\n`;
    }

    // Chapters
    story.chapters.forEach((chapter, index) => {
      md += `## Chapter ${index + 1}: ${chapter.title}\n\n`;
      md += this.htmlToMarkdown(chapter.content);
      md += '\n\n';

      // Choices
      if (options.includeChoices && chapter.choices && chapter.choices.length > 0) {
        md += `### Reader Choices\n\n`;
        chapter.choices.forEach((choice) => {
          const marker = choice.isSelected ? '✓' : '-';
          md += `${marker} ${choice.text}\n`;
        });
        md += '\n';
      }

      // Author notes
      if (options.includeAuthorNotes && chapter.authorNotes) {
        md += `> **Author's Notes:** ${chapter.authorNotes}\n\n`;
      }

      md += `---\n\n`;
    });

    md += `*The End*\n`;

    return md;
  },

  /**
   * Generate EPUB package (returns structured data for EPUB generation)
   */
  async generateEPUBData(
    story: ExportedStory,
    options: ExportOptions
  ): Promise<{
    opf: string;
    toc: string;
    chapters: Array<{ filename: string; content: string }>;
    styles: string;
  }> {
    const uuid = crypto.randomUUID();
    const chapters: Array<{ filename: string; content: string }> = [];

    // Generate chapter HTML files
    story.chapters.forEach((chapter, index) => {
      const chapterHtml = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <title>${this.escapeHtml(chapter.title)}</title>
  <link rel="stylesheet" type="text/css" href="styles.css"/>
</head>
<body>
  <h1>Chapter ${index + 1}: ${this.escapeHtml(chapter.title)}</h1>
  <div class="chapter-content">
    ${this.formatContent(chapter.content)}
  </div>
</body>
</html>`;

      chapters.push({
        filename: `chapter${index + 1}.xhtml`,
        content: chapterHtml,
      });
    });

    // Generate OPF (package file)
    const opf = `<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="BookId">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
    <dc:identifier id="BookId">urn:uuid:${uuid}</dc:identifier>
    <dc:title>${this.escapeHtml(story.title)}</dc:title>
    <dc:creator>${this.escapeHtml(story.author)}</dc:creator>
    <dc:language>en</dc:language>
    <dc:description>${this.escapeHtml(story.description)}</dc:description>
    <meta property="dcterms:modified">${new Date().toISOString().split('.')[0]}Z</meta>
  </metadata>
  <manifest>
    <item id="toc" href="toc.xhtml" media-type="application/xhtml+xml" properties="nav"/>
    <item id="styles" href="styles.css" media-type="text/css"/>
    ${chapters.map((ch, i) => `<item id="chapter${i + 1}" href="${ch.filename}" media-type="application/xhtml+xml"/>`).join('\n    ')}
  </manifest>
  <spine>
    <itemref idref="toc"/>
    ${chapters.map((_, i) => `<itemref idref="chapter${i + 1}"/>`).join('\n    ')}
  </spine>
</package>`;

    // Generate TOC (navigation)
    const toc = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops">
<head>
  <title>Table of Contents</title>
</head>
<body>
  <nav epub:type="toc">
    <h1>Table of Contents</h1>
    <ol>
      ${story.chapters.map((ch, i) => `<li><a href="chapter${i + 1}.xhtml">${this.escapeHtml(ch.title)}</a></li>`).join('\n      ')}
    </ol>
  </nav>
</body>
</html>`;

    // Generate CSS
    const themeColors = THEME_COLORS[options.theme || 'light'];
    const styles = `
body {
  font-family: ${options.fontFamily || 'Georgia, serif'};
  line-height: 1.6;
  color: ${themeColors.text};
  background-color: ${themeColors.background};
  padding: 1em;
}
h1 { font-size: 1.5em; margin-bottom: 1em; }
.chapter-content p { margin: 1em 0; text-indent: 2em; }
`;

    return { opf, toc, chapters, styles };
  },

  /**
   * Create an export job
   */
  async createExportJob(
    storyId: string,
    userId: string,
    format: ExportOptions['format']
  ): Promise<ExportJob | null> {
    const { data, error } = await supabase
      .from('story_exports')
      .insert({
        story_id: storyId,
        user_id: userId,
        format,
        status: 'pending',
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating export job:', error);
      return null;
    }

    return data;
  },

  /**
   * Update export job status
   */
  async updateExportJob(
    jobId: string,
    updates: Partial<ExportJob>
  ): Promise<void> {
    await supabase
      .from('story_exports')
      .update(updates)
      .eq('id', jobId);
  },

  /**
   * Get user's export history
   */
  async getExportHistory(userId: string): Promise<ExportJob[]> {
    const { data, error } = await supabase
      .from('story_exports')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) {
      console.error('Error fetching export history:', error);
      return [];
    }

    return data || [];
  },

  /**
   * Export story as downloadable blob
   */
  async exportStory(
    storyId: string,
    options: ExportOptions = DEFAULT_EXPORT_OPTIONS
  ): Promise<{ blob: Blob; filename: string } | null> {
    const story = await this.fetchStoryForExport(storyId);
    if (!story) return null;

    const sanitizedTitle = story.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    let content: string;
    let mimeType: string;
    let extension: string;

    switch (options.format) {
      case 'html':
        content = this.generateHTML(story, options);
        mimeType = 'text/html';
        extension = 'html';
        break;

      case 'txt':
        content = this.generatePlainText(story, options);
        mimeType = 'text/plain';
        extension = 'txt';
        break;

      case 'markdown':
        content = this.generateMarkdown(story, options);
        mimeType = 'text/markdown';
        extension = 'md';
        break;

      case 'epub':
      case 'pdf':
        // For EPUB/PDF, we generate HTML and note that further processing is needed
        // In production, this would call a backend service
        content = this.generateHTML(story, options);
        mimeType = options.format === 'epub' ? 'application/epub+zip' : 'application/pdf';
        extension = options.format;
        break;

      default:
        return null;
    }

    const blob = new Blob([content], { type: mimeType });
    const filename = `${sanitizedTitle}.${extension}`;

    return { blob, filename };
  },

  // Utility methods
  escapeHtml(text: string): string {
    const map: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;',
    };
    return text.replace(/[&<>"']/g, (m) => map[m]);
  },

  stripHtml(html: string): string {
    return html
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/p>/gi, '\n\n')
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#039;/g, "'")
      .trim();
  },

  formatContent(content: string): string {
    // Wrap paragraphs if not already wrapped
    if (!content.includes('<p>')) {
      return content
        .split(/\n\n+/)
        .map((p) => `<p>${p.trim()}</p>`)
        .join('\n');
    }
    return content;
  },

  htmlToMarkdown(html: string): string {
    return html
      .replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1\n\n')
      .replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1\n\n')
      .replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1\n\n')
      .replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**')
      .replace(/<b[^>]*>(.*?)<\/b>/gi, '**$1**')
      .replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*')
      .replace(/<i[^>]*>(.*?)<\/i>/gi, '*$1*')
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/p>/gi, '\n\n')
      .replace(/<p[^>]*>/gi, '')
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .trim();
  },
};

export default storyExportService;
