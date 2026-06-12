import { useState } from 'react';
import { Send } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import type { FriendPost, PostComment } from '@/types';

interface PostCommentsSheetProps {
  post: FriendPost | null;
  comments: PostComment[];
  currentUser: { id: string; name: string; avatar: string };
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddComment: (postId: string, content: string) => void;
}

export function PostCommentsSheet({
  post,
  comments,
  currentUser,
  open,
  onOpenChange,
  onAddComment,
}: PostCommentsSheetProps) {
  const [draft, setDraft] = useState('');

  const handleSubmit = () => {
    const text = draft.trim();
    if (!text || !post) return;
    onAddComment(post.id, text);
    setDraft('');
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="rounded-t-2xl bg-[var(--app-card)] border-[#D4AF37]/15 max-h-[75vh] px-0 pb-0"
      >
        <SheetHeader className="px-4 border-b border-[#D4AF37]/10 pb-3">
          <SheetTitle className="text-[var(--app-text)]">
            评论 {post ? `(${comments.length})` : ''}
          </SheetTitle>
          {post && (
            <p className="text-xs text-[var(--app-text-muted)] line-clamp-2 text-left">
              {post.userName}：{post.content}
            </p>
          )}
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4 min-h-[200px] max-h-[45vh]">
          {comments.length === 0 ? (
            <p className="text-center text-sm text-[var(--app-text-muted)] py-8">
              暂无评论，来说第一句吧
            </p>
          ) : (
            comments.map((c) => (
              <div key={c.id} className="flex gap-3">
                <Avatar className="h-8 w-8 shrink-0">
                  <AvatarImage src={c.userAvatar} alt={c.userName} />
                  <AvatarFallback className="gradient-primary text-[#2A1F0A] text-xs">
                    {c.userName.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2">
                    <span className="text-sm font-medium text-[var(--app-text)]">{c.userName}</span>
                    <span className="text-xs text-[var(--app-text-muted)]">{c.timestamp}</span>
                  </div>
                  <p className="text-sm text-[var(--app-text-muted)] mt-0.5 leading-relaxed">
                    {c.content}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="px-4 py-3 border-t border-[#D4AF37]/10 safe-area-bottom flex gap-2 items-end">
          <Avatar className="h-8 w-8 shrink-0 mb-1">
            <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
            <AvatarFallback className="gradient-primary text-[#2A1F0A] text-xs">
              {currentUser.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="写下你的评论…"
            rows={1}
            className="flex-1 input-standard min-h-[44px] max-h-24 py-3 resize-none"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
          />
          <Button
            size="icon"
            className="btn-primary h-11 w-11 shrink-0 rounded-xl"
            disabled={!draft.trim()}
            onClick={handleSubmit}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
