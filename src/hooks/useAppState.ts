import { useState, useCallback, useEffect, useMemo } from 'react';
import type {
  User,
  Record,
  Reminder,
  FriendPost,
  PostComment,
  HealthData,
  AIResponse,
  TabType,
  GutPet,
  UserProfile,
} from '@/types';
import { isSupabaseConfigured } from '@/lib/supabaseClient';
import { buildHealthSeries, computeHealthScore, computeStreak } from '@/lib/statsFromRecords';
import {
  fetchProfile,
  fetchBowelRecords,
  ensureDefaultReminders,
  fetchReminders,
  fetchCommunityPosts,
  fetchPostComments,
  insertPostComment,
  insertBowelRecord,
  updateReminderEnabled,
  togglePostLike,
} from '@/lib/supabaseRepository';

interface UseAppStateOptions {
  userId: string | null;
  enabled: boolean;
  authProfile?: UserProfile | null;
  userEmail?: string | null;
}

const mockUser: User = {
  id: '1',
  name: '健康达人',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
  healthScore: 85,
  streak: 7,
};

const mockRecords: Record[] = [
  {
    id: '1',
    date: '2026-03-24',
    time: '08:30',
    type: 'normal',
    shape: 4,
    color: '#8B4513',
    duration: 5,
    weight: 220,
    feeling: 'light',
  },
  {
    id: '2',
    date: '2026-03-23',
    time: '07:45',
    type: 'normal',
    shape: 3,
    color: '#8B4513',
    duration: 4,
    weight: 180,
    feeling: 'normal',
  },
  {
    id: '3',
    date: '2026-03-22',
    time: '09:00',
    type: 'constipation',
    shape: 2,
    color: '#654321',
    duration: 8,
    weight: 120,
    feeling: 'strained',
  },
];

const mockReminders: Reminder[] = [
  { id: '1', title: '晨起排便', time: '07:00', enabled: true, type: 'daily' },
  { id: '2', title: '喝水提醒', time: '09:00', enabled: true, type: 'daily' },
  { id: '3', title: '膳食纤维', time: '12:00', enabled: false, type: 'daily' },
];

const mockFriendPosts: FriendPost[] = [
  {
    id: '1',
    userId: '2',
    userName: '小明',
    userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
    content: '今天排便很顺畅，继续保持！💪',
    timestamp: '10分钟前',
    likes: 12,
    comments: 3,
    isLiked: false,
    paperGifts: 5,
    topic: '早起打卡',
  },
  {
    id: '2',
    userId: '3',
    userName: '小红',
    userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jane',
    content: '连续打卡第15天，肠道健康明显改善～',
    timestamp: '30分钟前',
    likes: 28,
    comments: 8,
    isLiked: true,
    paperGifts: 12,
    topic: '精灵进化',
  },
  {
    id: '3',
    userId: '4',
    userName: '健康君',
    userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Health',
    content: '分享一个健康小贴士：多吃富含膳食纤维的食物有助于肠道蠕动哦！🥗',
    timestamp: '1小时前',
    likes: 56,
    comments: 15,
    isLiked: false,
    paperGifts: 20,
    topic: '健康话题',
  },
];

const mockPostComments: { [postId: string]: PostComment[] } = {
  '1': [
    {
      id: 'c1',
      postId: '1',
      userId: '3',
      userName: '小红',
      userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jane',
      content: '加油！坚持就是胜利 💪',
      timestamp: '8分钟前',
    },
    {
      id: 'c2',
      postId: '1',
      userId: '4',
      userName: '健康君',
      userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Health',
      content: '记得多喝水哦～',
      timestamp: '5分钟前',
    },
  ],
  '2': [
    {
      id: 'c3',
      postId: '2',
      userId: '2',
      userName: '小明',
      userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
      content: '太厉害了！向你学习',
      timestamp: '20分钟前',
    },
  ],
  '3': [
    {
      id: 'c4',
      postId: '3',
      userId: '2',
      userName: '小明',
      userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
      content: '收藏了，很有用！',
      timestamp: '45分钟前',
    },
    {
      id: 'c5',
      postId: '3',
      userId: '3',
      userName: '小红',
      userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jane',
      content: '膳食纤维确实很重要',
      timestamp: '40分钟前',
    },
  ],
};

const mockAIResponses: AIResponse[] = [
  {
    id: '1',
    content: '你好！我是你的肠道健康AI助手。有什么可以帮助你的吗？',
    timestamp: '刚刚',
    isUser: false,
  },
];

