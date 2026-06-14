import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('blaq_user');
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        localStorage.removeItem('blaq_user');
        localStorage.removeItem('blaq_token');
      }
    }
    setLoading(false);
  }, []);

  const login = (userData) => {
    const { token, ...rest } = userData;
    localStorage.setItem('blaq_token', token);
    localStorage.setItem('blaq_user', JSON.stringify(rest));
    setUser(rest);
  };

  const updateUser = (userData) => {
    localStorage.setItem('blaq_user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('blaq_token');
    localStorage.removeItem('blaq_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
