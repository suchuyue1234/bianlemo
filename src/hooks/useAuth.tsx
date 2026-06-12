import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { AuthScreen, OnboardingData, UserProfile } from '@/types';
import { isSupabaseConfigured } from '@/lib/supabaseClient';
import { getSupabase } from '@/lib/supabaseClient';
import {
  completeOnboarding,
  fetchProfile,
  resetPasswordForEmail,
  signInAnonymously,
  signInWithEmail,
  signOut as repoSignOut,
  signUpWithEmail,
  updateProfile,
} from '@/lib/supabaseRepository';

const LOCAL_USERS_KEY = 'bianlemo_local_users';
const LOCAL_SESSION_KEY = 'bianlemo_local_session';

type LocalUser = {
  id: string;
  email: string;
  password: string;
  profile: UserProfile;
};

type LocalSession = {
  userId: string;
  email: string;
  isGuest: boolean;
};

function readLocalUsers(): LocalUser[] {
  try {
    const raw = localStorage.getItem(LOCAL_USERS_KEY);
    return raw ? (JSON.parse(raw) as LocalUser[]) : [];
  } catch {
    return [];
  }
}

function writeLocalUsers(users: LocalUser[]) {
  localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));
}

function readLocalSession(): LocalSession | null {
  try {
    const raw = localStorage.getItem(LOCAL_SESSION_KEY);
    return raw ? (JSON.parse(raw) as LocalSession) : null;
  } catch {
    return null;
  }
}

function writeLocalSession(session: LocalSession | null) {
  if (session) {
    localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(session));
  } else {
    localStorage.removeItem(LOCAL_SESSION_KEY);
  }
}

