import { useState } from 'react';
import {
  ChevronLeft, Calendar, Clock, MapPin, Phone,
  Plus, FileText, Building2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

interface HospitalPageProps {
  onBack: () => void;
}

interface HospitalRecord {
  id: string;
  hospital: string;
  department: string;
  doctor: string;
  date: string;
  time: string;
  notes: string;
}

const mockHospitals = [
  { name: '北京协和医院', department: '消化内科', distance: '3.2km' },
  { name: '北京大学第一医院', department: '胃肠外科', distance: '5.1km' },
  { name: '北京朝阳医院', department: '消化内科', distance: '4.8km' },
  { name: '北京友谊医院', department: '消化内科', distance: '6.3km' },
];

export function HospitalPage({ onBack }: HospitalPageProps) {
  const [activeTab, setActiveTab] = useState<'hospitals' | 'records' | 'add'>('hospitals');
  const [records, setRecords] = useState<HospitalRecord[]>([]);
  const [form, setForm] = useState({
    hospital: '',
    department: '',
    doctor: '',
    date: '',
    time: '',
    notes: '',
  });

  const handleAddRecord = () => {
    if (!form.hospital || !form.date) {
      toast.error('请填写医院和就诊日期');
      return;
    }
    const newRecord: HospitalRecord = {
      id: Date.now().toString(),
      ...form,
    };
    setRecords((prev) => [newRecord, ...prev]);
    setForm({ hospital: '', department: '', doctor: '', date: '', time: '', notes: '' });
    setActiveTab('records');
    toast.success('就诊记录已添加');
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
          <h1 className="text-lg font-bold text-white flex-1">就医助手</h1>
          {activeTab !== 'hospitals' && (
            <button
              className="text-sm text-white"
              onClick={() => setActiveTab('hospitals')}
            >
              返回
            </button>
          )}
        </div>
      </header>

      <main className="px-4 py-4 space-y-4 pb-24">
        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-white dark:bg-[#252B3D] rounded-xl shadow-card">
          {[
            { id: 'hospitals' as const, label: '附近医院' },
            { id: 'records' as const, label: '就诊记录' },
            { id: 'add' as const, label: '添加记录' },
          ].map((tab) => (
            <button
              key={tab.id}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'gradient-primary text-white'
                  : 'text-gray-500'
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Hospitals List */}
        {activeTab === 'hospitals' && (
          <div className="space-y-3">
            <div className="card-standard p-3 bg-[#D4AF37]/5 border border-[#D4AF37]/20">
              <div className="flex items-center gap-2 text-sm text-[#D4AF37]">
                <MapPin className="h-4 w-4" />
                <span>基于您的位置推荐附近医院</span>
              </div>
            </div>
            {mockHospitals.map((hospital, i) => (
              <div key={i} className="card-standard">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-xl bg-[#D4AF37]/10 flex items-center justify-center flex-shrink-0">
                    <Building2 className="h-6 w-6 text-[#D4AF37]" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                      {hospital.name}
                    </h4>
                    <p className="text-xs text-gray-500 mt-1">
                      {hospital.department}
                    </p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="flex items-center gap-1 text-xs text-gray-400">
                        <MapPin className="h-3 w-3" />
                        {hospital.distance}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-gray-400">
                        <Phone className="h-3 w-3" />
                        预约
                      </span>
                    </div>
                  </div>
                </div>
                <Button
                  className="w-full mt-3 gradient-primary text-white h-10 rounded-xl text-sm"
                  onClick={() => {
                    setForm((prev) => ({ ...prev, hospital: hospital.name, department: hospital.department }));
                    setActiveTab('add');
                  }}
                >
                  预约挂号
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Records List */}
        {activeTab === 'records' && (
          <div className="space-y-3">
            {records.length === 0 ? (
              <div className="card-standard text-center py-12">
                <FileText className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-400 mb-4">暂无就诊记录</p>
                <Button
                  className="gradient-primary text-white"
                  onClick={() => setActiveTab('add')}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  添加就诊记录
                </Button>
              </div>
            ) : (
              records.map((record) => (
                <div key={record.id} className="card-standard">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                      {record.hospital}
                    </h4>
                    <span className="px-2 py-1 rounded-full bg-[#D4AF37]/10 text-xs text-[#D4AF37]">
                      {record.department || '未填写'}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {record.date}
                    </span>
                    {record.time && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {record.time}
                      </span>
                    )}
                    {record.doctor && <span>医生：{record.doctor}</span>}
                  </div>
                  {record.notes && (
                    <p className="text-xs text-gray-400 mt-2">{record.notes}</p>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* Add Record Form */}
        {activeTab === 'add' && (
          <div className="card-standard space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">医院名称</label>
              <input
                className="w-full p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 text-sm border-0 focus:ring-2 focus:ring-[#D4AF37]/50 outline-none"
                placeholder="请输入医院名称"
                value={form.hospital}
                onChange={(e) => setForm((prev) => ({ ...prev, hospital: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">科室</label>
                <input
                  className="w-full p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 text-sm border-0 focus:ring-2 focus:ring-[#D4AF37]/50 outline-none"
                  placeholder="消化内科"
                  value={form.department}
                  onChange={(e) => setForm((prev) => ({ ...prev, department: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">医生</label>
                <input
                  className="w-full p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 text-sm border-0 focus:ring-2 focus:ring-[#D4AF37]/50 outline-none"
                  placeholder="选填"
                  value={form.doctor}
                  onChange={(e) => setForm((prev) => ({ ...prev, doctor: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">就诊日期</label>
                <input
                  type="date"
                  className="w-full p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 text-sm border-0 focus:ring-2 focus:ring-[#D4AF37]/50 outline-none"
                  value={form.date}
                  onChange={(e) => setForm((prev) => ({ ...prev, date: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">时间</label>
                <input
                  type="time"
                  className="w-full p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 text-sm border-0 focus:ring-2 focus:ring-[#D4AF37]/50 outline-none"
                  value={form.time}
                  onChange={(e) => setForm((prev) => ({ ...prev, time: e.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">备注</label>
              <Textarea
                className="min-h-20 resize-none bg-gray-50 dark:bg-gray-800/50 border-0 rounded-xl"
                placeholder="就诊情况、诊断结果、用药记录等..."
                value={form.notes}
                onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
              />
            </div>
            <Button
              className="w-full gradient-primary text-white h-12 rounded-xl text-base"
              onClick={handleAddRecord}
            >
              <Plus className="h-4 w-4 mr-2" />
              保存就诊记录
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
