import { getSupabaseClient } from '../supabase/client';

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
    const supabase = getSupabaseClient();

    // Generate unique filename if path not provided
    const fileName = path || `${Date.now()}-${file.name}`;

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, file, {
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

    // For now, upload directly
    // TODO: Add client-side image optimization
    return uploadFile({ bucket, file, path });
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed',
    };
  }
}

// Delete file from storage
export async function deleteFile(bucket: UploadBucket, path: string): Promise<boolean> {
  try {
    const supabase = getSupabaseClient();

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
    const supabase = getSupabaseClient();

    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(path, expiresIn);

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
    const supabase = getSupabaseClient();

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
  const supabase = getSupabaseClient();
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}
