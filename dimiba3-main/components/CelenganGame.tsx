/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Store, Wallet, Coins, RefreshCw, Trash2, CheckCircle, ArrowRight, Award, HelpCircle } from 'lucide-react';
import { GAME_LEVELS } from '../src/data';
import { playClickSound, playSuccessSound, playErrorSound, playFanfareSound } from '../src/utils/audio';

// Visual designs for coins/bills to mimic real Indonesian money
const COINS = [
  { value: 100, label: 'Rp100', color: 'bg-slate-300 text-slate-700 font-bold border-slate-400 border-2' },
  { value: 200, label: 'Rp200', color: 'bg-zinc-300 text-zinc-700 font-bold border-zinc-400 border-2' },
  { value: 500, label: 'Rp500', color: 'bg-amber-100 text-amber-800 font-bold border-amber-300 border-2' }
];

const BILLS = [
  { value: 1000, label: 'Rp1.000', color: 'bg-lime-200 text-lime-800 font-extrabold border-lime-400 border-b-4', textCol: 'text-lime-800' },
  { value: 2000, label: 'Rp2.000', color: 'bg-slate-200 text-slate-800 font-extrabold border-slate-400 border-b-4', textCol: 'text-slate-800' },
  { value: 5000, label: 'Rp5.000', color: 'bg-amber-200 text-amber-800 font-extrabold border-amber-400 border-b-4', textCol: 'text-amber-800' },
  { value: 10000, label: 'Rp10.000', color: 'bg-purple-200 text-purple-800 font-extrabold border-purple-400 border-b-4', textCol: 'text-purple-800' }
];

const LEVEL_IMAGES = [
  { src: '/images/celengan-dayak-1.jpg', alt: 'Gambar tradisional Dayak untuk level 1' },
  { src: '/images/celengan-dayak-2.jpg', alt: 'Gambar tradisional Dayak untuk level 2' },
  { src: '/images/celengan-dayak-3.jpg', alt: 'Gambar tradisional Dayak untuk level 3' },
  { src: '/images/celengan-dayak-4.jpg', alt: 'Gambar tradisional Dayak untuk level 4' },
  { src: '/images/celengan-dayak-5.jpg', alt: 'Gambar tradisional Dayak untuk level 5' }
];

