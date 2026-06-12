import { useEffect, useState, type ReactNode } from 'react';
import { Download, X, Smartphone } from 'lucide-react';
import { isNativeApp, isStandalonePwa } from '@/lib/initNativeApp';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface MobileAppShellProps {
  children: ReactNode;
}

export function MobileAppShell({ children }: MobileAppShellProps) {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    setIsInstalled(isNativeApp() || isStandalonePwa());

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
      const dismissed = sessionStorage.getItem('pwa-install-dismissed');
      if (!dismissed) {
        setShowInstallBanner(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setShowInstallBanner(false);
      setInstallPrompt(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) return;
    await installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowInstallBanner(false);
    }
    setInstallPrompt(null);
  };

  const dismissInstall = () => {
    setShowInstallBanner(false);
    sessionStorage.setItem('pwa-install-dismissed', '1');
  };

  return (
    <div className="mobile-app-shell">
      <div className="mobile-app-frame">
        {children}

        {showInstallBanner && !isInstalled && installPrompt && (
          <div className="install-banner safe-area-bottom">
            <div className="install-banner-inner">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shrink-0">
                  <Smartphone className="h-5 w-5 text-white" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[var(--app-text)] truncate">
                    安装到主屏幕
                  </p>
                  <p className="text-xs text-[var(--app-text-muted)] truncate">
                    像 App 一样全屏使用
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  className="p-2 text-[var(--app-text-muted)]"
                  onClick={dismissInstall}
                  aria-label="关闭"
                >
                  <X className="h-4 w-4" />
                </button>
                <button type="button" className="install-btn" onClick={handleInstall}>
                  <Download className="h-4 w-4" />
                  安装
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
