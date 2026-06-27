import { createClient } from '@supabase/supabase-js'

// Chaves públicas do projeto TechStack Manager
const SUPABASE_URL = 'https://zlutseikwyqraaoqzpkm.supabase.co'
const SUPABASE_KEY = 'sb_publishable_PWVFR-r8VHiKgj7xkVLsfQ_B2_povNB'

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)
