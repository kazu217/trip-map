import { Spot } from '../types/models';

const dateFormatter = new Intl.DateTimeFormat('ja-JP', {
  month: 'short',
  day: 'numeric',
  weekday: 'short'
});

const longDateFormatter = new Intl.DateTimeFormat('ja-JP', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  weekday: 'short'
});

const toLocalDateInput = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const todayInput = () => toLocalDateInput(new Date());

export const toDateInput = (value?: string) => {
  if (!value) return todayInput();
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value.slice(0, 10) : toLocalDateInput(date);
};

export const normalizeDate = (value: string) => {
  if (!value) return new Date().toISOString();
  if (value.includes('T')) return value;
  return new Date(`${value}T00:00:00`).toISOString();
};

export const formatDate = (value?: string, long = false) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return long ? longDateFormatter.format(date) : dateFormatter.format(date);
};

export const formatDateRange = (startDate: string, endDate: string) => {
  return `${formatDate(startDate)} - ${formatDate(endDate)}`;
};

export const dateKey = (value: string) => normalizeDate(value).slice(0, 10);

export const compareSpotsByTime = (a: Spot, b: Spot) => {
  const dateCompare = dateKey(a.date).localeCompare(dateKey(b.date));
  if (dateCompare !== 0) return dateCompare;
  return (a.startTime || '99:99').localeCompare(b.startTime || '99:99');
};

export const groupSpotsByDate = (spots: Spot[]) => {
  const groups = spots
    .slice()
    .sort(compareSpotsByTime)
    .reduce<Record<string, Spot[]>>((acc, spot) => {
      const key = dateKey(spot.date);
      acc[key] = acc[key] || [];
      acc[key].push(spot);
      return acc;
    }, {});

  return Object.entries(groups).map(([key, items]) => ({
    key,
    label: formatDate(key, true),
    items
  }));
};

export const tripDays = (startDate: string, endDate: string) => {
  const start = new Date(dateKey(startDate));
  const end = new Date(dateKey(endDate));
  const diff = end.getTime() - start.getTime();
  if (Number.isNaN(diff)) return 1;
  return Math.max(1, Math.floor(diff / 86_400_000) + 1);
};

export const displayTimeRange = (startTime?: string, endTime?: string) => {
  if (startTime && endTime) return `${startTime} - ${endTime}`;
  if (startTime) return startTime;
  if (endTime) return `until ${endTime}`;
  return '時間未定';
};
