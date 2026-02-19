-- Run this in Supabase SQL Editor (supabase.com → your project → SQL Editor)

-- Chat message history
create table if not exists messages (
  id uuid default gen_random_uuid() primary key,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  created_at timestamptz default now()
);

-- Tasks
create table if not exists tasks (
  id uuid default gen_random_uuid() primary key,
  text text not null,
  done boolean default false,
  created_at timestamptz default now()
);

-- Notes (also used for journal entries — journal entries have title starting with '[journal]')
create table if not exists notes (
  id uuid default gen_random_uuid() primary key,
  title text,
  content text not null default '',
  updated_at timestamptz default now()
);

-- Memory — single row, id=1, holds CLAUDE.md content
create table if not exists memory (
  id int primary key default 1,
  content text not null default '',
  updated_at timestamptz default now()
);

-- Insert placeholder memory row
insert into memory (id, content) values (1, '')
on conflict (id) do nothing;
