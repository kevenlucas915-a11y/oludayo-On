import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, Shield, Lock, User, Mail, Sparkles, CheckCircle2 } from 'lucide-react';

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    setIsAuthModalOpen,
    login,
    solicitarCadastro,
    switchUser,
  } = useApp();

  const [mode, setMode] = useState<'login' | 'cadastro'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nome, setNome] = useState('');
  const [orixaGuia, setOrixaGuia] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successNotice, setSuccessNotice] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);
    try {
      const res = await login(email, password);
      if (!res.success) {
        setErrorMsg(res.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCadastroSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessNotice('');
    if (password.length < 6) {
      setErrorMsg('A senha deve ter pelo menos 6 caracteres.');
      return;
    }
    setIsLoading(true);
    try {
      const res = await solicitarCadastro(nome, email, password, orixaGuia);
      if (!res.success) {
        setErrorMsg(res.message);
      } else {
        setSuccessNotice(res.message);
        setNome('');
        setEmail('');
        setPassword('');
        setOrixaGuia('');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemo = (userId: string) => {
    switchUser(userId);
    setIsAuthModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-md p-6 sm:p-7 border border-[#E6D5AC] shadow-2xl space-y-5 relative">
        <button
          onClick={() => setIsAuthModalOpen(false)}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 p-1"
          aria-label="Fechar"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center space-y-1.5 pt-1">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#7C2D12] to-[#B45309] text-white flex items-center justify-center mx-auto shadow-sm">
            <span className="font-display font-bold text-lg">Ọ</span>
          </div>
          <h2 className="font-display font-bold text-xl text-[#2C1810]">
            Oludayo On · Acesso à Casa
          </h2>
          <p className="text-xs text-gray-500 max-w-xs mx-auto">
            Ambiente interno de ensino das cantigas de Candomblé da nação Ketu.
          </p>
        </div>

        {/* Iyá Tèbíèse Shortcut (Identificação rápida de sessão) */}
        <div className="bg-[#FAF8F5] p-3 rounded-2xl border border-[#E6D5AC] space-y-2">
          <span className="text-[10px] uppercase font-bold text-[#78350F] tracking-wider block">
            Acesso da Iyá Tèbíèse:
          </span>
          <button
            type="button"
            onClick={() => handleQuickDemo('user-admin-jenifer')}
            className="w-full px-3 py-2 bg-white hover:bg-[#F5EBE1] border border-[#E6D5AC] rounded-xl text-xs font-bold text-[#7C2D12] text-left transition-colors flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#9A3412] shrink-0" />
              <span>Jenifer de Ogun</span>
            </div>
            <span className="text-[10px] bg-[#FEF3C7] text-[#92400E] px-2 py-0.5 rounded font-bold">
              Iyá Tèbíèse
            </span>
          </button>
        </div>

        {/* Tabs: Login vs Solicitar Cadastro */}
        <div className="flex border-b border-gray-100">
          <button
            onClick={() => {
              setMode('login');
              setErrorMsg('');
              setSuccessNotice('');
            }}
            className={`flex-1 py-2 text-xs font-bold transition-colors border-b-2 ${
              mode === 'login'
                ? 'border-[#9A3412] text-[#9A3412]'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            Entrar com E-mail
          </button>
          <button
            onClick={() => {
              setMode('cadastro');
              setErrorMsg('');
              setSuccessNotice('');
            }}
            className={`flex-1 py-2 text-xs font-bold transition-colors border-b-2 ${
              mode === 'cadastro'
                ? 'border-[#9A3412] text-[#9A3412]'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            Solicitar Cadastro
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
            {errorMsg}
          </div>
        )}

        {successNotice && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 space-y-1">
            <div className="font-bold flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Solicitação enviada!</span>
            </div>
            <p>{successNotice}</p>
          </div>
        )}

        {mode === 'login' ? (
          <form onSubmit={handleLoginSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                E-mail de Membro da Casa
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu.email@exemplo.com"
                  className="w-full pl-9 pr-3 py-2 bg-[#FAF8F5] border border-[#E6D5AC] rounded-xl text-xs focus:ring-2 focus:ring-[#9A3412] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Senha de Acesso
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 bg-[#FAF8F5] border border-[#E6D5AC] rounded-xl text-xs focus:ring-2 focus:ring-[#9A3412] focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-[#9A3412] hover:bg-[#7C2D12] disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-md transition-all active:scale-[0.99] mt-2"
            >
              {isLoading ? 'Conectando ao Firebase...' : 'Entrar no Oludayo On'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleCadastroSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Seu Nome Completo *
              </label>
              <input
                type="text"
                required
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Ex: Nome Completo do Membro"
                className="w-full p-2 bg-[#FAF8F5] border border-[#E6D5AC] rounded-xl text-xs focus:ring-2 focus:ring-[#9A3412]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Seu E-mail *
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu.email@exemplo.com"
                className="w-full p-2 bg-[#FAF8F5] border border-[#E6D5AC] rounded-xl text-xs focus:ring-2 focus:ring-[#9A3412]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Definir Senha de Acesso * (mínimo 6 caracteres)
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Crie uma senha de acesso"
                className="w-full p-2 bg-[#FAF8F5] border border-[#E6D5AC] rounded-xl text-xs focus:ring-2 focus:ring-[#9A3412]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Orixá de Cabeça / Guia (opcional)
              </label>
              <input
                type="text"
                value={orixaGuia}
                onChange={(e) => setOrixaGuia(e.target.value)}
                placeholder="Ex: Ogum, Oxum, Iemanjá..."
                className="w-full p-2 bg-[#FAF8F5] border border-[#E6D5AC] rounded-xl text-xs focus:ring-2 focus:ring-[#9A3412]"
              />
            </div>

            <p className="text-[11px] text-gray-500 italic pt-1">
              * Nota: Para segurança dos ensinamentos da casa, a solicitação ficará pendente até a aprovação da Iyá Tèbíèse no painel.
            </p>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-[#9A3412] hover:bg-[#7C2D12] disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-md transition-all active:scale-[0.99] mt-2"
            >
              {isLoading ? 'Registrando no Firebase...' : 'Enviar Solicitação de Entrada'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
