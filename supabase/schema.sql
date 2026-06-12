-- 便了么 — Supabase 数据库结构（在 SQL Editor 中执行，或作为迁移基线）
-- 依赖：
--   1. Authentication → Email 登录已开启
--   2. Authentication → Anonymous sign-ins（游客体验，可选）

-- -----------------------------------------------------------------------------
-- 用户资料（与 auth.users 一对一）
-- -----------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null default '旅行者',
  avatar_url text,
  phone text,
  birthday date,
  gender text check (gender in ('male', 'female', 'other')),
  location text,
  onboarding_completed boolean not null default false,
  health_score int not null default 80,
  streak int not null default 0,
  updated_at timestamptz not null default now()
);

alter table public.profiles
  add column if not exists phone text,
  add column if not exists birthday date,
  add column if not exists gender text check (gender in ('male', 'female', 'other')),
  add column if not exists location text,
  add column if not exists onboarding_completed boolean not null default false;

-- -----------------------------------------------------------------------------
-- 排便记录
-- -----------------------------------------------------------------------------
create table if not exists public.bowel_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  record_date date not null,
  record_time text not null,
  type text not null check (type in ('normal', 'constipation', 'diarrhea', 'other')),
  shape int not null,
  color text not null,
  duration int not null,
  note text,
  created_at timestamptz not null default now()
);

alter table public.bowel_records
  add column if not exists weight int,
  add column if not exists feeling text check (feeling in ('light', 'normal', 'strained', 'urgent')),
  add column if not exists mood_tag text,
  add column if not exists poop_avatar text,
  add column if not exists score int;

create index if not exists bowel_records_user_date_idx
  on public.bowel_records (user_id, record_date desc);

-- -----------------------------------------------------------------------------
-- 提醒事项
-- -----------------------------------------------------------------------------
create table if not exists public.reminders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  time_of_day text not null,
  enabled boolean not null default true,
  frequency text not null default 'daily' check (frequency in ('daily', 'weekly', 'once')),
  created_at timestamptz not null default now()
);

create index if not exists reminders_user_idx on public.reminders (user_id);

-- -----------------------------------------------------------------------------
-- 社区动态（作者展示字段冗余，便于种子数据与后续扩展）
-- -----------------------------------------------------------------------------
create table if not exists public.community_posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid references public.profiles (id) on delete set null,
  author_name text not null,
  author_avatar text not null,
  content text not null,
  likes_count int not null default 0,
  comments_count int not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists community_posts_created_idx
  on public.community_posts (created_at desc);

