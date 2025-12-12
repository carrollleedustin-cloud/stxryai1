/**
 * AI Image Generation Service
 * Generate story cover images and scene illustrations using DALL-E or Stable Diffusion
 */

interface ImageGenerationRequest {
  prompt: string;
  style?: 'realistic' | 'anime' | 'digital-art' | 'oil-painting' | 'watercolor' | 'comic';
  aspectRatio?: '1:1' | '16:9' | '9:16' | '4:3';
  quality?: 'standard' | 'hd';
  numberOfImages?: number;
}

interface GeneratedImage {
  url: string;
  revisedPrompt?: string;
  width: number;
  height: number;
}

interface CoverImageRequest {
  storyTitle: string;
  genre: string;
  theme: string;
  mood: string;
  keyElements: string[];
}

export class AIImageGenerator {
  private apiKey: string;
  private baseUrl: string = 'https://api.openai.com/v1';
  private provider: 'openai' | 'stability' = 'openai';

  constructor(apiKey?: string, provider?: 'openai' | 'stability') {
    this.apiKey = apiKey || process.env.OPENAI_API_KEY || '';
    this.provider = provider || 'openai';
  }

  /**
   * Generate a story cover image
   */
  async generateStoryCover(request: CoverImageRequest): Promise<GeneratedImage> {
    const prompt = this.buildCoverPrompt(request);

    return this.generateImage({
      prompt,
      style: this.mapGenreToStyle(request.genre),
      aspectRatio: '9:16', // Vertical for book covers
      quality: 'hd',
      numberOfImages: 1,
    });
  }

  /**
   * Generate scene illustration for a chapter
   */
  async generateSceneIllustration(
    sceneDescription: string,
    style?: string
  ): Promise<GeneratedImage> {
    const enhancedPrompt = `Detailed illustration of: ${sceneDescription}. High quality, professional artwork.`;

    return this.generateImage({
      prompt: enhancedPrompt,
      style: (style as any) || 'digital-art',
      aspectRatio: '16:9',
      quality: 'hd',
      numberOfImages: 1,
    });
  }

  /**
   * Generate character portrait
   */
  async generateCharacterPortrait(
    characterDescription: string,
    style: string = 'digital-art'
  ): Promise<GeneratedImage> {
    const prompt = `Character portrait: ${characterDescription}. Professional character art, detailed face, expressive features.`;

    return this.generateImage({
      prompt,
      style: style as any,
      aspectRatio: '1:1',
      quality: 'hd',
      numberOfImages: 1,
    });
  }

  /**
   * Generate multiple cover variations
   */
  async generateCoverVariations(
    request: CoverImageRequest,
    count: number = 4
  ): Promise<GeneratedImage[]> {
    const prompt = this.buildCoverPrompt(request);

    const results: GeneratedImage[] = [];
    for (let i = 0; i < count; i++) {
      const image = await this.generateImage({
        prompt,
        style: this.mapGenreToStyle(request.genre),
        aspectRatio: '9:16',
        quality: 'standard',
        numberOfImages: 1,
      });
      results.push(image);
    }

    return results;
  }

  /**
   * Generate image with custom prompt
   */
  private async generateImage(request: ImageGenerationRequest): Promise<GeneratedImage> {
    if (!this.apiKey) {
      return this.getMockImage(request);
    }

    try {
      const size = this.getSizeFromAspectRatio(request.aspectRatio || '1:1');
      const enhancedPrompt = this.enhancePromptWithStyle(request.prompt, request.style);

      if (this.provider === 'openai') {
        return await this.generateWithDALLE(enhancedPrompt, size, request.quality || 'standard');
      } else {
        return await this.generateWithStability(enhancedPrompt, size);
      }
    } catch (error) {
      console.error('Image generation failed:', error);
      return this.getMockImage(request);
    }
  }

