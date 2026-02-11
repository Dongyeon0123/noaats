import { CommuteInfo, CarCosts, TimeValue, CalculationResult } from '../types';

export function calculateCosts(
  commute: CommuteInfo,
  car: CarCosts,
  timeValue: TimeValue
): CalculationResult {
  // 대중교통 비용 계산
  const publicTransportMonthlyCost = commute.publicTransportCost * 2 * commute.workDaysPerMonth;
  const publicTransportYearlyCost = publicTransportMonthlyCost * 12;
  const publicTransportTimeSpent = (commute.publicTransportTime * 2 * commute.workDaysPerMonth) / 60; // 시간
  const publicTransportTimeCost = publicTransportTimeSpent * timeValue.hourlyWage;
  const publicTransportTotalMonthlyCost = publicTransportMonthlyCost + publicTransportTimeCost;

  // 자동차 비용 계산
  const monthlyDistance = commute.distance * 2 * commute.workDaysPerMonth;
  const fuelCost = (monthlyDistance / car.fuelEfficiency) * car.fuelPrice;
  const tollCost = car.tollFee * 2 * commute.workDaysPerMonth;
  const depreciationMonthly = car.purchasePrice / (car.depreciationYears * 12);
  const insuranceMonthly = car.insurance / 12;
  const taxMonthly = car.tax / 12;
  const maintenanceMonthly = car.maintenanceFee / 12;

  const carMonthlyCost = 
    depreciationMonthly + 
    fuelCost + 
    insuranceMonthly + 
    taxMonthly + 
    car.parkingFee + 
    tollCost + 
    maintenanceMonthly;

  const carYearlyCost = carMonthlyCost * 12;
  const carTimeSpent = (commute.carTime * 2 * commute.workDaysPerMonth) / 60;
  const carTimeCost = carTimeSpent * timeValue.hourlyWage;
  const carTotalMonthlyCost = carMonthlyCost + carTimeCost;

  // 손익분기점 계산 (초기 투자 회수)
  const monthlySavings = publicTransportTotalMonthlyCost - (carMonthlyCost - depreciationMonthly + carTimeCost);
  const breakEvenMonths = monthlySavings > 0 ? car.purchasePrice / monthlySavings : Infinity;

  // 추천
  let recommendation: 'car' | 'publicTransport' | 'similar';
  const difference = Math.abs(carTotalMonthlyCost - publicTransportTotalMonthlyCost);
  if (difference < 50000) {
    recommendation = 'similar';
  } else if (carTotalMonthlyCost < publicTransportTotalMonthlyCost) {
    recommendation = 'car';
  } else {
    recommendation = 'publicTransport';
  }

  return {
    publicTransport: {
      monthlyCost: publicTransportMonthlyCost,
      yearlyCost: publicTransportYearlyCost,
      timeSpent: publicTransportTimeSpent,
      timeCost: publicTransportTimeCost,
      totalMonthlyCost: publicTransportTotalMonthlyCost,
    },
    car: {
      monthlyCost: carMonthlyCost,
      yearlyCost: carYearlyCost,
      timeSpent: carTimeSpent,
      timeCost: carTimeCost,
      totalMonthlyCost: carTotalMonthlyCost,
      breakdown: {
        depreciation: depreciationMonthly,
        fuel: fuelCost,
        insurance: insuranceMonthly,
        tax: taxMonthly,
        parking: car.parkingFee,
        toll: tollCost,
        maintenance: maintenanceMonthly,
      },
    },
    breakEvenMonths,
    recommendation,
  };
}
