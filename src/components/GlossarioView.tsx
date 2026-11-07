import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { GLOSSARIO_TERMOS } from '../data/glossarioData';
import { TermoGlossario } from '../types';
import { yorubaSpeech } from '../utils/yorubaSpeech';
import {
  Volume2,
  VolumeX,
  Search,
  BookOpen,
  Sparkles,
  ArrowLeft,
  Music,
  HelpCircle,
  CheckCircle2,
} from 'lucide-react';

export const GlossarioView: React.FC = () => {
  const { orixas, setCurrentView, openCantigaDetail, cantigas } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('todos');
  const [activePlayingId, setActivePlayingId] = useState<string | null>(null);
  const [isSlowMode, setIsSlowMode] = useState<boolean>(false);

  const categories = [
    { id: 'todos', label: 'Todos os Termos' },
    { id: 'saudacao', label: 'Saudações Sagradas' },
    { id: 'cargo', label: 'Cargos da Casa' },
    { id: 'ritmo', label: 'Toques & Ritmos' },
    { id: 'conceito', label: 'Fundamentos & Axé' },
    { id: 'liturgia', label: 'Ritos & Reza' },
    { id: 'elemento', label: 'Elementos Sagrados' },
  ];

  const filteredTermos = useMemo(() => {
    return GLOSSARIO_TERMOS.filter((t) => {
      const matchesSearch =
        t.termo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.traducao.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.pronunciaFonetica.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.significadoLiturgico.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory =
        selectedCategory === 'todos' || t.categoria === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, selectedCategory]);

  const handlePlayAudio = (termo: TermoGlossario, textToRead?: string) => {
    if (activePlayingId === termo.id) {
      yorubaSpeech.stop();
      setActivePlayingId(null);
      return;
    }

    setActivePlayingId(termo.id);
    yorubaSpeech.playTermo(
      textToRead || termo.termo,
      termo.pronunciaFonetica,
      isSlowMode,
      () => setActivePlayingId(termo.id),
      () => setActivePlayingId(null)
    );
  };

  const getOrixa = (orixaId?: string) => {
    if (!orixaId) return null;
    return orixas.find((o) => o.id === orixaId);
  };

  return (
    <div className="space-y-6 pb-20 max-w-5xl mx-auto">
      {/* Top Navigation & Back Button */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setCurrentView('inicio')}
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#78350F] hover:text-[#9A3412] transition-colors p-1"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar ao Início</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsSlowMode(!isSlowMode)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
              isSlowMode
                ? 'bg-[#9A3412] text-white border-[#9A3412] shadow-sm'
                : 'bg-white text-gray-700 border-[#E6D5AC] hover:border-[#9A3412]'
            }`}
            title="Pronúncia mais pausada para estudo minucioso"
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>{isSlowMode ? 'Modo Lento (0.65x) Ativo' : 'Velocidade Normal'}</span>
          </button>
        </div>
      </div>

      {/* Header Banner */}
      <div className="bg-[#1C1917] rounded-3xl p-6 sm:p-8 text-white flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl border border-[#E6D5AC]/20">
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center gap-2 text-xs font-bold text-[#D4AF37]">
            <Sparkles className="w-4 h-4 text-[#D4AF37]" />
            <span className="uppercase tracking-widest">
              Língua Sagrada de Ketu · Tradição Oral do Terreiro
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-display font-bold text-white tracking-tight">
            Glossário Sagrado de Termos em Iorubá
          </h1>
          <p className="text-sm text-gray-300 leading-relaxed">
            Aprenda a pronúncia correta com áudio, o guia fonético em português, o
            significado litúrgico nos ritos da casa e os versos sagrados entoados nas
            cantigas tradicionais.
          </p>
        </div>

        <div className="bg-[#2C1810]/80 border border-[#D4AF37]/40 rounded-2xl p-4 shrink-0 text-center sm:text-left shadow-inner">
          <div className="text-2xl font-bold font-display text-[#D4AF37]">
            {GLOSSARIO_TERMOS.length} Termos
          </div>
          <div className="text-xs text-gray-300">Catalogados e com pronúncia</div>
          <div className="mt-2 text-[11px] text-[#E6D5AC]/80 flex items-center gap-1 justify-center sm:justify-start">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Revisados por Iyá Tèbíèse</span>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por termo em iorubá, pronúncia fonética ou significado..."
            className="w-full pl-12 pr-4 py-3.5 bg-white border border-[#E6D5AC] rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[#9A3412] focus:border-transparent transition-all shadow-sm"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-400 hover:text-gray-600"
            >
              Limpar
            </button>
          )}
        </div>

        {/* Categories Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-[#9A3412] text-white shadow-sm'
                    : 'bg-white text-[#78350F] border border-[#E6D5AC] hover:bg-[#F5EBE1]'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Term List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredTermos.map((termo) => {
          const isPlaying = activePlayingId === termo.id;
          const orixa = getOrixa(termo.orixaRelacionadoId);

          return (
            <div
              key={termo.id}
              className="bg-white rounded-3xl p-5 sm:p-6 border border-[#E6D5AC] hover:border-[#9A3412]/50 hover:shadow-md transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                {/* Header: Term, Category, and Orixá Badge */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-xl sm:text-2xl font-display font-bold text-[#2C1810] flex items-center gap-2">
                      <span>{termo.termo}</span>
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs font-semibold text-[#9A3412] bg-[#FFF7ED] px-2.5 py-0.5 rounded-full border border-[#FED7AA]">
                        Como se lê: {termo.pronunciaFonetica}
                      </span>
                    </div>
                  </div>

                  {/* Audio Button */}
                  <button
                    onClick={() => handlePlayAudio(termo)}
                    aria-label={`Ouvir pronúncia de ${termo.termo}`}
                    className={`shrink-0 w-11 h-11 rounded-2xl flex items-center justify-center transition-all ${
                      isPlaying
                        ? 'bg-[#9A3412] text-white ring-4 ring-[#9A3412]/20 shadow-md animate-pulse'
                        : 'bg-[#F5EBE1] text-[#7C2D12] hover:bg-[#9A3412] hover:text-white'
                    }`}
                    title="Clique para ouvir a pronúncia correta em áudio"
                  >
                    {isPlaying ? (
                      <VolumeX className="w-5 h-5" />
                    ) : (
                      <Volume2 className="w-5 h-5" />
                    )}
                  </button>
                </div>

                {/* Translation */}
                <div className="text-sm font-medium text-[#2C1810]">
                  <span className="text-xs uppercase font-bold text-gray-400 block tracking-wider">
                    Tradução
                  </span>
                  <span>{termo.traducao}</span>
                </div>

                {/* Liturgical Meaning in Ketu */}
                <div className="text-xs text-gray-600 bg-[#FAF8F5] p-3 rounded-2xl border border-[#E6D5AC]/60 leading-relaxed">
                  <span className="font-bold text-[#78350F] block mb-0.5">
                    Significado no Terreiro:
                  </span>
                  {termo.significadoLiturgico}
                </div>

                {/* Cantiga Verse Example */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between text-[11px] font-bold text-[#78350F]">
                    <span className="flex items-center gap-1">
                      <Music className="w-3.5 h-3.5 text-[#9A3412]" />
                      Exemplo em Cantiga da Casa:
                    </span>
                    <button
                      onClick={() => handlePlayAudio(termo, termo.exemploUsoIoruba)}
                      className="text-[#9A3412] hover:underline flex items-center gap-1 font-semibold"
                    >
                      <Volume2 className="w-3 h-3" />
                      <span>Ouvir verso</span>
                    </button>
                  </div>
                  <div className="bg-[#FFFBEB] p-3 rounded-2xl border border-[#FDE68A] text-xs space-y-1">
                    <p className="font-semibold text-[#92400E] italic">
                      "{termo.exemploUsoIoruba}"
                    </p>
                    <p className="text-[#B45309] text-[11px]">
                      "{termo.exemploUsoTraducao}"
                    </p>
                  </div>
                </div>
              </div>

              {/* Footer info: Related Orixá */}
              <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs">
                {orixa ? (
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: orixa.corPrimaria }}
                    />
                    <span className="text-gray-600 font-medium">
                      Consagrado a <strong className="text-[#2C1810]">{orixa.nome}</strong>
                    </span>
                  </div>
                ) : (
                  <span className="text-gray-400 text-[11px]">Uso comum no xirê geral</span>
                )}

                <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                  {termo.categoria}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {filteredTermos.length === 0 && (
        <div className="bg-white rounded-3xl p-12 text-center border border-[#E6D5AC] space-y-3">
          <BookOpen className="w-12 h-12 text-gray-300 mx-auto" />
          <h3 className="text-lg font-display font-bold text-[#2C1810]">
            Nenhum termo encontrado
          </h3>
          <p className="text-xs text-gray-500 max-w-md mx-auto">
            Não encontramos termos correspondentes a "{searchTerm}". Tente buscar por saudações,
            nomes de ritmos ou partes do verso sagrado.
          </p>
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory('todos');
            }}
            className="text-xs font-bold text-[#9A3412] hover:underline"
          >
            Limpar filtros de busca
          </button>
        </div>
      )}
    </div>
  );
};
