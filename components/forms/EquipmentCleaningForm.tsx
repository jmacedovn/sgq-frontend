
import React, { useState, useRef, useEffect } from 'react';
import SignaturePad from 'signature_pad';

interface CopItemRow {
  area: string;
  linha: string;
  equipamento: string;
  detergentePh: string;
  visto: string;
}

interface BlenderRow {
  tanque: string;
  sodaPct: string;
  horario: string;
  swab: string;
  sanitizantePct: string;
  enxaguePh: string;
  visto: string;
}

interface ProcessingRow {
  area: string;
  linha: string;
  equipamento: string;
  horarioh: string;
  sodaPct: string;
  horario: string;
  acidoCitricoPh: string;
  enxaguePh: string;
  horarioSwab: string;
  swab: string;
  sanitizantePct: string;
  enxaguePhSanit: string;
  visto: string;
}

interface ClarificadorRow {
  equipamento: string;
  horarioSoda: string;
  sodaPct: string;
  horarioEnxague: string;
  enxaguePh: string;
  sodaCloroPpm: string;
  enxaguePhFinal: string;
  horarioSwab: string;
  swabUrl: string;
  visto: string;
}

interface StorageEvapRow {
  area: string;
  equipamento: string;
  horarioSoda: string;
  sodaPct: string;
  horarioEnxague: string;
  enxaguePh: string;
  horarioSwab: string;
  swabUrl: string;
  sanitizantePct: string;
  visto: string;
}

