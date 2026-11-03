import React from 'react';
import { Car, ConsumableItem } from '../types';
import { Plus, RotateCcw, CheckCircle, Edit, Trash2, Calendar, Gauge } from 'lucide-react';

interface ItemsTabProps {
  car: Car;
  items: ConsumableItem[];
  onAddItem: () => void;
  onEditItem: (id: string) => void;
  onDeleteItem: (id: string) => void;
  onDoneItem: (id: string) => void;
  onResetToVehicleDefault: () => void;
}

export const ItemsTab: React.FC<ItemsTabProps> = ({
  car,
  items,
  onAddItem,
  onEditItem,
  onDeleteItem,
  onDoneItem,
  onResetToVehicleDefault,
}) => {
  const currentKm = car.km || 0;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            소모품 주기 관리
          </h2>
          <p className="text-xs text-slate-500">
            {car.name} ({car.year}년식 · {Number(currentKm).toLocaleString()} km) 기준 소모품 관리 상태
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onResetToVehicleDefault}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-600 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-colors cursor-pointer"
            title="현재 차종에 맞는 표준 소모품 목록으로 다시 불러옵니다"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>차종별 기본 세트 복원</span>
          </button>
          <button
            onClick={onAddItem}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md shadow-blue-500/20 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>소모품 추가</span>
          </button>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
          <p className="text-slate-500 text-sm mb-4">등록된 소모품이 없습니다.</p>
          <button
            onClick={onResetToVehicleDefault}
            className="px-4 py-2 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl"
          >
            {car.name} 맞춤 소모품 세트 생성
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {items.map((item) => {
            const nextKm = item.lastKm + item.interval;
            const remKm = nextKm - currentKm;
            const pctKm = Math.max(0, Math.min(100, ((currentKm - item.lastKm) / Math.max(1, item.interval)) * 100));

            let dateDue: string | null = null;
            let daysLeft: number | null = null;
            let datePct = 0;
            let dateState: 'ok' | 'soon' | 'over' = 'ok';

            if (item.lastDate && Number(item.intervalMonths) > 0) {
              const d = new Date(item.lastDate + 'T00:00:00');
              d.setMonth(d.getMonth() + Number(item.intervalMonths));
              dateDue = d.toISOString().slice(0, 10);
              const today = new Date().toISOString().slice(0, 10);
              daysLeft = Math.ceil((new Date(dateDue).getTime() - new Date(today).getTime()) / (1000 * 60 * 60 * 24));
              const totalDays = Number(item.intervalMonths) * 30.4375;
              datePct = Math.max(0, Math.min(100, ((totalDays - daysLeft) / totalDays) * 100));
              dateState = daysLeft < 0 ? 'over' : daysLeft <= Math.max(30, totalDays * 0.15) ? 'soon' : 'ok';
            }

            const kmState = remKm < 0 ? 'over' : remKm <= item.interval * 0.15 ? 'soon' : 'ok';
            const rank = { ok: 0, soon: 1, over: 2 };
            const state = rank[kmState] >= rank[dateState] ? kmState : dateState;
            const finalPct = Math.max(pctKm, datePct);

            const isOver = state === 'over';
            const isSoon = state === 'soon';
            const barColor = isOver ? 'bg-red-500' : isSoon ? 'bg-amber-500' : 'bg-emerald-500';
            const badgeClass = isOver
              ? 'bg-red-100 text-red-700 border-red-200'
              : isSoon
              ? 'bg-amber-100 text-amber-800 border-amber-200'
              : 'bg-emerald-100 text-emerald-800 border-emerald-200';
            const badgeText = isOver ? '교체 초과' : isSoon ? '교체 임박' : '여유';

            return (
              <div
                key={item.id}
                className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{item.icon}</span>
                      <div>
                        <h3 className="font-bold text-base text-slate-900">
                          {item.name}
                        </h3>
                        {item.note && (
                          <p className="text-xs text-slate-400 mt-0.5">{item.note}</p>
                        )}
                      </div>
                    </div>
                    <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border whitespace-nowrap ${badgeClass}`}>
                      {badgeText}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-4">
                    <div className="flex justify-between text-xs text-slate-500 mb-1">
                      <span>소모율 {Math.round(finalPct)}%</span>
                      <span>
                        {remKm < 0
                          ? `기준치 +${Number(-remKm).toLocaleString()} km 초과`
                          : `약 ${Number(remKm).toLocaleString()} km 남음`}
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                        style={{ width: `${finalPct}%` }}
                      />
                    </div>
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-2 gap-3 mt-4 pt-3 border-t border-slate-100 text-xs">
                    <div>
                      <div className="flex items-center gap-1 text-slate-400 text-[11px]">
                        <Gauge className="w-3.5 h-3.5" /> 다음 교체 주행거리
                      </div>
                      <div className="font-semibold text-slate-800 mt-0.5">
                        {Number(nextKm).toLocaleString()} km
                      </div>
                      <div className="text-[11px] text-slate-400">
                        (주기 {Number(item.interval).toLocaleString()} km)
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center gap-1 text-slate-400 text-[11px]">
                        <Calendar className="w-3.5 h-3.5" /> 마지막 교체
                      </div>
                      <div className="font-semibold text-slate-800 mt-0.5">
                        {Number(item.lastKm).toLocaleString()} km
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {item.lastDate ? `${item.lastDate} (${item.intervalMonths || 0}개월 주기)` : '날짜 미등록'}
                      </div>
                    </div>
                  </div>

                  {dateDue && (
                    <div className="mt-2 text-xs bg-slate-50 p-2 rounded-lg text-slate-600 flex items-center justify-between">
                      <span>기간 기준 예정일</span>
                      <span className="font-medium text-slate-900">
                        {dateDue} ({daysLeft !== null && (daysLeft < 0 ? `${-daysLeft}일 초과` : `${daysLeft}일 남음`)})
                      </span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-100">
                  <button
                    onClick={() => onDoneItem(item.id)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors cursor-pointer"
                  >
                    <CheckCircle className="w-3.5 h-3.5" /> 교체 완료 등록
                  </button>
                  <button
                    onClick={() => onEditItem(item.id)}
                    className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                    title="수정"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDeleteItem(item.id)}
                    className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                    title="삭제"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
