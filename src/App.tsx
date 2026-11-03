import React, { useState, useEffect } from 'react';
import { Car, ConsumableItem, MaintenanceLog } from './types';
import {
  getDefaultCar,
  getDefaultConsumablesForCar,
  CAR_PRESETS,
} from './data/vehiclePresets';
import { Header } from './components/Header';
import { DashboardTab } from './components/DashboardTab';
import { ItemsTab } from './components/ItemsTab';
import { LogsTab } from './components/LogsTab';
import { CostTab } from './components/CostTab';
import { EstimateTab } from './components/EstimateTab';
import { DiagnosisTab } from './components/DiagnosisTab';
import { CarModal } from './components/CarModal';
import { ItemModal } from './components/ItemModal';
import { LogModal } from './components/LogModal';

const CAR_STORAGE_KEY = 'carcare_v2_car';
const ITEMS_STORAGE_KEY = 'carcare_v2_items';
const LOGS_STORAGE_KEY = 'carcare_v2_logs';

function getInitialCar(): Car {
  try {
    const raw = localStorage.getItem(CAR_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error loading car:', e);
  }
  return getDefaultCar();
}

function getInitialItems(car: Car): ConsumableItem[] {
  try {
    const raw = localStorage.getItem(ITEMS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error('Error loading items:', e);
  }
  return getDefaultConsumablesForCar(car);
}

function getInitialLogs(car: Car): MaintenanceLog[] {
  try {
    const raw = localStorage.getItem(LOGS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.error('Error loading logs:', e);
  }

  // Sample initial records
  const km = car.km || 52000;
  return [
    {
      id: 'log_init_1',
      item: car.fuelType === 'ev' ? 'EV 전용 타이어' : '엔진오일 세트 (오일+필터+에어크리너)',
      date: '2025-10-12',
      km: Math.max(0, km - 5000),
      cost: car.fuelType === 'ev' ? 240000 : 85000,
      memo: car.fuelType === 'ev' ? '전륜 2본 교체 (공임나라)' : '합성유 100% 교환 (공임나라 역삼점)',
    },
    {
      id: 'log_init_2',
      item: '에어컨/히터 필터',
      date: '2025-06-20',
      km: Math.max(0, km - 14000),
      cost: 28000,
      memo: '초미세먼지 활성탄 필터 자가교체(DIY)',
    },
    {
      id: 'log_init_3',
      item: '브레이크액 (DOT4)',
      date: '2025-02-15',
      km: Math.max(0, km - 22000),
      cost: 55000,
      memo: '수분도 3.2% 측정되어 순환식 교환',
    },
    {
      id: 'log_init_4',
      item: '브레이크 패드 (전륜)',
      date: '2024-09-08',
      km: Math.max(0, km - 34000),
      cost: 120000,
      memo: '전륜 좌우 패드 교체',
    },
  ];
}

export default function App() {
  const [car, setCar] = useState<Car>(getInitialCar);
  const [items, setItems] = useState<ConsumableItem[]>(() => getInitialItems(car));
  const [logs, setLogs] = useState<MaintenanceLog[]>(() => getInitialLogs(car));
  const [tab, setTab] = useState<string>('dash');

  // Modals state
  const [isCarModalOpen, setIsCarModalOpen] = useState(false);
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ConsumableItem | null>(null);

  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [editingLog, setEditingLog] = useState<MaintenanceLog | null>(null);
  const [logPreset, setLogPreset] = useState<Partial<MaintenanceLog> | undefined>(undefined);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(CAR_STORAGE_KEY, JSON.stringify(car));
    } catch (e) {}
  }, [car]);

  useEffect(() => {
    try {
      localStorage.setItem(ITEMS_STORAGE_KEY, JSON.stringify(items));
    } catch (e) {}
  }, [items]);

  useEffect(() => {
    try {
      localStorage.setItem(LOGS_STORAGE_KEY, JSON.stringify(logs));
    } catch (e) {}
  }, [logs]);

  // Car operations
  const handleSaveCar = (savedCar: Car, resetConsumables: boolean) => {
    setCar(savedCar);
    if (resetConsumables) {
      setItems(getDefaultConsumablesForCar(savedCar));
    }
  };

  const handleSwitchCarPreset = (presetId: string) => {
    const p = CAR_PRESETS.find((x) => x.id === presetId);
    if (!p) return;
    const newCar: Car = {
      name: p.name,
      year: p.year,
      km: p.baseKm,
      fuelType: p.fuelType,
      category: p.category,
      engineSize: p.engineSize,
      brandType: p.brandType,
      licensePlate: '123가 4567',
    };
    setCar(newCar);
    setItems(getDefaultConsumablesForCar(newCar));
  };

  // Consumable item operations
  const handleSaveItem = (savedItem: ConsumableItem) => {
    setItems((prev) => {
      const exists = prev.some((i) => i.id === savedItem.id);
      if (exists) {
        return prev.map((i) => (i.id === savedItem.id ? savedItem : i));
      }
      return [...prev, savedItem];
    });
  };

  const handleDeleteItem = (id: string) => {
    if (window.confirm('이 소모품 관리 항목을 삭제하시겠습니까?')) {
      setItems((prev) => prev.filter((i) => i.id !== id));
    }
  };

  const handleDoneItem = (itemId: string) => {
    const target = items.find((i) => i.id === itemId);
    if (!target) return;
    setEditingLog(null);
    setLogPreset({
      item: target.name,
      km: car.km,
      cost: 0,
      memo: '소모품 교체 주기 완료',
    });
    setIsLogModalOpen(true);
  };

  const handleResetToVehicleDefault = () => {
    if (
      window.confirm(
        `현재 차량(${car.name})의 추천 표준 소모품 목록으로 다시 설정하시겠습니까? (기존 맞춤 주기가 초기화됩니다)`
      )
    ) {
      setItems(getDefaultConsumablesForCar(car));
    }
  };

  // Log operations
  const handleSaveLog = (savedLog: MaintenanceLog, syncWithConsumable: boolean) => {
    setLogs((prev) => {
      const exists = prev.some((l) => l.id === savedLog.id);
      if (exists) {
        return prev.map((l) => (l.id === savedLog.id ? savedLog : l));
      }
      return [savedLog, ...prev];
    });

    // Update car km if log km is higher
    if (savedLog.km > car.km) {
      setCar((prev) => ({ ...prev, km: savedLog.km }));
    }

    // Sync with consumable item
    if (syncWithConsumable) {
      setItems((prev) =>
        prev.map((item) => {
          if (item.name === savedLog.item || savedLog.item.includes(item.name)) {
            return {
              ...item,
              lastKm: savedLog.km,
              lastDate: savedLog.date,
            };
          }
          return item;
        })
      );
    }
  };

  const handleDeleteLog = (id: string) => {
    if (window.confirm('이 정비 이력을 삭제하시겠습니까?')) {
      setLogs((prev) => prev.filter((l) => l.id !== id));
    }
  };

  const handleAddLogWithEstimate = (item: string, cost: number, memo: string) => {
    setEditingLog(null);
    setLogPreset({
      item,
      km: car.km,
      cost,
      memo,
    });
    setIsLogModalOpen(true);
  };

  // Export / Import
  const handleExport = () => {
    const data = {
      car,
      items,
      logs,
      exportedAt: new Date().toISOString(),
      version: '2.0',
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `carcare_backup_${car.name.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.car && parsed.items && parsed.logs) {
          setCar(parsed.car);
          setItems(parsed.items);
          setLogs(parsed.logs);
          alert('데이터를 성공적으로 복원했습니다!');
        } else {
          alert('올바른 CarCare 백업 파일 형식이 아닙니다.');
        }
      } catch (err) {
        alert('파일을 읽는 중 오류가 발생했습니다.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      <Header
        currentTab={tab}
        onSelectTab={setTab}
        car={car}
        onEditCar={() => setIsCarModalOpen(true)}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {tab === 'dash' && (
          <DashboardTab
            car={car}
            items={items}
            logs={logs}
            onEditCar={() => setIsCarModalOpen(true)}
            onNavigateTab={setTab}
            onDoneItem={handleDoneItem}
            onEditItem={(id) => {
              const item = items.find((i) => i.id === id) || null;
              setEditingItem(item);
              setIsItemModalOpen(true);
            }}
          />
        )}

        {tab === 'items' && (
          <ItemsTab
            car={car}
            items={items}
            onAddItem={() => {
              setEditingItem(null);
              setIsItemModalOpen(true);
            }}
            onEditItem={(id) => {
              const item = items.find((i) => i.id === id) || null;
              setEditingItem(item);
              setIsItemModalOpen(true);
            }}
            onDeleteItem={handleDeleteItem}
            onDoneItem={handleDoneItem}
            onResetToVehicleDefault={handleResetToVehicleDefault}
          />
        )}

        {tab === 'logs' && (
          <LogsTab
            logs={logs}
            onAddLog={() => {
              setEditingLog(null);
              setLogPreset(undefined);
              setIsLogModalOpen(true);
            }}
            onEditLog={(id) => {
              const log = logs.find((l) => l.id === id) || null;
              setEditingLog(log);
              setIsLogModalOpen(true);
            }}
            onDeleteLog={handleDeleteLog}
          />
        )}

        {tab === 'cost' && (
          <CostTab
            logs={logs}
            onExport={handleExport}
            onImport={handleImport}
          />
        )}

        {tab === 'estimate' && (
          <EstimateTab
            car={car}
            onEditCar={() => setIsCarModalOpen(true)}
            onAddLogWithEstimate={handleAddLogWithEstimate}
            onSwitchCarPreset={handleSwitchCarPreset}
          />
        )}

        {tab === 'diagnosis' && (
          <DiagnosisTab
            car={car}
            onAddLogFromDiagnosis={(item, cost, memo) => {
              setEditingLog(null);
              setLogPreset({
                item,
                cost,
                memo,
                km: car.km,
              });
              setIsLogModalOpen(true);
            }}
            onNavigateEstimate={() => setTab('estimate')}
          />
        )}

        {/* Global Footer Disclaimer Notice */}
        <div className="mt-12 p-4 rounded-2xl bg-white border border-slate-200 text-xs text-slate-500 text-center leading-relaxed shadow-xs">
          <p>
            ⚠️ <strong>안내 사항:</strong> 표시된 교체 주기와 예상 정비비는 공임나라 표준 공임 및 시장 시세를 반영한 참고 추정치이며, 차종 세부 트림, 주행 환경, 정비소 현장 상황에 따라 달라질 수 있습니다. 주행 중 심각한 진동, 브레이크 밀림, 연기, 경고등 점멸이 발생하면 즉시 안전한 곳에 정차 후 긴급출동 또는 정비소 점검을 받으시기 바랍니다.
          </p>
        </div>
      </main>

      {/* Modals */}
      <CarModal
        isOpen={isCarModalOpen}
        onClose={() => setIsCarModalOpen(false)}
        car={car}
        onSave={handleSaveCar}
      />

      <ItemModal
        isOpen={isItemModalOpen}
        onClose={() => setIsItemModalOpen(false)}
        item={editingItem}
        currentCarKm={car.km}
        onSave={handleSaveItem}
      />

      <LogModal
        isOpen={isLogModalOpen}
        onClose={() => setIsLogModalOpen(false)}
        log={editingLog}
        items={items}
        currentCarKm={car.km}
        initialPreset={logPreset}
        onSave={handleSaveLog}
      />
    </div>
  );
}
