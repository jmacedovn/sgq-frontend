
import React, { useState } from 'react';

type EvaluationStatus = 'CONFORME' | 'NÃO CONFORME' | 'NÃO SE APLICA';

interface ChecklistItem {
  id: string;
  label: string;
  hasQuantity: boolean;
  quantity: string;
  status: EvaluationStatus;
  observation: string;
}

const TruckChecklistForm: React.FC<{ onSave: (data: any) => void, isSubmitting: boolean, initialData?: any }> = ({ onSave, isSubmitting, initialData }) => {
  const [header, setHeader] = useState(initialData?.header || {
    produtor: '',
    fretista: '',
    tipoVeiculo: '',
    placa: '',
    dataInspecao: new Date().toISOString().split('T')[0]
  });

  const [items, setItems] = useState<ChecklistItem[]>(initialData?.items || [
    { id: '1', label: 'CARROCERIA', hasQuantity: true, quantity: '', status: 'CONFORME', observation: '' },
    { id: '2', label: 'ASSOALHO', hasQuantity: true, quantity: '', status: 'CONFORME', observation: '' },
    { id: '3', label: 'LONA', hasQuantity: true, quantity: '', status: 'CONFORME', observation: '' },
    { id: '4', label: 'CORDA', hasQuantity: true, quantity: '', status: 'CONFORME', observation: '' },
    { id: '5', label: 'CANTONEIRA', hasQuantity: true, quantity: '', status: 'CONFORME', observation: '' },
    { id: '6', label: 'CINTA', hasQuantity: true, quantity: '', status: 'CONFORME', observation: '' },
    { id: '7', label: 'CATRACA', hasQuantity: true, quantity: '', status: 'CONFORME', observation: '' },
    { id: '8', label: 'QUANTIDADE DE CAIXAS', hasQuantity: true, quantity: '', status: 'CONFORME', observation: '' },
    { id: '9', label: 'LIMPEZA / HIGIENIZAÇÃO', hasQuantity: true, quantity: '', status: 'CONFORME', observation: '' },
    { id: '10', label: 'ODORES', hasQuantity: true, quantity: '', status: 'CONFORME', observation: '' },
    { id: '11', label: 'RESÍDUOS DE PRAGAS', hasQuantity: true, quantity: '', status: 'CONFORME', observation: '' },
    { id: '12', label: 'MATERIAIS ESTRANHOS', hasQuantity: true, quantity: '', status: 'CONFORME', observation: '' },
  ]);

  const [footer, setFooter] = useState(initialData?.footer || {
    observacoesGerais: '',
    classificacao: 'APROVADO',
    inspecionadoPor: '',
    responsavelVeiculo: '',
    responsavelAgricola: ''
  });

  const updateItem = (id: string, field: keyof ChecklistItem, value: any) => {
    setItems(items.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ header, footer, items });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 animate-fadeIn">
      {/* Header Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 bg-gray-50 dark:bg-gray-900/50 p-6 rounded-2xl border border-gray-100 dark:border-gray-700">
        <div className="space-y-1">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Produtor</label>
          <input required value={header.produtor} onChange={e => setHeader({...header, produtor: e.target.value})} className="w-full p-2.5 border rounded-xl" placeholder="Nome do Produtor" />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Fretista</label>
          <input value={header.fretista} onChange={e => setHeader({...header, fretista: e.target.value})} className="w-full p-2.5 border rounded-xl" placeholder="Nome do Fretista" />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Tipo do Veículo</label>
          <input value={header.tipoVeiculo} onChange={e => setHeader({...header, tipoVeiculo: e.target.value})} className="w-full p-2.5 border rounded-xl" placeholder="Ex: Caminhão Baú" />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Placa do Veículo</label>
          <input value={header.placa} onChange={e => setHeader({...header, placa: e.target.value})} className="w-full p-2.5 border rounded-xl" placeholder="ABC-1234" />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Data da Inspeção</label>
          <input type="date" value={header.dataInspecao} onChange={e => setHeader({...header, dataInspecao: e.target.value})} className="w-full p-2.5 border rounded-xl" />
        </div>
      </div>

      {/* Checklist Table */}
      <div className="overflow-hidden rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm bg-white dark:bg-gray-800">
        <table className="w-full text-left">
          <thead className="bg-gray-800 border-b text-[10px] font-black uppercase tracking-widest text-white/60">
            <tr>
              <th className="px-6 py-4">Item de Verificação</th>
              <th className="px-6 py-4 text-center w-32">Quantidade</th>
              <th className="px-6 py-4 text-center w-48">Avaliação</th>
              <th className="px-6 py-4">Observação</th>
            </tr>
          </thead>
          <tbody className="divide-y text-sm">
            {items.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50/50">
                <td className="px-6 py-4 font-bold text-gray-700 dark:text-gray-200 uppercase text-[11px]">{item.label}</td>
                <td className="px-6 py-4 text-center">
                  <input 
                    type="text" 
                    value={item.quantity} 
                    onChange={e => updateItem(item.id, 'quantity', e.target.value)}
                    className="w-full p-2 border rounded-xl text-center bg-gray-50 dark:bg-gray-900/50 focus:bg-white dark:bg-gray-800 focus:ring-2 focus:ring-[#E3851B] outline-none transition-all font-bold"
                    placeholder="Digitar..."
                  />
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-1 justify-center">
                    {(['CONFORME', 'NÃO CONFORME', 'NÃO SE APLICA'] as EvaluationStatus[]).map((status) => (
                      <button
                        key={status}
                        type="button"
                        onClick={() => updateItem(item.id, 'status', status)}
                        className={`px-2 py-2 rounded-lg text-[9px] font-black uppercase transition-all border ${
                          item.status === status 
                          ? status === 'CONFORME' ? 'bg-green-600 border-green-700 text-white' : 
                            status === 'NÃO CONFORME' ? 'bg-red-600 border-red-700 text-white' :
                            'bg-gray-400 border-gray-500 text-white'
                          : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 text-gray-300 hover:bg-gray-50 dark:bg-gray-900/50'
                        }`}
                      >
                        {status === 'CONFORME' ? 'C' : status === 'NÃO CONFORME' ? 'NC' : 'NA'}
                      </button>
                    ))}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <input 
                    value={item.observation} 
                    onChange={e => updateItem(item.id, 'observation', e.target.value)}
                    className="w-full p-2 border rounded-xl text-xs bg-gray-50 dark:bg-gray-900/50 focus:bg-white dark:bg-gray-800" 
                    placeholder="Nota..."
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-gray-50 dark:bg-gray-900/50 p-8 rounded-3xl space-y-6">
        <div className="space-y-2">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Observações Gerais</label>
          <textarea value={footer.observacoesGerais} onChange={e => setFooter({...footer, observacoesGerais: e.target.value})} className="w-full p-4 border rounded-2xl h-24 text-sm bg-white dark:bg-gray-800" placeholder="..." />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Classificação Final</label>
            <div className="flex gap-4">
              {['APROVADO', 'REPROVADO'].map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setFooter({...footer, classificacao: c})}
                  className={`flex-1 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border-2 ${
                    footer.classificacao === c 
                    ? c === 'APROVADO' ? 'bg-green-600 border-green-700 text-white shadow-lg' : 'bg-red-600 border-red-700 text-white shadow-lg'
                    : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 text-gray-300 hover:border-gray-200 dark:border-gray-600'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Inspecionado Por</label>
            <input value={footer.inspecionadoPor} onChange={e => setFooter({...footer, inspecionadoPor: e.target.value})} className="w-full p-3 border rounded-xl font-bold bg-white dark:bg-gray-800" />
          </div>
        </div>
      </div>

      <div className="pt-6 flex justify-end">
        <button disabled={isSubmitting} className="px-12 py-4 bg-[#1A2B34] hover:bg-black text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl shadow-xl transition-all flex items-center gap-2">
          {isSubmitting ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-check-circle"></i>}
          <span>{initialData ? 'Sincronizar Edição' : 'Finalizar Checklist'}</span>
        </button>
      </div>
    </form>
  );
};

export default TruckChecklistForm;
