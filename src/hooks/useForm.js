import { useState } from 'react';

export default function useForm(initialValues, validate) {
  const [values, setValues] = useState(initialValues);
  const [touched, setTouched] = useState({});

  const errors = validate(values);
  const isValid = Object.keys(errors).length === 0;

  function handleChange(e) {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  }

  function handleBlur(e) {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
  }

  function touchAll() {
    const all = {};
    Object.keys(initialValues).forEach((key) => { all[key] = true; });
    setTouched(all);
  }

  function reset() {
    setValues(initialValues);
    setTouched({});
  }

  const getError = (name) => (touched[name] ? errors[name] : '');

  return { values, setValues, isValid, handleChange, handleBlur, touchAll, reset, getError };
}