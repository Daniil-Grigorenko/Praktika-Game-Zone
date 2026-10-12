import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  onAuthStateChanged,
  sendPasswordResetEmail,
  reauthenticateWithCredential,
  EmailAuthProvider,
  updatePassword,
} from 'firebase/auth';
import { auth } from './firebase';

export function resetPassword(email) {
  return sendPasswordResetEmail(auth, email);
}

export async function registerUser({ email, password, displayName }) {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  if (displayName) {
    await updateProfile(cred.user, { displayName });
  }
  return cred.user;
}

export async function loginUser({ email, password }) {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  return cred.user;
}

export function logoutUser() {
  return signOut(auth);
}

export function subscribeToAuth(callback) {
  return onAuthStateChanged(auth, callback);
}

export function getAuthErrorMessage(error) {
  const map = {
    'auth/email-already-in-use': 'Этот email уже зарегистрирован',
    'auth/invalid-email': 'Некорректный email',
    'auth/weak-password': 'Пароль слишком простой (минимум 6 символов)',
    'auth/invalid-credential': 'Неверный email или пароль',
    'auth/user-not-found': 'Пользователь не найден',
    'auth/wrong-password': 'Неверный пароль',
    'auth/too-many-requests': 'Слишком много попыток. Попробуйте позже',
    'auth/network-request-failed': 'Нет соединения с сетью',
    'auth/requires-recent-login': 'Для этого действия нужно заново войти в аккаунт',
    'app/account-deleted': 'Этот аккаунт был удалён администратором',
  };
  return map[error?.code] ?? 'Произошла ошибка. Попробуйте ещё раз';
}

export async function updateUserName(displayName) {
  await updateProfile(auth.currentUser, { displayName });
}

export async function changePassword(currentPassword, newPassword) {
  const user = auth.currentUser;
  const credential = EmailAuthProvider.credential(user.email, currentPassword);
  await reauthenticateWithCredential(user, credential);
  await updatePassword(user, newPassword);
}
