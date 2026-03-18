import { getDB } from "./db";
import type { ItemSet, ItemSetSummary } from "@/types/storage";

export async function getAllItemSets(): Promise<ItemSet[]> {
  const db = await getDB();
  return db.getAll("itemSets");
}

export async function getAllItemSetSummaries(): Promise<ItemSetSummary[]> {
  const sets = await getAllItemSets();
  return sets
    .map(({ id, name, updatedAt }) => ({ id, name, updatedAt }))
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export async function getItemSetById(id: string): Promise<ItemSet | undefined> {
  const db = await getDB();
  return db.get("itemSets", id);
}

export async function saveItemSet(set: ItemSet): Promise<void> {
  const db = await getDB();
  await db.put("itemSets", set);
}

export async function deleteItemSet(id: string): Promise<void> {
  const db = await getDB();
  await db.delete("itemSets", id);
}
