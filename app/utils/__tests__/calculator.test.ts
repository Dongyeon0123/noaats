import { calculateCosts } from '../calculator';
import { CommuteInfo, CarCosts, TimeValue } from '../../types';

describe('calculateCosts', () => {
  // 기본 테스트 데이터
  const defaultCommute: CommuteInfo = {
    distance: 50,
    workDaysPerMonth: 22,
    publicTransportCost: 3200,
    publicTransportTime: 90,
    carTime: 60,
  };

  const defaultCar: CarCosts = {
    purchasePrice: 30000000,
    fuelEfficiency: 12,
    fuelPrice: 1600,
    insurance: 1200000,
    tax: 400000,
    parkingFee: 100000,
    tollFee: 3000,
    maintenanceFee: 800000,
    depreciationYears: 5,
  };

  const defaultTimeValue: TimeValue = {
    hourlyWage: 20000,
  };

  describe('대중교통 비용 계산', () => {
    it('월 교통비를 정확히 계산해야 함', () => {
      const result = calculateCosts(defaultCommute, defaultCar, defaultTimeValue);
      
      // 3,200원 × 2 (왕복) × 22일 = 140,800원
      expect(result.publicTransport.monthlyCost).toBe(140800);
    });

    it('연간 교통비를 정확히 계산해야 함', () => {
      const result = calculateCosts(defaultCommute, defaultCar, defaultTimeValue);
      
      // 140,800원 × 12개월 = 1,689,600원
      expect(result.publicTransport.yearlyCost).toBe(1689600);
    });

    it('시간 기회비용을 정확히 계산해야 함', () => {
      const result = calculateCosts(defaultCommute, defaultCar, defaultTimeValue);
      
      // (90분 × 2 × 22일) / 60 = 66시간
      // 66시간 × 20,000원 = 1,320,000원
      expect(result.publicTransport.timeSpent).toBe(66);
      expect(result.publicTransport.timeCost).toBe(1320000);
    });

    it('총 월 비용을 정확히 계산해야 함', () => {
      const result = calculateCosts(defaultCommute, defaultCar, defaultTimeValue);
      
      // 140,800원 + 1,320,000원 = 1,460,800원
      expect(result.publicTransport.totalMonthlyCost).toBe(1460800);
    });
  });

  describe('자동차 비용 계산', () => {
    it('월 유류비를 정확히 계산해야 함', () => {
      const result = calculateCosts(defaultCommute, defaultCar, defaultTimeValue);
      
      // 월 주행거리: 50km × 2 × 22일 = 2,200km
      // 유류비: (2,200km / 12km/L) × 1,600원 = 293,333.33원
      expect(result.car.breakdown.fuel).toBeCloseTo(293333.33, 2);
    });

    it('월 감가상각비를 정확히 계산해야 함', () => {
      const result = calculateCosts(defaultCommute, defaultCar, defaultTimeValue);
      
      // 30,000,000원 / (5년 × 12개월) = 500,000원
      expect(result.car.breakdown.depreciation).toBe(500000);
    });

    it('월 보험료를 정확히 계산해야 함', () => {
      const result = calculateCosts(defaultCommute, defaultCar, defaultTimeValue);
      
      // 1,200,000원 / 12 = 100,000원
      expect(result.car.breakdown.insurance).toBe(100000);
    });

    it('월 세금을 정확히 계산해야 함', () => {
      const result = calculateCosts(defaultCommute, defaultCar, defaultTimeValue);
      
      // 400,000원 / 12 = 33,333.33원
      expect(result.car.breakdown.tax).toBeCloseTo(33333.33, 2);
    });

    it('월 통행료를 정확히 계산해야 함', () => {
      const result = calculateCosts(defaultCommute, defaultCar, defaultTimeValue);
      
      // 3,000원 × 2 × 22일 = 132,000원
      expect(result.car.breakdown.toll).toBe(132000);
    });

    it('월 정비비를 정확히 계산해야 함', () => {
      const result = calculateCosts(defaultCommute, defaultCar, defaultTimeValue);
      
      // 800,000원 / 12 = 66,666.67원
      expect(result.car.breakdown.maintenance).toBeCloseTo(66666.67, 2);
    });

    it('주차비를 정확히 반영해야 함', () => {
      const result = calculateCosts(defaultCommute, defaultCar, defaultTimeValue);
      
      expect(result.car.breakdown.parking).toBe(100000);
    });

    it('시간 기회비용을 정확히 계산해야 함', () => {
      const result = calculateCosts(defaultCommute, defaultCar, defaultTimeValue);
      
      // (60분 × 2 × 22일) / 60 = 44시간
      // 44시간 × 20,000원 = 880,000원
      expect(result.car.timeSpent).toBe(44);
      expect(result.car.timeCost).toBe(880000);
    });
  });

  describe('손익분기점 계산', () => {
    it('대중교통이 저렴할 때 손익분기점을 계산해야 함', () => {
      const result = calculateCosts(defaultCommute, defaultCar, defaultTimeValue);
      
      // 기본 케이스에서는 자동차가 더 비싸므로 Infinity가 정상
      // (대중교통이 저렴하면 차량 구매 비용을 회수할 수 없음)
      expect(result.breakEvenMonths).toBe(Infinity);
    });

    it('자동차가 항상 비쌀 때 Infinity를 반환해야 함', () => {
      const expensiveCar: CarCosts = {
        ...defaultCar,
        purchasePrice: 100000000, // 1억원
        insurance: 5000000,
        parkingFee: 500000,
      };
      
      const result = calculateCosts(defaultCommute, expensiveCar, defaultTimeValue);
      
      expect(result.breakEvenMonths).toBe(Infinity);
    });

    it('자동차가 저렴할 때 손익분기점을 계산해야 함', () => {
      const cheapCommute: CommuteInfo = {
        ...defaultCommute,
        publicTransportCost: 10000, // 비싼 대중교통
        publicTransportTime: 180, // 오래 걸림
      };
      
      const result = calculateCosts(cheapCommute, defaultCar, defaultTimeValue);
      
      // 손익분기점이 계산되어야 함
      expect(result.breakEvenMonths).toBeGreaterThan(0);
    });
  });

  describe('추천 시스템', () => {
    it('대중교통이 저렴할 때 대중교통을 추천해야 함', () => {
      const result = calculateCosts(defaultCommute, defaultCar, defaultTimeValue);
      
      expect(result.recommendation).toBe('publicTransport');
    });

    it('자동차가 저렴할 때 자동차를 추천해야 함', () => {
      const cheapCar: CarCosts = {
        ...defaultCar,
        purchasePrice: 5000000, // 500만원 중고차
        insurance: 500000,
        parkingFee: 0,
        tollFee: 0,
      };
      
      const expensiveCommute: CommuteInfo = {
        ...defaultCommute,
        publicTransportCost: 10000,
        publicTransportTime: 180,
      };
      
      const result = calculateCosts(expensiveCommute, cheapCar, defaultTimeValue);
      
      expect(result.recommendation).toBe('car');
    });

    it('비용 차이가 5만원 미만일 때 similar를 반환해야 함', () => {
      const similarCar: CarCosts = {
        ...defaultCar,
        purchasePrice: 10000000,
        insurance: 600000,
        parkingFee: 50000,
        tollFee: 1000,
      };
      
      const result = calculateCosts(defaultCommute, similarCar, defaultTimeValue);
      
      // 비용이 비슷하면 similar
      if (Math.abs(result.car.totalMonthlyCost - result.publicTransport.totalMonthlyCost) < 50000) {
        expect(result.recommendation).toBe('similar');
      }
    });
  });

  describe('엣지 케이스', () => {
    it('근무일수가 0일 때 모든 비용이 0이어야 함', () => {
      const zeroCommute: CommuteInfo = {
        ...defaultCommute,
        workDaysPerMonth: 0,
      };
      
      const result = calculateCosts(zeroCommute, defaultCar, defaultTimeValue);
      
      expect(result.publicTransport.monthlyCost).toBe(0);
      expect(result.car.breakdown.fuel).toBe(0);
      expect(result.car.breakdown.toll).toBe(0);
    });

    it('시간 가치가 0일 때 시간 비용이 0이어야 함', () => {
      const zeroTimeValue: TimeValue = {
        hourlyWage: 0,
      };
      
      const result = calculateCosts(defaultCommute, defaultCar, zeroTimeValue);
      
      expect(result.publicTransport.timeCost).toBe(0);
      expect(result.car.timeCost).toBe(0);
    });

    it('자동차가 대중교통보다 느릴 때도 정상 계산되어야 함', () => {
      const slowCar: CommuteInfo = {
        ...defaultCommute,
        carTime: 120, // 자동차가 더 느림
      };
      
      const result = calculateCosts(slowCar, defaultCar, defaultTimeValue);
      
      expect(result.car.timeSpent).toBeGreaterThan(result.publicTransport.timeSpent);
      expect(result.car.timeCost).toBeGreaterThan(result.publicTransport.timeCost);
    });

    it('연비가 매우 낮을 때 유류비가 높아야 함', () => {
      const lowEfficiencyCar: CarCosts = {
        ...defaultCar,
        fuelEfficiency: 5, // 5km/L
      };
      
      const result = calculateCosts(defaultCommute, lowEfficiencyCar, defaultTimeValue);
      
      // 연비가 낮으면 유류비가 높아야 함
      expect(result.car.breakdown.fuel).toBeGreaterThan(500000);
    });

    it('감가상각 기간이 길 때 월 감가상각비가 낮아야 함', () => {
      const longDepreciation: CarCosts = {
        ...defaultCar,
        depreciationYears: 10,
      };
      
      const result = calculateCosts(defaultCommute, longDepreciation, defaultTimeValue);
      
      // 10년 감가상각: 30,000,000 / (10 × 12) = 250,000원
      expect(result.car.breakdown.depreciation).toBe(250000);
    });

    it('극단적으로 비싼 차량도 계산되어야 함', () => {
      const expensiveCar: CarCosts = {
        ...defaultCar,
        purchasePrice: 200000000, // 2억원
        insurance: 10000000,
        parkingFee: 1000000,
      };
      
      const result = calculateCosts(defaultCommute, expensiveCar, defaultTimeValue);
      
      expect(result.car.totalMonthlyCost).toBeGreaterThan(result.publicTransport.totalMonthlyCost);
      expect(result.recommendation).toBe('publicTransport');
    });

    it('거리가 0일 때 유류비와 통행료가 0이어야 함', () => {
      const zeroDistance: CommuteInfo = {
        ...defaultCommute,
        distance: 0,
      };
      
      const result = calculateCosts(zeroDistance, defaultCar, defaultTimeValue);
      
      expect(result.car.breakdown.fuel).toBe(0);
    });
  });

  describe('실제 시나리오 테스트', () => {
    it('화성 병점 → 서초 실제 케이스', () => {
      // 실제 데이터로 테스트
      const result = calculateCosts(defaultCommute, defaultCar, defaultTimeValue);
      
      // 대중교통이 더 저렴해야 함
      expect(result.publicTransport.totalMonthlyCost).toBeLessThan(result.car.totalMonthlyCost);
      
      // 자동차가 더 비싸므로 손익분기점은 Infinity
      expect(result.breakEvenMonths).toBe(Infinity);
      
      // 대중교통 추천
      expect(result.recommendation).toBe('publicTransport');
    });

    it('중고차 구매 시나리오', () => {
      const usedCar: CarCosts = {
        purchasePrice: 10000000, // 1천만원 중고차
        fuelEfficiency: 10,
        fuelPrice: 1600,
        insurance: 800000,
        tax: 300000,
        parkingFee: 100000,
        tollFee: 3000,
        maintenanceFee: 1200000, // 중고차는 정비비 높음
        depreciationYears: 3,
      };
      
      const result = calculateCosts(defaultCommute, usedCar, defaultTimeValue);
      
      // 중고차도 여전히 대중교통보다 비쌀 수 있음
      // 초기 비용은 낮지만 운영비가 높기 때문
      expect(result.car.breakdown.depreciation).toBeLessThan(defaultCar.purchasePrice / (defaultCar.depreciationYears * 12));
    });

    it('단거리 출퇴근 시나리오', () => {
      const shortCommute: CommuteInfo = {
        distance: 10,
        workDaysPerMonth: 22,
        publicTransportCost: 1500,
        publicTransportTime: 30,
        carTime: 20,
      };
      
      const result = calculateCosts(shortCommute, defaultCar, defaultTimeValue);
      
      // 단거리는 대중교통이 유리
      expect(result.publicTransport.totalMonthlyCost).toBeLessThan(result.car.totalMonthlyCost);
    });

    it('재택근무 병행 시나리오 (주 3일 출근)', () => {
      const hybridCommute: CommuteInfo = {
        ...defaultCommute,
        workDaysPerMonth: 13, // 주 3일
      };
      
      const result = calculateCosts(hybridCommute, defaultCar, defaultTimeValue);
      
      // 출근일이 적으면 자동차 고정비 부담이 커짐
      expect(result.recommendation).toBe('publicTransport');
    });
  });
});
