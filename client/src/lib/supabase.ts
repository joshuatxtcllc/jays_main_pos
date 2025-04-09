import { createClient } from '@supabase/supabase-js';

// Browser-safe Supabase client
let supabase;

try {
  // Create a dummy client for SSR/Node.js environments
  if (typeof window === 'undefined') {
    supabase = {
      from: () => ({
        select: () => Promise.resolve({ data: [], error: null }),
        insert: () => Promise.resolve({ data: [], error: null }),
        update: () => Promise.resolve({ data: [], error: null }),
        delete: () => Promise.resolve({ data: null, error: null })
      }),
      auth: {
        signIn: () => Promise.resolve({ user: null, error: null }),
        signOut: () => Promise.resolve({ error: null })
      }
    };
  } else {
    // Browser-only code
    const rawSupabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
    const rawSupabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

    // Validate URL format - ensure it has https:// prefix
    const supabaseUrl = rawSupabaseUrl.startsWith('http')
      ? rawSupabaseUrl
      : `https://${rawSupabaseUrl.replace(/^https?:\/\//, '')}`;

    // Create a mock client if credentials are missing
    if (!rawSupabaseUrl || !rawSupabaseKey) {
      supabase = {
        from: () => ({
          select: () => Promise.resolve({ data: [], error: null }),
          insert: () => Promise.resolve({ data: [], error: null }),
          update: () => Promise.resolve({ data: [], error: null }),
          delete: () => Promise.resolve({ data: null, error: null })
        }),
        auth: {
          signIn: () => Promise.resolve({ user: null, error: null }),
          signOut: () => Promise.resolve({ error: null })
        }
      };
      console.log('Client: Using mock Supabase client - real server data will be used');
    } else {
      // Create the real client
      supabase = createClient(supabaseUrl, rawSupabaseKey);
      console.log('Client: Supabase client initialized successfully');
    }
  }
} catch (error) {
  console.error('Client: Error initializing Supabase client:', error);
  // Provide a fallback that won't crash the application
  supabase = {
    from: () => ({
      select: () => Promise.resolve({ data: [], error: null }),
      insert: () => Promise.resolve({ data: [], error: null }),
      update: () => Promise.resolve({ data: [], error: null }),
      delete: () => Promise.resolve({ data: null, error: null })
    }),
    auth: {
      signIn: () => Promise.resolve({ user: null, error: null }),
      signOut: () => Promise.resolve({ error: null })
    }
  };
}

export { supabase };