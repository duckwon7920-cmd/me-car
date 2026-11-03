import React, { useState } from 'react';
import { Car, FuelType, VehicleCategory } from '../types';
import { CAR_PRESETS, CarPreset } from '../data/vehiclePresets';
import { X, Check, Car as CarIcon, Sparkles } from 'lucide-react';

interface CarModalProps {
  isOpen: boolean;
  onClose: () => void;
  car: Car | null;
  onSave: (savedCar: Car, resetConsumablesToMatch: boolean) => void;
}

export const CarModal: React.FC<CarModalProps> = ({
  isOpen,
  onClose,
  car,
  onSave,
}) => {
  const [name, setName] = useState(car?.name || '현대 쏘나타 DN8');
  const [year, setYear] = useState(car?.year || 2021);
  const [km, setKm] = useState(car?.km || 52300);
  const [fuelType, setFuelType] = useState<FuelType>(car?.fuelType || 'gasoline');
  const [category, setCategory] = useState<VehicleCategory>(car?.category || 'midsize');
  const [brandType, setBrandType] = useState<'국산' | '수입'>(car?.brandType || '국산');
  const [engineSize, setEngineSize] = useState(car?.engineSize || '2.0 가솔린 (4기통)');
  const [licensePlate, setLicensePlate] = useState(car?.licensePlate || '123가 4567');
  const [resetConsumables, setResetConsumables] = useState(false);

  if (!isOpen) return null;

  const handleSelectPreset = (p: CarPreset) => {
    setName(p.name);
    setYear(p.year);
    setKm(p.baseKm);
    setFuelType(p.fuelType);
    setCategory(p.category);
    setBrandType(p.brandType);
    setEngineSize(p.engineSize);
    setResetConsumables(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(
      {
        name: name.trim(),
        year: Number(year),
        km: Number(km),
        fuelType,
        category,
        brandType,
        engineSize: engineSize.trim(),
        licensePlate: licensePlate.trim(),
      },
      resetConsumables
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 my-8">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
              <CarIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                {car ? '내 차 정보 및 주행거리 설정' : '신규 차량 등록'}
              </h3>
              <p className="text-xs text-slate-500">
                차종에 맞게 부품 비용과 정비 공임비가 실시간 자동 계산됩니다
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Car Presets */}
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-700 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              대표 차종 원클릭 선택 (프리셋):
            </span>
            <span className="text-[11px] text-blue-600 font-medium">
              선택 시 권장 부품·공임 즉시 변경
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto pr-1">
            {CAR_PRESETS.map((p) => {
              const isSelected = name === p.name;
              return (
                <button
                  type="button"
                  key={p.id}
                  onClick={() => handleSelectPreset(p)}
                  className={`text-left p-2.5 rounded-xl border text-xs transition-all ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50 text-blue-900 font-medium shadow-xs ring-1 ring-blue-500'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold truncate">{p.name}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5 truncate">
                    {p.badge} · {p.brandType}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                차량 모델명 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="예: 현대 쏘나타 DN8, BMW 520i"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                차량 연식 (제작년도) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                required
                min={1990}
                max={2030}
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                현재 주행거리 (km) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                required
                min={0}
                value={km}
                onChange={(e) => setKm(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                차량 번호 (선택)
              </label>
              <input
                type="text"
                value={licensePlate}
                onChange={(e) => setLicensePlate(e.target.value)}
                placeholder="예: 123가 4567"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                연료 및 구동계 (유종)
              </label>
              <select
                value={fuelType}
                onChange={(e) => setFuelType(e.target.value as FuelType)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
              >
                <option value="gasoline">가솔린 (휘발유)</option>
                <option value="diesel">디젤 (경유, DPF/C3/연료필터 필수)</option>
                <option value="hybrid">하이브리드 (HEV/PHEV)</option>
                <option value="ev">순수 전기차 (EV - 엔진오일 없음/감속기오일)</option>
                <option value="lpg">LPG (가스)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                차량 분류 및 정비 공임 체계
              </label>
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as VehicleCategory)}
                  className="px-2.5 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="compact">경차/준중형</option>
                  <option value="midsize">중형/준대형</option>
                  <option value="suv">SUV/RV</option>
                  <option value="luxury">국산 프리미엄(제네시스)</option>
                  <option value="import">수입차 (공임 할증)</option>
                  <option value="ev">전기차 전용</option>
                </select>
                <select
                  value={brandType}
                  onChange={(e) => setBrandType(e.target.value as '국산' | '수입')}
                  className="px-2.5 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="국산">국산차</option>
                  <option value="수입">수입차 (독일/미국/일본)</option>
                </select>
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                엔진 / 모터 / 배기량 세부 정보
              </label>
              <input
                type="text"
                value={engineSize}
                onChange={(e) => setEngineSize(e.target.value)}
                placeholder="예: 2.0 스마트스트림 4.3L, 2.2 디젤 6.5L, 듀얼모터 AWD 등"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="p-3 bg-blue-50 rounded-xl border border-blue-200">
            <label className="flex items-start gap-2.5 text-xs text-slate-800 cursor-pointer">
              <input
                type="checkbox"
                checked={resetConsumables}
                onChange={(e) => setResetConsumables(e.target.checked)}
                className="mt-0.5 rounded text-blue-600 focus:ring-blue-500"
              />
              <div>
                <span className="font-semibold text-blue-950">
                  이 차량에 맞는 권장 소모품 목록으로 소모품 관리 탭을 자동 재설정합니다.
                </span>
                <p className="text-[11px] text-blue-700 mt-0.5">
                  (전기차 선택 시 엔진오일/점화플러그가 제외되고 감속기 오일·절연 냉각수가 추가되며, 디젤 선택 시 연료필터가 추가됩니다)
                </p>
              </div>
            </label>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs sm:text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs sm:text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md shadow-blue-500/20 transition-colors"
            >
              저장 및 견적 재산출
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
