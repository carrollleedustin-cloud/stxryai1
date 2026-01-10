/**
 * Share Card Generation Service
 * Creates beautiful share cards for social media
 */

export interface ShareCardData {
  title: string;
  subtitle: string;
  image?: string;
  stats?: Array<{
    label: string;
    value: string;
  }>;
  theme?: 'default' | 'achievement' | 'milestone' | 'story' | 'streak';
  backgroundColor?: string;
  textColor?: string;
}

export interface ShareCardOptions {
  width?: number;
  height?: number;
  format?: 'png' | 'jpeg';
  quality?: number;
}

class ShareCardService {
  /**
   * Generate share card image using canvas
   * Returns data URL that can be used as image source
   */
  async generateShareCard(data: ShareCardData, options: ShareCardOptions = {}): Promise<string> {
    const {
      width = 1200,
      height = 630, // Standard OG image size
      format = 'png',
      quality = 0.9,
    } = options;

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('Canvas not supported');
    }

    // Theme colors
    const themes = {
      default: { bg: '#8b5cf6', text: '#ffffff', accent: '#a78bfa' },
      achievement: { bg: '#f59e0b', text: '#ffffff', accent: '#fbbf24' },
      milestone: { bg: '#10b981', text: '#ffffff', accent: '#34d399' },
      story: { bg: '#6366f1', text: '#ffffff', accent: '#818cf8' },
      streak: { bg: '#f97316', text: '#ffffff', accent: '#fb923c' },
    };

    const theme = themes[data.theme || 'default'];
    const bgColor = data.backgroundColor || theme.bg;
    const textColor = data.textColor || theme.text;

