
import React, { useState, useEffect } from 'react';
import { Toaster, toast } from 'sonner';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import FormContainer from './components/FormContainer';
import DataViewer from './components/DataViewer';
import Header from './components/Header';
import ExportSelectorModal from './components/ExportSelectorModal';
import PendingForms from './components/PendingForms';
import { User, FormType, LogType } from './types';
import { createLog } from './utils/logger';
import { api } from './lib/api';
import { db } from './lib/db';
import { syncService } from './lib/sync';
import { useLiveQuery } from 'dexie-react-hooks';
import { exportToExcel } from './utils/excelExport';
import { FORMS_CONFIG } from './constants';

import Settings from './components/Settings';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import { isAdminRole, normalizeUserRole } from './lib/roles';
import { normalizePermissions } from './lib/permissions';

type ViewMode = 'dashboard' | 'form' | 'reports' | 'settings' | 'pending' | 'analytics';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('dashboard');
  const [selectedForm, setSelectedForm] = useState<FormType | null>(null);
  const [editingRecord, setEditingRecord] = useState<any | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [batchLookupCode, setBatchLookupCode] = useState<string | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('sgq_user');
    const loteParam = new URLSearchParams(window.location.search).get('lote');
    if (loteParam) {
      setBatchLookupCode(loteParam);
    }
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setUser({
        ...parsedUser,
        role: normalizeUserRole(parsedUser.role),
        permissions: normalizePermissions(parsedUser.permissions)
      });
    }
    setIsLoaded(true);

    // Initial sync and setup online listener
    syncService.fetchRemoteAndSyncLocal();
    
    // Background sync every 60 seconds
    const syncInterval = setInterval(() => {
      syncService.fetchRemoteAndSyncLocal();
    }, 60000);

    const handleOnline = () => {
      toast.success('Conexão restabelecida. Sincronizando dados...');
      syncService.processSyncQueue();
      syncService.fetchRemoteAndSyncLocal();
    };
    window.addEventListener('online', handleOnline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      clearInterval(syncInterval);
    };
  }, []);

