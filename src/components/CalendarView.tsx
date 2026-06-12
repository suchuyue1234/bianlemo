import { useState, useMemo, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Calendar, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CalendarViewProps {
  records: { date: string; type: 'normal' | 'constipation' | 'diarrhea' | 'other' }[];
  onDateSelect?: (date: Date) => void;
  onViewAll?: () => void;
}

const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六'];

export function CalendarView({ records, onDateSelect, onViewAll }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Get days in month
  const daysInMonth = useMemo(() => {
    return new Date(year, month + 1, 0).getDate();
  }, [year, month]);

  // Get first day of month
  const firstDayOfMonth = useMemo(() => {
    return new Date(year, month, 1).getDay();
  }, [year, month]);

  // Get record dates set for quick lookup
  const recordDates = useMemo(() => {
    const dates = new Set<string>();
    const typeMap = new Map<string, 'normal' | 'constipation' | 'diarrhea' | 'other'>();

    records.forEach(record => {
      dates.add(record.date);
      typeMap.set(record.date, record.type);
    });

    return { dates, typeMap };
  }, [records]);

  const handlePrevMonth = useCallback(() => {
    setCurrentDate(new Date(year, month - 1, 1));
  }, [year, month]);

  const handleNextMonth = useCallback(() => {
    setCurrentDate(new Date(year, month + 1, 1));
  }, [year, month]);

  const handleDateClick = useCallback((day: number) => {
    const date = new Date(year, month, day);
    setSelectedDate(date);
    onDateSelect?.(date);
  }, [year, month, onDateSelect]);

  const formatDateKey = useCallback((day: number) => {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  }, [year, month]);

  const getDayStatus = useCallback((day: number) => {
    const dateKey = formatDateKey(day);
    if (!recordDates.dates.has(dateKey)) return null;
    return recordDates.typeMap.get(dateKey);
  }, [recordDates, formatDateKey]);

  const isToday = useCallback((day: number) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      month === today.getMonth() &&
      year === today.getFullYear()
    );
  }, [month, year]);

  const isSelected = useCallback((day: number) => {
    if (!selectedDate) return false;
    return (
      day === selectedDate.getDate() &&
      month === selectedDate.getMonth() &&
      year === selectedDate.getFullYear()
    );
  }, [selectedDate, month, year]);

  const getStatusColor = (
    status: 'normal' | 'constipation' | 'diarrhea' | 'other' | null
  ) => {
    switch (status) {
      case 'normal':
        return 'bg-[#C4A35A] text-white';
      case 'constipation':
        return 'bg-[#FF6B4A] text-white';
      case 'diarrhea':
        return 'bg-yellow-500 text-white';
      case 'other':
        return 'bg-gray-400 text-white';
      default:
        return '';
    }
  };

  const monthLabel = `${year}年${month + 1}月`;

  return (
    <div className="card-standard">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[#D4AF37]/10 flex items-center justify-center">
            <Calendar className="h-4 w-4 text-[#D4AF37]" />
          </div>
          <h3 className="text-base font-semibold text-gray-800 dark:text-gray-100">
            日历视图
          </h3>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="text-[#D4AF37] hover:bg-[#D4AF37]/10 h-8"
          onClick={onViewAll}
        >
          查看全部
        </Button>
      </div>

      {/* Month Navigation */}
      <div className="flex items-center justify-between mb-4">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
          onClick={handlePrevMonth}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-sm font-medium text-gray-800 dark:text-gray-100">
          {monthLabel}
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
          onClick={handleNextMonth}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Weekday Headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {WEEKDAYS.map((day) => (
          <div
            key={day}
            className="text-center text-xs font-medium text-gray-400 py-2"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Empty cells for days before the first day of month */}
        {Array.from({ length: firstDayOfMonth }).map((_, index) => (
          <div key={`empty-${index}`} className="aspect-square" />
        ))}

        {/* Days */}
        {Array.from({ length: daysInMonth }, (_, i) => {
          const day = i + 1;
          const status = getDayStatus(day);
          const today = isToday(day);
          const selected = isSelected(day);

          return (
            <button
              key={day}
              onClick={() => handleDateClick(day)}
              className={`
                aspect-square rounded-xl flex flex-col items-center justify-center
                text-sm font-medium transition-all duration-200 tap-highlight
                ${status
                  ? `${getStatusColor(status)} shadow-sm`
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                }
                ${today && !status ? 'ring-2 ring-[#D4AF37] ring-offset-1' : ''}
                ${selected ? 'scale-95' : ''}
              `}
            >
              <span>{day}</span>
              {status && (
                <Check className="h-3 w-3 mt-0.5" />
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-[#C4A35A]" />
          <span className="text-xs text-gray-500">正常</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-[#FF6B4A]" />
          <span className="text-xs text-gray-500">便秘</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-yellow-500" />
          <span className="text-xs text-gray-500">腹泻</span>
        </div>
      </div>
    </div>
  );
}
