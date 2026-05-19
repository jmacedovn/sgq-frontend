import React, { useState } from 'react';
import { User } from '../types';
import UserManagement from './UserManagement';
import ActivityLogs from './ActivityLogs';
import { isAdminTiRole } from '../lib/roles';

interface SettingsProps {
  onBack: () => void;
  currentUser: User;
}

type SettingsSection = 'menu' | 'users' | 'logs' | 'versions';

const releaseNotes = [
  {
    version: '2026.05.2',
    title: 'Dashboard e Físico-Química',
    date: '19/05/2026',
    items: [
      'Adicionados novos gráficos ao Dashboard: Brix Integral, Concentrado e Cor Hunter (L, a, b).',
      'Dashboard agora unifica a visualização de Pontos Pretos e Marrons para todas as frutas.',
      'O gráfico de Brix Fruta Fresca agora utiliza dados corretamente do Controle de Entrada e Moagem.',
      'Melhoria na robustez do carregamento de lotes para as Análises Físico-Químicas.'
    ]
  },
  {
    version: '2026.05',
    title: 'Central administrativa',
    date: '08/05/2026',
    items: [
      'Cadastro de usuários movido para Configurações.',
      'Logs de acesso e rastreabilidade movidos para Configurações.',
      'Cadastro de frutas removido da tela de Configurações.'
    ]
  },
  {
    version: '2026.04',
    title: 'Rotina de qualidade',
    date: '04/05/2026',
    items: [
      'Ajustes em formulários operacionais e relatórios.',
      'Melhorias na navegação e sincronização offline.'
    ]
  }
];

const Settings: React.FC<SettingsProps> = ({ onBack, currentUser }) => {
  const [section, setSection] = useState<SettingsSection>('menu');
  const canManageAccess = isAdminTiRole(currentUser.role);

  const settingsCards = [
    {
      id: 'users' as SettingsSection,
      title: 'Usuários e acessos',
      description: 'Cadastre usuários, perfis e permissões de formulários.',
      icon: 'fa-users-cog',
      color: 'bg-blue-50 text-blue-600'
    },
    {
      id: 'logs' as SettingsSection,
      title: 'Logs do sistema',
      description: 'Consulte acessos, ações e eventos de rastreabilidade.',
      icon: 'fa-history',
      color: 'bg-purple-50 text-purple-600'
    },
    {
      id: 'versions' as SettingsSection,
      title: 'Notas de versões',
      description: 'Veja as principais alterações aplicadas ao sistema.',
      icon: 'fa-code-branch',
      color: 'bg-orange-50 text-orange-600'
    }
  ];

  if (section === 'users' && canManageAccess) {
    return <UserManagement onBack={() => setSection('menu')} />;
  }

  if (section === 'logs' && canManageAccess) {
    return <ActivityLogs onBack={() => setSection('menu')} />;
  }

  return (
    <div className="space-y-8 animate-fadeIn max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-[#1A2B34] tracking-tight">Configurações</h2>
          <p className="text-gray-500 mt-1 font-medium">Gerencie acessos, auditoria e informações do sistema.</p>
        </div>
        <button
          onClick={section === 'menu' ? onBack : () => setSection('menu')}
          className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 px-6 py-3 rounded-2xl text-xs font-black text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-all uppercase tracking-widest self-start"
        >
          Voltar
        </button>
      </div>

      {section === 'menu' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {settingsCards
            .filter(card => canManageAccess || card.id === 'versions')
            .map(card => (
            <button
              key={card.id}
              onClick={() => setSection(card.id)}
              className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-[2rem] p-6 text-left shadow-lg hover:-translate-y-1 hover:shadow-xl transition-all"
            >
              <div className={`w-12 h-12 ${card.color} rounded-xl flex items-center justify-center text-xl mb-5`}>
                <i className={`fas ${card.icon}`}></i>
              </div>
              <h3 className="text-lg font-black text-[#1A2B34] dark:text-white">{card.title}</h3>
              <p className="text-sm text-gray-400 font-medium mt-2 leading-relaxed">{card.description}</p>
            </button>
          ))}
        </div>
      )}

      {section === 'versions' && (
        <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="p-8 border-b border-gray-100 dark:border-gray-700 flex items-center gap-4">
            <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center text-xl">
              <i className="fas fa-code-branch"></i>
            </div>
            <div>
              <h3 className="text-xl font-black text-[#1A2B34] dark:text-white">Notas de Versões</h3>
              <p className="text-xs text-gray-400 font-medium mt-1">Atualizações e mudanças recentes do SGQ.</p>
            </div>
          </div>

          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {releaseNotes.map(note => (
              <div key={note.version} className="p-8">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-3 mb-5">
                  <div>
                    <div className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500">Versão {note.version}</div>
                    <h4 className="text-lg font-black text-[#1A2B34] dark:text-white mt-1">{note.title}</h4>
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 bg-gray-50 dark:bg-gray-900/50 px-3 py-2 rounded-xl self-start">
                    {note.date}
                  </span>
                </div>
                <ul className="space-y-3">
                  {note.items.map(item => (
                    <li key={item} className="flex gap-3 text-sm font-medium text-gray-600 dark:text-gray-300">
                      <i className="fas fa-check-circle text-green-500 mt-0.5"></i>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="px-8 py-5 bg-gray-50 dark:bg-gray-900/50 text-[10px] font-black uppercase tracking-widest text-gray-400">
            Usuário conectado: {currentUser.name}
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
