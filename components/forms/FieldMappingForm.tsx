
import React, { useState } from 'react';

interface Requirement {
  id: string;
  label: string;
  status: 'SIM' | 'NÃO' | null;
  comment: string;
}

const FieldMappingForm: React.FC<{ onSave: (data: any) => void, isSubmitting: boolean, initialData?: any }> = ({ onSave, isSubmitting, initialData }) => {
  const [header, setHeader] = useState(initialData?.header || {
    produtor: '',
    propriedade: '',
    endereco: '',
    cidade: '',
    cnpj: '',
    dataVisita: new Date().toISOString().split('T')[0],
    variedades: ''
  });

  const [items, setItems] = useState<Requirement[]>(initialData?.items || [
    { id: '1', label: 'O produtor tem a rastreabilidade de todos os processos realizados na lavoura?', status: null, comment: '' },
    { id: '2', label: 'O produtor está cumprindo com o preenchimento dos documentos deixados pela indústria?', status: null, comment: '' },
    { id: '3', label: 'O produtor é adepto às Boas Práticas Agrícolas?', status: null, comment: '' },
    { id: '4', label: 'São utilizados somente os agroquímicos registrados/autorizados pelo MAPA e ANVISA?', status: null, comment: 'Verificar F01.01-AG' },
    { id: '5', label: 'O responsável pela aplicação utiliza os equipamentos de proteção (EPIs) necessários?', status: null, comment: '' },
    { id: '6', label: 'Os agroquímicos são armazenados em local adequado e não são abandonados em áreas da lavoura?', status: null, comment: '' },
    { id: '7', label: 'O produtor tem veículo próprio para logística da matéria-prima?', status: null, comment: 'Se sim, preencher F15.01-AG' },
    { id: '8', label: 'O produtor tem caixas plásticas ou big bags para transporte da matéria-prima?', status: null, comment: '' },
  ]);

  const [production, setProduction] = useState(initialData?.production || {
    quantidadePlantas: '',
    volumeMateriaPrima: '',
    florada: '',
    clima: '',
    fotos: 'ANEXO'
  });

  const [footer, setFooter] = useState(initialData?.footer || {
    avaliacao: 'APROVADO',
    observacoes: '',
    responsavelMapeamento: '',
    responsavelAgricola: ''
  });

  const updateRequirement = (id: string, field: keyof Requirement, value: any) => {
    setItems(items.map(req => req.id === id ? { ...req, [field]: value } : req));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ header, production, footer, items });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 bg-gray-50 dark:bg-gray-900/50 p-6 rounded-2xl border border-gray-100 dark:border-gray-700">
        <div className="space-y-1">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Produtor</label>
          <input required value={header.produtor} onChange={e => setHeader({...header, produtor: e.target.value})} className="w-full p-2.5 border rounded-xl" />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Propriedade</label>
          <input value={header.propriedade} onChange={e => setHeader({...header, propriedade: e.target.value})} className="w-full p-2.5 border rounded-xl" />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Endereço</label>
          <input value={header.endereco} onChange={e => setHeader({...header, endereco: e.target.value})} className="w-full p-2.5 border rounded-xl" />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Cidade</label>
          <input value={header.cidade} onChange={e => setHeader({...header, cidade: e.target.value})} className="w-full p-2.5 border rounded-xl" />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">CNPJ</label>
          <input value={header.cnpj} onChange={e => setHeader({...header, cnpj: e.target.value})} className="w-full p-2.5 border rounded-xl" />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Data da Visita</label>
          <input type="date" value={header.dataVisita} onChange={e => setHeader({...header, dataVisita: e.target.value})} className="w-full p-2.5 border rounded-xl" />
        </div>
        <div className="col-span-full space-y-1">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Variedade(s)</label>
          <input value={header.variedades} onChange={e => setHeader({...header, variedades: e.target.value})} className="w-full p-2.5 border rounded-xl" />
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="bg-gray-800 px-6 py-4">
          <h4 className="text-white font-black text-xs uppercase tracking-widest">Requisitos Técnicos</h4>
        </div>
        <div className="p-0 overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 dark:bg-gray-900/50 text-[10px] font-black uppercase tracking-widest text-gray-400 border-b">
              <tr>
                <th className="px-6 py-4">Requisito</th>
                <th className="px-6 py-4 text-center w-40">Status</th>
                <th className="px-6 py-4">Comentários</th>
              </tr>
            </thead>
            <tbody className="divide-y text-xs">
              {items.map((req) => (
                <tr key={req.id}>
                  <td className="px-6 py-5 font-medium text-gray-700 dark:text-gray-200">{req.label}</td>
                  <td className="px-6 py-5">
                    <div className="flex gap-2 justify-center">
                      {(['SIM', 'NÃO'] as const).map(s => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => updateRequirement(req.id, 'status', s)}
                          className={`px-3 py-2 rounded-xl text-[10px] font-black transition-all border ${
                            req.status === s 
                            ? s === 'SIM' ? 'bg-cyan-600 border-cyan-700 text-white' : 'bg-red-600 border-red-700 text-white'
                            : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 text-gray-300'
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <input 
                      value={req.comment} 
                      onChange={e => updateRequirement(req.id, 'comment', e.target.value)}
                      className="w-full p-2 border rounded-lg bg-gray-50 dark:bg-gray-900/50 focus:bg-white dark:bg-gray-800 outline-none"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 bg-cyan-50/30 p-8 rounded-3xl border border-cyan-100">
        <div className="space-y-1">
          <label className="text-[10px] font-black text-cyan-600 uppercase tracking-widest">Qt. Plantas</label>
          <input type="number" value={production.quantidadePlantas} onChange={e => setProduction({...production, quantidadePlantas: e.target.value})} className="w-full p-3 bg-white dark:bg-gray-800 border border-cyan-100 rounded-xl font-bold" />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-black text-cyan-600 uppercase tracking-widest">Volume Estimado</label>
          <input value={production.volumeMateriaPrima} onChange={e => setProduction({...production, volumeMateriaPrima: e.target.value})} className="w-full p-3 bg-white dark:bg-gray-800 border border-cyan-100 rounded-xl font-bold" />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-black text-cyan-600 uppercase tracking-widest">Florada</label>
          <input value={production.florada} onChange={e => setProduction({...production, florada: e.target.value})} className="w-full p-3 bg-white dark:bg-gray-800 border border-cyan-100 rounded-xl" />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-black text-cyan-600 uppercase tracking-widest">Clima (Temp/Umid)</label>
          <input value={production.clima} onChange={e => setProduction({...production, clima: e.target.value})} className="w-full p-3 bg-white dark:bg-gray-800 border border-cyan-100 rounded-xl" />
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-8 rounded-[2.5rem] shadow-xl border border-gray-100 dark:border-gray-700 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           <div className="space-y-4">
              <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Avaliação Final</h4>
              <div className="flex gap-4">
                 {(['APROVADO', 'REPROVADO'] as const).map(a => (
                   <button
                     key={a}
                     type="button"
                     onClick={() => setFooter({...footer, avaliacao: a})}
                     className={`flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border-2 transition-all ${
                       footer.avaliacao === a 
                       ? a === 'APROVADO' ? 'bg-cyan-600 border-cyan-700 text-white shadow-lg' : 'bg-red-600 border-red-700 text-white shadow-lg'
                       : 'bg-gray-50 dark:bg-gray-900/50 border-gray-100 dark:border-gray-700 text-gray-300'
                     }`}
                   >
                     {a}
                   </button>
                 ))}
              </div>
           </div>
           <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Observações</label>
              <textarea 
                value={footer.observacoes}
                onChange={e => setFooter({...footer, observacoes: e.target.value})}
                className="w-full p-4 bg-gray-50 dark:bg-gray-900/50 border rounded-2xl h-full min-h-[120px] outline-none focus:ring-2 focus:ring-cyan-500 text-sm"
              ></textarea>
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Responsável Mapeamento</label>
            <input value={footer.responsavelMapeamento} onChange={e => setFooter({...footer, responsavelMapeamento: e.target.value})} className="w-full p-3 border rounded-xl font-bold" />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Responsável Agrícola</label>
            <input value={footer.responsavelAgricola} onChange={e => setFooter({...footer, responsavelAgricola: e.target.value})} className="w-full p-3 border rounded-xl font-bold" />
          </div>
        </div>
      </div>

      <div className="pt-6 flex justify-end">
        <button disabled={isSubmitting} className="px-12 py-4 bg-cyan-700 hover:bg-cyan-800 text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl shadow-2xl transition-all flex items-center gap-2">
          {isSubmitting ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-map-marked-alt"></i>}
          <span>{initialData ? 'Sincronizar Edição' : 'Salvar Mapeamento'}</span>
        </button>
      </div>
    </form>
  );
};

export default FieldMappingForm;
