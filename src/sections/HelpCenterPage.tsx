import { useState } from 'react';
import {
  ChevronLeft, Search, MessageCircle, Heart, AlertCircle,
  ChevronDown, ChevronUp, BookOpen, Lightbulb,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface HelpCenterPageProps {
  onBack: () => void;
}

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
}

const faqs: FAQ[] = [
  {
    id: '1',
    category: '基础使用',
    question: '如何记录排便？',
    answer: '在首页点击「记录排便」按钮，或者切换到记录页面，按照步骤填写粪便形状、颜色、时长等信息即可完成记录。建议每天固定时间记录，有助于追踪肠道健康趋势。',
  },
  {
    id: '2',
    category: '基础使用',
    question: '健康评分是如何计算的？',
    answer: '健康评分主要基于粪便形状（Bristol粪便分类量表）、排便时长、排便感受等因素综合计算。形状3-5为正常范围，得分最高；时长5-10分钟为最佳；排便感受轻松也会获得加分。',
  },
  {
    id: '3',
    category: '基础使用',
    question: '什么是肠道精灵？',
    answer: '肠道精灵是一个养成类小宠物，会根据你的记录情况成长。记录越多、健康评分越高，精灵的等级就越高，还会解锁各种可爱的装扮。连续打卡可以让精灵保持活力！',
  },
  {
    id: '4',
    category: '健康科普',
    question: '什么是Bristol粪便分类？',
    answer: 'Bristol粪便分类量表将粪便分为7种类型：1-2型为便秘，3-4型为正常，5-7型为腹泻。类型3-4是最理想的粪便形态，说明肠道蠕动正常、水分吸收良好。',
  },
  {
    id: '5',
    category: '健康科普',
    question: '正常排便频率是多少？',
    answer: '一般认为每天排便1-2次或每2天排便1次都属于正常范围。关键是要保持规律，如果突然出现频率变化（如从每天一次变为三天一次），建议关注并记录。',
  },
  {
    id: '6',
    category: '健康科普',
    question: '什么情况需要就医？',
    answer: '以下情况建议及时就医：持续便秘或腹泻超过2周、便血或黑便、排便习惯突然改变、伴有腹痛或体重下降、粪便形状明显变细。本应用不能替代专业医疗诊断。',
  },
  {
    id: '7',
    category: '账号设置',
    question: '如何导出我的健康数据？',
    answer: '进入「我的」>「隐私设置」>「数据管理」，点击「导出数据」即可将你的所有健康记录导出为JSON文件。你也可以在报告页面生成PDF报告发送给医生。',
  },
  {
    id: '8',
    category: '账号设置',
    question: '我的数据安全吗？',
    answer: '我们非常重视用户隐私。所有数据均采用加密存储，未经你的允许不会分享给第三方。你可以随时在隐私设置中管理数据可见性、清除缓存或删除所有数据。',
  },
];

const categories = ['全部', '基础使用', '健康科普', '账号设置'];

export function HelpCenterPage({ onBack }: HelpCenterPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState('全部');

  const filtered = faqs.filter((faq) => {
    const matchCategory = activeCategory === '全部' || faq.category === activeCategory;
    const matchSearch =
      searchQuery === '' ||
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  const grouped = filtered.reduce<Record<string, FAQ[]>>((acc, faq) => {
    if (!acc[faq.category]) acc[faq.category] = [];
    acc[faq.category].push(faq);
    return acc;
  }, {});

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
          <h1 className="text-lg font-bold text-white flex-1">帮助中心</h1>
        </div>
      </header>

      <main className="px-4 py-4 space-y-4 pb-24">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            className="pl-10 h-11 bg-white dark:bg-[#252B3D] border-0 rounded-xl"
            placeholder="搜索问题..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Category Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {categories.map((cat) => (
            <button
              key={cat}
              className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                activeCategory === cat
                  ? 'gradient-primary text-white'
                  : 'bg-white dark:bg-[#252B3D] text-gray-500'
              }`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-2 gap-3">
          <div className="card-standard p-4 bg-gradient-to-br from-[#D4AF37]/10 to-transparent">
            <BookOpen className="h-6 w-6 text-[#D4AF37] mb-2" />
            <p className="text-sm font-medium text-gray-800 dark:text-gray-200">Bristol指南</p>
            <p className="text-xs text-gray-500 mt-1">了解粪便分类标准</p>
          </div>
          <div className="card-standard p-4 bg-gradient-to-br from-[#C4A35A]/10 to-transparent">
            <Lightbulb className="h-6 w-6 text-[#C4A35A] mb-2" />
            <p className="text-sm font-medium text-gray-800 dark:text-gray-200">健康贴士</p>
            <p className="text-xs text-gray-500 mt-1">肠道养护小知识</p>
          </div>
        </div>

        {/* FAQ List */}
        {Object.keys(grouped).length === 0 ? (
          <div className="card-standard text-center py-12">
            <MessageCircle className="h-12 w-12 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-400">没有找到相关问题</p>
          </div>
        ) : (
          Object.entries(grouped).map(([category, items]) => (
            <div key={category} className="space-y-2">
              <h3 className="text-sm font-semibold text-gray-500 px-1">{category}</h3>
              {items.map((faq) => (
                <div key={faq.id} className="card-standard overflow-hidden">
                  <button
                    className="w-full flex items-center justify-between p-4 text-left tap-highlight"
                    onClick={() =>
                      setExpandedId(expandedId === faq.id ? null : faq.id)
                    }
                  >
                    <div className="flex items-start gap-3 flex-1">
                      <AlertCircle className="h-5 w-5 text-[#D4AF37] flex-shrink-0 mt-0.5" />
                      <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                        {faq.question}
                      </span>
                    </div>
                    {expandedId === faq.id ? (
                      <ChevronUp className="h-5 w-5 text-gray-400 flex-shrink-0 ml-2" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-gray-400 flex-shrink-0 ml-2" />
                    )}
                  </button>
                  {expandedId === faq.id && (
                    <div className="px-4 pb-4 pt-0">
                      <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed pl-8">
                        {faq.answer}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ))
        )}

        {/* Contact Support */}
        <div className="card-standard text-center py-6">
          <Heart className="h-8 w-8 text-[#FF6B4A] mx-auto mb-2" />
          <p className="text-sm font-medium text-gray-800 dark:text-gray-200">还有问题？</p>
          <p className="text-xs text-gray-500 mt-1">
            在「意见反馈」中联系我们，我们会尽快回复
          </p>
        </div>
      </main>
    </div>
  );
}
