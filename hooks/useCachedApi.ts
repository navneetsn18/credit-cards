'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { browserCache, CACHE_KEYS, CACHE_TTL } from '@/lib/cache';

interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  lastFetched: number | null;
}

interface UseCachedApiOptions {
  ttl?: number;
  autoFetch?: boolean;
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
}

export function useCachedApi<T>(
  cacheKey: string,
  apiUrl: string,
  options: UseCachedApiOptions = {}
) {
  const {
    ttl = CACHE_TTL.CARDS,
    autoFetch = true,
    onSuccess,
    onError,
  } = options;

  const [state, setState] = useState<ApiState<T>>({
    data: null,
    loading: false,
    error: null,
    lastFetched: null,
  });

  const fetchDataRef = useRef<typeof options.onSuccess | undefined>(undefined);
  const onErrorRef = useRef<typeof options.onError | undefined>(undefined);
  
  // Update refs when callbacks change
  fetchDataRef.current = onSuccess;
  onErrorRef.current = onError;
  
  const fetchData = useCallback(async (forceRefresh = false) => {
    // Check cache first (unless force refresh)
    if (!forceRefresh) {
      const cachedData = browserCache.get<T>(cacheKey);
      if (cachedData) {
        setState(prev => ({
          ...prev,
          data: cachedData,
          loading: false,
          error: null,
          lastFetched: Date.now(),
        }));
        // Call onSuccess if provided
        if (fetchDataRef.current) {
          try {
            fetchDataRef.current(cachedData);
          } catch (callbackError) {
            console.warn('onSuccess callback error:', callbackError);
          }
        }
        return cachedData;
      }
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const response = await fetch(apiUrl);
      
      // Check if response is ok
      if (!response.ok) {
        const errorMsg = `Server error: ${response.status} ${response.statusText}`;
        setState(prev => ({
          ...prev,
          loading: false,
          error: errorMsg,
        }));
        // Call onError if provided
        if (onErrorRef.current) {
          try {
            onErrorRef.current(errorMsg);
          } catch (callbackError) {
            console.warn('onError callback error:', callbackError);
          }
        }
        return null;
      }

      // Check if response is JSON
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const errorMsg = "Server returned invalid response format";
        setState(prev => ({
          ...prev,
          loading: false,
          error: errorMsg,
        }));
        // Call onError if provided
        if (onErrorRef.current) {
          try {
            onErrorRef.current(errorMsg);
          } catch (callbackError) {
            console.warn('onError callback error:', callbackError);
          }
        }
        return null;
      }

      const result = await response.json();

      if (result.success) {
        const data = result.data || result;
        
        // Cache the data
        browserCache.set(cacheKey, data, ttl);
        
        setState({
          data,
          loading: false,
          error: null,
          lastFetched: Date.now(),
        });
        
        // Call onSuccess if provided
        if (fetchDataRef.current) {
          try {
            fetchDataRef.current(data);
          } catch (callbackError) {
            console.warn('onSuccess callback error:', callbackError);
          }
        }
        return data;
      } else {
        const errorMsg = result.message || 'Failed to fetch data';
        setState(prev => ({
          ...prev,
          loading: false,
          error: errorMsg,
        }));
        // Call onError if provided
        if (onErrorRef.current) {
          try {
            onErrorRef.current(errorMsg);
          } catch (callbackError) {
            console.warn('onError callback error:', callbackError);
          }
        }
        return null;
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Network error';
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMsg,
      }));
      // Call onError if provided
      if (onErrorRef.current) {
        try {
          onErrorRef.current(errorMsg);
        } catch (callbackError) {
          console.warn('onError callback error:', callbackError);
        }
      }
      return null;
    }
  }, [cacheKey, apiUrl, ttl]);

  const refresh = useCallback(() => {
    return fetchData(true);
  }, [fetchData]);

  const clearCache = useCallback(() => {
    browserCache.delete(cacheKey);
    setState(prev => ({
      ...prev,
      data: null,
      lastFetched: null,
    }));
  }, [cacheKey]);

  // Auto-fetch on mount - use a simple approach
  useEffect(() => {
    if (autoFetch) {
      // Check if we already have cached data
      const cachedData = browserCache.get<T>(cacheKey);
      if (!cachedData) {
        fetchData();
      } else {
        setState(prev => ({
          ...prev,
          data: cachedData,
          loading: false,
          error: null,
          lastFetched: Date.now(),
        }));
        // Call onSuccess if provided
        if (fetchDataRef.current) {
          try {
            fetchDataRef.current(cachedData);
          } catch (callbackError) {
            console.warn('onSuccess callback error:', callbackError);
          }
        }
      }
    }
  }, [autoFetch, cacheKey, fetchData]); // Include necessary dependencies

  const mutate = useCallback((newData: T) => {
    // Update cache and state with new data
    browserCache.set(cacheKey, newData, ttl);
    setState(prev => ({
      ...prev,
      data: newData,
      lastFetched: Date.now(),
      error: null,
    }));
  }, [cacheKey, ttl]);

  const invalidate = useCallback(() => {
    // Clear cache and refresh data
    browserCache.delete(cacheKey);
    return fetchData(true);
  }, [cacheKey, fetchData]);

  return {
    ...state,
    fetch: fetchData,
    refresh,
    clearCache,
    mutate,
    invalidate,
    isStale: state.lastFetched ? Date.now() - state.lastFetched > ttl : true,
  };
}

// Specialized hooks for common API calls
export function useCachedCards(options?: UseCachedApiOptions) {
  return useCachedApi(CACHE_KEYS.CARDS, '/api/cards', {
    ttl: CACHE_TTL.CARDS,
    ...options,
  });
}

export function useCachedCardNames(options?: UseCachedApiOptions) {
  const result = useCachedApi(CACHE_KEYS.CARD_NAMES, '/api/cards/names', {
    ttl: CACHE_TTL.CARD_NAMES,
    ...options,
  });
  
  // Log errors but don't throw them
  if (result.error) {
    console.warn('Card names API error:', result.error);
  }
  
  return result;
}

export function useCachedPermissions(options?: UseCachedApiOptions) {
  return useCachedApi(CACHE_KEYS.PERMISSIONS, '/api/permissions', {
    ttl: CACHE_TTL.PERMISSIONS,
    autoFetch: true, // Always fetch on mount
    ...options,
  });
}