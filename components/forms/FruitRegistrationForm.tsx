
import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { toast } from 'sonner';
import { Fruit } from '../../types';

interface FruitRegistrationFormProps {
  onSave: (data: any) => void;
  isSubmitting: boolean;
  initialData?: any;
}

const FruitRegistrationForm: React.FC<FruitRegistrationFormProps> = ({ onSave, isSubmitting }) => {
  const [formData, setFormData] = useState({
    type: '',
    code: ''
  });

  const [registeredFruits, setRegisteredFruits] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchRegisteredFruits = async () => {
    try {
      const data = await api.getRecords('records', { form_type: 'fruit-registration' });
      setRegisteredFruits(data);
    } catch (error) {
      console.error('Erro ao buscar frutas registradas:', error);
      toast.error('Erro ao carregar lista de frutas.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRegisteredFruits();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.type || !formData.code) {
      toast.error('Preencha todos os campos obrigatórios.');
      return;
    }

    // O nome completo será apenas o tipo
    const fullName = formData.type.toUpperCase();

    const payload = {
      form_type: 'fruit-registration',
      data: {
        ...formData,
        name: fullName
      },
      timestamp: new Date().toISOString()
    };

    try {
      await api.insertRecord('records', payload);
      toast.success('Fruta cadastrada com sucesso!');
      setFormData({ type: '', code: '' });
      fetchRegisteredFruits();
    } catch (error: any) {
      toast.error('Erro ao cadastrar fruta: ' + error.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta fruta?')) return;
    
    try {
      await api.deleteRecord('records', id);
      toast.success('Fruta excluída com sucesso.');
      fetchRegisteredFruits();
    } catch (error: any) {
      toast.error('Erro ao excluir: ' + error.message);
    }
  };

  return (
    <div className="space-y-8">
      {/* Formulário de Cadastro */}
      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm space-y-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
            <i className="fas fa-plus"></i>
          </div>
          <h3 className="text-lg font-black text-gray-800 dark:text-white uppercase tracking-tight">Nova Fruta</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Tipo de Fruta (ex: MANGA)</label>
            <input 
              type="text"
              value={formData.type}
              onChange={(e) => setFormData({...formData, type: e.target.value.toUpperCase()})}
              placeholder="Ex: MANGA"
              className="w-full p-3 rounded-xl border-gray-200 dark:border-gray-600 border focus:ring-2 focus:ring-green-500 bg-transparent dark:text-white"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Código da Fruta</label>
            <input 
              type="text"
              value={formData.code}
              onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
              placeholder="Ex: MNG-001"
              className="w-full p-3 rounded-xl border-gray-200 dark:border-gray-600 border focus:ring-2 focus:ring-green-500 bg-transparent dark:text-white"
            />
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button 
            type="submit"
            disabled={isSubmitting}
            className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white font-black rounded-xl shadow-lg shadow-green-200 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {isSubmitting ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-save"></i>}
            CADASTRAR FRUTA
          </button>
        </div>
      </form>

      {/* Lista de Frutas Cadastradas */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-50 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50 flex justify-between items-center">
          <h3 className="text-sm font-black text-gray-800 dark:text-white uppercase tracking-widest">Frutas Cadastradas</h3>
          <span className="text-[10px] font-black bg-white dark:bg-gray-800 px-3 py-1 rounded-full border border-gray-100 dark:border-gray-700 text-gray-400">
            {registeredFruits.length} TOTAL
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Código</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Fruta</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-400">
                    <i className="fas fa-spinner fa-spin mr-2"></i> Carregando frutas...
                  </td>
                </tr>
              ) : registeredFruits.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-400 font-bold uppercase text-[10px]">
                    Nenhuma fruta cadastrada.
                  </td>
                </tr>
              ) : (
                registeredFruits.map((fruit) => (
                  <tr key={fruit.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-mono font-black text-green-600 bg-green-50 dark:bg-green-900/30 px-2 py-1 rounded text-xs">
                        {fruit.data.code}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-black text-gray-800 dark:text-white uppercase">{fruit.data.type}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => handleDelete(fruit.id)}
                        className="w-8 h-8 rounded-lg bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all"
                        title="Excluir"
                      >
                        <i className="fas fa-trash-can text-xs"></i>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default FruitRegistrationForm;
