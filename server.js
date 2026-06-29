import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Missing Supabase configuration in .env');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

app.use(cors());
app.use(express.json());
app.use(express.static('.'));

app.get('/api/reviews', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ error: 'Could not load reviews' });
  }
});

app.post('/api/reviews', async (req, res) => {
  const { name, date, stars, content } = req.body;

  if (!name || !stars || !content || !date) {
    return res.status(400).json({ error: 'Missing review fields' });
  }

  try {
    const { data, error } = await supabase
      .from('reviews')
      .insert([
        {
          name,
          date,
          stars,
          content
        }
      ])
      .select();

    if (error) throw error;
    const savedReview = Array.isArray(data) ? data[0] : data;
    if (!savedReview) {
      throw new Error('No review returned after insert');
    }

    res.status(201).json(savedReview);
  } catch (error) {
    console.error('Error saving review:', error);
    res.status(500).json({ error: 'Could not save review' });
  }
});

app.listen(PORT, () => {
  console.log(`Server started on http://localhost:${PORT}`);
});
