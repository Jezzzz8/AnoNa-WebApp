// lib/supabase.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Only create client if both values exist, otherwise return a dummy that logs
let supabaseClient = null;
if (supabaseUrl && supabaseAnonKey) {
  supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
} else {
  console.warn('Supabase credentials missing. Please check your .env file.');
}

// Proxy to prevent crashes when offline or missing env
export const supabase = new Proxy({}, {
  get(target, prop) {
    if (!supabaseClient) {
      console.error(`Supabase client not initialized. Attempted to call "${prop}".`);
      // Return a dummy function/object that won't crash
      return () => Promise.reject(new Error('Supabase not configured'));
    }
    const value = supabaseClient[prop];
    if (typeof value === 'function') {
      return value.bind(supabaseClient);
    }
    return value;
  }
});