
import React, { useState } from 'react';
import { useFruits } from '../../lib/useFruits';

interface ProcessRow {
  horario: string;
  equipamento: string;
  brix: string;
  ph: string;
  pontosMarrons: string;
  pontosPretos: string;
  visto: string;
}

interface EvaporatorRow {
  horario: string;
  turno: string;
  brixLaboratorio: string;
  visto: string;
  observacoes: string;
}

const ProductionMonitoringForm: React.FC<{ onSave: (data: any) => void, isSubmitting: boolean, initialData?: any, onBack?: () => void }> = ({ onSave, isSubmitting, initialData, onBack }) => {
  const { fruits } = useFruits();
  const [header, setHeader] = useState(initialData?.header || {
    data: new Date().toISOString().split('T')[0],
    turno: '1º TURNO',
    fruta: 'MANGA',
    produtoTipo: 'CONCENTRADO',
    produtoCategoria: 'CONVENCIONAL',
    verificadoPor: '',
    observacaoGeral: ''
  });

  const [processRows, setProcessRows] = useState<ProcessRow[]>(initialData?.processRows || [
    { horario: '', equipamento: 'FINISHER', brix: '', ph: '', pontosMarrons: '', pontosPretos: '', visto: '' }
  ]);

  const [evaporatorRows, setEvaporatorRows] = useState<EvaporatorRow[]>(initialData?.evaporatorRows || [
    { horario: '', turno: header.turno, brixLaboratorio: '', visto: '', observacoes: '' }
  ]);

  const addProcessRow = () => {
    setProcessRows([...processRows, { horario: '', equipamento: 'FINISHER', brix: '', ph: '', pontosMarrons: '', pontosPretos: '', visto: '' }]);
  };

  const addEvaporatorRow = () => {
    setEvaporatorRows([...evaporatorRows, { horario: '', turno: header.turno, brixLaboratorio: '', visto: '', observacoes: '' }]);
  };

  const updateProcess = (idx: number, field: keyof ProcessRow, val: string) => {
    const newRows = [...processRows];
    (newRows[idx] as any)[field] = val;
    setProcessRows(newRows);
  };

  const updateEvaporator = (idx: number, field: keyof EvaporatorRow, val: string) => {
    const newRows = [...evaporatorRows];
    (newRows[idx] as any)[field] = val;
    setEvaporatorRows(newRows);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ header, processRows, evaporatorRows });
  };

  const equipamentos = ['FINISHER', 'HOMOGENEIZADOR', 'DECANTER', 'TASSINOX'];

  return (
    <form onSubmit={handleSubmit} className="space-y-6 animate-fadeIn">
      {/* Header Identificação */}
      <div className="bg-pink-50 p-6 rounded-2xl border border-pink-100 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
         <div className="space-y-2">
            <label className="text-[10px] font-black text-pink-700 uppercase tracking-widest">Data</label>
            <input 
              type="date" 
              className="w-full p-2.5 rounded-lg border-pink-200 border bg-white dark:bg-gray-800 outline-none focus:ring-2 focus:ring-pink-400 font-bold" 
              value={header.data}
              onChange={e => setHeader({...header, data: e.target.value})}
            />
         </div>

         <div className="space-y-2">
            <label className="text-[10px] font-black text-pink-700 uppercase tracking-widest">Turno</label>
            <div className="grid grid-cols-1 gap-1">
               {['1º TURNO', '2º TURNO', '3º TURNO'].map(t => (
                   <button 
                    type="button" 
                    key={t} 
                    onClick={() => setHeader({...header, turno: t})}
                    className={`py-1.5 text-[9px] font-bold border rounded-lg transition-all ${header.turno === t ? 'bg-pink-600 text-white border-pink-700 shadow-sm' : 'bg-white dark:bg-gray-800 border-pink-200 text-pink-400'}`}
                   >{t}</button>
               ))}
            </div>
         </div>

         <div className="space-y-2">
            <label className="text-[10px] font-black text-pink-700 uppercase tracking-widest">Fruta</label>
            <div className="grid grid-cols-2 gap-1">
               {fruits.map(f => (
                   <button 
                    type="button" 
                    key={f.id} 
                    onClick={() => setHeader({...header, fruta: f.name})}
                    className={`py-1.5 text-[8px] font-bold border rounded-lg transition-all ${header.fruta === f.name ? 'bg-pink-600 text-white border-pink-700 shadow-sm' : 'bg-white dark:bg-gray-800 border-pink-200 text-pink-400'}`}
                   >{f.name}</button>
               ))}
            </div>
         </div>

         <div className="space-y-2">
            <label className="text-[10px] font-black text-pink-700 uppercase tracking-widest">Processo</label>
            <div className="flex flex-col gap-1">
               {['CONCENTRADO', 'INTEGRAL'].map(t => (
                 <button 
                   key={t} 
                   type="button" 
                   onClick={() => setHeader({...header, produtoTipo: t})} 
                   className={`py-2 rounded-lg text-[9px] font-black border transition-all ${header.produtoTipo === t ? 'bg-pink-700 text-white border-pink-800 shadow-md' : 'bg-white dark:bg-gray-800 border-pink-200 text-pink-400'}`}
                 >
                   {t}
                 </button>
               ))}
            </div>
         </div>

         <div className="space-y-2">
            <label className="text-[10px] font-black text-pink-700 uppercase tracking-widest">Categoria</label>
            <div className="flex flex-col gap-1">
               {['CONVENCIONAL', 'ORGÂNICO'].map(c => (
                 <button 
                   key={c} 
                   type="button" 
                   onClick={() => setHeader({...header, produtoCategoria: c})} 
                   className={`py-2 rounded-lg text-[9px] font-black border transition-all ${header.produtoCategoria === c ? 'bg-pink-700 text-white border-pink-800 shadow-md' : 'bg-white dark:bg-gray-800 border-pink-200 text-pink-400'}`}
                 >
                   {c}
                 </button>
               ))}
            </div>
         </div>

         <div className="space-y-2">
            <label className="text-[10px] font-black text-pink-700 uppercase tracking-widest">Verificado Por</label>
            <input 
              type="text" 
              placeholder="Nome..."
              className="w-full p-2.5 rounded-lg border-pink-200 border bg-white dark:bg-gray-800 outline-none focus:ring-2 focus:ring-pink-400 font-bold text-xs" 
              value={header.verificadoPor}
              onChange={e => setHeader({...header, verificadoPor: e.target.value})}
            />
            {onBack && (
              <button 
                type="button" 
                onClick={onBack}
                className="w-full mt-2 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg text-[8px] font-black text-gray-400 uppercase tracking-widest hover:bg-pink-50 hover:text-pink-700 transition-all"
              >
                <i className="fas fa-arrow-left mr-1"></i> Voltar
              </button>
            )}
         </div>
      </div>

      {/* Monitoramento de Processo */}
      <div className="bg-pink-700 px-6 py-4 rounded-t-2xl flex items-center justify-between">
        <div>
          <h4 className="text-white font-black text-xs uppercase tracking-widest">Monitoramento Analítico</h4>
          <p className="text-pink-100 text-[9px] font-bold uppercase tracking-widest mt-1">Controle de Processo por Equipamento</p>
        </div>
        <button type="button" onClick={addProcessRow} className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
          <i className="fas fa-plus mr-1"></i> Adicionar Leitura
        </button>
      </div>

      {/* Desktop Table View - Process */}
      <div className="hidden md:block overflow-x-auto border border-t-0 rounded-b-2xl shadow-sm bg-white dark:bg-gray-800 custom-scrollbar">
        <table className="w-full text-sm min-w-[1000px]">
          <thead className="bg-gray-50 dark:bg-gray-900/50 text-gray-500 uppercase font-black text-[9px] tracking-widest">
            <tr className="border-b">
              <th className="px-4 py-4 text-center w-32">Horário</th>
              <th className="px-4 py-4 text-center w-48">Equipamento</th>
              <th className="px-4 py-4 text-center w-24">°Brix</th>
              <th className="px-4 py-4 text-center w-24">pH</th>
              <th className="px-4 py-4 text-center w-20">PM</th>
              <th className="px-4 py-4 text-center w-20">PP</th>
              <th className="px-4 py-4 text-center w-40">Visto</th>
              <th className="px-4 py-4 w-12"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {processRows.map((row, idx) => (
              <tr key={idx} className="hover:bg-pink-50/20 transition-colors">
                <td className="px-2 py-3">
                  <input type="time" value={row.horario} onChange={e => updateProcess(idx, 'horario', e.target.value)} className="w-full p-2.5 border border-gray-200 dark:border-gray-600 rounded-lg text-center font-bold outline-none focus:border-pink-400" />
                </td>
                <td className="px-2 py-3">
                  <select value={row.equipamento} onChange={e => updateProcess(idx, 'equipamento', e.target.value)} className="w-full p-2.5 border border-gray-200 dark:border-gray-600 rounded-lg text-center font-bold bg-white dark:bg-gray-800 text-[10px] outline-none focus:border-pink-400">
                    {equipamentos.map(eq => <option key={eq} value={eq}>{eq}</option>)}
                  </select>
                </td>
                <td className="px-1 py-3">
                  <input value={row.brix} onChange={e => updateProcess(idx, 'brix', e.target.value)} className="w-full p-2.5 border border-gray-200 dark:border-gray-600 rounded-lg text-center font-black text-pink-700 outline-none focus:border-pink-400" placeholder="0.0" />
                </td>
                <td className="px-1 py-3">
                  <input value={row.ph} onChange={e => updateProcess(idx, 'ph', e.target.value)} className="w-full p-2.5 border border-gray-200 dark:border-gray-600 rounded-lg text-center font-bold outline-none focus:border-pink-400" placeholder="0.00" />
                </td>
                <td className="px-1 py-3">
                  <input value={row.pontosMarrons} onChange={e => updateProcess(idx, 'pontosMarrons', e.target.value)} className="w-full p-2.5 border border-gray-200 dark:border-gray-600 rounded-lg text-center text-sm outline-none focus:border-pink-400" placeholder="PM" />
                </td>
                <td className="px-1 py-3">
                  <input value={row.pontosPretos} onChange={e => updateProcess(idx, 'pontosPretos', e.target.value)} className="w-full p-2.5 border border-gray-200 dark:border-gray-600 rounded-lg text-center text-sm outline-none focus:border-pink-400" placeholder="PP" />
                </td>
                <td className="px-2 py-3">
                  <input value={row.visto} onChange={e => updateProcess(idx, 'visto', e.target.value)} className="w-full p-2.5 border border-gray-200 dark:border-gray-600 rounded-lg text-center text-[10px] font-black uppercase outline-none focus:border-pink-400" placeholder="Analista" />
                </td>
                <td className="px-2 py-3 text-center">
                  <button type="button" onClick={() => setProcessRows(processRows.filter((_, i) => i !== idx))} className="text-gray-300 hover:text-red-500 transition-colors p-2">
                    <i className="fas fa-trash-alt"></i>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View - Process */}
      <div className="md:hidden space-y-4 border border-t-0 rounded-b-2xl p-4 bg-white dark:bg-gray-800 shadow-sm">
        {processRows.map((row, idx) => (
          <div key={idx} className="bg-pink-50/30 border border-pink-100 rounded-xl overflow-hidden">
            <div className="bg-pink-600 px-3 py-1.5 flex justify-between items-center">
              <span className="text-white font-black text-[9px] uppercase tracking-widest">Leitura #{idx + 1}</span>
              <button type="button" onClick={() => setProcessRows(processRows.filter((_, i) => i !== idx))} className="text-white/50 hover:text-white transition-colors">
                <i className="fas fa-trash-alt text-[10px]"></i>
              </button>
            </div>
            <div className="p-3 grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[8px] font-black text-pink-700 uppercase tracking-widest">Horário</label>
                <input type="time" value={row.horario} onChange={e => updateProcess(idx, 'horario', e.target.value)} className="w-full p-2 border border-pink-200 rounded-lg text-xs font-bold outline-none" />
              </div>
              <div className="space-y-1">
                <label className="text-[8px] font-black text-pink-700 uppercase tracking-widest">Equipamento</label>
                <select value={row.equipamento} onChange={e => updateProcess(idx, 'equipamento', e.target.value)} className="w-full p-2 border border-pink-200 rounded-lg text-[10px] font-bold bg-white dark:bg-gray-800 outline-none">
                  {equipamentos.map(eq => <option key={eq} value={eq}>{eq}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[8px] font-black text-pink-700 uppercase tracking-widest">°Brix / pH</label>
                <div className="flex gap-2">
                  <input value={row.brix} onChange={e => updateProcess(idx, 'brix', e.target.value)} className="flex-1 min-w-0 p-2 border border-pink-200 rounded-lg text-xs font-black text-pink-700 outline-none" placeholder="Brix" />
                  <input value={row.ph} onChange={e => updateProcess(idx, 'ph', e.target.value)} className="flex-1 min-w-0 p-2 border border-pink-200 rounded-lg text-xs font-bold outline-none" placeholder="pH" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[8px] font-black text-pink-700 uppercase tracking-widest">PM / PP</label>
                <div className="flex gap-2">
                  <input value={row.pontosMarrons} onChange={e => updateProcess(idx, 'pontosMarrons', e.target.value)} className="flex-1 min-w-0 p-2 border border-pink-200 rounded-lg text-xs outline-none" placeholder="PM" />
                  <input value={row.pontosPretos} onChange={e => updateProcess(idx, 'pontosPretos', e.target.value)} className="flex-1 min-w-0 p-2 border border-pink-200 rounded-lg text-xs outline-none" placeholder="PP" />
                </div>
              </div>
              <div className="col-span-2 space-y-1">
                <label className="text-[8px] font-black text-pink-700 uppercase tracking-widest">Visto</label>
                <input value={row.visto} onChange={e => updateProcess(idx, 'visto', e.target.value)} className="w-full p-2 border border-pink-200 rounded-lg text-[10px] font-black uppercase outline-none" placeholder="Analista" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Monitoramento de Evaporador (1h) */}
      <div className="bg-pink-900 px-6 py-4 rounded-t-2xl flex items-center justify-between mt-8">
        <div>
          <h4 className="text-white font-black text-xs uppercase tracking-widest">Monitoramento de Evaporador</h4>
          <p className="text-pink-100 text-[9px] font-bold uppercase tracking-widest mt-1">Controle Horário Laboratorial (1h)</p>
        </div>
        <button type="button" onClick={addEvaporatorRow} className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
          <i className="fas fa-plus mr-1"></i> Adicionar Leitura
        </button>
      </div>

      {/* Desktop Table View - Evaporator */}
      <div className="hidden md:block overflow-x-auto border border-t-0 rounded-b-2xl shadow-sm bg-white dark:bg-gray-800 custom-scrollbar">
        <table className="w-full text-sm min-w-[1000px]">
          <thead className="bg-gray-50 dark:bg-gray-900/50 text-gray-500 uppercase font-black text-[9px] tracking-widest">
            <tr className="border-b">
              <th className="px-4 py-4 text-center w-32">Horário</th>
              <th className="px-4 py-4 text-center w-32">Turno</th>
              <th className="px-4 py-4 text-center w-32">°Brix Lab</th>
              <th className="px-4 py-4 text-center w-40">Visto</th>
              <th className="px-4 py-4 text-center">Observações</th>
              <th className="px-4 py-4 w-12"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {evaporatorRows.map((row, idx) => (
              <tr key={idx} className="hover:bg-pink-50/20 transition-colors">
                <td className="px-2 py-3">
                  <input type="time" value={row.horario} onChange={e => updateEvaporator(idx, 'horario', e.target.value)} className="w-full p-2.5 border border-gray-200 dark:border-gray-600 rounded-lg text-center font-bold outline-none focus:border-pink-400" />
                </td>
                <td className="px-2 py-3">
                   <select value={row.turno} onChange={e => updateEvaporator(idx, 'turno', e.target.value)} className="w-full p-2.5 border border-gray-200 dark:border-gray-600 rounded-lg text-center font-bold bg-white dark:bg-gray-800 text-[10px] outline-none focus:border-pink-400">
                      <option value="1º TURNO">1º TURNO</option>
                      <option value="2º TURNO">2º TURNO</option>
                      <option value="3º TURNO">3º TURNO</option>
                   </select>
                </td>
                <td className="px-1 py-3">
                  <input value={row.brixLaboratorio} onChange={e => updateEvaporator(idx, 'brixLaboratorio', e.target.value)} className="w-full p-2.5 border border-gray-200 dark:border-gray-600 rounded-lg text-center font-black text-pink-900 outline-none focus:border-pink-400" placeholder="0.0" />
                </td>
                <td className="px-2 py-3">
                  <input value={row.visto} onChange={e => updateEvaporator(idx, 'visto', e.target.value)} className="w-full p-2.5 border border-gray-200 dark:border-gray-600 rounded-lg text-center text-[10px] font-black uppercase outline-none focus:border-pink-400" placeholder="Analista" />
                </td>
                <td className="px-2 py-3">
                  <input value={row.observacoes} onChange={e => updateEvaporator(idx, 'observacoes', e.target.value)} className="w-full p-2.5 border border-gray-200 dark:border-gray-600 rounded-lg text-sm outline-none focus:border-pink-400" placeholder="Notas..." />
                </td>
                <td className="px-2 py-3 text-center">
                  <button type="button" onClick={() => setEvaporatorRows(evaporatorRows.filter((_, i) => i !== idx))} className="text-gray-300 hover:text-red-500 transition-colors p-2">
                    <i className="fas fa-trash-alt"></i>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View - Evaporator */}
      <div className="md:hidden space-y-4 border border-t-0 rounded-b-2xl p-4 bg-white dark:bg-gray-800 shadow-sm">
        {evaporatorRows.map((row, idx) => (
          <div key={idx} className="bg-pink-50/30 border border-pink-100 rounded-xl overflow-hidden">
            <div className="bg-pink-900 px-3 py-1.5 flex justify-between items-center">
              <span className="text-white font-black text-[9px] uppercase tracking-widest">Evaporador #{idx + 1}</span>
              <button type="button" onClick={() => setEvaporatorRows(evaporatorRows.filter((_, i) => i !== idx))} className="text-white/50 hover:text-white transition-colors">
                <i className="fas fa-trash-alt text-[10px]"></i>
              </button>
            </div>
            <div className="p-3 grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[8px] font-black text-pink-900 uppercase tracking-widest">Horário</label>
                <input type="time" value={row.horario} onChange={e => updateEvaporator(idx, 'horario', e.target.value)} className="w-full p-2 border border-pink-200 rounded-lg text-xs font-bold outline-none" />
              </div>
              <div className="space-y-1">
                <label className="text-[8px] font-black text-pink-900 uppercase tracking-widest">Turno</label>
                <select value={row.turno} onChange={e => updateEvaporator(idx, 'turno', e.target.value)} className="w-full p-2 border border-pink-200 rounded-lg text-[10px] font-bold bg-white dark:bg-gray-800 outline-none">
                  <option value="1º TURNO">1º TURNO</option>
                  <option value="2º TURNO">2º TURNO</option>
                  <option value="3º TURNO">3º TURNO</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[8px] font-black text-pink-900 uppercase tracking-widest">°Brix Lab</label>
                <input value={row.brixLaboratorio} onChange={e => updateEvaporator(idx, 'brixLaboratorio', e.target.value)} className="w-full p-2 border border-pink-200 rounded-lg text-xs font-black text-pink-900 outline-none" placeholder="0.0" />
              </div>
              <div className="space-y-1">
                <label className="text-[8px] font-black text-pink-900 uppercase tracking-widest">Visto</label>
                <input value={row.visto} onChange={e => updateEvaporator(idx, 'visto', e.target.value)} className="w-full p-2 border border-pink-200 rounded-lg text-[10px] font-black uppercase outline-none" placeholder="Analista" />
              </div>
              <div className="col-span-2 space-y-1">
                <label className="text-[8px] font-black text-pink-900 uppercase tracking-widest">Observações</label>
                <input value={row.observacoes} onChange={e => updateEvaporator(idx, 'observacoes', e.target.value)} className="w-full p-2 border border-pink-200 rounded-lg text-xs outline-none" placeholder="Notas..." />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Observações Gerais */}
      <div className="bg-gray-50 dark:bg-gray-900/50 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 mt-8">
        <label className="text-[10px] font-black text-pink-700 uppercase tracking-widest block mb-2">Observações de Produção / Ocorrências</label>
        <textarea 
          value={header.observacaoGeral} 
          onChange={e => setHeader({...header, observacaoGeral: e.target.value})}
          className="w-full p-4 border border-gray-200 dark:border-gray-600 rounded-xl h-24 text-sm outline-none focus:ring-2 focus:ring-pink-400 bg-white dark:bg-gray-800" 
          placeholder="Descreva aqui observações do turno ou qualquer informação relevante..."
        />
      </div>

      <div className="pt-6 border-t flex justify-end">
        <button disabled={isSubmitting} className="w-full md:w-auto px-12 py-4 bg-pink-700 hover:bg-pink-800 text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-xl shadow-xl transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50">
          {isSubmitting ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-check-double text-lg"></i>}
          <span>{initialData ? 'Sincronizar Edição' : 'Finalizar Monitoramento CQ'}</span>
        </button>
      </div>
    </form>
  );
};

export default ProductionMonitoringForm;
