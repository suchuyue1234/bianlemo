import { useState } from 'react';
import { TrendingUp, Activity, Droplets, Wheat, Calendar } from 'lucide-react';
import type { HealthData, Record } from '@/types';

interface AnalysisPageProps {
  healthData: HealthData[];
  records: Record[];
  onViewHealthDetails?: () => void;
}

type TimeRange = 'week' | 'month' | 'year';

export function AnalysisPage({ healthData, records, onViewHealthDetails }: AnalysisPageProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>('week');

  const filteredData = timeRange === 'week' ? healthData.slice(-7) : timeRange === 'month' ? healthData.slice(-30) : healthData;

  const len = filteredData.length || 1;
  const avgScore = filteredData.length
    ? Math.round(filteredData.reduce((acc, d) => acc + d.score, 0) / len)
    : 0;
  const totalRecords = filteredData.reduce((acc, d) => acc + d.records, 0);
  const avgWater = filteredData.length
    ? Math.round(filteredData.reduce((acc, d) => acc + d.water, 0) / len)
    : 0;
  const avgFiber = filteredData.length
    ? Math.round(filteredData.reduce((acc, d) => acc + d.fiber, 0) / len)
    : 0;

  const maxScore = filteredData.length ? Math.max(...filteredData.map((d) => d.score)) : 0;
  const minScore = filteredData.length
    ? Math.min(...filteredData.filter((d) => d.score > 0).map((d) => d.score))
    : 0;

  const latestRecord = records[0];
  const latestScore = latestRecord?.score ?? (records.length > 0 ? avgScore : 0);

  const personalizedSuggestion =
    latestScore >= 85
      ? '今天嗯嗯状态很棒，继续保持固定作息和补水节奏。'
      : latestScore >= 70
        ? '整体还不错，建议明天早餐增加一份高纤维食物。'
        : records.length === 0
          ? '开始记录你的第一次排便吧，了解肠道健康的第一步！'
          : '最近肠道有点闹脾气，建议先把饮水与睡眠拉回稳定区间。';

  // Calculate pattern analysis from real data
  const timeMap = new Map<string, number>();
  let totalDuration = 0;
  let normalCount = 0;

  for (const r of records) {
    const hour = parseInt(r.time.split(':')[0], 10);
    const timeSlot = hour < 8 ? '06:00-08:00' : hour < 10 ? '08:00-10:00' : hour < 12 ? '10:00-12:00' : '12:00后';
    timeMap.set(timeSlot, (timeMap.get(timeSlot) || 0) + 1);
    totalDuration += r.duration;
    if (r.type === 'normal') normalCount++;
  }

  const bestTimeSlot = timeMap.size > 0
    ? [...timeMap.entries()].sort((a, b) => b[1] - a[1])[0][0]
    : '暂无数据';

  const avgDuration = records.length
    ? Math.round((totalDuration / records.length) * 10) / 10
    : 0;

  const normalRatio = records.length
    ? Math.round((normalCount / records.length) * 100)
    : 0;

  const uniqueDays = new Set(records.map((r) => r.date)).size;
  const streakInfo = uniqueDays >= 7 ? `${uniqueDays} 天` : uniqueDays > 0 ? `${uniqueDays} 天` : '0 天';

  const daysLabel = timeRange === 'week' ? '本周' : timeRange === 'month' ? '本月' : '今年';

  return (
    <div className="space-y-4 pb-24 page-enter">
      <div className="flex gap-1 p-1 bg-white dark:bg-[#252B3D] rounded-xl shadow-card">
        {(['week', 'month', 'year'] as TimeRange[]).map((range) => (
          <button
            key={range}
            onClick={() => setTimeRange(range)}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all tap-highlight ${
              timeRange === range
                ? 'gradient-primary text-[#2A1F0A] shadow-sm'
                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            {range === 'week' ? '本周' : range === 'month' ? '本月' : '本年'}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={onViewHealthDetails}
          className="card-standard col-span-2 border border-[#D4AF37]/30 text-left tap-highlight active:scale-[0.99] transition-transform w-full"
        >
          <p className="text-xs text-[var(--app-text-muted)]">本次便便评分 · 点击查看详情</p>
          <div className="flex items-end justify-between mt-1">
            <p className="text-3xl font-bold text-gradient">{latestScore}</p>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {latestRecord?.poopAvatar ?? '💩'} {latestRecord?.moodTag ?? (records.length > 0 ? `${daysLabel}数据已更新` : '等待新记录')}
            </p>
          </div>
        </button>
        <div className="card-standard">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-[#D4AF37]/10 flex items-center justify-center">
              <Activity className="h-4 w-4 text-[#D4AF37]" />
            </div>
            <span className="text-xs text-gray-500">平均评分</span>
          </div>
          <p className="text-2xl font-bold text-gradient">{avgScore}</p>
          <p className="text-xs text-gray-400 mt-1">
            最高 {maxScore} · 最低 {minScore}
          </p>
        </div>

        <div className="card-standard">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-[#C4A35A]/10 flex items-center justify-center">
              <Calendar className="h-4 w-4 text-[#C4A35A]" />
            </div>
            <span className="text-xs text-gray-500">记录次数</span>
          </div>
          <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{totalRecords}</p>
          <p className="text-xs text-gray-400 mt-1">
            平均每天 {filteredData.length ? Math.round(totalRecords / filteredData.length * 10) / 10 : 0} 次
          </p>
        </div>

        <div className="card-standard">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center">
              <Droplets className="h-4 w-4 text-blue-500" />
            </div>
            <span className="text-xs text-gray-500">日均饮水</span>
          </div>
          <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{avgWater}ml</p>
          <p className="text-xs text-gray-400 mt-1">目标 2000ml</p>
        </div>

        <div className="card-standard">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-orange-500/10 flex items-center justify-center">
              <Wheat className="h-4 w-4 text-orange-500" />
            </div>
            <span className="text-xs text-gray-500">日均纤维</span>
          </div>
          <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{avgFiber}g</p>
          <p className="text-xs text-gray-400 mt-1">目标 30g</p>
        </div>
      </div>

      <div className="card-standard">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-gray-800 dark:text-gray-100">
            健康评分趋势
          </h3>
          <TrendingUp className="h-4 w-4 text-[#C4A35A]" />
        </div>

        {filteredData.filter((d) => d.score > 0).length === 0 ? (
          <div className="h-40 flex items-center justify-center text-gray-400 text-sm">
            暂无数据，开始记录后显示趋势
          </div>
        ) : (
          <div className="h-40 flex items-end justify-between gap-2">
            {filteredData.map((data, index) => {
              const height = data.score > 0 ? (data.score / 100) * 100 : 4;
              return (
                <div key={index} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className={`w-full max-w-8 rounded-t-lg transition-all duration-500 ${
                      data.score > 0 ? 'gradient-primary' : 'bg-gray-200 dark:bg-gray-700'
                    }`}
                    style={{ height: `${height}%` }}
                  />
                  <span className="text-[10px] text-gray-400">{data.date}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="card-standard">
        <h3 className="text-base font-semibold text-gray-800 dark:text-gray-100 mb-4">
          排便规律分析
        </h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">最佳排便时间</span>
            <span className="text-sm font-medium text-[#D4AF37]">{bestTimeSlot}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">平均排便时长</span>
            <span className="text-sm font-medium text-[#D4AF37]">{avgDuration} 分钟</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">正常排便占比</span>
            <span className="text-sm font-medium text-[#C4A35A]">{normalRatio}%</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">连续达标天数</span>
            <span className="text-sm font-medium text-[#C4A35A]">{streakInfo}</span>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-[#D4AF37]/10 to-[#C4A35A]/10 rounded-2xl p-4">
        <h3 className="text-base font-semibold text-gray-800 dark:text-gray-100 mb-3">
          个性化改善建议
        </h3>
        <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">{personalizedSuggestion}</p>
        <ul className="space-y-2">
          <li className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] mt-2 flex-shrink-0" />
            保持规律作息，建议每天固定时间排便
          </li>
          <li className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C4A35A] mt-2 flex-shrink-0" />
            增加膳食纤维摄入，多吃蔬菜水果
          </li>
          <li className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] mt-2 flex-shrink-0" />
            每日饮水量建议达到2000ml以上
          </li>
          <li className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C4A35A] mt-2 flex-shrink-0" />
            适当运动，促进肠道蠕动
          </li>
        </ul>
      </div>
    </div>
  );
}
