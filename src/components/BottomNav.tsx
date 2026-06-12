import { Home, ClipboardList, BarChart3, FileText, User } from 'lucide-react';
import type { TabType } from '@/types';

interface BottomNavProps {
  currentTab: TabType;
  onTabChange: (tab: TabType) => void;
}

const tabs: { id: TabType; label: string; icon: typeof Home }[] = [
  { id: 'home', label: '首页', icon: Home },
  { id: 'record', label: '记录', icon: ClipboardList },
  { id: 'analysis', label: '分析', icon: BarChart3 },
  { id: 'report', label: '报告', icon: FileText },
  { id: 'profile', label: '我的', icon: User },
];

export function BottomNav({ currentTab, onTabChange }: BottomNavProps) {
  return (
    <nav className="bottom-nav-bar" aria-label="主导航">
      <div className="px-2 py-2">
        <div className="flex items-center justify-around max-w-md mx-auto">
          {tabs.map((tab) => {
            const isActive = currentTab === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onTabChange(tab.id)}
                className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all duration-200 tap-highlight min-w-[64px] ${
                  isActive
                    ? 'text-[#D4AF37]'
                    : 'text-[var(--app-text-muted)] hover:text-[#F5E6B8]'
                }`}
              >
                <div className={`relative ${isActive ? 'scale-110' : ''} transition-transform duration-200`}>
                  <Icon
                    className={`h-5 w-5 transition-all duration-200 ${
                      isActive ? 'stroke-[2.5px]' : 'stroke-2'
                    }`}
                  />
                  {isActive && (
                    <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#D4AF37]" />
                  )}
                </div>
                <span className={`text-[11px] ${isActive ? 'font-semibold' : ''} transition-all duration-200`}>
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
