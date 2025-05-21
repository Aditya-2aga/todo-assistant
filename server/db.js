import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    'Supabase URL or Anon Key is missing. Please check your .env file.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testSupabaseConnection() {
  try {
    const { data, error } = await supabase.from('todos').select('*').limit(1);
    if (error && error.message.includes('relation "todos" does not exist')) {
        console.log('Supabase client configured. Table "todos" not found yet, which is expected if not created.');
    } else if (error) {
        console.error('Error connecting to Supabase or querying:', error.message);
    } else {
        console.log('Successfully connected to Supabase and queried "todos" table.');
    }
  } catch (err) {
    console.error('Supabase client initialization error:', err.message);
  }
}

