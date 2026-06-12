import { useState } from 'react';
import { ChevronLeft, Apple, TrendingUp, CheckCircle, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface FiberTrackerPageProps {
  onBack: () => void;
}

interface FiberFood {
  name: string;
  fiber: number;
  emoji: string;
  category: string;
}

const commonFoods: FiberFood[] = [
  { name: '燕麦片(100g)', fiber: 10, emoji: '🥣', category: '谷物' },
  { name: '红薯(1个)', fiber: 4, emoji: '🍠', category: '薯类' },
  { name: '西兰花(100g)', fiber: 3, emoji: '🥦', category: '蔬菜' },
  { name: '苹果(1个)', fiber: 4, emoji: '🍎', category: '水果' },
  { name: '香蕉(1根)', fiber: 3, emoji: '🍌', category: '水果' },
  { name: '糙米饭(1碗)', fiber: 4, emoji: '🍚', category: '谷物' },
  { name: '芹菜(100g)', fiber: 2, emoji: '🥬', category: '蔬菜' },
  { name: '猕猴桃(1个)', fiber: 2, emoji: '🥝', category: '水果' },
  { name: '玉米(1根)', fiber: 5, emoji: '🌽', category: '谷物' },
  { name: '菠菜(100g)', fiber: 2, emoji: '🥬', category: '蔬菜' },
  { name: '橙子(1个)', fiber: 3, emoji: '🍊', category: '水果' },
  { name: '全麦面包(2片)', fiber: 4, emoji: '🍞', category: '谷物' },
];

export function FiberTrackerPage({ onBack }: FiberTrackerPageProps) {
  const [fiberIntake, setFiberIntake] = useState(0);
  const [records, setRecords] = useState<Array<{ time: string; food: string; fiber: number }>>([]);
  const goal = 30;
  const percentage = Math.min(100, Math.round((fiberIntake / goal) * 100));
  const [selectedCategory, setSelectedCategory] = useState('全部');

  const categories = ['全部', ...new Set(commonFoods.map((f) => f.category))];

  const filteredFoods =
    selectedCategory === '全部'
      ? commonFoods
      : commonFoods.filter((f) => f.category === selectedCategory);

  const addFood = (food: FiberFood) => {
    const now = new Date();
    const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    setFiberIntake((prev) => prev + food.fiber);
    setRecords((prev) => [{ time, food: food.name, fiber: food.fiber }, ...prev]);
    if (fiberIntake + food.fiber >= goal && fiberIntake < goal) {
      toast.success('🎉 今日纤维摄入目标已达成！');
    }
  };

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
          <h1 className="text-lg font-bold text-white flex-1">纤维记录</h1>
        </div>
      </header>

      <main className="px-4 py-4 space-y-4 pb-24">
        {/* Progress */}
        <div className="card-standard">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-500">今日纤维摄入</h3>
            <span className="text-2xl font-bold text-[#C4A35A]">{fiberIntake}g</span>
          </div>
          <div className="h-3 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
            <div
              className="h-full rounded-full gradient-primary transition-all duration-500"
              style={{ width: `${percentage}%` }}
            />
          </div>
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-gray-400">0g</span>
            <span className="text-xs text-gray-400">目标 {goal}g</span>
          </div>
          {percentage >= 100 && (
            <div className="flex items-center justify-center gap-2 mt-3 text-[#C4A35A]">
              <CheckCircle className="h-4 w-4" />
              <span className="text-sm font-medium">目标已达成！</span>
            </div>
          )}
        </div>

        {/* Category Filter */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {categories.map((cat) => (
            <button
              key={cat}
              className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'gradient-primary text-white'
                  : 'bg-white dark:bg-[#252B3D] text-gray-500'
              }`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Food List */}
        <div className="card-standard">
          <h3 className="text-sm font-medium text-gray-500 mb-3">常见食物纤维含量</h3>
          <div className="grid grid-cols-3 gap-2">
            {filteredFoods.map((food, i) => (
              <button
                key={i}
                className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 text-center hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors tap-highlight"
                onClick={() => addFood(food)}
              >
                <span className="text-2xl">{food.emoji}</span>
                <p className="text-xs font-medium text-gray-800 dark:text-gray-200 mt-1 truncate">
                  {food.name}
                </p>
                <p className="text-xs text-[#C4A35A] mt-0.5">{food.fiber}g 纤维</p>
              </button>
            ))}
          </div>
        </div>

        {/* Today's Records */}
        {records.length > 0 && (
          <div className="card-standard">
            <h3 className="text-sm font-medium text-gray-500 mb-3 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              今日记录
            </h3>
            <div className="space-y-2">
              {records.map((record, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50"
                >
                  <div className="flex items-center gap-3">
                    <Apple className="h-5 w-5 text-[#C4A35A]" />
                    <div>
                      <p className="text-sm text-gray-800 dark:text-gray-200">{record.food}</p>
                      <p className="text-xs text-gray-400">{record.time}</p>
                    </div>
                  </div>
                  <span className="text-sm font-medium text-[#C4A35A]">+{record.fiber}g</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tips */}
        <div className="bg-gradient-to-r from-[#C4A35A]/10 to-[#D4AF37]/10 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Info className="h-5 w-5 text-[#D4AF37]" />
            <h3 className="text-base font-semibold text-gray-800 dark:text-gray-100">
              膳食纤维小贴士
            </h3>
          </div>
          <ul className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
            <li>· 成人每日推荐摄入量 25-30g</li>
            <li>· 增加纤维摄入要循序渐进</li>
            <li>· 同时多喝水，纤维需要水分才能发挥作用</li>
          </ul>
        </div>
      </main>
    </div>
  );
}
