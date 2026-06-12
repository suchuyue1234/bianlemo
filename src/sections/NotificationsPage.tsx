import { useState } from 'react';
import { ChevronLeft, Bell, Heart, MessageCircle, Gift, Calendar, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface NotificationsPageProps {
  onBack: () => void;
}

interface Notification {
  id: string;
  type: 'like' | 'comment' | 'gift' | 'system' | 'reminder';
  title: string;
  content: string;
  timestamp: string;
  read: boolean;
  icon: typeof Bell;
  color: string;
}

const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'like',
    title: '小明点赞了你的动态',
    content: '你的健康记录获得了点赞',
    timestamp: '5分钟前',
    read: false,
    icon: Heart,
    color: '#FF6B4A',
  },
  {
    id: '2',
    type: 'comment',
    title: '小红评论了你的动态',
    content: '"继续保持，你的肠道健康状态越来越好啦！"',
    timestamp: '30分钟前',
    read: false,
    icon: MessageCircle,
    color: '#D4AF37',
  },
  {
    id: '3',
    type: 'gift',
    title: '健康君送了你一份礼物',
    content: '收到了一个健康徽章🎖️',
    timestamp: '1小时前',
    read: false,
    icon: Gift,
    color: '#C4A35A',
  },
  {
    id: '4',
    type: 'system',
    title: '周报已生成',
    content: '你上周的肠道健康报告已生成，快去看看吧',
    timestamp: '昨天',
    read: true,
    icon: Calendar,
    color: '#FFD166',
  },
  {
    id: '5',
    type: 'reminder',
    title: '晨起排便提醒',
    content: '每天定时提醒你进行晨起排便，养成好习惯',
    timestamp: '昨天',
    read: true,
    icon: CheckCircle,
    color: '#C4A35A',
  },
  {
    id: '6',
    type: 'system',
    title: '新功能上线',
    content: '健康报告功能升级，现在可以导出PDF发送给医生了',
    timestamp: '3天前',
    read: true,
    icon: Bell,
    color: '#D4AF37',
  },
];

export function NotificationsPage({ onBack }: NotificationsPageProps) {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all');

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const filtered = activeTab === 'unread' ? notifications.filter((n) => !n.read) : notifications;

  return (
    <div className="min-h-screen bg-[var(--app-bg)]">
      <header className="sticky top-0 z-50 safe-area-top bg-gradient-to-r from-[#D4AF37] to-[#C4A35A]">
        <div className="px-4 py-3 flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/20 h-10 w-10 rounded-full"
            onClick={onBack}
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <h1 className="text-lg font-bold text-white flex-1">消息通知</h1>
          {unreadCount > 0 && (
            <button
              className="text-xs text-white/80 hover:text-white"
              onClick={markAllAsRead}
            >
              全部已读
            </button>
          )}
        </div>
      </header>

      <main className="px-4 py-4 space-y-4 pb-24">
        {/* Tabs */}
        <div className="flex gap-2">
          <button
            className={`flex-1 py-2 px-4 rounded-xl text-sm font-medium transition-all ${
              activeTab === 'all'
                ? 'gradient-primary text-white'
                : 'bg-white dark:bg-[#252B3D] text-gray-500'
            }`}
            onClick={() => setActiveTab('all')}
          >
            全部
            <span className="ml-1 text-xs opacity-70">({notifications.length})</span>
          </button>
          <button
            className={`flex-1 py-2 px-4 rounded-xl text-sm font-medium transition-all ${
              activeTab === 'unread'
                ? 'gradient-primary text-white'
                : 'bg-white dark:bg-[#252B3D] text-gray-500'
            }`}
            onClick={() => setActiveTab('unread')}
          >
            未读
            {unreadCount > 0 && (
              <span className="ml-1 px-1.5 py-0.5 rounded-full bg-white/20 text-xs">
                {unreadCount}
              </span>
            )}
          </button>
        </div>

        {/* Notification List */}
        {filtered.length === 0 ? (
          <div className="card-standard text-center py-12">
            <Bell className="h-12 w-12 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-400">暂无消息通知</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((notification) => {
              const Icon = notification.icon;
              return (
                <button
                  key={notification.id}
                  onClick={() => markAsRead(notification.id)}
                  className={`w-full card-standard text-left transition-all ${
                    !notification.read
                      ? 'border-l-4 border-l-[#D4AF37]'
                      : 'opacity-70'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: `${notification.color}15` }}
                    >
                      <Icon className="h-5 w-5" style={{ color: notification.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
                          {notification.title}
                        </p>
                        {!notification.read && (
                          <span className="w-2 h-2 rounded-full bg-[#D4AF37] flex-shrink-0 ml-2" />
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                        {notification.content}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">{notification.timestamp}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