// No realtime for now, relying on polling syncService


  const handleLogin = (userData: User) => {
    setUser(userData);
    localStorage.setItem('sgq_user', JSON.stringify(userData));
    createLog(userData, LogType.ACCESS, 'Login realizado com sucesso');
  };

  useEffect(() => {
    if (user && batchLookupCode) {
      setSelectedForm(null);
      setEditingRecord(null);
      setViewMode('reports');
    }
  }, [user, batchLookupCode]);

  const handleLogout = () => {
    if (user) {
      createLog(user, LogType.ACCESS, 'Logout realizado');
    }
    setUser(null);
    setSelectedForm(null);
    setEditingRecord(null);
    setViewMode('dashboard');
    localStorage.removeItem('sgq_user');
  };

  const handleSelectForm = (type: FormType) => {
    setSelectedForm(type);
    setEditingRecord(null);
    setViewMode('form');
  };

  const handleEditRecord = (record: any) => {
    setEditingRecord(record);
    setSelectedForm(record.form_type as FormType);
    setViewMode('form');
  };

  const navigateToReports = () => {
    setSelectedForm(null);
    setEditingRecord(null);
    setViewMode('reports');
  };

  const handleExportExcel = async (type: FormType | 'all' = 'all') => {
    if (isExporting) return;
    
    // 1. Mostrar modal de carregamento imediatamente
    setIsExporting(true);
    setShowExportModal(false);
    
    try {
      let data: any[] = [];
      
      if (type === 'all') {
        data = await api.getAllRecords();
      } else {
        data = await api.getRecords('records', { form_type: type, order: 'timestamp', orderDirection: 'desc' });
      }

      if (data && data.length > 0) {
        const formConfig = type === 'all' ? null : FORMS_CONFIG.find(f => f.type === type);
        const fileName = formConfig ? `Export_SGQ_${formConfig.code}` : 'Export_SGQ_Geral';
          
        // 3. Chamar a exportação otimizada (assíncrona)
        await exportToExcel(data, fileName);

        if (user) createLog(user, LogType.MANAGEMENT, `Exportação Excel concluída: ${type}`);
      } else {
        alert('Nenhum dado encontrado para os critérios de exportação.');
      }
    } catch (error: any) {
      console.error('Erro na exportação:', error);
      alert('Falha ao processar dados: ' + (error.message || 'Erro no banco de dados'));
    } finally {
      // 4. Fechar modal de carregamento
      setIsExporting(false);
    }
  };

  const navigateToSettings = () => {
    setSelectedForm(null);
    setEditingRecord(null);
    setViewMode('settings');
  };

  const navigateToHome = () => {
    setSelectedForm(null);
    setEditingRecord(null);
    setViewMode('dashboard');
  };

  const navigateToPending = () => {
    setSelectedForm(null);
    setEditingRecord(null);
    setViewMode('pending');
  };

  const navigateToAnalytics = () => {
    setSelectedForm(null);
    setEditingRecord(null);
    setViewMode('analytics');
  };

  if (!isLoaded) return <div className="flex items-center justify-center h-screen"><i className="fas fa-spinner fa-spin text-4xl text-[#E3851B]"></i></div>;

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col transition-colors duration-300">
      <Toaster position="top-right" richColors theme="system" />
      <Header 
        user={user} 
        onLogout={handleLogout} 
        onHome={navigateToHome}
        onReports={navigateToReports}
        onExportExcel={() => setShowExportModal(true)}
        onSettings={navigateToSettings}
        onPending={navigateToPending}
        onAnalytics={navigateToAnalytics}
        activeView={viewMode}
      />

      {isExporting && (
        <div className="fixed inset-0 bg-[#1A2B34]/80 backdrop-blur-md z-[1000] flex flex-col items-center justify-center animate-fadeIn">
            <div className="bg-white p-12 rounded-[4rem] shadow-2xl flex flex-col items-center border-4 border-green-50 max-w-sm w-full mx-4">
              <div className="relative mb-8">
                <div className="w-24 h-24 border-8 border-green-50 border-t-green-600 rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <i className="fas fa-file-excel text-green-600 text-3xl animate-bounce"></i>
                </div>
              </div>
              <h4 className="font-black text-lg text-gray-800 uppercase tracking-tighter text-center">Processando Grande Volume</h4>
              <p className="text-[10px] text-gray-400 mt-4 font-black uppercase tracking-[0.2em] text-center px-4 leading-relaxed">
                Estamos estruturando sua planilha para análise de dados. <br/>Não feche o navegador.
              </p>
              <div className="mt-8 flex gap-1">
                 <div className="w-1.5 h-1.5 bg-green-200 rounded-full animate-pulse"></div>
                 <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse delay-75"></div>
                 <div className="w-1.5 h-1.5 bg-green-600 rounded-full animate-pulse delay-150"></div>
              </div>
            </div>
        </div>
      )}

      {showExportModal && (
        <ExportSelectorModal 
          onClose={() => setShowExportModal(false)} 
          onSelect={(type) => handleExportExcel(type)} 
        />
      )}
      
      <main className="flex-1 container mx-auto px-4 py-6 md:py-8">
        {viewMode === 'dashboard' && (
          <Dashboard onSelectForm={handleSelectForm} currentUser={user} />
        )}
        
        {viewMode === 'form' && selectedForm && (
          <FormContainer 
            formType={selectedForm} 
            onBack={editingRecord ? navigateToReports : navigateToHome} 
            initialRecord={editingRecord}
          />
        )}

        {viewMode === 'reports' && (
          <DataViewer 
            onBack={navigateToHome} 
            onEdit={handleEditRecord} 
            onExport={() => setShowExportModal(true)}
            currentUser={user}
            batchLookupCode={batchLookupCode}
            onBatchLookupHandled={() => {
              setBatchLookupCode(null);
              window.history.replaceState({}, document.title, window.location.pathname);
            }}
          />
        )}

        {viewMode === 'pending' && (
          <PendingForms 
            onBack={navigateToHome} 
            onEdit={handleEditRecord} 
            currentUser={user}
          />
        )}

        {viewMode === 'settings' && isAdminRole(user.role) && (
          <Settings onBack={navigateToHome} currentUser={user} />
        )}

        {viewMode === 'analytics' && (
          <AnalyticsDashboard onBack={navigateToHome} currentUser={user} />
        )}
      </main>

      <footer className="hidden lg:block bg-[#1A2B34] border-t border-white/10 py-6 text-center text-gray-400 text-[10px] font-black uppercase tracking-[0.3em]">
        VIA NÉCTARE - Tecnologia em Gestão da Qualidade &copy; {new Date().getFullYear()}
      </footer>
    </div>
  );
};

export default App;
