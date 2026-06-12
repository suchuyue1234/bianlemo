import { ChevronLeft, Activity, TrendingUp, TrendingDown, Minus, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Record } from '@/types';
import { getHealthScoreBreakdown } from '@/lib/healthScoreBreakdown';

interface HealthScoreDetailPageProps {
  onBack: () => void;
  records: Record[];
  healthScore: number;
  previousScore?: number;
  onNavigateToHelp?: () => void;
}

function ScoreBar({ label, score, weight }: { label: string; score: number; weight: string }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="text-[var(--app-text-muted)]">{label}</span>
        <span className="font-semibold text-[#F5E6B8]">{score} 分</span>
      </div>
      <div className="h-2 rounded-full bg-[#1A1510] overflow-hidden">
        <div
          className="h-full rounded-full gradient-primary transition-all duration-700"
          style={{ width: `${score}%` }}
        />
      </div>
      <p className="text-xs text-[var(--app-text-muted)]">权重 {weight}</p>
    </div>
  );
}

export function HealthScoreDetailPage({
  onBack,
  records,
  healthScore,
  previousScore = 80,
  onNavigateToHelp,
}: HealthScoreDetailPageProps) {
  const breakdown = getHealthScoreBreakdown(records, previousScore);
  const TrendIcon =
    breakdown.trend > 0 ? TrendingUp : breakdown.trend < 0 ? TrendingDown : Minus;
  const trendColor =
    breakdown.trend > 0
      ? 'text-[#D4AF37]'
      : breakdown.trend < 0
        ? 'text-[#E07B54]'
        : 'text-[var(--app-text-muted)]';

  return (
    <div className="min-h-screen bg-[var(--app-bg)]">
      <header className="subpage-header">
        <div className="px-4 py-3 flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="text-[#2A1F0A] hover:bg-black/10 h-10 w-10 rounded-full"
            onClick={onBack}
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <h1 className="text-lg font-bold text-[#2A1F0A] flex-1">健康评分详情</h1>
        </div>
      </header>

      <main className="px-4 py-4 space-y-4 pb-24">
        {/* 总分卡片 */}
        <div className="card-standard relative overflow-hidden">
          <div className="absolute -top-8 -right-8 w-28 h-28 rounded-full bg-[#D4AF37]/10" />
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-full bg-[#D4AF37]/15 flex items-center justify-center">
              <Activity className="h-4 w-4 text-[#D4AF37]" />
            </div>
            <h2 className="text-base font-semibold">综合评分</h2>
          </div>
          <div className="flex items-end gap-4">
            <span className="text-5xl font-bold text-gradient">{healthScore}</span>
            <div className="pb-2 space-y-1">
              <span
                className="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium"
                style={{
                  backgroundColor: `${breakdown.status.color}20`,
                  color: breakdown.status.color,
                }}
              >
                {breakdown.status.text}
              </span>
              <div className={`flex items-center gap-1 text-sm ${trendColor}`}>
                <TrendIcon className="h-4 w-4" />
                <span>
                  较上期 {breakdown.trend > 0 ? '+' : ''}
                  {breakdown.trend} 分
                </span>
              </div>
            </div>
          </div>
          <p className="mt-3 text-sm text-[var(--app-text-muted)]">
            基于近 {breakdown.recentCount || 14} 条记录综合计算，共 {breakdown.recordCount} 条历史记录
          </p>
        </div>

        {/* 分项得分 */}
        <div className="card-standard space-y-5">
          <h3 className="text-base font-semibold">评分明细</h3>
          <ScoreBar label="粪便形状（Bristol 分型）" score={breakdown.shapeScore} weight="50%" />
          <ScoreBar label="排便时长" score={breakdown.durationScore} weight="35%" />
          <ScoreBar label="排便感受" score={breakdown.feelingScore} weight="15%" />
        </div>

        {/* 7日趋势 */}
        <div className="card-standard">
          <h3 className="text-base font-semibold mb-4">近 7 日趋势</h3>
          <div className="flex items-end justify-between gap-1 h-32">
            {breakdown.dailyScores.map((day) => {
              const height = day.score > 0 ? `${Math.max(8, day.score)}%` : '4%';
              return (
                <div key={day.date} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-[10px] text-[var(--app-text-muted)]">
                    {day.score > 0 ? day.score : '-'}
                  </span>
                  <div className="w-full flex-1 flex items-end">
                    <div
                      className={`w-full rounded-t-md ${day.score > 0 ? 'gradient-primary' : 'bg-[#1A1510]'}`}
                      style={{ height }}
                    />
                  </div>
                  <span className="text-[10px] text-[var(--app-text-muted)]">{day.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* 连续打卡 */}
        <div className="grid grid-cols-2 gap-3">
          <div className="card-standard text-center py-4">
            <p className="text-2xl font-bold text-gradient">{breakdown.streak}</p>
            <p className="text-xs text-[var(--app-text-muted)] mt-1">连续打卡（天）</p>
          </div>
          <div className="card-standard text-center py-4">
            <p className="text-2xl font-bold text-gradient">{breakdown.recordCount}</p>
            <p className="text-xs text-[var(--app-text-muted)] mt-1">累计记录（条）</p>
          </div>
        </div>

        {/* 健康建议 */}
        <div className="card-standard">
          <h3 className="text-base font-semibold mb-3">个性化建议</h3>
          <ul className="space-y-2">
            {breakdown.tips.map((tip, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-[var(--app-text-muted)]">
                <span className="text-[#D4AF37] mt-0.5">•</span>
                {tip}
              </li>
            ))}
          </ul>
        </div>

        {/* 说明入口 */}
        {onNavigateToHelp && (
          <button
            type="button"
            onClick={onNavigateToHelp}
            className="w-full card-standard flex items-center gap-3 tap-highlight active:opacity-80"
          >
            <div className="w-10 h-10 rounded-full bg-[#D4AF37]/15 flex items-center justify-center">
              <Info className="h-5 w-5 text-[#D4AF37]" />
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-medium">了解评分规则</p>
              <p className="text-xs text-[var(--app-text-muted)]">查看 Bristol 分型与健康评分说明</p>
            </div>
            <ChevronLeft className="h-5 w-5 text-[var(--app-text-muted)] rotate-180" />
          </button>
        )}
      </main>
    </div>
  );
}
