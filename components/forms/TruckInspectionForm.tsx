import React, { useState } from 'react';

type Criterion = 'BOM' | 'Ruim' | 'AUSENTE' | 'PRESENTE' | 'N/A';

interface InspectionRow {
  id: string;
  label: string;
  value: Criterion;
}

const TruckInspectionForm: React.FC<{ onSave: (data: any) => void, isSubmitting: boolean }> = ({ onSave, isSubmitting }) => {
  const [header, setHeader] = useState({
    data: new Date().toISOString().split('T')[0],
    motorista: '',
    placa: '',
    marcaModelo: '',
    turno: '',
    km: ''
  });

  const [maintenanceItems, setMaintenanceItems] = useState<InspectionRow[]>([
    { id: '1', label: 'VAZAMENTO DE FLUIDOS (ÁGUA/ÓLEOS/FREIO/COMB)', value: 'BOM' },
    { id: '2', label: 'NÍVEIS DE FLUIDOS', value: 'BOM' },
    { id: '3', label: 'ESTADO DOS PNEUS (BOLHAS, DESGASTES, FUROS)', value: 'BOM' },
    { id: '4', label: 'ESTADO DAS RODAS (PARAFUSOS, AMASSADOS, CUBO)', value: 'BOM' },
    { id: '5', label: 'ILUMINAÇÃO (FARÓIS, LANTERNAS, SETAS, RÉ, FREIO)', value: 'BOM' },
    { id: '6', label: 'PINTURA / AMASSADOS', value: 'BOM' },
    { id: '7', label: 'ESPELHOS RETROVISORES (INTERNO / EXTERNO)', value: 'BOM' },
    { id: '8', label: 'ITENS DE SEGURANÇA (EXTINTORES, CINTO, RÉ)', value: 'BOM' },
    { id: '9', label: 'ESTADO DA CARROCERIA (LIMPEZA, ESTRUTURA)', value: 'BOM' },
    { id: '10', label: 'BUZINA / ALARMES DE PAINEL', value: 'BOM' },
    { id: '11', label: 'PARTE ELÉTRICA (PARTIDA, MIOLO, PAINEL)', value: 'BOM' },
    { id: '12', label: 'ADESIVOS / TAG / PLACAS', value: 'BOM' },
    { id: '13', label: 'DIREÇÃO (RUÍDOS, FOLGAS, VIBRAÇÕES)', value: 'BOM' },
    { id: '14', label: 'CÂMBIO', value: 'BOM' },
  ]);

  const [cleaningItems, setCleaningItems] = useState<InspectionRow[]>([
    { id: 'c1', label: 'CARROCERIA', value: 'BOM' },
    { id: 'c2', label: 'CINTAS E CORDAS', value: 'BOM' },
    { id: 'c3', label: 'ASSOALHO', value: 'BOM' },
    { id: 'c4', label: 'HIGIENIZAÇÃO', value: 'BOM' },
    { id: 'c5', label: 'ODORES', value: 'AUSENTE' },
    { id: 'c6', label: 'RESÍDUOS DE PRAGAS', value: 'AUSENTE' },
    { id: 'c7', label: 'MATERIAIS ESTRANHOS', value: 'AUSENTE' },
  ]);

  const [footer, setFooter] = useState({
    naoConformidades: '',
    motoristaAssinatura: '',
    liderAssinatura: ''
  });

  const updateMaintenance = (id: string, val: Criterion) => {
    setMaintenanceItems(maintenanceItems.map(i => i.id === id ? { ...i, value: val } : i));
  };

  const updateCleaning = (id: string, val: Criterion) => {
    setCleaningItems(cleaningItems.map(i => i.id === id ? { ...i, value: val } : i));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ header, maintenanceItems, cleaningItems, footer });
  };

  const RadioGroup = ({ value, onChange, options }: { value: Criterion, onChange: (v: Criterion) => void, options: Criterion[] }) => (
    <div className="flex gap-1">
      {options.map(o => (
        <button
          key={o}
          type="button"
          onClick={() => onChange(o)}
          className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase transition-all border ${value === o ? (o === 'BOM' || o === 'AUSENTE' ? 'bg-green-600 border-green-700 text-white' : 'bg-red-600 border-red-700 text-white shadow-md') : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 text-gray-300'}`}
        >
          {o}
        </button>
      ))}
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-8 animate-fadeIn">
      {/* Header Fields */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-gray-50 dark:bg-gray-900/50 p-8 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm">
        <div className="space-y-1">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Data</label>
          <input type="date" value={header.data} onChange={e => setHeader({...header, data: e.target.value})} className="w-full p-2.5 border rounded-xl" />
        </div>
        <div className="md:col-span-2 space-y-1">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Motorista</label>
          <input required value={header.motorista} onChange={e => setHeader({...header, motorista: e.target.value})} className="w-full p-2.5 border rounded-xl" />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Placa</label>
          <input value={header.placa} onChange={e => setHeader({...header, placa: e.target.value})} className="w-full p-2.5 border rounded-xl" placeholder="ABC-1234" />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Marca / Modelo</label>
          <input value={header.marcaModelo} onChange={e => setHeader({...header, marcaModelo: e.target.value})} className="w-full p-2.5 border rounded-xl" />
        </div>
        <div className="space-y-1">
          <div className="grid grid-cols-2 gap-2">
             <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Turno</label>
                <input value={header.turno} onChange={e => setHeader({...header, turno: e.target.value})} className="w-full p-2.5 border rounded-xl" />
             </div>
             <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">KM</label>
                <input type="number" value={header.km} onChange={e => setHeader({...header, km: e.target.value})} className="w-full p-2.5 border rounded-xl" />
             </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Maintenance */}
        <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] border border-gray-100 dark:border-gray-700 shadow-xl overflow-hidden">
           <div className="bg-neutral-800 px-6 py-4">
              <h4 className="text-white font-black text-[10px] uppercase tracking-widest">Itens de Verificação de Manutenção</h4>
           </div>
           <div className="divide-y divide-gray-50 text-[11px]">
              {maintenanceItems.map(item => (
                <div key={item.id} className="flex items-center justify-between p-4 hover:bg-neutral-50 transition-colors">
                   <span className="font-bold text-gray-600 dark:text-gray-300 uppercase pr-4">{item.label}</span>
                   <RadioGroup value={item.value} onChange={v => updateMaintenance(item.id, v)} options={['BOM', 'Ruim', 'N/A']} />
                </div>
              ))}
           </div>
        </div>

        {/* Cleaning */}
        <div className="space-y-8">
          <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] border border-gray-100 dark:border-gray-700 shadow-xl overflow-hidden">
             <div className="bg-neutral-700 px-6 py-4">
                <h4 className="text-white font-black text-[10px] uppercase tracking-widest">Itens de Verificação de Limpeza</h4>
             </div>
             <div className="divide-y divide-gray-50 text-[11px]">
                {cleaningItems.map(item => (
                  <div key={item.id} className="flex items-center justify-between p-4 hover:bg-neutral-50 transition-colors">
                     <span className="font-bold text-gray-600 dark:text-gray-300 uppercase pr-4">{item.label}</span>
                     <RadioGroup 
                       value={item.value} 
                       onChange={v => updateCleaning(item.id, v)} 
                       options={item.label.includes('ODORES') || item.label.includes('PRAGAS') || item.label.includes('MATERIAIS') ? ['AUSENTE', 'PRESENTE'] : ['BOM', 'Ruim', 'N/A']} 
                     />
                  </div>
                ))}
             </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-900/50 p-8 rounded-[2.5rem] space-y-4">
             <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Descreva o motivo das Não Conformidades apontadas</label>
             <textarea value={footer.naoConformidades} onChange={e => setFooter({...footer, naoConformidades: e.target.value})} className="w-full p-4 border rounded-2xl h-40 text-sm outline-none focus:ring-2 focus:ring-neutral-500" />
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-8 rounded-[3rem] shadow-xl border border-gray-100 dark:border-gray-700">
         <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-1">
               <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Motorista</label>
               <input value={footer.motoristaAssinatura} onChange={e => setFooter({...footer, motoristaAssinatura: e.target.value})} className="w-full p-3 border rounded-xl" />
            </div>
            <div className="space-y-1">
               <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Líder</label>
               <input value={footer.liderAssinatura} onChange={e => setFooter({...footer, liderAssinatura: e.target.value})} className="w-full p-3 border rounded-xl" />
            </div>
         </div>
         <p className="mt-8 text-center text-[9px] font-black text-gray-300 uppercase tracking-[0.3em]">Confirmo que os itens acima foram verificados e as informações são verdadeiras</p>
      </div>

      <div className="pt-6 flex justify-end">
        <button disabled={isSubmitting} className="px-12 py-4 bg-neutral-800 hover:bg-black text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl shadow-xl transition-all flex items-center gap-2">
          {isSubmitting ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-screwdriver-wrench"></i>}
          <span>Salvar Inspeção</span>
        </button>
      </div>
    </form>
  );
};

export default TruckInspectionForm;