import { NextResponse } from 'next/server';
import { calculateVAT } from '@/utils/eu-vat-rates';

export async function POST(req: Request) {
  try {
    const { countryCode, isCompany, vatNumber } = await req.json();

    if (!countryCode) {
      return NextResponse.json({ error: 'countryCode is required' }, { status: 400 });
    }

    const vatResult = await calculateVAT(countryCode, isCompany, vatNumber);

    return NextResponse.json(vatResult);
  } catch (error: any) {
    console.error('VAT validation route error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
