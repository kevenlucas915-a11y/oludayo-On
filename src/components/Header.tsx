import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Flame, Shield, Sparkles, User, LogOut, CheckCircle2, Cloud, ChevronDown, Languages } from 'lucide-react';

export const Header: React.FC = () => {
  const {
    currentUser,
    progresso,
    setCurrentView,
    currentView,
    setIsAuthModalOpen,
    switchUser,
    users,
    logout,
    isFirestoreConnected,
  } = useApp();

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu on click outside
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent | TouchEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };

    if (isUserMenuOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
      document.addEventListener('touchstart', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
    };
  }, [isUserMenuOpen]);

  const handleSelectUser = (userId: string) => {
    switchUser(userId);
    setIsUserMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#FAF8F5]/95 backdrop-blur-md border-b border-[#E6D5AC] px-4 sm:px-6 py-3 transition-colors">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
        {/* Brand Zone */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setCurrentView('inicio')}
            className="flex items-center gap-2.5 text-left group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9A3412] rounded-lg"
            aria-label="Ir para o início do Oludayo On"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#7C2D12] via-[#9A3412] to-[#B45309] flex items-center justify-center text-[#FAF8F5] shadow-sm shadow-[#7C2D12]/20">
              <span className="font-display font-bold text-base tracking-wider">Ọ</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-display font-bold text-lg sm:text-xl text-[#2C1810] tracking-tight group-hover:text-[#9A3412] transition-colors whitespace-nowrap">
                  Oludayo On
                </span>
                <span className="text-[11px] font-medium text-[#7C2D12] bg-[#F5EBE1] px-1.5 py-0.5 rounded border border-[#E6D5AC]/60 whitespace-nowrap hidden sm:inline-block">
                  Ketu
                </span>
                {isFirestoreConnected && (
                  <span className="text-[10px] text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200/80 whitespace-nowrap hidden md:inline-flex items-center gap-1 font-medium" title="Conectado ao Firebase Firestore">
                    <Cloud className="w-2.5 h-2.5 text-emerald-600" />
                    <span>Nuvem Ativa</span>
                  </span>
                )}
              </div>
              <p className="text-[10px] text-[#78350F]/70 tracking-tight whitespace-nowrap hidden xs:block">
                Cantigas e Fundamentos da Casa
              </p>
            </div>
          </button>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-[#59260B]" aria-label="Navegação principal">
          <button
            onClick={() => setCurrentView('inicio')}
            className={`whitespace-nowrap transition-colors py-1 ${
              currentView === 'inicio' ? 'text-[#9A3412] font-semibold border-b-2 border-[#9A3412]' : 'hover:text-[#9A3412]'
            }`}
          >
            Início
          </button>
          <button
            onClick={() => setCurrentView('cantigas')}
            className={`whitespace-nowrap transition-colors py-1 ${
              currentView === 'cantigas' ? 'text-[#9A3412] font-semibold border-b-2 border-[#9A3412]' : 'hover:text-[#9A3412]'
            }`}
          >
            Cantigas
          </button>
          <button
            onClick={() => setCurrentView('progresso')}
            className={`whitespace-nowrap transition-colors py-1 ${
              currentView === 'progresso' || currentView === 'ranking'
                ? 'text-[#9A3412] font-semibold border-b-2 border-[#9A3412]'
                : 'hover:text-[#9A3412]'
            }`}
          >
            Progresso & Ranking
          </button>
          <button
            onClick={() => setCurrentView('glossario')}
            className={`whitespace-nowrap transition-colors py-1 flex items-center gap-1.5 ${
              currentView === 'glossario'
                ? 'text-[#9A3412] font-semibold border-b-2 border-[#9A3412]'
                : 'hover:text-[#9A3412]'
            }`}
          >
            <Languages className="w-3.5 h-3.5" />
            <span>Glossário</span>
          </button>
          {currentUser?.perfil === 'administradora' && (
            <button
              onClick={() => setCurrentView('admin')}
              className={`whitespace-nowrap transition-colors py-1 flex items-center gap-1.5 ${
                currentView === 'admin' ? 'text-[#9A3412] font-semibold border-b-2 border-[#9A3412]' : 'hover:text-[#9A3412]'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              Painel da Casa
            </button>
          )}
        </nav>

        {/* Action & Stats Zone */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {currentUser ? (
            <>
              {/* Streak Flame */}
              <div
                className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#FFF7ED] border border-[#FDBA74]/60 rounded-xl text-[#C2410C] text-xs font-bold"
                title={`${progresso.sequenciaDias} dias consecutivos de estudo das cantigas`}
              >
                <Flame className="w-4 h-4 fill-[#EA580C] text-[#EA580C] animate-pulse" />
                <span className="tabular-nums font-mono">{progresso.sequenciaDias}d</span>
              </div>

              {/* Axé Points */}
              <div
                className="hidden xs:flex items-center gap-1.5 px-2.5 py-1.5 bg-[#FEF9C3] border border-[#FDE047]/60 rounded-xl text-[#854D0E] text-xs font-bold"
                title={`${progresso.pontos} pontos de Axé acumulados`}
              >
                <Sparkles className="w-3.5 h-3.5 text-[#CA8A04]" />
                <span className="tabular-nums font-mono">{progresso.pontos} XP</span>
              </div>

              {/* Interactive Profile Clickable Dropdown */}
              <div className="relative" ref={menuRef}>
                <button
                  type="button"
                  onClick={() => setIsUserMenuOpen((prev) => !prev)}
                  className={`flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl border text-xs font-medium transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#9A3412] ${
                    isUserMenuOpen
                      ? 'bg-[#F5EBE1] border-[#9A3412] text-[#9A3412] shadow-sm'
                      : 'bg-white border-[#E6D5AC] text-[#2C1810] hover:border-[#9A3412]'
                  }`}
                  aria-label="Abrir menu de perfil do usuário"
                  aria-expanded={isUserMenuOpen}
                >
                  <div className="w-6 h-6 rounded-full bg-[#E6D5AC] flex items-center justify-center text-[#59260B] font-bold text-xs uppercase shrink-0">
                    {currentUser.nome.charAt(0)}
                  </div>
                  <span className="hidden sm:inline max-w-[110px] truncate text-left">
                    {currentUser.nome.split(' ')[0]}
                  </span>
                  {currentUser.perfil === 'administradora' ? (
                    <span className="hidden sm:inline text-[9px] bg-[#FEF3C7] text-[#92400E] font-bold px-1.5 py-0.5 rounded">
                      Iyá Tèbíèse
                    </span>
                  ) : null}
                  <ChevronDown className={`w-3.5 h-3.5 text-gray-500 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-[#E6D5AC] py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-4 py-2.5 border-b border-gray-100 bg-[#FAF8F5] rounded-t-2xl">
                      <p className="text-xs font-bold text-[#2C1810]">{currentUser.nome}</p>
                      <p className="text-[11px] text-[#78350F]/70 font-medium">
                        {currentUser.perfil === 'administradora' ? 'Iyá Tèbíèse (Jenifer de Ogun)' : 'Membro da Casa'}
                      </p>
                      <div className="mt-1 flex items-center gap-1.5 text-[11px]">
                        {currentUser.perfil === 'administradora' ? (
                          <span className="inline-flex items-center gap-1 text-[#9A3412] font-semibold">
                            <Shield className="w-3.5 h-3.5 text-[#9A3412]" />
                            Cargo Sagrado: Iyá Tèbíèse
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            Membro da Casa
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Quick shortcut to Admin Dashboard if admin */}
                    {currentUser.perfil === 'administradora' && (
                      <div className="p-2 border-b border-gray-100">
                        <button
                          type="button"
                          onClick={() => {
                            setCurrentView('admin');
                            setIsUserMenuOpen(false);
                          }}
                          className="w-full py-2 px-3 bg-[#9A3412] hover:bg-[#7C2D12] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-colors"
                        >
                          <Shield className="w-4 h-4" />
                          <span>Abrir Painel da Casa</span>
                        </button>
                      </div>
                    )}

                    {/* Member switcher if more than 1 member registered */}
                    {users.filter((u) => u.aprovado).length > 1 && (
                      <div className="py-1.5">
                        <div className="px-3 py-1 text-[10px] uppercase font-bold text-[#78350F]/70 tracking-wider">
                          Membros da Casa:
                        </div>
                        {users.filter((u) => u.aprovado).map((u) => {
                          const isSelected = u.id === currentUser.id;
                          return (
                            <button
                              key={u.id}
                              type="button"
                              onClick={() => handleSelectUser(u.id)}
                              className={`w-full text-left px-4 py-2 text-xs flex items-center justify-between hover:bg-[#FAF8F5] transition-colors cursor-pointer ${
                                isSelected ? 'font-bold text-[#9A3412] bg-[#F5EBE1]/60' : 'text-gray-700'
                              }`}
                            >
                              <span className="truncate">{u.nome}</span>
                              <span className={`text-[10px] px-1.5 py-0.2 rounded font-semibold capitalize ${
                                u.perfil === 'administradora' ? 'bg-[#FEF3C7] text-[#92400E]' : 'bg-gray-100 text-gray-500'
                              }`}>
                                {u.perfil === 'administradora' ? 'Iyá Tèbíèse' : 'Membro'}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    )}

                    <div className="pt-1.5 border-t border-gray-100 px-2 space-y-1">
                      <button
                        type="button"
                        onClick={() => {
                          setIsAuthModalOpen(true);
                          setIsUserMenuOpen(false);
                        }}
                        className="w-full text-left px-3 py-1.5 text-xs text-gray-700 hover:bg-[#FAF8F5] rounded-lg transition-colors flex items-center gap-2"
                      >
                        <User className="w-3.5 h-3.5 text-gray-400" />
                        <span>Trocar de Conta / Login</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          logout();
                          setIsUserMenuOpen(false);
                        }}
                        className="w-full text-left px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-2"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sair</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-[#9A3412] rounded-xl hover:bg-[#7C2D12] transition-colors flex items-center gap-1.5 shadow-sm shadow-[#9A3412]/20"
            >
              <User className="w-3.5 h-3.5" />
              <span>Entrar</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
