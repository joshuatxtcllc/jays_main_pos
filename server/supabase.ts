import { createClient } from '@supabase/supabase-js';

// Server-side Supabase client
let supabase: any = null;

try {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_KEY || process.env.VITE_SUPABASE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
  
  if (supabaseUrl && supabaseKey) {
    // Create the real client if credentials are available
    supabase = createClient(supabaseUrl, supabaseKey);
    console.log('Server: Successfully initialized Supabase client');
  } else {
    // Mock client if credentials are not available
    supabase = {
      from: () => ({
        select: () => Promise.resolve({ data: [], error: null }),
        insert: () => Promise.resolve({ data: [], error: null }),
        update: () => Promise.resolve({ data: [], error: null }),
        delete: () => Promise.resolve({ data: null, error: null }),
        upsert: () => Promise.resolve({ data: null, error: null })
      }),
      rpc: () => Promise.resolve({ data: null, error: null })
    };
    
    console.log('Server: Using mock Supabase client - data operations will be handled by Drizzle/PostgreSQL');
  }
} catch (error) {
  console.error('Server: Error initializing Supabase client:', error);
  // Provide a fallback that won't crash the application
  supabase = {
    from: () => ({
      select: () => Promise.resolve({ data: [], error: null }),
      insert: () => Promise.resolve({ data: [], error: null }),
      update: () => Promise.resolve({ data: [], error: null }),
      delete: () => Promise.resolve({ data: null, error: null }),
      upsert: () => Promise.resolve({ data: null, error: null })
    }),
    rpc: () => Promise.resolve({ data: null, error: null })
  };
}

export { supabase };