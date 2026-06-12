import { useState } from 'react';
import { ChevronLeft, Camera, User, Mail, Phone, Calendar, MapPin, Edit2, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
import type { OnboardingData, User as UserType } from '@/types';

interface PersonalProfilePageProps {
  onBack: () => void;
  user: UserType;
  onSaveProfile: (data: Partial<OnboardingData>) => Promise<{ error?: string }>;
  onProfileUpdated?: () => void;
}

export function PersonalProfilePage({ onBack, user, onSaveProfile, onProfileUpdated }: PersonalProfilePageProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    nickname: user.name,
    email: user.email ?? '',
    phone: user.phone ?? '',
    birthday: user.birthday ?? '',
    gender: user.gender ?? 'male',
    location: user.location ?? '',
  });
  const [editForm, setEditForm] = useState(profile);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);

    const result = await onSaveProfile({
      displayName: editForm.nickname,
      gender: editForm.gender as 'male' | 'female' | 'other',
      birthday: editForm.birthday || undefined,
      phone: editForm.phone || undefined,
      location: editForm.location || undefined,
    });

    if (result.error) {
      toast.error('保存失败，请重试');
      setIsSaving(false);
      return;
    }

    onProfileUpdated?.();
    setProfile(editForm);
    setIsEditing(false);
    setIsSaving(false);
    toast.success('资料已保存');
  };

  const handleCancel = () => {
    setEditForm(profile);
    setIsEditing(false);
  };

  const infoFields: {
    key: keyof typeof profile;
    label: string;
    icon: typeof User;
    readOnly?: boolean;
  }[] = [
    { key: 'nickname', label: '昵称', icon: User },
    { key: 'email', label: '邮箱', icon: Mail, readOnly: true },
    { key: 'phone', label: '手机号', icon: Phone },
    { key: 'birthday', label: '生日', icon: Calendar },
    { key: 'location', label: '地区', icon: MapPin },
  ];

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
          <h1 className="text-lg font-bold text-white flex-1">个人资料</h1>
          {!isEditing ? (
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20 h-10 w-10 rounded-full"
              onClick={() => {
                setEditForm(profile);
                setIsEditing(true);
              }}
            >
              <Edit2 className="h-5 w-5" />
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20 h-10 w-10 rounded-full"
                onClick={handleCancel}
                disabled={isSaving}
              >
                <X className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20 h-10 w-10 rounded-full"
                onClick={handleSave}
                disabled={isSaving}
              >
                <Save className="h-5 w-5" />
              </Button>
            </div>
          )}
        </div>
      </header>

      <main className="px-4 py-4 space-y-4 pb-24">
        <div className="card-standard">
          <div className="flex items-center gap-4 mb-4">
            <div className="relative">
              <Avatar className="h-20 w-20">
                <AvatarImage src={user.avatar} alt={profile.nickname} />
                <AvatarFallback className="bg-[#D4AF37]/10 text-[#D4AF37] text-2xl">
                  {profile.nickname.charAt(0)}
                </AvatarFallback>
              </Avatar>
              {isEditing && (
                <button className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-[#D4AF37] flex items-center justify-center">
                  <Camera className="h-4 w-4 text-white" />
                </button>
              )}
            </div>
            <div>
              <p className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                {isEditing ? editForm.nickname : profile.nickname}
              </p>
              <p className="text-sm text-gray-500">肠道健康达人</p>
            </div>
          </div>

          <div className="space-y-1">
            {infoFields.map(({ key, label, icon: Icon, readOnly }) => (
              <div
                key={key}
                className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#D4AF37]/10 flex items-center justify-center">
                    <Icon className="h-4 w-4 text-[#D4AF37]" />
                  </div>
                  <span className="text-sm text-gray-500">{label}</span>
                </div>
                {isEditing && !readOnly ? (
                  <Input
                    className="w-40 h-9 text-right text-sm bg-transparent border-0 focus-visible:ring-0"
                    type={key === 'birthday' ? 'date' : 'text'}
                    value={editForm[key as keyof typeof editForm]}
                    onChange={(e) =>
                      setEditForm((prev) => ({ ...prev, [key]: e.target.value }))
                    }
                  />
                ) : (
                  <span className="text-sm text-gray-800 dark:text-gray-200">
                    {profile[key as keyof typeof profile] || '未填写'}
                  </span>
                )}
              </div>
            ))}

            <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#D4AF37]/10 flex items-center justify-center">
                  <User className="h-4 w-4 text-[#D4AF37]" />
                </div>
                <span className="text-sm text-gray-500">性别</span>
              </div>
              {isEditing ? (
                <div className="flex gap-2">
                  {(['male', 'female', 'other'] as const).map((g) => (
                    <button
                      key={g}
                      className={`px-3 py-1 rounded-lg text-sm ${
                        editForm.gender === g
                          ? 'bg-[#D4AF37] text-white'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                      }`}
                      onClick={() => setEditForm((prev) => ({ ...prev, gender: g }))}
                    >
                      {g === 'male' ? '男' : g === 'female' ? '女' : '其他'}
                    </button>
                  ))}
                </div>
              ) : (
                <span className="text-sm text-gray-800 dark:text-gray-200">
                  {profile.gender === 'male' ? '男' : profile.gender === 'female' ? '女' : '其他'}
                </span>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
