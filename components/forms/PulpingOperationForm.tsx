import React, { useState } from 'react';
import { useFruits } from '../../lib/useFruits';

interface HourlyRow {
  hora: string;
  escaldadoraL1: string;
  escaldadoraL2: string;
  inativadorL1: string;
  inativadorL2: string;
  finisherVel: string;
  finisherEnxague: string;
  finisherUmidade: string;
  tassinoxVel: string;
  tassinoxEnxague: string;
  tassinoxUmidade: string;
}

const PulpingOperationForm: React.FC<{ onSave: (data: any) => void, isSubmitting: boolean }> = ({ onSave, isSubmitting }) => {
  const { fruits } = useFruits();
  const [header, setHeader] = useState({
    data: new Date().toISOString().split('T')[0],
    turnos: { t1: '', t2: '', t3: '' },
    fruta: { l1: 'MANGA', l2: 'MANGA' },
    tipoProduto: { l1: 'CONVENCIONAL', l2: 'CONVENCIONAL' }
  });

  const hours = Array.from({ length: 24 }, (_, i) => {
    const h = (7 + i) % 24;
    return `${h.toString().padStart(2, '0')}:00`;
  });

  const [hourlyData, setHourlyData] = useState<HourlyRow[]>(
    hours.map(h => ({
      hora: h, escaldadoraL1: '', escaldadoraL2: '', inativadorL1: '', inativadorL2: '',
      finisherVel: '', finisherEnxague: '', finisherUmidade: '',
      tassinoxVel: '', tassinoxEnxague: '', tassinoxUmidade: ''
    }))
  );

  const [grinding, setGrinding] = useState({
    l1: { inicio: '', fim: '' },
    l2: { inicio: '', fim: '' }
  });

  const [filterMonitoring, setFilterMonitoring] = useState({
    finisher1: 'Íntegro', finisher2: 'Íntegro', tassinox: 'Íntegro', materialEncontrado: 'Não', descricao: ''
  });

  const [occurrences, setOccurrences] = useState(Array(5).fill(null).map(() => ({ inicio: '', fim: '', codOcorr: '', codSetor: '', detalhamento: '' })));

  const [footer, setFooter] = useState({ operador: '', lider: '', responsavelProd: '' });

  const updateHourly = (idx: number, field: keyof HourlyRow, val: string) => {
    const newData = [...hourlyData];
    newData[idx] = { ...newData[idx], [field]: val };
    setHourlyData(newData);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ header, hourlyData, grinding, filterMonitoring, occurrences, footer });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-10 animate-fadeIn">
      {/* Header Info */}
      <div className="bg-gray-50 dark:bg-gray-900/50 p-8 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Data</label>
            <input type="date" value={header.data} onChange={e => setHeader({...header, data: e.target.value})} className="w-full p-2.5 border rounded-xl" />
          </div>
          {['Turno 1', 'Turno 2', 'Turno 3'].map((t, i) => (
             <div key={t} className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t} (h)</label>
                <input value={(header.turnos as any)[`t${i+1}`]} onChange={e => setHeader({...header, turnos: {...header.turnos, [`t${i+1}`]: e.target.value}})} className="w-full p-2.5 border rounded-xl" placeholder="00:00 às 00:00" />
             </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-4 border-t border-gray-200 dark:border-gray-600">
           {['Linha 1', 'Linha 2'].map((l, i) => (
             <div key={l} className="space-y-4">
                <span className="text-[10px] font-black text-lime-800 uppercase tracking-widest">{l}</span>
                <div className="grid grid-cols-2 gap-4">
                   <select 
                     value={(header.fruta as any)[`l${i+1}`]} 
                     onChange={e => setHeader({...header, fruta: {...header.fruta, [`l${i+1}`]: e.target.value}})} 
                     className="p-2 border rounded-xl text-xs"
                   >
                      <option value="">Selecione...</option>
                      {fruits.map(f => <option key={f.id} value={f.name}>{f.name}</option>)}
                   </select>
                   <select value={(header.tipoProduto as any)[`l${i+1}`]} onChange={e => setHeader({...header, tipoProduto: {...header.tipoProduto, [`l${i+1}`]: e.target.value}})} className="p-2 border rounded-xl text-xs">
                      <option value="CONVENCIONAL">CONVENCIONAL</option>
                      <option value="ORGÂNICO">ORGÂNICO</option>
                   </select>
                </div>
             </div>
           ))}
        </div>
      </div>

      {/* Hourly Log Table */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="bg-lime-800 px-6 py-4">
           <h4 className="text-white font-black text-xs uppercase tracking-widest">Tabela de Operação Horária</h4>
        </div>
        
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto max-h-[600px] custom-scrollbar">
           <table className="w-full text-left text-[9px]">
              <thead className="bg-gray-100 dark:bg-gray-700 border-b font-black uppercase text-gray-500 sticky top-0 z-10">
                 <tr>
                    <th className="p-2 border-r bg-gray-100 dark:bg-gray-700">Hora</th>
                    <th className="p-2 text-center" colSpan={2}>Escaldadora (°C)</th>
                    <th className="p-2 text-center" colSpan={2}>Inativador (°C)</th>
                    <th className="p-2 text-center bg-lime-50/50" colSpan={3}>Turbo Finisher</th>
                    <th className="p-2 text-center bg-blue-50/50" colSpan={3}>Turbo Tassinox</th>
                 </tr>
                 <tr className="bg-gray-50 dark:bg-gray-900/50 border-b">
                    <th className="p-1 border-r"></th>
                    <th className="p-1 text-center">L1</th><th className="p-1 text-center border-r">L2</th>
                    <th className="p-1 text-center">L1</th><th className="p-1 text-center border-r">L2</th>
                    <th className="p-1 text-center">Vel</th><th className="p-1 text-center">Enx</th><th className="p-1 text-center border-r">Umid</th>
                    <th className="p-1 text-center">Vel</th><th className="p-1 text-center">Enx</th><th className="p-1 text-center">Umid</th>
                 </tr>
              </thead>
              <tbody className="divide-y">
                 {hourlyData.map((row, idx) => (
                   <tr key={idx} className="hover:bg-gray-50 dark:bg-gray-900/50 transition-colors">
                      <td className="p-1 border-r font-bold text-gray-400 text-center">{row.hora}</td>
                      <td className="p-1"><input value={row.escaldadoraL1} onChange={e => updateHourly(idx, 'escaldadoraL1', e.target.value)} className="w-full p-1 border-none text-center bg-transparent" /></td>
                      <td className="p-1 border-r"><input value={row.escaldadoraL2} onChange={e => updateHourly(idx, 'escaldadoraL2', e.target.value)} className="w-full p-1 border-none text-center bg-transparent" /></td>
                      <td className="p-1"><input value={row.inativadorL1} onChange={e => updateHourly(idx, 'inativadorL1', e.target.value)} className="w-full p-1 border-none text-center bg-transparent" /></td>
                      <td className="p-1 border-r"><input value={row.inativadorL2} onChange={e => updateHourly(idx, 'inativadorL2', e.target.value)} className="w-full p-1 border-none text-center bg-transparent" /></td>
                      <td className="p-1 bg-lime-50/20"><input value={row.finisherVel} onChange={e => updateHourly(idx, 'finisherVel', e.target.value)} className="w-full p-1 border-none text-center bg-transparent" /></td>
                      <td className="p-1 bg-lime-50/20"><input value={row.finisherEnxague} onChange={e => updateHourly(idx, 'finisherEnxague', e.target.value)} className="w-full p-1 border-none text-center bg-transparent" /></td>
                      <td className="p-1 bg-lime-50/20 border-r"><input value={row.finisherUmidade} onChange={e => updateHourly(idx, 'finisherUmidade', e.target.value)} className="w-full p-1 border-none text-center bg-transparent" /></td>
                      <td className="p-1 bg-blue-50/20"><input value={row.tassinoxVel} onChange={e => updateHourly(idx, 'tassinoxVel', e.target.value)} className="w-full p-1 border-none text-center bg-transparent" /></td>
                      <td className="p-1 bg-blue-50/20"><input value={row.tassinoxEnxague} onChange={e => updateHourly(idx, 'tassinoxEnxague', e.target.value)} className="w-full p-1 border-none text-center bg-transparent" /></td>
                      <td className="p-1 bg-blue-50/20"><input value={row.tassinoxUmidade} onChange={e => updateHourly(idx, 'tassinoxUmidade', e.target.value)} className="w-full p-1 border-none text-center bg-transparent" /></td>
                   </tr>
                 ))}
              </tbody>
           </table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden p-4 space-y-4 max-h-[500px] overflow-y-auto custom-scrollbar bg-gray-50 dark:bg-gray-900/50">
           {hourlyData.map((row, idx) => (
             <div key={idx} className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm space-y-3">
                <div className="flex justify-between items-center border-b pb-2">
                   <span className="text-[10px] font-black text-lime-800 uppercase tracking-widest">{row.hora}</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-1">
                      <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Escaldadora (°C) L1/L2</label>
                      <div className="flex gap-2">
                         <input value={row.escaldadoraL1} onChange={e => updateHourly(idx, 'escaldadoraL1', e.target.value)} className="flex-1 min-w-0 p-2 border rounded-lg text-xs text-center" placeholder="L1" />
                         <input value={row.escaldadoraL2} onChange={e => updateHourly(idx, 'escaldadoraL2', e.target.value)} className="flex-1 min-w-0 p-2 border rounded-lg text-xs text-center" placeholder="L2" />
                      </div>
                   </div>
                   <div className="space-y-1">
                      <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Inativador (°C) L1/L2</label>
                      <div className="flex gap-2">
                         <input value={row.inativadorL1} onChange={e => updateHourly(idx, 'inativadorL1', e.target.value)} className="flex-1 min-w-0 p-2 border rounded-lg text-xs text-center" placeholder="L1" />
                         <input value={row.inativadorL2} onChange={e => updateHourly(idx, 'inativadorL2', e.target.value)} className="flex-1 min-w-0 p-2 border rounded-lg text-xs text-center" placeholder="L2" />
                      </div>
                   </div>
                   <div className="col-span-2 space-y-1 bg-lime-50/30 p-2 rounded-xl">
                      <label className="text-[8px] font-black text-lime-800 uppercase tracking-widest">Turbo Finisher (Vel/Enx/Umid)</label>
                      <div className="flex gap-2">
                         <input value={row.finisherVel} onChange={e => updateHourly(idx, 'finisherVel', e.target.value)} className="flex-1 min-w-0 p-2 border rounded-lg text-xs text-center" placeholder="Vel" />
                         <input value={row.finisherEnxague} onChange={e => updateHourly(idx, 'finisherEnxague', e.target.value)} className="flex-1 min-w-0 p-2 border rounded-lg text-xs text-center" placeholder="Enx" />
                         <input value={row.finisherUmidade} onChange={e => updateHourly(idx, 'finisherUmidade', e.target.value)} className="flex-1 min-w-0 p-2 border rounded-lg text-xs text-center" placeholder="Umid" />
                      </div>
                   </div>
                   <div className="col-span-2 space-y-1 bg-blue-50/30 p-2 rounded-xl">
                      <label className="text-[8px] font-black text-blue-800 uppercase tracking-widest">Turbo Tassinox (Vel/Enx/Umid)</label>
                      <div className="flex gap-2">
                         <input value={row.tassinoxVel} onChange={e => updateHourly(idx, 'tassinoxVel', e.target.value)} className="flex-1 min-w-0 p-2 border rounded-lg text-xs text-center" placeholder="Vel" />
                         <input value={row.tassinoxEnxague} onChange={e => updateHourly(idx, 'tassinoxEnxague', e.target.value)} className="flex-1 min-w-0 p-2 border rounded-lg text-xs text-center" placeholder="Enx" />
                         <input value={row.tassinoxUmidade} onChange={e => updateHourly(idx, 'tassinoxUmidade', e.target.value)} className="flex-1 min-w-0 p-2 border rounded-lg text-xs text-center" placeholder="Umid" />
                      </div>
                   </div>
                </div>
             </div>
           ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         {/* Grinding Time */}
         <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm space-y-6">
            <h4 className="text-[10px] font-black text-lime-800 uppercase tracking-widest border-b pb-2">Tempo de Moagem</h4>
            <div className="space-y-4">
               {['Linha 1', 'Linha 2'].map((l, i) => (
                  <div key={l} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
                     <span className="text-[10px] font-bold text-gray-400 uppercase w-20">{l}</span>
                     <div className="flex gap-2 flex-1">
                        <input value={(grinding as any)[`l${i+1}`].inicio} onChange={e => setGrinding({...grinding, [`l${i+1}`]: {...(grinding as any)[`l${i+1}`], inicio: e.target.value}})} className="w-full p-2 border rounded-xl text-center text-sm" placeholder="Início (h)" />
                        <input value={(grinding as any)[`l${i+1}`].fim} onChange={e => setGrinding({...grinding, [`l${i+1}`]: {...(grinding as any)[`l${i+1}`], fim: e.target.value}})} className="w-full p-2 border rounded-xl text-center text-sm" placeholder="Fim (h)" />
                     </div>
                  </div>
               ))}
            </div>
         </div>

         {/* Filter Monitoring */}
         <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm space-y-6">
            <h4 className="text-[10px] font-black text-lime-800 uppercase tracking-widest border-b pb-2">Monitoramento do Filtro PPRO 6</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[10px]">
               {['Finisher 1', 'Finisher 2', 'Tassinox'].map(f => (
                  <div key={f} className="flex flex-col gap-1">
                     <span className="font-bold text-gray-500">{f}</span>
                     <select value={(filterMonitoring as any)[f.toLowerCase().replace(' ', '')]} onChange={e => setFilterMonitoring({...filterMonitoring, [f.toLowerCase().replace(' ', '')]: e.target.value})} className="p-1.5 border rounded-lg">
                        <option>Íntegro</option>
                        <option>Danificado</option>
                     </select>
                  </div>
               ))}
               <div className="flex flex-col gap-1">
                  <span className="font-bold text-gray-500">Mat. Encontrado?</span>
                  <select value={filterMonitoring.materialEncontrado} onChange={e => setFilterMonitoring({...filterMonitoring, materialEncontrado: e.target.value})} className="p-1.5 border rounded-lg">
                     <option>Sim</option>
                     <option>Não</option>
                  </select>
               </div>
               <div className="col-span-full space-y-1">
                  <span className="font-bold text-gray-500">Descrição/Obs</span>
                  <input value={filterMonitoring.descricao} onChange={e => setFilterMonitoring({...filterMonitoring, descricao: e.target.value})} className="w-full p-2 border rounded-xl" />
               </div>
            </div>
         </div>
      </div>

      {/* Occurrences */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="bg-gray-800 px-6 py-4">
           <h4 className="text-white font-black text-xs uppercase tracking-widest">Relatos de Paradas e Ocorrências</h4>
        </div>
        
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-[9px]">
             <thead className="bg-gray-50 dark:bg-gray-900/50 border-b font-black text-gray-400">
               <tr>
                 <th className="p-2 w-32">Início / Fim (h)</th>
                 <th className="p-2 w-20 text-center">Cód. Ocorr.</th>
                 <th className="p-2 w-20 text-center">Cód. Setor</th>
                 <th className="p-2">Detalhamento da Ocorrência</th>
               </tr>
             </thead>
             <tbody className="divide-y">
                {occurrences.map((occ, idx) => (
                  <tr key={idx}>
                     <td className="p-1 flex gap-1">
                        <input value={occ.inicio} onChange={e => { const n = [...occurrences]; n[idx].inicio = e.target.value; setOccurrences(n); }} className="w-full p-1 border rounded text-center" placeholder="Início" />
                        <input value={occ.fim} onChange={e => { const n = [...occurrences]; n[idx].fim = e.target.value; setOccurrences(n); }} className="w-full p-1 border rounded text-center" placeholder="Fim" />
                     </td>
                     <td className="p-1"><input value={occ.codOcorr} onChange={e => { const n = [...occurrences]; n[idx].codOcorr = e.target.value; setOccurrences(n); }} className="w-full p-1 border rounded text-center" /></td>
                     <td className="p-1"><input value={occ.codSetor} onChange={e => { const n = [...occurrences]; n[idx].codSetor = e.target.value; setOccurrences(n); }} className="w-full p-1 border rounded text-center" /></td>
                     <td className="p-1"><input value={occ.detalhamento} onChange={e => { const n = [...occurrences]; n[idx].detalhamento = e.target.value; setOccurrences(n); }} className="w-full p-1 border rounded" /></td>
                  </tr>
                ))}
             </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden p-4 space-y-4 bg-gray-50 dark:bg-gray-900/50">
           {occurrences.map((occ, idx) => (
             <div key={idx} className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm space-y-3">
                <div className="grid grid-cols-2 gap-3">
                   <div className="space-y-1">
                      <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Início / Fim</label>
                      <div className="flex gap-2">
                         <input value={occ.inicio} onChange={e => { const n = [...occurrences]; n[idx].inicio = e.target.value; setOccurrences(n); }} className="flex-1 min-w-0 p-2 border rounded-lg text-xs text-center" placeholder="Início" />
                         <input value={occ.fim} onChange={e => { const n = [...occurrences]; n[idx].fim = e.target.value; setOccurrences(n); }} className="flex-1 min-w-0 p-2 border rounded-lg text-xs text-center" placeholder="Fim" />
                      </div>
                   </div>
                   <div className="space-y-1">
                      <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Cód. Ocorr / Setor</label>
                      <div className="flex gap-2">
                         <input value={occ.codOcorr} onChange={e => { const n = [...occurrences]; n[idx].codOcorr = e.target.value; setOccurrences(n); }} className="flex-1 min-w-0 p-2 border rounded-lg text-xs text-center" placeholder="Ocorr" />
                         <input value={occ.codSetor} onChange={e => { const n = [...occurrences]; n[idx].codSetor = e.target.value; setOccurrences(n); }} className="flex-1 min-w-0 p-2 border rounded-lg text-xs text-center" placeholder="Setor" />
                      </div>
                   </div>
                   <div className="col-span-2 space-y-1">
                      <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Detalhamento</label>
                      <input value={occ.detalhamento} onChange={e => { const n = [...occurrences]; n[idx].detalhamento = e.target.value; setOccurrences(n); }} className="w-full p-2 border rounded-lg text-xs" placeholder="Descreva a ocorrência..." />
                   </div>
                </div>
             </div>
           ))}
        </div>
      </div>

      <div className="bg-gray-50 dark:bg-gray-900/50 p-8 rounded-3xl grid grid-cols-1 md:grid-cols-3 gap-6">
         {['Operador', 'Líder / Supervisor', 'Resp. Produção'].map((f, i) => (
           <div key={f} className="space-y-1">
              <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{f}</label>
              <input value={(footer as any)[['operador', 'lider', 'responsavelProd'][i]]} onChange={e => setFooter({...footer, [['operador', 'lider', 'responsavelProd'][i]]: e.target.value})} className="w-full p-2.5 border rounded-xl font-bold bg-white dark:bg-gray-800" />
           </div>
         ))}
      </div>

      <div className="pt-6 flex justify-end">
        <button disabled={isSubmitting} className="px-12 py-4 bg-lime-800 hover:bg-lime-900 text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl shadow-xl transition-all flex items-center gap-2">
          {isSubmitting ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-industry"></i>}
          <span>Salvar Registro de Despolpamento</span>
        </button>
      </div>
    </form>
  );
};

export default PulpingOperationForm;