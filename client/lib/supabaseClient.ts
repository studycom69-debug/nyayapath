import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL ||
  "https://honbplmyijhdydubzamj.supabase.co";
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhvbmJwbG15aWpoZHlkdWJ6YW1qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU0MjM0MDQsImV4cCI6MjA3MDk5OTQwNH0.YAwYrf0a3YkrTVHvrprP6wE89F7v20cgfAobxmVM_9o";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