function createDefaultProfile(id: string, displayName = '旅行者'): UserProfile {
  return {
    id,
    displayName,
    avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${id.replace(/-/g, '')}`,
    phone: null,
    birthday: null,
    gender: null,
    location: null,
    onboardingCompleted: false,
  };
}

interface AuthContextValue {
  isLoading: boolean;
  isInApp: boolean;
  isGuest: boolean;
  isRegistered: boolean;
  userId: string | null;
  email: string | null;
  profile: UserProfile | null;
  needsOnboarding: boolean;
  authScreen: AuthScreen;
  setAuthScreen: (screen: AuthScreen) => void;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (email: string, password: string) => Promise<{ error?: string; needsEmailConfirm?: boolean }>;
  signOut: () => Promise<void>;
  signInAsGuest: () => Promise<{ error?: string }>;
  saveOnboarding: (data: OnboardingData) => Promise<{ error?: string }>;
  updateUserProfile: (data: Partial<OnboardingData>) => Promise<{ error?: string }>;
  resetPassword: (email: string) => Promise<{ error?: string }>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const useRemote = isSupabaseConfigured();

  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isGuest, setIsGuest] = useState(false);
  const [authScreen, setAuthScreen] = useState<AuthScreen>('welcome');

  const needsOnboarding = Boolean(profile && !profile.onboardingCompleted && !isGuest);
  const isRegistered = Boolean(userId && !isGuest);
  const isInApp = Boolean(userId && (isGuest || profile?.onboardingCompleted));

  const loadRemoteProfile = useCallback(async (uid: string) => {
    const p = await fetchProfile(uid);
    if (p) setProfile(p);
    return p;
  }, []);

  const bootstrapRemote = useCallback(async () => {
    const sb = getSupabase();
    const {
      data: { session },
    } = await sb.auth.getSession();

    if (!session?.user) {
      setUserId(null);
      setEmail(null);
      setProfile(null);
      setIsGuest(false);
      setAuthScreen('welcome');
      return;
    }

    const uid = session.user.id;
    const isAnon = session.user.is_anonymous ?? false;
    setUserId(uid);
    setEmail(session.user.email ?? null);
    setIsGuest(isAnon);

    const p = await loadRemoteProfile(uid);
    if (isAnon) {
      setAuthScreen('welcome');
      return;
    }
    if (p && !p.onboardingCompleted) {
      setAuthScreen('onboarding');
    }
  }, [loadRemoteProfile]);

  const bootstrapLocal = useCallback(() => {
    const session = readLocalSession();
    if (!session) {
      setUserId(null);
      setEmail(null);
      setProfile(null);
      setIsGuest(false);
      setAuthScreen('welcome');
      return;
    }

    setUserId(session.userId);
    setEmail(session.email);
    setIsGuest(session.isGuest);

    if (session.isGuest) {
      setProfile(createDefaultProfile(session.userId, '游客'));
      return;
    }

    const users = readLocalUsers();
    const user = users.find((u) => u.id === session.userId);
    if (user) {
      setProfile(user.profile);
      if (!user.profile.onboardingCompleted) {
        setAuthScreen('onboarding');
      }
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    let unsubscribe: (() => void) | undefined;

    const init = async () => {
      setIsLoading(true);
      if (useRemote) {
        await bootstrapRemote();
        const sb = getSupabase();
        const { data: sub } = sb.auth.onAuthStateChange(async (_event, session) => {
          if (cancelled) return;
          if (!session?.user) {
            setUserId(null);
            setEmail(null);
            setProfile(null);
            setIsGuest(false);
            setAuthScreen('welcome');
            return;
          }
          const uid = session.user.id;
          const isAnon = session.user.is_anonymous ?? false;
          setUserId(uid);
          setEmail(session.user.email ?? null);
          setIsGuest(isAnon);
          const p = await loadRemoteProfile(uid);
          if (!isAnon && p && !p.onboardingCompleted) {
            setAuthScreen('onboarding');
          }
        });
        unsubscribe = () => sub.subscription.unsubscribe();
      } else {
        bootstrapLocal();
      }
      if (!cancelled) setIsLoading(false);
    };

    void init();
    return () => {
      cancelled = true;
      unsubscribe?.();
    };
  }, [useRemote, bootstrapRemote, bootstrapLocal, loadRemoteProfile]);

  const signIn = useCallback(
    async (loginEmail: string, password: string) => {
      if (useRemote) {
        const { userId: uid, error } = await signInWithEmail(loginEmail, password);
        if (error || !uid) return { error: error ?? '登录失败' };
        setUserId(uid);
        setEmail(loginEmail);
        setIsGuest(false);
        const p = await loadRemoteProfile(uid);
        if (p && !p.onboardingCompleted) {
          setAuthScreen('onboarding');
        }
        return {};
      }

      const users = readLocalUsers();
      const user = users.find((u) => u.email === loginEmail && u.password === password);
      if (!user) return { error: '邮箱或密码不正确' };

      writeLocalSession({ userId: user.id, email: user.email, isGuest: false });
      setUserId(user.id);
      setEmail(user.email);
      setIsGuest(false);
      setProfile(user.profile);
      if (!user.profile.onboardingCompleted) {
        setAuthScreen('onboarding');
      }
      return {};
    },
    [useRemote, loadRemoteProfile]
  );

  const signUp = useCallback(
    async (registerEmail: string, password: string) => {
      if (useRemote) {
        const { userId: uid, needsEmailConfirm, error } = await signUpWithEmail(
          registerEmail,
          password
        );
        if (error) return { error };
        if (needsEmailConfirm) {
          return { needsEmailConfirm: true };
        }
        if (!uid) return { error: '注册失败，请稍后重试' };
        setUserId(uid);
        setEmail(registerEmail);
        setIsGuest(false);
        await loadRemoteProfile(uid);
        setAuthScreen('onboarding');
        return {};
      }

      const users = readLocalUsers();
      if (users.some((u) => u.email === registerEmail)) {
        return { error: '该邮箱已被注册' };
      }

      const id = crypto.randomUUID();
      const newUser: LocalUser = {
        id,
        email: registerEmail,
        password,
        profile: createDefaultProfile(id),
      };
      writeLocalUsers([...users, newUser]);
      writeLocalSession({ userId: id, email: registerEmail, isGuest: false });
      setUserId(id);
      setEmail(registerEmail);
      setIsGuest(false);
      setProfile(newUser.profile);
      setAuthScreen('onboarding');
      return {};
    },
    [useRemote, loadRemoteProfile]
  );

  const signInAsGuest = useCallback(async () => {
    if (useRemote) {
      const { userId: uid, error } = await signInAnonymously();
      if (error || !uid) return { error: error ?? '游客模式启动失败' };
      setUserId(uid);
      setEmail(null);
      setIsGuest(true);
      const p = await loadRemoteProfile(uid);
      setProfile(
        p ?? {
          ...createDefaultProfile(uid),
          onboardingCompleted: true,
        }
      );
      return {};
    }

    const id = `guest-${Date.now()}`;
    writeLocalSession({ userId: id, email: 'guest@local', isGuest: true });
    setUserId(id);
    setEmail(null);
    setIsGuest(true);
    setProfile({ ...createDefaultProfile(id, '游客'), onboardingCompleted: true });
    return {};
  }, [useRemote, loadRemoteProfile]);

  const saveOnboarding = useCallback(
    async (data: OnboardingData) => {
      if (!userId) return { error: '未登录' };

      if (useRemote) {
        const ok = await completeOnboarding(userId, data);
        if (!ok) return { error: '保存资料失败，请重试' };
        await loadRemoteProfile(userId);
        return {};
      }

      const users = readLocalUsers();
      const idx = users.findIndex((u) => u.id === userId);
      if (idx === -1) return { error: '用户不存在' };

      const updatedProfile: UserProfile = {
        ...users[idx].profile,
        displayName: data.displayName,
        gender: data.gender,
        birthday: data.birthday,
        phone: data.phone ?? null,
        location: data.location ?? null,
        onboardingCompleted: true,
      };
      users[idx] = { ...users[idx], profile: updatedProfile };
      writeLocalUsers(users);
      setProfile(updatedProfile);
      return {};
    },
    [userId, useRemote, loadRemoteProfile]
  );

  const updateUserProfile = useCallback(
    async (data: Partial<OnboardingData>) => {
      if (!userId) return { error: '未登录' };

      if (useRemote) {
        const ok = await updateProfile(userId, data);
        if (!ok) return { error: '保存资料失败，请重试' };
        await loadRemoteProfile(userId);
        return {};
      }

      const users = readLocalUsers();
      const idx = users.findIndex((u) => u.id === userId);
      if (idx === -1) return { error: '用户不存在' };

      const updatedProfile: UserProfile = {
        ...users[idx].profile,
        displayName: data.displayName ?? users[idx].profile.displayName,
        gender: data.gender ?? users[idx].profile.gender,
        birthday: data.birthday ?? users[idx].profile.birthday,
        phone: data.phone !== undefined ? data.phone ?? null : users[idx].profile.phone,
        location: data.location !== undefined ? data.location ?? null : users[idx].profile.location,
      };
      users[idx] = { ...users[idx], profile: updatedProfile };
      writeLocalUsers(users);
      setProfile(updatedProfile);
      return {};
    },
    [userId, useRemote, loadRemoteProfile]
  );

  const signOutHandler = useCallback(async () => {
    if (useRemote) {
      await repoSignOut();
    } else {
      writeLocalSession(null);
    }
    setUserId(null);
    setEmail(null);
    setProfile(null);
    setIsGuest(false);
    setAuthScreen('welcome');
  }, [useRemote]);

  const resetPassword = useCallback(
    async (resetEmail: string) => {
      if (useRemote) {
        const { error } = await resetPasswordForEmail(resetEmail);
        if (error) return { error };
        return {};
      }
      const users = readLocalUsers();
      if (!users.some((u) => u.email === resetEmail)) {
        return { error: '该邮箱尚未注册' };
      }
      return {};
    },
    [useRemote]
  );

  const refreshProfile = useCallback(async () => {
    if (userId && useRemote) {
      await loadRemoteProfile(userId);
    }
  }, [userId, useRemote, loadRemoteProfile]);

  const value = useMemo<AuthContextValue>(
    () => ({
      isLoading,
      isInApp,
      isGuest,
      isRegistered,
      userId,
      email,
      profile,
      needsOnboarding,
      authScreen,
      setAuthScreen,
      signIn,
      signUp,
      signOut: signOutHandler,
      signInAsGuest,
      saveOnboarding,
      updateUserProfile,
      resetPassword,
      refreshProfile,
    }),
    [
      isLoading,
      isInApp,
      isGuest,
      isRegistered,
      userId,
      email,
      profile,
      needsOnboarding,
      authScreen,
      signIn,
      signUp,
      signOutHandler,
      signInAsGuest,
      saveOnboarding,
      updateUserProfile,
      resetPassword,
      refreshProfile,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
