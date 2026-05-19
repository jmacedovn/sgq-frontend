
import React, { useState } from 'react';
import { FormType } from '../../types';
import { useFruits } from '../../lib/useFruits';

interface ApplicationRow {
  data: string;
  produto: string;
  principioAtivo: string;
  carencia: string;
  quantidadeBomba: string;
  bombasUtilizadas: string;
  quantidadePlantas: string;
}

interface FieldApplicationFormProps {
  type: FormType.ORGANIC_APPLICATION | FormType.PESTICIDE_APPLICATION;
  onSave: (data: any) => void;
  isSubmitting: boolean;
  initialData?: any;
}

const FieldApplicationForm: React.FC<FieldApplicationFormProps> = ({ type, onSave, isSubmitting, initialData }) => {
  const { fruits } = useFruits();
  const isOrganic = type === FormType.ORGANIC_APPLICATION;
  
  const [header, setHeader] = useState(initialData?.header || {
    fruta: '',
    safra: '',
    nomeProdutor: '',
    nomePropriedade: '',
    regiao: '',
    quantidadeTotalPlantas: '',
    tipoEquipamento: '',
    capacidadeBomba: '',
    dataPoda: '',
    inicioColheita: '',
    plantasPodadas: '',
    terminoColheita: '',
    talhao: '',
    variedade: '',
    responsavel: '',
    observacao: ''
  });

  const [rows, setRows] = useState<ApplicationRow[]>(initialData?.rows || [
    { data: '', produto: '', principioAtivo: '', carencia: '', quantidadeBomba: '', bombasUtilizadas: '', quantidadePlantas: '' }
  ]);

  const addRow = () => {
    setRows([...rows, { data: '', produto: '', principioAtivo: '', carencia: '', quantidadeBomba: '', bombasUtilizadas: '', quantidadePlantas: '' }]);
  };

  const updateRow = (idx: number, field: keyof ApplicationRow, value: string) => {
    const newRows = [...rows];
    newRows[idx] = { ...newRows[idx], [field]: value };
    setRows(newRows);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ header, rows });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 bg-gray-50 dark:bg-gray-900/50 p-6 rounded-2xl border border-gray-100 dark:border-gray-700">
        <div className="space-y-1">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Fruta</label>
          <select value={header.fruta} onChange={e => setHeader({...header, fruta: e.target.value})} className="w-full p-2.5 border rounded-xl bg-white dark:bg-gray-800">
            <option value="">Selecione...</option>
            {fruits.map(f => <option key={f.id} value={f.name}>{f.name}</option>)}
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Safra</label>
          <input value={header.safra} onChange={e => setHeader({...header, safra: e.target.value})} className="w-full p-2.5 border rounded-xl" placeholder="Ex: 2024/2025" />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Nome do Produtor</label>
          <input value={header.nomeProdutor} onChange={e => setHeader({...header, nomeProdutor: e.target.value})} className="w-full p-2.5 border rounded-xl" />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Nome da Propriedade</label>
          <input value={header.nomePropriedade} onChange={e => setHeader({...header, nomePropriedade: e.target.value})} className="w-full p-2.5 border rounded-xl" />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Região (Município)</label>
          <input value={header.regiao} onChange={e => setHeader({...header, regiao: e.target.value})} className="w-full p-2.5 border rounded-xl" />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Talhão / Variedade</label>
          <div className="flex gap-2">
            <input value={header.talhao} onChange={e => setHeader({...header, talhao: e.target.value})} className="w-1/2 p-2.5 border rounded-xl" placeholder="Talhão" />
            <input value={header.variedade} onChange={e => setHeader({...header, variedade: e.target.value})} className="w-1/2 p-2.5 border rounded-xl" placeholder="Variedade" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 p-6 rounded-3xl shadow-sm">
          <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest border-b pb-2 mb-4">Equipamentos e Plantas</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400">Tipo Equipamento</label>
              <input value={header.tipoEquipamento} onChange={e => setHeader({...header, tipoEquipamento: e.target.value})} className="w-full p-2 border rounded-lg text-sm" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400">Capacidade Bomba</label>
              <input value={header.capacidadeBomba} onChange={e => setHeader({...header, capacidadeBomba: e.target.value})} className="w-full p-2 border rounded-lg text-sm" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400">Total de Plantas</label>
              <input type="number" value={header.quantidadeTotalPlantas} onChange={e => setHeader({...header, quantidadeTotalPlantas: e.target.value})} className="w-full p-2 border rounded-lg text-sm" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400">Plantas Podadas</label>
              <input type="number" value={header.plantasPodadas} onChange={e => setHeader({...header, plantasPodadas: e.target.value})} className="w-full p-2 border rounded-lg text-sm" />
            </div>
          </div>
        </div>

        <div className="space-y-4 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 p-6 rounded-3xl shadow-sm">
          <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest border-b pb-2 mb-4">Cronograma de Campo</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400">Data da Poda</label>
              <input type="date" value={header.dataPoda} onChange={e => setHeader({...header, dataPoda: e.target.value})} className="w-full p-2 border rounded-lg text-sm" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400">Início Colheita</label>
              <input type="date" value={header.inicioColheita} onChange={e => setHeader({...header, inicioColheita: e.target.value})} className="w-full p-2 border rounded-lg text-sm" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400">Término Colheita</label>
              <input type="date" value={header.terminoColheita} onChange={e => setHeader({...header, terminoColheita: e.target.value})} className="w-full p-2 border rounded-lg text-sm" />
            </div>
          </div>
        </div>
      </div>

      <div className="hidden md:block overflow-x-auto rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm bg-white dark:bg-gray-800">
        <table className="w-full text-left text-xs">
          <thead className="bg-gray-50 dark:bg-gray-900/50 border-b text-[10px] font-black uppercase tracking-widest text-gray-400">
            <tr>
              <th className="px-4 py-4">Data Pulv.</th>
              <th className="px-4 py-4">{isOrganic ? 'Produto Biológico' : 'Produto Químico'}</th>
              <th className="px-4 py-4">Princípio Ativo</th>
              <th className="px-4 py-4">Carência</th>
              <th className="px-4 py-4 text-center">Qt. Bomba</th>
              <th className="px-4 py-4 text-center">Nº Bombas</th>
              <th className="px-4 py-4 text-center">Qt. Plantas</th>
              <th className="px-4 py-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {rows.map((row, idx) => (
              <tr key={idx} className="hover:bg-gray-50/50">
                <td className="px-2 py-3">
                  <input type="date" value={row.data} onChange={e => updateRow(idx, 'data', e.target.value)} className="w-full p-1.5 border rounded text-[11px]" />
                </td>
                <td className="px-2 py-3">
                  <input value={row.produto} onChange={e => updateRow(idx, 'produto', e.target.value)} className="w-full p-1.5 border rounded text-[11px]" placeholder="Nome do produto" />
                </td>
                <td className="px-2 py-3">
                  <input value={row.principioAtivo} onChange={e => updateRow(idx, 'principioAtivo', e.target.value)} className="w-full p-1.5 border rounded text-[11px]" />
                </td>
                <td className="px-2 py-3">
                  <input value={row.carencia} onChange={e => updateRow(idx, 'carencia', e.target.value)} className="w-full p-1.5 border rounded text-[11px]" placeholder="Dias" />
                </td>
                <td className="px-2 py-3">
                  <input value={row.quantidadeBomba} onChange={e => updateRow(idx, 'quantidadeBomba', e.target.value)} className="w-full p-1.5 border rounded text-[11px] text-center" />
                </td>
                <td className="px-2 py-3">
                  <input type="number" value={row.bombasUtilizadas} onChange={e => updateRow(idx, 'bombasUtilizadas', e.target.value)} className="w-full p-1.5 border rounded text-[11px] text-center" />
                </td>
                <td className="px-2 py-3">
                  <input type="number" value={row.quantidadePlantas} onChange={e => updateRow(idx, 'quantidadePlantas', e.target.value)} className="w-full p-1.5 border rounded text-[11px] text-center" />
                </td>
                <td className="px-2 py-3 text-center">
                  <button type="button" onClick={() => setRows(rows.filter((_, i) => i !== idx))} className="text-gray-300 hover:text-red-500"><i className="fas fa-trash-alt"></i></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {rows.map((row, idx) => (
          <div key={idx} className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
              <span className="text-[10px] font-black text-orange-600 uppercase tracking-widest">Aplicação #{idx + 1}</span>
              <button 
                type="button" 
                onClick={() => setRows(rows.filter((_, i) => i !== idx))}
                className="text-gray-300 hover:text-red-500"
              >
                <i className="fas fa-trash-alt"></i>
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Data Pulv.</label>
                <input type="date" value={row.data} onChange={e => updateRow(idx, 'data', e.target.value)} className="w-full p-2.5 border rounded-xl text-xs" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{isOrganic ? 'Produto Biológico' : 'Produto Químico'}</label>
                <input value={row.produto} onChange={e => updateRow(idx, 'produto', e.target.value)} className="w-full p-2.5 border rounded-xl text-xs" placeholder="Nome do produto" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Princípio Ativo</label>
                <input value={row.principioAtivo} onChange={e => updateRow(idx, 'principioAtivo', e.target.value)} className="w-full p-2.5 border rounded-xl text-xs" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Carência</label>
                <input value={row.carencia} onChange={e => updateRow(idx, 'carencia', e.target.value)} className="w-full p-2.5 border rounded-xl text-xs" placeholder="Dias" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Qt. Bomba</label>
                <input value={row.quantidadeBomba} onChange={e => updateRow(idx, 'quantidadeBomba', e.target.value)} className="w-full p-2.5 border rounded-xl text-xs text-center" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Nº Bombas</label>
                <input type="number" value={row.bombasUtilizadas} onChange={e => updateRow(idx, 'bombasUtilizadas', e.target.value)} className="w-full p-2.5 border rounded-xl text-xs text-center" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Qt. Plantas</label>
                <input type="number" value={row.quantidadePlantas} onChange={e => updateRow(idx, 'quantidadePlantas', e.target.value)} className="w-full p-2.5 border rounded-xl text-xs text-center" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <button type="button" onClick={addRow} className="w-full py-4 border-2 border-dashed border-gray-200 dark:border-gray-600 rounded-2xl text-gray-400 font-black text-[10px] uppercase tracking-widest hover:border-orange-200 hover:text-orange-500 hover:bg-orange-50 transition-all flex items-center justify-center gap-2">
        <i className="fas fa-plus-circle"></i> Adicionar Linha
      </button>

      <div className="bg-gray-50 dark:bg-gray-900/50 p-6 rounded-3xl space-y-4">
        <div className="space-y-2">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Observações</label>
          <textarea 
            value={header.observacao} 
            onChange={e => setHeader({...header, observacao: e.target.value})}
            className="w-full p-4 border rounded-2xl h-24 text-sm" 
          ></textarea>
        </div>
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1 space-y-1">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Responsável</label>
            <input value={header.responsavel} onChange={e => setHeader({...header, responsavel: e.target.value})} className="w-full p-3 border rounded-xl font-bold text-gray-700 dark:text-gray-200" />
          </div>
        </div>
      </div>

      <div className="pt-6 border-t flex justify-end">
        <button disabled={isSubmitting} className="px-12 py-4 bg-[#1A2B34] hover:bg-[#2c4755] text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl shadow-xl transition-all flex items-center gap-2 disabled:opacity-50">
          {isSubmitting ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-save"></i>}
          <span>{initialData ? 'Sincronizar Edição' : 'Salvar Aplicação'}</span>
        </button>
      </div>
    </form>
  );
};

export default FieldApplicationForm;
