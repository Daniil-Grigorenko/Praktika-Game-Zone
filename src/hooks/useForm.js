import { useState } from 'react';

/**
 * initialValues — начальные значения полей
 * validate(values) — функция, возвращает объект ошибок вида { email: 'текст' }
 */
export default function useForm(initialValues, validate) {
  const [values, setValues] = useState(initialValues);
  const [touched, setTouched] = useState({});

  const errors = validate(values);
  const isValid = Object.keys(errors).length === 0;

  function handleChange(e) {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  }

  // ошибка показывается, только когда пользователь покинул поле
  function handleBlur(e) {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
  }

  // при отправке формы показываем ошибки во всех полях сразу
  function touchAll() {
    const all = {};
    Object.keys(initialValues).forEach((key) => { all[key] = true; });
    setTouched(all);
  }

  const getError = (name) => (touched[name] ? errors[name] : '');

  return { values, setValues, isValid, handleChange, handleBlur, touchAll, getError };
}