
import React from 'react';
import { FORMS_CONFIG } from '../constants';
import { FormType } from '../types';

interface ExportSelectorModalProps {
  onClose: () => void;
  onSelect: (type: FormType | 'all') => void;
}

const ExportSelectorModal: React.FC<ExportSelectorModalProps> = ({ onClose, onSelect }) => {
  return (
    <div className="fixed inset-0 bg-[#1A2B34]/85 backdrop-blur-sm z-[250] flex items-center justify-center p-2 md:p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl md:rounded-[3.5rem] w-full max-w-4xl max-h-[92vh] overflow-hidden flex flex-col shadow-2xl animate-scaleIn border border-gray-100 dark:border-gray-700">
        <div className="p-6 md:p-10 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between bg-gray-50/50">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 md:w-14 md:h-14 bg-green-600 rounded-xl md:rounded-2xl flex items-center justify-center text-white shadow-lg">
              <i className="fas fa-file-excel text-lg md:text-2xl"></i>
            </div>
            <div>
              <h3 className="text-xl md:text-2xl font-black text-[#1A2B34]">Exportar para Excel</h3>
              <p className="text-gray-400 text-[9px] md:text-xs font-bold uppercase tracking-widest mt-1">Selecione o protocolo desejado</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 dark:bg-gray-700 text-gray-400 transition-colors"
          >
            <i className="fas fa-times text-xl"></i>
          </button>
        </div>

        <div className="p-4 md:p-10 overflow-y-auto flex-1 custom-scrollbar">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-5">
            {/* Opção para Exportar Tudo */}
            <button
              onClick={() => onSelect('all')}
              className="group relative p-5 md:p-8 bg-gradient-to-br from-green-600 to-green-800 rounded-2xl md:rounded-[2.5rem] text-left text-white shadow-lg hover:shadow-2xl transition-all"
            >
              <div className="flex justify-between items-start mb-4">
                <i className="fas fa-layer-group text-2xl opacity-40"></i>
                <i className="fas fa-arrow-right opacity-0 group-hover:opacity-100 transition-all translate-x-[-10px] group-hover:translate-x-0"></i>
              </div>
              <h4 className="font-black text-base md:text-lg leading-tight uppercase tracking-tighter">Exportar Geral</h4>
              <p className="text-green-100 text-[8px] font-bold uppercase tracking-widest mt-2 opacity-70">Relatório Consolidado</p>
            </button>

            {FORMS_CONFIG.map((form) => (
              <button
                key={form.id}
                onClick={() => onSelect(form.type)}
                className="group p-5 md:p-6 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl md:rounded-[2.2rem] text-left hover:border-green-400 hover:shadow-xl transition-all"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className={`w-9 h-9 md:w-11 md:h-11 ${form.color} rounded-xl flex items-center justify-center text-white shadow-sm`}>
                    <i className={`fas ${form.icon} text-sm md:text-base`}></i>
                  </div>
                  <i className="fas fa-download text-gray-200 group-hover:text-green-500 transition-colors"></i>
                </div>
                <h4 className="font-black text-[#1A2B34] text-[10px] md:text-[11px] leading-tight uppercase group-hover:text-green-700">{form.title}</h4>
                <p className="text-gray-400 text-[8px] font-mono mt-2">{form.code}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="p-6 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-100 dark:border-gray-700 text-center">
          <p className="text-[9px] font-black text-gray-300 uppercase tracking-[0.3em]">SISTEMA DE GESTÃO DA QUALIDADE - VIA NÉCTARE</p>
        </div>
      </div>
    </div>
  );
};

export default ExportSelectorModal;
