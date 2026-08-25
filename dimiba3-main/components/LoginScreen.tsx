import { LogIn, ShieldCheck, Sparkles } from 'lucide-react';
import { signInWithPopup } from 'firebase/auth';
import { auth, firebaseConfigured, googleProvider } from '../src/firebase';

interface LoginScreenProps {
  onError: (message: string) => void;
  error: string;
}

export default function LoginScreen({ onError, error }: LoginScreenProps) {
  const handleLogin = async () => {
    if (!auth || !firebaseConfigured) {
      onError('Firebase belum dikonfigurasi. Isi semua VITE_FIREBASE_* di file .env.local.');
      return;
    }

    try {
      onError('');
      await signInWithPopup(auth, googleProvider);
    } catch (loginError) {
      const code = loginError instanceof Error ? loginError.message : '';
      onError(code.includes('popup-closed') ? 'Jendela login ditutup. Silakan coba lagi.' : 'Login Google gagal. Periksa konfigurasi Firebase dan coba lagi.');
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 flex items-center justify-center">
      <section className="w-full max-w-md bg-white rounded-[2rem] p-8 sm:p-10 shadow-xl border border-slate-100 text-center space-y-7">
        <div className="mx-auto w-16 h-16 rounded-2xl bg-sky-100 text-sky-600 flex items-center justify-center">
          <Sparkles className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h1 className="font-baloo font-black text-4xl text-slate-800">DIMIBA!</h1>
          <p className="text-sm font-semibold text-slate-500">Media belajar interaktif tentang barter dan uang Rupiah.</p>
        </div>
        <div className="bg-sky-50 border border-sky-100 rounded-2xl p-4 text-left space-y-2">
          <p className="flex items-center gap-2 text-sm font-black text-sky-800"><ShieldCheck className="w-4 h-4" /> Login sesuai peran</p>
          <p className="text-xs text-slate-600 leading-relaxed">Siswa masuk dengan Gmail biasa. Akun admin khusus dapat melihat hasil uji kompetensi seluruh siswa.</p>
        </div>
        {error && <p className="rounded-xl bg-rose-50 border border-rose-100 p-3 text-xs font-bold text-rose-700">{error}</p>}
        <button onClick={handleLogin} className="w-full rounded-2xl bg-slate-900 hover:bg-slate-800 text-white py-4 font-black flex items-center justify-center gap-3 transition-colors cursor-pointer">
          <LogIn className="w-5 h-5" /> Masuk dengan Google
        </button>
        <p className="text-[11px] text-slate-400 font-semibold">Akun Gmail siswa akan otomatis terdaftar sebagai siswa.</p>
      </section>
    </main>
  );
}
