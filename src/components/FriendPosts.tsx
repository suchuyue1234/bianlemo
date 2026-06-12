import { useState } from 'react';
import { Heart, MessageCircle, Share2, Users, ScrollText, Gift } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PostCommentsSheet } from '@/components/PostCommentsSheet';
import { toast } from 'sonner';
import type { FriendPost, PostComment } from '@/types';

interface FriendPostsProps {
  posts: FriendPost[];
  postComments: { [postId: string]: PostComment[] };
  currentUser: { id: string; name: string; avatar: string };
  onLike: (postId: string) => void;
  onSendPaper: (postId: string) => void;
  onAddComment: (postId: string, content: string) => void;
}

export function FriendPosts({
  posts,
  postComments,
  currentUser,
  onLike,
  onSendPaper,
  onAddComment,
}: FriendPostsProps) {
  const [activeTopic, setActiveTopic] = useState<'all' | 'health' | 'treehole'>('all');
  const [commentPost, setCommentPost] = useState<FriendPost | null>(null);

  const filtered = posts.filter((post) => {
    if (activeTopic === 'all') return true;
    if (activeTopic === 'health') return post.topic === '健康话题' || post.topic === '早起打卡';
    return post.topic === '匿名树洞' || post.topic === '精灵进化';
  });

  const handleShare = (post: FriendPost) => {
    const text = `${post.userName}：${post.content}`;
    if (navigator.share) {
      void navigator.share({ title: '便了么 · 好友动态', text }).catch(() => {});
    } else {
      void navigator.clipboard?.writeText(text);
      toast.success('已复制到剪贴板');
    }
  };

  return (
    <>
      <div className="card-standard">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#D4AF37]/15 flex items-center justify-center">
              <Users className="h-4 w-4 text-[#D4AF37]" />
            </div>
            <h3 className="text-base font-semibold text-[var(--app-text)]">好友动态</h3>
          </div>
          <span className="text-xs text-[var(--app-text-muted)]">{filtered.length} 条动态</span>
        </div>

        <div className="flex gap-2 mb-4">
          <button
            type="button"
            onClick={() => setActiveTopic(activeTopic === 'health' ? 'all' : 'health')}
            className={`px-3 py-2 rounded-xl text-xs flex items-center gap-1 transition-colors ${
              activeTopic === 'health'
                ? 'bg-[#D4AF37]/30 text-[#F5E6B8] ring-1 ring-[#D4AF37]/40'
                : 'bg-[#D4AF37]/15 text-[#C4A35A]'
            }`}
          >
            <ScrollText className="h-3.5 w-3.5" />
            健康话题广场
          </button>
          <button
            type="button"
            onClick={() => setActiveTopic(activeTopic === 'treehole' ? 'all' : 'treehole')}
            className={`px-3 py-2 rounded-xl text-xs flex items-center gap-1 transition-colors ${
              activeTopic === 'treehole'
                ? 'bg-[#D4AF37]/30 text-[#F5E6B8] ring-1 ring-[#D4AF37]/40'
                : 'bg-[#C4A35A]/20 text-[#E8B86D]'
            }`}
          >
            <MessageCircle className="h-3.5 w-3.5" />
            匿名树洞倾诉
          </button>
        </div>

        <div className="space-y-4">
          {filtered.length === 0 ? (
            <p className="text-center text-sm text-[var(--app-text-muted)] py-6">该话题暂无动态</p>
          ) : (
            filtered.map((post) => (
              <div
                key={post.id}
                className="p-4 rounded-xl bg-[#1A1510]/60 border border-[#D4AF37]/8"
              >
                <div className="flex items-center gap-3 mb-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={post.userAvatar} alt={post.userName} />
                    <AvatarFallback className="gradient-primary text-[#2A1F0A] text-sm">
                      {post.userName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-[var(--app-text)]">{post.userName}</p>
                    <p className="text-xs text-[var(--app-text-muted)]">{post.timestamp}</p>
                  </div>
                </div>

                <p className="text-sm text-[var(--app-text-muted)] mb-3 leading-relaxed">
                  {post.content}
                </p>
                <div className="text-xs text-[var(--app-text-muted)] mb-3">
                  话题：#{post.topic ?? '便便日常'} · 已收到 {post.paperGifts ?? 0} 卷暖心纸巾
                </div>

                <div className="flex items-center gap-6">
                  <button
                    type="button"
                    onClick={() => onLike(post.id)}
                    className={`flex items-center gap-1.5 text-sm tap-highlight transition-colors ${
                      post.isLiked ? 'text-[#E07B54]' : 'text-[var(--app-text-muted)] hover:text-[#F5E6B8]'
                    }`}
                  >
                    <Heart className={`h-4 w-4 ${post.isLiked ? 'fill-current' : ''}`} />
                    <span>{post.likes}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setCommentPost(post)}
                    className="flex items-center gap-1.5 text-sm text-[var(--app-text-muted)] hover:text-[#D4AF37] tap-highlight transition-colors"
                  >
                    <MessageCircle className="h-4 w-4" />
                    <span>{post.comments}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onSendPaper(post.id)}
                    className="flex items-center gap-1.5 text-sm text-[#D4AF37] hover:text-[#F5E6B8] tap-highlight transition-colors"
                  >
                    <Gift className="h-4 w-4" />
                    <span>送纸</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleShare(post)}
                    className="flex items-center gap-1.5 text-sm text-[var(--app-text-muted)] hover:text-[#F5E6B8] tap-highlight transition-colors ml-auto"
                  >
                    <Share2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <PostCommentsSheet
        post={commentPost}
        comments={commentPost ? postComments[commentPost.id] ?? [] : []}
        currentUser={currentUser}
        open={commentPost !== null}
        onOpenChange={(open) => {
          if (!open) setCommentPost(null);
        }}
        onAddComment={onAddComment}
      />
    </>
  );
}
