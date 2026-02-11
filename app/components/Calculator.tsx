'use client';

import { useState } from 'react';
import { CommuteInfo, CarCosts, TimeValue } from '../types';
import { calculateCosts } from '../utils/calculator';
import InputSection from './InputSection';
import ResultSection from './ResultSection';

export default function Calculator() {
  const [commute, setCommute] = useState<CommuteInfo>({
    distance: 50,
    workDaysPerMonth: 22,
    publicTransportCost: 3200,
    publicTransportTime: 90,
    carTime: 60,
  });

  const [car, setCar] = useState<CarCosts>({
    purchasePrice: 30000000,
    fuelEfficiency: 12,
    fuelPrice: 1600,
    insurance: 1200000,
    tax: 400000,
    parkingFee: 100000,
    tollFee: 3000,
    maintenanceFee: 800000,
    depreciationYears: 5,
  });

  const [timeValue, setTimeValue] = useState<TimeValue>({
    hourlyWage: 20000,
  });

  const result = calculateCosts(commute, car, timeValue);

  return (
    <div className="space-y-6">
      <InputSection
        commute={commute}
        setCommute={setCommute}
        car={car}
        setCar={setCar}
        timeValue={timeValue}
        setTimeValue={setTimeValue}
      />
      <ResultSection result={result} />
    </div>
  );
}
