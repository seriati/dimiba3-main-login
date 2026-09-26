import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

if (!getApps().length) initializeApp();

const ADMIN_EMAILS = [
  'izoryroman.r@gmail.com',
  'f2211251024@student.untan.ac.id',
];

export const deleteStudentAccount = onCall({ region: 'asia-southeast1' }, async (request) => {
  const requesterEmail = request.auth?.token?.email?.toLowerCase();
  const isAllowedAdmin = requesterEmail ? ADMIN_EMAILS.some((email) => requesterEmail === email.toLowerCase()) : false;

  if (!isAllowedAdmin) {
    throw new HttpsError('permission-denied', 'Hanya admin yang boleh menghapus akun.');
  }

  const requesterUid = request.auth?.uid;
  const studentId = typeof request.data?.studentId === 'string' ? request.data.studentId : '';
  if (!studentId || studentId === requesterUid) {
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
