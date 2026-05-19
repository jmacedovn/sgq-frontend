
import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { api } from '../../lib/api';
import { useFruits } from '../../lib/useFruits';
import { toast } from 'sonner';

interface RowData {
  kanban: string;
  turno: string;
  linha: string;
  placa: string;
  nTicket: string;
  horaInicio: string;
  horaTermino: string;
  brix: string;
  verdeRet: string;
  refugo: string;
  totalDesc: string;
}

interface FruitDischargeFormProps {
  onSave: (data: any) => void;
  isSubmitting: boolean;
  initialData?: any;
}

const FruitDischargeForm: React.FC<FruitDischargeFormProps> = ({ onSave, isSubmitting, initialData }) => {
  const { fruits } = useFruits();
  const [header, setHeader] = useState(initialData?.header || {
    data: new Date().toISOString().split('T')[0],
    fruta: '',
    produto: 'CONVENCIONAL',
  });

  const [rows, setRows] = useState<RowData[]>(initialData?.rows || [
    { kanban: '', turno: '1', linha: '1', placa: '', nTicket: '', horaInicio: '', horaTermino: '', brix: '', verdeRet: '', refugo: '', totalDesc: '' }
  ]);

  // Estados para integração com Check-in
  const [showCheckinModal, setShowCheckinModal] = useState(false);
  const [checkinList, setCheckinList] = useState<any[]>([]);
  const [isLoadingCheckins, setIsLoadingCheckins] = useState(false);

  const addRow = () => {
    setRows([...rows, { kanban: '', turno: '1', linha: '1', placa: '', nTicket: '', horaInicio: '', horaTermino: '', brix: '', verdeRet: '', refugo: '', totalDesc: '' }]);
  };

  const updateRow = (index: number, field: keyof RowData, value: string) => {
    const newRows = [...rows];
    newRows[index] = { ...newRows[index], [field]: value };
    setRows(newRows);
  };

  // Função para buscar dados da tabela records (gate-registration)
  const fetchCheckins = async () => {
    setIsLoadingCheckins(true);
    try {
      const data = await api.getRecords('records', { 
        form_type: 'gate-registration',
        order: 'timestamp',
        orderDirection: 'desc',
        limit: 20
      });

      if (!data || data.length === 0) {
        toast.error('Nenhum registro encontrado na tabela de Check-in (Portaria).');
        return;
      }

      setCheckinList(data);
      setShowCheckinModal(true);
    } catch (error: any) {
      console.error('Erro ao buscar check-ins:', error);
      toast.error(`Erro ao buscar dados: ${error.message || 'Verifique se a tabela records existe.'}`);
    } finally {
      setIsLoadingCheckins(false);
    }
  };

  // Função para aplicar o check-in selecionado
  const handleSelectCheckin = (checkin: any) => {
    // 1. Atualiza o Header (Tipo de Fruta) se estiver vazio ou confirma troca
    if (header.fruta && header.fruta !== checkin.data?.variedade) {
      if (!confirm(`A fruta selecionada (${header.fruta}) é diferente da fruta do check-in (${checkin.data?.variedade}). Deseja alterar o cabeçalho?`)) {
        return;
      }
    }
    
    // Normaliza o nome da fruta para coincidir com as opções do select (caixa alta)
    const frutaNormalizada = checkin.data?.variedade ? checkin.data.variedade.toUpperCase() : '';
    setHeader(prev => ({ ...prev, fruta: frutaNormalizada }));

    // 2. Adiciona ou preenche uma linha com a placa
    const newRows = [...rows];
    // Procura a primeira linha vazia (sem placa)
    const emptyRowIndex = newRows.findIndex(r => !r.placa);

    if (emptyRowIndex !== -1) {
      newRows[emptyRowIndex] = { ...newRows[emptyRowIndex], placa: checkin.data?.placa || '' };
    } else {
      // Se não houver linha vazia, adiciona uma nova
      newRows.push({
        kanban: '', turno: '1', linha: '1', 
        placa: checkin.data?.placa || '', 
        nTicket: '', horaInicio: '', horaTermino: '', brix: '', verdeRet: '', refugo: '', totalDesc: ''
      });
    }
    
    setRows(newRows);
    setShowCheckinModal(false);
  };

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave({ header, rows }); }} className="space-y-8 relative">
      
      {/* Botão de Integração */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={fetchCheckins}
          disabled={isLoadingCheckins}
          className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg flex items-center gap-2 transition-all"
        >
          {isLoadingCheckins ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-truck-loading"></i>}
          Buscar Veículo (Check-in MP)
        </button>
      </div>

      {/* Header Fields */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-gray-50 dark:bg-gray-900/50 p-6 rounded-2xl border border-gray-100 dark:border-gray-700">
        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-700 dark:text-gray-200">Data de Registro</label>
          <input 
            type="date" 
            className="w-full p-2.5 rounded-lg border-gray-300 dark:border-gray-600 border focus:ring-2 focus:ring-blue-500 bg-transparent dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
            value={header.data}
            onChange={(e) => setHeader({...header, data: e.target.value})}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-700 dark:text-gray-200">Tipo de Fruta</label>
          <select 
            className="w-full p-2.5 rounded-lg border-gray-300 dark:border-gray-600 border focus:ring-2 focus:ring-blue-500 bg-transparent dark:bg-gray-700 dark:text-white"
            value={header.fruta}
            onChange={(e) => setHeader({...header, fruta: e.target.value})}
          >
            <option value="">Selecione...</option>
            {fruits.map(f => <option key={f.id} value={f.name}>{f.name}</option>)}
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-700 dark:text-gray-200">Tipo de Produto</label>
          <div className="flex gap-4 p-1 bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600">
            {['CONVENCIONAL', 'ORGÂNICO'].map((type) => (
              <button
                key={type}
                type="button"
                className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${header.produto === type ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-500'}`}
                onClick={() => setHeader({...header, produto: type})}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table Section - Desktop */}
      <div className="hidden md:block overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-600">
        <table className="w-full text-sm text-left">
          <thead className="text-xs uppercase bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 font-bold">
            <tr>
              <th className="px-3 py-3 w-12 text-center">Seq.</th>
              <th className="px-3 py-3 min-w-[120px]">Placa / Ticket</th>
              <th className="px-3 py-3 w-28 text-center">Turno/Linha</th>
              <th className="px-3 py-3 w-40 text-center">Horário (I/T)</th>
              <th className="px-3 py-3 w-20 text-center">°Brix</th>
              <th className="px-3 py-3 w-24 text-center">Verde (Cx)</th>
              <th className="px-3 py-3 w-24 text-center">Refugo (Kg)</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {rows.map((row, idx) => (
              <tr key={idx} className="hover:bg-blue-50/30 transition-colors">
                <td className="px-3 py-4 text-center font-mono text-gray-400">{idx + 1}</td>
                <td className="px-3 py-4 space-y-2">
                  <input placeholder="Placa" value={row.placa} onChange={(e) => updateRow(idx, 'placa', e.target.value)} className="w-full p-1.5 border rounded uppercase font-bold" />
                  <input placeholder="Nº Ticket" value={row.nTicket} onChange={(e) => updateRow(idx, 'nTicket', e.target.value)} className="w-full p-1.5 border rounded" />
                </td>
                <td className="px-3 py-4 space-y-2 text-center">
                   <div className="flex gap-1 justify-center">
                    {['1','2','3'].map(t => (
                        <button key={t} type="button" onClick={() => updateRow(idx, 'turno', t)} className={`w-6 h-6 rounded text-[10px] border ${row.turno === t ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-400'}`}>{t}</button>
                    ))}
                   </div>
                   <div className="flex gap-1 justify-center">
                    {['1','2'].map(l => (
                        <button key={l} type="button" onClick={() => updateRow(idx, 'linha', l)} className={`w-6 h-6 rounded text-[10px] border ${row.linha === l ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-400'}`}>{l}</button>
                    ))}
                   </div>
                </td>
                <td className="px-3 py-4 space-y-2">
                   <input type="time" value={row.horaInicio} onChange={(e) => updateRow(idx, 'horaInicio', e.target.value)} className="w-full p-1.5 border rounded text-xs" />
                   <input type="time" value={row.horaTermino} onChange={(e) => updateRow(idx, 'horaTermino', e.target.value)} className="w-full p-1.5 border rounded text-xs" />
                </td>
                <td className="px-3 py-4"><input type="number" step="0.1" value={row.brix} onChange={(e) => updateRow(idx, 'brix', e.target.value)} className="w-full p-1.5 border rounded text-center" /></td>
                <td className="px-3 py-4"><input type="number" value={row.verdeRet} onChange={(e) => updateRow(idx, 'verdeRet', e.target.value)} className="w-full p-1.5 border rounded text-center" /></td>
                <td className="px-3 py-4"><input type="number" value={row.refugo} onChange={(e) => updateRow(idx, 'refugo', e.target.value)} className="w-full p-1.5 border rounded text-center" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Table Section - Mobile Cards */}
      <div className="md:hidden space-y-4">
        {rows.map((row, idx) => (
          <div key={idx} className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-200 dark:border-gray-600 shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
              <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Sequência {idx + 1}</span>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[9px] font-black text-gray-400 uppercase">Placa</label>
                <input value={row.placa} onChange={(e) => updateRow(idx, 'placa', e.target.value)} className="w-full p-2 border rounded uppercase font-bold text-xs" />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black text-gray-400 uppercase">Nº Ticket</label>
                <input value={row.nTicket} onChange={(e) => updateRow(idx, 'nTicket', e.target.value)} className="w-full p-2 border rounded text-xs" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[9px] font-black text-gray-400 uppercase">Turno</label>
                <div className="flex gap-1">
                  {['1','2','3'].map(t => (
                    <button key={t} type="button" onClick={() => updateRow(idx, 'turno', t)} className={`flex-1 py-1.5 rounded text-[10px] border font-bold ${row.turno === t ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-400'}`}>{t}</button>
                  ))}
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black text-gray-400 uppercase">Linha</label>
                <div className="flex gap-1">
                  {['1','2'].map(l => (
                    <button key={l} type="button" onClick={() => updateRow(idx, 'linha', l)} className={`flex-1 py-1.5 rounded text-[10px] border font-bold ${row.linha === l ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-400'}`}>{l}</button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[9px] font-black text-gray-400 uppercase">Início</label>
                <input type="time" value={row.horaInicio} onChange={(e) => updateRow(idx, 'horaInicio', e.target.value)} className="w-full p-2 border rounded text-xs" />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black text-gray-400 uppercase">Término</label>
                <input type="time" value={row.horaTermino} onChange={(e) => updateRow(idx, 'horaTermino', e.target.value)} className="w-full p-2 border rounded text-xs" />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-[9px] font-black text-gray-400 uppercase">°Brix</label>
                <input type="number" step="0.1" value={row.brix} onChange={(e) => updateRow(idx, 'brix', e.target.value)} className="w-full p-2 border rounded text-center text-xs" />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black text-gray-400 uppercase">Verde (Cx)</label>
                <input type="number" value={row.verdeRet} onChange={(e) => updateRow(idx, 'verdeRet', e.target.value)} className="w-full p-2 border rounded text-center text-xs" />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black text-gray-400 uppercase">Refugo (Kg)</label>
                <input type="number" value={row.refugo} onChange={(e) => updateRow(idx, 'refugo', e.target.value)} className="w-full p-2 border rounded text-center text-xs" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <button 
        type="button" 
        onClick={addRow}
        className="w-full py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl text-gray-500 font-bold hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50 transition-all flex items-center justify-center gap-2"
      >
        <i className="fas fa-plus"></i>
        Adicionar Sequência
      </button>

      <div className="pt-6 border-t flex items-center justify-end gap-4">
        <button 
          disabled={isSubmitting}
          className="px-10 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isSubmitting ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-save"></i>}
          <span>{initialData ? 'Atualizar Registro' : 'Salvar e Enviar'}</span>
        </button>
      </div>

      {/* Modal de Seleção de Check-in */}
      {showCheckinModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-gray-800 rounded-[2rem] w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl">
            <div className="p-6 border-b flex justify-between items-center bg-teal-50 rounded-t-[2rem]">
              <div>
                <h3 className="text-xl font-black text-teal-800">Check-in de Matéria Prima</h3>
                <p className="text-xs text-teal-600 mt-1">Selecione um veículo para iniciar a descarga</p>
              </div>
              <button 
                onClick={() => setShowCheckinModal(false)}
                className="w-10 h-10 rounded-full bg-white dark:bg-gray-800 text-gray-400 hover:text-red-500 flex items-center justify-center transition-colors"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
              <div className="grid gap-3">
                {checkinList.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectCheckin(item)}
                    className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl hover:border-teal-300 hover:bg-teal-50 hover:shadow-md transition-all group text-left"
                  >
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="w-10 h-10 rounded-full bg-teal-100 text-teal-600 flex flex-shrink-0 items-center justify-center font-bold">
                        <i className="fas fa-truck"></i>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-1">
                            <div className="font-black text-[#1A2B34] text-sm uppercase">{item.data?.placa || 'SEM PLACA'}</div>
                            <div className="text-[9px] font-black bg-teal-50 text-teal-700 px-2 py-0.5 rounded-lg border border-teal-100 uppercase tracking-wide">
                                {item.data?.variedade || 'N/D'}
                            </div>
                        </div>
                        <div className="flex flex-col gap-0.5">
                            <div className="text-[10px] text-gray-500 font-bold uppercase truncate flex items-center gap-1.5">
                                <i className="fas fa-user text-gray-300 text-[9px] w-3"></i> 
                                {item.data?.motorista || 'Motorista N/D'}
                            </div>
                            <div className="text-[10px] text-gray-500 font-bold uppercase truncate flex items-center gap-1.5">
                                <i className="fas fa-tractor text-gray-300 text-[9px] w-3"></i> 
                                {item.data?.produtor || 'Produtor N/D'}
                            </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1 ml-4 border-l border-gray-100 dark:border-gray-700 pl-4">
                       <span className="text-[9px] bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-gray-500 font-bold whitespace-nowrap">
                         {item.timestamp ? new Date(item.timestamp).toLocaleDateString() : 'Data N/D'}
                       </span>
                       <span className="text-[8px] text-teal-600 font-black opacity-0 group-hover:opacity-100 transition-opacity">SELECIONAR</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
            
            <div className="p-4 border-t bg-gray-50 dark:bg-gray-900/50 rounded-b-[2rem] text-center">
               <span className="text-[9px] text-gray-400 font-bold">Mostrando os últimos registros da portaria</span>
            </div>
          </div>
        </div>
      )}

    </form>
  );
};

export default FruitDischargeForm;
