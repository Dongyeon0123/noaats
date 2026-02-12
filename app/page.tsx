import ChatCalculator from './components/ChatCalculator';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="mx-auto w-full">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            🚗 vs 🚌 출퇴근 비용 계산기
          </h1>
          <p className="text-gray-600">
            대화형 챗봇이 단계별로 안내해드립니다
          </p>
        </header>
        <ChatCalculator />
      </div>
    </main>
  );
}
