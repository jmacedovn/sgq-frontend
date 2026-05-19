
import React, { useState, useEffect, useRef } from 'react';
import SignaturePad from 'signature_pad';
import { supabase } from '../../lib/supabase';
import { api } from '../../lib/api';
import { db } from '../../lib/db';
import { FormType } from '../../types';
import { toast } from 'sonner';

interface AnalysisRow {
  parameter: string;
  values: string[];
  average: string;
}

const PhysicochemicalAnalysisForm: React.FC<{ onSave: (data: any) => void, isSubmitting: boolean, initialData?: any }> = ({ onSave, isSubmitting, initialData }) => {
  const [sampleCount, setSampleCount] = useState(initialData?.sampleCount || 3);
  const [sampleTimes, setSampleTimes] = useState<string[]>(initialData?.sampleTimes || Array(10).fill(''));
  const [drumNumbers, setDrumNumbers] = useState<string[]>(initialData?.drumNumbers || Array(10).fill(''));
  const [sampleStatuses, setSampleStatuses] = useState<{ isCompleted: boolean, analystName: string }[]>(
    initialData?.sampleStatuses || Array.from({ length: 10 }, () => ({ isCompleted: false, analystName: '' }))
  );
  const [sampleToFinalize, setSampleToFinalize] = useState<number | null>(null);
  const [analystNameInput, setAnalystNameInput] = useState('');

  const [header, setHeader] = useState(initialData?.header || {
    data: new Date().toISOString().split('T')[0],
    fruta: '',
    produto: '',
    categoria: '',
    lote: '',
    qtdTambores: '',
    pesoEmbalagem: '200',
    qtdeProduzida: ''
  });

  const [availableBatches, setAvailableBatches] = useState<any[]>([]);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const signaturePadRef = useRef<SignaturePad | null>(null);

  const parametersList = [
    '°Brix Direto', 
    'Acidez (%)', 
    'Correção da Acidez', 
    '°Brix Corrigido', 
    'Ratio (Brix Corr./ Acidez)',
    'pH', 'Vitamina C (mg/100g)', 'Densidade (g/cm³)', 'Velocidade (ppm)', 'Nº Agulha',
    '% Torque', 'Viscosidade (cP)', 'Bostwick (cm/30 seg)', 'Cor (L)', 'Cor (a)', 'Cor (b)',
    'Cor Pantone', 'Pontos Pretos', 'Pontos Marrons', 'Fungos Método Howard (%)', 'Teor de Polpa (%)',
    'Sabor', 'Odor', 'Resíduos Minerais - Areia (g/kg)', 'VISTO'
  ];

  const singleSampleParams = [
    'Resíduos Minerais - Areia (g/kg)'
  ];

  const [rows, setRows] = useState<AnalysisRow[]>(initialData?.rows || 
    parametersList.map(p => ({ parameter: p, values: Array(10).fill(''), average: '' }))
  );

  const [footer, setFooter] = useState(initialData?.footer || {
    observacao: '',
    verificadoPor: '',
    dataVerificacao: new Date().toISOString().split('T')[0]
  });

  const parseNum = (val: string): number | null => {
    if (val === undefined || val === null || val.trim() === '') return null;
    const sanitized = val.toString().replace(',', '.').trim();
    const num = parseFloat(sanitized);
    return isNaN(num) ? null : num;
  };

  const formatValue = (val: number | null, parameter: string): string => {
    if (val === null) return '';
    const name = parameter.toUpperCase();
    
    // 1. Sem casas decimais (Inteiros)
    if (
      name.includes('VELOCIDADE (PPM)') || 
      name.includes('TEOR DE POLPA (%)') || 
      name.includes('PONTOS PRETOS') || 
      name.includes('PONTOS MARRONS') ||
      name.includes('Nº AGULHA') ||
      name.includes('FUNGOS')
    ) {
      return Math.round(val).toString();
    }

    // 2. Uma casa decimal com vírgula (% Torque e Bostwick)
    if (name.includes('BOSTWICK')) {
      const integerPart = Math.floor(val);
      const decimalPart = val - integerPart;
      const roundedDecimal = Math.round(decimalPart * 10) / 10;
      
      let roundedVal = val;
      if (roundedDecimal <= 0.4) {
        roundedVal = integerPart;
      } else if (roundedDecimal === 0.5) {
        roundedVal = integerPart + 0.5;
      } else {
        roundedVal = integerPart + 1;
      }
      return roundedVal.toFixed(1).replace('.', ',');
    }

    if (name.includes('% TORQUE')) {
      return val.toFixed(1).replace('.', ',');
    }

    // 3. Quatro casas decimais com vírgula (Resíduos Minerais - Areia)
    if (name.includes('AREIA')) {
      const displayVal = val >= 1 ? val / 10000 : val;
      return displayVal.toFixed(4).replace('.', ',');
    }

    // 4. Três casas decimais com vírgula (Acidez e Viscosidade)
    if (
      name.includes('ACIDEZ (%)') || 
      name.includes('CORREÇÃO DA ACIDEZ') ||
      name.includes('VISCOSIDADE (CP)')
    ) {
      return val.toFixed(3).replace('.', ',');
    }
    
    // 5. Duas casas decimais com vírgula (Padrão: Brix, Ratio, pH, etc)
    return val.toFixed(2).replace('.', ',');
  };

  useEffect(() => {
    const normalizeBatchRecord = (record: any) => {
      if (!record) return null;
      
      let data = record.data || record;
      
      // Se data for string, tenta fazer o parse (caso venha do backend sem parsear JSONB)
      if (typeof data === 'string') {
        try {
          data = JSON.parse(data);
        } catch (e) {
          console.error('Erro ao parsear dados do lote:', e, record);
          return null;
        }
      }

      // O código do lote pode estar em generatedCode ou lote (legado)
      const generatedCode = data.generatedCode || data.lote || record.generatedCode || record.lote;
      
      if (!generatedCode) return null;

      return {
        ...data,
        generatedCode,
        inputs: data.inputs || data, // Fallback se inputs não estiver aninhado
        timestamp: record.timestamp || data.generatedAt || data.timestamp || new Date().toISOString()
      };
    };

    const fetchBatches = async () => {
      try {
        const [remoteBatchRows, legacyRows, localRows, viewAllRows] = await Promise.all([
          api.getRecords('batch_generation', {
            order: 'timestamp',
            orderDirection: 'desc',
            limit: 100
          }).catch(() => []),
          api.getRecords('records', { 
            form_type: FormType.BATCH_GENERATION,
            order: 'timestamp',
            orderDirection: 'desc',
            limit: 100
          }).catch(() => []),
          db.records
            .where('form_type')
            .equals(FormType.BATCH_GENERATION)
            .reverse()
            .sortBy('timestamp')
            .catch(() => []),
          api.getRecords('view_all_records', { 
            form_type: FormType.BATCH_GENERATION,
            limit: 50
          }).catch(() => [])
        ]);
        
        console.log('DEBUG BATCHES:', {
          remote: remoteBatchRows.length,
          legacy: legacyRows.length,
          local: localRows.length,
          view: viewAllRows.length
        });

        const allRows = [...localRows, ...remoteBatchRows, ...legacyRows, ...viewAllRows];
        const batches = allRows
          .map(normalizeBatchRecord)
          .filter((batch): batch is any => Boolean(batch?.generatedCode));

        const uniqueBatches = Array.from(
          new Map(batches.map((batch: any) => [batch.generatedCode, batch])).values()
        );

        setAvailableBatches(uniqueBatches);
        if (uniqueBatches.length === 0) {
          console.warn('Nenhum lote válido encontrado após filtragem.');
        }
      } catch (error) {
        console.error('Erro ao buscar lotes:', error);
        toast.error('Não foi possível carregar a lista de lotes disponíveis.');
      }
    };
    fetchBatches();
  }, []);

  useEffect(() => {
    if (header.lote) {
      const batchData = availableBatches.find(b => b.generatedCode === header.lote);
      if (batchData) {
        const batchInputs = batchData.inputs || {};
        setHeader(prev => ({
          ...prev,
          data: batchInputs.data || prev.data,
          fruta: batchInputs.fruta?.replace(/_/g, ' ') || prev.fruta,
          produto: batchInputs.produto || prev.produto,
          categoria: batchInputs.categoria || prev.categoria || 'CONVENCIONAL'
        }));
      }
    }
  }, [header.lote, availableBatches]);

  useEffect(() => {
    const qtd = parseNum(header.qtdTambores);
    const peso = parseNum(header.pesoEmbalagem);
    if (qtd !== null && peso !== null) {
      setHeader(prev => ({ ...prev, qtdeProduzida: (qtd * peso).toString() }));
    }
  }, [header.qtdTambores, header.pesoEmbalagem]);

  useEffect(() => {
    if (canvasRef.current) {
        const pad = new SignaturePad(canvasRef.current, {
            backgroundColor: 'rgba(255, 255, 255, 0)',
            penColor: 'rgb(13, 148, 136)',
        });
        signaturePadRef.current = pad;
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
  }, []);

  const runCalculations = (currentRows: AnalysisRow[]) => {
    const newRows = [...currentRows];

    const brixIdx = newRows.findIndex(r => r.parameter === '°Brix Direto');
    const acidezIdx = newRows.findIndex(r => r.parameter === 'Acidez (%)');
    const corrIdx = newRows.findIndex(r => r.parameter === 'Correção da Acidez');
    const brixCorrIdx = newRows.findIndex(r => r.parameter === '°Brix Corrigido');
    const ratioIdx = newRows.findIndex(r => r.parameter === 'Ratio (Brix Corr./ Acidez)');

    for (let sIdx = 0; sIdx < 10; sIdx++) {
      const brixVal = parseNum(newRows[brixIdx].values[sIdx]);
      const acidezVal = parseNum(newRows[acidezIdx].values[sIdx]);

      const corr = acidezVal !== null ? acidezVal * 0.2 : 0;
      
      if (acidezVal !== null) {
        newRows[corrIdx].values[sIdx] = formatValue(corr, 'Correção da Acidez');
      } else {
        newRows[corrIdx].values[sIdx] = '';
      }
      
      if (brixVal !== null) {
        const brixCorr = brixVal + corr;
        newRows[brixCorrIdx].values[sIdx] = formatValue(brixCorr, '°Brix Corrigido');
        
        if (acidezVal !== null && acidezVal > 0) {
          newRows[ratioIdx].values[sIdx] = formatValue(brixCorr / acidezVal, 'Ratio (Brix Corr./ Acidez)');
        } else {
          newRows[ratioIdx].values[sIdx] = '';
        }
      } else {
        newRows[brixCorrIdx].values[sIdx] = '';
        newRows[ratioIdx].values[sIdx] = '';
      }
    }

    newRows.forEach((row) => {
      const p = row.parameter;
      if (p === 'VISTO') return;

      if (singleSampleParams.includes(p)) {
         const val = parseNum(row.values[0]);
         row.average = val !== null ? formatValue(val, p) : row.values[0];
         return;
      }

      const validSamples = row.values.slice(0, sampleCount).filter(v => v.trim() !== '');

      if (validSamples.length > 0) {
        if (p === 'Sabor' || p === 'Odor' || p === 'Cor Pantone') {
           row.average = validSamples[0];
           return;
        }

        if (p === 'Nº Agulha') {
           row.average = '';
           return;
        }

        const numVals = validSamples.map(v => parseNum(v)).filter((v): v is number => v !== null);
        if (numVals.length > 0) {
          const sum = numVals.reduce((a, b) => a + b, 0);
          row.average = formatValue(sum / numVals.length, p);
        } else {
           row.average = validSamples[0];
        }
      } else {
        row.average = '';
      }
    });

    // Recalcular médias das fórmulas usando as médias de Brix Direto e Acidez
    const avgBrix = parseNum(newRows[brixIdx].average);
    const avgAcidez = parseNum(newRows[acidezIdx].average);

    const avgCorr = avgAcidez !== null ? avgAcidez * 0.2 : 0;
    
    if (avgAcidez !== null) {
      newRows[corrIdx].average = formatValue(avgCorr, 'Correção da Acidez');
    } else {
      newRows[corrIdx].average = '';
    }
    
    if (avgBrix !== null) {
      const avgBrixCorr = avgBrix + avgCorr;
      newRows[brixCorrIdx].average = formatValue(avgBrixCorr, '°Brix Corrigido');
      
      if (avgAcidez !== null && avgAcidez > 0) {
        newRows[ratioIdx].average = formatValue(avgBrixCorr / avgAcidez, 'Ratio (Brix Corr./ Acidez)');
      } else {
        newRows[ratioIdx].average = '';
      }
    } else {
      newRows[brixCorrIdx].average = '';
      newRows[ratioIdx].average = '';
    }

    return newRows;
  };

  const updateRowValue = (rIdx: number, sampleIdx: number, value: string) => {
    const newRows = [...rows];
    newRows[rIdx].values[sampleIdx] = value;
    setRows(runCalculations(newRows));
  };

  const validate = () => {
    const errors: Record<string, string> = {};
    if (!header.lote) errors.lote = "Lote obrigatório";
    if (!footer.verificadoPor && (!signaturePadRef.current || signaturePadRef.current.isEmpty())) {
        errors.signature = "Assinatura digital necessária";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const confirmFinalizeSample = () => {
    if (sampleToFinalize !== null && analystNameInput.trim() !== '') {
      const newStatuses = [...sampleStatuses];
      newStatuses[sampleToFinalize] = { isCompleted: true, analystName: analystNameInput.trim() };
      setSampleStatuses(newStatuses);
      setSampleToFinalize(null);
      setAnalystNameInput('');
    }
  };

  const handleSavePending = () => {
    if (!header.lote) {
      setFormErrors({ lote: "Lote obrigatório para salvar como pendente" });
      return;
    }
    let sig = footer.verificadoPor;
    if (signaturePadRef.current && !signaturePadRef.current.isEmpty()) sig = signaturePadRef.current.toDataURL();
    onSave({ header, rows, sampleCount, sampleTimes, drumNumbers, sampleStatuses, status: 'pending', footer: { ...footer, verificadoPor: sig } });
  };

  const handleFinalize = () => {
    if (!validate()) return;
    
    const allCompleted = sampleStatuses.slice(0, sampleCount).every(s => s.isCompleted);
    if (!allCompleted) {
      setFormErrors({ ...formErrors, samples: "Todas as amostras devem ser finalizadas antes de concluir o formulário." });
      return;
    }

    let sig = footer.verificadoPor;
    if (signaturePadRef.current && !signaturePadRef.current.isEmpty()) sig = signaturePadRef.current.toDataURL();
    onSave({ header, rows, sampleCount, sampleTimes, drumNumbers, sampleStatuses, status: 'completed', footer: { ...footer, verificadoPor: sig } });
  };

  return (
    <form onSubmit={e => e.preventDefault()} className="space-y-6 md:space-y-8 animate-fadeIn">
      {/* Cabeçalho */}
      <div className="bg-teal-50 p-6 md:p-8 rounded-[2rem] border border-teal-100 shadow-sm grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="space-y-1">
          <label className="text-[10px] font-black text-teal-800 uppercase tracking-widest">Data *</label>
          <input type="date" value={header.data} onChange={e => setHeader({...header, data: e.target.value})} className="w-full p-2.5 border border-teal-100 rounded-xl bg-white dark:bg-gray-800 focus:ring-2 focus:ring-teal-500 outline-none" />
        </div>
        <div className="space-y-1 relative">
          <label className={`text-[10px] font-black uppercase tracking-widest ${formErrors.lote ? 'text-red-500' : 'text-teal-800'}`}>Lote *</label>
          <div className="relative">
            <select 
              value={header.lote} 
              onChange={e => setHeader({...header, lote: e.target.value})}
              className={`w-full p-2.5 border rounded-xl font-bold ${formErrors.lote ? 'border-red-400' : 'border-teal-100'} bg-white dark:bg-gray-800 focus:ring-2 focus:ring-teal-500 outline-none appearance-none`}
            >
              <option value="">Selecione um Lote...</option>
              {availableBatches.map(b => (
                <option key={b.generatedCode} value={b.generatedCode}>
                  {b.generatedCode} {b.inputs?.fruta ? `- ${b.inputs.fruta.replace(/_/g, ' ')}` : ''}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-teal-600">
              <i className="fas fa-chevron-down text-xs"></i>
            </div>
          </div>
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-black text-teal-800 uppercase tracking-widest">Fruta</label>
          <input value={header.fruta} readOnly className="w-full p-2.5 border border-teal-50 rounded-xl bg-teal-50/50 font-bold text-teal-900 cursor-not-allowed" />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-black text-teal-800 uppercase tracking-widest">Produto</label>
          <input value={header.produto} readOnly className="w-full p-2.5 border border-teal-50 rounded-xl bg-teal-50/50 font-bold text-teal-900 cursor-not-allowed" />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-black text-teal-800 uppercase tracking-widest">Categoria</label>
          <input value={header.categoria} readOnly className="w-full p-2.5 border border-teal-50 rounded-xl bg-teal-50/50 font-bold text-teal-900 cursor-not-allowed" />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-black text-teal-800 uppercase tracking-widest">Qtd. Tambores Lote</label>
          <input type="number" value={header.qtdTambores} onChange={e => setHeader({...header, qtdTambores: e.target.value})} className="w-full p-2.5 border border-teal-100 rounded-xl bg-white dark:bg-gray-800 focus:ring-2 focus:ring-teal-500 outline-none" />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-black text-teal-800 uppercase tracking-widest">Peso Unit. (kg)</label>
          <input type="number" value={header.pesoEmbalagem} onChange={e => setHeader({...header, pesoEmbalagem: e.target.value})} className="w-full p-2.5 border border-teal-100 rounded-xl bg-white dark:bg-gray-800 focus:ring-2 focus:ring-teal-500 outline-none" />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-black text-teal-800 uppercase tracking-widest">Peso Total (kg)</label>
          <input value={header.qtdeProduzida} readOnly className="w-full p-2.5 border rounded-xl bg-teal-50/50 font-black text-teal-800 text-center cursor-not-allowed" />
        </div>
      </div>

      {/* Resultados e Tabela */}
      <div className="bg-white dark:bg-gray-800 rounded-[2rem] border border-gray-100 dark:border-gray-700 shadow-xl overflow-hidden">
         <div className="bg-teal-800 px-6 py-5 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex flex-col">
                <h4 className="text-white font-black text-sm uppercase tracking-[0.2em]">Resultados das Análises</h4>
                <p className="text-teal-300 text-[9px] font-bold uppercase mt-1">Colunas de Amostras para Cálculo de Média</p>
            </div>
            
            <div className="flex items-center gap-4">
                <button type="button" onClick={() => sampleCount > 1 && setSampleCount(sampleCount - 1)} className="bg-teal-700 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase hover:bg-red-600 transition-all border border-teal-600">
                    <i className="fas fa-minus mr-1"></i> Remover Amostra
                </button>
                <div className="bg-teal-900 px-4 py-2 rounded-xl border border-teal-700">
                   <span className="text-white font-black text-xs uppercase">{sampleCount} Amostras</span>
                </div>
                <button type="button" onClick={() => sampleCount < 10 && setSampleCount(sampleCount + 1)} className="bg-teal-700 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase hover:bg-green-600 transition-all border border-teal-600">
                    <i className="fas fa-plus mr-1"></i> Adicionar Amostra
                </button>
            </div>
         </div>

         {/* Desktop Table View */}
         <div className="hidden md:block overflow-x-auto custom-scrollbar">
            <table className="w-full text-[11px] text-left border-collapse">
               <thead className="bg-gray-50 dark:bg-gray-900/50 border-b font-black text-gray-500 uppercase">
                  <tr>
                     <th className="p-4 w-64 min-w-[200px] border-r">Parâmetro</th>
                     {Array.from({ length: sampleCount }).map((_, i) => (
                       <th key={i} className="p-4 text-center min-w-[120px] border-r">
                         <div className="mb-2">Amostra {i + 1}</div>
                         <div className="relative group">
                            <i className="far fa-clock absolute left-2 top-1/2 -translate-y-1/2 text-teal-400 group-focus-within:text-teal-600"></i>
                            <input 
                                type="time" 
                                value={sampleTimes[i]} 
                                onChange={e => {
                                    const n = [...sampleTimes];
                                    n[i] = e.target.value;
                                    setSampleTimes(n);
                                }}
                                disabled={sampleStatuses[i].isCompleted}
                                className={`w-full pl-7 p-1 text-[10px] border border-teal-100 rounded text-center font-bold focus:ring-1 focus:ring-teal-500 outline-none ${sampleStatuses[i].isCompleted ? 'bg-gray-100 dark:bg-gray-700 text-gray-500 cursor-not-allowed' : 'bg-white dark:bg-gray-800 text-teal-800'}`}
                            />
                         </div>
                       </th>
                     ))}
                     <th className="p-4 text-center bg-teal-50 text-teal-800 w-32">Média / Resultado</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-gray-100">
                  <tr className="bg-teal-50/20">
                     <td className="p-3 pl-6 font-black text-teal-800 border-r uppercase tracking-wider">
                        Nº do Tambor
                        <i className="fas fa-barcode ml-2 text-[10px] opacity-40"></i>
                     </td>
                     {Array.from({ length: sampleCount }).map((_, i) => (
                        <td key={i} className="p-2 border-r">
                           <input 
                              value={drumNumbers[i]} 
                              onChange={e => {
                                 const n = [...drumNumbers];
                                 n[i] = e.target.value;
                                 setDrumNumbers(n);
                              }}
                              disabled={sampleStatuses[i].isCompleted}
                              className={`w-full p-2 border border-teal-100 rounded-lg text-center focus:border-teal-500 outline-none font-black ${sampleStatuses[i].isCompleted ? 'bg-gray-100 dark:bg-gray-700 text-gray-500 cursor-not-allowed' : 'bg-white dark:bg-gray-800 text-teal-900'}`} 
                              placeholder="Ex: 01"
                           />
                        </td>
                     ))}
                     <td className="p-2 bg-teal-50/50 text-center text-gray-300">---</td>
                  </tr>

                  {rows.map((row, rIdx) => {
                     const isFormula = ['Correção da Acidez', '°Brix Corrigido', 'Ratio (Brix Corr./ Acidez)'].includes(row.parameter);
                     const isVisto = row.parameter === 'VISTO';
                     const isSingleSample = singleSampleParams.includes(row.parameter);
                     
                     return (
                        <tr key={rIdx} className={`${isFormula ? 'bg-amber-50/10' : isVisto ? 'bg-teal-50/30' : 'hover:bg-teal-50/10'} transition-colors`}>
                           <td className={`p-3 pl-6 font-bold border-r ${isFormula ? 'text-amber-800' : 'text-gray-700 dark:text-gray-200'}`}>
                              {row.parameter}
                              {isFormula && <i className="fas fa-calculator ml-2 text-[9px] opacity-40"></i>}
                           </td>
                           {Array.from({ length: sampleCount }).map((_, sIdx) => {
                              const isEditable = !isFormula && !isVisto && (!isSingleSample || sIdx === 0) && !sampleStatuses[sIdx].isCompleted;
                              
                              return (
                                <td key={sIdx} className="p-2 border-r">
                                   {isEditable ? (
                                      <input 
                                         value={row.values[sIdx]} 
                                         onChange={e => {
                                             let val = e.target.value;
                                             if (isSingleSample) {
                                                const digits = val.replace(/\D/g, '');
                                                if (digits === '') {
                                                   val = '';
                                                } else {
                                                   const num = parseInt(digits, 10);
                                                   val = (num / 10000).toFixed(4).replace('.', ',');
                                                }
                                             }
                                             updateRowValue(rIdx, sIdx, val);
                                          }}
                                          className="w-full p-2 border border-gray-100 dark:border-gray-700 rounded-lg text-center focus:border-teal-500 outline-none bg-white dark:bg-gray-800 font-medium" 
                                         placeholder={isSingleSample ? "0,0000" : "-"}
                                      />
                                   ) : isFormula ? (
                                      <div className="text-center font-bold text-amber-700 bg-amber-50/50 p-1.5 rounded-lg border border-amber-100">
                                         {row.values[sIdx] || '---'}
                                      </div>
                                   ) : sampleStatuses[sIdx].isCompleted && !isVisto && (!isSingleSample || sIdx === 0) ? (
                                      <div className="text-center font-bold text-gray-500 bg-gray-50 dark:bg-gray-900/50 p-1.5 rounded-lg border border-gray-100 dark:border-gray-700">
                                         {row.values[sIdx] || '---'}
                                      </div>
                                   ) : (
                                      <div className="text-center text-gray-300 font-bold opacity-30">---</div>
                                   )}
                                </td>
                              );
                           })}
                           <td className={`p-2 ${isFormula ? 'bg-amber-50/30' : 'bg-teal-50/50'}`}>
                              {isVisto ? (
                                 <input value={row.average} onChange={e => {
                                    const n = [...rows];
                                    n[rIdx].average = e.target.value;
                                    setRows(n);
                                 }} className="w-full p-2 border border-teal-200 rounded-lg text-center text-[10px] bg-white dark:bg-gray-800 focus:ring-1 focus:ring-teal-500 outline-none font-bold" placeholder="Visto Analista" />
                              ) : (
                                 <input 
                                    value={row.average} 
                                    readOnly 
                                    placeholder={isFormula ? "Auto" : isSingleSample ? "0,0000" : "-"}
                                    className={`w-full p-2 border rounded-lg text-center font-black transition-all ${isFormula ? 'border-amber-200 text-amber-900 bg-white dark:bg-gray-800 shadow-sm' : 'border-teal-200 text-teal-800 bg-white dark:bg-gray-800'}`} 
                                 />
                              )}
                           </td>
                        </tr>
                     );
                  })}
                  <tr className="bg-gray-50 dark:bg-gray-900/50">
                     <td className="p-3 pl-6 font-black text-gray-700 dark:text-gray-200 border-r uppercase tracking-wider">
                        Status da Amostra
                     </td>
                     {Array.from({ length: sampleCount }).map((_, i) => (
                        <td key={i} className="p-2 border-r text-center align-middle">
                           {sampleStatuses[i].isCompleted ? (
                              <div className="text-[9px] text-teal-800 font-bold bg-teal-100 p-2 rounded-lg border border-teal-200">
                                 Amostra {i + 1} - Feita<br/>
                                 <span className="text-teal-900">{sampleStatuses[i].analystName}</span><br/>
                                 <span className="opacity-70">Bloqueada para edição</span>
                              </div>
                           ) : (
                              <button 
                                 type="button" 
                                 onClick={() => setSampleToFinalize(i)}
                                 className="w-full p-2 bg-teal-600 text-white rounded-lg text-[9px] font-black uppercase tracking-wider hover:bg-teal-700 transition-colors shadow-sm"
                              >
                                 Finalizar Amostra
                              </button>
                           )}
                        </td>
                     ))}
                     <td className="p-2 bg-gray-100 dark:bg-gray-700 border-l"></td>
                  </tr>
               </tbody>
            </table>
         </div>

         {/* Mobile Card View */}
         <div className="md:hidden divide-y divide-gray-100">
            {/* Mobile Header: Times and Drums */}
            <div className="p-4 bg-teal-50/30 space-y-4">
               <h5 className="text-[10px] font-black text-teal-800 uppercase tracking-widest border-b border-teal-100 pb-2">Identificação das Amostras</h5>
               <div className="grid grid-cols-1 gap-3">
                  {Array.from({ length: sampleCount }).map((_, i) => (
                     <div key={i} className="bg-white dark:bg-gray-800 p-3 rounded-xl border border-teal-100 shadow-sm flex items-center justify-between gap-4">
                        <span className="text-[10px] font-black text-teal-700 uppercase">Amostra {i + 1}</span>
                        <div className="flex gap-2 flex-1 max-w-[200px]">
                           <input 
                              type="time" 
                              value={sampleTimes[i]} 
                              onChange={e => {
                                 const n = [...sampleTimes];
                                 n[i] = e.target.value;
                                 setSampleTimes(n);
                              }}
                              disabled={sampleStatuses[i].isCompleted}
                              className={`w-1/2 p-1.5 border border-teal-50 rounded text-[10px] font-bold text-center ${sampleStatuses[i].isCompleted ? 'bg-gray-100 dark:bg-gray-700 text-gray-500' : 'bg-white dark:bg-gray-800'}`}
                           />
                           <input 
                              value={drumNumbers[i]} 
                              onChange={e => {
                                 const n = [...drumNumbers];
                                 n[i] = e.target.value;
                                 setDrumNumbers(n);
                              }}
                              disabled={sampleStatuses[i].isCompleted}
                              className={`w-1/2 p-1.5 border border-teal-50 rounded text-[10px] font-black text-center ${sampleStatuses[i].isCompleted ? 'bg-gray-100 dark:bg-gray-700 text-gray-500' : 'bg-white dark:bg-gray-800'}`}
                              placeholder="Tambor"
                           />
                        </div>
                     </div>
                  ))}
               </div>
            </div>

            {/* Mobile Body: Parameters */}
            {rows.map((row, rIdx) => {
               const isFormula = ['Correção da Acidez', '°Brix Corrigido', 'Ratio (Brix Corr./ Acidez)'].includes(row.parameter);
               const isVisto = row.parameter === 'VISTO';
               const isSingleSample = singleSampleParams.includes(row.parameter);

               return (
                  <div key={rIdx} className={`p-4 space-y-3 ${isFormula ? 'bg-amber-50/10' : isVisto ? 'bg-teal-50/30' : ''}`}>
                     <div className="flex justify-between items-center">
                        <span className={`text-[10px] font-black uppercase tracking-widest ${isFormula ? 'text-amber-800' : 'text-gray-700 dark:text-gray-200'}`}>
                           {row.parameter}
                        </span>
                        {!isVisto && (
                           <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${isFormula ? 'bg-amber-100 text-amber-900' : 'bg-teal-100 text-teal-900'}`}>
                              Média: {row.average || '---'}
                           </span>
                        )}
                     </div>

                     {isVisto ? (
                        <input 
                           value={row.average} 
                           onChange={e => {
                              const n = [...rows];
                              n[rIdx].average = e.target.value;
                              setRows(n);
                           }} 
                           className="w-full p-2 border border-teal-200 rounded-lg text-center text-[10px] bg-white dark:bg-gray-800 font-bold" 
                           placeholder="Visto Analista" 
                        />
                     ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                           {Array.from({ length: sampleCount }).map((_, sIdx) => {
                              const isEditable = !isFormula && (!isSingleSample || sIdx === 0) && !sampleStatuses[sIdx].isCompleted;
                              if (!isEditable && !isFormula && !sampleStatuses[sIdx].isCompleted) return null;

                              return (
                                 <div key={sIdx} className="space-y-1">
                                    <label className="text-[8px] font-bold text-gray-400 uppercase">Amostra {sIdx + 1}</label>
                                    {isEditable ? (
                                       <input 
                                          value={row.values[sIdx]} 
                                          onChange={e => {
                                             let val = e.target.value;
                                             if (isSingleSample) {
                                                const digits = val.replace(/\D/g, '');
                                                val = digits === '' ? '' : (parseInt(digits, 10) / 10000).toFixed(4).replace('.', ',');
                                             }
                                             updateRowValue(rIdx, sIdx, val);
                                          }}
                                          className="w-full p-2 border border-gray-100 dark:border-gray-700 rounded-lg text-center text-[10px] bg-white dark:bg-gray-800" 
                                          placeholder="-"
                                       />
                                    ) : isFormula ? (
                                       <div className="w-full p-2 border border-amber-100 rounded-lg text-center text-[10px] bg-amber-50/50 font-bold text-amber-800">
                                          {row.values[sIdx] || '---'}
                                       </div>
                                    ) : sampleStatuses[sIdx].isCompleted && (!isSingleSample || sIdx === 0) ? (
                                       <div className="w-full p-2 border border-gray-100 dark:border-gray-700 rounded-lg text-center text-[10px] bg-gray-50 dark:bg-gray-900/50 font-bold text-gray-500">
                                          {row.values[sIdx] || '---'}
                                       </div>
                                    ) : null}
                                 </div>
                              );
                           })}
                        </div>
                     )}
                  </div>
               );
            })}
            
            {/* Mobile Sample Status */}
            <div className="p-4 bg-gray-50 dark:bg-gray-900/50 space-y-3">
               <h5 className="text-[10px] font-black text-gray-700 dark:text-gray-200 uppercase tracking-widest border-b border-gray-200 dark:border-gray-600 pb-2">Status das Amostras</h5>
               <div className="grid grid-cols-1 gap-2">
                  {Array.from({ length: sampleCount }).map((_, i) => (
                     <div key={i} className="bg-white dark:bg-gray-800 p-3 rounded-xl border border-gray-200 dark:border-gray-600 shadow-sm flex items-center justify-between gap-4">
                        <span className="text-[10px] font-black text-gray-700 dark:text-gray-200 uppercase">Amostra {i + 1}</span>
                        {sampleStatuses[i].isCompleted ? (
                           <div className="text-[9px] text-teal-800 font-bold bg-teal-100 px-3 py-1.5 rounded-lg text-right">
                              Feita por {sampleStatuses[i].analystName}<br/>
                              <span className="opacity-70">Bloqueada</span>
                           </div>
                        ) : (
                           <button 
                              type="button" 
                              onClick={() => setSampleToFinalize(i)}
                              className="px-4 py-2 bg-teal-600 text-white rounded-lg text-[9px] font-black uppercase tracking-wider hover:bg-teal-700 transition-colors shadow-sm"
                           >
                              Finalizar
                           </button>
                        )}
                     </div>
                  ))}
               </div>
            </div>
         </div>
      </div>

      {/* Rodapé e Assinatura */}
      <div className={`bg-gray-50 dark:bg-gray-900/50 p-6 md:p-8 rounded-[2.5rem] border transition-all ${formErrors.signature ? 'border-red-300 bg-red-50' : 'border-gray-100 dark:border-gray-700 shadow-inner'} space-y-6`}>
         <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Observações Adicionais</label>
            <textarea value={footer.observacao} onChange={e => setFooter({...footer, observacao: e.target.value})} className="w-full p-4 border border-gray-200 dark:border-gray-600 rounded-xl h-24 text-sm bg-white dark:bg-gray-800 focus:ring-2 focus:ring-teal-500 outline-none shadow-sm" placeholder="Anomalias, ocorrências no lote..." />
         </div>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t">
            <div className="space-y-2">
               <div className="flex justify-between items-end">
                  <label className={`text-[10px] font-black uppercase tracking-widest ml-1 ${formErrors.signature ? 'text-red-600' : 'text-teal-800'}`}>Assinatura Analista *</label>
                  <button type="button" onClick={() => signaturePadRef.current?.clear()} className="text-[9px] text-red-400 hover:text-red-600 font-bold uppercase">Limpar</button>
               </div>
               <div className={`w-full h-40 bg-white dark:bg-gray-800 border-2 border-dashed rounded-2xl overflow-hidden relative transition-all ${formErrors.signature ? 'border-red-400 bg-red-50/50' : 'border-teal-200 hover:border-teal-400'}`}>
                  {footer.verificadoPor && footer.verificadoPor.startsWith('data:image') ? (
                     <img src={footer.verificadoPor} alt="Assinatura" className="h-full object-contain mx-auto" />
                  ) : <canvas ref={canvasRef} className="w-full h-full cursor-crosshair touch-none" />}
               </div>
               {formErrors.signature && <p className="text-red-500 text-[9px] font-bold uppercase tracking-wide">{formErrors.signature}</p>}
            </div>
            <div className="space-y-1">
               <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Data Verificação</label>
               <input type="date" value={footer.dataVerificacao} onChange={e => setFooter({...footer, dataVerificacao: e.target.value})} className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-xl outline-none bg-white dark:bg-gray-800 font-bold" />
            </div>
         </div>
      </div>

      <div className="pt-4 flex flex-col md:flex-row justify-end gap-4">
        {formErrors.samples && <p className="text-red-500 text-[10px] font-bold uppercase tracking-wide text-center md:text-right w-full md:w-auto self-center">{formErrors.samples}</p>}
        <button 
            type="button"
            onClick={handleSavePending}
            disabled={isSubmitting} 
            className="w-full md:w-auto px-8 py-4 bg-amber-500 hover:bg-amber-600 text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95"
        >
          {isSubmitting ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-clock"></i>}
          <span>Salvar como Pendente</span>
        </button>
        <button 
            type="button"
            onClick={handleFinalize}
            disabled={isSubmitting} 
            className="w-full md:w-auto px-12 py-4 bg-teal-800 hover:bg-teal-900 text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95"
        >
          {isSubmitting ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-check-double"></i>}
          <span>Finalizar Análise</span>
        </button>
      </div>

      {/* Modal for Finalizing Sample */}
      {sampleToFinalize !== null && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl max-w-sm w-full animate-fadeIn">
            <h3 className="text-lg font-black text-teal-900 mb-2 uppercase tracking-wider">Finalizar Amostra {sampleToFinalize + 1}</h3>
            <p className="text-xs text-gray-600 dark:text-gray-300 mb-6 font-medium">Insira seu nome para assinar e bloquear esta amostra contra edições futuras.</p>
            <input 
              value={analystNameInput} 
              onChange={e => setAnalystNameInput(e.target.value)} 
              placeholder="Nome do Analista"
              className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-xl mb-6 focus:ring-2 focus:ring-teal-500 outline-none font-bold text-sm"
              autoFocus
            />
            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => setSampleToFinalize(null)} className="px-4 py-2 text-gray-500 font-bold hover:bg-gray-100 dark:bg-gray-700 rounded-xl transition-colors text-xs uppercase tracking-wider">Cancelar</button>
              <button type="button" onClick={confirmFinalizeSample} disabled={!analystNameInput.trim()} className="px-6 py-2 bg-teal-600 text-white font-black uppercase tracking-wider rounded-xl hover:bg-teal-700 disabled:opacity-50 transition-colors text-xs">Confirmar</button>
            </div>
          </div>
        </div>
      )}
    </form>
  );
};

export default PhysicochemicalAnalysisForm;
