import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface UserSession {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'GUEST';
  assignedMarriageId?: string | null;
}

interface AuthState {
  user: UserSession | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<UserSession | null>) {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
      state.isLoading = false;
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload;
    },
    logout(state) {
      state.user = null;
      state.isAuthenticated = false;
      state.isLoading = false;
    }
  }
});

export const { setUser, setLoading, logout } = authSlice.actions;
export default authSlice.reducer;

