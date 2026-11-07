import React from 'react';
import { useApp } from '../context/AppContext';
import {
  Flame,
  Play,
  Sparkles,
  ArrowRight,
  BookOpen,
  Award,
  Music,
  CheckCircle,
  Shield,
  Languages,
} from 'lucide-react';

export const HomeView: React.FC = () => {
  const {
    currentUser,
    progresso,
    orixas,
    tipos,
    cantigas,
    setSelectedOrixaFilter,
    setSelectedTipoFilter,
    setCurrentView,
    openCantigaDetail,
    openGlossario,
    startLesson,
    switchUser,
  } = useApp();

  // For members, only reviewed cantigas count
  const reviewedCantigas = cantigas.filter((c) => c.revisada);

  // Find next cantiga to continue lesson (first unlearned, or first available)
  const nextCantiga =
    reviewedCantigas.find((c) => !progresso.cantigasAprendidas.includes(c.id)) ||
    reviewedCantigas[0];

  const nextCantigaOrixa = nextCantiga
    ? orixas.find((o) => o.id === nextCantiga.orixaId)
    : null;

  const handleSelectOrixa = (orixaId: string) => {
    setSelectedOrixaFilter(orixaId);
    setSelectedTipoFilter(null);
    setCurrentView('cantigas');
  };

  const handleSelectTipo = (tipoId: string) => {
    setSelectedTipoFilter(tipoId);
    setSelectedOrixaFilter(null);
    setCurrentView('cantigas');
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Hero Greeting & Streak Card */}
      <section className="bg-gradient-to-br from-[#7C2D12] via-[#9A3412] to-[#B45309] rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-[#7C2D12]/15 relative overflow-hidden">
        {/* Subtle decorative background motif */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 pointer-events-none flex items-center justify-center font-display text-9xl font-bold">
          Ọ
        </div>

        <div className="relative z-10 max-w-2xl">
          <div className="flex items-center gap-1.5 text-[#E6D5AC] text-[11px] font-semibold tracking-wider uppercase flex-wrap">
            <span>Àlàáfíà · Ketu</span>
            <span aria-hidden="true">·</span>
            <span>Uso Interno da Casa</span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-display font-bold tracking-tight text-[#FAF8F5]">
            Mojubá, {currentUser ? currentUser.nome.split(' ')[0] : 'Irmão de Santo'}!
          </h1>

          <p className="mt-2 text-xs sm:text-base text-[#FAF8F5]/85 leading-relaxed">
            Espaço de ensinamento sagrado das cantigas da casa. Pratique a pronúncia correta em iorubá, compreenda as traduções e viva o fundamento ritual.
          </p>

          {/* Quick Metrics Bar */}
          <div className="mt-5 grid grid-cols-3 gap-2 sm:flex sm:flex-wrap sm:items-center sm:gap-6 pt-4 border-t border-white/15">
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2.5">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center text-[#FDBA74]">
                <Flame className="w-4 h-4 sm:w-5 sm:h-5 fill-[#FDBA74]" />
              </div>
              <div>
                <span className="block text-lg sm:text-xl font-bold font-mono tabular-nums leading-tight">
                  {progresso.sequenciaDias}d
                </span>
                <span className="text-[10px] sm:text-[11px] text-[#FAF8F5]/70 block">Sequência</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2.5">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center text-[#FDE047]">
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div>
                <span className="block text-lg sm:text-xl font-bold font-mono tabular-nums leading-tight">
                  {progresso.cantigasAprendidas.length}/{reviewedCantigas.length}
                </span>
                <span className="text-[10px] sm:text-[11px] text-[#FAF8F5]/70 block">Aprendidas</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2.5">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center text-[#86EFAC]">
                <Award className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div>
                <span className="block text-lg sm:text-xl font-bold font-mono tabular-nums leading-tight">
                  {progresso.pontos}
                </span>
                <span className="text-[10px] sm:text-[11px] text-[#FAF8F5]/70 block">Pontos XP</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Prominent "Continuar Lição" CTA Card */}
      {nextCantiga && (
        <section className="bg-white rounded-3xl p-5 sm:p-6 border border-[#E6D5AC] shadow-sm hover:border-[#9A3412]/40 transition-all">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-md"
                style={{
                  backgroundColor: nextCantigaOrixa?.corPrimaria || '#9A3412',
                }}
              >
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2 text-xs text-[#78350F]/70">
                  <span className="font-semibold text-[#9A3412] uppercase tracking-wide">
                    Próxima Cantiga do Xirê
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>{nextCantigaOrixa?.nome}</span>
                  <span aria-hidden="true">·</span>
                  <span>Toque: {nextCantiga.toqueAtabaque}</span>
                </div>
                <h2 className="text-lg sm:text-xl font-display font-bold text-[#2C1810] mt-0.5">
                  {nextCantiga.titulo}
                </h2>
                <p className="text-xs sm:text-sm text-[#59260B]/80 line-clamp-1 mt-0.5">
                  {nextCantiga.quandoCantada}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 shrink-0 pt-2 sm:pt-0">
              <button
                onClick={() => openCantigaDetail(nextCantiga.id)}
                className="px-4 py-2.5 text-xs font-semibold text-[#59260B] bg-[#FAF8F5] border border-[#E6D5AC] rounded-xl hover:bg-[#F5EBE1] transition-colors"
              >
                Ver Letra
              </button>
              <button
                onClick={() => startLesson(nextCantiga.id)}
                className="px-5 py-2.5 text-xs font-bold text-white bg-[#9A3412] hover:bg-[#7C2D12] rounded-xl shadow-md shadow-[#9A3412]/20 flex items-center gap-2 transition-transform active:scale-95"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>Continuar Lição</span>
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Navigation Option 1: Por Orixá */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-display font-bold text-[#2C1810]">
              Navegar por Orixá
            </h2>
            <p className="text-xs sm:text-sm text-[#78350F]/70">
              Escolha um orixá para estudar as cantigas, toques e rezas correspondentes
            </p>
          </div>
          <button
            onClick={() => {
              setSelectedOrixaFilter(null);
              setSelectedTipoFilter(null);
              setCurrentView('cantigas');
            }}
            className="text-xs font-semibold text-[#9A3412] hover:text-[#7C2D12] flex items-center gap-1 group"
          >
            <span>Ver todas</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        {/* Responsive Grid of Orixás with Traditional Sacred Colors */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4">
          {orixas.map((orixa) => {
            const count = reviewedCantigas.filter((c) => c.orixaId === orixa.id).length;
            const learnedCount = reviewedCantigas.filter(
              (c) => c.orixaId === orixa.id && progresso.cantigasAprendidas.includes(c.id)
            ).length;

            return (
              <button
                key={orixa.id}
                onClick={() => handleSelectOrixa(orixa.id)}
                className="text-left bg-white rounded-2xl p-4 border border-[#E6D5AC] hover:border-[#9A3412] hover:shadow-md transition-all group flex flex-col justify-between min-h-[135px] relative overflow-hidden"
              >
                {/* Traditional sacred color accent bar at the top */}
                <div
                  className="absolute top-0 left-0 right-0 h-1.5"
                  style={{
                    backgroundColor: orixa.corPrimaria,
                  }}
                />

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: orixa.corPrimaria }}
                      title={`Cor sagrada: ${orixa.corPrimaria}`}
                    />
                    {learnedCount > 0 && learnedCount === count && count > 0 && (
                      <span title="Todas aprendidas!">
                        <CheckCircle className="w-4 h-4 text-emerald-600" />
                      </span>
                    )}
                  </div>
                  <h3 className="font-display font-bold text-base text-[#2C1810] group-hover:text-[#9A3412] transition-colors leading-tight">
                    {orixa.nome}
                  </h3>
                  <p className="text-[11px] text-[#78350F]/70 italic mt-0.5 line-clamp-1">
                    {orixa.saudacao}
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-[#F5EBE1] flex items-center justify-between text-[11px] text-[#59260B]/70">
                  <span>{count} {count === 1 ? 'cantiga' : 'cantigas'}</span>
                  {count > 0 && (
                    <span className="font-mono tabular-nums font-semibold text-[#9A3412]">
                      {learnedCount}/{count}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Featured Section: Glossário Litúrgico de Iorubá */}
      <section className="bg-gradient-to-r from-[#1C1917] via-[#2C1810] to-[#1C1917] rounded-3xl p-6 sm:p-7 text-white border border-[#D4AF37]/40 shadow-lg relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center gap-2 text-xs font-bold text-[#D4AF37]">
              <Languages className="w-4 h-4 text-[#D4AF37]" />
              <span className="uppercase tracking-widest">
                Novo Recurso · Tradição Litúrgica de Ketu
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-display font-bold text-white">
              Glossário Sagrado de Termos em Iorubá
            </h2>
            <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
              Consulte a pronúncia falada em áudio, o guia fonético e o significado litúrgico dos termos sagrados mais entoados nas cantigas da casa (Mojúbà, Àṣẹ, Orí, Kábíyèsílè, Patakorí, Alujá e outros).
            </p>
            <div className="flex flex-wrap gap-2 pt-2">
              <span className="text-[11px] bg-white/10 text-[#E6D5AC] px-2.5 py-1 rounded-full border border-white/10">
                25 termos catalogados
              </span>
              <span className="text-[11px] bg-white/10 text-[#E6D5AC] px-2.5 py-1 rounded-full border border-white/10">
                Áudio com pronúncia pausada
              </span>
              <span className="text-[11px] bg-white/10 text-[#E6D5AC] px-2.5 py-1 rounded-full border border-white/10">
                Versos de cantigas como exemplo
              </span>
            </div>
          </div>

          <div className="shrink-0 flex sm:flex-col gap-2">
            <button
              onClick={openGlossario}
              className="px-5 py-3.5 bg-[#D4AF37] hover:bg-[#B38F24] text-[#1C1917] font-display font-bold text-xs sm:text-sm rounded-2xl shadow-md flex items-center justify-center gap-2 transition-transform active:scale-95"
            >
              <Languages className="w-4 h-4" />
              <span>Abrir Glossário com Áudio</span>
            </button>
          </div>
        </div>
      </section>

      {/* Navigation Option 2: Por Tipo de Cantiga */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-display font-bold text-[#2C1810]">
              Navegar por Tipo de Cantiga
            </h2>
            <p className="text-xs sm:text-sm text-[#78350F]/70">
              Estude por momento litúrgico: rezas (àdúrà), xirê público, chamadas e saudações
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {tipos.map((tipo) => {
            const count = reviewedCantigas.filter((c) => c.tipoId === tipo.id).length;

            return (
              <button
                key={tipo.id}
                onClick={() => handleSelectTipo(tipo.id)}
                className="text-left bg-white rounded-2xl p-4 sm:p-5 border border-[#E6D5AC] hover:border-[#9A3412] hover:shadow-md transition-all group flex items-start justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Music className="w-4 h-4 text-[#9A3412]" />
                    <h3 className="font-display font-bold text-base text-[#2C1810] group-hover:text-[#9A3412] transition-colors">
                      {tipo.nome}
                    </h3>
                  </div>
                  <p className="text-xs text-[#59260B]/75 line-clamp-2 leading-relaxed">
                    {tipo.descricao}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <span className="text-xs font-semibold text-[#9A3412] bg-[#FAF8F5] border border-[#E6D5AC] px-2 py-1 rounded-lg">
                    {count}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* House Precept & Heritage Banner */}
      <section className="bg-[#F5EBE1] border border-[#E6D5AC] rounded-3xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center sm:text-left">
          <div className="text-xs font-bold text-[#7C2D12] uppercase tracking-wider">
            Compromisso com o Axé
          </div>
          <h3 className="font-display font-bold text-lg text-[#2C1810]">
            Cantigas Tradicionais e Fundamentos da Casa
          </h3>
          <p className="text-xs text-[#59260B]/80 max-w-xl">
            Este aplicativo é de uso interno e fraterno. As cantigas cadastradas seguem as orientações da Iyalorixá e dos Ogans da casa.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-end">
          <button
            onClick={() => setCurrentView('progresso')}
            className="shrink-0 px-4 py-2.5 bg-white border border-[#E6D5AC] hover:border-[#9A3412] rounded-xl text-xs font-bold text-[#9A3412] shadow-sm transition-colors whitespace-nowrap"
          >
            Ver Ranking da Casa
          </button>
          {currentUser?.perfil === 'administradora' ? (
            <button
              onClick={() => setCurrentView('admin')}
              className="shrink-0 px-4 py-2.5 bg-[#9A3412] hover:bg-[#7C2D12] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors whitespace-nowrap"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Painel de Iyá Tèbíèse</span>
            </button>
          ) : (
            <button
              onClick={() => {
                switchUser('user-admin-jenifer');
                setCurrentView('admin');
              }}
              className="shrink-0 px-4 py-2.5 bg-[#F5EBE1] border border-[#9A3412]/40 hover:bg-[#E6D5AC] text-[#7C2D12] rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors whitespace-nowrap"
              title="Acessar painel de Iyá Tèbíèse"
            >
              <Shield className="w-3.5 h-3.5 text-[#9A3412]" />
              <span>Acessar Painel da Casa</span>
            </button>
          )}
        </div>
      </section>
    </div>
  );
};
