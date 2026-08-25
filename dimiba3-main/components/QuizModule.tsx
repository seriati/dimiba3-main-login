/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BrainCircuit, Play, CheckCircle2, XCircle, RefreshCw, Volume2, VolumeX, ArrowRight, ClipboardCheck } from 'lucide-react';
import { QUIZ_DATA } from '../src/data';
import { playClickSound, playSuccessSound, playErrorSound, playFanfareSound, isSoundEnabled, toggleSound } from '../src/utils/audio';

// Micro Confetti Exploder for Positive Reinforcement
function ConfettiExplosion() {
  const [particles, setParticles] = useState<{ id: number; x: number; y: number; size: number; color: string; delay: number; duration: number }[]>([]);

  useEffect(() => {
    const colors = ['bg-yellow-400', 'bg-rose-400', 'bg-sky-400', 'bg-emerald-400', 'bg-purple-400', 'bg-orange-400', 'bg-pink-400'];
    const list = Array.from({ length: 60 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100, // percentage width
      y: Math.random() * -30 - 10, // negative height to fall from top
      size: Math.random() * 12 + 6,
      color: colors[Math.floor(Math.random() * colors.length)],
      delay: Math.random() * 1.5,
      duration: Math.random() * 2 + 2
    }));
    setParticles(list);
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-30">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className={`absolute rounded-xs ${p.color}`}
          style={{
            width: p.size,
            height: p.size,
            left: `${p.x}%`,
            top: '-5%'
          }}
          initial={{ y: -20, rotate: 0 }}
          animate={{
            y: '105vh',
            x: `${p.x + (Math.random() * 10 - 5)}%`,
            rotate: 360
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            ease: 'linear',
            repeat: Infinity
          }}
        />
      ))}
    </div>
  );
}

