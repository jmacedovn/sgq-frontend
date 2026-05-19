
import React, { useState } from 'react';

interface RowData {
  data: string;
  horario: string;
  nivelReservatorio: string;
  consumoHipoclorito: string;
  consumoPAC: string;
  limpezaFiltros: boolean;
  visto: string;
}

interface WaterTreatmentFormProps {
  onSave: (data: any) => void;
  isSubmitting: boolean;
  initialData?: any;
}

const WaterTreatmentForm: React.FC<WaterTreatmentFormProps> = ({ onSave, isSubmitting, initialData }) => {
  const [rows, setRows] = useState<RowData[]>(initialData?.rows || [
    { 
      data: new Date().toISOString().split('T')[0], 
      horario: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), 
      nivelReservatorio: '', consumoHipoclorito: '', consumoPAC: '',
      limpezaFiltros: false,
      visto: '' 
    }
  ]);

  const addRow = () => {
    setRows([...rows, { 
      data: new Date().toISOString().split('T')[0], 
      horario: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), 
      nivelReservatorio: '', consumoHipoclorito: '', consumoPAC: '',
      limpezaFiltros: false,
      visto: '' 
    }]);
  };

  const updateRow = (index: number, field: keyof RowData, value: any) => {
    const newRows = [...rows];
    newRows[index] = { ...newRows[index], [field]: value };
    setRows(newRows);
  };

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave({ rows }); }} className="space-y-6">
      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-600">
        <table className="w-full text-left border-collapse">
          <thead className="text-[10px] uppercase bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 font-bold">
            <tr>
              <th className="px-3 py-3 border-r border-b w-32">Data</th>
              <th className="px-3 py-3 border-r border-b w-24 text-center">Horário</th>
              <th className="px-3 py-3 border-r border-b text-center bg-blue-50">Nível Reserv. (%)</th>
              <th className="px-3 py-3 border-r border-b text-center bg-emerald-50">Cons. Hipoclorito (L)</th>
              <th className="px-3 py-3 border-r border-b text-center bg-sky-50">Cons. PAC (L)</th>
              <th className="px-3 py-3 border-r border-b text-center bg-indigo-50">Limpeza Filtros</th>
              <th className="px-3 py-3 border-b text-center">Visto</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {rows.map((row, idx) => (
              <tr key={idx} className="hover:bg-gray-50 dark:bg-gray-900/50 transition-colors">
                <td className="px-2 py-3 border-r">
                  <input type="date" value={row.data} onChange={(e) => updateRow(idx, 'data', e.target.value)} className="w-full p-1.5 border rounded text-xs" />
                </td>
                <td className="px-2 py-3 border-r">
                  <input type="time" value={row.horario} onChange={(e) => updateRow(idx, 'horario', e.target.value)} className="w-full p-1.5 border rounded text-xs text-center" />
                </td>
                <td className="px-2 py-3 border-r"><input value={row.nivelReservatorio} onChange={(e) => updateRow(idx, 'nivelReservatorio', e.target.value)} className="w-full p-1.5 border rounded text-xs text-center font-bold" placeholder="0" /></td>
                <td className="px-2 py-3 border-r"><input value={row.consumoHipoclorito} onChange={(e) => updateRow(idx, 'consumoHipoclorito', e.target.value)} className="w-full p-1.5 border rounded text-xs text-center font-bold" placeholder="0" /></td>
                <td className="px-2 py-3 border-r"><input value={row.consumoPAC} onChange={(e) => updateRow(idx, 'consumoPAC', e.target.value)} className="w-full p-1.5 border rounded text-xs text-center font-bold" placeholder="0" /></td>
                <td className="px-2 py-3 border-r text-center">
                  <button 
                    type="button" 
                    onClick={() => updateRow(idx, 'limpezaFiltros', !row.limpezaFiltros)}
                    className={`px-3 py-1 rounded-lg text-[10px] font-bold border transition-all ${row.limpezaFiltros ? 'bg-green-600 border-green-700 text-white shadow-md' : 'bg-gray-50 dark:bg-gray-900/50 text-gray-400 border-gray-200 dark:border-gray-600'}`}
                  >
                    {row.limpezaFiltros ? 'REALIZADA' : 'PENDENTE'}
                  </button>
                </td>
                <td className="px-2 py-3">
                  <input placeholder="Visto" value={row.visto} onChange={(e) => updateRow(idx, 'visto', e.target.value)} className="w-full p-1.5 border rounded text-xs uppercase" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {rows.map((row, idx) => (
          <div key={idx} className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-200 dark:border-gray-600 shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
              <span className="text-[10px] font-black text-cyan-800 uppercase tracking-widest">Tratamento de Água</span>
              <span className="text-[9px] font-bold text-gray-400 uppercase">{row.horario}</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[8px] font-bold text-gray-400 uppercase">Data</label>
                <input type="date" value={row.data} onChange={(e) => updateRow(idx, 'data', e.target.value)} className="w-full p-2 border rounded-xl text-[10px]" />
              </div>
              <div className="space-y-1">
                <label className="text-[8px] font-bold text-gray-400 uppercase">Horário</label>
                <input type="time" value={row.horario} onChange={(e) => updateRow(idx, 'horario', e.target.value)} className="w-full p-2 border rounded-xl text-[10px] text-center" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1 p-2 bg-blue-50 rounded-xl">
                <label className="text-[8px] font-black text-blue-700 uppercase block text-center">Nível Res.</label>
                <input value={row.nivelReservatorio} onChange={(e) => updateRow(idx, 'nivelReservatorio', e.target.value)} className="w-full p-1.5 border rounded-lg text-[10px] text-center font-bold bg-white dark:bg-gray-800" placeholder="%" />
              </div>
              <div className="space-y-1 p-2 bg-emerald-50 rounded-xl">
                <label className="text-[8px] font-black text-emerald-700 uppercase block text-center">Hipoclorito</label>
                <input value={row.consumoHipoclorito} onChange={(e) => updateRow(idx, 'consumoHipoclorito', e.target.value)} className="w-full p-1.5 border rounded-lg text-[10px] text-center font-bold bg-white dark:bg-gray-800" placeholder="L" />
              </div>
              <div className="space-y-1 p-2 bg-sky-50 rounded-xl">
                <label className="text-[8px] font-black text-sky-700 uppercase block text-center">Consumo PAC</label>
                <input value={row.consumoPAC} onChange={(e) => updateRow(idx, 'consumoPAC', e.target.value)} className="w-full p-1.5 border rounded-lg text-[10px] text-center font-bold bg-white dark:bg-gray-800" placeholder="L" />
              </div>
              <div className="space-y-1 p-2 bg-indigo-50 rounded-xl flex flex-col justify-center">
                <label className="text-[8px] font-black text-indigo-700 uppercase block text-center mb-1">Limpeza Filtros</label>
                <button 
                  type="button" 
                  onClick={() => updateRow(idx, 'limpezaFiltros', !row.limpezaFiltros)}
                  className={`w-full py-1.5 rounded-lg text-[8px] font-bold border transition-all ${row.limpezaFiltros ? 'bg-green-600 border-green-700 text-white' : 'bg-white dark:bg-gray-800 text-gray-400 border-gray-200 dark:border-gray-600'}`}
                >
                  {row.limpezaFiltros ? 'OK' : 'Ñ'}
                </button>
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[8px] font-bold text-gray-400 uppercase">Visto</label>
              <input placeholder="Visto" value={row.visto} onChange={(e) => updateRow(idx, 'visto', e.target.value)} className="w-full p-2 border rounded-xl text-[10px] uppercase" />
            </div>
          </div>
        ))}
      </div>

      <button 
        type="button" 
        onClick={addRow}
        className="w-full py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl text-gray-500 font-bold hover:border-cyan-400 hover:text-cyan-500 hover:bg-cyan-50 transition-all flex items-center justify-center gap-2"
      >
        <i className="fas fa-plus"></i>
        Adicionar Novo Registro
      </button>

      <div className="pt-6 border-t flex items-center justify-end">
        <button 
          disabled={isSubmitting}
          className="px-10 py-3.5 bg-cyan-600 hover:bg-cyan-700 text-white font-bold rounded-xl shadow-lg shadow-cyan-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isSubmitting ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-save"></i>}
          <span>{initialData ? 'Atualizar Registro' : 'Salvar e Enviar'}</span>
        </button>
      </div>
    </form>
  );
};

export default WaterTreatmentForm;
