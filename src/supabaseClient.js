import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Verificar si se están usando credenciales de marcador de posición o si faltan
const isPlaceholder = 
  supabaseUrl.includes('placeholder') || 
  supabaseAnonKey.includes('placeholder') || 
  !supabaseUrl || 
  !supabaseAnonKey;

export const isSupabaseConfigured = !isPlaceholder;

// Inicializar el cliente de Supabase solo si está configurado
export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;
