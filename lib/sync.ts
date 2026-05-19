import { api } from './api';
import { db, LocalRecord } from './db';
import { toast } from 'sonner';

const getTableName = (formType: string): string => {
  if (!formType || typeof formType !== 'string') {
    throw new Error('form_type não definido ou inválido');
  }

  return formType.replace(/-/g, '_');
};

const generateUUID = () => {
  try {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID();
    }
  } catch (e) {
    console.warn('crypto.randomUUID falhou, usando fallback.');
  }
  
  // Fallback para contextos não seguros (HTTP) ou navegadores antigos
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

export const syncService = {

  async fetchRemoteAndSyncLocal() {
    if (!navigator.onLine) return;

    try {
      const data = await api.getAllRecords();

      if (data) {
        const pendingRecords = await db.records.where('sync_status').notEqual('synced').toArray();
        const pendingIds = new Set(pendingRecords.map(r => r.id));

        const recordsToPut = data.map(r => {
          // Restore metadata from data blob if columns are missing/null
          const metadata = r.data || {};
          return {
            ...r,
            timestamp: r.timestamp || metadata.timestamp || new Date().toISOString(),
            user_id: r.user_id || metadata.user_id,
            user_name: r.user_name || metadata.user_name,
            sync_status: 'synced'
          };
        }).filter(r => !pendingIds.has(r.id));

        await db.records.bulkPut(recordsToPut);
      }
    } catch (e: any) {
      if (e?.code === 'PGRST205') {
        console.warn('Sincronização remota falhou: A view "view_all_records" não existe no Supabase. Por favor, execute o script "supabase_view.sql" no editor SQL do seu Supabase.');
      } else {
        console.error('Error syncing from remote:', e);
      }
    }
  },

  async processSyncQueue() {
    if (!navigator.onLine) return;

    const queue = await db.syncQueue.orderBy('created_at').toArray();
    if (queue.length === 0) return;

    let successCount = 0;

    for (const item of queue) {
      try {
        let formType = item.payload?.form_type;

        // fallback para buscar do banco local
        if (!formType && item.record_id) {
          const localRecord = await db.records.get(item.record_id);
          formType = localRecord?.form_type;
        }

        if (!formType) {
          throw new Error(`form_type não encontrado para record_id: ${item.record_id}`);
        }

        const tableName = getTableName(formType);
        
        // Prepare payload: move metadata inside 'data' to avoid Column Not Found errors
        // for specialized tables that might lack specific columns
        const { 
          id: record_id, 
          form_type: _, 
          form_code: __, 
          timestamp, 
          user_id, 
          user_name, 
          data: form_data, 
          ...rest 
        } = item.payload || {};

        const supabasePayload = {
          id: item.record_id,
          data: {
            ...(form_data || {}),
            timestamp: timestamp || new Date().toISOString(),
            user_id,
            user_name,
            ...rest
          }
        };

        if (item.action === 'insert') {
          await api.insertRecord(tableName, [supabasePayload]);
        } 
        else if (item.action === 'update') {
          await api.updateRecord(tableName, item.record_id!, supabasePayload);
        } 
        else if (item.action === 'delete') {
          await api.deleteRecord(tableName, item.record_id!);
        }

        if (item.action === 'delete') {
          await db.records.delete(item.record_id);
        } else {
          await db.records.update(item.record_id, { sync_status: 'synced' });
        }

        await db.syncQueue.delete(item.id!);
        successCount++;

      } catch (e) {
        console.error(`Error processing sync item ${item.id}:`, e);
        break;
      }
    }

    if (successCount > 0) {
      toast.success(`${successCount} registros sincronizados com sucesso!`);
      this.fetchRemoteAndSyncLocal();
    }
  },

  async saveRecord(payload: any, id?: string) {

    // ✅ VALIDAÇÃO ADICIONADA
    if (!payload?.form_type) {
      throw new Error('Payload sem form_type');
    }

    const isOnline = navigator.onLine;
    const recordId = id || generateUUID();
    const action = id ? 'update' : 'insert';
    const tableName = getTableName(payload.form_type);

    const localRecord: LocalRecord = {
      id: recordId,
      ...payload,
      timestamp: payload.timestamp || new Date().toISOString(),
      sync_status: isOnline ? 'synced' : `pending_${action}`
    };

    await db.records.put(localRecord);

    if (isOnline) {
      try {
        // Prepare payload: move metadata inside 'data' to avoid Column Not Found errors
        const { 
          form_type: ft, 
          form_code: fc, 
          timestamp: ts, 
          user_id: uid, 
          user_name: un, 
          data: fd, 
          ...rest 
        } = payload;

        const supabasePayload = {
          id: recordId,
          data: {
            ...(fd || {}),
            timestamp: ts || new Date().toISOString(),
            user_id: uid,
            user_name: un,
            ...rest
          }
        };

        if (action === 'insert') {
          await api.insertRecord(tableName, [supabasePayload]);
        } else {
          await api.updateRecord(tableName, recordId, supabasePayload);
        }

        await db.records.update(recordId, { sync_status: 'synced' });

      } catch (e) {
        console.error('Error saving to remote, queued for sync:', e);

        await db.records.update(recordId, { sync_status: `pending_${action}` });

        await db.syncQueue.add({
          action,
          record_id: recordId,
          payload: { id: recordId, ...payload },
          created_at: Date.now()
        });
      }
    } else {
      await db.syncQueue.add({
        action,
        record_id: recordId,
        payload: { id: recordId, ...payload },
        created_at: Date.now()
      });

      toast.info('Salvo offline. Será sincronizado quando houver conexão.');
    }

    return recordId;
  },

  async deleteRecord(id: string) {
    const isOnline = navigator.onLine;

    const localRecord = await db.records.get(id);
    const tableName = getTableName(localRecord?.form_type);

    await db.records.update(id, { sync_status: 'pending_delete' });

    if (isOnline) {
      try {
        await api.deleteRecord(tableName, id);

        await db.records.delete(id);

      } catch (e) {
        console.error('Error deleting from remote, queued for sync:', e);

        await db.syncQueue.add({
          action: 'delete',
          record_id: id,
          created_at: Date.now()
        });
      }
    } else {
      await db.syncQueue.add({
        action: 'delete',
        record_id: id,
        created_at: Date.now()
      });

      toast.info('Excluído offline. Será sincronizado quando houver conexão.');
    }
  }
};