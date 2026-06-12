import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { WelcomePage } from './WelcomePage';
import { LoginPage } from './LoginPage';
import { RegisterPage } from './RegisterPage';
import { ForgotPasswordPage } from './ForgotPasswordPage';
import { OnboardingPage } from './OnboardingPage';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';

export function AuthFlow() {
  const auth = useAuth();
  const [guestLoading, setGuestLoading] = useState(false);

  if (auth.isLoading) {
    return (
      <div className="min-h-screen bg-[var(--app-bg)] flex flex-col items-center justify-center gap-4">
        <div className="text-5xl animate-bounce">💩</div>
        <Loader2 className="h-6 w-6 animate-spin text-[#D4AF37]" />
        <p className="text-sm text-[var(--app-text-muted)]">加载中…</p>
      </div>
    );
  }

  const handleGuest = async () => {
    setGuestLoading(true);
    const result = await auth.signInAsGuest();
    setGuestLoading(false);
    if (result.error) {
      toast.error('游客模式启动失败', { description: result.error });
    }
  };

  const renderScreen = () => {
    switch (auth.authScreen) {
      case 'welcome':
        return (
          <WelcomePage
            onLogin={() => auth.setAuthScreen('login')}
            onRegister={() => auth.setAuthScreen('register')}
            onGuest={handleGuest}
            isGuestLoading={guestLoading}
          />
        );
      case 'login':
        return (
          <LoginPage
            onBack={() => auth.setAuthScreen('welcome')}
            onLogin={auth.signIn}
            onForgotPassword={() => auth.setAuthScreen('forgot')}
            onGoRegister={() => auth.setAuthScreen('register')}
          />
        );
      case 'register':
        return (
          <RegisterPage
            onBack={() => auth.setAuthScreen('welcome')}
            onRegister={auth.signUp}
            onGoLogin={() => auth.setAuthScreen('login')}
          />
        );
      case 'forgot':
        return (
          <ForgotPasswordPage
            onBack={() => auth.setAuthScreen('login')}
            onReset={auth.resetPassword}
          />
        );
      case 'onboarding':
        return (
          <OnboardingPage
            email={auth.email}
            avatarUrl={auth.profile?.avatarUrl}
            onComplete={auth.saveOnboarding}
          />
        );
      default:
        return null;
    }
  };

  return (
    <>
      <div className="auth-flow-scroll">{renderScreen()}</div>
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: 'var(--app-card)',
            color: 'var(--app-text)',
          },
        }}
      />
    </>
  );
}
