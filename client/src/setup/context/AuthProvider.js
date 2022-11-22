import React, { useState, createContext } from 'react';

const AuthContext = createContext({})
export default AuthContext



export const AuthProvider = ({ children }) => {
  const data = JSON.parse(window.localStorage.getItem('data'))
  const user = window.localStorage.getItem('data') ? { userID: data.a, token: data.b, role: data.c } : {}

  const [auth, setAuth] = useState(user);

  return (
    <AuthContext.Provider value={{ auth, setAuth }}>
      {children}
    </AuthContext.Provider>
  )
}


