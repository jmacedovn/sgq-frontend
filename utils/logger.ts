import { ActivityLog, LogType, User } from '../types';
import { api } from '../lib/api';

export const createLog = async (user: User, type: LogType, action: string, details?: string) => {
  const newLog = {
    user_id: user.id,
    user_name: user.name,
    type,
    action,
    timestamp: new Date().toISOString(),
    details: details || ""
  };

  try {
    await api.insertRecord('activity_logs', [newLog]);
  } catch (error) {
    console.error("Erro ao gravar log no banco de dados:", error);
    
    // Fallback local caso a API falhe temporariamente
    try {
      const localLogs = JSON.parse(localStorage.getItem('sgq_activity_logs') || '[]');
      localLogs.unshift({ ...newLog, id: Date.now().toString() });
      localStorage.setItem('sgq_activity_logs', JSON.stringify(localLogs.slice(0, 50)));
    } catch (e) {
      console.error("Erro no fallback do log:", e);
    }
  }
};