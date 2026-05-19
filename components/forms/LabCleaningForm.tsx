
import React, { useState } from 'react';

interface RowData {
  data: string;
  turno: string;
  local: 'Microbiologia' | 'Segregado' | 'Laboratório Central' | 'Contra-amostra';
  detergente: boolean;
  agua: boolean;
  alcool: boolean;
  observacao: string;
  colaborador: string;
  responsavelVerificacao: string;
}

interface LabCleaningFormProps {
  onSave: (data: any) => void;
  isSubmitting: boolean;
  initialData?: any;
}

const LabCleaningForm: React.FC<LabCleaningFormProps> = ({ onSave, isSubmitting, initialData }) => {
  const [rows, setRows] = useState<RowData[]>(initialData?.rows || [
    { 
      data: new Date().toISOString().split('T')[0], 
      turno: '1', 
      local: 'Microbiologia',
      detergente: false,
      agua: false,
      alcool: false,
      observacao: '',
      colaborador: '',
      responsavelVerificacao: ''
    }
  ]);

  const addRow = () => {
    setRows([...rows, { 
      data: new Date().toISOString().split('T')[0], 
      turno: '1', 
      local: 'Microbiologia',
      detergente: false,
      agua: false,
      alcool: false,
      observacao: '',
      colaborador: '',
      responsavelVerificacao: ''
    }]);
  };

  const updateRow = (index: number, field: keyof RowData, value: any) => {
    const newRows = [...rows];
    newRows[index] = { ...newRows[index], [field]: value };
    setRows(newRows);
  };

  const locals = ['Microbiologia', 'Segregado', 'Laboratório Central', 'Contra-amostra'];

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave({ rows }); }} className="space-y-6">
      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-600">
        <table className="w-full text-sm text-left">
          <thead className="text-[10px] uppercase bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 font-bold">
            <tr>
              <th className="px-3 py-3 w-32">Data</th>
              <th className="px-3 py-3 w-20 text-center">Turno</th>
              <th className="px-3 py-3 w-48">Local</th>
              <th className="px-3 py-3 text-center">Det.</th>
              <th className="px-3 py-3 text-center">Água</th>
              <th className="px-3 py-3 text-center">Álcool</th>
              <th className="px-3 py-3">Observação</th>
              <th className="px-3 py-3">Colaborador</th>
              <th className="px-3 py-3">Resp. Verif.</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {rows.map((row, idx) => (
              <tr key={idx} className="hover:bg-blue-50/30 transition-colors">
                <td className="px-2 py-3">
                  <input 
                    type="date" 
                    value={row.data} 
                    onChange={(e) => updateRow(idx, 'data', e.target.value)} 
                    className="w-full p-1.5 border rounded text-xs"
                  />
                </td>
                <td className="px-2 py-3">
                  <select 
                    value={row.turno} 
                    onChange={(e) => updateRow(idx, 'turno', e.target.value)} 
                    className="w-full p-1.5 border rounded text-xs font-bold"
                  >
                    <option value="1">I</option>
                    <option value="2">II</option>
                    <option value="3">III</option>
                  </select>
                </td>
                <td className="px-2 py-3">
                  <select 
                    value={row.local} 
                    onChange={(e) => updateRow(idx, 'local', e.target.value)} 
                    className="w-full p-1.5 border rounded text-xs"
                  >
                    {locals.map(loc => <option key={loc} value={loc}>{loc}</option>)}
                  </select>
                </td>
                <td className="px-2 py-3 text-center">
                  <input 
                    type="checkbox" 
                    checked={row.detergente} 
                    onChange={(e) => updateRow(idx, 'detergente', e.target.checked)} 
                    className="w-4 h-4 text-blue-600 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500"
                  />
                </td>
                <td className="px-2 py-3 text-center">
                  <input 
                    type="checkbox" 
                    checked={row.agua} 
                    onChange={(e) => updateRow(idx, 'agua', e.target.checked)} 
                    className="w-4 h-4 text-blue-600 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500"
                  />
                </td>
                <td className="px-2 py-3 text-center">
                  <input 
                    type="checkbox" 
                    checked={row.alcool} 
                    onChange={(e) => updateRow(idx, 'alcool', e.target.checked)} 
                    className="w-4 h-4 text-blue-600 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500"
                  />
                </td>
                <td className="px-2 py-3">
                  <input 
                    placeholder="Obs." 
                    value={row.observacao} 
                    onChange={(e) => updateRow(idx, 'observacao', e.target.value)} 
                    className="w-full p-1.5 border rounded text-xs"
                  />
                </td>
                <td className="px-2 py-3">
                  <input 
                    placeholder="Colaborador" 
                    value={row.colaborador} 
                    onChange={(e) => updateRow(idx, 'colaborador', e.target.value)} 
                    className="w-full p-1.5 border rounded text-xs uppercase"
                  />
                </td>
                <td className="px-2 py-3">
                  <input 
                    placeholder="Resp." 
                    value={row.responsavelVerificacao} 
                    onChange={(e) => updateRow(idx, 'responsavelVerificacao', e.target.value)} 
                    className="w-full p-1.5 border rounded text-xs uppercase"
                  />
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
              <span className="text-[10px] font-black text-blue-800 uppercase tracking-widest">{row.local}</span>
              <span className="text-[9px] font-bold text-gray-400 uppercase">Turno {row.turno}</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[8px] font-bold text-gray-400 uppercase">Data</label>
                <input type="date" value={row.data} onChange={(e) => updateRow(idx, 'data', e.target.value)} className="w-full p-2 border rounded-xl text-[10px]" />
              </div>
              <div className="space-y-1">
                <label className="text-[8px] font-bold text-gray-400 uppercase">Local</label>
                <select value={row.local} onChange={(e) => updateRow(idx, 'local', e.target.value)} className="w-full p-2 border rounded-xl text-[10px]">
                  {locals.map(loc => <option key={loc} value={loc}>{loc}</option>)}
                </select>
              </div>
            </div>
            <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-900/50 p-3 rounded-xl">
              <div className="flex flex-col items-center gap-1">
                <label className="text-[8px] font-bold text-gray-400 uppercase">Det.</label>
                <input type="checkbox" checked={row.detergente} onChange={(e) => updateRow(idx, 'detergente', e.target.checked)} className="w-5 h-5 text-blue-600 border-gray-300 dark:border-gray-600 rounded" />
              </div>
              <div className="flex flex-col items-center gap-1">
                <label className="text-[8px] font-bold text-gray-400 uppercase">Água</label>
                <input type="checkbox" checked={row.agua} onChange={(e) => updateRow(idx, 'agua', e.target.checked)} className="w-5 h-5 text-blue-600 border-gray-300 dark:border-gray-600 rounded" />
              </div>
              <div className="flex flex-col items-center gap-1">
                <label className="text-[8px] font-bold text-gray-400 uppercase">Álcool</label>
                <input type="checkbox" checked={row.alcool} onChange={(e) => updateRow(idx, 'alcool', e.target.checked)} className="w-5 h-5 text-blue-600 border-gray-300 dark:border-gray-600 rounded" />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[8px] font-bold text-gray-400 uppercase">Observação</label>
              <input placeholder="Obs." value={row.observacao} onChange={(e) => updateRow(idx, 'observacao', e.target.value)} className="w-full p-2 border rounded-xl text-[10px]" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[8px] font-bold text-gray-400 uppercase">Colaborador</label>
                <input placeholder="Colaborador" value={row.colaborador} onChange={(e) => updateRow(idx, 'colaborador', e.target.value)} className="w-full p-2 border rounded-xl text-[10px] uppercase" />
              </div>
              <div className="space-y-1">
                <label className="text-[8px] font-bold text-gray-400 uppercase">Resp. Verif.</label>
                <input placeholder="Resp." value={row.responsavelVerificacao} onChange={(e) => updateRow(idx, 'responsavelVerificacao', e.target.value)} className="w-full p-2 border rounded-xl text-[10px] uppercase" />
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
        Adicionar Novo Registro de Limpeza
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

export default LabCleaningForm;
