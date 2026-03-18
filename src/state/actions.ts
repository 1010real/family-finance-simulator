import type { ItemConfig } from "@/types/itemConfig";
import type { ItemSet, ItemSetSummary, ViewSettings } from "@/types/storage";

export type AppAction =
  | { type: "ADD_ITEM"; payload: ItemConfig }
  | { type: "UPDATE_ITEM"; payload: ItemConfig }
  | { type: "DELETE_ITEM"; payload: { id: string } }
  | { type: "REORDER_ITEMS"; payload: ItemConfig[] }
  | { type: "LOAD_SET"; payload: ItemSet }
  | { type: "SET_SAVED_SETS_SUMMARY"; payload: ItemSetSummary[] }
  | { type: "SET_CURRENT_SET_NAME"; payload: string }
  | { type: "SET_CURRENT_SET_ID"; payload: string | null }
  | { type: "CLEAR_ITEMS" }
  | { type: "SET_VIEW_SETTINGS"; payload: Partial<ViewSettings> }
  | { type: "SET_DARK_MODE"; payload: boolean };
