import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useCookies } from "react-cookie";
import validator from "validator";
import { HelpCircle } from "react-feather";

import LoadingSpinner from "../util/LoadingSpinner";

import useInputValidator from "../../hooks/useInputValidator";
import useFetch from "../../hooks/useFetch";

import { userLogin, userSignup, resendActivationEmail } from "../util/libAPI";
import { toString } from "../util/objectUtils";

import { login } from "../redux/slices/authSlice";

const SignupLoginForm = (props) => {
  const [formHasError, setFormHasError] = useState(false);
  const [loginError, setLoginError] = useState(false);
  const [termsInputClasses, setTermsInputClasses] =
    useState("form__block-label");
  const [duplicateEmailError, setDuplicateEmailError] = useState(false);
  const [activationKey, setActivationKey] = useState(null)
  const [, setCookie] = useCookies(["user"]);
  const domain = process.env.REACT_APP_DOMAIN;
  const cookieSecure = process.env.REACT_APP_COOKIE_SECURE;
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const firstNameRef = useRef();
  const lastNameRef = useRef();
  const emailRef = useRef();
  const passwordRef = useRef();
  const newsletterRef = useRef();
  const termsRef = useRef();

  const {
    inputClasses: firstNameInputClasses,
    labelClasses: firstNameLabelClasses,
    blurHandler: firstNameInputBlurHandler,
  } = useInputValidator({ validateData: (value) => value.trim() !== "" });
  const {
    inputClasses: lastNameInputClasses,
    labelClasses: lastNameLabelClasses,
    blurHandler: lastNameInputBlurHandler,
  } = useInputValidator({ validateData: (value) => value.trim() !== "" });
  const {
    inputIsValid: emailInputIsValid,
    inputHasError: emailInputHasError,
    inputClasses: emailInputClasses,
    labelClasses: emailLabelClasses,
    blurHandler: emailInputBlurHandler,
    changeHandler: emailInputChangeHandler,
  } = useInputValidator({ validateData: (value) => validator.isEmail(value) });
  const {
    inputIsValid: passwordInputIsValid,
    inputHasError: passwordInputHasError,
    inputClasses: passwordInputClasses,
    labelClasses: passwordLabelClasses,
    blurHandler: passwordInputBlurHandler,
    changeHandler: passwordInputChangeHandler,
  } = useInputValidator({
    validateData: (value) =>
      validator.isStrongPassword(value, { minSymbols: 0, minLength: 10 }),
  });
  const { data, loading, error, sendRequest } = useFetch(userLogin);
  const {
    data: signupData,
    loading: signupLoading,
    error: signupError,
    sendRequest: sendSignupRequest,
  } = useFetch(userSignup);
  const {data: resendData, loading: resendLoading, error: resendError, sendRequest: resendEmail} = useFetch(resendActivationEmail)

  useEffect(() => {
    if (data && !error && !loading) {
      const userObject = {
        firstName: data.user.firstName,
        lastName: data.user.lastName,
        email: data.user.email,
        token: data.token,
        expiresIn: data.expiresIn,
      };
      setLoginError(null);
      dispatch(login(userObject));
      if (cookieSecure) {
        setCookie(
          "user",
          `${toString(userObject)}`,
          {path: "/",
          maxAge: data.expiresIn,
          domain,
          secure: true,
          sameSite: "Lax"}
        );
      } else {
        setCookie(
          "user",
          `${toString(userObject)}`,
          {path: "/",
          maxAge: data.expiresIn,
          domain,
          sameSite: "Lax"}
        );
      }
      navigate("/garage");
    }
    if (error) {
      if (error.message.includes("Invalid credentials")) {
        return setLoginError("Invalid email address or password.");
      }
      if (error.message.includes("Account not activated")){
        setActivationKey(error.message.split(".")[1])
        return setLoginError("Please activate your account first.")
      }
    }
  }, [
    data,
    error,
    loading,
    dispatch,
    navigate,
    domain,
    setCookie,
    cookieSecure,
  ]);

  useEffect(() => {
    if (signupError?.toString().includes("E11000 duplicate key error")) {
      setDuplicateEmailError(true);
    }
  }, [signupError]);

  const emailChangeHandler = (event) => {
    emailInputChangeHandler(event);
    if (duplicateEmailError) {
      setDuplicateEmailError(false);
    }
  };

  const triggerVal = () => {
    firstNameRef.current?.focus();
    firstNameRef.current?.blur();

    lastNameRef.current?.focus();
    lastNameRef.current?.blur();

    emailRef.current?.focus();
    emailRef.current?.blur();

    passwordRef.current?.focus();
    passwordRef.current?.blur();
  };

  const resendEmailHandler = () => {
    resendEmail(activationKey)
  }

  const regLogSubmitHandler = (event) => {
    event.preventDefault();

    triggerVal();
      let newsletter = false;
      let terms = false;
      let formIsValid = false;

      if (props.signup) {
        newsletter = newsletterRef.current.checked;
        terms = termsRef.current.checked;
        if (!terms) {
          setTermsInputClasses("form__block-label form__block-label--invalid");
        } else {
          setTermsInputClasses("form__block-label");
        }
        formIsValid =
          firstNameRef.current.value.trim() !== '' &&
          lastNameRef.current.value.trim() !== '' &&
          validator.isEmail(emailRef.current.value) &&
          validator.isStrongPassword(passwordRef.current.value, { minSymbols: 0, minLength: 10 }) &&
          terms;
      } else {
        formIsValid = emailInputIsValid && passwordInputIsValid;
      }

      if (!formIsValid) {
        setFormHasError(true);
        return;
      }

      setFormHasError(false);
      setTermsInputClasses("form__block-label");

      const userObject = {
        firstName: firstNameRef.current?.value,
        lastName: lastNameRef.current?.value,
        email: emailRef.current.value,
        password: passwordRef.current.value,
        terms,
        newsletter,
      };

      if (props.signup) {
        sendSignupRequest(userObject);
      } else {
        sendRequest(userObject);
      }
  };

  let form = "";
  const btnText = props.signup ? "Sign Up" : "Login";

  form =
    (props.signup && signupData !== "success") || !props.signup ? (
      <form className="form" onSubmit={regLogSubmitHandler}>
        {formHasError && (
          <p className="form__error-msg">
            Please fill out the required fields.
          </p>
        )}
        {loginError && (
          <p className="form__error-msg u-margin-bottom-small">
            {loginError}
          </p>
        )}
        {props.signup && (
          <div className="form__group">
            <input
              type="text"
              id="firstName"
              className={firstNameInputClasses}
              placeholder="&nbsp;"
              ref={firstNameRef}
              onBlur={firstNameInputBlurHandler}
              tabIndex={1}
            />
            <label htmlFor="firstName" className={firstNameLabelClasses}>
              First Name
            </label>
          </div>
        )}
        {props.signup && (
          <div className="form__group">
            <input
              type="text"
              id="lastName"
              className={lastNameInputClasses}
              placeholder="&nbsp;"
              ref={lastNameRef}
              onBlur={lastNameInputBlurHandler}
              tabIndex={2}
            />
            <label htmlFor="lastName" className={lastNameLabelClasses}>
              Last Name
            </label>
          </div>
        )}
        <div className="form__group">
          <input
            type="email"
            id="email"
            className={emailInputClasses}
            placeholder="&nbsp;"
            ref={emailRef}
            onBlur={emailInputBlurHandler}
            onChange={emailChangeHandler}
            tabIndex={3}
          />
          <label htmlFor="email" className={emailLabelClasses}>
            Email Address
          </label>
          {emailInputHasError && props.signup && (
            <div className="form__label--invalid form__email-error">
              Entered email address is invalid.
            </div>
          )}
          {duplicateEmailError && !emailInputHasError && (
            <div className="form__label--invalid form__email-error">
              Email address is already registered.
            </div>
          )}
        </div>
        <div className="form__group">
          <input
            type="password"
            id="password"
            className={passwordInputClasses}
            placeholder="&nbsp;"
            ref={passwordRef}
            onBlur={passwordInputBlurHandler}
            onChange={passwordInputChangeHandler}
            tabIndex={4}
          />
          <label htmlFor="password" className={passwordLabelClasses}>
            Password
          </label>
          {passwordInputHasError && props.signup && (
            <div className="form__label--invalid form__password-error">
              <span>Password is too weak.</span>
              <span className="form__password-hint-hover">
                <HelpCircle />
              </span>
              <ul className="form__password-hint">
                <li>Min. 10 characters long</li>
                <li>Min. 1 uppercase letter</li>
                <li>Min. 1 lowercase letter</li>
                <li>Min. 1 number</li>
              </ul>
            </div>
          )}
        </div>

        {props.signup && (
          <div className="form__group">
            <input
              type="checkbox"
              id="newsletter"
              className="signup__checkbox"
              ref={newsletterRef}
            ></input>
            <label htmlFor="newsletter" className="form__block-label">
              <span className="form__custom-checkbox" /> Newsletter
            </label>
            <input
              type="checkbox"
              id="terms"
              className="signup__checkbox"
              ref={termsRef}
            ></input>
            <label htmlFor="terms" className={termsInputClasses}>
              <span
                className={
                  termsInputClasses.includes("--invalid")
                    ? "form__custom-checkbox form__custom-checkbox--invalid"
                    : "form__custom-checkbox"
                }
              />{" "}
              Terms
            </label>
          </div>
        )}
        <div className="form__group">
          {resendData ? <p>Activation email sent successfully.</p> : ((loginError === "Please activate your account first.") && !props.signup) ? <button type="button" onClick={resendEmailHandler} className="btn btn--primary">{resendLoading ? "Sending..." : "Resend Email"}</button> : <button type="submit" className="btn btn--primary" disabled={loading || duplicateEmailError}>
            {loading ? "Loading..." : btnText}
          </button>}
          {resendError && <p className="form__label--invalid">An error occured. Please try again later.</p>}
        </div>
      </form>
    ) : props.signup && signupData ? (
      <div className="signup__success">
        <h3>Thank you for signin up!</h3>
        <p>
          <strong>Please activate your new account.</strong>
        </p>
        <p>We sent you an email to your email address.</p>
        <p>Please click the link in our email to activate your new account.</p>
      </div>
    ) : props.signup && !signupData && signupLoading ? (
      <LoadingSpinner />
    ) : (
      ""
    );

  return form;
};

export default SignupLoginForm;