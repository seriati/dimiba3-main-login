import { useEffect, useState } from 'react';
import { collection, deleteDoc, doc, getDoc, getDocs, orderBy, query, setDoc, serverTimestamp } from 'firebase/firestore';
import { ClipboardList, RefreshCw, RotateCcw, Trash2, UserRoundPlus } from 'lucide-react';
import { db } from '../src/firebase';
import { functions } from '../src/firebase';
import { httpsCallable } from 'firebase/functions';

interface QuizResult {
  id: string;
  studentId: string;
  name?: string;
  email?: string;
  score?: number;
  correctAnswers?: number;
  totalQuestions?: number;
  completedAt?: { seconds: number };
}

export default function AdminDashboard() {
  const [results, setResults] = useState<QuizResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [workingId, setWorkingId] = useState('');
  const [maxAttempts, setMaxAttempts] = useState(1);

  const loadResults = async () => {
    if (!db) return;
    setLoading(true);
    try {
      const resultQuery = query(collection(db, 'quizResults'), orderBy('score', 'desc'));
      const snapshot = await getDocs(resultQuery);
      setResults(snapshot.docs.map((item) => ({ id: item.id, ...item.data() } as QuizResult)).sort((left, right) => (right.score ?? 0) - (left.score ?? 0)));
      const settingsSnapshot = await getDoc(doc(db, 'settings', 'quiz'));
      setMaxAttempts(settingsSnapshot.data()?.maxAttempts ?? 1);
      setError('');
    } catch {
      setError('Hasil belum dapat dimuat. Pastikan Firestore Rules sudah dipasang.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void loadResults(); }, []);

  const saveQuizSetting = async () => {
    if (!db) return;
    try {
      await setDoc(doc(db, 'settings', 'quiz'), { maxAttempts: Math.max(1, Math.min(10, maxAttempts)), updatedAt: serverTimestamp() }, { merge: true });
      setError('Pengaturan kesempatan kuis tersimpan.');
    } catch {
      setError('Pengaturan kuis gagal disimpan.');
    }
  };

  const giveAnotherAttempt = async (result: QuizResult) => {
    if (!db) return;
    setWorkingId(result.id);
    try {
      await setDoc(doc(db, 'studentProfiles', result.studentId), { attemptsRemaining: 1, updatedAt: serverTimestamp() }, { merge: true });
      setError('');
    } catch {
      setError('Kesempatan ulang gagal diberikan.');
    } finally {
      setWorkingId('');
    }
  };

  const resetResult = async (result: QuizResult) => {
    if (!db || !window.confirm(`Reset hasil ${result.name || 'siswa ini'} dan beri satu kesempatan baru?`)) return;
    setWorkingId(result.id);
    try {
      await deleteDoc(doc(db, 'quizResults', result.id));
      await setDoc(doc(db, 'studentProfiles', result.studentId), { attemptsRemaining: 1, updatedAt: serverTimestamp() }, { merge: true });
      await loadResults();
    } catch {
      setError('Hasil gagal di-reset.');
    } finally {
      setWorkingId('');
    }
  };

  const deleteResult = async (result: QuizResult) => {
    if (!db || !window.confirm(`Hapus hasil ${result.name || 'siswa ini'} secara permanen?`)) return;
    setWorkingId(result.id);
    try {
      await deleteDoc(doc(db, 'quizResults', result.id));
      await setDoc(doc(db, 'studentProfiles', result.studentId), { attemptsRemaining: 0, updatedAt: serverTimestamp() }, { merge: true });
      await loadResults();
    } catch {
      setError('Hasil gagal dihapus.');
    } finally {
      setWorkingId('');
    }
  };

  const deleteAccount = async (result: QuizResult) => {
    if (!functions || !window.confirm(`Hapus akun ${result.name || 'siswa ini'} beserta semua datanya?`)) return;
    setWorkingId(result.id);
    try {
      const removeStudent = httpsCallable(functions, 'deleteStudentAccount');
      await removeStudent({ studentId: result.studentId });
      await loadResults();
    } catch {
      setError('Akun gagal dihapus. Deploy Firebase Functions terlebih dahulu.');
    } finally {
      setWorkingId('');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="font-baloo font-black text-2xl text-slate-800 flex items-center gap-2"><ClipboardList className="w-7 h-7 text-indigo-500" /> Hasil Uji Kompetensi</h2>
          <p className="text-xs text-slate-500 font-semibold mt-1">Peringkat nilai dan pengaturan kesempatan mengisi ulang.</p>
        </div>
        <button onClick={() => void loadResults()} title="Muat ulang hasil" className="p-3 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer"><RefreshCw className="w-4 h-4" /></button>
      </div>
      {error && <p className="bg-rose-50 border border-rose-100 rounded-xl p-3 text-xs font-bold text-rose-700">{error}</p>}
      <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 text-sm font-black text-indigo-900">🏆 Peringkat tertinggi: {results[0]?.name || 'Belum ada hasil'}{results[0] ? ` dengan nilai ${results[0].score ?? 0}` : ''}</div>
      <div className="bg-white rounded-2xl border border-slate-100 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div><p className="font-black text-slate-800">Atur kesempatan uji kompetensi</p><p className="text-xs text-slate-500 font-semibold">Berlaku untuk peserta didik yang baru masuk.</p></div>
        <div className="flex items-center gap-2"><input type="number" min="1" max="10" value={maxAttempts} onChange={(event) => setMaxAttempts(Number(event.target.value))} className="w-20 rounded-xl border border-slate-200 px-3 py-2 text-sm font-black" /><button onClick={() => void saveQuizSetting()} className="rounded-xl bg-indigo-600 text-white px-4 py-2 text-xs font-black hover:bg-indigo-700 cursor-pointer">Simpan</button></div>
      </div>
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? <p className="p-8 text-center text-sm font-bold text-slate-400">Memuat hasil...</p> : results.length === 0 ? <p className="p-8 text-center text-sm font-bold text-slate-400">Belum ada hasil uji kompetensi.</p> : (
          <div className="divide-y divide-slate-100">
            {results.map((result, index) => (
              <article key={result.id} className="p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-black">#{index + 1}</div>
                  <div>
                    <p className="font-black text-slate-800">{result.name || 'Siswa'}</p>
                  <p className="text-xs text-slate-500 font-semibold">{result.email || 'Email tidak tersedia'}</p>
                    <p className="text-[11px] text-slate-400 mt-1">{result.completedAt ? new Date(result.completedAt.seconds * 1000).toLocaleString('id-ID') : 'Waktu tidak tersedia'}</p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-3 lg:justify-end">
                  <div className="text-left lg:text-right mr-2"><p className="text-3xl font-black text-indigo-600">{result.score ?? 0}</p><p className="text-xs font-bold text-slate-500">{result.correctAnswers ?? 0} dari {result.totalQuestions ?? 0} benar</p></div>
                  <button disabled={workingId === result.id} onClick={() => void giveAnotherAttempt(result)} title="Beri kesempatan mengisi ulang" className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 disabled:opacity-50 cursor-pointer"><UserRoundPlus className="w-4 h-4" /></button>
                  <button disabled={workingId === result.id} onClick={() => void resetResult(result)} title="Reset hasil dan beri kesempatan baru" className="p-2.5 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 disabled:opacity-50 cursor-pointer"><RotateCcw className="w-4 h-4" /></button>
                  <button disabled={workingId === result.id} onClick={() => void deleteResult(result)} title="Hapus hasil" className="p-2.5 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 disabled:opacity-50 cursor-pointer"><Trash2 className="w-4 h-4" /></button>
                  <button disabled={workingId === result.id} onClick={() => void deleteAccount(result)} title="Hapus akun siswa dan semua datanya" className="p-2.5 rounded-xl bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200 disabled:opacity-50 cursor-pointer"><Trash2 className="w-4 h-4" /></button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
