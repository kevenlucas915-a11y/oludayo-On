import React from 'react';
import { useApp } from '../context/AppContext';
import { Home, Music2, BookOpen, Trophy, Shield, Languages } from 'lucide-react';

export const BottomNav: React.FC = () => {
  const { currentView, setCurrentView, currentUser, cantigas, startLesson, setIsAuthModalOpen } = useApp();

  // If in lesson mode, hide bottom nav to minimize distraction
  if (currentView === 'licao') return null;

  const handlePracticeClick = () => {
    // If on a cantiga, practice it; otherwise pick first reviewed cantiga
    const reviewed = cantigas.filter((c) => c.revisada);
    if (reviewed.length > 0) {
      startLesson(reviewed[0].id);
    } else {
      setCurrentView('cantigas');
    }
  };

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#E6D5AC] px-2 py-1.5 shadow-lg"
      aria-label="Navegação móvel"
    >
      <div className="flex items-center justify-around max-w-md mx-auto">
        {/* Início */}
        <button
          onClick={() => setCurrentView('inicio')}
          className={`flex flex-col items-center justify-center min-w-[50px] min-h-[44px] py-1 transition-colors ${
            currentView === 'inicio' ? 'text-[#9A3412]' : 'text-gray-500 hover:text-gray-900'
          }`}
          aria-label="Início"
        >
          <Home className={`w-5 h-5 ${currentView === 'inicio' ? 'stroke-[2.5]' : 'stroke-2'}`} />
          <span className="text-[10px] font-medium tracking-tight mt-0.5">Início</span>
        </button>

        {/* Cantigas */}
        <button
          onClick={() => setCurrentView('cantigas')}
          className={`flex flex-col items-center justify-center min-w-[50px] min-h-[44px] py-1 transition-colors ${
            currentView === 'cantigas' || currentView === 'cantiga-detalhe'
              ? 'text-[#9A3412]'
              : 'text-gray-500 hover:text-gray-900'
          }`}
          aria-label="Cantigas"
        >
          <Music2 className={`w-5 h-5 ${currentView === 'cantigas' ? 'stroke-[2.5]' : 'stroke-2'}`} />
          <span className="text-[10px] font-medium tracking-tight mt-0.5">Cantigas</span>
        </button>

        {/* Glossário */}
        <button
          onClick={() => setCurrentView('glossario')}
          className={`flex flex-col items-center justify-center min-w-[50px] min-h-[44px] py-1 transition-colors ${
            currentView === 'glossario' ? 'text-[#9A3412]' : 'text-gray-500 hover:text-gray-900'
          }`}
          aria-label="Glossário em Iorubá"
        >
          <Languages className={`w-5 h-5 ${currentView === 'glossario' ? 'stroke-[2.5]' : 'stroke-2'}`} />
          <span className="text-[10px] font-medium tracking-tight mt-0.5">Glossário</span>
        </button>

        {/* Praticar Lição */}
        <button
          onClick={handlePracticeClick}
          className="flex flex-col items-center justify-center min-w-[50px] min-h-[44px] py-1 group"
          aria-label="Praticar cantiga estilo Duolingo"
        >
          <div className="w-8 h-8 rounded-full bg-[#9A3412] text-white flex items-center justify-center shadow-md shadow-[#9A3412]/30 group-active:scale-95 transition-transform">
            <BookOpen className="w-3.5 h-3.5 stroke-[2.5]" />
          </div>
          <span className="text-[10px] font-bold text-[#9A3412] tracking-tight mt-0.5">Praticar</span>
        </button>

        {/* Progresso & Ranking */}
        <button
          onClick={() => setCurrentView('progresso')}
          className={`flex flex-col items-center justify-center min-w-[50px] min-h-[44px] py-1 transition-colors ${
            currentView === 'progresso' || currentView === 'ranking'
              ? 'text-[#9A3412]'
              : 'text-gray-500 hover:text-gray-900'
          }`}
          aria-label="Progresso e Ranking"
        >
          <Trophy className={`w-5 h-5 ${currentView === 'progresso' ? 'stroke-[2.5]' : 'stroke-2'}`} />
          <span className="text-[10px] font-medium tracking-tight mt-0.5">Ranking</span>
        </button>

        {/* Painel da Casa (se administradora) ou Acesso Admin */}
        {currentUser?.perfil === 'administradora' ? (
          <button
            onClick={() => setCurrentView('admin')}
            className={`flex flex-col items-center justify-center min-w-[56px] min-h-[44px] py-1 transition-colors ${
              currentView === 'admin' ? 'text-[#9A3412]' : 'text-gray-500 hover:text-gray-900'
            }`}
            aria-label="Painel de Iyá Tèbíèse"
          >
            <Shield className={`w-5 h-5 ${currentView === 'admin' ? 'stroke-[2.5]' : 'stroke-2'}`} />
            <span className="text-[10px] font-medium tracking-tight mt-0.5">Casa</span>
          </button>
        ) : (
          <button
            onClick={() => setIsAuthModalOpen(true)}
            className="flex flex-col items-center justify-center min-w-[56px] min-h-[44px] py-1 text-gray-500 hover:text-[#9A3412] transition-colors"
            aria-label="Acessar painel ou trocar de conta"
          >
            <Shield className="w-5 h-5 stroke-2" />
            <span className="text-[10px] font-medium tracking-tight mt-0.5">Admin</span>
          </button>
        )}
      </div>
    </nav>
  );
};
