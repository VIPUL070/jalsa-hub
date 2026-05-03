import { createContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import api from "../utils/axios";
import type { AxiosError } from "axios";

export interface User {
  name?: string;
  email?: string;
  password?: string;
  otp?: string;
  token?: string;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  register: (userData: User) => Promise<User>;
  login: (userData: User) => Promise<User>;
  logout: () => void;
  verifyOtp: (userData: User) => Promise<User>;
}

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Error parsing user", error);
        localStorage.removeItem("user");
      }
    }
    setLoading(false);
  }, []);

  const handleError = (error: unknown, fallback: string): never => {
    const axiosErr = error as AxiosError<{ message?: string }>;
    throw new Error(axiosErr.response?.data?.message || fallback);
  };

  const register = async ({ name, email, password }: User) => {
    try {
      const { data } = await api.post('/auth/register', { name, email, password });
      return data;
    } catch (error) {
      handleError(error, 'Registration failed');
    }
  };

  const login = async ({ email, password }: User) => {
    try {
      const { data } = await api.post('/auth/login', { email, password });
      setUser(data);
      localStorage.setItem('user', JSON.stringify(data));
      if (data?.token) localStorage.setItem('token', data.token);
      return data;
    } catch (error) {
      handleError(error, 'Login failed');
    }
  };

  const verifyOtp = async ({email,otp}: User) => {
    try {
      const { data } = await api.post('/auth/verify', { email,otp });
      setUser(data);
      localStorage.setItem('user', JSON.stringify(data));
      if (data?.token) localStorage.setItem('token', data.token);
      return data;
    } catch (error) {
      handleError(error, 'Verify failed');
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ user, loading, register, login, logout, verifyOtp }}>
      {children}
    </AuthContext.Provider>
  );
};