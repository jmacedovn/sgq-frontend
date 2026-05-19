import React, { useState } from 'react';

type CheckOption = 'BOM' | 'RUIM' | 'RUIM (rasgada)' | 'RUIM (emenda)' | 'RUIM (furado)' | 'AUSENTE' | 'PRESENTE' | 'SIM' | 'NÃO' | 'N/A';

interface ChecklistRow {
  id: string;
  label: string;
  value: CheckOption;
  options: CheckOption[];
}

const ShippingChecklistForm: React.FC<{ onSave: (data: any) => void, isSubmitting: boolean }> = ({ onSave, isSubmitting }) => {
  const [header, setHeader] = useState({
    transportadora: '',
    data: new Date().toISOString().split('T')[0],
    motorista: '',
    placaVeiculo: '',
    placaCarreta: '',
    nf: '',
    otl: '',
    tipoVeiculo: 'TRUCK' as 'TRUCK' | 'CARRETA' | 'ABERTO' | 'FECHADO' | 'OUTROS'
  });

  const [items, setItems] = useState<ChecklistRow[]>([
    { id: '1', label: 'BAÚ/SYDER', value: 'BOM', options: ['BOM', 'RUIM', 'N/A'] },
    { id: '2', label: 'CARROCERIA', value: 'BOM', options: ['BOM', 'RUIM', 'N/A'] },
    { id: '3', label: 'CANTONEIRA', value: 'BOM', options: ['BOM', 'RUIM', 'N/A'] },
    { id: '4', label: 'LONA', value: 'BOM', options: ['BOM', 'RUIM (rasgada)', 'N/A'] },
    { id: '5', label: 'CORDA', value: 'BOM', options: ['BOM', 'RUIM (emenda)', 'N/A'] },
    { id: '6', label: 'ASSOALHO', value: 'BOM', options: ['BOM', 'RUIM (furado)', 'N/A'] },
    { id: '7', label: 'HIGIENIZAÇÃO', value: 'BOM', options: ['BOM', 'RUIM', 'N/A'] },
    { id: '8', label: 'ODORES', value: 'AUSENTE', options: ['AUSENTE', 'PRESENTE', 'N/A'] },
    { id: '9', label: 'RESÍDUOS DE PRAGAS', value: 'AUSENTE', options: ['AUSENTE', 'PRESENTE', 'N/A'] },
    { id: '10', label: 'MATERIAIS ESTRANHOS', value: 'AUSENTE', options: ['AUSENTE', 'PRESENTE', 'N/A'] },
    { id: '11', label: 'TRANSPORTE COM OUTROS MATERIAIS', value: 'NÃO', options: ['SIM', 'NÃO', 'N/A'] },
    { id: '12', label: 'MOTORISTA ACOMPANHOU A CARGA', value: 'SIM', options: ['SIM', 'NÃO', 'N/A'] },
    { id: '13', label: 'CARGA SAIU EM PERFEITA ORDEM', value: 'SIM', options: ['SIM', 'NÃO', 'N/A'] },
    { id: '14', label: 'LAUDO REFERENTE A CARGA', value: 'SIM', options: ['SIM', 'NÃO', 'N/A'] },
  ]);

  const [footer, setFooter] = useState({
    aprovado: 'SIM' as 'SIM' | 'NÃO',
    obs: '',
    respCarregamento: '',
    vistoMotorista: ''
  });

  const updateItem = (id: string, val: CheckOption) => {
    setItems(items.map(i => i.id === id ? { ...i, value: val } : i));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ header, items, footer });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 animate-fadeIn">
      {/* Header Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 bg-gray-50 dark:bg-gray-900/50 p-8 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm">
        <div className="md:col-span-3 space-y-1">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Transportadora</label>
          <input required value={header.transportadora} onChange={e => setHeader({...header, transportadora: e.target.value})} className="w-full p-2.5 border rounded-xl" />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Data</label>
          <input type="date" value={header.data} onChange={e => setHeader({...header, data: e.target.value})} className="w-full p-2.5 border rounded-xl" />
        </div>
        <div className="md:col-span-2 space-y-1">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Motorista</label>
          <input value={header.motorista} onChange={e => setHeader({...header, motorista: e.target.value})} className="w-full p-2.5 border rounded-xl" />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Placa Veículo</label>
          <input value={header.placaVeiculo} onChange={e => setHeader({...header, placaVeiculo: e.target.value})} className="w-full p-2.5 border rounded-xl" placeholder="ABC-1234" />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Placa Carreta</label>
          <input value={header.placaCarreta} onChange={e => setHeader({...header, placaCarreta: e.target.value})} className="w-full p-2.5 border rounded-xl" />
        </div>
        <div className="space-y-1 md:col-span-2">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Nota Fiscal</label>
          <input value={header.nf} onChange={e => setHeader({...header, nf: e.target.value})} className="w-full p-2.5 border rounded-xl" />
        </div>
        <div className="space-y-1 md:col-span-2">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">OTL</label>
          <input value={header.otl} onChange={e => setHeader({...header, otl: e.target.value})} className="w-full p-2.5 border rounded-xl" />
        </div>
        <div className="md:col-span-4 space-y-2 pt-4 border-t">
           <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Tipo do Veículo</label>
           <div className="flex flex-wrap gap-2">
              {(['TRUCK', 'CARRETA', 'ABERTO', 'FECHADO', 'OUTROS'] as const).map(t => (
                <button
                   key={t}
                   type="button"
                   onClick={() => setHeader({...header, tipoVeiculo: t})}
                   className={`px-6 py-2.5 rounded-xl text-[9px] font-black uppercase transition-all border ${header.tipoVeiculo === t ? 'bg-slate-700 border-slate-800 text-white shadow-md' : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 text-gray-400 hover:bg-gray-50 dark:bg-gray-900/50'}`}
                >
                   {t}
                </button>
              ))}
           </div>
        </div>
      </div>

      {/* Checklist Grid */}
      <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] border border-gray-100 dark:border-gray-700 shadow-xl overflow-hidden">
        <div className="bg-slate-700 px-8 py-6">
           <h4 className="text-white font-black text-xs uppercase tracking-[0.2em]">Dados Inerentes a Veículos</h4>
        </div>
        <div className="divide-y divide-gray-100">
           {items.map(item => (
             <div key={item.id} className="flex flex-col md:flex-row md:items-center justify-between p-6 hover:bg-slate-50/50 transition-colors">
                <span className="text-xs font-black text-[#1A2B34] uppercase tracking-widest mb-4 md:mb-0">{item.label}</span>
                <div className="flex flex-wrap gap-2 justify-end">
                   {item.options.map(opt => (
                     <button
                        key={opt}
                        type="button"
                        onClick={() => updateItem(item.id, opt)}
                        className={`py-2 px-3 rounded-xl text-[9px] font-black uppercase transition-all border ${item.value === opt ? 'bg-slate-700 border-slate-800 text-white shadow-md' : 'bg-gray-50 dark:bg-gray-900/50 border-gray-100 dark:border-gray-700 text-gray-300 hover:border-slate-300'}`}
                     >
                       {opt}
                     </button>
                   ))}
                </div>
             </div>
           ))}
        </div>
      </div>

      {/* Footer / Results */}
      <div className="bg-gray-50 dark:bg-gray-900/50 p-8 rounded-3xl space-y-8">
         <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-1">
               <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Veículo Aprovado?</label>
               <div className="flex gap-4">
                  {(['SIM', 'NÃO'] as const).map(s => (
                    <button
                       key={s}
                       type="button"
                       onClick={() => setFooter({...footer, aprovado: s})}
                       className={`flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border-2 transition-all ${footer.aprovado === s ? (s === 'SIM' ? 'bg-green-600 border-green-700 text-white shadow-lg' : 'bg-red-600 border-red-700 text-white shadow-lg') : 'bg-white dark:bg-gray-800 text-gray-300 border-gray-100 dark:border-gray-700'}`}
                    >
                       {s}
                    </button>
                  ))}
               </div>
            </div>
            <div className="space-y-1">
               <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Observações Gerais</label>
               <textarea value={footer.obs} onChange={e => setFooter({...footer, obs: e.target.value})} className="w-full p-4 border rounded-2xl h-full min-h-[100px] text-sm" placeholder="Detalhes adicionais..." />
            </div>
         </div>
         
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-8 border-t border-gray-200 dark:border-gray-600">
            <div className="space-y-1">
               <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Responsável pelo Carregamento</label>
               <input value={footer.respCarregamento} onChange={e => setFooter({...footer, respCarregamento: e.target.value})} className="w-full p-3 border rounded-xl font-bold" />
            </div>
            <div className="space-y-1">
               <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Motorista</label>
               <input value={footer.vistoMotorista} onChange={e => setFooter({...footer, vistoMotorista: e.target.value})} className="w-full p-3 border rounded-xl" />
            </div>
         </div>
      </div>

      <div className="pt-6 flex justify-end">
        <button disabled={isSubmitting} className="px-12 py-4 bg-slate-800 hover:bg-black text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl shadow-xl transition-all flex items-center gap-2">
          {isSubmitting ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-check-double"></i>}
          <span>Salvar Checklist</span>
        </button>
      </div>
    </form>
  );
};

export default ShippingChecklistForm;