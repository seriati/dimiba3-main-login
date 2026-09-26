/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { collection, doc, getDoc, runTransaction, serverTimestamp } from 'firebase/firestore';
import { onAuthStateChanged, signOut, User as FirebaseUser } from 'firebase/auth';
import { Home, BookOpen, Coins, BrainCircuit, BookMarked, Target, Bell, Sparkles, Volume2, VolumeX, Play, Pause, ChevronRight, HelpCircle, AlertCircle, ShoppingBag, Award, CheckCircle, User, Pencil, LogOut, ShieldCheck } from 'lucide-react';

import { ActiveTab, StoryChunk } from './types';
import { STORY_CHUNKS } from './data';
import { playClickSound, playSuccessSound, playErrorSound, playFanfareSound } from './utils/audio.ts';

import StoryIllustrations from '../components/StoryIllustrations.tsx';
import CelenganGame from '../components/CelenganGame.tsx';
import QuizModule from '../components/QuizModule.tsx';
import LoginScreen from '../components/LoginScreen.tsx';
import AdminDashboard from '../components/AdminDashboard.tsx';
import { auth, db, firebaseConfigured } from './firebase';

const ADMIN_EMAILS = [
  'izoryroman.r@gmail.com',
  'f2211251024@student.untan.ac.id',
];

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [chapterIdx, setChapterIdx] = useState(0);
  const [materiProgress, setMateriProgress] = useState<number>(1); // highest read page index
  const [savingsAmt, setSavingsAmt] = useState(0);
  const [miniAnswerFeedback, setMiniAnswerFeedback] = useState<'none' | 'success' | 'fail'>('none');
  const [selectedMiniAns, setSelectedMiniAns] = useState<number | null>(null);
  const [showGuide, setShowGuide] = useState(true);
  const [developerImageLoaded, setDeveloperImageLoaded] = useState(false);
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState('');
  const [studentName, setStudentName] = useState('');
  const [attemptsRemaining, setAttemptsRemaining] = useState(1);
  const [maxAttempts, setMaxAttempts] = useState(1);

  // Audio speech synthesis reading support
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechUtterance, setSpeechUtterance] = useState<SpeechSynthesisUtterance | null>(null);

  const activeChapter = STORY_CHUNKS[chapterIdx];
  const isAdmin = currentUser?.email ? ADMIN_EMAILS.some((email) => currentUser.email?.toLowerCase() === email.toLowerCase()) : false;

  useEffect(() => {
    if (!auth) {
      setAuthLoading(false);
      return;
    }
    return onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setAuthLoading(false);
    });
  }, []);

  useEffect(() => {
    const loadStudentProfile = async () => {
      if (!currentUser || !db || isAdmin) return;
      const profileRef = doc(db, 'studentProfiles', currentUser.uid);
      const profileSnapshot = await getDoc(profileRef);
      if (profileSnapshot.exists()) {
        const profile = profileSnapshot.data();
        setStudentName(profile.displayName || localStorage.getItem('dimiba_student_name') || '');
        setAttemptsRemaining(profile.attemptsRemaining ?? 1);
      } else {
        const name = localStorage.getItem('dimiba_student_name') || '';
        if (!name) {
          setAuthError('Nama peserta didik belum diisi. Keluar lalu masuk kembali dengan nama kamu.');
          await signOut(auth!);
          return;
        }
        const settingsSnapshot = await getDoc(doc(db, 'settings', 'quiz'));
        const configuredAttempts = settingsSnapshot.data()?.maxAttempts ?? 1;
        await runTransaction(db, async (transaction) => {
          transaction.set(profileRef, { displayName: name, attemptsRemaining: configuredAttempts, updatedAt: serverTimestamp() });
        });
        setStudentName(name);
        setAttemptsRemaining(configuredAttempts);
      }
    };
    void loadStudentProfile();
  }, [currentUser, isAdmin]);

  const handleQuizComplete = async (score: number, correctAnswers: number, totalQuestions: number) => {
    if (!currentUser || !db) return;
    try {
      const profileRef = doc(db, 'studentProfiles', currentUser.uid);
      await runTransaction(db, async (transaction) => {
        const profileSnapshot = await transaction.get(profileRef);
        const remaining = profileSnapshot.data()?.attemptsRemaining ?? 0;
        if (remaining <= 0) throw new Error('NO_ATTEMPTS');
        const resultRef = doc(collection(db, 'quizResults'));
        transaction.set(resultRef, {
          studentId: currentUser.uid,
          name: studentName || 'Siswa',
          email: currentUser.email,
          score,
          correctAnswers,
          totalQuestions,
          completedAt: serverTimestamp(),
        });
        transaction.update(profileRef, { attemptsRemaining: remaining - 1, updatedAt: serverTimestamp() });
      });
      setAttemptsRemaining((remaining) => Math.max(remaining - 1, 0));
    } catch {
      setAuthError('Nilai selesai, tetapi belum berhasil disimpan ke Firebase.');
    }
  };

  // Load digital savings balance
  useEffect(() => {
    const saved = localStorage.getItem('dimiba_savings');
    if (saved) {
      setSavingsAmt(parseInt(saved, 10));
    }
    
    // Listen for custom savings change events to keep state synced 
    const handleSavingsChange = () => {
      const liveSaved = localStorage.getItem('dimiba_savings');
      if (liveSaved) {
        setSavingsAmt(parseInt(liveSaved, 10));
      }
    };
    window.addEventListener('storage', handleSavingsChange);
    return () => {
      window.removeEventListener('storage', handleSavingsChange);
    };
  }, []);

  // Update savings every second locally as general helper
  useEffect(() => {
    const interval = setInterval(() => {
      const current = localStorage.getItem('dimiba_savings');
      if (current) {
        const val = parseInt(current, 10);
        if (val !== savingsAmt) {
          setSavingsAmt(val);
        }
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [savingsAmt]);

  // Clean-up speech synthesis on tab changes/leaving
  useEffect(() => {
    stopNarration();
  }, [activeTab, chapterIdx]);

  // Read narrative text aloud using custom SpeechSynthesis
  const startNarration = () => {
    playClickSound();
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel(); // reset any ongoing speech
      const textToSpeak = `${activeChapter.title}. ${activeChapter.subtitle}. ${activeChapter.content}`;
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.lang = 'id-ID'; // set voice language to Indonesian
      utterance.rate = 0.95; // kids friendly, slightly slower rate

      utterance.onend = () => {
        setIsSpeaking(false);
      };
      
      utterance.onerror = () => {
        setIsSpeaking(false);
      };

      setSpeechUtterance(utterance);
      setIsSpeaking(true);
      window.speechSynthesis.speak(utterance);
    } else {
      alert("Browser kamu belum mendukung pembaca suara bawaan.");
    }
  };

  const stopNarration = () => {
    if ('speechSynthesis' in window && isSpeaking) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  };

  const handleMiniAnswerClick = (optIdx: number) => {
    if (miniAnswerFeedback !== 'none') return;
    setSelectedMiniAns(optIdx);

    if (optIdx === activeChapter.miniQuestion.ansIdx) {
      setMiniAnswerFeedback('success');
      playSuccessSound();
      
      // Unlock progress
      const nextProgressVal = Math.max(materiProgress, chapterIdx + 2);
      setMateriProgress(nextProgressVal);
      
      // Reward kids with token savings!
      const bonus = 500;
      const currentSavings = parseInt(localStorage.getItem('dimiba_savings') || '0', 10);
      const updatedSavings = currentSavings + bonus;
      setSavingsAmt(updatedSavings);
      localStorage.setItem('dimiba_savings', updatedSavings.toString());
    } else {
      setMiniAnswerFeedback('fail');
      playErrorSound();
    }
  };

  const resetMiniAnswer = () => {
    setMiniAnswerFeedback('none');
    setSelectedMiniAns(null);
  };

  const handleNextChapter = () => {
    playClickSound();
    stopNarration();
    resetMiniAnswer();
    if (chapterIdx < STORY_CHUNKS.length - 1) {
      setChapterIdx(prev => prev + 1);
    }
  };

  const handlePrevChapter = () => {
    playClickSound();
    stopNarration();
    resetMiniAnswer();
    if (chapterIdx > 0) {
      setChapterIdx(prev => prev - 1);
    }
  };

  const getEjaanRupiah = (val: number) => {
    return `Rp${val.toLocaleString('id-ID')},00`;
  };

  // Nav cards definitions
  const NAV_ITEMS = [
    { id: 'home', label: 'Beranda', icon: Home, color: 'text-sky-500 bg-sky-50 border-sky-100 hover:bg-sky-100/35' },
    { id: 'tujuan', label: 'Tujuan Belajar', icon: Target, color: 'text-teal-500 bg-teal-50 border-teal-100 hover:bg-teal-100/35' },
    { id: 'materi', label: 'Materi Cerita', icon: BookOpen, color: 'text-rose-500 bg-rose-50 border-rose-100 hover:bg-rose-100/35' },
    { id: 'game', label: 'Celengan Digital', icon: Coins, color: 'text-amber-500 bg-amber-50 border-amber-100 hover:bg-amber-100/35' },
    { id: 'kuis', label: 'Uji Kemampuan', icon: BrainCircuit, color: 'text-emerald-500 bg-emerald-50 border-emerald-100 hover:bg-emerald-100/35' },
    { id: 'profil', label: 'Profil Pengembang', icon: User, color: 'text-indigo-500 bg-indigo-50 border-indigo-100 hover:bg-indigo-100/35' }
  ] as const;

  const renderActiveView = () => {
    switch (activeTab) {
      case 'home':
        return (
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            
            {/* Cheer Banner Card */}
            <div className="relative overflow-hidden bg-gradient-to-br from-sky-400 via-primary to-blue-600 p-8 rounded-[2.5rem] shadow-xl border-b-8 border-blue-700/30 text-white">
              <div className="absolute top-0 right-0 w-72 h-72 bg-white/10 rounded-full -mr-16 -mt-16 animate-pulse"></div>
              <div className="absolute bottom-[-10%] left-[-5%] w-48 h-48 bg-white/5 rounded-full pointer-events-none"></div>

              <div className="relative z-10 space-y-4 max-w-xl">
                <span className="bg-white/20 text-white px-4 py-1 rounded-full text-[11px] font-black uppercase tracking-widest leading-none">
                  🌻 Bahasa Indonesia — Kelas 4 SD
                </span>
                
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-baloo font-extrabold leading-tight">
                  Bertukar dan <br />
                  <span className="text-yellow-300">Membayar!</span>
                </h1>
                
                <p className="text-white/90 text-sm leading-relaxed font-semibold">
                  Mampirlah masuk ke Hutan Kelayau bertemu Kancil, Bebek, dan Kelinci untuk memahami serunya Barter, Syarat Uang, serta hitungan Kembalian Rupiah!
                </p>

                <div className="pt-2 flex flex-wrap gap-3">
                  <button
                    onClick={() => { playClickSound(); setActiveTab('materi'); }}
                    className="bg-yellow-400 hover:bg-yellow-500 text-slate-950 font-black px-6 py-3.5 rounded-2xl shadow-md cursor-pointer text-xs uppercase tracking-wide transform active:scale-95 transition-transform"
                  >
                    Mulai Belajar Cerita 📖
                  </button>
                  <button
                    onClick={() => { playClickSound(); setActiveTab('game'); }}
                    className="bg-white/10 hover:bg-white/20 border border-white/20 text-white font-black px-6 py-3.5 rounded-2xl text-xs uppercase tracking-wide cursor-pointer transition-colors"
                  >
                    Masuk Celengan Game 🎮
                  </button>
                </div>
              </div>
            </div>

            {/* Pojok Etnobudaya & Filosofi DIMIBA */}
            <div className="bg-gradient-to-br from-amber-50 via-amber-100/40 to-orange-50 rounded-[2.5rem] p-6 border-2 border-amber-200/60 shadow-xs space-y-5">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-amber-500 text-white rounded-2xl flex items-center justify-center text-2xl shadow-md border-b-4 border-amber-700/30">
                    ⛰️
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-amber-600 bg-amber-500/10 px-2 py-0.5 rounded-md">
                      Tradisi & Kearifan Kalimantan
                    </span>
                    <h3 className="font-baloo font-black text-slate-800 text-lg leading-tight mt-0.5">
                      Filosofi Tradisional &ldquo;DIMIBA&rdquo;
                    </h3>
                  </div>
                </div>
                
                {/* Cultural Dayak Tag */}
                <div className="text-[10px] text-amber-800 bg-amber-200/50 px-3 py-1.5 rounded-full font-black flex items-center gap-1 border border-amber-300">
                  <span>✨</span> Budaya Dayak Kalimantan
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                
                {/* 1. TEXTUAL CONTENT EXPLAINING DIMIBA ACRONYM (7 Cols) */}
                <div className="md:col-span-7 space-y-3">
                  <div className="bg-white/80 border border-amber-200/80 p-4 rounded-3xl space-y-2">
                    <p className="text-sm font-baloo font-black text-amber-950 flex flex-wrap items-center gap-1">
                      <span>📢</span> Akronim: <span className="bg-amber-500 text-white px-2 py-0.5 rounded-lg font-mono">Diri Mali Ia Bajual</span>
                    </p>
                    <p className="text-xs text-slate-600 font-bold leading-relaxed">
                      Dalam rumpun bahasa Dayak, frasa <span className="text-amber-800 font-extrabold">&ldquo;Diri Mali Ia Bajual&rdquo;</span> bermakna harmonis dan asri, yaitu <strong className="text-slate-800 font-black">&ldquo;Kita Beli, Dia Jualan&rdquo;</strong>.
                    </p>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed font-semibold">
                    Filosofi ini mengajarkan kesederhanaan, transparansi, dan rasa saling asih dalam kegiatan ekonomi komunal. Bukan sekadar mengejar keuntungan pribadi, melainkan kerukunan antar sesama makhluk hidup yang saling membutuhkan pertolongan di tengah keasrian alam Kalimantan.
                  </p>

                  <div className="flex flex-wrap gap-2 text-[10px] font-bold">
                    <span className="bg-orange-100 text-orange-800 px-2.5 py-1 rounded-lg">#Etnofinansial</span>
                    <span className="bg-sky-100 text-sky-800 px-2.5 py-1 rounded-lg">#KurikulumMerdeka</span>
                    <span className="bg-amber-100 text-amber-800 px-2.5 py-1 rounded-lg">#KalimantanBarat</span>
                  </div>
                </div>

                {/* 2. IMAGE TEMPLATE WRAPPER CONTEXT (5 Cols) */}
                <div className="md:col-span-5">
                  <div className="relative rounded-3xl overflow-hidden border-2 border-amber-300/80 bg-white/50 p-2 shadow-xs group">
                    <div className="relative rounded-2xl overflow-hidden bg-slate-100 aspect-video md:aspect-square flex items-center justify-center">
                      
                      {/* === TEMPLATE PLACEHOLDER GAMBAR CULTURAL === */}
                      {/* Petunjuk Pengguna: Kamu tinggal meletakkan file gambar Anda di folder public/images/budaya-dayak.png */}
                      <img 
                        src="/images/budaya-dayak.png" 
                        alt="Kearifan Budaya Dayak"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Quick Menu Selection Directory Grid */}
            <div className="space-y-3">
              <h4 className="font-baloo font-black text-slate-900 text-base md:text-lg tracking-wide">Ayo Pilih Kegiatan Seru</h4>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {NAV_ITEMS.filter(it => it.id !== 'home').map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => { playClickSound(); setActiveTab(item.id); }}
                      className={`${item.color} p-5 rounded-3xl border-2 transition-all cursor-pointer flex items-center gap-4 text-left group`}
                    >
                      <div className="bg-white p-3 rounded-2xl shadow-xs group-hover:scale-110 transition-transform">
                        <Icon className="w-6 h-6 stroke-[2]" />
                      </div>
                      <div>
                        <h4 className="font-baloo font-extrabold text-slate-800 text-base leading-none">
                          {item.label}
                        </h4>
                        <p className="text-[11px] text-slate-500 mt-1 font-semibold leading-tight">
                          {item.id === 'materi' && 'Nikmati cerpen komik interaktif.'}
                          {item.id === 'game' && 'Simulasi kembalian Toko Kelayau.'}
                          {item.id === 'kuis' && 'Uji nilai dan pembahasan soal.'}
                          {item.id === 'tujuan' && 'Tengok hasil belajar ideal.'}
                          {item.id === 'profil' && 'Profil pengembang & ucapan terima kasih.'}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Speaking character voic board widget */}
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
              <h4 className="font-baloo font-black text-slate-950 text-2xl md:text-3xl tracking-tight flex items-center gap-2">
                📣 Sapa Sahabat Hutan Kelayau
              </h4>
              <p className="text-base text-slate-700 font-bold">
                Ketuk masing-masing hewan komutatif di bawah untuk mendengar suara dan tips praktis dasar dari mereka!
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                {[
                  { name: 'Kancil 🦌', icon: '🦌', col: 'from-amber-400 to-yellow-500', phrase: '"Tukarlah barang yang nilainya setara agar barter terasa adil dan menguntungkan!"' },
                  { name: 'Bebek 🦆', icon: '🦆', col: 'from-emerald-400 to-teal-500', phrase: '"Gunakan saku terpisah untuk mengantongi uang kertas supaya tidak koyak atau robek!"' },
                  { name: 'Kelinci 🐇', icon: '🐇', col: 'from-pink-400 to-rose-500', phrase: '"Menabung di celengan ayam secara konsisten adalah kunci utama kesuksesan finansial cilik!"' },
                  { name: 'Pelatuk 🐦', icon: '🐦', col: 'from-purple-400 to-indigo-500', phrase: '"Bila ada selisih kembalian, diskusikan secara sopan dengan pemilik toko agar tidak keliru."' }
                ].map((actor) => {
                  return (
                    <button
                      key={actor.name}
                      onClick={() => {
                        playClickSound();
                        if ('speechSynthesis' in window) {
                          window.speechSynthesis.cancel();
                          const utt = new SpeechSynthesisUtterance(actor.phrase);
                          utt.lang = 'id-ID';
                          window.speechSynthesis.speak(utt);
                        }
                      }}
                      className="bg-slate-50 hover:bg-sky-50 border hover:border-sky-200 transition-all p-4 rounded-2xl flex flex-col items-center justify-center text-center cursor-pointer group"
                    >
                      <div className="w-14 h-14 rounded-full flex items-center justify-center text-4xl group-hover:scale-110 transition-transform bg-white border shadow-sm">
                        {actor.icon}
                      </div>
                      <p className="text-sm font-black text-slate-900 mt-2">{actor.name}</p>
                      <p className="text-sm text-slate-700 leading-snug font-semibold mt-1 line-clamp-2">
                        {actor.phrase}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

          </motion.div>
        );

      case 'materi':
        return (
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 pb-12">
            
            {/* Top Interactive Progress Header */}
            <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
              <div className="flex justify-between items-center text-xs font-black uppercase text-slate-400 mb-3">
                <span className="text-rose-500">BAB 5: Bertukar & Membayar</span>
                <span>Halaman {chapterIdx + 1} dari {STORY_CHUNKS.length}</span>
              </div>

              {/* Progress bars indicators list */}
              <div className="flex gap-2">
                {STORY_CHUNKS.map((_, i) => {
                  const isRead = i <= chapterIdx;
                  const isUnlocked = i < materiProgress;
                  
                  return (
                    <button
                      key={i}
                      disabled={!isUnlocked}
                      onClick={() => { playClickSound(); setChapterIdx(i); resetMiniAnswer(); }}
                      className={`h-2.5 flex-1 rounded-full border-b transition-all cursor-pointer ${
                        i === chapterIdx 
                          ? 'bg-rose-500 border-rose-600 shadow-xs' 
                          : isRead 
                            ? 'bg-rose-300 border-rose-400' 
                            : 'bg-slate-100 border-slate-200 opacity-60'
                      }`}
                    />
                  );
                })}
              </div>
            </div>

            {/* Story Panel Frame with Vector Illustration */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              
              {/* ILLUSTRATIVE CANVAS (7 Cols) */}
              <div className="lg:col-span-6">
                <StoryIllustrations type={activeChapter.graphicType} />
              </div>

              {/* STORY READING TEXT FIELD (5 Cols) */}
              <div className="lg:col-span-6 bg-white rounded-3xl p-6 shadow-md border border-slate-100 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-rose-500 leading-none">
                        Mengenal Konsep
                      </span>
                      <h3 className="font-baloo font-extrabold text-slate-800 text-xl tracking-tight leading-tight mt-1">
                        {activeChapter.title}
                      </h3>
                      <p className="text-xs text-rose-400 font-bold italic">
                        {activeChapter.subtitle}
                      </p>
                    </div>

                    {/* Audio Player widgets */}
                    <div className="flex gap-1">
                      {isSpeaking ? (
                        <button
                          onClick={stopNarration}
                          className="p-2 bg-rose-100 text-rose-600 rounded-xl hover:bg-rose-200 transition-colors cursor-pointer flex items-center justify-center animate-pulse"
                          title="Hentikan Narasi"
                        >
                          <Pause className="w-5 h-5 fill-current" />
                        </button>
                      ) : (
                        <button
                          onClick={startNarration}
                          className="p-2 bg-slate-50 text-slate-500 rounded-xl hover:bg-sky-50 hover:text-primary transition-colors cursor-pointer flex items-center justify-center"
                          title="Baca Cerita Otomatis"
                        >
                          <Play className="w-5 h-5 fill-current" />
                        </button>
                      )}
                    </div>
                  </div>

                  <p className="text-slate-850 font-bold text-base sm:text-[16px] leading-relaxed text-justify max-h-[180px] overflow-y-auto custom-scrollbar">
                    {activeChapter.content}
                  </p>
                </div>

                {/* Speaker bubble avatar quotes */}
                <div className="bg-rose-50/60 border border-rose-200 p-4 rounded-2xl flex items-start gap-3">
                  <span className="text-4xl select-none">{activeChapter.character.avatar}</span>
                  <div>
                    <span className="text-xs font-black text-rose-800 uppercase leading-none">
                      Pesan {activeChapter.character.name}:
                    </span>
                    <p className="text-sm italic text-slate-700 leading-relaxed mt-1 font-bold">
                      "{activeChapter.character.phrase}"
                    </p>
                  </div>
                </div>

              </div>

            </div>

            {/* MINI INTERACTIVE REINFORCEMENT QUESTION */}
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
              <div className="flex items-start gap-2 text-slate-800 font-bold text-sm">
                <HelpCircle className="w-5 h-5 text-rose-500 shrink-0" />
                <div>
                  <h4 className="font-baloo tracking-tight text-base font-extrabold">Uji Kritis Singkat di Halaman Ini!</h4>
                  <p className="text-xs text-slate-400 font-semibold">Jawab pertanyaan ini untuk membuka kunci cerita selanjutnya!</p>
                </div>
              </div>

              <div className="bg-slate-50 border p-4 rounded-2xl space-y-3">
                <p className="font-extrabold text-sm text-slate-700">
                  {activeChapter.miniQuestion.q}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {activeChapter.miniQuestion.opts.map((opt, i) => {
                    const isSelected = selectedMiniAns === i;
                    const isCorrect = i === activeChapter.miniQuestion.ansIdx;
                    
                    let bgCol = 'bg-white border-slate-100 text-slate-700 hover:border-rose-400 hover:bg-rose-50/10';
                    if (miniAnswerFeedback !== 'none') {
                      if (isCorrect) {
                        bgCol = 'bg-emerald-500 text-white border-emerald-600 shadow';
                      } else if (isSelected) {
                        bgCol = 'bg-rose-500 text-white border-rose-600 shadow';
                      } else {
                        bgCol = 'bg-white text-slate-400 border-slate-100 opacity-50 pointer-events-none';
                      }
                    }

                    return (
                      <button
                        key={i}
                        disabled={miniAnswerFeedback !== 'none'}
                        onClick={() => handleMiniAnswerClick(i)}
                        className={`p-3 text-xs rounded-xl border-2 font-bold text-center transition-all cursor-pointer ${bgCol}`}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* feedback panel */}
              {miniAnswerFeedback === 'success' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-emerald-50 border border-emerald-100 text-emerald-800 p-4 rounded-2xl space-y-1">
                  <div className="flex items-center gap-1.5 font-extrabold text-xs">
                    <CheckCircle className="w-4 h-4 text-emerald-600" /> Selamat, Jawaban Benar! (+Rp500 Koin Dimasukkan!)
                  </div>
                  <p className="text-xs text-slate-600 font-bold">
                    <strong>Penjelasan:</strong> {activeChapter.miniQuestion.explanation}
                  </p>
                </motion.div>
              )}

              {miniAnswerFeedback === 'fail' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-rose-50 border border-rose-100 text-rose-800 p-4 rounded-2xl flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">😢</span>
                    <div className="text-xs font-semibold">
                      <p className="font-extrabold text-rose-900 leading-none">Aduh, Masih Salah!</p>
                      <p className="text-rose-600 leading-relaxed mt-0.5">Jangan patah semangat, cobalah pikirkan kembali cerita di atas!</p>
                    </div>
                  </div>
                  <button
                    onClick={resetMiniAnswer}
                    className="bg-white border text-slate-600 hover:text-slate-800 font-bold text-[10px] px-3 py-1.5 rounded-lg shrink-0 cursor-pointer"
                  >
                    Coba Lagi
                  </button>
                </motion.div>
              )}
            </div>

            {/* Bottom Stepper Buttons bar */}
            <div className="flex justify-between items-center pt-2">
              <button
                disabled={chapterIdx === 0}
                onClick={handlePrevChapter}
                className="px-6 py-3 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold rounded-xl disabled:opacity-40 select-none cursor-pointer text-xs"
              >
                Kembali
              </button>

              {chapterIdx < STORY_CHUNKS.length - 1 ? (
                <button
                  disabled={chapterIdx >= materiProgress - 1} // enforce reading question lock
                  onClick={handleNextChapter}
                  className="px-6 py-3 bg-rose-500 hover:bg-rose-600 text-white font-extrabold rounded-xl shadow-md disabled:bg-slate-100 disabled:text-slate-400 disabled:border-slate-200 disabled:opacity-50 flex items-center gap-1.5 cursor-pointer text-xs uppercase tracking-wide transition-colors"
                >
                  <span>Materi Selanjutnya</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  disabled={chapterIdx >= materiProgress - 1}
                  onClick={() => { playClickSound(); setActiveTab('kuis'); }}
                  className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl shadow-lg flex items-center gap-1.5 cursor-pointer text-xs uppercase tracking-wide transition-colors"
                >
                  <span>Buka Uji Kemampuan! 🎉</span>
                </button>
              )}
            </div>

            {chapterIdx >= materiProgress - 1 && (
              <div className="flex items-center justify-center gap-1.5 text-[11px] text-rose-500 font-black animate-pulse text-center">
                <AlertCircle className="w-4 h-4" />
                Jawab pertanyaan kuis singkat di atas halaman ini terlebih dahulu untuk melanjutkan materi!
              </div>
            )}

          </motion.div>
        );

      case 'game':
        return <CelenganGame />;

      case 'kuis':
        return <QuizModule onComplete={handleQuizComplete} attemptsRemaining={attemptsRemaining} />;

      case 'admin':
        return isAdmin ? <AdminDashboard /> : null;

      case 'tujuan':
        return (
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 max-w-2xl mx-auto pb-12">
            <div className="bg-white rounded-3xl p-8 shadow-md border border-slate-100 space-y-6">
              <div className="text-center space-y-2">
                <div className="w-14 h-14 bg-teal-50 text-teal-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
                  <Target className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-baloo font-black text-slate-800">
                  Tujuan Pembelajaran (CP & ATP)
                </h3>
                <p className="text-slate-400 text-xs">
                  Kurikulum Merdeka — Kelas 4 SD Bahasa Indonesia Bab 5
                </p>
              </div>

              <div className="space-y-4 font-semibold text-sm">
                
                <div className="border border-slate-100 bg-slate-50/50 p-4 rounded-2xl flex gap-4 items-start">
                  <span className="text-2xl">🌱</span>
                  <div className="space-y-1 text-slate-700">
                    <p className="font-extrabold text-slate-800">1. Memahami pengertian dan kelemahan barter</p>
                    <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                      Siswa mampu memahami informasi tentang barter dengan menjelaskan pengertian dan kelemahan sistem barter berdasarkan bacaan.
                    </p>
                  </div>
                </div>

                <div className="border border-slate-100 bg-slate-50/50 p-4 rounded-2xl flex gap-4 items-start">
                  <span className="text-2xl">🪙</span>
                  <div className="space-y-1 text-slate-700">
                    <p className="font-extrabold text-slate-800">2. Memahami perkembangan alat tukar hingga menjadi uang</p>
                    <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                      Siswa Memahami perkembangan alat tukar menjadi uang dengan menjelaskan alasan penggunaan barang sebagai alat tukar dan perkembangan menuju penggunaan uang.
                    </p>
                  </div>
                </div>

                <div className="border border-slate-100 bg-slate-50/50 p-4 rounded-2xl flex gap-4 items-start">
                  <span className="text-2xl">💵</span>
                  <div className="space-y-1 text-slate-700">
                    <p className="font-extrabold text-slate-800">3. Mengenal fungsi dan penggunaan uang Rupiah</p>
                    <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                      Siswa dapat mengidentifikasi fungsi uang sebagai alat tukar, mengenali Rupiah sebagai mata uang Indonesia, serta membaca nilai nominalnya dengan tepat.
                    </p>
                  </div>
                </div>

                <div className="border border-slate-100 bg-slate-50/50 p-4 rounded-2xl flex gap-4 items-start">
                  <span className="text-2xl">🧮</span>
                  <div className="space-y-1 text-slate-700">
                    <p className="font-extrabold text-slate-800">4. Menerapkan penggunaan uang dalam transaksi sederhana</p>
                    <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                      Siswa mampu menerapkan pemahaman tentang penggunaan uang melalui simulasi transaksi jual beli sederhana dan menentukan jumlah uang kembalian dengan tepat.
                    </p>
                  </div>
                </div>

              </div>
            </div>
          </motion.div>
        );

      case 'profil':
        return (
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 max-w-2xl mx-auto pb-12">
            {/* Developer Card (Profil Pengembang) */}
            <div className="bg-white rounded-3xl p-8 shadow-md border border-slate-100 space-y-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full -mr-10 -mt-10"></div>
              
              <div className="text-center space-y-4">
                {/* PHOTO PLACEHOLDER FOR DEVELOPER */}
                <div className="relative w-28 h-28 mx-auto rounded-full overflow-hidden border-4 border-indigo-100 bg-slate-100 shadow-md group">
                  <img 
                    src="/images/foto-pengembang.jpeg" 
                    alt="Foto Pengembang"
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    onLoad={() => setDeveloperImageLoaded(true)}
                    onError={() => setDeveloperImageLoaded(false)}
                    referrerPolicy="no-referrer"
                  />
                  {/* Decorative avatar label is shown when image is not yet loaded */}
                  <div className="absolute inset-x-0 bottom-0 bg-indigo-600 text-white text-[9px] font-black py-0.5 uppercase tracking-wider z-10">
                    PENGEMBANG
                  </div>
                  {/* Show fallback icon only when image fails to load */}
                  {!developerImageLoaded && (
                    <div className="absolute inset-0 bg-gradient-to-tr from-indigo-100 to-indigo-50/50 flex items-center justify-center pointer-events-none">
                      <span className="text-4xl filter drop-shadow">🎓</span>
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <h3 className="text-xl font-baloo font-black text-slate-800">
                    PENGEMBANGAN MEDIA PEMBELAJARAN INTERAKTIF
                  </h3>
                  <p className="text-xs bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full font-black inline-block uppercase tracking-wider">
                    Oleh: Seriati, S.Pd. (Guru SD)
                  </p>
                  <p className="text-slate-400 text-xs font-semibold mt-1">
                    [Guru di SDN 05 Sibawek, Mahasiswa S2 PGSD di Universitas Tanjungpura]
                  </p>
                </div>
              </div>

              {/* Developer Info Sheet details */}
              <div className="border border-indigo-50/50 bg-indigo-50/25 p-5 rounded-2xl space-y-3">
                <h4 className="font-baloo font-bold text-indigo-900 text-sm uppercase tracking-wide flex items-center gap-1.5">
                  <span>💡</span> Tentang Pengembang
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed font-semibold">
                  Media ini saya kembangkan untuk membantu peserta didik memahami materi bertukar dan membayar melalui situasi yang dekat dengan kehidupan sehari-hari serta budaya setempat.

Dalam proses pembuatannya, saya memanfaatkan bantuan teknologi AI, seperti Google AI Studio dan Antigravity, untuk mendukung pengembangan beberapa bagian media. Namun, seluruh isi, fitur, ilustrasi, dan materi yang ditampilkan telah saya telaah, evaluasi, dan sesuaikan kembali agar akurat, relevan, serta sesuai dengan tujuan pembelajaran yang ingin dicapai.

Terima kasih telah menggunakan media pembelajaran ini. Semoga dapat memberikan pengalaman belajar yang menyenangkan dan bermakna.
                </p>
                <div className="grid grid-cols-2 gap-4 text-xs pt-3 border-t border-indigo-100/30 font-bold">
                  <div>
                    <span className="text-slate-400 text-[10px] block font-extrabold uppercase">Email Kontak</span>
                    <span className="text-indigo-800 text-xs font-bold font-mono">f2211251024@student.untan.ac.id</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block font-extrabold uppercase">Bidang Kontribusi</span>
                    <span className="text-indigo-800 text-xs font-bold">Pengembangan Media Pembelajaran, Matematika GASING, Pendidikan Anak SD</span>
                  </div>
                </div>
              </div>


            {/* Respect the Storyteller / Terima Kasih Section */}
            <div className="bg-gradient-to-br from-rose-50 to-pink-50 rounded-3xl p-8 border border-rose-100 space-y-5 shadow-sm text-slate-800">
              <div className="flex gap-4 items-start pb-3 border-b border-rose-200/50">
                <div className="text-3xl filter drop-shadow">🌟</div>
                <div>
                  <h4 className="font-baloo font-black text-rose-900 text-lg leading-tight">Penghargaan & Inspirasi Cerita</h4>
                  <p className="text-[10px] text-rose-500 font-black uppercase tracking-wider mt-0.5">Ucapan terima kasih</p>
                </div>
              </div>

              <div className="space-y-3.5 text-xs leading-relaxed font-semibold text-rose-950">
                <p className="text-justify font-bold text-slate-700">
                  Puji syukur kepada Tuhan Yang Maha Esa atas terselesaikannya media pembelajaran ini. Dalam proses pengembangannya, banyak pihak yang telah memberikan inspirasi, dukungan, masukan, serta bantuan yang sangat berarti. Oleh karena itu, penulis menyampaikan penghargaan dan ucapan terima kasih yang sebesar-besarnya kepada:
                </p>
                
              

                <p className="text-justify text-slate-600 font-medium pt-1">
                  1. Tim penyusun buku Bahasa Indonesia: Lihat Sekitar SD Kelas IV, yaitu Eva Y. Nukman dan Cicilia Erni Setyowati, yang diterbitkan oleh Kementerian Pendidikan, Kebudayaan, Riset, dan Teknologi Republik Indonesia pada tahun 2021. Cerita Dongeng Hutan Kelayau dalam media ini diadaptasi dan dikembangkan dengan mengacu pada sumber tersebut sebagai inspirasi utama.
                  2. Dosen pembimbing dan dosen penguji, yang telah memberikan arahan, kritik, saran, serta masukan yang konstruktif sehingga media ini dapat dikembangkan dengan lebih baik.
                  3. Seluruh pihak yang telah membantu proses pengembangan media, baik melalui dukungan material maupun nonmaterial, yang tidak dapat disebutkan satu per satu.
                </p>
              </div>

              {/* Traditional border illustration container */}
            <div className="p-3 bg-white border border-dashed border-rose-300 rounded-xl flex items-center justify-center gap-2">
              <span className="text-base">🤝</span>
              <span className="text-[10px] font-black tracking-wide text-rose-900 uppercase">TERIMA KASIH</span>
            </div>
          </div>  {/* penutup bg-gradient Terima Kasih */}
        </div>    {/* ← TAMBAHKAN INI: penutup bg-white rounded-3xl utama */}
      </motion.div>
    );

      default:
        return <div className="p-10 text-center font-bold text-slate-300">🚧 Halaman ini sedang dikembangkan!</div>;
    }
  };

  if (authLoading) {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center text-sm font-bold text-slate-500">Menyiapkan login...</div>;
  }

  if (!currentUser) {
    return <LoginScreen onError={setAuthError} error={authError || (!firebaseConfigured ? 'Firebase belum aktif. Isi konfigurasi Firebase terlebih dahulu.' : '')} />;
  }

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-800">
      
      {/* 1. LEFT SIDEBAR PANEL (DESKTOP) */}
      <aside className="hidden md:flex w-64 bg-slate-900 text-white flex-col justify-between p-5 fixed h-screen z-20">
        <div className="space-y-8">
          {/* Brand logo app */}
          <div className="flex items-center space-x-2.5 px-1 py-2">
            <div className="bg-primary flex items-center justify-center p-2 rounded-xl text-white shadow-md shadow-sky-500/20">
              <Sparkles className="w-5 h-5 animate-spin-slow" />
            </div>
            <div>
              <h2 className="font-baloo font-black text-xl leading-none">DIMIBA!</h2>
              <span className="text-[10px] font-black uppercase text-sky-400 tracking-wider">Diri Mali, Ia Bajual</span>
            </div>
          </div>

          {/* Navigation elements links */}
          <nav className="space-y-1.5">
            {[...NAV_ITEMS, ...(isAdmin ? [{ id: 'admin', label: 'Data Siswa', icon: ShieldCheck, color: 'text-indigo-500 bg-indigo-50 border-indigo-100 hover:bg-indigo-100/35' }] : [])].map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => { playClickSound(); setActiveTab(item.id); }}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl transition-all font-bold text-xs capitalize cursor-pointer select-none ${
                    isActive 
                      ? 'bg-primary text-white shadow-lg shadow-sky-500/10 scale-[1.02]' 
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

      </aside>

      {/* 2. BOTTOM NAV PANEL (MOBILE RESPONSIVE SCREEN) */}
      <nav className="md:hidden fixed bottom-3 left-4 right-4 bg-slate-900 border border-slate-800 text-white flex justify-around p-2.5 rounded-[2rem] z-50 shadow-2xl">
        {[...NAV_ITEMS, ...(isAdmin ? [{ id: 'admin', label: 'Data Siswa', icon: ShieldCheck, color: 'text-indigo-500 bg-indigo-50 border-indigo-100 hover:bg-indigo-100/35' }] : [])].map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => { playClickSound(); setActiveTab(item.id); }}
              className={`p-2.5 rounded-2xl transition-colors cursor-pointer text-slate-400 flex flex-col items-center gap-0.5 ${
                isActive ? 'text-primary bg-sky-500/10' : 'hover:text-white'
              }`}
            >
              <Icon className="w-5 h-5 shrink-0" />
              <span className="text-[8px] font-bold uppercase tracking-tighter sm:block h-0 overflow-hidden sm:h-auto">
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>

      {/* 3. MAIN WRAPPER CONTAINER GRID */}
      <main className="flex-1 md:ml-64 p-4 md:p-10 pb-28 md:pb-10 min-h-screen flex flex-col justify-between">
        
        {/* Dynamic Greeting Header bar */}
        <div className="space-y-6">
          <header className="flex justify-between items-center bg-white md:bg-transparent p-4 md:p-0 rounded-2xl border md:border-none border-slate-100 shadow-sm md:shadow-none">
            <div className="md:hidden flex items-center space-x-2">
              <div className="bg-primary hover:scale-105 active:scale-95 cursor-pointer p-1.5 rounded-lg text-white">
                <Sparkles className="w-4 h-4" />
              </div>
              <h2 className="font-baloo font-bold text-lg text-slate-800">DIMIBA!</h2>
            </div>

            <div className="hidden md:block">
              <p className="text-slate-400 text-xs font-extrabold uppercase tracking-widest">Selamat Datang, {isAdmin ? 'Guru' : studentName || 'Siswa'}!</p>
              <h2 className="text-lg font-black text-slate-700 mt-0.5">Harimu indah untuk belajar! 🌸</h2>
            </div>

            {/* Micro Alerts profile indicators */}
            <div className="flex items-center space-x-3 text-xs">
              <div className="bg-amber-100 text-amber-800 border border-amber-300 px-3.5 py-1.5 rounded-full font-black font-mono tracking-tight animate-pulse flex items-center gap-1">
                <span>💰</span> {getEjaanRupiah(savingsAmt)}
              </div>
              <button onClick={() => void signOut(auth!)} title="Keluar" className="p-2 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-rose-500 cursor-pointer"><LogOut className="w-4 h-4" /></button>
            </div>
          </header>

          {/* PETUNJUK PENGGUNAAN BAR (Collapsible & High Contrast for Kids) */}
          <div className="bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 rounded-2xl md:rounded-[2rem] p-4 md:p-6 text-slate-900 shadow-md border-b-4 border-amber-700/30 relative">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-xl md:rounded-2xl flex items-center justify-center text-xl md:text-2xl shadow shrink-0">
                  🧭
                </div>
                <div>
                  <h3 className="font-baloo font-black text-white text-base md:text-lg leading-tight">
                    Petunjuk Penggunaan DIMIBA 🎒
                  </h3>
                  <p className="text-white/95 text-xs font-bold leading-tight">
                    {showGuide ? 'Mari ikuti langkah-langkah mudah di bawah ini agar belajarmu asyik!' : 'Ayo klik tombol kuning untuk memunculkan petunjuk belajar! ✨'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => { playClickSound(); setShowGuide(!showGuide); }}
                className="bg-yellow-300 hover:bg-yellow-400 text-slate-950 hover:scale-105 active:scale-95 transition-transform text-xs font-black px-4 py-2 rounded-xl cursor-pointer shadow-sm select-none shrink-0"
              >
                {showGuide ? 'Sembunyikan ✕' : 'Lihat Petunjuk Belajar 💡'}
              </button>
            </div>

            <AnimatePresence>
              {showGuide && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4 pt-4 border-t border-white/20 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3"
                >
                  <div className="bg-white/95 p-3 rounded-2xl flex flex-col items-center text-center space-y-1 shadow-xs border border-orange-200">
                    <span className="text-2xl">🌱</span>
                    <strong className="text-xs font-extrabold text-teal-600 block">1. Tujuan Belajar</strong>
                    <p className="text-[11px] font-bold text-slate-600 leading-tight">
                      Ketahui target kehebatan belajarmu hari ini!
                    </p>
                  </div>

                  <div className="bg-white/95 p-3 rounded-2xl flex flex-col items-center text-center space-y-1 shadow-xs border border-orange-200">
                    <span className="text-2xl">📖</span>
                    <strong className="text-xs font-extrabold text-rose-500 block">2. Materi Cerita</strong>
                    <p className="text-[11px] font-bold text-slate-600 leading-tight">
                      Baca dongeng seru &amp; jawab kuis singkat di bawah cerita!
                    </p>
                  </div>

                  <div className="bg-white/95 p-3 rounded-2xl flex flex-col items-center text-center space-y-1 shadow-xs border border-orange-200">
                    <span className="text-2xl">🪙</span>
                    <strong className="text-xs font-extrabold text-amber-500 block">3. Celengan Digital</strong>
                    <p className="text-[11px] font-bold text-slate-600 leading-tight">
                      Hitung kembalian belanja pembeli secara jujur &amp; teliti!
                    </p>
                  </div>

                  <div className="bg-white/95 p-3 rounded-2xl flex flex-col items-center text-center space-y-1 shadow-xs border border-orange-200">
                    <span className="text-2xl">🧠</span>
                    <strong className="text-xs font-extrabold text-emerald-500 block">4. Uji Kemampuan</strong>
                    <p className="text-[11px] font-bold text-slate-600 leading-tight">
                      Uji kepintaran belajarmu untuk raih lencana Saudagar!
                    </p>
                  </div>

                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <AnimatePresence mode="wait">
            {renderActiveView()}
          </AnimatePresence>
        </div>

        {/* Footer info brand */}
        <footer className="text-center text-[10px] text-slate-400 pt-8 hidden sm:block">
          <p className="font-extrabold tracking-widest uppercase">DIMIBA! — Media Pembelajaran Interaktif "Diri Mali Ia Bajual" untuk Kelas IV SD</p>
          <p className="font-bold text-slate-300 mt-1">Dibuat untuk mendukung pembelajaran interaktif tentang Bertukar dan Mebayar dengan pendekatan budaya setempat.</p>
        </footer>

      </main>

    </div>
  );
}
