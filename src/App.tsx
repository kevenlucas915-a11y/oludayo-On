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

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
