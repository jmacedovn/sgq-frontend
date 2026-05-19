
import React, { useState, useEffect, useRef } from 'react';
import SignaturePad from 'signature_pad';
import { supabase } from '../../lib/supabase';
import { api } from '../../lib/api';
import { FormType } from '../../types';
import { useFruits } from '../../lib/useFruits';

interface MicroRow {
  parameter: string;
  sample1: string;
  sample2: string;
  sample3: string;
  resultDate1: string; 
  resultDate2: string; 
}

const MicrobiologicalAnalysisForm: React.FC<{ onSave: (data: any) => void, isSubmitting: boolean, initialData?: any }> = ({ onSave, isSubmitting, initialData }) => {
  const { fruits } = useFruits();
  const [header, setHeader] = useState(initialData?.header || {
    data: new Date().toISOString().split('T')[0],
    fruta: 'MANGA',
    frutaOutro: '',
    produto: 'CONCENTRADO',
    categoria: 'CONVENCIONAL',
    lote: ''
  });

  const [availableBatches, setAvailableBatches] = useState<any[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const signaturePadRef = useRef<SignaturePad | null>(null);

  useEffect(() => {
    if (canvasRef.current) {
        const pad = new SignaturePad(canvasRef.current, {
            backgroundColor: 'rgba(255, 255, 255, 0)',
            penColor: 'black',
        });
        signaturePadRef.current = pad;

        const resizeCanvas = () => {
            const canvas = canvasRef.current;
            if (canvas) {
                const ratio = Math.max(window.devicePixelRatio || 1, 1);
                canvas.width = canvas.offsetWidth * ratio;
                canvas.height = canvas.offsetHeight * ratio;
                const ctx = canvas.getContext("2d");
                if (ctx) ctx.scale(ratio, ratio);
                pad.clear();
            }
        };

        window.addEventListener("resize", resizeCanvas);
        resizeCanvas();

        return () => {
            window.removeEventListener("resize", resizeCanvas);
            pad.off();
        };
    }
  }, []);

  useEffect(() => {
    const fetchBatches = async () => {
      try {
        const data = await api.getRecords('records', { 
          form_type: FormType.BATCH_GENERATION,
          order: 'timestamp',
          orderDirection: 'desc',
          limit: 50
        });
        
        if (data) {
          const uniqueBatches = Array.from(new Map(data.map((r: any) => {
            const d = r.data || r;
            return [d?.generatedCode, d];
          })).values())
            .filter((b: any) => b && b.generatedCode);
          setAvailableBatches(uniqueBatches);
        }
      } catch (err) {
        console.error('Erro ao buscar lotes:', err);
      }
    };
    fetchBatches();
  }, []);

  useEffect(() => {
    if (header.lote && availableBatches.length > 0) {
      const selectedBatch = availableBatches.find(b => b.generatedCode === header.lote);
      if (selectedBatch && selectedBatch.inputs) {
        setHeader(prev => ({
          ...prev,
          fruta: selectedBatch.inputs.fruta || prev.fruta,
          produto: selectedBatch.inputs.produto || prev.produto,
          categoria: selectedBatch.inputs.categoria || prev.categoria
        }));
      }
    }
  }, [header.lote, availableBatches]);

  const parametersList = [
    'Contagem Total (UFC/mL)',
    'Bolores e Leveduras (UFC/mL)',
    'Coliformes Totais',
    'E.coli',
    'Bactérias Lácticas (UFC/mL)',
    'TAB',
    'VISTO'
  ];

  const [rows, setRows] = useState<MicroRow[]>(initialData?.rows || 
    parametersList.map(p => ({ parameter: p, sample1: '', sample2: '', sample3: '', resultDate1: '', resultDate2: '' }))
  );

  const [footer, setFooter] = useState(initialData?.footer || {
    observacao: '',
    verificadoPor: '', 
    dataVerificacao: new Date().toISOString().split('T')[0]
  });

  const updateRow = (idx: number, field: keyof MicroRow, value: string) => {
    const newRows = [...rows];
    newRows[idx] = { ...newRows[idx], [field]: value };
    setRows(newRows);
  };

  const clearSignature = () => {
    signaturePadRef.current?.clear();
    setFooter({ ...footer, verificadoPor: '' });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let signatureData = footer.verificadoPor;
    if (signaturePadRef.current && !signaturePadRef.current.isEmpty()) {
        signatureData = signaturePadRef.current.toDataURL();
    }
    onSave({ header, rows, footer: { ...footer, verificadoPor: signatureData } });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8 animate-fadeIn">
      <div className="bg-fuchsia-50 p-4 md:p-8 rounded-2xl md:rounded-[2.5rem] border border-fuchsia-100 shadow-sm space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-fuchsia-800 uppercase tracking-widest">Data Amostragem</label>
            <input type="date" value={header.data} onChange={e => setHeader({...header, data: e.target.value})} className="w-full p-2.5 border border-fuchsia-200 rounded-xl bg-white dark:bg-gray-800" />
          </div>
          <div className="space-y-1 relative group">
            <label className="text-[10px] font-black text-fuchsia-800 uppercase tracking-widest flex items-center gap-1">Lote</label>
            <div className="relative">
              <select 
                value={header.lote} 
                onChange={e => setHeader({...header, lote: e.target.value})}
                className="w-full p-2.5 border border-fuchsia-200 rounded-xl font-bold bg-white dark:bg-gray-800 outline-none focus:ring-2 focus:ring-fuchsia-500 appearance-none"
              >
                <option value="">Selecione um Lote...</option>
                {availableBatches.map(b => (
                  <option key={b.generatedCode} value={b.generatedCode}>
                    {b.generatedCode} {b.inputs?.fruta ? `- ${b.inputs.fruta.replace(/_/g, ' ')}` : ''}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-fuchsia-600">
                <i className="fas fa-chevron-down text-xs"></i>
              </div>
            </div>
          </div>
          <div className="space-y-1">
              <label className="text-[10px] font-black text-fuchsia-800 uppercase tracking-widest">Fruta</label>
              <select value={header.fruta} onChange={e => setHeader({...header, fruta: e.target.value})} className="w-full p-2.5 border border-fuchsia-200 rounded-xl bg-white dark:bg-gray-800 font-bold outline-none">
                 {fruits.map(f => <option key={f.id} value={f.name}>{f.name}</option>)}
              </select>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 pt-4 border-t border-fuchsia-200">
           <div className="space-y-1">
              <label className="text-[10px] font-black text-fuchsia-800 uppercase tracking-widest">Tipo Produto</label>
              <div className="flex gap-2 p-1 bg-white dark:bg-gray-800 border border-fuchsia-200 rounded-xl">
                 {(['CONCENTRADO', 'INTEGRAL'] as const).map(p => (
                    <button key={p} type="button" onClick={() => setHeader({...header, produto: p})} className={`flex-1 py-1.5 rounded-lg text-[9px] font-black transition-all ${header.produto === p ? 'bg-fuchsia-700 text-white shadow-md' : 'text-gray-400'}`}>{p}</button>
                 ))}
              </div>
           </div>
           <div className="space-y-1">
              <label className="text-[10px] font-black text-fuchsia-800 uppercase tracking-widest">Categoria</label>
              <div className="flex gap-2 p-1 bg-white dark:bg-gray-800 border border-fuchsia-200 rounded-xl">
                 {(['CONVENCIONAL', 'ORGÂNICO'] as const).map(c => (
                    <button key={c} type="button" onClick={() => setHeader({...header, categoria: c})} className={`flex-1 py-1.5 rounded-lg text-[9px] font-black transition-all ${header.categoria === c ? 'bg-fuchsia-700 text-white shadow-md' : 'text-gray-400'}`}>{c}</button>
                 ))}
              </div>
           </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl md:rounded-[2.5rem] border border-gray-100 dark:border-gray-700 shadow-xl overflow-hidden">
         <div className="bg-fuchsia-800 px-6 md:px-8 py-4 md:py-5">
            <h4 className="text-white font-black text-xs uppercase tracking-[0.2em]">Controle Microbiológico</h4>
         </div>
         {/* Desktop Table View */}
         <div className="hidden md:block overflow-x-auto custom-scrollbar">
            <table className="w-full text-[11px] text-left min-w-[700px]">
               <thead className="bg-gray-50 dark:bg-gray-900/50 border-b font-black text-gray-500 uppercase">
                  <tr>
                     <th className="p-4 w-1/3 min-w-[150px]">Parâmetro</th>
                     <th className="p-4 text-center">Amostra 1</th>
                     <th className="p-4 text-center">Amostra 2</th>
                     <th className="p-4 text-center">Amostra 3</th>
                     <th className="p-4 text-center">Data Res.</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-gray-100">
                  {rows.map((row, idx) => {
                     const isVisto = row.parameter === 'VISTO';
                     return (
                        <tr key={idx} className={`${isVisto ? 'bg-fuchsia-50/50' : 'hover:bg-fuchsia-50/10'} transition-colors group`}>
                           <td className={`p-3 pl-6 font-bold ${isVisto ? 'text-fuchsia-800 uppercase tracking-widest' : 'text-gray-700 dark:text-gray-200'}`}>{row.parameter}</td>
                           <td className="p-2"><input value={row.sample1} onChange={e => updateRow(idx, 'sample1', e.target.value)} className="w-full p-2 border border-gray-200 dark:border-gray-600 rounded-lg text-center outline-none focus:border-fuchsia-500 bg-white dark:bg-gray-800" placeholder={isVisto ? 'Assinatura' : '--'} /></td>
                           <td className="p-2"><input value={row.sample2} onChange={e => updateRow(idx, 'sample2', e.target.value)} className="w-full p-2 border border-gray-200 dark:border-gray-600 rounded-lg text-center outline-none focus:border-fuchsia-500 bg-white dark:bg-gray-800" placeholder={isVisto ? 'Assinatura' : '--'} /></td>
                           <td className="p-2"><input value={row.sample3} onChange={e => updateRow(idx, 'sample3', e.target.value)} className="w-full p-2 border border-gray-200 dark:border-gray-600 rounded-lg text-center outline-none focus:border-fuchsia-500 bg-white dark:bg-gray-800" placeholder={isVisto ? 'Assinatura' : '--'} /></td>
                           <td className="p-2"><input type="date" value={row.resultDate1} onChange={e => updateRow(idx, 'resultDate1', e.target.value)} className="w-full p-2 border border-gray-200 dark:border-gray-600 rounded-lg text-center text-[10px] outline-none bg-white dark:bg-gray-800" /></td>
                        </tr>
                     );
                  })}
               </tbody>
            </table>
         </div>

         {/* Mobile Card View */}
         <div className="md:hidden divide-y divide-gray-100">
            {rows.map((row, idx) => {
               const isVisto = row.parameter === 'VISTO';
               return (
                  <div key={idx} className={`p-4 space-y-3 ${isVisto ? 'bg-fuchsia-50/50' : ''}`}>
                     <div className="flex justify-between items-center">
                        <span className={`text-[10px] font-black uppercase tracking-widest ${isVisto ? 'text-fuchsia-800' : 'text-gray-700 dark:text-gray-200'}`}>
                           {row.parameter}
                        </span>
                     </div>
                     
                     <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                           <label className="text-[8px] font-bold text-gray-400 uppercase">Amostra 1</label>
                           <input 
                              value={row.sample1} 
                              onChange={e => updateRow(idx, 'sample1', e.target.value)} 
                              className="w-full p-2 border border-gray-200 dark:border-gray-600 rounded-lg text-center text-[10px] bg-white dark:bg-gray-800" 
                              placeholder={isVisto ? 'Assinatura' : '--'} 
                           />
                        </div>
                        <div className="space-y-1">
                           <label className="text-[8px] font-bold text-gray-400 uppercase">Amostra 2</label>
                           <input 
                              value={row.sample2} 
                              onChange={e => updateRow(idx, 'sample2', e.target.value)} 
                              className="w-full p-2 border border-gray-200 dark:border-gray-600 rounded-lg text-center text-[10px] bg-white dark:bg-gray-800" 
                              placeholder={isVisto ? 'Assinatura' : '--'} 
                           />
                        </div>
                        <div className="space-y-1">
                           <label className="text-[8px] font-bold text-gray-400 uppercase">Amostra 3</label>
                           <input 
                              value={row.sample3} 
                              onChange={e => updateRow(idx, 'sample3', e.target.value)} 
                              className="w-full p-2 border border-gray-200 dark:border-gray-600 rounded-lg text-center text-[10px] bg-white dark:bg-gray-800" 
                              placeholder={isVisto ? 'Assinatura' : '--'} 
                           />
                        </div>
                        <div className="space-y-1">
                           <label className="text-[8px] font-bold text-gray-400 uppercase">Data Res.</label>
                           <input 
                              type="date" 
                              value={row.resultDate1} 
                              onChange={e => updateRow(idx, 'resultDate1', e.target.value)} 
                              className="w-full p-2 border border-gray-200 dark:border-gray-600 rounded-lg text-center text-[10px] bg-white dark:bg-gray-800" 
                           />
                        </div>
                     </div>
                  </div>
               );
            })}
         </div>
      </div>

      <div className="bg-gray-50 dark:bg-gray-900/50 p-4 md:p-8 rounded-2xl md:rounded-[2.5rem] space-y-6 border border-gray-100 dark:border-gray-700 shadow-inner">
         <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Observações / Não Conformidades</label>
            <textarea value={footer.observacao} onChange={e => setFooter({...footer, observacao: e.target.value})} className="w-full p-4 border border-gray-200 dark:border-gray-600 rounded-xl h-24 text-sm bg-white dark:bg-gray-800" placeholder="..." />
         </div>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t">
            <div className="space-y-2">
               <div className="flex justify-between items-end">
                  <label className="text-[10px] font-black text-fuchsia-800 uppercase tracking-widest ml-1">Visto Analista (Assinatura)</label>
                  <button type="button" onClick={clearSignature} className="text-[9px] text-red-400 hover:text-red-600 font-bold uppercase">Limpar</button>
               </div>
               <div className="w-full h-32 md:h-40 bg-white dark:bg-gray-800 border-2 border-dashed border-fuchsia-200 rounded-2xl overflow-hidden relative group hover:border-fuchsia-400 transition-colors">
                  {footer.verificadoPor && !signaturePadRef.current?.isEmpty() ? (
                     <div className="w-full h-full flex flex-col items-center justify-center relative">
                        <img src={footer.verificadoPor} alt="Assinatura" className="h-full object-contain pointer-events-none" />
                        <div className="absolute inset-0 bg-white/80 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                           <button type="button" onClick={() => setFooter({...footer, verificadoPor: ''})} className="bg-red-500 text-white px-3 py-1 rounded-full text-[9px] font-black uppercase shadow-md">Refazer</button>
                        </div>
                     </div>
                  ) : <canvas ref={canvasRef} className="w-full h-full cursor-crosshair touch-none" />}
               </div>
            </div>
            <div className="space-y-1">
               <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Data Verificação</label>
               <input type="date" value={footer.dataVerificacao} onChange={e => setFooter({...footer, dataVerificacao: e.target.value})} className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 font-bold outline-none" />
            </div>
         </div>
      </div>

      <div className="pt-4 md:pt-6 flex justify-end">
        <button disabled={isSubmitting} className="w-full md:w-auto px-12 py-4 bg-fuchsia-800 hover:bg-fuchsia-900 text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50">
          {isSubmitting ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-microscope"></i>}
          <span>Salvar Análise Microbiológica</span>
        </button>
      </div>
    </form>
  );
};

export default MicrobiologicalAnalysisForm;
