import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';

function getAuth() {
  // 環境変数にJSONパスがある場合はファイルから読む（ローカル開発用）
  const credPath = path.join(process.cwd(), 'google-credentials.json');
  if (fs.existsSync(credPath)) {
    const cred = JSON.parse(fs.readFileSync(credPath, 'utf8'));
    return new google.auth.GoogleAuth({
      credentials: cred,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
  }
  // Vercel等ではenv変数から
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL!;
  const key = process.env.GOOGLE_PRIVATE_KEY!.replace(/\\n/g, '\n');
  return new google.auth.GoogleAuth({
    credentials: { client_email: email, private_key: key },
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
}

const SS_ID = process.env.GOOGLE_SPREADSHEET_ID!;

export async function getSheets() {
  const auth = getAuth();
  return google.sheets({ version: 'v4', auth });
}

export async function getRawData() {
  const sheets = await getSheets();
  const res = await sheets.spreadsheets.values.get({ spreadsheetId: SS_ID, range: '_raw!A2:K' });
  return (res.data.values || []).map(r => ({
    id: r[0], date: r[1], year: Number(r[2]), month: Number(r[3]),
    categoryId: r[4], categoryName: r[5], type: r[6], group: r[7],
    amount: Number(r[8]), memo: r[9] || '', createdAt: r[10] || '',
  }));
}

export async function getSummaryData() {
  const sheets = await getSheets();
  const res = await sheets.spreadsheets.values.get({ spreadsheetId: SS_ID, range: '_summary!A2:G' });
  return (res.data.values || []).map(r => ({
    year: Number(r[0]), month: Number(r[1]),
    categoryId: r[2], categoryName: r[3], type: r[4], group: r[5],
    amount: Number(r[6]),
  }));
}

export async function getCategories() {
  const sheets = await getSheets();
  const res = await sheets.spreadsheets.values.get({ spreadsheetId: SS_ID, range: '_categories!A2:G' });
  return (res.data.values || []).map(r => ({
    id: r[0], name: r[1], type: r[2], group: r[3],
    icon: r[4], color: r[5], sortOrder: Number(r[6]),
  }));
}

export async function appendRaw(data: {
  date: string; categoryId: string; categoryName: string;
  type: string; group: string; amount: number; memo: string;
}) {
  const sheets = await getSheets();
  const now = new Date().toISOString();
  const d = new Date(data.date);
  const year = d.getFullYear();
  const month = d.getMonth() + 1;
  const id = `r${Date.now()}`;
  const row = [id, data.date, year, month, data.categoryId, data.categoryName, data.type, data.group, data.amount, data.memo, now];
  await sheets.spreadsheets.values.append({
    spreadsheetId: SS_ID, range: '_raw!A2', valueInputOption: 'RAW',
    requestBody: { values: [row] },
  });
  return { id, year, month };
}

export async function updateRaw(id: string, data: {
  date?: string; categoryId?: string; categoryName?: string;
  type?: string; group?: string; amount?: number; memo?: string;
}) {
  const sheets = await getSheets();
  const res = await sheets.spreadsheets.values.get({ spreadsheetId: SS_ID, range: '_raw!A:K' });
  const rows = res.data.values || [];
  const idx = rows.findIndex(r => r[0] === id);
  if (idx === -1) throw new Error('Not found');
  const row = rows[idx];
  if (data.date !== undefined) { row[1] = data.date; const d = new Date(data.date); row[2] = String(d.getFullYear()); row[3] = String(d.getMonth() + 1); }
  if (data.categoryId !== undefined) row[4] = data.categoryId;
  if (data.categoryName !== undefined) row[5] = data.categoryName;
  if (data.type !== undefined) row[6] = data.type;
  if (data.group !== undefined) row[7] = data.group;
  if (data.amount !== undefined) row[8] = String(data.amount);
  if (data.memo !== undefined) row[9] = data.memo;
  await sheets.spreadsheets.values.update({
    spreadsheetId: SS_ID, range: `_raw!A${idx + 1}:K${idx + 1}`,
    valueInputOption: 'RAW', requestBody: { values: [row] },
  });
  return { id };
}

export async function deleteRaw(id: string) {
  const sheets = await getSheets();
  const res = await sheets.spreadsheets.values.get({ spreadsheetId: SS_ID, range: '_raw!A:K' });
  const rows = res.data.values || [];
  const idx = rows.findIndex(r => r[0] === id);
  if (idx === -1) throw new Error('Not found');
  await sheets.spreadsheets.values.clear({ spreadsheetId: SS_ID, range: `_raw!A${idx + 1}:K${idx + 1}` });
  return { id };
}
