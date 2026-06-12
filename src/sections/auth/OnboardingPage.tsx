import { useState } from 'react';
import { User, Calendar, Phone, MapPin, Loader2, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { OnboardingData } from '@/types';
import { AuthLayout } from './AuthLayout';

interface OnboardingPageProps {
  email: string | null;
  avatarUrl?: string | null;
  onComplete: (data: OnboardingData) => Promise<{ error?: string }>;
}

const STEPS = ['基本信息', '联系方式'] as const;

export function OnboardingPage({ email, avatarUrl, onComplete }: OnboardingPageProps) {
  const [step, setStep] = useState(0);
  const [displayName, setDisplayName] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | 'other'>('male');
  const [birthday, setBirthday] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleNext = () => {
    setError('');
    if (step === 0) {
      if (!displayName.trim()) {
        setError('请输入昵称');
        return;
      }
      if (!birthday) {
        setError('请选择生日');
        return;
      }
      setStep(1);
      return;
    }
    void handleSubmit();
  };

  const handleSubmit = async () => {
    setError('');
    setIsLoading(true);
    const result = await onComplete({
      displayName: displayName.trim(),
      gender,
      birthday,
      phone: phone.trim() || undefined,
      location: location.trim() || undefined,
    });
    setIsLoading(false);
    if (result.error) {
      setError(result.error);
    }
  };

  return (
    <AuthLayout
      title="完善个人资料"
      subtitle={`步骤 ${step + 1}/${STEPS.length} · ${STEPS[step]}`}
    >
      <div className="flex gap-2 mb-6">
        {STEPS.map((_, i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-colors ${
              i <= step ? 'bg-gradient-to-r from-[#D4AF37] to-[#C4A35A]' : 'bg-gray-700'
            }`}
          />
        ))}
      </div>

      {step === 0 && (
        <div className="space-y-5 flex-1">
          <div className="flex flex-col items-center gap-3 py-2">
            <Avatar className="h-20 w-20">
              <AvatarImage src={avatarUrl ?? undefined} />
              <AvatarFallback className="bg-[#D4AF37]/20 text-[#D4AF37] text-2xl">
                {displayName.charAt(0) || '?'}
              </AvatarFallback>
            </Avatar>
            {email && (
              <p className="text-xs text-[var(--app-text-muted)]">{email}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="nickname" className="text-gray-400">
              昵称 <span className="text-[#FF6B4A]">*</span>
            </Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input
                id="nickname"
                placeholder="给自己起个名字吧"
                className="input-standard pl-10"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                maxLength={20}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-gray-400">
              性别 <span className="text-[#FF6B4A]">*</span>
            </Label>
            <div className="grid grid-cols-3 gap-2">
              {(
                [
                  { value: 'male' as const, label: '男' },
                  { value: 'female' as const, label: '女' },
                  { value: 'other' as const, label: '其他' },
                ] as const
              ).map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  className={`h-12 rounded-xl text-sm font-medium transition-all ${
                    gender === value
                      ? 'bg-gradient-to-r from-[#D4AF37] to-[#C4A35A] text-white'
                      : 'bg-[#1D2738] text-gray-400 border border-white/5'
                  }`}
                  onClick={() => setGender(value)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="birthday" className="text-gray-400">
              生日 <span className="text-[#FF6B4A]">*</span>
            </Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input
                id="birthday"
                type="date"
                className="input-standard pl-10"
                value={birthday}
                onChange={(e) => setBirthday(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="space-y-5 flex-1">
          <p className="text-sm text-[var(--app-text-muted)]">
            以下信息可选填，有助于我们提供更精准的健康建议。
          </p>

          <div className="space-y-2">
            <Label htmlFor="phone" className="text-gray-400">
              手机号
            </Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input
                id="phone"
                type="tel"
                placeholder="138****8888"
                className="input-standard pl-10"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location" className="text-gray-400">
              所在地区
            </Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input
                id="location"
                placeholder="例如：北京市朝阳区"
                className="input-standard pl-10"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
          </div>

          <div className="card-standard">
            <p className="text-sm text-gray-300 font-medium mb-2">资料预览</p>
            <div className="space-y-1 text-sm text-[var(--app-text-muted)]">
              <p>昵称：{displayName}</p>
              <p>性别：{gender === 'male' ? '男' : gender === 'female' ? '女' : '其他'}</p>
              <p>生日：{birthday}</p>
              {phone && <p>手机：{phone}</p>}
              {location && <p>地区：{location}</p>}
            </div>
          </div>
        </div>
      )}

      {error && (
        <p className="text-sm text-[#FF6B4A] bg-[#FF6B4A]/10 rounded-xl px-4 py-3 mt-4">{error}</p>
      )}

      <div className="flex gap-3 mt-6">
        {step > 0 && (
          <Button
            variant="outline"
            className="flex-1 h-12 rounded-xl border-white/10 bg-transparent text-gray-300"
            onClick={() => setStep(step - 1)}
            disabled={isLoading}
          >
            上一步
          </Button>
        )}
        <Button className="btn-primary flex-1" onClick={handleNext} disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              保存中…
            </>
          ) : step < STEPS.length - 1 ? (
            <>
              下一步
              <ChevronRight className="h-4 w-4 ml-1" />
            </>
          ) : (
            '完成，开始使用'
          )}
        </Button>
      </div>
    </AuthLayout>
  );
}
