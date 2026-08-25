import { useEffect, useState } from 'react';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { ClipboardList, RefreshCw } from 'lucide-react';
import { db } from '../src/firebase';

interface QuizResult {
  id: string;
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

  const loadResults = async () => {
    if (!db) return;
    setLoading(true);
    try {
      const resultQuery = query(collection(db, 'quizResults'), orderBy('completedAt', 'desc'));
      const snapshot = await getDocs(resultQuery);
      setResults(snapshot.docs.map((item) => ({ id: item.id, ...item.data() } as QuizResult)));
      setError('');
    } catch {
      setError('Hasil belum dapat dimuat. Pastikan Firestore Rules sudah dipasang.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void loadResults(); }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="font-baloo font-black text-2xl text-slate-800 flex items-center gap-2"><ClipboardList className="w-7 h-7 text-indigo-500" /> Hasil Uji Kompetensi</h2>
          <p className="text-xs text-slate-500 font-semibold mt-1">Daftar nilai yang dikirim oleh akun siswa.</p>
        </div>
        <button onClick={() => void loadResults()} title="Muat ulang hasil" className="p-3 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer"><RefreshCw className="w-4 h-4" /></button>
      </div>
      {error && <p className="bg-rose-50 border border-rose-100 rounded-xl p-3 text-xs font-bold text-rose-700">{error}</p>}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? <p className="p-8 text-center text-sm font-bold text-slate-400">Memuat hasil...</p> : results.length === 0 ? <p className="p-8 text-center text-sm font-bold text-slate-400">Belum ada hasil uji kompetensi.</p> : (
          <div className="divide-y divide-slate-100">
            {results.map((result) => (
              <article key={result.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <p className="font-black text-slate-800">{result.name || 'Siswa'}</p>
                  <p className="text-xs text-slate-500 font-semibold">{result.email || 'Email tidak tersedia'}</p>
                  <p className="text-[11px] text-slate-400 mt-1">{result.completedAt ? new Date(result.completedAt.seconds * 1000).toLocaleString('id-ID') : 'Waktu tidak tersedia'}</p>
                </div>
                <div className="text-left sm:text-right">
                  <p className="text-3xl font-black text-indigo-600">{result.score ?? 0}</p>
                  <p className="text-xs font-bold text-slate-500">{result.correctAnswers ?? 0} dari {result.totalQuestions ?? 0} benar</p>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
