## Setup Firebase

1. Buat project di Firebase Console.
2. Aktifkan **Authentication > Sign-in method > Google**.
3. Buat **Cloud Firestore Database**.
4. Tambahkan alamat aplikasi pada **Authentication > Settings > Authorized domains**.
5. Salin `.env.example` menjadi `.env.local`, lalu isi nilai `VITE_FIREBASE_*` dari Firebase Project settings > Your apps > Web app.
6. Deploy aturan akses dengan Firebase CLI: `firebase login` lalu `firebase deploy --only firestore:rules`.
7. Jalankan aplikasi dengan `npm run dev`.

## Hosting Firebase

1. Pasang Firebase CLI jika belum ada: `npm install -g firebase-tools`.
2. Login: `firebase login`.
3. Hubungkan folder ini ke project Firebase: `firebase use --add`, lalu pilih project yang sesuai.
4. Isi variabel Firebase di `.env.local` sebelum build.
5. Deploy aplikasi dan Firestore Rules sekaligus: `npm run firebase:deploy`.

Firebase Hosting akan memberikan URL `https://PROJECT_ID.web.app` setelah deploy selesai.

Login Google biasa akan masuk sebagai siswa. Akun `f2211251024@student.untan.ac.i` dan variasi alamat yang tertulis di profil aplikasi (`.ac.id`) akan mendapat menu **Data Siswa**. Hasil uji kompetensi tersimpan di koleksi `quizResults` dan hanya dapat dibaca akun admin melalui Firestore Rules.

## Hapus akun siswa tanpa Firebase Functions

Kalau project Firebase tidak mau di-upgrade ke Blaze plan, kamu masih bisa menghapus akun siswa via script admin lokal.

1. Buat service account di Google Cloud / Firebase.
2. Beri role Firebase Authentication Admin.
3. Simpan file JSON di folder aman, misalnya `secrets/firebase-admin.json`.
4. Jalankan:

```powershell
cd 'D:\dimiba3-main-login\dimiba3-main'
$env:FIREBASE_SERVICE_ACCOUNT_PATH = 'D:\dimiba3-main-login\dimiba3-main\secrets\firebase-admin.json'
node functions\scripts\delete-student.js <UID_SISWA>
```

Atau pakai email:

```powershell
node functions\scripts\delete-student.js siswa@example.com
```

Script ini akan:
- menghapus user dari Firebase Authentication
- menghapus semua dokumen di `quizResults` milik siswa
- menghapus dokumen di `studentProfiles/<uid>`

Jangan commit file service account ke Git.

