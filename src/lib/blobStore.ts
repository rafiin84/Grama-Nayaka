"use client";
/** Browser-only file storage (IndexedDB) so uploads can be played/opened later. Not a server; data stays in this browser. */
const DB = "gn-media"; const STORE = "blobs";
const open = () => new Promise<IDBDatabase>((res, rej) => { if (typeof indexedDB === "undefined") return rej(new Error("Storage is not available in this browser.")); const r = indexedDB.open(DB, 1); r.onupgradeneeded = () => r.result.createObjectStore(STORE); r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); });
const run = async <T,>(mode: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest<T>): Promise<T> => { const db = await open(); return new Promise<T>((res, rej) => { const tx = db.transaction(STORE, mode); const rq = fn(tx.objectStore(STORE)); rq.onsuccess = () => res(rq.result); rq.onerror = () => rej(rq.error); }); };
export const putBlob = (id: string, blob: Blob) => run("readwrite", (s) => s.put(blob, id));
export const getBlob = (id: string) => run<Blob | undefined>("readonly", (s) => s.get(id) as IDBRequest<Blob | undefined>);
export const delBlob = (id: string) => run("readwrite", (s) => s.delete(id)).catch(() => undefined);
export const clearBlobs = () => run("readwrite", (s) => s.clear()).catch(() => undefined);
export const newBlobId = () => `blob-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