const EquipmentCleaningForm: React.FC<{ onSave: (data: any) => void, isSubmitting: boolean, initialData?: any }> = ({ onSave, isSubmitting, initialData }) => {
  const [header, setHeader] = useState(initialData?.header || {
    data: new Date().toISOString().split('T')[0],
    observacaoGeral: '*Observação: o enxague do sanitizante deve ser realizado apenas para produções orgânicas.'
  });

  // BLOCO 1: COP (Descarga e Despolpamento inicial)
  const [copRows, setCopRows] = useState<CopItemRow[]>(initialData?.copRows || [
    { area: 'Descarga', linha: '1', equipamento: 'Esteira de Descarga', detergentePh: '', visto: '' },
    { area: 'Descarga', linha: '1', equipamento: 'Tanque de Imersão', detergentePh: '', visto: '' },
    { area: 'Descarga', linha: '1', equipamento: 'Esteira de Seleção', detergentePh: '', visto: '' },
    { area: 'Descarga', linha: '1', equipamento: 'Esteira de Lavagem por Aspersores', detergentePh: '', visto: '' },
    { area: 'Descarga', linha: '2', equipamento: 'Esteira de Descarga', detergentePh: '', visto: '' },
    { area: 'Descarga', linha: '2', equipamento: 'Tanque de Imersão', detergentePh: '', visto: '' },
    { area: 'Descarga', linha: '2', equipamento: 'Esteira de Seleção', detergentePh: '', visto: '' },
    { area: 'Descarga', linha: '2', equipamento: 'Esteira de Lavagem por Aspersores', detergentePh: '', visto: '' },
    { area: 'Despolpamento', linha: '1', equipamento: 'Pré-aquecimento (Escaldadora)', detergentePh: '', visto: '' },
    { area: 'Despolpamento', linha: '2', equipamento: 'Pré-aquecimento (Escaldadora)', detergentePh: '', visto: '' },
  ]);

  // BLOCO 2: CIP - Blenders
  const [blenderRows, setBlenderRows] = useState<BlenderRow[]>(initialData?.blenderRows || [
    { tanque: 'Blender 121', sodaPct: '', horario: '', swab: '', sanitizantePct: '', enxaguePh: '', visto: '' },
    { tanque: 'Blender 122', sodaPct: '', horario: '', swab: '', sanitizantePct: '', enxaguePh: '', visto: '' },
    { tanque: 'Blender 124', sodaPct: '', horario: '', swab: '', sanitizantePct: '', enxaguePh: '', visto: '' },
    { tanque: 'Blender 125', sodaPct: '', horario: '', swab: '', sanitizantePct: '', enxaguePh: '', visto: '' },
    { tanque: 'Blender 126', sodaPct: '', horario: '', swab: '', sanitizantePct: '', enxaguePh: '', visto: '' },
    { tanque: 'Blender 127', sodaPct: '', horario: '', swab: '', sanitizantePct: '', enxaguePh: '', visto: '' },
    { tanque: 'Blender 128', sodaPct: '', horario: '', swab: '', sanitizantePct: '', enxaguePh: '', visto: '' },
    { tanque: 'Blender 603', sodaPct: '', horario: '', swab: '', sanitizantePct: '', enxaguePh: '', visto: '' },
    { tanque: 'Blender 603/1', sodaPct: '', horario: '', swab: '', sanitizantePct: '', enxaguePh: '', visto: '' },
    { tanque: 'Blender 603/2', sodaPct: '', horario: '', swab: '', sanitizantePct: '', enxaguePh: '', visto: '' },
    { tanque: 'Tanque Reprocesso', sodaPct: '', horario: '', swab: '', sanitizantePct: '', enxaguePh: '', visto: '' },
    { tanque: 'Filtro', sodaPct: '', horario: '', swab: '', sanitizantePct: '', enxaguePh: '', visto: '' },
  ]);

  // BLOCO 2: CIP - Processamento Pesado
  const [procRows, setProcRows] = useState<ProcessingRow[]>(initialData?.procRows || [
    { area: 'Despolpamento', linha: '1', equipamento: 'Despolpador', horarioh: '', sodaPct: '', horario: '', acidoCitricoPh: '', enxaguePh: '', horarioSwab: '', swab: '', sanitizantePct: '', enxaguePhSanit: '', visto: '' },
    { area: 'Despolpamento', linha: '1', equipamento: 'Inativador Enzimático', horarioh: '', sodaPct: '', horario: '', acidoCitricoPh: '', enxaguePh: '', horarioSwab: '', swab: '', sanitizantePct: '', enxaguePhSanit: '', visto: '' },
    { area: 'Despolpamento', linha: '2', equipamento: 'Despolpador', horarioh: '', sodaPct: '', horario: '', acidoCitricoPh: '', enxaguePh: '', horarioSwab: '', swab: '', sanitizantePct: '', enxaguePhSanit: '', visto: '' },
    { area: 'Despolpamento', linha: '2', equipamento: 'Inativador Enzimático', horarioh: '', sodaPct: '', horario: '', acidoCitricoPh: '', enxaguePh: '', horarioSwab: '', swab: '', sanitizantePct: '', enxaguePhSanit: '', visto: '' },
    { area: 'Refinação', linha: '1', equipamento: 'Finisher', horarioh: '', sodaPct: '', horario: '', acidoCitricoPh: '', enxaguePh: '', horarioSwab: '', swab: '', sanitizantePct: '', enxaguePhSanit: '', visto: '' },
    { area: 'Refinação', linha: '2', equipamento: 'Finisher', horarioh: '', sodaPct: '', horario: '', acidoCitricoPh: '', enxaguePh: '', horarioSwab: '', swab: '', sanitizantePct: '', enxaguePhSanit: '', visto: '' },
    { area: 'Refinação', linha: '1', equipamento: 'Decanter', horarioh: '', sodaPct: '', horario: '', acidoCitricoPh: '', enxaguePh: '', horarioSwab: '', swab: '', sanitizantePct: '', enxaguePhSanit: '', visto: '' },
    { area: 'Refinação', linha: '2', equipamento: 'Decanter', horarioh: '', sodaPct: '', horario: '', acidoCitricoPh: '', enxaguePh: '', horarioSwab: '', swab: '', sanitizantePct: '', enxaguePhSanit: '', visto: '' },
    { area: 'Refinação', linha: '1', equipamento: 'Centrífuga', horarioh: '', sodaPct: '', horario: '', acidoCitricoPh: '', enxaguePh: '', horarioSwab: '', swab: '', sanitizantePct: '', enxaguePhSanit: '', visto: '' },
    { area: 'Refinação', linha: '2', equipamento: 'Centrífuga', horarioh: '', sodaPct: '', horario: '', acidoCitricoPh: '', enxaguePh: '', horarioSwab: '', swab: '', sanitizantePct: '', enxaguePhSanit: '', visto: '' },
    { area: 'Processamento', linha: '1', equipamento: 'Tassinox', horarioh: '', sodaPct: '', horario: '', acidoCitricoPh: '', enxaguePh: '', horarioSwab: '', swab: '', sanitizantePct: '', enxaguePhSanit: '', visto: '' },
    { area: 'Processamento', linha: '2', equipamento: 'Tassinox', horarioh: '', sodaPct: '', horario: '', acidoCitricoPh: '', enxaguePh: '', horarioSwab: '', swab: '', sanitizantePct: '', enxaguePhSanit: '', visto: '' },
    { area: 'Processamento', linha: '1', equipamento: 'Homogenizador', horarioh: '', sodaPct: '', horario: '', acidoCitricoPh: '', enxaguePh: '', horarioSwab: '', swab: '', sanitizantePct: '', enxaguePhSanit: '', visto: '' },
    { area: 'Processamento', linha: '2', equipamento: 'Homogenizador', horarioh: '', sodaPct: '', horario: '', acidoCitricoPh: '', enxaguePh: '', horarioSwab: '', swab: '', sanitizantePct: '', enxaguePhSanit: '', visto: '' },
    { area: 'Evaporador', linha: 'A', equipamento: 'Evaporador A', horarioh: '', sodaPct: '', horario: '', acidoCitricoPh: '', enxaguePh: '', horarioSwab: '', swab: '', sanitizantePct: '', enxaguePhSanit: '', visto: '' },
    { area: 'Evaporador', linha: 'B', equipamento: 'Evaporador B', horarioh: '', sodaPct: '', horario: '', acidoCitricoPh: '', enxaguePh: '', horarioSwab: '', swab: '', sanitizantePct: '', enxaguePhSanit: '', visto: '' },
    { area: 'Asséptico', linha: 'A', equipamento: 'Asséptico A', horarioh: '', sodaPct: '', horario: '', acidoCitricoPh: '', enxaguePh: '', horarioSwab: '', swab: '', sanitizantePct: '', enxaguePhSanit: '', visto: '' },
    { area: 'Asséptico', linha: 'C', equipamento: 'Asséptico C', horarioh: '', sodaPct: '', horario: '', acidoCitricoPh: '', enxaguePh: '', horarioSwab: '', swab: '', sanitizantePct: '', enxaguePhSanit: '', visto: '' },
    { area: 'Asséptico', linha: 'D', equipamento: 'Asséptico D', horarioh: '', sodaPct: '', horario: '', acidoCitricoPh: '', enxaguePh: '', horarioSwab: '', swab: '', sanitizantePct: '', enxaguePhSanit: '', visto: '' },
  ]);

  const [clarificadorRows, setClarificadorRows] = useState<ClarificadorRow[]>(initialData?.clarificadorRows || [
    { equipamento: 'Tanque', horarioSoda: '', sodaPct: '', horarioEnxague: '', enxaguePh: '', sodaCloroPpm: '', enxaguePhFinal: '', horarioSwab: '', swabUrl: '', visto: '' },
    { equipamento: 'Filtro', horarioSoda: '', sodaPct: '', horarioEnxague: '', enxaguePh: '', sodaCloroPpm: '', enxaguePhFinal: '', horarioSwab: '', swabUrl: '', visto: '' },
  ]);

  const [storageEvapRows, setStorageEvapRows] = useState<StorageEvapRow[]>(initialData?.storageEvapRows || [
    { area: 'Tanque de Armazenamento', equipamento: 'Chiller 1', horarioSoda: '', sodaPct: '', horarioEnxague: '', enxaguePh: '', horarioSwab: '', swabUrl: '', sanitizantePct: '', visto: '' },
    { area: 'Tanque de Armazenamento', equipamento: 'Chiller 2', horarioSoda: '', sodaPct: '', horarioEnxague: '', enxaguePh: '', horarioSwab: '', swabUrl: '', sanitizantePct: '', visto: '' },
    { area: 'Tanque de Armazenamento', equipamento: 'Tubulação Saída de Produto', horarioSoda: '', sodaPct: '', horarioEnxague: '', enxaguePh: '', horarioSwab: '', swabUrl: '', sanitizantePct: '', visto: '' },
    { area: 'Evaporador C', equipamento: 'Tanque', horarioSoda: '', sodaPct: '', horarioEnxague: '', enxaguePh: '', horarioSwab: '', swabUrl: '', sanitizantePct: '', visto: '' },
    { area: 'Evaporador C', equipamento: 'Estágio', horarioSoda: '', sodaPct: '', horarioEnxague: '', enxaguePh: '', horarioSwab: '', swabUrl: '', sanitizantePct: '', visto: '' },
  ]);

  const [selectedProcLine, setSelectedProcLine] = useState<string>('Todas');

  const [obs, setObs] = useState(initialData?.obs || '');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const signaturePadRef = useRef<SignaturePad | null>(null);

  useEffect(() => {
    if (canvasRef.current) {
        const pad = new SignaturePad(canvasRef.current, {
            backgroundColor: 'rgba(255, 255, 255, 0)',
            penColor: 'rgb(8, 145, 178)',
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

  const updateCop = (idx: number, field: keyof CopItemRow, val: string) => {
    const n = [...copRows];
    (n[idx] as any)[field] = val;
    setCopRows(n);
  };

  const updateBlender = (idx: number, field: keyof BlenderRow, val: string) => {
    const n = [...blenderRows];
    (n[idx] as any)[field] = val;
    setBlenderRows(n);
  };

  const updateProc = (idx: number, field: keyof ProcessingRow, val: string) => {
    const n = [...procRows];
    (n[idx] as any)[field] = val;
    setProcRows(n);
  };

  const updateClarificador = (idx: number, field: keyof ClarificadorRow, val: string) => {
    const n = [...clarificadorRows];
    (n[idx] as any)[field] = val;
    setClarificadorRows(n);
  };

  const updateStorage = (idx: number, field: keyof StorageEvapRow, val: string) => {
    const n = [...storageEvapRows];
    (n[idx] as any)[field] = val;
    setStorageEvapRows(n);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let sig = initialData?.signature || '';
    if (signaturePadRef.current && !signaturePadRef.current.isEmpty()) {
        sig = signaturePadRef.current.toDataURL();
    }
    onSave({ 
        header, 
        copRows, 
        blenderRows, 
        procRows, 
        clarificadorRows,
        storageEvapRows,
        obs,
        signature: sig,
        status: 'completed'
    });
  };

  const handleSavePending = (e: React.MouseEvent) => {
    e.preventDefault();
    let sig = initialData?.signature || '';
    if (signaturePadRef.current && !signaturePadRef.current.isEmpty()) {
        sig = signaturePadRef.current.toDataURL();
    }
    onSave({ 
        header, 
        copRows, 
        blenderRows, 
        procRows, 
        clarificadorRows,
        storageEvapRows,
        obs,
        signature: sig,
        status: 'pending'
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-12 animate-fadeIn">
      {/* Header Info */}
      <div className="bg-cyan-50 p-8 rounded-[2.5rem] border border-cyan-100 shadow-sm flex flex-col md:flex-row justify-between items-end gap-6">
        <div className="space-y-1 flex-1">
          <label className="text-[10px] font-black text-cyan-800 uppercase tracking-widest">Data do Registro</label>
          <input type="date" value={header.data} onChange={e => setHeader({...header, data: e.target.value})} className="w-full md:w-64 p-2.5 border border-cyan-200 rounded-xl" />
        </div>
        <div className="text-[10px] font-bold text-cyan-600 italic bg-white dark:bg-gray-800 px-4 py-2 rounded-lg border border-cyan-100 max-w-md">
           {header.observacaoGeral}
        </div>
      </div>

      {/* --- BLOCO 1: COP (LIMPEZA MANUAL) --- */}
      <div className="space-y-6">
        <div className="flex items-center gap-3 border-b-2 border-cyan-100 pb-2">
           <div className="w-10 h-10 bg-cyan-600 rounded-xl flex items-center justify-center text-white shadow-md">
              <i className="fas fa-hand-sparkles"></i>
           </div>
           <div>
              <h3 className="text-xl font-black text-cyan-900 leading-none">Processo COP (Manual / Simples)</h3>
              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1">Descarga e Despolpamento (Pré-aquecimento)</p>
           </div>
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block bg-white dark:bg-gray-800 rounded-[2rem] border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
           <div className="overflow-x-auto">
              <table className="w-full text-left text-[11px]">
                 <thead className="bg-gray-50 dark:bg-gray-900/50 border-b font-black text-gray-500 uppercase">
                    <tr>
                       <th className="p-4 w-32">Área</th>
                       <th className="p-4 w-16 text-center">Linha</th>
                       <th className="p-4">Equipamento</th>
                       <th className="p-4 text-center">Detergente (pH)</th>
                       <th className="p-4 text-center">Visto</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-gray-50">
                    {copRows.map((row, idx) => (
                      <tr key={idx} className="hover:bg-cyan-50/10">
                        <td className="p-3 pl-6 font-bold text-gray-400">{row.area}</td>
                        <td className="p-3 text-center font-black text-cyan-700">{row.linha}</td>
                        <td className="p-3 font-medium text-gray-700 dark:text-gray-200">{row.equipamento}</td>
                        <td className="p-2"><input value={row.detergentePh} onChange={e => updateCop(idx, 'detergentePh', e.target.value)} className="w-full p-1.5 border rounded-lg text-center font-bold" placeholder="pH" /></td>
                        <td className="p-2 w-24"><input value={row.visto} onChange={e => updateCop(idx, 'visto', e.target.value)} className="w-full p-1.5 border rounded-lg text-center" /></td>
                      </tr>
                    ))}
                 </tbody>
              </table>
           </div>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden space-y-4">
           {copRows.map((row, idx) => (
              <div key={idx} className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm space-y-3">
                 <div className="flex justify-between items-center border-b pb-2">
                    <span className="text-[10px] font-black text-cyan-800 uppercase tracking-widest">{row.equipamento}</span>
                    <span className="text-[9px] font-bold text-gray-400 uppercase">{row.area} - L{row.linha}</span>
                 </div>
                 <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                       <label className="text-[8px] font-bold text-gray-400 uppercase">Detergente (pH)</label>
                       <input value={row.detergentePh} onChange={e => updateCop(idx, 'detergentePh', e.target.value)} className="w-full p-2 border rounded-xl text-center text-[10px]" placeholder="pH" />
                    </div>
                    <div className="space-y-1">
                       <label className="text-[8px] font-bold text-gray-400 uppercase">Visto</label>
                       <input value={row.visto} onChange={e => updateCop(idx, 'visto', e.target.value)} className="w-full p-2 border rounded-xl text-center text-[10px]" />
                    </div>
                 </div>
              </div>
           ))}
        </div>
      </div>

      {/* --- BLOCO 2: CIP (LIMPEZA SISTÊMICA) --- */}
      <div className="space-y-8">
        <div className="flex items-center gap-3 border-b-2 border-indigo-100 pb-2">
           <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-md">
              <i className="fas fa-sync-alt"></i>
           </div>
           <div>
              <h3 className="text-xl font-black text-indigo-900 leading-none">Processo CIP (Sistêmico / Automático)</h3>
              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1">Higienização e Sanitização Sistêmica</p>
           </div>
        </div>

        {/* Tabelas CIP - Blenders */}
        <div className="bg-white dark:bg-gray-800 rounded-[2rem] border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
           <div className="bg-indigo-50 px-6 py-3 border-b border-indigo-100">
              <span className="text-[10px] font-black text-indigo-700 uppercase tracking-widest">Higienização de Tanques Blender</span>
           </div>
           
           {/* Desktop Table View */}
           <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-[10px]">
                 <thead className="bg-gray-50 dark:bg-gray-900/50 border-b font-black text-gray-400 uppercase">
                    <tr>
                       <th className="p-4">Tanque</th>
                       <th className="p-4 text-center">Soda (%)</th>
                       <th className="p-4 text-center">Horário</th>
                       <th className="p-4 text-center">Swab</th>
                       <th className="p-4 text-center">Sanitizante (%)</th>
                       <th className="p-4 text-center">Enxágue pH</th>
                       <th className="p-4 text-center">Visto</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-gray-50">
                    {blenderRows.map((row, idx) => (
                      <tr key={idx} className="hover:bg-indigo-50/10">
                        <td className="p-3 pl-6 font-bold text-indigo-800">{row.tanque}</td>
                        <td className="p-2"><input value={row.sodaPct} onChange={e => updateBlender(idx, 'sodaPct', e.target.value)} className="w-full p-1.5 border rounded-lg text-center" /></td>
                        <td className="p-2"><input type="time" value={row.horario} onChange={e => updateBlender(idx, 'horario', e.target.value)} className="w-full p-1.5 border rounded-lg text-center" /></td>
                        <td className="p-2"><input value={row.swab} onChange={e => updateBlender(idx, 'swab', e.target.value)} className="w-full p-1.5 border rounded-lg text-center" /></td>
                        <td className="p-2"><input value={row.sanitizantePct} onChange={e => updateBlender(idx, 'sanitizantePct', e.target.value)} className="w-full p-1.5 border rounded-lg text-center" /></td>
                        <td className="p-2"><input value={row.enxaguePh} onChange={e => updateBlender(idx, 'enxaguePh', e.target.value)} className="w-full p-1.5 border rounded-lg text-center" /></td>
                        <td className="p-2 w-20"><input value={row.visto} onChange={e => updateBlender(idx, 'visto', e.target.value)} className="w-full p-1.5 border rounded-lg text-center" /></td>
                      </tr>
                    ))}
                 </tbody>
              </table>
           </div>

           {/* Mobile Card View */}
           <div className="md:hidden divide-y divide-gray-100">
              {blenderRows.map((row, idx) => (
                 <div key={idx} className="p-4 space-y-3">
                    <div className="flex justify-between items-center border-b pb-2">
                       <span className="text-[10px] font-black text-indigo-800 uppercase tracking-widest">{row.tanque}</span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                       <div className="space-y-1">
                          <label className="text-[8px] font-bold text-gray-400 uppercase">Soda (%)</label>
                          <input value={row.sodaPct} onChange={e => updateBlender(idx, 'sodaPct', e.target.value)} className="w-full p-2 border rounded-xl text-center text-[10px]" />
                       </div>
                       <div className="space-y-1">
                          <label className="text-[8px] font-bold text-gray-400 uppercase">Horário</label>
                          <input type="time" value={row.horario} onChange={e => updateBlender(idx, 'horario', e.target.value)} className="w-full p-2 border rounded-xl text-center text-[10px]" />
                       </div>
                       <div className="space-y-1">
                          <label className="text-[8px] font-bold text-gray-400 uppercase">Swab</label>
                          <input value={row.swab} onChange={e => updateBlender(idx, 'swab', e.target.value)} className="w-full p-2 border rounded-xl text-center text-[10px]" />
                       </div>
                       <div className="space-y-1">
                          <label className="text-[8px] font-bold text-gray-400 uppercase">Sanitizante (%)</label>
                          <input value={row.sanitizantePct} onChange={e => updateBlender(idx, 'sanitizantePct', e.target.value)} className="w-full p-2 border rounded-xl text-center text-[10px]" />
                       </div>
                       <div className="space-y-1">
                          <label className="text-[8px] font-bold text-gray-400 uppercase">Enxágue pH</label>
                          <input value={row.enxaguePh} onChange={e => updateBlender(idx, 'enxaguePh', e.target.value)} className="w-full p-2 border rounded-xl text-center text-[10px]" />
                       </div>
                       <div className="space-y-1">
                          <label className="text-[8px] font-bold text-gray-400 uppercase">Visto</label>
                          <input value={row.visto} onChange={e => updateBlender(idx, 'visto', e.target.value)} className="w-full p-2 border rounded-xl text-center text-[10px]" />
                       </div>
                    </div>
                 </div>
              ))}
           </div>
        </div>

        {/* Tabelas CIP - Processamento (Refinação, etc) */}
        <div className="bg-white dark:bg-gray-800 rounded-[2rem] border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
           <div className="bg-indigo-50 px-6 py-3 border-b border-indigo-100 flex justify-between items-center flex-wrap gap-4">
              <span className="text-[10px] font-black text-indigo-700 uppercase tracking-widest">Processamento (Despolpamento / Refinação / Assépticos)</span>
              <div className="flex items-center gap-2">
                 <label className="text-[9px] font-bold text-indigo-600 uppercase">Filtrar Linha:</label>
                 <select 
                    value={selectedProcLine} 
                    onChange={(e) => setSelectedProcLine(e.target.value)}
                    className="text-[10px] p-1.5 border border-indigo-200 rounded-lg bg-white dark:bg-gray-800 text-indigo-800 font-bold outline-none"
                 >
                    <option value="Todas">Todas</option>
                    <option value="1">Linha 1</option>
                    <option value="2">Linha 2</option>
                    <option value="A">Linha A</option>
                    <option value="B">Linha B</option>
                    <option value="C">Linha C</option>
                    <option value="D">Linha D</option>
                 </select>
              </div>
           </div>
           
           {/* Desktop Table View */}
           <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-[9px] border-collapse">
                 <thead className="bg-gray-100 dark:bg-gray-700 border-b font-black text-gray-500 uppercase">
                    <tr>
                       <th className="p-2 border-r" colSpan={3}>Identificação</th>
                       <th className="p-2 border-r text-center" colSpan={2}>Soda</th>
                       <th className="p-2 border-r text-center" colSpan={2}>Ácido Cítrico</th>
                       <th className="p-2 border-r text-center" colSpan={2}>Swab</th>
                       <th className="p-2 text-center" colSpan={2}>Sanitizante</th>
                       <th className="p-2"></th>
                    </tr>
                    <tr className="bg-gray-50 dark:bg-gray-900/50 border-b text-[8px]">
                       <th className="p-1 border-r">Área</th><th className="p-1 border-r">L</th><th className="p-1 border-r">Equipamento</th>
                       <th className="p-1 border-r">%</th><th className="p-1 border-r">h</th>
                       <th className="p-1 border-r">pH</th><th className="p-1 border-r">Enx pH</th>
                       <th className="p-1 border-r">h</th><th className="p-1 border-r">URL/UFC</th>
                       <th className="p-1 border-r">%</th><th className="p-1 border-r">Enx pH</th>
                       <th className="p-1">Visto</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-gray-100">
                    {procRows.map((row, idx) => {
                      if (selectedProcLine !== 'Todas' && row.linha !== selectedProcLine) return null;
                      return (
                      <tr key={idx} className="hover:bg-indigo-50/5 transition-colors">
                        <td className="p-1 border-r text-gray-400 font-bold">{row.area}</td>
                        <td className="p-1 border-r text-center">{row.linha}</td>
                        <td className="p-1 border-r font-medium">{row.equipamento}</td>
                        <td className="p-1 border-r"><input value={row.sodaPct} onChange={e => updateProc(idx, 'sodaPct', e.target.value)} className="w-full border-none bg-transparent text-center" /></td>
                        <td className="p-1 border-r"><input type="time" value={row.horario} onChange={e => updateProc(idx, 'horario', e.target.value)} className="w-full border-none bg-transparent text-center" /></td>
                        <td className="p-1 border-r"><input value={row.acidoCitricoPh} onChange={e => updateProc(idx, 'acidoCitricoPh', e.target.value)} className="w-full border-none bg-transparent text-center" /></td>
                        <td className="p-1 border-r"><input value={row.enxaguePh} onChange={e => updateProc(idx, 'enxaguePh', e.target.value)} className="w-full border-none bg-transparent text-center" /></td>
                        <td className="p-1 border-r"><input type="time" value={row.horarioSwab} onChange={e => updateProc(idx, 'horarioSwab', e.target.value)} className="w-full border-none bg-transparent text-center" /></td>
                        <td className="p-1 border-r"><input value={row.swab} onChange={e => updateProc(idx, 'swab', e.target.value)} className="w-full border-none bg-transparent text-center" /></td>
                        <td className="p-1 border-r"><input value={row.sanitizantePct} onChange={e => updateProc(idx, 'sanitizantePct', e.target.value)} className="w-full border-none bg-transparent text-center" /></td>
                        <td className="p-1 border-r"><input value={row.enxaguePhSanit} onChange={e => updateProc(idx, 'enxaguePhSanit', e.target.value)} className="w-full border-none bg-transparent text-center" /></td>
                        <td className="p-1"><input value={row.visto} onChange={e => updateProc(idx, 'visto', e.target.value)} className="w-full border-none bg-transparent text-center" /></td>
                      </tr>
                    )})}
                 </tbody>
              </table>
           </div>

           {/* Mobile Card View */}
           <div className="md:hidden divide-y divide-gray-100">
              {procRows.map((row, idx) => {
                 if (selectedProcLine !== 'Todas' && row.linha !== selectedProcLine) return null;
                 return (
                 <div key={idx} className="p-4 space-y-4">
                    <div className="flex justify-between items-center border-b pb-2">
                       <span className="text-[10px] font-black text-indigo-800 uppercase tracking-widest">{row.equipamento}</span>
                       <span className="text-[9px] font-bold text-gray-400 uppercase">{row.area} - L{row.linha}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                       <div className="space-y-3 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                          <h6 className="text-[8px] font-black text-indigo-400 uppercase border-b border-indigo-100 pb-1">Soda</h6>
                          <div className="grid grid-cols-1 gap-2">
                             <div className="space-y-1">
                                <label className="text-[8px] font-bold text-gray-400 uppercase">%</label>
                                <input value={row.sodaPct} onChange={e => updateProc(idx, 'sodaPct', e.target.value)} className="w-full p-1.5 border rounded-lg text-center text-[10px] bg-white dark:bg-gray-800" />
                             </div>
                             <div className="space-y-1">
                                <label className="text-[8px] font-bold text-gray-400 uppercase">h</label>
                                <input type="time" value={row.horario} onChange={e => updateProc(idx, 'horario', e.target.value)} className="w-full p-1.5 border rounded-lg text-center text-[10px] bg-white dark:bg-gray-800" />
                             </div>
                          </div>
                       </div>
                       <div className="space-y-3 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                          <h6 className="text-[8px] font-black text-indigo-400 uppercase border-b border-indigo-100 pb-1">Ácido Cítrico</h6>
                          <div className="grid grid-cols-1 gap-2">
                             <div className="space-y-1">
                                <label className="text-[8px] font-bold text-gray-400 uppercase">pH</label>
                                <input value={row.acidoCitricoPh} onChange={e => updateProc(idx, 'acidoCitricoPh', e.target.value)} className="w-full p-1.5 border rounded-lg text-center text-[10px] bg-white dark:bg-gray-800" />
                             </div>
                             <div className="space-y-1">
                                <label className="text-[8px] font-bold text-gray-400 uppercase">Enx pH</label>
                                <input value={row.enxaguePh} onChange={e => updateProc(idx, 'enxaguePh', e.target.value)} className="w-full p-1.5 border rounded-lg text-center text-[10px] bg-white dark:bg-gray-800" />
                             </div>
                          </div>
                       </div>
                       <div className="space-y-3 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                          <h6 className="text-[8px] font-black text-indigo-400 uppercase border-b border-indigo-100 pb-1">Swab</h6>
                          <div className="grid grid-cols-1 gap-2">
                             <div className="space-y-1">
                                <label className="text-[8px] font-bold text-gray-400 uppercase">h</label>
                                <input type="time" value={row.horarioSwab} onChange={e => updateProc(idx, 'horarioSwab', e.target.value)} className="w-full p-1.5 border rounded-lg text-center text-[10px] bg-white dark:bg-gray-800" />
                             </div>
                             <div className="space-y-1">
                                <label className="text-[8px] font-bold text-gray-400 uppercase">URL/UFC</label>
                                <input value={row.swab} onChange={e => updateProc(idx, 'swab', e.target.value)} className="w-full p-1.5 border rounded-lg text-center text-[10px] bg-white dark:bg-gray-800" />
                             </div>
                          </div>
                       </div>
                       <div className="space-y-3 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                          <h6 className="text-[8px] font-black text-indigo-400 uppercase border-b border-indigo-100 pb-1">Sanitizante</h6>
                          <div className="grid grid-cols-1 gap-2">
                             <div className="space-y-1">
                                <label className="text-[8px] font-bold text-gray-400 uppercase">%</label>
                                <input value={row.sanitizantePct} onChange={e => updateProc(idx, 'sanitizantePct', e.target.value)} className="w-full p-1.5 border rounded-lg text-center text-[10px] bg-white dark:bg-gray-800" />
                             </div>
                             <div className="space-y-1">
                                <label className="text-[8px] font-bold text-gray-400 uppercase">Enx pH</label>
                                <input value={row.enxaguePhSanit} onChange={e => updateProc(idx, 'enxaguePhSanit', e.target.value)} className="w-full p-1.5 border rounded-lg text-center text-[10px] bg-white dark:bg-gray-800" />
                             </div>
                          </div>
                       </div>
                    </div>
                    <div className="space-y-1">
                       <label className="text-[8px] font-bold text-gray-400 uppercase">Visto</label>
                       <input value={row.visto} onChange={e => updateProc(idx, 'visto', e.target.value)} className="w-full p-2 border rounded-xl text-center text-[10px] bg-white dark:bg-gray-800" />
                    </div>
                 </div>
              );
              })}
           </div>
        </div>
      </div>

      {/* --- BLOCO 3: CLARIFICADOR --- */}
      <div className="bg-white dark:bg-gray-800 rounded-[2rem] border border-gray-100 dark:border-gray-700 shadow-xl overflow-hidden">
        <div className="bg-emerald-800 px-6 py-4 flex items-center gap-3">
           <div className="w-8 h-8 rounded-lg bg-emerald-700 flex items-center justify-center text-white text-xs">
              <i className="fas fa-filter"></i>
           </div>
           <h4 className="text-white font-black text-xs uppercase tracking-widest">Higienização - Clarificador</h4>
        </div>
        
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-[10px] border-collapse">
            <thead className="bg-gray-50 dark:bg-gray-900/50 border-b font-black text-gray-500 uppercase">
              <tr>
                <th className="p-3 border-r w-32">Área</th>
                <th className="p-3 border-r w-40">Equipamento</th>
                <th className="p-3 border-r text-center">Horário (h)</th>
                <th className="p-3 border-r text-center">Soda (%)</th>
                <th className="p-3 border-r text-center">Horário (h)</th>
                <th className="p-3 border-r text-center">Enxágue pH</th>
                <th className="p-3 border-r text-center">Soda/Cloro (ppm)</th>
                <th className="p-3 border-r text-center">Enxágue pH</th>
                <th className="p-3 border-r text-center">Horário (h)</th>
                <th className="p-3 border-r text-center">Swab (URL/UFC)</th>
                <th className="p-3 text-center">Visto</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {clarificadorRows.map((row, idx) => (
                <tr key={idx} className="hover:bg-emerald-50/20">
                  {idx === 0 && <td rowSpan={2} className="p-3 border-r font-black text-emerald-700 text-center uppercase bg-emerald-50/30">Clarificador</td>}
                  <td className="p-3 border-r font-bold text-gray-600 dark:text-gray-300">{row.equipamento}</td>
                  <td className="p-1 border-r"><input value={row.horarioSoda} onChange={e => updateClarificador(idx, 'horarioSoda', e.target.value)} type="time" className="w-full p-1 border-none bg-transparent text-center" /></td>
                  <td className="p-1 border-r"><input value={row.sodaPct} onChange={e => updateClarificador(idx, 'sodaPct', e.target.value)} className="w-full p-1 border-none bg-transparent text-center font-bold" /></td>
                  <td className="p-1 border-r"><input value={row.horarioEnxague} onChange={e => updateClarificador(idx, 'horarioEnxague', e.target.value)} type="time" className="w-full p-1 border-none bg-transparent text-center" /></td>
                  <td className="p-1 border-r"><input value={row.enxaguePh} onChange={e => updateClarificador(idx, 'enxaguePh', e.target.value)} className="w-full p-1 border-none bg-transparent text-center" /></td>
                  <td className="p-1 border-r"><input value={row.sodaCloroPpm} onChange={e => updateClarificador(idx, 'sodaCloroPpm', e.target.value)} className="w-full p-1 border-none bg-transparent text-center font-bold text-emerald-600" /></td>
                  <td className="p-1 border-r"><input value={row.enxaguePhFinal} onChange={e => updateClarificador(idx, 'enxaguePhFinal', e.target.value)} className="w-full p-1 border-none bg-transparent text-center" /></td>
                  <td className="p-1 border-r"><input value={row.horarioSwab} onChange={e => updateClarificador(idx, 'horarioSwab', e.target.value)} type="time" className="w-full p-1 border-none bg-transparent text-center" /></td>
                  <td className="p-1 border-r"><input value={row.swabUrl} onChange={e => updateClarificador(idx, 'swabUrl', e.target.value)} className="w-full p-1 border-none bg-transparent text-center font-bold text-blue-600" /></td>
                  <td className="p-1"><input value={row.visto} onChange={e => updateClarificador(idx, 'visto', e.target.value)} className="w-full p-1 border-none bg-transparent text-center italic" placeholder="Assin." /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden divide-y divide-gray-100">
           {clarificadorRows.map((row, idx) => (
              <div key={idx} className="p-4 space-y-4">
                 <div className="flex justify-between items-center border-b pb-2">
                    <span className="text-[10px] font-black text-emerald-800 uppercase tracking-widest">{row.equipamento}</span>
                    <span className="text-[9px] font-bold text-gray-400 uppercase">Clarificador</span>
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-3 p-3 bg-emerald-50/30 rounded-xl">
                       <h6 className="text-[8px] font-black text-emerald-600 uppercase border-b border-emerald-100 pb-1">Soda</h6>
                       <div className="grid grid-cols-1 gap-2">
                          <div className="space-y-1">
                             <label className="text-[8px] font-bold text-gray-400 uppercase">h</label>
                             <input type="time" value={row.horarioSoda} onChange={e => updateClarificador(idx, 'horarioSoda', e.target.value)} className="w-full p-1.5 border rounded-lg text-center text-[10px] bg-white dark:bg-gray-800" />
                          </div>
                          <div className="space-y-1">
                             <label className="text-[8px] font-bold text-gray-400 uppercase">%</label>
                             <input value={row.sodaPct} onChange={e => updateClarificador(idx, 'sodaPct', e.target.value)} className="w-full p-1.5 border rounded-lg text-center text-[10px] bg-white dark:bg-gray-800" />
                          </div>
                       </div>
                    </div>
                    <div className="space-y-3 p-3 bg-emerald-50/30 rounded-xl">
                       <h6 className="text-[8px] font-black text-emerald-600 uppercase border-b border-emerald-100 pb-1">Enxágue</h6>
                       <div className="grid grid-cols-1 gap-2">
                          <div className="space-y-1">
                             <label className="text-[8px] font-bold text-gray-400 uppercase">h</label>
                             <input type="time" value={row.horarioEnxague} onChange={e => updateClarificador(idx, 'horarioEnxague', e.target.value)} className="w-full p-1.5 border rounded-lg text-center text-[10px] bg-white dark:bg-gray-800" />
                          </div>
                          <div className="space-y-1">
                             <label className="text-[8px] font-bold text-gray-400 uppercase">pH</label>
                             <input value={row.enxaguePh} onChange={e => updateClarificador(idx, 'enxaguePh', e.target.value)} className="w-full p-1.5 border rounded-lg text-center text-[10px] bg-white dark:bg-gray-800" />
                          </div>
                       </div>
                    </div>
                    <div className="space-y-3 p-3 bg-emerald-50/30 rounded-xl">
                       <h6 className="text-[8px] font-black text-emerald-600 uppercase border-b border-emerald-100 pb-1">Soda/Cloro</h6>
                       <div className="grid grid-cols-1 gap-2">
                          <div className="space-y-1">
                             <label className="text-[8px] font-bold text-gray-400 uppercase">ppm</label>
                             <input value={row.sodaCloroPpm} onChange={e => updateClarificador(idx, 'sodaCloroPpm', e.target.value)} className="w-full p-1.5 border rounded-lg text-center text-[10px] bg-white dark:bg-gray-800" />
                          </div>
                          <div className="space-y-1">
                             <label className="text-[8px] font-bold text-gray-400 uppercase">Enx pH</label>
                             <input value={row.enxaguePhFinal} onChange={e => updateClarificador(idx, 'enxaguePhFinal', e.target.value)} className="w-full p-1.5 border rounded-lg text-center text-[10px] bg-white dark:bg-gray-800" />
                          </div>
                       </div>
                    </div>
                    <div className="space-y-3 p-3 bg-emerald-50/30 rounded-xl">
                       <h6 className="text-[8px] font-black text-emerald-600 uppercase border-b border-emerald-100 pb-1">Swab</h6>
                       <div className="grid grid-cols-1 gap-2">
                          <div className="space-y-1">
                             <label className="text-[8px] font-bold text-gray-400 uppercase">h</label>
                             <input type="time" value={row.horarioSwab} onChange={e => updateClarificador(idx, 'horarioSwab', e.target.value)} className="w-full p-1.5 border rounded-lg text-center text-[10px] bg-white dark:bg-gray-800" />
                          </div>
                          <div className="space-y-1">
                             <label className="text-[8px] font-bold text-gray-400 uppercase">URL/UFC</label>
                             <input value={row.swabUrl} onChange={e => updateClarificador(idx, 'swabUrl', e.target.value)} className="w-full p-1.5 border rounded-lg text-center text-[10px] bg-white dark:bg-gray-800" />
                          </div>
                       </div>
                    </div>
                 </div>
                 <div className="space-y-1">
                    <label className="text-[8px] font-bold text-gray-400 uppercase">Visto</label>
                    <input value={row.visto} onChange={e => updateClarificador(idx, 'visto', e.target.value)} className="w-full p-2 border rounded-xl text-center text-[10px] bg-white dark:bg-gray-800" />
                 </div>
              </div>
           ))}
        </div>
      </div>

      {/* --- BLOCO 4: ARMAZENAMENTO E EVAPORADOR --- */}
      <div className="bg-white dark:bg-gray-800 rounded-[2rem] border border-gray-100 dark:border-gray-700 shadow-xl overflow-hidden">
        <div className="bg-indigo-900 px-6 py-4 flex items-center gap-3">
           <div className="w-8 h-8 rounded-lg bg-indigo-700 flex items-center justify-center text-white text-xs">
              <i className="fas fa-industry"></i>
           </div>
           <h4 className="text-white font-black text-xs uppercase tracking-widest">Higienização - Armazenamento e Evaporador</h4>
        </div>
        
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-[10px] border-collapse">
            <thead className="bg-gray-50 dark:bg-gray-900/50 border-b font-black text-gray-500 uppercase">
              <tr>
                <th className="p-3 border-r w-32">Área</th>
                <th className="p-3 border-r w-48">Equipamento</th>
                <th className="p-3 border-r text-center">Horário (h)</th>
                <th className="p-3 border-r text-center">Soda (%)</th>
                <th className="p-3 border-r text-center">Horário (h)</th>
                <th className="p-3 border-r text-center">Enxágue pH</th>
                <th className="p-3 border-r text-center">Horário (h)</th>
                <th className="p-3 border-r text-center">Swab (URL/UFC)</th>
                <th className="p-3 border-r text-center">Sanitizante (%)</th>
                <th className="p-3 text-center">Visto</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {storageEvapRows.map((row, idx) => (
                <tr key={idx} className="hover:bg-indigo-50/20">
                  {idx === 0 && <td rowSpan={3} className="p-3 border-r font-black text-indigo-700 text-center uppercase bg-indigo-50/30">Tanque de Armazenamento</td>}
                  {idx === 3 && <td rowSpan={2} className="p-3 border-r font-black text-indigo-900 text-center uppercase bg-indigo-50/30">Evaporador C</td>}
                  <td className="p-3 border-r font-bold text-gray-600 dark:text-gray-300">{row.equipamento}</td>
                  <td className="p-1 border-r"><input value={row.horarioSoda} onChange={e => updateStorage(idx, 'horarioSoda', e.target.value)} type="time" className="w-full p-1 border-none bg-transparent text-center" /></td>
                  <td className="p-1 border-r"><input value={row.sodaPct} onChange={e => updateStorage(idx, 'sodaPct', e.target.value)} className="w-full p-1 border-none bg-transparent text-center font-bold" /></td>
                  <td className="p-1 border-r"><input value={row.horarioEnxague} onChange={e => updateStorage(idx, 'horarioEnxague', e.target.value)} type="time" className="w-full p-1 border-none bg-transparent text-center" /></td>
                  <td className="p-1 border-r"><input value={row.enxaguePh} onChange={e => updateStorage(idx, 'enxaguePh', e.target.value)} className="w-full p-1 border-none bg-transparent text-center" /></td>
                  <td className="p-1 border-r"><input value={row.horarioSwab} onChange={e => updateStorage(idx, 'horarioSwab', e.target.value)} type="time" className="w-full p-1 border-none bg-transparent text-center" /></td>
                  <td className="p-1 border-r"><input value={row.swabUrl} onChange={e => updateStorage(idx, 'swabUrl', e.target.value)} className="w-full p-1 border-none bg-transparent text-center font-bold text-blue-600" /></td>
                  <td className="p-1 border-r"><input value={row.sanitizantePct} onChange={e => updateStorage(idx, 'sanitizantePct', e.target.value)} className="w-full p-1 border-none bg-transparent text-center font-bold text-indigo-600" /></td>
                  <td className="p-1"><input value={row.visto} onChange={e => updateStorage(idx, 'visto', e.target.value)} className="w-full p-1 border-none bg-transparent text-center italic" placeholder="Assin." /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden divide-y divide-gray-100">
           {storageEvapRows.map((row, idx) => (
              <div key={idx} className="p-4 space-y-4">
                 <div className="flex justify-between items-center border-b pb-2">
                    <span className="text-[10px] font-black text-indigo-800 uppercase tracking-widest">{row.equipamento}</span>
                    <span className="text-[9px] font-bold text-gray-400 uppercase">{row.area}</span>
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-3 p-3 bg-indigo-50/30 rounded-xl">
                       <h6 className="text-[8px] font-black text-indigo-600 uppercase border-b border-indigo-100 pb-1">Soda</h6>
                       <div className="grid grid-cols-1 gap-2">
                          <div className="space-y-1">
                             <label className="text-[8px] font-bold text-gray-400 uppercase">h</label>
                             <input type="time" value={row.horarioSoda} onChange={e => updateStorage(idx, 'horarioSoda', e.target.value)} className="w-full p-1.5 border rounded-lg text-center text-[10px] bg-white dark:bg-gray-800" />
                          </div>
                          <div className="space-y-1">
                             <label className="text-[8px] font-bold text-gray-400 uppercase">%</label>
                             <input value={row.sodaPct} onChange={e => updateStorage(idx, 'sodaPct', e.target.value)} className="w-full p-1.5 border rounded-lg text-center text-[10px] bg-white dark:bg-gray-800" />
                          </div>
                       </div>
                    </div>
                    <div className="space-y-3 p-3 bg-indigo-50/30 rounded-xl">
                       <h6 className="text-[8px] font-black text-indigo-600 uppercase border-b border-indigo-100 pb-1">Enxágue</h6>
                       <div className="grid grid-cols-1 gap-2">
                          <div className="space-y-1">
                             <label className="text-[8px] font-bold text-gray-400 uppercase">h</label>
                             <input type="time" value={row.horarioEnxague} onChange={e => updateStorage(idx, 'horarioEnxague', e.target.value)} className="w-full p-1.5 border rounded-lg text-center text-[10px] bg-white dark:bg-gray-800" />
                          </div>
                          <div className="space-y-1">
                             <label className="text-[8px] font-bold text-gray-400 uppercase">pH</label>
                             <input value={row.enxaguePh} onChange={e => updateStorage(idx, 'enxaguePh', e.target.value)} className="w-full p-1.5 border rounded-lg text-center text-[10px] bg-white dark:bg-gray-800" />
                          </div>
                       </div>
                    </div>
                    <div className="space-y-3 p-3 bg-indigo-50/30 rounded-xl">
                       <h6 className="text-[8px] font-black text-indigo-600 uppercase border-b border-indigo-100 pb-1">Swab</h6>
                       <div className="grid grid-cols-1 gap-2">
                          <div className="space-y-1">
                             <label className="text-[8px] font-bold text-gray-400 uppercase">h</label>
                             <input type="time" value={row.horarioSwab} onChange={e => updateStorage(idx, 'horarioSwab', e.target.value)} className="w-full p-1.5 border rounded-lg text-center text-[10px] bg-white dark:bg-gray-800" />
                          </div>
                          <div className="space-y-1">
                             <label className="text-[8px] font-bold text-gray-400 uppercase">URL/UFC</label>
                             <input value={row.swabUrl} onChange={e => updateStorage(idx, 'swabUrl', e.target.value)} className="w-full p-1.5 border rounded-lg text-center text-[10px] bg-white dark:bg-gray-800" />
                          </div>
                       </div>
                    </div>
                    <div className="space-y-3 p-3 bg-indigo-50/30 rounded-xl">
                       <h6 className="text-[8px] font-black text-indigo-600 uppercase border-b border-indigo-100 pb-1">Sanitizante</h6>
                       <div className="grid grid-cols-1 gap-2">
                          <div className="space-y-1">
                             <label className="text-[8px] font-bold text-gray-400 uppercase">%</label>
                             <input value={row.sanitizantePct} onChange={e => updateStorage(idx, 'sanitizantePct', e.target.value)} className="w-full p-1.5 border rounded-lg text-center text-[10px] bg-white dark:bg-gray-800" />
                          </div>
                       </div>
                    </div>
                 </div>
                 <div className="space-y-1">
                    <label className="text-[8px] font-bold text-gray-400 uppercase">Visto</label>
                    <input value={row.visto} onChange={e => updateStorage(idx, 'visto', e.target.value)} className="w-full p-2 border rounded-xl text-center text-[10px] bg-white dark:bg-gray-800" />
                 </div>
              </div>
           ))}
        </div>
      </div>

      {/* Footer / Assinatura */}
      <div className="bg-gray-50 dark:bg-gray-900/50 p-8 rounded-[3rem] border border-gray-100 dark:border-gray-700 space-y-8">
         <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Observações / Não Conformidades Detetadas</label>
            <textarea value={obs} onChange={e => setObs(e.target.value)} className="w-full p-6 border rounded-3xl h-32 text-sm outline-none bg-white dark:bg-gray-800 shadow-inner" placeholder="Descreva aqui qualquer anomalia durante o processo de higienização ou ocorrências com Swab..." />
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-end">
            <div className="space-y-2">
               <label className="text-[10px] font-black text-cyan-800 uppercase tracking-widest ml-1">Assinatura Digital do Responsável</label>
               <div className="w-full h-40 bg-white dark:bg-gray-800 border-2 border-dashed border-cyan-200 rounded-3xl overflow-hidden relative shadow-inner">
                  {initialData?.signature ? (
                     <img src={initialData.signature} alt="Assinatura" className="h-full object-contain mx-auto" />
                  ) : (
                     <canvas ref={canvasRef} className="w-full h-full cursor-crosshair touch-none" />
                  )}
               </div>
               <button type="button" onClick={() => signaturePadRef.current?.clear()} className="text-[9px] font-black text-red-400 uppercase tracking-widest hover:text-red-600 transition-colors">Limpar Assinatura</button>
            </div>
            <div className="pb-2 space-y-3">
               <button type="button" onClick={handleSavePending} disabled={isSubmitting} className="w-full py-4 bg-orange-100 hover:bg-orange-200 text-orange-700 font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl transition-all flex items-center justify-center gap-2">
                  {isSubmitting ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-clock"></i>}
                  <span>Salvar como Pendente</span>
               </button>
               <button type="submit" disabled={isSubmitting} className="w-full py-4 bg-cyan-700 hover:bg-cyan-800 text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl shadow-xl transition-all flex items-center justify-center gap-2">
                  {isSubmitting ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-check-circle"></i>}
                  <span>Finalizar Registro F01.20-CQ</span>
               </button>
            </div>
         </div>
      </div>
    </form>
  );
};

export default EquipmentCleaningForm;
