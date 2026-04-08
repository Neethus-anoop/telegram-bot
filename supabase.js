const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

async function saveMessage(userId, message) {
  const { data, error } = await supabase
    .from('messages')
    .insert([{ user_id: userId, message }]);

  if (error) {
    console.log("Error:", error);
  } else {
    console.log("Saved:", data);
  }
}

async function searchMessage(text) {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .ilike('message', `%${text}%`);

  if (error) {
    console.log("Search Error:", error);
    return [];
  }

  return data;
}

module.exports = { saveMessage, searchMessage };