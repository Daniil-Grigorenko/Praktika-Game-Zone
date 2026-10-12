import { CLOSE_HOUR, MAX_DURATION } from '../services/constants';
import { todayString } from './date';
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateRegister({ displayName, email, password, confirmPassword }) {
  const errors = {};

  if (!displayName.trim()) errors.displayName = 'Введите имя';
  else if (displayName.trim().length < 2) errors.displayName = 'Имя должно быть не короче 2 символов';

  if (!email.trim()) errors.email = 'Введите email';
  else if (!EMAIL_RE.test(email.trim())) errors.email = 'Введите email в формате name@example.com';

  if (!password) errors.password = 'Введите пароль';
  else if (password.length < 6) errors.password = 'Пароль должен быть не короче 6 символов';

  if (!confirmPassword) errors.confirmPassword = 'Повторите пароль';
  else if (confirmPassword !== password) errors.confirmPassword = 'Пароли не совпадают';

  return errors;
}

export function validateBooking(values, { busyHours, maxGuests }) {
  const errors = {};
  const today = todayString();

  if (!values.date) errors.date = 'Выберите дату';
  else if (values.date < today) errors.date = 'Нельзя бронировать на прошедшую дату';

  const start = Number(values.startHour);
  if (values.startHour === '') {
    errors.startHour = 'Выберите время начала';
  } else if (values.date === today && start <= new Date().getHours()) {
    errors.startHour = 'Это время уже прошло';
  } else if (busyHours.includes(start)) {
    errors.startHour = 'Этот час уже занят';
  }

  const duration = Number(values.duration);
  if (!Number.isInteger(duration) || duration < 1 || duration > MAX_DURATION) {
    errors.duration = `Длительность: от 1 до ${MAX_DURATION} часов`;
  } else if (values.startHour !== '') {
    if (start + duration > CLOSE_HOUR) {
      errors.duration = `Зона закрывается в ${CLOSE_HOUR}:00, выберите меньшую длительность`;
    } else {
      for (let h = start + 1; h < start + duration; h++) {
        if (busyHours.includes(h)) {
          errors.duration = `В выбранный интервал попадает занятый час (${h}:00)`;
          break;
        }
      }
    }
  }

  const guests = Number(values.guests);
  if (values.guests === '') errors.guests = 'Укажите количество гостей';
  else if (!Number.isInteger(guests) || guests < 1) errors.guests = 'Минимум 1 гость';
  else if (guests > maxGuests) errors.guests = `Для этой зоны максимум ${maxGuests} чел.`;

  if (values.comment.length > 300) errors.comment = 'Не больше 300 символов';

  return errors;
}

export function validateLogin({ email, password }) {
  const errors = {};

  if (!email.trim()) errors.email = 'Введите email';
  else if (!EMAIL_RE.test(email.trim())) errors.email = 'Введите email в формате name@example.com';

  if (!password) errors.password = 'Введите пароль';

  return errors;
}

export function validateReset({ email }) {
  const errors = {};
  if (!email.trim()) errors.email = 'Введите email';
  else if (!EMAIL_RE.test(email.trim())) errors.email = 'Введите email в формате name@example.com';
  return errors;
}

export function validateName({ displayName }) {
  const errors = {};
  if (!displayName.trim()) errors.displayName = 'Введите имя';
  else if (displayName.trim().length < 2) errors.displayName = 'Имя должно быть не короче 2 символов';
  else if (displayName.trim().length > 40) errors.displayName = 'Имя должно быть не длиннее 40 символов';
  return errors;
}

export function validatePasswordChange({ currentPassword, newPassword, confirmPassword }) {
  const errors = {};

  if (!currentPassword) errors.currentPassword = 'Введите текущий пароль';

  if (!newPassword) errors.newPassword = 'Введите новый пароль';
  else if (newPassword.length < 6) errors.newPassword = 'Пароль должен быть не короче 6 символов';
  else if (newPassword === currentPassword) errors.newPassword = 'Новый пароль должен отличаться от текущего';

  if (!confirmPassword) errors.confirmPassword = 'Повторите новый пароль';
  else if (confirmPassword !== newPassword) errors.confirmPassword = 'Пароли не совпадают';

  return errors;
}


export function parseGames(str) {
  return str.split(',').map((s) => s.trim()).filter(Boolean);
}

export function validateZone(v) {
  const errors = {};

  const name = v.name.trim();
  if (name.length < 2) errors.name = 'Название: минимум 2 символа';
  else if (name.length > 60) errors.name = 'Название: не больше 60 символов';

  if (!['console', 'vr'].includes(v.type)) errors.type = 'Выберите тип зоны';

  const platform = v.platform.trim();
  if (!platform) errors.platform = 'Укажите платформу';
  else if (platform.length > 60) errors.platform = 'Не больше 60 символов';

  if (v.description.length > 500) errors.description = 'Не больше 500 символов';

  const url = v.imageUrl.trim();
  if (url && !/^https?:\/\/.+/i.test(url)) errors.imageUrl = 'Ссылка должна начинаться с http:// или https://';
  else if (url.length > 500) errors.imageUrl = 'Ссылка слишком длинная';

  const capacity = Number(v.capacity);
  if (v.capacity === '') errors.capacity = 'Укажите вместимость';
  else if (!Number.isInteger(capacity) || capacity < 1 || capacity > 20) {
    errors.capacity = 'Целое число от 1 до 20';
  }

  const price = Number(v.pricePerHour);
  if (v.pricePerHour === '') errors.pricePerHour = 'Укажите цену';
  else if (!Number.isFinite(price) || price < 0) errors.pricePerHour = 'Цена должна быть 0 или больше';

  if (parseGames(v.games).length > 20) errors.games = 'Не больше 20 игр';

  return errors;
}