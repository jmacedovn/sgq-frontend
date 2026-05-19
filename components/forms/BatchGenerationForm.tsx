import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { FormType } from '../../types';
import { api } from '../../lib/api';
import { useFruits } from '../../lib/useFruits';
import { useCheckin } from '../../lib/useCheckin';
import { toast } from 'sonner';

// --- Mapeamentos e Lógica de Negócio ---

const monthMap: Record<number, string> = {
  1: "A", 2: "B", 3: "C", 4: "D", 5: "E", 6: "F",
  7: "G", 8: "H", 9: "I", 10: "J", 11: "K", 12: "L",
};

const yearMap: Record<number, string> = {
  2023: "M", 2024: "N", 2025: "O", 2026: "P", 2027: "Q",
  2028: "R", 2029: "S", 2030: "T", 2031: "U", 2032: "V",
  2033: "W", 2034: "X",
};

const productMap: Record<string, string> = {
  CONCENTRADO: "B",
  INTEGRAL: "U",
};

const fruitMap: Record<string, string> = {
  ABACAXI: "06",
  MACA: "21",
  MARACUJA: "28",
  GOIABA: "35",
  ACEROLA: "36",
  MANGA: "39",
  LIQUIDO_BASE_FRUTA: "E400",
  TOMATE: "40",
  CANA: "41",
  MELANCIA: "42",
  CANA_SEM_UF: "43",
};

const lineMap: Record<string, string> = {
  ASSEPTICO_A: "A",
  ASSEPTICO_C: "C",
  ASSEPTICO_D: "D",
};

const buildBatchTraceUrl = (code: string) => {
  const url = new URL(window.location.origin + window.location.pathname);
  url.searchParams.set('lote', code);
  return url.toString();
};

function generateBatchCode({
  unidade,
  mes,
  ano,
  produto,
  frutaCodigo,
  lote,
  linha,
}: {
  unidade: string;
  mes: number;
  ano: number;
  produto: string;
  frutaCodigo: string;
  lote: number;
  linha: string;
}): string {
  const mesLetra = monthMap[mes] || "?";
  const anoLetra = yearMap[ano] || "?";
  const produtoLetra = productMap[produto] || "?";
  const linhaLetra = lineMap[linha] || "?";
  const loteFormatado = lote.toString().padStart(4, "0");

  return `${unidade}${mesLetra}${anoLetra}${produtoLetra}${frutaCodigo}${loteFormatado}-${linhaLetra}`;
}

// --- Componente React ---

