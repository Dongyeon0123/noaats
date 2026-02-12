'use client';

import { useState, useEffect, useRef } from 'react';
import { CommuteInfo, CarCosts, TimeValue } from '../types';
import { calculateCosts } from '../utils/calculator';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

type Step = 
  | 'welcome'
  | 'distance'
  | 'workDays'
  | 'publicTransportCost'
  | 'publicTransportTime'
  | 'carTime'
  | 'hasOwnCar'
  | 'currentCarValue'
  | 'hasCarLoan'
  | 'monthlyCarLoan'
  | 'remainingLoanMonths'
  | 'willBuyNewCar'
  | 'carPrice'
  | 'fuelEfficiency'
  | 'fuelPrice'
  | 'insurance'
  | 'tax'
  | 'parking'
  | 'toll'
  | 'maintenance'
  | 'depreciation'
  | 'hourlyWage'
  | 'result';

interface Message {
  type: 'bot' | 'user';
  text: string;
}

const defaultValues: { [key: string]: number } = {
  distance: 20,
  workDays: 22,
  publicTransportCost: 1650,
  publicTransportTime: 60,
  carTime: 50,
  currentCarValue: 15000000,
  monthlyCarLoan: 0,
  remainingLoanMonths: 0,
  carPrice: 25000000,
  fuelEfficiency: 12,
  fuelPrice: 1650,
  insurance: 1200000,
  tax: 400000,
  parking: 100000,
  toll: 3000,
  maintenance: 800000,
  depreciation: 5,
  hourlyWage: 20000,
};

