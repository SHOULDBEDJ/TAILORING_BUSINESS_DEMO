import api from '../api/axios';
import { toast } from 'react-hot-toast';

const DB_NAME = 'DemoTailorOfflineDB';
const DB_VERSION = 1;
const STORE_NAME = 'offlineOrders';

function openDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
            }
        };

        request.onsuccess = (event) => resolve(event.target.result);
        request.onerror = (event) => reject(event.target.error);
    });
}

export async function saveOrderOffline(orderPayload) {
    try {
        const db = await openDB();
        const transaction = db.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        
        // Add timestamp to payload
        const payloadToSave = {
            ...orderPayload,
            offlineSavedAt: new Date().toISOString()
        };

        return new Promise((resolve, reject) => {
            const request = store.add(payloadToSave);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    } catch (err) {
        console.error('Failed to save order offline:', err);
        throw err;
    }
}

export async function getOfflineOrders() {
    try {
        const db = await openDB();
        const transaction = db.transaction(STORE_NAME, 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        
        return new Promise((resolve, reject) => {
            const request = store.getAll();
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    } catch (err) {
        console.error('Failed to get offline orders:', err);
        return [];
    }
}

export async function removeOfflineOrder(id) {
    try {
        const db = await openDB();
        const transaction = db.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        
        return new Promise((resolve, reject) => {
            const request = store.delete(id);
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    } catch (err) {
        console.error('Failed to remove offline order:', err);
        throw err;
    }
}

export async function syncOfflineOrders() {
    if (!navigator.onLine) return; // Only sync if online

    const offlineOrders = await getOfflineOrders();
    if (!offlineOrders || offlineOrders.length === 0) return;

    console.log(`Syncing ${offlineOrders.length} offline orders...`);
    let syncCount = 0;

    for (const orderWrapper of offlineOrders) {
        try {
            const { 
                customerPayload, 
                orderPayload, 
                images, 
                audioBlobBase64, 
                recordingTime,
                id // ID in IndexedDB
            } = orderWrapper;

            // 1. Create or lookup customer
            const custRes = await api.post('/customers', customerPayload);
            const cid = custRes.data.id;

            // 2. Create order
            orderPayload.customer_id = cid;
            const orderRes = await api.post('/orders', orderPayload);
            const createdOrderId = orderRes.data.order_id;

            // 3. Upload images
            if (images && images.length > 0) {
                await api.post(`/orders/${createdOrderId}/images`, { images });
            }

            // 4. Upload voice note
            if (audioBlobBase64) {
                await api.post(`/orders/${createdOrderId}/voice-notes`, {
                    audio_data: audioBlobBase64,
                    duration: recordingTime
                });
            }

            // Successfully synced to backend, remove from offline store
            await removeOfflineOrder(id);
            syncCount++;
        } catch (err) {
            console.error(`Failed to sync offline order ID ${orderWrapper.id}:`, err);
            // We'll leave it in IndexedDB to try again later
        }
    }

    if (syncCount > 0) {
        toast.success(`Successfully synced ${syncCount} offline order(s)!`);
        // We could trigger a global event here if we wanted to refresh order lists
        window.dispatchEvent(new Event('offline-sync-complete'));
    }
}
