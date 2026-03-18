import { openDB, type IDBPDatabase } from "idb";
import type { ItemSet } from "@/types/storage";

export interface AppDB {
  itemSets: {
    key: string;
    value: ItemSet;
    indexes: { "by-name": string };
  };
}

let dbPromise: Promise<IDBPDatabase<AppDB>> | null = null;

export function getDB(): Promise<IDBPDatabase<AppDB>> {
  if (!dbPromise) {
    dbPromise = openDB<AppDB>("family-finance-db", 1, {
      upgrade(db) {
        const store = db.createObjectStore("itemSets", { keyPath: "id" });
        store.createIndex("by-name", "name");
      },
    });
  }
  return dbPromise;
}
