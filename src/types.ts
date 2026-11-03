export type FuelType = 'gasoline' | 'diesel' | 'hybrid' | 'ev' | 'lpg';
export type VehicleCategory = 'compact' | 'midsize' | 'suv' | 'luxury' | 'import' | 'ev';

export interface Car {
  name: string;
  year: number;
  km: number;
  fuelType: FuelType;
  category: VehicleCategory;
  engineSize?: string;
  brandType?: '국산' | '수입';
  licensePlate?: string;
}

export interface ConsumableItem {
  id: string;
  name: string;
  icon: string;
  lastKm: number;
  interval: number;
  lastDate?: string;
  intervalMonths?: number;
  expectedCost?: number;
  note?: string;
}

export interface MaintenanceLog {
  id: string;
  item: string;
  date: string;
  km: number;
  cost: number;
  memo: string;
  category?: string;
}

export interface EstimateItem {
  name: string;
  icon: string;
  unit: string;
  partCostMin: number;
  partCostMax: number;
  laborCostMin: number;
  laborCostMax: number;
  recommendedIntervalKm: number;
  recommendedIntervalMonths?: number;
  brandRecommendation: string;
  difficulty: 'DIY 가능' | '일반 정비소' | '전문 장비 필요' | string;
  tip: string;
  laborReason?: string;
  isEvSpecific?: boolean;
}

export interface SuspectedCause {
  title: string;
  probability: number;
  description: string;
  relatedPart: string;
}

export interface MechanicGuide {
  checklist: string[];
  estimatedCostRange: string;
  keyQuestionToAsk: string;
}

export interface DiagnosisResult {
  severity: 'EMERGENCY' | 'WARNING' | 'INSPECTION';
  severityLabel: string;
  summary: string;
  visualFindings: string;
  suspectedCauses: SuspectedCause[];
  immediateActions: string[];
  mechanicGuide: MechanicGuide;
  canDrive: boolean;
}

export interface DiagnosisHistoryItem {
  id: string;
  timestamp: string;
  carName: string;
  symptom: string;
  situation: string;
  imageUrl?: string;
  result: DiagnosisResult;
}
