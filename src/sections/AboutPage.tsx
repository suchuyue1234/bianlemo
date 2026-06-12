import { ChevronLeft, Github, Mail, Globe, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AboutPageProps {
  onBack: () => void;
}

export function AboutPage({ onBack }: AboutPageProps) {
  const team = [
    { name: '便了么团队', role: '产品研发' },
  ];

  const features = [
    { icon: '📝', title: '智能记录', desc: 'Bristol分类+颜色+时长多维记录' },
    { icon: '📊', title: '数据分析', desc: '趋势图表、规律分析、健康评分' },
    { icon: '🧸', title: '肠道精灵', desc: '养成系宠物，让记录更有趣' },
    { icon: '👥', title: '社区互动', desc: '与好友分享健康动态' },
    { icon: '🔔', title: '提醒功能', desc: '定时提醒，养成良好习惯' },
    { icon: '📄', title: '专业报告', desc: 'PDF报告，方便就医时参考' },
  ];

  return (
    <div className="min-h-screen bg-[var(--app-bg)]">
      <header className="sticky top-0 z-50 safe-area-top bg-gradient-to-r from-[#D4AF37] to-[#C4A35A]">
        <div className="px-4 py-3 flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/20 h-10 w-10 rounded-full"
            onClick={onBack}
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <h1 className="text-lg font-bold text-white flex-1">关于便了么</h1>
        </div>
      </header>

      <main className="px-4 py-4 space-y-4 pb-24">
        {/* App Logo & Info */}
        <div className="card-standard text-center py-8">
          <div className="w-24 h-24 mx-auto rounded-3xl gradient-primary flex items-center justify-center mb-4 shadow-lg">
            <span className="text-5xl">💩</span>
          </div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">便了么</h2>
          <p className="text-sm text-gray-500 mt-1">v2.0.0</p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-3 max-w-xs mx-auto">
            专注肠道健康管理，让每一次记录都成为健康的基石
          </p>
        </div>

        {/* Features */}
        <div className="card-standard">
          <h3 className="text-base font-semibold text-gray-800 dark:text-gray-100 mb-4">核心功能</h3>
          <div className="grid grid-cols-2 gap-3">
            {features.map((f, i) => (
              <div key={i} className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 text-center">
                <span className="text-2xl">{f.icon}</span>
                <p className="text-sm font-medium text-gray-800 dark:text-gray-200 mt-2">{f.title}</p>
                <p className="text-xs text-gray-500 mt-1">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Team */}
        <div className="card-standard">
          <h3 className="text-base font-semibold text-gray-800 dark:text-gray-100 mb-4">开发团队</h3>
          {team.map((member, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-xl">
              <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center text-white font-bold text-lg">
                {member.name.charAt(0)}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{member.name}</p>
                <p className="text-xs text-gray-500">{member.role}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Links */}
        <div className="card-standard">
          <h3 className="text-base font-semibold text-gray-800 dark:text-gray-100 mb-4">联系我们</h3>
          <div className="space-y-2">
            <button className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors tap-highlight">
              <Mail className="h-5 w-5 text-[#D4AF37]" />
              <span className="text-sm text-gray-700 dark:text-gray-300">bianlemo@example.com</span>
            </button>
            <button className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors tap-highlight">
              <Globe className="h-5 w-5 text-[#C4A35A]" />
              <span className="text-sm text-gray-700 dark:text-gray-300">bianlemo.com</span>
            </button>
            <button className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors tap-highlight">
              <Github className="h-5 w-5 text-gray-700 dark:text-gray-300" />
              <span className="text-sm text-gray-700 dark:text-gray-300">GitHub</span>
            </button>
          </div>
        </div>

        {/* Acknowledgments */}
        <div className="card-standard">
          <h3 className="text-base font-semibold text-gray-800 dark:text-gray-100 mb-4">特别鸣谢</h3>
          <div className="space-y-3">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              感谢所有为肠道健康科普做出贡献的医学专家和社区用户。
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              本应用基于Bristol粪便分类量表提供健康评估，仅供参考，不能替代专业医疗诊断。
            </p>
          </div>
        </div>

        {/* Rate Us */}
        <button className="w-full card-standard p-4 flex items-center justify-between tap-highlight transition-all active:scale-[0.98]">
          <div className="flex items-center gap-3">
            <Star className="h-5 w-5 text-[#FFD166]" />
            <span className="text-sm font-medium text-gray-800 dark:text-gray-200">给我们评分</span>
          </div>
          <span className="text-xs text-gray-400">喜欢的话给个好评吧~</span>
        </button>
      </main>
    </div>
  );
}
