import React, { useState } from 'react';
import { useFruits } from '../../lib/useFruits';

interface ShippingItem {
  noLote: string;
  instrucao: string;
  produto: string;
  descricao: string;
  temporada: string;
  tipoCarga: string;
  qtdeTbs: string;
  pesoLiq: string;
}

const ShippingOrderForm: React.FC<{ onSave: (data: any) => void, isSubmitting: boolean }> = ({ onSave, isSubmitting }) => {
  const { fruits } = useFruits();
  const [header, setHeader] = useState({
    cliente: '',
    contrato: '',
    destino: '',
    responsavel: '',
    dataEmissao: new Date().toISOString().split('T')[0]
  });

  const [items, setItems] = useState<ShippingItem[]>([
    { noLote: '', instrucao: '', produto: '', descricao: '', temporada: '', tipoCarga: '', qtdeTbs: '', pesoLiq: '' }
  ]);

  const [logistics, setLogistics] = useState({
    origemRua: '',
    origemBox: '',
    retiradaRua: '',
    retiradaBox: '',
    assignadoPara: '',
    dataCarregamento: '',
    tipoProduto: 'CONVENCIONAL' as 'CONVENCIONAL' | 'ORGÂNICO',
    paletizacao: '1-PALETS FUMIGADOS'
  });

  const [times, setTimes] = useState({
    inicioCarregamento: '',
    fimCarregamento: '',
    inicioPicking: '',
    fimPicking: '',
    inicioPreparacao: '',
    fimPreparacao: '',
    codigoPalete: '',
    qtdePaletes: '',
    qtdeIsopor: ''
  });

  const [obs, setObs] = useState('');

  const updateItem = (idx: number, field: keyof ShippingItem, value: string) => {
    const newItems = [...items];
    newItems[idx] = { ...newItems[idx], [field]: value };
    setItems(newItems);
  };

  const addItem = () => setItems([...items, { noLote: '', instrucao: '', produto: '', descricao: '', temporada: '', tipoCarga: '', qtdeTbs: '', pesoLiq: '' }]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ header, items, logistics, times, obs });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 animate-fadeIn">
      {/* Header Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 bg-gray-50 dark:bg-gray-900/50 p-8 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm">
        <div className="md:col-span-2 space-y-1">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Cliente</label>
          <input required value={header.cliente} onChange={e => setHeader({...header, cliente: e.target.value})} className="w-full p-2.5 border rounded-xl font-bold" />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Contrato</label>
          <input value={header.contrato} onChange={e => setHeader({...header, contrato: e.target.value})} className="w-full p-2.5 border rounded-xl" />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Data Emissão</label>
          <input type="date" value={header.dataEmissao} onChange={e => setHeader({...header, dataEmissao: e.target.value})} className="w-full p-2.5 border rounded-xl" />
        </div>
        <div className="md:col-span-2 space-y-1">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Destino</label>
          <input value={header.destino} onChange={e => setHeader({...header, destino: e.target.value})} className="w-full p-2.5 border rounded-xl" />
        </div>
        <div className="md:col-span-2 space-y-1">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Responsável</label>
          <input value={header.responsavel} onChange={e => setHeader({...header, responsavel: e.target.value})} className="w-full p-2.5 border rounded-xl" />
        </div>
      </div>

      {/* Items Table */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="bg-indigo-600 px-6 py-4">
          <h4 className="text-white font-black text-xs uppercase tracking-widest">Identificação dos Produtos</h4>
        </div>
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
               <thead className="bg-gray-50 dark:bg-gray-900/50 border-b text-[10px] font-black uppercase tracking-widest text-gray-400">
                  <tr>
                     <th className="px-4 py-4">Lote / Instrução</th>
                     <th className="px-4 py-4">Produto / Descrição</th>
                     <th className="px-4 py-4">Temporada / Tipo Carga</th>
                     <th className="px-4 py-4 text-center">Qtde TBS / Peso Liq.</th>
                     <th className="px-4 py-4"></th>
                  </tr>
               </thead>
               <tbody className="divide-y">
                  {items.map((item, idx) => (
                     <tr key={idx} className="hover:bg-indigo-50/20 transition-colors">
                        <td className="px-2 py-3 space-y-1">
                           <input value={item.noLote} onChange={e => updateItem(idx, 'noLote', e.target.value)} className="w-full p-1.5 border rounded text-[10px]" placeholder="Nº Lote" />
                           <input value={item.instrucao} onChange={e => updateItem(idx, 'instrucao', e.target.value)} className="w-full p-1.5 border rounded text-[10px]" placeholder="Nº Instrução" />
                        </td>
                        <td className="px-2 py-3 space-y-1">
                           <select value={item.produto} onChange={e => updateItem(idx, 'produto', e.target.value)} className="w-full p-1.5 border rounded text-[10px] bg-white dark:bg-gray-800">
                             <option value="">Produto...</option>
                             {fruits.map(f => <option key={f.id} value={f.name}>{f.name}</option>)}
                           </select>
                           <input value={item.descricao} onChange={e => updateItem(idx, 'descricao', e.target.value)} className="w-full p-1.5 border rounded text-[10px]" placeholder="Descrição (Ex: Suco Conc.)" />
                        </td>
                        <td className="px-2 py-3 space-y-1">
                           <input value={item.temporada} onChange={e => updateItem(idx, 'temporada', e.target.value)} className="w-full p-1.5 border rounded text-[10px]" placeholder="Safra" />
                           <input value={item.tipoCarga} onChange={e => updateItem(idx, 'tipoCarga', e.target.value)} className="w-full p-1.5 border rounded text-[10px]" placeholder="Tipo Carga" />
                        </td>
                        <td className="px-2 py-3 space-y-1">
                           <input type="number" value={item.qtdeTbs} onChange={e => updateItem(idx, 'qtdeTbs', e.target.value)} className="w-full p-1.5 border rounded text-[10px] text-center" placeholder="TBS" />
                           <input type="number" value={item.pesoLiq} onChange={e => updateItem(idx, 'pesoLiq', e.target.value)} className="w-full p-1.5 border rounded text-[10px] text-center font-bold" placeholder="Kg" />
                        </td>
                        <td className="px-2 py-3 text-center">
                           <button type="button" onClick={() => setItems(items.filter((_, i) => i !== idx))} className="text-gray-300 hover:text-red-500 transition-colors"><i className="fas fa-trash-alt"></i></button>
                        </td>
                     </tr>
                  ))}
               </tbody>
            </table>
         </div>

         {/* Mobile Card View */}
         <div className="md:hidden divide-y divide-gray-100">
            {items.map((item, idx) => (
               <div key={idx} className="p-4 space-y-4 relative">
                  <button 
                     type="button" 
                     onClick={() => setItems(items.filter((_, i) => i !== idx))} 
                     className="absolute top-4 right-4 text-gray-300 hover:text-red-500"
                  >
                     <i className="fas fa-trash-alt"></i>
                  </button>

                  <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-1">
                        <label className="text-[8px] font-bold text-gray-400 uppercase">Lote</label>
                        <input value={item.noLote} onChange={e => updateItem(idx, 'noLote', e.target.value)} className="w-full p-2 border rounded-lg text-[10px]" placeholder="Nº Lote" />
                     </div>
                     <div className="space-y-1">
                        <label className="text-[8px] font-bold text-gray-400 uppercase">Instrução</label>
                        <input value={item.instrucao} onChange={e => updateItem(idx, 'instrucao', e.target.value)} className="w-full p-2 border rounded-lg text-[10px]" placeholder="Nº Instrução" />
                     </div>
                     <div className="space-y-1">
                        <label className="text-[8px] font-bold text-gray-400 uppercase">Produto</label>
                        <select value={item.produto} onChange={e => updateItem(idx, 'produto', e.target.value)} className="w-full p-2 border rounded-lg text-[10px] bg-white dark:bg-gray-800">
                          <option value="">Selecione...</option>
                          {fruits.map(f => <option key={f.id} value={f.name}>{f.name}</option>)}
                        </select>
                     </div>
                     <div className="space-y-1">
                        <label className="text-[8px] font-bold text-gray-400 uppercase">Descrição</label>
                        <input value={item.descricao} onChange={e => updateItem(idx, 'descricao', e.target.value)} className="w-full p-2 border rounded-lg text-[10px]" placeholder="Ex: Suco Conc." />
                     </div>
                     <div className="space-y-1">
                        <label className="text-[8px] font-bold text-gray-400 uppercase">Temporada</label>
                        <input value={item.temporada} onChange={e => updateItem(idx, 'temporada', e.target.value)} className="w-full p-2 border rounded-lg text-[10px]" placeholder="Safra" />
                     </div>
                     <div className="space-y-1">
                        <label className="text-[8px] font-bold text-gray-400 uppercase">Tipo Carga</label>
                        <input value={item.tipoCarga} onChange={e => updateItem(idx, 'tipoCarga', e.target.value)} className="w-full p-2 border rounded-lg text-[10px]" placeholder="Tipo Carga" />
                     </div>
                     <div className="space-y-1">
                        <label className="text-[8px] font-bold text-gray-400 uppercase">Qtde TBS</label>
                        <input type="number" value={item.qtdeTbs} onChange={e => updateItem(idx, 'qtdeTbs', e.target.value)} className="w-full p-2 border rounded-lg text-[10px] text-center" placeholder="TBS" />
                     </div>
                     <div className="space-y-1">
                        <label className="text-[8px] font-bold text-gray-400 uppercase">Peso Líq. (Kg)</label>
                        <input type="number" value={item.pesoLiq} onChange={e => updateItem(idx, 'pesoLiq', e.target.value)} className="w-full p-2 border rounded-lg text-[10px] text-center font-bold" placeholder="Kg" />
                     </div>
                  </div>
               </div>
            ))}
         </div>
      </div>

      <button type="button" onClick={addItem} className="w-full py-3 border-2 border-dashed border-indigo-200 rounded-2xl text-indigo-400 font-black text-[10px] uppercase tracking-widest hover:bg-indigo-50 transition-all">
        + Adicionar Item de Carregamento
      </button>

      {/* Logistics Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm space-y-6">
           <h4 className="text-[10px] font-black text-indigo-700 uppercase tracking-widest border-b pb-2">Logística e Localização</h4>
           <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                 <label className="text-[9px] font-black text-gray-400 uppercase">Origem (Rua / Box)</label>
                 <div className="flex gap-2">
                    <input value={logistics.origemRua} onChange={e => setLogistics({...logistics, origemRua: e.target.value})} className="w-full p-2 border rounded-xl text-center" placeholder="RUA" />
                    <input value={logistics.origemBox} onChange={e => setLogistics({...logistics, origemBox: e.target.value})} className="w-full p-2 border rounded-xl text-center" placeholder="BOX" />
                 </div>
              </div>
              <div className="space-y-2">
                 <label className="text-[9px] font-black text-gray-400 uppercase">Retirada (Rua / Box)</label>
                 <div className="flex gap-2">
                    <input value={logistics.retiradaRua} onChange={e => setLogistics({...logistics, retiradaRua: e.target.value})} className="w-full p-2 border rounded-xl text-center" placeholder="RUA" />
                    <input value={logistics.retiradaBox} onChange={e => setLogistics({...logistics, retiradaBox: e.target.value})} className="w-full p-2 border rounded-xl text-center" placeholder="BOX" />
                 </div>
              </div>
           </div>
           <div className="space-y-2">
              <label className="text-[9px] font-black text-gray-400 uppercase">Assignado Para</label>
              <input value={logistics.assignadoPara} onChange={e => setLogistics({...logistics, assignadoPara: e.target.value})} className="w-full p-2.5 border rounded-xl" />
           </div>
           <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                 <label className="text-[9px] font-black text-gray-400 uppercase">Data Carregamento</label>
                 <input type="date" value={logistics.dataCarregamento} onChange={e => setLogistics({...logistics, dataCarregamento: e.target.value})} className="w-full p-2.5 border rounded-xl" />
              </div>
              <div className="space-y-2">
                 <label className="text-[9px] font-black text-gray-400 uppercase">Tipo de Produto</label>
                 <select value={logistics.tipoProduto} onChange={e => setLogistics({...logistics, tipoProduto: e.target.value as any})} className="w-full p-2.5 border rounded-xl bg-gray-50 dark:bg-gray-900/50">
                    <option value="CONVENCIONAL">CONVENCIONAL</option>
                    <option value="ORGÂNICO">ORGÂNICO</option>
                 </select>
              </div>
           </div>
        </div>

        <div className="bg-gray-50 dark:bg-gray-900/50 p-8 rounded-3xl border border-gray-200 dark:border-gray-600 shadow-inner space-y-4">
           <h4 className="text-[10px] font-black text-indigo-800 uppercase tracking-widest">Tempos de Operação</h4>
           <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                 <label className="text-[9px] font-bold text-gray-500 uppercase">Início Carreg.</label>
                 <input type="time" value={times.inicioCarregamento} onChange={e => setTimes({...times, inicioCarregamento: e.target.value})} className="w-full p-2 border rounded-lg bg-white dark:bg-gray-800" />
              </div>
              <div className="space-y-1">
                 <label className="text-[9px] font-bold text-gray-500 uppercase">Fim Carreg.</label>
                 <input type="time" value={times.fimCarregamento} onChange={e => setTimes({...times, fimCarregamento: e.target.value})} className="w-full p-2 border rounded-lg bg-white dark:bg-gray-800" />
              </div>
              <div className="space-y-1">
                 <label className="text-[9px] font-bold text-gray-500 uppercase">Início Picking</label>
                 <input type="time" value={times.inicioPicking} onChange={e => setTimes({...times, inicioPicking: e.target.value})} className="w-full p-2 border rounded-lg bg-white dark:bg-gray-800" />
              </div>
              <div className="space-y-1">
                 <label className="text-[9px] font-bold text-gray-500 uppercase">Fim Picking</label>
                 <input type="time" value={times.fimPicking} onChange={e => setTimes({...times, fimPicking: e.target.value})} className="w-full p-2 border rounded-lg bg-white dark:bg-gray-800" />
              </div>
           </div>
           <div className="pt-4 border-t border-gray-200 dark:border-gray-600 grid grid-cols-3 gap-3">
              <div className="space-y-1">
                 <label className="text-[8px] font-black text-gray-400 uppercase">Cód. Palete</label>
                 <input value={times.codigoPalete} onChange={e => setTimes({...times, codigoPalete: e.target.value})} className="w-full p-2 border rounded-lg bg-white dark:bg-gray-800 text-xs" />
              </div>
              <div className="space-y-1">
                 <label className="text-[8px] font-black text-gray-400 uppercase">Qt. Paletes</label>
                 <input type="number" value={times.qtdePaletes} onChange={e => setTimes({...times, qtdePaletes: e.target.value})} className="w-full p-2 border rounded-lg bg-white dark:bg-gray-800 text-xs" />
              </div>
              <div className="space-y-1">
                 <label className="text-[8px] font-black text-gray-400 uppercase">Discos Isopor</label>
                 <input type="number" value={times.qtdeIsopor} onChange={e => setTimes({...times, qtdeIsopor: e.target.value})} className="w-full p-2 border rounded-lg bg-white dark:bg-gray-800 text-xs" />
              </div>
           </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm space-y-4">
        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Observações de Carregamento</label>
        <textarea value={obs} onChange={e => setObs(e.target.value)} className="w-full p-4 border rounded-2xl h-24 text-sm" placeholder="Registrar anomalias, detalhes de paletização, etc..." />
      </div>

      <div className="pt-6 border-t flex justify-end">
        <button disabled={isSubmitting} className="px-12 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl shadow-xl transition-all flex items-center gap-2">
          {isSubmitting ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-paper-plane"></i>}
          <span>Finalizar Pedido</span>
        </button>
      </div>
    </form>
  );
};

export default ShippingOrderForm;