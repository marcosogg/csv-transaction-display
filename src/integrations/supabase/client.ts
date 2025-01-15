import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://guroogfbqsjpqdggimbg.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd1cm9vZ2ZicXNqcHFkZ2dpbWJnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU5MjgzODQsImV4cCI6MjA1MTUwNDM4NH0.phcGdYbQY-B4L7tm3npYtBwSSdLzM4KqJ5JRJRWu7Hg";

export const supabase = createClient<Database>(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    }
  }
);