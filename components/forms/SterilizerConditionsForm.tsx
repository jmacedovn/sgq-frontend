import React, { useState } from 'react';

type Status = 'OK' | 'Ñ OK' | null;

interface HourlySterilizerRow {
  hora: string;
  tempSteril: string;
  vazao: string;
  holding: string;
}

const SterilizerConditionsForm: React.FC<{ onSave: (data: any) => void, isSubmitting: boolean }> = ({ onSave, isSubmitting }) => {
  const [header, setHeader] = useState({
    data: new Date().toISOString().split('T')[0],
    lote: '',
    produtoTipo: 'CONCENTRADO' as 'CONCENTRADO' | 'INTEGRAL',
    produtoCategoria: 'CONVENCIONAL' as 'CONVENCIONAL' | 'ORGÂNICO'
  });

  const [hourlyRows, setHourlyRows] = useState<HourlySterilizerRow[]>(
    Array(8).fill(null).map((_, i) => ({ hora: '', tempSteril: '', vazao: '', holding: '' }))
  );

  const [processParams, setProcessParams] = useState([
    { id: '1', label: 'TESTE VÁLVULA DE RECICLO', status: null as Status },
    { id: '2', label: 'PRÉ-AQUECEDOR / SAÍDA AQUECEDOR (°C)', status: null as Status, value: '' },
    { id: '3', label: 'TEMPERATURA DO DESAERADOR (°C)', status: null as Status, value: '' },
    { id: '4', label: 'PRESSÃO DE VÁCUO DESAERADOR (BAR)', status: null as Status, value: '' },
    { id: '5', label: 'TEMPERATURA DA ÁGUA QUENTE (°C)', status: null as Status, value: '' },
    { id: '6', label: 'TEMPERATURA FINAL DE HOLDING (°C)', status: null as Status, value: '' },
    { id: '7', label: 'ENTRADA DE PRODUTO (KG)', status: null as Status, value: '' },
    { id: '8', label: 'SAÍDA RESFRIAMENTO / PRODUTO (°C)', status: null as Status, value: '' },
  ]);

  const [asepticTemps, setAsepticTemps] = useState([
    { id: 't1', label: 'TEMP. CABEÇA CÂMARA (ºC)', head1: null as Status, head2: null as Status },
    { id: 't2', label: 'PUFFING', head1: null as Status, head2: null as Status },
    { id: 't3', label: 'TEMP. BARREIRAS VAPOR CABEÇA (ºC)', head1: '', head2: '' },
    { id: 't4', label: 'TEMP. PRODUTO (ºC)', head1: '', head2: '' },
    { id: 't5', label: 'PRESSÃO VAPOR BARREIRAS/CABEÇAS', head1: null as Status, head2: null as Status },
    { id: 't6', label: 'REVISÃO MANUAL BARREIRAS VAPOR', head1: null as Status, head2: null as Status },
    { id: 't7', label: 'INSPEÇÃO DA TAMPA CABEÇA', head1: null as Status, head2: null as Status },
  ]);

  const [footer, setFooter] = useState({
    correcao: '', acaoCorretiva: '', observacao: '',
    operador: '', supervisor: '', responsavelProd: ''
  });

  const updateHourly = (idx: number, field: keyof HourlySterilizerRow, val: string) => {
    const n = [...hourlyRows];
    n[idx] = { ...n[idx], [field]: val };
    setHourlyRows(n);
  };

  const updateParam = (idx: number, field: 'status' | 'value', val: any) => {
    const n = [...processParams];
    (n[idx] as any)[field] = val;
    setProcessParams(n);
  };

  const updateAseptic = (idx: number, field: string, val: any) => {
    const n = [...asepticTemps];
    (n[idx] as any)[field] = val;
    setAsepticTemps(n);
  };

  const StatusToggle = ({ value, onChange }: { value: Status, onChange: (s: Status) => void }) => (
    <div className="flex gap-1">
      {(['OK', 'Ñ OK'] as const).map(s => (
        <button
          key={s}
          type="button"
          onClick={() => onChange(value === s ? null : s)}
          className={`w-10 h-7 rounded text-[8px] font-black border transition-all ${value === s ? (s === 'OK' ? 'bg-green-600 text-white' : 'bg-red-600 text-white') : 'bg-white dark:bg-gray-800 text-gray-300'}`}
        >
          {s}
        </button>
      ))}
    </div>
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ header, hourlyRows, processParams, asepticTemps, footer });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 bg-gray-50 dark:bg-gray-900/50 p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-700 shadow-sm">
        <div className="space-y-1">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Data</label>
          <input type="date" value={header.data} onChange={e => setHeader({...header, data: e.target.value})} className="w-full p-2.5 border rounded-xl" />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Lote</label>
          <input value={header.lote} onChange={e => setHeader({...header, lote: e.target.value})} className="w-full p-2.5 border rounded-xl font-bold" />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Tipo</label>
          <div className="flex gap-2 p-1 bg-white dark:bg-gray-800 border rounded-xl">
            {(['CONCENTRADO', 'INTEGRAL'] as const).map(t => (
              <button key={t} type="button" onClick={() => setHeader({...header, produtoTipo: t})} className={`flex-1 py-1.5 rounded-lg text-[9px] font-black transition-all ${header.produtoTipo === t ? 'bg-red-800 text-white' : 'text-gray-400'}`}>{t}</button>
            ))}
          </div>
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Categoria</label>
          <div className="flex gap-2 p-1 bg-white dark:bg-gray-800 border rounded-xl">
            {(['CONVENCIONAL', 'ORGÂNICO'] as const).map(t => (
              <button key={t} type="button" onClick={() => setHeader({...header, produtoCategoria: t})} className={`flex-1 py-1.5 rounded-lg text-[9px] font-black transition-all ${header.produtoCategoria === t ? 'bg-red-800 text-white' : 'text-gray-400'}`}>{t}</button>
            ))}
          </div>
        </div>
      </div>

      {/* PCC 2 Monitoring */}
      <div className="bg-white dark:bg-gray-800 rounded-[2rem] border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="bg-red-800 px-6 py-4">
           <h4 className="text-white font-black text-xs uppercase tracking-widest">Monitoramento PCC 2 - Esterilização</h4>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-[10px] text-center border-collapse">
            <thead className="bg-gray-50 dark:bg-gray-900/50 border-b font-black text-gray-500 uppercase">
               <tr>
                  <th className="p-3 border-r w-24">Hora</th>
                  {hourlyRows.map((_, i) => (
                    <th key={i} className="p-1 border-r"><input value={hourlyRows[i].hora} onChange={e => updateHourly(i, 'hora', e.target.value)} className="w-12 p-1 border rounded text-center bg-white dark:bg-gray-800" placeholder="--" /></th>
                  ))}
               </tr>
            </thead>
            <tbody className="divide-y text-gray-700 dark:text-gray-200">
               <tr>
                  <td className="p-3 font-bold bg-gray-50 dark:bg-gray-900/50 border-r text-left">Temp. Esterilização (ºC)</td>
                  {hourlyRows.map((r, i) => (
                    <td key={i} className="p-1 border-r"><input value={r.tempSteril} onChange={e => updateHourly(i, 'tempSteril', e.target.value)} className="w-full p-1.5 bg-transparent text-center font-bold" /></td>
                  ))}
               </tr>
               <tr>
                  <td className="p-3 font-bold bg-gray-50 dark:bg-gray-900/50 border-r text-left">Vazão (Kg/Hora)</td>
                  {hourlyRows.map((r, i) => (
                    <td key={i} className="p-1 border-r"><input value={r.vazao} onChange={e => updateHourly(i, 'vazao', e.target.value)} className="w-full p-1.5 bg-transparent text-center" /></td>
                  ))}
               </tr>
               <tr>
                  <td className="p-3 font-bold bg-gray-50 dark:bg-gray-900/50 border-r text-left">Holding (Segundos)</td>
                  {hourlyRows.map((r, i) => (
                    <td key={i} className="p-1 border-r"><input value={r.holding} onChange={e => updateHourly(i, 'holding', e.target.value)} className="w-full p-1.5 bg-transparent text-center" /></td>
                  ))}
               </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Process Parameters */}
        <div className="bg-white dark:bg-gray-800 rounded-[2rem] border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
          <div className="bg-gray-800 px-6 py-4">
             <h4 className="text-white font-black text-[10px] uppercase tracking-widest">Monitoramento - Parâmetros de Processo</h4>
          </div>
          <table className="w-full text-[10px]">
            <tbody className="divide-y">
               {processParams.map((p, i) => (
                 <tr key={p.id} className="hover:bg-red-50/20 transition-colors">
                    <td className="p-3 font-black text-gray-500 uppercase">{p.label}</td>
                    <td className="p-2 w-28 text-center">
                       {p.label.includes('(') ? (
                         <input value={p.value} onChange={e => updateParam(i, 'value', e.target.value)} className="w-full p-1.5 border rounded-lg text-center font-bold" placeholder="Valor" />
                       ) : null}
                    </td>
                    <td className="p-2 w-24"><StatusToggle value={p.status} onChange={s => updateParam(i, 'status', s)} /></td>
                 </tr>
               ))}
            </tbody>
          </table>
        </div>

        {/* Aseptic Parameters */}
        <div className="bg-white dark:bg-gray-800 rounded-[2rem] border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
          <div className="bg-gray-800 px-6 py-4">
             <h4 className="text-white font-black text-[10px] uppercase tracking-widest">Parâmetros de Temperatura do Asséptico</h4>
          </div>
          <table className="w-full text-[10px]">
             <thead className="bg-gray-50 dark:bg-gray-900/50 border-b font-black text-gray-400 uppercase">
                <tr>
                   <th className="p-3 text-left">Item</th>
                   <th className="p-3 w-20 text-center">Cabeça 1</th>
                   <th className="p-3 w-20 text-center">Cabeça 2</th>
                </tr>
             </thead>
             <tbody className="divide-y">
                {asepticTemps.map((p, i) => (
                  <tr key={p.id} className="hover:bg-red-50/20 transition-colors">
                     <td className="p-3 font-black text-gray-500 uppercase">{p.label}</td>
                     <td className="p-2">
                        {['t1','t2','t5','t6','t7'].includes(p.id) ? (
                           <StatusToggle value={(p as any).head1} onChange={s => updateAseptic(i, 'head1', s)} />
                        ) : (
                           <input value={(p as any).head1} onChange={e => updateAseptic(i, 'head1', e.target.value)} className="w-full p-1.5 border rounded-lg text-center" />
                        )}
                     </td>
                     <td className="p-2">
                        {['t1','t2','t5','t6','t7'].includes(p.id) ? (
                           <StatusToggle value={(p as any).head2} onChange={s => updateAseptic(i, 'head2', s)} />
                        ) : (
                           <input value={(p as any).head2} onChange={e => updateAseptic(i, 'head2', e.target.value)} className="w-full p-1.5 border rounded-lg text-center" />
                        )}
                     </td>
                  </tr>
                ))}
             </tbody>
          </table>
        </div>
      </div>

      {/* Critial Points Info (Non-editable instruction) */}
      <div className="bg-red-50 border border-red-100 p-6 rounded-3xl text-[10px] text-red-900 space-y-2">
         <h5 className="font-black uppercase tracking-widest">Pontos Críticos de Controle - Referência</h5>
         <p className="font-bold underline italic">NOTA: Quando houver diminuição em qualquer ponto, proceder recirculação imediatamente.</p>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4 opacity-75">
            <p>• Temp. Esterilização Mínima: 105 °C</p>
            <p>• Pressão Entrada Vapor Cabeça: Mín. 1,5 BAR</p>
            <p>• Vazão Limite Asséptico A: 3.420 (MC) / 4.830 (MI)</p>
            <p>• Temp. Mínima Cabeças/Barreiras: 90 °C</p>
         </div>
      </div>

      {/* Corrective Actions & Footer */}
      <div className="bg-gray-50 dark:bg-gray-900/50 p-8 rounded-[2.5rem] space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
           <div className="space-y-1"><label className="text-[10px] font-black text-gray-400 uppercase">Correção</label><textarea value={footer.correcao} onChange={e => setFooter({...footer, correcao: e.target.value})} className="w-full p-3 border rounded-xl h-20 text-xs" /></div>
           <div className="space-y-1"><label className="text-[10px] font-black text-gray-400 uppercase">Ação Corretiva</label><textarea value={footer.acaoCorretiva} onChange={e => setFooter({...footer, acaoCorretiva: e.target.value})} className="w-full p-3 border rounded-xl h-20 text-xs" /></div>
           <div className="space-y-1"><label className="text-[10px] font-black text-gray-400 uppercase">Observação</label><textarea value={footer.observacao} onChange={e => setFooter({...footer, observacao: e.target.value})} className="w-full p-3 border rounded-xl h-20 text-xs" /></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t">
           {['Operador', 'Líder/Supervisor', 'Resp. Produção'].map((l, i) => (
             <div key={l} className="space-y-1">
                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{l}</label>
                <input 
                  value={(footer as any)[['operador', 'supervisor', 'responsavelProd'][i]]} 
                  onChange={e => setFooter({...footer, [['operador', 'supervisor', 'responsavelProd'][i]]: e.target.value})} 
                  className="w-full p-2.5 border rounded-xl font-bold bg-white dark:bg-gray-800" 
                />
             </div>
           ))}
        </div>
      </div>

      <div className="pt-6 flex justify-end">
        <button disabled={isSubmitting} className="px-12 py-4 bg-red-800 hover:bg-red-900 text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl shadow-xl transition-all flex items-center gap-2">
          {isSubmitting ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-save"></i>}
          <span>Salvar Registro de Operação</span>
        </button>
      </div>
    </form>
  );
};

export default SterilizerConditionsForm;