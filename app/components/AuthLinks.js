"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, LogOut, Package, Settings, Loader } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { logoutUser } from "../firebase/auth";

export default function AuthLinks() {
  const { user, isAuthenticated, loading } = useAuth();
  const [showMenu, setShowMenu] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    setLoggingOut(true);

    try {
      await logoutUser();
      router.push("/");
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    } finally {
      setLoggingOut(false);
      setShowMenu(false);
    }
  };

  if (loading) {
    return (
      <div className="w-8 h-8 flex items-center justify-center">
        <Loader size={18} className="animate-spin text-gray-500" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <>
        <Link
          href="/login"
          className="px-3 py-2 rounded-md font-medium text-gray-900 hover:bg-gray-100 transition"
        >
          Entrar
        </Link>
        <Link
          href="/register"
          className="px-3 py-2 rounded-md font-medium transition bg-primary text-white hover:opacity-90"
        >
          Cadastrar
        </Link>
      </>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="flex items-center space-x-1 px-3 py-2 rounded-md font-medium text-gray-900 hover:bg-gray-100 transition"
      >
        <User size={18} />
        <span className="hidden md:block ml-1 max-w-[100px] truncate">
          {user?.displayName || "Usuário"}
        </span>
      </button>

      {/* Menu dropdown */}
      {showMenu && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 border">
          <div className="px-4 py-2 border-b border-gray-100">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user?.displayName || "Usuário"}
            </p>
            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
          </div>

          <Link
            href="/profile"
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors w-full text-left flex items-center"
            onClick={() => setShowMenu(false)}
          >
            <User size={16} className="mr-2" />
            Meu Perfil
          </Link>

          <Link
            href="/orders"
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors w-full text-left flex items-center"
            onClick={() => setShowMenu(false)}
          >
            <Package size={16} className="mr-2" />
            Meus Pedidos
          </Link>

          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="block px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors w-full text-left flex items-center"
          >
            {loggingOut ? (
              <>
                <Loader size={16} className="animate-spin mr-2" />
                Saindo...
              </>
            ) : (
              <>
                <LogOut size={16} className="mr-2" />
                Sair
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
