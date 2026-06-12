import type { FriendPost, OnboardingData, PostComment, Record, Reminder, UserProfile } from '@/types';
import { getSupabase } from '@/lib/supabaseClient';

type ProfileRow = {
  id: string;
  display_name: string;
  avatar_url: string | null;
  phone: string | null;
  birthday: string | null;
  gender: UserProfile['gender'];
  location: string | null;
  onboarding_completed: boolean;
};

type BowelRow = {
  id: string;
  user_id: string;
  record_date: string;
  record_time: string;
  type: string;
  shape: number;
  color: string;
  duration: number;
  weight: number | null;
  feeling: Record['feeling'] | null;
  mood_tag: string | null;
  poop_avatar: string | null;
  score: number | null;
  note: string | null;
};

type ReminderRow = {
  id: string;
  title: string;
  time_of_day: string;
  enabled: boolean;
  frequency: string;
};

type PostRow = {
  id: string;
  author_name: string;
  author_avatar: string;
  content: string;
  likes_count: number;
  comments_count: number;
  created_at: string;
};

export function formatRelativeTime(iso: string): string {
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return '刚刚';
  const sec = Math.floor((Date.now() - t) / 1000);
  if (sec < 60) return '刚刚';
  if (sec < 3600) return `${Math.floor(sec / 60)}分钟前`;
  if (sec < 86400) return `${Math.floor(sec / 3600)}小时前`;
  return `${Math.floor(sec / 86400)}天前`;
}

function mapBowelRow(row: BowelRow): Record {
  return {
    id: row.id,
    date: row.record_date,
    time: row.record_time,
    type: row.type as Record['type'],
    shape: row.shape,
    color: row.color,
    duration: row.duration,
    weight: row.weight ?? undefined,
    feeling: row.feeling ?? undefined,
    moodTag: row.mood_tag ?? undefined,
    poopAvatar: row.poop_avatar ?? undefined,
    score: row.score ?? undefined,
    note: row.note ?? undefined,
  };
}

function mapReminderRow(row: ReminderRow): Reminder {
  return {
    id: row.id,
    title: row.title,
    time: row.time_of_day,
    enabled: row.enabled,
    type: row.frequency as Reminder['type'],
  };
}

function mapPostRow(row: PostRow, likedSet: Set<string>): FriendPost {
  return {
    id: row.id,
    userId: `author-${row.id}`,
    userName: row.author_name,
    userAvatar: row.author_avatar,
    content: row.content,
    timestamp: formatRelativeTime(row.created_at),
    likes: row.likes_count,
    comments: row.comments_count,
    isLiked: likedSet.has(row.id),
  };
}

const defaultReminderPayload = (userId: string) => [
  {
    user_id: userId,
    title: '晨起排便',
    time_of_day: '07:00',
    enabled: true,
    frequency: 'daily' as const,
  },
  {
    user_id: userId,
    title: '喝水提醒',
    time_of_day: '09:00',
    enabled: true,
    frequency: 'daily' as const,
  },
  {
    user_id: userId,
    title: '膳食纤维',
    time_of_day: '12:00',
    enabled: false,
    frequency: 'daily' as const,
  },
];

export function mapProfileRow(row: ProfileRow): UserProfile {
  return {
    id: row.id,
    displayName: row.display_name,
    avatarUrl: row.avatar_url,
    phone: row.phone,
    birthday: row.birthday,
    gender: row.gender,
    location: row.location,
    onboardingCompleted: row.onboarding_completed,
  };
}

export async function ensureSessionUserId(): Promise<string | null> {
  const sb = getSupabase();
  const {
    data: { session },
  } = await sb.auth.getSession();
  if (session?.user?.id) return session.user.id;
  const { data, error } = await sb.auth.signInAnonymously();
  if (error || !data.user?.id) {
    console.error('[Supabase] 匿名登录失败', error);
    return null;
  }
  return data.user.id;
}

export async function fetchProfile(userId: string): Promise<UserProfile | null> {
  const sb = getSupabase();
  const { data, error } = await sb
    .from('profiles')
    .select('id, display_name, avatar_url, phone, birthday, gender, location, onboarding_completed')
    .eq('id', userId)
    .maybeSingle();
  if (error) {
    console.error('[Supabase] 读取 profile 失败', error);
    return null;
  }
  return data ? mapProfileRow(data as ProfileRow) : null;
}

