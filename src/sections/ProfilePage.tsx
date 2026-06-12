import { useState } from 'react';
import {
  User, Moon, Bell, Shield,
  HelpCircle, FileText, Star, ChevronRight, LogOut
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import type { User as UserType, Record } from '@/types';

interface ProfilePageProps {
  user: UserType;
  records: Record[];
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  onNavigateToPrivacy?: () => void;
  onNavigateToPersonal?: () => void;
  onNavigateToNotifications?: () => void;
  onNavigateToHelp?: () => void;
  onNavigateToAbout?: () => void;
  onNavigateToFeedback?: () => void;
  onNavigateToHealthScore?: () => void;
  onLogout: () => void;
}

export function ProfilePage({
  user,
  records,
  isDarkMode,
  onToggleDarkMode,
  onNavigateToPersonal,
  onNavigateToNotifications,
  onNavigateToPrivacy,
  onNavigateToHelp,
  onNavigateToAbout,
  onNavigateToFeedback,
  onNavigateToHealthScore,
  onLogout,
}: ProfilePageProps) {
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const totalRecords = records.length;
  const streakDays = user.streak;

  const menuItems = [
    { id: 'personal', icon: User, label: '个人资料', badge: null, onClick: onNavigateToPersonal },
    { id: 'notifications', icon: Bell, label: '消息通知', badge: '3', onClick: onNavigateToNotifications },
    { id: 'privacy', icon: Shield, label: '隐私设置', badge: null, onClick: onNavigateToPrivacy },
    { id: 'help', icon: HelpCircle, label: '帮助中心', badge: null, onClick: onNavigateToHelp },
    { id: 'about', icon: FileText, label: '关于我们', badge: null, onClick: onNavigateToAbout },
    { id: 'feedback', icon: Star, label: '意见反馈', badge: null, onClick: onNavigateToFeedback },
  ];

  return (
    <div className="space-y-4 pb-24">
      <div className="gradient-primary rounded-2xl p-5 text-[#2A1F0A]">
        <div className="flex items-center gap-4">
          <Avatar className="h-20 w-20 border-4 border-[#2A1F0A]/20">
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback className="bg-[#2A1F0A]/15 text-[#2A1F0A] text-2xl font-medium">
              {user.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold truncate">{user.name}</h2>
            <p className="text-[#2A1F0A]/70 text-sm">肠道健康达人</p>
            <div className="flex items-center gap-4 mt-3">
              <div className="text-center">
                <p className="text-lg font-bold">{streakDays}</p>
                <p className="text-xs text-[#2A1F0A]/70">连续打卡</p>
              </div>
              <div className="w-px h-8 bg-[#2A1F0A]/20" />
              <button
                type="button"
                onClick={onNavigateToHealthScore}
                className="text-center tap-highlight active:opacity-80"
              >
                <p className="text-lg font-bold">{user.healthScore}</p>
                <p className="text-xs text-[#2A1F0A]/70 flex items-center gap-0.5 justify-center">
                  健康评分
                  <ChevronRight className="h-3 w-3" />
                </p>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="card-standard text-center py-4">
          <p className="text-2xl font-bold text-[#D4AF37]">{totalRecords}</p>
          <p className="text-xs text-[var(--app-text-muted)] mt-1">总记录</p>
        </div>
        <div className="card-standard text-center py-4">
          <p className="text-2xl font-bold text-[#C4A35A]">{streakDays}</p>
          <p className="text-xs text-[var(--app-text-muted)] mt-1">连续天数</p>
        </div>
        <div className="card-standard text-center py-4">
          <p className="text-2xl font-bold text-[#E8B86D]">{Math.max(1, Math.floor(user.healthScore / 20))}</p>
          <p className="text-xs text-[var(--app-text-muted)] mt-1">健康等级</p>
        </div>
      </div>

      <div className="card-standard">
        <h3 className="text-base font-semibold text-gray-800 dark:text-gray-100 mb-4">
          设置
        </h3>
        <div className="space-y-1">
          <div className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-purple-500/10 flex items-center justify-center">
                <Moon className="h-4 w-4 text-purple-500" />
              </div>
              <span className="text-sm text-gray-700 dark:text-gray-300">夜间模式</span>
            </div>
            <Switch
              checked={isDarkMode}
              onCheckedChange={onToggleDarkMode}
              className="data-[state=checked]:bg-purple-500"
            />
          </div>

          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={item.onClick}
                className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors tap-highlight"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#D4AF37]/15 flex items-center justify-center">
                    <Icon className="h-4 w-4 text-[#D4AF37]" />
                  </div>
                  <span className="text-sm text-gray-700 dark:text-gray-300">{item.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  {item.badge && (
                    <span className="px-2 py-0.5 rounded-full bg-[#FF6B4A] text-white text-xs font-medium">
                      {item.badge}
                    </span>
                  )}
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="text-center py-4">
        <p className="text-xs text-gray-400">便了么 v2.0.0</p>
        <p className="text-xs text-gray-400 mt-1">专注肠道健康管理</p>
      </div>

      <button
        onClick={() => setShowLogoutConfirm(true)}
        className="w-full flex items-center justify-center gap-2 p-4 rounded-2xl bg-red-50 dark:bg-red-900/20 text-red-500 tap-highlight transition-all active:scale-[0.98]"
      >
        <LogOut className="h-5 w-5" />
        <span className="text-sm font-medium">退出登录</span>
      </button>

      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white dark:bg-[#252B3D] rounded-2xl p-6 w-full max-w-sm animate-in fade-in zoom-in duration-200">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">
              确认退出登录？
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              退出后需要重新登录才能使用全部功能
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm font-medium transition-colors"
              >
                取消
              </button>
              <button
                onClick={() => {
                  setShowLogoutConfirm(false);
                  onLogout();
                }}
                className="flex-1 py-3 rounded-xl bg-red-500 text-white text-sm font-medium transition-colors"
              >
                确认退出
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
