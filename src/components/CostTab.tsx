import React from 'react';
import { MaintenanceLog } from '../types';
import { BarChart3, TrendingUp, Calendar, PieChart, Download, Upload } from 'lucide-react';

interface CostTabProps {
  logs: MaintenanceLog[];
  onExport: () => void;
  onImport: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const CostTab: React.FC<CostTabProps> = ({ logs, onExport, onImport }) => {
  const totalCost = logs.reduce((acc, l) => acc + l.cost, 0);

  // Group by month
  const monthly: Record<string, number> = {};
  const byItem: Record<string, number> = {};

  logs.forEach((l) => {
    const m = l.date.slice(0, 7);
    monthly[m] = (monthly[m] || 0) + l.cost;
    byItem[l.item] = (byItem[l.item] || 0) + l.cost;
  });

  const currentMonth = new Date().toISOString().slice(0, 7);
  const thisMonthCost = monthly[currentMonth] || 0;

  // Last 12 months sorted
  const sortedMonths = Object.keys(monthly).sort().slice(-12);
  const maxMonthly = Math.max(1, ...sortedMonths.map((m) => monthly[m]));

  // Sorted items by spending
  const sortedItems = Object.entries(byItem).sort((a, b) => b[1] - a[1]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            정비 비용 분석
          </h2>
          <p className="text-xs text-slate-500">
            월별 지출 추이와 주요 소모품별 누적 지출 통계
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl cursor-pointer">
            <Upload className="w-3.5 h-3.5 text-slate-500" />
            <span>데이터 가져오기</span>
            <input
              type="file"
              accept=".json"
              onChange={onImport}
              className="hidden"
            />
          </label>
          <button
            onClick={onExport}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>백업 다운로드</span>
          </button>
        </div>
      </div>

      {/* Top 3 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-400 block">총 누적 정비 비용</span>
          <div className="text-2xl font-black text-slate-900 mt-1">
            {Number(totalCost).toLocaleString()} <span className="text-sm font-normal text-slate-500">원</span>
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">전체 기간 총 {logs.length}건</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-400 block">이번 달 ({currentMonth}) 지출</span>
          <div className="text-2xl font-black text-blue-600 mt-1">
            {Number(thisMonthCost).toLocaleString()} <span className="text-sm font-normal text-slate-500">원</span>
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">당월 발생 정비비</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-400 block">정비 1회당 평균 지출</span>
          <div className="text-2xl font-black text-slate-900 mt-1">
            {logs.length > 0 ? Number(Math.round(totalCost / logs.length)).toLocaleString() : 0}{' '}
            <span className="text-sm font-normal text-slate-500">원</span>
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">회당 평균 유지보수비</span>
        </div>
      </div>

      {/* Monthly Chart Card */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-sm sm:text-base text-slate-900 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-blue-600" />
            월별 정비 비용 추이
          </h3>
          <span className="text-xs text-slate-400">최근 12개월</span>
        </div>

        {sortedMonths.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-sm">
            월별 데이터가 아직 없습니다.
          </div>
        ) : (
          <div className="flex items-end gap-3 sm:gap-4 h-52 overflow-x-auto pt-8 pb-2 px-2 scrollbar-none">
            {sortedMonths.map((m) => {
              const val = monthly[m];
              const heightPct = Math.max(6, (val / maxMonthly) * 100);
              return (
                <div
                  key={m}
                  className="flex-1 min-w-[52px] flex flex-col items-center justify-end h-full group"
                >
                  <span className="text-[11px] font-bold text-slate-700 mb-1.5 opacity-80 group-hover:opacity-100">
                    {val >= 10000 ? `${Math.round(val / 1000) / 10}만` : val.toLocaleString()}
                  </span>
                  <div
                    className="w-full max-w-[38px] bg-gradient-to-t from-blue-600 to-indigo-400 rounded-t-lg transition-all duration-300 group-hover:from-blue-500 group-hover:to-indigo-300 shadow-xs"
                    style={{ height: `${heightPct}%` }}
                  />
                  <span className="text-[11px] text-slate-400 mt-2 font-medium whitespace-nowrap">
                    {m.slice(2).replace('-', '.')}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Itemized Spending Breakdown */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-sm sm:text-base text-slate-900 flex items-center gap-2">
            <PieChart className="w-4 h-4 text-blue-600" />
            소모품 및 항목별 누적 지출 비중
          </h3>
          <span className="text-xs text-slate-400">금액순 정렬</span>
        </div>

        {sortedItems.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-sm">
            지출 내역이 없습니다.
          </div>
        ) : (
          <div className="space-y-3.5">
            {sortedItems.map(([name, cost]) => {
              const pct = totalCost > 0 ? Math.round((cost / totalCost) * 100) : 0;
              return (
                <div key={name} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs sm:text-sm">
                    <span className="font-semibold text-slate-800">{name}</span>
                    <span className="font-bold text-slate-900">
                      {Number(cost).toLocaleString()}원{' '}
                      <span className="text-xs font-normal text-slate-400">({pct}%)</span>
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-blue-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
