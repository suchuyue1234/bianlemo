import { useState } from 'react';
import { Check, Timer, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import type { Record } from '@/types';

interface RecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (record: Omit<Record, 'id'>) => void;
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

export function RecordModal({ isOpen, onClose, onSubmit }: RecordModalProps) {
  const [step, setStep] = useState(1);
  const [selectedShape, setSelectedShape] = useState(4);
  const [selectedColor, setSelectedColor] = useState('#8B4513');
  const [duration, setDuration] = useState(5);
  const [note, setNote] = useState('');

  const resetAndClose = () => {
    setStep(1);
    setSelectedShape(4);
    setSelectedColor('#8B4513');
    setDuration(5);
    setNote('');
    onClose();
  };

  const handleSubmit = () => {
    const now = new Date();
    onSubmit({
      date: now.toISOString().split('T')[0],
      time: `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`,
      type: selectedShape <= 2 ? 'constipation' : selectedShape >= 6 ? 'diarrhea' : 'normal',
      shape: selectedShape,
      color: selectedColor,
      duration,
      weight: 180,
      feeling: 'normal',
      note: note || undefined,
    });
    resetAndClose();
  };

  const renderStep1 = () => (
    <div className="space-y-4">
      <p className="text-sm text-gray-500 text-center">请选择最符合的粪便形状</p>
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
              <p className="font-medium text-gray-800 dark:text-gray-200">{item.name}</p>
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
  );

  const renderStep2 = () => (
    <div className="space-y-4">
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
            <span className="text-xs text-gray-600 dark:text-gray-400">{c.name}</span>
          </button>
        ))}
      </div>
      <div className="flex gap-3 mt-4">
        <Button variant="outline" onClick={() => setStep(1)} className="flex-1 h-12 rounded-xl">
          上一步
        </Button>
        <Button onClick={() => setStep(3)} className="flex-1 h-12 rounded-xl btn-primary">
          下一步
        </Button>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-4">
      <p className="text-sm text-gray-500 text-center">排便时长</p>
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-6">
            <Timer className="h-6 w-6 text-[#D4AF37]" />
            <span className="text-5xl font-bold text-gray-800 dark:text-gray-100">{duration}</span>
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
        </div>
      </div>
      <div className="flex gap-3">
        <Button variant="outline" onClick={() => setStep(2)} className="flex-1 h-12 rounded-xl">
          上一步
        </Button>
        <Button onClick={() => setStep(4)} className="flex-1 h-12 rounded-xl btn-primary">
          下一步
        </Button>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-4">
      <p className="text-sm text-gray-500 text-center">添加备注（可选）</p>
      <Textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="记录任何特殊情况，如：腹痛、饮食变化等..."
        className="min-h-[120px] resize-none rounded-xl"
      />
      <div className="flex gap-3">
        <Button variant="outline" onClick={() => setStep(3)} className="flex-1 h-12 rounded-xl">
          上一步
        </Button>
        <Button onClick={handleSubmit} className="flex-1 h-12 rounded-xl btn-primary">
          <Check className="h-4 w-4 mr-2" />
          完成记录
        </Button>
      </div>
    </div>
  );

  const steps = [
    { title: '形状', render: renderStep1 },
    { title: '颜色', render: renderStep2 },
    { title: '时长', render: renderStep3 },
    { title: '备注', render: renderStep4 },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={resetAndClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-hidden p-0 gap-0 rounded-2xl">
        <DialogHeader className="p-4 pb-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg font-semibold">记录排便</DialogTitle>
            <Button variant="ghost" size="icon" onClick={resetAndClose} className="h-8 w-8 rounded-full">
              <X className="h-4 w-4" />
            </Button>
          </div>
          {/* Progress */}
          <div className="flex gap-2 mt-4">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`flex-1 h-1.5 rounded-full transition-colors ${
                  index < step ? 'bg-[#D4AF37]' : 'bg-gray-200 dark:bg-gray-700'
                }`}
              />
            ))}
          </div>
          <div className="flex justify-between mt-2">
            {steps.map((s, index) => (
              <span
                key={index}
                className={`text-xs ${index < step ? 'text-[#D4AF37] font-medium' : 'text-gray-400'}`}
              >
                {s.title}
              </span>
            ))}
          </div>
        </DialogHeader>
        <div className="p-4 overflow-y-auto max-h-[60vh] scrollbar-hide">
          {steps[step - 1].render()}
        </div>
      </DialogContent>
    </Dialog>
  );
}
