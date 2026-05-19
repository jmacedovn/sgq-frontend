
import React, { useState } from 'react';

interface RowData {
  data: string;
  turno: string;
  marmiteiro01: string;
  marmiteiro02: string;
  marmiteiro03: string;
  geladeira01: string;
  geladeira02: string;
  visto: string;
}

interface FridgeTemperatureFormProps {
  onSave: (data: any) => void;
  isSubmitting: boolean;
  initialData?: any;
}

const FridgeTemperatureForm: React.FC<FridgeTemperatureFormProps> = ({ onSave, isSubmitting, initialData }) => {
  const [rows, setRows] = useState<RowData[]>(initialData?.rows || [
    { 
      data: new Date().toISOString().split('T')[0], 
      turno: 'I', 
      marmiteiro01: '', marmiteiro02: '', marmiteiro03: '',
      geladeira01: '', geladeira02: '', visto: '' 
    }
  ]);

  const addRow = () => {
    setRows([...rows, { 
      data: new Date().toISOString().split('T')[0], 
      turno: 'I', 
      marmiteiro01: '', marmiteiro02: '', marmiteiro03: '',
      geladeira01: '', geladeira02: '', visto: '' 
    }]);
  };

  const updateRow = (index: number, field: keyof RowData, value: string) => {
    const newRows = [...rows];
    newRows[index] = { ...newRows[index], [field]: value };
    setRows(newRows);
  };

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave({ rows, local: 'REFEITÓRIO' }); }} className="space-y-6">
      <div className="hidden md:block overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-600">
        <table className="w-full text-left border-collapse">
          <thead className="text-[10px] uppercase bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 font-bold">
            <tr>
              <th className="px-3 py-3 border-r border-b w-32">Data</th>
              <th className="px-3 py-3 border-r border-b w-20 text-center">Turno</th>
              <th className="px-2 py-2 border-r border-b text-center bg-blue-50">Marmiteiro 01</th>
              <th className="px-2 py-2 border-r border-b text-center bg-blue-50">Marmiteiro 02</th>
              <th className="px-2 py-2 border-r border-b text-center bg-blue-50">Marmiteiro 03</th>
              <th className="px-2 py-2 border-r border-b text-center bg-emerald-50">Geladeira 01</th>
              <th className="px-2 py-2 border-r border-b text-center bg-emerald-50">Geladeira 02</th>
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
                  <select value={row.turno} onChange={(e) => updateRow(idx, 'turno', e.target.value)} className="w-full p-1.5 border rounded text-xs font-bold text-center">
                    <option value="I">I</option>
                    <option value="II">II</option>
                    <option value="III">III</option>
                  </select>
                </td>
                <td className="px-1 py-2 border-r"><input value={row.marmiteiro01} onChange={(e) => updateRow(idx, 'marmiteiro01', e.target.value)} className="w-full p-1 border rounded text-[10px] text-center" placeholder="°C" /></td>
                <td className="px-1 py-2 border-r"><input value={row.marmiteiro02} onChange={(e) => updateRow(idx, 'marmiteiro02', e.target.value)} className="w-full p-1 border rounded text-[10px] text-center" placeholder="°C" /></td>
                <td className="px-1 py-2 border-r"><input value={row.marmiteiro03} onChange={(e) => updateRow(idx, 'marmiteiro03', e.target.value)} className="w-full p-1 border rounded text-[10px] text-center" placeholder="°C" /></td>
                <td className="px-1 py-2 border-r"><input value={row.geladeira01} onChange={(e) => updateRow(idx, 'geladeira01', e.target.value)} className="w-full p-1 border rounded text-[10px] text-center" placeholder="°C" /></td>
                <td className="px-1 py-2 border-r"><input value={row.geladeira02} onChange={(e) => updateRow(idx, 'geladeira02', e.target.value)} className="w-full p-1 border rounded text-[10px] text-center" placeholder="°C" /></td>
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
              <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Registro #{idx + 1}</span>
              <button 
                type="button" 
                onClick={() => setRows(rows.filter((_, i) => i !== idx))}
                className="text-gray-300 hover:text-red-500"
              >
                <i className="fas fa-trash-alt"></i>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Data</label>
                <input type="date" value={row.data} onChange={(e) => updateRow(idx, 'data', e.target.value)} className="w-full p-2 border rounded-xl text-xs" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Turno</label>
                <select value={row.turno} onChange={(e) => updateRow(idx, 'turno', e.target.value)} className="w-full p-2 border rounded-xl text-xs font-bold">
                  <option value="I">I</option>
                  <option value="II">II</option>
                  <option value="III">III</option>
                </select>
              </div>
            </div>

            <div className="space-y-3 bg-blue-50/50 p-3 rounded-xl border border-blue-100">
              <span className="text-[9px] font-black text-blue-800 uppercase tracking-widest">Temperaturas Marmiteiros</span>
              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1">
                  <label className="text-[8px] font-bold text-blue-400 uppercase">M01</label>
                  <input value={row.marmiteiro01} onChange={(e) => updateRow(idx, 'marmiteiro01', e.target.value)} className="w-full p-2 border bg-white dark:bg-gray-800 rounded-lg text-xs text-center" placeholder="°C" />
                </div>
                <div className="space-y-1">
                  <label className="text-[8px] font-bold text-blue-400 uppercase">M02</label>
                  <input value={row.marmiteiro02} onChange={(e) => updateRow(idx, 'marmiteiro02', e.target.value)} className="w-full p-2 border bg-white dark:bg-gray-800 rounded-lg text-xs text-center" placeholder="°C" />
                </div>
                <div className="space-y-1">
                  <label className="text-[8px] font-bold text-blue-400 uppercase">M03</label>
                  <input value={row.marmiteiro03} onChange={(e) => updateRow(idx, 'marmiteiro03', e.target.value)} className="w-full p-2 border bg-white dark:bg-gray-800 rounded-lg text-xs text-center" placeholder="°C" />
                </div>
              </div>
            </div>

            <div className="space-y-3 bg-emerald-50/50 p-3 rounded-xl border border-emerald-100">
              <span className="text-[9px] font-black text-emerald-800 uppercase tracking-widest">Temperaturas Geladeiras</span>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[8px] font-bold text-emerald-400 uppercase">G01</label>
                  <input value={row.geladeira01} onChange={(e) => updateRow(idx, 'geladeira01', e.target.value)} className="w-full p-2 border bg-white dark:bg-gray-800 rounded-lg text-xs text-center" placeholder="°C" />
                </div>
                <div className="space-y-1">
                  <label className="text-[8px] font-bold text-emerald-400 uppercase">G02</label>
                  <input value={row.geladeira02} onChange={(e) => updateRow(idx, 'geladeira02', e.target.value)} className="w-full p-2 border bg-white dark:bg-gray-800 rounded-lg text-xs text-center" placeholder="°C" />
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Visto</label>
              <input placeholder="Visto" value={row.visto} onChange={(e) => updateRow(idx, 'visto', e.target.value)} className="w-full p-2 border rounded-xl text-xs uppercase" />
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
        Adicionar Novo Registro
      </button>

      <div className="pt-6 border-t flex items-center justify-end">
        <button 
          disabled={isSubmitting}
          className="px-10 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isSubmitting ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-save"></i>}
          <span>{initialData ? 'Atualizar Registro' : 'Salvar e Enviar'}</span>
        </button>
      </div>
    </form>
  );
};

export default FridgeTemperatureForm;
