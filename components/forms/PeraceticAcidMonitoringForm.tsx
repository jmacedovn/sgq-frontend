
import React, { useState } from 'react';

interface ShiftData {
  hora: string;
  resultado: string;
  visto: string;
}

interface RowData {
  data: string;
  t1: ShiftData[];
  t2: ShiftData[];
  t3: ShiftData[];
}

interface PeraceticAcidMonitoringFormProps {
  onSave: (data: any) => void;
  isSubmitting: boolean;
  initialData?: any;
}

const PeraceticAcidMonitoringForm: React.FC<PeraceticAcidMonitoringFormProps> = ({ onSave, isSubmitting, initialData }) => {
  const defaultShift = () => [
    { hora: '', resultado: '', visto: '' },
    { hora: '', resultado: '', visto: '' },
    { hora: '', resultado: '', visto: '' }
  ];

  const [rows, setRows] = useState<RowData[]>(initialData?.rows || [
    { 
      data: new Date().toISOString().split('T')[0], 
      t1: [
        { hora: '08:00', resultado: '0.15', visto: '' },
        { hora: '11:00', resultado: '0.15', visto: '' },
        { hora: '14:00', resultado: '0.15', visto: '' }
      ],
      t2: [
        { hora: '16:00', resultado: '0.15', visto: '' },
        { hora: '19:00', resultado: '0.15', visto: '' },
        { hora: '22:00', resultado: '0.15', visto: '' }
      ],
      t3: [
        { hora: '00:00', resultado: '0.15', visto: '' },
        { hora: '03:00', resultado: '0.15', visto: '' },
        { hora: '06:00', resultado: '0.15', visto: '' }
      ]
    }
  ]);

  const addRow = () => {
    setRows([...rows, { 
      data: new Date().toISOString().split('T')[0], 
      t1: [
        { hora: '08:00', resultado: '0.15', visto: '' },
        { hora: '11:00', resultado: '0.15', visto: '' },
        { hora: '14:00', resultado: '0.15', visto: '' }
      ],
      t2: [
        { hora: '16:00', resultado: '0.15', visto: '' },
        { hora: '19:00', resultado: '0.15', visto: '' },
        { hora: '22:00', resultado: '0.15', visto: '' }
      ],
      t3: [
        { hora: '00:00', resultado: '0.15', visto: '' },
        { hora: '03:00', resultado: '0.15', visto: '' },
        { hora: '06:00', resultado: '0.15', visto: '' }
      ]
    }]);
  };

  const updateShift = (rowIdx: number, shift: 't1' | 't2' | 't3', shiftIdx: number, field: keyof ShiftData, value: string) => {
    const newRows = [...rows];
    newRows[rowIdx][shift][shiftIdx] = { ...newRows[rowIdx][shift][shiftIdx], [field]: value };
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
              <th className="px-2 py-2 border-r border-b text-center">Res. (%)</th>
              <th className="px-2 py-2 border-r border-b text-center">Visto</th>
              <th className="px-2 py-2 border-r border-b text-center">Hora</th>
              <th className="px-2 py-2 border-r border-b text-center">Res. (%)</th>
              <th className="px-2 py-2 border-r border-b text-center">Visto</th>
              <th className="px-2 py-2 border-r border-b text-center">Hora</th>
              <th className="px-2 py-2 border-r border-b text-center">Res. (%)</th>
              <th className="px-2 py-2 border-b text-center">Visto</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {rows.map((row, idx) => (
              <React.Fragment key={idx}>
                {[0, 1, 2].map((shiftIdx) => (
                  <tr key={shiftIdx} className="hover:bg-gray-50 dark:bg-gray-900/50 transition-colors">
                    {shiftIdx === 0 && (
                      <td rowSpan={3} className="px-2 py-3 border-r align-middle border-b">
                        <input 
                          type="date" 
                          value={row.data} 
                          onChange={(e) => {
                            const newRows = [...rows];
                            newRows[idx].data = e.target.value;
                            setRows(newRows);
                          }} 
                          className="w-full p-1.5 border rounded text-xs"
                        />
                      </td>
                    )}
                    {/* Turno 1 */}
                    <td className={`px-1 py-2 border-r ${shiftIdx === 2 ? 'border-b' : ''}`}><input type="time" value={row.t1[shiftIdx].hora} onChange={(e) => updateShift(idx, 't1', shiftIdx, 'hora', e.target.value)} className="w-full p-1 border rounded text-[10px] text-center" /></td>
                    <td className={`px-1 py-2 border-r ${shiftIdx === 2 ? 'border-b' : ''}`}><input placeholder="%" value={row.t1[shiftIdx].resultado} onChange={(e) => updateShift(idx, 't1', shiftIdx, 'resultado', e.target.value)} className="w-full p-1 border rounded text-[10px] text-center font-bold" /></td>
                    <td className={`px-1 py-2 border-r ${shiftIdx === 2 ? 'border-b' : ''}`}><input placeholder="Visto" value={row.t1[shiftIdx].visto} onChange={(e) => updateShift(idx, 't1', shiftIdx, 'visto', e.target.value)} className="w-full p-1 border rounded text-[10px] uppercase" /></td>
                    {/* Turno 2 */}
                    <td className={`px-1 py-2 border-r ${shiftIdx === 2 ? 'border-b' : ''}`}><input type="time" value={row.t2[shiftIdx].hora} onChange={(e) => updateShift(idx, 't2', shiftIdx, 'hora', e.target.value)} className="w-full p-1 border rounded text-[10px] text-center" /></td>
                    <td className={`px-1 py-2 border-r ${shiftIdx === 2 ? 'border-b' : ''}`}><input placeholder="%" value={row.t2[shiftIdx].resultado} onChange={(e) => updateShift(idx, 't2', shiftIdx, 'resultado', e.target.value)} className="w-full p-1 border rounded text-[10px] text-center font-bold" /></td>
                    <td className={`px-1 py-2 border-r ${shiftIdx === 2 ? 'border-b' : ''}`}><input placeholder="Visto" value={row.t2[shiftIdx].visto} onChange={(e) => updateShift(idx, 't2', shiftIdx, 'visto', e.target.value)} className="w-full p-1 border rounded text-[10px] uppercase" /></td>
                    {/* Turno 3 */}
                    <td className={`px-1 py-2 border-r ${shiftIdx === 2 ? 'border-b' : ''}`}><input type="time" value={row.t3[shiftIdx].hora} onChange={(e) => updateShift(idx, 't3', shiftIdx, 'hora', e.target.value)} className="w-full p-1 border rounded text-[10px] text-center" /></td>
                    <td className={`px-1 py-2 border-r ${shiftIdx === 2 ? 'border-b' : ''}`}><input placeholder="%" value={row.t3[shiftIdx].resultado} onChange={(e) => updateShift(idx, 't3', shiftIdx, 'resultado', e.target.value)} className="w-full p-1 border rounded text-[10px] text-center font-bold" /></td>
                    <td className={`px-1 py-2 ${shiftIdx === 2 ? 'border-b' : ''}`}><input placeholder="Visto" value={row.t3[shiftIdx].visto} onChange={(e) => updateShift(idx, 't3', shiftIdx, 'visto', e.target.value)} className="w-full p-1 border rounded text-[10px] uppercase" /></td>
                  </tr>
                ))}
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
              <span className="text-[10px] font-black text-blue-800 uppercase tracking-widest">Monitoramento de Ácido Peracético</span>
              <input 
                type="date" 
                value={row.data} 
                onChange={(e) => {
                  const newRows = [...rows];
                  newRows[idx].data = e.target.value;
                  setRows(newRows);
                }} 
                className="p-1 border rounded text-[10px] font-bold"
              />
            </div>
            
            {(['t1', 't2', 't3'] as const).map(shiftKey => {
              const turnoLabel = shiftKey === 't1' ? 'Turno 1' : shiftKey === 't2' ? 'Turno 2' : 'Turno 3';
              const bgColor = shiftKey === 't1' ? 'bg-blue-50 border-blue-100' : shiftKey === 't2' ? 'bg-emerald-50 border-emerald-100' : 'bg-amber-50 border-amber-100';
              const textColor = shiftKey === 't1' ? 'text-blue-700' : shiftKey === 't2' ? 'text-emerald-700' : 'text-amber-700';
              
              return (
                <div key={shiftKey} className={`p-3 rounded-xl border ${bgColor} space-y-3`}>
                  <span className={`text-[9px] font-black uppercase tracking-widest ${textColor}`}>{turnoLabel}</span>
                  
                  <div className="space-y-3">
                    {row[shiftKey].map((shiftData, shiftIdx) => (
                      <div key={shiftIdx} className="grid grid-cols-3 gap-2 items-end">
                        <div className="space-y-1">
                          <label className="text-[8px] font-bold text-gray-400 uppercase">Hora</label>
                          <input type="time" value={shiftData.hora} onChange={(e) => updateShift(idx, shiftKey, shiftIdx, 'hora', e.target.value)} className="w-full p-1.5 border rounded-lg text-[10px] text-center bg-white dark:bg-gray-800" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[8px] font-bold text-gray-400 uppercase">Res. (%)</label>
                          <input placeholder="%" value={shiftData.resultado} onChange={(e) => updateShift(idx, shiftKey, shiftIdx, 'resultado', e.target.value)} className="w-full p-1.5 border rounded-lg text-[10px] font-bold text-center bg-white dark:bg-gray-800" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[8px] font-bold text-gray-400 uppercase">Visto</label>
                          <input placeholder="Visto" value={shiftData.visto} onChange={(e) => updateShift(idx, shiftKey, shiftIdx, 'visto', e.target.value)} className="w-full p-1.5 border rounded-lg text-[10px] uppercase bg-white dark:bg-gray-800" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
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

export default PeraceticAcidMonitoringForm;
