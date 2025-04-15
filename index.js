require('dotenv').config();
const express = require('express');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const port = 3000;

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

app.get('/tickets', async (req, res) => {
  const { data, error } = await supabase
    .from('ticket_info')
    .select('*');

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json(data);
});

app.post('/check-in/:id', async (req, res) => {
  const { id } = req.params;

  // Step 1: Check if already checked in
  const { data: existingLog, error: checkError } = await supabase
    .from('check_in_log')
    .select('id')
    .eq('ticket_id', id)
    .single();

  if (checkError && checkError.code !== 'PGRST116') { // ignore 'No rows found'
    return res.status(500).json({ error: checkError.message });
  }

  if (existingLog) {
    return res.status(400).json({ error: 'Ticket already checked in' });
  }

  // Step 2: Update ticket_info
  const { data: updatedTicket, error: updateError } = await supabase
    .from('ticket_info')
    .update({ attendance: true })
    .eq('id', id)
    .select()
    .single();

  if (updateError) {
    return res.status(500).json({ error: updateError.message });
  }

  // Step 3: Log the check-in
  const { error: logError } = await supabase
    .from('check_in_log')
    .insert([{ ticket_id: id }]);

  if (logError) {
    return res.status(500).json({ error: logError.message });
  }

  res.json({
    message: 'Checked in successfully',
    ticket: updatedTicket
  });
});

app.listen(port, () => {
  console.log(`🚀 Server listening on http://localhost:${port}`);
});