export function useAppState({ userId, enabled, authProfile, userEmail }: UseAppStateOptions) {
  const useRemote = isSupabaseConfigured();

  const [currentTab, setCurrentTab] = useState<TabType>('home');
  const [profile, setProfile] = useState<{
    id: string;
    name: string;
    avatar: string;
    phone?: string;
    birthday?: string;
    gender?: User['gender'];
    location?: string;
  } | null>(null);

  const [records, setRecords] = useState<Record[]>(() => (useRemote ? [] : mockRecords));
  const [reminders, setReminders] = useState<Reminder[]>(() => (useRemote ? [] : mockReminders));
  const [friendPosts, setFriendPosts] = useState<FriendPost[]>(() =>
    useRemote ? [] : mockFriendPosts
  );
  const [postComments, setPostComments] = useState<{ [postId: string]: PostComment[] }>(() =>
    useRemote ? {} : mockPostComments
  );
  const [aiMessages, setAiMessages] = useState<AIResponse[]>(mockAIResponses);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [unreadCount] = useState(3);

  const scoreRecord = useCallback((record: Omit<Record, 'id'>) => {
    const shapeScore = Math.max(0, 100 - Math.abs(record.shape - 4) * 15);
    const durationScore = Math.max(0, 100 - Math.abs(record.duration - 6) * 6);
    const feelingPenalty =
      record.feeling === 'light' ? 0 : record.feeling === 'normal' ? 5 : record.feeling === 'strained' ? 18 : 25;
    const total = Math.round(shapeScore * 0.5 + durationScore * 0.35 + Math.max(0, 100 - feelingPenalty) * 0.15);
    return Math.min(100, Math.max(40, total));
  }, []);

  const getPoopPersona = useCallback((record: Omit<Record, 'id'>) => {
    if (record.shape >= 3 && record.shape <= 5 && record.duration <= 8) {
      return { moodTag: '顺畅小能手', poopAvatar: '😎💩' };
    }
    if (record.shape <= 2) {
      return { moodTag: '顽固老大哥', poopAvatar: '🧱💩' };
    }
    if (record.shape >= 6) {
      return { moodTag: '急速冲浪王', poopAvatar: '🌊💩' };
    }
    return { moodTag: '观察中的便便侦探', poopAvatar: '🕵️💩' };
  }, []);

  const healthData: HealthData[] = useMemo(() => buildHealthSeries(records), [records]);

  const gutPet: GutPet = useMemo(() => {
    const energy = Math.min(100, records.length * 9 + computeStreak(records) * 4);
    const level = Math.max(1, Math.floor(energy / 20));
    const stage: GutPet['stage'] = level >= 4 ? 'evolved' : level >= 2 ? 'active' : 'sprout';
    return {
      level,
      name: stage === 'evolved' ? '肠道龙宝' : stage === 'active' ? '噗噗精灵' : '便便豆芽',
      stage,
      energy,
      accessories: [
        ...(level >= 2 ? ['卷纸披风'] : []),
        ...(level >= 3 ? ['胶囊项链'] : []),
        ...(level >= 4 ? ['健康王冠'] : []),
      ],
    };
  }, [records]);

  const user: User = useMemo(() => {
    if (!useRemote || !enabled) {
      return {
        ...mockUser,
        healthScore: computeHealthScore(records),
        streak: computeStreak(records),
      };
    }
    const base = profile ?? {
      id: userId ?? '',
      name: authProfile?.displayName ?? '加载中…',
      avatar: authProfile?.avatarUrl ?? mockUser.avatar,
      phone: authProfile?.phone ?? undefined,
      birthday: authProfile?.birthday ?? undefined,
      gender: authProfile?.gender ?? undefined,
      location: authProfile?.location ?? undefined,
    };
    return {
      id: base.id,
      name: base.name,
      avatar: base.avatar,
      email: userEmail ?? undefined,
      phone: base.phone,
      birthday: base.birthday,
      gender: base.gender,
      location: base.location,
      healthScore: computeHealthScore(records),
      streak: computeStreak(records),
    };
  }, [useRemote, enabled, profile, userId, authProfile, userEmail, records]);

  useEffect(() => {
    if (!useRemote || !enabled || !userId) {
      if (!useRemote) {
        setRecords(mockRecords);
        setReminders(mockReminders);
        setFriendPosts(mockFriendPosts);
        setPostComments(mockPostComments);
      }
      return;
    }

    let cancelled = false;

    const run = async () => {
      const p = await fetchProfile(userId);
      if (cancelled) return;
      if (p) {
        setProfile({
          id: p.id,
          name: p.displayName,
          avatar: p.avatarUrl ?? mockUser.avatar,
          phone: p.phone ?? undefined,
          birthday: p.birthday ?? undefined,
          gender: p.gender ?? undefined,
          location: p.location ?? undefined,
        });
      }

      await ensureDefaultReminders(userId);
      const [recs, rems, posts] = await Promise.all([
        fetchBowelRecords(userId),
        fetchReminders(userId),
        fetchCommunityPosts(userId),
      ]);
      const commentsMap: { [postId: string]: PostComment[] } = {};
      if (posts.length) {
        const commentLists = await Promise.all(
          posts.map((p) => fetchPostComments(p.id))
        );
        posts.forEach((p, i) => {
          commentsMap[p.id] = commentLists[i];
        });
      }
      if (!cancelled) {
        setRecords(recs);
        setReminders(rems);
        setFriendPosts(posts.length ? posts : mockFriendPosts);
        setPostComments(posts.length ? commentsMap : mockPostComments);
      }
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, [useRemote, enabled, userId]);

  const addRecord = useCallback(
    async (record: Omit<Record, 'id'>) => {
      const persona = getPoopPersona(record);
      const enhancedRecord = {
        ...record,
        score: scoreRecord(record),
        moodTag: persona.moodTag,
        poopAvatar: persona.poopAvatar,
      };
      if (useRemote && userId) {
        const inserted = await insertBowelRecord(userId, enhancedRecord);
        if (inserted) {
          setRecords((prev) => [inserted, ...prev]);
          return;
        }
      }
      const newRecord = { ...enhancedRecord, id: Date.now().toString() };
      setRecords((prev) => [newRecord, ...prev]);
    },
    [useRemote, userId, getPoopPersona, scoreRecord]
  );

  const toggleReminder = useCallback(
    async (id: string) => {
      const target = reminders.find((r) => r.id === id);
      const next = target ? !target.enabled : true;
      if (useRemote && userId && target) {
        const ok = await updateReminderEnabled(userId, id, next);
        if (!ok) return;
      }
      setReminders((prev) =>
        prev.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r))
      );
    },
    [useRemote, userId, reminders]
  );

  const toggleLike = useCallback(
    async (postId: string) => {
      if (useRemote && userId) {
        const post = friendPosts.find((p) => p.id === postId);
        if (!post) return;
        const ok = await togglePostLike(userId, postId, post.isLiked);
        if (!ok) return;
      }
      setFriendPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? {
                ...p,
                isLiked: !p.isLiked,
                likes: p.isLiked ? p.likes - 1 : p.likes + 1,
              }
            : p
        )
      );
    },
    [useRemote, userId, friendPosts]
  );

  const sendPaperGift = useCallback((postId: string) => {
    setFriendPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? {
              ...p,
              paperGifts: (p.paperGifts ?? 0) + 1,
            }
          : p
      )
    );
  }, []);

  const addComment = useCallback(
    async (postId: string, content: string) => {
      const author = {
        id: userId ?? '1',
        name: profile?.name ?? authProfile?.displayName ?? mockUser.name,
        avatar: profile?.avatar ?? authProfile?.avatarUrl ?? mockUser.avatar,
      };

      if (useRemote && userId) {
        const inserted = await insertPostComment(postId, userId, author.name, author.avatar, content);
        if (inserted) {
          setPostComments((prev) => ({
            ...prev,
            [postId]: [...(prev[postId] ?? []), inserted],
          }));
          setFriendPosts((prev) =>
            prev.map((p) =>
              p.id === postId ? { ...p, comments: p.comments + 1 } : p
            )
          );
          return;
        }
      }

      const newComment: PostComment = {
        id: Date.now().toString(),
        postId,
        userId: author.id,
        userName: author.name,
        userAvatar: author.avatar,
        content,
        timestamp: '刚刚',
      };
      setPostComments((prev) => ({
        ...prev,
        [postId]: [...(prev[postId] ?? []), newComment],
      }));
      setFriendPosts((prev) =>
        prev.map((p) =>
          p.id === postId ? { ...p, comments: p.comments + 1 } : p
        )
      );
    },
    [useRemote, userId, profile, authProfile]
  );

  const sendAIMessage = useCallback((content: string) => {
    const userMsg: AIResponse = {
      id: Date.now().toString(),
      content,
      timestamp: '刚刚',
      isUser: true,
    };
    setAiMessages((prev) => [...prev, userMsg]);

    setTimeout(() => {
      const aiMsg: AIResponse = {
        id: (Date.now() + 1).toString(),
        content:
          '收到你的消息！根据你的描述，建议多喝水、多吃蔬菜水果，保持规律作息。如有不适请及时就医。',
        timestamp: '刚刚',
        isUser: false,
      };
      setAiMessages((prev) => [...prev, aiMsg]);
    }, 1000);
  }, []);

  const toggleDarkMode = useCallback(() => {
    setIsDarkMode((prev) => !prev);
    document.documentElement.classList.toggle('dark');
  }, []);

  return {
    currentTab,
    setCurrentTab,
    user,
    records,
    reminders,
    friendPosts,
    postComments,
    gutPet,
    healthData,
    aiMessages,
    isDarkMode,
    unreadCount,
    addRecord,
    toggleReminder,
    toggleLike,
    sendPaperGift,
    addComment,
    sendAIMessage,
    toggleDarkMode,
  };
}
