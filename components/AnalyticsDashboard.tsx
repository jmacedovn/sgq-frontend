import React, { useState, useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../lib/db';
import { FORMS_CONFIG } from '../constants';
import { User } from '../types';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell
} from 'recharts';

interface AnalyticsDashboardProps {
  onBack: () => void;
  currentUser: User;
}

type FilterType = 'day' | 'month' | 'year';

const COLORS = ['#E3851B', '#14b8a6', '#8b5cf6', '#ec4899', '#f43f5e', '#f59e0b', '#10b981', '#3b82f6'];

const getTickStep = (max: number) => {
  if (max <= 0.1) return 0.01;
  if (max <= 0.2) return 0.02;
  if (max <= 0.5) return 0.05;
  if (max <= 2) return 0.2;
  if (max <= 5) return 0.5;
  if (max <= 25) return 1;
  if (max <= 50) return 5;
  return 10;
};

const getYAxisConfig = (data: any[], keyOrKeys: string | string[], fallbackMax = 5) => {
  if (!data || data.length === 0) {
    const step = getTickStep(fallbackMax);
    const ticks = [];
    for (let i = 0; i <= fallbackMax; i += step) {
      ticks.push(parseFloat(i.toFixed(4)));
    }
    return { domain: [0, fallbackMax] as [number, number], ticks };
  }

  const keys = Array.isArray(keyOrKeys) ? keyOrKeys : [keyOrKeys];
  let max = 0;
  let min = 0;
  data.forEach(d => {
    keys.forEach(k => {
      const val = parseFloat(d[k]);
      if (!isNaN(val)) {
        if (val > max) max = val;
        if (val < min) min = val;
      }
    });
  });

  if (max === 0 && min === 0) {
    max = fallbackMax;
  }

  const start = min < 0 ? Math.floor(min / 10) * 10 : 0;
  const rangeMax = max - start;
  const step = getTickStep(rangeMax);
  const ceiling = start + Math.ceil(rangeMax / step) * step;

  const ticks = [];
  for (let i = start; i <= ceiling + (step / 2); i += step) {
    ticks.push(parseFloat(i.toFixed(4)));
  }

  return {
    domain: [start, parseFloat(ceiling.toFixed(4))] as [number, number],
    ticks
  };
};

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ onBack, currentUser }) => {
  const [filterType, setFilterType] = useState<FilterType>('month');
  const [selectedFruit, setSelectedFruit] = useState<string>('TODOS');
  const [selectedDate, setSelectedDate] = useState(() => {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  });

  // Fetch all records for the period
  const records = useLiveQuery(() => {
    let start: string, end: string;
    const [y, m, d] = selectedDate.split('-').map(Number);
    
    if (filterType === 'day') {
      start = new Date(y, m - 1, d, 0, 0, 0).toISOString();
      end = new Date(y, m - 1, d, 23, 59, 59, 999).toISOString();
    } else if (filterType === 'month') {
      start = new Date(y, m - 1, 1, 0, 0, 0).toISOString();
      end = new Date(y, m, 0, 23, 59, 59, 999).toISOString();
    } else {
      start = new Date(y, 0, 1, 0, 0, 0).toISOString();
      end = new Date(y, 11, 31, 23, 59, 59, 999).toISOString();
    }
    
    return db.records.where('timestamp').between(start, end).toArray();
  }, [filterType, selectedDate]);

  // --- Calculations ---
  
  const isLoading = !records;
  
  // Helper to extract fruit/product name from record data
  const getRecordFruit = (r: any): string => {
    const data = r.data || {};
    const header = data.header || {};
    const inputs = data.inputs || {};
    
    // Check various common field names for fruit/product
    const fruta = header.fruta || data.fruta || inputs.fruta || header.produto || data.produto || inputs.produto || '';
    return fruta.toUpperCase().trim();
  };

  const matchesFruit = (record: any, target: string): boolean => {
    if (target === 'TODOS') return true;
    const fruta = getRecordFruit(record);
    // Partial match: e.g. "MANGA ROSA" contains "MANGA"
    return fruta.indexOf(target) !== -1;
  };

  // Filter records by fruit if not 'TODOS'
  const safeRecords = useMemo(() => {
    if (!records) return [];
    if (selectedFruit === 'TODOS') return records;
    
    return records.filter(r => matchesFruit(r, selectedFruit));
  }, [records, selectedFruit]);

  const totalForms = safeRecords.length;
  const pendingForms = safeRecords.filter(r => r.data?.status === 'pending').length;
  const completedForms = totalForms - pendingForms;
  
  // Analysis Comparison (pH, Acidez, Cor)
  const analysisComparisonData = useMemo(() => {
    const physChem = safeRecords.filter(r => r.form_type === 'physical-chemical-analysis');
    const dataPoints: any[] = [];

    physChem.forEach(r => {
      const rows = r.data?.rows || [];
      const phVal = rows.find((row: any) => row.parameter === 'pH')?.average || '';
      const acidezVal = rows.find((row: any) => row.parameter === 'Acidez (%)')?.average || '';
      const corLVal = rows.find((row: any) => row.parameter === 'Cor (L)')?.average || '';
      const corAVal = rows.find((row: any) => row.parameter === 'Cor (a)')?.average || '';
      const corBVal = rows.find((row: any) => row.parameter === 'Cor (b)')?.average || '';

      const ph = parseFloat(phVal.replace(',', '.'));
      const acidez = parseFloat(acidezVal.replace(',', '.'));
      const corL = parseFloat(corLVal.replace(',', '.'));
      const corA = parseFloat(corAVal.replace(',', '.'));
      const corB = parseFloat(corBVal.replace(',', '.'));

      if (!isNaN(ph) || !isNaN(acidez) || !isNaN(corL) || !isNaN(corA) || !isNaN(corB)) {
        dataPoints.push({
          time: new Date(r.timestamp).toLocaleDateString([], {day: '2-digit', month: '2-digit'}) + ' ' + new Date(r.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
          timestamp: new Date(r.timestamp).getTime(),
          ph: isNaN(ph) ? null : ph,
          acidez: isNaN(acidez) ? null : acidez,
          corL: isNaN(corL) ? null : corL,
          corA: isNaN(corA) ? null : corA,
          corB: isNaN(corB) ? null : corB,
          lote: r.data?.header?.lote || 'N/A'
        });
      }
    });

    return dataPoints.sort((a, b) => a.timestamp - b.timestamp);
  }, [safeRecords]);

  // Brix Averages (Line Chart)
  const brixData = useMemo(() => {
    const physChem = safeRecords.filter(r => r.form_type === 'physical-chemical-analysis');
    const dataPoints: any[] = [];

    physChem.forEach(r => {
      const brixRow = r.data?.rows?.find((row: any) => row.parameter === '°Brix Corrigido');
      const produto = (r.data?.header?.produto || r.data?.produto || '').toUpperCase();
      
      if (brixRow && brixRow.average) {
        const val = parseFloat(brixRow.average.replace(',', '.'));
        if (!isNaN(val)) {
          dataPoints.push({
            time: new Date(r.timestamp).toLocaleDateString() + ' ' + new Date(r.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
            brix: val,
            lote: r.data?.header?.lote || 'N/A',
            isIntegral: produto.includes('INTEGRAL'),
            isConcentrado: produto.includes('CONCENTRADO')
          });
        }
      }
    });

    return dataPoints.sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
  }, [safeRecords]);

  const brixIntegralData = useMemo(() => brixData.filter(d => d.isIntegral), [brixData]);
  const brixConcentradoData = useMemo(() => brixData.filter(d => d.isConcentrado), [brixData]);

  // KPI: Brix Fruta Fresca (from fruit-intake)
  const brixFrutaFrescaData = useMemo(() => {
    const intakeRecords = safeRecords.filter(r => r.form_type === 'fruit-intake');
    const dataPoints: any[] = [];

    intakeRecords.forEach(r => {
      const charges = r.data?.charges || [];
      charges.forEach((charge: any) => {
        const samples = charge.samples || [];
        samples.forEach((sample: any) => {
          if (sample.brix) {
            const val = parseFloat(sample.brix.replace(',', '.'));
            if (!isNaN(val)) {
              dataPoints.push({
                time: new Date(r.timestamp).toLocaleDateString() + ' ' + new Date(r.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
                timestamp: new Date(r.timestamp).getTime(),
                brix: val,
                placa: charge.placa || 'N/A'
              });
            }
          }
        });
      });
    });

    return dataPoints.sort((a, b) => a.timestamp - b.timestamp);
  }, [safeRecords]);

  const avgBrixFrutaFresca = useMemo(() => {
    if (brixFrutaFrescaData.length === 0) return 0;
    const sum = brixFrutaFrescaData.reduce((acc, curr) => acc + curr.brix, 0);
    return sum / brixFrutaFrescaData.length;
  }, [brixFrutaFrescaData]);

  // Data processing for Resíduo Mineral Chart (Manga only)
  const residuoMineralData = useMemo(() => {
    const allRecords = records || [];
    const mangaAnalysis = allRecords.filter(r => 
      r.form_type === 'physical-chemical-analysis' && 
      matchesFruit(r, 'MANGA')
    );
    
    const dataPoints: any[] = [];

    mangaAnalysis.forEach(r => {
      const row = r.data?.rows?.find((row: any) => row.parameter === 'Resíduos Minerais - Areia (g/kg)');
      if (row && row.average) {
        const val = parseFloat(row.average.replace(',', '.'));
        if (!isNaN(val)) {
          dataPoints.push({
            time: new Date(r.timestamp).toLocaleDateString([], {day: '2-digit', month: '2-digit'}) + ' ' + new Date(r.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
            timestamp: new Date(r.timestamp).getTime(),
            valor: val,
            lote: r.data?.header?.lote || 'N/A'
          });
        }
      }
    });

    return dataPoints.sort((a, b) => a.timestamp - b.timestamp);
  }, [records]);

  const residuoMineralManga = useMemo(() => {
    if (residuoMineralData.length === 0) return 0;
    const sum = residuoMineralData.reduce((acc, curr) => acc + curr.valor, 0);
    return sum / residuoMineralData.length;
  }, [residuoMineralData]);

  // Data processing for Pontos (Pretos e Marrons) Chart
  const pontosChartData = useMemo(() => {
    const allRecords = records || [];
    const targetAnalysis = allRecords.filter(r => 
      r.form_type === 'physical-chemical-analysis'
    );

    const dataPoints: any[] = [];

    targetAnalysis.forEach(r => {
      const rowMarrons = r.data?.rows?.find((row: any) => row.parameter === 'Pontos Marrons');
      const rowPretos = r.data?.rows?.find((row: any) => row.parameter === 'Pontos Pretos');
      
      let valMarrons = NaN;
      let valPretos = NaN;
      
      if (rowMarrons && rowMarrons.average) valMarrons = parseFloat(rowMarrons.average.replace(',', '.'));
      if (rowPretos && rowPretos.average) valPretos = parseFloat(rowPretos.average.replace(',', '.'));

      if (!isNaN(valMarrons) || !isNaN(valPretos)) {
        dataPoints.push({
          time: new Date(r.timestamp).toLocaleDateString([], {day: '2-digit', month: '2-digit'}) + ' ' + new Date(r.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
          timestamp: new Date(r.timestamp).getTime(),
          pontosMarrons: isNaN(valMarrons) ? null : valMarrons,
          pontosPretos: isNaN(valPretos) ? null : valPretos,
          lote: r.data?.header?.lote || 'N/A',
          fruta: getRecordFruit(r)
        });
      }
    });

    return dataPoints.sort((a, b) => a.timestamp - b.timestamp);
  }, [records]);

  const pontosMarronsAvg = useMemo(() => {
    const validData = pontosChartData.filter(d => d.pontosMarrons !== null && d.pontosMarrons !== undefined);
    if (validData.length === 0) return 0;
    const sum = validData.reduce((acc, curr) => acc + curr.pontosMarrons, 0);
    return sum / validData.length;
  }, [pontosChartData]);


  const pieData = [
    { name: 'Concluídos', value: completedForms, color: '#10b981' },
    { name: 'Pendentes', value: pendingForms, color: '#f59e0b' }
  ];

  // Global Brix Average
  const avgBrix = useMemo(() => {
    if (brixData.length === 0) return 0;
    const sum = brixData.reduce((acc, curr) => acc + curr.brix, 0);
    return sum / brixData.length;
  }, [brixData]);

  // Handle Input Changes
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;
    if (filterType === 'month') {
        const [year, month] = val.split('-');
        setSelectedDate(`${year}-${month}-01`);
    } else if (filterType === 'year') {
        setSelectedDate(`${val}-01-01`);
    } else {
        setSelectedDate(val);
    }
  };


  const getInputValue = () => {
    if (!selectedDate) return '';
    
    // Return the string directly to avoid UTC shift issues with new Date()
    if (filterType === 'month') return selectedDate.substring(0, 7);
    if (filterType === 'year') return selectedDate.substring(0, 4);
    return selectedDate;
  };

  return (
    <div className="space-y-6 md:space-y-8 animate-fadeIn max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 dark:border-gray-700 pb-6">
        <div className="flex items-center gap-4">
            <button 
                onClick={onBack}
                className="w-10 h-10 flex items-center justify-center bg-white dark:bg-gray-800 rounded-full shadow-sm border border-gray-100 dark:border-gray-700 text-gray-400 hover:text-[#E3851B] transition-colors"
                title="Voltar"
            >
                <i className="fas fa-arrow-left"></i>
            </button>
            <div>
              <h2 className="text-2xl md:text-3xl font-black text-[#1A2B34] dark:text-white tracking-tight flex items-center gap-3">
                <i className="fas fa-chart-area text-[#E3851B]"></i> Estatísticas
              </h2>
              <p className="text-gray-500 mt-1 font-medium text-sm">Dashboard Gerencial</p>
            </div>
        </div>
        
        {/* Filters */}
        <div className="flex flex-col sm:flex-row items-end sm:items-center gap-3 bg-white dark:bg-gray-800 p-3 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
           
           <div className="flex items-center gap-2 mr-2 pr-4 border-r border-gray-100 dark:border-gray-700">
              <i className="fas fa-filter text-[10px] text-gray-400"></i>
              <select 
                value={selectedFruit}
                onChange={(e) => setSelectedFruit(e.target.value)}
                className="bg-transparent text-[10px] font-black uppercase tracking-widest text-[#E3851B] focus:outline-none cursor-pointer"
              >
                <option value="TODOS">Todas as Frutas</option>
                <option value="MANGA">Manga</option>
                <option value="GOIABA">Goiaba</option>
                <option value="CANA">Cana</option>
                <option value="MARACUJÁ">Maracujá</option>
                <option value="MELANCIA">Melancia</option>
                <option value="ABACAXI">Abacaxi</option>
              </select>
           </div>

           <div className="flex bg-gray-100 dark:bg-gray-700 p-1 rounded-xl">
              {[
                  { id: 'day', label: 'Diário' },
                  { id: 'month', label: 'Mensal' },
                  { id: 'year', label: 'Anual' }
              ].map(opt => (
                <button
                   key={opt.id}
                   onClick={() => setFilterType(opt.id as FilterType)}
                   className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${filterType === opt.id ? 'bg-white dark:bg-gray-800 text-[#E3851B] shadow-sm' : 'text-gray-400'}`}
                >
                   {opt.label}
                </button>
              ))}
           </div>
           
           <input 
              type={filterType === 'month' ? "month" : filterType === 'year' ? "number" : "date"}
              value={getInputValue()}
              onChange={handleDateChange}
              min={filterType === 'year' ? "2020" : undefined}
              className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2 text-sm font-bold text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-[#E3851B]"
           />
        </div>
      </div>

      {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <i className="fas fa-spinner fa-spin text-4xl text-[#E3851B]"></i>
          </div>
      ) : (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
                <div className="bg-white dark:bg-gray-800 p-5 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 relative overflow-hidden">
                   <h5 className="text-[9px] font-black uppercase tracking-widest text-[#E3851B] mb-2 leading-tight">Total Lançamentos</h5>
                   <p className="text-3xl font-black text-gray-800 dark:text-gray-100">{totalForms}</p>
                </div>
                
                <div className="bg-white dark:bg-gray-800 p-5 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 relative overflow-hidden">
                   <h5 className="text-[9px] font-black uppercase tracking-widest text-emerald-500 mb-2 leading-tight">Média Brix Corrigido</h5>
                   <div className="flex items-end gap-1">
                      <p className="text-3xl font-black text-gray-800 dark:text-gray-100">{avgBrix.toFixed(2).replace('.', ',')}</p>
                      <span className="text-[8px] font-bold text-gray-400 mb-1">°Bx</span>
                   </div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-5 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 relative overflow-hidden">
                   <h5 className="text-[9px] font-black uppercase tracking-widest text-blue-500 mb-2 leading-tight">Brix Fruta Fresca</h5>
                   <div className="flex items-end gap-1">
                      <p className="text-3xl font-black text-gray-800 dark:text-gray-100">{avgBrixFrutaFresca.toFixed(2).replace('.', ',')}</p>
                      <span className="text-[8px] font-bold text-gray-400 mb-1">°Bx</span>
                   </div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-5 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 relative overflow-hidden">
                   <h5 className="text-[9px] font-black uppercase tracking-widest text-purple-500 mb-2 leading-tight">Resíduo Mineral (Manga)</h5>
                   <div className="flex items-end gap-1">
                      <p className="text-3xl font-black text-gray-800 dark:text-gray-100">{residuoMineralManga.toFixed(4).replace('.', ',')}</p>
                      <span className="text-[8px] font-bold text-gray-400 mb-1">g/kg</span>
                   </div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-5 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 relative overflow-hidden">
                   <h5 className="text-[9px] font-black uppercase tracking-widest text-rose-500 mb-2 leading-tight">Pontos Marrons (M/G)</h5>
                   <div className="flex items-end gap-1">
                      <p className="text-3xl font-black text-gray-800 dark:text-gray-100 font-mono">{pontosMarronsAvg.toFixed(1).replace('.', ',')}</p>
                      <span className="text-[8px] font-bold text-gray-400 mb-1">Und</span>
                   </div>
                </div>
                
                <div className="bg-white dark:bg-gray-800 p-5 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 relative overflow-hidden">
                   <h5 className="text-[9px] font-black uppercase tracking-widest text-emerald-500 mb-2 leading-tight">Finalizados</h5>
                   <p className="text-3xl font-black text-gray-800 dark:text-gray-100">{completedForms}</p>
                </div>
                
                <div className="bg-white dark:bg-gray-800 p-5 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 relative overflow-hidden">
                   <h5 className="text-[9px] font-black uppercase tracking-widest text-amber-500 mb-2 leading-tight">Pendentes</h5>
                   <p className="text-3xl font-black text-gray-800 dark:text-gray-100">{pendingForms}</p>
                </div>
            </div>


            {/* Charts Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                
                {/* Brix Fruta Fresca Chart */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 xl:col-span-2">
                    <h5 className="text-[10px] font-black uppercase tracking-widest text-[#E3851B] mb-6 flex items-center gap-2">
                        <i className="fas fa-truck-moving text-[#E3851B]"></i> Brix Fruta Fresca (Caminhão)
                    </h5>
                    <div className="h-[300px] w-full">
                        {brixFrutaFrescaData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={brixFrutaFrescaData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                    <XAxis dataKey="time" tick={{ fontSize: 10, fill: '#9ca3af' }} tickFormatter={(val) => val.split(' ')[1] || val} />
                                    <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} {...getYAxisConfig(brixFrutaFrescaData, 'brix', 10)} />
                                    <Tooltip 
                                        contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                        labelStyle={{ fontSize: '10px', color: '#6b7280', fontWeight: 'bold' }}
                                        formatter={(value: number) => [`${value.toFixed(2)} °Bx`, 'Brix Fruta Fresca']}
                                    />
                                    <Line type="monotone" dataKey="brix" stroke="#E3851B" strokeWidth={3} dot={{ r: 4, fill: '#E3851B', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center text-gray-400 text-xs uppercase font-bold tracking-widest border border-dashed border-gray-200 dark:border-gray-700 rounded-2xl text-center p-8">
                                Sem dados de Entrada de Fruta no Período
                            </div>
                        )}
                    </div>
                </div>

                {/* Resíduo Mineral Chart (Manga) */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 xl:col-span-1">
                    <h5 className="text-[10px] font-black uppercase tracking-widest text-purple-500 mb-6 flex items-center gap-2">
                        <i className="fas fa-microscope text-purple-500"></i> Resíduo Mineral (Manga)
                    </h5>
                    <div className="h-[300px] w-full">
                        {residuoMineralData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={residuoMineralData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                    <XAxis dataKey="time" hide />
                                    <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} {...getYAxisConfig(residuoMineralData, 'valor', 0.1)} />
                                    <Tooltip 
                                        contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '11px' }}
                                        formatter={(value: number) => [`${value.toFixed(4)} g/kg`, 'Resíduo Mineral']}
                                    />
                                    <Line type="monotone" dataKey="valor" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 4 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center text-gray-400 text-[10px] uppercase font-bold tracking-widest border border-dashed border-gray-200 dark:border-gray-700 rounded-2xl text-center p-8">
                                Sem dados de Resíduo Mineral (Manga)
                            </div>
                        )}
                    </div>
                </div>

                {/* Pontos Pretos e Marrons Chart */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 xl:col-span-1">
                    <h5 className="text-[10px] font-black uppercase tracking-widest text-rose-500 mb-6 flex items-center gap-2">
                        <i className="fas fa-circle-dot text-rose-500"></i> Pontos Pretos e Marrons
                    </h5>
                    <div className="h-[300px] w-full">
                        {pontosChartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={pontosChartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                    <XAxis dataKey="time" tick={{ fontSize: 10, fill: '#9ca3af' }} tickFormatter={(val) => val.split(' ')[1] || val} />
                                    <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} {...getYAxisConfig(pontosChartData, ['pontosMarrons', 'pontosPretos'], 10)} />
                                    <Tooltip 
                                        contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '11px' }}
                                        formatter={(value: number, name: string) => [`${value.toFixed(1)}`, name === 'pontosPretos' ? 'Pontos Pretos' : 'Pontos Marrons']}
                                    />
                                    <Line type="monotone" dataKey="pontosMarrons" name="pontosMarrons" stroke="#f43f5e" strokeWidth={3} dot={{ r: 4, fill: '#f43f5e', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
                                    <Line type="monotone" dataKey="pontosPretos" name="pontosPretos" stroke="#1f2937" strokeWidth={3} dot={{ r: 4, fill: '#1f2937', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center text-gray-400 text-[10px] uppercase font-bold tracking-widest border border-dashed border-gray-200 dark:border-gray-700 rounded-2xl text-center p-8">
                                Sem dados de Pontos
                            </div>
                        )}
                    </div>
                </div>

                {/* Brix Integral Chart */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 xl:col-span-1">
                    <h5 className="text-[10px] font-black uppercase tracking-widest text-amber-600 mb-6 flex items-center gap-2">
                        <i className="fas fa-chart-line text-amber-600"></i> Brix Integral
                    </h5>
                    <div className="h-[300px] w-full">
                        {brixIntegralData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={brixIntegralData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                    <XAxis dataKey="time" tick={{ fontSize: 10, fill: '#9ca3af' }} tickFormatter={(val) => val.split(' ')[1] || val} />
                                    <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} {...getYAxisConfig(brixIntegralData, 'brix', 10)} />
                                    <Tooltip 
                                        contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                        labelStyle={{ fontSize: '10px', color: '#6b7280', fontWeight: 'bold' }}
                                        formatter={(value: number) => [`${value.toFixed(2)} °Bx`, 'Brix Integral']}
                                    />
                                    <Line type="monotone" dataKey="brix" stroke="#d97706" strokeWidth={3} dot={{ r: 4, fill: '#d97706', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center text-gray-400 text-xs uppercase font-bold tracking-widest border border-dashed border-gray-200 dark:border-gray-700 rounded-2xl text-center p-8">
                                Sem Dados de Integral
                            </div>
                        )}
                    </div>
                </div>

                {/* Brix Concentrado Chart */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 xl:col-span-1">
                    <h5 className="text-[10px] font-black uppercase tracking-widest text-[#0d9488] mb-6 flex items-center gap-2">
                        <i className="fas fa-chart-line text-[#0d9488]"></i> Brix Concentrado
                    </h5>
                    <div className="h-[300px] w-full">
                        {brixConcentradoData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={brixConcentradoData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                    <XAxis dataKey="time" tick={{ fontSize: 10, fill: '#9ca3af' }} tickFormatter={(val) => val.split(' ')[1] || val} />
                                    <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} {...getYAxisConfig(brixConcentradoData, 'brix', 10)} />
                                    <Tooltip 
                                        contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                        labelStyle={{ fontSize: '10px', color: '#6b7280', fontWeight: 'bold' }}
                                        formatter={(value: number) => [`${value.toFixed(2)} °Bx`, 'Brix Concentrado']}
                                    />
                                    <Line type="monotone" dataKey="brix" stroke="#0d9488" strokeWidth={3} dot={{ r: 4, fill: '#0d9488', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center text-gray-400 text-xs uppercase font-bold tracking-widest border border-dashed border-gray-200 dark:border-gray-700 rounded-2xl text-center p-8">
                                Sem Dados de Concentrado
                            </div>
                        )}
                    </div>
                </div>

                {/* Status Pie Chart */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <h5 className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-6">Status dos Registros</h5>
                    <div className="h-[250px] w-full flex items-center justify-center">
                        {totalForms > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={pieData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        {pieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                                    <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 'bold' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                             <div className="text-gray-400 text-xs uppercase font-bold tracking-widest">Sem Dados</div>
                        )}
                    </div>
                </div>

                {/* pH Analysis Chart */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <h5 className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-6 flex items-center gap-2">
                        <i className="fas fa-eye-dropper text-red-500"></i> Monitoramento de pH
                    </h5>
                    <div className="h-[250px] w-full">
                        {analysisComparisonData.length > 0 ? (
                             <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={analysisComparisonData} margin={{ top: 5, right: 10, bottom: 20, left: -20 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                    <XAxis dataKey="time" hide />
                                    <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} {...getYAxisConfig(analysisComparisonData, 'ph', 5)} />
                                    <Tooltip 
                                        contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '11px' }}
                                    />
                                    <Line type="monotone" dataKey="ph" name="pH" stroke="#ef4444" strokeWidth={2} dot={{ r: 3 }} />
                                </LineChart>
                             </ResponsiveContainer>
                        ) : (
                             <div className="h-full flex items-center justify-center text-gray-400 text-[10px] uppercase font-bold tracking-widest border border-dashed border-gray-200 dark:border-gray-700 rounded-2xl text-center p-4">
                                Sem dados de pH
                            </div>
                        )}
                    </div>
                </div>

                {/* Acidez Analysis Chart */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <h5 className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-6 flex items-center gap-2">
                        <i className="fas fa-percentage text-blue-500"></i> Monitoramento de Acidez
                    </h5>
                    <div className="h-[250px] w-full">
                        {analysisComparisonData.length > 0 ? (
                             <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={analysisComparisonData} margin={{ top: 5, right: 10, bottom: 20, left: -20 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                    <XAxis dataKey="time" hide />
                                    <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} {...getYAxisConfig(analysisComparisonData, 'acidez', 1)} />
                                    <Tooltip 
                                        contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '11px' }}
                                    />
                                    <Line type="monotone" dataKey="acidez" name="Acidez (%)" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} />
                                </LineChart>
                             </ResponsiveContainer>
                        ) : (
                             <div className="h-full flex items-center justify-center text-gray-400 text-[10px] uppercase font-bold tracking-widest border border-dashed border-gray-200 dark:border-gray-700 rounded-2xl text-center p-4">
                                Sem dados de Acidez
                            </div>
                        )}
                    </div>
                </div>

                {/* Cor Analysis Chart */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <h5 className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-6 flex items-center gap-2">
                        <i className="fas fa-palette text-purple-500"></i> Monitoramento de Cor Hunter (L, a, b)
                    </h5>
                    <div className="h-[250px] w-full">
                        {analysisComparisonData.length > 0 ? (
                             <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={analysisComparisonData} margin={{ top: 5, right: 10, bottom: 20, left: -20 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                    <XAxis dataKey="time" hide />
                                    <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} {...getYAxisConfig(analysisComparisonData, ['corL', 'corA', 'corB'], 50)} />
                                    <Tooltip 
                                        contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '11px' }}
                                    />
                                    <Line type="monotone" dataKey="corL" name="Cor (L)" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 3 }} />
                                    <Line type="monotone" dataKey="corA" name="Cor (a)" stroke="#f43f5e" strokeWidth={2} dot={{ r: 3 }} />
                                    <Line type="monotone" dataKey="corB" name="Cor (b)" stroke="#eab308" strokeWidth={2} dot={{ r: 3 }} />
                                </LineChart>
                             </ResponsiveContainer>
                        ) : (
                             <div className="h-full flex items-center justify-center text-gray-400 text-[10px] uppercase font-bold tracking-widest border border-dashed border-gray-200 dark:border-gray-700 rounded-2xl text-center p-4">
                                Sem dados de Cor
                            </div>
                        )}
                    </div>
                </div>

            </div>
          </>
      )}
    </div>
  );
};

export default AnalyticsDashboard;