-- -----------------------------------------------------------------------------
-- 点赞（触发器同步 likes_count）
-- -----------------------------------------------------------------------------
create table if not exists public.post_likes (
  post_id uuid not null references public.community_posts (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  primary key (post_id, user_id)
);

create or replace function public.sync_post_likes_count()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    update public.community_posts
    set likes_count = likes_count + 1
    where id = new.post_id;
    return new;
  elsif tg_op = 'DELETE' then
    update public.community_posts
    set likes_count = greatest(0, likes_count - 1)
    where id = old.post_id;
    return old;
  end if;
  return null;
end;
$$;

drop trigger if exists trg_post_likes_ins on public.post_likes;
create trigger trg_post_likes_ins
  after insert on public.post_likes
  for each row execute function public.sync_post_likes_count();

drop trigger if exists trg_post_likes_del on public.post_likes;
create trigger trg_post_likes_del
  after delete on public.post_likes
  for each row execute function public.sync_post_likes_count();

-- -----------------------------------------------------------------------------
-- 评论（触发器同步 comments_count）
-- -----------------------------------------------------------------------------
create table if not exists public.post_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.community_posts (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  author_name text not null,
  author_avatar text not null,
  content text not null,
  created_at timestamptz not null default now()
);

create index if not exists post_comments_post_idx
  on public.post_comments (post_id, created_at asc);

create or replace function public.sync_post_comments_count()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    update public.community_posts
    set comments_count = comments_count + 1
    where id = new.post_id;
    return new;
  elsif tg_op = 'DELETE' then
    update public.community_posts
    set comments_count = greatest(0, comments_count - 1)
    where id = old.post_id;
    return old;
  end if;
  return null;
end;
$$;

drop trigger if exists trg_post_comments_ins on public.post_comments;
create trigger trg_post_comments_ins
  after insert on public.post_comments
  for each row execute function public.sync_post_comments_count();

drop trigger if exists trg_post_comments_del on public.post_comments;
create trigger trg_post_comments_del
  after delete on public.post_comments
  for each row execute function public.sync_post_comments_count();

-- -----------------------------------------------------------------------------
-- 新用户自动创建 profile
-- -----------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (
    new.id,
    '旅行者',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=' || replace(new.id::text, '-', '')
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- -----------------------------------------------------------------------------
-- 健康报告（周报 / 月报等聚合结果）
-- -----------------------------------------------------------------------------
create table if not exists public.health_reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  period_type text not null check (period_type in ('weekly', 'monthly')),
  period_start date not null,
  period_end date not null,
  summary text not null,
  score int not null,
  created_at timestamptz not null default now()
);

create index if not exists health_reports_user_period_idx
  on public.health_reports (user_id, period_type, period_start desc);

-- -----------------------------------------------------------------------------
-- 隐私设置（客户端隐私开关持久化）
-- -----------------------------------------------------------------------------
create table if not exists public.privacy_settings (
  user_id uuid primary key references auth.users (id) on delete cascade,
  share_anonymized_stats boolean not null default false,
  allow_research_use boolean not null default false,
  show_in_community boolean not null default true,
  updated_at timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- AI 对话消息（后续可用于上下文与审计）
-- -----------------------------------------------------------------------------
create table if not exists public.ai_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  created_at timestamptz not null default now()
);

create index if not exists ai_messages_user_created_idx
  on public.ai_messages (user_id, created_at desc);

-- -----------------------------------------------------------------------------
-- Row Level Security
-- -----------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.bowel_records enable row level security;
alter table public.reminders enable row level security;
alter table public.community_posts enable row level security;
alter table public.post_likes enable row level security;
alter table public.post_comments enable row level security;
alter table public.health_reports enable row level security;
alter table public.privacy_settings enable row level security;
alter table public.ai_messages enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
drop policy if exists "profiles_update_own" on public.profiles;
drop policy if exists "bowel_records_crud_own" on public.bowel_records;
drop policy if exists "reminders_crud_own" on public.reminders;
drop policy if exists "community_posts_read_authenticated" on public.community_posts;
drop policy if exists "post_likes_select_own" on public.post_likes;
drop policy if exists "post_likes_insert_own" on public.post_likes;
drop policy if exists "post_likes_delete_own" on public.post_likes;
drop policy if exists "post_comments_read_authenticated" on public.post_comments;
drop policy if exists "post_comments_insert_own" on public.post_comments;
drop policy if exists "post_comments_delete_own" on public.post_comments;
drop policy if exists "health_reports_crud_own" on public.health_reports;
drop policy if exists "privacy_settings_crud_own" on public.privacy_settings;
drop policy if exists "ai_messages_crud_own" on public.ai_messages;

create policy "profiles_select_own"
  on public.profiles for select using (auth.uid() = id);
create policy "profiles_update_own"
  on public.profiles for update using (auth.uid() = id);

create policy "bowel_records_crud_own"
  on public.bowel_records for all using (auth.uid() = user_id);

create policy "reminders_crud_own"
  on public.reminders for all using (auth.uid() = user_id);

create policy "community_posts_read_authenticated"
  on public.community_posts for select to authenticated using (true);

create policy "post_likes_select_own"
  on public.post_likes for select using (auth.uid() = user_id);
create policy "post_likes_insert_own"
  on public.post_likes for insert with check (auth.uid() = user_id);
create policy "post_likes_delete_own"
  on public.post_likes for delete using (auth.uid() = user_id);

create policy "post_comments_read_authenticated"
  on public.post_comments for select to authenticated using (true);
create policy "post_comments_insert_own"
  on public.post_comments for insert with check (auth.uid() = user_id);
create policy "post_comments_delete_own"
  on public.post_comments for delete using (auth.uid() = user_id);

create policy "health_reports_crud_own"
  on public.health_reports for all using (auth.uid() = user_id);

create policy "privacy_settings_crud_own"
  on public.privacy_settings for all using (auth.uid() = user_id);

create policy "ai_messages_crud_own"
  on public.ai_messages for all using (auth.uid() = user_id);
