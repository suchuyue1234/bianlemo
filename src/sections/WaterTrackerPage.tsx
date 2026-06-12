import { useState } from 'react';
import { ChevronLeft, Droplets, Plus, Minus, TrendingUp, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface WaterTrackerPageProps {
  onBack: () => void;
}

export function WaterTrackerPage({ onBack }: WaterTrackerPageProps) {
  const [waterIntake, setWaterIntake] = useState(0);
  const [records, setRecords] = useState<Array<{ time: string; amount: number }>>([]);
  const goal = 2000;
  const percentage = Math.min(100, Math.round((waterIntake / goal) * 100));

  const addWater = (amount: number) => {
    const now = new Date();
    const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    setWaterIntake((prev) => prev + amount);
    setRecords((prev) => [{ time, amount }, ...prev]);
    if (waterIntake + amount >= goal && waterIntake < goal) {
      toast.success('🎉 今日饮水目标已达成！');
    }
  };

  const quickAmounts = [100, 200, 300, 500];

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
          <h1 className="text-lg font-bold text-white flex-1">喝水记录</h1>
        </div>
      </header>

      <main className="px-4 py-4 space-y-4 pb-24">
        {/* Progress Circle */}
        <div className="card-standard text-center py-8">
          <div className="relative w-40 h-40 mx-auto">
            <svg className="w-40 h-40 -rotate-90" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="54" fill="none" stroke="var(--border)" strokeWidth="8" />
              <circle
                cx="60"
                cy="60"
                r="54"
                fill="none"
                stroke="url(#waterGradient)"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${percentage * 3.39} 339`}
                className="transition-all duration-500"
              />
              <defs>
                <linearGradient id="waterGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#D4AF37" />
                  <stop offset="100%" stopColor="#C4A35A" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <Droplets className="h-6 w-6 text-[#D4AF37]" />
              <p className="text-3xl font-bold text-gray-800 dark:text-gray-100 mt-1">
                {waterIntake}
              </p>
              <p className="text-xs text-gray-500">ml / {goal}ml</p>
            </div>
          </div>
          {percentage >= 100 && (
            <div className="flex items-center justify-center gap-2 mt-4 text-[#C4A35A]">
              <CheckCircle className="h-5 w-5" />
              <span className="text-sm font-medium">今日目标已达成！</span>
            </div>
          )}
        </div>

        {/* Quick Add */}
        <div className="card-standard">
          <h3 className="text-sm font-medium text-gray-500 mb-3">快速添加</h3>
          <div className="grid grid-cols-4 gap-2 mb-3">
            {quickAmounts.map((amount) => (
              <button
                key={amount}
                className="p-3 rounded-xl bg-[#D4AF37]/10 text-center hover:bg-[#D4AF37]/20 transition-colors tap-highlight"
                onClick={() => addWater(amount)}
              >
                <p className="text-lg font-bold text-[#D4AF37]">+{amount}</p>
                <p className="text-xs text-gray-500">ml</p>
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1 border-[#D4AF37] text-[#D4AF37] h-11 rounded-xl"
              onClick={() => addWater(150)}
            >
              <Minus className="h-4 w-4 mr-1" />
              150ml
            </Button>
            <Button
              className="flex-1 gradient-primary text-white h-11 rounded-xl"
              onClick={() => addWater(250)}
            >
              <Plus className="h-4 w-4 mr-1" />
              250ml
            </Button>
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
                    <Droplets className="h-5 w-5 text-[#D4AF37]" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {record.time}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-[#D4AF37]">
                    +{record.amount}ml
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tips */}
        <div className="bg-gradient-to-r from-[#D4AF37]/10 to-[#C4A35A]/10 rounded-2xl p-4">
          <h3 className="text-base font-semibold text-gray-800 dark:text-gray-100 mb-2">
            💡 饮水小贴士
          </h3>
          <ul className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
            <li>· 晨起一杯温水，帮助肠胃蠕动</li>
            <li>· 饭前半小时喝水，有助于消化</li>
            <li>· 少量多次，不要一次性喝太多</li>
          </ul>
        </div>
      </main>
    </div>
  );
}
