import React, { useState } from 'react';

interface LabelEntry {
  id: string;
  data: string;
  horario: string;
  lote: string;
  envaseAsseptico: 'A' | 'D' | 'C' | '';
  produto: 'CONVENCIONAL' | 'ORGÂNICO' | '';
  etiquetasLotesDocs: string;
  etiquetasNumeracaoTambores: string;
  etiquetasAmostrasBags: string;
  etiquetasDescartadas: string;
  vistoQualidade: string;
  vistoProducao: string;
  vistoConferenciaQualidade: string;
}

interface LabelDeliveryFormProps {
  onSave: (data: any) => void;
  isSubmitting: boolean;
  initialData?: any;
}

const LabelDeliveryForm: React.FC<LabelDeliveryFormProps> = ({ onSave, isSubmitting, initialData }) => {
  const [entries, setEntries] = useState<LabelEntry[]>(initialData?.entries || [
    {
      id: crypto.randomUUID(),
      data: new Date().toLocaleDateString('pt-BR'),
      horario: '',
      lote: '',
      envaseAsseptico: '',
      produto: '',
      etiquetasLotesDocs: '',
      etiquetasNumeracaoTambores: '',
      etiquetasAmostrasBags: '',
      etiquetasDescartadas: '',
      vistoQualidade: '',
      vistoProducao: '',
      vistoConferenciaQualidade: ''
    }
  ]);

  const addEntry = () => {
    setEntries([...entries, {
      id: crypto.randomUUID(),
      data: new Date().toLocaleDateString('pt-BR'),
      horario: '',
      lote: '',
      envaseAsseptico: '',
      produto: '',
      etiquetasLotesDocs: '',
      etiquetasNumeracaoTambores: '',
      etiquetasAmostrasBags: '',
      etiquetasDescartadas: '',
      vistoQualidade: '',
      vistoProducao: '',
      vistoConferenciaQualidade: ''
    }]);
  };

  const removeEntry = (id: string) => {
    if (entries.length > 1) {
      setEntries(entries.filter(e => e.id !== id));
    }
  };

  const updateEntry = (id: string, field: keyof LabelEntry, value: string) => {
    setEntries(entries.map(e => e.id === id ? { ...e, [field]: value } : e));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ entries });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Desktop View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-900/50 text-[10px] font-black uppercase tracking-widest text-gray-500">
              <th className="p-3 border text-left">Data</th>
              <th className="p-3 border text-left">Horário</th>
              <th className="p-3 border text-left">Lote</th>
              <th className="p-3 border text-left">Envase</th>
              <th className="p-3 border text-left">Produto</th>
              <th className="p-3 border text-center">Lotes/Docs</th>
              <th className="p-3 border text-center">Num. Tamb.</th>
              <th className="p-3 border text-center">Amost./Bags</th>
              <th className="p-3 border text-center">Descart.</th>
              <th className="p-3 border text-left">Vistos (Q/P/CQ)</th>
              <th className="p-3 border text-center"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {entries.map((entry) => (
              <tr key={entry.id} className="hover:bg-gray-50 dark:bg-gray-900/50 transition-colors">
                <td className="p-2 border">
                  <input 
                    type="text" 
                    value={entry.data} 
                    onChange={e => updateEntry(entry.id, 'data', e.target.value)}
                    className="w-full p-1 text-xs border rounded"
                  />
                </td>
                <td className="p-2 border">
                  <input 
                    type="time" 
                    value={entry.horario} 
                    onChange={e => updateEntry(entry.id, 'horario', e.target.value)}
                    className="w-full p-1 text-xs border rounded"
                  />
                </td>
                <td className="p-2 border">
                  <input 
                    type="text" 
                    value={entry.lote} 
                    onChange={e => updateEntry(entry.id, 'lote', e.target.value)}
                    className="w-full p-1 text-xs border rounded font-mono"
                    placeholder="Lote"
                  />
                </td>
                <td className="p-2 border">
                  <select 
                    value={entry.envaseAsseptico} 
                    onChange={e => updateEntry(entry.id, 'envaseAsseptico', e.target.value as any)}
                    className="w-full p-1 text-xs border rounded"
                  >
                    <option value="">-</option>
                    <option value="A">A</option>
                    <option value="D">D</option>
                    <option value="C">C</option>
                  </select>
                </td>
                <td className="p-2 border">
                  <select 
                    value={entry.produto} 
                    onChange={e => updateEntry(entry.id, 'produto', e.target.value as any)}
                    className="w-full p-1 text-xs border rounded"
                  >
                    <option value="">-</option>
                    <option value="CONVENCIONAL">CONVENCIONAL</option>
                    <option value="ORGÂNICO">ORGÂNICO</option>
                  </select>
                </td>
                <td className="p-2 border">
                  <input 
                    type="number" 
                    value={entry.etiquetasLotesDocs} 
                    onChange={e => updateEntry(entry.id, 'etiquetasLotesDocs', e.target.value)}
                    className="w-full p-1 text-xs border rounded text-center"
                  />
                </td>
                <td className="p-2 border">
                  <input 
                    type="number" 
                    value={entry.etiquetasNumeracaoTambores} 
                    onChange={e => updateEntry(entry.id, 'etiquetasNumeracaoTambores', e.target.value)}
                    className="w-full p-1 text-xs border rounded text-center"
                  />
                </td>
                <td className="p-2 border">
                  <input 
                    type="number" 
                    value={entry.etiquetasAmostrasBags} 
                    onChange={e => updateEntry(entry.id, 'etiquetasAmostrasBags', e.target.value)}
                    className="w-full p-1 text-xs border rounded text-center"
                  />
                </td>
                <td className="p-2 border">
                  <input 
                    type="number" 
                    value={entry.etiquetasDescartadas} 
                    onChange={e => updateEntry(entry.id, 'etiquetasDescartadas', e.target.value)}
                    className="w-full p-1 text-xs border rounded text-center"
                  />
                </td>
                <td className="p-2 border">
                  <div className="flex flex-col gap-1">
                    <input 
                      type="text" 
                      value={entry.vistoQualidade} 
                      onChange={e => updateEntry(entry.id, 'vistoQualidade', e.target.value)}
                      className="w-full p-1 text-[10px] border rounded"
                      placeholder="Qualidade"
                    />
                    <input 
                      type="text" 
                      value={entry.vistoProducao} 
                      onChange={e => updateEntry(entry.id, 'vistoProducao', e.target.value)}
                      className="w-full p-1 text-[10px] border rounded"
                      placeholder="Produção"
                    />
                    <input 
                      type="text" 
                      value={entry.vistoConferenciaQualidade} 
                      onChange={e => updateEntry(entry.id, 'vistoConferenciaQualidade', e.target.value)}
                      className="w-full p-1 text-[10px] border rounded"
                      placeholder="Conf. Qualidade"
                    />
                  </div>
                </td>
                <td className="p-2 border text-center">
                  <button 
                    type="button" 
                    onClick={() => removeEntry(entry.id)}
                    className="text-red-400 hover:text-red-600 transition-colors"
                  >
                    <i className="fas fa-trash-can"></i>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile View */}
      <div className="md:hidden space-y-4">
        {entries.map((entry, idx) => (
          <div key={entry.id} className="bg-white dark:bg-gray-800 border rounded-2xl p-4 shadow-sm space-y-4 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-teal-500"></div>
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-black text-teal-700 uppercase tracking-widest">Entrega #{idx + 1}</span>
              <button 
                type="button" 
                onClick={() => removeEntry(entry.id)}
                className="w-8 h-8 rounded-full bg-red-50 text-red-500 flex items-center justify-center text-xs"
              >
                <i className="fas fa-trash-can"></i>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[8px] font-bold text-gray-400 uppercase">Data</label>
                <input 
                  type="text" 
                  value={entry.data} 
                  onChange={e => updateEntry(entry.id, 'data', e.target.value)}
                  className="w-full p-2 border rounded-lg text-xs"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[8px] font-bold text-gray-400 uppercase">Horário</label>
                <input 
                  type="time" 
                  value={entry.horario} 
                  onChange={e => updateEntry(entry.id, 'horario', e.target.value)}
                  className="w-full p-2 border rounded-lg text-xs"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[8px] font-bold text-gray-400 uppercase">Lote</label>
              <input 
                type="text" 
                value={entry.lote} 
                onChange={e => updateEntry(entry.id, 'lote', e.target.value)}
                className="w-full p-2 border rounded-lg text-xs font-mono"
                placeholder="Lote"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[8px] font-bold text-gray-400 uppercase">Envase</label>
                <select 
                  value={entry.envaseAsseptico} 
                  onChange={e => updateEntry(entry.id, 'envaseAsseptico', e.target.value as any)}
                  className="w-full p-2 border rounded-lg text-xs"
                >
                  <option value="">-</option>
                  <option value="A">A</option>
                  <option value="D">D</option>
                  <option value="C">C</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[8px] font-bold text-gray-400 uppercase">Produto</label>
                <select 
                  value={entry.produto} 
                  onChange={e => updateEntry(entry.id, 'produto', e.target.value as any)}
                  className="w-full p-2 border rounded-lg text-xs"
                >
                  <option value="">-</option>
                  <option value="CONVENCIONAL">CONVENCIONAL</option>
                  <option value="ORGÂNICO">ORGÂNICO</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[8px] font-bold text-gray-400 uppercase">Lotes/Docs</label>
                <input 
                  type="number" 
                  value={entry.etiquetasLotesDocs} 
                  onChange={e => updateEntry(entry.id, 'etiquetasLotesDocs', e.target.value)}
                  className="w-full p-2 border rounded-lg text-xs text-center"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[8px] font-bold text-gray-400 uppercase">Num. Tambores</label>
                <input 
                  type="number" 
                  value={entry.etiquetasNumeracaoTambores} 
                  onChange={e => updateEntry(entry.id, 'etiquetasNumeracaoTambores', e.target.value)}
                  className="w-full p-2 border rounded-lg text-xs text-center"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[8px] font-bold text-gray-400 uppercase">Amost./Bags</label>
                <input 
                  type="number" 
                  value={entry.etiquetasAmostrasBags} 
                  onChange={e => updateEntry(entry.id, 'etiquetasAmostrasBags', e.target.value)}
                  className="w-full p-2 border rounded-lg text-xs text-center"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[8px] font-bold text-gray-400 uppercase">Descartadas</label>
                <input 
                  type="number" 
                  value={entry.etiquetasDescartadas} 
                  onChange={e => updateEntry(entry.id, 'etiquetasDescartadas', e.target.value)}
                  className="w-full p-2 border rounded-lg text-xs text-center"
                />
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t">
              <label className="text-[8px] font-bold text-gray-400 uppercase block">Vistos</label>
              <div className="grid grid-cols-1 gap-2">
                <input 
                  type="text" 
                  value={entry.vistoQualidade} 
                  onChange={e => updateEntry(entry.id, 'vistoQualidade', e.target.value)}
                  className="w-full p-2 border rounded-lg text-[10px]"
                  placeholder="Visto Qualidade"
                />
                <input 
                  type="text" 
                  value={entry.vistoProducao} 
                  onChange={e => updateEntry(entry.id, 'vistoProducao', e.target.value)}
                  className="w-full p-2 border rounded-lg text-[10px]"
                  placeholder="Visto Produção"
                />
                <input 
                  type="text" 
                  value={entry.vistoConferenciaQualidade} 
                  onChange={e => updateEntry(entry.id, 'vistoConferenciaQualidade', e.target.value)}
                  className="w-full p-2 border rounded-lg text-[10px]"
                  placeholder="Visto Conf. Qualidade"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <button 
        type="button" 
        onClick={addEntry}
        className="w-full py-4 border-2 border-dashed border-gray-200 dark:border-gray-600 rounded-2xl text-gray-400 hover:text-teal-600 hover:border-teal-200 hover:bg-teal-50 transition-all font-bold text-sm flex items-center justify-center gap-2"
      >
        <i className="fas fa-plus-circle"></i>
        Adicionar Nova Entrega
      </button>

      <div className="flex justify-end pt-6">
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full md:w-auto px-12 py-4 bg-teal-600 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-teal-700 disabled:opacity-50 shadow-lg shadow-teal-200 transition-all"
        >
          {isSubmitting ? <i className="fas fa-spinner fa-spin mr-2"></i> : <i className="fas fa-save mr-2"></i>}
          Salvar Registro
        </button>
      </div>
    </form>
  );
};

export default LabelDeliveryForm;
