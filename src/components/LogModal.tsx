import React, { useState, useEffect } from 'react';
import { MaintenanceLog, ConsumableItem } from '../types';
import { X, FileText } from 'lucide-react';

interface LogModalProps {
  isOpen: boolean;
  onClose: () => void;
  log: MaintenanceLog | null;
  items: ConsumableItem[];
  currentCarKm: number;
  initialPreset?: Partial<MaintenanceLog>;
  onSave: (savedLog: MaintenanceLog, syncWithConsumable: boolean) => void;
}

export const LogModal: React.FC<LogModalProps> = ({
  isOpen,
  onClose,
  log,
  items,
  currentCarKm,
  initialPreset,
  onSave,
}) => {
  const getToday = () => {
    const d = new Date();
    return d.toISOString().slice(0, 10);
  };

  const [item, setItem] = useState('');
  const [date, setDate] = useState(getToday());
  const [km, setKm] = useState(currentCarKm);
  const [cost, setCost] = useState(0);
  const [memo, setMemo] = useState('');
  const [syncWithConsumable, setSyncWithConsumable] = useState(true);

  useEffect(() => {
    if (log) {
      setItem(log.item);
      setDate(log.date);
      setKm(log.km);
      setCost(log.cost);
      setMemo(log.memo || '');
    } else if (initialPreset) {
      setItem(initialPreset.item || '');
      setDate(initialPreset.date || getToday());
      setKm(initialPreset.km !== undefined ? initialPreset.km : currentCarKm);
      setCost(initialPreset.cost || 0);
      setMemo(initialPreset.memo || '');
    } else {
      setItem(items[0]?.name || '');
      setDate(getToday());
      setKm(currentCarKm);
      setCost(0);
      setMemo('');
    }
  }, [log, initialPreset, currentCarKm, items, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!item.trim()) return;

    onSave(
      {
        id: log ? log.id : 'log_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
        item: item.trim(),
        date,
        km: Number(km),
        cost: Number(cost),
        memo: memo.trim(),
      },
      syncWithConsumable
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              {log ? '정비 이력 수정' : '정비 및 소모품 교체 기록 등록'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              정비 / 교체 항목 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              list="consumable-items-list"
              value={item}
              onChange={(e) => setItem(e.target.value)}
              placeholder="예: 엔진오일 교환, 타이어 교체"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            <datalist id="consumable-items-list">
              {items.map((i) => (
                <option key={i.id} value={i.name} />
              ))}
            </datalist>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                정비 날짜 <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                정비 시 주행거리 (km) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                required
                min={0}
                value={km}
                onChange={(e) => setKm(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              정비 비용 (원, 부품+공임 합계) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="number"
                required
                min={0}
                step={1000}
                value={cost}
                onChange={(e) => setCost(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 pr-8"
              />
              <span className="absolute right-3 top-2 text-xs text-slate-500">원</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              약 {Number(cost).toLocaleString()}원
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              정비 메모 / 장소 / 부품 제품명
            </label>
            <input
              type="text"
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder="예: 공임나라 역삼점, 쉘 힐릭스 0W-20, 에어컨 필터 자가교체"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={syncWithConsumable}
                onChange={(e) => setSyncWithConsumable(e.target.checked)}
                className="rounded text-blue-600 focus:ring-blue-500"
              />
              <span className="font-medium">
                동일한 소모품의 마지막 교체 기준(주행거리 & 날짜)을 자동 갱신
              </span>
            </label>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md shadow-blue-500/20"
            >
              등록 완료
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
