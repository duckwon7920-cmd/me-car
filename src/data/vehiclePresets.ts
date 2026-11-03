import { Car, EstimateItem, ConsumableItem } from '../types';

export interface CarPreset {
  id: string;
  name: string;
  year: number;
  category: Car['category'];
  fuelType: Car['fuelType'];
  engineSize: string;
  brandType: '국산' | '수입';
  badge: string;
  description: string;
  baseKm: number;
}

export const CAR_PRESETS: CarPreset[] = [
  {
    id: 'sonata_dn8',
    name: '현대 쏘나타 DN8',
    year: 2021,
    category: 'midsize',
    fuelType: 'gasoline',
    engineSize: '2.0 가솔린 (4기통, 4.3L)',
    brandType: '국산',
    badge: '국산 중형 세단',
    description: '대한민국 표준 패밀리 세단, 모비스 순정 부품 접근성 우수',
    baseKm: 52300,
  },
  {
    id: 'avante_cn7',
    name: '현대 아반떼 CN7',
    year: 2022,
    category: 'compact',
    fuelType: 'gasoline',
    engineSize: '1.6 가솔린 (4기통, 3.8L)',
    brandType: '국산',
    badge: '국산 준중형',
    description: '가장 대중적이고 경제적인 정비 비용, 부품/공임 최저 수준',
    baseKm: 34000,
  },
  {
    id: 'sorento_hev',
    name: '기아 쏘렌토 하이브리드',
    year: 2022,
    category: 'suv',
    fuelType: 'hybrid',
    engineSize: '1.6 터보 하이브리드 (4.8L)',
    brandType: '국산',
    badge: '국산 하이브리드 SUV',
    description: '엔진+모터 복합 시스템, 회생제동으로 브레이크 패드 수명 연장',
    baseKm: 48000,
  },
  {
    id: 'carnival_diesel',
    name: '기아 카니발 2.2 디젤',
    year: 2020,
    category: 'suv',
    fuelType: 'diesel',
    engineSize: '2.2 디젤 (6.5L, C2/C3 DPF)',
    brandType: '국산',
    badge: '국산 대형 디젤 RV',
    description: '오일 용량 6.5L 대용량, DPF 전용 C3 오일 및 연료필터 주기적 교체 필수',
    baseKm: 76000,
  },
  {
    id: 'genesis_g80',
    name: '제네시스 G80 RG3',
    year: 2022,
    category: 'luxury',
    fuelType: 'gasoline',
    engineSize: '2.5 터보 (6.2L 0W-30 SP)',
    brandType: '국산',
    badge: '국산 프리미엄 럭셔리',
    description: '제네시스 전용 공임, 대구경 브레이크, 19~20인치 고성능 타이어',
    baseKm: 41000,
  },
  {
    id: 'bmw_520i',
    name: 'BMW 5시리즈 (G30 520i)',
    year: 2021,
    category: 'import',
    fuelType: 'gasoline',
    engineSize: '2.0 싱글터보 (5.25L, LL-01/LL-04)',
    brandType: '수입',
    badge: '독일 수입 프리미엄',
    description: '수입차 공임 할증(1.8~2.2x), 패드 마모 센서 필수 교체, 코딩 필요',
    baseKm: 58000,
  },
  {
    id: 'benz_eclass',
    name: '메르세데스-벤츠 E-Class E250',
    year: 2021,
    category: 'import',
    fuelType: 'gasoline',
    engineSize: '2.0 터보 (6.0L, MB229.51/52)',
    brandType: '수입',
    badge: '독일 수입 프리미엄',
    description: '전용 규격 합성유 6L+, 전자식 캘리퍼 해제 공임, 런플랫 타이어',
    baseKm: 49000,
  },
  {
    id: 'tesla_modely',
    name: '테슬라 모델 Y Long Range',
    year: 2022,
    category: 'ev',
    fuelType: 'ev',
    engineSize: '듀얼 모터 AWD (전기차)',
    brandType: '수입',
    badge: '순수 전기차 (EV)',
    description: '엔진오일·점화플러그 불필요! 감속기 오일, EV 전용 고하중 타이어, 헤파 필터',
    baseKm: 38000,
  },
  {
    id: 'ioniq5_ev',
    name: '현대 아이오닉 5 롱레인지',
    year: 2022,
    category: 'ev',
    fuelType: 'ev',
    engineSize: '후륜 싱글 모터 160kW (전기차)',
    brandType: '국산',
    badge: '국산 전용 전기차',
    description: '오일 없음, 저전도(절연형) 냉각수 주기 점검, EV 흡음재 타이어 장착',
    baseKm: 45000,
  },
  {
    id: 'casper_gasoline',
    name: '현대 캐스퍼 1.0',
    year: 2023,
    category: 'compact',
    fuelType: 'gasoline',
    engineSize: '1.0 스마트스트림 (3.1L)',
    brandType: '국산',
    badge: '국산 경차',
    description: '소형 엔진 3.1L, 15~17인치 타이어, 정비 비용 전국 최저가 수준',
    baseKm: 21000,
  },
];

