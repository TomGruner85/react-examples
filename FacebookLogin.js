import FbLoginAPI from "@greatsumini/react-facebook-login";
import { FacebookLoginClient } from "@greatsumini/react-facebook-login";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useCookies } from "react-cookie";

import useFetch from "../../hooks/useFetch";
import { toString } from "../util/objectUtils";

import { loginWithFacebook } from "../util/libAPI";
import { login } from "../redux/slices/authSlice";
import LoadingSpinner from "../util/LoadingSpinner";

const FacebookLogin = (props) => {
  const {onError} = props
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [redirect, setRedirect] = useState(false);
  const [, setCookie] = useCookies(["user"]);
  const [user, setUser] = useState({});
  const {
    loading: fbLoading,
    error: fbError,
    data: fbData,
    sendRequest: sendFbLogin,
  } = useFetch(loginWithFacebook);
  const appId = process.env.REACT_APP_FACEBOOK_APP_ID;

  useEffect(() => {
    setTimeout(() => {
        FacebookLoginClient.getLoginStatus((res) => {
          if(res.status === "connected"){
            FacebookLoginClient.getProfile((res) => {
                // console.log(res);
            });
          }
        });
    }, 1000)
  }, []); 

  useEffect(() => {
    if (user.userToken && user.email) {
      sendFbLogin(user);
    }
  }, [user, sendFbLogin]);

  useEffect(() => {
    if (fbData) {
      const cookieSecure = process.env.REACT_APP_COOKIE_SECURE;
      const domain = process.env.REACT_APP_DOMAIN;

      const user = {
        firstName: fbData.user.firstName,
        lastName: fbData.user.lastName,
        email: fbData.user.email,
        token: fbData.token,
        expiresIn: fbData.expiresIn,
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
  }, [fbData, dispatch, navigate, redirect, setCookie]);

  useEffect(() => {
    if(fbError){
      onError(true)
    }
  }, [fbError, onError])

  const successHandler = (response) => {
    setUser((prevState) => {
      return {
        ...prevState,
        userToken: response.accessToken,
      };
    });
  };

  const profileSuccessHandler = (response) => {
    const firstName = response.name.split(" ")[0];
    const lastName = response.name.split(" ").at(-1);
    setUser((prevState) => {
      return {
        ...prevState,
        firstName,
        lastName,
        email: response.email,
      };
    });
    setRedirect(true)
  };

  const errorHandler = (error) => {
    onError(true)
  };

  if (fbLoading) {
    return <LoadingSpinner />;
  }

  return (
    <FbLoginAPI
      appId={appId}
      onSuccess={successHandler}
      onFail={errorHandler}
      onProfileSuccess={profileSuccessHandler}
      render={({ onClick }) => (
        <button
          type="button"
          className="signup__social-button signup__social-button--facebook"
          onClick={onClick}
        >
          Facebook
        </button>
      )}
    />
  );
};

export default FacebookLogin;
