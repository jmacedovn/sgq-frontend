import React, { useState } from 'react';

type EvaluationOption = 'BOM' | 'RUIM (furado)' | 'RUIM' | 'AUSENTE' | 'PRESENTE' | 'SIM' | 'NÃO' | 'N/A';

interface ContainerCheckItem {
  id: string;
  label: string;
  value: EvaluationOption;
  options: EvaluationOption[];
}

const ContainerChecklistForm: React.FC<{ onSave: (data: any) => void, isSubmitting: boolean }> = ({ onSave, isSubmitting }) => {
  const [header, setHeader] = useState({
    transportadora: '',
    data: new Date().toISOString().split('T')[0],
    motorista: '',
    placaVeiculo: '',
    placaCarreta: '',
    tipoTransporte: 'CONTAINER 20 PÉS' as 'CONTAINER 20 PÉS' | 'CONTAINER 40 PÉS',
    noContainer: '',
    noLacre: '',
    nf: '',
    otl: ''
  });

  const [items, setItems] = useState<ContainerCheckItem[]>([
    { id: '1', label: 'TETO / PAREDES', value: 'BOM', options: ['BOM', 'RUIM (furado)', 'N/A'] },
    { id: '2', label: 'ASSOALHO', value: 'BOM', options: ['BOM', 'RUIM (furado)', 'N/A'] },
    { id: '3', label: 'HIGIENIZAÇÃO', value: 'BOM', options: ['BOM', 'RUIM', 'N/A'] },
    { id: '4', label: 'ODORES', value: 'AUSENTE', options: ['AUSENTE', 'PRESENTE', 'N/A'] },
    { id: '5', label: 'RESÍDUOS DE PRAGAS', value: 'AUSENTE', options: ['AUSENTE', 'PRESENTE', 'N/A'] },
    { id: '6', label: 'MATERIAIS ESTRANHOS', value: 'AUSENTE', options: ['AUSENTE', 'PRESENTE', 'N/A'] },
    { id: '7', label: 'TRANSPORTE COM OUTROS MATERIAIS', value: 'NÃO', options: ['SIM', 'NÃO', 'N/A'] },
    { id: '8', label: 'MOTORISTA ACOMPANHOU A CARGA', value: 'SIM', options: ['SIM', 'NÃO', 'N/A'] },
    { id: '9', label: 'CARGA SAIU EM PERFEITA ORDEM', value: 'SIM', options: ['SIM', 'NÃO', 'N/A'] },
  ]);

  const [footer, setFooter] = useState({
    obs: '',
    aprovado: 'SIM' as 'SIM' | 'NÃO',
    responsavelCarregamento: '',
    motoristaAssinatura: ''
  });

  const updateItem = (id: string, val: EvaluationOption) => {
    setItems(items.map(i => i.id === id ? { ...i, value: val } : i));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ header, items, footer });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 animate-fadeIn">
      {/* Header Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 bg-gray-50 dark:bg-gray-900/50 p-8 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm">
        <div className="md:col-span-3 space-y-1">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Transportadora</label>
          <input value={header.transportadora} onChange={e => setHeader({...header, transportadora: e.target.value})} className="w-full p-2.5 border rounded-xl" />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Data</label>
          <input type="date" value={header.data} onChange={e => setHeader({...header, data: e.target.value})} className="w-full p-2.5 border rounded-xl" />
        </div>
        <div className="md:col-span-2 space-y-1">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Nome do Motorista</label>
          <input value={header.motorista} onChange={e => setHeader({...header, motorista: e.target.value})} className="w-full p-2.5 border rounded-xl" />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Placa Veículo</label>
          <input value={header.placaVeiculo} onChange={e => setHeader({...header, placaVeiculo: e.target.value})} className="w-full p-2.5 border rounded-xl" />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Placa Carreta</label>
          <input value={header.placaCarreta} onChange={e => setHeader({...header, placaCarreta: e.target.value})} className="w-full p-2.5 border rounded-xl" />
        </div>
        <div className="space-y-1 md:col-span-2">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Veículo de Transporte</label>
          <div className="flex gap-2">
            {(['CONTAINER 20 PÉS', 'CONTAINER 40 PÉS'] as const).map(t => (
              <button key={t} type="button" onClick={() => setHeader({...header, tipoTransporte: t})} className={`flex-1 py-2.5 rounded-xl text-[9px] font-black uppercase transition-all border ${header.tipoTransporte === t ? 'bg-cyan-700 border-cyan-800 text-white' : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 text-gray-400'}`}>{t}</button>
            ))}
          </div>
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Nº Container</label>
          <input value={header.noContainer} onChange={e => setHeader({...header, noContainer: e.target.value})} className="w-full p-2.5 border rounded-xl" />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Nº Lacre</label>
          <input value={header.noLacre} onChange={e => setHeader({...header, noLacre: e.target.value})} className="w-full p-2.5 border rounded-xl" />
        </div>
        <div className="space-y-1 md:col-span-2">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Nota Fiscal</label>
          <input value={header.nf} onChange={e => setHeader({...header, nf: e.target.value})} className="w-full p-2.5 border rounded-xl" />
        </div>
        <div className="space-y-1 md:col-span-2">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">OTL</label>
          <input value={header.otl} onChange={e => setHeader({...header, otl: e.target.value})} className="w-full p-2.5 border rounded-xl" />
        </div>
      </div>

      {/* Items List */}
      <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] border border-gray-100 dark:border-gray-700 shadow-xl overflow-hidden">
        <div className="bg-cyan-700 px-8 py-6">
           <h4 className="text-white font-black text-xs uppercase tracking-[0.2em]">Dados Inerentes a Veículos</h4>
        </div>
        <div className="divide-y divide-gray-100">
           {items.map(item => (
             <div key={item.id} className="flex flex-col md:flex-row md:items-center justify-between p-6 hover:bg-cyan-50/20 transition-colors gap-4">
                <span className="text-xs font-black text-[#1A2B34] uppercase tracking-widest">{item.label}</span>
                <div className="flex flex-wrap gap-2">
                   {item.options.map(opt => (
                     <button
                        key={opt}
                        type="button"
                        onClick={() => updateItem(item.id, opt)}
                        className={`py-2 px-3 rounded-xl text-[9px] font-black uppercase transition-all border ${item.value === opt ? 'bg-cyan-700 border-cyan-800 text-white shadow-md' : 'bg-gray-50 dark:bg-gray-900/50 border-gray-100 dark:border-gray-700 text-gray-400 hover:bg-white dark:bg-gray-800'}`}
                     >
                       {opt}
                     </button>
                   ))}
                </div>
             </div>
           ))}
        </div>
      </div>

      <div className="bg-gray-50 dark:bg-gray-900/50 p-8 rounded-3xl space-y-6">
         <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Observações</label>
            <textarea value={footer.obs} onChange={e => setFooter({...footer, obs: e.target.value})} className="w-full p-4 border rounded-2xl h-24 text-sm" />
         </div>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-1">
               <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Veículo Aprovado?</label>
               <div className="flex gap-4">
                  {(['SIM', 'NÃO'] as const).map(s => (
                    <button key={s} type="button" onClick={() => setFooter({...footer, aprovado: s})} className={`flex-1 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border-2 transition-all ${footer.aprovado === s ? (s === 'SIM' ? 'bg-green-600 border-green-700 text-white' : 'bg-red-600 border-red-700 text-white') : 'bg-white dark:bg-gray-800 text-gray-300'}`}>{s}</button>
                  ))}
               </div>
            </div>
         </div>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t">
            <div className="space-y-1">
               <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Responsável pelo Carregamento</label>
               <input value={footer.responsavelCarregamento} onChange={e => setFooter({...footer, responsavelCarregamento: e.target.value})} className="w-full p-3 border rounded-xl font-bold" />
            </div>
            <div className="space-y-1">
               <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Motorista</label>
               <input value={footer.motoristaAssinatura} onChange={e => setFooter({...footer, motoristaAssinatura: e.target.value})} className="w-full p-3 border rounded-xl" />
            </div>
         </div>
      </div>

      <div className="pt-6 flex justify-end">
        <button disabled={isSubmitting} className="px-12 py-4 bg-cyan-700 hover:bg-cyan-800 text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl shadow-xl transition-all flex items-center gap-2">
          {isSubmitting ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-check-double"></i>}
          <span>Salvar Checklist Container</span>
        </button>
      </div>
    </form>
  );
};

export default ContainerChecklistForm;