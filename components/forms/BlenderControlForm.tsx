
import React, { useState } from 'react';

interface BlenderControlEntry {
  noTanque: string;
  seqTanque: string;
  horaInicio: string;
  horaFim: string;
  volume: string;
  horaLibLab: string;
  horaLibUtil: string;
  brix: string;
  acAscorbicoKg: string;
  acAscorbicoSim: boolean;
}

interface BlenderControlFormProps {
  onSave: (data: any) => void;
  isSubmitting: boolean;
  initialData?: any;
}

const BlenderControlForm: React.FC<BlenderControlFormProps> = ({ onSave, isSubmitting, initialData }) => {
  const [header, setHeader] = useState(initialData?.[0] ? {
    data: initialData[0].data,
    operador: initialData[0].operador,
    evaporador: initialData[0].evaporador
  } : {
    data: new Date().toISOString().split('T')[0],
    operador: '',
    evaporador: 'A'
  });

  const [entries, setEntries] = useState<BlenderControlEntry[]>(initialData || [{
    noTanque: '', seqTanque: '', horaInicio: '', horaFim: '', volume: '',
    horaLibLab: '', horaLibUtil: '', brix: '', acAscorbicoKg: '', acAscorbicoSim: true
  }]);

  const updateEntry = (idx: number, field: keyof BlenderControlEntry, value: any) => {
    const newEntries = [...entries];
    (newEntries[idx] as any)[field] = value;
    setEntries(newEntries);
  };

  // Fix: Renamed addEntry to addRow to resolve the 'Cannot find name addRow' error at line 177
  const addRow = () => setEntries([...entries, {
    noTanque: '', seqTanque: '', horaInicio: '', horaFim: '', volume: '',
    horaLibLab: '', horaLibUtil: '', brix: '', acAscorbicoKg: '', acAscorbicoSim: true
  }]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const dataToSave = entries.map(item => ({
      ...header,
      ...item
    }));
    onSave(dataToSave);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-orange-50 p-6 rounded-3xl border border-orange-100 flex flex-wrap gap-6 items-end">
        <div className="flex-1 min-w-[200px]">
          <label className="text-xs font-black text-orange-700 uppercase block mb-2 tracking-widest">Data</label>
          <input 
            type="date" 
            className="w-full p-3 border border-orange-200 rounded-xl outline-none focus:ring-2 focus:ring-orange-400 bg-white dark:bg-gray-800" 
            value={header.data}
            onChange={e => setHeader({...header, data: e.target.value})}
          />
        </div>
        <div className="flex-1 min-w-[200px]">
          <label className="text-xs font-black text-orange-700 uppercase block mb-2 tracking-widest">Operador / Turno</label>
          <input 
            type="text" 
            className="w-full p-3 border border-orange-200 rounded-xl outline-none focus:ring-2 focus:ring-orange-400 bg-white dark:bg-gray-800 font-medium" 
            placeholder="Nome do operador"
            value={header.operador}
            onChange={e => setHeader({...header, operador: e.target.value})}
          />
        </div>
        <div className="flex-1 min-w-[200px]">
           <label className="text-xs font-black text-orange-700 uppercase block mb-2 tracking-widest">Evaporador</label>
           <div className="flex gap-2 p-1.5 bg-white dark:bg-gray-800 border border-orange-200 rounded-2xl shadow-inner">
              {['A', 'B'].map(opt => (
                  <button 
                    type="button" 
                    key={opt} 
                    onClick={() => setHeader(prev => ({ ...prev, evaporador: opt }))}
                    className={`flex-1 py-2.5 font-black text-xs rounded-xl transition-all duration-200 ${
                      header.evaporador === opt 
                      ? 'bg-orange-600 text-white shadow-lg scale-[1.02]' 
                      : 'text-gray-400 hover:bg-orange-50 hover:text-orange-600'
                    }`}
                  >
                    {opt}
                  </button>
              ))}
           </div>
        </div>
      </div>

         {/* Entries Grid */}
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           {entries.map((item, idx) => (
             <div key={idx} className="border border-gray-100 dark:border-gray-700 rounded-[2rem] md:rounded-[2.5rem] p-4 md:p-8 bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
                <div className={`absolute top-0 left-0 w-2 h-full ${header.evaporador === 'A' ? 'bg-orange-600' : 'bg-orange-800'}`}></div>
                
                <div className="flex justify-between items-center border-b border-gray-50 pb-4 mb-6">
                   <div className="flex items-center gap-3">
                     <div className="bg-orange-600 text-white px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-tighter shadow-md">TANQUE</div>
                     <input 
                       value={item.noTanque} 
                       onChange={(e) => updateEntry(idx, 'noTanque', e.target.value)} 
                       className="w-20 border-b-2 border-orange-100 outline-none text-center font-black text-lg focus:border-orange-500 text-gray-800 dark:text-gray-100" 
                       placeholder="Ex: T-01" 
                     />
                   </div>
                   <button type="button" onClick={() => setEntries(entries.filter((_, i) => i !== idx))} className="text-gray-300 hover:text-red-500 transition-colors">
                     <i className="fas fa-times-circle text-lg"></i>
                   </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                   <div className="space-y-6">
                      <div>
                         <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-2">ENCHIMENTO (I / F)</label>
                         <div className="flex gap-2">
                            <input type="time" value={item.horaInicio} onChange={(e) => updateEntry(idx, 'horaInicio', e.target.value)} className="flex-1 min-w-0 p-2 border border-gray-100 dark:border-gray-700 rounded-xl text-[10px] font-bold text-center bg-gray-50 dark:bg-gray-900/50 focus:bg-white dark:bg-gray-800" />
                            <input type="time" value={item.horaFim} onChange={(e) => updateEntry(idx, 'horaFim', e.target.value)} className="flex-1 min-w-0 p-2 border border-gray-100 dark:border-gray-700 rounded-xl text-[10px] font-bold text-center bg-gray-50 dark:bg-gray-900/50 focus:bg-white dark:bg-gray-800" />
                         </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                         <div className="space-y-1">
                           <label className="text-[9px] font-black text-gray-400 block uppercase">Volume (L)</label>
                           <input type="number" value={item.volume} onChange={(e) => updateEntry(idx, 'volume', e.target.value)} className="w-full p-2 border border-gray-100 dark:border-gray-700 rounded-xl text-center font-bold text-xs" />
                         </div>
                         <div className="space-y-1">
                           <label className="text-[9px] font-black text-gray-400 block uppercase">ºBrix</label>
                           <input type="number" step="0.1" value={item.brix} onChange={(e) => updateEntry(idx, 'brix', e.target.value)} className="w-full p-2 border border-gray-100 dark:border-gray-700 rounded-xl text-center font-bold text-orange-600 text-xs" />
                         </div>
                      </div>
                   </div>

                   <div className="space-y-6">
                      <div>
                         <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-2">LIBERAÇÃO (LAB / UTIL)</label>
                         <div className="flex gap-2">
                            <input type="time" value={item.horaLibLab} onChange={(e) => updateEntry(idx, 'horaLibLab', e.target.value)} className="flex-1 min-w-0 p-2 border border-gray-100 dark:border-gray-700 rounded-xl text-[10px] font-bold text-center bg-gray-50 dark:bg-gray-900/50 focus:bg-white dark:bg-gray-800" />
                            <input type="time" value={item.horaLibUtil} onChange={(e) => updateEntry(idx, 'horaLibUtil', e.target.value)} className="flex-1 min-w-0 p-2 border border-gray-100 dark:border-gray-700 rounded-xl text-[10px] font-bold text-center bg-gray-50 dark:bg-gray-900/50 focus:bg-white dark:bg-gray-800" />
                         </div>
                      </div>
                      <div className="space-y-2">
                         <label className="text-[9px] font-black text-gray-400 block uppercase tracking-widest">Ác. Ascórbico</label>
                         <div className="flex gap-2">
                           <input 
                             type="number" 
                             step="0.01" 
                             value={item.acAscorbicoKg} 
                             onChange={(e) => updateEntry(idx, 'acAscorbicoKg', e.target.value)} 
                             className="flex-1 min-w-0 p-2 border border-gray-100 dark:border-gray-700 rounded-xl text-center text-[10px]" 
                             placeholder="Kg"
                           />
                           <button 
                             type="button" 
                             onClick={() => updateEntry(idx, 'acAscorbicoSim', !item.acAscorbicoSim)}
                             className={`px-4 py-2 rounded-xl text-[9px] font-black border transition-all shrink-0 ${item.acAscorbicoSim ? 'bg-green-600 border-green-700 text-white shadow-md' : 'bg-red-50 text-red-400 border-red-100'}`}
                           >
                              {item.acAscorbicoSim ? 'OK' : 'Ñ'}
                           </button>
                         </div>
                      </div>
                   </div>
                </div>
             </div>
           ))}
         </div>

      <button type="button" onClick={addRow} className="w-full py-5 border-2 border-dashed border-orange-200 rounded-[2rem] text-orange-400 font-black text-[10px] uppercase tracking-[0.3em] hover:bg-orange-50 hover:border-orange-300 transition-all flex items-center justify-center gap-3 group">
        <i className="fas fa-plus-circle text-xl group-hover:scale-110 transition-transform"></i>
        Novo Registro de Tanque
      </button>

      <div className="pt-8 border-t border-gray-100 dark:border-gray-700 flex justify-end">
        <button disabled={isSubmitting} className="px-14 py-4 bg-orange-600 hover:bg-orange-700 text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-orange-100 transition-all flex items-center gap-2 disabled:opacity-50">
          {isSubmitting ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-floppy-disk text-lg"></i>}
          <span>{initialData ? 'Sincronizar Edição' : 'Salvar Registro de Controle'}</span>
        </button>
      </div>
    </form>
  );
};

export default BlenderControlForm;