export default function ChatCalculator() {
  const [step, setStep] = useState<Step>('welcome');
  const [messages, setMessages] = useState<Message[]>([
    { type: 'bot', text: '안녕하세요! 출퇴근 비용 계산을 도와드릴게요.' },
    { type: 'bot', text: '몇 가지 질문에 답해주시면, 자동차 구매와 대중교통 중 어떤 선택이 더 경제적인지 알려드립니다.' },
    { type: 'bot', text: '시작하시겠어요? (예/아니오)' },
  ]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [commute, setCommute] = useState<Partial<CommuteInfo>>({});
  const [car, setCar] = useState<Partial<CarCosts>>({});
  const [timeValue, setTimeValue] = useState<Partial<TimeValue>>({});
  const [hasOwnCar, setHasOwnCar] = useState<boolean>(false);
  const [willBuyNewCar, setWillBuyNewCar] = useState<boolean>(false);
  const [currentCarLoan, setCurrentCarLoan] = useState<{ monthly: number; remainingMonths: number }>({ monthly: 0, remainingMonths: 0 });
  const [calculationResult, setCalculationResult] = useState<any>(null);
  const [includeTimeCost, setIncludeTimeCost] = useState<boolean>(true);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const addMessage = (type: 'bot' | 'user', text: string) => {
    setMessages(prev => [...prev, { type, text }]);
  };

  const getQuickButtons = (): string[] => {
    switch (step) {
      case 'welcome':
        return ['예', '아니오'];
      case 'hasOwnCar':
        return ['예', '아니오'];
      case 'hasCarLoan':
        return ['예', '아니오'];
      case 'willBuyNewCar':
        return ['예', '아니오'];
      default:
        return step !== 'result' ? ['모름', '도움말'] : [];
    }
  };

  const handleQuickButton = (text: string) => {
    addMessage('user', text);
    if (text === '도움말') {
      handleHelp();
    } else {
      handleInput(text);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    addMessage('user', input);
    
    const isHelpRequest = input.includes('도움') || input === '?';
    if (isHelpRequest) {
      handleHelp();
    } else {
      handleInput(input);
    }
    
    setInput('');
  };

  const handleHelp = () => {
    const helpMessages: { [key: string]: string } = {
      'distance': '집에서 회사까지의 편도 거리를 km 단위로 입력해주세요. 예를 들어 "20" 또는 "20키로"처럼 입력하시면 됩니다. 잘 모르시면 "모름" 버튼을 눌러 평균값 20km를 사용하실 수 있습니다.',
      'workDays': '한 달에 출근하는 일수를 입력해주세요. 보통 주 5일 근무는 월 22일 정도입니다. "22" 또는 "모름"을 입력하세요.',
      'publicTransportCost': '대중교통 편도 요금을 입력해주세요. 버스나 지하철 한 번 타는 비용입니다. 예: "1650" 또는 "1650원"',
      'publicTransportTime': '대중교통으로 이동하는 편도 시간을 분 단위로 입력해주세요. 예: "60" 또는 "60분"',
      'carTime': '자동차로 이동하는 편도 시간을 분 단위로 입력해주세요. 예: "50" 또는 "50분"',
      'hasOwnCar': '현재 차량을 보유하고 계신지 여부를 알려주세요. "예" 또는 "아니오"를 선택해주세요.',
      'currentCarValue': '현재 보유하신 차량의 시세를 입력해주세요. 중고차 시세를 확인하시면 됩니다. 예: "1500만원"',
      'hasCarLoan': '현재 차량에 남은 할부금이 있는지 알려주세요. "예" 또는 "아니오"를 선택해주세요.',
      'monthlyCarLoan': '현재 차량의 월 할부금을 입력해주세요. 예: "50만원" 또는 "500000"',
      'remainingLoanMonths': '할부금을 몇 개월 더 납부해야 하는지 입력해주세요. 예: "12" 또는 "12개월"',
      'willBuyNewCar': '현재 차량을 팔고 새 차량으로 바꾸실 건지 알려주세요. "예"를 선택하면 새 차량 가격을 물어보고, "아니오"를 선택하면 현재 차량으로 계산합니다.',
      'carPrice': '구매하려는 차량 가격을 입력해주세요. "3천만원" 또는 "30000000"처럼 입력하시면 됩니다.',
      'fuelEfficiency': '차량의 연비를 km/L 단위로 입력해주세요. 보통 경차는 15, 중형차는 12 정도입니다.',
      'fuelPrice': '현재 유류비를 리터당 가격으로 입력해주세요. 예: "1650" 또는 "1650원"',
      'insurance': '연간 자동차 보험료를 입력해주세요. "120만원" 또는 "1200000"처럼 입력하시면 됩니다.',
      'tax': '연간 자동차세를 입력해주세요. 배기량에 따라 다르며, 보통 40만원 정도입니다.',
      'parking': '월 주차비를 입력해주세요. 주차장이 없으면 "0" 또는 "없음"을 입력하세요.',
      'toll': '편도 통행료를 입력해주세요. 고속도로를 이용하지 않으면 "0" 또는 "없음"을 입력하세요.',
      'maintenance': '연간 정비비를 입력해주세요. 엔진오일, 타이어 교체 등의 비용입니다. 보통 80만원 정도입니다.',
      'depreciation': '차량을 몇 년 동안 사용할 계획인지 입력해주세요. 예: "3" 또는 "3년"',
      'hourlyWage': '본인의 시급을 입력해주세요. 시간의 가치를 계산하는데 사용됩니다. 예: "2만원" 또는 "20000"',
    };

    const helpMessage = helpMessages[step] || '질문에 대한 답변을 입력해주세요. 숫자나 "모름"을 입력하시면 됩니다.';
    
    setTimeout(() => {
      addMessage('bot', helpMessage);
    }, 300);
  };

  const parseNumberWithAI = async (text: string, questionType: string): Promise<number | null> => {
    try {
      const res = await fetch('/api/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, questionType }),
      });
      const data = await res.json();
      return data.value ?? null;
    } catch {
      return null;
    }
  };

  const parseNumber = (text: string, questionType: string): number | null => {
    // "모름" 키워드
    const unknownKeywords = ['모름', '모르', '몰라'];
    if (unknownKeywords.some(k => text.includes(k))) {
      return null;
    }

    // "없음" 키워드 → 0
    const noneKeywords = ['없음', '없어', '안'];
    if (noneKeywords.some(k => text.includes(k))) {
      return 0;
    }

    // 차량명 인식 (carPrice 질문일 때만)
    if (questionType === 'carPrice') {
      // 한글이 포함되어 있고 숫자 단위(만, 천 등)가 아닌 경우 → 차량명으로 판단
      const hasKorean = text.match(/[가-힣]{2,}/);
      const hasUnit = text.match(/[만천백억원]/);
      if (hasKorean && !hasUnit) {
        return -1; // 차량명 입력 → 가격 직접 입력 요청
      }
    }

    // 한글 단위 파싱
    let result = 0;
    let hasKoreanUnit = false;
    
    // 억
    const eokMatch = text.match(/(\d+)\s*억/);
    if (eokMatch) { result += parseInt(eokMatch[1]) * 100000000; hasKoreanUnit = true; }
    
    // 천만
    const cheonManMatch = text.match(/(\d+)\s*천\s*(\d+)?\s*백?\s*만/);
    if (cheonManMatch) {
      result += parseInt(cheonManMatch[1]) * 10000000;
      if (cheonManMatch[2]) result += parseInt(cheonManMatch[2]) * 1000000;
      hasKoreanUnit = true;
    }
    
    // 백만
    const baekManMatch = text.match(/(\d+)\s*백\s*만/);
    if (baekManMatch && !cheonManMatch) {
      result += parseInt(baekManMatch[1]) * 1000000;
      hasKoreanUnit = true;
    }
    
    // 만
    if (!cheonManMatch && !baekManMatch) {
      const manMatch = text.match(/(\d+)\s*만/);
      if (manMatch) { result += parseInt(manMatch[1]) * 10000; hasKoreanUnit = true; }
    }
    
    // 천 (만 없이 단독 사용: "2천", "2천5백")
    if (!cheonManMatch) {
      const cheonMatch = text.match(/(\d+)\s*천(?!만)/);
      if (cheonMatch) { result += parseInt(cheonMatch[1]) * 1000; hasKoreanUnit = true; }
    }

    // 백 (만 없이 단독 사용: "5백", "2천5백"의 백 부분)
    if (!baekManMatch && !cheonManMatch) {
      const baekMatch = text.match(/(\d+)\s*백(?!만)/);
      if (baekMatch) { result += parseInt(baekMatch[1]) * 100; hasKoreanUnit = true; }
    }

    if (result > 0) {
      // 한글 단위가 있지만 "만"이 없는 경우 맥락 기반 보정
      // 예: "2천5백" → 2500 → carPrice 맥락에서 2500만원(25,000,000)
      const hasMan = /만/.test(text);
      if (hasKoreanUnit && !hasMan && result < 100000) {
        if (questionType === 'carPrice' || questionType === 'currentCarValue' || 
            questionType === 'insurance' || questionType === 'tax' || 
            questionType === 'maintenance' || questionType === 'monthlyCarLoan') {
          result = result * 10000; // 만원 단위로 보정
        }
      }
      return result;
    }

    // 일반 숫자 추출
    const numbers = text.match(/\d+/g);
    if (numbers && numbers.length > 0) {
      let num = parseInt(numbers[0]);
      
      // 맥락에 따라 단위 보정
      if (num < 1000) {
        if (questionType === 'insurance' || questionType === 'tax' || questionType === 'maintenance' || questionType === 'parking' || questionType === 'monthlyCarLoan' || questionType === 'currentCarValue') {
          num = num * 10000; // 만원 단위
        } else if (questionType === 'hourlyWage' && num < 100) {
          num = num * 10000; // 만원 단위 (시급 2 → 2만원)
        }
      }
      
      return num;
    }

    return null;
  };

  const handleInput = (userInput: string) => {
    if (step === 'welcome') {
      if (userInput.includes('예') || userInput.toLowerCase().includes('y')) {
        setStep('distance');
        setTimeout(() => {
          addMessage('bot', '집에서 회사까지의 편도 거리를 km 단위로 입력해주세요.');
          setTimeout(() => addMessage('bot', '예: "20" 또는 "20키로". 잘 모르시면 "모름" 버튼을 눌러주세요.'), 300);
        }, 500);
      } else {
        setTimeout(() => addMessage('bot', '언제든 다시 방문해주세요!'), 500);
      }
      return;
    }

    if (step === 'hasOwnCar') {
      if (userInput.includes('예') || userInput.toLowerCase().includes('y')) {
        setHasOwnCar(true);
        setStep('currentCarValue');
        setTimeout(() => {
          addMessage('bot', '현재 보유하신 차량의 시세가 대략 얼마 정도 되나요?');
          setTimeout(() => addMessage('bot', '예: "1500만원" 또는 "15000000". 중고차 시세를 확인해보세요!'), 300);
        }, 500);
      } else if (userInput.includes('아니') || userInput.toLowerCase().includes('n')) {
        setHasOwnCar(false);
        setStep('carPrice');
        setTimeout(() => {
          addMessage('bot', '구매하려는 차량 가격을 입력해주세요.');
          setTimeout(() => addMessage('bot', '예: "3천만원" 또는 "30000000"'), 300);
        }, 500);
      } else {
        setTimeout(() => addMessage('bot', '"예" 또는 "아니오"를 선택해주세요!'), 300);
      }
      return;
    }

    if (step === 'hasCarLoan') {
      if (userInput.includes('예') || userInput.toLowerCase().includes('y')) {
        setStep('monthlyCarLoan');
        setTimeout(() => {
          addMessage('bot', '현재 차량의 월 할부금은 얼마인가요?');
          setTimeout(() => addMessage('bot', '예: "50만원" 또는 "500000"'), 300);
        }, 500);
      } else if (userInput.includes('아니') || userInput.toLowerCase().includes('n')) {
        setCurrentCarLoan({ monthly: 0, remainingMonths: 0 });
        setStep('willBuyNewCar');
        setTimeout(() => {
          addMessage('bot', '현재 차량을 팔고 새 차량으로 바꾸실 건가요? (예/아니오)');
        }, 500);
      } else {
        setTimeout(() => addMessage('bot', '"예" 또는 "아니오"를 선택해주세요!'), 300);
      }
      return;
    }

    if (step === 'willBuyNewCar') {
      if (userInput.includes('예') || userInput.toLowerCase().includes('y')) {
        setWillBuyNewCar(true);
        setStep('carPrice');
        setTimeout(() => {
          addMessage('bot', '구매하려는 차량 가격을 입력해주세요.');
          setTimeout(() => addMessage('bot', '예: "3천만원" 또는 "30000000"'), 300);
        }, 500);
      } else if (userInput.includes('아니') || userInput.toLowerCase().includes('n')) {
        setWillBuyNewCar(false);
        // 현재 차량으로 계산 (구매 비용 0원, 감가상각 0년)
        setCar(prev => ({ ...prev, purchasePrice: 0, depreciationYears: 0 }));
        setStep('fuelEfficiency');
        setTimeout(() => {
          addMessage('bot', '알겠습니다! 현재 차량으로 계산하겠습니다.');
          setTimeout(() => {
            addMessage('bot', '차량의 연비를 km/L 단위로 입력해주세요. 보통 경차는 15, 중형차는 12 정도입니다.');
            setTimeout(() => addMessage('bot', '예: "12" 또는 "모름"'), 300);
          }, 500);
        }, 500);
      } else {
        setTimeout(() => addMessage('bot', '"예" 또는 "아니오"를 선택해주세요!'), 300);
      }
      return;
    }

    // "모름" 빠른 처리
    const unknownKeywords = ['모름', '모르', '몰라'];
    if (unknownKeywords.some(k => userInput.includes(k))) {
      // 시급 질문에서 "모름"이면 시간비용 제외
      if (step === 'hourlyWage') {
        setTimeout(() => {
          addMessage('bot', '시급을 모르시면 시간 비용을 제외하고 계산할게요!');
        }, 300);
        setTimeout(() => {
          processStep(step, 0); // 시급 0원 = 시간비용 계산 안함
        }, 800);
        return;
      }
      const value = defaultValues[step];
      processStep(step, value);
      return;
    }

    // 로컬 파싱
    const parsedValue = parseNumber(userInput, step);
    
    // 한글이 포함된 입력인데 로컬 파싱 실패 또는 범위 밖 → AI fallback
    const hasKoreanText = /[가-힣]/.test(userInput);
    
    if (parsedValue === null && hasKoreanText) {
      // AI 파싱 시도
      setTimeout(() => addMessage('bot', '입력을 분석하고 있어요...'), 200);
      parseNumberWithAI(userInput, step).then(aiValue => {
        if (aiValue === null) {
          addMessage('bot', '숫자를 인식하지 못했어요. 다시 입력해주세요.');
        } else if (aiValue === -1) {
          addMessage('bot', '차량명으로는 가격을 알 수 없어요. 가격을 숫자로 입력해주세요!\n예: "3천만원" 또는 "25000000"');
        } else {
          validateAndProcess(aiValue, userInput);
        }
      });
      return;
    }

    if (parsedValue === null) {
      setTimeout(() => addMessage('bot', '숫자를 입력해주세요. 모르시면 "모름" 버튼을 눌러주세요.'), 300);
      return;
    }

    if (parsedValue === -1) {
      setTimeout(() => addMessage('bot', '차량명으로는 가격을 알 수 없어요. 가격을 숫자로 입력해주세요!\n예: "3천만원" 또는 "25000000"'), 300);
      return;
    }

    validateAndProcess(parsedValue, userInput);
  };

  const validateAndProcess = (parsedValue: number, userInput: string) => {

    // 범위 검증
    const ranges: { [key: string]: { min: number; max: number; unit: string } } = {
      distance: { min: 1, max: 100, unit: 'km' },
      workDays: { min: 15, max: 25, unit: '일' },
      publicTransportCost: { min: 1000, max: 10000, unit: '원' },
      publicTransportTime: { min: 10, max: 180, unit: '분' },
      carTime: { min: 10, max: 180, unit: '분' },
      currentCarValue: { min: 5000000, max: 80000000, unit: '원' },
      monthlyCarLoan: { min: 0, max: 2000000, unit: '원' },
      remainingLoanMonths: { min: 1, max: 60, unit: '개월' },
      carPrice: { min: 10000000, max: 100000000, unit: '원' },
      fuelEfficiency: { min: 5, max: 20, unit: 'km/L' },
      fuelPrice: { min: 1500, max: 2000, unit: '원' },
      insurance: { min: 500000, max: 3000000, unit: '원' },
      tax: { min: 200000, max: 1000000, unit: '원' },
      parking: { min: 0, max: 300000, unit: '원' },
      toll: { min: 0, max: 10000, unit: '원' },
      maintenance: { min: 500000, max: 2000000, unit: '원' },
      depreciation: { min: 1, max: 10, unit: '년' },
      hourlyWage: { min: 10000, max: 100000, unit: '원' },
    };

    const range = ranges[step];
    if (range && (parsedValue < range.min || parsedValue > range.max)) {
      const errorMessages: { [key: string]: string } = {
        'distance': `음... 거리가 조금 이상한 것 같아요. 보통 출퇴근 거리는 ${range.min}km에서 ${range.max}km 정도인데, 다시 한 번 확인해주시겠어요?`,
        'workDays': `한 달에 ${parsedValue}일 출근하신다고요? 일반적으로는 ${range.min}일에서 ${range.max}일 정도인데, 혹시 다시 확인해주실 수 있을까요?`,
        'publicTransportCost': `대중교통 요금이 ${parsedValue.toLocaleString()}원이라고요? 보통은 ${range.min.toLocaleString()}원에서 ${range.max.toLocaleString()}원 사이인데, 다시 한 번 확인해주세요!`,
        'publicTransportTime': `대중교통 시간이 ${parsedValue}분이라고요? 일반적으로는 ${range.min}분에서 ${range.max}분 정도인데, 혹시 잘못 입력하신 건 아닐까요?`,
        'carTime': `자동차로 ${parsedValue}분 걸린다고요? 보통은 ${range.min}분에서 ${range.max}분 사이인데, 다시 확인해주시겠어요?`,
        'carPrice': `차량 가격이 ${parsedValue.toLocaleString()}원이라고요? 일반적으로는 ${(range.min/10000).toLocaleString()}만원에서 ${(range.max/10000).toLocaleString()}만원 사이인데, 다시 한 번 확인해주세요!`,
        'currentCarValue': `차량 시세가 ${parsedValue.toLocaleString()}원이라고요? 보통은 ${(range.min/10000).toLocaleString()}만원에서 ${(range.max/10000).toLocaleString()}만원 사이인데, 다시 확인해주시겠어요?`,
        'monthlyCarLoan': `월 할부금이 ${parsedValue.toLocaleString()}원이라고요? 보통은 0원에서 ${(range.max/10000).toLocaleString()}만원 사이인데, 다시 확인해주세요!`,
        'remainingLoanMonths': `남은 할부 기간이 ${parsedValue}개월이라고요? 일반적으로는 ${range.min}개월에서 ${range.max}개월 정도인데, 혹시 다시 확인해주실 수 있을까요?`,
        'fuelEfficiency': `연비가 ${parsedValue}km/L라고요? 보통 차량 연비는 ${range.min}에서 ${range.max} 사이인데, 혹시 다시 확인해주실 수 있을까요?`,
        'fuelPrice': `유류비가 리터당 ${parsedValue.toLocaleString()}원이라고요? 일반적으로는 ${range.min.toLocaleString()}원에서 ${range.max.toLocaleString()}원 정도인데, 다시 확인해주세요!`,
        'insurance': `보험료가 연간 ${parsedValue.toLocaleString()}원이라고요? 보통은 ${(range.min/10000).toLocaleString()}만원에서 ${(range.max/10000).toLocaleString()}만원 사이인데, 다시 한 번 확인해주시겠어요?`,
        'tax': `자동차세가 연간 ${parsedValue.toLocaleString()}원이라고요? 일반적으로는 ${(range.min/10000).toLocaleString()}만원에서 ${(range.max/10000).toLocaleString()}만원 정도인데, 혹시 다시 확인해주실 수 있을까요?`,
        'parking': `주차비가 월 ${parsedValue.toLocaleString()}원이라고요? 보통은 0원에서 ${(range.max/10000).toLocaleString()}만원 사이인데, 다시 확인해주세요!`,
        'toll': `통행료가 편도 ${parsedValue.toLocaleString()}원이라고요? 일반적으로는 0원에서 ${range.max.toLocaleString()}원 정도인데, 혹시 다시 확인해주실 수 있을까요?`,
        'maintenance': `정비비가 연간 ${parsedValue.toLocaleString()}원이라고요? 보통은 ${(range.min/10000).toLocaleString()}만원에서 ${(range.max/10000).toLocaleString()}만원 사이인데, 다시 한 번 확인해주시겠어요?`,
        'depreciation': `차량을 ${parsedValue}년 사용하신다고요? 일반적으로는 ${range.min}년에서 ${range.max}년 정도인데, 혹시 다시 확인해주실 수 있을까요?`,
        'hourlyWage': `시급이 ${parsedValue.toLocaleString()}원이라고요? 보통은 ${(range.min/10000).toLocaleString()}만원에서 ${(range.max/10000).toLocaleString()}만원 사이인데, 다시 확인해주세요!`,
      };

      setTimeout(() => {
        addMessage('bot', errorMessages[step] || `입력하신 값이 범위를 벗어났어요. ${range.min.toLocaleString()}${range.unit}에서 ${range.max.toLocaleString()}${range.unit} 사이의 값을 입력해주세요.`);
      }, 300);
      return;
    }

    processStep(step, parsedValue);
  };

  const processStep = (currentStep: Step, value: number) => {
    switch (currentStep) {
      case 'distance':
        setCommute(prev => ({ ...prev, distance: value }));
        setStep('workDays');
        setTimeout(() => {
          addMessage('bot', '한 달에 출근하는 일수를 입력해주세요. 보통 주 5일 근무는 월 22일 정도입니다.');
          setTimeout(() => addMessage('bot', '예: "22" 또는 "모름"'), 300);
        }, 500);
        break;

      case 'workDays':
        setCommute(prev => ({ ...prev, workDaysPerMonth: value }));
        setStep('publicTransportCost');
        setTimeout(() => {
          addMessage('bot', '대중교통 편도 요금을 입력해주세요. 버스나 지하철 한 번 타는 비용입니다.');
          setTimeout(() => addMessage('bot', '예: "1650" 또는 "1650원"'), 300);
        }, 500);
        break;

      case 'publicTransportCost':
        setCommute(prev => ({ ...prev, publicTransportCost: value }));
        setStep('publicTransportTime');
        setTimeout(() => {
          addMessage('bot', '대중교통으로 이동하는 편도 시간을 분 단위로 입력해주세요.');
          setTimeout(() => addMessage('bot', '예: "60" 또는 "60분"'), 300);
        }, 500);
        break;

      case 'publicTransportTime':
        setCommute(prev => ({ ...prev, publicTransportTime: value }));
        setStep('carTime');
        setTimeout(() => {
          addMessage('bot', '자동차로 이동하는 편도 시간을 분 단위로 입력해주세요.');
          setTimeout(() => addMessage('bot', '예: "50" 또는 "50분"'), 300);
        }, 500);
        break;

      case 'carTime':
        setCommute(prev => ({ ...prev, carTime: value }));
        setStep('hasOwnCar');
        setTimeout(() => {
          addMessage('bot', '좋아요! 이제 자동차 관련 정보를 입력해주세요.');
          setTimeout(() => {
            addMessage('bot', '혹시 현재 차량을 보유하고 계신가요? (예/아니오)');
          }, 500);
        }, 500);
        break;

      case 'currentCarValue':
        // 현재 차량 시세 저장
        setCar(prev => ({ ...prev, currentCarValue: value }));
        setStep('hasCarLoan');
        setTimeout(() => {
          addMessage('bot', '현재 차량에 남은 할부금이 있나요? (예/아니오)');
        }, 500);
        break;

      case 'monthlyCarLoan':
        setCurrentCarLoan(prev => ({ ...prev, monthly: value }));
        setStep('remainingLoanMonths');
        setTimeout(() => {
          addMessage('bot', '할부금을 몇 개월 더 납부해야 하나요?');
          setTimeout(() => addMessage('bot', '예: "12" 또는 "12개월"'), 300);
        }, 500);
        break;

      case 'remainingLoanMonths':
        setCurrentCarLoan(prev => ({ ...prev, remainingMonths: value }));
        setStep('willBuyNewCar');
        setTimeout(() => {
          const totalRemainingLoan = currentCarLoan.monthly * value;
          addMessage('bot', `남은 할부금 총액은 ${totalRemainingLoan.toLocaleString()}원이네요. 이 금액도 고려하여 계산하겠습니다!`);
          setTimeout(() => {
            addMessage('bot', '현재 차량을 팔고 새 차량으로 바꾸실 건가요? (예/아니오)');
          }, 500);
        }, 500);
        break;

      case 'carPrice':
        if (hasOwnCar && willBuyNewCar && car.currentCarValue) {
          const currentValue = car.currentCarValue;
          const remainingLoan = currentCarLoan.monthly * currentCarLoan.remainingMonths;
          const netCurrentValue = currentValue - remainingLoan;
          
          // 현재 차량 순가치가 음수면 경고
          if (netCurrentValue < 0) {
            setTimeout(() => {
              addMessage('bot', `현재 차량 시세(${currentValue.toLocaleString()}원)보다 남은 할부금(${remainingLoan.toLocaleString()}원)이 더 많네요. 차량을 판매해도 빚이 ${Math.abs(netCurrentValue).toLocaleString()}원 남습니다.`);
            }, 300);
          }
          
          // 실제 구매 비용 = 새 차량 가격 - (현재 차량 시세 - 남은 할부금)
          const netCarCost = value - netCurrentValue;
          setCar(prev => ({ ...prev, purchasePrice: Math.max(0, netCarCost) }));
          setStep('fuelEfficiency');
          setTimeout(() => {
            if (netCurrentValue > 0) {
              addMessage('bot', `현재 차량을 ${currentValue.toLocaleString()}원에 판매하고 남은 할부금 ${remainingLoan.toLocaleString()}원을 갚으면, 실제 차량 구매 비용은 ${Math.max(0, netCarCost).toLocaleString()}원이 되겠네요!`);
            } else {
              addMessage('bot', `실제 차량 구매 비용은 ${Math.max(0, netCarCost).toLocaleString()}원이 되겠네요!`);
            }
            setTimeout(() => {
              addMessage('bot', '차량의 연비를 km/L 단위로 입력해주세요. 보통 경차는 15, 중형차는 12 정도입니다.');
              setTimeout(() => addMessage('bot', '예: "12" 또는 "모름"'), 300);
            }, 500);
          }, 500);
        } else {
          setCar(prev => ({ ...prev, purchasePrice: value }));
          setStep('fuelEfficiency');
          setTimeout(() => {
            addMessage('bot', '차량의 연비를 km/L 단위로 입력해주세요. 보통 경차는 15, 중형차는 12 정도입니다.');
            setTimeout(() => addMessage('bot', '예: "12" 또는 "모름"'), 300);
          }, 500);
        }
        break;

      case 'fuelEfficiency':
        setCar(prev => ({ ...prev, fuelEfficiency: value }));
        setStep('fuelPrice');
        setTimeout(() => {
          addMessage('bot', '현재 유류비를 리터당 가격으로 입력해주세요.');
          setTimeout(() => addMessage('bot', '예: "1650" 또는 "1650원"'), 300);
        }, 500);
        break;

      case 'fuelPrice':
        setCar(prev => ({ ...prev, fuelPrice: value }));
        setStep('insurance');
        setTimeout(() => {
          addMessage('bot', '연간 자동차 보험료를 입력해주세요.');
          setTimeout(() => addMessage('bot', '예: "120만원" 또는 "1200000"'), 300);
        }, 500);
        break;

      case 'insurance':
        setCar(prev => ({ ...prev, insurance: value }));
        setStep('tax');
        setTimeout(() => {
          addMessage('bot', '연간 자동차세를 입력해주세요. 배기량에 따라 다르며, 보통 40만원 정도입니다.');
          setTimeout(() => addMessage('bot', '예: "40만원" 또는 "400000"'), 300);
        }, 500);
        break;

      case 'tax':
        setCar(prev => ({ ...prev, tax: value }));
        setStep('parking');
        setTimeout(() => {
          addMessage('bot', '월 주차비를 입력해주세요. 주차장이 없으면 "0" 또는 "없음"을 입력하세요.');
          setTimeout(() => addMessage('bot', '예: "10만원" 또는 "없음"'), 300);
        }, 500);
        break;

      case 'parking':
        setCar(prev => ({ ...prev, parkingFee: value }));
        setStep('toll');
        setTimeout(() => {
          addMessage('bot', '편도 통행료를 입력해주세요. 고속도로를 이용하지 않으면 "0" 또는 "없음"을 입력하세요.');
          setTimeout(() => addMessage('bot', '예: "3000원" 또는 "없음"'), 300);
        }, 500);
        break;

      case 'toll':
        setCar(prev => ({ ...prev, tollFee: value }));
        setStep('maintenance');
        setTimeout(() => {
          addMessage('bot', '연간 정비비를 입력해주세요. 엔진오일, 타이어 교체 등의 비용입니다. 보통 80만원 정도입니다.');
          setTimeout(() => addMessage('bot', '예: "80만원" 또는 "800000"'), 300);
        }, 500);
        break;

      case 'maintenance':
        setCar(prev => ({ ...prev, maintenanceFee: value }));
        // 현재 차량 유지 시 감가상각 질문 건너뛰기
        if (hasOwnCar && !willBuyNewCar) {
          setStep('hourlyWage');
          setTimeout(() => {
            addMessage('bot', '마지막 질문입니다!');
            setTimeout(() => {
              addMessage('bot', '본인의 시급을 입력해주세요. 시간의 가치를 계산하는데 사용됩니다.');
              setTimeout(() => addMessage('bot', '예: "2만원" 또는 "20000"'), 300);
            }, 500);
          }, 500);
        } else {
          setStep('depreciation');
          setTimeout(() => {
            addMessage('bot', '차량을 몇 년 동안 사용할 계획인지 입력해주세요.');
            setTimeout(() => addMessage('bot', '예: "3" 또는 "3년"'), 300);
          }, 500);
        }
        break;

      case 'depreciation':
        setCar(prev => ({ ...prev, depreciationYears: value }));
        setStep('hourlyWage');
        setTimeout(() => {
          addMessage('bot', '마지막 질문입니다!');
          setTimeout(() => {
            addMessage('bot', '본인의 시급을 입력해주세요. 시간의 가치를 계산하는데 사용됩니다.');
            setTimeout(() => addMessage('bot', '예: "2만원" 또는 "20000"'), 300);
          }, 500);
        }, 500);
        break;

      case 'hourlyWage':
        setTimeValue({ hourlyWage: value });
        setStep('result');
        setTimeout(() => {
          addMessage('bot', '계산 중입니다...');
          setTimeout(() => showResult(value), 1000);
        }, 500);
        break;
    }
  };

  const showResult = (hourlyWage: number) => {
    try {
      const finalCommute: CommuteInfo = commute as CommuteInfo;
      const finalCar: CarCosts = car as CarCosts;
      const finalTimeValue: TimeValue = { hourlyWage };

      // 필수 값 검증
      if (!finalCommute.distance || !finalCommute.workDaysPerMonth || !finalCommute.publicTransportCost || 
          !finalCommute.publicTransportTime || !finalCommute.carTime) {
        addMessage('bot', '입력 정보가 부족합니다. 페이지를 새로고침하고 다시 시도해주세요.');
        return;
      }

      // 차량 정보 검증 (purchasePrice와 depreciationYears는 0일 수 있음)
      if (finalCar.purchasePrice === undefined || !finalCar.fuelEfficiency || !finalCar.fuelPrice || 
          !finalCar.insurance || !finalCar.tax || finalCar.parkingFee === undefined || 
          finalCar.tollFee === undefined || !finalCar.maintenanceFee || finalCar.depreciationYears === undefined) {
        addMessage('bot', '차량 정보가 부족합니다. 페이지를 새로고침하고 다시 시도해주세요.');
        return;
      }

      const result = calculateCosts(finalCommute, finalCar, finalTimeValue);
      setCalculationResult(result);

      addMessage('bot', '계산이 완료되었습니다!');
      
      setTimeout(() => {
        let recommendation = '';
        if (result.recommendation === 'publicTransport') {
          recommendation = '대중교통을 이용하시는 것이 경제적으로 유리합니다!';
        } else if (result.recommendation === 'car') {
          if (hasOwnCar && !willBuyNewCar) {
            recommendation = '현재 차량으로 출퇴근하시는 것이 경제적으로 유리합니다!';
          } else {
            recommendation = '자동차를 구매하시는 것이 경제적으로 유리합니다!';
          }
        } else {
          recommendation = '두 선택의 비용이 비슷합니다. 편의성을 고려하여 선택하세요!';
        }
        addMessage('bot', recommendation);
      }, 800);

      setTimeout(() => {
        addMessage('bot', '\n오른쪽 차트에서 자세한 비용 비교를 확인하세요!\n시간 비용 포함 여부를 토글로 조절할 수 있습니다.');
      }, 1500);
    } catch (error) {
      console.error('계산 오류:', error);
      addMessage('bot', '계산 중 오류가 발생했습니다. 페이지를 새로고침하고 다시 시도해주세요.');
    }
  };

  return (
    <div style={{
      display: 'flex',
      gap: '24px',
      maxWidth: calculationResult ? 'none' : '800px',
      width: '100%',
      margin: '0 auto',
      transition: 'all 0.6s ease',
    }}>
      {/* 채팅창 */}
      <div style={{
        flex: calculationResult ? '0 0 480px' : '1',
        backgroundColor: 'white',
        borderRadius: '16px',
        boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        height: '85vh',
        transition: 'all 0.6s ease',
      }}>
        <div style={{
          backgroundColor: 'white',
          color: '#333',
          padding: '20px 24px',
          borderBottom: '1px solid #e2e8f0',
        }}>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', margin: 0 }}>출퇴근 비용 계산 도우미</h2>
          <p style={{ fontSize: '14px', color: '#666', margin: '4px 0 0 0' }}>자동차 vs 대중교통 비교</p>
        </div>

        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '20px',
          backgroundColor: '#f5f5f5',
        }}>
          {messages.map((msg, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                justifyContent: msg.type === 'user' ? 'flex-end' : 'flex-start',
                marginBottom: '12px',
              }}
            >
              <div
                style={{
                  maxWidth: '70%',
                  padding: '12px 16px',
                  borderRadius: '16px',
                  whiteSpace: 'pre-line',
                  lineHeight: '1.5',
                  fontSize: '15px',
                  ...(msg.type === 'user' ? {
                    background: 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)',
                    color: 'white',
                    borderBottomRightRadius: '4px',
                    boxShadow: '0 2px 8px rgba(76, 175, 80, 0.3)',
                  } : {
                    background: 'linear-gradient(135deg, #916AFF 0%, #7d5ae0 100%)',
                    color: 'white',
                    borderBottomLeftRadius: '4px',
                    boxShadow: '0 2px 8px rgba(145, 106, 255, 0.3)',
                  })
                }}
              >
                {msg.text}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {step !== 'result' && (
          <div style={{
            padding: '16px 20px',
            backgroundColor: 'white',
            borderTop: '1px solid #e2e8f0',
          }}>
            {getQuickButtons().length > 0 && (
              <div style={{
                display: 'flex',
                gap: '8px',
                marginBottom: '12px',
                flexWrap: 'wrap',
              }}>
                {getQuickButtons().map((buttonText) => (
                  <button
                    key={buttonText}
                    type="button"
                    onClick={() => handleQuickButton(buttonText)}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: '#f8f9fa',
                      color: '#495057',
                      border: '1px solid #dee2e6',
                      borderRadius: '20px',
                      fontSize: '14px',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#e9ecef';
                      e.currentTarget.style.borderColor = '#916AFF';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#f8f9fa';
                      e.currentTarget.style.borderColor = '#dee2e6';
                    }}
                  >
                    {buttonText}
                  </button>
                ))}
              </div>
            )}
            
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="답변을 입력하세요..."
                  style={{
                    flex: 1,
                    padding: '14px 20px',
                    border: '2px solid #e2e8f0',
                    borderRadius: '24px',
                    fontSize: '15px',
                    outline: 'none',
                    transition: 'border-color 0.2s',
                    backgroundColor: '#f8fafc',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#916AFF';
                    e.target.style.backgroundColor = 'white';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e2e8f0';
                    e.target.style.backgroundColor = '#f8fafc';
                  }}
                  autoFocus
                />
                <button
                  type="submit"
                  style={{
                    padding: '0',
                    backgroundColor: '#916AFF',
                    color: 'white',
                    border: 'none',
                    borderRadius: '50%',
                    width: '48px',
                    height: '48px',
                    minWidth: '48px',
                    minHeight: '48px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#7d5ae0';
                    e.currentTarget.style.transform = 'scale(1.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#916AFF';
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  <svg 
                    width="20" 
                    height="20" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2.5" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                    style={{
                      display: 'block',
                    }}
                  >
                    <line x1="22" y1="2" x2="11" y2="13"></line>
                    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                  </svg>
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* 차트 영역 */}
      {calculationResult && (
        <div style={{
          flex: 1,
          minWidth: 0,
          backgroundColor: 'white',
          borderRadius: '16px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
          padding: '30px',
          height: '85vh',
          overflowY: 'auto',
          animation: 'slideIn 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
        }}>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px', color: '#333' }}>비용 비교 분석</h2>
          
          {/* 시간비용 포함 토글 */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '12px', 
            marginBottom: '30px', 
            padding: '14px 18px', 
            backgroundColor: '#f3f0ff', 
            borderRadius: '12px',
            border: '1px solid #e0d4ff',
          }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', flex: 1 }}>
              <div 
                onClick={() => setIncludeTimeCost(!includeTimeCost)}
                style={{
                  width: '44px',
                  height: '24px',
                  backgroundColor: includeTimeCost ? '#916AFF' : '#cbd5e1',
                  borderRadius: '12px',
                  position: 'relative',
                  transition: 'background-color 0.2s',
                  cursor: 'pointer',
                  flexShrink: 0,
                }}
              >
                <div style={{
                  width: '20px',
                  height: '20px',
                  backgroundColor: 'white',
                  borderRadius: '50%',
                  position: 'absolute',
                  top: '2px',
                  left: includeTimeCost ? '22px' : '2px',
                  transition: 'left 0.2s',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                }} />
              </div>
              <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#333' }}>시간 가치를 비용에 포함</span>
            </label>
            <span style={{ fontSize: '12px', color: '#666' }}>
              {includeTimeCost ? 'ON' : 'OFF'}
            </span>
          </div>

          {/* 총 비용 비교 막대 그래프 */}
          <div style={{ marginBottom: '40px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '20px', color: '#666' }}>월 총 비용 비교</h3>
            <div style={{ height: '250px' }}>
              <Bar
                data={{
                  labels: ['대중교통', '자동차'],
                  datasets: [{
                    label: '월 총 비용 (원)',
                    data: [
                      Math.round(includeTimeCost 
                        ? calculationResult.publicTransport.totalMonthlyCost 
                        : calculationResult.publicTransport.monthlyCost),
                      Math.round(includeTimeCost 
                        ? calculationResult.car.totalMonthlyCost 
                        : calculationResult.car.monthlyCost)
                    ],
                    backgroundColor: ['#3b82f6', '#ef4444'],
                    borderRadius: 8,
                  }]
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { display: false },
                    tooltip: {
                      callbacks: {
                        label: (context) => `${(context.parsed.y ?? 0).toLocaleString()}원`
                      }
                    }
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        callback: (value) => `${(value as number).toLocaleString()}원`
                      }
                    }
                  }
                }}
              />
            </div>
          </div>

          {/* 비용 차이 */}
          <div style={{ marginBottom: '40px', padding: '20px', backgroundColor: '#f9fafb', borderRadius: '12px' }}>
            <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>월 비용 차이 {!includeTimeCost && '(시간비용 제외)'}</div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#916AFF' }}>
              {(() => {
                const pubCost = includeTimeCost ? calculationResult.publicTransport.totalMonthlyCost : calculationResult.publicTransport.monthlyCost;
                const carCost = includeTimeCost ? calculationResult.car.totalMonthlyCost : calculationResult.car.monthlyCost;
                return Math.round(Math.abs(carCost - pubCost)).toLocaleString();
              })()}원
            </div>
            <div style={{ fontSize: '14px', color: '#666', marginTop: '8px' }}>
              {(() => {
                const pubCost = includeTimeCost ? calculationResult.publicTransport.totalMonthlyCost : calculationResult.publicTransport.monthlyCost;
                const carCost = includeTimeCost ? calculationResult.car.totalMonthlyCost : calculationResult.car.monthlyCost;
                return carCost < pubCost ? '자동차가 더 저렴합니다' : '대중교통이 더 저렴합니다';
              })()}
            </div>
          </div>

          {/* 자동차 비용 구성 도넛 차트 */}
          <div style={{ marginBottom: '40px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '20px', color: '#666' }}>자동차 비용 구성</h3>
            <div style={{ height: '300px', display: 'flex', justifyContent: 'center' }}>
              <Doughnut
                data={{
                  labels: includeTimeCost 
                    ? ['감가상각', '유류비', '보험료', '자동차세', '주차비', '통행료', '정비비', '시간 비용']
                    : ['감가상각', '유류비', '보험료', '자동차세', '주차비', '통행료', '정비비'],
                  datasets: [{
                    data: includeTimeCost 
                      ? [
                          Math.round(calculationResult.car.breakdown.depreciation),
                          Math.round(calculationResult.car.breakdown.fuel),
                          Math.round(calculationResult.car.breakdown.insurance),
                          Math.round(calculationResult.car.breakdown.tax),
                          Math.round(calculationResult.car.breakdown.parking),
                          Math.round(calculationResult.car.breakdown.toll),
                          Math.round(calculationResult.car.breakdown.maintenance),
                          Math.round(calculationResult.car.timeCost),
                        ]
                      : [
                          Math.round(calculationResult.car.breakdown.depreciation),
                          Math.round(calculationResult.car.breakdown.fuel),
                          Math.round(calculationResult.car.breakdown.insurance),
                          Math.round(calculationResult.car.breakdown.tax),
                          Math.round(calculationResult.car.breakdown.parking),
                          Math.round(calculationResult.car.breakdown.toll),
                          Math.round(calculationResult.car.breakdown.maintenance),
                        ],
                    backgroundColor: includeTimeCost
                      ? ['#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16', '#22c55e', '#10b981', '#14b8a6']
                      : ['#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16', '#22c55e', '#10b981'],
                    borderWidth: 2,
                    borderColor: '#fff',
                  }]
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'right',
                      labels: {
                        boxWidth: 15,
                        padding: 10,
                        font: { size: 12 }
                      }
                    },
                    tooltip: {
                      callbacks: {
                        label: (context) => `${context.label}: ${context.parsed.toLocaleString()}원`
                      }
                    }
                  }
                }}
              />
            </div>
          </div>

          {/* 대중교통 vs 자동차 세부 비교 */}
          <div style={{ marginBottom: '30px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '15px', color: '#666' }}>세부 비용 비교</h3>
            <div style={{ display: 'flex', gap: '20px' }}>
              <div style={{ flex: 1 }}>
                <h4 style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '10px', color: '#3b82f6' }}>대중교통</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', backgroundColor: '#f0f9ff', borderRadius: '8px' }}>
                    <span style={{ fontSize: '13px' }}>교통비</span>
                    <span style={{ fontSize: '13px', fontWeight: 'bold' }}>{Math.round(calculationResult.publicTransport.monthlyCost).toLocaleString()}원</span>
                  </div>
                  {includeTimeCost && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', backgroundColor: '#f0f9ff', borderRadius: '8px' }}>
                      <span style={{ fontSize: '13px' }}>시간 비용</span>
                      <span style={{ fontSize: '13px', fontWeight: 'bold' }}>{Math.round(calculationResult.publicTransport.timeCost).toLocaleString()}원</span>
                    </div>
                  )}
                </div>
              </div>
              <div style={{ flex: 1 }}>
                <h4 style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '10px', color: '#ef4444' }}>자동차</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {[
                    { label: '감가상각', value: calculationResult.car.breakdown.depreciation },
                    { label: '유류비', value: calculationResult.car.breakdown.fuel },
                    { label: '보험료', value: calculationResult.car.breakdown.insurance },
                    { label: '자동차세', value: calculationResult.car.breakdown.tax },
                    { label: '주차비', value: calculationResult.car.breakdown.parking },
                    { label: '통행료', value: calculationResult.car.breakdown.toll },
                    { label: '정비비', value: calculationResult.car.breakdown.maintenance },
                    ...(includeTimeCost ? [{ label: '시간 비용', value: calculationResult.car.timeCost }] : []),
                  ].map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', backgroundColor: '#fef3f2', borderRadius: '8px' }}>
                      <span style={{ fontSize: '13px' }}>{item.label}</span>
                      <span style={{ fontSize: '13px', fontWeight: 'bold' }}>{Math.round(item.value).toLocaleString()}원</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 손익분기점 */}
          <div style={{ padding: '20px', backgroundColor: '#fef9c3', borderRadius: '12px', border: '2px solid #eab308', marginBottom: '20px' }}>
            <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>💡 손익분기점</div>
            <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#854d0e' }}>
              {calculationResult.breakEvenMonths === 0
                ? '해당 없음 (현재 차량 보유 중)'
                : calculationResult.breakEvenMonths === Infinity 
                ? '없음 (대중교통이 항상 저렴)' 
                : `약 ${Math.floor(calculationResult.breakEvenMonths / 12)}년 ${Math.round(calculationResult.breakEvenMonths % 12)}개월`}
            </div>
          </div>

          {/* 새로고침 버튼 */}
          <button
            onClick={() => window.location.reload()}
            style={{
              width: '100%',
              padding: '16px',
              backgroundColor: '#916AFF',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#7d5ae0';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#916AFF';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            다시 계산하기
          </button>
        </div>
      )}

      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(80px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
}
