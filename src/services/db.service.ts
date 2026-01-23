
import { Injectable } from '@angular/core';
import type { UserProfile, GlucoseReading, WeightLog, Meal, Activity } from '../types';

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {
  private dbName = 'GlucoWeightDB';
  private version = 1;

  constructor() {
    this.initDB();
  }

  private initDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onupgradeneeded = (event: any) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains('profiles')) {
          db.createObjectStore('profiles', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('glucose')) {
          const store = db.createObjectStore('glucose', { keyPath: 'id' });
          store.createIndex('patientId', 'patientId', { unique: false });
        }
        if (!db.objectStoreNames.contains('weights')) {
          const store = db.createObjectStore('weights', { keyPath: 'id' });
          store.createIndex('patientId', 'patientId', { unique: false });
        }
        if (!db.objectStoreNames.contains('meals')) {
          const store = db.createObjectStore('meals', { keyPath: 'id' });
          store.createIndex('patientId', 'patientId', { unique: false });
        }
        if (!db.objectStoreNames.contains('activities')) {
          const store = db.createObjectStore('activities', { keyPath: 'id' });
          store.createIndex('patientId', 'patientId', { unique: false });
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async saveProfile(profile: UserProfile): Promise<void> {
    const db = await this.initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction('profiles', 'readwrite');
      transaction.objectStore('profiles').put(profile);
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  }

  async getProfile(id: string): Promise<UserProfile | null> {
    const db = await this.initDB();
    return new Promise((resolve, reject) => {
      const request = db.transaction('profiles').objectStore('profiles').get(id);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  async getAllProfiles(): Promise<UserProfile[]> {
    const db = await this.initDB();
    return new Promise((resolve, reject) => {
      const request = db.transaction('profiles').objectStore('profiles').getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async addEntry(storeName: string, entry: any): Promise<void> {
    const db = await this.initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readwrite');
      transaction.objectStore(storeName).add(entry);
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  }

  async getEntriesByPatient(storeName: string, patientId: string): Promise<any[]> {
    const db = await this.initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const index = store.index('patientId');
      const request = index.getAll(patientId);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async clearPatientData(patientId: string): Promise<void> {
    const db = await this.initDB();
    const stores = ['glucose', 'weights', 'meals', 'activities'];
    const promises = stores.map(storeName => {
      return new Promise<void>((resolve, reject) => {
        const transaction = db.transaction(storeName, 'readwrite');
        const store = transaction.objectStore(storeName);
        const index = store.index('patientId');
        const request = index.openKeyCursor(IDBKeyRange.only(patientId));
        request.onsuccess = () => {
          const cursor = request.result;
          if (cursor) {
            store.delete(cursor.primaryKey);
            cursor.continue();
          } else {
            resolve();
          }
        };
        request.onerror = () => reject(request.error);
      });
    });
    await Promise.all(promises);
  }
}
