import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  onAuthStateChanged,
} from 'firebase/auth';
import { auth } from './firebase';

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

/** Возвращает функцию отписки, её нужно вызвать в cleanup у useEffect */
export function subscribeToAuth(callback) {
  return onAuthStateChanged(auth, callback);
}

/** Перевод кодов ошибок Firebase в понятные сообщения */
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
  };
  return map[error?.code] ?? 'Произошла ошибка. Попробуйте ещё раз';
}