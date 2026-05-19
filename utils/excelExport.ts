
import * as XLSX from 'xlsx';

/**
 * Utilitário otimizado para transformar JSON complexo em planilha tratada.
 * Agora utiliza processamento assíncrono para evitar travamento da UI.
 */
export const exportToExcel = async (records: any[], fileName: string = 'Relatorio_SGQ') => {
  return new Promise<void>((resolve, reject) => {
    try {
      if (!records || records.length === 0) {
        alert('Não há dados para exportar.');
        return resolve();
      }

      const finalRows: any[] = [];

      // Cache de nomes de colunas para evitar processamento repetitivo de string
      const keyCache = new Map<string, string>();
      const formatKey = (key: string, prefix = '') => {
        const cacheId = `${prefix}_${key}`;
        if (keyCache.has(cacheId)) return keyCache.get(cacheId)!;

        const cleanKey = key.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ').trim().toUpperCase();
        const formatted = prefix ? `${prefix} - ${cleanKey}` : cleanKey;
        keyCache.set(cacheId, formatted);
        return formatted;
      };

      // Função de achatamento otimizada (iteração em vez de recursão profunda se possível)
      const flatten = (obj: any, prefix = ''): any => {
        const result: any = {};
        if (!obj || typeof obj !== 'object') return result;

        const keys = Object.keys(obj);
        for (let i = 0; i < keys.length; i++) {
          const key = keys[i];
          const value = obj[key];
          const newKey = formatKey(key, prefix);

          if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
            const flattenedSub = flatten(value, newKey);
            Object.assign(result, flattenedSub);
          } else if (Array.isArray(value)) {
            if (value.length > 0 && typeof value[0] !== 'object') {
              result[newKey] = value.join(', ');
            }
            // Arrays de objetos são ignorados aqui e tratados na lógica de repetição de linhas
          } else {
            if (typeof value === 'boolean') {
              result[newKey] = value ? 'SIM' : 'NÃO';
            } else if (key.toLowerCase().includes('data') && typeof value === 'string' && value.includes('-')) {
              // Formata data ISO para DD/MM/YYYY
              const parts = value.split('T')[0].split('-');
              result[newKey] = parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : value;
            } else {
              result[newKey] = value;
            }
          }
        }
        return result;
      };

      // Processamento por partes (chunks) para não bloquear o event loop
      const processBatch = (startIndex: number) => {
        try {
          const batchSize = 100; // Processa 100 registros por vez
          const endIndex = Math.min(startIndex + batchSize, records.length);

          for (let i = startIndex; i < endIndex; i++) {
            const record = records[i];
            
            // Metadados base
            const baseInfo = {
              'ID_SISTEMA': record.id,
              'DATA_REGISTRO': new Date(record.timestamp).toLocaleDateString('pt-BR'),
              'HORA_REGISTRO': new Date(record.timestamp).toLocaleTimeString('pt-BR'),
              'USUARIO': record.user_name?.toUpperCase() || 'SISTEMA',
              'COD_PROTOCOLO': record.form_code,
              'NOME_PROTOCOLO': record.form_type?.replace(/-/g, ' ').toUpperCase(),
            };

            const rawData = record.data;

            // Caso 1: Data é um Array direto
            if (Array.isArray(rawData)) {
              rawData.forEach((item, idx) => {
                finalRows.push({
                  ...baseInfo,
                  'SEQUENCIA_ITEM': idx + 1,
                  ...flatten(item)
                });
              });
            } 
            // Caso 2: Objeto com tabelas internas (Ex: rows, items, processRows, evaporatorRows)
            else if (rawData && typeof rawData === 'object') {
              const arrayKeys = Object.keys(rawData).filter(k => Array.isArray(rawData[k]));
              
              if (arrayKeys.length > 0) {
                const nonArrayData = { ...rawData };
                arrayKeys.forEach(k => delete nonArrayData[k]);
                const flattenedHeader = flatten(nonArrayData);

                arrayKeys.forEach(arrayKey => {
                  const internalArray = rawData[arrayKey];
                  internalArray.forEach((item: any, idx: number) => {
                    finalRows.push({
                      ...baseInfo,
                      'TABELA': formatKey(arrayKey),
                      'SEQUENCIA_ITEM': idx + 1,
                      ...flattenedHeader,
                      ...flatten(item)
                    });
                  });
                });
              } else {
                // Caso 3: Objeto simples
                finalRows.push({
                  ...baseInfo,
                  ...flatten(rawData)
                });
              }
            }
          }

          if (endIndex < records.length) {
            // Próximo lote no próximo "tick" do navegador
            setTimeout(() => processBatch(endIndex), 0);
          } else {
            // Finalizou o processamento, gerar o arquivo
            generateFile();
          }
        } catch (error) {
          console.error('Erro no processamento do lote:', error);
          reject(error);
        }
      };

      const generateFile = () => {
        try {
          const worksheet = XLSX.utils.json_to_sheet(finalRows);
          
          // Ajuste básico de colunas
          const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
          const cols = [];
          for (let i = range.s.c; i <= range.e.c; i++) {
            cols.push({ wch: 18 });
          }
          worksheet['!cols'] = cols;

          const workbook = XLSX.utils.book_new();
          XLSX.utils.book_append_sheet(workbook, worksheet, "Dados SGQ");

          const timestamp = new Date().getTime();
          XLSX.writeFile(workbook, `${fileName}_${timestamp}.xlsx`);
          resolve();
        } catch (error) {
          console.error('Erro ao gerar arquivo Excel:', error);
          reject(error);
        }
      };

      // Inicia o processamento assíncrono
      processBatch(0);

    } catch (error) {
      console.error('Erro crítico na exportação Excel:', error);
      reject(error);
    }
  });
};
