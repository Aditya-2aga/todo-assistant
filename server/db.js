// server/db.js
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    'Supabase URL or Anon Key is missing. Please check your .env file.'
  );
  // process.exit(1); // Optionally exit if Supabase is critical for startup
}

// Create a single supabase client for interacting with your database
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Test Supabase connection (optional)
async function testSupabaseConnection() {
  try {
    // Try to fetch a small amount of data or check status
    // For example, trying to fetch from a non-existent table to see if client is configured
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

// You might want to call this only during development or specific debug modes
// testSupabaseConnection();
