import { useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useCookies } from "react-cookie";
import { useNavigate } from "react-router-dom";

import { gapi, loadAuth2 } from "gapi-script";

import useFetch from "../../hooks/useFetch";
import { toString } from "../util/objectUtils";

import { loginWithGoogle } from "../util/libAPI";
import { login } from "../redux/slices/authSlice";

const GoogleLogin = (props) => {
  const {onError} = props;
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [redirect, setRedirect] = useState(false);

  const [, setCookie] = useCookies(["user"]);

  const {
    data: googleLoginData,
    loading: googleLoginLoading,
    error: googleLoginError,
    sendRequest: googleLogin,
  } = useFetch(loginWithGoogle);

  const loginUser = useCallback(
    (currentUser) => {
      const googleIdToken = currentUser.getAuthResponse().id_token;
      googleLogin(googleIdToken);
    },
    [googleLogin]
  );

  const attachSignin = useCallback(
    (element, auth2) => {
      auth2.attachClickHandler(
        element,
        {},
        (googleUser) => {
          loginUser(googleUser);
          setRedirect(true);
        },
        (error) => {
          console.log(JSON.stringify(error));
        }
      );
    },
    [loginUser]
  );

  useEffect(() => {
    const setAuth2 = async () => {
      const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;
      const auth2 = await loadAuth2(gapi, clientId, "");
      if (auth2.isSignedIn.get()) {
        loginUser(auth2.currentUser.get());
      } else {
        attachSignin(document.getElementById("googleLoginBtn"), auth2);
      }
    };
    setAuth2();
  }, [attachSignin, loginUser]);

  useEffect(() => {
    if (googleLoginData) {
      const cookieSecure = process.env.REACT_APP_COOKIE_SECURE;
      const domain = process.env.REACT_APP_DOMAIN;

      const user = {
        firstName: googleLoginData.user.firstName,
        lastName: googleLoginData.user.lastName,
        email: googleLoginData.user.email,
        token: googleLoginData.token,
        expiresIn: googleLoginData.expiresIn,
      };

      dispatch(login(user));

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
  }, [googleLoginData, redirect, dispatch, navigate, setCookie]);

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
        disabled={googleLoginLoading}
      >
        <img
          src="img/google-g.png"
          alt=""
          className="signup__social-button--google-img"
        />
        <span className="signup__social-button--google-text">
          {googleLoginLoading ? "Loading..." : "Google"}
        </span>
      </button>
  );
};

export default GoogleLogin;
