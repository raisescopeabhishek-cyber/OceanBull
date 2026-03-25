import { configureStore } from "@reduxjs/toolkit";
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";
import storage from "redux-persist/lib/storage";
import { combineReducers } from "redux";

import userSlice from "./user/userSlice";
import adminSlice from "./adminSlice";
import themeReducer from "./theme/themeSlice"; // ✅ add this
import superadminThemeReducer from "./superadminThemeSlice";
const rootPersistConfig = {
  key: "root",
  storage,
  version: 1,
  whitelist: ["user", "admin", "theme"], // ✅ add theme (recommended)
};

const rootReducer = combineReducers({
  user: userSlice,
  admin: adminSlice,
  theme: themeReducer, // ✅ add this
  superadminTheme : superadminThemeReducer
});

const persistedReducer = persistReducer(rootPersistConfig, rootReducer);

const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);
export default store;
