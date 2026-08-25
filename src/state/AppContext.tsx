import React, { createContext, useReducer, useEffect, type Dispatch } from "react";
import type { ItemConfig } from "@/types/itemConfig";
import type { ItemSetSummary, ViewSettings } from "@/types/storage";
import { appReducer } from "./appReducer";
import type { AppAction } from "./actions";
import { loadViewSettings } from "@/storage/local/viewSettingsStore";
import { loadDarkMode } from "@/storage/local/darkModeStore";
import { getAllItemSetSummaries } from "@/storage/idb/itemSetRepository";

export interface AppState {
  items: ItemConfig[];
  currentSetId: string | null;
  currentSetName: string;
  savedSets: ItemSetSummary[];
  viewSettings: ViewSettings;
  darkMode: boolean;
  /** Item hovered in the registration panel — its chart series is emphasised */
  hoveredItemId: string | null;
}

const initialState: AppState = {
  items: [],
  currentSetId: null,
  currentSetName: "",
  savedSets: [],
  viewSettings: loadViewSettings(),
  darkMode: loadDarkMode(),
  hoveredItemId: null,
};

export const AppStateContext = createContext<AppState | null>(null);
export const AppDispatchContext = createContext<Dispatch<AppAction> | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Load saved set summaries from IndexedDB on mount
  useEffect(() => {
    getAllItemSetSummaries()
      .then((summaries) => {
        dispatch({ type: "SET_SAVED_SETS_SUMMARY", payload: summaries });
      })
      .catch(console.error);
  }, []);

  // Apply dark mode class to <html>
  useEffect(() => {
    if (state.darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [state.darkMode]);

  return (
    <AppStateContext.Provider value={state}>
      <AppDispatchContext.Provider value={dispatch}>
        {children}
      </AppDispatchContext.Provider>
    </AppStateContext.Provider>
  );
}
