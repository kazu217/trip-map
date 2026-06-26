import {
  collection,
  deleteDoc,
  doc,
  DocumentData,
  getDocs,
  setDoc,
  Timestamp,
  writeBatch
} from 'firebase/firestore';

import { getFirebaseClients } from './firebase';
import { FileAttachment, Spot, Trip } from '../types/models';

const toTimestamp = (value?: string) => {
  if (!value) return null;
  return Timestamp.fromDate(new Date(value));
};

const toIso = (value: unknown) => {
  if (!value) return undefined;
  if (value instanceof Timestamp) return value.toDate().toISOString();
  if (typeof value === 'string') return value;
  if (value instanceof Date) return value.toISOString();
  return undefined;
};

const serializeSpot = (spot: Spot) => {
  const {
    cancellationNotificationId: _localCancellationNotificationId,
    eventNotificationId: _localEventNotificationId,
    ...cloudSpot
  } = spot;
  return {
    ...cloudSpot,
    date: toTimestamp(spot.date),
    endDate: spot.endDate ? toTimestamp(spot.endDate) : null,
    cancellationFeeStartDate: spot.cancellationFeeStartDate
      ? toTimestamp(spot.cancellationFeeStartDate)
      : null,
    createdAt: toTimestamp(spot.createdAt),
    updatedAt: toTimestamp(spot.updatedAt)
  };
};

const deserializeFiles = (value: unknown): FileAttachment[] =>
  Array.isArray(value)
    ? value
        .filter((file): file is DocumentData => Boolean(file && typeof file === 'object'))
        .map((file) => ({
          id: typeof file.id === 'string' ? file.id : '',
          name: typeof file.name === 'string' ? file.name : '添付ファイル',
          uri: typeof file.uri === 'string' ? file.uri : '',
          mimeType: typeof file.mimeType === 'string' ? file.mimeType : 'application/octet-stream',
          size: typeof file.size === 'number' ? file.size : 0
        }))
        .filter((file) => file.id && file.uri)
    : [];

const deserializeSpot = (id: string, data: DocumentData): Spot => ({
  id,
  type: data.type,
  name: data.name || '',
  address: data.address || '',
  destinationAddress: data.destinationAddress || '',
  lat: typeof data.lat === 'number' ? data.lat : undefined,
  lng: typeof data.lng === 'number' ? data.lng : undefined,
  destinationLat: typeof data.destinationLat === 'number' ? data.destinationLat : undefined,
  destinationLng: typeof data.destinationLng === 'number' ? data.destinationLng : undefined,
  date: toIso(data.date) || new Date().toISOString(),
  endDate: toIso(data.endDate),
  startTime: data.startTime || '',
  endTime: data.endTime || '',
  price: typeof data.price === 'number' ? data.price : undefined,
  currency: data.currency || 'JPY',
  bookingSite: data.bookingSite || '',
  confirmationNumber: data.confirmationNumber || '',
  officialUrl: data.officialUrl || '',
  phone: data.phone || '',
  businessHours: data.businessHours || '',
  placeDetails: data.placeDetails || '',
  notes: data.notes || '',
  attachments: Array.isArray(data.attachments) ? data.attachments : [],
  files: deserializeFiles(data.files),
  transportMode: data.transportMode || undefined,
  travelDuration: data.travelDuration || '',
  routeUrl: data.routeUrl || '',
  cancellationFeeStartDate: toIso(data.cancellationFeeStartDate),
  cancellationReminderEnabled: Boolean(data.cancellationReminderEnabled),
  cancellationNotificationId: '',
  eventReminderEnabled: Boolean(data.eventReminderEnabled),
  eventNotificationId: '',
  createdAt: toIso(data.createdAt) || new Date().toISOString(),
  updatedAt: toIso(data.updatedAt) || new Date().toISOString()
});

const serializeTrip = (trip: Trip) => ({
  title: trip.title,
  destination: trip.destination,
  startDate: toTimestamp(trip.startDate),
  endDate: toTimestamp(trip.endDate),
  coverImageUrl: trip.coverImageUrl || '',
  isArchived: trip.isArchived,
  createdAt: toTimestamp(trip.createdAt),
  updatedAt: toTimestamp(trip.updatedAt),
  notebookPages: (trip.notebookPages || []).map((page) => ({
    ...page,
    links: page.links || [],
    attachments: page.attachments || []
  })),
  planItems: (trip.planItems || []).map((item) => ({ ...item }))
});

