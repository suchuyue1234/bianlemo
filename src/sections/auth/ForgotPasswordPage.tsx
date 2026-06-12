import { useState } from 'react';
import { Mail, Loader2, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AuthLayout } from './AuthLayout';

interface ForgotPasswordPageProps {
  onBack: () => void;
  onReset: (email: string) => Promise<{ error?: string }>;
}

export function ForgotPasswordPage({ onBack, onReset }: ForgotPasswordPageProps) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('请输入邮箱');
      return;
    }

    setIsLoading(true);
    const result = await onReset(email.trim());
    setIsLoading(false);

    if (result.error) {
      setError(result.error);
      return;
    }
    setSent(true);
  };

  if (sent) {
    return (
      <AuthLayout title="邮件已发送" showBack onBack={onBack}>
        <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4">
          <CheckCircle2 className="h-16 w-16 text-[#C4A35A]" />
          <p className="text-sm text-[var(--app-text-muted)]">
            重置密码链接已发送至 <span className="text-[#D4AF37]">{email}</span>，请查收邮件并按提示操作。
          </p>
          <Button className="btn-primary w-full mt-6" onClick={onBack}>
            返回登录
          </Button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="找回密码"
      subtitle="输入注册邮箱，我们将发送重置链接"
      showBack
      onBack={onBack}
    >
      <form onSubmit={handleSubmit} className="space-y-5 flex-1">
        <div className="space-y-2">
          <Label htmlFor="reset-email" className="text-gray-400">
            邮箱
          </Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input
              id="reset-email"
              type="email"
              placeholder="your@email.com"
              className="input-standard pl-10"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>
        </div>

        {error && (
          <p className="text-sm text-[#FF6B4A] bg-[#FF6B4A]/10 rounded-xl px-4 py-3">{error}</p>
        )}

        <Button type="submit" className="btn-primary w-full" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              发送中…
            </>
          ) : (
            '发送重置链接'
          )}
        </Button>
      </form>
    </AuthLayout>
  );
}
