import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

if (!getApps().length) initializeApp();

const ADMIN_EMAIL = 'f2211251024@student.untan.ac.id';

export const deleteStudentAccount = onCall({ region: 'asia-southeast1' }, async (request) => {
  if (request.auth?.token.email !== ADMIN_EMAIL) {
    throw new HttpsError('permission-denied', 'Hanya admin yang boleh menghapus akun.');
  }
  const studentId = typeof request.data?.studentId === 'string' ? request.data.studentId : '';
  if (!studentId || studentId === request.auth.uid) {
    throw new HttpsError('invalid-argument', 'ID siswa tidak valid.');
  }

  const firestore = getFirestore();
  const results = await firestore.collection('quizResults').where('studentId', '==', studentId).get();
  const batch = firestore.batch();
  results.docs.forEach((result) => batch.delete(result.ref));
  batch.delete(firestore.doc(`studentProfiles/${studentId}`));
  await batch.commit();
  await getAuth().deleteUser(studentId);
  return { deleted: true };
});
