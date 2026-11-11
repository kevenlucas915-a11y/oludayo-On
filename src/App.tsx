/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { HomeView } from './components/HomeView';
import { SongListView } from './components/SongListView';
import { SongDetailView } from './components/SongDetailView';
import { LessonView } from './components/LessonView';
import { ProgressRankingView } from './components/ProgressRankingView';
import { AdminDashboardView } from './components/AdminDashboardView';
import { GlossarioView } from './components/GlossarioView';
import { AuthModal } from './components/AuthModal';
import { Toast } from './components/Toast';

const AppContent: React.FC = () => {
  const { currentView } = useApp();

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#2C1810] flex flex-col justify-between selection:bg-[#E6D5AC] selection:text-[#59260B]">
      <div>
        <Header />

        <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 pb-20">
          {currentView === 'inicio' && <HomeView />}
          {currentView === 'cantigas' && <SongListView />}
          {currentView === 'cantiga-detalhe' && <SongDetailView />}
          {currentView === 'licao' && <LessonView />}
          {currentView === 'glossario' && <GlossarioView />}
          {(currentView === 'progresso' || currentView === 'ranking') && <ProgressRankingView />}
          {currentView === 'admin' && <AdminDashboardView />}
        </main>
      </div>

      {/* Footer (hidden during Duolingo lesson) */}
      {currentView !== 'licao' && (
        <footer className="border-t border-[#E6D5AC] bg-white py-6 px-4 text-center text-xs text-[#78350F]/70 mb-14 md:mb-0">
          <div className="max-w-4xl mx-auto space-y-1.5">
            <p className="font-display font-semibold text-[#2C1810]">
              Oludayo On · Cantigas Tradicionais de Candomblé Ketu
            </p>
            <p className="text-[11px] text-[#59260B]/70">
              Desenvolvido com respeito aos orixás, aos ogans, à iyalorixá e à tradição afro-brasileira.
            </p>
            <p className="text-[10px] text-gray-400">
              Acesso exclusivo e fraterno aos membros da casa · Motumbá, Kolofé e Axé!
            </p>
          </div>
        </footer>
      )}

      <BottomNav />
      <AuthModal />
      <Toast />
    </div>
  );
};

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Erro capturado pelo ErrorBoundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#FAF8F5] text-[#2C1810] flex items-center justify-center p-6 text-center">
          <div className="max-w-md bg-white p-8 rounded-3xl border border-[#E6D5AC] shadow-xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-[#7C2D12] flex items-center justify-center mx-auto text-2xl font-bold font-display">
              Ọ
            </div>
            <h1 className="text-xl font-bold font-display text-[#2C1810]">
              Oludayo On · Cantigas de Ketu
            </h1>
            <p className="text-sm text-gray-600">
              Ocorreu uma instabilidade temporária ao carregar as informações.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="w-full py-3 px-4 bg-gradient-to-r from-[#7C2D12] to-[#9A3412] text-white font-semibold rounded-xl hover:opacity-95 transition-opacity cursor-pointer"
            >
              Recarregar página
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </ErrorBoundary>
  );
}
