import { useState } from 'react';
import { ChevronLeft, Shield, Eye, Lock, Database, Trash2, FileText, ChevronRight, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';

interface PrivacyPageProps {
  onBack: () => void;
}

interface PrivacyOption {
  id: string;
  icon: typeof Eye;
  label: string;
  description: string;
  enabled: boolean;
}

export function PrivacyPage({ onBack }: PrivacyPageProps) {
  const [options, setOptions] = useState<PrivacyOption[]>([
    {
      id: 'visible',
      icon: Eye,
      label: '记录可见性',
      description: '允许好友查看我的健康动态',
      enabled: true,
    },
    {
      id: 'anonymous',
      icon: Shield,
      label: '匿名分享',
      description: '在社区分享时隐藏用户名',
      enabled: false,
    },
    {
      id: 'lock',
      icon: Lock,
      label: '应用锁',
      description: '打开应用需要验证',
      enabled: false,
    },
    {
      id: 'backup',
      icon: Database,
      label: '云端备份',
      description: '自动备份数据到云端',
      enabled: true,
    },
  ]);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const toggleOption = (id: string) => {
    setOptions((prev) =>
      prev.map((opt) =>
        opt.id === id ? { ...opt, enabled: !opt.enabled } : opt
      )
    );
    toast.success('设置已更新');
  };

  const handleExportData = () => {
    const data = {
      exportDate: new Date().toISOString(),
      app: '便了么',
      version: '2.0.0',
      privacySettings: options,
      records: JSON.parse(localStorage.getItem('bianlemo_records') || '[]'),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bianlemo_export_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('数据已导出', { description: 'JSON文件已下载' });
  };

  const handleClearCache = () => {
    setShowClearConfirm(true);
  };

  const confirmClearCache = () => {
    const keysToClear = ['bianlemo_cache', 'bianlemo_search_history'];
    keysToClear.forEach((key) => localStorage.removeItem(key));
    setShowClearConfirm(false);
    toast.success('缓存已清除');
  };

  const handleDeleteAll = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDeleteAll = () => {
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('bianlemo_')) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach((key) => localStorage.removeItem(key));
    setShowDeleteConfirm(false);
    toast.success('所有数据已删除');
    onBack();
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
          <h1 className="text-lg font-bold text-white">隐私设置</h1>
        </div>
      </header>

      <main className="px-4 py-4 space-y-4 pb-24">
        <div className="card-standard">
          <h3 className="text-sm font-medium text-gray-500 mb-4">隐私选项</h3>
          <div className="space-y-4">
            {options.map((option) => {
              const Icon = option.icon;
              return (
                <div
                  key={option.id}
                  className="flex items-start justify-between gap-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#D4AF37]/10 flex items-center justify-center flex-shrink-0">
                      <Icon className="h-4 w-4 text-[#D4AF37]" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                        {option.label}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {option.description}
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={option.enabled}
                    onCheckedChange={() => toggleOption(option.id)}
                    className="data-[state=checked]:bg-[#D4AF37] flex-shrink-0 mt-0.5"
                  />
                </div>
              );
            })}
          </div>
        </div>

        <div className="card-standard">
          <h3 className="text-sm font-medium text-gray-500 mb-4">数据管理</h3>
          <div className="space-y-2">
            <button
              onClick={handleExportData}
              className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors tap-highlight"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-green-500/10 flex items-center justify-center">
                  <FileText className="h-4 w-4 text-green-500" />
                </div>
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  导出数据
                </span>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </button>

            <button
              onClick={handleClearCache}
              className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors tap-highlight"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-blue-500/10 flex items-center justify-center">
                  <Database className="h-4 w-4 text-blue-500" />
                </div>
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  清除缓存
                </span>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </button>

            <button
              onClick={handleDeleteAll}
              className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors tap-highlight"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-red-500/10 flex items-center justify-center">
                  <Trash2 className="h-4 w-4 text-red-500" />
                </div>
                <span className="text-sm text-red-500">删除所有数据</span>
              </div>
              <ChevronRight className="h-5 w-5 text-red-400" />
            </button>
          </div>
        </div>

        <div className="card-standard">
          <button className="w-full flex items-center justify-between tap-highlight">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-purple-500/10 flex items-center justify-center">
                <Shield className="h-4 w-4 text-purple-500" />
              </div>
              <span className="text-sm text-gray-700 dark:text-gray-300">
                隐私政策
              </span>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-400" />
          </button>
        </div>

        <p className="text-center text-xs text-gray-400 px-4">
          我们重视您的隐私，所有数据均采用端到端加密存储
        </p>
      </main>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white dark:bg-[#252B3D] rounded-2xl p-6 w-full max-w-sm">
            <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="h-6 w-6 text-red-500" />
            </div>
            <h3 className="text-lg font-semibold text-center text-gray-800 dark:text-gray-100 mb-2">
              确认删除所有数据？
            </h3>
            <p className="text-sm text-gray-500 text-center mb-6">
              此操作不可撤销，所有记录、设置都将被永久删除
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm font-medium"
              >
                取消
              </button>
              <button
                onClick={confirmDeleteAll}
                className="flex-1 py-3 rounded-xl bg-red-500 text-white text-sm font-medium"
              >
                确认删除
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clear Cache Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white dark:bg-[#252B3D] rounded-2xl p-6 w-full max-w-sm">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">
              确认清除缓存？
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              将清除搜索历史等缓存数据，不会影响您的健康记录
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm font-medium"
              >
                取消
              </button>
              <button
                onClick={confirmClearCache}
                className="flex-1 py-3 rounded-xl bg-[#D4AF37] text-white text-sm font-medium"
              >
                确认清除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
