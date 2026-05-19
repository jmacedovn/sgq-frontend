import React, { useState, useEffect } from 'react';
import { ActivityLog, LogType } from '../types';
import { api } from '../lib/api';

interface ActivityLogsProps {
  onBack: () => void;
}

const ActivityLogs: React.FC<ActivityLogsProps> = ({ onBack }) => {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const data = await api.getRecords('activity_logs', { order: 'timestamp', orderDirection: 'desc', limit: 200 });
      setLogs(data || []);
    } catch (error) {
      console.error('Erro ao buscar logs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredLogs = logs.filter(log => {
    const matchesType = filterType === 'all' || log.type === filterType;
    const matchesSearch = log.userName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         log.action?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesSearch;
  });

  const getLogIcon = (type: LogType) => {
    switch (type) {
      case LogType.ACCESS: return 'fa-right-to-bracket text-blue-500 bg-blue-50';
      case LogType.FORM: return 'fa-file-signature text-green-500 bg-green-50';
      case LogType.MANAGEMENT: return 'fa-user-shield text-purple-500 bg-purple-50';
      default: return 'fa-info-circle text-gray-500 bg-gray-50 dark:bg-gray-900/50';
    }
  };

  const clearLogs = async () => {
    if (confirm('Deseja limpar o histórico global de logs no banco de dados?')) {
       try {
         await api.deleteAllRecords('activity_logs');
         setLogs([]);
       } catch (error) {
         console.error('Erro ao limpar logs:', error);
       }
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6">
        <div>
          <h2 className="text-3xl font-black text-[#1A2B34] tracking-tight">Rastreabilidade do Sistema</h2>
          <p className="text-gray-500 mt-1 font-medium">Histórico sincronizado via Supabase.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={fetchLogs}
            className="text-blue-600 hover:text-blue-800 px-4 py-2 text-[10px] font-black uppercase tracking-widest"
          >
            <i className="fas fa-sync-alt"></i> Atualizar
          </button>
          <button 
            onClick={clearLogs}
            className="text-red-400 hover:text-red-600 px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all"
          >
            Limpar Histórico
          </button>
          <button 
            onClick={onBack}
            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 px-6 py-3 rounded-2xl text-xs font-black text-gray-500 hover:bg-gray-50 dark:bg-gray-900/50 transition-all uppercase tracking-widest shadow-sm"
          >
            Voltar
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 bg-white dark:bg-gray-800 p-5 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="relative flex-1">
          <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-300">
            <i className="fas fa-search"></i>
          </span>
          <input
            type="text"
            placeholder="Buscar por usuário ou ação..."
            className="block w-full pl-11 pr-4 py-3.5 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-600 rounded-2xl focus:ring-2 focus:ring-[#E3851B] outline-none font-medium text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest hidden sm:block">Filtrar:</span>
          <select 
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-600 px-4 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest outline-none focus:ring-2 focus:ring-[#E3851B]"
          >
            <option value="all">Todos os Eventos</option>
            <option value={LogType.ACCESS}>Acessos</option>
            <option value={LogType.FORM}>Formulários</option>
            <option value={LogType.MANAGEMENT}>Gestão de Usuários</option>
          </select>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden min-h-[400px]">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-40 gap-4">
            <i className="fas fa-spinner fa-spin text-3xl text-orange-400"></i>
            <span className="font-bold text-[10px] uppercase tracking-widest text-gray-400">Lendo Arquivo de Auditoria...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                  <th className="px-8 py-5">Horário</th>
                  <th className="px-8 py-5">Evento</th>
                  <th className="px-8 py-5">Usuário</th>
                  <th className="px-8 py-5">Ação Realizada</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredLogs.length > 0 ? (
                  filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50 dark:bg-gray-900/50 transition-colors">
                      <td className="px-8 py-5">
                        <div className="text-xs font-bold text-gray-400">{new Date(log.timestamp).toLocaleDateString('pt-BR')}</div>
                        <div className="text-[10px] font-black text-[#1A2B34]">{new Date(log.timestamp).toLocaleTimeString('pt-BR')}</div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${getLogIcon(log.type)}`}>
                            <i className={`fas ${getLogIcon(log.type).split(' ')[0]} text-xs`}></i>
                          </div>
                          <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">{log.type}</span>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="font-black text-[#1A2B34] text-xs">{log.userName}</div>
                        <div className="text-[9px] text-gray-400 font-bold">Ref: {String(log.id).substring(0,6)}</div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="text-sm font-medium text-gray-700 dark:text-gray-200">{log.action}</div>
                        {log.details && <div className="text-[10px] text-gray-400 mt-1 italic">{log.details}</div>}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-8 py-20 text-center">
                      <div className="text-gray-200 text-4xl mb-4"><i className="fas fa-history"></i></div>
                      <p className="text-gray-400 font-black text-[10px] uppercase tracking-widest">Nenhum evento registrado no histórico.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityLogs;