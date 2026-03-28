import { NextResponse } from 'next/server';
import { getRawData, getSummaryData, appendRaw } from '@/lib/sheets';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const year = searchParams.get('year') ? Number(searchParams.get('year')) : null;
    const month = searchParams.get('month') ? Number(searchParams.get('month')) : null;
    const source = searchParams.get('source');

    // source=raw の場合はrawのみ返す
    if (source === 'raw') {
      const data = await getRawData();
      const filtered = data.filter(d => (!year || d.year === year) && (!month || d.month === month));
      return NextResponse.json({ source: 'raw', data: filtered });
    }

    // source=summary の場合はsummaryのみ返す
    if (source === 'summary') {
      const data = await getSummaryData();
      const filtered = data.filter(d => (!year || d.year === year) && (!month || d.month === month));
      return NextResponse.json({ source: 'summary', data: filtered });
    }

    // デフォルト: summary + raw を合算して返す
    const [summaryData, rawData] = await Promise.all([getSummaryData(), getRawData()]);

    const filteredSummary = summaryData.filter(d => (!year || d.year === year) && (!month || d.month === month));
    const filteredRaw = rawData.filter(d => (!year || d.year === year) && (!month || d.month === month));

    // summaryをカテゴリ別にまとめる
    const merged = new Map<string, {
      categoryId: string; categoryName: string; type: string; group: string; amount: number;
      year: number; month: number;
    }>();

    filteredSummary.forEach(s => {
      const key = `${s.year}-${s.month}-${s.categoryId}`;
      merged.set(key, { ...s });
    });

    // rawデータを加算
    filteredRaw.forEach(r => {
      const key = `${r.year}-${r.month}-${r.categoryId}`;
      const existing = merged.get(key);
      if (existing) {
        existing.amount += r.amount;
      } else {
        merged.set(key, {
          categoryId: r.categoryId, categoryName: r.categoryName,
          type: r.type, group: r.group, amount: r.amount,
          year: r.year, month: r.month,
        });
      }
    });

    const data = Array.from(merged.values());

    // rawの個別取引も返す（出入金画面用）
    return NextResponse.json({
      source: 'merged',
      data,
      rawTransactions: filteredRaw,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = await appendRaw(body);
    return NextResponse.json(result);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
