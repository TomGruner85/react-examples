import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import { isAuthenticated } from "../components/redux/slices/authSlice";

const ProtectedRoute = (props) => {
  const authenticated = useSelector(isAuthenticated);
  const navigate = useNavigate();

  useEffect(() => {
    if (!authenticated) {
        return navigate("/profile");
    }
  }, [navigate, authenticated]);

  if(authenticated){
    return props.children;
  }
};

export default ProtectedRoute;
