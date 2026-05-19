
import React, { useState } from 'react';

interface RowData {
  data: string;
  turno: string;
  brix10: string;
  brix30: string;
  brix50: string;
  visto: string;
}

interface RefractometerVerificationFormProps {
  onSave: (data: any) => void;
  isSubmitting: boolean;
  initialData?: any;
}

const RefractometerVerificationForm: React.FC<RefractometerVerificationFormProps> = ({ onSave, isSubmitting, initialData }) => {
  const [rows, setRows] = useState<RowData[]>(initialData?.rows || [
    { 
      data: new Date().toISOString().split('T')[0], 
      turno: 'I', 
      brix10: '10.00', brix30: '30.00', brix50: '50.00',
      visto: '' 
    }
  ]);

  const addRow = () => {
    setRows([...rows, { 
      data: new Date().toISOString().split('T')[0], 
      turno: 'I', 
      brix10: '10.00', brix30: '30.00', brix50: '50.00',
      visto: '' 
    }]);
  };

  const updateRow = (index: number, field: keyof RowData, value: string) => {
    const newRows = [...rows];
    newRows[index] = { ...newRows[index], [field]: value };
    setRows(newRows);
  };

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave({ rows, equipamento: 'RE 705' }); }} className="space-y-6">
      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-600">
        <table className="w-full text-left border-collapse">
          <thead className="text-[10px] uppercase bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 font-bold">
            <tr>
              <th rowSpan={2} className="px-3 py-3 border-r border-b w-32">Data</th>
              <th rowSpan={2} className="px-3 py-3 border-r border-b w-20 text-center">Turno</th>
              <th colSpan={3} className="px-3 py-2 border-r border-b text-center bg-orange-50">Lote Sacarose P.A.</th>
              <th rowSpan={2} className="px-3 py-3 border-b text-center">Visto</th>
            </tr>
            <tr>
              <th className="px-2 py-2 border-r border-b text-center">10 °Brix</th>
              <th className="px-2 py-2 border-r border-b text-center">30 °Brix</th>
              <th className="px-2 py-2 border-r border-b text-center">50 °Brix</th>
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
                <td className="px-1 py-2 border-r"><input value={row.brix10} onChange={(e) => updateRow(idx, 'brix10', e.target.value)} className="w-full p-1 border rounded text-[10px] text-center" /></td>
                <td className="px-1 py-2 border-r"><input value={row.brix30} onChange={(e) => updateRow(idx, 'brix30', e.target.value)} className="w-full p-1 border rounded text-[10px] text-center" /></td>
                <td className="px-1 py-2 border-r"><input value={row.brix50} onChange={(e) => updateRow(idx, 'brix50', e.target.value)} className="w-full p-1 border rounded text-[10px] text-center" /></td>
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
          <div key={idx} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl p-4 shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
              <span className="text-[10px] font-black text-blue-700 uppercase tracking-widest">Registro #{idx + 1}</span>
              <div className="flex gap-2">
                <input type="date" value={row.data} onChange={(e) => updateRow(idx, 'data', e.target.value)} className="p-1 border rounded text-[10px]" />
                <select value={row.turno} onChange={(e) => updateRow(idx, 'turno', e.target.value)} className="p-1 border rounded text-[10px] font-bold">
                  <option value="I">I</option>
                  <option value="II">II</option>
                  <option value="III">III</option>
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-2">
              <div className="space-y-1">
                <label className="text-[8px] font-black text-gray-400 uppercase">10 °Brix</label>
                <input value={row.brix10} onChange={(e) => updateRow(idx, 'brix10', e.target.value)} className="w-full p-2 border rounded-lg text-[10px] text-center" />
              </div>
              <div className="space-y-1">
                <label className="text-[8px] font-black text-gray-400 uppercase">30 °Brix</label>
                <input value={row.brix30} onChange={(e) => updateRow(idx, 'brix30', e.target.value)} className="w-full p-2 border rounded-lg text-[10px] text-center" />
              </div>
              <div className="space-y-1">
                <label className="text-[8px] font-black text-gray-400 uppercase">50 °Brix</label>
                <input value={row.brix50} onChange={(e) => updateRow(idx, 'brix50', e.target.value)} className="w-full p-2 border rounded-lg text-[10px] text-center" />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[8px] font-black text-gray-400 uppercase">Visto</label>
              <input placeholder="Visto" value={row.visto} onChange={(e) => updateRow(idx, 'visto', e.target.value)} className="w-full p-2 border rounded-lg text-[10px] uppercase" />
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

export default RefractometerVerificationForm;
