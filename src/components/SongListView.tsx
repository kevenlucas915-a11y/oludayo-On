import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Play,
  Music2,
  X,
  Volume2,
} from 'lucide-react';

export const SongListView: React.FC = () => {
  const {
    cantigas,
    orixas,
    tipos,
    progresso,
    selectedOrixaFilter,
    selectedTipoFilter,
    setSelectedOrixaFilter,
    setSelectedTipoFilter,
    openCantigaDetail,
    startLesson,
    currentUser,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'todas' | 'aprendidas' | 'pendentes'>('todas');

  // Filter cantigas
  const visibleCantigas = useMemo(() => {
    return cantigas.filter((c) => {
      // Access control: only admin can see non-reviewed cantigas
      if (!c.revisada && currentUser?.perfil !== 'administradora') {
        return false;
      }

      // Orixa filter
      if (selectedOrixaFilter && c.orixaId !== selectedOrixaFilter) {
        return false;
      }

      // Tipo filter
      if (selectedTipoFilter && c.tipoId !== selectedTipoFilter) {
        return false;
      }

      // Status filter
      const isLearned = progresso.cantigasAprendidas.includes(c.id);
      if (statusFilter === 'aprendidas' && !isLearned) return false;
      if (statusFilter === 'pendentes' && isLearned) return false;

      // Text search
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchTitle = c.titulo.toLowerCase().includes(query);
        const matchVerses = c.versos.some(
          (v) =>
            v.ioruba.toLowerCase().includes(query) ||
            v.pronuncia.toLowerCase().includes(query) ||
            v.traducao.toLowerCase().includes(query)
        );
        const orixa = orixas.find((o) => o.id === c.orixaId);
        const matchOrixa = orixa?.nome.toLowerCase().includes(query);
        if (!matchTitle && !matchVerses && !matchOrixa) return false;
      }

      return true;
    });
  }, [
    cantigas,
    currentUser,
    selectedOrixaFilter,
    selectedTipoFilter,
    statusFilter,
    searchQuery,
    progresso.cantigasAprendidas,
    orixas,
  ]);

  const activeOrixaObj = orixas.find((o) => o.id === selectedOrixaFilter);
  const activeTipoObj = tipos.find((t) => t.id === selectedTipoFilter);

  return (
    <div className="space-y-6 pb-12">
      {/* Title & Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-[#2C1810]">
            Acervo de Cantigas
          </h1>
          <p className="text-xs sm:text-sm text-[#78350F]/70">
            Encontre cantigas por orixá, ritmo de atabaque ou momento do ritual
          </p>
        </div>
        <div className="text-xs text-[#59260B]/80 bg-white border border-[#E6D5AC] px-3 py-1.5 rounded-xl self-start sm:self-auto font-mono tabular-nums">
          <span className="font-bold text-[#9A3412]">{visibleCantigas.length}</span> cantigas encontradas
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white rounded-2xl p-4 border border-[#E6D5AC] shadow-sm space-y-4">
        {/* Search input */}
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por letra em iorubá, título ou tradução..."
            className="w-full pl-10 pr-10 py-2.5 bg-[#FAF8F5] border border-[#E6D5AC] rounded-xl text-xs sm:text-sm text-[#2C1810] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#9A3412] focus:bg-white transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
              aria-label="Limpar busca"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Combined Filter Selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          {/* Orixá selector */}
          <div>
            <label className="block text-[11px] font-semibold text-[#78350F] mb-1">
              Filtrar por Orixá
            </label>
            <select
              value={selectedOrixaFilter || ''}
              onChange={(e) => setSelectedOrixaFilter(e.target.value || null)}
              className="w-full py-2 px-3 bg-[#FAF8F5] border border-[#E6D5AC] rounded-xl text-xs text-[#2C1810] focus:outline-none focus:ring-2 focus:ring-[#9A3412]"
            >
              <option value="">Todos os Orixás ({orixas.length})</option>
              {orixas.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.nome}
                </option>
              ))}
            </select>
          </div>

          {/* Tipo selector */}
          <div>
            <label className="block text-[11px] font-semibold text-[#78350F] mb-1">
              Filtrar por Momento / Tipo
            </label>
            <select
              value={selectedTipoFilter || ''}
              onChange={(e) => setSelectedTipoFilter(e.target.value || null)}
              className="w-full py-2 px-3 bg-[#FAF8F5] border border-[#E6D5AC] rounded-xl text-xs text-[#2C1810] focus:outline-none focus:ring-2 focus:ring-[#9A3412]"
            >
              <option value="">Todos os Tipos ({tipos.length})</option>
              {tipos.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.nome}
                </option>
              ))}
            </select>
          </div>

          {/* Progress status selector */}
          <div>
            <label className="block text-[11px] font-semibold text-[#78350F] mb-1">
              Status de Aprendizado
            </label>
            <div className="flex items-center gap-1 p-1 bg-[#FAF8F5] border border-[#E6D5AC] rounded-xl">
              <button
                onClick={() => setStatusFilter('todas')}
                className={`flex-1 py-1.5 text-[11px] font-semibold rounded-lg transition-colors ${
                  statusFilter === 'todas' ? 'bg-[#9A3412] text-white shadow-sm' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Todas
              </button>
              <button
                onClick={() => setStatusFilter('aprendidas')}
                className={`flex-1 py-1.5 text-[11px] font-semibold rounded-lg transition-colors ${
                  statusFilter === 'aprendidas' ? 'bg-[#9A3412] text-white shadow-sm' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Aprendidas
              </button>
              <button
                onClick={() => setStatusFilter('pendentes')}
                className={`flex-1 py-1.5 text-[11px] font-semibold rounded-lg transition-colors ${
                  statusFilter === 'pendentes' ? 'bg-[#9A3412] text-white shadow-sm' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                A Aprender
              </button>
            </div>
          </div>
        </div>

        {/* Active Filters Badges */}
        {(selectedOrixaFilter || selectedTipoFilter || searchQuery) && (
          <div className="flex items-center flex-wrap gap-2 pt-2 border-t border-gray-100 text-xs">
            <span className="text-gray-500 flex items-center gap-1 text-[11px]">
              <Filter className="w-3 h-3" /> Filtros ativos:
            </span>
            {activeOrixaObj && (
              <span className="inline-flex items-center gap-1.5 bg-[#F5EBE1] border border-[#E6D5AC] text-[#7C2D12] px-2.5 py-0.5 rounded-lg text-xs font-medium">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: activeOrixaObj.corPrimaria }}
                />
                {activeOrixaObj.nome}
                <button
                  onClick={() => setSelectedOrixaFilter(null)}
                  className="hover:text-red-700 ml-0.5"
                  aria-label="Remover filtro de orixá"
                >
                  ×
                </button>
              </span>
            )}
            {activeTipoObj && (
              <span className="inline-flex items-center gap-1 bg-[#F5EBE1] border border-[#E6D5AC] text-[#7C2D12] px-2.5 py-0.5 rounded-lg text-xs font-medium">
                {activeTipoObj.nome}
                <button
                  onClick={() => setSelectedTipoFilter(null)}
                  className="hover:text-red-700 ml-0.5"
                  aria-label="Remover filtro de tipo"
                >
                  ×
                </button>
              </span>
            )}
            <button
              onClick={() => {
                setSelectedOrixaFilter(null);
                setSelectedTipoFilter(null);
                setSearchQuery('');
                setStatusFilter('todas');
              }}
              className="text-[11px] text-[#9A3412] font-semibold hover:underline ml-auto"
            >
              Limpar todos
            </button>
          </div>
        )}
      </div>

      {/* Song List */}
      {visibleCantigas.length === 0 ? (
        <div className="bg-white rounded-3xl p-10 text-center border border-[#E6D5AC] space-y-3">
          <Music2 className="w-10 h-10 text-gray-300 mx-auto" />
          <h3 className="font-display font-bold text-lg text-[#2C1810]">
            Nenhuma cantiga encontrada
          </h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            Tente ajustar os filtros por orixá ou tipo, ou limpar o termo digitado na busca.
          </p>
          <button
            onClick={() => {
              setSelectedOrixaFilter(null);
              setSelectedTipoFilter(null);
              setSearchQuery('');
              setStatusFilter('todas');
            }}
            className="px-4 py-2 text-xs font-semibold text-[#9A3412] bg-[#FAF8F5] border border-[#E6D5AC] rounded-xl hover:bg-[#F5EBE1] transition-colors"
          >
            Ver todas as cantigas
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {visibleCantigas.map((cantiga) => {
            const orixa = orixas.find((o) => o.id === cantiga.orixaId);
            const tipo = tipos.find((t) => t.id === cantiga.tipoId);
            const isLearned = progresso.cantigasAprendidas.includes(cantiga.id);

            return (
              <div
                key={cantiga.id}
                className="bg-white rounded-2xl p-5 border border-[#E6D5AC] hover:border-[#9A3412] hover:shadow-md transition-all group flex flex-col justify-between relative overflow-hidden"
              >
                {/* Orixá sacred color vertical stripe */}
                <div
                  className="absolute left-0 top-0 bottom-0 w-1.5"
                  style={{ backgroundColor: orixa?.corPrimaria || '#9A3412' }}
                />

                <div className="pl-2 space-y-2.5">
                  {/* Metadata Row (Unboxed with typographic separators) */}
                  <div className="flex items-center justify-between text-xs text-[#78350F]/70">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-semibold text-[#2C1810] flex items-center gap-1">
                        <span
                          className="w-2 h-2 rounded-full inline-block"
                          style={{ backgroundColor: orixa?.corPrimaria }}
                        />
                        {orixa?.nome}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>{tipo?.nome}</span>
                      <span aria-hidden="true">·</span>
                      <span>Toque {cantiga.toqueAtabaque}</span>
                    </div>

                    {isLearned ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Aprendida
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                        <Clock className="w-3 h-3 text-amber-600" />
                        A Aprender
                      </span>
                    )}
                  </div>

                  {/* Title & Preview */}
                  <div>
                    <h3 className="font-display font-bold text-base sm:text-lg text-[#2C1810] group-hover:text-[#9A3412] transition-colors flex items-center gap-2">
                      <span>{cantiga.titulo}</span>
                      {!cantiga.revisada && (
                        <span className="text-[10px] font-normal text-amber-700 bg-amber-100 border border-amber-300 px-1.5 py-0.2 rounded">
                          Em revisão
                        </span>
                      )}
                    </h3>
                    {/* First verse excerpt */}
                    {cantiga.versos[0] && (
                      <p className="text-xs text-[#59260B]/80 italic mt-1 line-clamp-1">
                        "{cantiga.versos[0].ioruba}"
                      </p>
                    )}
                    <p className="text-[11px] text-[#78350F]/70 mt-1 line-clamp-1">
                      {cantiga.quandoCantada}
                    </p>
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="pl-2 mt-4 pt-3 border-t border-[#F5EBE1] flex items-center justify-between gap-2">
                  <div className="text-[11px] text-[#59260B]/70 flex items-center gap-1">
                    <Volume2 className="w-3.5 h-3.5 text-[#9A3412]" />
                    <span>{cantiga.versos.length} versos</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openCantigaDetail(cantiga.id)}
                      className="px-3 py-1.5 text-xs font-semibold text-[#59260B] bg-[#FAF8F5] border border-[#E6D5AC] rounded-xl hover:bg-[#F5EBE1] transition-colors"
                    >
                      Estudar Letra
                    </button>
                    <button
                      onClick={() => startLesson(cantiga.id)}
                      className="px-3.5 py-1.5 text-xs font-bold text-white bg-[#9A3412] hover:bg-[#7C2D12] rounded-xl shadow-sm flex items-center gap-1.5 transition-transform active:scale-95"
                    >
                      <Play className="w-3 h-3 fill-white" />
                      <span>Lição</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
