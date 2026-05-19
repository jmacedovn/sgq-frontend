
import React, { useState, useRef, useEffect } from 'react';
import SignaturePad from 'signature_pad';
import { useFruits } from '../../lib/useFruits';
import { useCheckin } from '../../lib/useCheckin';
import { toast } from 'sonner';

interface IntakeSample {
  horario: string;
  amostra: string;
  brix: string;
  media: string;
}

interface ChargeBlock {
  cargaNo: string;
  placa: string;
  nGuia: string;
  visto: string;
  samples: IntakeSample[];
}

interface FruitIntakeFormProps {
  onSave: (data: any) => void;
  isSubmitting: boolean;
  initialData?: any;
}

const FruitIntakeForm: React.FC<FruitIntakeFormProps> = ({ onSave, isSubmitting, initialData }) => {
  const { fruits } = useFruits();
  const { getCheckinByOrder, getCheckinByPlate, loading: checkinLoading } = useCheckin();
  const [orderSearch, setOrderSearch] = useState('');

  const [header, setHeader] = useState(initialData?.header || {
    data: new Date().toISOString().split('T')[0],
    fruta: '',
    produto: 'CONVENCIONAL',
    linha: '1'
  });

  const emptySamples = (): IntakeSample[] => [
    { horario: '', amostra: '1', brix: '', media: '' },
    { horario: '', amostra: '2', brix: '', media: '' },
    { horario: '', amostra: '3', brix: '', media: '' },
  ];

  const [charges, setCharges] = useState<ChargeBlock[]>(initialData?.charges || [
    { cargaNo: '', placa: '', nGuia: '', visto: '', samples: emptySamples() }
  ]);

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const signaturePadRef = useRef<SignaturePad | null>(null);
  const [signatureData, setSignatureData] = useState<string>(initialData?.signature || '');

  useEffect(() => {
    if (canvasRef.current) {
        const pad = new SignaturePad(canvasRef.current, {
            backgroundColor: 'rgba(255, 255, 255, 0)',
            penColor: 'rgb(31, 41, 55)',
        });
        signaturePadRef.current = pad;

        const resizeCanvas = () => {
            const canvas = canvasRef.current;
            if (canvas) {
                const ratio = Math.max(window.devicePixelRatio || 1, 1);
                canvas.width = canvas.offsetWidth * ratio;
                canvas.height = canvas.offsetHeight * ratio;
                const ctx = canvas.getContext("2d");
                if (ctx) ctx.scale(ratio, ratio);
                pad.clear();
            }
        };

        window.addEventListener("resize", resizeCanvas);
        resizeCanvas();

        return () => {
            window.removeEventListener("resize", resizeCanvas);
            pad.off();
        };
    }
  }, [signatureData]);

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!header.fruta) errors.fruta = "Selecione a fruta";
    if (!header.data) errors.data = "Data é obrigatória";
    
    // Validar se pelo menos uma carga tem número e placa
    const validCharge = charges.some(c => c.cargaNo && c.placa);
    if (!validCharge) errors.charges = "Preencha pelo menos uma carga (Nº e Placa)";

    // Validar assinatura
    if (!signatureData && (!signaturePadRef.current || signaturePadRef.current.isEmpty())) {
        errors.signature = "A assinatura do responsável é obrigatória";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const updateHeader = (field: string, value: string) => {
    setHeader({ ...header, [field]: value });
    if (formErrors[field]) {
      const newErrors = { ...formErrors };
      delete newErrors[field];
      setFormErrors(newErrors);
    }
  };

  const updateCharge = (idx: number, field: keyof ChargeBlock, value: any) => {
    const newCharges = [...charges];
    (newCharges[idx] as any)[field] = value;
    setCharges(newCharges);
    if (formErrors.charges) {
        const newErrors = { ...formErrors };
        delete newErrors.charges;
        setFormErrors(newErrors);
    }
  };

  const updateSample = (chargeIdx: number, sampleIdx: number, field: keyof IntakeSample, value: string) => {
    const newCharges = [...charges];
    (newCharges[chargeIdx].samples[sampleIdx] as any)[field] = value;
    
    if (field === 'brix') {
        const brixValues = newCharges[chargeIdx].samples
            .map(s => parseFloat(s.brix.replace(',', '.')))
            .filter(val => !isNaN(val));
        
        if (brixValues.length > 0) {
            const avg = brixValues.reduce((a, b) => a + b, 0) / brixValues.length;
            newCharges[chargeIdx].samples[2].media = avg.toFixed(2);
        } else {
            newCharges[chargeIdx].samples[2].media = '';
        }
    }
    setCharges(newCharges);
  };

  const clearSignature = () => {
    setSignatureData('');
    if (signaturePadRef.current) {
        signaturePadRef.current.clear();
    }
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
      const { registro, analise } = data;
      
      // Atualizar Header
      setHeader(prev => ({
        ...prev,
        fruta: registro.tipo_fruta || prev.fruta,
        data: registro.horario_entrada ? new Date(registro.horario_entrada).toISOString().split('T')[0] : prev.data
      }));

      // Atualizar Carga
      const newCharges = [...charges];
      newCharges[0] = {
        ...newCharges[0],
        cargaNo: registro.numero_ordem?.toString() || '',
        placa: registro.placa_veiculo || '',
        nGuia: registro.brix || '' // Brix informado no patio
      };

      // Se tiver análise de qualidade detalhada, preenche o primeiro brix
      if (analise && analise.media_brix) {
        newCharges[0].samples[0].brix = analise.media_brix.toString();
        // Trigger calculation
        const brixVal = parseFloat(analise.media_brix.toString());
        newCharges[0].samples[2].media = brixVal.toFixed(2);
      }

      setCharges(newCharges);
      toast.success('Dados importados do Check-in com sucesso!');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
        const firstError = Object.values(formErrors)[0] || "Verifique os campos obrigatórios";
        toast.error(firstError);
        return;
    }

    let currentSig = signatureData;
    if (!currentSig && signaturePadRef.current && !signaturePadRef.current.isEmpty()) {
        currentSig = signaturePadRef.current.toDataURL();
    }
    onSave({ header, charges, signature: currentSig });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* SEÇÃO DE IMPORTAÇÃO CHECK-IN */}
      <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 p-4 rounded-2xl flex flex-col md:flex-row items-center gap-4">
        <div className="flex-1">
          <h4 className="text-indigo-900 dark:text-indigo-300 text-[10px] font-black uppercase tracking-widest mb-1">Importação Rápida (Check-in)</h4>
          <p className="text-indigo-600/70 dark:text-indigo-400 text-[9px]">Busque por Placa ou Número de Ordem para preencher o formulário automaticamente</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <input 
            type="text" 
            placeholder="Placa ou Nº Ordem" 
            value={orderSearch}
            onChange={(e) => setOrderSearch(e.target.value.toUpperCase())}
            className="flex-1 md:w-48 p-2 text-xs border border-indigo-200 rounded-xl outline-none focus:ring-2 ring-indigo-400 font-bold"
          />
          <button 
            type="button"
            onClick={handleImportCheckin}
            disabled={checkinLoading}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-black uppercase rounded-xl shadow-md transition-all flex items-center gap-2 whitespace-nowrap disabled:opacity-50"
          >
            {checkinLoading ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-file-import"></i>}
            Importar
          </button>
        </div>
      </div>

      {Object.keys(formErrors).length > 0 && (
          <div className="bg-red-50 border border-red-200 p-4 rounded-2xl animate-fadeIn">
              <p className="text-red-600 text-xs font-black uppercase tracking-widest flex items-center gap-2">
                  <i className="fas fa-exclamation-triangle"></i> Atenção: Existem pendências no formulário
              </p>
          </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-gray-50 dark:bg-gray-900/50 p-6 rounded-2xl border border-gray-100 dark:border-gray-700">
        <div className="space-y-1">
          <label className={`text-xs font-bold uppercase ${formErrors.data ? 'text-red-500' : 'text-gray-500'}`}>Data *</label>
          <input 
            type="date" 
            value={header.data} 
            onChange={(e) => updateHeader('data', e.target.value)} 
            className={`w-full p-2 border rounded-lg outline-none transition-all ${formErrors.data ? 'border-red-500 ring-1 ring-red-200' : 'border-gray-200 dark:border-gray-600'}`} 
          />
        </div>
        <div className="space-y-1">
          <label className={`text-xs font-bold uppercase ${formErrors.fruta ? 'text-red-500' : 'text-gray-500'}`}>Fruta *</label>
          <select 
            value={header.fruta} 
            onChange={(e) => updateHeader('fruta', e.target.value)} 
            className={`w-full p-2 border rounded-lg outline-none transition-all ${formErrors.fruta ? 'border-red-500 ring-1 ring-red-200' : 'border-gray-200 dark:border-gray-600'}`}
          >
            <option value="">Selecione...</option>
            {fruits.map(f => <option key={f.id} value={f.name}>{f.name}</option>)}
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-bold text-gray-500 uppercase">Linha</label>
          <div className="flex gap-2">
            {['1', '2'].map(l => (
                <button key={l} type="button" onClick={() => updateHeader('linha', l)} className={`flex-1 py-2 border rounded-lg font-bold ${header.linha === l ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 text-gray-400'}`}>{l}</button>
            ))}
          </div>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-bold text-gray-500 uppercase">Produto</label>
          <div className="flex gap-2">
            {['CONVENCIONAL', 'ORGÂNICO'].map(p => (
                <button key={p} type="button" onClick={() => updateHeader('produto', p)} className={`flex-1 py-2 px-1 text-[10px] border rounded-lg font-bold transition-all ${header.produto === p ? 'bg-green-600 text-white' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 text-gray-400'}`}>{p}</button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {charges.map((charge, cIdx) => (
          <div key={cIdx} className={`p-6 border rounded-2xl bg-white dark:bg-gray-800 shadow-sm space-y-4 transition-all ${formErrors.charges ? 'border-red-200 bg-red-50/10' : 'border-gray-100 dark:border-gray-700'}`}>
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-3">
                <span className="bg-gray-800 text-white text-[10px] font-bold px-2 py-1 rounded">CARGA Nº</span>
                <input value={charge.cargaNo} onChange={(e) => updateCharge(cIdx, 'cargaNo', e.target.value)} className="w-20 border-b border-gray-300 dark:border-gray-600 focus:border-blue-500 outline-none text-center font-bold" placeholder="000" />
              </div>
              <div className="flex gap-2">
                <input placeholder="PLACA" value={charge.placa} onChange={(e) => updateCharge(cIdx, 'placa', e.target.value)} className="w-20 p-1 border rounded text-xs text-center border-gray-200 dark:border-gray-600" />
                <input placeholder="GUIA" value={charge.nGuia} onChange={(e) => updateCharge(cIdx, 'nGuia', e.target.value)} className="w-20 p-1 border rounded text-xs text-center border-gray-200 dark:border-gray-600" />
              </div>
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-gray-400 font-bold border-b">
                    <th className="py-2 text-left">HORÁRIO</th>
                    <th className="py-2 text-center">AMOSTRA</th>
                    <th className="py-2 text-center">ºBRIX</th>
                    <th className="py-2 text-center">MÉDIA</th>
                  </tr>
                </thead>
                <tbody>
                  {charge.samples.map((s, sIdx) => (
                    <tr key={sIdx} className="border-b last:border-0">
                      <td className="py-2"><input type="time" value={s.horario} onChange={(e) => updateSample(cIdx, sIdx, 'horario', e.target.value)} className="w-full border border-gray-100 dark:border-gray-700 rounded p-1" /></td>
                      <td className="py-2 text-center font-bold text-gray-400">{s.amostra}</td>
                      <td className="py-2 px-2"><input type="text" value={s.brix} onChange={(e) => updateSample(cIdx, sIdx, 'brix', e.target.value)} className="w-full border border-gray-100 dark:border-gray-700 rounded p-1 text-center" /></td>
                      <td className="py-2 text-center font-bold text-blue-600">{sIdx === 2 ? s.media : ''}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-3">
              {charge.samples.map((s, sIdx) => (
                <div key={sIdx} className="bg-gray-50/50 p-3 rounded-xl border border-gray-100 dark:border-gray-700 relative">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Amostra {s.amostra}</span>
                    {sIdx === 2 && s.media && (
                      <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">Média: {s.media}</span>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[8px] font-bold text-gray-400 uppercase">Horário</label>
                      <input type="time" value={s.horario} onChange={(e) => updateSample(cIdx, sIdx, 'horario', e.target.value)} className="w-full border border-gray-200 dark:border-gray-600 rounded-lg p-1.5 text-xs" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[8px] font-bold text-gray-400 uppercase">ºBrix</label>
                      <input type="text" value={s.brix} onChange={(e) => updateSample(cIdx, sIdx, 'brix', e.target.value)} className="w-full border border-gray-200 dark:border-gray-600 rounded-lg p-1.5 text-xs text-center font-bold" placeholder="0.0" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className={`bg-gray-50 dark:bg-gray-900/50 p-6 rounded-2xl border mt-6 transition-all ${formErrors.signature ? 'border-red-300 bg-red-50' : 'border-gray-100 dark:border-gray-700'}`}>
         <div className="flex justify-between items-end mb-2">
            <label className={`text-xs font-bold uppercase flex items-center gap-2 ${formErrors.signature ? 'text-red-600' : 'text-gray-500'}`}>
               <i className="fas fa-signature"></i> Assinatura Digital do Responsável *
            </label>
            <button 
              type="button" 
              onClick={clearSignature} 
              className="text-[10px] text-red-500 hover:text-red-700 font-black uppercase tracking-widest bg-white dark:bg-gray-800 px-3 py-1 rounded shadow-sm border border-gray-100 dark:border-gray-700"
            >
              Limpar
            </button>
         </div>
         
         <div className={`w-full h-40 bg-white dark:bg-gray-800 border-2 border-dashed rounded-xl overflow-hidden relative group transition-colors ${formErrors.signature ? 'border-red-400' : 'border-gray-300 dark:border-gray-600 hover:border-indigo-400'}`}>
            {signatureData ? (
                <div className="w-full h-full flex flex-col items-center justify-center relative bg-white dark:bg-gray-800">
                   <img src={signatureData} alt="Assinatura Salva" className="h-full object-contain" />
                </div>
            ) : (
                <canvas 
                   ref={canvasRef}
                   className="w-full h-full cursor-crosshair touch-none"
                />
            )}
            
            {!signatureData && (
                <div className="absolute bottom-2 right-4 text-[9px] text-gray-300 pointer-events-none select-none uppercase tracking-[0.2em]">
                   Assine na área acima
                </div>
            )}
         </div>
         {formErrors.signature && <p className="text-red-500 text-[10px] font-bold mt-2 uppercase tracking-wide">{formErrors.signature}</p>}
      </div>

      <div className="pt-6 border-t flex justify-end">
        <button 
            type="submit"
            disabled={isSubmitting} 
            className="px-10 py-3.5 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-lg transition-all flex items-center gap-2 disabled:opacity-50"
        >
          {isSubmitting ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-save"></i>}
          <span>{initialData ? 'Sincronizar Alterações' : 'Salvar Relatório'}</span>
        </button>
      </div>
    </form>
  );
};

export default FruitIntakeForm;
