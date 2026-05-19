import React, { useState, useEffect } from 'react';
import { User, UserRole, FormType, LogType } from '../types';
import { FORMS_CONFIG } from '../constants';
import { api } from '../lib/api';
import { createLog } from '../utils/logger';
import { toast } from 'sonner';
import { formatUserRole, normalizeUserRole } from '../lib/roles';
import { normalizePermissions } from '../lib/permissions';

interface UserManagementProps {
  onBack: () => void;
}

const UserManagement: React.FC<UserManagementProps> = ({ onBack }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<Partial<User> | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [formSearchTerm, setFormSearchTerm] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem('sgq_user');
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setCurrentUser({
        ...parsedUser,
        role: normalizeUserRole(parsedUser.role),
        permissions: normalizePermissions(parsedUser.permissions)
      });
    }
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const data = await api.getRecords('users', { order: 'name', orderDirection: 'asc' });
      
      const mappedUsers: User[] = (data || []).map((u: any) => ({
        id: u.id,
        name: u.name,
        username: u.username,
        password: u.password,
        role: normalizeUserRole(u.role),
        permissions: normalizePermissions(u.permissions)
      }));
      
      setUsers(mappedUsers);
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = (user?: User) => {
    setEditingUser(user || {
      name: '',
      username: '',
      password: '',
      role: 'OPERADOR' as UserRole,
      permissions: []
    });
    setIsModalOpen(true);
  };

  const handleTogglePermission = (type: FormType) => {
    if (!editingUser) return;
    const currentPerms = normalizePermissions(editingUser.permissions);
    const newPerms = currentPerms.includes(type)
      ? currentPerms.filter(p => p !== type)
      : [...currentPerms, type];
    setEditingUser({ ...editingUser, permissions: newPerms });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser?.name || !editingUser?.username || !editingUser?.password) {
      toast.error('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    try {
      const userData = {
        name: editingUser.name,
        username: editingUser.username?.toLowerCase(),
        password: editingUser.password,
        role: editingUser.role || 'OPERADOR',
        permissions: JSON.stringify(editingUser.permissions || [])
      };

      if (editingUser.id) {
        // Update
        await api.updateRecord('users', editingUser.id, userData);
        if (currentUser) await createLog(currentUser, LogType.MANAGEMENT, `Editou o usuário: ${editingUser.name}`, `@${editingUser.username}`);
      } else {
        // Create
        await api.insertRecord('users', [userData]);
        if (currentUser) await createLog(currentUser, LogType.MANAGEMENT, `Criou novo usuário: ${editingUser.name}`, `@${editingUser.username}`);
      }
      setIsModalOpen(false);
      fetchUsers();
    } catch (error) {
      console.error('Erro ao salvar usuário:', error);
      const message = error instanceof Error ? error.message : '';
      if (message.includes('users_username_key') || message.includes('already exists') || message.includes('já existe')) {
        toast.error('Já existe um usuário com esse login.');
      } else {
        toast.error(message || 'Erro ao salvar usuário no banco de dados.');
      }
    }
  };

  const handleDelete = async (id: string) => {
    const userToDelete = users.find(u => u.id === id);
    if (userToDelete && confirm(`Deseja realmente excluir o usuário ${userToDelete.name}?`)) {
      try {
        await api.deleteRecord('users', id);
        if (currentUser) await createLog(currentUser, LogType.MANAGEMENT, `Excluiu o usuário: ${userToDelete.name}`, `@${userToDelete.username}`);
        fetchUsers();
      } catch (error) {
        console.error('Erro ao excluir usuário:', error);
      }
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-[#1A2B34] tracking-tight">Gestão de Usuários</h2>
          <p className="text-gray-500 mt-1 font-medium">Sincronizado com Supabase Database.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={onBack}
            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 px-6 py-3 rounded-2xl text-xs font-black text-gray-500 hover:bg-gray-50 dark:bg-gray-900/50 transition-all uppercase tracking-widest"
          >
            Voltar
          </button>
          <button 
            onClick={() => handleOpenModal()}
            className="bg-[#E3851B] text-white px-6 py-3 rounded-2xl text-xs font-black hover:bg-[#c97415] transition-all uppercase tracking-widest shadow-lg shadow-orange-100 flex items-center gap-2"
          >
            <i className="fas fa-plus"></i> Novo Usuário
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
        {isLoading ? (
           <div className="p-20 text-center text-gray-300">
             <i className="fas fa-spinner fa-spin text-2xl mb-2"></i>
             <p className="text-[10px] font-black uppercase">Carregando usuários...</p>
           </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                  <th className="px-8 py-5">Nome / Login</th>
                  <th className="px-8 py-5">Perfil</th>
                  <th className="px-8 py-5">Acessos Liberados</th>
                  <th className="px-8 py-5 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-orange-50/10 transition-colors">
                    <td className="px-8 py-5">
                      <div className="font-black text-[#1A2B34]">{u.name}</div>
                      <div className="text-xs text-gray-400 font-medium">@{u.username}</div>
                    </td>
                    <td className="px-8 py-5">
                      <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${u.role === 'ADMIN_TI' ? 'bg-orange-100 text-orange-700' : u.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                        {formatUserRole(u.role)}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex flex-wrap gap-1 max-w-md">
                        {u.role === 'ADMIN' || u.role === 'ADMIN_TI' ? (
                          <span className="text-[10px] font-bold text-green-600 italic">Acesso Total (Master)</span>
                        ) : u.permissions && u.permissions.length > 0 ? (
                          u.permissions.map(p => {
                            const config = FORMS_CONFIG.find(f => f.type === p);
                            return (
                              <span key={p} className="bg-gray-100 dark:bg-gray-700 text-gray-500 px-2 py-0.5 rounded text-[8px] font-bold border border-gray-200 dark:border-gray-600 uppercase">
                                {config?.code.split('-')[0] || p}
                              </span>
                            )
                          })
                        ) : (
                          <span className="text-[10px] text-red-400 font-bold">Nenhum formulário liberado</span>
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-5 text-right space-x-2">
                      <button onClick={() => handleOpenModal(u)} className="p-2 text-gray-400 hover:text-[#E3851B] transition-colors"><i className="fas fa-edit"></i></button>
                      {u.username !== 'admin' && (
                        <button onClick={() => handleDelete(u.id)} className="p-2 text-gray-400 hover:text-red-500 transition-colors"><i className="fas fa-trash-alt"></i></button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isModalOpen && editingUser && (
        <div className="fixed inset-0 bg-[#1A2B34]/60 backdrop-blur-md z-[100] flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-gray-800 rounded-[3rem] w-full max-w-2xl shadow-2xl animate-scaleIn my-auto">
            <div className="p-8 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
              <h3 className="text-2xl font-black text-[#1A2B34]">{editingUser.id ? 'Editar Usuário' : 'Novo Usuário'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-300 hover:text-gray-500 transition-colors"><i className="fas fa-times text-xl"></i></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Nome Completo</label>
                  <input 
                    required 
                    value={editingUser.name} 
                    onChange={e => setEditingUser({...editingUser, name: e.target.value})}
                    className="w-full bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-700 p-4 rounded-2xl outline-none focus:ring-2 focus:ring-[#E3851B] font-medium"
                    placeholder="Ex: João da Silva"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Login de Acesso</label>
                  <input 
                    required 
                    value={editingUser.username} 
                    onChange={e => setEditingUser({...editingUser, username: e.target.value})}
                    className="w-full bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-700 p-4 rounded-2xl outline-none focus:ring-2 focus:ring-[#E3851B] font-medium"
                    placeholder="Ex: joao.qualidade"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Senha do Usuário</label>
                <div className="relative group">
                  <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-300 group-focus-within:text-[#E3851B]">
                    <i className="fas fa-lock"></i>
                  </span>
                  <input 
                    required 
                    type={showPassword ? "text" : "password"}
                    value={editingUser.password} 
                    onChange={e => setEditingUser({...editingUser, password: e.target.value})}
                    className="w-full bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-700 pl-12 pr-12 py-4 rounded-2xl outline-none focus:ring-2 focus:ring-[#E3851B] font-medium"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-[#E3851B] transition-colors focus:outline-none"
                  >
                    <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Perfil de Acesso</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 p-1 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-700">
                  <button 
                    type="button"
                    onClick={() => setEditingUser({...editingUser, role: 'OPERADOR'})}
                    className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${editingUser.role === 'OPERADOR' ? 'bg-white dark:bg-gray-800 text-blue-600 shadow-sm border border-blue-50' : 'text-gray-400'}`}
                  >
                    Operador
                  </button>
                  <button 
                    type="button"
                    onClick={() => setEditingUser({...editingUser, role: 'ADMIN'})}
                    className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${editingUser.role === 'ADMIN' ? 'bg-white dark:bg-gray-800 text-purple-600 shadow-sm border border-purple-50' : 'text-gray-400'}`}
                  >
                    Administrador
                  </button>
                  <button 
                    type="button"
                    onClick={() => setEditingUser({...editingUser, role: 'ADMIN_TI'})}
                    className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${editingUser.role === 'ADMIN_TI' ? 'bg-white dark:bg-gray-800 text-orange-600 shadow-sm border border-orange-50' : 'text-gray-400'}`}
                  >
                    Admin TI
                  </button>
                </div>
              </div>

              {editingUser.role === 'OPERADOR' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Permissões de Formulários</label>
                    <div className="relative w-1/2">
                      <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs"></i>
                      <input 
                        type="text" 
                        placeholder="Pesquisar formulário..." 
                        value={formSearchTerm}
                        onChange={(e) => setFormSearchTerm(e.target.value)}
                        className="w-full pl-8 pr-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#E3851B]"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-2 max-h-64 overflow-y-auto p-2 pr-4 custom-scrollbar">
                    {FORMS_CONFIG.filter(f => f.title.toLowerCase().includes(formSearchTerm.toLowerCase()) || f.code.toLowerCase().includes(formSearchTerm.toLowerCase())).map(form => (
                      <label key={form.id} className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-700 cursor-pointer hover:bg-orange-50/30 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg ${form.color} flex items-center justify-center text-white text-[10px]`}>
                            <i className={`fas ${form.icon}`}></i>
                          </div>
                          <div>
                            <div className="text-xs font-black text-[#1A2B34]">{form.title}</div>
                            <div className="text-[9px] text-gray-400 font-bold font-mono">{form.code}</div>
                          </div>
                        </div>
                        <input 
                          type="checkbox" 
                          className="w-5 h-5 rounded-lg border-gray-300 dark:border-gray-600 text-[#E3851B] focus:ring-[#E3851B] bg-transparent dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                          checked={normalizePermissions(editingUser.permissions).includes(form.type)}
                          onChange={() => handleTogglePermission(form.type)}
                        />
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-6 flex gap-4">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-gray-600 dark:text-gray-300 transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="flex-1 bg-[#1A2B34] text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-[#2c4755] transition-all shadow-xl shadow-gray-200"
                >
                  Salvar Usuário
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
