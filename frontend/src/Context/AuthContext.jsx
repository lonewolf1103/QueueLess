import { createContext, useEffect, useState } from "react";
import { getCurrentUser, logoutCurrentUser } from "../Services/auth";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    const fetchCurrentUser = async () => {

      try {
        const response = await getCurrentUser();
        setUser(response.data.user);

      } catch (error) {
        setUser(null);

      } finally {
        setLoading(false);
      }

    };
    
    fetchCurrentUser();
  }, []);

  const logout = async () => {

    try{
      await logoutCurrentUser()
    }
    finally{
      setUser(null)
    }

  };

  const login = (userData)=>{
      setUser(userData)
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout, login }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
