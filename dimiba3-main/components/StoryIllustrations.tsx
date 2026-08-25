/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeftRight, Ban, CloudRain, Flame, Check, HelpCircle, Eye, Info, Sparkles } from 'lucide-react';
import { playClickSound, playSuccessSound, playErrorSound } from '../src/utils/audio';

interface IllustrationProps {
  type: 'barter_simple' | 'barter_mismatch' | 'money_intro' | 'money_features';
}

export default function StoryIllustrations({ type }: IllustrationProps) {
  return (
    <div className="w-full relative min-h-[300px] bg-sky-50 rounded-2xl border-2 border-slate-100 flex flex-col justify-between overflow-hidden p-6 shadow-inner">
      <AnimatePresence mode="wait">
        {type === 'barter_simple' && <BarterSimpleIllustration key="simple" />}
        {type === 'barter_mismatch' && <BarterMismatchIllustration key="mismatch" />}
        {type === 'money_intro' && <MoneyIntroIllustration key="intro" />}
        {type === 'money_features' && <MoneyFeaturesIllustration key="features" />}
      </AnimatePresence>
    </div>
  );
}

// 1. SIMPLE BARTER ILLUSTRATION
function BarterSimpleIllustration() {
  const [traded, setTraded] = useState(false);

  const handleTrade = () => {
    if (!traded) {
      playSuccessSound();
    } else {
      playClickSound();
    }
    setTraded(!traded);
  };

  return (
    <div className="flex flex-col items-center justify-between h-full w-full gap-4">
      <div className="text-center">
        <span className="text-xs font-black uppercase text-sky-600 bg-sky-100 px-3 py-1 rounded-full">
          Simulasi Barter Berhasil
        </span>
        <h4 className="font-bold text-slate-700 text-sm mt-1">Saling Butuh & Saling Tukar</h4>
      </div>

      <div className="flex items-center justify-around w-full relative mt-6 h-36">
        {/* Ka Kancil Column */}
        <motion.div 
          className="flex flex-col items-center"
          animate={{ x: traded ? 110 : 0 }}
          transition={{ type: 'spring', stiffness: 80, damping: 15 }}
        >
          <div className="text-5xl select-none filter drop-shadow">🦌</div>
          <p className="text-xs font-black text-slate-800 mt-2">Ka Kancil</p>
          <motion.div 
            className="mt-2 bg-yellow-100 px-3 py-1.5 rounded-xl border border-yellow-300 shadow-sm flex items-center gap-1"
            animate={{ scale: traded ? 0.9 : 1.1 }}
          >
            <span className="text-xl">🌽</span>
            <span className="text-xs font-bold text-yellow-800">Jagung</span>
          </motion.div>
        </motion.div>

        {/* Trade Path Indicator */}
        <div className="flex flex-col items-center z-10">
          <motion.button
            onClick={handleTrade}
            className={`w-12 h-12 rounded-full ${
              traded ? 'bg-emerald-500' : 'bg-primary'
            } text-white flex items-center justify-center shadow-lg cursor-pointer transform active:scale-90 hover:scale-110 transition-all`}
            animate={{ rotate: traded ? 180 : 0 }}
          >
            <ArrowLeftRight className="w-6 h-6" />
          </motion.button>
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 mt-2">
            {traded ? 'Terkirim!' : 'Klik Tukar'}
          </span>
        </div>

        {/* Dak Bebek Column */}
        <motion.div 
          className="flex flex-col items-center"
          animate={{ x: traded ? -110 : 0 }}
          transition={{ type: 'spring', stiffness: 80, damping: 15 }}
        >
          <div className="text-5xl select-none filter drop-shadow">🦆</div>
          <p className="text-xs font-black text-slate-800 mt-2">Dak Bebek</p>
          <motion.div 
            className="mt-2 bg-emerald-100 px-3 py-1.5 rounded-xl border border-emerald-300 shadow-sm flex items-center gap-1"
            animate={{ scale: traded ? 0.9 : 1.1 }}
          >
            <span className="text-xl">🥬</span>
            <span className="text-xs font-bold text-emerald-800">Kangkung</span>
          </motion.div>
        </motion.div>
      </div>

      {traded && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs px-4 py-2.5 rounded-xl text-center font-bold"
        >
          🎉 Barter Berhasil! Ka Kancil mendapatkan Kangkung dan Dak Bebek mendapatkan Jagung! Keduanya senang!
        </motion.div>
      )}

      {!traded && (
        <p className="text-[11px] text-slate-400 text-center italic">
          Tip: Klik tombol hijau di tengah untuk menyaksikan kancil & bebek bertukar barang!
        </p>
      )}
    </div>
  );
}

