'use client';

import {
  createContext,
  useContext,
  useCallback,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from 'react';

const STORAGE_KEY = 'anthropic-api-key';
const API_KEY_PREFIX = 'sk-ant-';

/**
 * Validates that an API key has the correct format
 * Must start with 'sk-ant-'
 */
export function validateApiKey(key: string): { valid: boolean; error?: string } {
  const trimmed = key.trim();
  
  if (!trimmed) {
    return { valid: false, error: 'API key is required' };
  }
  
  if (!trimmed.startsWith(API_KEY_PREFIX)) {
    return { valid: false, error: `API key must start with "${API_KEY_PREFIX}"` };
  }
  
  if (trimmed.length < 20) {
    return { valid: false, error: 'API key is too short' };
  }
  
  return { valid: true };
}

/**
 * Masks an API key for display, showing only the last 4 characters
 */
export function maskApiKey(key: string): string {
  if (!key || key.length < 8) {
    return '••••••••';
  }
  const lastFour = key.slice(-4);
  return `••••••••••••${lastFour}`;
}

// Storage event listeners for cross-tab sync
const listeners = new Set<() => void>();

function subscribe(callback: () => void): () => void {
  listeners.add(callback);
  
  // Handle storage events from other tabs
  const handleStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) {
      callback();
    }
  };
  
  if (typeof window !== 'undefined') {
    window.addEventListener('storage', handleStorage);
  }
  
  return () => {
    listeners.delete(callback);
    if (typeof window !== 'undefined') {
      window.removeEventListener('storage', handleStorage);
    }
  };
}

function notifyListeners() {
  listeners.forEach(listener => listener());
}

function getSnapshot(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && validateApiKey(stored).valid) {
      return stored;
    }
    return null;
  } catch {
    return null;
  }
}

function getServerSnapshot(): string | null {
  return null;
}

interface ApiKeyContextValue {
  /** The current API key (null if not set) */
  apiKey: string | null;
  /** Whether the API key has been loaded from storage */
  isLoaded: boolean;
  /** Whether a valid API key is configured */
  hasValidKey: boolean;
  /** Set a new API key (validates and stores in localStorage) */
  setApiKey: (key: string) => { success: boolean; error?: string };
  /** Clear the stored API key */
  clearApiKey: () => void;
  /** Get the masked version of the current key */
  getMaskedKey: () => string;
}

const ApiKeyContext = createContext<ApiKeyContextValue | null>(null);

interface ApiKeyProviderProps {
  children: ReactNode;
}

/**
 * Provider component for API key management
 * Handles localStorage persistence and validation using useSyncExternalStore
 */
export function ApiKeyProvider({ children }: ApiKeyProviderProps) {
  // Use useSyncExternalStore to sync with localStorage
  const apiKey = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const setApiKey = useCallback((key: string): { success: boolean; error?: string } => {
    const trimmed = key.trim();
    const validation = validateApiKey(trimmed);
    
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }
    
    try {
      localStorage.setItem(STORAGE_KEY, trimmed);
      notifyListeners();
      return { success: true };
    } catch {
      return { success: false, error: 'Failed to save API key to storage' };
    }
  }, []);

  const clearApiKey = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      notifyListeners();
    } catch {
      // Ignore storage errors during clear
    }
  }, []);

  const getMaskedKey = useCallback(() => {
    return apiKey ? maskApiKey(apiKey) : '';
  }, [apiKey]);

  const hasValidKey = useMemo(() => {
    if (!apiKey) return false;
    return validateApiKey(apiKey).valid;
  }, [apiKey]);

  const value = useMemo<ApiKeyContextValue>(() => ({
    apiKey,
    isLoaded: true, // Always loaded when using useSyncExternalStore
    hasValidKey,
    setApiKey,
    clearApiKey,
    getMaskedKey,
  }), [apiKey, hasValidKey, setApiKey, clearApiKey, getMaskedKey]);

  return (
    <ApiKeyContext.Provider value={value}>
      {children}
    </ApiKeyContext.Provider>
  );
}

/**
 * Hook to access the API key context
 * @throws Error if used outside of ApiKeyProvider
 */
export function useApiKey(): ApiKeyContextValue {
  const context = useContext(ApiKeyContext);
  
  if (!context) {
    throw new Error('useApiKey must be used within an ApiKeyProvider');
  }
  
  return context;
}
