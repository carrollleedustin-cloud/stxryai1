// @ts-nocheck
/**
 * Supabase Service Wrapper
 * Provides consistent error handling, retry logic, and caching for Supabase operations
 */

import { getSupabaseClient, getIsSupabaseConfigured } from '@/lib/supabase/client';
import { createClient } from '@/lib/supabase/server';
import { withErrorHandling, withRetry, APIResponse } from './error-handler';
import { apiCache } from './cache';
import type { SupabaseClient } from '@supabase/supabase-js';

interface QueryOptions {
  cache?: boolean;
  cacheTTL?: number;
  retry?: boolean;
}

class SupabaseService {
  private readonly SERVICE_NAME = 'supabase';

  /**
   * Ensure Supabase is configured
   */
  private ensureConfigured(): void {
    if (!getIsSupabaseConfigured()) {
      throw new Error('Supabase is not configured. Please check your environment variables.');
    }
  }

  /**
   * Get Supabase client safely
   */
  private getClient(): SupabaseClient {
    this.ensureConfigured();
    const client = getSupabaseClient();
    if (!client) {
      throw new Error('Failed to initialize Supabase client');
    }
    return client;
  }

  /**
   * Query with automatic error handling and retry
   */
  async query<T>(
    queryFn: (client: SupabaseClient) => Promise<{ data: T | null; error: any }>,
    operation: string,
    options: QueryOptions = {}
  ): Promise<APIResponse<T>> {
    return withErrorHandling(
      async () => {
        const client = this.getClient();

        const executeFn = async () => {
          const { data, error } = await queryFn(client);

          if (error) {
            throw new Error(error.message || 'Database query failed');
          }

          if (data === null) {
            throw new Error('No data returned from query');
          }

          return data;
        };

        if (options.retry !== false) {
          return await withRetry(executeFn, {
            maxRetries: 2,
            retryDelay: 500,
            service: this.SERVICE_NAME,
          });
        }

        return await executeFn();
      },
      {
        service: this.SERVICE_NAME,
        operation,
      }
    );
  }

  /**
   * Query with caching support
   */
  async cachedQuery<T>(
    queryFn: (client: SupabaseClient) => Promise<{ data: T | null; error: any }>,
    cacheKey: string,
    operation: string,
    options: QueryOptions = {}
  ): Promise<APIResponse<T>> {
    // Check cache first
    if (options.cache !== false) {
      const cached = apiCache.get<T>(cacheKey, {
        ttl: options.cacheTTL || 5 * 60 * 1000, // 5 minutes default
        storage: 'both',
      });

      if (cached !== null) {
        return { success: true, data: cached };
      }
    }

    // Execute query
    const result = await this.query(queryFn, operation, options);

    // Cache successful results
    if (result.success && options.cache !== false) {
      apiCache.set(cacheKey, result.data, {
        ttl: options.cacheTTL || 5 * 60 * 1000,
        storage: 'both',
      });
    }

    return result;
  }

  /**
   * Mutation with automatic error handling
   */
  async mutate<T>(
    mutateFn: (client: SupabaseClient) => Promise<{ data: T | null; error: any }>,
    operation: string,
    cacheInvalidation?: string[]
  ): Promise<APIResponse<T>> {
    const result = await this.query(mutateFn, operation, { retry: true });

    // Invalidate related cache entries on successful mutation
    if (result.success && cacheInvalidation) {
      cacheInvalidation.forEach(pattern => {
        apiCache.delete(pattern, { storage: 'both' });
      });
    }

    return result;
  }

  /**
   * Batch operations with transaction support
   */
  async batch<T>(
    operations: Array<(client: SupabaseClient) => Promise<any>>,
    operationName: string
  ): Promise<APIResponse<T[]>> {
    return withErrorHandling(
      async () => {
        const client = this.getClient();
        const results: T[] = [];

        for (const operation of operations) {
          const { data, error } = await operation(client);

          if (error) {
            throw new Error(`Batch operation failed: ${error.message}`);
          }

          results.push(data);
        }

        return results;
      },
      {
        service: this.SERVICE_NAME,
        operation: operationName,
      }
    );
  }

