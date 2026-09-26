const fs = require('fs');
const path = require('path');
const admin = require('firebase-admin');

const args = process.argv.slice(2);
const target = args[0];

if (!target) {
  console.error('Usage: node scripts/delete-student.js <uid-or-email>');
  console.error('Example: node scripts/delete-student.js 123abc');
  console.error('Example: node scripts/delete-student.js siswa@example.com');
  process.exit(1);
}

const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH || process.env.GOOGLE_APPLICATION_CREDENTIALS;

if (serviceAccountPath) {
  const resolvedPath = path.resolve(serviceAccountPath);
  if (!fs.existsSync(resolvedPath)) {
    throw new Error(`Service account file not found: ${resolvedPath}`);
  }

  const serviceAccount = JSON.parse(fs.readFileSync(resolvedPath, 'utf8'));
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: serviceAccount.project_id || process.env.FIREBASE_PROJECT_ID || 'dimibalogin',
  });
} else {
  admin.initializeApp({
    projectId: process.env.FIREBASE_PROJECT_ID || 'dimibalogin',
  });
}

async function deleteStudentAccount(searchValue) {
  const auth = admin.auth();
  const db = admin.firestore();

  const user = searchValue.includes('@')
    ? await auth.getUserByEmail(searchValue)
    : await auth.getUser(searchValue);

  const studentUid = user.uid;

  const resultsSnapshot = await db.collection('quizResults').where('studentId', '==', studentUid).get();
  const batch = db.batch();

  resultsSnapshot.docs.forEach((doc) => batch.delete(doc.ref));
  batch.delete(db.collection('studentProfiles').doc(studentUid));

  await batch.commit();
  await auth.deleteUser(studentUid);

  console.log(`Berhasil menghapus akun siswa: ${studentUid}`);
  console.log(`Nama: ${user.displayName || 'tidak ada'}`);
  console.log(`Email: ${user.email || 'tidak ada'}`);
}

deleteStudentAccount(target).catch((error) => {
  console.error('Gagal menghapus akun siswa.');
  console.error(error);
  process.exit(1);
});