    // Draw background gradient
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, bgColor);
    gradient.addColorStop(1, theme.accent);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Add pattern overlay (optional)
    this.drawPattern(ctx, width, height, theme.accent, 0.1);

    // Draw title
    ctx.fillStyle = textColor;
    ctx.font = 'bold 64px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';

    // Wrap text if needed
    const titleLines = this.wrapText(ctx, data.title, width - 200, 64);
    let yPos = 150;
    titleLines.forEach((line) => {
      ctx.fillText(line, width / 2, yPos);
      yPos += 80;
    });

    // Draw subtitle
    if (data.subtitle) {
      ctx.font = '32px Arial, sans-serif';
      ctx.fillStyle = textColor + 'DD'; // Slightly transparent
      ctx.fillText(data.subtitle, width / 2, yPos + 20);
    }

    // Draw stats if provided
    if (data.stats && data.stats.length > 0) {
      const statY = height - 200;
      const statSpacing = width / (data.stats.length + 1);

      data.stats.forEach((stat, index) => {
        const x = statSpacing * (index + 1);

        // Stat value
        ctx.font = 'bold 48px Arial, sans-serif';
        ctx.fillStyle = textColor;
        ctx.fillText(stat.value, x, statY);

        // Stat label
        ctx.font = '24px Arial, sans-serif';
        ctx.fillStyle = textColor + 'CC';
        ctx.fillText(stat.label, x, statY + 60);
      });
    }

    // Draw logo/branding (optional)
    ctx.font = '20px Arial, sans-serif';
    ctx.fillStyle = textColor + 'AA';
    ctx.textAlign = 'center';
    ctx.fillText('stxryai.com', width / 2, height - 40);

    // Convert to data URL
    return canvas.toDataURL(`image/${format}`, quality);
  }

  /**
   * Generate share card via API (server-side)
   * Falls back to client-side if API unavailable
   */
  async generateShareCardAPI(data: ShareCardData, options: ShareCardOptions = {}): Promise<string> {
    try {
      const response = await fetch('/api/share/card', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data, options }),
      });

      if (response.ok) {
        const blob = await response.blob();
        return URL.createObjectURL(blob);
      }
    } catch (error) {
      console.warn('Share card API unavailable, using client-side generation');
    }

    // Fallback to client-side
    return this.generateShareCard(data, options);
  }

  /**
   * Share to social platform with generated card
   */
  async shareToSocial(
    platform: 'twitter' | 'facebook' | 'reddit' | 'linkedin',
    data: ShareCardData,
    url: string,
    useCard: boolean = true
  ): Promise<void> {
    let shareUrl = url;
    let shareText = data.title;

    // Generate share card if requested
    if (useCard) {
      try {
        const cardImage = await this.generateShareCard(data);
        // For platforms that support images, we'd upload the card first
        // For now, we'll use the text-based sharing
      } catch (error) {
        console.error('Failed to generate share card:', error);
      }
    }

    const shareUrls = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      reddit: `https://reddit.com/submit?title=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
    };

    window.open(shareUrls[platform], '_blank', 'width=600,height=400');
  }

  /**
   * Download share card as image
   */
  async downloadShareCard(
    data: ShareCardData,
    filename: string = 'share-card.png',
    options: ShareCardOptions = {}
  ): Promise<void> {
    const dataUrl = await this.generateShareCard(data, options);
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  /**
   * Helper: Wrap text to fit width
   */
  private wrapText(
    ctx: CanvasRenderingContext2D,
    text: string,
    maxWidth: number,
    fontSize: number
  ): string[] {
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = words[0];

    for (let i = 1; i < words.length; i++) {
      const word = words[i];
      const width = ctx.measureText(currentLine + ' ' + word).width;
      if (width < maxWidth) {
        currentLine += ' ' + word;
      } else {
        lines.push(currentLine);
        currentLine = word;
      }
    }
    lines.push(currentLine);
    return lines;
  }

  /**
   * Helper: Draw pattern overlay
   */
  private drawPattern(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    color: string,
    opacity: number
  ): void {
    ctx.save();
    ctx.globalAlpha = opacity;
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;

    // Draw diagonal lines
    for (let i = -height; i < width + height; i += 40) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i + height, height);
      ctx.stroke();
    }

    ctx.restore();
  }

  /**
   * Generate share card data for story
   */
  generateStoryShareCard(story: {
    title: string;
    description?: string;
    coverImage?: string;
    genre?: string;
    readCount?: number;
  }): ShareCardData {
    return {
      title: story.title,
      subtitle: story.description || `A ${story.genre || 'story'} on StxryAI`,
      image: story.coverImage,
      theme: 'story',
      stats: story.readCount
        ? [
            {
              label: 'Reads',
              value: story.readCount.toString(),
            },
          ]
        : undefined,
    };
  }

  /**
   * Generate share card data for achievement
   */
  generateAchievementShareCard(achievement: {
    name: string;
    description?: string;
    icon?: string;
  }): ShareCardData {
    return {
      title: `🏆 ${achievement.name}`,
      subtitle: achievement.description || 'Achievement unlocked!',
      theme: 'achievement',
    };
  }

  /**
   * Generate share card data for streak
   */
  generateStreakShareCard(streak: {
    currentStreak: number;
    longestStreak?: number;
  }): ShareCardData {
    return {
      title: `🔥 ${streak.currentStreak} Day Streak!`,
      subtitle: streak.longestStreak
        ? `Personal best: ${streak.longestStreak} days`
        : 'Keep the fire burning!',
      theme: 'streak',
      stats: [
        {
          label: 'Days',
          value: streak.currentStreak.toString(),
        },
      ],
    };
  }

  /**
   * Generate share card data for milestone
   */
  generateMilestoneShareCard(milestone: {
    title: string;
    description?: string;
    value: string;
    label: string;
  }): ShareCardData {
    return {
      title: milestone.title,
      subtitle: milestone.description,
      theme: 'milestone',
      stats: [
        {
          label: milestone.label,
          value: milestone.value,
        },
      ],
    };
  }
}

// Export singleton instance
export const shareCardService = new ShareCardService();
