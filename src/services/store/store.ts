import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { TypedUseSelectorHook, useSelector, useDispatch } from "react-redux";
import { persistReducer, persistStore } from "redux-persist";
import storage from "redux-persist/lib/storage";
import authReducer from "../features/auth/authSlice";
import userReducer from "../features/user/userSlice";
// import topicReducer from "../features/topic/topicSlice"; // DEPRECATED - Use marxistReducer instead
// import lessonReducer from "../features/lesson/lessonSlice"; // DEPRECATED - Use marxistReducer instead
import adminReducer from "../features/admin/adminSlice";
import adminSurveyReducer from "../features/admin/adminSurveySlice";
// import levelReducer from "../features/level/levelSlice"; // DEPRECATED - Use marxistReducer instead
// import skillReducer from "../features/skill/skillSlice"; // DEPRECATED - Use marxistReducer instead
import packageReducer from "../features/package/packageSlice";
import philosophyReducer from "../features/marxist/philosophySlice";
import checkInReducer from "../features/checkin/checkInSlice";
import surveyReducer from "../features/survey/surveySlice";
import flashcardReducer from "../features/flashcard/flashcardSlice";

const presistConfig = {
  key: "root",
  storage,
  whitelist: [
    "auth",
    "user",
    "admin",
    "adminSurvey",
    "package",
    "philosophy",
    "checkIn",
    "survey",
    "flashcard",
  ], // Removed deprecated: lesson, topic, level, skill, marxist
};

// Create a hook for using TypedUseSelectorHook
const rootReducer = combineReducers({
  auth: authReducer,
  user: userReducer,
  // topic: topicReducer, // DEPRECATED - Use marxist instead
  // lesson: lessonReducer, // DEPRECATED - Use marxist instead
  admin: adminReducer,
  adminSurvey: adminSurveyReducer,
  // level: levelReducer, // DEPRECATED - Use marxist instead
  // skill: skillReducer, // DEPRECATED - Use marxist instead
  package: packageReducer,
  philosophy: philosophyReducer,
  checkIn: checkInReducer,
  survey: surveyReducer,
  flashcard: flashcardReducer,
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
