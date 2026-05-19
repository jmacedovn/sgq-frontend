
import React, { useState } from 'react';

interface MonitoringEntry {
  horario: string;
  decanter1: string;
  decanter2: string;
  centrifuga1: string;
  centrifuga2: string;
  finisher1: string;
  finisher2: string;
  blender: string;
  visto: string;
}

const PineapplePulpForm: React.FC<{ onSave: (data: any) => void, isSubmitting: boolean, initialData?: any }> = ({ onSave, isSubmitting, initialData }) => {
  const [header, setHeader] = useState(initialData?.[0] ? {
    data: initialData[0].data,
    verificador: initialData[0].verificador
  } : {
    data: new Date().toISOString().split('T')[0],
    verificador: ''
  });

  const [data, setData] = useState<MonitoringEntry[]>(initialData || Array(4).fill(null).map(() => ({
    horario: '', decanter1: '', decanter2: '', centrifuga1: '', centrifuga2: '', finisher1: '', finisher2: '', blender: '', visto: ''
  })));

  const updateEntry = (idx: number, field: keyof MonitoringEntry, value: string) => {
    const newData = [...data];
    newData[idx] = { ...newData[idx], [field]: value };
    setData(newData);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const dataToSave = data.map(item => ({
      ...header,
      ...item
    }));
    onSave(dataToSave);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-gray-50 dark:bg-gray-900/50 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 flex flex-col md:flex-row gap-6">
        <div className="flex-1">
          <label className="text-sm font-bold text-gray-700 dark:text-gray-200 block mb-2">Data</label>
          <input 
            type="date" 
            className="w-full p-2.5 rounded-lg border outline-none font-bold bg-transparent dark:bg-gray-700 dark:text-white dark:placeholder-gray-400" 
            value={header.data}
            onChange={e => setHeader({...header, data: e.target.value})}
          />
        </div>
        <div className="flex-1">
          <label className="text-sm font-bold text-gray-700 dark:text-gray-200 block mb-2">Verificado por</label>
          <input 
            type="text" 
            className="w-full p-2.5 rounded-lg border outline-none font-bold bg-transparent dark:bg-gray-700 dark:text-white dark:placeholder-gray-400" 
            value={header.verificador}
            onChange={e => setHeader({...header, verificador: e.target.value})}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {data.map((entry, idx) => (
          <div key={idx} className="bg-white dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 p-5 rounded-2xl hover:border-yellow-200 transition-colors shadow-sm">
            <div className="flex items-center justify-between border-b pb-3 mb-4">
              <span className="text-xs font-black text-yellow-600 tracking-tighter uppercase">Leitura #{idx + 1}</span>
              <input type="time" value={entry.horario} onChange={(e) => updateEntry(idx, 'horario', e.target.value)} className="text-sm font-bold bg-gray-50 dark:bg-gray-900/50 px-2 py-1 rounded border focus:border-yellow-400" />
            </div>
            
            <div className="space-y-3">
              {[
                { label: 'Decanter 1', key: 'decanter1' },
                { label: 'Decanter 2', key: 'decanter2' },
                { label: 'Centrífuga 1', key: 'centrifuga1' },
                { label: 'Centrífuga 2', key: 'centrifuga2' },
                { label: 'Finisher 1', key: 'finisher1' },
                { label: 'Finisher 2', key: 'finisher2' },
                { label: 'Blender (%)', key: 'blender' },
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between gap-2">
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-300">{item.label}</span>
                  <input 
                    type="text" 
                    value={(entry as any)[item.key]} 
                    onChange={(e) => updateEntry(idx, item.key as any, e.target.value)} 
                    className="w-16 border rounded p-1 text-xs text-center font-bold" 
                  />
                </div>
              ))}
              <input value={entry.visto} onChange={e => updateEntry(idx, 'visto', e.target.value)} placeholder="Visto" className="w-full p-1.5 border rounded text-[10px] text-center italic" />
            </div>
          </div>
        ))}
      </div>

      <div className="pt-6 border-t flex justify-end">
        <button disabled={isSubmitting} className="px-10 py-3.5 bg-yellow-600 hover:bg-yellow-700 text-white font-bold rounded-xl shadow-lg transition-all flex items-center gap-2">
          {isSubmitting ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-save"></i>}
          <span>{initialData ? 'Sincronizar Edição' : 'Salvar Relatório'}</span>
        </button>
      </div>
    </form>
  );
};

export default PineapplePulpForm;
