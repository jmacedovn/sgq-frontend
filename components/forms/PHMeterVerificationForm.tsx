
import React, { useState } from 'react';

interface RowData {
  data: string;
  turno: string;
  lote4: string;
  lote7: string;
  lote10: string;
  slope: string;
  visto: string;
}

interface PHMeterVerificationFormProps {
  onSave: (data: any) => void;
  isSubmitting: boolean;
  initialData?: any;
}

const PHMeterVerificationForm: React.FC<PHMeterVerificationFormProps> = ({ onSave, isSubmitting, initialData }) => {
  const [rows, setRows] = useState<RowData[]>(initialData?.rows || [
    { 
      data: new Date().toISOString().split('T')[0], 
      turno: 'I', 
      lote4: '4.0', lote7: '7.0', lote10: '10.0',
      slope: '100.0', visto: '' 
    }
  ]);

  const addRow = () => {
    setRows([...rows, { 
      data: new Date().toISOString().split('T')[0], 
      turno: 'I', 
      lote4: '4.0', lote7: '7.0', lote10: '10.0',
      slope: '100.0', visto: '' 
    }]);
  };

  const updateRow = (index: number, field: keyof RowData, value: string) => {
    const newRows = [...rows];
    newRows[index] = { ...newRows[index], [field]: value };
    setRows(newRows);
  };

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave({ rows, equipamento: 'PH 706' }); }} className="space-y-6">
      <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-600">
        <table className="w-full text-left border-collapse">
          <thead className="text-[10px] uppercase bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 font-bold">
            <tr>
              <th rowSpan={2} className="px-3 py-3 border-r border-b w-32">Data</th>
              <th rowSpan={2} className="px-3 py-3 border-r border-b w-20 text-center">Turno</th>
              <th colSpan={3} className="px-3 py-2 border-r border-b text-center bg-cyan-50">Lote Solução</th>
              <th rowSpan={2} className="px-3 py-3 border-r border-b text-center">Slope</th>
              <th rowSpan={2} className="px-3 py-3 border-b text-center">Visto</th>
            </tr>
            <tr>
              <th className="px-2 py-2 border-r border-b text-center">Sol. 4.0</th>
              <th className="px-2 py-2 border-r border-b text-center">Sol. 7.0</th>
              <th className="px-2 py-2 border-r border-b text-center">Sol. 10.0</th>
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
                <td className="px-1 py-2 border-r"><input value={row.lote4} onChange={(e) => updateRow(idx, 'lote4', e.target.value)} className="w-full p-1 border rounded text-[10px] text-center" /></td>
                <td className="px-1 py-2 border-r"><input value={row.lote7} onChange={(e) => updateRow(idx, 'lote7', e.target.value)} className="w-full p-1 border rounded text-[10px] text-center" /></td>
                <td className="px-1 py-2 border-r"><input value={row.lote10} onChange={(e) => updateRow(idx, 'lote10', e.target.value)} className="w-full p-1 border rounded text-[10px] text-center" /></td>
                <td className="px-2 py-3 border-r">
                  <input value={row.slope} onChange={(e) => updateRow(idx, 'slope', e.target.value)} className="w-full p-1.5 border rounded text-xs text-center font-black" />
                </td>
                <td className="px-2 py-3">
                  <input placeholder="Visto" value={row.visto} onChange={(e) => updateRow(idx, 'visto', e.target.value)} className="w-full p-1.5 border rounded text-xs uppercase" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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

export default PHMeterVerificationForm;
