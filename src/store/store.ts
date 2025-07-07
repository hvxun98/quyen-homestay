import { configureStore } from '@reduxjs/toolkit';
import appReducer from './slices/app';

export const store = configureStore({
  reducer: {
    app: appReducer
  },
  devTools: process.env.NODE_ENV !== 'production' // Bật Redux DevTools khi không ở production
});

// Tạo kiểu dữ liệu TypeScript cho Redux Store
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
