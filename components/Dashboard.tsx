
import React, { useState, useMemo, useEffect } from 'react';
import { FORMS_CONFIG } from '../constants';
import { FormType, User } from '../types';
import { isAdminRole } from '../lib/roles';
import { normalizePermissions } from '../lib/permissions';

interface DashboardProps {
  onSelectForm: (type: FormType) => void;
  currentUser: User;
}

type SortOption = 'default' | 'code' | 'dept';

import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../lib/db';

const DashboardStats: React.FC<{ getFormMeta: (type: string) => any }> = ({ getFormMeta }) => {
  const [selectedDate, setSelectedDate] = useState(() => {
    const now = new Date();
    const offset = now.getTimezoneOffset() * 60000;
    return new Date(now.getTime() - offset).toISOString().split('T')[0];
  });

  const liveRecords = useLiveQuery(
    () => {
      const [y, m, d] = selectedDate.split('-').map(Number);
      const startOfDay = new Date(y, m - 1, d, 0, 0, 0).toISOString();
      const endOfDay = new Date(y, m - 1, d, 23, 59, 59, 999).toISOString();
      return db.records
        .where('timestamp')
        .between(startOfDay, endOfDay)
        .reverse()
        .toArray();
    },
    [selectedDate],
    []
  );

  const activityStats = useMemo(() => {
    const counts: Record<string, number> = {};
    if (liveRecords) {
      liveRecords.forEach(record => {
        counts[record.form_type] = (counts[record.form_type] || 0) + 1;
      });
    }
    return counts;
  }, [liveRecords]);

  const recentActivities = useMemo(() => {
    if (!liveRecords) return [];
    return liveRecords.slice(0, 10).map(r => ({
      id: r.id,
      timestamp: r.timestamp,
      user_name: r.user_name,
      form_type: r.form_type,
      form_code: r.data?.form_code || '',
      sync_status: r.sync_status
    }));
  }, [liveRecords]);

  const isLoading = !liveRecords;

  const totalRegistrations = Object.values(activityStats).reduce((a: number, b: number) => a + b, 0);

  return (
    <div className="mt-12 p-6 md:p-10 bg-[#1A2B34] rounded-2xl md:rounded-[3rem] text-white shadow-2xl relative overflow-hidden transition-all duration-500">
      <div className="relative z-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
           <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-8">
              <div>
                <h4 className="text-xl md:text-2xl font-black flex items-center gap-3">
                   <i className="fas fa-chart-pie text-[#E3851B]"></i>
                   Monitoramento de Volume
                </h4>
                <p className="text-gray-400 text-[10px] md:text-xs mt-1 font-medium">Indicadores atualizados automaticamente.</p>
              </div>

              <div className="flex items-center gap-3 bg-white/5 p-2 rounded-xl border border-white/10">
                <span className="text-[9px] font-black uppercase tracking-widest text-gray-500 ml-2">Filtrar Data:</span>
                <input 
                  type="date" 
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="bg-transparent border-none text-xs font-bold text-white outline-none focus:ring-0 cursor-pointer"
                />
              </div>
           </div>
           
           <div className="flex items-center gap-4 bg-white/5 p-3 rounded-xl border border-white/10 backdrop-blur-sm self-start">
              <div className="text-right">
                 <p className="text-[8px] font-black uppercase tracking-widest text-gray-500">Total na Data</p>
                 {isLoading ? (
                   <div className="h-6 w-12 bg-white/10 animate-pulse rounded mt-1"></div>
                 ) : (
                   <p className="text-2xl md:text-3xl font-black text-white leading-none">{totalRegistrations}</p>
                 )}
              </div>
           </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
           <div className="lg:col-span-2">
              <h5 className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-500 mb-4">Volume por Protocolo</h5>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 md:gap-3">
                {isLoading ? (
                  Array(4).fill(0).map((_, i) => (
                    <div key={i} className="p-3 md:p-4 rounded-xl bg-white/5 border border-white/5 animate-pulse">
                      <div className="h-2 w-12 bg-white/10 rounded mb-2"></div>
                      <div className="h-6 w-8 bg-white/10 rounded mb-2"></div>
                      <div className="h-2 w-16 bg-white/10 rounded"></div>
                    </div>
                  ))
                ) : (
                  <>
                    {FORMS_CONFIG.map((form) => {
                      const count = activityStats[form.type] || 0;
                      if (count === 0) return null;
                      return (
                        <div key={form.id} className="p-3 md:p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                          <div className="text-[8px] font-bold text-gray-500 truncate mb-1 uppercase">{form.code}</div>
                          <div className="text-xl md:text-2xl font-black text-white">{count}</div>
                          <div className="text-[7px] text-gray-500 truncate mt-1 uppercase font-black">{form.title}</div>
                        </div>
                      );
                    })}
                    {Object.values(activityStats).every(v => v === 0) && (
                      <div className="col-span-full py-8 text-center text-gray-500 text-[10px] font-bold uppercase border border-dashed border-white/10 rounded-xl">Sem registros nesta data</div>
                    )}
                  </>
                )}
              </div>
           </div>

           <div className="bg-black/20 rounded-2xl md:rounded-[2rem] p-5 md:p-6 border border-white/5">
              <h5 className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-500 mb-4 flex items-center gap-2">
                 <i className="fas fa-history text-[#E3851B]"></i> Relatórios da Data
              </h5>
              <div className="space-y-3">
                 {isLoading ? (
                   Array(3).fill(0).map((_, i) => (
                     <div key={i} className="flex items-center gap-3 p-2.5 bg-white/5 rounded-lg animate-pulse">
                        <div className="w-7 h-7 rounded-md bg-white/10"></div>
                        <div className="flex-1">
                           <div className="h-2 w-24 bg-white/10 rounded mb-2"></div>
                           <div className="h-2 w-16 bg-white/10 rounded"></div>
                        </div>
                     </div>
                   ))
                 ) : (
                   recentActivities.map((act) => {
                      const meta = getFormMeta(act.form_type);
                      return (
                        <div key={act.id} className="flex items-center gap-3 p-2.5 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
                           <div className={`w-7 h-7 rounded-md ${meta?.color || 'bg-gray-600'} flex items-center justify-center text-white text-[9px]`}>
                              <i className={`fas ${meta?.icon || 'fa-file'}`}></i>
                           </div>
                           <div className="min-w-0 flex-1">
                              <div className="text-[9px] font-black text-white truncate flex items-center gap-1.5">
                                {meta?.title || act.form_type}
                                {act.sync_status && act.sync_status.startsWith('pending_') && (
                                  <span title="Salvo offline. Aguardando sincronização." className="text-orange-500">
                                    <i className="fas fa-cloud-upload-alt text-[8px]"></i>
                                  </span>
                                )}
                              </div>
                              <div className="text-[8px] text-gray-400">
                                 {act.user_name?.split(' ')[0]} • {new Date(act.timestamp).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}
                              </div>
                           </div>
                        </div>
                      );
                   })
                 )}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

const Dashboard: React.FC<DashboardProps> = ({ onSelectForm, currentUser }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('default');

  const getDept = (code: string) => {
    const parts = code.split('-');
    return parts.length > 1 ? parts[parts.length - 1] : 'OUTROS';
  };

  const getFormMeta = (type: string) => {
    return FORMS_CONFIG.find(f => f.type === type);
  };

  const filteredAndSortedForms = useMemo(() => {
    const permissions = normalizePermissions(currentUser.permissions);
    let result = FORMS_CONFIG.filter(form =>
      isAdminRole(currentUser.role) || permissions.includes(form.type)
    );

    if (searchTerm) {
      const lowSearch = searchTerm.toLowerCase();
      result = result.filter(
        form => 
          form.title.toLowerCase().includes(lowSearch) || 
          form.code.toLowerCase().includes(lowSearch)
      );
    }

    if (sortBy === 'code') {
      result.sort((a, b) => a.code.localeCompare(b.code));
    } else if (sortBy === 'dept') {
      result.sort((a, b) => {
        const deptA = getDept(a.code);
        const deptB = getDept(b.code);
        if (deptA === deptB) return a.code.localeCompare(b.code);
        return deptA.localeCompare(deptB);
      });
    }
    return result;
  }, [searchTerm, sortBy, currentUser]);

  return (
    <div className="space-y-6 md:space-y-8 animate-fadeIn">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 dark:border-gray-700 pb-6">
        <div>
          <h2 className="text-2xl md:text-3xl font-black text-[#1A2B34] dark:text-white tracking-tight">Painel de Formulários</h2>
          <p className="text-gray-500 mt-1 font-medium text-sm">Bem-vindo, {currentUser.name}.</p>
        </div>
        <div className="flex items-center gap-2 bg-orange-50 px-4 py-2 rounded-full border border-orange-100 self-start shadow-sm">
          <span className="flex h-2 w-2 rounded-full bg-[#E3851B] animate-pulse"></span>
          <span className="text-[9px] font-black text-[#E3851B] uppercase tracking-widest">Servidor Conectado</span>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 bg-white dark:bg-gray-800 p-4 md:p-5 rounded-2xl md:rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="relative flex-1">
          <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-300">
            <i className="fas fa-search"></i>
          </span>
          <input
            type="text"
            placeholder="Buscar por título ou código..."
            className="block w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#E3851B] focus:border-[#E3851B] outline-none text-sm transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-3 overflow-x-auto pb-1 lg:pb-0 custom-scrollbar">
          <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest whitespace-nowrap">Organizar:</span>
          <div className="flex bg-gray-100 dark:bg-gray-700 p-1 rounded-xl border border-gray-200 dark:border-gray-600">
            {[
              { id: 'default', label: 'Padrão' },
              { id: 'code', label: 'Código' },
              { id: 'dept', label: 'Setor' }
            ].map(opt => (
              <button
                key={opt.id}
                onClick={() => setSortBy(opt.id as SortOption)}
                className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${sortBy === opt.id ? 'bg-white dark:bg-gray-800 text-[#E3851B] shadow-sm' : 'text-gray-400'}`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 md:gap-8">
        {filteredAndSortedForms.map((form) => {
          const dept = getDept(form.code);
          return (
            <button
              key={form.id}
              onClick={() => onSelectForm(form.type)}
              className="group relative flex flex-col items-start p-6 md:p-8 bg-white dark:bg-gray-800 rounded-2xl md:rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300 text-left"
            >
              <div className={`w-12 h-12 md:w-14 md:h-14 ${form.color} rounded-xl flex items-center justify-center text-white mb-4 md:mb-6 shadow-lg group-hover:scale-110 transition-transform`}>
                <i className={`fas ${form.icon} text-lg md:text-xl`}></i>
              </div>
              
              <div className="mb-2 flex items-center gap-2">
                <span className={`text-[8px] font-black px-2 py-0.5 rounded-full ${dept === 'PR' ? 'bg-orange-100 text-[#E3851B]' : dept === 'CQ' ? 'bg-green-100 text-green-700' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200'}`}>
                  {dept}
                </span>
                <span className="text-[9px] font-mono font-bold text-gray-400">{form.code}</span>
              </div>

              <h3 className="text-base md:text-lg font-black text-[#1A2B34] dark:text-white mb-4 leading-tight group-hover:text-[#E3851B] transition-colors">
                {form.title}
              </h3>
              
              <div className="mt-auto pt-4 border-t border-gray-50 w-full flex items-center justify-between text-gray-300 text-[9px] font-black uppercase tracking-widest">
                <span>REV {form.revision}</span>
                <div className="text-[#E3851B] font-black flex items-center gap-1">
                  ABRIR <i className="fas fa-chevron-right text-[7px]"></i>
                </div>
              </div>
            </button>
          );
        })}
      </div>
      
      {/* Seção de Atividade / Monitoramento Responsiva */}
      <DashboardStats getFormMeta={getFormMeta} />
    </div>
  );
};

export default Dashboard;
