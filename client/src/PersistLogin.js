import { useState } from 'react';
import useAuth from './setup/Hooks/useAuth';

function PersistLogin() {
  const { auth, setAuth } = useAuth()
  const data = window.localStorage.getItem('data')  
  if(!auth.userID && data){
    setAuth({ userID: data.u, token: data.t, role: data.r })
  }
}

export default PersistLogin;