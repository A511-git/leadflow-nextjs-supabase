import { createClient } from '@supabase/supabase-js'
import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://your-project-id.supabase.co'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key-here'

// Client-side Supabase client
export const supabase = createClient(supabaseUrl, supabaseKey)

// Browser client for SSR
export const createSupabaseBrowserClient = () => {
  return createBrowserClient(supabaseUrl, supabaseKey)
}

// Database types
export type Database = {
} 