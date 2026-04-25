import { createClient } from '@supabase/supabase-js'

// Using environment variables for security in production
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

let supabaseClient;

try {
  if (!supabaseUrl || !supabaseUrl.startsWith('https://')) {
    throw new Error('Invalid or missing Supabase URL');
  }
  supabaseClient = createClient(supabaseUrl, supabaseKey);
} catch (e) {
  console.warn('Supabase not initialized:', e.message);
  // Mock client to prevent crashes while waiting for environment variables
  supabaseClient = {
    from: (table) => ({
      select: () => ({ 
        order: () => Promise.resolve({ data: [], error: null }),
        single: () => Promise.resolve({ data: null, error: null }),
        eq: () => ({ single: () => Promise.resolve({ data: null, error: null }) })
      }),
      insert: (data) => ({
        select: () => {
          console.warn(`MOCK INSERT to ${table}:`, data);
          return Promise.resolve({ data: data, error: null });
        }
      }),
      update: () => ({ eq: () => Promise.resolve({ data: null, error: null }) }),
      delete: () => ({ eq: () => Promise.resolve({ data: null, error: null }) })
    }),
    channel: () => ({ on: () => ({ on: () => ({ on: () => ({ subscribe: () => ({}) }) }) }), subscribe: () => ({}) }),
    removeChannel: () => {}
  };
}

export const supabase = supabaseClient;
