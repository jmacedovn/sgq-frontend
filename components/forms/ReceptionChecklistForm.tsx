
import React, { useState } from 'react';

type ChecklistOption = 'BOM' | 'RUIM' | 'N.A.';
type YesNoOption = 'SIM' | 'NÃO' | 'N.A.';

const ReceptionChecklistForm: React.FC<{ onSave: (data: any) => void, isSubmitting: boolean, initialData?: any }> = ({ onSave, isSubmitting, initialData }) => {
  const [data, setData] = useState(initialData || {
    header: {
      data: new Date().toISOString().split('T')[0],
      descricaoMaterial: '', fornecedor: '', nf: '', codFornecedor: '', placaVeiculo: '', placaCarreta: ''
    },
    lots: [
      { quantidade: '', lote: '' }, { quantidade: '', lote: '' }, { quantidade: '', lote: '' }
    ],
    veiculo: {
      carroceria: 'BOM' as ChecklistOption, lona: 'BOM' as ChecklistOption, corda: 'BOM' as ChecklistOption,
      assoalho: 'BOM' as ChecklistOption, bau: 'BOM' as ChecklistOption, higienizacao: 'BOM' as ChecklistOption,
      odor: 'BOM' as ChecklistOption, transporteOutros: 'NÃO' as YesNoOption, pragas: 'NÃO' as YesNoOption,
      outros: '', aprovado: 'SIM' as YesNoOption
    },
    legais: {
      descProduto: 'SIM' as YesNoOption, descFornecedor: 'SIM' as YesNoOption, dizeresIdioma: 'SIM' as YesNoOption,
      dataFabricacao: '', prazoValidade: ''
    },
    qualidade: {
      etiquetaIdentificacao: 'SIM' as YesNoOption, certificadoQualidade: 'SIM' as YesNoOption, 
      embalagemLacrada: 'SIM' as YesNoOption, numeroLacre: ''
    },
    shelfLife: {
      prazoMaior6m: 'SIM' as YesNoOption, prazoMenor6m: 'SIM' as YesNoOption
    },
    footer: {
      obs: '', responsavel: ''
    }
  });

  const updateHeader = (field: keyof typeof data.header, value: string) => {
    setData({ ...data, header: { ...data.header, [field]: value } });
  };

  const updateLot = (idx: number, field: 'quantidade' | 'lote', value: string) => {
    const newLots = [...data.lots];
    newLots[idx][field] = value;
    setData({ ...data, lots: newLots });
  };

  const updateSection = (section: 'veiculo' | 'legais' | 'qualidade' | 'shelfLife', field: string, value: any) => {
    setData({ ...data, [section]: { ...data[section], [field]: value } });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(data);
  };

  const RadioGroup = ({ label, value, section, field, options }: { label: string, value: string, section: any, field: string, options: string[] }) => (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
      <span className="text-xs font-medium text-gray-700 dark:text-gray-200">{label}</span>
      <div className="flex gap-2 mt-2 sm:mt-0">
        {options.map(opt => (
          <button
            key={opt}
            type="button"
            onClick={() => updateSection(section, field, opt)}
            className={`px-3 py-1.5 rounded-xl text-[9px] font-black border transition-all ${
              value === opt ? 'bg-zinc-700 border-zinc-800 text-white shadow-md' : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 text-gray-400'
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-8 animate-fadeIn">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 bg-gray-50 dark:bg-gray-900/50 p-8 rounded-3xl border border-gray-100 dark:border-gray-700">
        <div className="space-y-1">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Data</label>
          <input type="date" value={data.header.data} onChange={e => updateHeader('data', e.target.value)} className="w-full p-2.5 border rounded-xl" />
        </div>
        <div className="lg:col-span-2 space-y-1">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Material</label>
          <input value={data.header.descricaoMaterial} onChange={e => updateHeader('descricaoMaterial', e.target.value)} className="w-full p-2.5 border rounded-xl font-bold" />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Fornecedor</label>
          <input value={data.header.fornecedor} onChange={e => updateHeader('fornecedor', e.target.value)} className="w-full p-2.5 border rounded-xl" />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">N.F.</label>
          <input value={data.header.nf} onChange={e => updateHeader('nf', e.target.value)} className="w-full p-2.5 border rounded-xl" />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Placa</label>
          <input value={data.header.placaVeiculo} onChange={e => updateHeader('placaVeiculo', e.target.value)} className="w-full p-2.5 border rounded-xl" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden p-6 space-y-2">
          <h4 className="font-black text-[10px] text-zinc-400 uppercase mb-4 tracking-widest">1 - Veículo</h4>
          <RadioGroup label="Carroceria" value={data.veiculo.carroceria} section="veiculo" field="carroceria" options={['BOM', 'RUIM', 'N.A.']} />
          <RadioGroup label="Higienização" value={data.veiculo.higienizacao} section="veiculo" field="higienizacao" options={['BOM', 'RUIM']} />
          <RadioGroup label="Presença de Pragas" value={data.veiculo.pragas} section="veiculo" field="pragas" options={['SIM', 'NÃO']} />
          <div className="pt-4">
             <label className="text-[10px] font-black text-zinc-400 uppercase">Status Final</label>
             <div className="flex gap-4 mt-2">
                {['SIM', 'NÃO'].map(s => (
                  <button key={s} type="button" onClick={() => updateSection('veiculo', 'aprovado', s)} className={`flex-1 py-3 rounded-xl font-black text-[10px] border ${data.veiculo.aprovado === s ? 'bg-zinc-800 text-white' : 'bg-gray-50 dark:bg-gray-900/50 text-gray-300'}`}>{s === 'SIM' ? 'VEÍCULO APROVADO' : 'VEÍCULO REPROVADO'}</button>
                ))}
             </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden p-6 space-y-2">
          <h4 className="font-black text-[10px] text-zinc-400 uppercase mb-4 tracking-widest">2 - Legais & Qualidade</h4>
          <RadioGroup label="Dizeres em Idioma (PT-BR)" value={data.legais.dizeresIdioma} section="legais" field="dizeresIdioma" options={['SIM', 'NÃO', 'N.A.']} />
          <RadioGroup label="Certificado Qualidade" value={data.qualidade.certificadoQualidade} section="qualidade" field="certificadoQualidade" options={['SIM', 'NÃO']} />
          <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t">
             <div className="space-y-1">
                <label className="text-[10px] font-black text-zinc-400">Data Fabricação</label>
                <input type="date" value={data.legais.dataFabricacao} onChange={e => updateSection('legais', 'dataFabricacao', e.target.value)} className="w-full p-2 border rounded-xl text-xs" />
             </div>
             <div className="space-y-1">
                <label className="text-[10px] font-black text-zinc-400">Número Lacre</label>
                <input value={data.qualidade.numeroLacre} onChange={e => updateSection('qualidade', 'numeroLacre', e.target.value)} className="w-full p-2 border rounded-xl text-xs" />
             </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 dark:bg-gray-900/50 p-8 rounded-3xl space-y-6">
        <textarea value={data.footer.obs} onChange={e => setData({...data, footer: {...data.footer, obs: e.target.value}})} className="w-full p-4 border rounded-2xl h-24 text-sm" placeholder="Observações..." />
        <input value={data.footer.responsavel} onChange={e => setData({...data, footer: {...data.footer, responsavel: e.target.value}})} className="w-full p-3 border rounded-xl font-bold" placeholder="Responsável pela Inspeção" />
      </div>

      <div className="pt-6 border-t flex justify-end">
        <button disabled={isSubmitting} className="px-12 py-4 bg-zinc-800 hover:bg-black text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl shadow-xl transition-all flex items-center gap-2">
          {isSubmitting ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-save"></i>}
          <span>{initialData ? 'Sincronizar Edição' : 'Salvar Checklist'}</span>
        </button>
      </div>
    </form>
  );
};

export default ReceptionChecklistForm;
