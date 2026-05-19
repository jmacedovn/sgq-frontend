import { useState, useEffect } from 'react';
import { api } from './api';
import { Fruit } from '../types';

export const useFruits = () => {
  const [fruits, setFruits] = useState<Fruit[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchFruits = async () => {
    setIsLoading(true);
    try {
      // Busca frutas do novo sistema de cadastro
      const data = await api.getRecords('records', { 
        form_type: 'fruit-registration' 
      });

      if (data && data.length > 0) {
        const formattedFruits: Fruit[] = data.map((record: any) => ({
          id: record.id,
          ...record.data
        }));
        setFruits(formattedFruits);
      } else {
        setFruits([]);
      }
    } catch (error) {
      console.error('Erro ao buscar frutas:', error);
      setFruits([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFruits();
  }, []);

  return { 
    fruits, 
    isLoading,
    refreshFruits: fetchFruits
  };
};
