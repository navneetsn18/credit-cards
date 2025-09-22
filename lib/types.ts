// Enhanced TypeScript types for the credit card benefits tracker

// Re-export existing types for convenience - import them first
export type { ICardPlatform } from '@/lib/models/Card';

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface DeleteRequest {
  secret: string;
}

export interface ToastOptions {
  title?: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  duration?: number;
}

export interface CacheOperations<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  lastFetched: number | null;
  isStale: boolean;
  fetch: (forceRefresh?: boolean) => Promise<T | null>;
  refresh: () => Promise<T | null>;
  clearCache: () => void;
  mutate: (newData: T) => void;
  invalidate: () => Promise<T | null>;
}

export interface DeleteDialogState {
  open: boolean;
  card: import('@/lib/models/Card').ICardPlatform | null;
}

export interface NotificationState {
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  description?: string;
  id: string;
  timestamp: number;
}


// API Error types for better error handling
export interface IApiError extends Error {
  status?: number;
  code?: string;
  details?: Record<string, unknown>;
}

export class ApiError extends Error implements IApiError {
  constructor(
    message: string,
    public status?: number,
    public code?: string,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Environment configuration types
export interface AppConfig {
  readonly deleteSecret?: string;
  readonly dbUrl?: string;
  readonly nodeEnv: 'development' | 'production' | 'test';
}

// Cache key types for type safety
export type CacheKey = typeof import('@/lib/cache').CACHE_KEYS[keyof typeof import('@/lib/cache').CACHE_KEYS];

// Utility types
export type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};

export type RequireAtLeastOne<T, Keys extends keyof T = keyof T> =
  Pick<T, Exclude<keyof T, Keys>> 
  & {
      [K in Keys]-?: Required<Pick<T, K>> & Partial<Pick<T, Exclude<Keys, K>>>;
  }[Keys];