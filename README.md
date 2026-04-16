# Bucket List

A simple bucket list app: add items, remove items, list them. Node/Express + Postgres backend, vanilla HTML/JS UI.

## Setup

1. `npm install`
2. Copy `.env.example` to `.env` and fill in the Postgres connection values. The database was provisioned through DevLift — use the connection variables it returned.
3. `npm start`
4. Open http://localhost:3000

## API

- `GET /api/items` — list all items
- `POST /api/items` — body `{ "title": "..." }` — add an item
- `DELETE /api/items/:id` — remove an item
