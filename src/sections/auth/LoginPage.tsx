import { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AuthLayout } from './AuthLayout';

interface LoginPageProps {
  onBack: () => void;
  onLogin: (email: string, password: string) => Promise<{ error?: string }>;
  onForgotPassword: () => void;
  onGoRegister: () => void;
}

export function LoginPage({ onBack, onLogin, onForgotPassword, onGoRegister }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('请输入邮箱');
      return;
    }
    if (!password) {
      setError('请输入密码');
      return;
    }

    setIsLoading(true);
    const result = await onLogin(email.trim(), password);
    setIsLoading(false);
    if (result.error) {
      setError(result.error);
    }
  };

  return (
    <AuthLayout
      title="欢迎回来"
      subtitle="登录你的账号，继续追踪肠道健康"
      showBack
      onBack={onBack}
    >
      <form onSubmit={handleSubmit} className="space-y-5 flex-1">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-gray-400">
            邮箱
          </Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input
              id="email"
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
          <Label htmlFor="password" className="text-gray-400">
            密码
          </Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="请输入密码"
              className="input-standard pl-10 pr-10"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
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

        <div className="flex justify-end">
          <button
            type="button"
            className="text-sm text-[#D4AF37] hover:underline"
            onClick={onForgotPassword}
          >
            忘记密码？
          </button>
        </div>

        {error && (
          <p className="text-sm text-[#FF6B4A] bg-[#FF6B4A]/10 rounded-xl px-4 py-3">{error}</p>
        )}

        <Button type="submit" className="btn-primary w-full" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              登录中…
            </>
          ) : (
            '登录'
          )}
        </Button>

        <p className="text-center text-sm text-[var(--app-text-muted)]">
          还没有账号？{' '}
          <button type="button" className="text-[#D4AF37] hover:underline" onClick={onGoRegister}>
            立即注册
          </button>
        </p>
      </form>
    </AuthLayout>
  );
}
