import { Sparkles, Shield, Heart, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AuthLayout } from './AuthLayout';

interface WelcomePageProps {
  onLogin: () => void;
  onRegister: () => void;
  onGuest: () => void;
  isGuestLoading?: boolean;
}

export function WelcomePage({ onLogin, onRegister, onGuest, isGuestLoading }: WelcomePageProps) {
  const features = [
    { icon: Heart, text: '记录排便，追踪肠道健康' },
    { icon: Sparkles, text: 'AI 助手，个性化健康建议' },
    { icon: Shield, text: '隐私保护，数据安全可控' },
  ];

  return (
    <AuthLayout>
      <div className="flex-1 flex flex-col justify-center">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl gradient-primary shadow-lg shadow-[#D4AF37]/30 mb-6">
            <span className="text-5xl">💩</span>
          </div>
          <h1 className="text-3xl font-bold text-[var(--app-text)] mb-2">便了么</h1>
          <p className="text-[var(--app-text-muted)]">你的肠道健康管家</p>
        </div>

        <div className="card-standard space-y-3 mb-10">
          {features.map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#D4AF37]/15 flex items-center justify-center shrink-0">
                <Icon className="h-4 w-4 text-[#D4AF37]" />
              </div>
              <span className="text-sm text-gray-300">{text}</span>
            </div>
          ))}
        </div>

        <div className="space-y-3">
          <Button className="btn-primary w-full text-base" onClick={onRegister}>
            注册账号
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
          <Button className="btn-secondary w-full text-base" onClick={onLogin}>
            登录
          </Button>
          <Button
            variant="ghost"
            className="w-full text-[var(--app-text-muted)] hover:text-gray-300 hover:bg-white/5"
            onClick={onGuest}
            disabled={isGuestLoading}
          >
            {isGuestLoading ? '进入中…' : '先逛逛，游客体验'}
          </Button>
        </div>
      </div>
    </AuthLayout>
  );
}
