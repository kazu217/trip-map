export type SpotType = 'hotel' | 'attraction' | 'restaurant' | 'tour' | 'transport';

export type TransportMode = 'bus' | 'train' | 'ferry' | 'flight' | 'taxi' | 'walk' | 'other';

export type CurrencyCode = 'JPY' | 'NZD' | 'USD' | 'EUR' | 'KRW' | 'THB' | 'SGD' | 'AUD' | string;

export type SyncStatus = 'idle' | 'syncing' | 'success' | 'error';

export interface FileAttachment {
  id: string;
  name: string;
  uri: string;
  mimeType: string;
  size: number;
}

export interface NotebookPage {
  id: string;
  title: string;
  body: string;
  links: string[];
  attachments: string[];
  createdAt: string;
  updatedAt: string;
}

export type PlanItemType = Exclude<SpotType, 'hotel'>;

export interface PlanItem {
  id: string;
  type: PlanItemType;
  title: string;
  address?: string;
  officialUrl?: string;
  notes?: string;
  candidateDate1?: string;
  candidateStartTime1?: string;
  candidateEndTime1?: string;
  candidateNote1?: string;
  candidateDate2?: string;
  candidateStartTime2?: string;
  candidateEndTime2?: string;
  candidateNote2?: string;
  candidateDate3?: string;
  candidateStartTime3?: string;
  candidateEndTime3?: string;
  candidateNote3?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Spot {
  id: string;
  type: SpotType;
  name: string;
  address: string;
  destinationAddress?: string;
  lat?: number;
  lng?: number;
  destinationLat?: number;
  destinationLng?: number;
  date: string;
  endDate?: string;
  startTime?: string;
  endTime?: string;
  price?: number;
  currency?: CurrencyCode;
  bookingSite?: string;
  confirmationNumber?: string;
  officialUrl?: string;
  phone?: string;
  businessHours?: string;
  placeDetails?: string;
  notes?: string;
  attachments: string[];
  files?: FileAttachment[];
  transportMode?: TransportMode;
  travelDuration?: string;
  routeUrl?: string;
  cancellationFeeStartDate?: string;
  cancellationReminderEnabled?: boolean;
  cancellationNotificationId?: string;
  eventReminderEnabled?: boolean;
  eventNotificationId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Trip {
  id: string;
  title: string;
  destination: string;
  startDate: string;
  endDate: string;
  coverImageUrl?: string;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
  spots: Spot[];
  notebookPages: NotebookPage[];
  planItems: PlanItem[];
}

export interface TripDraft {
  title: string;
  destination: string;
  startDate: string;
  endDate: string;
  coverImageUrl?: string;
}

export interface SpotDraft {
  type: SpotType;
  name: string;
  address: string;
  destinationAddress?: string;
  lat?: number;
  lng?: number;
  destinationLat?: number;
  destinationLng?: number;
  date: string;
  endDate?: string;
  startTime?: string;
  endTime?: string;
  price?: number;
  currency?: CurrencyCode;
  bookingSite?: string;
  confirmationNumber?: string;
  officialUrl?: string;
  phone?: string;
  businessHours?: string;
  placeDetails?: string;
  notes?: string;
  attachments: string[];
  files: FileAttachment[];
  transportMode?: TransportMode;
  travelDuration?: string;
  routeUrl?: string;
  cancellationFeeStartDate?: string;
  cancellationReminderEnabled?: boolean;
  cancellationNotificationId?: string;
  eventReminderEnabled?: boolean;
  eventNotificationId?: string;
}

export interface NotebookPageDraft {
  title: string;
  body: string;
  links: string[];
  attachments: string[];
}

export interface PlanItemDraft {
  type: PlanItemType;
  title: string;
  address?: string;
  officialUrl?: string;
  notes?: string;
  candidateDate1?: string;
  candidateStartTime1?: string;
  candidateEndTime1?: string;
  candidateNote1?: string;
  candidateDate2?: string;
  candidateStartTime2?: string;
  candidateEndTime2?: string;
  candidateNote2?: string;
  candidateDate3?: string;
  candidateStartTime3?: string;
  candidateEndTime3?: string;
  candidateNote3?: string;
}
