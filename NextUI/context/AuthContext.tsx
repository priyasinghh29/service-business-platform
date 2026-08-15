"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { apiClient } from "@/lib/api-client";

export interface User {
  id: number;
  first_name: string;
  last_name?: string;
  email_id: string;
  phone_number?: string;
  address?: string | null;
  profile_pic?: string | null;
  status?: boolean;
  role?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

/** Laravel returns { success, message, data: { user, token } } */
function extractAuthPayload(responseData: Record<string, unknown>): {
  user: User;
  token: string;
} {
  const nested = responseData?.data as Record<string, unknown> | undefined;
  const user = (nested?.user ?? responseData?.user) as User | undefined;
  const token = (nested?.token ?? responseData?.token) as string | undefined;

  if (!user || !token) {
    throw new Error("Invalid auth response from server");
  }

  return { user, token };
}

function readStoredUser(): User | null {
  if (typeof window === "undefined") return null;
  const storedUser = localStorage.getItem("user");
  if (!storedUser || storedUser === "undefined" || storedUser === "null") {
    return null;
  }
  try {
    return JSON.parse(storedUser) as User;
  } catch {
    return null;
  }
}

function readStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  const token = localStorage.getItem("token");
  if (!token || token === "undefined" || token === "null") return null;
  return token;
}

function getErrorMessage(error: unknown, fallback: string): string {
  const err = error as {
    response?: { data?: { message?: string; errors?: Record<string, string[]> } };
    message?: string;
  };

  const errors = err.response?.data?.errors;
  if (errors) {
    const first = Object.values(errors).flat()[0];
    if (first) return first;
  }

  return err.response?.data?.message || err.message || fallback;
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const hydrate = async () => {
      const storedUser = readStoredUser();
      const token = readStoredToken();

      if (storedUser) {
        setUser(storedUser);
      }

      // Only hit the network when we have a token but no cached user profile.
      if (token && !storedUser && !cancelled) {
        try {
          const response = await apiClient.get("/me");
          const payload = response.data?.data ?? response.data;
          const me = (payload?.user ?? payload) as User | undefined;
          if (me?.id && !cancelled) {
            localStorage.setItem("user", JSON.stringify(me));
            setUser(me);
          }
        } catch {
          if (!readStoredToken() && !cancelled) {
            setUser(null);
          }
        }
      } else if (!token && !cancelled) {
        localStorage.removeItem("user");
        setUser(null);
      }

      if (!cancelled) setIsLoading(false);
    };

    void hydrate();

    const handleSessionExpired = () => {
      setUser(null);
      setIsLoading(false);
    };
    window.addEventListener("auth:session-expired", handleSessionExpired);

    return () => {
      cancelled = true;
      window.removeEventListener("auth:session-expired", handleSessionExpired);
    };
  }, []);

  const persistSession = (userData: User, token: string) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await apiClient.post("/login", {
        email_id: email,
        password,
      });

      const { user: userData, token } = extractAuthPayload(response.data);
      persistSession(userData, token);
    } catch (error) {
      throw new Error(getErrorMessage(error, "Invalid email or password"));
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await apiClient.post("/register", {
        first_name: name,
        email_id: email,
        password,
        password_confirmation: password,
        role: "customer",
      });

      const { user: userData, token } = extractAuthPayload(response.data);
      persistSession(userData, token);
    } catch (error) {
      throw new Error(getErrorMessage(error, "Registration failed. Please try again."));
    } finally {
      setIsLoading(false);
    }
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));
  };

  const logout = async () => {
    try {
      await apiClient.post("/logout");
    } catch {
      // clear local session even if API call fails
    } finally {
      setUser(null);
      localStorage.removeItem("user");
      localStorage.removeItem("token");
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, login, register, logout, updateUser, isLoading }}
    >
      {children}
    </AuthContext.Provider>
  );
};
