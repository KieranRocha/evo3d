"use client";
// app/context/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChange, getUserProfile } from "../firebase/auth";

// Criar o contexto
export const AuthContext = createContext();

// Hook personalizado para usar o contexto
export const useAuth = () => useContext(AuthContext);

// Provedor do contexto
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Monitorar alterações no estado de autenticação
  useEffect(() => {
    const unsubscribe = onAuthStateChange(async (user) => {
      setUser(user);

      if (user) {
        try {
          // Carregar os dados do perfil do Firestore quando o usuário estiver autenticado
          const profileData = await getUserProfile(user.uid);
          setUserProfile(profileData);
        } catch (error) {
          console.error("Erro ao carregar perfil:", error);
        }
      } else {
        setUserProfile(null);
      }

      setLoading(false);
    });

    // Limpeza do observador quando o componente for desmontado
    return () => unsubscribe();
  }, []);

  // Verificar se o usuário está autenticado (para proteção de rotas)
  const isAuthenticated = !!user;

  // Redirecionamento para login se não estiver autenticado
  const requireAuth = (callback) => {
    if (!loading && !isAuthenticated) {
      router.push("/login");
      return false;
    }
    if (callback && typeof callback === "function") {
      return callback();
    }
    return true;
  };

  // Valor a ser fornecido pelo contexto
  const value = {
    user,
    userProfile,
    loading,
    isAuthenticated,
    requireAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
