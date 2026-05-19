import React, { useState } from 'react';

interface PackingRow {
  no: number;
  selo: string;
  etiqueta: string;
}

const PackingListForm: React.FC<{ onSave: (data: any) => void, isSubmitting: boolean }> = ({ onSave, isSubmitting }) => {
  const [header, setHeader] = useState({
    cliente: '',
    lote: '',
    tipoProduto: 'CONVENCIONAL' as 'CONVENCIONAL' | 'ORGÂNICO'
  });

  // Iniciando com 40 linhas como o documento original (página 1), mas permitindo expandir até 228 (página 2)
  const [rows, setRows] = useState<PackingRow[]>(
    Array(40).fill(null).map((_, i) => ({ no: i + 1, selo: '', etiqueta: '' }))
  );

  const [footer, setFooter] = useState({
    obs: '',
    colaborador: ''
  });

  const updateRow = (idx: number, field: 'selo' | 'etiqueta', value: string) => {
    const newRows = [...rows];
    newRows[idx] = { ...newRows[idx], [field]: value };
    setRows(newRows);
  };

  const addMoreRows = () => {
    const start = rows.length + 1;
    const more = Array(20).fill(null).map((_, i) => ({ no: start + i, selo: '', etiqueta: '' }));
    setRows([...rows, ...more]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ header, rows, footer });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 animate-fadeIn">
      {/* Header Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 bg-gray-50 dark:bg-gray-900/50 p-8 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm">
        <div className="md:col-span-2 space-y-1">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Cliente</label>
          <input required value={header.cliente} onChange={e => setHeader({...header, cliente: e.target.value})} className="w-full p-2.5 border rounded-xl" />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Lote</label>
          <input value={header.lote} onChange={e => setHeader({...header, lote: e.target.value})} className="w-full p-2.5 border rounded-xl" />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Tipo de Produto</label>
          <div className="flex gap-2">
            {(['CONVENCIONAL', 'ORGÂNICO'] as const).map(t => (
              <button key={t} type="button" onClick={() => setHeader({...header, tipoProduto: t})} className={`flex-1 py-2.5 rounded-xl text-[9px] font-black uppercase transition-all border ${header.tipoProduto === t ? 'bg-emerald-700 border-emerald-800 text-white' : 'bg-white dark:bg-gray-800 text-gray-400 border-gray-100 dark:border-gray-700'}`}>{t}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid of Tables (Desktop) */}
      <div className="hidden md:grid grid-cols-2 lg:grid-cols-4 gap-6">
         {/* Renderizamos em blocos para facilitar a visualização em grid */}
         {[0, 10, 20, 30].map(blockStart => (
            <div key={blockStart} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
               <table className="w-full text-[10px] border-collapse">
                  <thead className="bg-emerald-50 text-emerald-800 font-black uppercase">
                     <tr>
                        <th className="p-2 border-b w-8">Tambor Nº</th>
                        <th className="p-2 border-b">Selo Nº</th>
                        <th className="p-2 border-b">Etiqueta</th>
                     </tr>
                  </thead>
                  <tbody>
                     {rows.slice(blockStart, blockStart + 10).map((row, i) => {
                       const actualIdx = blockStart + i;
                       return (
                         <tr key={actualIdx} className="hover:bg-emerald-50/20">
                            <td className="p-2 border-b text-center font-bold text-gray-400">{row.no}</td>
                            <td className="p-1 border-b"><input value={row.selo} onChange={e => updateRow(actualIdx, 'selo', e.target.value)} className="w-full p-1 border rounded text-center outline-none focus:border-emerald-500" /></td>
                            <td className="p-1 border-b"><input value={row.etiqueta} onChange={e => updateRow(actualIdx, 'etiqueta', e.target.value)} className="w-full p-1 border rounded text-center outline-none focus:border-emerald-500" /></td>
                         </tr>
                       )
                     })}
                  </tbody>
               </table>
            </div>
         ))}
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {rows.map((row, idx) => (
          <div key={idx} className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-center gap-4">
            <div className="w-10 h-10 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-700 font-black text-xs shrink-0">
              {row.no}
            </div>
            <div className="grid grid-cols-2 gap-3 flex-1">
              <div className="space-y-1">
                <label className="text-[8px] font-bold text-gray-400 uppercase">Selo Nº</label>
                <input value={row.selo} onChange={e => updateRow(idx, 'selo', e.target.value)} className="w-full p-2 border rounded-xl text-[10px] outline-none focus:border-emerald-500" placeholder="Selo" />
              </div>
              <div className="space-y-1">
                <label className="text-[8px] font-bold text-gray-400 uppercase">Etiqueta</label>
                <input value={row.etiqueta} onChange={e => updateRow(idx, 'etiqueta', e.target.value)} className="w-full p-2 border rounded-xl text-[10px] outline-none focus:border-emerald-500" placeholder="Etiqueta" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {rows.length > 40 && (
         <div className="hidden md:grid grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Se houver mais de 40, renderiza os próximos blocos conforme necessário */}
            <div className="col-span-full text-center text-gray-400 text-[10px] font-bold uppercase py-4 border-t">Mais registros adicionados abaixo</div>
            <div className="col-span-full overflow-x-auto">
               <table className="w-full text-left bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
                  <thead className="bg-emerald-700 text-white text-[9px] font-black uppercase">
                     <tr>
                        <th className="p-3 w-20 text-center">Nº</th>
                        <th className="p-3">Selo Nº</th>
                        <th className="p-3">Etiqueta</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y text-xs">
                     {rows.slice(40).map((row, i) => (
                       <tr key={i+40}>
                          <td className="p-3 text-center font-bold text-gray-300">{row.no}</td>
                          <td className="p-2"><input value={row.selo} onChange={e => updateRow(i+40, 'selo', e.target.value)} className="w-full p-2 border rounded-xl" /></td>
                          <td className="p-2"><input value={row.etiqueta} onChange={e => updateRow(i+40, 'etiqueta', e.target.value)} className="w-full p-2 border rounded-xl" /></td>
                       </tr>
                     ))}
                  </tbody>
               </table>
            </div>
         </div>
      )}

      <button type="button" onClick={addMoreRows} className="w-full py-4 border-2 border-dashed border-emerald-200 rounded-3xl text-emerald-400 font-black text-[10px] uppercase tracking-widest hover:bg-emerald-50 transition-all flex items-center justify-center gap-2">
        <i className="fas fa-plus-circle"></i> Adicionar Mais 20 Linhas de Tambores
      </button>

      <div className="bg-gray-50 dark:bg-gray-900/50 p-8 rounded-3xl space-y-6">
         <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Observações</label>
            <textarea value={footer.obs} onChange={e => setFooter({...footer, obs: e.target.value})} className="w-full p-4 border rounded-2xl h-24 text-sm" />
         </div>
         <div className="space-y-1 pt-4 border-t">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Colaborador - Expedição</label>
            <input value={footer.colaborador} onChange={e => setFooter({...footer, colaborador: e.target.value})} className="w-full p-3 border rounded-xl font-bold" />
         </div>
      </div>

      <div className="pt-6 flex justify-end">
        <button disabled={isSubmitting} className="px-12 py-4 bg-emerald-700 hover:bg-emerald-800 text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl shadow-xl transition-all flex items-center gap-2">
          {isSubmitting ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-list-check"></i>}
          <span>Finalizar Packing List</span>
        </button>
      </div>
    </form>
  );
};

export default PackingListForm;