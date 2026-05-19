import React, { useState } from 'react';

interface SampleRow {
  hora: string;
  quantidade: string;
  pesoTotal: string;
}

interface OccurrenceRow {
  inicial: string;
  final: string;
  codParada: string;
  codSetor: string;
  resumo: string;
}

const AsepticBatchControlForm: React.FC<{ onSave: (data: any) => void, isSubmitting: boolean }> = ({ onSave, isSubmitting }) => {
  const [header, setHeader] = useState({
    etiquetaLote: '',
    inicioProducao: '',
    fimProducao: '',
    qtdeTotal: '',
    noTamborBin: ''
  });

  const [samples1, setSamples1] = useState<{cabeca: string, rows: SampleRow[]}>({
    cabeca: 'A',
    rows: Array(5).fill(null).map(() => ({ hora: '', quantidade: '', pesoTotal: '' }))
  });

  const [samples2, setSamples2] = useState<{cabeca: string, rows: SampleRow[]}>({
    cabeca: 'A',
    rows: Array(5).fill(null).map(() => ({ hora: '', quantidade: '', pesoTotal: '' }))
  });

  const [occurrences, setOccurrences] = useState<OccurrenceRow[]>(
    Array(5).fill(null).map(() => ({ inicial: '', final: '', codParada: '', codSetor: '', resumo: '' }))
  );

  const [stopwatch, setStopwatch] = useState({
    nCronometroUso: '',
    nCronometroRef: '',
    leituraUso: '',
    leituraRef: '',
    erro: '',
    status: 'CONFORME' as 'CONFORME' | 'NÃO CONFORME'
  });

  const [footer, setFooter] = useState({
    turnos: [
      { turno: '1', operador: '', supervisor: '' },
      { turno: '2', operador: '', supervisor: '' },
      { turno: '3', operador: '', supervisor: '' }
    ],
    responsavelProducao: ''
  });

  const updateSample = (set: 1 | 2, idx: number, field: keyof SampleRow, val: string) => {
    if (set === 1) {
      const n = [...samples1.rows];
      n[idx] = { ...n[idx], [field]: val };
      setSamples1({ ...samples1, rows: n });
    } else {
      const n = [...samples2.rows];
      n[idx] = { ...n[idx], [field]: val };
      setSamples2({ ...samples2, rows: n });
    }
  };

  const updateOcc = (idx: number, field: keyof OccurrenceRow, val: string) => {
    const n = [...occurrences];
    n[idx] = { ...n[idx], [field]: val };
    setOccurrences(n);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ header, samples1, samples2, occurrences, stopwatch, footer });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-10 animate-fadeIn">
      {/* Top Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-4">
           <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Etiqueta Lote</label>
           <div className="border-2 border-dashed border-gray-200 dark:border-gray-600 rounded-[2rem] h-40 flex items-center justify-center bg-gray-50 dark:bg-gray-900/50 p-4">
              <textarea 
                value={header.etiquetaLote} 
                onChange={e => setHeader({...header, etiquetaLote: e.target.value})}
                className="bg-transparent w-full h-full text-center text-xs font-bold outline-none resize-none" 
                placeholder="(Cole ou Digite as informações do Lote)" 
              />
           </div>
        </div>
        
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 dark:bg-gray-900/50 p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-700 shadow-sm">
           <div className="space-y-4">
              <h4 className="text-[10px] font-black text-blue-800 uppercase tracking-widest border-b pb-2">Horário de Produção</h4>
              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-1">
                    <label className="text-[9px] font-bold text-gray-400 uppercase">Início</label>
                    <input type="time" value={header.inicioProducao} onChange={e => setHeader({...header, inicioProducao: e.target.value})} className="w-full p-2 border rounded-xl" />
                 </div>
                 <div className="space-y-1">
                    <label className="text-[9px] font-bold text-gray-400 uppercase">Fim</label>
                    <input type="time" value={header.fimProducao} onChange={e => setHeader({...header, fimProducao: e.target.value})} className="w-full p-2 border rounded-xl" />
                 </div>
              </div>
           </div>
           <div className="space-y-4">
              <h4 className="text-[10px] font-black text-blue-800 uppercase tracking-widest border-b pb-2">Geral</h4>
              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-1">
                    <label className="text-[9px] font-bold text-gray-400 uppercase">Qtde.</label>
                    <input value={header.qtdeTotal} onChange={e => setHeader({...header, qtdeTotal: e.target.value})} className="w-full p-2 border rounded-xl" />
                 </div>
                 <div className="space-y-1">
                    <label className="text-[9px] font-bold text-gray-400 uppercase">Nº Tambor/Bin</label>
                    <input value={header.noTamborBin} onChange={e => setHeader({...header, noTamborBin: e.target.value})} className="w-full p-2 border rounded-xl" />
                 </div>
              </div>
           </div>
        </div>
      </div>

      {/* Samples Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         {[samples1, samples2].map((sSet, sIdx) => (
           <div key={sIdx} className="bg-white dark:bg-gray-800 rounded-[2rem] border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
              <div className="bg-blue-800 px-6 py-4 flex items-center justify-between">
                 <h4 className="text-white font-black text-[10px] uppercase tracking-widest">Amostras Laboratório ({sIdx === 0 ? 'D-1' : 'D-2'})</h4>
                 <div className="flex gap-2">
                    {['A', 'C', sIdx === 0 ? 'D-1' : 'D-2'].map(c => (
                      <button 
                        key={c} 
                        type="button" 
                        onClick={() => sIdx === 0 ? setSamples1({...samples1, cabeca: c}) : setSamples2({...samples2, cabeca: c})}
                        className={`w-8 h-8 rounded-lg text-[9px] font-black border transition-all ${sSet.cabeca === c ? 'bg-white dark:bg-gray-800 text-blue-800' : 'bg-blue-700 text-blue-100 border-blue-600'}`}
                      >
                        {c}
                      </button>
                    ))}
                 </div>
              </div>
              
              {/* Desktop Table View */}
              <div className="hidden md:block">
                <table className="w-full text-[10px]">
                   <thead className="bg-gray-50 dark:bg-gray-900/50 border-b font-black text-gray-400 uppercase">
                      <tr>
                         <th className="p-3">Hora Amostr.</th>
                         <th className="p-3 text-center">Quantidade</th>
                         <th className="p-3 text-center">Peso Total</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y">
                      {sSet.rows.map((row, i) => (
                        <tr key={i}>
                           <td className="p-2"><input type="time" value={row.hora} onChange={e => updateSample((sIdx+1) as 1|2, i, 'hora', e.target.value)} className="w-full p-1.5 border rounded-lg" /></td>
                           <td className="p-2"><input value={row.quantidade} onChange={e => updateSample((sIdx+1) as 1|2, i, 'quantidade', e.target.value)} className="w-full p-1.5 border rounded-lg text-center" /></td>
                           <td className="p-2"><input value={row.pesoTotal} onChange={e => updateSample((sIdx+1) as 1|2, i, 'pesoTotal', e.target.value)} className="w-full p-1.5 border rounded-lg text-center font-bold" /></td>
                        </tr>
                      ))}
                   </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden divide-y divide-gray-100">
                {sSet.rows.map((row, i) => (
                  <div key={i} className="p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-[9px] font-black text-blue-800 uppercase tracking-widest">Amostra #{i + 1}</span>
                  <input type="time" value={row.hora} onChange={e => updateSample((sIdx+1) as 1|2, i, 'hora', e.target.value)} className="flex-1 min-w-0 p-1 border rounded text-[10px]" />
                </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[8px] font-bold text-gray-400 uppercase">Quantidade</label>
                        <input value={row.quantidade} onChange={e => updateSample((sIdx+1) as 1|2, i, 'quantidade', e.target.value)} className="w-full p-2 border rounded-lg text-[10px] text-center" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[8px] font-bold text-gray-400 uppercase">Peso Total</label>
                        <input value={row.pesoTotal} onChange={e => updateSample((sIdx+1) as 1|2, i, 'pesoTotal', e.target.value)} className="w-full p-2 border rounded-lg text-[10px] text-center font-bold text-blue-800" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
           </div>
         ))}
      </div>

      {/* Occurrences Table */}
      <div className="bg-white dark:bg-gray-800 rounded-[2rem] border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="bg-gray-800 px-6 py-4">
           <h4 className="text-white font-black text-[10px] uppercase tracking-widest">Resumo das Ocorrências</h4>
        </div>
        
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-[10px]">
            <thead className="bg-gray-50 dark:bg-gray-900/50 border-b font-black text-gray-400 uppercase">
              <tr>
                <th className="p-3 w-32 text-center">Horário (I / F)</th>
                <th className="p-3 w-20 text-center">Cód. P.</th>
                <th className="p-3 w-20 text-center">Cód. S.</th>
                <th className="p-3">Resumo da Ocorrência</th>
              </tr>
            </thead>
            <tbody className="divide-y">
               {occurrences.map((occ, i) => (
                 <tr key={i}>
                   <td className="p-2 flex gap-1">
                      <input type="time" value={occ.inicial} onChange={e => updateOcc(i, 'inicial', e.target.value)} className="w-full p-1.5 border rounded-lg" />
                      <input type="time" value={occ.final} onChange={e => updateOcc(i, 'final', e.target.value)} className="w-full p-1.5 border rounded-lg" />
                   </td>
                   <td className="p-2"><input value={occ.codParada} onChange={e => updateOcc(i, 'codParada', e.target.value)} className="w-full p-1.5 border rounded-lg text-center" /></td>
                   <td className="p-2"><input value={occ.codSetor} onChange={e => updateOcc(i, 'codSetor', e.target.value)} className="w-full p-1.5 border rounded-lg text-center" /></td>
                   <td className="p-2"><input value={occ.resumo} onChange={e => updateOcc(i, 'resumo', e.target.value)} className="w-full p-1.5 border rounded-lg" /></td>
                 </tr>
               ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden divide-y divide-gray-100">
          {occurrences.map((occ, i) => (
            <div key={i} className="p-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-[9px] font-black text-gray-800 dark:text-gray-100 uppercase tracking-widest">Ocorrência #{i + 1}</span>
                <div className="flex gap-1">
                  <input type="time" value={occ.inicial} onChange={e => updateOcc(i, 'inicial', e.target.value)} className="flex-1 min-w-0 p-1 border rounded text-[10px]" />
                  <input type="time" value={occ.final} onChange={e => updateOcc(i, 'final', e.target.value)} className="flex-1 min-w-0 p-1 border rounded text-[10px]" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[8px] font-bold text-gray-400 uppercase">Cód. Parada</label>
                  <input value={occ.codParada} onChange={e => updateOcc(i, 'codParada', e.target.value)} className="w-full p-2 border rounded-lg text-[10px] text-center" />
                </div>
                <div className="space-y-1">
                  <label className="text-[8px] font-bold text-gray-400 uppercase">Cód. Setor</label>
                  <input value={occ.codSetor} onChange={e => updateOcc(i, 'codSetor', e.target.value)} className="w-full p-2 border rounded-lg text-[10px] text-center" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[8px] font-bold text-gray-400 uppercase">Resumo</label>
                <input value={occ.resumo} onChange={e => updateOcc(i, 'resumo', e.target.value)} className="w-full p-2 border rounded-lg text-[10px]" placeholder="Descrição..." />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Stopwatch Verification */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-gray-50 dark:bg-gray-900/50 p-8 rounded-[2rem] border border-gray-100 dark:border-gray-700 space-y-6">
           <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Verificação do Cronômetro (Tolerância: +/- 1 seg)</h4>
           <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                 <span className="text-[9px] font-bold text-blue-800 uppercase block">Instrumento em Uso</span>
                 <input placeholder="Nº Cronômetro" value={stopwatch.nCronometroUso} onChange={e => setStopwatch({...stopwatch, nCronometroUso: e.target.value})} className="w-full p-2 border rounded-xl text-xs bg-white dark:bg-gray-800" />
                 <input placeholder="Leitura" value={stopwatch.leituraUso} onChange={e => setStopwatch({...stopwatch, leituraUso: e.target.value})} className="w-full p-2 border rounded-xl text-xs bg-white dark:bg-gray-800" />
              </div>
              <div className="space-y-4">
                 <span className="text-[9px] font-bold text-blue-800 uppercase block">Instrumento Referência</span>
                 <input placeholder="Nº Cronômetro" value={stopwatch.nCronometroRef} onChange={e => setStopwatch({...stopwatch, nCronometroRef: e.target.value})} className="w-full p-2 border rounded-xl text-xs bg-white dark:bg-gray-800" />
                 <input placeholder="Leitura" value={stopwatch.leituraRef} onChange={e => setStopwatch({...stopwatch, leituraRef: e.target.value})} className="w-full p-2 border rounded-xl text-xs bg-white dark:bg-gray-800" />
              </div>
           </div>
           <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <div className="space-y-1">
                 <label className="text-[9px] font-black text-gray-400 uppercase">Erro Apurado</label>
                 <input value={stopwatch.erro} onChange={e => setStopwatch({...stopwatch, erro: e.target.value})} className="w-full p-2 border rounded-xl text-xs bg-white dark:bg-gray-800" />
              </div>
              <div className="space-y-1">
                 <label className="text-[9px] font-black text-gray-400 uppercase">Resultado</label>
                 <div className="flex gap-2">
                    {(['CONFORME', 'NÃO CONFORME'] as const).map(s => (
                       <button 
                         key={s} 
                         type="button" 
                         onClick={() => setStopwatch({...stopwatch, status: s})}
                         className={`flex-1 py-2 rounded-xl text-[8px] font-black border transition-all ${stopwatch.status === s ? (s === 'CONFORME' ? 'bg-green-600 text-white' : 'bg-red-600 text-white') : 'bg-white dark:bg-gray-800 text-gray-300'}`}
                       >
                         {s === 'CONFORME' ? 'CONF.' : 'N. CONF.'}
                       </button>
                    ))}
                 </div>
              </div>
           </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-[2rem] border border-gray-100 dark:border-gray-700 shadow-sm p-8 space-y-6">
           <h4 className="text-[10px] font-black text-blue-800 uppercase tracking-widest">Equipe de Produção</h4>
           <div className="space-y-4">
              {footer.turnos.map((t, idx) => (
                <div key={t.turno} className="grid grid-cols-4 gap-4 items-center">
                   <span className="text-[10px] font-black text-gray-300">TURNO {t.turno}</span>
                   <input 
                     placeholder="Operador" 
                     value={t.operador} 
                     onChange={e => {
                       const n = [...footer.turnos];
                       n[idx].operador = e.target.value;
                       setFooter({...footer, turnos: n});
                     }}
                     className="col-span-1 p-2 border rounded-xl text-xs" 
                   />
                   <input 
                     placeholder="Líder/Supervisor" 
                     value={t.supervisor} 
                     onChange={e => {
                       const n = [...footer.turnos];
                       n[idx].supervisor = e.target.value;
                       setFooter({...footer, turnos: n});
                     }}
                     className="col-span-2 p-2 border rounded-xl text-xs" 
                   />
                </div>
              ))}
           </div>
           <div className="pt-4 border-t">
              <label className="text-[9px] font-black text-gray-400 uppercase block mb-1">Responsável Produção</label>
              <input value={footer.responsavelProducao} onChange={e => setFooter({...footer, responsavelProducao: e.target.value})} className="w-full p-3 border rounded-xl font-bold bg-gray-50 dark:bg-gray-900/50" />
           </div>
        </div>
      </div>

      <div className="pt-6 flex justify-end">
        <button disabled={isSubmitting} className="px-12 py-4 bg-blue-800 hover:bg-blue-900 text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl shadow-xl transition-all flex items-center gap-2">
          {isSubmitting ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-save"></i>}
          <span>Salvar Lote Asséptico</span>
        </button>
      </div>
    </form>
  );
};

export default AsepticBatchControlForm;