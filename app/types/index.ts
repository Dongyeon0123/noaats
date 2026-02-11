export interface CommuteInfo {
  distance: number; // km
  workDaysPerMonth: number;
  publicTransportCost: number; // 편도 비용
  publicTransportTime: number; // 편도 시간 (분)
  carTime: number; // 편도 시간 (분)
}

export interface CarCosts {
  purchasePrice: number; // 차량 구매가
  fuelEfficiency: number; // km/L
  fuelPrice: number; // 원/L
  insurance: number; // 연간 보험료
  tax: number; // 연간 세금
  parkingFee: number; // 월 주차비
  tollFee: number; // 편도 통행료
  maintenanceFee: number; // 연간 정비비
  depreciationYears: number; // 감가상각 기간
  currentCarValue?: number; // 현재 보유 차량 시세 (선택)
}

export interface TimeValue {
  hourlyWage: number; // 시간당 가치 (원)
}

export interface CalculationResult {
  publicTransport: {
    monthlyCost: number;
    yearlyCost: number;
    timeSpent: number; // 월 시간 (시간)
    timeCost: number; // 시간 기회비용
    totalMonthlyCost: number;
  };
  car: {
    monthlyCost: number;
    yearlyCost: number;
    timeSpent: number;
    timeCost: number;
    totalMonthlyCost: number;
    breakdown: {
      depreciation: number;
      fuel: number;
      insurance: number;
      tax: number;
      parking: number;
      toll: number;
      maintenance: number;
    };
  };
  breakEvenMonths: number; // 손익분기점 (개월)
  recommendation: 'car' | 'publicTransport' | 'similar';
}
