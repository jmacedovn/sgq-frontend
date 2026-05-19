
import React, { useState } from 'react';

interface ReprocessRow {
  lote: string;
  envase: string;
  nTanque: string;
  sequencia: string;
  quantidade: string;
  pesoUnitario: string;
  pesoTotal: string;
  brixReal: string;
  brixMedio: string;
  motivo: string;
  observacoes: string;
  descricaoProduto: string;
}

const ReprocessMonitoringForm: React.FC<{ onSave: (data: any) => void, isSubmitting: boolean, initialData?: any }> = ({ onSave, isSubmitting, initialData }) => {
  const [header, setHeader] = useState(initialData?.[0] ? {
    mes: initialData[0].mes,
    dataProcesso: initialData[0].dataProcesso,
    turno: initialData[0].turno,
    descFruta: initialData[0].descFruta,
    safra: initialData[0].safra,
    codProdAdicionado: initialData[0].codProdAdicionado,
    codProdutoFinal: initialData[0].codProdutoFinal
  } : {
    mes: new Date().toLocaleString('pt-BR', { month: 'long' }).toUpperCase(),
    dataProcesso: new Date().toISOString().split('T')[0],
    turno: '3 T - 1L',
    descFruta: 'MANGO',
    safra: '2024 - 2025',
    codProdAdicionado: 'MC',
    codProdutoFinal: 'MC'
  });

  const [rows, setRows] = useState<ReprocessRow[]>(initialData || [
    { lote: '', envase: 'D', nTanque: '', sequencia: '', quantidade: '', pesoUnitario: '220', pesoTotal: '', brixReal: '', brixMedio: '', motivo: 'Reprocesso', observacoes: '', descricaoProduto: '' }
  ]);

  const updateRow = (idx: number, field: keyof ReprocessRow, value: string) => {
    const newRows = [...rows];
    newRows[idx] = { ...newRows[idx], [field]: value };
    if (field === 'quantidade' || field === 'pesoUnitario') {
      const q = parseFloat(newRows[idx].quantidade) || 0;
      const p = parseFloat(newRows[idx].pesoUnitario) || 0;
      newRows[idx].pesoTotal = (q * p).toString();
    }
    setRows(newRows);
  };

  const addRow = () => setRows([...rows, { ...rows[rows.length - 1], lote: '', quantidade: '', pesoTotal: '' }]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const dataToSave = rows.map(row => ({
      ...header,
      ...row
    }));
    onSave(dataToSave);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 animate-fadeIn">
      <div className="bg-red-50 p-6 rounded-3xl border border-red-100 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="space-y-1">
          <label className="text-[10px] font-black text-red-700 uppercase tracking-widest">Mês / Data Processo</label>
          <div className="flex gap-2">
            <input value={header.mes} onChange={e => setHeader({...header, mes: e.target.value})} className="w-1/3 p-2 border rounded-xl text-center font-bold" />
            <input type="date" value={header.dataProcesso} onChange={e => setHeader({...header, dataProcesso: e.target.value})} className="flex-1 p-2 border rounded-xl" />
          </div>
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-black text-red-700 uppercase tracking-widest">Turno / Safra</label>
          <div className="flex gap-2">
            <input value={header.turno} onChange={e => setHeader({...header, turno: e.target.value})} className="w-1/2 p-2 border rounded-xl" />
            <input value={header.safra} onChange={e => setHeader({...header, safra: e.target.value})} className="w-1/2 p-2 border rounded-xl" />
          </div>
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-black text-red-700 uppercase tracking-widest">Fruta / Cód. Prod.</label>
          <div className="flex gap-2">
            <input value={header.descFruta} onChange={e => setHeader({...header, descFruta: e.target.value})} className="w-1/2 p-2 border rounded-xl font-bold" />
            <input value={header.codProdAdicionado} onChange={e => setHeader({...header, codProdAdicionado: e.target.value})} className="w-1/4 p-2 border rounded-xl text-center" />
            <input value={header.codProdutoFinal} onChange={e => setHeader({...header, codProdutoFinal: e.target.value})} className="w-1/4 p-2 border rounded-xl text-center" />
          </div>
        </div>
        <div className="flex items-end">
           <button type="button" onClick={addRow} className="w-full py-2 bg-white dark:bg-gray-800 border-2 border-dashed border-red-200 text-red-500 font-bold rounded-xl hover:bg-red-100 transition-colors">
             + Nova Linha
           </button>
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto rounded-3xl border border-gray-100 dark:border-gray-700 shadow-xl bg-white dark:bg-gray-800">
        <table className="w-full text-left text-[11px]">
          <thead className="bg-gray-800 text-white font-black uppercase tracking-widest">
            <tr>
              <th className="px-4 py-4">Identificação (Lote/Env/Tan)</th>
              <th className="px-4 py-4 text-center">Qtde (Tb)</th>
              <th className="px-4 py-4 text-center">Peso (Un/Tot)</th>
              <th className="px-4 py-4 text-center">Brix (R/M)</th>
              <th className="px-4 py-4">Motivo / Obs</th>
              <th className="px-4 py-4">Produto</th>
              <th className="px-4 py-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {rows.map((row, idx) => (
              <tr key={idx} className="hover:bg-red-50/20">
                <td className="p-3 space-y-1 w-48">
                  <input placeholder="Lote" value={row.lote} onChange={e => updateRow(idx, 'lote', e.target.value)} className="w-full p-1.5 border rounded font-bold" />
                  <div className="flex gap-1">
                    <input placeholder="Env" value={row.envase} onChange={e => updateRow(idx, 'envase', e.target.value)} className="w-1/3 p-1.5 border rounded text-center" />
                    <input placeholder="Tan" value={row.nTanque} onChange={e => updateRow(idx, 'nTanque', e.target.value)} className="w-2/3 p-1.5 border rounded text-center" />
                  </div>
                </td>
                <td className="p-3 w-20">
                  <input type="number" value={row.quantidade} onChange={e => updateRow(idx, 'quantidade', e.target.value)} className="w-full p-1.5 border rounded text-center font-black text-red-600" />
                  <input placeholder="Seq" value={row.sequencia} onChange={e => updateRow(idx, 'sequencia', e.target.value)} className="w-full p-1 border rounded text-center mt-1 text-[9px]" />
                </td>
                <td className="p-3 w-28">
                  <input value={row.pesoUnitario} onChange={e => updateRow(idx, 'pesoUnitario', e.target.value)} className="w-full p-1.5 border rounded text-center bg-gray-50 dark:bg-gray-900/50" />
                  <input value={row.pesoTotal} readOnly className="w-full p-1.5 border rounded text-center font-bold bg-white dark:bg-gray-800 mt-1" />
                </td>
                <td className="p-3 w-24">
                  <input value={row.brixReal} onChange={e => updateRow(idx, 'brixReal', e.target.value)} className="w-full p-1.5 border rounded text-center" />
                  <input value={row.brixMedio} onChange={e => updateRow(idx, 'brixMedio', e.target.value)} className="w-full p-1.5 border rounded text-center bg-gray-50 dark:bg-gray-900/50 mt-1" />
                </td>
                <td className="p-3 space-y-1 min-w-[200px]">
                  <input value={row.motivo} onChange={e => updateRow(idx, 'motivo', e.target.value)} className="w-full p-1.5 border rounded" />
                  <input value={row.observacoes} onChange={e => updateRow(idx, 'observacoes', e.target.value)} className="w-full p-1.5 border rounded italic text-gray-400" />
                </td>
                <td className="p-3">
                  <input value={row.descricaoProduto} onChange={e => updateRow(idx, 'descricaoProduto', e.target.value)} className="w-full p-1.5 border rounded" />
                </td>
                <td className="p-3 text-center">
                  <button type="button" onClick={() => setRows(rows.filter((_, i) => i !== idx))} className="text-red-400 hover:text-red-600 p-2"><i className="fas fa-trash"></i></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {rows.map((row, idx) => (
          <div key={idx} className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-3xl p-4 shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
              <span className="text-[10px] font-black text-red-700 uppercase tracking-widest">Registro #{idx + 1}</span>
              <button type="button" onClick={() => setRows(rows.filter((_, i) => i !== idx))} className="text-red-400 p-1">
                <i className="fas fa-trash text-xs"></i>
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[8px] font-black text-gray-400 uppercase">Lote</label>
                <input value={row.lote} onChange={e => updateRow(idx, 'lote', e.target.value)} className="w-full p-2 border rounded-lg text-[10px] font-bold" placeholder="Lote" />
              </div>
              <div className="space-y-1">
                <label className="text-[8px] font-black text-gray-400 uppercase">Envase / Tanque</label>
                <div className="flex gap-1">
                  <input value={row.envase} onChange={e => updateRow(idx, 'envase', e.target.value)} className="flex-1 min-w-0 p-2 border rounded-lg text-[10px] text-center" placeholder="Env" />
                  <input value={row.nTanque} onChange={e => updateRow(idx, 'nTanque', e.target.value)} className="flex-1 min-w-0 p-2 border rounded-lg text-[10px] text-center" placeholder="Tan" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[8px] font-black text-gray-400 uppercase">Qtde (Tb) / Seq</label>
                <div className="flex gap-1">
                  <input type="number" value={row.quantidade} onChange={e => updateRow(idx, 'quantidade', e.target.value)} className="flex-1 min-w-0 p-2 border rounded-lg text-[10px] text-center font-black text-red-600" placeholder="Qtde" />
                  <input value={row.sequencia} onChange={e => updateRow(idx, 'sequencia', e.target.value)} className="flex-1 min-w-0 p-2 border rounded-lg text-[10px] text-center" placeholder="Seq" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[8px] font-black text-gray-400 uppercase">Peso (Un / Tot)</label>
                <div className="flex gap-1">
                  <input value={row.pesoUnitario} onChange={e => updateRow(idx, 'pesoUnitario', e.target.value)} className="flex-1 min-w-0 p-2 border rounded-lg text-[10px] text-center" placeholder="Un" />
                  <input value={row.pesoTotal} readOnly className="flex-1 min-w-0 p-2 border rounded-lg text-[10px] text-center font-bold bg-gray-50 dark:bg-gray-900/50" placeholder="Tot" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[8px] font-black text-gray-400 uppercase">Brix (Real / Médio)</label>
                <div className="flex gap-1">
                  <input value={row.brixReal} onChange={e => updateRow(idx, 'brixReal', e.target.value)} className="flex-1 min-w-0 p-2 border rounded-lg text-[10px] text-center" placeholder="Real" />
                  <input value={row.brixMedio} onChange={e => updateRow(idx, 'brixMedio', e.target.value)} className="flex-1 min-w-0 p-2 border rounded-lg text-[10px] text-center bg-gray-50 dark:bg-gray-900/50" placeholder="Médio" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[8px] font-black text-gray-400 uppercase">Produto</label>
                <input value={row.descricaoProduto} onChange={e => updateRow(idx, 'descricaoProduto', e.target.value)} className="w-full p-2 border rounded-lg text-[10px]" placeholder="Produto" />
              </div>
              <div className="col-span-2 space-y-1">
                <label className="text-[8px] font-black text-gray-400 uppercase">Motivo / Obs</label>
                <input value={row.motivo} onChange={e => updateRow(idx, 'motivo', e.target.value)} className="w-full p-2 border rounded-lg text-[10px]" placeholder="Motivo" />
                <input value={row.observacoes} onChange={e => updateRow(idx, 'observacoes', e.target.value)} className="w-full p-2 border rounded-lg text-[10px] italic" placeholder="Observações" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="pt-6 border-t flex justify-end">
        <button disabled={isSubmitting} className="px-14 py-4 bg-red-600 hover:bg-red-700 text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl shadow-xl transition-all flex items-center gap-2">
          {isSubmitting ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-save"></i>}
          <span>{initialData ? 'Sincronizar Edição' : 'Salvar Monitoramento'}</span>
        </button>
      </div>
    </form>
  );
};

export default ReprocessMonitoringForm;
