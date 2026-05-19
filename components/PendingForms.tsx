import React, { useState, useEffect } from 'react';
import { db } from '../lib/db';
import { FormType, User } from '../types';
import { FORMS_CONFIG } from '../constants';

interface PendingFormsProps {
  onBack: () => void;
  onEdit: (record: any) => void;
  currentUser: User;
}

const PendingForms: React.FC<PendingFormsProps> = ({ onBack, onEdit, currentUser }) => {
  const [pendingRecords, setPendingRecords] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPendingRecords();
  }, []);

  const fetchPendingRecords = async () => {
    setIsLoading(true);
    try {
      // Busca registros com status 'pending' no banco local IndexedDB
      const records = await db.records
        .filter(r => r.status === 'pending' || r.data?.status === 'pending')
        .toArray();

      // Ordena por timestamp decrescente
      records.sort((a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );

      setPendingRecords(records);
    } catch (error) {
      console.error('Error fetching pending records:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getFormName = (type: string) => {
    const config = FORMS_CONFIG.find(f => f.type === type);
    return config ? config.title : type;
  };

  return (
    <div className="max-w-6xl mx-auto animate-fadeIn">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="w-12 h-12 flex items-center justify-center bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 text-gray-400 hover:text-[#E3851B] hover:border-orange-100 transition-all active:scale-95"
          >
            <i className="fas fa-arrow-left"></i>
          </button>
          <div>
            <h2 className="text-2xl font-black text-[#1A2B34] tracking-tighter">Formulários Pendentes</h2>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Finalize os registros em andamento</p>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <i className="fas fa-spinner fa-spin text-4xl text-[#E3851B]"></i>
        </div>
      ) : pendingRecords.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-700 p-12 text-center">
          <div className="w-24 h-24 bg-gray-50 dark:bg-gray-900/50 rounded-full flex items-center justify-center mx-auto mb-6">
            <i className="fas fa-check-circle text-4xl text-gray-300"></i>
          </div>
          <h3 className="text-xl font-black text-gray-800 dark:text-gray-100 tracking-tighter mb-2">Nenhum formulário pendente</h3>
          <p className="text-sm text-gray-500 font-medium">Todos os formulários foram finalizados com sucesso.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pendingRecords.map((record) => (
            <div key={record.id} className="bg-white dark:bg-gray-800 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-700 p-6 hover:shadow-md transition-all group">
              <div className="flex justify-between items-start mb-4">
                <div className="bg-orange-50 text-orange-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                  Pendente
                </div>
                <div className="text-[10px] font-bold text-gray-400">
                  {new Date(record.timestamp).toLocaleDateString('pt-BR')}
                </div>
              </div>
              
              <h3 className="text-lg font-black text-[#1A2B34] mb-2 leading-tight">
                {getFormName(record.form_type)}
              </h3>
              
              <div className="space-y-2 mb-6">
                <p className="text-xs text-gray-500 font-medium">
                  <i className="fas fa-user text-gray-400 w-4"></i> {record.user_name}
                </p>
                {(record.data?.batchNumber || record.data?.header?.lote) && (
                  <p className="text-xs text-gray-500 font-medium">
                    <i className="fas fa-box text-gray-400 w-4"></i> Lote: {record.data?.batchNumber || record.data?.header?.lote}
                  </p>
                )}
                {record.data?.header?.fruta && (
                  <p className="text-xs text-gray-500 font-medium">
                    <i className="fas fa-apple-alt text-gray-400 w-4"></i> Fruta: {record.data.header.fruta}
                  </p>
                )}
              </div>

              <button
                onClick={() => onEdit(record)}
                className="w-full py-3 bg-[#1A2B34] text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#E3851B] transition-colors flex items-center justify-center gap-2"
              >
                Continuar Preenchimento <i className="fas fa-arrow-right"></i>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PendingForms;
