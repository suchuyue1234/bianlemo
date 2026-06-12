import { useState, useMemo } from 'react';
import { ChevronLeft, Search, Clock, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface SearchPageProps {
  onBack: () => void;
  records: Array<{
    id: string;
    date: string;
    time: string;
    type: string;
    shape: number;
    color: string;
    duration: number;
    feeling?: string;
    note?: string;
  }>;
}

const typeLabels: Record<string, string> = {
  normal: '正常',
  constipation: '便秘',
  diarrhea: '腹泻',
  other: '其他',
};

const typeColors: Record<string, string> = {
  normal: '#C4A35A',
  constipation: '#FF6B4A',
  diarrhea: '#D4AF37',
  other: '#FFD166',
};

export function SearchPage({ onBack, records }: SearchPageProps) {
  const [query, setQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');

  const filtered = useMemo(() => {
    return records.filter((r) => {
      const matchQuery =
        query === '' ||
        r.date.includes(query) ||
        r.note?.toLowerCase().includes(query.toLowerCase()) ||
        (r.feeling && r.feeling.toLowerCase().includes(query.toLowerCase())) ||
        r.shape.toString() === query;
      const matchType = filterType === 'all' || r.type === filterType;
      return matchQuery && matchType;
    });
  }, [query, filterType, records]);

  const recentSearches = ['便秘', '正常', '形状4'];

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
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              className="pl-10 h-10 bg-white/20 border-0 rounded-xl text-white placeholder-white/60"
              placeholder="搜索记录..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>
      </header>

      <main className="px-4 py-4 space-y-4 pb-24">
        {/* Filter Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {['all', 'normal', 'constipation', 'diarrhea', 'other'].map((type) => (
            <button
              key={type}
              className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                filterType === type
                  ? 'gradient-primary text-white'
                  : 'bg-white dark:bg-[#252B3D] text-gray-500'
              }`}
              onClick={() => setFilterType(type)}
            >
              {type === 'all' ? '全部' : typeLabels[type]}
            </button>
          ))}
        </div>

        {/* Recent Searches (only when no query) */}
        {!query && (
          <div className="card-standard">
            <h3 className="text-sm font-medium text-gray-500 mb-3 flex items-center gap-2">
              <Clock className="h-4 w-4" />
              热门搜索
            </h3>
            <div className="flex flex-wrap gap-2">
              {recentSearches.map((term) => (
                <button
                  key={term}
                  className="px-3 py-1.5 rounded-full bg-gray-100 dark:bg-gray-800 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  onClick={() => setQuery(term)}
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Results */}
        {query || filterType !== 'all' ? (
          <div className="space-y-2">
            <p className="text-sm text-gray-500">
              找到 {filtered.length} 条记录
            </p>
            {filtered.length === 0 ? (
              <div className="card-standard text-center py-12">
                <Search className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-400">没有找到匹配的记录</p>
              </div>
            ) : (
              filtered.map((record) => (
                <div
                  key={record.id}
                  className="card-standard flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: `${typeColors[record.type] || '#D4AF37'}20` }}
                    >
                      <span className="text-lg">
                        {record.type === 'normal' ? '✅' : record.type === 'constipation' ? '😟' : record.type === 'diarrhea' ? '💧' : '❓'}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                        {record.date} {record.time}
                      </p>
                      <p className="text-xs text-gray-500">
                        形状 {record.shape} · {record.duration} 分钟
                        {record.note ? ` · ${record.note}` : ''}
                      </p>
                    </div>
                  </div>
                  <span
                    className="px-2 py-1 rounded-full text-xs font-medium"
                    style={{
                      backgroundColor: `${typeColors[record.type] || '#D4AF37'}15`,
                      color: typeColors[record.type] || '#D4AF37',
                    }}
                  >
                    {typeLabels[record.type] || '其他'}
                  </span>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="card-standard text-center py-12">
            <Calendar className="h-12 w-12 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-400">输入关键词搜索历史记录</p>
          </div>
        )}
      </main>
    </div>
  );
}
