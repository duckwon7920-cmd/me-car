import React from 'react';
import { Car } from '../types';
import {
  Car as CarIcon,
  Wrench,
  FileText,
  BarChart3,
  Calculator,
  Bot,
  Sparkles,
  Zap,
} from 'lucide-react';

interface HeaderProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  car: Car | null;
  onEditCar: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  car,
  onEditCar,
}) => {
  const tabs = [
    { id: 'dash', label: '대시보드', icon: CarIcon },
    { id: 'items', label: '소모품 관리', icon: Wrench },
    { id: 'logs', label: '정비 이력', icon: FileText },
    { id: 'cost', label: '비용 분석', icon: BarChart3 },
    { id: 'estimate', label: '정비 견적', icon: Calculator, highlight: true },
    { id: 'diagnosis', label: 'AI 증상 진단', icon: Bot, isAi: true },
  ];

  const getFuelBadge = (fuel?: string) => {
    switch (fuel) {
      case 'ev':
        return { label: '⚡ 전기차 EV', bg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' };
      case 'hybrid':
        return { label: '🍃 하이브리드', bg: 'bg-teal-500/20 text-teal-300 border-teal-500/30' };
      case 'diesel':
        return { label: '⛽ 디젤', bg: 'bg-amber-500/20 text-amber-300 border-amber-500/30' };
      case 'lpg':
        return { label: '🔥 LPG', bg: 'bg-orange-500/20 text-orange-300 border-orange-500/30' };
      default:
        return { label: '🚗 가솔린', bg: 'bg-blue-500/20 text-blue-300 border-blue-500/30' };
    }
  };

  const badge = getFuelBadge(car?.fuelType);

  return (
    <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Logo & Car Switcher */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => onSelectTab('dash')}
              className="flex items-center gap-2 text-left focus:outline-none group"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
                <CarIcon className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5 font-bold text-lg leading-tight tracking-tight">
                  <span>Car<span className="text-blue-400">Care</span></span>
                  <span className="inline-flex items-center gap-0.5 text-[11px] font-semibold uppercase px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
                    <Sparkles className="w-3 h-3" /> AI
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 hidden sm:block">
                  차종별 맞춤 정비 견적 & AI 멀티모달 진단
                </div>
              </div>
            </button>

            {car && (
              <button
                onClick={onEditCar}
                className="hidden md:flex items-center gap-2 ml-3 px-2.5 py-1.5 rounded-lg bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700 text-xs transition-colors"
                title="차량 정보 변경"
              >
                <span className="font-medium text-slate-200">{car.name}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded border ${badge.bg}`}>
                  {badge.label}
                </span>
                <span className="text-slate-400 text-[11px]">
                  {Number(car.km).toLocaleString()}km
                </span>
                <span className="text-blue-400 text-[11px] underline ml-1">변경</span>
              </button>
            )}
          </div>

          {/* Navigation Bar */}
          <nav className="flex items-center gap-1 overflow-x-auto py-2 scrollbar-none">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = currentTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => onSelectTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30 font-semibold'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  } ${tab.isAi ? 'ring-1 ring-blue-500/40 bg-blue-950/40 text-blue-200' : ''}`}
                >
                  <Icon className={`w-4 h-4 ${tab.isAi ? 'text-amber-400' : ''}`} />
                  <span>{tab.label}</span>
                  {tab.isAi && (
                    <span className="flex h-2 w-2 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400"></span>
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
};