// 2. MISMATCH BARTER ILLUSTRATION
function BarterMismatchIllustration() {
  const [showStatus, setShowStatus] = useState<null | 'check' | 'mismatch'>(null);

  const startCheck = () => {
    playClickSound();
    setShowStatus('check');
    setTimeout(() => {
      playErrorSound();
      setShowStatus('mismatch');
    }, 1500);
  };

  return (
    <div className="flex flex-col items-center justify-between h-full w-full gap-4">
      <div className="text-center">
        <span className="text-xs font-black uppercase text-rose-600 bg-rose-100 px-3 py-1 rounded-full">
          Simulasi Barter Gagal
        </span>
        <h4 className="font-bold text-slate-700 text-sm mt-1">Ketiadaan Keinginan Ganda</h4>
      </div>

      <div className="flex items-center justify-between w-full mt-2 h-36 px-4">
        {/* Ela Column */}
        <div className="flex flex-col items-center relative w-1/3 text-center">
          <div className="text-5xl filter drop-shadow">🐦</div>
          <p className="text-xs font-black text-slate-800 mt-1">Ela Pelatuk</p>
          <div className="mt-1 bg-amber-100 border border-amber-300 text-amber-900 rounded-lg px-2.5 py-1 flex items-center gap-1 shadow-sm">
            <span>🥄</span>
            <span className="text-[10px] font-black">Sendok</span>
          </div>
          <div className="bg-sky-100 text-sky-800 font-bold text-[10px] p-1.5 rounded-lg border border-sky-300 mt-2">
            Ingin: Bunga 🌸
          </div>
        </div>

        {/* Middle Clash Screen */}
        <div className="flex flex-col items-center justify-center flex-1">
          {showStatus === null && (
            <button
              onClick={startCheck}
              className="px-3 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-black text-xs shadow cursor-pointer transform active:scale-95 transition-all text-center"
            >
              Uji Barter 🔍
            </button>
          )}

          {showStatus === 'check' && (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
              className="text-slate-400"
            >
              <HelpCircle className="w-8 h-8 text-primary animate-pulse" />
            </motion.div>
          )}

          {showStatus === 'mismatch' && (
            <motion.div
              initial={{ scale: 0.1, opacity: 0 }}
              animate={{ scale: [1.2, 1], opacity: 1 }}
              className="flex flex-col items-center text-rose-600"
            >
              <div className="w-10 h-10 bg-rose-100 border border-rose-300 rounded-full flex items-center justify-center text-rose-600 shadow-sm animate-bounce">
                <Ban className="w-6 h-6 stroke-[3]" />
              </div>
              <span className="text-[10px] font-black uppercase mt-1 tracking-tight">Tidak Match!</span>
            </motion.div>
          )}
        </div>

        {/* Ke Kelinci Column */}
        <div className="flex flex-col items-center relative w-1/3 text-center">
          <div className="text-5xl filter drop-shadow">🐇</div>
          <p className="text-xs font-black text-slate-800 mt-1">Ke Kelinci</p>
          <div className="mt-1 bg-pink-100 border border-pink-300 text-pink-800 rounded-lg px-2.5 py-1 flex items-center gap-1 shadow-sm">
            <span>🌸</span>
            <span className="text-[10px] font-black">Bunga</span>
          </div>
          <div className="bg-amber-100 text-amber-800 font-bold text-[10px] p-1.5 rounded-lg border border-amber-300 mt-2">
            Ingin: Jagung 🌽
          </div>
        </div>
      </div>

      {showStatus === 'mismatch' ? (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-rose-50 text-rose-800 border border-rose-200 text-xs px-2 py-2 rounded-xl text-center font-bold"
        >
          ❌ Barter gagal! Keinginan mereka berbeda, jadi tidak bisa tukar barang.
        </motion.div>
      ) : (
        <p className="text-[11px] text-slate-400 text-center italic">
          Tekan tombol "Uji Barter" di atas untuk meneliti apakah barter mereka bisa berjalan lancar!
        </p>
      )}
    </div>
  );
}

