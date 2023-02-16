import { useEffect, useState } from "react";

const useInputValidator = ({ validateData, startValue }) => {
  const [input, setInput] = useState("");
  const [blur, setBlur] = useState(false);

  useEffect(() => {
    if (startValue) {
      setInput(startValue);
    }
  }, [startValue]);

  const inputIsValid = validateData(input);
  const inputHasError = !inputIsValid && blur;
  const inputClasses = inputHasError
    ? "form__input form__input--invalid"
    : "form__input";
  const labelClasses = inputHasError
    ? "form__label form__label--invalid"
    : "form__label";

  const changeHandler = ({ target }) => {
    if (target) {
      setInput(target.value);
    }
  };

  const blurHandler = ({ target }) => {
    if (target) {
      setInput(target.value);
      setBlur(true);
    }
  };

  const resetHandler = () => {
    setInput("")
    setBlur(false)
  }

  return {
    input,
    inputIsValid,
    inputHasError,
    inputClasses,
    labelClasses,
    blurHandler,
    changeHandler,
    resetHandler
  };
};

export default useInputValidator;