export async function signInWithEmail(
  email: string,
  password: string
): Promise<{ userId: string | null; error: string | null }> {
  const sb = getSupabase();
  const { data, error } = await sb.auth.signInWithPassword({ email, password });
  if (error) {
    return { userId: null, error: error.message };
  }
  return { userId: data.user?.id ?? null, error: null };
}

export async function signUpWithEmail(
  email: string,
  password: string
): Promise<{ userId: string | null; needsEmailConfirm: boolean; error: string | null }> {
  const sb = getSupabase();
  const { data, error } = await sb.auth.signUp({ email, password });
  if (error) {
    return { userId: null, needsEmailConfirm: false, error: error.message };
  }
  const needsEmailConfirm = !data.session && Boolean(data.user);
  return {
    userId: data.user?.id ?? null,
    needsEmailConfirm,
    error: null,
  };
}

export async function signInAnonymously(): Promise<{ userId: string | null; error: string | null }> {
  const sb = getSupabase();
  const { data, error } = await sb.auth.signInAnonymously();
  if (error) {
    return { userId: null, error: error.message };
  }
  return { userId: data.user?.id ?? null, error: null };
}

export async function signOut(): Promise<void> {
  const sb = getSupabase();
  await sb.auth.signOut();
}

export async function resetPasswordForEmail(email: string): Promise<{ error: string | null }> {
  const sb = getSupabase();
  const { error } = await sb.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/`,
  });
  return { error: error?.message ?? null };
}

export async function updateProfile(
  userId: string,
  data: Partial<OnboardingData> & { onboardingCompleted?: boolean }
): Promise<boolean> {
  const sb = getSupabase();
  const payload: { [key: string]: unknown } = { updated_at: new Date().toISOString() };
  if (data.displayName !== undefined) payload.display_name = data.displayName;
  if (data.phone !== undefined) payload.phone = data.phone || null;
  if (data.birthday !== undefined) payload.birthday = data.birthday || null;
  if (data.gender !== undefined) payload.gender = data.gender;
  if (data.location !== undefined) payload.location = data.location || null;
  if (data.onboardingCompleted !== undefined) payload.onboarding_completed = data.onboardingCompleted;

  const { error } = await sb.from('profiles').update(payload).eq('id', userId);
  if (error) {
    console.error('[Supabase] 更新 profile 失败', error);
    return false;
  }
  return true;
}

export async function completeOnboarding(
  userId: string,
  data: OnboardingData
): Promise<boolean> {
  return updateProfile(userId, { ...data, onboardingCompleted: true });
}

export async function fetchBowelRecords(userId: string): Promise<Record[]> {
  const sb = getSupabase();
  const { data, error } = await sb
    .from('bowel_records')
    .select('*')
    .eq('user_id', userId)
    .order('record_date', { ascending: false })
    .order('created_at', { ascending: false });
  if (error) {
    console.error('[Supabase] 读取排便记录失败', error);
    return [];
  }
  return (data as BowelRow[]).map(mapBowelRow);
}

export async function ensureDefaultReminders(userId: string): Promise<void> {
  const sb = getSupabase();
  const { data, error } = await sb
    .from('reminders')
    .select('id')
    .eq('user_id', userId)
    .limit(1);
  if (error) {
    console.error('[Supabase] 检查提醒失败', error);
    return;
  }
  if (data?.length) return;
  const { error: insErr } = await sb
    .from('reminders')
    .insert(defaultReminderPayload(userId));
  if (insErr) console.error('[Supabase] 写入默认提醒失败', insErr);
}

export async function fetchReminders(userId: string): Promise<Reminder[]> {
  const sb = getSupabase();
  const { data, error } = await sb
    .from('reminders')
    .select('id, title, time_of_day, enabled, frequency')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });
  if (error) {
    console.error('[Supabase] 读取提醒失败', error);
    return [];
  }
  return (data as ReminderRow[]).map(mapReminderRow);
}

export async function fetchCommunityPosts(userId: string): Promise<FriendPost[]> {
  const sb = getSupabase();
  const { data: posts, error: pErr } = await sb
    .from('community_posts')
    .select(
      'id, author_name, author_avatar, content, likes_count, comments_count, created_at'
    )
    .order('created_at', { ascending: false });
  if (pErr) {
    console.error('[Supabase] 读取社区动态失败', pErr);
    return [];
  }
  const { data: likes, error: lErr } = await sb
    .from('post_likes')
    .select('post_id')
    .eq('user_id', userId);
  if (lErr) {
    console.error('[Supabase] 读取点赞失败', lErr);
  }
  const liked = new Set((likes ?? []).map((l: { post_id: string }) => l.post_id));
  return (posts as PostRow[]).map((row) => mapPostRow(row, liked));
}

export async function insertBowelRecord(
  userId: string,
  record: Omit<Record, 'id'>
): Promise<Record | null> {
  const sb = getSupabase();
  const { data, error } = await sb
    .from('bowel_records')
    .insert({
      user_id: userId,
      record_date: record.date,
      record_time: record.time,
      type: record.type,
      shape: record.shape,
      color: record.color,
      duration: record.duration,
      weight: record.weight ?? null,
      feeling: record.feeling ?? null,
      mood_tag: record.moodTag ?? null,
      poop_avatar: record.poopAvatar ?? null,
      score: record.score ?? null,
      note: record.note ?? null,
    })
    .select('*')
    .single();
  if (error) {
    console.error('[Supabase] 写入排便记录失败', error);
    return null;
  }
  return mapBowelRow(data as BowelRow);
}

export async function updateReminderEnabled(
  userId: string,
  id: string,
  enabled: boolean
): Promise<boolean> {
  const sb = getSupabase();
  const { error } = await sb
    .from('reminders')
    .update({ enabled })
    .eq('id', id)
    .eq('user_id', userId);
  if (error) {
    console.error('[Supabase] 更新提醒失败', error);
    return false;
  }
  return true;
}

export async function togglePostLike(
  userId: string,
  postId: string,
  currentlyLiked: boolean
): Promise<boolean> {
  const sb = getSupabase();
  if (currentlyLiked) {
    const { error } = await sb
      .from('post_likes')
      .delete()
      .eq('post_id', postId)
      .eq('user_id', userId);
    if (error) {
      console.error('[Supabase] 取消点赞失败', error);
      return false;
    }
    return true;
  }
  const { error } = await sb.from('post_likes').insert({
    post_id: postId,
    user_id: userId,
  });
  if (error) {
    console.error('[Supabase] 点赞失败', error);
    return false;
  }
  return true;
}

type CommentRow = {
  id: string;
  post_id: string;
  user_id: string;
  author_name: string;
  author_avatar: string;
  content: string;
  created_at: string;
};

function mapCommentRow(row: CommentRow): PostComment {
  return {
    id: row.id,
    postId: row.post_id,
    userId: row.user_id,
    userName: row.author_name,
    userAvatar: row.author_avatar,
    content: row.content,
    timestamp: formatRelativeTime(row.created_at),
  };
}

export async function fetchPostComments(postId: string): Promise<PostComment[]> {
  const sb = getSupabase();
  const { data, error } = await sb
    .from('post_comments')
    .select('id, post_id, user_id, author_name, author_avatar, content, created_at')
    .eq('post_id', postId)
    .order('created_at', { ascending: true });
  if (error) {
    console.error('[Supabase] 读取评论失败', error);
    return [];
  }
  return (data as CommentRow[]).map(mapCommentRow);
}

export async function insertPostComment(
  postId: string,
  userId: string,
  authorName: string,
  authorAvatar: string,
  content: string
): Promise<PostComment | null> {
  const sb = getSupabase();
  const { data, error } = await sb
    .from('post_comments')
    .insert({
      post_id: postId,
      user_id: userId,
      author_name: authorName,
      author_avatar: authorAvatar,
      content,
    })
    .select('id, post_id, user_id, author_name, author_avatar, content, created_at')
    .single();
  if (error) {
    console.error('[Supabase] 写入评论失败', error);
    return null;
  }
  return mapCommentRow(data as CommentRow);
}
