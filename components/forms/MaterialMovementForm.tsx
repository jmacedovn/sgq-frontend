
import React, { useState } from 'react';

interface MovementRow {
  codigo: string;
  material: string;
  movimentacao: 'T' | 'D' | 'S' | null;
  depositoDe: string;
  depositoPara: string;
  qtd: string;
  unidade: string;
  lote: string;
  solicitante: string;
  almoxarife: string;
}

const MaterialMovementForm: React.FC<{ onSave: (data: any) => void, isSubmitting: boolean, initialData?: any }> = ({ onSave, isSubmitting, initialData }) => {
  const [data, setData] = useState(initialData || {
    data: new Date().toISOString().split('T')[0],
    observacoes: '',
    rows: Array(1).fill(null).map(() => ({
      codigo: '', material: '', movimentacao: null, depositoDe: '', depositoPara: '',
      qtd: '', unidade: '', lote: '', solicitante: '', almoxarife: ''
    })) as MovementRow[]
  });

  const updateRow = (idx: number, field: keyof MovementRow, value: any) => {
    const newRows = [...data.rows];
    newRows[idx] = { ...newRows[idx], [field]: value };
    setData({ ...data, rows: newRows });
  };

  const addRow = () => {
    setData({
      ...data,
      rows: [...data.rows, {
        codigo: '', material: '', movimentacao: null, depositoDe: '', depositoPara: '',
        qtd: '', unidade: '', lote: '', solicitante: '', almoxarife: ''
      }]
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(data);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-gray-50 dark:bg-gray-900/50 p-6 rounded-2xl border border-gray-100 dark:border-gray-700">
        <div className="space-y-1">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Data do Registro</label>
          <input 
            type="date" 
            required 
            value={data.data} 
            onChange={e => setData({...data, data: e.target.value})} 
            className="w-full p-2.5 border rounded-xl" 
          />
        </div>
      </div>

      {/* Table Section - Desktop */}
      <div className="hidden md:block overflow-x-auto rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm bg-white dark:bg-gray-800">
        <table className="w-full text-left text-xs">
          <thead className="bg-gray-50 dark:bg-gray-900/50 border-b text-[10px] font-black uppercase tracking-widest text-gray-400">
            <tr>
              <th className="px-4 py-4">Código</th>
              <th className="px-4 py-4">Material</th>
              <th className="px-4 py-4 text-center">Mov. (T/D/S)</th>
              <th className="px-4 py-4 text-center">Depósito</th>
              <th className="px-4 py-4 text-center">Qtd / Unid</th>
              <th className="px-4 py-4">Lote</th>
              <th className="px-4 py-4">Solicitante</th>
              <th className="px-4 py-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {data.rows.map((row: any, idx: number) => (
              <tr key={idx} className="hover:bg-teal-50/20">
                <td className="px-2 py-3">
                   <input value={row.codigo} onChange={e => updateRow(idx, 'codigo', e.target.value)} className="w-full p-1.5 border rounded text-[11px]" />
                </td>
                <td className="px-2 py-3">
                   <input value={row.material} onChange={e => updateRow(idx, 'material', e.target.value)} className="w-full p-1.5 border rounded text-[11px]" />
                </td>
                <td className="px-2 py-3">
                   <div className="flex gap-1 justify-center">
                     {(['T', 'D', 'S'] as const).map(m => (
                       <button
                         key={m}
                         type="button"
                         onClick={() => updateRow(idx, 'movimentacao', m)}
                         className={`w-6 h-6 rounded text-[9px] font-black border transition-all ${
                           row.movimentacao === m 
                           ? 'bg-teal-600 border-teal-700 text-white' 
                           : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 text-gray-300'
                         }`}
                       >
                         {m}
                       </button>
                     ))}
                   </div>
                </td>
                <td className="px-2 py-3 space-y-1">
                   <input value={row.depositoDe} onChange={e => updateRow(idx, 'depositoDe', e.target.value)} className="w-full p-1.5 border rounded text-[10px]" placeholder="De" />
                   <input value={row.depositoPara} onChange={e => updateRow(idx, 'depositoPara', e.target.value)} className="w-full p-1.5 border rounded text-[10px]" placeholder="Para" />
                </td>
                <td className="px-2 py-3 space-y-1">
                   <input value={row.qtd} onChange={e => updateRow(idx, 'qtd', e.target.value)} className="w-full p-1.5 border rounded text-[10px] text-center" />
                   <input value={row.unidade} onChange={e => updateRow(idx, 'unidade', e.target.value)} className="w-full p-1.5 border rounded text-[10px] text-center" />
                </td>
                <td className="px-2 py-3">
                   <input value={row.lote} onChange={e => updateRow(idx, 'lote', e.target.value)} className="w-full p-1.5 border rounded text-[11px]" />
                </td>
                <td className="px-2 py-3 space-y-1">
                   <input value={row.solicitante} onChange={e => updateRow(idx, 'solicitante', e.target.value)} className="w-full p-1.5 border rounded text-[10px]" placeholder="Solic." />
                   <input value={row.almoxarife} onChange={e => updateRow(idx, 'almoxarife', e.target.value)} className="w-full p-1.5 border rounded text-[10px]" placeholder="Almox." />
                </td>
                <td className="px-2 py-3 text-center">
                   <button type="button" onClick={() => setData({...data, rows: data.rows.filter((_:any, i:any) => i !== idx)})} className="text-red-400"><i className="fas fa-trash-alt"></i></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Table Section - Mobile Cards */}
      <div className="md:hidden space-y-4">
        {data.rows.map((row: any, idx: number) => (
          <div key={idx} className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
              <span className="text-[10px] font-black text-teal-600 uppercase tracking-widest">Item {idx + 1}</span>
              <button type="button" onClick={() => setData({...data, rows: data.rows.filter((_:any, i:any) => i !== idx)})} className="text-red-400 text-xs"><i className="fas fa-trash-alt"></i></button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[9px] font-black text-gray-400 uppercase">Código</label>
                <input value={row.codigo} onChange={e => updateRow(idx, 'codigo', e.target.value)} className="w-full p-2 border rounded text-xs" />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black text-gray-400 uppercase">Material</label>
                <input value={row.material} onChange={e => updateRow(idx, 'material', e.target.value)} className="w-full p-2 border rounded text-xs" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-black text-gray-400 uppercase">Movimentação (T/D/S)</label>
              <div className="flex gap-2">
                {(['T', 'D', 'S'] as const).map(m => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => updateRow(idx, 'movimentacao', m)}
                    className={`flex-1 py-2 rounded text-[10px] font-black border transition-all ${
                      row.movimentacao === m 
                      ? 'bg-teal-600 border-teal-700 text-white shadow-sm' 
                      : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 text-gray-300'
                    }`}
                  >
                    {m === 'T' ? 'Transferência' : m === 'D' ? 'Devolução' : 'Saída'}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[9px] font-black text-gray-400 uppercase">Depósito (De)</label>
                <input value={row.depositoDe} onChange={e => updateRow(idx, 'depositoDe', e.target.value)} className="w-full p-2 border rounded text-xs" />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black text-gray-400 uppercase">Depósito (Para)</label>
                <input value={row.depositoPara} onChange={e => updateRow(idx, 'depositoPara', e.target.value)} className="w-full p-2 border rounded text-xs" />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-[9px] font-black text-gray-400 uppercase">Qtd</label>
                <input value={row.qtd} onChange={e => updateRow(idx, 'qtd', e.target.value)} className="w-full p-2 border rounded text-center text-xs" />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black text-gray-400 uppercase">Unid</label>
                <input value={row.unidade} onChange={e => updateRow(idx, 'unidade', e.target.value)} className="w-full p-2 border rounded text-center text-xs" />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black text-gray-400 uppercase">Lote</label>
                <input value={row.lote} onChange={e => updateRow(idx, 'lote', e.target.value)} className="w-full p-2 border rounded text-xs" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[9px] font-black text-gray-400 uppercase">Solicitante</label>
                <input value={row.solicitante} onChange={e => updateRow(idx, 'solicitante', e.target.value)} className="w-full p-2 border rounded text-xs" />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black text-gray-400 uppercase">Almoxarife</label>
                <input value={row.almoxarife} onChange={e => updateRow(idx, 'almoxarife', e.target.value)} className="w-full p-2 border rounded text-xs" />
              </div>
            </div>
          </div>
        ))}
        <button 
          type="button" 
          onClick={addRow}
          className="w-full py-3 border-2 border-dashed border-gray-200 dark:border-gray-600 rounded-2xl text-gray-400 font-bold hover:border-teal-400 hover:text-teal-500 hover:bg-teal-50 transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-widest"
        >
          <i className="fas fa-plus"></i>
          Adicionar Item
        </button>
      </div>

      <div className="bg-gray-50 dark:bg-gray-900/50 p-6 rounded-3xl">
        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Observações</label>
        <textarea value={data.observacoes} onChange={e => setData({...data, observacoes: e.target.value})} className="w-full p-4 border rounded-2xl h-24 text-sm" />
      </div>

      <div className="pt-6 border-t flex justify-end">
        <button disabled={isSubmitting} className="px-12 py-4 bg-teal-700 hover:bg-teal-800 text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl shadow-xl transition-all flex items-center gap-2">
          {isSubmitting ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-truck-ramp-box"></i>}
          <span>{initialData ? 'Sincronizar Edição' : 'Salvar Movimentação'}</span>
        </button>
      </div>
    </form>
  );
};

export default MaterialMovementForm;
