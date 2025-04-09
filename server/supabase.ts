import { createClient } from '@supabase/supabase-js';

// Server-side Supabase client
let supabase: any = null;

try {
  // Mock client by default
  supabase = {
    from: () => ({
      select: () => Promise.resolve({ data: [], error: null })
    })
  };
  
  console.log('Server: Using mock Supabase client - data operations will be handled by Drizzle/PostgreSQL');
} catch (error) {
  console.error('Server: Error initializing Supabase client:', error);
  // Provide a fallback that won't crash the application
  supabase = {
    from: () => ({
      select: () => Promise.resolve({ data: [], error: null })
    })
  };
}

export { supabase };