'use client';

import { useState, useEffect, useRef } from 'react';
import { CommuteInfo, CarCosts, TimeValue } from '../types';
import { calculateCosts } from '../utils/calculator';

type Step = 
  | 'welcome'
  | 'distance'
  | 'workDays'
  | 'publicTransportCost'
  | 'publicTransportTime'
  | 'carTime'
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

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const addMessage = (type: 'bot' | 'user', text: string) => {
    setMessages(prev => [...prev, { type, text }]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    addMessage('user', input);
    processInput(input);
    setInput('');
  };

  const processInput = (value: string) => {
    const numValue = parseFloat(value.replace(/[^0-9.]/g, ''));

    switch (step) {
      case 'welcome':
        if (value.includes('예') || value.toLowerCase().includes('y')) {
          setStep('distance');
          setTimeout(() => addMessage('bot', '집에서 회사까지 편도 거리가 몇 km인가요? (예: 50)'), 500);
        } else {
          setTimeout(() => addMessage('bot', '언제든 다시 방문해주세요!'), 500);
        }
        break;

      case 'distance':
        setCommute(prev => ({ ...prev, distance: numValue }));
        setStep('workDays');
        setTimeout(() => addMessage('bot', '한 달에 며칠 출근하시나요? (예: 22)'), 500);
        break;

      case 'workDays':
        setCommute(prev => ({ ...prev, workDaysPerMonth: numValue }));
        setStep('publicTransportCost');
        setTimeout(() => addMessage('bot', '대중교통 편도 비용은 얼마인가요? (예: 3200)'), 500);
        break;

      case 'publicTransportCost':
        setCommute(prev => ({ ...prev, publicTransportCost: numValue }));
        setStep('publicTransportTime');
        setTimeout(() => addMessage('bot', '대중교통으로 편도 몇 분 걸리나요? (예: 90)'), 500);
        break;

      case 'publicTransportTime':
        setCommute(prev => ({ ...prev, publicTransportTime: numValue }));
        setStep('carTime');
        setTimeout(() => addMessage('bot', '자동차로는 편도 몇 분 걸릴까요? (예: 60)'), 500);
        break;

      case 'carTime':
        setCommute(prev => ({ ...prev, carTime: numValue }));
        setStep('carPrice');
        setTimeout(() => {
          addMessage('bot', '좋아요! 이제 자동차 관련 정보를 입력해주세요.');
          setTimeout(() => addMessage('bot', '구매하려는 차량 가격은 얼마인가요? (예: 30000000)'), 500);
        }, 500);
        break;

      case 'carPrice':
        setCar(prev => ({ ...prev, purchasePrice: numValue }));
        setStep('fuelEfficiency');
        setTimeout(() => addMessage('bot', '차량 연비는 몇 km/L인가요? (예: 12)'), 500);
        break;

      case 'fuelEfficiency':
        setCar(prev => ({ ...prev, fuelEfficiency: numValue }));
        setStep('fuelPrice');
        setTimeout(() => addMessage('bot', '유류비는 리터당 얼마인가요? (예: 1600)'), 500);
        break;

      case 'fuelPrice':
        setCar(prev => ({ ...prev, fuelPrice: numValue }));
        setStep('insurance');
        setTimeout(() => addMessage('bot', '연간 보험료는 얼마인가요? (예: 1200000)'), 500);
        break;

      case 'insurance':
        setCar(prev => ({ ...prev, insurance: numValue }));
        setStep('tax');
        setTimeout(() => addMessage('bot', '연간 자동차세는 얼마인가요? (예: 400000)'), 500);
        break;

      case 'tax':
        setCar(prev => ({ ...prev, tax: numValue }));
        setStep('parking');
        setTimeout(() => addMessage('bot', '월 주차비는 얼마인가요? (예: 100000)'), 500);
        break;

      case 'parking':
        setCar(prev => ({ ...prev, parkingFee: numValue }));
        setStep('toll');
        setTimeout(() => addMessage('bot', '편도 통행료는 얼마인가요? (예: 3000)'), 500);
        break;

      case 'toll':
        setCar(prev => ({ ...prev, tollFee: numValue }));
        setStep('maintenance');
        setTimeout(() => addMessage('bot', '연간 정비비는 얼마 정도 예상하시나요? (예: 800000)'), 500);
        break;

      case 'maintenance':
        setCar(prev => ({ ...prev, maintenanceFee: numValue }));
        setStep('depreciation');
        setTimeout(() => addMessage('bot', '차량을 몇 년 동안 사용하실 계획인가요? (감가상각 기간, 예: 5)'), 500);
        break;

      case 'depreciation':
        setCar(prev => ({ ...prev, depreciationYears: numValue }));
        setStep('hourlyWage');
        setTimeout(() => {
          addMessage('bot', '마지막 질문입니다!');
          setTimeout(() => addMessage('bot', '시간의 가치를 계산하기 위해, 본인의 시급은 얼마로 생각하시나요? (예: 20000)'), 500);
        }, 500);
        break;

      case 'hourlyWage':
        setTimeValue({ hourlyWage: numValue });
        setStep('result');
        setTimeout(() => {
          addMessage('bot', '계산 중입니다...');
          setTimeout(() => showResult(numValue), 1000);
        }, 500);
        break;
    }
  };

  const showResult = (hourlyWage: number) => {
    const finalCommute: CommuteInfo = commute as CommuteInfo;
    const finalCar: CarCosts = car as CarCosts;
    const finalTimeValue: TimeValue = { hourlyWage };

    const result = calculateCosts(finalCommute, finalCar, finalTimeValue);

    addMessage('bot', '계산이 완료되었습니다!');
    
    setTimeout(() => {
      addMessage('bot', `\n대중교통 월 총 비용: ${result.publicTransport.totalMonthlyCost.toLocaleString()}원\n- 교통비: ${result.publicTransport.monthlyCost.toLocaleString()}원\n- 시간 비용: ${result.publicTransport.timeCost.toLocaleString()}원`);
    }, 500);

    setTimeout(() => {
      addMessage('bot', `\n자동차 월 총 비용: ${result.car.totalMonthlyCost.toLocaleString()}원\n- 감가상각: ${result.car.breakdown.depreciation.toLocaleString()}원\n- 유류비: ${result.car.breakdown.fuel.toLocaleString()}원\n- 보험: ${result.car.breakdown.insurance.toLocaleString()}원\n- 세금: ${result.car.breakdown.tax.toLocaleString()}원\n- 주차비: ${result.car.breakdown.parking.toLocaleString()}원\n- 통행료: ${result.car.breakdown.toll.toLocaleString()}원\n- 정비비: ${result.car.breakdown.maintenance.toLocaleString()}원\n- 시간 비용: ${result.car.timeCost.toLocaleString()}원`);
    }, 1000);

    setTimeout(() => {
      const diff = Math.abs(result.car.totalMonthlyCost - result.publicTransport.totalMonthlyCost);
      addMessage('bot', `\n월 비용 차이: ${diff.toLocaleString()}원`);
    }, 1500);

    setTimeout(() => {
      if (result.breakEvenMonths === Infinity) {
        addMessage('bot', '\n손익분기점: 없음 (대중교통이 항상 저렴합니다)');
      } else {
        const years = Math.floor(result.breakEvenMonths / 12);
        const months = Math.round(result.breakEvenMonths % 12);
        addMessage('bot', `\n손익분기점: 약 ${years}년 ${months}개월`);
      }
    }, 2000);

    setTimeout(() => {
      let recommendation = '';
      if (result.recommendation === 'publicTransport') {
        recommendation = '추천: 대중교통을 이용하시는 것이 경제적으로 유리합니다!';
      } else if (result.recommendation === 'car') {
        recommendation = '추천: 자동차를 구매하시는 것이 경제적으로 유리합니다!';
      } else {
        recommendation = '추천: 두 선택의 비용이 비슷합니다. 편의성을 고려하여 선택하세요!';
      }
      addMessage('bot', `\n${recommendation}`);
    }, 2500);

    setTimeout(() => {
      addMessage('bot', '\n다시 계산하시려면 페이지를 새로고침해주세요!');
    }, 3000);
  };

  return (
    <div style={{
      maxWidth: '800px',
      margin: '0 auto',
      backgroundColor: 'white',
      borderRadius: '16px',
      boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      height: '85vh',
    }}>
      {/* 헤더 */}
      <div style={{
        backgroundColor: 'white',
        color: '#333',
        padding: '20px 24px',
        borderBottom: '1px solid #e2e8f0',
      }}>
        <h2 style={{ fontSize: '20px', fontWeight: 'bold', margin: 0 }}>출퇴근 비용 계산 도우미</h2>
        <p style={{ fontSize: '14px', color: '#666', margin: '4px 0 0 0' }}>AI 챗봇이 도와드립니다</p>
      </div>

      {/* 메시지 영역 */}
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

      {/* 입력 영역 */}
      {step !== 'result' && (
        <form onSubmit={handleSubmit} style={{
          padding: '16px 20px',
          backgroundColor: 'white',
          borderTop: '1px solid #e2e8f0',
        }}>
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
                  transform: 'rotate(0deg)',
                }}
              >
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
