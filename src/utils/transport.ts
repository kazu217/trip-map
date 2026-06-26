import { TransportMode } from '../types/models';

const travelMode: Partial<Record<TransportMode, string>> = {
  bus: 'transit',
  train: 'transit',
  ferry: 'transit',
  flight: 'driving',
  taxi: 'driving',
  walk: 'walking',
  other: 'driving'
};

export const createGoogleMapsRouteUrl = (origin: string, destination: string, mode?: TransportMode) => {
  if (!origin.trim() || !destination.trim()) return '';

  const params = new URLSearchParams({
    api: '1',
    origin: origin.trim(),
    destination: destination.trim()
  });
  if (mode) params.set('travelmode', travelMode[mode] || 'driving');
  return `https://www.google.com/maps/dir/?${params.toString()}`;
};

export const createGoogleMapsNavigationUrl = (destination: string, mode?: TransportMode) => {
  if (!destination.trim()) return '';

  const params = new URLSearchParams({
    api: '1',
    destination: destination.trim(),
    dir_action: 'navigate',
    travelmode: mode ? travelMode[mode] || 'driving' : 'driving'
  });
  return `https://www.google.com/maps/dir/?${params.toString()}`;
};

export const spotLocationText = (spot: { address?: string; lat?: number; lng?: number }) => {
  if (typeof spot.lat === 'number' && typeof spot.lng === 'number') return `${spot.lat},${spot.lng}`;
  return spot.address?.trim() || '';
};

export const spotDestinationText = (spot: {
  address?: string;
  lat?: number;
  lng?: number;
  destinationAddress?: string;
  destinationLat?: number;
  destinationLng?: number;
}) => {
  if (typeof spot.destinationLat === 'number' && typeof spot.destinationLng === 'number') {
    return `${spot.destinationLat},${spot.destinationLng}`;
  }
  if (spot.destinationAddress?.trim()) return spot.destinationAddress.trim();
  return spotLocationText(spot);
};

export const calculateDurationFromTimes = (startTime?: string, endTime?: string) => {
  if (!startTime || !endTime) return '';
  const [startHour, startMinute] = startTime.split(':').map(Number);
  const [endHour, endMinute] = endTime.split(':').map(Number);
  if ([startHour, startMinute, endHour, endMinute].some(Number.isNaN)) return '';

  const start = startHour * 60 + startMinute;
  let end = endHour * 60 + endMinute;
  if (end < start) end += 24 * 60;
  const total = end - start;
  if (total <= 0) return '';

  const hours = Math.floor(total / 60);
  const minutes = total % 60;
  if (hours && minutes) return `${hours}時間${minutes}分`;
  if (hours) return `${hours}時間`;
  return `${minutes}分`;
};
