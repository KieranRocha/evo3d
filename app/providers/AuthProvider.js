"use client";
// app/providers/AuthProvider.js
import { AuthProvider } from "../context/AuthContext";

export function AuthProviderWrapper({ children }) {
  return <AuthProvider>{children}</AuthProvider>;
}
