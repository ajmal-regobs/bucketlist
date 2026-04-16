require('dotenv').config();
const express = require('express');
const path = require('path');
const { Pool } = require('pg');

const DATABASE_URL = `postgresql://${encodeURIComponent(process.env.POSTGRES_USER)}:${encodeURIComponent(process.env.POSTGRES_PASSWORD)}@${process.env.POSTGRES_HOST}:${process.env.POSTGRES_PORT || '5432'}/${process.env.POSTGRES_DATABASE}`;

const pool = new Pool({ connectionString: DATABASE_URL });

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

async function init() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS bucket_items (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);
}

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

app.get('/api/items', async (_req, res) => {
  const { rows } = await pool.query('SELECT id, title, created_at FROM bucket_items ORDER BY created_at DESC');
  res.json(rows);
});

app.post('/api/items', async (req, res) => {
  const title = (req.body.title || '').trim();
  if (!title) return res.status(400).json({ error: 'title is required' });
  const { rows } = await pool.query(
    'INSERT INTO bucket_items (title) VALUES ($1) RETURNING id, title, created_at',
    [title]
  );
  res.status(201).json(rows[0]);
});

app.delete('/api/items/:id', async (req, res) => {
  const { rowCount } = await pool.query('DELETE FROM bucket_items WHERE id = $1', [req.params.id]);
  if (rowCount === 0) return res.status(404).json({ error: 'not found' });
  res.status(204).end();
});

const PORT = process.env.PORT || 3000;
init()
  .then(() => app.listen(PORT, () => console.log(`Bucket list running on http://localhost:${PORT}`)))
  .catch((err) => {
    console.error('Startup failed:', err);
    process.exit(1);
  });
