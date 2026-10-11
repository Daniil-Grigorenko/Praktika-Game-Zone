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

  // Дата
  if (!values.date) errors.date = 'Выберите дату';
  else if (values.date < today) errors.date = 'Нельзя бронировать на прошедшую дату';

  // Время начала
  const start = Number(values.startHour);
  if (values.startHour === '') {
    errors.startHour = 'Выберите время начала';
  } else if (values.date === today && start <= new Date().getHours()) {
    errors.startHour = 'Это время уже прошло';
  } else if (busyHours.includes(start)) {
    errors.startHour = 'Этот час уже занят';
  }

  // Длительность
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

  // Гости
  const guests = Number(values.guests);
  if (values.guests === '') errors.guests = 'Укажите количество гостей';
  else if (!Number.isInteger(guests) || guests < 1) errors.guests = 'Минимум 1 гость';
  else if (guests > maxGuests) errors.guests = `Для этой зоны максимум ${maxGuests} чел.`;

  // Комментарий
  if (values.comment.length > 300) errors.comment = 'Не больше 300 символов';

  return errors;
}