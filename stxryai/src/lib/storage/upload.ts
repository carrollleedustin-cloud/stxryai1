import { getSupabaseClient } from '../supabase/client';

const getSupabase = () => {
  const supabase = getSupabaseClient();
  if (!supabase) {
    throw new Error('Supabase client is not available');
  }
  return supabase;
};

export type UploadBucket = 'story-assets' | 'cover-images' | 'user-avatars';

export interface UploadOptions {
  bucket: UploadBucket;
  file: File;
  path?: string;
  upsert?: boolean;
}

export interface UploadResult {
  success: boolean;
  url?: string;
  path?: string;
  error?: string;
}

// Upload file to Supabase Storage
export async function uploadFile({
  bucket,
  file,
  path,
  upsert = false,
}: UploadOptions): Promise<UploadResult> {
  try {
    const supabase = getSupabase();

    // Generate unique filename if path not provided
    const fileName = path || `${Date.now()}-${file.name}`;

    const { data, error } = await supabase.storage.from(bucket).upload(fileName, file, {
      upsert,
      contentType: file.type,
    });

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    // Get public URL
    const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(data.path);

    return {
      success: true,
      url: urlData.publicUrl,
      path: data.path,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed',
    };
  }
}

// Upload image with optimization
export async function uploadImage({
  bucket,
  file,
  path,
  maxWidth = 1200,
  quality = 0.8,
}: UploadOptions & { maxWidth?: number; quality?: number }): Promise<UploadResult> {
  try {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      return {
        success: false,
        error: 'File must be an image',
      };
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return {
        success: false,
        error: 'Image must be less than 5MB',
      };
    }

    // Client-side image optimization: resize to maxWidth and compress
    let fileToUpload: File = file;
    try {
      const optimized = await optimizeImage(file, { maxWidth, quality });
      if (optimized) {
        fileToUpload = optimized;
      }
    } catch (e) {
      // Fallback to original file on any optimization error
      console.warn('Image optimization failed, uploading original file.', e);
    }

    return uploadFile({ bucket, file: fileToUpload, path });
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed',
    };
  }
}

// Best-effort client-side image optimization using Canvas/ImageBitmap
async function optimizeImage(
  file: File,
  opts: { maxWidth: number; quality: number }
): Promise<File | null> {
  try {
    const { maxWidth, quality } = opts;

    // Create an image bitmap for more efficient decoding when available
    const blob = file as Blob;

    const createImageBitmapSafe = (input: Blob): Promise<ImageBitmap | HTMLImageElement> => {
      if (typeof createImageBitmap === 'function') {
        return createImageBitmap(input);
      }
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = URL.createObjectURL(input);
      });
    };

    const bitmapOrImg = await createImageBitmapSafe(blob);

    const width =
      'width' in bitmapOrImg ? bitmapOrImg.width : (bitmapOrImg as HTMLImageElement).naturalWidth;
    const height =
      'height' in bitmapOrImg
        ? bitmapOrImg.height
        : (bitmapOrImg as HTMLImageElement).naturalHeight;

    const scale = width > maxWidth ? maxWidth / width : 1;
    const targetWidth = Math.max(1, Math.round(width * scale));
    const targetHeight = Math.max(1, Math.round(height * scale));

    // If no scaling and mime already efficient (jpeg/webp/png), we may still recompress
    const canvas = document.createElement('canvas');
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    if ('close' in bitmapOrImg) {
      // ImageBitmap
      ctx.drawImage(bitmapOrImg as ImageBitmap, 0, 0, targetWidth, targetHeight);
      (bitmapOrImg as ImageBitmap).close?.();
    } else {
      ctx.drawImage(bitmapOrImg as HTMLImageElement, 0, 0, targetWidth, targetHeight);
      URL.revokeObjectURL((bitmapOrImg as HTMLImageElement).src);
    }

    // Prefer WebP for better compression when supported, else JPEG; preserve PNG for PNGs unless resized
    const isPng = file.type === 'image/png';
    const outputType =
      isPng && scale === 1
        ? 'image/png'
        : 'image/webp' in document.createElement('canvas')
          ? 'image/webp'
          : 'image/jpeg';

    const blobOut: Blob = await new Promise((resolve) =>
      canvas.toBlob((b) => resolve(b as Blob), outputType, quality)
    );
    if (!blobOut) return null;

    // Cap name extension to match output type
    const ext = outputType.includes('webp') ? 'webp' : outputType.includes('png') ? 'png' : 'jpg';
    const base = file.name.replace(/\.[^.]+$/, '');
    const optimizedFile = new File([blobOut], `${base}.${ext}`, {
      type: outputType,
      lastModified: Date.now(),
    });
    return optimizedFile;
  } catch (err) {
    console.warn('optimizeImage error', err);
    return null;
  }
}

// Delete file from storage
export async function deleteFile(bucket: UploadBucket, path: string): Promise<boolean> {
  try {
    const supabase = getSupabase();

    const { error } = await supabase.storage.from(bucket).remove([path]);

    if (error) {
      console.error('Delete error:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Delete error:', error);
    return false;
  }
}

// Get signed URL for private files
export async function getSignedUrl(
  bucket: UploadBucket,
  path: string,
  expiresIn = 3600
): Promise<string | null> {
  try {
    const supabase = getSupabase();

    const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, expiresIn);

    if (error) {
      console.error('Signed URL error:', error);
      return null;
    }

    return data.signedUrl;
  } catch (error) {
    console.error('Signed URL error:', error);
    return null;
  }
}

// List files in a bucket path
export async function listFiles(bucket: UploadBucket, path?: string) {
  try {
    const supabase = getSupabase();

    const { data, error } = await supabase.storage.from(bucket).list(path);

    if (error) {
      console.error('List files error:', error);
      return [];
    }

    return data;
  } catch (error) {
    console.error('List files error:', error);
    return [];
  }
}

// Get public URL
export function getPublicUrl(bucket: UploadBucket, path: string): string {
  const supabase = getSupabase();
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}