export function getDefaultCar(): Car {
  const p = CAR_PRESETS[0];
  return {
    name: p.name,
    year: p.year,
    km: p.baseKm,
    fuelType: p.fuelType,
    category: p.category,
    engineSize: p.engineSize,
    brandType: p.brandType,
    licensePlate: '123가 4567',
  };
}

export function getDefaultConsumablesForCar(car: Car): ConsumableItem[] {
  const km = car.km || 50000;
  const isEv = car.fuelType === 'ev' || car.category === 'ev';

  if (isEv) {
    return [
      {
        id: 'c_ev_tire',
        name: 'EV 전용 타이어',
        icon: '🛞',
        lastKm: Math.max(0, km - 24000),
        interval: 45000,
        intervalMonths: 36,
        note: '전기차 고하중 및 순간 토크 대응 특화 타이어',
      },
      {
        id: 'c_ev_filter',
        name: '에어컨/헤파 필터',
        icon: '🌬️',
        lastKm: Math.max(0, km - 9000),
        interval: 15000,
        intervalMonths: 12,
        note: '초미세먼지 차단 헤파 캐빈 필터',
      },
      {
        id: 'c_ev_brake_fluid',
        name: '브레이크액 (DOT4)',
        icon: '💧',
        lastKm: Math.max(0, km - 32000),
        interval: 40000,
        intervalMonths: 24,
        note: '수분도 3% 이상 시 베이퍼 록 방지를 위해 교환',
      },
      {
        id: 'c_ev_pad',
        name: '브레이크 패드',
        icon: '🛑',
        lastKm: Math.max(0, km - 40000),
        interval: 70000,
        intervalMonths: 48,
        note: '회생제동으로 인해 내연기관 대비 수명이 1.5~2배 깁니다',
      },
      {
        id: 'c_ev_reducer',
        name: '감속기 오일',
        icon: '⚙️',
        lastKm: Math.max(0, km - 20000),
        interval: 80000,
        intervalMonths: 60,
        note: '전기모터 동력 전달 감속기 윤활유',
      },
      {
        id: 'c_ev_coolant',
        name: '절연형(저전도) 냉각수',
        icon: '🧊',
        lastKm: Math.max(0, km - 30000),
        interval: 60000,
        intervalMonths: 48,
        note: '고전압 배터리 팩 순환 안전 절연 냉각수',
      },
      {
        id: 'c_ev_12v',
        name: '12V 보조 배터리',
        icon: '🔋',
        lastKm: Math.max(0, km - 35000),
        interval: 50000,
        intervalMonths: 36,
        note: '전장 제어 및 도어/컴퓨터 구동 보조 배터리',
      },
    ];
  }

  // Non-EV (Gasoline, Diesel, Hybrid, LPG)
  const isDiesel = car.fuelType === 'diesel';
  const isHybrid = car.fuelType === 'hybrid';
  const isImport = car.brandType === '수입';
  const isLuxury = car.category === 'luxury' || isImport;

  const items: ConsumableItem[] = [
    {
      id: 'c_engine_oil',
      name: '엔진오일 세트 (오일+필터+에어크리너)',
      icon: '🛢️',
      lastKm: Math.max(0, km - 6500),
      interval: isImport ? 12000 : 10000,
      intervalMonths: 12,
      note: isDiesel
        ? 'C2/C3 DPF 규격 전용 합성유'
        : isLuxury
        ? '0W-20/0W-30 고급 롱라이프 규격'
        : 'API SP / ILSAC GF-6 규격',
    },
    {
      id: 'c_tire',
      name: '타이어 (4본)',
      icon: '🛞',
      lastKm: Math.max(0, km - 28000),
      interval: 50000,
      intervalMonths: 48,
      note: isLuxury ? '19~21인치 고성능/사계절' : '16~18인치 컴포트 사계절',
    },
    {
      id: 'c_cabin_filter',
      name: '에어컨/히터 필터',
      icon: '🌬️',
      lastKm: Math.max(0, km - 8000),
      interval: 12000,
      intervalMonths: 6,
      note: '활성탄 PM2.5 항균 필터 (봄/가을 권장)',
    },
    {
      id: 'c_brake_pad',
      name: '브레이크 패드 (전륜)',
      icon: '🛑',
      lastKm: Math.max(0, km - 22000),
      interval: isHybrid ? 60000 : 40000,
      intervalMonths: 36,
      note: isImport ? '패드 마모 센서 동시 교환' : '마모 한계선 3mm 이하 시 즉시 교환',
    },
    {
      id: 'c_brake_fluid',
      name: '브레이크액 (DOT4)',
      icon: '💧',
      lastKm: Math.max(0, km - 31000),
      interval: 40000,
      intervalMonths: 24,
      note: '끓는점 저하 및 수분 함량 3% 초과 방지',
    },
    {
      id: 'c_battery',
      name: '시동 배터리 (12V)',
      icon: '🔋',
      lastKm: Math.max(0, km - 35000),
      interval: 50000,
      intervalMonths: 36,
      note: isLuxury || isImport || isDiesel ? 'AGM 80~105Ah 대용량' : '일반/EFB 60~80Ah',
    },
    {
      id: 'c_trans_fluid',
      name: '변속기(미션) 오일',
      icon: '⚙️',
      lastKm: Math.max(0, km - 45000),
      interval: 80000,
      intervalMonths: 60,
      note: isImport ? 'ZF 8단 / 벤츠 9G 전용 순환식' : '자동 6단/8단 및 DCT 전용 오일',
    },
  ];

  if (isDiesel) {
    items.push({
      id: 'c_fuel_filter',
      name: '연료 필터 (디젤)',
      icon: '⛽',
      lastKm: Math.max(0, km - 25000),
      interval: 40000,
      intervalMonths: 24,
      note: '수분 분리 및 고압펌프/인젝터 보호 핵심 소모품',
    });
  } else {
    items.push({
      id: 'c_spark_plug',
      name: '점화플러그 세트',
      icon: '⚡',
      lastKm: Math.max(0, km - 50000),
      interval: 80000,
      intervalMonths: 60,
      note: '이리듐/백금 플러그 (실린더 개수별 1세트)',
    });
  }

  return items;
}

