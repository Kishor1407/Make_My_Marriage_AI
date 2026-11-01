import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface MarriageStats {
  totalPhotos: number;
  totalVideos: number;
  totalGuestsEngaged: number;
}

export interface Marriage {
  _id: string;
  partnerOneName: string;
  partnerTwoName: string;
  marriageCode: string;
  qrCodeUrl: string;
  globalStats: MarriageStats;
  createdAt: string;
}

export interface TimelineEvent {
  _id: string;
  marriageId: string;
  eventType: 'ENGAGEMENT' | 'MEHNDI' | 'HALDI' | 'SANGEET' | 'MARRIAGE' | 'OTHERS';
  customTitle?: string | null;
  eventDate?: string | null;
  eventTime?: string | null;
  venueAddress?: string | null;
  liveStreamUrl?: string | null;
  eventStats: {
    photoCount: number;
    videoCount: number;
  };
}

interface MarriageState {
  currentMarriage: Marriage | null;
  events: TimelineEvent[];
  activeTab: string;
  isLoading: boolean;
}

const initialState: MarriageState = {
  currentMarriage: null,
  events: [],
  activeTab: 'ENGAGEMENT',
  isLoading: false
};

const marriageSlice = createSlice({
  name: 'marriage',
  initialState,
  reducers: {
    setCurrentMarriage(state, action: PayloadAction<Marriage | null>) {
      state.currentMarriage = action.payload;
    },
    setEvents(state, action: PayloadAction<TimelineEvent[]>) {
      state.events = action.payload;
    },
    setActiveTab(state, action: PayloadAction<string>) {
      state.activeTab = action.payload;
    },
    incrementPhotoCount(state, action: PayloadAction<{ eventId: string; count: number }>) {
      if (state.currentMarriage) {
        state.currentMarriage.globalStats.totalPhotos += action.payload.count;
      }
      const event = state.events.find((e) => e._id === action.payload.eventId);
      if (event) {
        event.eventStats.photoCount += action.payload.count;
      }
    }
  }
});

export const {
  setCurrentMarriage,
  setEvents,
  setActiveTab,
  incrementPhotoCount
} = marriageSlice.actions;

export default marriageSlice.reducer;

