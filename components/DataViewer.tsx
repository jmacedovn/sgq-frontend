
import React, { useState, useEffect, useMemo } from 'react';
import QRCode from 'qrcode';
import { FORMS_CONFIG } from '../constants';
import { FormType, User } from '../types';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../lib/db';
import { syncService } from '../lib/sync';
import { isAdminRole } from '../lib/roles';

interface DataViewerProps {
  onBack: () => void;
  onEdit: (record: any) => void;
  onExport?: () => void; 
  currentUser: User;
  batchLookupCode?: string | null;
  onBatchLookupHandled?: () => void;
}

const buildBatchTraceUrl = (code: string) => {
  const url = new URL(window.location.origin + window.location.pathname);
  url.searchParams.set('lote', code);
  return url.toString();
};

const DataViewer: React.FC<DataViewerProps> = ({ onBack, onEdit, onExport, currentUser, batchLookupCode, onBatchLookupHandled }) => {
  const [records, setRecords] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [filterType, setFilterType] = useState<string>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;
  
  const [selectedRecord, setSelectedRecord] = useState<any | null>(null);
  const [qrCodeImg, setQrCodeImg] = useState<string>('');

  useEffect(() => {
    fetchRecords();
  }, [filterType]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filterType, searchTerm, startDate, endDate]);

  useEffect(() => {
    if (!batchLookupCode) return;
    setFilterType(FormType.BATCH_GENERATION);
    setSearchTerm(batchLookupCode);
    setStartDate('');
    setEndDate('');
    setCurrentPage(1);
  }, [batchLookupCode]);

  useEffect(() => {
    if (selectedRecord && selectedRecord.form_type === FormType.BATCH_GENERATION && selectedRecord.data?.generatedCode) {
      QRCode.toDataURL(buildBatchTraceUrl(selectedRecord.data.generatedCode), {
        width: 256,
        margin: 2,
        color: { dark: '#4c1d95', light: '#ffffff' }
      }).then(setQrCodeImg).catch(err => {
        console.error('Error generating QR for report:', err);
        setQrCodeImg('');
      });
    } else {
      setQrCodeImg('');
    }
  }, [selectedRecord]);

  const liveRecords = useLiveQuery(
    () => {
      if (filterType === 'all') {
        return db.records.orderBy('timestamp').reverse().toArray();
      } else {
        return db.records.where('form_type').equals(filterType).reverse().sortBy('timestamp');
      }
    },
    [filterType],
    []
  );

  useEffect(() => {
    if (liveRecords) {
      setRecords(liveRecords);
      setIsLoading(false);
    }
  }, [liveRecords]);

  const fetchRecords = async () => {
    // Now handled by useLiveQuery
  };

  const filteredRecords = useMemo(() => {
    return records.filter(record => {
      const formConfig = FORMS_CONFIG.find(f => f.type === record.form_type);
      const dataString = JSON.stringify(record.data).toLowerCase();
      
      const matchesSearch = 
        formConfig?.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.form_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dataString.includes(searchTerm.toLowerCase());

      const recordDate = new Date(record.timestamp).toISOString().split('T')[0];
      const matchesStartDate = !startDate || recordDate >= startDate;
      const matchesEndDate = !endDate || recordDate <= endDate;
      const isNotPending = record.data?.status !== 'pending';

      return matchesSearch && matchesStartDate && matchesEndDate && isNotPending;
    });
  }, [records, searchTerm, startDate, endDate]);

  useEffect(() => {
    if (!batchLookupCode || records.length === 0) return;

    const normalizedLookup = batchLookupCode.trim().toLowerCase();
    const matchingRecord = records.find(record =>
      record.form_type === FormType.BATCH_GENERATION &&
      record.data?.generatedCode?.toLowerCase() === normalizedLookup
    );

    if (matchingRecord) {
      setSelectedRecord(matchingRecord);
      onBatchLookupHandled?.();
    }
  }, [batchLookupCode, records, onBatchLookupHandled]);

  const totalPages = Math.ceil(filteredRecords.length / itemsPerPage);
  const currentRecords = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredRecords.slice(start, start + itemsPerPage);
  }, [filteredRecords, currentPage, itemsPerPage]);

  const stats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return {
      total: filteredRecords.length,
      today: filteredRecords.filter(r => new Date(r.timestamp).toISOString().split('T')[0] === today).length
    };
  }, [filteredRecords]);

  const getFormInfo = (type: string) => {
    return FORMS_CONFIG.find(f => f.type === type) || { title: type, color: 'bg-gray-50 dark:bg-gray-900/500', icon: 'fa-file', code: '---' };
  };

  const deleteRecord = async (id: string, formType: string) => {
    if (confirm('Deseja realmente excluir este registro permanentemente?')) {
      try {
        await syncService.deleteRecord(id);
      } catch (error) {
        console.error('Erro ao excluir registro:', error);
      }
    }
  };

  const formatKey = (key: string) => key.replace(/_/g, ' ').toUpperCase();

  const formatDateSafely = (dateStr: string) => {
    if (!dateStr) return '---';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return '---';
      return d.toLocaleDateString('pt-BR');
    } catch (e) {
      return '---';
    }
  };

  const renderMicrobiologicalAnalysisTable = (rows: any[]) => {
    return (
      <div className="mb-8 overflow-hidden rounded-xl border border-gray-200 dark:border-gray-600 shadow-lg">
        <div className="bg-fuchsia-800 px-6 py-4">
          <h4 className="text-white font-black text-xs uppercase tracking-[0.2em]">CONTROLE MICROBIOLÓGICO</h4>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[11px] border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-600 text-gray-500 font-black uppercase tracking-widest">
                <th className="px-6 py-4 border-r">PARÂMETRO</th>
                <th className="px-4 py-4 border-r text-center">AMOSTRA 1</th>
                <th className="px-4 py-4 border-r text-center">AMOSTRA 2</th>
                <th className="px-4 py-4 border-r text-center">AMOSTRA 3</th>
                <th className="px-4 py-4 text-center">DATA RESULTADO</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rows.map((row, idx) => (
                <tr key={idx} className="hover:bg-fuchsia-50/20 transition-colors">
                  <td className="px-6 py-3 border-r font-bold text-gray-700 dark:text-gray-200">{row.parameter || '---'}</td>
                  <td className="px-4 py-3 border-r text-center font-black text-gray-800 dark:text-gray-100">{row.sample1 || '---'}</td>
                  <td className="px-4 py-3 border-r text-center font-black text-gray-800 dark:text-gray-100">{row.sample2 || '---'}</td>
                  <td className="px-4 py-3 border-r text-center font-black text-gray-800 dark:text-gray-100">{row.sample3 || '---'}</td>
                  <td className="px-4 py-3 text-center text-gray-500">{formatDateSafely(row.resultDate1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderPhysicochemicalAnalysisTable = (rows: any[], sampleCount: number) => {
    return (
      <div className="mb-8 overflow-hidden rounded-xl border border-gray-200 dark:border-gray-600 shadow-lg">
        <div className="bg-teal-800 px-6 py-4">
          <h4 className="text-white font-black text-xs uppercase tracking-[0.2em]">RESULTADOS FÍSICO-QUÍMICOS</h4>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[11px] border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-600 text-gray-500 font-black uppercase tracking-widest">
                <th className="px-6 py-4 border-r">PARÂMETRO</th>
                {Array.from({ length: sampleCount }).map((_, i) => (
                  <th key={i} className="px-4 py-4 border-r text-center">AMOSTRA {i + 1}</th>
                ))}
                <th className="px-4 py-4 text-center bg-teal-50">MÉDIA</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rows.map((row, idx) => (
                <tr key={idx} className="hover:bg-teal-50/20 transition-colors">
                  <td className="px-6 py-3 border-r font-bold text-gray-700 dark:text-gray-200">{row.parameter || '---'}</td>
                  {Array.from({ length: sampleCount }).map((_, i) => (
                    <td key={i} className="px-4 py-3 border-r text-center">{row.values?.[i] || '---'}</td>
                  ))}
                  <td className="px-4 py-3 text-center font-black text-teal-800 bg-teal-50/50">{row.average || '---'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderFruitIntakeTable = (charges: any[]) => {
    return (
      <div className="mb-8 overflow-hidden rounded-xl border border-gray-200 dark:border-gray-600 shadow-lg">
        <div className="bg-green-700 px-6 py-4">
          <h4 className="text-white font-black text-xs uppercase tracking-[0.2em]">RESUMO DE CARGAS</h4>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[11px] border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-600 text-gray-500 font-black uppercase tracking-widest">
                <th className="px-6 py-4 border-r">N° DA CARGA</th>
                <th className="px-6 py-4 border-r">PLACA</th>
                <th className="px-6 py-4 border-r">N° GUIA</th>
                <th className="px-6 py-4 border-r text-center">MÉDIA °BRIX</th>
                <th className="px-6 py-4 text-center">VISTO</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {charges.map((charge, idx) => {
                const avgBrix = charge.samples?.[2]?.media || '---';
                return (
                  <tr key={idx} className="hover:bg-green-50/10 transition-colors">
                    <td className="px-6 py-3 border-r font-black text-gray-800 dark:text-gray-100">{charge.cargaNo || '---'}</td>
                    <td className="px-6 py-3 border-r font-bold text-gray-600 dark:text-gray-300 uppercase">{charge.placa || '---'}</td>
                    <td className="px-6 py-3 border-r font-medium text-gray-500">{charge.nGuia || charge.guia || '---'}</td>
                    <td className="px-6 py-3 border-r text-center font-black text-green-700">{avgBrix}</td>
                    <td className="px-6 py-3 text-center italic text-gray-400 font-bold uppercase">{charge.visto || '---'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderProductionMonitoringTable = (rows: any[]) => {
    return (
      <div className="mb-8 overflow-hidden rounded-xl border border-gray-200 dark:border-gray-600 shadow-lg">
        <div className="bg-pink-700 px-6 py-4">
          <h4 className="text-white font-black text-xs uppercase tracking-[0.2em]">MONITORAMENTO ANALÍTICO</h4>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[11px] border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-600 text-gray-500 font-black uppercase tracking-widest">
                <th className="px-6 py-4 border-r">HORÁRIO</th>
                <th className="px-6 py-4 border-r">EQUIPAMENTO</th>
                <th className="px-6 py-4 border-r text-center">°BRIX</th>
                <th className="px-6 py-4 border-r text-center">PH</th>
                <th className="px-6 py-4 border-r text-center">PM</th>
                <th className="px-6 py-4 border-r text-center">PP</th>
                <th className="px-6 py-4 text-center">VISTO</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rows.map((row, idx) => (
                <tr key={idx} className="hover:bg-pink-50/20 transition-colors">
                  <td className="px-6 py-3 border-r font-black text-[#1A2B34]">{row.horario || '---'}</td>
                  <td className="px-6 py-3 border-r font-bold text-gray-600 dark:text-gray-300">{row.equipamento || '---'}</td>
                  <td className="px-6 py-3 border-r text-center font-black text-pink-700">{row.brix || '---'}</td>
                  <td className="px-6 py-3 border-r text-center">{row.ph || '---'}</td>
                  <td className="px-6 py-3 border-r text-center">{row.pontosMarrons || '---'}</td>
                  <td className="px-6 py-3 border-r text-center">{row.pontosPretos || '---'}</td>
                  <td className="px-6 py-3 text-center uppercase text-[10px] font-bold">{row.visto || '---'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderAirCurtainInspectionTable = (rows: any[]) => {
    return (
      <div className="mb-8 overflow-hidden rounded-xl border border-gray-200 dark:border-gray-600 shadow-lg">
        <div className="bg-sky-700 px-6 py-4">
          <h4 className="text-white font-black text-xs uppercase tracking-[0.2em]">INSPEÇÃO DE CORTINAS DE AR</h4>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[10px] border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-600 text-gray-500 font-black uppercase tracking-widest">
                <th className="px-4 py-4 border-r">DATA</th>
                <th className="px-2 py-4 border-r text-center">TURNO</th>
                <th className="px-2 py-4 border-r text-center">ENT. PROD.</th>
                <th className="px-2 py-4 border-r text-center">ASSÉP. A</th>
                <th className="px-2 py-4 border-r text-center">ASSÉP. C</th>
                <th className="px-2 py-4 border-r text-center">ASSÉP. D</th>
                <th className="px-2 py-4 border-r text-center">EVAP. B</th>
                <th className="px-2 py-4 border-r text-center">TAMBORES</th>
                <th className="px-2 py-4 border-r text-center">HIG. TAMB.</th>
                <th className="px-4 py-4 text-center">VISTO</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rows.map((row, idx) => (
                <tr key={idx} className="hover:bg-sky-50/20 transition-colors">
                  <td className="px-4 py-3 border-r font-bold text-gray-700 dark:text-gray-200">{formatDateSafely(row.data)}</td>
                  <td className="px-2 py-3 border-r text-center font-black text-gray-800 dark:text-gray-100">{row.turno === '1' ? 'I' : row.turno === '2' ? 'II' : 'III'}</td>
                  <td className={`px-2 py-3 border-r text-center font-black ${row.entradaProducao === 'OK' ? 'text-green-600' : 'text-red-600'}`}>{row.entradaProducao}</td>
                  <td className={`px-2 py-3 border-r text-center font-black ${row.entradaAssepticoA === 'OK' ? 'text-green-600' : 'text-red-600'}`}>{row.entradaAssepticoA}</td>
                  <td className={`px-2 py-3 border-r text-center font-black ${row.entradaAssepticoC === 'OK' ? 'text-green-600' : 'text-red-600'}`}>{row.entradaAssepticoC}</td>
                  <td className={`px-2 py-3 border-r text-center font-black ${row.entradaAssepticoD === 'OK' ? 'text-green-600' : 'text-red-600'}`}>{row.entradaAssepticoD}</td>
                  <td className={`px-2 py-3 border-r text-center font-black ${row.saidaEvaporadorB === 'OK' ? 'text-green-600' : 'text-red-600'}`}>{row.saidaEvaporadorB}</td>
                  <td className={`px-2 py-3 border-r text-center font-black ${row.saidaTambores === 'OK' ? 'text-green-600' : 'text-red-600'}`}>{row.saidaTambores}</td>
                  <td className={`px-2 py-3 border-r text-center font-black ${row.higienizacaoTambores === 'OK' ? 'text-green-600' : 'text-red-600'}`}>{row.higienizacaoTambores}</td>
                  <td className="px-4 py-3 text-center uppercase font-bold text-gray-500">{row.visto || '---'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderLabCleaningTable = (rows: any[]) => {
    return (
      <div className="mb-8 overflow-hidden rounded-xl border border-gray-200 dark:border-gray-600 shadow-lg">
        <div className="bg-indigo-700 px-6 py-4">
          <h4 className="text-white font-black text-xs uppercase tracking-[0.2em]">LIMPEZA DE LABORATÓRIOS</h4>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[10px] border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-600 text-gray-500 font-black uppercase tracking-widest">
                <th className="px-4 py-4 border-r">DATA</th>
                <th className="px-2 py-4 border-r text-center">TURNO</th>
                <th className="px-4 py-4 border-r">LOCAL</th>
                <th className="px-2 py-4 border-r text-center">DET.</th>
                <th className="px-2 py-4 border-r text-center">ÁGUA</th>
                <th className="px-2 py-4 border-r text-center">ÁLCOOL</th>
                <th className="px-4 py-4 border-r">OBSERVAÇÃO</th>
                <th className="px-4 py-4 border-r">COLABORADOR</th>
                <th className="px-4 py-4 text-center">RESP. VERIF.</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rows.map((row, idx) => (
                <tr key={idx} className="hover:bg-indigo-50/20 transition-colors">
                  <td className="px-4 py-3 border-r font-bold text-gray-700 dark:text-gray-200">{formatDateSafely(row.data)}</td>
                  <td className="px-2 py-3 border-r text-center font-black text-gray-800 dark:text-gray-100">{row.turno === '1' ? 'I' : row.turno === '2' ? 'II' : 'III'}</td>
                  <td className="px-4 py-3 border-r font-bold text-gray-600 dark:text-gray-300">{row.local}</td>
                  <td className="px-2 py-3 border-r text-center">{row.detergente ? <i className="fas fa-check text-green-600"></i> : <i className="fas fa-times text-red-300"></i>}</td>
                  <td className="px-2 py-3 border-r text-center">{row.agua ? <i className="fas fa-check text-green-600"></i> : <i className="fas fa-times text-red-300"></i>}</td>
                  <td className="px-2 py-3 border-r text-center">{row.alcool ? <i className="fas fa-check text-green-600"></i> : <i className="fas fa-times text-red-300"></i>}</td>
                  <td className="px-4 py-3 border-r text-gray-500 italic">{row.observacao || '---'}</td>
                  <td className="px-4 py-3 border-r uppercase font-bold text-gray-700 dark:text-gray-200">{row.colaborador || '---'}</td>
                  <td className="px-4 py-3 text-center uppercase font-bold text-gray-500">{row.responsavelVerificacao || '---'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderOzoneMonitoringTable = (rows: any[]) => {
    return (
      <div className="mb-8 overflow-hidden rounded-xl border border-gray-200 dark:border-gray-600 shadow-lg">
        <div className="bg-blue-700 px-6 py-4">
          <h4 className="text-white font-black text-xs uppercase tracking-[0.2em]">MONITORAMENTO DE OZÔNIO</h4>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[9px] border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-600 text-gray-500 font-black uppercase tracking-widest">
                <th rowSpan={2} className="px-3 py-4 border-r">DATA</th>
                <th colSpan={3} className="px-2 py-2 border-r text-center bg-blue-50/50">TURNO 1</th>
                <th colSpan={3} className="px-2 py-2 border-r text-center bg-emerald-50/50">TURNO 2</th>
                <th colSpan={3} className="px-2 py-2 text-center bg-amber-50/50">TURNO 3</th>
              </tr>
              <tr className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-600 text-gray-400 font-black uppercase">
                <th className="px-1 py-2 border-r text-center">HORA</th>
                <th className="px-1 py-2 border-r text-center">FUNC.</th>
                <th className="px-1 py-2 border-r text-center">VISTO</th>
                <th className="px-1 py-2 border-r text-center">HORA</th>
                <th className="px-1 py-2 border-r text-center">FUNC.</th>
                <th className="px-1 py-2 border-r text-center">VISTO</th>
                <th className="px-1 py-2 border-r text-center">HORA</th>
                <th className="px-1 py-2 border-r text-center">FUNC.</th>
                <th className="px-1 py-2 text-center">VISTO</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rows.map((row, idx) => (
                <React.Fragment key={idx}>
                  <tr className="hover:bg-gray-50/50">
                    <td rowSpan={2} className="px-3 py-3 border-r font-bold text-gray-700 dark:text-gray-200 align-middle">{formatDateSafely(row.data)}</td>
                    <td className="px-1 py-2 border-r text-center font-black">{row.t1_hora1}</td>
                    <td className={`px-1 py-2 border-r text-center font-black ${row.t1_func1 === 'OK' ? 'text-green-600' : 'text-red-600'}`}>{row.t1_func1}</td>
                    <td className="px-1 py-2 border-r text-center uppercase text-[8px]">{row.t1_visto1}</td>
                    <td className="px-1 py-2 border-r text-center font-black">{row.t2_hora1}</td>
                    <td className={`px-1 py-2 border-r text-center font-black ${row.t2_func1 === 'OK' ? 'text-green-600' : 'text-red-600'}`}>{row.t2_func1}</td>
                    <td className="px-1 py-2 border-r text-center uppercase text-[8px]">{row.t2_visto1}</td>
                    <td className="px-1 py-2 border-r text-center font-black">{row.t3_hora1}</td>
                    <td className={`px-1 py-2 border-r text-center font-black ${row.t3_func1 === 'OK' ? 'text-green-600' : 'text-red-600'}`}>{row.t3_func1}</td>
                    <td className="px-1 py-2 text-center uppercase text-[8px]">{row.t3_visto1}</td>
                  </tr>
                  <tr className="hover:bg-gray-50/50 border-b">
                    <td className="px-1 py-2 border-r text-center font-black">{row.t1_hora2}</td>
                    <td className={`px-1 py-2 border-r text-center font-black ${row.t1_func2 === 'OK' ? 'text-green-600' : 'text-red-600'}`}>{row.t1_func2}</td>
                    <td className="px-1 py-2 border-r text-center uppercase text-[8px]">{row.t1_visto2}</td>
                    <td className="px-1 py-2 border-r text-center font-black">{row.t2_hora2}</td>
                    <td className={`px-1 py-2 border-r text-center font-black ${row.t2_func2 === 'OK' ? 'text-green-600' : 'text-red-600'}`}>{row.t2_func2}</td>
                    <td className="px-1 py-2 border-r text-center uppercase text-[8px]">{row.t2_visto2}</td>
                    <td className="px-1 py-2 border-r text-center font-black">{row.t3_hora2}</td>
                    <td className={`px-1 py-2 border-r text-center font-black ${row.t3_func2 === 'OK' ? 'text-green-600' : 'text-red-600'}`}>{row.t3_func2}</td>
                    <td className="px-1 py-2 text-center uppercase text-[8px]">{row.t3_visto2}</td>
                  </tr>
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderPeraceticAcidMonitoringTable = (rows: any[]) => {
    return (
      <div className="mb-8 overflow-hidden rounded-xl border border-gray-200 dark:border-gray-600 shadow-lg">
        <div className="bg-emerald-700 px-6 py-4">
          <h4 className="text-white font-black text-xs uppercase tracking-[0.2em]">MONITORAMENTO DE ÁCIDO PERACÉTICO</h4>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[9px] border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-600 text-gray-500 font-black uppercase tracking-widest">
                <th rowSpan={2} className="px-3 py-4 border-r">DATA</th>
                <th colSpan={3} className="px-2 py-2 border-r text-center bg-blue-50/50">TURNO 1</th>
                <th colSpan={3} className="px-2 py-2 border-r text-center bg-emerald-50/50">TURNO 2</th>
                <th colSpan={3} className="px-2 py-2 text-center bg-amber-50/50">TURNO 3</th>
              </tr>
              <tr className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-600 text-gray-400 font-black uppercase">
                <th className="px-1 py-2 border-r text-center">HORA</th>
                <th className="px-1 py-2 border-r text-center">RES. (%)</th>
                <th className="px-1 py-2 border-r text-center">VISTO</th>
                <th className="px-1 py-2 border-r text-center">HORA</th>
                <th className="px-1 py-2 border-r text-center">RES. (%)</th>
                <th className="px-1 py-2 border-r text-center">VISTO</th>
                <th className="px-1 py-2 border-r text-center">HORA</th>
                <th className="px-1 py-2 border-r text-center">RES. (%)</th>
                <th className="px-1 py-2 text-center">VISTO</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rows.map((row, idx) => (
                <React.Fragment key={idx}>
                  {[0, 1, 2].map(shiftIdx => (
                    <tr key={shiftIdx} className="hover:bg-gray-50/50">
                      {shiftIdx === 0 && <td rowSpan={3} className="px-3 py-3 border-r font-bold text-gray-700 dark:text-gray-200 align-middle border-b">{formatDateSafely(row.data)}</td>}
                      <td className={`px-1 py-2 border-r text-center font-black ${shiftIdx === 2 ? 'border-b' : ''}`}>{row.t1[shiftIdx].hora}</td>
                      <td className={`px-1 py-2 border-r text-center font-black text-emerald-700 ${shiftIdx === 2 ? 'border-b' : ''}`}>{row.t1[shiftIdx].resultado}</td>
                      <td className={`px-1 py-2 border-r text-center uppercase text-[8px] ${shiftIdx === 2 ? 'border-b' : ''}`}>{row.t1[shiftIdx].visto}</td>
                      <td className={`px-1 py-2 border-r text-center font-black ${shiftIdx === 2 ? 'border-b' : ''}`}>{row.t2[shiftIdx].hora}</td>
                      <td className={`px-1 py-2 border-r text-center font-black text-emerald-700 ${shiftIdx === 2 ? 'border-b' : ''}`}>{row.t2[shiftIdx].resultado}</td>
                      <td className={`px-1 py-2 border-r text-center uppercase text-[8px] ${shiftIdx === 2 ? 'border-b' : ''}`}>{row.t2[shiftIdx].visto}</td>
                      <td className={`px-1 py-2 border-r text-center font-black ${shiftIdx === 2 ? 'border-b' : ''}`}>{row.t3[shiftIdx].hora}</td>
                      <td className={`px-1 py-2 border-r text-center font-black text-emerald-700 ${shiftIdx === 2 ? 'border-b' : ''}`}>{row.t3[shiftIdx].resultado}</td>
                      <td className={`px-1 py-2 text-center uppercase text-[8px] ${shiftIdx === 2 ? 'border-b' : ''}`}>{row.t3[shiftIdx].visto}</td>
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderScaleVerificationTable = (rows: any[], equipamento: string) => {
    return (
      <div className="mb-8 overflow-hidden rounded-xl border border-gray-200 dark:border-gray-600 shadow-lg">
        <div className="bg-amber-700 px-6 py-4 flex justify-between items-center">
          <h4 className="text-white font-black text-xs uppercase tracking-[0.2em]">VERIFICAÇÃO DE BALANÇA</h4>
          <span className="text-white/70 font-black text-[10px] uppercase">EQUIPAMENTO: {equipamento}</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[9px] border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-600 text-gray-500 font-black uppercase tracking-widest">
                <th rowSpan={2} className="px-3 py-4 border-r">DATA</th>
                <th rowSpan={2} className="px-2 py-4 border-r text-center">TURNO</th>
                <th colSpan={7} className="px-2 py-2 border-r text-center bg-amber-50/50">PESOS (g)</th>
                <th rowSpan={2} className="px-2 py-4 border-r text-center">CONF.</th>
                <th rowSpan={2} className="px-3 py-4 border-r">OBSERVAÇÃO</th>
                <th rowSpan={2} className="px-3 py-4 text-center">VISTO</th>
              </tr>
              <tr className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-600 text-gray-400 font-black uppercase">
                <th className="px-1 py-2 border-r text-center">P1 (1000)</th>
                <th className="px-1 py-2 border-r text-center">P2 (500)</th>
                <th className="px-1 py-2 border-r text-center">P3 (100)</th>
                <th className="px-1 py-2 border-r text-center">P4 (50)</th>
                <th className="px-1 py-2 border-r text-center">P5 (20)</th>
                <th className="px-1 py-2 border-r text-center">P6 (10)</th>
                <th className="px-1 py-2 border-r text-center">P7 (5)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rows.map((row, idx) => (
                <tr key={idx} className="hover:bg-gray-50/50">
                  <td className="px-3 py-3 border-r font-bold text-gray-700 dark:text-gray-200">{formatDateSafely(row.data)}</td>
                  <td className="px-2 py-3 border-r text-center font-black text-gray-800 dark:text-gray-100">{row.turno}</td>
                  <td className="px-1 py-3 border-r text-center">{row.p1}</td>
                  <td className="px-1 py-3 border-r text-center">{row.p2}</td>
                  <td className="px-1 py-3 border-r text-center">{row.p3}</td>
                  <td className="px-1 py-3 border-r text-center">{row.p4}</td>
                  <td className="px-1 py-3 border-r text-center">{row.p5}</td>
                  <td className="px-1 py-3 border-r text-center">{row.p6}</td>
                  <td className="px-1 py-3 border-r text-center">{row.p7}</td>
                  <td className={`px-2 py-3 border-r text-center font-black ${row.conforme === 'S' ? 'text-green-600' : 'text-red-600'}`}>{row.conforme}</td>
                  <td className="px-3 py-3 border-r text-gray-500 italic">{row.observacao || '---'}</td>
                  <td className="px-3 py-3 text-center uppercase font-bold text-gray-400">{row.visto || '---'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderPHMeterVerificationTable = (rows: any[], equipamento: string) => {
    return (
      <div className="mb-8 overflow-hidden rounded-xl border border-gray-200 dark:border-gray-600 shadow-lg">
        <div className="bg-cyan-700 px-6 py-4 flex justify-between items-center">
          <h4 className="text-white font-black text-xs uppercase tracking-[0.2em]">VERIFICAÇÃO DO PHMETRO</h4>
          <span className="text-white/70 font-black text-[10px] uppercase">EQUIPAMENTO: {equipamento}</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[9px] border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-600 text-gray-500 font-black uppercase tracking-widest">
                <th rowSpan={2} className="px-3 py-4 border-r">DATA</th>
                <th rowSpan={2} className="px-2 py-4 border-r text-center">TURNO</th>
                <th colSpan={3} className="px-2 py-2 border-r text-center bg-cyan-50/50">LOTE SOLUÇÃO</th>
                <th rowSpan={2} className="px-3 py-4 border-r text-center">SLOPE</th>
                <th rowSpan={2} className="px-3 py-4 text-center">VISTO</th>
              </tr>
              <tr className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-600 text-gray-400 font-black uppercase">
                <th className="px-2 py-2 border-r text-center">SOL. 4.0</th>
                <th className="px-2 py-2 border-r text-center">SOL. 7.0</th>
                <th className="px-2 py-2 border-r text-center">SOL. 10.0</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rows.map((row, idx) => (
                <tr key={idx} className="hover:bg-gray-50/50">
                  <td className="px-3 py-3 border-r font-bold text-gray-700 dark:text-gray-200">{formatDateSafely(row.data)}</td>
                  <td className="px-2 py-3 border-r text-center font-black text-gray-800 dark:text-gray-100">{row.turno}</td>
                  <td className="px-2 py-3 border-r text-center">{row.lote4}</td>
                  <td className="px-2 py-3 border-r text-center">{row.lote7}</td>
                  <td className="px-2 py-3 border-r text-center">{row.lote10}</td>
                  <td className="px-3 py-3 border-r text-center font-black text-cyan-800">{row.slope}</td>
                  <td className="px-3 py-3 text-center uppercase font-bold text-gray-400">{row.visto || '---'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderRefractometerVerificationTable = (rows: any[], equipamento: string) => {
    return (
      <div className="mb-8 overflow-hidden rounded-xl border border-gray-200 dark:border-gray-600 shadow-lg">
        <div className="bg-orange-700 px-6 py-4 flex justify-between items-center">
          <h4 className="text-white font-black text-xs uppercase tracking-[0.2em]">VERIFICAÇÃO DO REFRATÔMETRO</h4>
          <span className="text-white/70 font-black text-[10px] uppercase">EQUIPAMENTO: {equipamento}</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[9px] border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-600 text-gray-500 font-black uppercase tracking-widest">
                <th rowSpan={2} className="px-3 py-4 border-r">DATA</th>
                <th rowSpan={2} className="px-2 py-4 border-r text-center">TURNO</th>
                <th colSpan={3} className="px-2 py-2 border-r text-center bg-orange-50/50">LOTE SACAROSE P.A.</th>
                <th rowSpan={2} className="px-3 py-4 text-center">VISTO</th>
              </tr>
              <tr className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-600 text-gray-400 font-black uppercase">
                <th className="px-2 py-2 border-r text-center">10 °BRIX</th>
                <th className="px-2 py-2 border-r text-center">30 °BRIX</th>
                <th className="px-2 py-2 border-r text-center">50 °BRIX</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rows.map((row, idx) => (
                <tr key={idx} className="hover:bg-gray-50/50">
                  <td className="px-3 py-3 border-r font-bold text-gray-700 dark:text-gray-200">{formatDateSafely(row.data)}</td>
                  <td className="px-2 py-3 border-r text-center font-black text-gray-800 dark:text-gray-100">{row.turno}</td>
                  <td className="px-2 py-3 border-r text-center">{row.brix10}</td>
                  <td className="px-2 py-3 border-r text-center">{row.brix30}</td>
                  <td className="px-2 py-3 border-r text-center">{row.brix50}</td>
                  <td className="px-3 py-3 text-center uppercase font-bold text-gray-400">{row.visto || '---'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderFridgeTemperatureTable = (rows: any[], local: string) => {
    return (
      <div className="mb-8 overflow-hidden rounded-xl border border-gray-200 dark:border-gray-600 shadow-lg">
        <div className="bg-blue-800 px-6 py-4 flex justify-between items-center">
          <h4 className="text-white font-black text-xs uppercase tracking-[0.2em]">VERIFICAÇÃO DE TEMPERATURA</h4>
          <span className="text-white/70 font-black text-[10px] uppercase">LOCAL: {local}</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[9px] border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-600 text-gray-500 font-black uppercase tracking-widest">
                <th className="px-3 py-4 border-r">DATA</th>
                <th className="px-2 py-4 border-r text-center">TURNO</th>
                <th className="px-2 py-4 border-r text-center bg-blue-50/50">MARM. 01</th>
                <th className="px-2 py-4 border-r text-center bg-blue-50/50">MARM. 02</th>
                <th className="px-2 py-4 border-r text-center bg-blue-50/50">MARM. 03</th>
                <th className="px-2 py-4 border-r text-center bg-emerald-50/50">GELAD. 01</th>
                <th className="px-2 py-4 border-r text-center bg-emerald-50/50">GELAD. 02</th>
                <th className="px-3 py-4 text-center">VISTO</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rows.map((row, idx) => (
                <tr key={idx} className="hover:bg-gray-50/50">
                  <td className="px-3 py-3 border-r font-bold text-gray-700 dark:text-gray-200">{formatDateSafely(row.data)}</td>
                  <td className="px-2 py-3 border-r text-center font-black text-gray-800 dark:text-gray-100">{row.turno}</td>
                  <td className="px-2 py-3 border-r text-center font-bold text-blue-700">{row.marmiteiro01}</td>
                  <td className="px-2 py-3 border-r text-center font-bold text-blue-700">{row.marmiteiro02}</td>
                  <td className="px-2 py-3 border-r text-center font-bold text-blue-700">{row.marmiteiro03}</td>
                  <td className="px-2 py-3 border-r text-center font-bold text-emerald-700">{row.geladeira01}</td>
                  <td className="px-2 py-3 border-r text-center font-bold text-emerald-700">{row.geladeira02}</td>
                  <td className="px-3 py-3 text-center uppercase font-bold text-gray-400">{row.visto || '---'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderBoilerPHRegistrationTable = (rows: any[]) => {
    return (
      <div className="mb-8 overflow-hidden rounded-xl border border-gray-200 dark:border-gray-600 shadow-lg">
        <div className="bg-sky-700 px-6 py-4">
          <h4 className="text-white font-black text-xs uppercase tracking-[0.2em]">REGISTRO DO PH DA CALDEIRA</h4>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[9px] border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-600 text-gray-500 font-black uppercase tracking-widest">
                <th className="px-3 py-4 border-r">DATA</th>
                <th className="px-3 py-4 border-r text-center">HORÁRIO</th>
                <th className="px-3 py-4 border-r text-center bg-blue-50/50">CALDEIRA</th>
                <th className="px-3 py-4 border-r text-center bg-emerald-50/50">ÁGUA COND.</th>
                <th className="px-3 py-4 border-r text-center bg-sky-50/50">ÁGUA ABRAN.</th>
                <th className="px-3 py-4 text-center">VISTO</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rows.map((row, idx) => (
                <tr key={idx} className="hover:bg-gray-50/50">
                  <td className="px-3 py-3 border-r font-bold text-gray-700 dark:text-gray-200">{formatDateSafely(row.data)}</td>
                  <td className="px-3 py-3 border-r text-center font-black text-gray-800 dark:text-gray-100">{row.horario}</td>
                  <td className="px-3 py-3 border-r text-center font-black text-blue-800">{row.caldeira}</td>
                  <td className="px-3 py-3 border-r text-center font-black text-emerald-800">{row.aguaCondensada}</td>
                  <td className="px-3 py-3 border-r text-center font-black text-sky-800">{row.aguaAbrandada}</td>
                  <td className="px-3 py-3 text-center uppercase font-bold text-gray-400">{row.visto || '---'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderBlenderReleaseTable = (rows: any[]) => {
    const firstRow = rows[0] || {};
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 bg-purple-50 rounded-2xl border border-purple-100">
          <div className="flex flex-col">
            <span className="text-[9px] font-black text-purple-400 uppercase tracking-widest mb-1">Fruta</span>
            <span className="text-sm font-black text-purple-900">{firstRow.fruta === 'OUTROS' ? firstRow.frutaOutros : firstRow.fruta}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] font-black text-purple-400 uppercase tracking-widest mb-1">Processo</span>
            <span className="text-sm font-black text-purple-900">{firstRow.processo}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] font-black text-purple-400 uppercase tracking-widest mb-1">Produto</span>
            <span className="text-sm font-black text-purple-900">{firstRow.produto}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] font-black text-purple-400 uppercase tracking-widest mb-1">Envase</span>
            <span className="text-sm font-black text-purple-900">{firstRow.envase}</span>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-600 shadow-lg">
          <div className="bg-purple-800 px-6 py-4">
            <h4 className="text-white font-black text-xs uppercase tracking-[0.2em]">LIBERAÇÃO DE TANQUES</h4>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[10px] border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-600 text-gray-500 font-black uppercase tracking-widest">
                  <th className="px-3 py-4 border-r text-center">Nº TANQUE</th>
                  <th className="px-2 py-4 border-r text-center">SEQ.</th>
                  <th className="px-2 py-4 border-r text-center">°BRIX</th>
                  <th className="px-2 py-4 border-r text-center">pH</th>
                  <th className="px-2 py-4 border-r text-center">pH CORR</th>
                  <th className="px-2 py-4 border-r text-center">ACIDEZ</th>
                  <th className="px-2 py-4 border-r text-center">PM</th>
                  <th className="px-2 py-4 border-r text-center">PP</th>
                  <th className="px-2 py-4 border-r text-center">COR</th>
                  <th className="px-2 py-4 border-r text-center">VIT C</th>
                  <th className="px-2 py-4 border-r text-center">LIB (h)</th>
                  <th className="px-3 py-4 text-center">VISTO</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {rows.map((row, idx) => (
                  <tr key={idx} className="hover:bg-purple-50/20 transition-colors">
                    <td className="px-3 py-3 border-r font-black text-gray-800 dark:text-gray-100 text-center">{row.noTanque}</td>
                    <td className="px-2 py-3 border-r font-black text-purple-600 text-center">{row.seqTanque}</td>
                    <td className="px-2 py-3 border-r text-center font-bold">{row.brix}</td>
                    <td className="px-2 py-3 border-r text-center">{row.ph}</td>
                    <td className="px-2 py-3 border-r text-center bg-gray-50/50 font-bold">{row.phCorrigido}</td>
                    <td className="px-2 py-3 border-r text-center">{row.acidez}</td>
                    <td className="px-2 py-3 border-r text-center">{row.pontosMarrons}</td>
                    <td className="px-2 py-3 border-r text-center">{row.pontosPretos}</td>
                    <td className="px-2 py-3 border-r text-center">{row.cor}</td>
                    <td className="px-2 py-3 border-r text-center">{row.vitaminaC}</td>
                    <td className="px-2 py-3 border-r text-center">{row.liberacaoH}</td>
                    <td className="px-3 py-3 text-center uppercase font-bold text-gray-400">{row.visto}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        {firstRow.observacoes && (
          <div className="p-6 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-200 dark:border-gray-600">
            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-2">Observações Gerais</span>
            <p className="text-sm text-gray-700 dark:text-gray-200 whitespace-pre-wrap">{firstRow.observacoes}</p>
          </div>
        )}
      </div>
    );
  };

  const renderSimpleTable = (obj: any, title: string) => {
    if (!obj) return null;
    const entries = Object.entries(obj).filter(([k, v]) => 
      typeof v !== 'object' && 
      v !== null && 
      k.toLowerCase() !== 'data' && 
      k.toLowerCase() !== 'datachegada'
    );
    if (entries.length === 0) return null;

    return (
      <div className="mb-6 overflow-hidden border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm">
        <div className="bg-gray-100 dark:bg-gray-700 px-4 py-2 border-b border-gray-300 dark:border-gray-600 font-black text-[9px] uppercase text-gray-500 tracking-widest">
          {formatKey(title)}
        </div>
        <table className="w-full text-left text-[11px] border-collapse">
          <tbody>
            {entries.map(([key, val], i) => (
              <tr key={key} className={i % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-900/50'}>
                <td className="px-4 py-2 font-bold text-gray-400 w-1/3 border-r border-gray-200 dark:border-gray-600">{formatKey(key)}</td>
                <td className="px-4 py-2 font-semibold text-gray-800 dark:text-gray-100 break-all">{val?.toString() || '---'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderLabelDeliveryTable = (entries: any[]) => {
    return (
      <div className="mb-8 overflow-hidden rounded-xl border border-gray-200 dark:border-gray-600 shadow-lg">
        <div className="bg-teal-700 px-6 py-4">
          <h4 className="text-white font-black text-xs uppercase tracking-[0.2em]">ENTREGA DE ETIQUETAS</h4>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[10px] border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-600 text-gray-500 font-black uppercase tracking-widest">
                <th className="px-4 py-4 border-r">DATA/HORA</th>
                <th className="px-4 py-4 border-r">LOTE</th>
                <th className="px-2 py-4 border-r text-center">ENV.</th>
                <th className="px-4 py-4 border-r">PRODUTO</th>
                <th className="px-2 py-4 border-r text-center">LOTES</th>
                <th className="px-2 py-4 border-r text-center">TAMB.</th>
                <th className="px-2 py-4 border-r text-center">AMOST.</th>
                <th className="px-2 py-4 border-r text-center">DESC.</th>
                <th className="px-4 py-4 text-left">VISTOS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {entries.map((entry, idx) => (
                <tr key={idx} className="hover:bg-teal-50/20 transition-colors">
                  <td className="px-4 py-3 border-r font-bold text-gray-700 dark:text-gray-200 whitespace-nowrap">{entry.data} {entry.horario}</td>
                  <td className="px-4 py-3 border-r font-black text-gray-800 dark:text-gray-100 font-mono">{entry.lote}</td>
                  <td className="px-2 py-3 border-r text-center font-black text-teal-700">{entry.envaseAsseptico}</td>
                  <td className="px-4 py-3 border-r text-[9px] font-bold text-gray-600 dark:text-gray-300">{entry.produto}</td>
                  <td className="px-2 py-3 border-r text-center">{entry.etiquetasLotesDocs}</td>
                  <td className="px-2 py-3 border-r text-center">{entry.etiquetasNumeracaoTambores}</td>
                  <td className="px-2 py-3 border-r text-center">{entry.etiquetasAmostrasBags}</td>
                  <td className="px-2 py-3 border-r text-center">{entry.etiquetasDescartadas}</td>
                  <td className="px-4 py-3 text-[8px] text-gray-500 leading-tight">
                    Q: {entry.vistoQualidade}<br/>
                    P: {entry.vistoProducao}<br/>
                    CQ: {entry.vistoConferenciaQualidade}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderBlenderControlTable = (entries: any[]) => {
    return (
      <div className="space-y-4">
        <div className="overflow-x-auto rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead className="text-[10px] uppercase bg-orange-50 text-orange-700 font-black">
              <tr>
                <th className="px-4 py-3 border-r">Tanque</th>
                <th className="px-4 py-3 border-r text-center">Enchimento</th>
                <th className="px-4 py-3 border-r text-center">Volume (L)</th>
                <th className="px-4 py-3 border-r text-center">ºBrix</th>
                <th className="px-4 py-3 border-r text-center">Liberação</th>
                <th className="px-4 py-3 text-center">Ác. Ascórbico</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {entries.map((entry, idx) => (
                <tr key={idx} className="hover:bg-orange-50/20 transition-colors">
                  <td className="px-4 py-3 border-r font-black text-gray-800 dark:text-gray-100">{entry.noTanque}</td>
                  <td className="px-4 py-3 border-r text-center font-bold text-gray-600 dark:text-gray-300 text-[10px]">
                    {entry.horaInicio} - {entry.horaFim}
                  </td>
                  <td className="px-4 py-3 border-r text-center font-black text-gray-700 dark:text-gray-200">{entry.volume}</td>
                  <td className="px-4 py-3 border-r text-center font-black text-orange-600">{entry.brix}</td>
                  <td className="px-4 py-3 border-r text-center font-bold text-gray-600 dark:text-gray-300 text-[10px]">
                    L: {entry.horaLibLab} / U: {entry.horaLibUtil}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2 py-1 rounded text-[9px] font-black ${entry.acAscorbicoSim ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {entry.acAscorbicoKg} Kg {entry.acAscorbicoSim ? '(OK)' : '(Ñ)'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderWaterAnalysisTable = (rows: any[]) => {
    return (
      <div className="space-y-4">
        <div className="overflow-x-auto rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead className="text-[10px] uppercase bg-blue-50 text-blue-700 font-black">
              <tr>
                <th className="px-4 py-3 border-r">Data/Hora</th>
                <th className="px-4 py-3 border-r text-center">Cloro</th>
                <th className="px-4 py-3 border-r text-center">pH</th>
                <th className="px-4 py-3 border-r text-center">Turbidez</th>
                <th className="px-4 py-3 border-r text-center">Cor</th>
                <th className="px-4 py-3 border-r text-center">Flúor</th>
                <th className="px-4 py-3 text-center">Visto</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rows.map((row, idx) => (
                <tr key={idx} className="hover:bg-blue-50/20 transition-colors text-[11px]">
                  <td className="px-4 py-3 border-r font-bold text-gray-700 dark:text-gray-200">{row.data} {row.horario}</td>
                  <td className="px-4 py-3 border-r text-center font-black text-blue-600">{row.cloro}</td>
                  <td className="px-4 py-3 border-r text-center font-black text-emerald-600">{row.ph}</td>
                  <td className="px-4 py-3 border-r text-center font-black text-sky-600">{row.turbidez}</td>
                  <td className="px-4 py-3 border-r text-center font-black text-indigo-600">{row.cor}</td>
                  <td className="px-4 py-3 border-r text-center font-black text-violet-600">{row.fluor}</td>
                  <td className="px-4 py-3 text-center uppercase font-bold text-gray-400">{row.visto}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderWaterTreatmentTable = (rows: any[]) => {
    return (
      <div className="space-y-4">
        <div className="overflow-x-auto rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead className="text-[10px] uppercase bg-cyan-50 text-cyan-700 font-black">
              <tr>
                <th className="px-4 py-3 border-r">Data/Hora</th>
                <th className="px-4 py-3 border-r text-center">Nível Res.</th>
                <th className="px-4 py-3 border-r text-center">Hipoclorito</th>
                <th className="px-4 py-3 border-r text-center">PAC</th>
                <th className="px-4 py-3 border-r text-center">Limpeza</th>
                <th className="px-4 py-3 text-center">Visto</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rows.map((row, idx) => (
                <tr key={idx} className="hover:bg-cyan-50/20 transition-colors text-[11px]">
                  <td className="px-4 py-3 border-r font-bold text-gray-700 dark:text-gray-200">{row.data} {row.horario}</td>
                  <td className="px-4 py-3 border-r text-center font-black text-blue-600">{row.nivelReservatorio}%</td>
                  <td className="px-4 py-3 border-r text-center font-black text-emerald-600">{row.consumoHipoclorito}L</td>
                  <td className="px-4 py-3 border-r text-center font-black text-sky-600">{row.consumoPAC}L</td>
                  <td className="px-4 py-3 border-r text-center">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-black ${row.limpezaFiltros ? 'bg-green-100 text-green-700' : 'bg-gray-100 dark:bg-gray-700 text-gray-400'}`}>
                      {row.limpezaFiltros ? 'OK' : 'Ñ'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center uppercase font-bold text-gray-400">{row.visto}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderDataContent = (data: any, formType: string) => {
    if (!data) return <div className="p-10 text-center text-red-400 font-bold border-2 border-dashed rounded-3xl uppercase">DADOS NÃO ENCONTRADOS</div>;

    let parsedData = data;
    if (typeof data === 'string') {
      try { parsedData = JSON.parse(data); } catch (e) { return <div className="p-4 bg-gray-50 dark:bg-gray-900/50 border rounded-xl font-mono text-[10px]">{data}</div>; }
    }

    if (formType === FormType.MICROBIOLOGICAL_ANALYSIS) {
      return (
        <div className="space-y-6">
          {parsedData.header && renderSimpleTable(parsedData.header, "Identificação da Produção")}
          {parsedData.rows && renderMicrobiologicalAnalysisTable(parsedData.rows)}
          {parsedData.footer && (
            <div className="space-y-4">
              {renderSimpleTable({ 
                observacao: parsedData.footer.observacao, 
                dataVerificacao: parsedData.footer.dataVerificacao 
              }, "Conclusão e Observações")}
              {parsedData.footer.verificadoPor && (
                <div className="mt-8 pt-8 border-t flex flex-col items-center">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Assinatura Digital Responsável</span>
                  <img src={parsedData.footer.verificadoPor} alt="Assinatura" className="h-24 object-contain opacity-80" />
                </div>
              )}
            </div>
          )}
        </div>
      );
    }

    if (formType === FormType.PHYSICAL_CHEMICAL_ANALYSIS) {
      return (
        <div className="space-y-6">
          {parsedData.header && renderSimpleTable(parsedData.header, "Identificação da Produção")}
          {parsedData.rows && renderPhysicochemicalAnalysisTable(parsedData.rows, parsedData.sampleCount || 3)}
          {parsedData.footer && (
            <div className="space-y-4">
              {renderSimpleTable({ 
                observacao: parsedData.footer.observacao, 
                dataVerificacao: parsedData.footer.dataVerificacao 
              }, "Conclusão e Observações")}
              {parsedData.footer.verificadoPor && (
                <div className="mt-8 pt-8 border-t flex flex-col items-center">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Assinatura Digital Responsável</span>
                  <img src={parsedData.footer.verificadoPor} alt="Assinatura" className="h-24 object-contain opacity-80" />
                </div>
              )}
            </div>
          )}
        </div>
      );
    }

    if (formType === FormType.PRODUCTION_MONITORING) {
      return (
        <div className="space-y-6">
          {parsedData.header && renderSimpleTable(parsedData.header, "Identificação da Produção")}
          {parsedData.processRows && renderProductionMonitoringTable(parsedData.processRows)}
        </div>
      );
    }

    if (formType === FormType.FRUIT_INTAKE && parsedData.charges) {
      return (
        <div className="space-y-6">
          {parsedData.header && renderSimpleTable(parsedData.header, "Identificação da Produção")}
          {renderFruitIntakeTable(parsedData.charges)}
          {parsedData.signature && (
            <div className="mt-8 pt-8 border-t flex flex-col items-center">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Assinatura Digital Responsável</span>
              <img src={parsedData.signature} alt="Assinatura" className="h-24 object-contain opacity-80" />
            </div>
          )}
        </div>
      );
    }

    if (formType === FormType.AIR_CURTAIN_INSPECTION && parsedData.rows) {
      return (
        <div className="space-y-6">
          {renderAirCurtainInspectionTable(parsedData.rows)}
        </div>
      );
    }

    if (formType === FormType.LAB_CLEANING && parsedData.rows) {
      return (
        <div className="space-y-6">
          {renderLabCleaningTable(parsedData.rows)}
        </div>
      );
    }

    if (formType === FormType.OZONE_MONITORING && parsedData.rows) {
      return (
        <div className="space-y-6">
          {renderOzoneMonitoringTable(parsedData.rows)}
        </div>
      );
    }

    if (formType === FormType.PERACETIC_ACID_MONITORING && parsedData.rows) {
      return (
        <div className="space-y-6">
          {renderPeraceticAcidMonitoringTable(parsedData.rows)}
        </div>
      );
    }

    if (formType === FormType.SCALE_VERIFICATION && parsedData.rows) {
      return (
        <div className="space-y-6">
          {renderScaleVerificationTable(parsedData.rows, parsedData.equipamento)}
        </div>
      );
    }

    if (formType === FormType.PH_METER_VERIFICATION && parsedData.rows) {
      return (
        <div className="space-y-6">
          {renderPHMeterVerificationTable(parsedData.rows, parsedData.equipamento)}
        </div>
      );
    }

    if (formType === FormType.REFRACTOMETER_VERIFICATION && parsedData.rows) {
      return (
        <div className="space-y-6">
          {renderRefractometerVerificationTable(parsedData.rows, parsedData.equipamento)}
        </div>
      );
    }

    if (formType === FormType.FRIDGE_TEMPERATURE_VERIFICATION && parsedData.rows) {
      return (
        <div className="space-y-6">
          {renderFridgeTemperatureTable(parsedData.rows, parsedData.local)}
        </div>
      );
    }

    if (formType === FormType.BOILER_WATER_PH_REGISTRATION && parsedData.rows) {
      return (
        <div className="space-y-6">
          {renderBoilerPHRegistrationTable(parsedData.rows)}
        </div>
      );
    }

    if (formType === FormType.BLENDER_RELEASE && Array.isArray(parsedData)) {
      return (
        <div className="space-y-6">
          {renderBlenderReleaseTable(parsedData)}
        </div>
      );
    }

    if (formType === FormType.LABEL_DELIVERY && Array.isArray(parsedData)) {
      return (
        <div className="space-y-6">
          {renderLabelDeliveryTable(parsedData)}
        </div>
      );
    }

    if (formType === FormType.BLENDER_CONTROL && Array.isArray(parsedData)) {
      return (
        <div className="space-y-6">
          {parsedData[0] && renderSimpleTable({
            data: parsedData[0].data,
            operador: parsedData[0].operador,
            evaporador: parsedData[0].evaporador
          }, "Identificação")}
          {renderBlenderControlTable(parsedData)}
        </div>
      );
    }

    if (formType === FormType.WATER_ANALYSIS && parsedData.rows) {
      return (
        <div className="space-y-6">
          {renderWaterAnalysisTable(parsedData.rows)}
        </div>
      );
    }

    if (formType === FormType.WATER_TREATMENT && parsedData.rows) {
      return (
        <div className="space-y-6">
          {renderWaterTreatmentTable(parsedData.rows)}
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {Object.entries(parsedData).map(([key, value]) => {
          if (Array.isArray(value)) return <div key={key}>{renderSimpleTable({ items: value.length }, key)}</div>;
          if (value && typeof value === 'object') return <div key={key}>{renderSimpleTable(value, key)}</div>;
          return null;
        })}
        {renderSimpleTable(
          Object.fromEntries(Object.entries(parsedData).filter(([_, v]) => typeof v !== 'object')),
          "Informações Gerais"
        )}
      </div>
    );
  };

  const handlePrint = () => {
    // A função apenas chama o diálogo do navegador.
    // O CSS @media print no index.html cuidará do layout.
    window.print();
  };

  return (
    <div className="space-y-6 md:space-y-8 animate-fadeIn pb-20 lg:pb-0">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 no-print">
        <div>
          <h2 className="text-2xl md:text-3xl font-black text-[#1A2B34] tracking-tight">Relatórios da Qualidade</h2>
          <p className="text-gray-500 mt-1 font-medium text-sm">Controle de registros sincronizados.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
          <button 
            onClick={() => onExport && onExport()}
            className="w-full sm:w-auto px-8 flex items-center justify-center gap-3 bg-green-600 text-white py-3.5 rounded-full font-black text-[11px] uppercase tracking-widest shadow-lg shadow-green-100 active:scale-95 hover:bg-green-700 transition-all"
          >
            <i className="fas fa-file-excel text-base"></i>
            Exportar Protocolos
          </button>

          <div className="grid grid-cols-2 gap-3 md:gap-4 w-full md:w-auto">
             <div className="bg-white dark:bg-gray-800 p-3 md:p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col min-w-[80px] md:min-w-[100px]">
                <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Total</span>
                <span className="text-xl md:text-2xl font-black text-[#1A2B34]">{stats.total}</span>
             </div>
             <div className="bg-white dark:bg-gray-800 p-3 md:p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col min-w-[80px] md:min-w-[100px]">
                <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Hoje</span>
                <span className="text-xl md:text-2xl font-black text-green-600">{stats.today}</span>
             </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-4 md:p-6 rounded-2xl md:rounded-[2rem] shadow-xl border border-gray-100 dark:border-gray-700 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 no-print">
          <div className="relative">
            <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-300"></i>
            <input 
              type="text" placeholder="Pesquisar..." 
              className="w-full pl-9 pr-3 py-3 md:py-2.5 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-600 rounded-xl text-sm focus:ring-2 focus:ring-[#E3851B] outline-none"
              value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select 
            className="w-full px-3 py-3 md:py-2.5 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-600 rounded-xl text-sm font-bold text-gray-600 dark:text-gray-300 focus:ring-2 focus:ring-[#E3851B] outline-none"
            value={filterType} onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="all">Filtrar por Formulário</option>
            {FORMS_CONFIG.map(f => <option key={f.type} value={f.type}>{f.code} - {f.title}</option>)}
          </select>
          <div className="flex gap-2 w-full">
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="flex-1 px-3 py-3 md:py-2.5 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-600 rounded-xl text-sm outline-none" />
            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="flex-1 px-3 py-3 md:py-2.5 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-600 rounded-xl text-sm outline-none" />
          </div>
          <button 
            onClick={fetchRecords}
            className="hidden lg:flex items-center justify-center gap-2 bg-gray-800 text-white rounded-xl hover:bg-black transition-colors py-2.5 text-xs font-bold uppercase tracking-widest"
          >
            <i className="fas fa-sync-alt"></i> Atualizar
          </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl md:rounded-[2.5rem] shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden no-print">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-10 h-10 border-4 border-orange-100 border-t-orange-500 rounded-full animate-spin"></div>
            <span className="font-black text-[9px] uppercase tracking-widest text-gray-400">Consultando Banco...</span>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto custom-scrollbar">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="bg-gray-800 text-[9px] font-black uppercase tracking-widest text-white/50">
                    <th className="px-6 py-4">Protocolo</th>
                    <th className="px-6 py-4">Data e Hora</th>
                    <th className="px-6 py-4">Responsável</th>
                    <th className="px-6 py-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {currentRecords.length > 0 ? currentRecords.map((record) => {
                    const info = getFormInfo(record.form_type);
                    return (
                      <tr key={record.id} className="hover:bg-gray-50 dark:bg-gray-900/50 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 ${info.color} rounded-lg flex items-center justify-center text-white shadow-sm`}>
                              <i className={`fas ${info.icon} text-xs`}></i>
                            </div>
                            <div>
                              <div className="text-xs font-black text-[#1A2B34] truncate max-w-[150px] flex items-center gap-2">
                                {info.title}
                                {record.sync_status && record.sync_status.startsWith('pending_') && (
                                  <span title="Salvo offline. Aguardando sincronização." className="text-orange-500">
                                    <i className="fas fa-cloud-upload-alt text-[10px]"></i>
                                  </span>
                                )}
                              </div>
                              <div className="text-[9px] font-mono text-gray-400">{record.form_code || info.code}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-[10px] font-bold text-gray-700 dark:text-gray-200">{new Date(record.timestamp).toLocaleDateString('pt-BR')}</div>
                          <div className="text-[9px] text-gray-400">{new Date(record.timestamp).toLocaleTimeString('pt-BR', {hour:'2-digit', minute:'2-digit'})}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-[10px] font-black text-[#1A2B34] uppercase truncate block max-w-[100px]">{record.user_name}</span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-1.5">
                            <button onClick={() => onEdit(record)} className="w-8 h-8 bg-orange-50 text-orange-500 rounded-lg flex items-center justify-center hover:bg-orange-500 hover:text-white transition-all"><i className="fas fa-edit text-xs"></i></button>
                            <button onClick={() => setSelectedRecord(record)} className="px-4 py-1.5 bg-[#1A2B34] text-white rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-orange-500 transition-all">Ver</button>
                            {isAdminRole(currentUser.role) && (
                              <button onClick={() => deleteRecord(record.id, record.form_type)} className="w-8 h-8 text-gray-300 hover:text-red-500 transition-all"><i className="fas fa-trash-alt text-xs"></i></button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  }) : (
                    <tr>
                      <td colSpan={4} className="py-20 text-center text-gray-300 font-bold uppercase text-[10px] tracking-widest">Nenhum registro encontrado</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden divide-y divide-gray-100">
              {currentRecords.length > 0 ? currentRecords.map((record) => {
                const info = getFormInfo(record.form_type);
                return (
                  <div key={record.id} className="p-4 flex flex-col gap-4 active:bg-gray-50 dark:bg-gray-900/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 ${info.color} rounded-xl flex items-center justify-center text-white shadow-sm`}>
                          <i className={`fas ${info.icon} text-sm`}></i>
                        </div>
                        <div>
                          <div className="text-xs font-black text-[#1A2B34] flex items-center gap-2">
                            {info.title}
                            {record.sync_status && record.sync_status.startsWith('pending_') && (
                              <span title="Salvo offline. Aguardando sincronização." className="text-orange-500">
                                <i className="fas fa-cloud-upload-alt text-[10px]"></i>
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] font-mono text-gray-400">{record.form_code || info.code}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] font-bold text-gray-700 dark:text-gray-200">{new Date(record.timestamp).toLocaleDateString('pt-BR')}</div>
                        <div className="text-[9px] text-gray-400">{new Date(record.timestamp).toLocaleTimeString('pt-BR', {hour:'2-digit', minute:'2-digit'})}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-900/50 p-3 rounded-xl border border-gray-100 dark:border-gray-700">
                      <div className="flex flex-col">
                        <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Responsável</span>
                        <span className="text-[10px] font-black text-[#1A2B34] uppercase truncate max-w-[120px]">{record.user_name}</span>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => onEdit(record)} className="w-9 h-9 bg-white dark:bg-gray-800 text-orange-500 rounded-lg flex items-center justify-center border border-orange-100 shadow-sm"><i className="fas fa-edit text-xs"></i></button>
                        {isAdminRole(currentUser.role) && (
                          <button onClick={() => deleteRecord(record.id, record.form_type)} className="w-9 h-9 bg-white dark:bg-gray-800 text-gray-300 rounded-lg flex items-center justify-center border border-gray-100 dark:border-gray-700 shadow-sm"><i className="fas fa-trash-alt text-xs"></i></button>
                        )}
                        <button onClick={() => setSelectedRecord(record)} className="px-5 py-2 bg-[#1A2B34] text-white rounded-lg text-[10px] font-black uppercase tracking-widest shadow-md active:scale-95 transition-all">Ver</button>
                      </div>
                    </div>
                  </div>
                );
              }) : (
                <div className="py-20 text-center text-gray-300 font-bold uppercase text-[10px] tracking-widest">Nenhum registro encontrado</div>
              )}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between p-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 gap-4">
                <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                  Página {currentPage} de {totalPages} <span className="mx-2">|</span> Total: {filteredRecords.length} registros
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-500 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:bg-gray-900/50 transition-colors"
                  >
                    <i className="fas fa-chevron-left text-xs"></i>
                  </button>
                  
                  {/* Page Numbers */}
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum = i + 1;
                      if (totalPages > 5) {
                        if (currentPage > 3) {
                          pageNum = currentPage - 2 + i;
                        }
                        if (currentPage > totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        }
                      }
                      
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold transition-colors ${
                            currentPage === pageNum 
                              ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20' 
                              : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:bg-gray-900/50'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>
                  
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-500 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:bg-gray-900/50 transition-colors"
                  >
                    <i className="fas fa-chevron-right text-xs"></i>
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {selectedRecord && (
        <div className="fixed inset-0 bg-[#1A2B34]/95 backdrop-blur-sm z-[200] flex items-center justify-center p-2 md:p-4">
          {/* print-content agora está no div principal que queremos imprimir */}
          <div className="bg-white dark:bg-gray-800 rounded-xl md:rounded-[3rem] w-full max-w-5xl max-h-[96vh] overflow-hidden flex flex-col shadow-2xl animate-scaleIn print-content">
            <div className="p-5 md:p-8 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between bg-gray-50/50">
              <div className="flex items-center gap-3 md:gap-5">
                 <div className={`w-10 h-10 md:w-14 md:h-14 ${getFormInfo(selectedRecord.form_type).color} rounded-lg md:rounded-2xl flex items-center justify-center text-white shadow-md no-print`}>
                    <i className={`fas ${getFormInfo(selectedRecord.form_type).icon} text-lg md:text-2xl`}></i>
                 </div>
                 <div className="min-w-0">
                    <h3 className="text-base md:text-2xl font-black text-[#1A2B34] leading-tight truncate">{getFormInfo(selectedRecord.form_type).title}</h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[8px] md:text-[10px] font-black bg-gray-200 text-gray-600 dark:text-gray-300 px-1.5 py-0.5 rounded uppercase tracking-widest">{selectedRecord.form_code || '---'}</span>
                    </div>
                 </div>
              </div>
              <button onClick={() => setSelectedRecord(null)} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 dark:bg-gray-700 text-gray-400 no-print">
                <i className="fas fa-times text-xl"></i>
              </button>
            </div>

            <div className="p-4 md:p-10 overflow-y-auto flex-1 custom-scrollbar">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 mb-6 md:mb-10 p-4 md:p-8 bg-gray-50 dark:bg-gray-900/50 rounded-xl md:rounded-[2rem] border border-gray-100 dark:border-gray-700">
                <div className="flex flex-col"><span className="text-[8px] md:text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Data</span><span className="text-xs md:text-sm font-black text-gray-700 dark:text-gray-200">{new Date(selectedRecord.timestamp).toLocaleDateString('pt-BR')}</span></div>
                <div className="flex flex-col"><span className="text-[8px] md:text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Horário</span><span className="text-xs md:text-sm font-black text-gray-700 dark:text-gray-200">{new Date(selectedRecord.timestamp).toLocaleTimeString('pt-BR', {hour:'2-digit', minute:'2-digit'})}</span></div>
                <div className="flex flex-col"><span className="text-[8px] md:text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Responsável</span><span className="text-xs md:text-sm font-black text-gray-700 dark:text-gray-200 uppercase truncate">{selectedRecord.user_name}</span></div>
                <div className="flex flex-col"><span className="text-[8px] md:text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Status</span><span className="text-[9px] md:text-xs font-black text-green-600 uppercase">EFETIVADO</span></div>
              </div>

              {qrCodeImg && (
                <div className="mb-8 flex justify-center">
                  <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-lg border border-violet-50 flex flex-col items-center">
                    <img src={qrCodeImg} alt="QR Code" className="w-32 h-32 md:w-48 md:h-48 object-contain" />
                    <p className="text-violet-900 text-[10px] font-black uppercase mt-2">{selectedRecord?.data?.generatedCode}</p>
                  </div>
                </div>
              )}

              <div className="bg-white dark:bg-gray-800">
                {renderDataContent(selectedRecord.data, selectedRecord.form_type)}
              </div>
            </div>

            <div className="p-4 md:p-8 border-t bg-gray-50 dark:bg-gray-900/50 flex flex-col sm:flex-row justify-end items-center gap-3 no-print">
              <button 
                onClick={handlePrint} 
                className="w-full sm:w-auto px-6 py-3.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 font-black text-[10px] uppercase tracking-widest rounded-xl flex items-center justify-center gap-2 hover:bg-gray-100 dark:bg-gray-700 transition-colors shadow-sm"
              >
                <i className="fas fa-print"></i> Imprimir PDF
              </button>
              <button onClick={() => setSelectedRecord(null)} className="w-full sm:w-auto px-10 py-4 bg-[#1A2B34] text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-xl shadow-lg">
                Fechar Visualização
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataViewer;
