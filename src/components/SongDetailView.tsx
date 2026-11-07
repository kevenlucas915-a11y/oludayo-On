import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  ArrowLeft,
  Play,
  Pause,
  Repeat,
  Volume2,
  BookOpen,
  Info,
  Sparkles,
  CheckCircle2,
  Clock,
  Languages,
} from 'lucide-react';
import { ketuAudio } from '../utils/audioSynth';

export const SongDetailView: React.FC = () => {
  const {
    selectedCantigaId,
    cantigas,
    orixas,
    tipos,
    setCurrentView,
    openGlossario,
    startLesson,
    progresso,
  } = useApp();

  const cantiga = cantigas.find((c) => c.id === selectedCantigaId);
  const orixa = cantiga ? orixas.find((o) => o.id === cantiga.orixaId) : null;
  const tipo = cantiga ? tipos.find((t) => t.id === cantiga.tipoId) : null;

  const [isPlaying, setIsPlaying] = useState(false);
  const [activeVerseIndex, setActiveVerseIndex] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [isLoopingTrecho, setIsLoopingTrecho] = useState(false);

  // Stop audio on unmount
  useEffect(() => {
    return () => {
      ketuAudio.stop();
    };
  }, []);

  if (!cantiga) {
    return (
      <div className="text-center py-12 space-y-4">
        <p className="text-sm text-gray-500">Cantiga não encontrada.</p>
        <button
          onClick={() => setCurrentView('cantigas')}
          className="px-4 py-2 bg-[#9A3412] text-white rounded-xl text-xs font-semibold"
        >
          Voltar às cantigas
        </button>
      </div>
    );
  }

  const isLearned = progresso.cantigasAprendidas.includes(cantiga.id);

  const handlePlayToggle = () => {
    if (isPlaying) {
      ketuAudio.pause();
      setIsPlaying(false);
    } else {
      ketuAudio.playCantiga({
        verses: cantiga.versos,
        toque: cantiga.toqueAtabaque,
        audioUrl: cantiga.audioUrl,
        startIndex: activeVerseIndex,
        onVerseChange: (idx) => setActiveVerseIndex(idx),
        onStateChange: (playing) => setIsPlaying(playing),
      });
      setIsPlaying(true);
    }
  };

  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
    ketuAudio.setRate(speed);
  };

  const handleToggleLoop = () => {
    const looping = ketuAudio.toggleLoopVerse();
    setIsLoopingTrecho(looping);
  };

  const handleVerseClick = (index: number) => {
    setActiveVerseIndex(index);
    if (isPlaying) {
      ketuAudio.setVerse(index);
    } else {
      // Play immediately starting from clicked verse
      ketuAudio.playCantiga({
        verses: cantiga.versos,
        toque: cantiga.toqueAtabaque,
        audioUrl: cantiga.audioUrl,
        startIndex: index,
        onVerseChange: (idx) => setActiveVerseIndex(idx),
        onStateChange: (playing) => setIsPlaying(playing),
      });
      setIsPlaying(true);
    }
  };

  return (
    <div className="space-y-6 pb-20 max-w-4xl mx-auto">
      {/* Top Back Navigation Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setCurrentView('cantigas')}
          className="flex items-center gap-1.5 text-xs font-semibold text-[#78350F] hover:text-[#9A3412] transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          <span>Voltar para as cantigas</span>
        </button>

        {isLearned && (
          <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Cantiga Aprendida!
          </span>
        )}
      </div>

      {/* Header Banner with Orixá's Sacred Colors */}
      <div
        className="rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${orixa?.corPrimaria || '#7C2D12'}, ${orixa?.corSecundaria || '#9A3412'})`,
        }}
      >
        <div className="relative z-10 space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-white/80">
            <span className="uppercase tracking-wider">{orixa?.nome}</span>
            <span aria-hidden="true">·</span>
            <span>{tipo?.nome}</span>
            <span aria-hidden="true">·</span>
            <span>Toque: {cantiga.toqueAtabaque}</span>
            {cantiga.ehExemplo && (
              <>
                <span aria-hidden="true">·</span>
                <span className="bg-white/20 px-1.5 py-0.5 rounded text-[10px]">Exemplo da Casa</span>
              </>
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-display font-bold text-white tracking-tight">
            {cantiga.titulo}
          </h1>

          <p className="text-xs sm:text-sm text-white/90 italic">
            Saudação tradicional: "{orixa?.saudacao}"
          </p>
        </div>
      </div>

      {/* Audio Player Card (Web Audio Ketu Engine with Atabaques & Speed Control) */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#E6D5AC] shadow-md space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-[#F5EBE1] flex items-center justify-center text-[#9A3412]">
              <Volume2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xs font-bold text-[#78350F] uppercase tracking-wider">
                Áudio da Casa & Cadência dos Atabaques
              </h2>
              <p className="text-xs text-gray-500">
                Toque tradicional: {cantiga.toqueAtabaque} · Toque em qualquer verso para ouvir
              </p>
            </div>
          </div>

          {isPlaying && (
            <span className="hidden sm:inline-flex items-center gap-1.5 text-xs text-[#9A3412] font-semibold bg-[#FFF7ED] px-2.5 py-1 rounded-full border border-[#FDBA74]">
              <span className="w-2 h-2 rounded-full bg-[#EA580C] animate-ping" />
              Tocando agora
            </span>
          )}
        </div>

        {/* Player Controls Bar */}
        <div className="bg-[#FAF8F5] rounded-2xl p-4 border border-[#E6D5AC] flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Main Play / Pause Button */}
          <div className="flex items-center gap-3">
            <button
              onClick={handlePlayToggle}
              className="w-12 h-12 rounded-full bg-[#9A3412] text-white flex items-center justify-center shadow-md hover:bg-[#7C2D12] active:scale-95 transition-all focus:outline-none focus:ring-2 focus:ring-[#9A3412] focus:ring-offset-2"
              aria-label={isPlaying ? 'Pausar cantiga' : 'Tocar cantiga'}
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 fill-white" />
              ) : (
                <Play className="w-5 h-5 fill-white ml-0.5" />
              )}
            </button>
            <div>
              <span className="text-xs font-bold text-[#2C1810] block">
                {isPlaying ? 'Ouvindo o canto e ritmo' : 'Iniciar reprodução'}
              </span>
              <span className="text-[11px] text-gray-500">
                Verso {activeVerseIndex + 1} de {cantiga.versos.length}
              </span>
            </div>
          </div>

          {/* Speed & Loop Controls */}
          <div className="flex items-center gap-3 flex-wrap justify-center">
            {/* Speed selection: 0.5x, 0.75x, 1x */}
            <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-[#E6D5AC]">
              <span className="text-[10px] font-bold text-gray-400 px-1.5 uppercase">Vel:</span>
              <button
                onClick={() => handleSpeedChange(0.5)}
                className={`px-2 py-1 text-xs font-bold rounded-lg transition-colors ${
                  playbackSpeed === 0.5
                    ? 'bg-[#9A3412] text-white shadow-xs'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                title="Velocidade lenta para aprender pronúncia"
              >
                0.5x
              </button>
              <button
                onClick={() => handleSpeedChange(0.75)}
                className={`px-2 py-1 text-xs font-bold rounded-lg transition-colors ${
                  playbackSpeed === 0.75
                    ? 'bg-[#9A3412] text-white shadow-xs'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                title="Velocidade moderada"
              >
                0.75x
              </button>
              <button
                onClick={() => handleSpeedChange(1.0)}
                className={`px-2 py-1 text-xs font-bold rounded-lg transition-colors ${
                  playbackSpeed === 1.0
                    ? 'bg-[#9A3412] text-white shadow-xs'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                title="Velocidade normal de barracão"
              >
                1.0x
              </button>
            </div>

            {/* Loop Verse / Repeat Trecho button */}
            <button
              onClick={handleToggleLoop}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
                isLoopingTrecho
                  ? 'bg-[#9A3412] text-white border-[#9A3412] shadow-sm'
                  : 'bg-white text-gray-700 border-[#E6D5AC] hover:border-[#9A3412]'
              }`}
              title="Repetir o verso atual em loop contínuo"
            >
              <Repeat className="w-3.5 h-3.5" />
              <span>Repetir trecho</span>
            </button>
          </div>
        </div>
      </div>

      {/* Verses Section (Letra em Iorubá, Pronúncia e Tradução Verso por Verso) */}
      <section className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-lg sm:text-xl font-display font-bold text-[#2C1810]">
              Letra Sagrada, Pronúncia e Tradução
            </h2>
            <p className="text-xs text-[#78350F]/70">
              Estude verso por verso. Clique em um verso para ouvi-lo isoladamente.
            </p>
          </div>

          <button
            onClick={openGlossario}
            className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-[#7C2D12] bg-[#FAF8F5] border border-[#E6D5AC] hover:border-[#9A3412] hover:bg-[#F5EBE1] transition-colors"
            title="Dúvida sobre uma palavra? Consulte o Glossário Litúrgico"
          >
            <Languages className="w-3.5 h-3.5 text-[#9A3412]" />
            <span>Consultar Glossário</span>
          </button>
        </div>

        <div className="space-y-3">
          {cantiga.versos.map((verso, index) => {
            const isActive = isPlaying && activeVerseIndex === index;

            return (
              <div
                key={verso.id}
                onClick={() => handleVerseClick(index)}
                className={`cursor-pointer rounded-2xl p-4 sm:p-5 border transition-all ${
                  isActive
                    ? 'bg-[#FFF7ED] border-[#9A3412] shadow-md ring-2 ring-[#9A3412]/20'
                    : 'bg-white border-[#E6D5AC] hover:border-[#9A3412]/50 hover:bg-[#FAF8F5]'
                }`}
              >
                <div className="flex items-start gap-3 sm:gap-4">
                  {/* Verse Number & Play indicator */}
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold font-mono tabular-nums shrink-0 transition-colors ${
                      isActive
                        ? 'bg-[#9A3412] text-white'
                        : 'bg-[#F5EBE1] text-[#7C2D12]'
                    }`}
                  >
                    {isActive ? (
                      <Volume2 className="w-4 h-4 animate-pulse" />
                    ) : (
                      index + 1
                    )}
                  </div>

                  {/* 3-Column Content: Ioruba, Pronuncia, Traducao */}
                  <div className="flex-1 space-y-2">
                    {/* Yoruba Original */}
                    <div>
                      <span className="text-[10px] font-bold text-[#9A3412] uppercase tracking-wider block">
                        Iorubá
                      </span>
                      <p className="text-base sm:text-lg font-display font-bold text-[#2C1810] leading-snug">
                        {verso.ioruba}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 pt-1 border-t border-gray-100">
                      {/* Guia de Pronúncia em Português */}
                      <div className="bg-[#FAF8F5] p-2.5 rounded-xl border border-[#E6D5AC]/60">
                        <span className="text-[10px] font-bold text-[#78350F] uppercase tracking-wider block mb-0.5">
                          Guia de Pronúncia (como falar)
                        </span>
                        <p className="text-xs sm:text-sm text-[#59260B] font-medium italic">
                          "{verso.pronuncia}"
                        </p>
                      </div>

                      {/* Tradução em Português */}
                      <div className="bg-[#F5EBE1]/40 p-2.5 rounded-xl border border-[#E6D5AC]/60">
                        <span className="text-[10px] font-bold text-[#78350F] uppercase tracking-wider block mb-0.5">
                          Tradução Literal / Sentido
                        </span>
                        <p className="text-xs sm:text-sm text-[#2C1810]">
                          {verso.traducao}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Ritual Context: "Quando é Cantada" */}
      <section className="bg-white rounded-3xl p-5 sm:p-6 border border-[#E6D5AC] space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold text-[#7C2D12] uppercase tracking-wider">
          <Clock className="w-4 h-4 text-[#9A3412]" />
          <span>Quando é Cantada (Momento Ritual)</span>
        </div>
        <p className="text-xs sm:text-sm text-[#2C1810] leading-relaxed">
          {cantiga.quandoCantada}
        </p>
      </section>

      {/* House Observations: "Observações da Casa" */}
      <section className="bg-[#F5EBE1] rounded-3xl p-5 sm:p-6 border border-[#E6D5AC] space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold text-[#7C2D12] uppercase tracking-wider">
          <Info className="w-4 h-4 text-[#9A3412]" />
          <span>Observações e Recomendações da Casa</span>
        </div>
        <p className="text-xs sm:text-sm text-[#59260B] leading-relaxed">
          {cantiga.observacoes}
        </p>
      </section>

      {/* Prominent Floating / Bottom Sticky CTA: "Praticar esta cantiga" */}
      <div className="pt-4">
        <button
          onClick={() => {
            ketuAudio.stop();
            startLesson(cantiga.id);
          }}
          className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-[#7C2D12] via-[#9A3412] to-[#B45309] text-white font-display font-bold text-base sm:text-lg shadow-xl shadow-[#9A3412]/30 hover:opacity-95 active:scale-[0.99] transition-all flex items-center justify-center gap-3"
        >
          <BookOpen className="w-5 h-5" />
          <span>Praticar esta Cantiga (Modo Lição)</span>
          <Sparkles className="w-5 h-5 text-[#FDE047]" />
        </button>
      </div>
    </div>
  );
};