const deserializeTrip = (id: string, data: DocumentData, spots: Spot[]): Trip => ({
  id,
  title: data.title || '',
  destination: data.destination || '',
  startDate: toIso(data.startDate) || new Date().toISOString(),
  endDate: toIso(data.endDate) || new Date().toISOString(),
  coverImageUrl: data.coverImageUrl || '',
  isArchived: Boolean(data.isArchived),
  createdAt: toIso(data.createdAt) || new Date().toISOString(),
  updatedAt: toIso(data.updatedAt) || new Date().toISOString(),
  spots,
  notebookPages: Array.isArray(data.notebookPages)
    ? data.notebookPages.map((page: DocumentData) => ({
        id: page.id || '',
        title: page.title || '',
        body: page.body || '',
        links: Array.isArray(page.links) ? page.links : [],
        attachments: Array.isArray(page.attachments) ? page.attachments : [],
        createdAt: page.createdAt || new Date().toISOString(),
        updatedAt: page.updatedAt || new Date().toISOString()
      }))
    : [],
  planItems: Array.isArray(data.planItems)
    ? data.planItems.map((item: DocumentData) => ({
        id: item.id || '',
        type: item.type || 'attraction',
        title: item.title || '',
        address: item.address || '',
        officialUrl: item.officialUrl || '',
        notes: item.notes || '',
        candidateDate1: toIso(item.candidateDate1) || item.candidateDate1 || undefined,
        candidateStartTime1: item.candidateStartTime1 || '',
        candidateEndTime1: item.candidateEndTime1 || '',
        candidateNote1: item.candidateNote1 || '',
        candidateDate2: toIso(item.candidateDate2) || item.candidateDate2 || undefined,
        candidateStartTime2: item.candidateStartTime2 || '',
        candidateEndTime2: item.candidateEndTime2 || '',
        candidateNote2: item.candidateNote2 || '',
        candidateDate3: toIso(item.candidateDate3) || item.candidateDate3 || undefined,
        candidateStartTime3: item.candidateStartTime3 || '',
        candidateEndTime3: item.candidateEndTime3 || '',
        candidateNote3: item.candidateNote3 || '',
        createdAt: toIso(item.createdAt) || item.createdAt || new Date().toISOString(),
        updatedAt: toIso(item.updatedAt) || item.updatedAt || new Date().toISOString()
      }))
    : []
});

export const loadTripsFromCloud = async (userId: string): Promise<Trip[]> => {
  const { db } = getFirebaseClients();
  if (!db) throw new Error('Firestoreが未設定です。');

  const tripsSnapshot = await getDocs(collection(db, 'users', userId, 'trips'));
  const trips = await Promise.all(
    tripsSnapshot.docs.map(async (tripDoc) => {
      const spotsSnapshot = await getDocs(collection(db, 'users', userId, 'trips', tripDoc.id, 'spots'));
      const spots = spotsSnapshot.docs.map((spotDoc) => deserializeSpot(spotDoc.id, spotDoc.data()));
      return deserializeTrip(tripDoc.id, tripDoc.data(), spots);
    })
  );

  return trips.sort((a, b) => b.startDate.localeCompare(a.startDate));
};

export const upsertTripToCloud = async (userId: string, trip: Trip) => {
  const { db } = getFirebaseClients();
  if (!db) throw new Error('Firestoreが未設定です。');

  const tripRef = doc(db, 'users', userId, 'trips', trip.id);
  await setDoc(tripRef, serializeTrip(trip), { merge: true });

  const spotsRef = collection(db, 'users', userId, 'trips', trip.id, 'spots');
  const existingSpots = await getDocs(spotsRef);
  const nextSpotIds = new Set(trip.spots.map((spot) => spot.id));
  const batch = writeBatch(db);

  existingSpots.docs.forEach((spotDoc) => {
    if (!nextSpotIds.has(spotDoc.id)) batch.delete(spotDoc.ref);
  });

  trip.spots.forEach((spot) => {
    batch.set(doc(spotsRef, spot.id), serializeSpot(spot), { merge: true });
  });

  await batch.commit();
};

export const deleteTripFromCloud = async (userId: string, tripId: string) => {
  const { db } = getFirebaseClients();
  if (!db) throw new Error('Firestoreが未設定です。');

  const spotsRef = collection(db, 'users', userId, 'trips', tripId, 'spots');
  const spotsSnapshot = await getDocs(spotsRef);
  const batch = writeBatch(db);
  spotsSnapshot.docs.forEach((spotDoc) => batch.delete(spotDoc.ref));
  await batch.commit();

  await deleteDoc(doc(db, 'users', userId, 'trips', tripId));
};
