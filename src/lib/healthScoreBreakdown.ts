import type { Record } from '@/types';
import { computeHealthScore, computeStreak } from './statsFromRecords';

export interface HealthScoreBreakdown {
  overall: number;
  shapeScore: number;
  durationScore: number;
  feelingScore: number;
  streak: number;
  recordCount: number;
  recentCount: number;
  trend: number;
  dailyScores: { date: string; label: string; score: number }[];
  tips: string[];
  status: { text: string; color: string };
}

function shapeScore(shape: number): number {
  if (shape === 4) return 100;
  if (shape === 3 || shape === 5) return 85;
  if (shape === 2 || shape === 6) return 60;
  return 40;
}

function durationScore(duration: number): number {
  return Math.max(0, 100 - Math.abs(duration - 6) * 6);
}

function feelingScore(feeling?: Record['feeling']): number {
  if (feeling === 'light') return 100;
  if (feeling === 'normal') return 85;
  if (feeling === 'strained') return 65;
  if (feeling === 'urgent') return 55;
  return 80;
}

function getStatus(score: number): { text: string; color: string } {
  if (score >= 90) return { text: '优秀', color: '#D4AF37' };
  if (score >= 80) return { text: '良好', color: '#C4A35A' };
  if (score >= 60) return { text: '一般', color: '#E8B86D' };
  return { text: '需关注', color: '#E07B54' };
}

function buildTips(shape: number, duration: number, feeling?: Record['feeling']): string[] {
  const tips: string[] = [];
  if (shape <= 2) tips.push('形状偏硬，建议增加饮水和膳食纤维摄入');
  if (shape >= 6) tips.push('形状偏软，注意饮食卫生，避免生冷刺激');
  if (duration > 10) tips.push('排便用时偏长，可尝试规律作息与适度运动');
  if (duration < 3 && duration > 0) tips.push('排便过快，留意是否饮食变化引起');
  if (feeling === 'strained') tips.push('排便费力，可适当补充益生菌与温水');
  if (feeling === 'urgent') tips.push('便意急迫，建议记录饮食并观察变化');
  if (tips.length === 0) tips.push('整体状态不错，保持规律记录与均衡饮食');
  return tips.slice(0, 3);
}

export function getHealthScoreBreakdown(
  records: Record[],
  previousScore = 80
): HealthScoreBreakdown {
  const recent = records.slice(0, 14);
  const overall = computeHealthScore(records);
  const streak = computeStreak(records);

  if (recent.length === 0) {
    return {
      overall,
      shapeScore: 80,
      durationScore: 80,
      feelingScore: 80,
      streak,
      recordCount: records.length,
      recentCount: 0,
      trend: overall - previousScore,
      dailyScores: [],
      tips: ['开始记录你的第一次排便，了解肠道健康的第一步'],
      status: getStatus(overall),
    };
  }

  const shapeAvg = Math.round(
    recent.reduce((acc, r) => acc + shapeScore(r.shape), 0) / recent.length
  );
  const durationAvg = Math.round(
    recent.reduce((acc, r) => acc + durationScore(r.duration), 0) / recent.length
  );
  const feelingAvg = Math.round(
    recent.reduce((acc, r) => acc + feelingScore(r.feeling), 0) / recent.length
  );

  const latest = recent[0];
  const tips = buildTips(latest.shape, latest.duration, latest.feeling);

  const today = new Date();
  const dailyScores: HealthScoreBreakdown['dailyScores'] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split('T')[0];
    const dayRecords = records.filter((r) => r.date === key);
    const score =
      dayRecords.length === 0
        ? 0
        : Math.round(
            dayRecords.reduce((acc, r) => acc + (r.score ?? shapeScore(r.shape)), 0) /
              dayRecords.length
          );
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    dailyScores.push({ date: key, label: `${mm}/${dd}`, score });
  }

  return {
    overall,
    shapeScore: shapeAvg,
    durationScore: durationAvg,
    feelingScore: feelingAvg,
    streak,
    recordCount: records.length,
    recentCount: recent.length,
    trend: overall - previousScore,
    dailyScores,
    tips,
    status: getStatus(overall),
  };
}