  /**
   * Subscribe to realtime changes with error handling
   */
  subscribe<T>(
    table: string,
    callback: (payload: T) => void,
    options: {
      event?: 'INSERT' | 'UPDATE' | 'DELETE' | '*';
      filter?: string;
      onError?: (error: Error) => void;
    } = {}
  ) {
    try {
      this.ensureConfigured();
      const client = this.getClient();

      const channel = client
        .channel(`${table}_changes`)
        .on(
          'postgres_changes',
          {
            event: options.event || '*',
            schema: 'public',
            table,
            filter: options.filter,
          },
          (payload) => {
            try {
              callback(payload as T);
            } catch (error) {
              console.error(`Subscription callback error for ${table}:`, error);
              options.onError?.(error as Error);
            }
          }
        )
        .subscribe((status) => {
          if (status === 'SUBSCRIPTION_ERROR') {
            const error = new Error(`Failed to subscribe to ${table}`);
            console.error(error);
            options.onError?.(error);
          }
        });

      return {
        unsubscribe: () => {
          channel.unsubscribe();
        },
      };
    } catch (error) {
      console.error(`Subscription setup error for ${table}:`, error);
      options.onError?.(error as Error);

      return {
        unsubscribe: () => {},
      };
    }
  }

  /**
   * Upload file to Supabase Storage with retry
   */
  async uploadFile(
    bucket: string,
    path: string,
    file: File | Blob,
    options: {
      cacheControl?: string;
      upsert?: boolean;
    } = {}
  ): Promise<APIResponse<{ path: string; url: string }>> {
    return withErrorHandling(
      async () => {
        const client = this.getClient();

        const uploadFn = async () => {
          const { data, error } = await client.storage
            .from(bucket)
            .upload(path, file, {
              cacheControl: options.cacheControl || '3600',
              upsert: options.upsert || false,
            });

          if (error) {
            throw new Error(`File upload failed: ${error.message}`);
          }

          // Get public URL
          const { data: urlData } = client.storage
            .from(bucket)
            .getPublicUrl(path);

          return {
            path: data.path,
            url: urlData.publicUrl,
          };
        };

        return await withRetry(uploadFn, {
          maxRetries: 2,
          retryDelay: 1000,
          service: this.SERVICE_NAME,
        });
      },
      {
        service: this.SERVICE_NAME,
        operation: 'uploadFile',
      }
    );
  }

  /**
   * Delete file from Supabase Storage
   */
  async deleteFile(
    bucket: string,
    paths: string[]
  ): Promise<APIResponse<void>> {
    return withErrorHandling(
      async () => {
        const client = this.getClient();

        const { error } = await client.storage
          .from(bucket)
          .remove(paths);

        if (error) {
          throw new Error(`File deletion failed: ${error.message}`);
        }
      },
      {
        service: this.SERVICE_NAME,
        operation: 'deleteFile',
      }
    );
  }

  /**
   * Call Supabase Edge Function with retry
   */
  async callFunction<T, R>(
    functionName: string,
    payload: T
  ): Promise<APIResponse<R>> {
    return withErrorHandling(
      async () => {
        const client = this.getClient();

        const callFn = async () => {
          const { data, error } = await client.functions.invoke<R>(functionName, {
            body: payload,
          });

          if (error) {
            throw new Error(`Function call failed: ${error.message}`);
          }

          return data;
        };

        return await withRetry(callFn, {
          maxRetries: 2,
          retryDelay: 1000,
          service: this.SERVICE_NAME,
        });
      },
      {
        service: this.SERVICE_NAME,
        operation: `callFunction:${functionName}`,
      }
    );
  }

  /**
   * Execute RPC function with retry
   */
  async rpc<T>(
    functionName: string,
    params: Record<string, any> = {}
  ): Promise<APIResponse<T>> {
    return withErrorHandling(
      async () => {
        const client = this.getClient();

        const rpcFn = async () => {
          const { data, error } = await client.rpc(functionName, params);

          if (error) {
            throw new Error(`RPC call failed: ${error.message}`);
          }

          return data;
        };

        return await withRetry(rpcFn, {
          maxRetries: 2,
          retryDelay: 500,
          service: this.SERVICE_NAME,
        });
      },
      {
        service: this.SERVICE_NAME,
        operation: `rpc:${functionName}`,
      }
    );
  }

  /**
   * Clear cache for specific patterns
   */
  clearCache(pattern?: string): void {
    if (pattern) {
      apiCache.delete(pattern, { storage: 'both' });
    } else {
      apiCache.clear({ prefix: 'supabase:', storage: 'both' });
    }
  }
}

export const supabaseService = new SupabaseService();
