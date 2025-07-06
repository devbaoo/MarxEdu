import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { TypedUseSelectorHook, useSelector, useDispatch } from "react-redux";
import { persistReducer, persistStore } from "redux-persist";
import storage from "redux-persist/lib/storage";
import authReducer from "../features/auth/authSlice";

import userReducer from "../features/user/userSlice";
import topicReducer from "../features/topic/topicSlice";
import lessonReducer from "../features/lesson/lessonSlice";
import adminReducer from "../features/admin/adminSlice";
import levelReducer from "../features/level/levelSlice"; 
import skillReducer from "../features/skill/skillSlice"; 
import packageReducer from "../features/package/packageSlice";


const presistConfig = {
  key: "root",
  storage,
  whitelist: ["auth", "user", "lesson", "topic", "admin", "level", "skill", "package"],
};

// Create a hook for using TypedUseSelectorHook
const rootReducer = combineReducers({
  auth: authReducer,
  user: userReducer,
  topic: topicReducer,
  lesson: lessonReducer,
  admin: adminReducer,
  level: levelReducer,
  skill: skillReducer,
  package: packageReducer,
  // Add other reducers here as needed
});

const persistedReducer = persistReducer(presistConfig, rootReducer);

// Combine all reducers
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/PERSIST"],
      },
    }),
});

// Persist the store
export const persistor = persistStore(store);

// Export types
export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;

// Export hooks for using TypedUseSelectorHook
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
