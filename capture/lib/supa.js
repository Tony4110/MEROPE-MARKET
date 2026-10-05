// Client Supabase service-role (écriture OS). Les clés viennent des secrets GitHub ;
// jamais en clair dans le code.
import { createClient } from '@supabase/supabase-js';

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE;

if (!url || !key) {
  console.error('ERREUR: SUPABASE_URL et SUPABASE_SERVICE_ROLE requis (secrets GitHub).');
  process.exit(1);
}

export const sb = createClient(url, key, { auth: { persistSession: false } });
export const TODAY = new Date().toISOString().slice(0, 10);
