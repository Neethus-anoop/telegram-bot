const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing SUPABASE_URL or SUPABASE_KEY environment variables');
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function saveMessage(userId, message) {
  const { data, error } = await supabase
    .from('messages')
    .insert([{ user_id: userId, message }]);

  if (error) {
    console.error('Supabase saveMessage error:', error);
    throw error;
  }

  console.log('Supabase saved message:', data);
  return data;
}

async function searchMessage(text) {
  if (!text) {
    return [];
  }

  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .ilike('message', `%${text}%`);

  if (error) {
    console.error('Supabase searchMessage error:', error);
    return [];
  }

  return data || [];
}

module.exports = { saveMessage, searchMessage };