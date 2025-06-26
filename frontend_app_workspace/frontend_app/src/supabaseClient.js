import { createClient } from "@supabase/supabase-js";

/**
 * Supabase client singleton for authentication and data access.
 * Do NOT commit private credentials to public repositories.
 * Environment variables should be used in production builds.
 */
const SUPABASE_URL = "https://rquvaaymanduddbwktxk.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJxdXZhYXltYW5kdWRkYndrdHhrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4MTkwOTcsImV4cCI6MjA2NjM5NTA5N30.iT_cuWebAjeMangmiYSbyutvYab4TlEBZU19QZhR0ss";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