// 3. EVOLUTION OF MONEY
function MoneyIntroIllustration() {
  const [activeStage, setActiveStage] = useState<'salt' | 'shell' | 'gold'>('salt');

  const selectStage = (stage: 'salt' | 'shell' | 'gold') => {
    playClickSound();
    setActiveStage(stage);
  };

  return (
    <div className="flex flex-col items-center justify-between h-full w-full gap-4">
      <div className="text-center">
        <span className="text-xs font-black uppercase text-amber-600 bg-amber-100 px-3 py-1 rounded-full">
          Evolusi Nilai Tukar
        </span>
        <h4 className="font-bold text-slate-700 text-sm mt-1">Fase Sebelum Adanya Kertas</h4>
      </div>

      {/* Grid selector */}
      <div className="grid grid-cols-3 gap-2 w-full mt-2">
        {(['salt', 'shell', 'gold'] as const).map((stage) => {
          let label = 'Uang Garam';
          let emoji = '🧂';
          let borderCol = activeStage === stage ? 'border-primary bg-sky-100/50' : 'border-slate-100 bg-white';
          if (stage === 'shell') { label = 'Uang Kerang'; emoji = '🐚'; }
          if (stage === 'gold') { label = 'Koin Logam'; emoji = '🪙'; }

          return (
            <button
              key={stage}
              onClick={() => selectStage(stage)}
              className={`border-2 ${borderCol} p-2 rounded-xl text-center cursor-pointer transition-all hover:shadow-sm`}
            >
              <div className="text-2xl mb-1">{emoji}</div>
              <div className="text-[10px] font-black text-slate-700 tracking-tighter leading-tight uppercase">
                {label}
              </div>
            </button>
          );
        })}
      </div>

      {/* Stage Detail Card */}
      <div className="flex-1 w-full bg-white rounded-xl border border-slate-100 p-3 flex flex-col justify-center min-h-[100px]">
        {activeStage === 'salt' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center space-y-1">
            <div className="flex justify-center items-center gap-1.5 text-slate-800 font-bold text-xs">
              <span className="text-lg">🧂</span> Uang Garam (Uang Barang)
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Dulu bisa dipakai memasak, namun dilarang jadi uang abadi karena <strong>mudah larut/cair saat diterpa air hujan 🌧️</strong> dan sulit disimpan lama.
            </p>
          </motion.div>
        )}

        {activeStage === 'shell' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center space-y-1">
            <div className="flex justify-center items-center gap-1.5 text-slate-800 font-bold text-xs">
              <span className="text-lg">🐚</span> Uang Cangkang Kerang
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Cantik dan disukai orang, tetapi ukurannya tidak seragam, jumlahnya terlalu banyak di laut, dan <strong>sangat rapuh sehingga gampang pecah 🔨</strong>.
            </p>
          </motion.div>
        )}

        {activeStage === 'gold' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center space-y-1">
            <div className="flex justify-center items-center gap-1.5 text-amber-600 font-black text-xs">
              <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-spin" /> Koin Logam Emas & Perak ✨
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              <strong>Solusi Terhebat!</strong> Logam mulia tidak berkarat, tidak busuk, nilainya diakui sama tinggi di berbagai belahan dunia, serta mudah dipotong jadi keping kecil!
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}

