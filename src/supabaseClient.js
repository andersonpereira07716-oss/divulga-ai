import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://teu-projeto.supabase.co'
const SUPABASE_ANON_KEY = 'tua-chave-anonima'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
