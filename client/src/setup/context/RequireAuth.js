import React from 'react';
import { useLocation, Navigate, Outlet } from "react-router-dom";
import useAuth from "../Hooks/useAuth";

function RequireAuth({ allowedRole }) {
  const { auth } = useAuth()
  const location = useLocation()

  return ( 
    allowedRole.find(role => role === auth.role)  
      ? <Outlet /> 
      : auth.userID 
        ? <Navigate to='/unauthorized' state={{ from: location }} replace />
        : <Navigate to='/' state={{ from: location }} replace />
   );
}

export default RequireAuth;