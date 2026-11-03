import React, { useState } from 'react';
import { MaintenanceLog } from '../types';
import { Plus, Search, Edit2, Trash2, Calendar, FileText, DollarSign } from 'lucide-react';

interface LogsTabProps {
  logs: MaintenanceLog[];
  onAddLog: () => void;
  onEditLog: (id: string) => void;
  onDeleteLog: (id: string) => void;
}

export const LogsTab: React.FC<LogsTabProps> = ({
  logs,
  onAddLog,
  onEditLog,
  onDeleteLog,
}) => {
  const [search, setSearch] = useState('');

  const filteredLogs = [...logs]
    .filter((l) => {
      const q = search.toLowerCase();
      return (
        l.item.toLowerCase().includes(q) ||
        (l.memo && l.memo.toLowerCase().includes(q)) ||
        l.date.includes(q)
      );
    })
    .sort((a, b) => b.date.localeCompare(a.date) || b.km - a.km);

  const totalCost = filteredLogs.reduce((acc, l) => acc + l.cost, 0);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            정비 이력 관리
          </h2>
          <p className="text-xs text-slate-500">
            총 {logs.length}건 기록 · 합계 {Number(totalCost).toLocaleString()}원
          </p>
        </div>

        <button
          onClick={onAddLog}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md shadow-blue-500/20 transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>정비 이력 등록</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="정비 항목명, 날짜, 메모 검색..."
          className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Log list */}
      <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100 shadow-xs overflow-hidden">
        {filteredLogs.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-sm">
            {search ? '검색 결과와 일치하는 정비 이력이 없습니다.' : '등록된 정비 이력이 없습니다.'}
          </div>
        ) : (
          filteredLogs.map((log) => (
            <div
              key={log.id}
              className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/60 transition-colors"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm sm:text-base text-slate-900">
                    {log.item}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    {log.date}
                  </span>
                  <span>·</span>
                  <span className="font-medium text-slate-700">
                    {Number(log.km).toLocaleString()} km
                  </span>
                  {log.memo && (
                    <>
                      <span>·</span>
                      <span className="text-slate-600 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                        {log.memo}
                      </span>
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                <div className="text-right">
                  <div className="font-extrabold text-base sm:text-lg text-slate-900">
                    {Number(log.cost).toLocaleString()}
                    <span className="text-xs font-normal text-slate-500 ml-0.5">원</span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onEditLog(log.id)}
                    className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer"
                    title="수정"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDeleteLog(log.id)}
                    className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg cursor-pointer"
                    title="삭제"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
