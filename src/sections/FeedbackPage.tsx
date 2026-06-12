import { useState } from 'react';
import { ChevronLeft, Send, Image, Smile, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

interface FeedbackPageProps {
  onBack: () => void;
}

type FeedbackType = 'bug' | 'feature' | 'suggestion' | 'other';

const feedbackTypes: { id: FeedbackType; label: string; emoji: string }[] = [
  { id: 'bug', label: 'Bug反馈', emoji: '🐛' },
  { id: 'feature', label: '功能建议', emoji: '💡' },
  { id: 'suggestion', label: '体验优化', emoji: '✨' },
  { id: 'other', label: '其他', emoji: '💬' },
];

export function FeedbackPage({ onBack }: FeedbackPageProps) {
  const [type, setType] = useState<FeedbackType>('bug');
  const [content, setContent] = useState('');
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (!content.trim()) {
      toast.error('请输入反馈内容');
      return;
    }
    setSubmitted(true);
    toast.success('反馈已提交，感谢您的宝贵意见！');
  };

  if (submitted) {
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
            <h1 className="text-lg font-bold text-white flex-1">意见反馈</h1>
          </div>
        </header>

        <main className="px-4 py-4 pb-24">
          <div className="card-standard text-center py-12">
            <CheckCircle className="h-16 w-16 text-[#C4A35A] mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">
              反馈已提交
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              感谢您的宝贵意见，我们会认真考虑并持续改进产品体验
            </p>
            <Button
              className="gradient-primary text-white px-8"
              onClick={() => {
                setSubmitted(false);
                setContent('');
              }}
            >
              继续反馈
            </Button>
          </div>
        </main>
      </div>
    );
  }

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
          <h1 className="text-lg font-bold text-white flex-1">意见反馈</h1>
        </div>
      </header>

      <main className="px-4 py-4 space-y-4 pb-24">
        {/* Feedback Type */}
        <div className="card-standard">
          <h3 className="text-sm font-medium text-gray-500 mb-3">反馈类型</h3>
          <div className="grid grid-cols-4 gap-2">
            {feedbackTypes.map((t) => (
              <button
                key={t.id}
                className={`p-3 rounded-xl text-center transition-all ${
                  type === t.id
                    ? 'gradient-primary text-white'
                    : 'bg-gray-50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-400'
                }`}
                onClick={() => setType(t.id)}
              >
                <span className="text-xl">{t.emoji}</span>
                <p className="text-xs mt-1">{t.label}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="card-standard">
          <h3 className="text-sm font-medium text-gray-500 mb-3">详细描述</h3>
          <Textarea
            className="min-h-32 resize-none bg-gray-50 dark:bg-gray-800/50 border-0 rounded-xl"
            placeholder="请详细描述您遇到的问题或建议..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          <div className="flex items-center justify-between mt-2">
            <div className="flex gap-2">
              <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <Image className="h-5 w-5 text-gray-400" />
              </button>
              <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <Smile className="h-5 w-5 text-gray-400" />
              </button>
            </div>
            <span className="text-xs text-gray-400">{content.length}/500</span>
          </div>
        </div>

        {/* Contact Email (optional) */}
        <div className="card-standard">
          <h3 className="text-sm font-medium text-gray-500 mb-3">联系方式（可选）</h3>
          <input
            className="w-full p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 text-sm border-0 focus:ring-2 focus:ring-[#D4AF37]/50 outline-none"
            placeholder="留下邮箱，方便我们回复您"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
          />
        </div>

        {/* Submit */}
        <Button
          className="w-full gradient-primary text-white h-12 rounded-xl text-base font-medium"
          onClick={handleSubmit}
          disabled={!content.trim()}
        >
          <Send className="h-4 w-4 mr-2" />
          提交反馈
        </Button>
      </main>
    </div>
  );
}