/**
 * Calculates vehicle-specific parts cost and labor costs tailored to the car!
 */
export function calculateCarEstimates(car: Car): EstimateItem[] {
  const isEv = car.fuelType === 'ev' || car.category === 'ev';
  const isImport = car.brandType === '수입';
  const isLuxury = car.category === 'luxury' || isImport;
  const isDiesel = car.fuelType === 'diesel';
  const isCompact = car.category === 'compact';

  // Cost multipliers based on vehicle category
  let partMult = 1.0;
  let laborMult = 1.0;

  if (isCompact) {
    partMult = 0.75;
    laborMult = 0.85;
  } else if (car.category === 'midsize') {
    partMult = 1.0;
    laborMult = 1.0;
  } else if (car.category === 'suv') {
    partMult = 1.15;
    laborMult = 1.1;
  } else if (car.category === 'luxury') {
    partMult = 1.65;
    laborMult = 1.5;
  } else if (isImport) {
    partMult = 2.2;
    laborMult = 2.1;
  }

  // EV estimates
  if (isEv) {
    return [
      {
        name: 'EV 전용 타이어',
        icon: '🛞',
        unit: '1본(개당) 기준',
        partCostMin: Math.round(isImport ? 230000 : 170000),
        partCostMax: Math.round(isImport ? 380000 : 260000),
        laborCostMin: Math.round(20000 * (isImport ? 1.5 : 1)),
        laborCostMax: Math.round(35000 * (isImport ? 1.5 : 1)),
        recommendedIntervalKm: 45000,
        recommendedIntervalMonths: 36,
        brandRecommendation: isImport ? '미쉐린 e-프라이머시 / 피렐리 일렉트' : '한국타이어 iON evo / 금호 마제스티9 EV',
        difficulty: '일반 정비소',
        tip: '전기차는 순간 토크와 배터리 무게로 타이어 마모가 빠르며, 흡음재(사운드 컴포트 폼)가 들어간 EV 전용 규격을 장착해야 소음이 적습니다.',
        laborReason: '공기압 TPMS 센서 이식 및 휠 밸런스 점검 공임 포함',
        isEvSpecific: true,
      },
      {
        name: '에어컨 / 헤파 캐빈 필터',
        icon: '🌬️',
        unit: '1개 기준',
        partCostMin: Math.round(isImport ? 35000 : 20000),
        partCostMax: Math.round(isImport ? 75000 : 45000),
        laborCostMin: isImport ? 15000 : 0,
        laborCostMax: isImport ? 35000 : 15000,
        recommendedIntervalKm: 15000,
        recommendedIntervalMonths: 12,
        brandRecommendation: isImport ? '만필터(Mann) 프리셔스플러스 / 순정 헤파' : '모비스 순정 프리미엄 활성탄 필터',
        difficulty: 'DIY 가능',
        tip: '테슬라의 경우 글러브박스 하부 탈거 난이도가 있어 자가 교체 시 T20 별렌치가 필요하며, 쾌적한 실내 공기를 위해 1년마다 교체하세요.',
        laborReason: isImport ? '수입차 트림 탈거 및 협소 공간 공임' : '기본 카센터 장착 공임 또는 DIY 무료',
        isEvSpecific: true,
      },
      {
        name: '브레이크 패드 (전륜)',
        icon: '🛑',
        unit: '전륜 1축 기준',
        partCostMin: Math.round(isImport ? 120000 : 70000),
        partCostMax: Math.round(isImport ? 240000 : 130000),
        laborCostMin: Math.round(40000 * (isImport ? 1.8 : 1)),
        laborCostMax: Math.round(75000 * (isImport ? 1.8 : 1)),
        recommendedIntervalKm: 70000,
        recommendedIntervalMonths: 48,
        brandRecommendation: isImport ? '브렘보 / 페로도 저소음 패드' : '모비스 순정 / 상신 하드론 저소음',
        difficulty: '일반 정비소',
        tip: '전기차는 회생제동 덕분에 패드 수명이 7만~10만km로 길지만, 디스크 녹 발생 및 캘리퍼 고착 방지를 위해 정기적인 분진 세척과 점검이 필수입니다.',
        laborReason: '전자식 주차 브레이크(EPB) 진단기 해제 모드 및 캘리퍼 세척 공임',
        isEvSpecific: true,
      },
      {
        name: '브레이크액 (DOT4 LV)',
        icon: '💧',
        unit: '1회 순환식 교환',
        partCostMin: Math.round(isImport ? 35000 : 25000),
        partCostMax: Math.round(isImport ? 65000 : 45000),
        laborCostMin: Math.round(45000 * (isImport ? 1.6 : 1)),
        laborCostMax: Math.round(75000 * (isImport ? 1.6 : 1)),
        recommendedIntervalKm: 40000,
        recommendedIntervalMonths: 24,
        brandRecommendation: '보쉬 DOT4 HP / 모튤 DOT 5.1 저점도',
        difficulty: '일반 정비소',
        tip: '회생제동과 전자식 유압 제어 모듈(i-Booster/IEB)이 장착되어 저점도(LV) 규격 브레이크액을 사용하는 것이 시스템 반응성에 유리합니다.',
        laborReason: '4륜 캘리퍼 순환 압력 교환 및 ABS 모듈 에어빼기 작업',
        isEvSpecific: true,
      },
      {
        name: '감속기 오일 (Gear Fluid)',
        icon: '⚙️',
        unit: '1회 교환',
        partCostMin: Math.round(isImport ? 60000 : 40000),
        partCostMax: Math.round(isImport ? 120000 : 75000),
        laborCostMin: Math.round(45000 * (isImport ? 1.7 : 1)),
        laborCostMax: Math.round(85000 * (isImport ? 1.7 : 1)),
        recommendedIntervalKm: 80000,
        recommendedIntervalMonths: 60,
        brandRecommendation: '제조사 순정 감속기 전용유 (EV Gear Fluid)',
        difficulty: '일반 정비소',
        tip: '내연기관 미션오일과 달리 변속 충격은 없으나, 고회전 모터 감속 기어의 마모 쇳가루 배출과 산화 방지를 위해 8만km 전후 교체를 강력 권장합니다.',
        laborReason: '언더커버 탈거 및 드레인/주입 볼트 토크 체결, 레벨링 공임',
        isEvSpecific: true,
      },
      {
        name: '절연형 (저전도) 배터리 냉각수',
        icon: '🧊',
        unit: '1회 순환 교환',
        partCostMin: Math.round(isImport ? 90000 : 65000),
        partCostMax: Math.round(isImport ? 180000 : 120000),
        laborCostMin: Math.round(60000 * (isImport ? 1.6 : 1)),
        laborCostMax: Math.round(110000 * (isImport ? 1.6 : 1)),
        recommendedIntervalKm: 60000,
        recommendedIntervalMonths: 48,
        brandRecommendation: '현대/기아 BSC-2 저전도 순정 냉각수 / 테슬라 순정',
        difficulty: '전문 장비 필요',
        tip: '일반 자동차용 초록색 부동액을 절대로 혼용해서는 안 됩니다! 고전압 누전 방지 특수 비전도성 절연 냉각수를 사용해야 배터리 화재를 예방합니다.',
        laborReason: '전용 진단기를 통한 냉각수 순환 모터 강제 구동 및 공기 배출(진공 주입) 필수',
        isEvSpecific: true,
      },
      {
        name: '12V 저전압 보조 배터리',
        icon: '🔋',
        unit: '1개 기준',
        partCostMin: Math.round(isImport ? 140000 : 95000),
        partCostMax: Math.round(isImport ? 240000 : 155000),
        laborCostMin: Math.round(20000 * (isImport ? 1.5 : 1)),
        laborCostMax: Math.round(40000 * (isImport ? 1.5 : 1)),
        recommendedIntervalKm: 50000,
        recommendedIntervalMonths: 36,
        brandRecommendation: '델코 AGM LN1/LN2 / 로케트 AGM',
        difficulty: 'DIY 가능',
        tip: '전기차 방전의 90% 이상은 메인 고전압 배터리가 아닌 12V 보조 배터리 방전입니다. 3년 주기 교체를 권장합니다.',
        laborReason: '단자 분리, 배터리 트레이 체결 및 BMS 리셋 공임',
        isEvSpecific: true,
      },
    ];
  }

  // Non-EV Vehicles: Standard, Diesel, Luxury, Import
  const items: EstimateItem[] = [
    {
      name: '엔진오일 세트 (오일+필터+에어크리너)',
      icon: '🛢️',
      unit: '1회 교환',
      partCostMin: Math.round(38000 * partMult),
      partCostMax: Math.round(88000 * partMult),
      laborCostMin: Math.round(18000 * laborMult),
      laborCostMax: Math.round(38000 * laborMult),
      recommendedIntervalKm: isImport ? 12000 : 10000,
      recommendedIntervalMonths: 12,
      brandRecommendation: isImport
        ? 'BMW 순정 TwinPower LL-04 / 모빌1 ESP 0W-30'
        : isLuxury
        ? '현대모비스 순정 SP 0W-20 / 쉘 힐릭스 울트라'
        : isDiesel
        ? 'S-OIL 7 골드 C3 / 캐스트롤 마그네틱 DPF'
        : 'Kixx G1 SP 5W-30 / 지크 X7',
      difficulty: '일반 정비소',
      tip: isImport
        ? '독일 수입차는 오일 드레인 시 오일필터 하우징 O링 및 드레인볼트 와셔를 반드시 교체하고 서비스 인터벌 리셋을 수행해야 합니다.'
        : isDiesel
        ? 'DPF가 장착된 디젤 차량은 매연 저감 장치 손상 방지를 위해 반드시 Low-SAPS(C2 또는 C3 규격) 오일을 주입해야 합니다.'
        : isLuxury
        ? '터보 및 대배기량 엔진은 고온 산화 안정성이 높은 100% 합성유를 권장하며 용량(6L 내외)을 사전 확인하세요.'
        : '오일 교체 시 에어크리너 필터와 캔/오일필터를 세트로 함께 교체하는 것이 가장 경제적입니다.',
      laborReason: isImport
        ? '수입차 하부 언더커버 다수 볼트 탈착 및 전용 진단기 리셋 공임 포함'
        : '리프트 상차, 폐오일 자유낙하/잔유제거, 필터 체결 공임',
    },
    {
      name: '타이어 (사계절 컴포트/고성능)',
      icon: '🛞',
      unit: '1본(개당) 기준',
      partCostMin: Math.round(75000 * partMult),
      partCostMax: Math.round(210000 * partMult),
      laborCostMin: Math.round(12000 * laborMult),
      laborCostMax: Math.round(26000 * laborMult),
      recommendedIntervalKm: 50000,
      recommendedIntervalMonths: 48,
      brandRecommendation: isImport || isLuxury
        ? '미쉐린 프라이머시 투어 A/S / 피렐리 P ZERO / 콘티넨탈 DWS06+'
        : '한국타이어 벤투스 S2 AS / 금호타이어 마제스티9 / 넥센 엔페라',
      difficulty: '일반 정비소',
      tip: isImport
        ? '런플랫(Run-flat) 타이어 장착 차량은 전용 탈착 장비가 있는 전문점에서 교체해야 휠 스크래치를 방지할 수 있습니다.'
        : '타이어 2본 교체 시 새 타이어를 후륜에 장착하는 것이 빗길 오버스티어(스핀) 방지에 더 안전합니다.',
      laborReason: '타이어 탈착, 신품 비드 결합, 고속 휠 밸런스 교정 공임',
    },
    {
      name: '브레이크 패드 (전륜 세트)',
      icon: '🛑',
      unit: '전륜 좌/우 1축 세트',
      partCostMin: Math.round(42000 * partMult),
      partCostMax: Math.round(115000 * partMult),
      laborCostMin: Math.round(30000 * laborMult),
      laborCostMax: Math.round(65000 * laborMult),
      recommendedIntervalKm: 40000,
      recommendedIntervalMonths: 36,
      brandRecommendation: isImport
        ? '텍스타(Textar) / 짐머만 / TRW / 브렘보'
        : isLuxury
        ? '순정 4P/모노블럭 패드 / 상신 하드론 프리미엄'
        : '상신 Hi-Q / 현대모비스 순정품',
      difficulty: '일반 정비소',
      tip: isImport
        ? '수입차는 패드와 함께 마모 감지 전자 센서(약 1.5만~3만원)를 별도 구매하여 함께 교체해야 경고등이 소등됩니다.'
        : '패드 잔여 두께가 3mm 이하이거나 제동 시 날카로운 금속음이 나면 디스크 손상 방지를 위해 즉시 교환하세요.',
      laborReason: '피스톤 리턴 압축, 가이드 핀 그리스 도포, 소음 방지 씸 장착 공임',
    },
    {
      name: '브레이크액 (DOT4)',
      icon: '💧',
      unit: '1회 순환식 교환',
      partCostMin: Math.round(16000 * partMult),
      partCostMax: Math.round(38000 * partMult),
      laborCostMin: Math.round(35000 * laborMult),
      laborCostMax: Math.round(65000 * laborMult),
      recommendedIntervalKm: 40000,
      recommendedIntervalMonths: 24,
      brandRecommendation: '보쉬 DOT4 HP / 모비스 순정 DOT4 / 페트로나스',
      difficulty: '일반 정비소',
      tip: '브레이크액은 공기 중 수분을 흡수하는 성질이 강합니다. 수분도가 3%를 넘으면 고속 제동 시 베이퍼 록(페달 스펀지 현상) 위험이 급증합니다.',
      laborReason: '전용 가압 순환 장비를 이용한 4륜 에어빼기 및 폐액 완전 배출 작업',
    },
    {
      name: '에어컨/히터 캐빈 필터',
      icon: '🌬️',
      unit: '1개 기준',
      partCostMin: Math.round(12000 * partMult),
      partCostMax: Math.round(38000 * partMult),
      laborCostMin: isImport ? 15000 : 0,
      laborCostMax: isImport ? 35000 : 12000,
      recommendedIntervalKm: 15000,
      recommendedIntervalMonths: 6,
      brandRecommendation: isImport ? '만필터(Mann) / 말레(Mahle) 활성탄' : '모비스 순정 / 루프트 헤파 항균 필터',
      difficulty: isImport ? '일반 정비소' : 'DIY 가능',
      tip: isImport
        ? '수입차(BMW/벤츠)는 조수석 하부 트림과 볼트를 분해해야 하므로 자가 교체 난이도가 높은 편입니다.'
        : '국산차는 대부분 글러브박스를 열고 손쉽게 직접 교체(DIY)할 수 있어 공임 1만원 이상을 아낄 수 있습니다.',
      laborReason: isImport ? '언더패널 볼트 탈거 및 센서 하네스 분리 공임' : '카센터 기본 장착 공임',
    },
    {
      name: '시동 배터리 (12V)',
      icon: '🔋',
      unit: '1개 기준',
      partCostMin: Math.round(95000 * partMult),
      partCostMax: Math.round(220000 * partMult),
      laborCostMin: Math.round(12000 * laborMult),
      laborCostMax: Math.round(30000 * laborMult),
      recommendedIntervalKm: 50000,
      recommendedIntervalMonths: 36,
      brandRecommendation: isImport || isLuxury || isDiesel
        ? '바르타(VARTA) AGM / 델코 AGM 80~105Ah'
        : '로케트 GB / 델코 DF 60~80Ah',
      difficulty: 'DIY 가능',
      tip: isImport
        ? '배터리 교체 후 전용 진단기를 연결하여 신품 배터리 등록 코딩(IBS 초기화)을 거쳐야 충전 제어가 정상 작동합니다.'
        : 'ISG(오토 스탑 앤 고) 기능이 탑재된 차량은 일반 납산 배터리 대신 반드시 AGM 배터리를 장착해야 방전되지 않습니다.',
      laborReason: isImport ? '배터리 고정 브래킷 및 진단기 IBS 코딩/어댑테이션 공임' : '기본 단자 탈부착 공임',
    },
    {
      name: '자동 변속기(미션) 오일',
      icon: '⚙️',
      unit: '1회 순환식 교환',
      partCostMin: Math.round(80000 * partMult),
      partCostMax: Math.round(195000 * partMult),
      laborCostMin: Math.round(55000 * laborMult),
      laborCostMax: Math.round(135000 * laborMult),
      recommendedIntervalKm: 80000,
      recommendedIntervalMonths: 60,
      brandRecommendation: isImport
        ? 'ZF 순정 LifeguardFluid 8 / 벤츠 순정 ATF'
        : '모비스 순정 SP-IV / 캐스트롤 트랜스맥스',
      difficulty: '전문 장비 필요',
      tip: isImport
        ? 'ZF 8단 미션은 오일팬 내부에 자석과 필터가 일체형으로 되어 있어 오일 교체 시 미션 오일팬 어셈블리를 통째로 교환해야 합니다.'
        : '무교환(Lifetime) 오일이라고 안내되는 경우가 많으나, 8만~10만km 주행 시 변속 슬립 및 밸브바디 고장 예방을 위해 교체를 권장합니다.',
      laborReason: '오일 온도 40~50도 기준 레벨링 및 전용 아답터 순환 장비 작업',
    },
  ];

  if (isDiesel) {
    items.push({
      name: '디젤 연료 필터 (카트리지/앗세이)',
      icon: '⛽',
      unit: '1회 교환',
      partCostMin: Math.round(35000 * partMult),
      partCostMax: Math.round(85000 * partMult),
      laborCostMin: Math.round(25000 * laborMult),
      laborCostMax: Math.round(55000 * laborMult),
      recommendedIntervalKm: 40000,
      recommendedIntervalMonths: 24,
      brandRecommendation: isImport ? '보쉬(Bosch) / 말레(Mahle)' : '모비스 순정 디젤 연료필터 카트리지',
      difficulty: '일반 정비소',
      tip: '겨울철 연료 속 수분이 얼어붙어 시동 불능이 발생하거나 쇳가루가 고압펌프와 인젝터로 넘어가 수백만원대 수리비가 나오는 것을 막는 필수 부품입니다.',
      laborReason: '엔진룸 흡기 덕트/배터리 탈착 및 교체 후 에어빼기(프라이밍) 작업',
    });
  } else {
    items.push({
      name: '점화플러그 세트',
      icon: '⚡',
      unit: '1세트(엔진 실린더 기준)',
      partCostMin: Math.round(32000 * partMult),
      partCostMax: Math.round(110000 * partMult),
      laborCostMin: Math.round(30000 * laborMult),
      laborCostMax: Math.round(85000 * laborMult),
      recommendedIntervalKm: 80000,
      recommendedIntervalMonths: 60,
      brandRecommendation: isImport ? 'NGK 레이저 이리듐 / 보쉬 더블이리듐' : '모비스 순정 이리듐 플러그',
      difficulty: '일반 정비소',
      tip: isLuxury
        ? 'V6/V8 엔진의 경우 흡기 매니폴드(서지탱크)를 완전히 분해해야 안쪽 뱅크 플러그 교체가 가능하여 공임이 2~3배 높습니다.'
        : '플러그 마모 시 실화(Misfire)가 발생하여 엔진 부조와 연비 저하, 촉매 손상을 유발하므로 8만km 전후 교체를 권장합니다.',
      laborReason: '점화코일 분리, 토크렌치를 이용한 규정 토크 체결 공임',
    });
  }

  return items;
}

