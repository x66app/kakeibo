import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';

const SS = process.env.GOOGLE_SPREADSHEET_ID!;

function getAuth() {
  const credPath = path.join(process.cwd(), 'google-credentials.json');
  if (fs.existsSync(credPath)) {
    return new google.auth.GoogleAuth({
      credentials: JSON.parse(fs.readFileSync(credPath, 'utf8')),
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
  }
  return new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: (process.env.GOOGLE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
}

export async function PATCH(req: Request) {
  try {
    const { year, month, categoryId, amount } = await req.json();
    const sheets = google.sheets({ version: 'v4', auth: getAuth() });
    const res = await sheets.spreadsheets.values.get({ spreadsheetId: SS, range: '_summary!A:G' });
    const rows = res.data.values || [];

    let rowIndex = -1;
    for (let i = 1; i < rows.length; i++) {
      if (Number(rows[i][0]) === year && Number(rows[i][1]) === month && rows[i][2] === categoryId) {
        rowIndex = i + 1;
        break;
      }
    }

    if (rowIndex === -1) {
      return NextResponse.json({ error: 'Row not found' }, { status: 404 });
    }

    await sheets.spreadsheets.values.update({
      spreadsheetId: SS,
      range: `_summary!G${rowIndex}`,
      valueInputOption: 'RAW',
      requestBody: { values: [[amount]] },
    });

    return NextResponse.json({ ok: true, year, month, categoryId, amount });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
