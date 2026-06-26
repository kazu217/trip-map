import { SpotDraft } from '../types/models';

export type TripsStackParamList = {
  Home: undefined;
  TripForm: { tripId?: string } | undefined;
  TripDetail: { tripId: string };
  SpotForm: { tripId: string; spotId?: string; importDraft?: Partial<SpotDraft>; planItemId?: string };
  SpotDetail: { tripId: string; spotId: string };
  BookingImport: { tripId: string };
  Notebook: { tripId: string };
  NotebookPage: { tripId: string; pageId?: string };
  PlanList: { tripId: string };
  PlanForm: { tripId: string; planItemId?: string };
};

export type RootTabParamList = {
  Trips: undefined;
  Settings: undefined;
};
