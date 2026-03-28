const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

const SPREADSHEET_ID = '1Amsj5ETW804bj7xQArc5WsbhzOSz-XHa0G1-k3AyC3Q';
const CRED = path.join(__dirname, '..', 'google-credentials.json');

async function run() {
  const auth = new google.auth.GoogleAuth({
    credentials: JSON.parse(fs.readFileSync(CRED, 'utf8')),
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  const sheets = google.sheets({ version: 'v4', auth });
  const SS = SPREADSHEET_ID;

  // 1. シート作成
  const meta = await sheets.spreadsheets.get({ spreadsheetId: SS });
  const existing = meta.data.sheets.map(s => ({ id: s.properties.sheetId, title: s.properties.title }));
  const want = ['_raw', '_summary', '_categories', '_settings'];
  const addReq = want.filter(t => !existing.some(e => e.title === t)).map(title => ({ addSheet: { properties: { title } } }));
  if (addReq.length) await sheets.spreadsheets.batchUpdate({ spreadsheetId: SS, requestBody: { requests: addReq } });
  const delReq = existing.filter(s => !want.includes(s.title)).map(s => ({ deleteSheet: { sheetId: s.id } }));
  if (delReq.length) await sheets.spreadsheets.batchUpdate({ spreadsheetId: SS, requestBody: { requests: delReq } });
  console.log('✅ シート作成完了');

  // 2. _categories
  const cats = [
    ['id','name','type','group','icon','color','sort_order'],
    ['c01','給料(本業)','income','income','Banknote','#4CAF50',1],
    ['c02','給料(副業)','income','income','Briefcase','#66BB6A',2],
    ['c03','その他収入','income','income','TrendingUp','#81C784',3],
    ['c10','家賃','expense','personal','Home','#E53935',10],
    ['c11','スマホ代','expense','personal','Smartphone','#D81B60',11],
    ['c12','ヘアカット','expense','personal','Heart','#8E24AA',12],
    ['c13','食費(スーパー)','expense','personal','ShoppingBag','#5E35B1',13],
    ['c14','外食(1人)','expense','personal','Utensils','#3949AB',14],
    ['c15','日用品','expense','personal','Home','#1E88E5',15],
    ['c16','カフェ','expense','personal','Coffee','#039BE5',16],
    ['c17','娯楽費(1人)','expense','personal','Music','#00ACC1',17],
    ['c18','娯楽費(複数人)','expense','personal','Users','#00897B',18],
    ['c19','自己投資','expense','personal','GraduationCap','#43A047',19],
    ['c20','ガソリン','expense','personal','Car','#7CB342',20],
    ['c21','交際費','expense','personal','Gift','#C0CA33',21],
    ['c22','デート','expense','personal','Heart','#F4511E',22],
    ['c23','病院','expense','personal','Heart','#6D4C41',23],
    ['c24','交通費','expense','personal','Car','#546E7A',24],
    ['c25','その他','expense','personal','Zap','#78909C',25],
    ['c26','小規模企業共済','expense','personal','PiggyBank','#FF7043',26],
    ['c30','販管費(外注)','expense','corporate','Users','#5C6BC0',30],
    ['c31','販管費(固定費)','expense','corporate','Building','#26A69A',31],
    ['c32','販管費(経費)','expense','corporate','CreditCard','#AB47BC',32],
  ];
  await sheets.spreadsheets.values.update({ spreadsheetId: SS, range: '_categories!A1', valueInputOption: 'RAW', requestBody: { values: cats } });
  console.log('✅ _categories 完了');

  // 3. _raw ヘッダー
  await sheets.spreadsheets.values.update({ spreadsheetId: SS, range: '_raw!A1', valueInputOption: 'RAW', requestBody: { values: [['id','date','year','month','category_id','category_name','type','group','amount','memo','created_at']] } });
  console.log('✅ _raw ヘッダー完了');

  // 4. _settings
  const settings = [
    ['key','category_id','value'],
    ['budget','c01',350000],['budget','c02',330000],['budget','c03',0],
    ['budget','c10',40000],['budget','c11',3000],['budget','c12',3500],
    ['budget','c13',30000],['budget','c14',0],['budget','c15',5000],
    ['budget','c16',5000],['budget','c17',40000],['budget','c18',20000],
    ['budget','c19',5000],['budget','c20',500],['budget','c21',0],
    ['budget','c22',50000],['budget','c23',0],['budget','c24',10000],
    ['budget','c25',0],['budget','c26',0],
    ['budget','c30',20000],['budget','c31',20000],['budget','c32',0],
  ];
  await sheets.spreadsheets.values.update({ spreadsheetId: SS, range: '_settings!A1', valueInputOption: 'RAW', requestBody: { values: settings } });
  console.log('✅ _settings 完了');

  // 5. _summary (2024-2025 月別サマリ)
  const h = ['year','month','category_id','category_name','type','group','amount'];
  const rows = [];

  // helper
  function addYear(yr, incomeData, expData, corpData) {
    for (let m = 1; m <= 12; m++) {
      const i = m - 1;
      incomeData.forEach(d => rows.push([yr, m, d.id, d.name, 'income', 'income', d.vals[i]]));
      expData.forEach(d => rows.push([yr, m, d.id, d.name, 'expense', 'personal', d.vals[i]]));
      corpData.forEach(d => rows.push([yr, m, d.id, d.name, 'expense', 'corporate', d.vals[i]]));
    }
  }

  // 2024
  addYear(2024,
    [
      {id:'c01',name:'給料(本業)',vals:[300000,300000,300000,300000,300746,317566,342026,340975,333190,344092,332592,359352]},
      {id:'c02',name:'給料(副業)',vals:[411088,429708,429708,451746,606223,572000,554400,687500,506000,379500,379500,363000]},
      {id:'c03',name:'その他収入',vals:[0,27900,0,2000,11000,6000,59000,100000,14000,2000,10000,7000]},
    ],
    [
      {id:'c10',name:'家賃',vals:[40000,40000,40000,40000,40000,40000,40000,40000,40000,40000,40000,40000]},
      {id:'c11',name:'スマホ代',vals:[3000,3000,3000,3000,3000,3000,3000,3000,2000,2000,2000,2000]},
      {id:'c12',name:'ヘアカット',vals:[3500,0,3500,3500,3500,3500,0,3500,3000,3500,3500,3500]},
      {id:'c13',name:'食費(スーパー)',vals:[30584,34397,43213,34321,14023,29534,17618,22710,20252,26647,23411,12456]},
      {id:'c14',name:'外食(1人)',vals:[0,0,0,0,15706,9336,6119,5047,7950,6722,6465,34762]},
      {id:'c15',name:'日用品',vals:[20273,12499,39586,59425,26915,63678,13408,10929,4293,11076,13561,11224]},
      {id:'c16',name:'カフェ',vals:[6970,3760,4050,800,3750,1760,10610,6170,1040,6970,3440,5310]},
      {id:'c17',name:'娯楽費(1人)',vals:[32416,59666,194153,126760,20071,0,186130,42214,700,29766,60114,88224]},
      {id:'c18',name:'娯楽費(複数人)',vals:[0,0,0,0,8049,5449,2000,19366,11700,10505,0,0]},
      {id:'c19',name:'自己投資',vals:[2420,7362,1800,0,2090,990,3980,1980,0,620,0,3404]},
      {id:'c20',name:'ガソリン',vals:[0,603,581,0,498,0,0,486,1046,0,0,517]},
      {id:'c21',name:'交際費',vals:[43889,44820,50178,37179,11000,11093,4667,6750,1456,4494,12613,24050]},
      {id:'c22',name:'デート',vals:[2810,2400,0,0,130835,88614,42431,67877,82906,33038,63744,8402]},
      {id:'c23',name:'病院',vals:[16590,2900,0,0,3300,0,0,3300,0,0,0,0]},
      {id:'c24',name:'交通費',vals:[59910,94930,23350,30000,26100,29480,34480,29620,17000,23990,17870,22180]},
      {id:'c25',name:'その他',vals:[22000,1380,166350,14256,4400,80000,0,11000,150,0,0,52000]},
      {id:'c26',name:'小規模企業共済',vals:[0,0,0,0,0,0,0,0,0,0,70000,70000]},
    ],
    [
      {id:'c30',name:'販管費(外注)',vals:[0,0,0,0,90525,87885,0,16500,27500,0,16500,0]},
      {id:'c31',name:'販管費(固定費)',vals:[0,0,0,0,0,0,0,0,0,41428,41428,41428]},
      {id:'c32',name:'販管費(経費)',vals:[5360,5360,5360,5360,69268,252228,75214,71563,111079,58406,9150,26696]},
    ]
  );

  // 2025
  addYear(2025,
    [
      {id:'c01',name:'給料(本業)',vals:[338360,335238,335238,351818,335580,318580,332280,303240,303240,303029,319469,335909]},
      {id:'c02',name:'給料(副業)',vals:[374709,379500,346500,346500,346500,346500,346500,330000,330000,330000,474820,330000]},
      {id:'c03',name:'その他収入',vals:[3000,160840,30227,13654,4622,76048,12565,11284,10912,4584,23623,33012]},
    ],
    [
      {id:'c10',name:'家賃',vals:[40000,40000,40000,30000,30000,30000,30000,30000,30000,30000,30000,30000]},
      {id:'c11',name:'スマホ代',vals:[3000,3000,3000,3000,3000,3000,3000,3000,2000,2000,2000,2000]},
      {id:'c12',name:'ヘアカット',vals:[3000,3000,3500,3500,3500,3500,3500,7000,3100,3500,3500,0]},
      {id:'c13',name:'食費(スーパー)',vals:[16904,19333,16602,12815,15602,17478,10389,17183,21919,21096,21468,16842]},
      {id:'c14',name:'外食(1人)',vals:[10171,28001,7496,12204,11227,11206,9547,5440,22779,23198,16119,28439]},
      {id:'c15',name:'日用品',vals:[15041,12879,5683,10218,8333,13643,11100,1730,21950,3433,10038,18631]},
      {id:'c16',name:'カフェ',vals:[4200,11144,9490,1930,2240,9770,0,6490,7320,2830,13670,5980]},
      {id:'c17',name:'娯楽費(1人)',vals:[33677,70578,65332,8921,171860,27330,177250,222630,41446,78556,68228,51139]},
      {id:'c18',name:'娯楽費(複数人)',vals:[0,0,7000,6000,17700,0,17120,24065,6417,35638,11650,23884]},
      {id:'c19',name:'自己投資',vals:[0,1681,0,3980,0,2860,0,0,0,1298,2200,2100]},
      {id:'c20',name:'ガソリン',vals:[0,0,578,556,0,474,535,494,0,571,0,0]},
      {id:'c21',name:'交際費',vals:[29183,24717,3700,5750,980,18910,0,0,810,0,35860,3810]},
      {id:'c22',name:'デート',vals:[77910,15670,10934,147923,6970,9033,9075,2900,4700,0,0,0]},
      {id:'c23',name:'病院',vals:[3300,0,0,0,0,0,0,1900,0,6600,0,2740]},
      {id:'c24',name:'交通費',vals:[31440,52869,13800,20000,7350,23180,12950,11580,0,36790,6200,5000]},
      {id:'c25',name:'その他',vals:[0,237500,484040,14000,8980,3099,670950,11000,54000,0,0,130000]},
      {id:'c26',name:'小規模企業共済',vals:[70000,70000,70000,70000,70000,70000,70000,70000,70000,70000,70000,70000]},
    ],
    [
      {id:'c30',name:'販管費(外注)',vals:[0,0,0,0,0,0,0,0,0,0,0,0]},
      {id:'c31',name:'販管費(固定費)',vals:[41428,41428,41428,41428,41428,41428,41428,41428,41428,41428,41428,41428]},
      {id:'c32',name:'販管費(経費)',vals:[70547,70421,70878,86639,33826,54570,80149,46485,24819,40584,70687,87459]},
    ]
  );

  await sheets.spreadsheets.values.update({ spreadsheetId: SS, range: '_summary!A1', valueInputOption: 'RAW', requestBody: { values: [h, ...rows] } });
  console.log('✅ _summary (2024-2025) 完了');

  // 6. _raw 2026年データ
  const r = [];
  function addRaw(yr,m,catId,catName,type,group,amount,memo,date) {
    const id = `r${yr}${String(m).padStart(2,'0')}${String(r.length).padStart(4,'0')}`;
    r.push([id,date,yr,m,catId,catName,type,group,amount,memo||'',date]);
  }
  // 2026-01
  addRaw(2026,1,'c01','給料(本業)','income','income',367980,'','2026-01-21');
  addRaw(2026,1,'c02','給料(副業)','income','income',550000,'','2026-01-28');
  addRaw(2026,1,'c03','その他収入','income','income',12000,'','2026-01-15');
  addRaw(2026,1,'c10','家賃','expense','personal',30000,'','2026-01-01');
  addRaw(2026,1,'c11','スマホ代','expense','personal',2000,'','2026-01-01');
  addRaw(2026,1,'c12','ヘアカット','expense','personal',3500,'','2026-01-06');
  addRaw(2026,1,'c13','食費(スーパー)','expense','personal',7394,'','2026-01-20');
  addRaw(2026,1,'c14','外食(1人)','expense','personal',18540,'','2026-01-05');
  addRaw(2026,1,'c15','日用品','expense','personal',6737,'','2026-01-06');
  addRaw(2026,1,'c16','カフェ','expense','personal',3380,'','2026-01-02');
  addRaw(2026,1,'c17','娯楽費(1人)','expense','personal',117532,'','2026-01-12');
  addRaw(2026,1,'c18','娯楽費(複数人)','expense','personal',15660,'','2026-01-03');
  addRaw(2026,1,'c19','自己投資','expense','personal',640,'','2026-01-15');
  addRaw(2026,1,'c20','ガソリン','expense','personal',0,'','2026-01-01');
  addRaw(2026,1,'c21','交際費','expense','personal',1075,'','2026-01-21');
  addRaw(2026,1,'c22','デート','expense','personal',0,'','2026-01-01');
  addRaw(2026,1,'c23','病院','expense','personal',0,'','2026-01-01');
  addRaw(2026,1,'c24','交通費','expense','personal',32200,'','2026-01-09');
  addRaw(2026,1,'c25','その他','expense','personal',0,'','2026-01-01');
  addRaw(2026,1,'c26','小規模企業共済','expense','personal',70000,'','2026-01-01');
  addRaw(2026,1,'c30','販管費(外注)','expense','corporate',0,'','2026-01-01');
  addRaw(2026,1,'c31','販管費(固定費)','expense','corporate',41428,'','2026-01-01');
  addRaw(2026,1,'c32','販管費(経費)','expense','corporate',74480,'','2026-01-06');
  // 2026-02
  addRaw(2026,2,'c01','給料(本業)','income','income',349360,'','2026-02-20');
  addRaw(2026,2,'c02','給料(副業)','income','income',330000,'','2026-02-28');
  addRaw(2026,2,'c03','その他収入','income','income',0,'','2026-02-01');
  addRaw(2026,2,'c10','家賃','expense','personal',30000,'','2026-02-01');
  addRaw(2026,2,'c11','スマホ代','expense','personal',2000,'','2026-02-01');
  addRaw(2026,2,'c12','ヘアカット','expense','personal',3500,'','2026-02-19');
  addRaw(2026,2,'c13','食費(スーパー)','expense','personal',22037,'','2026-02-14');
  addRaw(2026,2,'c14','外食(1人)','expense','personal',15327,'','2026-02-07');
  addRaw(2026,2,'c15','日用品','expense','personal',5002,'','2026-02-06');
  addRaw(2026,2,'c16','カフェ','expense','personal',9000,'','2026-02-01');
  addRaw(2026,2,'c17','娯楽費(1人)','expense','personal',72876,'','2026-02-07');
  addRaw(2026,2,'c18','娯楽費(複数人)','expense','personal',97474,'','2026-02-01');
  addRaw(2026,2,'c19','自己投資','expense','personal',400,'','2026-02-06');
  addRaw(2026,2,'c20','ガソリン','expense','personal',500,'','2026-02-14');
  addRaw(2026,2,'c21','交際費','expense','personal',0,'','2026-02-01');
  addRaw(2026,2,'c22','デート','expense','personal',9728,'','2026-02-25');
  addRaw(2026,2,'c23','病院','expense','personal',14953,'','2026-02-16');
  addRaw(2026,2,'c24','交通費','expense','personal',15000,'','2026-02-06');
  addRaw(2026,2,'c25','その他','expense','personal',3200,'','2026-02-18');
  addRaw(2026,2,'c26','小規模企業共済','expense','personal',70000,'','2026-02-01');
  addRaw(2026,2,'c30','販管費(外注)','expense','corporate',0,'','2026-02-01');
  addRaw(2026,2,'c31','販管費(固定費)','expense','corporate',41428,'','2026-02-01');
  addRaw(2026,2,'c32','販管費(経費)','expense','corporate',197294,'','2026-02-06');
  // 2026-03
  addRaw(2026,3,'c01','給料(本業)','income','income',349360,'','2026-03-25');
  addRaw(2026,3,'c02','給料(副業)','income','income',330000,'','2026-03-01');
  addRaw(2026,3,'c03','その他収入','income','income',569744,'','2026-03-25');
  addRaw(2026,3,'c10','家賃','expense','personal',30000,'','2026-03-01');
  addRaw(2026,3,'c11','スマホ代','expense','personal',2000,'','2026-03-01');
  addRaw(2026,3,'c12','ヘアカット','expense','personal',3500,'','2026-03-26');
  addRaw(2026,3,'c13','食費(スーパー)','expense','personal',15734,'','2026-03-13');
  addRaw(2026,3,'c14','外食(1人)','expense','personal',18559,'','2026-03-06');
  addRaw(2026,3,'c15','日用品','expense','personal',18259,'','2026-03-13');
  addRaw(2026,3,'c16','カフェ','expense','personal',8860,'','2026-03-07');
  addRaw(2026,3,'c17','娯楽費(1人)','expense','personal',52249,'','2026-03-02');
  addRaw(2026,3,'c18','娯楽費(複数人)','expense','personal',33093,'','2026-03-06');
  addRaw(2026,3,'c19','自己投資','expense','personal',690,'','2026-03-21');
  addRaw(2026,3,'c20','ガソリン','expense','personal',0,'','2026-03-01');
  addRaw(2026,3,'c21','交際費','expense','personal',0,'','2026-03-01');
  addRaw(2026,3,'c22','デート','expense','personal',38362,'','2026-03-04');
  addRaw(2026,3,'c23','病院','expense','personal',0,'','2026-03-01');
  addRaw(2026,3,'c24','交通費','expense','personal',12019,'','2026-03-18');
  addRaw(2026,3,'c25','その他','expense','personal',0,'','2026-03-01');
  addRaw(2026,3,'c26','小規模企業共済','expense','personal',70000,'','2026-03-01');
  addRaw(2026,3,'c30','販管費(外注)','expense','corporate',0,'','2026-03-01');
  addRaw(2026,3,'c31','販管費(固定費)','expense','corporate',41428,'','2026-03-01');
  addRaw(2026,3,'c32','販管費(経費)','expense','corporate',120166,'','2026-03-09');

  await sheets.spreadsheets.values.append({ spreadsheetId: SS, range: '_raw!A2', valueInputOption: 'RAW', requestBody: { values: r } });
  console.log('✅ _raw (2026) 完了');

  console.log('\n🎉 全データ投入完了！');
}

run().catch(e => { console.error('❌', e.message); if (e.response) console.error(e.response.data); });
