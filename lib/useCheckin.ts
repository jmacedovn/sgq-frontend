
import { useState } from 'react';
import { api } from './api';
import { toast } from 'sonner';

export const useCheckin = () => {
  const [loading, setLoading] = useState(false);

  const getCheckinByOrder = async (orderNumber: string) => {
    setLoading(true);
    try {
      // Buscar registro básico
      const registros = await api.getRecords('chkmatp_registros', { numero_ordem: orderNumber });
      
      if (!registros || registros.length === 0) {
        toast.error('Número de ordem não encontrado');
        return null;
      }

      const registro = registros[0];

      // Buscar análise de qualidade vinculada
      const analises = await api.getRecords('chkmatp_qualidade', { numero_ordem: orderNumber });
      const analise = analises && analises.length > 0 ? analises[0] : null;

      // Buscar inspeção vinculada
      const inspecoes = await api.getRecords('chkmatp_inspecoes', { numero_ordem: orderNumber });
      const inspecao = inspecoes && inspecoes.length > 0 ? inspecoes[0] : null;

      return {
        registro,
        analise,
        inspecao
      };
    } catch (error) {
      console.error('Erro ao buscar check-in:', error);
      toast.error('Erro ao conectar com o banco de dados');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const getCheckinByPlate = async (plate: string) => {
    setLoading(true);
    try {
      // Buscar o último registro ativo para esta placa (status não finalizado)
      const registros = await api.getRecords('chkmatp_registros', { placa_veiculo: plate.toUpperCase() });
      
      if (!registros || registros.length === 0) {
        toast.error('Nenhum registro encontrado para esta placa');
        return null;
      }

      // Pegar o registro mais recente (assumindo que a API retorna ordenado ou pegamos o último)
      const registro = registros[registros.length - 1];
      const orderNumber = registro.numero_ordem;

      const analises = await api.getRecords('chkmatp_qualidade', { numero_ordem: orderNumber });
      const analise = analises && analises.length > 0 ? analises[0] : null;

      const inspecoes = await api.getRecords('chkmatp_inspecoes', { numero_ordem: orderNumber });
      const inspecao = inspecoes && inspecoes.length > 0 ? inspecoes[0] : null;

      return {
        registro,
        analise,
        inspecao
      };
    } catch (error) {
      console.error('Erro ao buscar check-in por placa:', error);
      toast.error('Erro ao conectar com o banco de dados');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    getCheckinByOrder,
    getCheckinByPlate,
    loading
  };
};
