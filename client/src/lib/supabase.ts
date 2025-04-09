import { createClient } from '@supabase/supabase-js';

// Browser-safe Supabase client
const getSupabaseClient = () => {
  // Create a dummy client for SSR/Node.js environments
  if (typeof window === 'undefined') {
    return {
      from: () => ({
        select: () => Promise.resolve({ data: [], error: null })
      })
    };
  }

  try {
    // Browser-only code
    const rawSupabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
    const rawSupabaseKey = import.meta.env.VITE_SUPABASE_KEY || '';

    // Validate URL format - ensure it has https:// prefix
    const supabaseUrl = rawSupabaseUrl.startsWith('http') 
      ? rawSupabaseUrl 
      : `https://${rawSupabaseUrl.replace(/^https?:\/\//, '')}`;

    if (!rawSupabaseUrl || !rawSupabaseKey) {
      console.error('Client: Supabase URL and key must be provided');
      // Create a mock client that won't throw errors
      return {
        from: () => ({
          select: () => Promise.resolve({ data: [], error: null })
        })
      };
    }

    // Create the real client
    const client = createClient(supabaseUrl, rawSupabaseKey);
    console.log('Client: Supabase client initialized successfully');
    return client;
  } catch (error) {
    console.error('Client: Error initializing Supabase client:', error);
    // Provide a fallback that won't crash the application
    return {
      from: () => ({
        select: () => Promise.resolve({ data: [], error: null })
      })
    };
  }
};

export const supabase = getSupabaseClient();
