
import React, { useState } from 'react';
import { useFruits } from '../../lib/useFruits';

interface BlenderEntry {
  noTanque: string;
  seqTanque: string;
  brix: string;
  ph: string;
  phCorrigido: string;
  acidez: string;
  pontosMarrons: string;
  pontosPretos: string;
  cor: string;
  vitaminaC: string;
  liberacaoH: string;
  visto: string;
  observacoes: string;
}

const BlenderReleaseForm: React.FC<{ onSave: (data: any) => void, isSubmitting: boolean, initialData?: any }> = ({ onSave, isSubmitting, initialData }) => {
  const { fruits } = useFruits();
  const [header, setHeader] = useState(initialData?.[0] ? {
    data: initialData[0].data || new Date().toISOString().split('T')[0],
    fruta: initialData[0].fruta || 'MANGA',
    frutaOutros: initialData[0].frutaOutros || '',
    processo: initialData[0].processo || 'CONCENTRADO',
    produto: initialData[0].produto || 'CONVENCIONAL',
    envase: initialData[0].envase || 'A'
  } : {
    data: new Date().toISOString().split('T')[0],
    fruta: 'MANGA',
    frutaOutros: '',
    processo: 'CONCENTRADO',
    produto: 'CONVENCIONAL',
    envase: 'A'
  });

  const [entries, setEntries] = useState<BlenderEntry[]>(initialData || [{
    noTanque: '', seqTanque: '', brix: '', ph: '', phCorrigido: '', acidez: '',
    pontosMarrons: '', pontosPretos: '', cor: '', vitaminaC: '', liberacaoH: '', visto: '', observacoes: ''
  }]);

  const updateEntry = (idx: number, field: keyof BlenderEntry, value: string) => {
    const newEntries = [...entries];
    newEntries[idx] = { ...newEntries[idx], [field]: value };
    setEntries(newEntries);
  };

  const addEntry = () => setEntries([...entries, {
    noTanque: '', seqTanque: '', brix: '', ph: '', phCorrigido: '', acidez: '',
    pontosMarrons: '', pontosPretos: '', cor: '', vitaminaC: '', liberacaoH: '', visto: '', observacoes: ''
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
      <div className="bg-purple-50 p-6 rounded-2xl border border-purple-100 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
         <div className="space-y-2">
            <label className="text-[10px] font-black text-purple-700 uppercase tracking-widest">Data</label>
            <input 
              type="date" 
              className="w-full p-2.5 rounded-lg border-purple-200 border bg-white dark:bg-gray-800 outline-none focus:ring-2 focus:ring-purple-400 font-bold" 
              value={header.data}
              onChange={e => setHeader({...header, data: e.target.value})}
            />
         </div>
         <div className="space-y-2">
            <label className="text-[10px] font-black text-purple-700 uppercase tracking-widest">Fruta</label>
            <div className="grid grid-cols-2 gap-1">
               {fruits.map(f => (
                   <button 
                    type="button" 
                    key={f.id} 
                    onClick={() => setHeader({...header, fruta: f.name})}
                    className={`py-1.5 text-[9px] font-bold border rounded-lg transition-all ${header.fruta === f.name ? 'bg-purple-600 text-white border-purple-700' : 'bg-white dark:bg-gray-800 border-purple-200 text-purple-400'}`}
                   >{f.name}</button>
               ))}
            </div>
            {header.fruta === 'OUTROS' && (
              <input 
                type="text" 
                className="w-full mt-1 p-2 rounded-lg border-purple-200 border bg-white dark:bg-gray-800 text-[10px] outline-none" 
                placeholder="Especifique..."
                value={header.frutaOutros}
                onChange={e => setHeader({...header, frutaOutros: e.target.value})}
              />
            )}
         </div>
         <div className="space-y-2">
            <label className="text-[10px] font-black text-purple-700 uppercase tracking-widest">Processo</label>
            <div className="flex gap-2">
               {['CONCENTRADO', 'INTEGRAL'].map(p => (
                   <button 
                    type="button" 
                    key={p} 
                    onClick={() => setHeader({...header, processo: p})}
                    className={`flex-1 py-2 text-[10px] font-bold border rounded-lg transition-all ${header.processo === p ? 'bg-purple-600 text-white border-purple-700 shadow-md' : 'bg-white dark:bg-gray-800 border-purple-200 text-purple-400'}`}
                   >{p}</button>
               ))}
            </div>
         </div>
         <div className="space-y-2">
            <label className="text-[10px] font-black text-purple-700 uppercase tracking-widest">Produto</label>
            <div className="flex gap-2">
               {['CONVENCIONAL', 'ORGÂNICO'].map(p => (
                   <button 
                    type="button" 
                    key={p} 
                    onClick={() => setHeader({...header, produto: p})}
                    className={`flex-1 py-2 text-[10px] font-bold border rounded-lg transition-all ${header.produto === p ? 'bg-purple-600 text-white border-purple-700 shadow-md' : 'bg-white dark:bg-gray-800 border-purple-200 text-purple-400'}`}
                   >{p}</button>
               ))}
            </div>
         </div>
         <div className="space-y-2">
            <label className="text-[10px] font-black text-purple-700 uppercase tracking-widest">Envase</label>
            <div className="flex gap-1.5">
               {['A', 'C', 'D'].map(v => (
                   <button 
                    type="button" 
                    key={v} 
                    onClick={() => setHeader({...header, envase: v})}
                    className={`w-10 h-10 text-[10px] font-black border rounded-xl transition-all ${header.envase === v ? 'bg-purple-800 text-white border-purple-900 shadow-lg scale-105' : 'bg-white dark:bg-gray-800 border-purple-100 text-purple-300'}`}
                   >{v}</button>
               ))}
            </div>
         </div>
      </div>
      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto border rounded-2xl shadow-sm bg-white dark:bg-gray-800 custom-scrollbar">
         <table className="w-full text-sm min-w-[1300px]">
            <thead className="bg-gray-50 dark:bg-gray-900/50 text-gray-500 uppercase font-black text-[9px] tracking-widest">
                <tr className="border-b">
                    <th className="px-3 py-4 text-center w-32">Nº Tanque</th>
                    <th className="px-2 py-4 text-center w-20">Seq.</th>
                    <th className="px-2 py-4 text-center w-24">ºBrix</th>
                    <th className="px-2 py-4 text-center w-24">pH</th>
                    <th className="px-2 py-4 text-center w-24">pH Corr</th>
                    <th className="px-2 py-4 text-center w-24">Acidez</th>
                    <th className="px-2 py-4 text-center w-20">PM</th>
                    <th className="px-2 py-4 text-center w-20">PP</th>
                    <th className="px-2 py-4 text-center w-24">Cor</th>
                    <th className="px-2 py-4 text-center w-24">Vit C</th>
                    <th className="px-2 py-4 text-center w-24">Lib (h)</th>
                    <th className="px-3 py-4 text-center w-36">Visto</th>
                    <th className="px-2 py-4 text-center w-12"></th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
                {entries.map((item, idx) => (
                    <tr key={idx} className="hover:bg-purple-50/20 transition-colors">
                        <td className="px-2 py-4">
                            <input value={item.noTanque} onChange={(e) => updateEntry(idx, 'noTanque', e.target.value)} placeholder="T-01" className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-lg text-center font-bold outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-200" />
                        </td>
                        <td className="px-1 py-4">
                            <input value={item.seqTanque} onChange={(e) => updateEntry(idx, 'seqTanque', e.target.value)} placeholder="01" className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-lg text-center font-black text-purple-600 outline-none focus:border-purple-400" />
                        </td>
                        <td className="px-1 py-4">
                            <input type="text" value={item.brix} onChange={(e) => updateEntry(idx, 'brix', e.target.value)} className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-lg text-center outline-none focus:border-purple-400 font-bold" placeholder="0.0" />
                        </td>
                        <td className="px-1 py-4">
                            <input type="text" value={item.ph} onChange={(e) => updateEntry(idx, 'ph', e.target.value)} placeholder="0.00" className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-lg text-center outline-none focus:border-purple-400 font-bold" />
                        </td>
                        <td className="px-1 py-4">
                            <input type="text" value={item.phCorrigido} onChange={(e) => updateEntry(idx, 'phCorrigido', e.target.value)} placeholder="0.00" className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-lg text-center bg-gray-50 dark:bg-gray-900/50 font-black text-purple-800 outline-none" />
                        </td>
                        <td className="px-1 py-4">
                            <input type="text" value={item.acidez} onChange={(e) => updateEntry(idx, 'acidez', e.target.value)} className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-lg text-center outline-none focus:border-purple-400 font-bold" placeholder="0.00" />
                        </td>
                        <td className="px-1 py-4">
                            <input placeholder="PM" value={item.pontosMarrons} onChange={(e) => updateEntry(idx, 'pontosMarrons', e.target.value)} className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-center outline-none focus:border-purple-400" />
                        </td>
                        <td className="px-1 py-4">
                            <input placeholder="PP" value={item.pontosPretos} onChange={(e) => updateEntry(idx, 'pontosPretos', e.target.value)} className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-center outline-none focus:border-purple-400" />
                        </td>
                        <td className="px-1 py-4">
                            <input value={item.cor} onChange={(e) => updateEntry(idx, 'cor', e.target.value)} placeholder="Cor" className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-lg text-center text-sm outline-none focus:border-purple-400" />
                        </td>
                        <td className="px-1 py-4">
                            <input value={item.vitaminaC} onChange={(e) => updateEntry(idx, 'vitaminaC', e.target.value)} placeholder="Vit C" className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-lg text-center text-sm outline-none focus:border-purple-400" />
                        </td>
                        <td className="px-1 py-4">
                            <input value={item.liberacaoH} onChange={(e) => updateEntry(idx, 'liberacaoH', e.target.value)} placeholder="h" className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-lg text-center text-sm outline-none focus:border-purple-400" />
                        </td>
                        <td className="px-2 py-4">
                            <input value={item.visto} onChange={(e) => updateEntry(idx, 'visto', e.target.value)} placeholder="Analista" className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-lg text-center text-xs font-black uppercase outline-none focus:border-purple-400" />
                        </td>
                        <td className="px-2 py-4 text-center">
                            <button type="button" onClick={() => setEntries(entries.filter((_, i) => i !== idx))} className="text-gray-300 hover:text-red-500 transition-colors p-2"><i className="fas fa-trash-alt"></i></button>
                        </td>
                    </tr>
                ))}
            </tbody>
         </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {entries.map((item, idx) => (
          <div key={idx} className="bg-white dark:bg-gray-800 border border-purple-100 rounded-2xl shadow-sm overflow-hidden">
            <div className="bg-purple-600 px-4 py-2 flex justify-between items-center">
              <span className="text-white font-black text-[10px] uppercase tracking-widest">Tanque #{idx + 1}</span>
              <button type="button" onClick={() => setEntries(entries.filter((_, i) => i !== idx))} className="text-white/50 hover:text-white transition-colors">
                <i className="fas fa-trash-alt text-xs"></i>
              </button>
            </div>
            <div className="p-4 grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Nº Tanque</label>
                <input value={item.noTanque} onChange={(e) => updateEntry(idx, 'noTanque', e.target.value)} placeholder="T-01" className="w-full p-2.5 border border-gray-200 dark:border-gray-600 rounded-lg text-sm font-bold outline-none focus:border-purple-400" />
              </div>
              <div className="space-y-1">
                <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Seq.</label>
                <input value={item.seqTanque} onChange={(e) => updateEntry(idx, 'seqTanque', e.target.value)} placeholder="01" className="w-full p-2.5 border border-gray-200 dark:border-gray-600 rounded-lg text-sm font-black text-purple-600 outline-none focus:border-purple-400" />
              </div>
              <div className="space-y-1">
                <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest">ºBrix</label>
                <input value={item.brix} onChange={(e) => updateEntry(idx, 'brix', e.target.value)} placeholder="0.0" className="w-full p-2.5 border border-gray-200 dark:border-gray-600 rounded-lg text-sm font-bold outline-none focus:border-purple-400" />
              </div>
              <div className="space-y-1">
                <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest">pH</label>
                <input value={item.ph} onChange={(e) => updateEntry(idx, 'ph', e.target.value)} placeholder="0.00" className="w-full p-2.5 border border-gray-200 dark:border-gray-600 rounded-lg text-sm font-bold outline-none focus:border-purple-400" />
              </div>
              <div className="space-y-1">
                <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest">pH Corr</label>
                <input value={item.phCorrigido} onChange={(e) => updateEntry(idx, 'phCorrigido', e.target.value)} placeholder="0.00" className="w-full p-2.5 border border-gray-200 dark:border-gray-600 rounded-lg text-sm font-black text-purple-800 bg-gray-50 dark:bg-gray-900/50 outline-none" />
              </div>
              <div className="space-y-1">
                <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Acidez</label>
                <input value={item.acidez} onChange={(e) => updateEntry(idx, 'acidez', e.target.value)} placeholder="0.00" className="w-full p-2.5 border border-gray-200 dark:border-gray-600 rounded-lg text-sm font-bold outline-none focus:border-purple-400" />
              </div>
              <div className="space-y-1">
                <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest">PM / PP</label>
                <div className="flex gap-2">
                  <input value={item.pontosMarrons} onChange={(e) => updateEntry(idx, 'pontosMarrons', e.target.value)} placeholder="PM" className="flex-1 min-w-0 p-2.5 border border-gray-200 dark:border-gray-600 rounded-lg text-xs outline-none focus:border-purple-400" />
                  <input value={item.pontosPretos} onChange={(e) => updateEntry(idx, 'pontosPretos', e.target.value)} placeholder="PP" className="flex-1 min-w-0 p-2.5 border border-gray-200 dark:border-gray-600 rounded-lg text-xs outline-none focus:border-purple-400" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Cor / Vit C</label>
                <div className="flex gap-2">
                  <input value={item.cor} onChange={(e) => updateEntry(idx, 'cor', e.target.value)} placeholder="Cor" className="flex-1 min-w-0 p-2.5 border border-gray-200 dark:border-gray-600 rounded-lg text-xs outline-none focus:border-purple-400" />
                  <input value={item.vitaminaC} onChange={(e) => updateEntry(idx, 'vitaminaC', e.target.value)} placeholder="Vit C" className="flex-1 min-w-0 p-2.5 border border-gray-200 dark:border-gray-600 rounded-lg text-xs outline-none focus:border-purple-400" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Lib (h)</label>
                <input value={item.liberacaoH} onChange={(e) => updateEntry(idx, 'liberacaoH', e.target.value)} placeholder="h" className="w-full p-2.5 border border-gray-200 dark:border-gray-600 rounded-lg text-sm outline-none focus:border-purple-400" />
              </div>
              <div className="space-y-1">
                <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Visto</label>
                <input value={item.visto} onChange={(e) => updateEntry(idx, 'visto', e.target.value)} placeholder="Analista" className="w-full p-2.5 border border-gray-200 dark:border-gray-600 rounded-lg text-[10px] font-black uppercase outline-none focus:border-purple-400" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-gray-50 dark:bg-gray-900/50 p-6 rounded-2xl border border-gray-100 dark:border-gray-700">
          <label className="text-[10px] font-black text-purple-700 uppercase tracking-widest block mb-2">Observações Gerais de Liberação</label>
          <div className="grid grid-cols-1">
              <textarea 
                className="w-full p-4 border border-gray-200 dark:border-gray-600 rounded-xl h-24 text-sm focus:ring-2 focus:ring-purple-400 outline-none" 
                placeholder="Detalhes adicionais sobre a liberação do lote..."
                value={entries[0].observacoes}
                onChange={e => updateEntry(0, 'observacoes', e.target.value)}
              />
          </div>
      </div>

      <button type="button" onClick={addEntry} className="w-full py-4 border-2 border-dashed border-purple-200 rounded-2xl text-purple-400 font-bold hover:bg-purple-50 transition-all flex items-center justify-center gap-2 group">
        <i className="fas fa-plus-circle group-hover:scale-110 transition-transform"></i>
        Adicionar Próximo Tanque para Liberação
      </button>

      <div className="pt-6 border-t flex justify-end">
        <button disabled={isSubmitting} className="w-full md:w-auto px-12 py-4 bg-purple-600 hover:bg-purple-700 text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-xl shadow-xl transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50">
          {isSubmitting ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-check-double text-lg"></i>}
          <span>{initialData ? 'Sincronizar Edição' : 'Finalizar Liberação de Blender'}</span>
        </button>
      </div>
    </form>
  );
};

export default BlenderReleaseForm;
