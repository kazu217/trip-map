import { Share } from 'react-native';

import { spotTypeLabels } from '../constants/categories';
import { Trip } from '../types/models';
import { compareSpotsByTime, displayTimeRange, formatDate, formatDateRange } from '../utils/date';

const compactLines = (values: Array<string | undefined>) => values.filter(Boolean) as string[];

export const createTripShareText = (trip: Trip) => {
  const lines = [
    `【${trip.title}】`,
    trip.destination,
    formatDateRange(trip.startDate, trip.endDate),
    ''
  ];

  if (trip.spots.length) {
    lines.push('■ 確定した予定');
    trip.spots.slice().sort(compareSpotsByTime).forEach((spot) => {
      lines.push(
        ...compactLines([
          `${formatDate(spot.date, true)} ${displayTimeRange(spot.startTime, spot.endTime)}`,
          `${spotTypeLabels[spot.type]}: ${spot.name}`,
          spot.address || undefined,
          spot.destinationAddress ? `到着地: ${spot.destinationAddress}` : undefined,
          spot.officialUrl || undefined,
          spot.notes || undefined,
          ''
        ])
      );
    });
  }

  if (trip.planItems?.length) {
    lines.push('■ まだ決めていない候補');
    trip.planItems.forEach((item) => {
      const candidate1 = item.candidateDate1
        ? `${formatDate(item.candidateDate1, true)} ${displayTimeRange(item.candidateStartTime1, item.candidateEndTime1)}`
        : '日付未定';
      const candidateNote1 = item.candidateNote1 ? `候補1メモ: ${item.candidateNote1}` : '';
      const candidate2 = item.candidateDate2
        ? `${formatDate(item.candidateDate2, true)} ${displayTimeRange(item.candidateStartTime2, item.candidateEndTime2)}`
        : '';
      const candidateNote2 = item.candidateNote2 ? `候補2メモ: ${item.candidateNote2}` : '';
      const candidate3 = item.candidateDate3
        ? `${formatDate(item.candidateDate3, true)} ${displayTimeRange(item.candidateStartTime3, item.candidateEndTime3)}`
        : '';
      const candidateNote3 = item.candidateNote3 ? `候補3メモ: ${item.candidateNote3}` : '';
      lines.push(
        ...compactLines([
          `${spotTypeLabels[item.type]}: ${item.title}`,
          `候補1: ${candidate1}`,
          candidateNote1 || undefined,
          candidate2 ? `候補2: ${candidate2}` : undefined,
          candidateNote2 || undefined,
          candidate3 ? `候補3: ${candidate3}` : undefined,
          candidateNote3 || undefined,
          item.address || undefined,
          item.officialUrl || undefined,
          item.notes || undefined,
          ''
        ])
      );
    });
  }

  if (trip.notebookPages?.length) {
    lines.push('■ ノート');
    trip.notebookPages.forEach((page) => {
      lines.push(
        ...compactLines([
          `・${page.title || '無題のページ'}`,
          page.body || undefined,
          ...(page.links || []),
          ''
        ])
      );
    });
  }

  lines.push('TripMapから共有');
  return lines.join('\n').replace(/\n{3,}/g, '\n\n');
};

export const shareTrip = async (trip: Trip) => {
  await Share.share({
    title: trip.title,
    message: createTripShareText(trip)
  });
};
