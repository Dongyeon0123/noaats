'use client';

import { CalculationResult } from '../types';

interface Props {
  result: CalculationResult;
}

export default function ResultSection({ result }: Props) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('ko-KR').format(Math.round(value));
  };

  const getRecommendationText = () => {
    if (result.recommendation === 'car') {
      return {
        text: '자동차 구매를 추천합니다',
        color: 'text-blue-600',
        bg: 'bg-blue-50',
      };
    } else if (result.recommendation === 'publicTransport') {
      return {
        text: '대중교통 이용을 추천합니다',
        color: 'text-green-600',
        bg: 'bg-green-50',
      };
    } else {
      return {
        text: '비용이 비슷합니다. 편의성을 고려하세요',
        color: 'text-gray-600',
        bg: 'bg-gray-50',
      };
    }
  };

  const recommendation = getRecommendationText();

  return (
    <div className="space-y-6">
      {/* 추천 */}
      <div className={`${recommendation.bg} rounded-lg shadow-md p-6 text-center`}>
        <h2 className={`text-2xl font-bold ${recommendation.color} mb-2`}>
          {recommendation.text}
        </h2>
        {result.breakEvenMonths !== Infinity && result.breakEvenMonths > 0 && (
          <p className="text-gray-700">
            손익분기점: 약 {Math.round(result.breakEvenMonths)}개월 ({Math.round(result.breakEvenMonths / 12)}년)
          </p>
        )}
      </div>

      {/* 비교 카드 */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* 대중교통 */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            🚌 대중교통
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">월 교통비</span>
              <span className="font-semibold">{formatCurrency(result.publicTransport.monthlyCost)}원</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">월 소요시간</span>
              <span className="font-semibold">{Math.round(result.publicTransport.timeSpent)}시간</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">시간 기회비용</span>
              <span className="font-semibold">{formatCurrency(result.publicTransport.timeCost)}원</span>
            </div>
            <div className="border-t pt-3 flex justify-between">
              <span className="text-gray-800 font-bold">월 총 비용</span>
              <span className="text-lg font-bold text-green-600">
                {formatCurrency(result.publicTransport.totalMonthlyCost)}원
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">연간 총 비용</span>
              <span className="font-semibold">{formatCurrency(result.publicTransport.totalMonthlyCost * 12)}원</span>
            </div>
          </div>
        </div>

        {/* 자동차 */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            🚗 자동차
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">월 운영비</span>
              <span className="font-semibold">{formatCurrency(result.car.monthlyCost)}원</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">월 소요시간</span>
              <span className="font-semibold">{Math.round(result.car.timeSpent)}시간</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">시간 기회비용</span>
              <span className="font-semibold">{formatCurrency(result.car.timeCost)}원</span>
            </div>
            <div className="border-t pt-3 flex justify-between">
              <span className="text-gray-800 font-bold">월 총 비용</span>
              <span className="text-lg font-bold text-blue-600">
                {formatCurrency(result.car.totalMonthlyCost)}원
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">연간 총 비용</span>
              <span className="font-semibold">{formatCurrency(result.car.totalMonthlyCost * 12)}원</span>
            </div>
          </div>
        </div>
      </div>

      {/* 자동차 비용 상세 */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">🔍 자동차 비용 상세 (월)</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="flex justify-between">
            <span className="text-gray-600">감가상각</span>
            <span className="font-semibold">{formatCurrency(result.car.breakdown.depreciation)}원</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">유류비</span>
            <span className="font-semibold">{formatCurrency(result.car.breakdown.fuel)}원</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">보험료</span>
            <span className="font-semibold">{formatCurrency(result.car.breakdown.insurance)}원</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">세금</span>
            <span className="font-semibold">{formatCurrency(result.car.breakdown.tax)}원</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">주차비</span>
            <span className="font-semibold">{formatCurrency(result.car.breakdown.parking)}원</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">통행료</span>
            <span className="font-semibold">{formatCurrency(result.car.breakdown.toll)}원</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">정비비</span>
            <span className="font-semibold">{formatCurrency(result.car.breakdown.maintenance)}원</span>
          </div>
        </div>
      </div>
    </div>
  );
}