const BatchGenerationForm: React.FC<{ onSave: (data: any) => void, isSubmitting: boolean, initialData?: any }> = ({ onSave, isSubmitting, initialData }) => {
  const { fruits } = useFruits();
  const { getCheckinByOrder, getCheckinByPlate, loading: checkinLoading } = useCheckin();
  const [orderSearch, setOrderSearch] = useState('');

  const [formData, setFormData] = useState(initialData?.inputs || {
    unidade: '8',
    data: new Date().toISOString().split('T')[0], // Para extrair Mês e Ano
    produto: 'INTEGRAL',
    fruta: 'GOIABA',
    lote: '1',
    linha: 'ASSEPTICO_A'
  });

  const [generatedCode, setGeneratedCode] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [qrTraceUrl, setQrTraceUrl] = useState('');
  
  // Estado para histórico
  const [showHistory, setShowHistory] = useState(false);
  const [historyRecords, setHistoryRecords] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Atualiza o código e o QR sempre que o formulário muda
  useEffect(() => {
    const dateObj = new Date(formData.data);
    // Ajuste para fuso horário local para evitar dia/mês errado
    const userTimezoneOffset = dateObj.getTimezoneOffset() * 60000;
    const localDate = new Date(dateObj.getTime() + userTimezoneOffset);
    
    const mes = localDate.getMonth() + 1;
    const ano = localDate.getFullYear();

    const selectedFruitObj = fruits.find(f => f.name === formData.fruta);
    const fruitCode = selectedFruitObj?.code || "??";

    const code = generateBatchCode({
      unidade: formData.unidade,
      mes,
      ano,
      produto: formData.produto,
      frutaCodigo: fruitCode,
      lote: parseInt(formData.lote) || 0,
      linha: formData.linha
    });
    setGeneratedCode(code);

    // Gerar QR Code com link direto para o lote no SGQ
    if (code) {
      const traceUrl = buildBatchTraceUrl(code);
      setQrTraceUrl(traceUrl);
      QRCode.toDataURL(traceUrl, { 
        width: 300, 
        margin: 2,
        color: {
          dark: '#4c1d95', // violet-900
          light: '#ffffff'
        }
      })
      .then((url: string) => setQrCodeUrl(url))
      .catch((err: any) => console.error(err));
    }

  }, [formData]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedCode);
    toast.success('Código copiado: ' + generatedCode);
  };

  const printQrCode = () => {
    if (!qrCodeUrl || !generatedCode) return;

    const printWindow = window.open('', '_blank', 'width=420,height=620');
    if (!printWindow) {
      toast.error('Permita pop-ups para imprimir o QR Code.');
      return;
    }

    printWindow.document.write(`
      <!doctype html>
      <html>
        <head>
          <title>QR Code Lote ${generatedCode}</title>
          <style>
            * { box-sizing: border-box; }
            body {
              margin: 0;
              min-height: 100vh;
              display: flex;
              align-items: center;
              justify-content: center;
              font-family: Arial, sans-serif;
              color: #111827;
              background: #ffffff;
            }
            .label {
              width: 90mm;
              min-height: 120mm;
              padding: 10mm;
              border: 1px solid #d1d5db;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              gap: 12px;
              text-align: center;
            }
            .eyebrow {
              font-size: 10px;
              font-weight: 800;
              letter-spacing: 0.24em;
              text-transform: uppercase;
              color: #6d28d9;
            }
            h1 {
              margin: 0;
              font-size: 28px;
              font-family: "Courier New", monospace;
              letter-spacing: 0.08em;
              word-break: break-word;
            }
            img {
              width: 58mm;
              height: 58mm;
              object-fit: contain;
            }
            .meta {
              width: 100%;
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 6px;
              margin-top: 4px;
              font-size: 11px;
              text-transform: uppercase;
            }
            .meta div {
              border: 1px solid #e5e7eb;
              border-radius: 6px;
              padding: 6px;
            }
            .meta span {
              display: block;
              color: #6b7280;
              font-size: 8px;
              font-weight: 800;
              letter-spacing: 0.12em;
              margin-bottom: 3px;
            }
            .hint {
              margin: 0;
              max-width: 68mm;
              font-size: 9px;
              line-height: 1.4;
              color: #4b5563;
              word-break: break-all;
            }
            @media print {
              body { min-height: auto; }
              .label { border: 0; width: 100%; min-height: auto; }
            }
          </style>
        </head>
        <body>
          <main class="label">
            <div class="eyebrow">SGQ - Rastreabilidade</div>
            <h1>${generatedCode}</h1>
            <img src="${qrCodeUrl}" alt="QR Code do lote ${generatedCode}" />
            <div class="meta">
              <div><span>Produto</span>${formData.produto}</div>
              <div><span>Fruta</span>${formData.fruta.replace(/_/g, ' ')}</div>
              <div><span>Linha</span>${formData.linha.replace('_', ' ')}</div>
              <div><span>Data</span>${new Date(formData.data).toLocaleDateString('pt-BR')}</div>
            </div>
            <p class="hint">Escaneie para abrir o lote no SGQ: ${qrTraceUrl}</p>
          </main>
          <script>
            window.addEventListener('load', () => {
              window.print();
              window.addEventListener('afterprint', () => window.close());
            });
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
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
      const { registro } = data;
      setFormData(prev => ({
        ...prev,
        fruta: registro.tipo_fruta || prev.fruta,
        data: registro.horario_entrada ? new Date(registro.horario_entrada).toISOString().split('T')[0] : prev.data,
        lote: registro.numero_ordem?.toString() || prev.lote
      }));
      toast.success('Dados importados com sucesso!');
    }
  };

  const handleFetchHistory = async () => {
    setLoadingHistory(true);
    try {
        const data = await api.getRecords('records', { form_type: FormType.BATCH_GENERATION, order: 'timestamp', orderDirection: 'desc', limit: 20 });
        setHistoryRecords(data || []);
        setShowHistory(true);
    } catch (error) {
        console.error("Erro ao buscar histórico:", error);
        toast.error("Não foi possível carregar o histórico no momento.");
    } finally {
        setLoadingHistory(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      inputs: formData,
      generatedCode,
      generatedAt: new Date().toISOString()
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-10 animate-fadeIn">
      {/* SEÇÃO DE IMPORTAÇÃO CHECK-IN */}
      <div className="bg-violet-50 dark:bg-violet-900/20 border border-violet-100 dark:border-violet-800 p-6 rounded-[2rem] flex flex-col md:flex-row items-center gap-4">
        <div className="flex-1">
          <h4 className="text-violet-900 dark:text-violet-300 text-[10px] font-black uppercase tracking-widest mb-1">Vincular Matéria-Prima</h4>
          <p className="text-violet-600/70 dark:text-violet-400 text-[9px]">Gere o código de lote baseado na entrada oficial do pátio</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <input 
            type="text" 
            placeholder="Placa ou Nº Ordem" 
            value={orderSearch}
            onChange={(e) => setOrderSearch(e.target.value.toUpperCase())}
            className="flex-1 md:w-48 p-3 text-xs border border-violet-200 rounded-xl outline-none focus:ring-2 ring-violet-400 font-bold"
          />
          <button 
            type="button"
            onClick={handleImportCheckin}
            disabled={checkinLoading}
            className="px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white text-[10px] font-black uppercase rounded-xl shadow-md transition-all flex items-center gap-2 whitespace-nowrap disabled:opacity-50"
          >
            {checkinLoading ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-link"></i>}
            Vincular
          </button>
        </div>
      </div>
      
      {/* Display do Resultado */}
      <div className="bg-violet-600 text-white rounded-[2.5rem] p-10 text-center shadow-xl relative overflow-hidden group">
         <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-violet-400 to-fuchsia-400"></div>
         
         <div className="flex flex-col items-center justify-center gap-10">
            {/* Texto do Código */}
            <div className="w-full">
               <h3 className="text-violet-200 text-xs font-black uppercase tracking-[0.3em] mb-4">Código Gerado</h3>
               <div className="text-4xl sm:text-6xl font-black tracking-wider font-mono mb-6 break-all drop-shadow-md">
                  {generatedCode}
               </div>
               <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                 <button 
                   type="button"
                   onClick={copyToClipboard}
                   className="bg-white/10 hover:bg-white/20 border border-white/20 text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all backdrop-blur-md flex items-center justify-center gap-2"
                 >
                   <i className="fas fa-copy"></i> Copiar Código
                 </button>
                 <button 
                   type="button"
                   onClick={printQrCode}
                   disabled={!qrCodeUrl}
                   className="bg-white text-violet-700 hover:bg-violet-50 border border-white px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                 >
                   <i className="fas fa-print"></i> Imprimir QR Code
                 </button>
               </div>
            </div>

            {/* QR Code */}
            {qrCodeUrl && (
              <div className="bg-white dark:bg-gray-800 p-3 rounded-2xl shadow-2xl transform transition-transform hover:scale-105 duration-300 mt-4">
                 <img src={qrCodeUrl} alt="QR Code Lote" className="w-40 h-40 object-contain rounded-xl mx-auto" />
                 <p className="text-violet-900 text-[8px] font-black text-center mt-2 uppercase tracking-widest">Escaneie para Rastrear</p>
                 <p className="text-gray-400 text-[7px] font-bold text-center mt-1 uppercase tracking-wider">Abre o lote no SGQ</p>
              </div>
            )}
         </div>
      </div>

      {/* Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 bg-gray-50 dark:bg-gray-900/50 p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-700 shadow-sm">
         
         <div className="space-y-2">
            <label className="text-[10px] font-black text-violet-800 uppercase tracking-widest ml-1">Unidade</label>
            <input 
              value={formData.unidade} 
              onChange={e => setFormData({...formData, unidade: e.target.value})} 
              className="w-full p-4 border border-gray-200 dark:border-gray-600 rounded-2xl font-bold text-center text-lg focus:ring-2 focus:ring-violet-500 outline-none" 
            />
         </div>

         <div className="space-y-2">
            <label className="text-[10px] font-black text-violet-800 uppercase tracking-widest ml-1">Data de Produção</label>
            <input 
              type="date"
              value={formData.data} 
              onChange={e => setFormData({...formData, data: e.target.value})} 
              className="w-full p-4 border border-gray-200 dark:border-gray-600 rounded-2xl font-medium focus:ring-2 focus:ring-violet-500 outline-none text-gray-700 dark:text-gray-200" 
            />
            <p className="text-[9px] text-gray-400 font-bold ml-2">Define Mês e Ano do código</p>
         </div>

         <div className="space-y-2">
            <label className="text-[10px] font-black text-violet-800 uppercase tracking-widest ml-1">Nº Sequencial Lote</label>
            <input 
              type="number"
              value={formData.lote} 
              onChange={e => setFormData({...formData, lote: e.target.value})} 
              className="w-full p-4 border border-gray-200 dark:border-gray-600 rounded-2xl font-bold text-center text-lg focus:ring-2 focus:ring-violet-500 outline-none" 
              placeholder="Ex: 1"
            />
         </div>

         <div className="space-y-2">
            <label className="text-[10px] font-black text-violet-800 uppercase tracking-widest ml-1">Produto</label>
            <div className="grid grid-cols-2 gap-2">
               {Object.keys(productMap).map(p => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setFormData({...formData, produto: p})}
                    className={`p-3 rounded-xl text-[9px] font-black border transition-all ${formData.produto === p ? 'bg-violet-600 text-white border-violet-700 shadow-md' : 'bg-white dark:bg-gray-800 text-gray-400 border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:bg-gray-900/50'}`}
                  >
                    {p}
                  </button>
               ))}
            </div>
         </div>

         <div className="space-y-2 lg:col-span-2">
            <label className="text-[10px] font-black text-violet-800 uppercase tracking-widest ml-1">Fruta / Base</label>
            <select 
               value={formData.fruta} 
               onChange={e => setFormData({...formData, fruta: e.target.value})}
               className="w-full p-4 border border-gray-200 dark:border-gray-600 rounded-2xl font-bold text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-violet-500 outline-none bg-white dark:bg-gray-800"
            >
               {fruits.map(f => (
                  <option key={f.id} value={f.name}>{f.name.replace(/_/g, ' ')}</option>
               ))}
            </select>
         </div>

         <div className="space-y-2 lg:col-span-3">
            <label className="text-[10px] font-black text-violet-800 uppercase tracking-widest ml-1">Linha de Envase</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
               {Object.keys(lineMap).map(l => (
                  <button
                    key={l}
                    type="button"
                    onClick={() => setFormData({...formData, linha: l})}
                    className={`p-3 rounded-xl text-[9px] font-black border transition-all ${formData.linha === l ? 'bg-violet-600 text-white border-violet-700 shadow-md' : 'bg-white dark:bg-gray-800 text-gray-400 border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:bg-gray-900/50'}`}
                  >
                    {l.replace('_', ' ')}
                  </button>
               ))}
            </div>
         </div>

      </div>

      <div className="pt-6 flex flex-col md:flex-row justify-end gap-4">
        <button 
            type="button" 
            onClick={handleFetchHistory}
            className="px-8 py-4 bg-white dark:bg-gray-800 border-2 border-violet-100 text-violet-600 font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl hover:bg-violet-50 transition-all flex items-center justify-center gap-2"
        >
            {loadingHistory ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-history"></i>}
            <span>Ver Histórico</span>
        </button>

        <button disabled={isSubmitting} className="px-12 py-4 bg-violet-800 hover:bg-violet-900 text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl shadow-xl transition-all flex items-center justify-center gap-2">
          {isSubmitting ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-check-circle"></i>}
          <span>Oficializar Lote</span>
        </button>
      </div>

      {/* Modal Histórico */}
      {showHistory && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 w-full max-w-2xl rounded-[2rem] shadow-2xl flex flex-col max-h-[80vh] animate-scaleIn">
                <div className="p-6 border-b flex justify-between items-center bg-violet-50 rounded-t-[2rem]">
                    <div>
                        <h3 className="text-xl font-black text-violet-900">Histórico de Lotes</h3>
                        <p className="text-xs text-violet-600 font-medium mt-1">Últimos 20 registros gerados</p>
                    </div>
                    <button onClick={() => setShowHistory(false)} className="w-10 h-10 rounded-full bg-white dark:bg-gray-800 text-gray-400 hover:text-red-500 hover:bg-red-50 flex items-center justify-center transition-all">
                        <i className="fas fa-times"></i>
                    </button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-2 custom-scrollbar">
                    {historyRecords.length > 0 ? (
                        <div className="divide-y">
                            {historyRecords.map((record) => (
                                <div key={record.id} className="p-4 hover:bg-gray-50 dark:bg-gray-900/50 flex justify-between items-center transition-colors">
                                    <div>
                                        <div className="text-lg font-mono font-black text-[#1A2B34] tracking-tight">{record.data?.generatedCode}</div>
                                        <div className="text-[10px] text-gray-400 font-bold uppercase mt-1 flex gap-3">
                                            <span><i className="far fa-calendar-alt mr-1"></i>{new Date(record.timestamp).toLocaleDateString('pt-BR')}</span>
                                            <span><i className="far fa-clock mr-1"></i>{new Date(record.timestamp).toLocaleTimeString('pt-BR')}</span>
                                            <span className="text-violet-600"><i className="far fa-user mr-1"></i>{record.user_name}</span>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => {
                                            navigator.clipboard.writeText(record.data?.generatedCode);
                                            toast.success('Código copiado!');
                                        }}
                                        className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-400 hover:bg-violet-100 hover:text-violet-600 flex items-center justify-center transition-all"
                                        title="Copiar"
                                    >
                                        <i className="fas fa-copy"></i>
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="p-10 text-center text-gray-400 text-xs font-bold uppercase tracking-widest">
                            Nenhum histórico encontrado
                        </div>
                    )}
                </div>
            </div>
        </div>
      )}

    </form>
  );
};

export default BatchGenerationForm;
