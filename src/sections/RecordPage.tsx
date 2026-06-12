import { useEffect, useState } from 'react';
import { Edit3, Check, Clock, Droplets, ChevronLeft, Scale, Smile } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { CalendarView } from '@/components/CalendarView';
import type { Record } from '@/types';

interface RecordPageProps {
  records: Record[];
  onAddRecord: (record: Omit<Record, 'id'>) => void;
}

const bristolScale = [
  { type: 1, name: '坚果状', desc: '硬块，难排出', emoji: '🌰', color: '#8B4513' },
  { type: 2, name: '香肠状硬块', desc: '较硬，有裂纹', emoji: '🥖', color: '#654321' },
  { type: 3, name: '香肠状微裂', desc: '正常偏硬', emoji: '🌭', color: '#8B4513' },
  { type: 4, name: '香蕉状', desc: '正常理想型', emoji: '🍌', color: '#8B4513' },
  { type: 5, name: '软块状', desc: '正常偏软', emoji: '🍞', color: '#A0522D' },
  { type: 6, name: '软片状', desc: '边缘粗糙', emoji: '🥞', color: '#CD853F' },
  { type: 7, name: '水样', desc: '完全液态', emoji: '💧', color: '#D2691E' },
];

const colors = [
  { name: '深棕', value: '#654321' },
  { name: '棕色', value: '#8B4513' },
  { name: '浅棕', value: '#A0522D' },
  { name: '黄色', value: '#DAA520' },
  { name: '绿色', value: '#6B8E23' },
  { name: '黑色', value: '#2F4F4F' },
  { name: '红色', value: '#B22222' },
];

