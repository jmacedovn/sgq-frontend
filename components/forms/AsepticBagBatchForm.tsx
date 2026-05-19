import React, { useState } from 'react';

interface BagBoxEntry {
  noCaixa: string;
  noLote: string;
  qtdeBag: string;
  material: 'FLEXGOLD' | 'FLEXIAL';
  barreira: 'DUPLA' | 'TRIPLA';
}

const AsepticBagBatchForm: React.FC<{ onSave: (data: any) => void, isSubmitting: boolean }> = ({ onSave, isSubmitting }) => {
  const [header, setHeader] = useState({
    loteProducao: '',
    turno: '1' as '1' | '2' | '3',
    loteSacoPoli: ''
  });

  const [entries, setEntries] = useState<BagBoxEntry[]>(
    Array(6).fill(null).map((_, i) => ({
      noCaixa: '', noLote: '', qtdeBag: '', material: 'FLEXGOLD', barreira: 'DUPLA'
    }))
  );

  const [footer, setFooter] = useState({
    observacoes: '',
    equipe: [
      { turno: '1', operador: '', supervisor: '' },
      { turno: '2', operador: '', supervisor: '' },
      { turno: '3', operador: '', supervisor: '' }
    ],
    responsavelProducao: ''
  });

  const updateEntry = (idx: number, field: keyof BagBoxEntry, val: string) => {
    const n = [...entries];
    n[idx] = { ...n[idx], [field]: val };
    setEntries(n);
  };

  const updateEquipe = (idx: number, field: 'operador' | 'supervisor', val: string) => {
    const n = [...footer.equipe];
    (n[idx] as any)[field] = val;
    setFooter({...footer, equipe: n});
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ header, entries, footer });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-gray-50 dark:bg-gray-900/50 p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-700 shadow-sm">
        <div className="space-y-1">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Lote de Produção</label>
          <input value={header.loteProducao} onChange={e => setHeader({...header, loteProducao: e.target.value})} className="w-full p-2.5 border rounded-xl font-bold" />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Turno</label>
          <div className="flex gap-2">
            {(['1', '2', '3'] as const).map(t => (
              <button key={t} type="button" onClick={() => setHeader({...header, turno: t})} className={`flex-1 py-2.5 rounded-xl text-[9px] font-black transition-all border ${header.turno === t ? 'bg-cyan-800 text-white' : 'bg-white dark:bg-gray-800 text-gray-400'}`}>{t}</button>
            ))}
          </div>
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Nº Lote Saco Polietileno</label>
          <input value={header.loteSacoPoli} onChange={e => setHeader({...header, loteSacoPoli: e.target.value})} className="w-full p-2.5 border rounded-xl" />
        </div>
      </div>

      {/* Bag Entries Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {entries.map((entry, idx) => (
          <div key={idx} className="bg-white dark:bg-gray-800 rounded-[2rem] border border-gray-100 dark:border-gray-700 shadow-sm p-6 space-y-4 hover:border-cyan-200 transition-all group">
             <div className="flex items-center justify-between border-b pb-3">
                <span className="text-[10px] font-black text-cyan-800 tracking-widest">BAG / CAIXA #{idx + 1}</span>
                <i className="fas fa-box text-gray-100 group-hover:text-cyan-100 transition-colors"></i>
             </div>
             <div className="space-y-3">
                <div className="space-y-1">
                   <label className="text-[9px] font-bold text-gray-400 uppercase">Etiqueta da Caixa Bag (Informações)</label>
                   <input value={entry.noCaixa} onChange={e => updateEntry(idx, 'noCaixa', e.target.value)} placeholder="Nº Caixa" className="w-full p-2 border rounded-xl text-xs" />
                   <input value={entry.noLote} onChange={e => updateEntry(idx, 'noLote', e.target.value)} placeholder="Nº Lote" className="w-full p-2 border rounded-xl text-xs font-bold" />
                </div>
                <div className="space-y-1">
                   <label className="text-[9px] font-bold text-gray-400 uppercase">Quantidade de Bag</label>
                   <input type="number" value={entry.qtdeBag} onChange={e => updateEntry(idx, 'qtdeBag', e.target.value)} className="w-full p-2 border rounded-xl text-xs text-center" />
                </div>
                <div className="grid grid-cols-2 gap-2 pt-2">
                   <div className="space-y-1">
                      <label className="text-[8px] font-black text-gray-300 uppercase">Material</label>
                      <select value={entry.material} onChange={e => updateEntry(idx, 'material', e.target.value as any)} className="w-full p-1.5 border rounded-lg text-[9px] font-bold">
                         <option value="FLEXGOLD">FLEXGOLD</option>
                         <option value="FLEXIAL">FLEXIAL</option>
                      </select>
                   </div>
                   <div className="space-y-1">
                      <label className="text-[8px] font-black text-gray-300 uppercase">Barreira</label>
                      <select value={entry.barreira} onChange={e => updateEntry(idx, 'barreira', e.target.value as any)} className="w-full p-1.5 border rounded-lg text-[9px] font-bold">
                         <option value="DUPLA">DUPLA</option>
                         <option value="TRIPLA">TRIPLA</option>
                      </select>
                   </div>
                </div>
             </div>
          </div>
        ))}
      </div>

      {/* Observations & Team */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         <div className="space-y-4">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Observações Gerais</label>
            <textarea value={footer.observacoes} onChange={e => setFooter({...footer, observacoes: e.target.value})} className="w-full p-6 border rounded-[2rem] h-full min-h-[200px] outline-none focus:ring-2 focus:ring-cyan-500 text-sm" placeholder="Registrar anomalias ou detalhes dos bags..." />
         </div>
         
         <div className="bg-white dark:bg-gray-800 rounded-[2rem] border border-gray-100 dark:border-gray-700 shadow-sm p-8 space-y-6">
            <h4 className="text-[10px] font-black text-cyan-800 uppercase tracking-widest">Equipe Operacional</h4>
            <div className="space-y-4">
               {footer.equipe.map((t, i) => (
                 <div key={t.turno} className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-center border-b sm:border-none pb-4 sm:pb-0">
                    <span className="text-[10px] font-black text-gray-300">TURNO {t.turno}</span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 col-span-1 sm:col-span-3 gap-2">
                       <input placeholder="Operador" value={t.operador} onChange={e => updateEquipe(i, 'operador', e.target.value)} className="flex-1 min-w-0 p-2 border rounded-xl text-xs" />
                       <input placeholder="Líder / Supervisor" value={t.supervisor} onChange={e => updateEquipe(i, 'supervisor', e.target.value)} className="sm:col-span-2 flex-1 min-w-0 p-2 border rounded-xl text-xs" />
                    </div>
                 </div>
               ))}
            </div>
            <div className="pt-4 border-t space-y-1">
               <label className="text-[9px] font-black text-gray-400 uppercase">Responsável Produção</label>
               <input value={footer.responsavelProducao} onChange={e => setFooter({...footer, responsavelProducao: e.target.value})} className="w-full p-3 border rounded-xl font-bold bg-gray-50 dark:bg-gray-900/50" />
            </div>
         </div>
      </div>

      <div className="pt-6 flex justify-end">
        <button disabled={isSubmitting} className="px-12 py-4 bg-cyan-800 hover:bg-cyan-900 text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl shadow-xl transition-all flex items-center gap-2">
          {isSubmitting ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-save"></i>}
          <span>Salvar Registro de Bags</span>
        </button>
      </div>
    </form>
  );
};

export default AsepticBagBatchForm;