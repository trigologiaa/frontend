import { vi } from "vitest";

let collections = new Map();
let failing = false;
let writesFailing = false;
let nextId = 1;

export function resetFirestore() {
  collections = new Map();
  failing = false;
  writesFailing = false;
  nextId = 1;
}

export function setCollection(name, documents) {
  failing = false;
  collections.set(
    name,
    new Map(documents.map(({ id, ...data }) => [id, data])),
  );
}

export function readCollection(name) {
  return [...(collections.get(name) ?? [])].map(([id, data]) => ({
    id,
    ...data,
  }));
}

export function failFirestore() {
  failing = true;
}

export function failWrites() {
  writesFailing = true;
}

function table(name) {
  if (!collections.has(name)) collections.set(name, new Map());
  return collections.get(name);
}

function readable(name) {
  if (failing) throw new Error("Firestore is unreachable");
  return table(name);
}

function writable(name) {
  if (failing || writesFailing) throw new Error("Firestore is unreachable");
  return table(name);
}

function snapshot(id, data) {
  return { id, exists: () => data !== undefined, data: () => data };
}

export const firestoreModule = {
  getFirestore: vi.fn(() => ({})),
  collection: (_db, name) => ({ name }),
  doc: (_db, name, id) => ({ name, id }),
  serverTimestamp: () => "server-timestamp",
  getDocs: async ({ name }) => ({
    docs: [...readable(name)].map(([id, data]) => snapshot(id, data)),
  }),
  getDoc: async ({ name, id }) => snapshot(id, readable(name).get(id)),
  addDoc: async ({ name }, data) => {
    const documents = writable(name);
    const id = `doc-${nextId++}`;
    documents.set(id, data);
    return { id };
  },
  updateDoc: async ({ name, id }, data) => {
    const documents = writable(name);
    if (!documents.has(id)) throw new Error("No document to update");
    documents.set(id, { ...documents.get(id), ...data });
  },
  deleteDoc: async ({ name, id }) => {
    writable(name).delete(id);
  },
};
