import { FileText, Download, Share2, Calendar, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { User, Record } from '@/types';
import { generateDoctorReportPdf } from '@/lib/reportPdf';
import { toast } from 'sonner';

interface ReportPageProps {
  user: User;
  records: Record[];
}

interface ReportData {
  id: string;
  title: string;
  date: string;
  type: 'monthly' | 'yearly' | 'weekly';
  score: number;
}

function generateReports(records: Record[]): ReportData[] {
  const monthlyMap = new Map<string, Record[]>();
  const yearlyMap = new Map<string, Record[]>();

  for (const r of records) {
    const month = r.date.substring(0, 7);
    const year = r.date.substring(0, 4);
    if (!monthlyMap.has(month)) monthlyMap.set(month, []);
    monthlyMap.get(month)!.push(r);
    if (!yearlyMap.has(year)) yearlyMap.set(year, []);
    yearlyMap.get(year)!.push(r);
  }

  const reports: ReportData[] = [];

  for (const [month, recs] of monthlyMap) {
    const avgScore = Math.round(recs.reduce((a, r) => a + (r.score ?? 75), 0) / recs.length);
    reports.push({
      id: `month-${month}`,
      title: `${month} 肠道健康报告`,
      date: `${month}-28`,
      type: 'monthly',
      score: avgScore,
    });
  }

  for (const [year, recs] of yearlyMap) {
    const avgScore = Math.round(recs.reduce((a, r) => a + (r.score ?? 75), 0) / recs.length);
    reports.push({
      id: `year-${year}`,
      title: `${year}年度健康总结`,
      date: `${year}-12-31`,
      type: 'yearly',
      score: avgScore,
    });
  }

  reports.sort((a, b) => b.date.localeCompare(a.date));
  return reports;
}

export function ReportPage({ user, records }: ReportPageProps) {
  const reports = generateReports(records);
  const latestReport = reports.length > 0 ? reports[0] : null;

  const normalRate = records.length
    ? Math.round((records.filter((r) => r.type === 'normal').length / records.length) * 100)
    : 0;
  const warningCount = records.filter((r) => r.type !== 'normal').length;

  const avgShape = records.length
    ? Math.round((records.reduce((a, r) => a + r.shape, 0) / records.length) * 10) / 10
    : 4;

  const avgDuration = records.length
    ? Math.round((records.reduce((a, r) => a + r.duration, 0) / records.length) * 10) / 10
    : 0;

  const uniqueDays = new Set(records.map((r) => r.date)).size;
  const regularityScore = records.length >= 7
    ? Math.min(100, Math.round((uniqueDays / records.length) * 80 + 20))
    : records.length > 0
      ? Math.round((uniqueDays / 7) * 100)
      : 0;

  const shapeScore = avgShape >= 3 && avgShape <= 5
    ? Math.round(100 - Math.abs(avgShape - 4) * 20)
    : Math.max(30, 100 - Math.abs(avgShape - 4) * 25);

  const durationScore = avgDuration >= 3 && avgDuration <= 10
    ? Math.round(100 - Math.abs(avgDuration - 6) * 8)
    : Math.max(30, 100 - Math.abs(avgDuration - 6) * 12);

  const waterScore = 65;

  const alerts: string[] = [];
  const constipationCount = records.filter((r) => r.type === 'constipation').length;
  const diarrheaCount = records.filter((r) => r.type === 'diarrhea').length;

  if (constipationCount > 0) {
    alerts.push(`${constipationCount}次检测到便秘情况，建议增加膳食纤维和水分摄入`);
  }
  if (diarrheaCount > 0) {
    alerts.push(`${diarrheaCount}次检测到腹泻情况，建议注意饮食卫生`);
  }
  if (avgDuration > 10) {
    alerts.push(`平均排便时长${avgDuration}分钟偏长，建议控制在10分钟以内`);
  }
  if (normalRate < 70 && records.length > 0) {
    alerts.push(`正常排便比例${normalRate}%偏低，建议关注肠道健康`);
  }
  if (records.length === 0) {
    alerts.push('暂无记录，开始记录排便来生成您的健康报告吧');
  }
  if (waterScore < 70) {
    alerts.push('建议每日饮水2000ml以上，保持肠道水分充足');
  }

  const createDoctorSummary = () => {
    const recent = records.slice(0, 10);
    return [
      '便了么肠道健康简报',
      `记录总数：${records.length}`,
      `近${Math.min(10, records.length)}次平均时长：${
        recent.length ? Math.round(recent.reduce((acc, r) => acc + r.duration, 0) / recent.length) : 0
      } 分钟`,
      `正常占比：${normalRate}%`,
      `异常次数：${warningCount}`,
      '建议：保持饮水>=2000ml，增加可溶性膳食纤维，持续观察一周。',
    ].join('\n');
  };

  const handleExportPdf = () => {
    generateDoctorReportPdf(user, records);
    toast.success('专业报告已生成', {
      description: 'PDF 已下载，可直接发送给医生。',
    });
  };

  const handleShareDoctor = async () => {
    const text = createDoctorSummary();
    if (navigator.share) {
      await navigator.share({
        title: '便了么健康报告',
        text,
      });
      toast.success('已打开系统分享面板');
      return;
    }
    await navigator.clipboard.writeText(text);
    toast.success('报告摘要已复制', {
      description: '可直接粘贴到微信或短信发送给医生。',
    });
  };

  const getRatingLabel = (score: number) => {
    if (score >= 90) return '优秀';
    if (score >= 80) return '良好';
    if (score >= 60) return '正常';
    return '需改善';
  };

  const getRatingColor = (score: number) => {
    if (score >= 90) return '#C4A35A';
    if (score >= 80) return '#D4AF37';
    if (score >= 60) return '#FFD166';
    return '#FF6B4A';
  };

  return (
    <div className="space-y-4 pb-24 page-enter">
      {/* Latest Report Card */}
      {latestReport ? (
        <div className="gradient-primary rounded-2xl p-5 text-white">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-white/70 text-sm">最新报告</p>
              <h2 className="text-xl font-bold">{latestReport.title}</h2>
            </div>
            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
              <span className="text-2xl font-bold">{latestReport.score}</span>
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm text-white/80">
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {latestReport.date}
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle className="h-4 w-4" />
              已生成
            </span>
          </div>
          <div className="flex gap-3 mt-4">
            <Button
              variant="secondary"
              onClick={handleExportPdf}
              className="flex-1 bg-white/20 hover:bg-white/30 text-white border-0 h-11 rounded-xl"
            >
              <Download className="h-4 w-4 mr-2" />
              下载
            </Button>
            <Button
              variant="secondary"
              onClick={handleShareDoctor}
              className="flex-1 bg-white/20 hover:bg-white/30 text-white border-0 h-11 rounded-xl"
            >
              <Share2 className="h-4 w-4 mr-2" />
              分享
            </Button>
          </div>
        </div>
      ) : (
        <div className="gradient-primary rounded-2xl p-5 text-white text-center">
          <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <h2 className="text-xl font-bold mb-2">暂无报告</h2>
          <p className="text-white/70 text-sm mb-4">开始记录排便数据，系统会自动生成健康报告</p>
        </div>
      )}

      {/* Report Summary */}
      <div className="card-standard">
        <h3 className="text-base font-semibold text-gray-800 dark:text-gray-100 mb-4">
          数据概览
        </h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-[#D4AF37]">{records.length}</p>
            <p className="text-xs text-gray-400 mt-1">记录次数</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-[#C4A35A]">{normalRate}%</p>
            <p className="text-xs text-gray-400 mt-1">正常比例</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-[#FF6B4A]">{warningCount}</p>
            <p className="text-xs text-gray-400 mt-1">异常提醒</p>
          </div>
        </div>
      </div>

      {/* Health Indicators */}
      <div className="card-standard">
        <h3 className="text-base font-semibold text-gray-800 dark:text-gray-100 mb-4">
          健康指标
        </h3>
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-gray-600 dark:text-gray-400">排便规律性</span>
              <span className="text-sm font-medium" style={{ color: getRatingColor(regularityScore) }}>
                {getRatingLabel(regularityScore)}
              </span>
            </div>
            <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${regularityScore}%`, backgroundColor: getRatingColor(regularityScore) }}
              />
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-gray-600 dark:text-gray-400">粪便形态</span>
              <span className="text-sm font-medium" style={{ color: getRatingColor(shapeScore) }}>
                {getRatingLabel(shapeScore)}
              </span>
            </div>
            <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${shapeScore}%`, backgroundColor: getRatingColor(shapeScore) }}
              />
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-gray-600 dark:text-gray-400">排便时长</span>
              <span className="text-sm font-medium" style={{ color: getRatingColor(durationScore) }}>
                {getRatingLabel(durationScore)}
              </span>
            </div>
            <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${durationScore}%`, backgroundColor: getRatingColor(durationScore) }}
              />
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-gray-600 dark:text-gray-400">水分摄入</span>
              <span className="text-sm font-medium" style={{ color: getRatingColor(waterScore) }}>
                {getRatingLabel(waterScore)}
              </span>
            </div>
            <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${waterScore}%`, backgroundColor: getRatingColor(waterScore) }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="bg-[#FF6B4A]/10 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle className="h-5 w-5 text-[#FF6B4A]" />
            <h3 className="text-base font-semibold text-[#FF6B4A]">健康提醒</h3>
          </div>
          <div className="space-y-2">
            {alerts.map((alert, i) => (
              <div
                key={i}
                className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#FF6B4A] mt-2 flex-shrink-0" />
                {alert}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Historical Reports */}
      {reports.length > 1 && (
        <div className="card-standard">
          <h3 className="text-base font-semibold text-gray-800 dark:text-gray-100 mb-4">
            历史报告
          </h3>
          <div className="space-y-3">
            {reports.slice(1).map((report) => (
              <button
                key={report.id}
                className="w-full flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 tap-highlight transition-all active:scale-[0.98]"
                onClick={() => toast.info(`${report.title}`, { description: `评分：${report.score}` })}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#D4AF37]/10 flex items-center justify-center">
                    <FileText className="h-5 w-5 text-[#D4AF37]" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                      {report.title}
                    </p>
                    <p className="text-xs text-gray-400">{report.date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-lg font-bold text-gradient">{report.score}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Export Options */}
      <div className="card-standard">
        <h3 className="text-base font-semibold text-gray-800 dark:text-gray-100 mb-4">
          导出选项
        </h3>
        <div className="space-y-2">
          <button
            onClick={handleExportPdf}
            className="w-full flex items-center justify-between p-3 rounded-xl border border-gray-200 dark:border-gray-700 tap-highlight transition-all active:scale-[0.98] hover:bg-gray-50 dark:hover:bg-gray-800/50"
          >
            <span className="text-sm text-gray-700 dark:text-gray-300">导出为 PDF</span>
            <Download className="h-4 w-4 text-gray-400" />
          </button>
          <button
            onClick={handleShareDoctor}
            className="w-full flex items-center justify-between p-3 rounded-xl border border-gray-200 dark:border-gray-700 tap-highlight transition-all active:scale-[0.98] hover:bg-gray-50 dark:hover:bg-gray-800/50"
          >
            <span className="text-sm text-gray-700 dark:text-gray-300">发送给医生</span>
            <Share2 className="h-4 w-4 text-gray-400" />
          </button>
        </div>
      </div>
    </div>
  );
}
