
import React, { useState } from 'react';
import { useFruits } from '../../lib/useFruits';

interface ProductIdRow {
  instrucao: string;
  lote: string;
  produto: string;
  tipo: 'CONVENCIONAL' | 'ORGÂNICO';
  qtdeTambores: string;
  pesoTambor: string;
  totalKg: string;
}

const OrderMovementForm: React.FC<{ onSave: (data: any) => void, isSubmitting: boolean, initialData?: any }> = ({ onSave, isSubmitting, initialData }) => {
  const { fruits } = useFruits();
  const [header, setHeader] = useState(initialData?.header || {
    data: new Date().toISOString().split('T')[0],
    origem: '', destino: '', controle: '',
    tipoOrdem: { categoria: 'ENTRADA' as 'ENTRADA' | 'SAÍDA' | 'CARREGAMENTO', sub: 'PRODUÇÃO' }
  });

  const [products, setProducts] = useState<string[]>(initialData?.products || []);
  const [additionalInfo, setAdditionalInfo] = useState(initialData?.additionalInfo || '');
  const [items, setItems] = useState<ProductIdRow[]>(initialData?.items ||
    Array(5).fill(null).map(() => ({
      instrucao: '', lote: '', produto: '', tipo: 'CONVENCIONAL', qtdeTambores: '', pesoTambor: '', totalKg: ''
    }))
  );

  const [footer, setFooter] = useState(initialData?.footer || {
    obs: '', respQualidade: '', respCpa: ''
  });

  const productOptions = [
    'POLPA DE MANGA INTEGRAL', 'POLPA DE MANGA CONCENTRADA',
    'POLPA DE GOIABA INTEGRAL', 'POLPA DE GOIABA CONCENTRADA',
    'POLPA DE MELANCIA INTEGRAL', 'POLPA DE MELANCIA CONCENTRADA',
    'POLPA DE ABACAXI INTEGRAL', 'POLPA DE ABACAXI CONCENTRADA',
    'AROMA', 'TRICARB', 'SUCO DE MARACUJA CONCENTRADO', 'SUCO DE CANA CONCENTRADO'
  ];

  const toggleProduct = (p: string) => {
    setProducts(prev => prev.includes(p) ? prev.filter(item => item !== p) : [...prev, p]);
  };

  const updateItem = (idx: number, field: keyof ProductIdRow, value: string) => {
    const newItems = [...items];
    newItems[idx] = { ...newItems[idx], [field]: value };
    if (field === 'qtdeTambores' || field === 'pesoTambor') {
       const qty = parseFloat(newItems[idx].qtdeTambores) || 0;
       const weight = parseFloat(newItems[idx].pesoTambor) || 0;
       newItems[idx].totalKg = (qty * weight).toFixed(2);
    }
    setItems(newItems);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ header, products, additionalInfo, items, footer });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 animate-fadeIn">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 bg-gray-50 dark:bg-gray-900/50 p-8 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm">
        <div className="space-y-1">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Data</label>
          <input type="date" value={header.data} onChange={e => setHeader({...header, data: e.target.value})} className="w-full p-2.5 border rounded-xl" />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Origem</label>
          <input value={header.origem} onChange={e => setHeader({...header, origem: e.target.value})} className="w-full p-2.5 border rounded-xl" />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Destino</label>
          <input value={header.destino} onChange={e => setHeader({...header, destino: e.target.value})} className="w-full p-2.5 border rounded-xl" />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Controle</label>
          <input value={header.controle} onChange={e => setHeader({...header, controle: e.target.value})} className="w-full p-2.5 border rounded-xl" />
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm space-y-6">
        <h4 className="text-[10px] font-black text-indigo-700 uppercase tracking-widest">Classificação</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
           {[
             { cat: 'ENTRADA', subs: ['PRODUÇÃO', 'DEVOLUÇÃO'] },
             { cat: 'SAÍDA', subs: ['REPROCESSO', 'AMOSTRA'] },
             { cat: 'CARREGAMENTO', subs: ['VENDA', 'TRANSFERÊNCIA'] }
           ].map(group => (
             <div key={group.cat} className="space-y-3 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-700">
                <span className="text-xs font-black text-gray-400 tracking-widest">{group.cat}</span>
                <div className="flex flex-col gap-2">
                   {group.subs.map(sub => (
                     <button key={sub} type="button" onClick={() => setHeader({...header, tipoOrdem: { categoria: group.cat as any, sub }})} className={`py-3 px-4 rounded-xl text-[9px] font-black uppercase transition-all border ${header.tipoOrdem.sub === sub ? 'bg-indigo-700 text-white shadow-md' : 'bg-white dark:bg-gray-800 text-gray-400 hover:bg-gray-50 dark:bg-gray-900/50'}`}>{sub}</button>
                   ))}
                </div>
             </div>
           ))}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm space-y-6">
        <h4 className="text-[10px] font-black text-indigo-700 uppercase tracking-widest">Produtos</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
           {productOptions.map(p => (
             <label key={p} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${products.includes(p) ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-gray-50 dark:bg-gray-900/50 border-gray-100 dark:border-gray-700 text-gray-400'}`}>
                <input type="checkbox" checked={products.includes(p)} onChange={() => toggleProduct(p)} className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-indigo-700" />
                <span className="text-[10px] font-bold uppercase">{p}</span>
             </label>
           ))}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="bg-indigo-700 px-6 py-4"><h4 className="text-white font-black text-xs uppercase tracking-widest">Identificação</h4></div>
        
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 dark:bg-gray-900/50 border-b text-[10px] font-black uppercase tracking-widest text-gray-400">
              <tr>
                <th className="px-4 py-4 w-12 text-center">#</th>
                <th className="px-4 py-4">Instrução / Lote</th>
                <th className="px-4 py-4">Produto</th>
                <th className="px-4 py-4 text-center">Qtde / Peso</th>
                <th className="px-4 py-4 text-center">Total (Kg)</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {items.map((item, idx) => (
                <tr key={idx} className="hover:bg-indigo-50/20">
                  <td className="px-4 py-3 text-center text-gray-300 font-black">{idx + 1}</td>
                  <td className="px-4 py-3 space-y-1">
                    <input value={item.instrucao} onChange={e => updateItem(idx, 'instrucao', e.target.value)} className="w-full p-1.5 border rounded text-[10px]" placeholder="Instrução" />
                    <input value={item.lote} onChange={e => updateItem(idx, 'lote', e.target.value)} className="w-full p-1.5 border rounded text-[10px]" placeholder="Lote" />
                  </td>
                  <td className="px-4 py-3">
                    <select value={item.produto} onChange={e => updateItem(idx, 'produto', e.target.value)} className="w-full p-1.5 border rounded text-[10px] bg-white dark:bg-gray-800">
                      <option value="">Produto...</option>
                      {fruits.map(f => <option key={f.id} value={f.name}>{f.name}</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-3 space-y-1">
                    <input value={item.qtdeTambores} onChange={e => updateItem(idx, 'qtdeTambores', e.target.value)} className="w-full p-1.5 border rounded text-[10px] text-center" placeholder="Qtde" />
                    <input value={item.pesoTambor} onChange={e => updateItem(idx, 'pesoTambor', e.target.value)} className="w-full p-1.5 border rounded text-[10px] text-center" placeholder="Peso" />
                  </td>
                  <td className="px-4 py-3 text-center font-black text-indigo-700">{item.totalKg}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden divide-y divide-gray-100">
          {items.map((item, idx) => (
            <div key={idx} className="p-4 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Item {idx + 1}</span>
                <span className="text-xs font-black text-indigo-700">{item.totalKg} Kg</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-gray-400 uppercase">Instrução</label>
                  <input value={item.instrucao} onChange={e => updateItem(idx, 'instrucao', e.target.value)} className="w-full p-2 border rounded text-xs" />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-gray-400 uppercase">Lote</label>
                  <input value={item.lote} onChange={e => updateItem(idx, 'lote', e.target.value)} className="w-full p-2 border rounded text-xs" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-black text-gray-400 uppercase">Produto</label>
                <select value={item.produto} onChange={e => updateItem(idx, 'produto', e.target.value)} className="w-full p-2 border rounded text-xs bg-white dark:bg-gray-800">
                  <option value="">Selecione...</option>
                  {fruits.map(f => <option key={f.id} value={f.name}>{f.name}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-gray-400 uppercase">Qtde Tambores</label>
                  <input value={item.qtdeTambores} onChange={e => updateItem(idx, 'qtdeTambores', e.target.value)} className="w-full p-2 border rounded text-center text-xs" />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-gray-400 uppercase">Peso Tambor</label>
                  <input value={item.pesoTambor} onChange={e => updateItem(idx, 'pesoTambor', e.target.value)} className="w-full p-2 border rounded text-center text-xs" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-gray-50 dark:bg-gray-900/50 p-8 rounded-3xl space-y-4">
        <textarea value={footer.obs} onChange={e => setFooter({...footer, obs: e.target.value})} className="w-full p-4 border rounded-2xl h-24 text-sm" placeholder="Observações..." />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           <input value={footer.respQualidade} onChange={e => setFooter({...footer, respQualidade: e.target.value})} className="w-full p-3 border rounded-xl font-bold" placeholder="Resp. Qualidade" />
           <input value={footer.respCpa} onChange={e => setFooter({...footer, respCpa: e.target.value})} className="w-full p-3 border rounded-xl font-bold" placeholder="Resp. CPA" />
        </div>
      </div>

      <div className="pt-6 flex justify-end">
        <button disabled={isSubmitting} className="px-12 py-4 bg-indigo-700 hover:bg-indigo-800 text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl shadow-xl transition-all flex items-center gap-2">
          {isSubmitting ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-save"></i>}
          <span>{initialData ? 'Sincronizar Edição' : 'Salvar Ordem'}</span>
        </button>
      </div>
    </form>
  );
};

export default OrderMovementForm;
