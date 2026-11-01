import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import marriageReducer from './slices/marriageSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    marriage: marriageReducer
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

