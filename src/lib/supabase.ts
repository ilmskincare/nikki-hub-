import { createClient } from '@supabase/supabase-js';

// Server-side client — uses service role key to bypass RLS
export const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_ANON_KEY!
);