// Visual sample inspection photos (SVG data URLs) for instantaneous testing of the AI multimodal vision feature
export const SAMPLE_DIAGNOSIS_CASES = [
  {
    title: '계기판 엔진 경고등 점등',
    symptom: '주행 중 계기판에 노란색 엔진 체크(Check Engine) 경고등이 켜졌고, 가속 페달을 밟아도 반응이 둔하고 출력이 저하됩니다.',
    situation: '고속도로 주행 중 가속할 때',
    photoLabel: '노란색 엔진 경고등 계기판',
    // Realistic SVG data URL of instrument cluster showing yellow check engine MIL icon
    photoDataUrl: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"><rect width="600" height="400" fill="%230c1017"/><circle cx="300" cy="200" r="160" fill="none" stroke="%231e293b" stroke-width="8"/><text x="300" y="110" font-family="sans-serif" font-size="28" fill="%2364748b" text-anchor="middle">INSTRUMENT CLUSTER</text><g transform="translate(230, 160) scale(1.6)"><path d="M12 4h16c1.1 0 2 .9 2 2v2h4v8h-4v2c0 1.1-.9 2-2 2H12c-1.1 0-2-.9-2-2v-2H6v-8h4V6c0-1.1.9-2 2-2z" fill="%23eab308"/><path d="M16 10h8v8h-8z" fill="%230c1017"/><path d="M18 12h4v4h-4z" fill="%23eab308"/></g><text x="300" y="270" font-family="sans-serif" font-weight="bold" font-size="20" fill="%23eab308" text-anchor="middle">CHECK ENGINE (MIL ON)</text><text x="300" y="310" font-family="sans-serif" font-size="14" fill="%2394a3b8" text-anchor="middle">ODO: 52,300 km · DTC CODE ACTIVE</text></svg>`,
  },
  {
    title: '타이어 마모 한계선 초과 & 편마모',
    symptom: '비 오는 날 맨홀 뚜껑이나 차선을 밟으면 차가 미끄러집니다. 타이어 바깥쪽 홈이 거의 안 보이고 편마모가 심합니다.',
    situation: '우천 시 주행 및 조향 시',
    photoLabel: '타이어 트레드 마모 상태',
    photoDataUrl: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"><rect width="600" height="400" fill="%23111827"/><rect x="80" y="60" width="440" height="280" rx="20" fill="%231f2937" stroke="%23374151" stroke-width="4"/><path d="M140 100v200M220 100v200M300 100v200M380 100v200" stroke="%23111827" stroke-width="24" stroke-linecap="round"/><circle cx="380" cy="200" r="16" fill="%23ef4444"/><text x="300" y="375" font-family="sans-serif" font-weight="bold" font-size="16" fill="%23f87171" text-anchor="middle">타이어 마모 한계선(1.6mm) 도달 및 편마모 감지</text><text x="300" y="45" font-family="sans-serif" font-size="16" fill="%2394a3b8" text-anchor="middle">TIRE TREAD INSPECTION PHOTO</text></svg>`,
  },
  {
    title: '제동 시 쇠 긁는 소음 & 브레이크 패드 마모',
    symptom: '신호 대기나 서행 중 브레이크를 밟으면 끼이익- 또는 쇠와 쇠가 직접 갈리는 서걱거리는 소음이 나며 제동 거리가 늘어났습니다.',
    situation: '브레이크 페달 작동 시',
    photoLabel: '브레이크 로터 & 캘리퍼',
    photoDataUrl: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"><rect width="600" height="400" fill="%230f172a"/><circle cx="280" cy="200" r="140" fill="%23334155" stroke="%23475569" stroke-width="8"/><circle cx="280" cy="200" r="60" fill="%231e293b"/><path d="M380 130c25 35 25 105 0 140l50 20c40-50 40-130 0-180z" fill="%23dc2626"/><text x="440" y="180" font-family="sans-serif" font-weight="bold" font-size="14" fill="%23fca5a5">CALIPER PAD</text><text x="440" y="200" font-family="sans-serif" font-size="12" fill="%23fee2e2">THICKNESS &lt; 2mm</text><text x="300" y="380" font-family="sans-serif" font-size="15" fill="%23f87171" text-anchor="middle">BRAKE ROTOR SCORING &amp; PAD METAL WEAR</text></svg>`,
  },
];
