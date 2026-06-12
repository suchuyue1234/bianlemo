import { HealthScore } from '@/components/HealthScore';
import { QuickActions } from '@/components/QuickActions';
import { Reminders } from '@/components/Reminders';
import { FriendPosts } from '@/components/FriendPosts';
import type { User, Reminder, FriendPost, PostComment, GutPet } from '@/types';

interface HomePageProps {
  user: User;
  reminders: Reminder[];
  friendPosts: FriendPost[];
  postComments: { [postId: string]: PostComment[] };
  gutPet: GutPet;
  onToggleReminder: (id: string) => void;
  onToggleLike: (postId: string) => void;
  onSendPaper: (postId: string) => void;
  onAddComment: (postId: string, content: string) => void;
  onAddRecord: () => void;
  onViewCalendar: () => void;
  onViewHealthDetails: () => void;
  onToolClick: (tool: string) => void;
}

export function HomePage({
  user,
  reminders,
  friendPosts,
  postComments,
  gutPet,
  onToggleReminder,
  onToggleLike,
  onSendPaper,
  onAddComment,
  onAddRecord,
  onViewCalendar,
  onViewHealthDetails,
  onToolClick,
}: HomePageProps) {
  return (
    <div className="space-y-4 pb-24">
      <HealthScore
        score={user.healthScore}
        previousScore={80}
        onViewDetails={onViewHealthDetails}
      />

      {/* Quick Actions - Core functionality one-tap access */}
      <QuickActions
        onAddRecord={onAddRecord}
        onViewCalendar={onViewCalendar}
        onToolClick={onToolClick}
      />

      {/* Reminders */}
      <Reminders reminders={reminders} onToggle={onToggleReminder} />

      <div className="rounded-2xl p-4 bg-gradient-to-r from-[#D4AF37]/15 via-[#C4A35A]/10 to-[#B8860B]/20 border border-[#D4AF37]/10">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-semibold text-[var(--app-text)]">肠道精灵养成</h3>
          <span className="text-xs px-2 py-1 rounded-full bg-[#D4AF37]/20 text-[#F5E6B8]">
            Lv.{gutPet.level}
          </span>
        </div>
        <p className="text-sm text-[var(--app-text-muted)]">
          {gutPet.stage === 'evolved' ? '👑' : gutPet.stage === 'active' ? '🧸' : '🌱'} {gutPet.name}
          ，活力值 {gutPet.energy}/100
        </p>
        <div className="h-2 rounded-full bg-[#1A1510] mt-3 overflow-hidden">
          <div className="h-full gradient-primary" style={{ width: `${gutPet.energy}%` }} />
        </div>
        <p className="text-xs text-[var(--app-text-muted)] mt-2">
          已解锁装扮：{gutPet.accessories.length ? gutPet.accessories.join('、') : '继续记录嗯嗯来解锁'}
        </p>
      </div>

      <FriendPosts
        posts={friendPosts}
        postComments={postComments}
        currentUser={{ id: user.id, name: user.name, avatar: user.avatar }}
        onLike={onToggleLike}
        onSendPaper={onSendPaper}
        onAddComment={onAddComment}
      />
    </div>
  );
}
