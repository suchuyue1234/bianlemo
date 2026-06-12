import { Plus, Calendar, Droplets, Apple, Stethoscope, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface QuickActionsProps {
  onAddRecord: () => void;
  onViewCalendar: () => void;
  onToolClick: (tool: string) => void;
}

const actions = [
  { id: 'water', icon: Droplets, label: '喝水', color: '#D4AF37' },
  { id: 'fiber', icon: Apple, label: '纤维', color: '#C4A35A' },
  { id: 'hospital', icon: Stethoscope, label: '医院', color: '#D4AF37' },
  { id: 'privacy', icon: Shield, label: '隐私', color: '#C4A35A' },
];

export function QuickActions({ onAddRecord, onViewCalendar, onToolClick }: QuickActionsProps) {
  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <Button
          onClick={onAddRecord}
          className="flex-1 btn-primary"
        >
          <Plus className="h-5 w-5 mr-2" />
          记录排便
        </Button>
        <Button
          onClick={onViewCalendar}
          variant="outline"
          className="btn-secondary w-14 px-0"
        >
          <Calendar className="h-5 w-5" />
        </Button>
      </div>

      <div className="grid grid-cols-4 gap-2">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.id}
              onClick={() => onToolClick(action.id)}
              className="flex flex-col items-center gap-2 p-3 rounded-xl bg-white dark:bg-[#252B3D] shadow-card tap-highlight transition-all active:scale-95 hover:shadow-card-hover"
            >
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ backgroundColor: `${action.color}15` }}
              >
                <Icon className="h-5 w-5" style={{ color: action.color }} />
              </div>
              <span className="text-xs text-gray-600 dark:text-gray-400">{action.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
