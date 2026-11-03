import React, { useState, useEffect } from 'react';
import { Car, EstimateItem } from '../types';
import { calculateCarEstimates, CAR_PRESETS } from '../data/vehiclePresets';
import {
  Calculator,
  Sparkles,
  Info,
  Check,
  ExternalLink,
  PlusCircle,
  Wrench,
  ShieldCheck,
  AlertCircle,
  RefreshCw,
  Sliders,
  DollarSign,
  ChevronRight,
} from 'lucide-react';

interface EstimateTabProps {
  car: Car;
  onEditCar: () => void;
  onAddLogWithEstimate: (item: string, cost: number, memo: string) => void;
  onSwitchCarPreset: (presetId: string) => void;
}

export const EstimateTab: React.FC<EstimateTabProps> = ({
  car,
  onEditCar,
  onAddLogWithEstimate,
  onSwitchCarPreset,
}) => {
  const [estimates, setEstimates] = useState<EstimateItem[]>(() => calculateCarEstimates(car));
  const [aiLoading, setAiLoading] = useState(false);
  const [aiData, setAiData] = useState<{ carSummary?: string; overallTier?: string } | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'essential' | 'diy'>('all');

  // Recalculate local estimates whenever the car changes
  useEffect(() => {
    setEstimates(calculateCarEstimates(car));
    setAiData(null);
    setAiError(null);
  }, [car]);

  // Request Deep AI Estimate from Gemini 3.8 Flash
  const handleFetchAiEstimate = async () => {
    setAiLoading(true);
    setAiError(null);
    try {
      const res = await fetch('/api/estimate-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ car }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || '견적 데이터를 불러오는 데 실패했습니다.');
      }

      const data = await res.json();
      if (data.items && Array.isArray(data.items) && data.items.length > 0) {
        setEstimates(data.items);
        setAiData({
          carSummary: data.carSummary,
          overallTier: data.overallTier,
        });
      }
    } catch (err: any) {
      console.error(err);
      setAiError(err.message || 'AI 정밀 견적 요청 중 오류가 발생했습니다.');
    } finally {
      setAiLoading(false);
    }
  };

  const isEv = car.fuelType === 'ev' || car.category === 'ev';
  const isImport = car.brandType === '수입';
  const isLuxury = car.category === 'luxury' || isImport;

  // Filter items
  const filteredEstimates = estimates.filter((e) => {
    if (selectedFilter === 'diy') {
      return e.difficulty.includes('DIY') || e.difficulty.includes('가능');
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header & Car Spec Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Calculator className="w-5 h-5 text-blue-600" />
              내 차종 맞춤 정비 견적 산출기
            </h2>
            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-semibold border border-blue-200">
              실시간 연동
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            차량 종류(국산·수입, 경차·대형, 디젤·EV)에 따라 부품 비용 및 표준 공임이 그 차에 맞게 달라집니다.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleFetchAiEstimate}
            disabled={aiLoading}
            className="flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 rounded-xl shadow-md shadow-indigo-500/20 disabled:opacity-50 transition-all cursor-pointer"
          >
            {aiLoading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4 text-amber-300" />
            )}
            <span>{aiLoading ? 'Gemini AI 정밀 분석 중...' : 'Gemini AI 정밀 견적 조회'}</span>
          </button>
          <button
            onClick={onEditCar}
            className="px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-colors cursor-pointer"
          >
            차량 정보 수정
          </button>
        </div>
      </div>

      {/* Vehicle Profile Card */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-2xl">
              {isEv ? '⚡' : isImport ? '🏎️' : '🚗'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base sm:text-lg text-slate-900">
                  {car.name}
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                  {car.year}년식
                </span>
                <span
                  className={`text-xs font-semibold px-2 py-0.5 rounded border ${
                    isImport
                      ? 'bg-purple-50 text-purple-700 border-purple-200'
                      : isEv
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-blue-50 text-blue-700 border-blue-200'
                  }`}
                >
                  {isImport ? '수입차 (공임 할증)' : isEv ? '전기차 (EV 특화)' : '국산차'}
                </span>
              </div>
              <div className="text-xs text-slate-500 mt-1">
                주행거리 {Number(car.km).toLocaleString()} km · 엔진/구동계: {car.engineSize || '기본'} · 유종: {car.fuelType}
              </div>
            </div>
          </div>

          {/* Quick Preset Car Switcher */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-1">
            <span className="text-[11px] text-slate-400 font-medium mr-1 whitespace-nowrap">
              다른 차와 견적 비교:
            </span>
            {CAR_PRESETS.slice(0, 5).map((p) => (
              <button
                key={p.id}
                onClick={() => onSwitchCarPreset(p.id)}
                className={`px-2.5 py-1 text-xs rounded-lg border transition-all whitespace-nowrap ${
                  car.name === p.name
                    ? 'bg-blue-600 text-white border-blue-600 font-bold'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                {p.name.replace(/현대 |기아 |메르세데스-|RG3|DN8|CN7/g, '').trim()}
              </button>
            ))}
          </div>
        </div>

        {/* AI Insight banner if AI estimate loaded */}
        {aiData && (
          <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 text-xs text-indigo-950 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-indigo-900">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>Gemini 3.8 Flash AI 분석 등급: {aiData.overallTier}</span>
            </div>
            <p className="text-slate-700 leading-relaxed">{aiData.carSummary}</p>
          </div>
        )}

        {aiError && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
            <span>{aiError}</span>
          </div>
        )}

        {/* Vehicle Maintenance Characteristics Explanation */}
        <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-600 flex items-start gap-2 border border-slate-200/80">
          <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            {isEv ? (
              <span>
                <strong>전기차(EV) 견적 특성:</strong> 내연기관의 핵심 비용인 <strong>엔진오일 및 점화플러그 비용이 0원</strong>이며, 대신 고성능 전기모터 대응 <strong>감속기 오일</strong>, 화재 예방용 <strong>절연 냉각수</strong>, 그리고 고하중 순간 토크 대응 <strong>EV 전용 타이어</strong>가 반영되었습니다.
              </span>
            ) : isImport ? (
              <span>
                <strong>수입차(독일/수입) 견적 특성:</strong> 일반 정비소 및 공임나라 기준 <strong>수입차 공임 할증(1.8~2.5배)</strong> 및 롱라이프 전용 합성유 규격(LL-04, MB229.5), 패드 마모 센서 별도 교환 비용이 정확하게 계산되어 있습니다.
              </span>
            ) : isLuxury ? (
              <span>
                <strong>국산 프리미엄(제네시스 등) 견적 특성:</strong> 2.5T/3.5T 대용량 엔진오일(6~7L), 19~20인치 고성능 타이어, 전자식 주차브레이크(EPB) 모노블럭 패드 등 고급 사양 부품비와 표준 공임이 산출됩니다.
              </span>
            ) : (
              <span>
                <strong>국산 표준 견적 특성:</strong> 현대/기아 모비스 순정품 및 규격 애프터마켓 호환품, 전국 공임나라 및 표준 카센터 공임 기준이 적용되어 가장 합리적이고 정확합니다.
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setSelectedFilter('all')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
            selectedFilter === 'all'
              ? 'bg-blue-600 text-white'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          전체 소모품 ({estimates.length})
        </button>
        <button
          onClick={() => setSelectedFilter('diy')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
            selectedFilter === 'diy'
              ? 'bg-blue-600 text-white'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          DIY 가능 항목 (공임 0원 절약)
        </button>
        <div className="ml-auto text-xs text-slate-400 hidden sm:block">
          공임나라 표준 공임 및 한국 부품 시세 기준
        </div>
      </div>

      {/* Estimates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredEstimates.map((item, idx) => {
          const totalMin = item.partCostMin + item.laborCostMin;
          const totalMax = item.partCostMax + item.laborCostMax;
          const avgCost = Math.round((totalMin + totalMax) / 2 / 1000) * 1000;

          return (
            <div
              key={item.name + idx}
              className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow group"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl p-2 rounded-xl bg-slate-50 border border-slate-100">
                      {item.icon}
                    </span>
                    <div>
                      <h3 className="font-bold text-base text-slate-900 group-hover:text-blue-600 transition-colors">
                        {item.name}
                      </h3>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                        <span className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">
                          {item.unit}
                        </span>
                        <span>·</span>
                        <span
                          className={`font-semibold ${
                            item.difficulty.includes('DIY')
                              ? 'text-emerald-600'
                              : item.difficulty.includes('전문')
                              ? 'text-purple-600'
                              : 'text-slate-600'
                          }`}
                        >
                          난이도: {item.difficulty}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[11px] text-slate-400 block font-medium">예상 총비용</span>
                    <div className="text-base sm:text-lg font-black text-blue-600 whitespace-nowrap">
                      {totalMin.toLocaleString()} ~ {totalMax.toLocaleString()}
                      <span className="text-xs font-normal text-slate-500 ml-0.5">원</span>
                    </div>
                  </div>
                </div>

                {/* Sub-breakdown: Parts Cost vs Labor Cost */}
                <div className="grid grid-cols-2 gap-2 mt-4 p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                  <div>
                    <span className="text-[11px] text-slate-500 font-medium block">
                      부품비 (순정 vs 호환)
                    </span>
                    <span className="font-bold text-slate-800 text-sm">
                      {item.partCostMin.toLocaleString()} ~ {item.partCostMax.toLocaleString()}원
                    </span>
                  </div>
                  <div className="border-l border-slate-200 pl-3">
                    <span className="text-[11px] text-slate-500 font-medium block">
                      표준 작업 공임비
                    </span>
                    <span className="font-bold text-slate-800 text-sm">
                      {item.laborCostMin === 0 && item.laborCostMax === 0
                        ? '0원 (DIY 직접 교체)'
                        : `${item.laborCostMin.toLocaleString()} ~ ${item.laborCostMax.toLocaleString()}원`}
                    </span>
                  </div>
                </div>

                {/* Brand & Recommendation Spec */}
                <div className="mt-3 space-y-1.5 text-xs">
                  <div className="flex items-start gap-1.5 text-slate-700">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-slate-900">추천 부품/규격:</strong>{' '}
                      {item.brandRecommendation}
                    </span>
                  </div>

                  {item.laborReason && (
                    <div className="text-[11px] text-slate-500 pl-5">
                      공임 상세: {item.laborReason}
                    </div>
                  )}

                  <div className="text-[11px] text-slate-600 bg-amber-50/70 p-2.5 rounded-lg border border-amber-200/60 leading-relaxed">
                    💡 <strong className="text-amber-900">{car.name} 전용 팁:</strong> {item.tip}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-100">
                <button
                  onClick={() =>
                    onAddLogWithEstimate(
                      item.name,
                      avgCost,
                      `${car.name} 예상 견적에서 등록 (부품: ${item.brandRecommendation})`
                    )
                  }
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors cursor-pointer"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>이 금액({(avgCost / 10000).toFixed(1)}만원)으로 정비 등록</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Gongimnara Notice & Official Link */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-600">
        <div>
          <div className="font-bold text-slate-800 flex items-center gap-1.5">
            <Info className="w-4 h-4 text-blue-600" />
            공임나라 및 표준 정비 공임 안내
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            표시된 금액은 차종별 배기량, 엔진오일 용량, 수입차 할증률을 반영한 국내 표준 기준입니다. 부품을 직접 인터넷으로 구매한 뒤 공임나라 가맹점에 방문하시면 공임비만 지불하고 경제적으로 정비할 수 있습니다.
          </p>
        </div>
        <a
          href="https://www.gongim.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-semibold whitespace-nowrap transition-colors shrink-0"
        >
          <span>공임나라 공식 공임표 확인</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
};
