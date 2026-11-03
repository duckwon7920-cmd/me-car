import React from 'react';
import { Car, ConsumableItem, MaintenanceLog } from '../types';
import {
  Wrench,
  Clock,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  TrendingUp,
  FileText,
  Zap,
} from 'lucide-react';

interface DashboardTabProps {
  car: Car;
  items: ConsumableItem[];
  logs: MaintenanceLog[];
  onEditCar: () => void;
  onNavigateTab: (tab: string) => void;
  onDoneItem: (itemId: string) => void;
  onEditItem: (itemId: string) => void;
}

export const DashboardTab: React.FC<DashboardTabProps> = ({
  car,
  items,
  logs,
  onEditCar,
  onNavigateTab,
  onDoneItem,
}) => {
  const currentKm = car.km || 0;
  const totalCost = logs.reduce((acc, log) => acc + log.cost, 0);

  // Status calculation for each consumable
  const itemStatuses = items.map((i) => {
    const nextKm = i.lastKm + i.interval;
    const remKm = nextKm - currentKm;
    const pctKm = Math.max(0, Math.min(100, ((currentKm - i.lastKm) / Math.max(1, i.interval)) * 100));

    let dateDue: string | null = null;
    let daysLeft: number | null = null;
    let datePct = 0;
    let dateState: 'ok' | 'soon' | 'over' = 'ok';

    if (i.lastDate && Number(i.intervalMonths) > 0) {
      const d = new Date(i.lastDate + 'T00:00:00');
      d.setMonth(d.getMonth() + Number(i.intervalMonths));
      dateDue = d.toISOString().slice(0, 10);
      const today = new Date().toISOString().slice(0, 10);
      daysLeft = Math.ceil((new Date(dateDue).getTime() - new Date(today).getTime()) / (1000 * 60 * 60 * 24));
      const totalDays = Number(i.intervalMonths) * 30.4375;
      datePct = Math.max(0, Math.min(100, ((totalDays - daysLeft) / totalDays) * 100));
      dateState = daysLeft < 0 ? 'over' : daysLeft <= Math.max(30, totalDays * 0.15) ? 'soon' : 'ok';
    }

    const kmState: 'ok' | 'soon' | 'over' =
      remKm < 0 ? 'over' : remKm <= i.interval * 0.15 ? 'soon' : 'ok';

    const rank = { ok: 0, soon: 1, over: 2 };
    const state = rank[kmState] >= rank[dateState] ? kmState : dateState;
    const finalPct = Math.max(pctKm, datePct);

    return {
      item: i,
      state,
      nextKm,
      remKm,
      pct: finalPct,
      dateDue,
      daysLeft,
    };
  });

  const sortedByUrgency = [...itemStatuses].sort((a, b) => a.remKm - b.remKm);
  const urgentCount = itemStatuses.filter((s) => s.state === 'over').length;
  const soonCount = itemStatuses.filter((s) => s.state === 'soon').length;
  const okCount = itemStatuses.filter((s) => s.state === 'ok').length;
  const nextUp = sortedByUrgency.slice(0, 3);
  const recentLogs = [...logs].sort((a, b) => b.date.localeCompare(a.date) || b.km - a.km).slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Hero Vehicle Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-900 text-white p-6 sm:p-8 shadow-xl border border-blue-900/50">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-semibold px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                {car.year}년식 · {car.brandType || '국산'}
              </span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                {car.fuelType === 'ev' ? '⚡ 순수 전기차' : car.fuelType === 'hybrid' ? '하이브리드' : '내연기관'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {car.name}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300">
              {car.engineSize || '세부 스펙 등록됨'} · 번호판: {car.licensePlate || '미등록'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 sm:gap-6 bg-slate-900/60 p-4 rounded-2xl border border-slate-700/60 backdrop-blur-xs">
            <div>
              <div className="text-[11px] text-slate-400 font-medium">현재 주행거리</div>
              <div className="text-xl sm:text-2xl font-black text-white">
                {Number(currentKm).toLocaleString()} <span className="text-sm font-normal text-slate-400">km</span>
              </div>
            </div>
            <div className="w-px h-10 bg-slate-700/80" />
            <div>
              <div className="text-[11px] text-slate-400 font-medium">누적 정비 지출</div>
              <div className="text-xl sm:text-2xl font-black text-blue-400">
                {Number(totalCost).toLocaleString()} <span className="text-sm font-normal text-slate-400">원</span>
              </div>
            </div>
            <button
              onClick={onEditCar}
              className="ml-auto px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white transition-all shadow-md shadow-blue-600/30 cursor-pointer"
            >
              차량·주행거리 변경
            </button>
          </div>
        </div>
      </div>

      {/* Quick AI Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div
          onClick={() => onNavigateTab('diagnosis')}
          className="group relative overflow-hidden p-5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/30 hover:border-amber-500/60 transition-all cursor-pointer shadow-sm hover:shadow-md"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold shadow-md shadow-amber-500/20 group-hover:scale-105 transition-transform">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 flex items-center gap-1.5 text-sm sm:text-base">
                  Gemini AI 실시간 차량 증상 진단
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-300">
                    멀티모달 비전
                  </span>
                </h3>
                <p className="text-xs text-slate-600 mt-0.5">
                  계기판 경고등·타이어·누유 사진과 증상을 올리면 1급 정비 기능장 AI가 즉시 원인 분석
                </p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-amber-600 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        <div
          onClick={() => onNavigateTab('estimate')}
          className="group relative overflow-hidden p-5 rounded-2xl bg-gradient-to-r from-blue-500/10 via-blue-500/5 to-transparent border border-blue-500/30 hover:border-blue-500/60 transition-all cursor-pointer shadow-sm hover:shadow-md"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 flex items-center gap-1.5 text-sm sm:text-base">
                  내 차종 맞춤 정비 견적 산출기
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 border border-blue-300">
                    실시간 계산
                  </span>
                </h3>
                <p className="text-xs text-slate-600 mt-0.5">
                  {car.name}에 최적화된 부품값과 표준 공임나라 공임비 상세 비교
                </p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-blue-600 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center gap-2 text-emerald-600 text-xs font-semibold">
            <CheckCircle2 className="w-4 h-4" /> 교체 여유
          </div>
          <div className="text-2xl font-black text-emerald-600 mt-1">{okCount}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">정상 운행 상태</div>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center gap-2 text-amber-600 text-xs font-semibold">
            <Clock className="w-4 h-4" /> 교체 임박
          </div>
          <div className="text-2xl font-black text-amber-600 mt-1">{soonCount}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">점검 및 부품 준비</div>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center gap-2 text-red-600 text-xs font-semibold">
            <AlertTriangle className="w-4 h-4" /> 교체 초과
          </div>
          <div className="text-2xl font-black text-red-600 mt-1">{urgentCount}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">즉시 정비 권장</div>
        </div>
      </div>

      {/* Next Up Consumables */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-600" />
            다음 교체 예정 소모품
          </h2>
          <button
            onClick={() => onNavigateTab('items')}
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
          >
            전체 소모품 ({items.length}) <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {nextUp.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-500 text-sm">
            등록된 소모품이 없습니다.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {nextUp.map(({ item, state, nextKm, remKm, pct }) => {
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
                  className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 font-bold text-sm text-slate-900">
                        <span className="text-xl">{item.icon}</span>
                        <span className="truncate">{item.name}</span>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badgeClass}`}>
                        {badgeText}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mt-3">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2 mt-3 pt-2 border-t border-slate-100 text-xs">
                      <div>
                        <span className="text-[11px] text-slate-400 block">교체 예정</span>
                        <span className="font-semibold text-slate-800">
                          {Number(nextKm).toLocaleString()} km
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[11px] text-slate-400 block">
                          {remKm < 0 ? '초과 거리' : '남은 거리'}
                        </span>
                        <span className={`font-bold ${isOver ? 'text-red-600' : isSoon ? 'text-amber-600' : 'text-slate-800'}`}>
                          {remKm < 0 ? `+${Number(-remKm).toLocaleString()} km` : `${Number(remKm).toLocaleString()} km`}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => onDoneItem(item.id)}
                    className="mt-3 w-full py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors cursor-pointer"
                  >
                    교체 완료 등록
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Recent Maintenance Logs */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-600" />
            최근 정비 이력
          </h2>
          <button
            onClick={() => onNavigateTab('logs')}
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
          >
            전체 이력 ({logs.length}) <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100 shadow-xs overflow-hidden">
          {recentLogs.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-sm">
              아직 등록된 정비 이력이 없습니다.
            </div>
          ) : (
            recentLogs.map((log) => (
              <div key={log.id} className="p-3.5 sm:p-4 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-bold text-sm text-slate-900 truncate">
                    {log.item}
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    {log.date} · {Number(log.km).toLocaleString()} km
                    {log.memo && <span className="text-slate-400 ml-1.5">· {log.memo}</span>}
                  </div>
                </div>
                <div className="font-extrabold text-sm sm:text-base text-slate-900 whitespace-nowrap">
                  {Number(log.cost).toLocaleString()}원
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
