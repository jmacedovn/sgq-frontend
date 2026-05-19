
import React, { useState } from 'react';
import { User } from '../types';
import { api } from '../lib/api';
import { normalizeUserRole } from '../lib/roles';
import { normalizePermissions } from '../lib/permissions';

interface LoginProps {
  onLogin: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const data = await api.getRecords('users', { username: username.trim().toLowerCase() });

      const userFound = data && data.length > 0 ? data[0] : null;

      if (!userFound) {
        setError('Usuário não encontrado.');
        setIsLoading(false);
        return;
      }

      if (userFound.password === password) {
        onLogin({
          id: userFound.id,
          name: userFound.name,
          username: userFound.username,
          role: normalizeUserRole(userFound.role),
          permissions: normalizePermissions(userFound.permissions)
        });
      } else {
        setError('Senha incorreta.');
      }
    } catch (err: any) {
      console.error('Erro fatal no login:', err);
      setError('Falha na conexão com o servidor local. Verifique se o backend está rodando.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center items-center p-4 relative transition-colors duration-300">
      <div className="absolute top-4 right-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">v1.3.0</div>
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-[2.5rem] shadow-2xl p-10 border border-gray-100 dark:border-gray-700">
        <div className="text-center mb-10">
          <div className="inline-block mb-8 transition-transform hover:scale-105 duration-500">
            <img
              src="./gota.png"
              alt="Via Néctare Logo"
              className="h-24 w-auto object-contain mx-auto"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "https://via.placeholder.com/400x100?text=VIA+NECTARE";
              }}
            />
          </div>
          <h2 className="text-3xl font-black text-[#1A2B34] dark:text-white tracking-tight">Portal da Qualidade</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-[11px] font-bold border border-red-100 flex flex-col gap-2 animate-pulse">
              <div className="flex items-center gap-3">
                <i className="fas fa-exclamation-circle text-lg"></i>
                <span>{error}</span>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Usuário</label>
            <div className="relative group">
              <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-400 group-focus-within:text-[#E3851B] transition-colors">
                <i className="fas fa-user"></i>
              </span>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="block w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-2xl focus:ring-2 focus:ring-[#E3851B] focus:border-[#E3851B] focus:bg-white dark:focus:bg-gray-600 text-gray-900 dark:text-white text-sm transition-all outline-none font-medium"
                placeholder="Seu login"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Senha</label>
            <div className="relative group">
              <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-400 group-focus-within:text-[#E3851B] transition-colors">
                <i className="fas fa-lock"></i>
              </span>
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full pl-12 pr-12 py-4 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-2xl focus:ring-2 focus:ring-[#E3851B] focus:border-[#E3851B] focus:bg-white dark:focus:bg-gray-600 text-gray-900 dark:text-white text-sm transition-all outline-none font-medium"
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

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#E3851B] hover:bg-[#c97415] text-white font-black py-4 px-6 rounded-2xl shadow-xl shadow-orange-100 transition-all flex items-center justify-center gap-3 disabled:opacity-70 active:scale-95 group"
          >
            {isLoading ? (
              <i className="fas fa-spinner fa-spin"></i>
            ) : (
              <>
                <span>ACESSAR SISTEMA</span>
                <i className="fas fa-chevron-right text-xs group-hover:translate-x-1 transition-transform"></i>
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-8 border-t border-gray-50 text-center">
            <p className="text-[9px] text-gray-300 font-black uppercase tracking-[0.4em]">VN. TECNOLOGIA E QUALIDADE</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