export default function CelenganGame() {
  const [levelIdx, setLevelIdx] = useState(0);
  const [selectedChange, setSelectedChange] = useState<{ value: number; key: number }[]>([]);
  const [feedback, setFeedback] = useState<'none' | 'success' | 'fail' | 'empty'>('none');
  const [digitalSavings, setDigitalSavings] = useState(0);
  const [keyCounter, setKeyCounter] = useState(0);
  const [allFinished, setAllFinished] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const currentLevel = GAME_LEVELS[levelIdx];
  const totalPrice = currentLevel ? currentLevel.boughtItem.price * currentLevel.quantity : 0;
  
  // Calculate total amount currently put on the cashier tray
  const currentTraySum = selectedChange.reduce((sum, item) => sum + item.value, 0);

  useEffect(() => {
    // Load savings from localStorage if any
    const saved = localStorage.getItem('dimiba_savings');
    if (saved) {
      setDigitalSavings(parseInt(saved, 10));
    }
  }, []);

  const selectCurrency = (val: number) => {
    playClickSound();
    setSelectedChange(prev => [...prev, { value: val, key: keyCounter }]);
    setKeyCounter(c => c + 1);
    setFeedback('none');
  };

  const removeCurrencyItem = (keyToRemove: number) => {
    playClickSound();
    setSelectedChange(prev => prev.filter(item => item.key !== keyToRemove));
    setFeedback('none');
  };

  const clearTray = () => {
    if (selectedChange.length > 0) {
      playClickSound();
      setSelectedChange([]);
    }
    setFeedback('none');
  };

  const checkSolution = () => {
    if (selectedChange.length === 0) {
      setFeedback('empty');
      playErrorSound();
      return;
    }

    if (currentTraySum === currentLevel.correctChange) {
      setFeedback('success');
      playSuccessSound();
      const rewards = 1000;
      const newSavings = digitalSavings + rewards;
      setDigitalSavings(newSavings);
      localStorage.setItem('dimiba_savings', newSavings.toString());
    } else {
      setFeedback('fail');
      playErrorSound();
    }
  };

  const handleNextLevel = () => {
    playClickSound();
    setSelectedChange([]);
    setFeedback('none');
    setShowHint(false);
    
    if (levelIdx < GAME_LEVELS.length - 1) {
      setLevelIdx(prev => prev + 1);
    } else {
      setAllFinished(true);
      playFanfareSound();
    }
  };

  const resetGame = () => {
    playClickSound();
    setLevelIdx(0);
    setSelectedChange([]);
    setFeedback('none');
    setAllFinished(false);
    setShowHint(false);
  };

  const getEjaanRupiah = (val: number) => {
    return `Rp${val.toLocaleString('id-ID')},00`;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Top Interactive Score Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center bg-gradient-to-r from-amber-500 to-amber-600 p-5 rounded-3xl shadow-md border-b-4 border-amber-800/40 gap-4 text-white">
        <div className="flex items-center space-x-3">
          <div className="bg-white/20 p-3 rounded-2xl text-white shadow-inner">
            <Coins className="w-8 h-8 animate-bounce" />
          </div>
          <div>
            <span className="text-[9px] font-black tracking-widest text-amber-200 uppercase bg-amber-900/20 px-2 py-0.5 rounded-md">
              Etnofinansial Anak Negeri
            </span>
            <h3 className="font-baloo font-bold text-white text-lg leading-tight mt-0.5">Celengan Digital Rumah Betang</h3>
          </div>
        </div>

        <div className="bg-amber-900/30 border border-amber-400/40 rounded-2xl px-6 py-2 flex items-center gap-3">
          <span className="text-xl">💰</span>
          <div className="text-right">
            <div className="text-[8px] text-amber-200 font-extrabold uppercase tracking-widest leading-none">Tabungan Hasil Jual</div>
            <span className="text-lg font-black text-amber-100 font-mono">
              {getEjaanRupiah(digitalSavings)}
            </span>
          </div>
        </div>
      </div>

      {/* Honesty Level meter of Rumah Betang */}
      <div className="bg-white rounded-2xl p-4 border border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4 shadow-xs">
        <div className="text-left space-y-1">
          <h5 className="font-baloo font-black text-sm text-slate-700 flex items-center gap-1.5 leading-none">
            🎨 Tingkat Kejujuran Rumah Betang: <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded text-xs">Amanah & Adil</span>
          </h5>
          <p className="text-[11px] text-slate-500 font-bold">Warga Betang hidup rukun dengan menjunjung kearifan saling asih.</p>
        </div>
        <div className="w-full md:w-64 bg-slate-100 h-3.5 rounded-full overflow-hidden border p-0.5 relative">
          <div 
            className="bg-gradient-to-r from-amber-500 to-emerald-500 h-full rounded-full transition-all duration-500"
            style={{ width: `${((levelIdx + (feedback === 'success' ? 1 : 0)) / 5) * 100}%` }}
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-black text-slate-600 font-mono">
            {levelIdx + (feedback === 'success' ? 1 : 0)} / 5 Selesai
          </span>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {allFinished ? (
          <motion.div
            key="finish"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white p-10 rounded-[2.5rem] shadow-xl text-center border-b-8 border-emerald-500 relative overflow-hidden"
          >
            {/* Sparkle effects */}
            <div className="absolute top-10 left-10 text-3xl animate-pulse">🌟</div>
            <div className="absolute bottom-10 right-10 text-3xl animate-pulse">✨</div>

            <div className="w-24 h-24 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
              <Award className="w-14 h-14" />
            </div>

            <h2 className="text-3xl font-baloo font-black text-slate-800">
              Selamat, Toko Sukses Besar! 🎉
            </h2>
            <p className="text-slate-500 max-w-md mx-auto mt-2 text-sm leading-relaxed">
              Kamu berhasil menyelesaikan semua level simulasi! Kamu sudah pandai berdagang, menghitung uang koin, dan membagikan kembalian dengan jujur berlandaskan filosofi kearifan Dayak.
            </p>

            <div className="my-8 bg-sky-50 rounded-2xl p-6 border border-sky-100 inline-block">
              <p className="text-xs text-sky-800 font-black uppercase tracking-wider">Total Hasil Usaha Hutan</p>
              <div className="text-3xl font-black text-amber-600 tracking-tight mt-1 font-mono">
                {getEjaanRupiah(digitalSavings)}
              </div>
            </div>

            <div>
              <button
                onClick={resetGame}
                className="bg-primary hover:bg-sky-600 text-white font-black px-8 py-3.5 rounded-2xl shadow-lg transition-all transform active:scale-95 cursor-pointer block sm:inline-block w-full sm:w-auto"
              >
                Main Lagi Dari Level 1
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="active"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-6"
          >
            {/* Customer Scenario Pane (Left - 5 Cols) */}
            <div className="lg:col-span-5 bg-white rounded-3xl p-6 shadow-lg border border-slate-100 flex flex-col justify-between space-y-6">
              <div>
                <div className="flex justify-between items-center">
                  <span className="bg-sky-100 text-primary font-black text-xs px-3 py-1 rounded-full uppercase">
                    Level {levelIdx + 1} dari 5
                  </span>
                  <button
                    onClick={() => setShowHint(!showHint)}
                    className="p-1.5 text-slate-400 hover:text-primary transition-colors cursor-pointer"
                    title="Tampilkan Bantuan"
                  >
                    <HelpCircle className="w-5 h-5" />
                  </button>
                </div>

                {/* Simulated cartoon dialogue with Dayak cultural greetings */}
                <div className="flex items-center gap-4 mt-6 bg-slate-50 p-4 rounded-2xl relative">
                  <span className="text-5xl filter drop-shadow select-none animate-bounce shrink-0">
                    {currentLevel.customerAvatar}
                  </span>
                  <div className="flex-1">
                    <p className="text-xs font-black text-slate-400 uppercase leading-none mb-1">
                      {currentLevel.customerName}
                    </p>
                    <div className="bg-white border text-xs text-slate-700 p-2.5 rounded-xl rounded-tl-none font-bold relative shadow-xs leading-normal">
                      &ldquo;Adil Ka' Talino, Bacuramin Ka' Saruga, Basengat Ka' Jubata. Aku ingin beli {currentLevel.quantity} buah {currentLevel.boughtItem.name}. Ini selembar uangku ya!&rdquo;
                    </div>
                  </div>
                </div>

                {/* Recipt list */}
                <div className="mt-6 border-2 border-dashed border-slate-200 rounded-2xl p-4 space-y-3 font-semibold bg-amber-50/20 text-sm">
                  <p className="text-xs font-black text-slate-400 uppercase tracking-wider mb-2">Struk Pembelian</p>
                  <div className="flex justify-between">
                    <span className="text-slate-600">
                      {currentLevel.quantity}x {currentLevel.boughtItem.name}
                    </span>
                    <span className="text-slate-800">
                      {getEjaanRupiah(currentLevel.boughtItem.price)}
                    </span>
                  </div>

                  <hr className="border-dashed border-slate-200" />

                  <div className="flex justify-between text-slate-600 text-xs">
                    <span>Total Belanja:</span>
                    <span className="font-bold text-slate-800">{getEjaanRupiah(totalPrice)}</span>
                  </div>

                  <div className="flex justify-between items-center text-primary pt-1">
                    <span className="flex items-center gap-1.5 font-bold text-xs">
                      <Wallet className="w-4 h-4" /> Uang Yang Dibayar:
                    </span>
                    <span className="font-extrabold text-base bg-sky-100 text-sky-800 px-2.5 py-0.5 rounded-xl font-mono">
                      {getEjaanRupiah(currentLevel.cashGiven)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Math Hint Box */}
              {showHint && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="bg-sky-50 dark:bg-sky-950/20 text-sky-800 border border-sky-200 p-3.5 rounded-xl text-xs font-bold leading-relaxed shadow-inner"
                >
                  💡 <strong>Cara Menghitung:</strong> <br />
                  Uang Bayar ({getEjaanRupiah(currentLevel.cashGiven)}) dikurangi Total Belanja ({getEjaanRupiah(totalPrice)}). <br />
                  {currentLevel.hint}
                </motion.div>
              )}

              {/* Dayak Betang Honesty Philosophy card */}
              <div className="bg-amber-50/60 border border-amber-200/50 p-4 rounded-2xl space-y-2 text-xs">
                <span className="text-[10px] font-black text-amber-800 bg-amber-200/50 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  📖 Kearifan Lokal
                </span>
                <p className="text-[11px] text-slate-600 leading-relaxed font-semibold">
                  Tahukah kamu? "Adil Ka Talino, Bacuramin Ka Saruga, Basengat Ka Jubata" merupakan salam khas masyarakat Dayak. Salam ini biasanya diucapkan sebelum menyampaikan pidato atau sambutan. Maknanya mengajak kita untuk bersikap adil kepada teman, melakukan kebaikan, dan selalu bersyukur kepada Tuhan.
                </p>
              </div>

            </div>

            {/* Change Cash Register Panel (Right - 7 Cols) */}
            <div className="lg:col-span-7 bg-white rounded-3xl p-6 shadow-lg border border-slate-100 space-y-6 flex flex-col justify-between">
              <div>
                <h4 className="font-baloo font-bold text-sm uppercase tracking-wide text-gray-500 mb-3 flex items-center gap-1.5">
                  <Store className="w-4 h-4 text-primary" /> Brankas Alat Tukar Anda
                </h4>
                <p className="text-xs text-slate-400 mb-4">
                  Klik pecahan uang koin dan kertas di bawah ini untuk merumuskan uang kembalian untuk pembeli!
                </p>

                {/* Interactive Money safe cabinet */}
                <div className="grid grid-cols-1 select-none gap-4">
                  {/* Coins Tray */}
                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1">
                      <Coins className="w-3.5 h-3.5" /> Pecahan Uang Logam (Koin)
                    </p>
                    <div className="flex flex-wrap gap-2.5">
                      {COINS.map(coin => (
                        <button
                          key={coin.value}
                          onClick={() => selectCurrency(coin.value)}
                          className={`${coin.color} w-16 h-16 rounded-full flex flex-col items-center justify-center text-xs shadow cursor-pointer hover:scale-105 active:scale-95 transition-transform`}
                        >
                          <span className="text-[10px] opacity-75">LOGAM</span>
                          <span className="text-xs tracking-tight">{coin.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Bills Tray */}
                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1">
                      🍉 Pecahan Uang Kertas
                    </p>
                    <div className="grid grid-cols-2 gap-2.5">
                      {BILLS.map(bill => (
                        <button
                          key={bill.value}
                          onClick={() => selectCurrency(bill.value)}
                          className={`${bill.color} h-12 rounded-xl flex items-center justify-between px-3 text-xs shadow-sm cursor-pointer hover:scale-[1.02] active:scale-95 transition-transform`}
                        >
                          <span className="font-extrabold text-[10px] bg-white/40 px-1 rounded">Rp</span>
                          <span className="text-sm font-black font-mono tracking-tight">{bill.value.toLocaleString('id')}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* THE CASHIER RETRAY DESIGN */}
                <div className="mt-6 border-2 border-dashed border-amber-300 bg-amber-50/50 rounded-2xl p-4 min-h-[110px] relative flex flex-col justify-between">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-black uppercase text-amber-800 flex items-center gap-1">
                      🤝 Nampan Kembalianmu
                    </span>
                    {selectedChange.length > 0 && (
                      <button
                        onClick={clearTray}
                        className="text-xs font-bold text-rose-500 hover:text-rose-600 flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Bersihkan
                      </button>
                    )}
                  </div>

                  {/* Tray currencies item line */}
                  {selectedChange.length === 0 ? (
                    <div className="flex flex-col items-center justify-center flex-1 py-4 text-slate-400">
                      <span className="text-2xl opacity-60">📥</span>
                      <p className="text-xs font-bold mt-1">Kosong, ketuk koin/kertas di atas untuk meletakkannya.</p>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2 items-center flex-1 py-1 custom-scrollbar overflow-y-auto max-h-36">
                      <AnimatePresence>
                        {selectedChange.map((item) => {
                          const isCoin = item.value < 1000;
                          return (
                            <motion.button
                              key={item.key}
                              initial={{ scale: 0.7, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              exit={{ scale: 0.7, opacity: 0 }}
                              onClick={() => removeCurrencyItem(item.key)}
                              className={`text-xs px-2.5 py-1.5 rounded-xl border flex items-center gap-1 shadow-sm font-bold bg-white cursor-pointer hover:bg-rose-50 hover:border-rose-300 hover:text-rose-600 group transition-all`}
                              title="Klik untuk menghapus ini"
                            >
                              <span>{isCoin ? '🪙' : '💵'}</span>
                              <span>Rp{item.value.toLocaleString('id-ID')}</span>
                              <span className="text-[9px] text-slate-400 group-hover:text-rose-500 ml-0.5">✕</span>
                            </motion.button>
                          );
                        })}
                      </AnimatePresence>
                    </div>
                  )}

                  <hr className="border-amber-200/60 my-2" />

                  {/* Live change tray sum */}
                  <div className="flex justify-between items-center font-bold text-sm">
                    <span className="text-slate-500">Jumlah Kembalian Sekarang:</span>
                    <span className={`text-base font-mono font-black ${
                      currentTraySum === currentLevel.correctChange ? 'text-emerald-600' : 'text-slate-800'
                    }`}>
                      {getEjaanRupiah(currentTraySum)}
                    </span>
                  </div>
                </div>

              </div>

              {/* Feedbacks and Submit Buttons Container */}
              <div className="space-y-4 pt-4 border-t">
                {feedback === 'success' && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-center gap-3"
                  >
                    <CheckCircle className="w-8 h-8 text-emerald-600 shrink-0" />
                    <div className="text-xs">
                      <p className="font-extrabold text-sm text-emerald-900">Uang Kembalian Sempurna! ⭐</p>
                      <p className="font-bold text-emerald-700">Kembalian pas {getEjaanRupiah(currentLevel.correctChange)}. {currentLevel.customerName} sangat bersyukur atas kejujuranmu! Ditambah +Rp1.000 tabungan!</p>
                    </div>
                  </motion.div>
                )}

                {feedback === 'fail' && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl flex items-center gap-3"
                  >
                    <span className="text-3xl shrink-0">🤔</span>
                    <div className="text-xs">
                      <p className="font-extrabold text-sm text-rose-900">Waduh, Salah Kasir!</p>
                      <p className="font-bold text-rose-700">Jumlah kembalian yang kamu racik belum cocok. Klik tombol bantuan di sudut kiri atas untuk melihat hitungannya!</p>
                    </div>
                  </motion.div>
                )}

                {feedback === 'empty' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-3 bg-slate-100 text-slate-800 rounded-xl text-xs text-center font-semibold"
                  >
                    Uang nampan masih kosong! Masukkan beberapa keping logam atau kertas terlebih dahulu.
                  </motion.div>
                )}

                {/* Dual navigation actions bar */}
                <div className="flex gap-3">
                  {feedback === 'success' ? (
                    <button
                      onClick={handleNextLevel}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-4 rounded-2xl shadow-lg flex items-center justify-center gap-2 transform active:scale-95 transition-transform cursor-pointer"
                    >
                      <span>Lanjut ke Level Berikutnya</span>
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  ) : (
                    <button
                      onClick={checkSolution}
                      className="w-full bg-primary hover:bg-sky-600 text-white font-black py-4 rounded-2xl shadow-lg transform active:scale-95 transition-transform cursor-pointer"
                    >
                      Serahkan Kembalian! 🤝
                    </button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
