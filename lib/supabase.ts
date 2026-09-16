import { createClient } from "@supabase/supabase-js";

// Public anon client — RLS kuralları select'i zaten herkese açık tutuyor,
// bu yüzden public sayfalarda service-role key'e hiç gerek yok.
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
