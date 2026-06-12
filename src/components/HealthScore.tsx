import { useEffect, useState, useCallback } from 'react';
import { TrendingUp, TrendingDown, Minus, Activity, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HealthScoreProps {
  score: number;
  previousScore?: number;
  onViewDetails?: () => void;
}

export function HealthScore({ score, previousScore = 80, onViewDetails }: HealthScoreProps) {
  const [animatedScore, setAnimatedScore] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showPulse, setShowPulse] = useState(false);

  useEffect(() => {
    setIsAnimating(true);
    setShowPulse(true);

    const duration = 1200;
    const startTime = performance.now();
    const startValue = 0;

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentScore = Math.round(startValue + (score - startValue) * easeOut);
      setAnimatedScore(currentScore);
      if (progress < 1) requestAnimationFrame(animate);
      else {
        setIsAnimating(false);
        setTimeout(() => setShowPulse(false), 500);
      }
    };

    requestAnimationFrame(animate);
  }, [score]);

  const diff = score - previousScore;
  const TrendIcon = diff > 0 ? TrendingUp : diff < 0 ? TrendingDown : Minus;
  const trendColor =
    diff > 0 ? 'text-[#D4AF37]' : diff < 0 ? 'text-[#E07B54]' : 'text-[var(--app-text-muted)]';
  const trendBg =
    diff > 0 ? 'bg-[#D4AF37]/15' : diff < 0 ? 'bg-[#E07B54]/15' : 'bg-[#1A1510]';

  const radius = 50;
  const strokeWidth = 8;
  const normalizedRadius = radius - strokeWidth / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (animatedScore / 100) * circumference;

  const getScoreStatus = useCallback((s: number) => {
    if (s >= 90) return { text: '优秀', color: '#D4AF37' };
    if (s >= 80) return { text: '良好', color: '#C4A35A' };
    if (s >= 60) return { text: '一般', color: '#E8B86D' };
    return { text: '需关注', color: '#E07B54' };
  }, []);

  const scoreStatus = getScoreStatus(score);

  return (
    <div
      className="card-standard relative overflow-hidden cursor-pointer tap-highlight active:scale-[0.99] transition-transform"
      onClick={onViewDetails}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') onViewDetails?.();
      }}
    >
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br from-[#D4AF37]/15 to-transparent rounded-full" />

      <div className="flex items-center justify-between mb-5 relative z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[#D4AF37]/15 flex items-center justify-center">
            <Activity className="h-4 w-4 text-[#D4AF37]" />
          </div>
          <h3 className="text-base font-semibold text-[var(--app-text)]">健康评分</h3>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 text-[#D4AF37] hover:bg-[#D4AF37]/10 gap-0.5"
          onClick={(e) => {
            e.stopPropagation();
            onViewDetails?.();
          }}
        >
          详情
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex items-center justify-center relative z-10">
        <div className="relative">
          {showPulse && (
            <div className="absolute inset-0 rounded-full bg-[#D4AF37]/20 animate-ping" />
          )}
          <svg width={radius * 2} height={radius * 2} className="transform -rotate-90">
            <circle
              stroke="currentColor"
              fill="transparent"
              strokeWidth={strokeWidth}
              r={normalizedRadius}
              cx={radius}
              cy={radius}
              className="text-[#1A1510]"
            />
            <circle
              stroke="url(#healthGradient)"
              fill="transparent"
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              r={normalizedRadius}
              cx={radius}
              cy={radius}
              style={{
                strokeDasharray: `${circumference} ${circumference}`,
                strokeDashoffset,
                transition: 'stroke-dashoffset 0.3s ease-out',
              }}
            />
            <defs>
              <linearGradient id="healthGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#F5E6B8" />
                <stop offset="50%" stopColor="#D4AF37" />
                <stop offset="100%" stopColor="#B8860B" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span
              className={`text-4xl font-bold text-gradient transition-all duration-300 ${
                isAnimating ? 'scale-110' : 'scale-100'
              }`}
            >
              {animatedScore}
            </span>
            <span className="text-xs text-[var(--app-text-muted)] mt-0.5">分</span>
          </div>
        </div>
      </div>

      <div className="mt-5 flex items-center justify-center gap-3">
        <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full ${trendBg} ${trendColor}`}>
          <TrendIcon className="h-3.5 w-3.5" />
          <span className="text-xs font-medium">
            {diff > 0 ? '+' : ''}
            {diff}
          </span>
        </div>
        <div
          className="px-2.5 py-1 rounded-full text-xs font-medium"
          style={{
            backgroundColor: `${scoreStatus.color}20`,
            color: scoreStatus.color,
          }}
        >
          {scoreStatus.text}
        </div>
      </div>

      <p className="mt-3 text-center text-sm text-[var(--app-text-muted)]">
        {score >= 90
          ? '肠道健康状况优秀！继续保持'
          : score >= 80
            ? '肠道健康状况良好'
            : score >= 60
              ? '肠道健康状况一般，注意调理'
              : '肠道健康状况需关注，建议就医'}
      </p>
    </div>
  );
}
