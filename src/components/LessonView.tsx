import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  X,
  Volume2,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Sparkles,
  Trophy,
  RotateCcw,
  Music,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  Exercicio,
  ExercicioOuvirEscolher,
  ExercicioCompletarPalavra,
  ExercicioLigarTraducao,
  ExercicioOrdenarVersos,
  ExercicioCantarJunto,
} from '../types';
import { generateExercisesForCantiga } from '../utils/lessonGenerator';
import { ketuAudio } from '../utils/audioSynth';

export const LessonView: React.FC = () => {
  const {
    selectedCantigaId,
    cantigas,
    orixas,
    setCurrentView,
    completarLicao,
    openCantigaDetail,
  } = useApp();

  const cantiga = cantigas.find((c) => c.id === selectedCantigaId);
  const orixa = cantiga ? orixas.find((o) => o.id === cantiga.orixaId) : null;

  // Generate exercises for this cantiga
  const exercises = useMemo(() => {
    if (!cantiga) return [];
    return generateExercisesForCantiga(cantiga, cantigas);
  }, [cantiga, cantigas]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [feedbackState, setFeedbackState] = useState<'idle' | 'correct' | 'wrong'>('idle');
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [isFinished, setIsFinished] = useState(false);
  const [finishedSummary, setFinishedSummary] = useState<{
    xpGanho: number;
    novasMedalhas: string[];
    cantigaAprendida: boolean;
  } | null>(null);

  // Exercise specific states
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [orderedVerses, setOrderedVerses] = useState<string[]>([]);
  const [selectedPairYoruba, setSelectedPairYoruba] = useState<string | null>(null);
  const [matchedPairs, setMatchedPairs] = useState<Record<string, string>>({});
  const [karaokeVerseIndex, setKaraokeVerseIndex] = useState(0);

  const currentExercise: Exercicio | undefined = exercises[currentIndex];

  // Stop audio on unmount or exercise change
  useEffect(() => {
    return () => {
      ketuAudio.stop();
    };
  }, [currentIndex]);

  // Reset exercise state when advancing
  useEffect(() => {
    setSelectedOption(null);
    setOrderedVerses([]);
    setSelectedPairYoruba(null);
    setMatchedPairs({});
    setFeedbackState('idle');
    setFeedbackMessage('');
    setKaraokeVerseIndex(0);

    // If "ouvir_escolher" or "cantar_junto", play audio prompt automatically or cue it
    if (currentExercise?.tipo === 'ouvir_escolher' && cantiga) {
      ketuAudio.playCantiga({
        verses: [currentExercise.versoAlvo],
        toque: cantiga.toqueAtabaque,
        startIndex: 0,
      });
    } else if (currentExercise?.tipo === 'cantar_junto' && cantiga) {
      ketuAudio.playCantiga({
        verses: currentExercise.versos,
        toque: cantiga.toqueAtabaque,
        startIndex: 0,
        onVerseChange: (idx) => setKaraokeVerseIndex(idx),
      });
    }
  }, [currentIndex, currentExercise, cantiga]);

  if (!cantiga || exercises.length === 0) {
    return (
      <div className="text-center py-12 space-y-4">
        <p className="text-sm text-gray-500">Nenhum exercício gerado para esta cantiga.</p>
        <button
          onClick={() => setCurrentView('cantigas')}
          className="px-4 py-2 bg-[#9A3412] text-white rounded-xl text-xs font-semibold"
        >
          Voltar às cantigas
        </button>
      </div>
    );
  }

  // Handle checking answers
  const handleVerifyAnswer = () => {
    if (!currentExercise) return;

    let isCorrect = false;
    let message = '';

    if (currentExercise.tipo === 'ouvir_escolher') {
      isCorrect = selectedOption === currentExercise.respostaCorreta;
      message = isCorrect
        ? 'Excelente! Você identificou a cadência sagrada do verso!'
        : `A resposta correta é: "${currentExercise.respostaCorreta}"`;
    } else if (currentExercise.tipo === 'completar_palavra') {
      isCorrect =
        selectedOption?.trim().toLowerCase() ===
        currentExercise.palavraOmitida.trim().toLowerCase();
      message = isCorrect
        ? 'Perfeito! Palavra em iorubá completada com respeito!'
        : `A palavra correta é: "${currentExercise.palavraOmitida}" (${currentExercise.versoOriginal.pronuncia})`;
    } else if (currentExercise.tipo === 'ligar_traducao') {
      const allMatched = currentExercise.pares.every(
        (p) => matchedPairs[p.ioruba] === p.traducao
      );
      isCorrect = allMatched;
      message = isCorrect
        ? 'Maravilhoso! Todas as traduções foram ligadas corretamente.'
        : 'Alguns pares não estavam certos. Reveja as traduções com atenção!';
    } else if (currentExercise.tipo === 'ordenar_versos') {
      isCorrect =
        JSON.stringify(orderedVerses) ===
        JSON.stringify(currentExercise.ordemCorretaIds);
      message = isCorrect
        ? 'Axé! Os versos foram colocados na ordem litúrgica exata!'
        : 'A ordem litúrgica requer atenção à sequência tradicional do xirê.';
    } else if (currentExercise.tipo === 'cantar_junto') {
      // Singing along counts as correct practice
      isCorrect = true;
      message = 'Que belo canto! O orixá se alegra com a louvação da casa.';
    }

    ketuAudio.playChime(isCorrect);
    if (isCorrect) {
      setCorrectCount((prev) => prev + 1);
      setFeedbackState('correct');
    } else {
      setFeedbackState('wrong');
    }
    setFeedbackMessage(message);
  };

  // Move to next exercise or finish
  const handleNextExercise = async () => {
    if (currentIndex + 1 < exercises.length) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      // Finish lesson
      const summary = await completarLicao(cantiga.id, correctCount, exercises.length);
      setFinishedSummary(summary);
      setIsFinished(true);

      // Celebration confetti
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#D4AF37', '#9A3412', '#F5EBE1', '#059669', '#1E3A8A'],
        });
      } catch {
        // Fallback
      }
    }
  };

  // Play audio for Ouvir Escolher
  const handlePlayOuvir = () => {
    if (currentExercise?.tipo === 'ouvir_escolher' && cantiga) {
      ketuAudio.playCantiga({
        verses: [currentExercise.versoAlvo],
        toque: cantiga.toqueAtabaque,
        startIndex: 0,
      });
    }
  };

  // Pair matching helper
  const handleSelectPairYoruba = (ioruba: string) => {
    setSelectedPairYoruba(ioruba);
  };

  const handleSelectPairTraducao = (traducao: string) => {
    if (selectedPairYoruba) {
      setMatchedPairs((prev) => ({
        ...prev,
        [selectedPairYoruba]: traducao,
      }));
      setSelectedPairYoruba(null);
    }
  };

  // Ordering helper
  const handleToggleOrderVerse = (id: string) => {
    if (orderedVerses.includes(id)) {
      setOrderedVerses((prev) => prev.filter((item) => item !== id));
    } else {
      setOrderedVerses((prev) => [...prev, id]);
    }
  };

  // Final Summary Screen
  if (isFinished && finishedSummary) {
    const accuracy = Math.round((correctCount / exercises.length) * 100);

    return (
      <div className="max-w-md mx-auto py-8 px-4 text-center space-y-6">
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-[#EAB308] to-[#CA8A04] text-white flex items-center justify-center mx-auto shadow-xl shadow-[#CA8A04]/30">
          <Trophy className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-bold text-[#9A3412] uppercase tracking-wider">
            Lição Concluída com Sucesso!
          </span>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-[#2C1810]">
            Axé! Você avançou no estudo!
          </h1>
          <p className="text-xs sm:text-sm text-gray-600">
            Cantiga: <strong className="text-[#2C1810]">{cantiga.titulo}</strong>
          </p>
        </div>

        {/* Summary Metric Cards */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white p-4 rounded-2xl border border-[#E6D5AC] text-center">
            <span className="text-[11px] text-gray-500 block">Pontos de Axé</span>
            <span className="text-2xl font-bold font-mono text-[#9A3412]">
              +{finishedSummary.xpGanho} XP
            </span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-[#E6D5AC] text-center">
            <span className="text-[11px] text-gray-500 block">Precisão</span>
            <span className="text-2xl font-bold font-mono text-emerald-700">
              {accuracy}%
            </span>
          </div>
        </div>

        {finishedSummary.cantigaAprendida && (
          <div className="bg-[#ECFDF5] border border-emerald-300 rounded-2xl p-4 flex items-center gap-3 text-left">
            <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
            <div>
              <p className="text-xs font-bold text-emerald-900">
                Cantiga Dominada!
              </p>
              <p className="text-[11px] text-emerald-700">
                Esta cantiga agora está marcada como "Aprendida" no seu acervo da casa.
              </p>
            </div>
          </div>
        )}

        {finishedSummary.novasMedalhas.length > 0 && (
          <div className="bg-[#FEF9C3] border border-[#FDE047] rounded-2xl p-4 text-left space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#854D0E]">
              <Sparkles className="w-4 h-4 text-[#CA8A04]" />
              <span>Nova Medalha Desbloqueada!</span>
            </div>
            <p className="text-xs text-[#713F12]">
              Parabéns! Sua dedicação às cantigas do terreiro foi reconhecida com uma nova conquista.
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="pt-4 space-y-2.5">
          <button
            onClick={() => setCurrentView('inicio')}
            className="w-full py-3.5 bg-[#9A3412] hover:bg-[#7C2D12] text-white text-sm font-bold rounded-2xl shadow-md transition-all active:scale-[0.99]"
          >
            Voltar para o Início
          </button>
          <button
            onClick={() => openCantigaDetail(cantiga.id)}
            className="w-full py-3 bg-white border border-[#E6D5AC] hover:bg-[#FAF8F5] text-xs font-semibold text-[#59260B] rounded-2xl transition-colors"
          >
            Ver Letra e Detalhes
          </button>
        </div>
      </div>
    );
  }

  const progressPercentage = Math.round(((currentIndex + 1) / exercises.length) * 100);

  return (
    <div className="max-w-xl mx-auto py-4 px-3 sm:px-4 space-y-6 pb-28">
      {/* Top Header: Close button, Progress bar & Exercise counter */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => {
            ketuAudio.stop();
            openCantigaDetail(cantiga.id);
          }}
          className="text-gray-400 hover:text-gray-700 p-1 rounded-lg"
          aria-label="Sair da lição"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Progress Track */}
        <div className="flex-1 bg-gray-200 h-3 rounded-full overflow-hidden">
          <div
            className="bg-gradient-to-r from-[#9A3412] to-[#D4AF37] h-full transition-all duration-300 rounded-full"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>

        <span className="text-xs font-bold font-mono text-[#78350F] tabular-nums">
          {currentIndex + 1}/{exercises.length}
        </span>
      </div>

      {/* Main Exercise Card */}
      <div className="space-y-6">
        <div>
          <span className="text-[11px] font-bold text-[#9A3412] uppercase tracking-wider block mb-1">
            {currentExercise?.tipo === 'ouvir_escolher' && 'Treino Auditivo'}
            {currentExercise?.tipo === 'completar_palavra' && 'Completar Verso'}
            {currentExercise?.tipo === 'ligar_traducao' && 'Pares de Tradução'}
            {currentExercise?.tipo === 'ordenar_versos' && 'Ordem Litúrgica'}
            {currentExercise?.tipo === 'cantar_junto' && 'Cantar Junto · Xirê'}
          </span>
          <h2 className="text-lg sm:text-xl font-display font-bold text-[#2C1810]">
            {currentExercise?.pergunta}
          </h2>
        </div>

        {/* Exercise Type 1: Ouvir e Escolher */}
        {currentExercise?.tipo === 'ouvir_escolher' && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl p-6 border border-[#E6D5AC] text-center space-y-3">
              <button
                onClick={handlePlayOuvir}
                className="w-16 h-16 rounded-full bg-[#9A3412] hover:bg-[#7C2D12] text-white flex items-center justify-center mx-auto shadow-lg shadow-[#9A3412]/30 active:scale-95 transition-transform"
                aria-label="Tocar trecho de áudio novamente"
              >
                <Volume2 className="w-7 h-7" />
              </button>
              <p className="text-xs text-gray-500">
                Toque no botão para ouvir o verso e a batida do toque {cantiga.toqueAtabaque}
              </p>
            </div>

            <div className="space-y-2.5">
              {(currentExercise as ExercicioOuvirEscolher).opcoes.map((op, idx) => (
                <button
                  key={idx}
                  disabled={feedbackState !== 'idle'}
                  onClick={() => setSelectedOption(op)}
                  className={`w-full text-left p-4 rounded-2xl border text-sm font-semibold transition-all ${
                    selectedOption === op
                      ? 'bg-[#FFF7ED] border-[#9A3412] text-[#9A3412] ring-2 ring-[#9A3412]/20 shadow-sm'
                      : 'bg-white border-[#E6D5AC] text-[#2C1810] hover:border-[#9A3412]/40 hover:bg-[#FAF8F5]'
                  }`}
                >
                  {op}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Exercise Type 2: Completar Palavra */}
        {currentExercise?.tipo === 'completar_palavra' && (
          <div className="space-y-5">
            <div className="bg-white rounded-2xl p-6 border border-[#E6D5AC] space-y-2">
              <span className="text-[10px] uppercase font-bold text-gray-400">
                Verso com lacuna:
              </span>
              <p className="text-lg sm:text-xl font-display font-bold text-[#2C1810] tracking-wide">
                {(currentExercise as ExercicioCompletarPalavra).textoComLacuna}
              </p>
              <p className="text-xs text-[#78350F]/70 italic pt-1">
                Pronúncia esperada: "{(currentExercise as ExercicioCompletarPalavra).versoOriginal.pronuncia}"
              </p>
            </div>

            <div>
              <span className="text-xs font-semibold text-[#78350F] block mb-2">
                Escolha a palavra em iorubá para preencher:
              </span>
              <div className="grid grid-cols-2 gap-2.5">
                {(currentExercise as ExercicioCompletarPalavra).opcoes.map((palavra, idx) => (
                  <button
                    key={idx}
                    disabled={feedbackState !== 'idle'}
                    onClick={() => setSelectedOption(palavra)}
                    className={`p-3.5 rounded-xl border text-center text-sm font-bold transition-all ${
                      selectedOption === palavra
                        ? 'bg-[#9A3412] text-white border-[#9A3412] shadow-sm'
                        : 'bg-white border-[#E6D5AC] text-[#2C1810] hover:bg-[#FAF8F5]'
                    }`}
                  >
                    {palavra}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Exercise Type 3: Ligar Tradução */}
        {currentExercise?.tipo === 'ligar_traducao' && (
          <div className="space-y-4">
            <p className="text-xs text-gray-500">
              Selecione primeiro o verso em iorubá (à esquerda) e depois toque na tradução correspondente (à direita):
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Yoruba Column */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-[#9A3412] uppercase tracking-wider block">
                  Iorubá
                </span>
                {(currentExercise as ExercicioLigarTraducao).pares.map((p) => {
                  const isSelected = selectedPairYoruba === p.ioruba;
                  const isMatched = !!matchedPairs[p.ioruba];

                  return (
                    <button
                      key={p.id}
                      disabled={feedbackState !== 'idle'}
                      onClick={() => handleSelectPairYoruba(p.ioruba)}
                      className={`w-full text-left p-3 rounded-xl border text-xs font-semibold transition-all ${
                        isMatched
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                          : isSelected
                          ? 'bg-[#FFF7ED] border-[#9A3412] text-[#9A3412] ring-2 ring-[#9A3412]/20'
                          : 'bg-white border-[#E6D5AC] text-[#2C1810] hover:bg-[#FAF8F5]'
                      }`}
                    >
                      {p.ioruba}
                      {isMatched && <span className="ml-1 text-emerald-600">✓</span>}
                    </button>
                  );
                })}
              </div>

              {/* Translation Column */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-[#78350F] uppercase tracking-wider block">
                  Tradução em Português
                </span>
                {(currentExercise as ExercicioLigarTraducao).pares.map((p) => {
                  const isMatched = Object.values(matchedPairs).includes(p.traducao);

                  return (
                    <button
                      key={`tr-${p.id}`}
                      disabled={feedbackState !== 'idle' || !selectedPairYoruba}
                      onClick={() => handleSelectPairTraducao(p.traducao)}
                      className={`w-full text-left p-3 rounded-xl border text-xs transition-all ${
                        isMatched
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-800 font-medium'
                          : selectedPairYoruba
                          ? 'bg-white border-[#9A3412]/40 text-[#2C1810] hover:bg-[#FFF7ED]'
                          : 'bg-gray-50 border-gray-200 text-gray-500'
                      }`}
                    >
                      {p.traducao}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Exercise Type 4: Ordenar Versos */}
        {currentExercise?.tipo === 'ordenar_versos' && (
          <div className="space-y-4">
            <p className="text-xs text-gray-500">
              Toque nos versos para colocá-los na ordem litúrgica do canto:
            </p>

            {/* Selected order display */}
            <div className="min-h-[100px] p-3 rounded-2xl bg-[#FAF8F5] border border-dashed border-[#9A3412]/40 space-y-2">
              <span className="text-[10px] font-bold uppercase text-gray-400 block">
                Sua sequência litúrgica ({orderedVerses.length}/{(currentExercise as ExercicioOrdenarVersos).versosEmbaralhados.length}):
              </span>
              {orderedVerses.length === 0 ? (
                <p className="text-xs text-gray-400 italic py-4 text-center">
                  Toque nos versos abaixo para montar a ordem
                </p>
              ) : (
                orderedVerses.map((id, index) => {
                  const v = (currentExercise as ExercicioOrdenarVersos).versosEmbaralhados.find(
                    (item) => item.id === id
                  );
                  return (
                    <button
                      key={id}
                      onClick={() => handleToggleOrderVerse(id)}
                      className="w-full text-left p-2.5 rounded-xl bg-white border border-[#E6D5AC] text-xs font-semibold text-[#2C1810] flex items-center justify-between shadow-xs hover:border-red-300 transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-md bg-[#9A3412] text-white flex items-center justify-center text-[10px] font-bold">
                          {index + 1}
                        </span>
                        {v?.ioruba}
                      </span>
                      <span className="text-[10px] text-gray-400">remover ×</span>
                    </button>
                  );
                })
              )}
            </div>

            {/* Available options pool */}
            <div className="space-y-2">
              <span className="text-[11px] font-semibold text-gray-600 block">
                Versos disponíveis:
              </span>
              {(currentExercise as ExercicioOrdenarVersos).versosEmbaralhados.map((v) => {
                const isSelected = orderedVerses.includes(v.id);
                return (
                  <button
                    key={v.id}
                    disabled={isSelected || feedbackState !== 'idle'}
                    onClick={() => handleToggleOrderVerse(v.id)}
                    className={`w-full text-left p-3 rounded-xl border text-xs font-medium transition-all ${
                      isSelected
                        ? 'opacity-40 bg-gray-100 border-gray-200'
                        : 'bg-white border-[#E6D5AC] text-[#2C1810] hover:bg-[#FAF8F5]'
                    }`}
                  >
                    {v.ioruba}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Exercise Type 5: Cantar Junto */}
        {currentExercise?.tipo === 'cantar_junto' && (
          <div className="space-y-4">
            <div className="bg-[#FAF8F5] rounded-3xl p-5 border border-[#E6D5AC] space-y-4">
              <div className="flex items-center justify-between text-xs text-[#78350F]">
                <span className="flex items-center gap-1.5 font-bold">
                  <Music className="w-4 h-4 text-[#9A3412]" />
                  Acompanhe a cadência dos atabaques
                </span>
                <span className="font-mono text-[11px]">Toque {cantiga.toqueAtabaque}</span>
              </div>

              {/* Karaoke Verses highlight */}
              <div className="space-y-3">
                {(currentExercise as ExercicioCantarJunto).versos.map((verso, idx) => {
                  const isCurrentKaraoke = karaokeVerseIndex === idx;

                  return (
                    <div
                      key={verso.id}
                      className={`p-3.5 rounded-2xl border transition-all ${
                        isCurrentKaraoke
                          ? 'bg-[#9A3412] text-white border-[#9A3412] shadow-md scale-[1.02]'
                          : 'bg-white border-[#E6D5AC] text-gray-700 opacity-70'
                      }`}
                    >
                      <p className="text-base font-display font-bold">
                        {verso.ioruba}
                      </p>
                      <p className={`text-xs italic mt-0.5 ${isCurrentKaraoke ? 'text-white/90' : 'text-gray-500'}`}>
                        "{verso.pronuncia}"
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Sticky Action / Feedback Drawer */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/95 backdrop-blur-md border-t border-[#E6D5AC] z-50">
        <div className="max-w-xl mx-auto flex flex-col gap-3">
          {feedbackState !== 'idle' ? (
            <div className="space-y-3">
              <div
                className={`p-3.5 rounded-2xl flex items-start gap-3 ${
                  feedbackState === 'correct'
                    ? 'bg-emerald-50 border border-emerald-200 text-emerald-900'
                    : 'bg-amber-50 border border-amber-200 text-amber-900'
                }`}
              >
                {feedbackState === 'correct' ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                )}
                <div className="text-xs">
                  <span className="font-bold block text-sm mb-0.5">
                    {feedbackState === 'correct' ? 'Axé! Resposta Correta!' : 'Atenção ao Fundamento!'}
                  </span>
                  <p>{feedbackMessage}</p>
                </div>
              </div>

              <button
                onClick={handleNextExercise}
                className="w-full py-3.5 bg-[#9A3412] hover:bg-[#7C2D12] text-white text-sm font-bold rounded-2xl shadow-md transition-all flex items-center justify-center gap-2"
              >
                <span>Continuar</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={handleVerifyAnswer}
              disabled={
                currentExercise?.tipo === 'ouvir_escolher' && !selectedOption
                  ? true
                  : currentExercise?.tipo === 'completar_palavra' && !selectedOption
                  ? true
                  : currentExercise?.tipo === 'ordenar_versos' &&
                    orderedVerses.length !==
                      (currentExercise as ExercicioOrdenarVersos).versosEmbaralhados.length
                  ? true
                  : false
              }
              className="w-full py-3.5 bg-[#9A3412] hover:bg-[#7C2D12] disabled:opacity-40 disabled:hover:bg-[#9A3412] text-white text-sm font-bold rounded-2xl shadow-md transition-all active:scale-[0.99]"
            >
              {currentExercise?.tipo === 'cantar_junto' ? 'Concluir Cantoria' : 'Verificar Resposta'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
