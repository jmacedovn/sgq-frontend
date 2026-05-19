
import React, { useState } from 'react';

interface RowData {
  data: string;
  t1_hora1: string;
  t1_func1: string;
  t1_visto1: string;
  t1_hora2: string;
  t1_func2: string;
  t1_visto2: string;
  t2_hora1: string;
  t2_func1: string;
  t2_visto1: string;
  t2_hora2: string;
  t2_func2: string;
  t2_visto2: string;
  t3_hora1: string;
  t3_func1: string;
  t3_visto1: string;
  t3_hora2: string;
  t3_func2: string;
  t3_visto2: string;
}

interface OzoneMonitoringFormProps {
  onSave: (data: any) => void;
  isSubmitting: boolean;
  initialData?: any;
}

const OzoneMonitoringForm: React.FC<OzoneMonitoringFormProps> = ({ onSave, isSubmitting, initialData }) => {
  const [rows, setRows] = useState<RowData[]>(initialData?.rows || [
    { 
      data: new Date().toISOString().split('T')[0], 
      t1_hora1: '08:00', t1_func1: 'OK', t1_visto1: '',
      t1_hora2: '12:00', t1_func2: 'OK', t1_visto2: '',
      t2_hora1: '16:00', t2_func1: 'OK', t2_visto1: '',
      t2_hora2: '20:00', t2_func2: 'OK', t2_visto2: '',
      t3_hora1: '00:00', t3_func1: 'OK', t3_visto1: '',
      t3_hora2: '04:00', t3_func2: 'OK', t3_visto2: ''
    }
  ]);

  const addRow = () => {
    setRows([...rows, { 
      data: new Date().toISOString().split('T')[0], 
      t1_hora1: '08:00', t1_func1: 'OK', t1_visto1: '',
      t1_hora2: '12:00', t1_func2: 'OK', t1_visto2: '',
      t2_hora1: '16:00', t2_func1: 'OK', t2_visto1: '',
      t2_hora2: '20:00', t2_func2: 'OK', t2_visto2: '',
      t3_hora1: '00:00', t3_func1: 'OK', t3_visto1: '',
      t3_hora2: '04:00', t3_func2: 'OK', t3_visto2: ''
    }]);
  };

  const updateRow = (index: number, field: keyof RowData, value: string) => {
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
              <th rowSpan={2} className="px-3 py-3 border-r border-b w-32">Data</th>
              <th colSpan={3} className="px-3 py-2 border-r border-b text-center bg-blue-50">Turno 1</th>
              <th colSpan={3} className="px-3 py-2 border-r border-b text-center bg-emerald-50">Turno 2</th>
              <th colSpan={3} className="px-3 py-2 border-b text-center bg-amber-50">Turno 3</th>
            </tr>
            <tr>
              <th className="px-2 py-2 border-r border-b text-center">Hora</th>
              <th className="px-2 py-2 border-r border-b text-center">Func.</th>
              <th className="px-2 py-2 border-r border-b text-center">Visto</th>
              <th className="px-2 py-2 border-r border-b text-center">Hora</th>
              <th className="px-2 py-2 border-r border-b text-center">Func.</th>
              <th className="px-2 py-2 border-r border-b text-center">Visto</th>
              <th className="px-2 py-2 border-r border-b text-center">Hora</th>
              <th className="px-2 py-2 border-r border-b text-center">Func.</th>
              <th className="px-2 py-2 border-b text-center">Visto</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {rows.map((row, idx) => (
              <React.Fragment key={idx}>
                <tr className="hover:bg-gray-50 dark:bg-gray-900/50 transition-colors">
                  <td rowSpan={2} className="px-2 py-3 border-r align-middle">
                    <input 
                      type="date" 
                      value={row.data} 
                      onChange={(e) => updateRow(idx, 'data', e.target.value)} 
                      className="w-full p-1.5 border rounded text-xs"
                    />
                  </td>
                  {/* Turno 1 - Linha 1 */}
                  <td className="px-1 py-2 border-r"><input type="time" value={row.t1_hora1} onChange={(e) => updateRow(idx, 't1_hora1', e.target.value)} className="w-full p-1 border rounded text-[10px] text-center" /></td>
                  <td className="px-1 py-2 border-r"><select value={row.t1_func1} onChange={(e) => updateRow(idx, 't1_func1', e.target.value)} className="w-full p-1 border rounded text-[10px] font-bold text-center"><option value="OK">OK</option><option value="N/OK">N/OK</option><option value="-">-</option></select></td>
                  <td className="px-1 py-2 border-r"><input placeholder="Visto" value={row.t1_visto1} onChange={(e) => updateRow(idx, 't1_visto1', e.target.value)} className="w-full p-1 border rounded text-[10px] uppercase" /></td>
                  {/* Turno 2 - Linha 1 */}
                  <td className="px-1 py-2 border-r"><input type="time" value={row.t2_hora1} onChange={(e) => updateRow(idx, 't2_hora1', e.target.value)} className="w-full p-1 border rounded text-[10px] text-center" /></td>
                  <td className="px-1 py-2 border-r"><select value={row.t2_func1} onChange={(e) => updateRow(idx, 't2_func1', e.target.value)} className="w-full p-1 border rounded text-[10px] font-bold text-center"><option value="OK">OK</option><option value="N/OK">N/OK</option><option value="-">-</option></select></td>
                  <td className="px-1 py-2 border-r"><input placeholder="Visto" value={row.t2_visto1} onChange={(e) => updateRow(idx, 't2_visto1', e.target.value)} className="w-full p-1 border rounded text-[10px] uppercase" /></td>
                  {/* Turno 3 - Linha 1 */}
                  <td className="px-1 py-2 border-r"><input type="time" value={row.t3_hora1} onChange={(e) => updateRow(idx, 't3_hora1', e.target.value)} className="w-full p-1 border rounded text-[10px] text-center" /></td>
                  <td className="px-1 py-2 border-r"><select value={row.t3_func1} onChange={(e) => updateRow(idx, 't3_func1', e.target.value)} className="w-full p-1 border rounded text-[10px] font-bold text-center"><option value="OK">OK</option><option value="N/OK">N/OK</option><option value="-">-</option></select></td>
                  <td className="px-1 py-2"><input placeholder="Visto" value={row.t3_visto1} onChange={(e) => updateRow(idx, 't3_visto1', e.target.value)} className="w-full p-1 border rounded text-[10px] uppercase" /></td>
                </tr>
                <tr className="hover:bg-gray-50 dark:bg-gray-900/50 transition-colors border-b">
                  {/* Turno 1 - Linha 2 */}
                  <td className="px-1 py-2 border-r"><input type="time" value={row.t1_hora2} onChange={(e) => updateRow(idx, 't1_hora2', e.target.value)} className="w-full p-1 border rounded text-[10px] text-center" /></td>
                  <td className="px-1 py-2 border-r"><select value={row.t1_func2} onChange={(e) => updateRow(idx, 't1_func2', e.target.value)} className="w-full p-1 border rounded text-[10px] font-bold text-center"><option value="OK">OK</option><option value="N/OK">N/OK</option><option value="-">-</option></select></td>
                  <td className="px-1 py-2 border-r"><input placeholder="Visto" value={row.t1_visto2} onChange={(e) => updateRow(idx, 't1_visto2', e.target.value)} className="w-full p-1 border rounded text-[10px] uppercase" /></td>
                  {/* Turno 2 - Linha 2 */}
                  <td className="px-1 py-2 border-r"><input type="time" value={row.t2_hora2} onChange={(e) => updateRow(idx, 't2_hora2', e.target.value)} className="w-full p-1 border rounded text-[10px] text-center" /></td>
                  <td className="px-1 py-2 border-r"><select value={row.t2_func2} onChange={(e) => updateRow(idx, 't2_func2', e.target.value)} className="w-full p-1 border rounded text-[10px] font-bold text-center"><option value="OK">OK</option><option value="N/OK">N/OK</option><option value="-">-</option></select></td>
                  <td className="px-1 py-2 border-r"><input placeholder="Visto" value={row.t2_visto2} onChange={(e) => updateRow(idx, 't2_visto2', e.target.value)} className="w-full p-1 border rounded text-[10px] uppercase" /></td>
                  {/* Turno 3 - Linha 2 */}
                  <td className="px-1 py-2 border-r"><input type="time" value={row.t3_hora2} onChange={(e) => updateRow(idx, 't3_hora2', e.target.value)} className="w-full p-1 border rounded text-[10px] text-center" /></td>
                  <td className="px-1 py-2 border-r"><select value={row.t3_func2} onChange={(e) => updateRow(idx, 't3_func2', e.target.value)} className="w-full p-1 border rounded text-[10px] font-bold text-center"><option value="OK">OK</option><option value="N/OK">N/OK</option><option value="-">-</option></select></td>
                  <td className="px-1 py-2"><input placeholder="Visto" value={row.t3_visto2} onChange={(e) => updateRow(idx, 't3_visto2', e.target.value)} className="w-full p-1 border rounded text-[10px] uppercase" /></td>
                </tr>
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {rows.map((row, idx) => (
          <div key={idx} className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-200 dark:border-gray-600 shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
              <span className="text-[10px] font-black text-blue-800 uppercase tracking-widest">Monitoramento de Ozônio</span>
              <input 
                type="date" 
                value={row.data} 
                onChange={(e) => updateRow(idx, 'data', e.target.value)} 
                className="p-1 border rounded text-[10px] font-bold"
              />
            </div>
            
            {[1, 2, 3].map(turno => (
              <div key={turno} className={`p-3 rounded-xl border ${turno === 1 ? 'bg-blue-50 border-blue-100' : turno === 2 ? 'bg-emerald-50 border-emerald-100' : 'bg-amber-50 border-amber-100'} space-y-3`}>
                <span className={`text-[9px] font-black uppercase tracking-widest ${turno === 1 ? 'text-blue-700' : turno === 2 ? 'text-emerald-700' : 'text-amber-700'}`}>Turno {turno}</span>
                
                <div className="grid grid-cols-1 gap-3">
                  {[1, 2].map(leitura => {
                    const horaKey = `t${turno}_hora${leitura}` as keyof RowData;
                    const funcKey = `t${turno}_func${leitura}` as keyof RowData;
                    const vistoKey = `t${turno}_visto${leitura}` as keyof RowData;
                    
                    return (
                      <div key={leitura} className="grid grid-cols-3 gap-2 items-end">
                        <div className="space-y-1">
                          <label className="text-[8px] font-bold text-gray-400 uppercase">Hora {leitura}</label>
                          <input type="time" value={row[horaKey]} onChange={(e) => updateRow(idx, horaKey, e.target.value)} className="w-full p-1.5 border rounded-lg text-[10px] text-center bg-white dark:bg-gray-800" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[8px] font-bold text-gray-400 uppercase">Func.</label>
                          <select value={row[funcKey]} onChange={(e) => updateRow(idx, funcKey, e.target.value)} className="w-full p-1.5 border rounded-lg text-[10px] font-bold text-center bg-white dark:bg-gray-800">
                            <option value="OK">OK</option>
                            <option value="N/OK">N/OK</option>
                            <option value="-">-</option>
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[8px] font-bold text-gray-400 uppercase">Visto</label>
                          <input placeholder="Visto" value={row[vistoKey]} onChange={(e) => updateRow(idx, vistoKey, e.target.value)} className="w-full p-1.5 border rounded-lg text-[10px] uppercase bg-white dark:bg-gray-800" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>

      <button 
        type="button" 
        onClick={addRow}
        className="w-full py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl text-gray-500 font-bold hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50 transition-all flex items-center justify-center gap-2"
      >
        <i className="fas fa-plus"></i>
        Adicionar Nova Data
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

export default OzoneMonitoringForm;
