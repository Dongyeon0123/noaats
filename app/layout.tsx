import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "출퇴근 비용 계산기 - 자동차 vs 대중교통",
  description: "자동차 구매와 대중교통 이용의 총 비용을 비교하고 손익분기점을 계산합니다.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
