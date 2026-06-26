import { SpotDraft, SpotType } from '../types/models';

export type BookingImportResult = {
  draft: Partial<SpotDraft>;
  foundFields: string[];
  site: string;
};

const sitePatterns = [
  { label: 'Trip.com', pattern: /trip\.com|tripcom/i },
  { label: 'Booking.com', pattern: /booking\.com/i },
  {
    label: 'Yahoo!トラベル',
    pattern: /travel\.yahoo\.co\.jp|ヤフー(?:!|！)?トラベル|yahoo!?\s*(?:travel|トラベル)/i
  },
  { label: '楽天トラベル', pattern: /travel\.rakuten\.co\.jp|楽天トラベル/i }
];

const firstMatch = (text: string, patterns: RegExp[]) => {
  for (const pattern of patterns) {
    const match = text.match(pattern);
    const value = match?.[1]?.trim();
    if (value) return value;
  }
  return '';
};

const normalizeDateValue = (value: string) => {
  const normalized = value
    .replace(/[年月.\-]/g, '/')
    .replace(/日/g, '')
    .replace(/\s+/g, '');
  const match = normalized.match(/(\d{4})\/(\d{1,2})\/(\d{1,2})/);
  if (!match) return '';
  return `${match[1]}-${match[2].padStart(2, '0')}-${match[3].padStart(2, '0')}`;
};

const detectType = (text: string): SpotType => {
  if (/航空券|フライト|flight|空港|列車|電車|新幹線|バス|フェリー/i.test(text)) return 'transport';
  if (/ツアー|tour|アクティビティ|activity/i.test(text)) return 'tour';
  if (/レストラン|restaurant|食事予約/i.test(text)) return 'restaurant';
  if (/観光|入場券|チケット|attraction/i.test(text)) return 'attraction';
  return 'hotel';
};

const extractDates = (text: string) => {
  const labeledStart = firstMatch(text, [
    /(?:チェックイン|宿泊開始|利用開始|出発日|予約日|visit date|check-in)\s*[:：]?\s*(\d{4}[年/.\-]\d{1,2}[月/.\-]\d{1,2}日?)/i
  ]);
  const labeledEnd = firstMatch(text, [
    /(?:チェックアウト|宿泊終了|利用終了|帰着日|check-out)\s*[:：]?\s*(\d{4}[年/.\-]\d{1,2}[月/.\-]\d{1,2}日?)/i
  ]);
  const allDates = Array.from(
    text.matchAll(/(\d{4}[年/.\-]\d{1,2}[月/.\-]\d{1,2}日?)/g),
    (match) => normalizeDateValue(match[1])
  ).filter(Boolean);

  return {
    date: normalizeDateValue(labeledStart) || allDates[0] || '',
    endDate: normalizeDateValue(labeledEnd) || (!labeledStart ? allDates[1] || '' : '')
  };
};

const extractTime = (text: string, labels: string[]) => {
  const labelPattern = labels.join('|');
  return firstMatch(text, [new RegExp(`(?:${labelPattern})[^\\n]*?([0-2]?\\d:[0-5]\\d)`, 'i')]);
};

const extractPrice = (text: string) => {
  const match = text.match(
    /(?:合計|料金|お支払い金額|宿泊料金|total|price)\s*[:：]?\s*(?:JPY|NZD|USD|EUR|AUD|￥|¥|\$)?\s*([\d,]+(?:\.\d{1,2})?)/i
  );
  if (!match) return undefined;
  const value = Number(match[1].replace(/,/g, ''));
  return Number.isFinite(value) ? value : undefined;
};

const extractCurrency = (text: string) => {
  const code = text.match(/\b(JPY|NZD|USD|EUR|AUD|KRW|THB|SGD)\b/i)?.[1];
  if (code) return code.toUpperCase();
  if (/[￥¥]/.test(text)) return 'JPY';
  if (/\$/.test(text)) return 'USD';
  return 'JPY';
};

