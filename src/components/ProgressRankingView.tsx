import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Flame,
  Award,
  Sparkles,
  Trophy,
  BookOpen,
  CheckCircle2,
  Crown,
  Medal,
  Users,
} from 'lucide-react';

export const ProgressRankingView: React.FC = () => {
  const {
    currentUser,
    progresso,
    allProgressos,
    users,
    orixas,
    cantigas,
    medalhas,
    setCurrentView,
    setSelectedOrixaFilter,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'progresso' | 'ranking'>('progresso');

  // Reviewed cantigas count
  const reviewedCantigas = cantigas.filter((c) => c.revisada);

  // Leaderboard sorted by Axé Points (descending)
  const leaderboard = Object.entries(allProgressos)
    .map(([userId, prog]) => {
      const user = users.find((u) => u.id === userId);
      return {
        user,
        prog,
      };
    })
    .filter((entry) => entry.user && entry.user.aprovado)
    .sort((a, b) => b.prog.pontos - a.prog.pontos);

  return (
    <div className="space-y-6 pb-16 max-w-4xl mx-auto">
      {/* Title & Segmented Switch */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-[#2C1810]">
            Evolução Espiritual & Comunitária
          </h1>
          <p className="text-xs sm:text-sm text-[#78350F]/70">
            Acompanhe seu progresso de aprendizado e a dedicação dos irmãos da casa
          </p>
        </div>

        {/* Tab segmented control */}
        <div className="flex items-center gap-1 p-1 bg-white border border-[#E6D5AC] rounded-2xl shadow-xs self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('progresso')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'progresso'
                ? 'bg-[#9A3412] text-white shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Meu Progresso
          </button>
          <button
            onClick={() => setActiveTab('ranking')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 ${
              activeTab === 'ranking'
                ? 'bg-[#9A3412] text-white shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>Ranking da Casa</span>
          </button>
        </div>
      </div>

      {activeTab === 'progresso' ? (
        <div className="space-y-6">
          {/* Top 4 Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
            {/* Streak */}
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#E6D5AC] shadow-xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#FFF7ED] text-[#EA580C] flex items-center justify-center shrink-0">
                <Flame className="w-5 h-5 fill-[#EA580C]" />
              </div>
              <div>
                <span className="block text-2xl font-bold font-mono text-[#2C1810] tabular-nums">
                  {progresso.sequenciaDias}
                </span>
                <span className="text-[11px] text-gray-500">Dias Seguidos</span>
              </div>
            </div>

            {/* Cantigas Aprendidas */}
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#E6D5AC] shadow-xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#F0FDF4] text-emerald-600 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <span className="block text-2xl font-bold font-mono text-[#2C1810] tabular-nums">
                  {progresso.cantigasAprendidas.length}
                </span>
                <span className="text-[11px] text-gray-500">Cantigas Dominadas</span>
              </div>
            </div>

            {/* Pontos de Axé */}
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#E6D5AC] shadow-xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#FEF9C3] text-[#CA8A04] flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <span className="block text-2xl font-bold font-mono text-[#2C1810] tabular-nums">
                  {progresso.pontos}
                </span>
                <span className="text-[11px] text-gray-500">Pontos de Axé (XP)</span>
              </div>
            </div>

            {/* Lições Feitas */}
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#E6D5AC] shadow-xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] text-blue-600 flex items-center justify-center shrink-0">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <span className="block text-2xl font-bold font-mono text-[#2C1810] tabular-nums">
                  {progresso.licoesFeitas}
                </span>
                <span className="text-[11px] text-gray-500">Lições Concluídas</span>
              </div>
            </div>
          </div>

          {/* Progresso por Orixá */}
          <section className="bg-white rounded-3xl p-5 sm:p-6 border border-[#E6D5AC] shadow-xs space-y-4">
            <div>
              <h2 className="text-lg font-display font-bold text-[#2C1810]">
                Progresso por Orixá
              </h2>
              <p className="text-xs text-gray-500">
                Quantidade de cantigas aprendidas em relação ao acervo revisado de cada orixá
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {orixas.map((orixa) => {
                const songs = reviewedCantigas.filter((c) => c.orixaId === orixa.id);
                const countTotal = songs.length;
                const countLearned = songs.filter((c) =>
                  progresso.cantigasAprendidas.includes(c.id)
                ).length;
                const percent = countTotal > 0 ? Math.round((countLearned / countTotal) * 100) : 0;

                return (
                  <div
                    key={orixa.id}
                    onClick={() => {
                      setSelectedOrixaFilter(orixa.id);
                      setCurrentView('cantigas');
                    }}
                    className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#E6D5AC] hover:border-[#9A3412]/60 cursor-pointer transition-all space-y-2 group"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: orixa.corPrimaria }}
                        />
                        <span className="font-bold text-[#2C1810] group-hover:text-[#9A3412] transition-colors">
                          {orixa.nome}
                        </span>
                      </div>
                      <span className="font-mono tabular-nums text-gray-500 font-semibold">
                        {countLearned}/{countTotal} cantigas ({percent}%)
                      </span>
                    </div>

                    {/* Progress track */}
                    <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${percent}%`,
                          backgroundColor: orixa.corPrimaria,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Medalhas & Insígnias Sagradas */}
          <section className="bg-white rounded-3xl p-5 sm:p-6 border border-[#E6D5AC] shadow-xs space-y-4">
            <div>
              <h2 className="text-lg font-display font-bold text-[#2C1810]">
                Medalhas & Reconhecimentos da Casa
              </h2>
              <p className="text-xs text-gray-500">
                Conquistas espirituais obtidas com sua dedicação e estudo
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {medalhas.map((med) => {
                const isUnlocked = progresso.medalhasDesbloqueadas.includes(med.id);

                return (
                  <div
                    key={med.id}
                    className={`p-4 rounded-2xl border transition-all flex items-start gap-3 ${
                      isUnlocked
                        ? 'bg-gradient-to-br from-[#FEF9C3]/40 to-white border-[#FDE047] shadow-xs'
                        : 'bg-gray-50/60 border-gray-200 opacity-60'
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        isUnlocked
                          ? 'bg-[#CA8A04] text-white shadow-sm'
                          : 'bg-gray-200 text-gray-400'
                      }`}
                    >
                      <Award className="w-5 h-5" />
                    </div>

                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <h3 className="font-display font-bold text-xs text-[#2C1810]">
                          {med.titulo}
                        </h3>
                        {isUnlocked && (
                          <span className="text-[10px] text-amber-700 bg-amber-100 px-1.5 rounded font-bold">
                            Ativa
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-gray-500 leading-tight">
                        {med.descricao}
                      </p>
                      <span className="text-[10px] text-[#78350F]/70 italic block pt-1">
                        Critério: {med.criterio}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      ) : (
        /* Ranking da Casa Tab */
        <div className="space-y-6">
          {/* Podium Top 3 */}
          {leaderboard.length >= 3 && (
            <div className="grid grid-cols-3 gap-2.5 sm:gap-4 pt-4 pb-2 items-end">
              {/* 2nd Place */}
              <div className="bg-white rounded-3xl p-3 sm:p-4 border border-[#E6D5AC] text-center space-y-2 order-1 shadow-sm">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gray-100 text-gray-600 flex items-center justify-center mx-auto font-bold text-sm">
                  2º
                </div>
                <div>
                  <h4 className="font-display font-bold text-xs sm:text-sm text-[#2C1810] truncate">
                    {leaderboard[1].user?.nome.split(' ')[0]}
                  </h4>
                  <span className="text-[11px] font-mono text-[#9A3412] font-bold">
                    {leaderboard[1].prog.pontos} XP
                  </span>
                </div>
              </div>

              {/* 1st Place */}
              <div className="bg-gradient-to-b from-[#FEF9C3] to-white rounded-3xl p-4 sm:p-5 border-2 border-[#EAB308] text-center space-y-2 order-2 shadow-md relative -translate-y-2">
                <Crown className="w-6 h-6 text-[#EAB308] mx-auto animate-bounce" />
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-[#EAB308] text-white flex items-center justify-center mx-auto font-bold text-base shadow-sm">
                  1º
                </div>
                <div>
                  <h4 className="font-display font-bold text-sm sm:text-base text-[#2C1810] truncate">
                    {leaderboard[0].user?.nome.split(' ')[0]}
                  </h4>
                  <span className="text-xs font-mono text-[#9A3412] font-bold">
                    {leaderboard[0].prog.pontos} XP
                  </span>
                  <div className="text-[10px] text-gray-500 mt-0.5">
                    {leaderboard[0].prog.cantigasAprendidas.length} cantigas
                  </div>
                </div>
              </div>

              {/* 3rd Place */}
              <div className="bg-white rounded-3xl p-3 sm:p-4 border border-[#E6D5AC] text-center space-y-2 order-3 shadow-sm">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto font-bold text-sm">
                  3º
                </div>
                <div>
                  <h4 className="font-display font-bold text-xs sm:text-sm text-[#2C1810] truncate">
                    {leaderboard[2].user?.nome.split(' ')[0]}
                  </h4>
                  <span className="text-[11px] font-mono text-[#9A3412] font-bold">
                    {leaderboard[2].prog.pontos} XP
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Full Leaderboard Table */}
          <div className="bg-white rounded-3xl border border-[#E6D5AC] overflow-hidden shadow-xs">
            <div className="p-4 sm:p-5 border-b border-[#E6D5AC] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-[#9A3412]" />
                <h3 className="font-display font-bold text-sm sm:text-base text-[#2C1810]">
                  Tabela Geral de Membros da Casa
                </h3>
              </div>
              <span className="text-xs text-gray-500 font-mono">
                {leaderboard.length} membros ativos
              </span>
            </div>

            <div className="divide-y divide-gray-100">
              {leaderboard.map((entry, index) => {
                const isCurrent = entry.user?.id === currentUser?.id;

                return (
                  <div
                    key={entry.user?.id}
                    className={`p-3.5 sm:p-4 flex items-center justify-between gap-3 transition-colors ${
                      isCurrent ? 'bg-[#FFF7ED]' : 'hover:bg-[#FAF8F5]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 text-center font-mono font-bold text-xs text-gray-400">
                        {index + 1}º
                      </span>
                      <div className="w-8 h-8 rounded-full bg-[#E6D5AC] flex items-center justify-center text-xs font-bold text-[#59260B] uppercase">
                        {entry.user?.nome.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-display font-bold text-xs sm:text-sm text-[#2C1810]">
                            {entry.user?.nome}
                          </span>
                          {isCurrent && (
                            <span className="text-[9px] bg-[#9A3412] text-white px-1.5 py-0.2 rounded font-bold">
                              Você
                            </span>
                          )}
                          {entry.user?.perfil === 'administradora' && (
                            <span className="text-[9px] bg-[#FEF3C7] text-[#92400E] px-1.5 py-0.2 rounded font-bold">
                              Iyá Tèbíèse
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-gray-500">
                          {entry.prog.cantigasAprendidas.length} cantigas aprendidas · {entry.prog.sequenciaDias}d seguidos
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="font-mono font-bold text-xs sm:text-sm text-[#9A3412]">
                        {entry.prog.pontos} XP
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
