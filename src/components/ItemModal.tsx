import React, { useState, useEffect } from 'react';
import { ConsumableItem } from '../types';
import { X, Wrench } from 'lucide-react';

interface ItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: ConsumableItem | null;
  currentCarKm: number;
  onSave: (savedItem: ConsumableItem) => void;
}

export const ItemModal: React.FC<ItemModalProps> = ({
  isOpen,
  onClose,
  item,
  currentCarKm,
  onSave,
}) => {
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('🔧');
  const [lastKm, setLastKm] = useState(0);
  const [interval, setInterval] = useState(10000);
  const [lastDate, setLastDate] = useState('');
  const [intervalMonths, setIntervalMonths] = useState(0);
  const [note, setNote] = useState('');

  useEffect(() => {
    if (item) {
      setName(item.name);
      setIcon(item.icon || '🔧');
      setLastKm(item.lastKm);
      setInterval(item.interval);
      setLastDate(item.lastDate || '');
      setIntervalMonths(item.intervalMonths || 0);
      setNote(item.note || '');
    } else {
      setName('');
      setIcon('🔧');
      setLastKm(currentCarKm);
      setInterval(10000);
      setLastDate('');
      setIntervalMonths(12);
      setNote('');
    }
  }, [item, currentCarKm, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSave({
      id: item ? item.id : 'item_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      name: name.trim(),
      icon: icon.trim() || '🔧',
      lastKm: Number(lastKm),
      interval: Math.max(500, Number(interval)),
      lastDate: lastDate || undefined,
      intervalMonths: Number(intervalMonths) || 0,
      note: note.trim() || undefined,
    });
    onClose();
  };

  const commonIcons = ['🛢️', '🛞', '🛑', '🌬️', '💧', '🔋', '⚙️', '⚡', '⛽', '🧊', '🔧'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{icon}</span>
            <h3 className="text-lg font-bold text-slate-900">
              {item ? '소모품 정보 수정' : '새 소모품 추가'}
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
              소모품 명칭 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="예: 엔진오일, 브레이크 패드, 와이퍼 블레이드"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              아이콘 선택
            </label>
            <div className="flex items-center gap-1.5 overflow-x-auto py-1">
              {commonIcons.map((ic) => (
                <button
                  type="button"
                  key={ic}
                  onClick={() => setIcon(ic)}
                  className={`w-9 h-9 rounded-lg flex items-center justify-center text-lg border transition-all ${
                    icon === ic
                      ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-400'
                      : 'border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {ic}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                마지막 교체 주행거리 (km) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                required
                min={0}
                value={lastKm}
                onChange={(e) => setLastKm(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                교체 주기 (km) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                required
                min={500}
                value={interval}
                onChange={(e) => setInterval(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                마지막 교체 날짜
              </label>
              <input
                type="date"
                value={lastDate}
                onChange={(e) => setLastDate(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                기간 주기 (개월수, 0=사용안함)
              </label>
              <input
                type="number"
                min={0}
                max={120}
                value={intervalMonths}
                onChange={(e) => setIntervalMonths(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              메모 및 규격 (선택)
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="예: 0W-20 합성유 4.3L, 전륜 로터 300mm"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
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
              저장
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
