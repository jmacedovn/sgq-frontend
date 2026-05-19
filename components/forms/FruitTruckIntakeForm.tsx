
import React, { useState } from 'react';
import { useCheckin } from '../../lib/useCheckin';
import { toast } from 'sonner';

type EvaluationStatus = 'CONFORME' | 'NÃO CONFORME' | 'NÃO SE APLICA';

interface InspectionItem {
  id: string;
  label: string;
  entryQty: string;
  exitQty: string;
  status: EvaluationStatus;
  observation: string;
}

const FruitTruckIntakeForm: React.FC<{ onSave: (data: any) => void, isSubmitting: boolean, initialData?: any }> = ({ onSave, isSubmitting, initialData }) => {
  const { getCheckinByOrder, getCheckinByPlate, loading: checkinLoading } = useCheckin();
  const [orderSearch, setOrderSearch] = useState('');

  const [header, setHeader] = useState(initialData?.header || {
    motorista: '',
    placa: '',
    frutaTipo: 'CONVENCIONAL' as 'CONVENCIONAL' | 'ORGÂNICA',
    dtcCtStatus: 'CONFORME' as 'CONFORME' | 'NÃO CONFORME' | 'N/A',
    dataEntrada: '',
    horaEntrada: '',
    dataSaida: '',
    horaSaida: ''
  });

  const [items, setItems] = useState<InspectionItem[]>(initialData?.items || [
    { id: '1', label: 'CANTONEIRA', entryQty: '', exitQty: '', status: 'CONFORME', observation: '' },
    { id: '2', label: 'CINTA', entryQty: '', exitQty: '', status: 'CONFORME', observation: '' },
    { id: '3', label: 'CATRACA', entryQty: '', exitQty: '', status: 'CONFORME', observation: '' },
    { id: '4', label: 'CAIXAS CHEIAS', entryQty: '', exitQty: '', status: 'CONFORME', observation: '' },
    { id: '5', label: 'CAIXAS VAZIAS', entryQty: '', exitQty: '', status: 'CONFORME', observation: '' },
  ]);

  const [conservation, setConservation] = useState<any[]>(initialData?.conservation || [
    { id: 'c1', label: 'CARROCERIA', status: 'CONFORME', observation: '' },
    { id: 'c2', label: 'ASSOALHO', status: 'CONFORME', observation: '' },
    { id: 'c3', label: 'LONA', status: 'CONFORME', observation: '' },
    { id: 'c4', label: 'CORDA', status: 'CONFORME', observation: '' },
    { id: 'c5', label: 'LIMPEZA / HIGIENIZAÇÃO', status: 'CONFORME', observation: '' },
    { id: 'c6', label: 'ODORES', status: 'CONFORME', observation: '' },
    { id: 'c7', label: 'RESÍDUOS DE PRAGAS', status: 'CONFORME', observation: '' },
    { id: 'c8', label: 'MATERIAIS ESTRANHOS', status: 'CONFORME', observation: '' },
    { id: 'c9', label: 'TRANSPORTE DE OUTROS MATERIAIS', status: 'CONFORME', observation: '' },
  ]);

  const [footer, setFooter] = useState(initialData?.footer || {
    acoesCorretivas: '',
    classificacao: 'APROVADO' as 'APROVADO' | 'REPROVADO' | 'APROVADO COM RESTRIÇÃO',
    inspecionadoPor: '',
    manobrista: '',
    motoristaAssinatura: ''
  });

  const updateHeader = (field: keyof typeof header, value: any) => setHeader({ ...header, [field]: value });

  const updateItem = (id: string, field: keyof InspectionItem, value: any) => {
    setItems(items.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const updateConservation = (id: string, field: 'status' | 'observation', value: any) => {
    setConservation(conservation.map(c => c.id === id ? { ...c, [field]: value } : c));
  };

  const handleImportCheckin = async () => {
    if (!orderSearch) {
      toast.error('Informe a Placa ou Nº de Ordem');
      return;
    }

    const data = orderSearch.length > 5 && isNaN(Number(orderSearch)) 
      ? await getCheckinByPlate(orderSearch)
      : await getCheckinByOrder(orderSearch);

    if (data) {
      const { registro } = data;
      setHeader(prev => ({
        ...prev,
        motorista: registro.nome || prev.motorista,
        placa: registro.placa_veiculo || prev.placa,
        dataEntrada: registro.horario_entrada ? new Date(registro.horario_entrada).toISOString().split('T')[0] : prev.dataEntrada,
        horaEntrada: registro.horario_entrada ? new Date(registro.horario_entrada).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }) : prev.horaEntrada
      }));
      toast.success('Dados importados com sucesso!');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ header, items, conservation, footer });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 animate-fadeIn">
      {/* SEÇÃO DE IMPORTAÇÃO CHECK-IN */}
      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800 p-4 rounded-3xl flex flex-col md:flex-row items-center gap-4">
        <div className="flex-1">
          <h4 className="text-amber-900 dark:text-amber-300 text-[10px] font-black uppercase tracking-widest mb-1">Busca Automática de Veículo</h4>
          <p className="text-amber-600/70 dark:text-amber-400 text-[9px]">Sincronize os dados com o sistema de Check-in de Matéria Prima</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <input 
            type="text" 
            placeholder="Placa ou Nº Ordem" 
            value={orderSearch}
            onChange={(e) => setOrderSearch(e.target.value.toUpperCase())}
            className="flex-1 md:w-48 p-2 text-xs border border-amber-200 rounded-xl outline-none focus:ring-2 ring-amber-400 font-bold"
          />
          <button 
            type="button"
            onClick={handleImportCheckin}
            disabled={checkinLoading}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-[10px] font-black uppercase rounded-xl shadow-md transition-all flex items-center gap-2 whitespace-nowrap disabled:opacity-50"
          >
            {checkinLoading ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-search"></i>}
            Buscar
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 bg-gray-50 dark:bg-gray-900/50 p-8 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm">
        <div className="space-y-1 col-span-1 md:col-span-2">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Motorista</label>
          <input required value={header.motorista} onChange={e => updateHeader('motorista', e.target.value)} className="w-full p-2.5 border rounded-xl font-bold" />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Placa</label>
          <input value={header.placa} onChange={e => updateHeader('placa', e.target.value)} className="w-full p-2.5 border rounded-xl font-bold" />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Data Entrada</label>
          <input type="date" value={header.dataEntrada} onChange={e => updateHeader('dataEntrada', e.target.value)} className="w-full p-2 border rounded-xl" />
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="bg-amber-600 px-6 py-4">
          <h4 className="text-white font-black text-xs uppercase tracking-widest">Itens de Avaliação</h4>
        </div>
        
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 dark:bg-gray-900/50 border-b text-[10px] font-black uppercase tracking-widest text-gray-400">
              <tr>
                <th className="px-6 py-4">Item</th>
                <th className="px-6 py-4 text-center">Entrada</th>
                <th className="px-6 py-4 text-center">Saída</th>
                <th className="px-6 py-4 text-center">Situação</th>
                <th className="px-6 py-4">Obs</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {items.map(item => (
                <tr key={item.id} className="hover:bg-amber-50/20 transition-colors">
                  <td className="px-6 py-4 font-bold text-gray-700 dark:text-gray-200">{item.label}</td>
                  <td className="px-6 py-4 w-24"><input value={item.entryQty} onChange={e => updateItem(item.id, 'entryQty', e.target.value)} className="w-full p-1 border rounded text-center" /></td>
                  <td className="px-6 py-4 w-24"><input value={item.exitQty} onChange={e => updateItem(item.id, 'exitQty', e.target.value)} className="w-full p-1 border rounded text-center" /></td>
                  <td className="px-6 py-4">
                    <div className="flex gap-1 justify-center">
                      {(['CONFORME', 'NÃO CONFORME', 'NÃO SE APLICA'] as const).map(s => (
                        <button key={s} type="button" onClick={() => updateItem(item.id, 'status', s)} className={`p-2 rounded-lg text-[8px] font-black border transition-all ${item.status === s ? 'bg-amber-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-300'}`}>{s === 'CONFORME' ? 'C' : s === 'NÃO CONFORME' ? 'NC' : 'NA'}</button>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4"><input value={item.observation} onChange={e => updateItem(item.id, 'observation', e.target.value)} className="w-full p-1 border rounded text-[10px]" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden divide-y divide-gray-100">
          {items.map(item => (
            <div key={item.id} className="p-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black text-gray-700 dark:text-gray-200 uppercase tracking-widest">{item.label}</span>
                <div className="flex gap-1">
                  {(['CONFORME', 'NÃO CONFORME', 'NÃO SE APLICA'] as const).map(s => (
                    <button key={s} type="button" onClick={() => updateItem(item.id, 'status', s)} className={`w-8 h-8 rounded-lg text-[8px] font-black border transition-all ${item.status === s ? 'bg-amber-600 text-white border-amber-600' : 'bg-white dark:bg-gray-800 text-gray-300 border-gray-200 dark:border-gray-600'}`}>{s === 'CONFORME' ? 'C' : s === 'NÃO CONFORME' ? 'NC' : 'NA'}</button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[8px] font-bold text-gray-400 uppercase">Entrada</label>
                  <input value={item.entryQty} onChange={e => updateItem(item.id, 'entryQty', e.target.value)} className="flex-1 min-w-0 w-full p-2 border border-gray-200 dark:border-gray-600 rounded-lg text-xs text-center" placeholder="Qtde" />
                </div>
                <div className="space-y-1">
                  <label className="text-[8px] font-bold text-gray-400 uppercase">Saída</label>
                  <input value={item.exitQty} onChange={e => updateItem(item.id, 'exitQty', e.target.value)} className="flex-1 min-w-0 w-full p-2 border border-gray-200 dark:border-gray-600 rounded-lg text-xs text-center" placeholder="Qtde" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[8px] font-bold text-gray-400 uppercase">Observação</label>
                <input value={item.observation} onChange={e => updateItem(item.id, 'observation', e.target.value)} className="w-full p-2 border border-gray-200 dark:border-gray-600 rounded-lg text-[10px]" placeholder="Notas..." />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-gray-50 dark:bg-gray-900/50 p-8 rounded-3xl space-y-6">
        <div className="space-y-1">
           <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Classificação do Fornecedor</label>
           <div className="flex gap-2">
              {(['APROVADO', 'REPROVADO', 'APROVADO COM RESTRIÇÃO'] as const).map(c => (
                <button key={c} type="button" onClick={() => setFooter({...footer, classificacao: c})} className={`flex-1 py-3 px-1 rounded-xl text-[8px] font-black border transition-all ${footer.classificacao === c ? 'bg-amber-800 text-white shadow-lg' : 'bg-white dark:bg-gray-800 text-gray-400'}`}>{c}</button>
              ))}
           </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t">
          <input value={footer.inspecionadoPor} onChange={e => setFooter({...footer, inspecionadoPor: e.target.value})} className="w-full p-3 border rounded-xl font-bold" placeholder="Inspecionado Por" />
          <input value={footer.motoristaAssinatura} onChange={e => setFooter({...footer, motoristaAssinatura: e.target.value})} className="w-full p-3 border rounded-xl font-bold" placeholder="Motorista" />
        </div>
      </div>

      <div className="pt-6 flex justify-end">
        <button disabled={isSubmitting} className="px-12 py-4 bg-amber-700 hover:bg-amber-800 text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl shadow-xl transition-all flex items-center gap-2">
          {isSubmitting ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-save"></i>}
          <span>{initialData ? 'Sincronizar Edição' : 'Salvar Entrada'}</span>
        </button>
      </div>
    </form>
  );
};

export default FruitTruckIntakeForm;