  /**
   * Generate with DALL-E 3
   */
  private async generateWithDALLE(
    prompt: string,
    size: string,
    quality: string
  ): Promise<GeneratedImage> {
    const response = await fetch(`${this.baseUrl}/images/generations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt,
        n: 1,
        size,
        quality,
      }),
    });

    if (!response.ok) {
      throw new Error(`DALL-E API error: ${response.statusText}`);
    }

    const data = await response.json();
    const image = data.data[0];

    return {
      url: image.url,
      revisedPrompt: image.revised_prompt,
      width: parseInt(size.split('x')[0]),
      height: parseInt(size.split('x')[1]),
    };
  }

  /**
   * Generate with Stability AI (placeholder)
   */
  private async generateWithStability(prompt: string, size: string): Promise<GeneratedImage> {
    // Placeholder for Stability AI integration
    // In production, implement actual Stability AI API calls
    return this.getMockImage({ prompt, aspectRatio: '1:1' });
  }

  /**
   * Build optimized prompt for story covers
   */
  private buildCoverPrompt(request: CoverImageRequest): string {
    const parts = [
      `Book cover design for "${request.storyTitle}"`,
      `Genre: ${request.genre}`,
      `Theme: ${request.theme}`,
      `Mood: ${request.mood}`,
    ];

    if (request.keyElements.length > 0) {
      parts.push(`Featuring: ${request.keyElements.join(', ')}`);
    }

    parts.push(
      'Professional book cover art, striking composition, readable title space, commercial quality'
    );

    return parts.join('. ') + '.';
  }

  /**
   * Enhance prompt with style modifiers
   */
  private enhancePromptWithStyle(prompt: string, style?: string): string {
    const styleModifiers = {
      realistic: 'photorealistic, highly detailed, 8k resolution',
      anime: 'anime style, manga art, vibrant colors, cel shaded',
      'digital-art': 'digital painting, concept art, trending on artstation',
      'oil-painting': 'oil painting style, classical art, painterly brushstrokes',
      watercolor: 'watercolor painting, soft colors, artistic',
      comic: 'comic book style, bold lines, dynamic composition',
    };

    if (style && styleModifiers[style as keyof typeof styleModifiers]) {
      return `${prompt}, ${styleModifiers[style as keyof typeof styleModifiers]}`;
    }

    return prompt;
  }

  /**
   * Map genre to appropriate art style
   */
  private mapGenreToStyle(genre: string): ImageGenerationRequest['style'] {
    const genreStyleMap: Record<string, ImageGenerationRequest['style']> = {
      'sci-fi': 'digital-art',
      fantasy: 'digital-art',
      romance: 'watercolor',
      mystery: 'realistic',
      horror: 'digital-art',
      thriller: 'realistic',
      'young-adult': 'anime',
      'historical-fiction': 'oil-painting',
    };

    return genreStyleMap[genre.toLowerCase()] || 'digital-art';
  }

  /**
   * Get image size from aspect ratio
   */
  private getSizeFromAspectRatio(ratio: string): string {
    const sizeMap = {
      '1:1': '1024x1024',
      '16:9': '1792x1024',
      '9:16': '1024x1792',
      '4:3': '1024x768',
    };

    return sizeMap[ratio as keyof typeof sizeMap] || '1024x1024';
  }

  /**
   * Get mock image for development
   */
  private getMockImage(request: ImageGenerationRequest): GeneratedImage {
    const [width, height] = this.getSizeFromAspectRatio(request.aspectRatio || '1:1')
      .split('x')
      .map(Number);

    return {
      url: `https://picsum.photos/${width}/${height}`,
      revisedPrompt: request.prompt,
      width,
      height,
    };
  }

  /**
   * Upscale existing image
   */
  async upscaleImage(imageUrl: string, scale: number = 2): Promise<GeneratedImage> {
    // Placeholder for image upscaling service
    // Could integrate with services like Real-ESRGAN or Topaz
    return {
      url: imageUrl,
      width: 1024 * scale,
      height: 1024 * scale,
    };
  }

  /**
   * Generate image variations from existing image
   */
  async createVariations(imageUrl: string, count: number = 3): Promise<GeneratedImage[]> {
    // Placeholder for DALL-E variations endpoint
    // In production, implement actual variations API
    return Array(count).fill(null).map(() => ({
      url: imageUrl,
      width: 1024,
      height: 1024,
    }));
  }
}

// Export singleton instance
export const aiImageGenerator = new AIImageGenerator();