export function RecordPage({ records, onAddRecord }: RecordPageProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [step, setStep] = useState(1);
  const [selectedShape, setSelectedShape] = useState(4);
  const [selectedColor, setSelectedColor] = useState('#8B4513');
  const [duration, setDuration] = useState(5);
  const [weight, setWeight] = useState(200);
  const [feeling, setFeeling] = useState<Record['feeling']>('normal');
  const [note, setNote] = useState('');
  const [timing, setTiming] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    if (!timing) return;
    const timer = window.setInterval(() => {
      setElapsedSeconds((prev) => {
        const next = prev + 1;
        setDuration(Math.max(1, Math.round(next / 60)));
        return next;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [timing]);

  const resetForm = () => {
    setStep(1);
    setSelectedShape(4);
    setSelectedColor('#8B4513');
    setDuration(5);
    setWeight(200);
    setFeeling('normal');
    setTiming(false);
    setElapsedSeconds(0);
    setNote('');
  };

  const handleSubmit = () => {
    const now = new Date();
    onAddRecord({
      date: now.toISOString().split('T')[0],
      time: `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`,
      type: selectedShape <= 2 ? 'constipation' : selectedShape >= 6 ? 'diarrhea' : 'normal',
      shape: selectedShape,
      color: selectedColor,
      duration,
      weight,
      feeling,
      note: note || undefined,
    });
    setIsAdding(false);
    resetForm();
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      setIsAdding(false);
      resetForm();
    }
  };

  // Adding Record Flow
  if (isAdding) {
    return (
      <div className="space-y-4 pb-24 page-enter">
        {/* Header with Back */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBack}
            className="h-10 w-10 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
              记录排便
            </h2>
              <p className="text-xs text-gray-400">步骤 {step}/5</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((s) => (
            <div
              key={s}
              className={`flex-1 h-1.5 rounded-full transition-colors ${
                s <= step ? 'bg-[#D4AF37]' : 'bg-gray-200 dark:bg-gray-700'
              }`}
            />
          ))}
        </div>

        {/* Step 1: Shape Selection */}
        {step === 1 && (
          <div className="card-standard space-y-4">
            <p className="text-sm text-gray-500 text-center">
              请选择最符合的粪便形状
            </p>
            <div className="space-y-2 max-h-[400px] overflow-y-auto scrollbar-hide">
              {bristolScale.map((item) => (
                <button
                  key={item.type}
                  onClick={() => {
                    setSelectedShape(item.type);
                    setStep(2);
                  }}
                  className={`w-full flex items-center gap-4 p-4 rounded-xl transition-all tap-highlight text-left ${
                    selectedShape === item.type
                      ? 'bg-[#D4AF37]/10 ring-2 ring-[#D4AF37]'
                      : 'bg-gray-50 dark:bg-gray-800 hover:bg-gray-100'
                  }`}
                >
                  <span className="text-2xl">{item.emoji}</span>
                  <div className="flex-1">
                    <p className="font-medium text-gray-800 dark:text-gray-200">
                      {item.name}
                    </p>
                    <p className="text-xs text-gray-400">{item.desc}</p>
                  </div>
                  {selectedShape === item.type && (
                    <div className="w-6 h-6 rounded-full bg-[#D4AF37] flex items-center justify-center">
                      <Check className="h-4 w-4 text-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Color Selection */}
        {step === 2 && (
          <div className="card-standard space-y-4">
            <p className="text-sm text-gray-500 text-center">请选择粪便颜色</p>
            <div className="grid grid-cols-4 gap-3">
              {colors.map((c) => (
                <button
                  key={c.value}
                  onClick={() => setSelectedColor(c.value)}
                  className={`flex flex-col items-center gap-2 p-3 rounded-xl transition-all tap-highlight ${
                    selectedColor === c.value
                      ? 'bg-[#D4AF37]/10 ring-2 ring-[#D4AF37]'
                      : 'bg-gray-50 dark:bg-gray-800'
                  }`}
                >
                  <div
                    className="w-12 h-12 rounded-full border-2 border-white dark:border-gray-700 shadow-md"
                    style={{ backgroundColor: c.value }}
                  />
                  <span className="text-xs text-gray-600 dark:text-gray-400">
                    {c.name}
                  </span>
                </button>
              ))}
            </div>
            <div className="flex gap-3 mt-4">
              <Button variant="outline" onClick={() => setStep(1)} className="flex-1 h-12 rounded-xl">
                上一步
              </Button>
              <Button onClick={() => setStep(3)} className="flex-1 h-12 rounded-xl gradient-primary text-white">
                下一步
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Weight + Feeling */}
        {step === 3 && (
          <div className="card-standard space-y-4">
            <p className="text-sm text-gray-500 text-center">重量和感受</p>
            <div className="rounded-xl bg-gray-50 dark:bg-gray-800/50 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Scale className="h-4 w-4 text-[#D4AF37]" />
                <span className="text-sm text-gray-600 dark:text-gray-300">估计重量（g）</span>
              </div>
              <input
                type="range"
                min="30"
                max="500"
                value={weight}
                onChange={(e) => setWeight(Number(e.target.value))}
                className="w-full accent-[#D4AF37]"
              />
              <div className="text-center mt-1 text-xl font-semibold text-gray-800 dark:text-gray-100">{weight}g</div>
            </div>
            <div className="rounded-xl bg-gray-50 dark:bg-gray-800/50 p-4">
              <div className="flex items-center gap-2 mb-3">
                <Smile className="h-4 w-4 text-[#C4A35A]" />
                <span className="text-sm text-gray-600 dark:text-gray-300">排便感受</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { key: 'light', label: '轻松嗯嗯 😌' },
                  { key: 'normal', label: '正常发挥 🙂' },
                  { key: 'strained', label: '有点费劲 😣' },
                  { key: 'urgent', label: '急急忙忙 😵' },
                ].map((item) => (
                  <button
                    key={item.key}
                    onClick={() => setFeeling(item.key as Record['feeling'])}
                    className={`rounded-lg px-3 py-2 text-sm ${
                      feeling === item.key ? 'bg-[#D4AF37] text-white' : 'bg-white dark:bg-gray-700'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep(2)} className="flex-1 h-12 rounded-xl">
                上一步
              </Button>
              <Button onClick={() => setStep(4)} className="flex-1 h-12 rounded-xl gradient-primary text-white">
                下一步
              </Button>
            </div>
          </div>
        )}

        {/* Step 4: Duration */}
        {step === 4 && (
          <div className="card-standard space-y-4">
            <p className="text-sm text-gray-500 text-center">排便时长（可自动计时）</p>
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-6">
                  <Clock className="h-6 w-6 text-[#D4AF37]" />
                  <span className="text-5xl font-bold text-gray-800 dark:text-gray-100">
                    {duration}
                  </span>
                  <span className="text-lg text-gray-500">分钟</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="30"
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className="w-64 h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#D4AF37]"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-2 px-2">
                  <span>1分钟</span>
                  <span>15分钟</span>
                  <span>30分钟</span>
                </div>
                <div className="mt-4">
                  <Button
                    variant={timing ? 'destructive' : 'outline'}
                    onClick={() => setTiming((prev) => !prev)}
                    className="rounded-xl"
                  >
                    {timing ? '停止自动计时 ⏹️' : '开始自动计时 ▶️'}
                  </Button>
                  <p className="text-xs text-gray-400 mt-2">已计时：{elapsedSeconds}s</p>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep(3)} className="flex-1 h-12 rounded-xl">
                上一步
              </Button>
              <Button onClick={() => setStep(5)} className="flex-1 h-12 rounded-xl gradient-primary text-white">
                下一步
              </Button>
            </div>
          </div>
        )}

        {/* Step 5: Note */}
        {step === 5 && (
          <div className="card-standard space-y-4">
            <p className="text-sm text-gray-500 text-center">添加备注（可选）</p>
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="记录任何特殊情况，如：腹痛、饮食变化等..."
              className="min-h-[120px] resize-none rounded-xl"
            />
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep(4)} className="flex-1 h-12 rounded-xl">
                上一步
              </Button>
              <Button onClick={handleSubmit} className="flex-1 h-12 rounded-xl gradient-primary text-white">
                <Check className="h-4 w-4 mr-2" />
                完成记录
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Main Record List View
  return (
    <div className="space-y-4 pb-24">
      {/* Primary Action Button */}
      <Button
        onClick={() => setIsAdding(true)}
        className="w-full btn-primary"
      >
        <Edit3 className="h-5 w-5 mr-2" />
        记录本次排便
      </Button>

      {/* Recent Records */}
      <div className="card-standard">
        <h3 className="text-base font-semibold text-gray-800 dark:text-gray-100 mb-4">
          最近记录
        </h3>
        <div className="space-y-3">
          {records.length === 0 ? (
            <div className="text-center py-10 text-gray-400">
              <Droplets className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>暂无记录，开始记录你的第一次吧</p>
            </div>
          ) : (
            records.slice(0, 5).map((record) => (
              <div
                key={record.id}
                className="flex items-center gap-4 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50"
              >
                <div
                  className="w-12 h-12 rounded-full flex-shrink-0"
                  style={{ backgroundColor: record.color }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                      {record.date}
                    </span>
                    <span className="text-xs text-gray-400 flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {record.time}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5 truncate">
                    {record.poopAvatar ?? '💩'} {record.moodTag ?? bristolScale.find((b) => b.type === record.shape)?.name} ·
                    {record.duration}分钟
                    {record.weight ? ` · ${record.weight}g` : ''}
                    {record.note && ` · ${record.note}`}
                  </p>
                </div>
                <div
                  className={`px-2 py-1 rounded-full text-xs font-medium flex-shrink-0 ${
                    record.type === 'normal'
                      ? 'bg-[#C4A35A]/20 text-[#C4A35A]'
                      : record.type === 'constipation'
                      ? 'bg-[#FF6B4A]/20 text-[#FF6B4A]'
                      : 'bg-yellow-500/20 text-yellow-600'
                  }`}
                >
                  {record.type === 'normal'
                    ? '正常'
                    : record.type === 'constipation'
                    ? '便秘'
                    : '腹泻'}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Calendar View */}
      <CalendarView
        records={records}
        onDateSelect={(date) => console.log('Selected date:', date)}
        onViewAll={() => console.log('View all records')}
      />
    </div>
  );
}
