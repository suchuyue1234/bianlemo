import { useState, useEffect } from 'react';
import { Search, Bell, ChevronLeft } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

interface HeaderProps {
  userName: string;
  userAvatar: string;
  unreadCount: number;
  onBack?: () => void;
  showBack?: boolean;
  onNotificationClick?: () => void;
  onSearchClick?: () => void;
}

export function Header({
  userName,
  userAvatar,
  unreadCount,
  onBack,
  showBack,
  onNotificationClick,
  onSearchClick,
}: HeaderProps) {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (unreadCount > 0) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 500);
      return () => clearTimeout(timer);
    }
  }, [unreadCount]);

  return (
    <header className="sticky top-0 z-50 safe-area-top">
      <div className="gradient-primary px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {showBack ? (
              <Button
                variant="ghost"
                size="icon"
                className="text-[#2A1F0A] hover:bg-black/10 h-10 w-10 rounded-full"
                onClick={onBack}
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
            ) : (
              <Avatar className="h-10 w-10 border-2 border-[#2A1F0A]/20">
                <AvatarImage src={userAvatar} alt={userName} />
                <AvatarFallback className="bg-[#2A1F0A]/15 text-[#2A1F0A] font-medium">
                  {userName.charAt(0)}
                </AvatarFallback>
              </Avatar>
            )}
            {!showBack && (
              <div>
                <h1 className="text-lg font-bold text-[#2A1F0A] leading-tight">便了么</h1>
                <p className="text-xs text-[#2A1F0A]/75">肠道健康管理</p>
              </div>
            )}
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="text-[#2A1F0A] hover:bg-black/10 h-10 w-10 rounded-full relative"
              onClick={onSearchClick}
            >
              <Search className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={`text-[#2A1F0A] hover:bg-black/10 h-10 w-10 rounded-full relative transition-transform ${
                isAnimating ? 'shake' : ''
              }`}
              onClick={onNotificationClick}
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className={`badge-red ${isAnimating ? 'pulse-red' : ''}`}>
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
