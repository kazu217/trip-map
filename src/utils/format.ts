export const formatPrice = (price?: number, currency = 'JPY') => {
  if (price === undefined || Number.isNaN(price)) return '';

  try {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency,
      maximumFractionDigits: currency === 'JPY' ? 0 : 2
    }).format(price);
  } catch {
    return `${price.toLocaleString()} ${currency}`;
  }
};

export const normalizeUrl = (value?: string) => {
  if (!value) return '';
  if (/^https?:\/\//i.test(value)) return value;
  return `https://${value}`;
};

export const compactText = (...items: Array<string | undefined | null | false>) => {
  return items.filter(Boolean).join('・');
};
