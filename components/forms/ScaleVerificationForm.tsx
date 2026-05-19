
import React, { useState } from 'react';

interface RowData {
  data: string;
  turno: string;
  p1: string;
  p2: string;
  p3: string;
  p4: string;
  p5: string;
  p6: string;
  p7: string;
  conforme: 'S' | 'N';
  observacao: string;
  visto: string;
}

interface ScaleVerificationFormProps {
  onSave: (data: any) => void;
  isSubmitting: boolean;
  initialData?: any;
}

const ScaleVerificationForm: React.FC<ScaleVerificationFormProps> = ({ onSave, isSubmitting, initialData }) => {
  const [rows, setRows] = useState<RowData[]>(initialData?.rows || [
    { 
      data: new Date().toISOString().split('T')[0], 
      turno: 'I', 
      p1: '1000.00', p2: '500.00', p3: '100.00', p4: '50.00', p5: '20.00', p6: '10.00', p7: '5.00',
      conforme: 'S', observacao: '', visto: '' 
    }
  ]);

  const addRow = () => {
    setRows([...rows, { 
      data: new Date().toISOString().split('T')[0], 
      turno: 'I', 
      p1: '1000.00', p2: '500.00', p3: '100.00', p4: '50.00', p5: '20.00', p6: '10.00', p7: '5.00',
      conforme: 'S', observacao: '', visto: '' 
    }]);
  };

  const updateRow = (index: number, field: keyof RowData, value: string) => {
    const newRows = [...rows];
    newRows[index] = { ...newRows[index], [field]: value };
    setRows(newRows);
  };

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave({ rows, equipamento: 'BL 701' }); }} className="space-y-6">
      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-600">
        <table className="w-full text-left border-collapse">
          <thead className="text-[10px] uppercase bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 font-bold">
            <tr>
              <th rowSpan={2} className="px-3 py-3 border-r border-b w-32">Data</th>
              <th rowSpan={2} className="px-3 py-3 border-r border-b w-20 text-center">Turno</th>
              <th colSpan={7} className="px-3 py-2 border-r border-b text-center bg-amber-50">Pesos (g)</th>
              <th rowSpan={2} className="px-3 py-3 border-r border-b text-center">Conf.</th>
              <th rowSpan={2} className="px-3 py-3 border-r border-b">Observação</th>
              <th rowSpan={2} className="px-3 py-3 border-b text-center">Visto</th>
            </tr>
            <tr>
              <th className="px-2 py-2 border-r border-b text-center">P1 (1000)</th>
              <th className="px-2 py-2 border-r border-b text-center">P2 (500)</th>
              <th className="px-2 py-2 border-r border-b text-center">P3 (100)</th>
              <th className="px-2 py-2 border-r border-b text-center">P4 (50)</th>
              <th className="px-2 py-2 border-r border-b text-center">P5 (20)</th>
              <th className="px-2 py-2 border-r border-b text-center">P6 (10)</th>
              <th className="px-2 py-2 border-r border-b text-center">P7 (5)</th>
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
                <td className="px-1 py-2 border-r"><input value={row.p1} onChange={(e) => updateRow(idx, 'p1', e.target.value)} className="w-full p-1 border rounded text-[10px] text-center" /></td>
                <td className="px-1 py-2 border-r"><input value={row.p2} onChange={(e) => updateRow(idx, 'p2', e.target.value)} className="w-full p-1 border rounded text-[10px] text-center" /></td>
                <td className="px-1 py-2 border-r"><input value={row.p3} onChange={(e) => updateRow(idx, 'p3', e.target.value)} className="w-full p-1 border rounded text-[10px] text-center" /></td>
                <td className="px-1 py-2 border-r"><input value={row.p4} onChange={(e) => updateRow(idx, 'p4', e.target.value)} className="w-full p-1 border rounded text-[10px] text-center" /></td>
                <td className="px-1 py-2 border-r"><input value={row.p5} onChange={(e) => updateRow(idx, 'p5', e.target.value)} className="w-full p-1 border rounded text-[10px] text-center" /></td>
                <td className="px-1 py-2 border-r"><input value={row.p6} onChange={(e) => updateRow(idx, 'p6', e.target.value)} className="w-full p-1 border rounded text-[10px] text-center" /></td>
                <td className="px-1 py-2 border-r"><input value={row.p7} onChange={(e) => updateRow(idx, 'p7', e.target.value)} className="w-full p-1 border rounded text-[10px] text-center" /></td>
                <td className="px-2 py-3 border-r">
                  <select value={row.conforme} onChange={(e) => updateRow(idx, 'conforme', e.target.value)} className={`w-full p-1 border rounded text-[10px] font-black text-center ${row.conforme === 'S' ? 'text-green-600' : 'text-red-600'}`}>
                    <option value="S">S</option>
                    <option value="N">N</option>
                  </select>
                </td>
                <td className="px-2 py-3 border-r">
                  <input placeholder="Obs." value={row.observacao} onChange={(e) => updateRow(idx, 'observacao', e.target.value)} className="w-full p-1.5 border rounded text-xs" />
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
            
            <div className="grid grid-cols-4 gap-2">
              <div className="space-y-1">
                <label className="text-[8px] font-black text-gray-400 uppercase">P1 (1000)</label>
                <input value={row.p1} onChange={(e) => updateRow(idx, 'p1', e.target.value)} className="w-full p-2 border rounded-lg text-[10px] text-center" />
              </div>
              <div className="space-y-1">
                <label className="text-[8px] font-black text-gray-400 uppercase">P2 (500)</label>
                <input value={row.p2} onChange={(e) => updateRow(idx, 'p2', e.target.value)} className="w-full p-2 border rounded-lg text-[10px] text-center" />
              </div>
              <div className="space-y-1">
                <label className="text-[8px] font-black text-gray-400 uppercase">P3 (100)</label>
                <input value={row.p3} onChange={(e) => updateRow(idx, 'p3', e.target.value)} className="w-full p-2 border rounded-lg text-[10px] text-center" />
              </div>
              <div className="space-y-1">
                <label className="text-[8px] font-black text-gray-400 uppercase">P4 (50)</label>
                <input value={row.p4} onChange={(e) => updateRow(idx, 'p4', e.target.value)} className="w-full p-2 border rounded-lg text-[10px] text-center" />
              </div>
              <div className="space-y-1">
                <label className="text-[8px] font-black text-gray-400 uppercase">P5 (20)</label>
                <input value={row.p5} onChange={(e) => updateRow(idx, 'p5', e.target.value)} className="w-full p-2 border rounded-lg text-[10px] text-center" />
              </div>
              <div className="space-y-1">
                <label className="text-[8px] font-black text-gray-400 uppercase">P6 (10)</label>
                <input value={row.p6} onChange={(e) => updateRow(idx, 'p6', e.target.value)} className="w-full p-2 border rounded-lg text-[10px] text-center" />
              </div>
              <div className="space-y-1">
                <label className="text-[8px] font-black text-gray-400 uppercase">P7 (5)</label>
                <input value={row.p7} onChange={(e) => updateRow(idx, 'p7', e.target.value)} className="w-full p-2 border rounded-lg text-[10px] text-center" />
              </div>
              <div className="space-y-1">
                <label className="text-[8px] font-black text-gray-400 uppercase">Conf.</label>
                <select value={row.conforme} onChange={(e) => updateRow(idx, 'conforme', e.target.value)} className={`w-full p-2 border rounded-lg text-[10px] font-black text-center ${row.conforme === 'S' ? 'text-green-600' : 'text-red-600'}`}>
                  <option value="S">S</option>
                  <option value="N">N</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[8px] font-black text-gray-400 uppercase">Observação</label>
                <input placeholder="Obs." value={row.observacao} onChange={(e) => updateRow(idx, 'observacao', e.target.value)} className="w-full p-2 border rounded-lg text-[10px]" />
              </div>
              <div className="space-y-1">
                <label className="text-[8px] font-black text-gray-400 uppercase">Visto</label>
                <input placeholder="Visto" value={row.visto} onChange={(e) => updateRow(idx, 'visto', e.target.value)} className="w-full p-2 border rounded-lg text-[10px] uppercase" />
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

export default ScaleVerificationForm;