const findFallbackAddress = (lines: string[]) =>
  lines.find((line) => {
    if (/https?:\/\//i.test(line) || line.length < 8) return false;
    return (
      /^\d{1,6}\s+\S+/.test(line) &&
      /\b(street|st\.?|road|rd\.?|avenue|ave\.?|drive|dr\.?|lane|ln\.?|highway|hwy|boulevard|blvd)\b/i.test(line)
    ) || /(?:都|道|府|県|市|区|町|村|番地|丁目|ニュージーランド|オーストラリア)$/.test(line);
  }) || '';

const findFallbackName = (lines: string[], address: string) =>
  lines.find((line) => {
    if (line === address || line.length < 3 || line.length > 100) return false;
    if (/https?:\/\/|@|\d{4}[年/.\-]\d{1,2}[月/.\-]\d{1,2}|^[\d\s,.\-]+$/.test(line)) return false;
    if (/^(trip\.com|booking\.com|yahoo|楽天トラベル|予約情報|予約内容)$/i.test(line)) return false;
    if (/^(住所|所在地|日付|料金|予約番号|確認番号|電話|チェックイン|チェックアウト)\s*[:：]/.test(line)) return false;
    return true;
  }) || '';

export const parseBookingText = (source: string): BookingImportResult => {
  const text = source.replace(/\r/g, '').trim();
  const lines = text.split('\n').map((line) => line.trim()).filter(Boolean);
  const site = sitePatterns.find((item) => item.pattern.test(text))?.label || '';
  const urls = text.match(/https?:\/\/[^\s<>"）)]+/gi) || [];
  const { date, endDate } = extractDates(text);
  const labeledName = firstMatch(text, [
    /(?:ホテル名|宿泊施設|施設名|予約施設|宿名|property|hotel)\s*[:：]\s*(.+)/i,
    /(?:商品名|プラン名|ツアー名|アクティビティ名)\s*[:：]\s*(.+)/i
  ]);
  const labeledAddress = firstMatch(text, [
    /(?:住所|所在地|集合場所|出発地|address)\s*[:：]\s*(.+)/i
  ]);
  const address = labeledAddress || findFallbackAddress(lines);
  const name = labeledName || findFallbackName(lines, address);
  const confirmationNumber = firstMatch(text, [
    /(?:予約番号|確認番号|受付番号|照会番号|旅程番号|booking number|confirmation number|reservation id)\s*[:：#]?\s*([A-Z0-9\-]+)/i
  ]);
  const phone = firstMatch(text, [/(?:電話番号|電話|tel|phone)\s*[:：]\s*([+\d][\d\-()\s]+)/i]);
  const startTime = extractTime(text, ['チェックイン', '集合時間', '開始時間', '出発時間', 'check-in']);
  const endTime = extractTime(text, ['チェックアウト', '終了時間', '到着時間', 'check-out']);
  const price = extractPrice(text);
  const cancellationFeeStartDate = normalizeDateValue(
    firstMatch(text, [
      /(?:キャンセル料(?:が)?発生|キャンセル料金適用|無料キャンセル期限|cancellation fee|free cancellation until)[^\n]*?(\d{4}[年/.\-]\d{1,2}[月/.\-]\d{1,2}日?)/i
    ])
  );
  const draft: Partial<SpotDraft> = {
    type: detectType(text),
    name,
    address,
    date,
    endDate: endDate || undefined,
    startTime,
    endTime,
    price,
    currency: extractCurrency(text),
    bookingSite: site,
    confirmationNumber,
    officialUrl: urls[0] || '',
    phone,
    cancellationFeeStartDate: cancellationFeeStartDate || undefined,
    notes: `予約情報から取り込み\n${text.slice(0, 1200)}`
  };

  const labels: Array<[keyof SpotDraft, string]> = [
    ['name', '名前'],
    ['address', '住所'],
    ['date', '日付'],
    ['endDate', '終了日'],
    ['startTime', '開始時刻'],
    ['endTime', '終了時刻'],
    ['price', '料金'],
    ['bookingSite', '予約サイト'],
    ['confirmationNumber', '確認番号'],
    ['officialUrl', 'URL'],
    ['phone', '電話番号'],
    ['cancellationFeeStartDate', 'キャンセル料発生日']
  ];
  const foundFields = labels.filter(([key]) => draft[key] !== undefined && draft[key] !== '').map(([, label]) => label);

  return { draft, foundFields, site };
};
