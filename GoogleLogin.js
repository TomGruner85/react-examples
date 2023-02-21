import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useCookies } from "react-cookie";
import { useNavigate } from "react-router-dom";

import { useGoogleLogin } from "@react-oauth/google";

import { getGoogleProfile } from "../util/libAPI";
import useFetch from "../../hooks/useFetch";
import { toString } from "../util/objectUtils";
import { login as reduxLogin } from "../redux/slices/authSlice";

const Google_Login = (props) => {
  const {onError} = props
  const [googleAccessToken, setGoogleAccessToken] = useState(null);
  const [redirect, setRedirect] = useState(null)

  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [, setCookie] = useCookies(["user"]);

  const {
    loading: googleLoginLoading,
    error: googleLoginError,
    data: googleLoginData,
    sendRequest: googleLogin,
  } = useFetch(getGoogleProfile);

  useEffect(() => {
    if (googleAccessToken) {
      googleLogin(googleAccessToken);
    }
  }, [googleAccessToken, googleLogin]);

  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setRedirect(true)
      return setGoogleAccessToken(tokenResponse.access_token);
    },
  });

  useEffect(() => {
    if (googleLoginData && !googleLoginLoading && !googleLoginError) {
      const cookieSecure = process.env.REACT_APP_COOKIE_SECURE;
      const domain = process.env.REACT_APP_DOMAIN;

      const user = {
        firstName: googleLoginData.user.firstName,
        lastName: googleLoginData.user.lastName,
        email: googleLoginData.user.email,
        token: googleLoginData.token,
        expiresIn: googleLoginData.expiresIn,
      };

      dispatch(reduxLogin(user)); 

      if (cookieSecure) {
        setCookie(
          "user",
          `${toString(user)}`,
          {path: "/",
          maxAge: user.expiresIn,
          domain,
          secure: true,
          sameSite: "Lax"}
        );
      } else {
        setCookie(
          "user",
          `${toString(user)}`,
          {path: "/",
          maxAge: user.expiresIn,
          domain,
          sameSite: "Lax"}
        );
      }
      if (redirect) {
        navigate("/garage");
      }
    }
  }, [googleLoginData, googleLoginLoading, googleLoginError, dispatch, login, navigate, redirect, setCookie]);

  useEffect(() => {
    if(googleLoginError){
      onError(true)
    }
  }, [googleLoginError, onError])

  return (
    <button
      type="button"
      className="signup__social-button signup__social-button--google"
      id="googleLoginBtn"
      onClick={login}
    >
      <img
        src="img/google-g.png"
        alt=""
        className="signup__social-button--google-img"
      />
      <span className="signup__social-button--google-text">Google</span>
    </button>
  );
};

export default Google_Login;
