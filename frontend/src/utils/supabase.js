import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://snjfnfibgeqieamqqjtd.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNuamZuZmliZ2VxaWVhbXFxanRkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA5MTExNzMsImV4cCI6MjA4NjQ4NzE3M30.Z9rSSBM3cn45N0o7sRsKdyWoijKzOfgHO4FCskyaxUc';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);