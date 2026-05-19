
import React, { useState } from 'react';
import { useCheckin } from '../../lib/useCheckin';
import { toast } from 'sonner';

interface AnalysisRow {
  dataRecebimento: string;
  nf: string;
  quantidade: string;
  valorUnitario: string;
  dataFabricacao: string;
  lote: string;
  amostraAnalise: string;
  status: 'A' | 'R' | 'AR' | null;
  almoxarife: string;
  responsavelAlmoxarifado: string;
}

const ReceptionAnalysisForm: React.FC<{ onSave: (data: any) => void, isSubmitting: boolean, initialData?: any }> = ({ onSave, isSubmitting, initialData }) => {
  const { getCheckinByOrder, getCheckinByPlate, loading: checkinLoading } = useCheckin();
  const [orderSearch, setOrderSearch] = useState('');

  const [data, setData] = useState(initialData || {
    produto: '',
    fornecedor: '',
    observacoes: '',
    rows: Array(1).fill(null).map(() => ({
      dataRecebimento: new Date().toISOString().split('T')[0],
      nf: '', quantidade: '', valorUnitario: '', dataFabricacao: '',
      lote: '', amostraAnalise: '', status: null, almoxarife: '', responsavelAlmoxarifado: ''
    })) as AnalysisRow[]
  });

  const updateRow = (idx: number, field: keyof AnalysisRow, value: any) => {
    const newRows = [...data.rows];
    newRows[idx] = { ...newRows[idx], [field]: value };
    setData({ ...data, rows: newRows });
  };

  const addRow = () => {
    setData({
      ...data,
      rows: [...data.rows, {
        dataRecebimento: new Date().toISOString().split('T')[0],
        nf: '', quantidade: '', valorUnitario: '', dataFabricacao: '',
        lote: '', amostraAnalise: '', status: null, almoxarife: '', responsavelAlmoxarifado: ''
      }]
    });
  };

  const handleImportCheckin = async () => {
    if (!orderSearch) {
      toast.error('Informe a Placa ou Nº de Ordem');
      return;
    }

    const dataCheckin = orderSearch.length > 5 && isNaN(Number(orderSearch)) 
      ? await getCheckinByPlate(orderSearch)
      : await getCheckinByOrder(orderSearch);

    if (dataCheckin) {
      const { registro, analise } = dataCheckin;
      
      setData(prev => ({
        ...prev,
        produto: registro.tipo_fruta || prev.produto,
        fornecedor: registro.produtor_rural || prev.fornecedor,
        rows: prev.rows.map((row, i) => i === 0 ? {
          ...row,
          dataRecebimento: registro.horario_entrada ? new Date(registro.horario_entrada).toISOString().split('T')[0] : row.dataRecebimento,
          quantidade: registro.quantidade_caixas?.toString() || row.quantidade,
          lote: registro.numero_ordem?.toString() || row.lote,
          amostraAnalise: analise ? `Brix: ${analise.media_brix}` : row.amostraAnalise
        } : row)
      }));
      toast.success('Dados importados com sucesso!');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(data);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* SEÇÃO DE IMPORTAÇÃO CHECK-IN */}
      <div className="bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-800 p-4 rounded-2xl flex flex-col md:flex-row items-center gap-4">
        <div className="flex-1">
          <h4 className="text-rose-900 dark:text-rose-300 text-[10px] font-black uppercase tracking-widest mb-1">Importação de Recebimento</h4>
          <p className="text-rose-600/70 dark:text-rose-400 text-[9px]">Vincule este recebimento a um veículo do Check-in</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <input 
            type="text" 
            placeholder="Placa ou Nº Ordem" 
            value={orderSearch}
            onChange={(e) => setOrderSearch(e.target.value.toUpperCase())}
            className="flex-1 md:w-48 p-2 text-xs border border-rose-200 rounded-xl outline-none focus:ring-2 ring-rose-400 font-bold"
          />
          <button 
            type="button"
            onClick={handleImportCheckin}
            disabled={checkinLoading}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-black uppercase rounded-xl shadow-md transition-all flex items-center gap-2 whitespace-nowrap disabled:opacity-50"
          >
            {checkinLoading ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-sync"></i>}
            Importar
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 dark:bg-gray-900/50 p-6 rounded-2xl border border-gray-100 dark:border-gray-700">
        <div className="space-y-1">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Produto</label>
          <input required value={data.produto} onChange={e => setData({...data, produto: e.target.value})} className="w-full p-2.5 border rounded-xl font-bold" />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Fornecedor</label>
          <input required value={data.fornecedor} onChange={e => setData({...data, fornecedor: e.target.value})} className="w-full p-2.5 border rounded-xl font-bold" />
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm bg-white dark:bg-gray-800">
        <table className="w-full text-left text-xs">
          <thead className="bg-gray-50 dark:bg-gray-900/50 border-b text-[10px] font-black uppercase tracking-widest text-gray-400">
            <tr>
              <th className="px-4 py-4">Data Rec./N.F.</th>
              <th className="px-4 py-4">Qtde / V. Unit</th>
              <th className="px-4 py-4">Fabr. / Lote</th>
              <th className="px-4 py-4 text-center">Status</th>
              <th className="px-4 py-4">Responsáveis</th>
              <th className="px-4 py-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {data.rows.map((row: any, idx: number) => (
              <tr key={idx} className="hover:bg-rose-50/20">
                <td className="px-2 py-3 space-y-1">
                  <input type="date" value={row.dataRecebimento} onChange={e => updateRow(idx, 'dataRecebimento', e.target.value)} className="w-full p-1.5 border rounded text-[10px]" />
                  <input value={row.nf} onChange={e => updateRow(idx, 'nf', e.target.value)} className="w-full p-1.5 border rounded text-[10px]" placeholder="N.F." />
                </td>
                <td className="px-2 py-3 space-y-1">
                  <input value={row.quantidade} onChange={e => updateRow(idx, 'quantidade', e.target.value)} className="w-full p-1.5 border rounded text-[10px] text-center" />
                  <input value={row.valorUnitario} onChange={e => updateRow(idx, 'valorUnitario', e.target.value)} className="w-full p-1.5 border rounded text-[10px] text-center" />
                </td>
                <td className="px-2 py-3 space-y-1">
                  <input type="date" value={row.dataFabricacao} onChange={e => updateRow(idx, 'dataFabricacao', e.target.value)} className="w-full p-1.5 border rounded text-[10px]" />
                  <input value={row.lote} onChange={e => updateRow(idx, 'lote', e.target.value)} className="w-full p-1.5 border rounded text-[10px]" placeholder="Lote" />
                </td>
                <td className="px-2 py-3">
                  <div className="flex gap-1 justify-center">
                    {(['A', 'R', 'AR'] as const).map(s => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => updateRow(idx, 'status', s)}
                        className={`w-8 h-8 rounded text-[9px] font-black border transition-all ${
                          row.status === s 
                          ? s === 'A' ? 'bg-green-600 text-white' : s === 'R' ? 'bg-red-600 text-white' : 'bg-yellow-600 text-white'
                          : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 text-gray-300'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </td>
                <td className="px-2 py-3 space-y-1">
                  <input value={row.almoxarife} onChange={e => updateRow(idx, 'almoxarife', e.target.value)} className="w-full p-1.5 border rounded text-[10px]" placeholder="Almox." />
                  <input value={row.responsavelAlmoxarifado} onChange={e => updateRow(idx, 'responsavelAlmoxarifado', e.target.value)} className="w-full p-1.5 border rounded text-[10px]" placeholder="Resp." />
                </td>
                <td className="px-2 py-3 text-center">
                  <button type="button" onClick={() => setData({...data, rows: data.rows.filter((_:any, i:any) => i !== idx)})} className="text-red-400"><i className="fas fa-trash-alt"></i></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {data.rows.map((row: any, idx: number) => (
          <div key={idx} className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-4 shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
              <span className="text-[10px] font-black text-rose-700 uppercase tracking-widest">Entrada #{idx + 1}</span>
              <button type="button" onClick={() => setData({...data, rows: data.rows.filter((_:any, i:any) => i !== idx)})} className="text-red-400 p-1">
                <i className="fas fa-trash-alt text-xs"></i>
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[8px] font-black text-gray-400 uppercase">Data Rec./N.F.</label>
                <input type="date" value={row.dataRecebimento} onChange={e => updateRow(idx, 'dataRecebimento', e.target.value)} className="w-full p-2 border rounded-lg text-[10px]" />
                <input value={row.nf} onChange={e => updateRow(idx, 'nf', e.target.value)} className="w-full p-2 border rounded-lg text-[10px]" placeholder="N.F." />
              </div>
              <div className="space-y-1">
                <label className="text-[8px] font-black text-gray-400 uppercase">Qtde / V. Unit</label>
                <input value={row.quantidade} onChange={e => updateRow(idx, 'quantidade', e.target.value)} className="w-full p-2 border rounded-lg text-[10px] text-center" placeholder="Qtde" />
                <input value={row.valorUnitario} onChange={e => updateRow(idx, 'valorUnitario', e.target.value)} className="w-full p-2 border rounded-lg text-[10px] text-center" placeholder="V. Unit" />
              </div>
              <div className="space-y-1">
                <label className="text-[8px] font-black text-gray-400 uppercase">Fabr. / Lote</label>
                <input type="date" value={row.dataFabricacao} onChange={e => updateRow(idx, 'dataFabricacao', e.target.value)} className="w-full p-2 border rounded-lg text-[10px]" />
                <input value={row.lote} onChange={e => updateRow(idx, 'lote', e.target.value)} className="w-full p-2 border rounded-lg text-[10px]" placeholder="Lote" />
              </div>
              <div className="space-y-1">
                <label className="text-[8px] font-black text-gray-400 uppercase block mb-1">Status</label>
                <div className="flex gap-1">
                  {(['A', 'R', 'AR'] as const).map(s => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => updateRow(idx, 'status', s)}
                      className={`flex-1 h-8 rounded text-[9px] font-black border transition-all ${
                        row.status === s 
                        ? s === 'A' ? 'bg-green-600 text-white border-green-600' : s === 'R' ? 'bg-red-600 text-white border-red-600' : 'bg-yellow-600 text-white border-yellow-600'
                        : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 text-gray-300'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <div className="col-span-2 space-y-1">
                <label className="text-[8px] font-black text-gray-400 uppercase">Responsáveis</label>
                <div className="grid grid-cols-2 gap-2">
                  <input value={row.almoxarife} onChange={e => updateRow(idx, 'almoxarife', e.target.value)} className="w-full p-2 border rounded-lg text-[10px]" placeholder="Almoxarife" />
                  <input value={row.responsavelAlmoxarifado} onChange={e => updateRow(idx, 'responsavelAlmoxarifado', e.target.value)} className="w-full p-2 border rounded-lg text-[10px]" placeholder="Responsável" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-gray-50 dark:bg-gray-900/50 p-6 rounded-3xl">
        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 block mb-2">Observações</label>
        <textarea value={data.observacoes} onChange={e => setData({...data, observacoes: e.target.value})} className="w-full p-4 border rounded-2xl h-24 text-sm" />
      </div>

      <div className="pt-6 border-t flex justify-end">
        <button disabled={isSubmitting} className="px-12 py-4 bg-rose-700 hover:bg-rose-800 text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl shadow-xl transition-all flex items-center gap-2">
          {isSubmitting ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-save"></i>}
          <span>{initialData ? 'Sincronizar Edição' : 'Salvar Análise'}</span>
        </button>
      </div>
    </form>
  );
};

export default ReceptionAnalysisForm;
