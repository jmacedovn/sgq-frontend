
import React, { useState } from 'react';
import { useCheckin } from '../../lib/useCheckin';
import { toast } from 'sonner';

const GateRegistrationForm: React.FC<{ onSave: (data: any) => void, isSubmitting: boolean, initialData?: any }> = ({ onSave, isSubmitting, initialData }) => {
  const { getCheckinByOrder, getCheckinByPlate, loading: checkinLoading } = useCheckin();
  const [orderSearch, setOrderSearch] = useState('');

  const [data, setData] = useState(initialData || {
    dataChegada: new Date().toISOString().split('T')[0],
    hora: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    placa: '', motorista: '', produtor: '', setor: '', caixasCheias: '', caixasVazias: '',
    variedade: 'MANGA', variedadeOutros: '', noChave: '', kanban: '', observacoes: '', porteiro: ''
  });

  const varieties = ['MANGA', 'GOIABA', 'ABACAXI', 'MANGA ORGÂNICA', 'GOIABA ORGÂNICA', 'OUTROS'];

  const updateField = (field: keyof typeof data, value: string) => setData({ ...data, [field]: value });

  const handleImportCheckin = async () => {
    if (!orderSearch) {
      toast.error('Informe a Placa ou Nº de Ordem');
      return;
    }

    const res = orderSearch.length > 5 && isNaN(Number(orderSearch)) 
      ? await getCheckinByPlate(orderSearch)
      : await getCheckinByOrder(orderSearch);

    if (res) {
      const { registro } = res;
      setData(prev => ({
        ...prev,
        motorista: registro.nome || prev.motorista,
        placa: registro.placa_veiculo || prev.placa,
        produtor: registro.produtor_rural || prev.produtor,
        caixasCheias: registro.quantidade_caixas?.toString() || prev.caixasCheias,
        kanban: registro.posicao_kanban?.toString() || prev.kanban,
        dataChegada: registro.horario_entrada ? new Date(registro.horario_entrada).toISOString().split('T')[0] : prev.dataChegada,
        hora: registro.horario_entrada ? new Date(registro.horario_entrada).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : prev.hora,
        variedade: registro.tipo_fruta ? registro.tipo_fruta.toUpperCase() : prev.variedade
      }));
      toast.success('Dados importados com sucesso!');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(data);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 animate-fadeIn">
      {/* SEÇÃO DE IMPORTAÇÃO CHECK-IN */}
      <div className="bg-sky-50 dark:bg-sky-900/20 border border-sky-100 dark:border-sky-800 p-4 rounded-3xl flex flex-col md:flex-row items-center gap-4">
        <div className="flex-1">
          <h4 className="text-sky-900 dark:text-sky-300 text-[10px] font-black uppercase tracking-widest mb-1">Importação Rápida Portaria</h4>
          <p className="text-sky-600/70 dark:text-sky-400 text-[9px]">Puxe os dados do motorista e veículo do sistema de Check-in</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <input 
            type="text" 
            placeholder="Placa ou Nº Ordem" 
            value={orderSearch}
            onChange={(e) => setOrderSearch(e.target.value.toUpperCase())}
            className="flex-1 md:w-48 p-2 text-xs border border-sky-200 rounded-xl outline-none focus:ring-2 ring-sky-400 font-bold"
          />
          <button 
            type="button"
            onClick={handleImportCheckin}
            disabled={checkinLoading}
            className="px-4 py-2 bg-sky-700 hover:bg-sky-800 text-white text-[10px] font-black uppercase rounded-xl shadow-md transition-all flex items-center gap-2 whitespace-nowrap disabled:opacity-50"
          >
            {checkinLoading ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-truck-fast"></i>}
            Importar
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-gray-50 dark:bg-gray-900/50 p-8 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm">
        <div className="space-y-1">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Data Chegada</label>
          <input type="date" value={data.dataChegada} onChange={e => updateField('dataChegada', e.target.value)} className="w-full p-3 border rounded-xl font-bold" />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Hora</label>
          <input type="time" value={data.hora} onChange={e => updateField('hora', e.target.value)} className="w-full p-3 border rounded-xl font-bold" />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Placa</label>
          <input value={data.placa} onChange={e => updateField('placa', e.target.value)} className="w-full p-3 border rounded-xl font-bold" />
        </div>
        <div className="space-y-1 md:col-span-2">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Motorista</label>
          <input required value={data.motorista} onChange={e => updateField('motorista', e.target.value)} className="w-full p-3 border rounded-xl font-bold" />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Setor</label>
          <input value={data.setor} onChange={e => updateField('setor', e.target.value)} className="w-full p-3 border rounded-xl" />
        </div>
        <div className="space-y-1 md:col-span-3">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Produtor</label>
          <input value={data.produtor} onChange={e => updateField('produtor', e.target.value)} className="w-full p-3 border rounded-xl font-bold" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm space-y-6">
           <h4 className="text-[10px] font-black text-sky-700 uppercase tracking-widest">Carga</h4>
           <div className="grid grid-cols-2 gap-4">
              <input type="number" value={data.caixasCheias} onChange={e => updateField('caixasCheias', e.target.value)} className="w-full p-4 bg-gray-50 dark:bg-gray-900/50 border rounded-2xl text-center text-xl font-black" placeholder="Cheias" />
              <input type="number" value={data.caixasVazias} onChange={e => updateField('caixasVazias', e.target.value)} className="w-full p-4 bg-gray-50 dark:bg-gray-900/50 border rounded-2xl text-center text-xl font-black" placeholder="Vazias" />
           </div>
           <div className="grid grid-cols-2 gap-2 pt-4 border-t">
              {varieties.map(v => (
                <button key={v} type="button" onClick={() => updateField('variedade', v)} className={`py-3 px-2 rounded-xl text-[9px] font-black uppercase border ${data.variedade === v ? 'bg-sky-700 text-white shadow-md' : 'bg-white dark:bg-gray-800 text-gray-400'}`}>{v}</button>
              ))}
           </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm space-y-6">
           <textarea value={data.observacoes} onChange={e => updateField('observacoes', e.target.value)} className="w-full p-4 border rounded-2xl h-40 text-sm" placeholder="Observações..." />
           <input value={data.porteiro} onChange={e => updateField('porteiro', e.target.value)} className="w-full p-3 border rounded-xl font-bold" placeholder="Porteiro Responsável" />
        </div>
      </div>

      <div className="pt-6 flex justify-end">
        <button disabled={isSubmitting} className="px-12 py-4 bg-sky-800 hover:bg-sky-900 text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl shadow-xl transition-all flex items-center gap-2">
          {isSubmitting ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-save"></i>}
          <span>{initialData ? 'Sincronizar Edição' : 'Salvar Registro'}</span>
        </button>
      </div>
    </form>
  );
};

export default GateRegistrationForm;