// 4. RUPIAH FEATURES ILLUSTRATION
function MoneyFeaturesIllustration() {
  const tasks = [
    {
      id: 'numberToWords',
      prompt: 'Tuliskan kata yang benar untuk nilai Rp5.250,00:',
      options: [
        'lima ribu dua ratus lima puluh rupiah',
        'lima ribu dua ratus lima puluh sen',
        'lima ribu dua ratus rupiah lima puluh'
      ],
      answer: 'lima ribu dua ratus lima puluh rupiah'
    },
    {
      id: 'wordsToNumber',
      prompt: 'Nominal angka untuk frasa "empat belas ribu tiga ratus rupiah" adalah:',
      options: [
        'Rp14.300,00',
        'Rp14.030,00',
        'Rp13.400,00'
      ],
      answer: 'Rp14.300,00'
    },
    {
      id: 'mixedMatch',
      prompt: 'Pasangkan angka dan kalimat yang benar untuk soal ini:',
      options: [
        'Rp7.600,00 = tujuh ribu enam ratus rupiah',
        'Rp7.600,00 = tujuh ribu enam ratus sen',
        'Rp7.060,00 = tujuh ribu enam ratus rupiah'
      ],
      answer: 'Rp7.600,00 = tujuh ribu enam ratus rupiah'
    }
  ];

  const [taskIdx, setTaskIdx] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<'none' | 'success' | 'fail'>('none');

  const activeTask = tasks[taskIdx];

  const handleAnswer = (option: string) => {
    playClickSound();
    setSelectedOpt(option);

    if (option === activeTask.answer) {
      playSuccessSound();
      setFeedback('success');
    } else {
      playErrorSound();
      setFeedback('fail');
    }
  };

  const nextTask = () => {
    playClickSound();
    setSelectedOpt(null);
    setFeedback('none');
    setTaskIdx((prev) => (prev + 1) % tasks.length);
  };

  return (
    <div className="flex flex-col items-center justify-between h-full w-full gap-4">
      <div className="text-center">
        <span className="text-xs font-black uppercase text-emerald-600 bg-emerald-100 px-3 py-1 rounded-full">
          Ciri Pengenal Rupiah Sah
        </span>
        <h4 className="font-bold text-slate-700 text-sm mt-1">Latihan Konversi Angka & Kalimat</h4>
      </div>

      <div className="w-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600 rounded-xl shadow-md border border-teal-300 p-4 text-white">
        <div className="text-[10px] uppercase tracking-[0.3em] font-black opacity-90">Latihan Interaktif</div>
        <div className="mt-3 text-sm font-bold">{activeTask.prompt}</div>
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
          {activeTask.options.map((option) => {
            const isSelected = selectedOpt === option;
            const isCorrect = option === activeTask.answer;
            let btnClass = 'border border-white/30 text-white bg-white/10 hover:bg-white/20';

            if (feedback !== 'none') {
              if (isCorrect) {
                btnClass = 'bg-emerald-500 text-white border-emerald-600 shadow';
              } else if (isSelected) {
                btnClass = 'bg-rose-500 text-white border-rose-600 shadow';
              } else {
                btnClass = 'bg-white/10 text-slate-200 border-white/10 opacity-70';
              }
            }

            return (
              <button
                key={option}
                disabled={feedback !== 'none'}
                onClick={() => handleAnswer(option)}
                className={`rounded-2xl px-3 py-3 text-[11px] font-bold text-left transition-all ${btnClass}`}
              >
                {option}
              </button>
            );
          })}
        </div>
      </div>

      <div className="w-full bg-white rounded-3xl border border-slate-100 p-4 text-left">
        {feedback === 'none' && (
          <p className="text-[11px] text-slate-500">Pilih jawaban yang kamu anggap benar. Setelah itu, kamu bisa lanjut ke soal berikutnya.</p>
        )}
        {feedback === 'success' && (
          <div className="text-emerald-700 text-[11px] font-bold">
            ? Tepat! Kamu berhasil mencocokkan angka dan kalimat Rupiah dengan benar.
          </div>
        )}
        {feedback === 'fail' && (
          <div className="text-rose-700 text-[11px] font-bold">
            ? Belum benar. Coba lagi atau gunakan tombol 'Soal Selanjutnya'.
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={nextTask}
        className="w-full bg-slate-900 text-white rounded-2xl py-3 text-xs font-black uppercase tracking-[0.12em] hover:bg-slate-800 transition"
      >
        Soal Selanjutnya
      </button>
    </div>
  );
}
