import Calculator from './components/Calculator';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            🚗 vs 🚌 출퇴근 비용 계산기
          </h1>
          <p className="text-gray-600">
            자동차 구매 vs 대중교통, 어떤 선택이 현명할까요?
          </p>
        </header>
        <Calculator />
      </div>
    </main>
  );
}
