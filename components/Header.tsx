
import React, { useState, useRef, useEffect } from 'react';
import { User } from '../types';
import { toast } from 'sonner';
import { useTheme } from '../lib/theme';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../lib/db';
import { syncService } from '../lib/sync';
import { formatUserRole, isAdminRole } from '../lib/roles';

interface HeaderProps {
  user: User;
  onLogout: () => void;
  onHome: () => void;
  onReports: () => void;
  onExportExcel: () => void;
  onSettings: () => void;
  onPending: () => void;
  onAnalytics: () => void;
  activeView: string;
}

const Header: React.FC<HeaderProps> = ({ user, onLogout, onHome, onReports, onExportExcel, onSettings, onPending, onAnalytics, activeView }) => {
  const isAdmin = isAdminRole(user.role);
  const [reportsOpen, setReportsOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [notificationStatus, setNotificationStatus] = useState<NotificationPermission>('default');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { theme, toggleTheme } = useTheme();
  
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const pendingCount = useLiveQuery(() => db.syncQueue.count(), []) || 0;

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast.success('Conexão restabelecida. Sincronizando dados...');
      syncService.processSyncQueue();
    };
    const handleOffline = () => {
      setIsOnline(false);
      toast.warning('Você está offline. Alterações serão salvas localmente.');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    if ('Notification' in window) {
      setNotificationStatus(Notification.permission);
    }
  }, []);

  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      toast.error('Seu navegador não suporta notificações ou requer conexão segura (HTTPS).');
      return;
    }

    try {
      const handlePermission = (permission: NotificationPermission) => {
        setNotificationStatus(permission);
        if (permission === 'granted') {
          toast.success('Notificações ativadas com sucesso!');
        } else if (permission === 'denied') {
          toast.error('Permissão negada. Verifique as configurações do site no navegador.');
        }
      };

      const permissionPromise = Notification.requestPermission(handlePermission);
      // Fallback para navegadores que retornam promise (padrão moderno)
      if (permissionPromise && typeof permissionPromise.then === 'function') {
        permissionPromise.then(handlePermission).catch(console.error);
      }
    } catch (error) {
      console.error('Erro ao ativar notificações:', error);
      toast.error('Ocorreu um erro ao tentar ativar as notificações.');
    }
  };

  useEffect(() => {
    const controlNavbar = () => {
      if (typeof window !== 'undefined') {
        if (window.scrollY > lastScrollY && window.scrollY > 100) { // Scrolling down
          setIsVisible(false);
        } else { // Scrolling up
          setIsVisible(true);
        }
        setLastScrollY(window.scrollY);
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('scroll', controlNavbar);
      return () => {
        window.removeEventListener('scroll', controlNavbar);
      };
    }
  }, [lastScrollY]);

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isMenuOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setReportsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleReportOptionClick = () => {
    onReports();
    setReportsOpen(false);
  };

  const handleExportClick = () => {
    onExportExcel();
    setReportsOpen(false);
  };

  return (
    <>
      <header className="bg-white dark:bg-[#1A2B34] shadow-md border-b border-gray-100 dark:border-white/10 sticky top-0 z-50 transition-colors duration-300">
        <div className="container mx-auto px-4 h-16 md:h-20 flex items-center justify-between">
          <div 
            className="flex items-center gap-3 md:gap-4 cursor-pointer group" 
            onClick={onHome}
          >
            <div className="h-10 md:h-14 w-auto flex items-center justify-center transition-all duration-300 group-hover:scale-110">
              <img
                src="./logo.png"
                alt="Gota Via Néctare"
                className="h-full w-auto object-contain drop-shadow-[0_4px_10px_rgba(227,133,27,0.4)]"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "https://via.placeholder.com/50?text=VN";
                }}
              />
            </div>
            <div className="border-l-2 border-white/20 pl-3 md:pl-4 py-1">

            </div>
          </div>

          <nav className="hidden lg:flex items-center gap-2 bg-gray-50 dark:bg-white/5 p-1.5 rounded-2xl border border-gray-100 dark:border-white/10 shadow-inner backdrop-blur-sm transition-colors">
            <button 
              onClick={onHome}
              className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-200 flex items-center gap-2 ${activeView === 'dashboard' || activeView === 'form' ? 'bg-[#E3851B] text-white shadow-md scale-105 z-10' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
            >
              <i className="fas fa-house"></i> Início
            </button>

            <button 
              onClick={onPending}
              className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-200 flex items-center gap-2 ${activeView === 'pending' ? 'bg-[#E3851B] text-white shadow-md scale-105 z-10' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-white dark:hover:bg-white/5'}`}
            >
              <i className="fas fa-clock"></i> Pendentes
            </button>

            <button 
              onClick={onAnalytics}
              className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-200 flex items-center gap-2 ${activeView === 'analytics' ? 'bg-[#E3851B] text-white shadow-md scale-105 z-10' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-white dark:hover:bg-white/5'}`}
            >
              <i className="fas fa-chart-area"></i> Estatísticas
            </button>
            
            <div className="relative" ref={dropdownRef}>
              <button 
                onClick={() => setReportsOpen(!reportsOpen)}
                className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-200 flex items-center gap-2 ${activeView === 'reports' ? 'bg-[#E3851B] text-white shadow-md scale-105 z-10' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-white dark:hover:bg-white/5'}`}
              >
                <i className="fas fa-chart-line"></i> Relatórios
                <i className={`fas fa-chevron-down text-[8px] transition-transform ${reportsOpen ? 'rotate-180' : ''}`}></i>
              </button>

              {reportsOpen && (
                <div className="absolute top-full left-0 mt-2 w-64 bg-white dark:bg-[#2A3F4C] rounded-2xl shadow-2xl border border-gray-100 dark:border-white/10 py-3 animate-scaleIn z-[100] transition-colors">
                  <button onClick={handleReportOptionClick} className="w-full text-left px-6 py-3.5 text-[11px] font-black text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white transition-colors uppercase tracking-wider">Histórico Geral</button>
                  <div className="mx-4 my-2 border-t border-gray-100 dark:border-white/10"></div>
                  <button onClick={handleExportClick} className="w-full text-left px-6 py-3.5 text-[11px] font-black text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white transition-colors uppercase tracking-wider flex items-center justify-between">
                    Exportar Excel <i className="fas fa-file-excel text-green-400"></i>
                  </button>
                </div>
              )}
            </div>

            {isAdmin && (
              <button onClick={onSettings} className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeView === 'settings' ? 'bg-[#E3851B] text-white shadow-md scale-105' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-white dark:hover:bg-white/5'}`}>
                <i className="fas fa-cog"></i> Configurações
              </button>
            )}
          </nav>

          <div className="flex items-center gap-2 md:gap-4">
            {!isOnline && (
              <div title="Sem conexão local" className="hidden sm:flex items-center justify-center gap-2 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-3 py-1.5 rounded-full border border-red-200 dark:border-red-800 animate-pulse transition-all">
                <i className="fas fa-wifi-slash text-xs"></i>
                <span className="text-[10px] font-black uppercase tracking-wider">Offline</span>
                {pendingCount > 0 && <span className="bg-red-600 text-white rounded-full px-1.5 py-0.5 text-[8px]">{pendingCount}</span>}
              </div>
            )}
            
            {isOnline && pendingCount > 0 && (
              <button 
                onClick={() => syncService.processSyncQueue()}
                className="hidden sm:flex items-center justify-center gap-2 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 px-3 py-1.5 rounded-full border border-amber-200 dark:border-amber-800 hover:bg-amber-100 transition-all cursor-pointer shadow-sm"
                title="Sincronizar formulários salvos offline"
              >
                <i className="fas fa-cloud-upload-alt text-xs animate-bounce"></i>
                <span className="text-[10px] font-black uppercase tracking-wider">Sincronizar ({pendingCount})</span>
              </button>
            )}

            <button
              onClick={toggleTheme}
              className="hidden sm:flex items-center justify-center w-10 h-10 text-gray-400 hover:text-white transition-all rounded-full hover:bg-white/5"
              title={theme === 'dark' ? 'Mudar para Automático' : theme === 'system' ? 'Mudar para Claro' : 'Mudar para Escuro'}
            >
              <i className={`fas ${theme === 'dark' ? 'fa-moon' : theme === 'light' ? 'fa-sun' : 'fa-desktop'}`}></i>
            </button>

            {notificationStatus !== 'granted' && (
              <button 
                onClick={requestNotificationPermission}
                className="hidden sm:flex items-center justify-center w-10 h-10 text-orange-400 hover:text-orange-500 transition-all rounded-full hover:bg-white/5"
                title="Ativar Notificações Push"
              >
                <i className="fas fa-bell-slash"></i>
              </button>
            )}
            {notificationStatus === 'granted' && (
              <div className="hidden sm:flex items-center justify-center w-10 h-10 text-green-400 rounded-full" title="Notificações Ativas">
                <i className="fas fa-bell"></i>
              </div>
            )}
            
            <div className="text-right hidden sm:block">
              <p className="text-xs md:text-sm font-black text-[#1A2B34] dark:text-white leading-none mb-1">{user.name}</p>
              <p className="text-[8px] md:text-[9px] text-gray-400 font-black uppercase tracking-tighter">{formatUserRole(user.role)}</p>
            </div>
            
            <button 
              onClick={() => setIsMenuOpen(true)}
              className="lg:hidden flex items-center justify-center w-10 h-10 bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-white rounded-xl active:scale-90 transition-all"
            >
              <i className="fas fa-bars text-lg"></i>
            </button>

            <button 
              onClick={onLogout}
              className="hidden lg:flex items-center justify-center w-10 h-10 text-gray-400 hover:text-red-400 transition-all rounded-full hover:bg-white/5"
            >
              <i className="fas fa-sign-out-alt text-lg"></i>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="fixed inset-0 bg-[#1A2B34]/80 backdrop-blur-md z-[300] lg:hidden flex flex-col items-center justify-center animate-fadeIn p-6">
          <button 
            onClick={() => setIsMenuOpen(false)}
            className="absolute top-6 right-6 w-14 h-14 flex items-center justify-center bg-white/10 rounded-full text-white text-2xl active:scale-90 transition-all"
          >
            <i className="fas fa-times"></i>
          </button>
          
          <div className="mb-12 text-center">
            <div className="w-20 h-20 bg-white dark:bg-gray-800 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-2xl">
              <img
                src="./gota.png"
                alt="Gota Via Néctare"
                className="w-12 h-auto object-contain drop-shadow-[0_4px_10px_rgba(227,133,27,0.2)]"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "https://via.placeholder.com/50?text=VN";
                }}
              />
            </div>
          </div>

          <nav className="flex flex-col items-center gap-6 w-full max-w-xs">
            <button 
              onClick={() => { onHome(); setIsMenuOpen(false); }} 
              className={`w-full py-4 rounded-2xl font-black text-sm uppercase tracking-[0.2em] transition-all ${activeView === 'dashboard' || activeView === 'form' ? 'bg-[#E3851B] text-white shadow-lg shadow-orange-900/40' : 'text-white/60 hover:text-white'}`}
            >
              <i className="fas fa-house mr-3"></i> Início
            </button>

            <button 
              onClick={() => { onPending(); setIsMenuOpen(false); }} 
              className={`w-full py-4 rounded-2xl font-black text-sm uppercase tracking-[0.2em] transition-all ${activeView === 'pending' ? 'bg-[#E3851B] text-white shadow-lg shadow-orange-900/40' : 'text-white/60 hover:text-white'}`}
            >
              <i className="fas fa-clock mr-3"></i> Pendentes
            </button>

            <button 
              onClick={() => { onAnalytics(); setIsMenuOpen(false); }} 
              className={`w-full py-4 rounded-2xl font-black text-sm uppercase tracking-[0.2em] transition-all ${activeView === 'analytics' ? 'bg-[#E3851B] text-white shadow-lg shadow-orange-900/40' : 'text-white/60 hover:text-white'}`}
            >
              <i className="fas fa-chart-area mr-3"></i> Estatísticas
            </button>
            
            <button 
              onClick={() => { onReports(); setIsMenuOpen(false); }} 
              className={`w-full py-4 rounded-2xl font-black text-sm uppercase tracking-[0.2em] transition-all ${activeView === 'reports' ? 'bg-[#E3851B] text-white shadow-lg shadow-orange-900/40' : 'text-white/60 hover:text-white'}`}
            >
              <i className="fas fa-chart-line mr-3"></i> Relatórios
            </button>

            {isAdmin && (
              <button 
                onClick={() => { onSettings(); setIsMenuOpen(false); }} 
                className={`w-full py-4 rounded-2xl font-black text-sm uppercase tracking-[0.2em] transition-all ${activeView === 'settings' ? 'bg-[#E3851B] text-white shadow-lg shadow-orange-900/40' : 'text-white/60 hover:text-white'}`}
              >
                <i className="fas fa-cog mr-3"></i> Configurações
              </button>
            )}

            {notificationStatus !== 'granted' && (
              <button 
                onClick={requestNotificationPermission} 
                className="w-full py-4 rounded-2xl font-black text-sm uppercase tracking-[0.2em] text-orange-400 hover:bg-orange-500/10 transition-all"
              >
                <i className="fas fa-bell-slash mr-3"></i> Ativar Notificações
              </button>
            )}
            {notificationStatus === 'granted' && (
              <div className="w-full py-4 rounded-2xl font-black text-sm uppercase tracking-[0.2em] text-green-400 text-center">
                <i className="fas fa-bell mr-3"></i> Notificações Ativas
              </div>
            )}

            {!isOnline && (
              <div className="w-full py-4 rounded-2xl font-black text-sm uppercase tracking-[0.2em] bg-red-500/10 text-red-500 text-center border border-red-500/20">
                <i className="fas fa-wifi-slash mr-3"></i> {pendingCount > 0 ? `${pendingCount} Pendentes` : 'Modo Offline'}
              </div>
            )}
            {isOnline && pendingCount > 0 && (
              <button 
                onClick={() => { syncService.processSyncQueue(); setIsMenuOpen(false); }}
                className="w-full py-4 rounded-2xl font-black text-sm uppercase tracking-[0.2em] bg-amber-500/10 text-amber-500 text-center border border-amber-500/20 hover:bg-amber-500/20 transition-all"
              >
                <i className="fas fa-cloud-upload-alt mr-3"></i> Sincronizar ({pendingCount})
              </button>
            )}

            <button 
              onClick={() => { toggleTheme(); setIsMenuOpen(false); }} 
              className="w-full py-4 rounded-2xl font-black text-sm uppercase tracking-[0.2em] text-white/60 hover:text-white hover:bg-white/5 transition-all"
            >
              <i className={`fas ${theme === 'dark' ? 'fa-moon' : theme === 'light' ? 'fa-sun' : 'fa-desktop'} mr-3`}></i> {theme === 'dark' ? 'Modo Escuro' : theme === 'system' ? 'Automático' : 'Modo Claro'}
            </button>

            <div className="w-full h-px bg-white/10 my-4"></div>

            <button 
              onClick={onLogout} 
              className="w-full py-4 rounded-2xl font-black text-sm uppercase tracking-[0.2em] text-red-400 hover:bg-red-500/10 transition-all"
            >
              <i className="fas fa-sign-out-alt mr-3"></i> Sair da Conta
            </button>
          </nav>

          <div className="absolute bottom-10 text-center">
            <p className="text-[9px] text-white/30 font-black uppercase tracking-[0.4em]">VN. TECNOLOGIA E QUALIDADE</p>
          </div>
        </div>
      )}

      {/* Navigation Mobile - Estilo Barra Inferior (App) */}
      <nav className={`lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 shadow-[0_-8px_30px_rgba(0,0,0,0.08)] px-6 py-3 flex items-center justify-between z-[100] rounded-t-[2.5rem] transition-transform duration-300 ${isVisible ? 'translate-y-0' : 'translate-y-[150%]'}`}>
        <button 
          onClick={onHome}
          className={`flex flex-col items-center gap-1 transition-all ${activeView === 'dashboard' || activeView === 'form' ? 'text-[#E3851B]' : 'text-gray-400'}`}
        >
          <i className="fas fa-house text-xl"></i>
          <span className="text-[9px] font-black uppercase tracking-tighter">Início</span>
        </button>

        <button 
          onClick={onPending}
          className={`flex flex-col items-center gap-1 transition-all ${activeView === 'pending' ? 'text-[#E3851B]' : 'text-gray-400'}`}
        >
          <i className="fas fa-clock text-xl"></i>
          <span className="text-[9px] font-black uppercase tracking-tighter">Pendentes</span>
        </button>

        <button 
          onClick={onAnalytics}
          className={`flex flex-col items-center gap-1 transition-all ${activeView === 'analytics' ? 'text-[#E3851B]' : 'text-gray-400'}`}
        >
          <i className="fas fa-chart-area text-xl"></i>
          <span className="text-[9px] font-black uppercase tracking-tighter">Gráficos</span>
        </button>

        <button 
          onClick={onReports}
          className={`flex flex-col items-center gap-1 transition-all ${activeView === 'reports' ? 'text-[#E3851B]' : 'text-gray-400'}`}
        >
          <i className="fas fa-chart-line text-xl"></i>
          <span className="text-[9px] font-black uppercase tracking-tighter">Relatórios</span>
        </button>

        {/* Botão Central de Exportação - Estilo FAB */}
        {activeView !== 'reports' ? (
          <div className="relative -top-10">
            <button 
              onClick={onExportExcel}
              className="w-16 h-16 bg-green-600 text-white rounded-full shadow-[0_10px_25px_rgba(22,163,74,0.4)] flex items-center justify-center border-4 border-white active:scale-90 transition-all hover:bg-green-700"
            >
              <i className="fas fa-file-excel text-2xl"></i>
            </button>
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[9px] font-black text-green-600 uppercase tracking-widest whitespace-nowrap">Exportar</div>
          </div>
        ) : (
          <div className="w-16"></div> // Espaçador para manter o layout equilibrado
        )}

        {isAdmin && (
          <button 
            onClick={onSettings}
            className={`flex flex-col items-center gap-1 transition-all ${activeView === 'settings' ? 'text-[#E3851B]' : 'text-gray-400'}`}
          >
            <i className="fas fa-cog text-xl"></i>
            <span className="text-[9px] font-black uppercase tracking-tighter">Config.</span>
          </button>
        )}

        <button 
          onClick={onLogout}
          className="flex flex-col items-center gap-1 text-gray-400 hover:text-red-500"
        >
          <i className="fas fa-sign-out-alt text-xl"></i>
          <span className="text-[9px] font-black uppercase tracking-tighter">Sair</span>
        </button>
      </nav>
      {/* Espaçador para o conteúdo não ficar atrás da barra inferior */}
      <div className="lg:hidden h-24"></div>
    </>
  );
};

export default Header;
