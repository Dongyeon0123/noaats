'use client';

import { CommuteInfo, CarCosts, TimeValue } from '../types';

interface Props {
  commute: CommuteInfo;
  setCommute: (value: CommuteInfo) => void;
  car: CarCosts;
  setCar: (value: CarCosts) => void;
  timeValue: TimeValue;
  setTimeValue: (value: TimeValue) => void;
}

export default function InputSection({ commute, setCommute, car, setCar, timeValue, setTimeValue }: Props) {
  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* 출퇴근 정보 */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">출퇴근 정보</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              편도 거리 (km)
            </label>
            <input
              type="number"
              min="0"
              value={commute.distance}
              onChange={(e) => setCommute({ ...commute, distance: Number(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              월 근무일수
            </label>
            <input
              type="number"
              min="0"
              max="31"
              value={commute.workDaysPerMonth}
              onChange={(e) => setCommute({ ...commute, workDaysPerMonth: Number(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              대중교통 편도 비용 (원)
            </label>
            <input
              type="number"
              min="0"
              value={commute.publicTransportCost}
              onChange={(e) => setCommute({ ...commute, publicTransportCost: Number(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              대중교통 편도 시간 (분)
            </label>
            <input
              type="number"
              min="0"
              value={commute.publicTransportTime}
              onChange={(e) => setCommute({ ...commute, publicTransportTime: Number(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              자동차 편도 시간 (분)
            </label>
            <input
              type="number"
              min="0"
              value={commute.carTime}
              onChange={(e) => setCommute({ ...commute, carTime: Number(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* 자동차 비용 */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">🚗 자동차 비용</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              차량 구매가 (원)
            </label>
            <input
              type="number"
              min="0"
              value={car.purchasePrice}
              onChange={(e) => setCar({ ...car, purchasePrice: Number(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              연비 (km/L)
            </label>
            <input
              type="number"
              min="1"
              step="0.1"
              value={car.fuelEfficiency}
              onChange={(e) => setCar({ ...car, fuelEfficiency: Number(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              유류비 (원/L)
            </label>
            <input
              type="number"
              min="0"
              value={car.fuelPrice}
              onChange={(e) => setCar({ ...car, fuelPrice: Number(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              연간 보험료 (원)
            </label>
            <input
              type="number"
              min="0"
              value={car.insurance}
              onChange={(e) => setCar({ ...car, insurance: Number(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              연간 세금 (원)
            </label>
            <input
              type="number"
              min="0"
              value={car.tax}
              onChange={(e) => setCar({ ...car, tax: Number(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              월 주차비 (원)
            </label>
            <input
              type="number"
              min="0"
              value={car.parkingFee}
              onChange={(e) => setCar({ ...car, parkingFee: Number(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              편도 통행료 (원)
            </label>
            <input
              type="number"
              min="0"
              value={car.tollFee}
              onChange={(e) => setCar({ ...car, tollFee: Number(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              연간 정비비 (원)
            </label>
            <input
              type="number"
              min="0"
              value={car.maintenanceFee}
              onChange={(e) => setCar({ ...car, maintenanceFee: Number(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              감가상각 기간 (년)
            </label>
            <input
              type="number"
              min="1"
              max="20"
              value={car.depreciationYears}
              onChange={(e) => setCar({ ...car, depreciationYears: Number(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* 시간 가치 */}
      <div className="bg-white rounded-lg shadow-md p-6 md:col-span-2">
        <h2 className="text-xl font-bold text-gray-800 mb-4">⏰ 시간 가치</h2>
        <div className="max-w-md">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            시간당 가치 (원/시간)
          </label>
          <input
            type="number"
            min="0"
            value={timeValue.hourlyWage}
            onChange={(e) => setTimeValue({ hourlyWage: Number(e.target.value) })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-500 mt-1">
            출퇴근 시간의 기회비용을 계산합니다. 연봉 ÷ 2080시간(주 40시간 × 52주)으로 계산할 수 있습니다.
          </p>
        </div>
      </div>
    </div>
  );
}
