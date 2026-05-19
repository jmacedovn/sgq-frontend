import Dexie, { Table } from 'dexie';

export interface LocalRecord {
  id: string;
  form_type: string;
  data: any;
  user_id: string;
  user_name: string;
  timestamp: string;
  status?: string;
  sync_status?: 'synced' | 'pending_insert' | 'pending_update' | 'pending_delete';
}

export interface SyncQueueItem {
  id?: number;
  action: 'insert' | 'update' | 'delete';
  record_id: string;
  payload?: any;
  created_at: number;
}

export class AppDatabase extends Dexie {
  records!: Table<LocalRecord, string>;
  syncQueue!: Table<SyncQueueItem, number>;

  constructor() {
    super('SGQDatabase');
    this.version(2).stores({
      records: 'id, form_type, user_id, status, sync_status, timestamp',
      syncQueue: '++id, action, record_id, created_at'
    });
  }
}

export const db = new AppDatabase();
