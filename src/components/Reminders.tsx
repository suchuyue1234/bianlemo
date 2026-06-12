import { Bell, Clock, ChevronRight } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import type { Reminder } from '@/types';

interface RemindersProps {
  reminders: Reminder[];
  onToggle: (id: string) => void;
}

export function Reminders({ reminders, onToggle }: RemindersProps) {
  const enabledCount = reminders.filter((r) => r.enabled).length;

  return (
    <div className="card-standard">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[#D4AF37]/10 flex items-center justify-center">
            <Bell className="h-4 w-4 text-[#D4AF37]" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-gray-800 dark:text-gray-100">
              健康提醒
            </h3>
            <p className="text-xs text-gray-400">{enabledCount}个提醒已开启</p>
          </div>
        </div>
        <button className="flex items-center text-sm text-[#D4AF37] tap-highlight hover:opacity-80">
          全部
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="space-y-2">
        {reminders.slice(0, 3).map((reminder) => (
          <div
            key={reminder.id}
            className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white dark:bg-gray-700 flex items-center justify-center shadow-sm">
                <Clock className="h-4 w-4 text-[#D4AF37]" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                  {reminder.title}
                </p>
                <p className="text-xs text-gray-400">{reminder.time}</p>
              </div>
            </div>
            <Switch
              checked={reminder.enabled}
              onCheckedChange={() => onToggle(reminder.id)}
              className="data-[state=checked]:bg-[#D4AF37]"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
