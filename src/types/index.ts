export interface User {
  id: string;
  name: string;
  avatar: string;
  healthScore: number;
  streak: number;
  email?: string;
  phone?: string;
  birthday?: string;
  gender?: 'male' | 'female' | 'other';
  location?: string;
}

export interface UserProfile {
  id: string;
  displayName: string;
  avatarUrl: string | null;
  phone: string | null;
  birthday: string | null;
  gender: 'male' | 'female' | 'other' | null;
  location: string | null;
  onboardingCompleted: boolean;
}

export type AuthScreen = 'welcome' | 'login' | 'register' | 'forgot' | 'onboarding';

export interface OnboardingData {
  displayName: string;
  gender: 'male' | 'female' | 'other';
  birthday: string;
  phone?: string;
  location?: string;
}

export interface Record {
  id: string;
  date: string;
  time: string;
  type: 'normal' | 'constipation' | 'diarrhea' | 'other';
  shape: number;
  color: string;
  duration: number;
  weight?: number;
  feeling?: 'light' | 'normal' | 'strained' | 'urgent';
  moodTag?: string;
  poopAvatar?: string;
  score?: number;
  note?: string;
}

export interface Reminder {
  id: string;
  title: string;
  time: string;
  enabled: boolean;
  type: 'daily' | 'weekly' | 'once';
}

export interface FriendPost {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  timestamp: string;
  likes: number;
  comments: number;
  isLiked: boolean;
  paperGifts?: number;
  topic?: string;
}

export interface PostComment {
  id: string;
  postId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  timestamp: string;
}

export interface GutPet {
  level: number;
  name: string;
  stage: 'sprout' | 'active' | 'evolved';
  energy: number;
  accessories: string[];
}

export interface HealthData {
  date: string;
  score: number;
  records: number;
  water: number;
  fiber: number;
}

export interface AIResponse {
  id: string;
  content: string;
  timestamp: string;
  isUser: boolean;
}

export type TabType = 'home' | 'record' | 'analysis' | 'report' | 'profile';
