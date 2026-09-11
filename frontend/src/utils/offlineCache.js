/**
 * IndexedDB Offline Cache Layer
 * Stores form data, matched schemes, and checklists for offline usage.
 * Auto-syncs when connectivity returns.
 */
const DB_NAME = 'govtech-scheme-finder';
const DB_VERSION = 1;
const STORES = {
  formData: 'formData',
  schemes: 'schemes',
  checklists: 'checklists',
  syncQueue: 'syncQueue',
};

function openDB() {
  return new Promise((resolve, reject) => {
    if (!window.indexedDB) {
      reject(new Error('IndexedDB not supported'));
      return;
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORES.formData)) {
        db.createObjectStore(STORES.formData, { keyPath: 'key' });
      }
      if (!db.objectStoreNames.contains(STORES.schemes)) {
        db.createObjectStore(STORES.schemes, { keyPath: 'key' });
      }
      if (!db.objectStoreNames.contains(STORES.checklists)) {
        db.createObjectStore(STORES.checklists, { keyPath: 'key' });
      }
      if (!db.objectStoreNames.contains(STORES.syncQueue)) {
        db.createObjectStore(STORES.syncQueue, { keyPath: 'id', autoIncrement: true });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function put(storeName, data) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    const req = store.put(data);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function get(storeName, key) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);
    const req = store.get(key);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function getAll(storeName) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function deleteItem(storeName, key) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    const req = store.delete(key);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

// --- High-level API ---

export async function cacheFormData(key, data) {
  await put(STORES.formData, { key, data, timestamp: Date.now() });
}

export async function getCachedFormData(key) {
  const result = await get(STORES.formData, key);
  return result ? result.data : null;
}

export async function cacheSchemes(recommendations) {
  await put(STORES.schemes, {
    key: 'latest',
    data: recommendations,
    timestamp: Date.now(),
  });
}

export async function getCachedSchemes() {
  const result = await get(STORES.schemes, 'latest');
  return result ? result.data : null;
}

export async function cacheChecklist(schemeId, documents) {
  await put(STORES.checklists, {
    key: schemeId,
    data: documents,
    timestamp: Date.now(),
  });
}

export async function getCachedChecklist(schemeId) {
  const result = await get(STORES.checklists, schemeId);
  return result ? result.data : null;
}

export async function queueSync(action) {
  await put(STORES.syncQueue, {
    ...action,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  });
}

export async function processSyncQueue() {
  if (!navigator.onLine) return;

  const items = await getAll(STORES.syncQueue);
  for (const item of items) {
    try {
      await fetch(item.url, {
        method: item.method || 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item.body),
      });
      await deleteItem(STORES.syncQueue, item.id);
    } catch {
      // Will retry on next sync
    }
  }
}

// Listen for connectivity changes
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    processSyncQueue();
  });
}
