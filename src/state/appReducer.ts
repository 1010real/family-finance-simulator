import type { AppAction } from "./actions";
import type { AppState } from "./AppContext";

function assertNever(x: never): never {
  throw new Error(`Unhandled action: ${JSON.stringify(x)}`);
}

export function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "ADD_ITEM":
      return { ...state, items: [...state.items, action.payload] };

    case "UPDATE_ITEM":
      return {
        ...state,
        items: state.items.map((item) =>
          item.id === action.payload.id ? action.payload : item
        ),
      };

    case "DELETE_ITEM":
      return {
        ...state,
        items: state.items.filter((item) => item.id !== action.payload.id),
      };

    case "REORDER_ITEMS":
      return { ...state, items: action.payload };

    case "LOAD_SET":
      return {
        ...state,
        items: action.payload.items,
        currentSetId: action.payload.id,
        currentSetName: action.payload.name,
      };

    case "SET_SAVED_SETS_SUMMARY":
      return { ...state, savedSets: action.payload };

    case "SET_CURRENT_SET_NAME":
      return { ...state, currentSetName: action.payload };

    case "SET_CURRENT_SET_ID":
      return { ...state, currentSetId: action.payload };

    case "CLEAR_ITEMS":
      return { ...state, items: [], currentSetId: null, currentSetName: "" };

    case "SET_VIEW_SETTINGS":
      return {
        ...state,
        viewSettings: { ...state.viewSettings, ...action.payload },
      };

    case "SET_DARK_MODE":
      return { ...state, darkMode: action.payload };

    default:
      return assertNever(action);
  }
}
