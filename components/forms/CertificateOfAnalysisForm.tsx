import React, { useState, useEffect, useRef } from 'react';
import SignaturePad from 'signature_pad';
import { supabase } from '../../lib/supabase';
import { api } from '../../lib/api';
import { FormType } from '../../types';
import { toast } from 'sonner';

interface ExtraResult {
  id: string;
  parameter: string;
  value: string;
}

interface COAData {
  lote: string;
  lotes?: string[];
  cliente: string;
  produto: string;
  variedade: string;
  tipoTambor: string;
  pesoTambor: string;
  dataProducao: string;
  dataValidade: string;
  tambores: string;
  brix: string;
  acidez: string;
  ratio: string;
  ph: string;
  densidade: string;
  bostwick: string;
  polpa: string;
  fungos: string;
  contagemTotal: string;
  boloresLeveduras: string;
  coliformes: string;
  tab: string;
  cor: string;
  sabor: string;
  pontosPretos: string;
  pontosMarrons: string;
  observacoes: string;
  analista: string;
  lider: string;
  extraResults: ExtraResult[];
  sampleCount?: number;
  samples?: Record<string, string[]>;
  sampleTimes?: string[];
  drumNumbers?: string[];
}

const CertificateOfAnalysisForm: React.FC<{ onSave: (data: any) => void, isSubmitting: boolean, initialData?: any }> = ({ onSave, isSubmitting, initialData }) => {
  const [formData, setFormData] = useState<COAData>(initialData?.data || {
    lote: '',
    cliente: '',
    produto: '',
    variedade: '-',
    tipoTambor: 'CONICAL',
    pesoTambor: '230',
    dataProducao: new Date().toISOString().split('T')[0],
    dataValidade: '',
    tambores: '',
    brix: '',
    acidez: '',
    ratio: '',
    ph: '',
    densidade: '',
    bostwick: '',
    polpa: '',
    fungos: '',
    contagemTotal: '<10',
    boloresLeveduras: '<10',
    coliformes: 'ABSENT',
    tab: 'NEGATIVE',
    cor: 'CHARACTERISTIC',
    sabor: 'CHARACTERISTIC',
    pontosPretos: '',
    pontosMarrons: '',
    observacoes: '',
    analista: '',
    lider: '',
    extraResults: [],
    sampleCount: 1,
    samples: {},
    sampleTimes: [''],
    drumNumbers: ['']
  });

  const [availableBatches, setAvailableBatches] = useState<string[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);
  
  const analistaCanvasRef = useRef<HTMLCanvasElement>(null);
  const liderCanvasRef = useRef<HTMLCanvasElement>(null);
  const analistaPadRef = useRef<SignaturePad | null>(null);
  const liderPadRef = useRef<SignaturePad | null>(null);

  useEffect(() => {
    const initPad = (canvasRef: React.RefObject<HTMLCanvasElement>, padRef: React.MutableRefObject<SignaturePad | null>) => {
      if (canvasRef.current) {
        const pad = new SignaturePad(canvasRef.current, {
          backgroundColor: 'rgba(255, 255, 255, 0)',
          penColor: 'rgb(13, 148, 136)',
        });
        padRef.current = pad;
        const resize = () => {
          const canvas = canvasRef.current;
          if (canvas) {
            const ratio = Math.max(window.devicePixelRatio || 1, 1);
            canvas.width = canvas.offsetWidth * ratio;
            canvas.height = canvas.offsetHeight * ratio;
            canvas.getContext("2d")?.scale(ratio, ratio);
            pad.clear();
          }
        };
        window.addEventListener("resize", resize);
        resize();
        return () => window.removeEventListener("resize", resize);
      }
    };

    const cleanupAnalista = initPad(analistaCanvasRef, analistaPadRef);
    const cleanupLider = initPad(liderCanvasRef, liderPadRef);

    return () => {
      if (cleanupAnalista) cleanupAnalista();
      if (cleanupLider) cleanupLider();
    };
  }, []);

  useEffect(() => {
    const fetchBatches = async () => {
      try {
        const data = await api.getRecords('records', { 
          form_type: FormType.PHYSICAL_CHEMICAL_ANALYSIS,
          order: 'timestamp',
          orderDirection: 'desc',
          limit: 100
        });
        
        if (data) {
          const codes = data
            .map((record: any) => {
              const d = record.data || record;
              return d?.header?.lote;
            })
            .filter((code: any): code is string => typeof code === 'string' && code.length > 0);
          setAvailableBatches([...new Set(codes)] as string[]);
        }
      } catch (err) {
        console.error('Erro ao buscar lotes:', err);
      }
    };
    fetchBatches();
  }, []);

  const handleSampleBatchChange = async (index: number, lote: string) => {
    const newLotes = [...(formData.lotes || [])];
    while (newLotes.length < (formData.sampleCount || 1)) newLotes.push('');
    newLotes[index] = lote;

    const updates: Partial<COAData> = {
      lotes: newLotes,
      samples: { ...(formData.samples || {}) }
    };

    // Auto-update the main lote field if it's empty or matches the previous auto-generated string
    const prevAutoLote = (formData.lotes || []).filter(Boolean).join(', ');
    if (!formData.lote || formData.lote === prevAutoLote) {
      updates.lote = newLotes.filter(Boolean).join(', ');
    }

    if (!lote) {
      setFormData(prev => ({ ...prev, ...updates }));
      return;
    }

    setIsLoadingData(true);
    try {
      // Fetch Physicochemical Data
      const physData = await api.getRecords('records', {
        form_type: FormType.PHYSICAL_CHEMICAL_ANALYSIS,
        order: 'timestamp',
        orderDirection: 'desc'
      });
      
      const batchPhysRecord = physData?.find(r => (r.data?.header?.lote || r.header?.lote) === lote);
      
      // Fetch Microbiological Data
      const microData = await api.getRecords('records', {
        form_type: FormType.MICROBIOLOGICAL_ANALYSIS,
        order: 'timestamp',
        orderDirection: 'desc'
      });
      
      const batchMicroRecord = microData?.find(r => (r.data?.header?.lote || r.header?.lote) === lote);

      if (batchPhysRecord) {
        const physData = batchPhysRecord.data || batchPhysRecord;
        const physRows = physData?.rows || [];
        
        if (index === 0) {
          updates.produto = physData?.header?.produto || formData.produto;
          updates.variedade = physData?.header?.fruta || formData.variedade;
          updates.dataProducao = physData?.header?.data || formData.dataProducao;
          updates.pesoTambor = physData?.header?.pesoEmbalagem || formData.pesoTambor;
          
          // Calcular validade (2 anos após produção por padrão)
          if (updates.dataProducao) {
            const prodDate = new Date(updates.dataProducao);
            prodDate.setFullYear(prodDate.getFullYear() + 2);
            updates.dataValidade = prodDate.toISOString().split('T')[0];
          }
          updates.tambores = physData?.header?.qtdTambores || formData.tambores;
        }

        const getPhysVal = (paramName: string) => {
          const row = physRows.find((r: any) => r.parameter === paramName);
          return row?.values?.[0] || '';
        };
        
        const setSampleVal = (key: string, val: string) => {
          if (!updates.samples![key]) {
            updates.samples![key] = Array(formData.sampleCount || 1).fill('');
          } else if (!Array.isArray(updates.samples![key]) || updates.samples![key].length <= index) {
            const newArr = [...(updates.samples![key] || [])];
            while(newArr.length <= index) newArr.push('');
            updates.samples![key] = newArr;
          } else {
            updates.samples![key] = [...updates.samples![key]];
          }
          updates.samples![key][index] = val;
        };

        setSampleVal('brix', getPhysVal('°Brix Corrigido'));
        setSampleVal('acidez', getPhysVal('Acidez (%)'));
        setSampleVal('ratio', getPhysVal('Ratio (Brix Corr./ Acidez)'));
        setSampleVal('ph', getPhysVal('pH'));
        setSampleVal('densidade', getPhysVal('Densidade (g/cm³)') || getPhysVal('Densidade'));
        setSampleVal('bostwick', getPhysVal('Bostwick (cm/30 seg)') || getPhysVal('Bostwick'));
        setSampleVal('polpa', getPhysVal('Teor de Polpa (%)') || getPhysVal('Teor de Polpa'));
        setSampleVal('fungos', getPhysVal('Fungos Método Howard (%)') || getPhysVal('Fungos'));
        setSampleVal('cor', 'CHARACTERISTIC');
        setSampleVal('sabor', getPhysVal('Sabor'));
        setSampleVal('pontosPretos', getPhysVal('Pontos Pretos'));
        setSampleVal('pontosMarrons', getPhysVal('Pontos Marrons'));
      }

      if (batchMicroRecord) {
        const microRows = batchMicroRecord.data?.rows || [];
        const getMicroVal = (paramName: string) => {
          const row = microRows.find((r: any) => r.parameter === paramName);
          return row?.sample1 || '';
        };

        const setSampleValMicro = (key: string, val: string) => {
          if (!updates.samples![key]) {
            updates.samples![key] = Array(formData.sampleCount || 1).fill('');
          } else if (!Array.isArray(updates.samples![key]) || updates.samples![key].length <= index) {
            const newArr = [...(updates.samples![key] || [])];
            while(newArr.length <= index) newArr.push('');
            updates.samples![key] = newArr;
          } else {
            updates.samples![key] = [...updates.samples![key]];
          }
          updates.samples![key][index] = val;
        };

        setSampleValMicro('contagemTotal', getMicroVal('Contagem Total (UFC/mL)'));
        setSampleValMicro('boloresLeveduras', getMicroVal('Bolores e Leveduras (UFC/mL)'));
        setSampleValMicro('coliformes', getMicroVal('Coliformes Totais'));
        setSampleValMicro('tab', getMicroVal('TAB'));
      }

      setFormData(prev => ({ ...prev, ...updates }));

    } catch (err) {
      console.error('Erro ao carregar dados do lote:', err);
      toast.error('Erro ao carregar os dados do lote selecionado.');
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleSampleCountChange = async (increment: number) => {
    let newCount = 1;
    let previousBatch = '';
    let shouldFetch = false;

    setFormData(prev => {
      newCount = Math.max(1, Math.min(10, (prev.sampleCount || 1) + increment));
      
      let newLoteString = prev.lote;
      let newLotes = [...(prev.lotes || [])];

      if (increment < 0 && prev.lotes) {
        const activeLotes = prev.lotes.slice(0, newCount);
        const prevAutoLote = prev.lotes.filter(Boolean).join(', ');
        if (!prev.lote || prev.lote === prevAutoLote) {
          newLoteString = activeLotes.filter(Boolean).join(', ');
        }
        newLotes = activeLotes;
      } else if (increment > 0) {
        // Automatically copy the batch from the previous sample if available
        previousBatch = newLotes[newCount - 2] || '';
        if (previousBatch) {
          shouldFetch = true;
        }
      }

      return { 
        ...prev, 
        sampleCount: newCount,
        lote: newLoteString,
        lotes: newLotes
      };
    });

    if (shouldFetch && previousBatch) {
      // Small delay to ensure state is updated before fetching
      setTimeout(() => {
        handleSampleBatchChange(newCount - 1, previousBatch);
      }, 50);
    }
  };

  const handleChange = (field: keyof COAData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addExtraResult = () => {
    setFormData(prev => ({
      ...prev,
      extraResults: [...(prev.extraResults || []), { id: crypto.randomUUID(), parameter: '', value: '' }]
    }));
  };

  const handleExtraResultChange = (id: string, field: 'parameter' | 'value', value: string) => {
    setFormData(prev => ({
      ...prev,
      extraResults: prev.extraResults?.map(r => r.id === id ? { ...r, [field]: value } : r) || []
    }));
  };

  const handleSampleChange = (field: string, index: number, value: string) => {
    setFormData(prev => {
      const newSamples = { ...(prev.samples || {}) };
      if (!newSamples[field]) newSamples[field] = Array(10).fill('');
      newSamples[field][index] = value;
      return { ...prev, samples: newSamples };
    });
  };

  const handleSampleTimeChange = (index: number, value: string) => {
    setFormData(prev => {
      const newTimes = [...(prev.sampleTimes || Array(10).fill(''))];
      newTimes[index] = value;
      return { ...prev, sampleTimes: newTimes };
    });
  };

  const handleDrumNumberChange = (index: number, value: string) => {
    setFormData(prev => {
      const newDrums = [...(prev.drumNumbers || Array(10).fill(''))];
      newDrums[index] = value;
      return { ...prev, drumNumbers: newDrums };
    });
  };

  const removeExtraResult = (id: string) => {
    setFormData(prev => ({
      ...prev,
      extraResults: prev.extraResults?.filter(r => r.id !== id) || []
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.lote) {
      toast.error("Por favor, selecione um lote.");
      return;
    }

    for (let i = 0; i < (formData.sampleCount || 1); i++) {
      const hasLoteForSample = formData.lotes?.[i] || (i === 0 && formData.lote);
      if (!hasLoteForSample) {
        toast.error(`Por favor, selecione um lote para a Amostra ${i + 1}.`);
        return;
      }
    }

    const analistaSignature = analistaPadRef.current?.isEmpty() ? null : analistaPadRef.current?.toDataURL();
    const liderSignature = liderPadRef.current?.isEmpty() ? null : liderPadRef.current?.toDataURL();

    onSave({
      data: formData,
      signatures: {
        analista: analistaSignature,
        lider: liderSignature
      }
    });
  };

  const renderRow = (key: keyof COAData, label: string, readOnly = false, defaultValue = '', inputType = 'text') => {
    const sampleCount = formData.sampleCount || 1;
    return (
      <tr className="hover:bg-amber-50/30 transition-colors">
        <td className="py-3 pr-4 font-bold text-gray-600 dark:text-gray-300 border-r">{label}</td>
        {Array.from({ length: sampleCount }).map((_, i) => (
          <td key={i} className="py-3 px-2 border-r">
            <input 
              type={inputType} 
              value={readOnly ? defaultValue : (formData.samples?.[key]?.[i] || (i === 0 ? (formData[key] as string) : '') || '')} 
              onChange={(e) => handleSampleChange(key, i, e.target.value)} 
              readOnly={readOnly}
              className={`w-full p-2 border border-gray-200 dark:border-gray-600 rounded-lg font-bold text-center outline-none ${readOnly ? 'bg-gray-50 dark:bg-gray-900/50 text-gray-500 cursor-not-allowed' : 'focus:border-amber-400'}`} 
            />
          </td>
        ))}
      </tr>
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-5xl mx-auto print-content">
      {/* Header Info */}
      <div className="bg-white dark:bg-gray-800 p-6 md:p-8 rounded-[2rem] shadow-xl border border-gray-100 dark:border-gray-700">
        <div className="flex flex-col md:flex-row items-center justify-between mb-8 pb-6 border-b border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-4 mb-4 md:mb-0">
            <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center shadow-inner">
              <i className="fas fa-certificate text-3xl text-amber-500"></i>
            </div>
            <div>
              <h2 className="text-2xl font-black text-[#1A2B34] tracking-tight">Certificado de Análises</h2>
              <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Certificate of Analysis</p>
            </div>
          </div>
          <div className="text-center md:text-right">
            <img src="./logo.png?v=1.2.1" alt="Via Néctare" className="h-12 w-auto mx-auto md:ml-auto" onError={(e) => { (e.target as HTMLImageElement).src = "https://via.placeholder.com/150x50?text=VIA+NECTARE"; }} />
            <p className="text-[10px] font-bold text-gray-400 mt-2">Via Néctare Tecnologia em Bebidas e Alimentos Ltda, Brasil</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Lote / Batch</label>
            <input 
              type="text" 
              value={formData.lote} 
              onChange={(e) => handleChange('lote', e.target.value)}
              className="w-full p-4 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-600 rounded-2xl text-sm font-bold text-gray-700 dark:text-gray-200 outline-none focus:border-amber-400 focus:ring-4 focus:ring-amber-400/10 transition-all"
            />
            {isLoadingData && <p className="text-xs text-amber-600 font-bold animate-pulse ml-1"><i className="fas fa-spinner fa-spin mr-1"></i> Carregando dados do lote...</p>}
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Cliente / Customer</label>
            <input 
              type="text" 
              value={formData.cliente} 
              onChange={(e) => handleChange('cliente', e.target.value)}
              className="w-full p-4 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-600 rounded-2xl text-sm font-bold text-gray-700 dark:text-gray-200 outline-none focus:border-amber-400 focus:ring-4 focus:ring-amber-400/10 transition-all"
              placeholder="Nome do Cliente"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Produto / Product</label>
            <input 
              type="text" 
              value={formData.produto} 
              onChange={(e) => handleChange('produto', e.target.value)}
              className="w-full p-4 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-600 rounded-2xl text-sm font-bold text-gray-700 dark:text-gray-200 outline-none focus:border-amber-400 focus:ring-4 focus:ring-amber-400/10 transition-all"
              placeholder="Ex: PURE DE GUAYABA 8-10 BRIX"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Variedade / Variety</label>
            <input 
              type="text" 
              value={formData.variedade} 
              onChange={(e) => handleChange('variedade', e.target.value)}
              className="w-full p-4 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-600 rounded-2xl text-sm font-bold text-gray-700 dark:text-gray-200 outline-none focus:border-amber-400 focus:ring-4 focus:ring-amber-400/10 transition-all"
            />
          </div>
        </div>
      </div>

      {/* Tabela de Resultados */}
      <div className="bg-white dark:bg-gray-800 rounded-[2rem] shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="bg-amber-600 px-6 py-4 flex justify-between items-center">
          <h3 className="text-white font-black text-xs uppercase tracking-[0.2em]">Resultados Analíticos</h3>
          <div className="flex items-center gap-4 no-print">
            <button type="button" onClick={() => handleSampleCountChange(-1)} className="bg-amber-700 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase hover:bg-red-600 transition-all border border-amber-600">
                <i className="fas fa-minus mr-1"></i> Remover Amostra
            </button>
            <div className="bg-amber-800 px-4 py-2 rounded-xl border border-amber-700">
               <span className="text-white font-black text-xs uppercase">{formData.sampleCount || 1} Amostras</span>
            </div>
            <button type="button" onClick={() => handleSampleCountChange(1)} className="bg-amber-700 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase hover:bg-green-600 transition-all border border-amber-600">
                <i className="fas fa-plus mr-1"></i> Adicionar Amostra
            </button>
          </div>
        </div>
        
        <div className="p-6 overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-gray-50 dark:bg-gray-900/50 border-b font-black text-gray-500 uppercase text-[10px]">
              <tr>
                <th className="p-4 w-64 min-w-[200px] border-r">Parâmetro / Parameter</th>
                {Array.from({ length: formData.sampleCount || 1 }).map((_, i) => (
                  <th key={i} className="p-4 text-center min-w-[120px] border-r">
                    <div className="mb-2">Amostra {i + 1}</div>
                    <select
                      value={formData.lotes?.[i] || (i === 0 ? formData.lote : '') || ''}
                      onChange={e => handleSampleBatchChange(i, e.target.value)}
                      className="w-full p-2 mb-2 border border-amber-100 rounded bg-amber-50 text-[10px] font-bold text-amber-800 focus:ring-1 focus:ring-amber-500 outline-none"
                    >
                      <option value="">Selecione o Lote...</option>
                      {availableBatches.map(batch => (
                        <option key={batch} value={batch}>{batch}</option>
                      ))}
                    </select>
                    <div className="relative group">
                      <i className="far fa-clock absolute left-2 top-1/2 -translate-y-1/2 text-amber-400 group-focus-within:text-amber-600"></i>
                      <input 
                        type="time" 
                        value={formData.sampleTimes?.[i] || ''} 
                        onChange={e => handleSampleTimeChange(i, e.target.value)}
                        className="w-full pl-7 p-1 text-[10px] border border-amber-100 rounded bg-white dark:bg-gray-800 text-center font-bold text-amber-800 focus:ring-1 focus:ring-amber-500 outline-none"
                      />
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              <tr className="bg-amber-50/20">
                <td className="p-3 pl-6 font-black text-amber-800 border-r uppercase tracking-wider">
                  Nº do Tambor
                  <i className="fas fa-barcode ml-2 text-[10px] opacity-40"></i>
                </td>
                {Array.from({ length: formData.sampleCount || 1 }).map((_, i) => (
                  <td key={i} className="p-2 border-r">
                    <input 
                      value={formData.drumNumbers?.[i] || ''} 
                      onChange={e => handleDrumNumberChange(i, e.target.value)}
                      className="w-full p-2 border border-amber-100 rounded-lg text-center focus:border-amber-500 outline-none bg-white dark:bg-gray-800 font-black text-amber-900" 
                      placeholder="Ex: 01"
                    />
                  </td>
                ))}
              </tr>
              {/* Informações de Produção */}
              {renderRow('tipoTambor', 'Tipo de Tambor / Drum type')}
              {renderRow('pesoTambor', 'Peso do Tambor / Drum weight (kg)')}
              {renderRow('dataProducao', 'Data de Produção / Production Date', false, '', 'date')}
              {renderRow('dataValidade', 'Data de Validade / Best before', false, '', 'date')}
              {renderRow('tambores', 'Tambores / Drums')}

              {/* Físico-Química */}
              <tr className="bg-gray-50 dark:bg-gray-900/50"><td colSpan={(formData.sampleCount || 1) + 1} className="py-2 px-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Físico-Química</td></tr>
              {renderRow('brix', 'Graus Brix (Corrigido) / Brix Degrees (Corrected)')}
              {renderRow('acidez', '% Acidez / % Acidity (w/w)')}
              {renderRow('ratio', 'Relação (Brix/Acidez) / Ratio (Brix/Acidity)')}
              {renderRow('ph', 'pH / pH')}
              {renderRow('densidade', 'Densidade / Density')}
              {renderRow('bostwick', 'Bostwick / Bostwick (cm at 8.0° Brix / 30 sec / 20°C)')}
              {renderRow('polpa', '% Polpa / % Pulp')}
              
              {/* Microbiologia e Outros */}
              <tr className="bg-gray-50 dark:bg-gray-900/50"><td colSpan={(formData.sampleCount || 1) + 1} className="py-2 px-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Microbiologia e Características</td></tr>
              {renderRow('fungos', '% Fungos / % Mold (Howard Method)')}
              {renderRow('contagemTotal', 'Contagem Total (UFC/ml) / Total Count (cfu/ml)')}
              {renderRow('boloresLeveduras', 'Bolores e Leveduras (UFC/ml) / Yeast and Mold Count (cfu/ml)')}
              {renderRow('coliformes', 'Coliformes (UFC/ml) / Coliforms (cfu/ml)')}
              {renderRow('tab', 'TAB / TAB')}
              {renderRow('cor', 'Cor / Color', true, 'CHARACTERISTIC')}
              {renderRow('sabor', 'Sabor / Flavor')}
              {renderRow('pontosPretos', 'Pontos Pretos / Black Specks')}
              {renderRow('pontosMarrons', 'Pontos Marrons / Browns Specks')}
              
              {/* Resultados Analíticos Extras */}
              {formData.extraResults?.map((res) => (
                <tr key={res.id} className="hover:bg-amber-50/30 transition-colors">
                  <td className="py-3 pr-4 border-r flex items-center gap-2">
                    <button type="button" onClick={() => removeExtraResult(res.id)} className="text-gray-400 hover:text-red-500 transition-colors p-2"><i className="fas fa-trash-alt"></i></button>
                    <input type="text" value={res.parameter} onChange={(e) => handleExtraResultChange(res.id, 'parameter', e.target.value)} placeholder="Nome do Parâmetro / Parameter Name" className="w-full p-2 border border-gray-200 dark:border-gray-600 rounded-lg font-bold focus:border-amber-400 outline-none" />
                  </td>
                  {Array.from({ length: formData.sampleCount || 1 }).map((_, i) => (
                    <td key={i} className="py-3 px-2 border-r">
                      <input 
                        type="text" 
                        value={formData.samples?.[res.id]?.[i] || (i === 0 ? res.value : '') || ''} 
                        onChange={(e) => handleSampleChange(res.id, i, e.target.value)} 
                        className="w-full p-2 border border-gray-200 dark:border-gray-600 rounded-lg font-bold text-center focus:border-amber-400 outline-none" 
                      />
                    </td>
                  ))}
                </tr>
              ))}
              <tr className="no-print">
                <td colSpan={(formData.sampleCount || 1) + 1} className="py-4 text-center">
                  <button type="button" onClick={addExtraResult} className="px-4 py-2 bg-amber-50 text-amber-600 font-bold rounded-xl hover:bg-amber-100 transition-colors text-sm">
                    <i className="fas fa-plus mr-2"></i> Adicionar Parâmetro Extra
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Observações e Assinaturas */}
      <div className="bg-white dark:bg-gray-800 p-6 md:p-8 rounded-[2rem] shadow-xl border border-gray-100 dark:border-gray-700 space-y-8">
        <div className="space-y-2">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Observações / Notes</label>
          <textarea 
            value={formData.observacoes}
            onChange={(e) => handleChange('observacoes', e.target.value)}
            className="w-full p-4 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-600 rounded-2xl text-sm font-bold text-gray-700 dark:text-gray-200 outline-none focus:border-amber-400 focus:ring-4 focus:ring-amber-400/10 transition-all min-h-[100px]"
            placeholder="Adicione observações se necessário..."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Analista de Controle de Qualidade</label>
              <input 
                type="text" 
                value={formData.analista}
                onChange={(e) => handleChange('analista', e.target.value)}
                className="w-full p-4 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-600 rounded-2xl text-sm font-bold text-gray-700 dark:text-gray-200 outline-none focus:border-amber-400 focus:ring-4 focus:ring-amber-400/10 transition-all"
                placeholder="Nome do Analista"
              />
            </div>
            <div className="border-2 border-dashed border-gray-200 dark:border-gray-600 rounded-2xl p-2 bg-gray-50 dark:bg-gray-900/50 relative">
              <canvas ref={analistaCanvasRef} className="w-full h-32 cursor-crosshair rounded-xl"></canvas>
              <div className="absolute bottom-2 right-2 flex gap-2">
                <button type="button" onClick={() => analistaPadRef.current?.clear()} className="p-2 bg-white dark:bg-gray-800 text-gray-400 hover:text-red-500 rounded-lg shadow-sm transition-colors" title="Limpar">
                  <i className="fas fa-eraser"></i>
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Líder Controle de Qualidade</label>
              <input 
                type="text" 
                value={formData.lider}
                onChange={(e) => handleChange('lider', e.target.value)}
                className="w-full p-4 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-600 rounded-2xl text-sm font-bold text-gray-700 dark:text-gray-200 outline-none focus:border-amber-400 focus:ring-4 focus:ring-amber-400/10 transition-all"
                placeholder="Nome do Líder"
              />
            </div>
            <div className="border-2 border-dashed border-gray-200 dark:border-gray-600 rounded-2xl p-2 bg-gray-50 dark:bg-gray-900/50 relative">
              <canvas ref={liderCanvasRef} className="w-full h-32 cursor-crosshair rounded-xl"></canvas>
              <div className="absolute bottom-2 right-2 flex gap-2">
                <button type="button" onClick={() => liderPadRef.current?.clear()} className="p-2 bg-white dark:bg-gray-800 text-gray-400 hover:text-red-500 rounded-lg shadow-sm transition-colors" title="Limpar">
                  <i className="fas fa-eraser"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end gap-4 pt-4 no-print">
        <button 
          type="button" 
          onClick={() => window.print()}
          className="px-8 py-4 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-2xl font-black uppercase tracking-widest hover:bg-gray-200 active:scale-95 transition-all shadow-sm flex items-center gap-3"
        >
          <i className="fas fa-print text-xl"></i> GERAR RELATÓRIO
        </button>
        <button 
          type="submit" 
          disabled={isSubmitting}
          className="px-10 py-4 bg-amber-600 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-amber-700 active:scale-95 transition-all shadow-lg shadow-amber-600/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3"
        >
          {isSubmitting ? (
            <><i className="fas fa-spinner fa-spin"></i> SALVANDO...</>
          ) : (
            <><i className="fas fa-save text-xl"></i> SALVAR COA</>
          )}
        </button>
      </div>
    </form>
  );
};

export default CertificateOfAnalysisForm;