export default function QuizModule() {
  const [step, setStep] = useState<'intro' | 'playing' | 'result'>('intro');
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]); // stores index of answers chosen for each question
  const [userScore, setUserScore] = useState(0);
  const [showAnswerFeedback, setShowAnswerFeedback] = useState(false);
  const [lastSelectedIdx, setLastSelectedIdx] = useState<number | null>(null);
  const [isMuted, setIsMuted] = useState(!isSoundEnabled());

  const currentQuestion = QUIZ_DATA[currentQuestionIdx];

  const handleMuteToggle = () => {
    const nextVal = !isMuted;
    setIsMuted(nextVal);
    toggleSound(!nextVal);
    playClickSound();
  };

  const handleStartQuiz = () => {
    setIsMuted(!isSoundEnabled());
    playClickSound();
    setStep('playing');
    setCurrentQuestionIdx(0);
    setSelectedAnswers([]);
    setUserScore(0);
    setShowAnswerFeedback(false);
    setLastSelectedIdx(null);
  };

  const handleAnswerClick = (index: number) => {
    if (showAnswerFeedback) return; // ignore clicking while showing feedback

    setLastSelectedIdx(index);
    const isCorrect = index === currentQuestion.correctAnswer;
    
    if (isCorrect) {
      playSuccessSound();
      setUserScore(prev => prev + 1);
    } else {
      playErrorSound();
    }

    setSelectedAnswers(prev => [...prev, index]);
    setShowAnswerFeedback(true);
  };

  const handleNextQuestion = () => {
    playClickSound();
    setShowAnswerFeedback(false);
    setLastSelectedIdx(null);

    if (currentQuestionIdx < QUIZ_DATA.length - 1) {
      setCurrentQuestionIdx(prev => prev + 1);
    } else {
      setStep('result');
      playFanfareSound();
    }
  };

  const scorePercentage = Math.round((userScore / QUIZ_DATA.length) * 100);

  return (
    <div className="max-w-2xl mx-auto relative">
      {/* Background Micro Confetti when perfect score or good score is hit */}
      {step === 'result' && scorePercentage >= 70 && <ConfettiExplosion />}

      {/* Mute toggle button floating at top right */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-baloo font-extrabold text-slate-800 flex items-center gap-2">
          <BrainCircuit className="w-7 h-7 text-primary animate-pulse" /> Uji Kemampuanmu
        </h2>
        
        <button
          onClick={handleMuteToggle}
          className="p-2 bg-white rounded-xl border border-slate-100 shadow-xs hover:bg-slate-50 transition-all cursor-pointer text-slate-500"
          title={isMuted ? 'Nyalakan Suara' : 'Matikan Suara'}
        >
          {isMuted ? <VolumeX className="w-5 h-5 text-rose-500" /> : <Volume2 className="w-5 h-5 text-emerald-500" />}
        </button>
      </div>

      <AnimatePresence mode="wait">
        
        {/* VIEW 1: INTRO STATE */}
        {step === 'intro' && (
          <motion.div
            key="intro"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white p-8 sm:p-10 rounded-[2.5rem] shadow-xl text-center border-b-8 border-primary/20 space-y-6"
          >
            <div className="w-20 h-20 bg-sky-100 text-primary rounded-full flex items-center justify-center mx-auto shadow-inner">
              <BrainCircuit className="w-10 h-10 animate-bounce" />
            </div>

            <div className="space-y-2">
              <h3 className="text-3xl font-baloo font-black text-slate-800 leading-none">Ayo Uji Kemampuanmu!</h3>
              <p className="text-slate-500 text-sm max-w-sm mx-auto">
                Tantang dirimu dengan {QUIZ_DATA.length} pertanyaan interaktif tentang barter dan fungsi uang rupiah serta raih skor 100% untuk mendapatkan hasil tertinggi!
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl flex justify-around text-xs text-slate-500">
              <div>
                <p className="font-extrabold text-slate-800 text-sm">{QUIZ_DATA.length}</p>
                <p>Soal Bergambar</p>
              </div>
              <div className="border-r border-slate-200"></div>
              <div>
                <p className="font-extrabold text-slate-800 text-sm">Pilihan Ganda</p>
                <p>Format Mandiri</p>
              </div>
              <div className="border-r border-slate-200"></div>
              <div>
                <p className="font-extrabold text-slate-800 text-sm">Instan</p>
                <p>Kunci Jawaban</p>
              </div>
            </div>

            <button
              onClick={handleStartQuiz}
              className="w-full bg-primary hover:bg-sky-600 text-blue font-black py-4 rounded-2xl shadow-lg transition-transform transform active:scale-95 flex items-center justify-center gap-2 cursor-pointer text-lg uppercase tracking-wide"
            >
              <Play className="w-5 h-5 fill-current" /> Mulai Petualangan Kuis
            </button>
          </motion.div>
        )}

        {/* VIEW 2: PLAYING STATE */}
        {step === 'playing' && (
          <motion.div
            key="playing"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="bg-white p-6 sm:p-8 rounded-[2rem] shadow-xl border border-slate-100 space-y-6"
          >
            {/* Header: Score info & progress */}
            <div className="flex justify-between items-center text-xs font-black uppercase text-slate-400">
              <span className="bg-slate-100 px-3 py-1 rounded-full">
                Soal {currentQuestionIdx + 1} dari {QUIZ_DATA.length}
              </span>
              <span className="text-primary">
                Skor Saat Ini: {userScore * 10}
              </span>
            </div>

            {/* Graphic Timeline Progress Bar */}
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-primary to-sky-400"
                initial={{ width: 0 }}
                animate={{ width: `${((currentQuestionIdx + (showAnswerFeedback ? 1 : 0)) / QUIZ_DATA.length) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>

            {/* Active Question Statement */}
            <h3 className="font-baloo font-extrabold text-slate-800 text-lg sm:text-xl text-center leading-relaxed">
              {currentQuestion.question}
            </h3>

            {/* Answer Selector grid */}
            <div className="grid grid-cols-1 gap-3 pt-2">
              {currentQuestion.options.map((option, idx) => {
                const isSelected = lastSelectedIdx === idx;
                const isCorrectVal = idx === currentQuestion.correctAnswer;
                
                let btnStyle = 'border-slate-100 bg-white text-slate-700 hover:border-primary hover:bg-sky-50/40';
                let iconEl = null;

                if (showAnswerFeedback) {
                  if (isCorrectVal) {
                    btnStyle = 'border-emerald-300 bg-emerald-50 text-emerald-800 ring-2 ring-emerald-300';
                    iconEl = <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />;
                  } else if (isSelected) {
                    btnStyle = 'border-rose-300 bg-rose-50 text-rose-800 ring-2 ring-rose-200';
                    iconEl = <XCircle className="w-5 h-5 text-rose-600 shrink-0" />;
                  } else {
                    btnStyle = 'border-slate-100 bg-slate-50 text-slate-400 opacity-60 pointer-events-none';
                  }
                }

                return (
                  <button
                    key={idx}
                    disabled={showAnswerFeedback}
                    onClick={() => handleAnswerClick(idx)}
                    className={`w-full p-4 rounded-2xl border-2 ${btnStyle} flex items-center justify-between text-left font-bold text-sm transition-all duration-200 cursor-pointer`}
                  >
                    <span className="flex-1 pr-3">{option}</span>
                    {iconEl}
                  </button>
                );
              })}
            </div>

            {/* Feedback and review commentary */}
            <AnimatePresence>
              {showAnswerFeedback && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-4 pt-4 border-t border-slate-100"
                >
                  <div className={`p-4 rounded-2xl text-xs font-medium leading-relaxed ${
                    lastSelectedIdx === currentQuestion.correctAnswer
                      ? 'bg-emerald-50 border border-emerald-100 text-emerald-800'
                      : 'bg-rose-50 border border-rose-100 text-rose-800'
                  }`}>
                    <p className="font-extrabold text-sm mb-1">
                      {lastSelectedIdx === currentQuestion.correctAnswer ? '🎉 Hebat! Jawabanmu Benar!' : '💡 Kurang Tepat, Sobat!'}
                    </p>
                    <p className="text-slate-600 font-bold leading-normal">
                      <strong>Penjelasan:</strong> {currentQuestion.explanation}
                    </p>
                  </div>

                  <button
                    onClick={handleNextQuestion}
                    className="w-full bg-slate-800 hover:bg-slate-900 text-white font-black py-3.5 rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer text-sm"
                  >
                    <span>{currentQuestionIdx < QUIZ_DATA.length - 1 ? 'Soal Selanjutnya' : 'Lihat Hasil Akhir'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* VIEW 3: RESULT STATE */}
        {step === 'result' && (
          <motion.div
            key="result"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6"
          >
            <div className="bg-white p-8 sm:p-10 rounded-[2.5rem] shadow-xl text-center border-b-8 border-amber-400 space-y-6">
              
              <div className="text-6xl select-none filter drop-shadow">
                {scorePercentage === 100 ? '🏆' : scorePercentage >= 70 ? '⭐' : '🦕'}
              </div>

              <div className="space-y-1">
                <h3 className="text-3xl font-baloo font-black text-slate-800">
                  {scorePercentage === 100 ? 'Sempurna! Nilai 100!' : scorePercentage >= 70 ? 'Hebat Sekali!' : 'Ayo Semangat Belajar!'}
                </h3>
                <p className="text-slate-500 text-sm max-w-sm mx-auto">
                  Kamu berhasil menyelesaikan Uji Kemampuan dengan Topik Alat Tukar!
                </p>
              </div>

              {/* Mega Score Badge */}
              <div className="inline-block bg-sky-50 border border-sky-100 px-8 py-5 rounded-3xl relative overflow-hidden">
                <div className="text-right text-[10px] text-sky-600 font-extrabold uppercase tracking-widest leading-none">Skor Akhir</div>
                <div className="text-5xl font-mono font-black text-primary tracking-tight mt-1">
                  {scorePercentage}
                </div>
                <div className="text-[11px] text-slate-500 font-bold mt-1">
                  Berhasil menjawab {userScore} dari {QUIZ_DATA.length} soal benar
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  onClick={handleStartQuiz}
                  className="flex-1 bg-primary hover:bg-sky-600 text-white font-black py-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4" /> Ulangi Kuis
                </button>
              </div>
            </div>

            {/* ANSWER REVIEW BOX */}
            <div className="bg-white rounded-3xl p-6 shadow-lg border border-slate-100 space-y-4">
              <h4 className="font-baloo font-bold text-slate-800 text-lg flex items-center gap-2 pb-2 border-b">
                <ClipboardCheck className="w-5 h-5 text-indigo-500" /> Ulasan Jawaban & Pembahasan
              </h4>

              <div className="space-y-4">
                {QUIZ_DATA.map((q, idx) => {
                  const userAnsIdx = selectedAnswers[idx];
                  const isCorrect = userAnsIdx === q.correctAnswer;

                  return (
                    <div key={q.id} className="p-4 rounded-2xl border bg-slate-50/50 space-y-2 text-xs">
                      <div className="flex justify-between items-start gap-3">
                        <span className="font-black text-slate-400">Soal {idx + 1}</span>
                        {isCorrect ? (
                          <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 rounded-full font-bold flex items-center gap-1 text-[10px]">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Benar
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 bg-rose-100 text-rose-800 rounded-full font-bold flex items-center gap-1 text-[10px]">
                            <XCircle className="w-3 h-3 text-rose-600" /> Salah
                          </span>
                        )}
                      </div>

                      <p className="font-bold text-slate-800 text-sm">
                        {q.question}
                      </p>

                      <div className="gap-2 text-[11px] text-slate-600 font-medium">
                        <p>
                          ✔️ <strong>Jawaban Benar:</strong> <span className="text-emerald-700 font-bold">{q.options[q.correctAnswer]}</span>
                        </p>
                        {!isCorrect && userAnsIdx !== undefined && (
                          <p>
                            ❌ <strong>Jawaban Pilihanmu:</strong> <span className="text-rose-700 font-bold">{q.options[userAnsIdx]}</span>
                          </p>
                        )}
                      </div>

                      <p className="text-[11px] text-slate-500 bg-white border border-slate-100 p-2.5 rounded-xl leading-relaxed mt-1">
                        <strong>Pembahasan:</strong> {q.explanation}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
            
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
