
import React, { useState } from 'react';

interface RowData {
  data: string;
  turno: string;
  entradaProducao: string;
  entradaAssepticoA: string;
  entradaAssepticoC: string;
  entradaAssepticoD: string;
  saidaEvaporadorB: string;
  saidaTambores: string;
  higienizacaoTambores: string;
  visto: string;
}

interface AirCurtainInspectionFormProps {
  onSave: (data: any) => void;
  isSubmitting: boolean;
  initialData?: any;
}

const AirCurtainInspectionForm: React.FC<AirCurtainInspectionFormProps> = ({ onSave, isSubmitting, initialData }) => {
  const [rows, setRows] = useState<RowData[]>(initialData?.rows || [
    { 
      data: new Date().toISOString().split('T')[0], 
      turno: '1', 
      entradaProducao: 'OK', 
      entradaAssepticoA: 'OK', 
      entradaAssepticoC: 'OK', 
      entradaAssepticoD: 'OK', 
      saidaEvaporadorB: 'OK', 
      saidaTambores: 'OK', 
      higienizacaoTambores: 'OK', 
      visto: '' 
    }
  ]);

  const addRow = () => {
    setRows([...rows, { 
      data: new Date().toISOString().split('T')[0], 
      turno: '1', 
      entradaProducao: 'OK', 
      entradaAssepticoA: 'OK', 
      entradaAssepticoC: 'OK', 
      entradaAssepticoD: 'OK', 
      saidaEvaporadorB: 'OK', 
      saidaTambores: 'OK', 
      higienizacaoTambores: 'OK', 
      visto: '' 
    }]);
  };

  const updateRow = (index: number, field: keyof RowData, value: string) => {
    const newRows = [...rows];
    newRows[index] = { ...newRows[index], [field]: value };
    setRows(newRows);
  };

  const statusOptions = ['OK', 'N/OK', 'N/A'];

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave({ rows }); }} className="space-y-6">
      <div className="hidden md:block overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-600">
        <table className="w-full text-sm text-left">
          <thead className="text-[10px] uppercase bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 font-bold">
            <tr>
              <th className="px-3 py-3 w-32">Data</th>
              <th className="px-3 py-3 w-20 text-center">Turno</th>
              <th className="px-3 py-3 text-center">Entrada Produção</th>
              <th className="px-3 py-3 text-center">Entrada Asséptico A</th>
              <th className="px-3 py-3 text-center">Entrada Asséptico C</th>
              <th className="px-3 py-3 text-center">Entrada Asséptico D</th>
              <th className="px-3 py-3 text-center">Saída Evap. B</th>
              <th className="px-3 py-3 text-center">Saída Tambores</th>
              <th className="px-3 py-3 text-center">Hig. Tambores</th>
              <th className="px-3 py-3 w-32">Visto</th>
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
                {[
                  'entradaProducao', 'entradaAssepticoA', 'entradaAssepticoC', 
                  'entradaAssepticoD', 'saidaEvaporadorB', 'saidaTambores', 'higienizacaoTambores'
                ].map((field) => (
                  <td key={field} className="px-2 py-3 text-center">
                    <select 
                      value={(row as any)[field]} 
                      onChange={(e) => updateRow(idx, field as keyof RowData, e.target.value)} 
                      className={`w-full p-1 border rounded text-[10px] font-black text-center ${(row as any)[field] === 'OK' ? 'text-green-600' : 'text-red-600'}`}
                    >
                      {statusOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  </td>
                ))}
                <td className="px-2 py-3">
                  <input 
                    placeholder="Visto" 
                    value={row.visto} 
                    onChange={(e) => updateRow(idx, 'visto', e.target.value)} 
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
              <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Inspeção #{idx + 1}</span>
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
                <input 
                  type="date" 
                  value={row.data} 
                  onChange={(e) => updateRow(idx, 'data', e.target.value)} 
                  className="w-full p-2 border rounded-xl text-xs"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Turno</label>
                <select 
                  value={row.turno} 
                  onChange={(e) => updateRow(idx, 'turno', e.target.value)} 
                  className="w-full p-2 border rounded-xl text-xs font-bold"
                >
                  <option value="1">I</option>
                  <option value="2">II</option>
                  <option value="3">III</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 bg-gray-50 dark:bg-gray-900/50 p-3 rounded-xl">
              {[
                { field: 'entradaProducao', label: 'Entrada Produção' },
                { field: 'entradaAssepticoA', label: 'Entrada Asséptico A' },
                { field: 'entradaAssepticoC', label: 'Entrada Asséptico C' },
                { field: 'entradaAssepticoD', label: 'Entrada Asséptico D' },
                { field: 'saidaEvaporadorB', label: 'Saída Evap. B' },
                { field: 'saidaTambores', label: 'Saída Tambores' },
                { field: 'higienizacaoTambores', label: 'Hig. Tambores' }
              ].map((item) => (
                <div key={item.field} className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-gray-600 dark:text-gray-300 uppercase">{item.label}</span>
                  <select 
                    value={(row as any)[item.field]} 
                    onChange={(e) => updateRow(idx, item.field as keyof RowData, e.target.value)} 
                    className={`p-1 border rounded text-[10px] font-black text-center w-24 ${(row as any)[item.field] === 'OK' ? 'text-green-600' : 'text-red-600'}`}
                  >
                    {statusOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                </div>
              ))}
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Visto</label>
              <input 
                placeholder="Visto" 
                value={row.visto} 
                onChange={(e) => updateRow(idx, 'visto', e.target.value)} 
                className="w-full p-2 border rounded-xl text-xs uppercase"
              />
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
        Adicionar Nova Inspeção
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

export default AirCurtainInspectionForm;
