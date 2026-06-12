import jsPDF from 'jspdf';
import type { Record, User } from '@/types';

function formatDate(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
    date.getDate()
  ).padStart(2, '0')}`;
}

function average(values: number[]): number {
  return values.length ? Math.round(values.reduce((sum, value) => sum + value, 0) / values.length) : 0;
}

function getHealthSummary(records: Record[]) {
  const normalCount = records.filter((record) => record.type === 'normal').length;
  const warningCount = records.filter((record) => record.type !== 'normal').length;
  const avgDuration = average(records.map((record) => record.duration));
  const avgScore = average(records.map((record) => record.score ?? 80));
  const avgWeight = average(records.map((record) => record.weight ?? 0).filter(Boolean));

  const recommendations = [
    avgScore >= 85
      ? 'Maintain a stable morning bowel routine and hydration.'
      : 'Increase water intake and keep wake-up time consistent for 7 days.',
    warningCount > 2
      ? 'Monitor constipation/diarrhea episodes and consider medical consultation if repeated.'
      : 'Keep tracking bowel shape and feeling for trend stability.',
    avgWeight > 0
      ? `Current estimated average stool weight is ${avgWeight}g; continue observing large fluctuations.`
      : 'Add stool weight tracking for more accurate physician review.',
  ];

  return {
    normalCount,
    warningCount,
    avgDuration,
    avgScore,
    avgWeight,
    recommendations,
  };
}

export function generateDoctorReportPdf(user: User, records: Record[]) {
  const doc = new jsPDF({
    unit: 'pt',
    format: 'a4',
  });

  const summary = getHealthSummary(records);
  const createdAt = formatDate(new Date());
  const recentRecords = records.slice(0, 6);

  doc.setFillColor(74, 144, 226);
  doc.rect(0, 0, 595, 110, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.text('Bianlemo Gut Health Report', 40, 48);
  doc.setFontSize(11);
  doc.text(`Prepared for ${user.name}`, 40, 70);
  doc.text(`Generated on ${createdAt}`, 40, 88);

  doc.setTextColor(33, 37, 41);
  doc.setFontSize(14);
  doc.text('Overview', 40, 145);

  const cards = [
    { label: 'Total Records', value: String(records.length) },
    { label: 'Average Score', value: `${summary.avgScore}/100` },
    { label: 'Normal Ratio', value: `${records.length ? Math.round((summary.normalCount / records.length) * 100) : 0}%` },
    { label: 'Avg Duration', value: `${summary.avgDuration} min` },
  ];

  cards.forEach((card, index) => {
    const x = 40 + index * 128;
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(x, 160, 112, 70, 12, 12, 'F');
    doc.setFontSize(10);
    doc.setTextColor(108, 117, 125);
    doc.text(card.label, x + 12, 184);
    doc.setFontSize(18);
    doc.setTextColor(33, 37, 41);
    doc.text(card.value, x + 12, 212);
  });

  doc.setFontSize(14);
  doc.text('Clinical Highlights', 40, 275);
  doc.setFontSize(11);
  doc.text(`- Warning episodes recorded: ${summary.warningCount}`, 48, 298);
  doc.text(`- Estimated stool weight average: ${summary.avgWeight || 'N/A'} g`, 48, 318);
  doc.text(`- Latest bowel persona: ${recentRecords[0]?.moodTag ?? 'Pending new logs'}`, 48, 338);

  doc.setFontSize(14);
  doc.text('Recommendations', 40, 380);
  doc.setFontSize(11);
  summary.recommendations.forEach((item, index) => {
    doc.text(`${index + 1}. ${item}`, 48, 404 + index * 22, { maxWidth: 500 });
  });

  doc.setFontSize(14);
  doc.text('Recent Record Snapshot', 40, 492);
  doc.setFillColor(74, 144, 226);
  doc.roundedRect(40, 506, 515, 24, 6, 6, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.text('Date', 52, 522);
  doc.text('Type', 150, 522);
  doc.text('Duration', 245, 522);
  doc.text('Score', 330, 522);
  doc.text('Persona', 395, 522);

  doc.setTextColor(33, 37, 41);
  recentRecords.forEach((record, index) => {
    const y = 550 + index * 24;
    doc.setFontSize(10);
    doc.text(record.date, 52, y);
    doc.text(record.type, 150, y);
    doc.text(`${record.duration} min`, 245, y);
    doc.text(String(record.score ?? 80), 330, y);
    doc.text(record.moodTag ?? '-', 395, y, { maxWidth: 145 });
  });

  doc.setFontSize(9);
  doc.setTextColor(108, 117, 125);
  doc.text(
    'This report is intended for supportive self-tracking and physician communication, not for diagnosis.',
    40,
    800,
    { maxWidth: 515 }
  );

  doc.save(`bianlemo-gut-report-${createdAt}.pdf`);
}
