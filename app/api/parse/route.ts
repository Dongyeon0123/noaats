import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { text, questionType } = await req.json();

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
    }

    const systemPrompt = `You are a Korean number parser for a commute cost calculator. Extract the final numeric value in KRW (원).

IMPORTANT: The value you return must be the FINAL amount in 원 (KRW). Do all unit conversions yourself.

Korean number words: 일=1, 이=2, 삼=3, 사=4, 오=5, 육=6, 칠=7, 팔=8, 구=9, 십=10, 백=100, 천=1000, 만=10000, 억=100000000.
Example: "이천오백만원" = 2500 * 10000 = 25,000,000

Question type contexts and their expected units:
- carPrice, currentCarValue: 원 (car prices typically 1,000만~10,000만원). "2천5백" = 2500만원 = 25,000,000원. "이천오백만원" = 25,000,000원
- insurance, tax, maintenance: 원 (yearly, typically 50만~300만원). "180" = 180만원 = 1,800,000원
- monthlyCarLoan, parking: 원 (monthly, typically 0~200만원). "25" = 25만원 = 250,000원
- hourlyWage: 원 (typically 1만~10만원). "2" = 2만원 = 20,000원
- fuelPrice: 원/L (typically 1,500~2,000원). Return as-is.
- toll, publicTransportCost: 원 (per trip). Return as-is.
- distance: km. Return as-is.
- workDays: days. Return as-is.
- publicTransportTime, carTime: minutes. Return as-is.
- depreciation, remainingLoanMonths: number. Return as-is.

Key rule: When Korean units like 천/백 are used WITHOUT 만/원 for price-related questions, the user means 만원 units.

Special values:
- "없음/없어" → 0
- "모름/몰라" → null  
- Car model names (e.g. "셀토스", "그랜저", "아반떼") → -1

Return ONLY: {"value": <number or null>}
No explanation, no markdown.`;

    const userPrompt = `Input: "${text}"\nQuestion type: ${questionType}`;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0,
        max_tokens: 50,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Groq API error:', errorText);
      return NextResponse.json({ error: 'Groq API error' }, { status: 500 });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content?.trim();

    if (!content) {
      return NextResponse.json({ value: null });
    }

    // JSON 파싱
    const parsed = JSON.parse(content);
    return NextResponse.json({ value: parsed.value ?? null });
  } catch (error) {
    console.error('Parse API error:', error);
    return NextResponse.json({ value: null }, { status: 200 });
  }
}
