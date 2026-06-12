import type { HealthData, Record } from '@/types';

function shapeScore(shape: number): number {
  if (shape === 4) return 100;
  if (shape === 3 || shape === 5) return 85;
  if (shape === 2 || shape === 6) return 60;
  return 40;
}

export function computeHealthScore(records: Record[]): number {
  if (records.length === 0) return 80;
  const recent = records.slice(0, 14);
  const avg =
    recent.reduce((acc, r) => acc + shapeScore(r.shape), 0) / recent.length;
  return Math.min(100, Math.max(40, Math.round(avg)));
}

export function computeStreak(records: Record[]): number {
  if (records.length === 0) return 0;
  const days = new Set(records.map((r) => r.date));
  const fmt = (dt: Date) => dt.toISOString().split('T')[0];
  const today = new Date();
  let anchor = fmt(today);
  if (!days.has(anchor)) {
    const y = new Date(today);
    y.setDate(y.getDate() - 1);
    anchor = fmt(y);
    if (!days.has(anchor)) return 0;
  }
  let streak = 0;
  const cur = new Date(anchor + 'T12:00:00');
  for (let i = 0; i < 365; i++) {
    const d = new Date(cur);
    d.setDate(d.getDate() - i);
    const key = fmt(d);
    if (days.has(key)) streak += 1;
    else break;
  }
  return streak;
}

/** 最近 N 天健康趋势（用于分析页图表）；无记录日分数为 0，饮水/纤维为推算展示值 */
export function buildHealthSeries(records: Record[], days = 7): HealthData[] {
  const byDate = new Map<string, Record[]>();
  for (const r of records) {
    const list = byDate.get(r.date) ?? [];
    list.push(r);
    byDate.set(r.date, list);
  }
  const today = new Date();
  const out: HealthData[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split('T')[0];
    const dayRecords = byDate.get(key) ?? [];
    const score =
      dayRecords.length === 0
        ? 0
        : Math.round(
            dayRecords.reduce((acc, r) => acc + shapeScore(r.shape), 0) /
              dayRecords.length
          );
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    out.push({
      date: `${mm}/${dd}`,
      score,
      records: dayRecords.length,
      water: score > 0 ? 1600 + score * 4 : 0,
      fiber: score > 0 ? 18 + Math.round(score / 5) : 0,
    });
  }
  return out;
}
