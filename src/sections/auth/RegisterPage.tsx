import { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, Loader2, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AuthLayout } from './AuthLayout';

interface RegisterPageProps {
  onBack: () => void;
  onRegister: (email: string, password: string) => Promise<{ error?: string; needsEmailConfirm?: boolean }>;
  onGoLogin: () => void;
}

export function RegisterPage({ onBack, onRegister, onGoLogin }: RegisterPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [emailSent, setEmailSent] = useState(false);

  const passwordChecks = [
    { label: '至少 6 个字符', ok: password.length >= 6 },
    { label: '两次密码一致', ok: password.length > 0 && password === confirmPassword },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('请输入邮箱');
      return;
    }
    if (password.length < 6) {
      setError('密码至少需要 6 个字符');
      return;
    }
    if (password !== confirmPassword) {
      setError('两次输入的密码不一致');
      return;
    }

    setIsLoading(true);
    const result = await onRegister(email.trim(), password);
    setIsLoading(false);

    if (result.error) {
      setError(result.error);
      return;
    }
    if (result.needsEmailConfirm) {
      setEmailSent(true);
    }
  };

  if (emailSent) {
    return (
      <AuthLayout title="验证邮箱" showBack onBack={onBack}>
        <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4">
          <CheckCircle2 className="h-16 w-16 text-[#C4A35A]" />
          <p className="text-[var(--app-text)] font-medium">验证邮件已发送</p>
          <p className="text-sm text-[var(--app-text-muted)]">
            我们已向 <span className="text-[#D4AF37]">{email}</span> 发送了验证链接，请查收邮件并点击链接完成注册。
          </p>
          <Button className="btn-primary w-full mt-6" onClick={onGoLogin}>
            返回登录
          </Button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="创建账号"
      subtitle="注册后即可开始记录，数据云端同步"
      showBack
      onBack={onBack}
    >
      <form onSubmit={handleSubmit} className="space-y-5 flex-1">
        <div className="space-y-2">
          <Label htmlFor="reg-email" className="text-gray-400">
            邮箱
          </Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input
              id="reg-email"
              type="email"
              placeholder="your@email.com"
              className="input-standard pl-10"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="reg-password" className="text-gray-400">
            密码
          </Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input
              id="reg-password"
              type={showPassword ? 'text' : 'password'}
              placeholder="至少 6 个字符"
              className="input-standard pl-10 pr-10"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirm-password" className="text-gray-400">
            确认密码
          </Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input
              id="confirm-password"
              type={showPassword ? 'text' : 'password'}
              placeholder="再次输入密码"
              className="input-standard pl-10"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          {passwordChecks.map(({ label, ok }) => (
            <div key={label} className="flex items-center gap-2 text-xs">
              <div
                className={`w-1.5 h-1.5 rounded-full ${ok ? 'bg-[#C4A35A]' : 'bg-gray-600'}`}
              />
              <span className={ok ? 'text-[#C4A35A]' : 'text-gray-500'}>{label}</span>
            </div>
          ))}
        </div>

        {error && (
          <p className="text-sm text-[#FF6B4A] bg-[#FF6B4A]/10 rounded-xl px-4 py-3">{error}</p>
        )}

        <Button type="submit" className="btn-primary w-full" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              注册中…
            </>
          ) : (
            '注册'
          )}
        </Button>

        <p className="text-center text-sm text-[var(--app-text-muted)]">
          已有账号？{' '}
          <button type="button" className="text-[#D4AF37] hover:underline" onClick={onGoLogin}>
            立即登录
          </button>
        </p>
      </form>
    </AuthLayout>
  );
}
