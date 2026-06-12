import type { ReactNode } from 'react';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AuthLayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
}

export function AuthLayout({ children, title, subtitle, showBack, onBack }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-[var(--app-bg)] flex flex-col safe-area-top safe-area-bottom">
      <div className="px-4 pt-4 pb-2">
        {showBack && onBack && (
          <Button
            variant="ghost"
            size="icon"
            className="text-gray-300 hover:bg-white/10 h-10 w-10 rounded-full -ml-2"
            onClick={onBack}
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
        )}
      </div>

      <div className="flex-1 flex flex-col px-6 pb-8 max-w-md mx-auto w-full">
        {(title || subtitle) && (
          <div className="mb-8">
            {title && <h1 className="text-2xl font-bold text-[var(--app-text)]">{title}</h1>}
            {subtitle && (
              <p className="text-sm text-[var(--app-text-muted)] mt-2">{subtitle}</p>
            )}
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
