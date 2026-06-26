import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { sampleTrips } from '../data/sampleData';
import { ensureAnonymousUser, isFirebaseConfigured } from '../services/firebase';
import {
  deleteTripFromCloud,
  loadTripsFromCloud,
  upsertTripToCloud
} from '../services/tripCloudRepository';
import { NotebookPageDraft, PlanItemDraft, SpotDraft, SyncStatus, Trip, TripDraft } from '../types/models';
import { normalizeDate } from '../utils/date';
import { createId } from '../utils/id';
import { scheduleCancellationReminder, scheduleEventReminder } from '../services/notifications';

type TripStore = {
  trips: Trip[];
  hasHydrated: boolean;
  syncStatus: SyncStatus;
  syncMessage: string;
  setHydrated: (value: boolean) => void;
  seedIfEmpty: () => void;
  resetToSample: () => void;
  createTrip: (draft: TripDraft) => string;
  updateTrip: (tripId: string, draft: TripDraft) => void;
  deleteTrip: (tripId: string) => void;
  toggleTripArchive: (tripId: string) => void;
  addSpot: (tripId: string, draft: SpotDraft) => string;
  updateSpot: (tripId: string, spotId: string, draft: SpotDraft) => void;
  deleteSpot: (tripId: string, spotId: string) => void;
  addNotebookPage: (tripId: string, draft: NotebookPageDraft) => string;
  updateNotebookPage: (tripId: string, pageId: string, draft: NotebookPageDraft) => void;
  deleteNotebookPage: (tripId: string, pageId: string) => void;
  addPlanItem: (tripId: string, draft: PlanItemDraft) => string;
  updatePlanItem: (tripId: string, planItemId: string, draft: PlanItemDraft) => void;
  deletePlanItem: (tripId: string, planItemId: string) => void;
  backupToCloud: () => Promise<void>;
  restoreFromCloud: () => Promise<void>;
};

const nowIso = () => new Date().toISOString();

const normalizeTripDraft = (draft: TripDraft) => ({
  title: draft.title.trim(),
  destination: draft.destination.trim(),
  startDate: normalizeDate(draft.startDate),
  endDate: normalizeDate(draft.endDate || draft.startDate),
  coverImageUrl: draft.coverImageUrl?.trim() || ''
});

const normalizeSpotDraft = (draft: SpotDraft) => ({
  ...draft,
  name: draft.name.trim(),
  address: draft.address.trim(),
  destinationAddress: draft.destinationAddress?.trim() || '',
  date: normalizeDate(draft.date),
  endDate: draft.endDate ? normalizeDate(draft.endDate) : undefined,
  startTime: draft.startTime?.trim() || '',
  endTime: draft.endTime?.trim() || '',
  bookingSite: draft.bookingSite?.trim() || '',
  confirmationNumber: draft.confirmationNumber?.trim() || '',
  officialUrl: draft.officialUrl?.trim() || '',
  phone: draft.phone?.trim() || '',
  businessHours: draft.businessHours?.trim() || '',
  placeDetails: draft.placeDetails?.trim() || '',
  notes: draft.notes?.trim() || '',
  travelDuration: draft.travelDuration?.trim() || '',
  routeUrl: draft.routeUrl?.trim() || '',
  cancellationFeeStartDate: draft.cancellationFeeStartDate
    ? normalizeDate(draft.cancellationFeeStartDate)
    : undefined,
  cancellationReminderEnabled: Boolean(draft.cancellationReminderEnabled),
  cancellationNotificationId: draft.cancellationNotificationId?.trim() || '',
  eventReminderEnabled: Boolean(draft.eventReminderEnabled),
  eventNotificationId: draft.eventNotificationId?.trim() || '',
  currency: draft.currency?.trim() || 'JPY',
  attachments: draft.attachments || [],
  files: draft.files || []
});

const normalizeNotebookPageDraft = (draft: NotebookPageDraft) => ({
  title: draft.title.trim(),
  body: draft.body.trim(),
  links: draft.links.map((link) => link.trim()).filter(Boolean),
  attachments: draft.attachments || []
});

const normalizePlanItemDraft = (draft: PlanItemDraft) => ({
  type: draft.type,
  title: draft.title.trim(),
  address: draft.address?.trim() || '',
  officialUrl: draft.officialUrl?.trim() || '',
  notes: draft.notes?.trim() || '',
  candidateDate1: draft.candidateDate1 ? normalizeDate(draft.candidateDate1) : undefined,
  candidateStartTime1: draft.candidateStartTime1?.trim() || '',
  candidateEndTime1: draft.candidateEndTime1?.trim() || '',
  candidateNote1: draft.candidateNote1?.trim() || '',
  candidateDate2: draft.candidateDate2 ? normalizeDate(draft.candidateDate2) : undefined,
  candidateStartTime2: draft.candidateStartTime2?.trim() || '',
  candidateEndTime2: draft.candidateEndTime2?.trim() || '',
  candidateNote2: draft.candidateNote2?.trim() || '',
  candidateDate3: draft.candidateDate3 ? normalizeDate(draft.candidateDate3) : undefined,
  candidateStartTime3: draft.candidateStartTime3?.trim() || '',
  candidateEndTime3: draft.candidateEndTime3?.trim() || '',
  candidateNote3: draft.candidateNote3?.trim() || ''
});

export const useTripStore = create<TripStore>()(
  persist(
    (set, get) => ({
      trips: [],
      hasHydrated: false,
      syncStatus: 'idle',
      syncMessage: '',
      setHydrated: (value) => set({ hasHydrated: value }),
      seedIfEmpty: () => {
        if (get().trips.length === 0) {
          set({ trips: sampleTrips });
        }
      },
      resetToSample: () => set({ trips: sampleTrips, syncMessage: 'サンプルデータを復元しました。' }),
      createTrip: (draft) => {
        const id = createId('trip');
        const timestamp = nowIso();
        const nextTrip: Trip = {
          id,
          ...normalizeTripDraft(draft),
          isArchived: false,
          createdAt: timestamp,
          updatedAt: timestamp,
          spots: [],
          notebookPages: [],
          planItems: []
        };

        set((state) => ({ trips: [nextTrip, ...state.trips] }));
        return id;
      },
      updateTrip: (tripId, draft) => {
        set((state) => ({
          trips: state.trips.map((trip) =>
            trip.id === tripId
              ? {
                  ...trip,
                  ...normalizeTripDraft(draft),
                  updatedAt: nowIso()
                }
              : trip
          )
        }));
      },
      deleteTrip: (tripId) => {
        set((state) => ({ trips: state.trips.filter((trip) => trip.id !== tripId) }));
      },
      toggleTripArchive: (tripId) => {
        set((state) => ({
          trips: state.trips.map((trip) =>
            trip.id === tripId ? { ...trip, isArchived: !trip.isArchived, updatedAt: nowIso() } : trip
          )
        }));
      },
      addSpot: (tripId, draft) => {
        const id = createId('spot');
        const timestamp = nowIso();
        set((state) => ({
          trips: state.trips.map((trip) =>
            trip.id === tripId
              ? {
                  ...trip,
                  updatedAt: timestamp,
                  spots: [
                    ...trip.spots,
                    {
                      id,
                      ...normalizeSpotDraft(draft),
                      createdAt: timestamp,
                      updatedAt: timestamp
                    }
                  ]
                }
              : trip
          )
        }));
        return id;
      },
      updateSpot: (tripId, spotId, draft) => {
        const timestamp = nowIso();
        set((state) => ({
          trips: state.trips.map((trip) =>
            trip.id === tripId
              ? {
                  ...trip,
                  updatedAt: timestamp,
                  spots: trip.spots.map((spot) =>
                    spot.id === spotId
                      ? {
                          ...spot,
                          ...normalizeSpotDraft(draft),
                          updatedAt: timestamp
                        }
                      : spot
                  )
                }
              : trip
          )
        }));
      },
      deleteSpot: (tripId, spotId) => {
        set((state) => ({
          trips: state.trips.map((trip) =>
            trip.id === tripId
              ? {
                  ...trip,
                  updatedAt: nowIso(),
                  spots: trip.spots.filter((spot) => spot.id !== spotId)
                }
              : trip
          )
        }));
      },
      addNotebookPage: (tripId, draft) => {
        const id = createId('page');
        const timestamp = nowIso();
        set((state) => ({
          trips: state.trips.map((trip) =>
            trip.id === tripId
              ? {
                  ...trip,
                  updatedAt: timestamp,
                  notebookPages: [
                    ...(trip.notebookPages || []),
                    {
                      id,
                      ...normalizeNotebookPageDraft(draft),
                      createdAt: timestamp,
                      updatedAt: timestamp
                    }
                  ]
                }
              : trip
          )
        }));
        return id;
      },
      updateNotebookPage: (tripId, pageId, draft) => {
        const timestamp = nowIso();
        set((state) => ({
          trips: state.trips.map((trip) =>
            trip.id === tripId
              ? {
                  ...trip,
                  updatedAt: timestamp,
                  notebookPages: (trip.notebookPages || []).map((page) =>
                    page.id === pageId
                      ? { ...page, ...normalizeNotebookPageDraft(draft), updatedAt: timestamp }
                      : page
                  )
                }
              : trip
          )
        }));
      },
      deleteNotebookPage: (tripId, pageId) => {
        set((state) => ({
          trips: state.trips.map((trip) =>
            trip.id === tripId
              ? {
                  ...trip,
                  updatedAt: nowIso(),
                  notebookPages: (trip.notebookPages || []).filter((page) => page.id !== pageId)
                }
              : trip
          )
        }));
      },
      addPlanItem: (tripId, draft) => {
        const id = createId('plan');
        const timestamp = nowIso();
        set((state) => ({
          trips: state.trips.map((trip) =>
            trip.id === tripId
              ? {
                  ...trip,
                  updatedAt: timestamp,
                  planItems: [
                    ...(trip.planItems || []),
                    {
                      id,
                      ...normalizePlanItemDraft(draft),
                      createdAt: timestamp,
                      updatedAt: timestamp
                    }
                  ]
                }
              : trip
          )
        }));
        return id;
      },
      updatePlanItem: (tripId, planItemId, draft) => {
        const timestamp = nowIso();
        set((state) => ({
          trips: state.trips.map((trip) =>
            trip.id === tripId
              ? {
                  ...trip,
                  updatedAt: timestamp,
                  planItems: (trip.planItems || []).map((item) =>
                    item.id === planItemId
                      ? { ...item, ...normalizePlanItemDraft(draft), updatedAt: timestamp }
                      : item
                  )
                }
              : trip
          )
        }));
      },
      deletePlanItem: (tripId, planItemId) => {
        set((state) => ({
          trips: state.trips.map((trip) =>
            trip.id === tripId
              ? {
                  ...trip,
                  updatedAt: nowIso(),
                  planItems: (trip.planItems || []).filter((item) => item.id !== planItemId)
                }
              : trip
          )
        }));
      },
      backupToCloud: async () => {
        if (!isFirebaseConfigured()) {
          set({ syncStatus: 'error', syncMessage: 'ネット保存を利用できません。' });
          return;
        }

        set({ syncStatus: 'syncing', syncMessage: '旅行データをバックアップしています...' });

        try {
          const user = await ensureAnonymousUser();
          const localTrips = get().trips;
          const cloudTrips = await loadTripsFromCloud(user.uid);
          const localTripIds = new Set(localTrips.map((trip) => trip.id));

          await Promise.all([
            ...localTrips.map((trip) => upsertTripToCloud(user.uid, trip)),
            ...cloudTrips
              .filter((trip) => !localTripIds.has(trip.id))
              .map((trip) => deleteTripFromCloud(user.uid, trip.id))
          ]);

          set({
            syncStatus: 'success',
            syncMessage: `旅行${localTrips.length}件をバックアップしました。`
          });
        } catch {
          set({
            syncStatus: 'error',
            syncMessage: 'バックアップできませんでした。通信状態を確認して、もう一度お試しください。'
          });
        }
      },
      restoreFromCloud: async () => {
        if (!isFirebaseConfigured()) {
          set({ syncStatus: 'error', syncMessage: 'ネット保存を利用できません。' });
          return;
        }

        set({ syncStatus: 'syncing', syncMessage: 'バックアップを読み込んでいます...' });

        try {
          const user = await ensureAnonymousUser();
          const cloudTrips = await loadTripsFromCloud(user.uid);

          if (cloudTrips.length === 0) {
            set({
              syncStatus: 'error',
              syncMessage: '読み込めるバックアップがありません。'
            });
            return;
          }

          const restoredTrips = await Promise.all(
            cloudTrips.map(async (trip) => ({
              ...trip,
              spots: await Promise.all(
                trip.spots.map(async (spot) => {
                  let restoredSpot = { ...spot };

                  if (spot.eventReminderEnabled) {
                    try {
                      const eventNotificationId = await scheduleEventReminder({
                        eventDate: spot.date,
                        eventTime: spot.startTime,
                        spotName: spot.name,
                        tripTitle: trip.title
                      });
                      restoredSpot = { ...restoredSpot, eventNotificationId };
                    } catch {
                      restoredSpot = {
                        ...restoredSpot,
                        eventReminderEnabled: false,
                        eventNotificationId: ''
                      };
                    }
                  }

                  if (spot.cancellationReminderEnabled && spot.cancellationFeeStartDate) {
                    try {
                      const cancellationNotificationId = await scheduleCancellationReminder({
                        cancellationFeeStartDate: spot.cancellationFeeStartDate,
                        spotName: spot.name,
                        tripTitle: trip.title
                      });
                      restoredSpot = { ...restoredSpot, cancellationNotificationId };
                    } catch {
                      restoredSpot = {
                        ...restoredSpot,
                        cancellationReminderEnabled: false,
                        cancellationNotificationId: ''
                      };
                    }
                  }

                  return restoredSpot;
                })
              )
            }))
          );

          set({
            trips: restoredTrips,
            syncStatus: 'success',
            syncMessage: `バックアップから旅行${cloudTrips.length}件を復元しました。`
          });
        } catch {
          set({
            syncStatus: 'error',
            syncMessage: 'バックアップを読み込めませんでした。通信状態を確認して、もう一度お試しください。'
          });
        }
      }
    }),
    {
      name: 'trip-map-store',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ trips: state.trips }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      }
    }
  )
);
