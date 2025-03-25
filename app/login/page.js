"use client";
// app/login/page.js
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, AlertCircle, ArrowRight, Loader } from "lucide-react";
import { loginUser, resetPassword } from "../firebase/auth";

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetSent, setResetSent] = useState(false);
  const [loginError, setLoginError] = useState(null);

  const router = useRouter();

  // Função de manipulação de alterações nos campos do formulário
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Limpa o erro do campo quando o usuário começa a digitar
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: null,
      }));
    }
  };

  // Função de validação do formulário
  const validateForm = () => {
    const newErrors = {};

    // Validação de email
    if (!formData.email) {
      newErrors.email = "Email é obrigatório";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email inválido";
    }

    // Validação de senha
    if (!formData.password) {
      newErrors.password = "Senha é obrigatória";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Função para lidar com o envio do formulário
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoginError(null);

    if (!validateForm()) return;

    setLoading(true);

    try {
      await loginUser(formData.email, formData.password);
      // Redireciona para a página principal após o login bem-sucedido
      router.push("/");
    } catch (error) {
      console.error("Erro ao fazer login:", error);

      // Mapeia os códigos de erro do Firebase para mensagens amigáveis
      const errorMessage = getErrorMessage(error.code);
      setLoginError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Função para lidar com a solicitação de redefinição de senha
  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (!resetEmail) {
      setErrors({ resetEmail: "Digite seu email para redefinir a senha" });
      return;
    }

    if (!/\S+@\S+\.\S+/.test(resetEmail)) {
      setErrors({ resetEmail: "Email inválido" });
      return;
    }

    setLoading(true);

    try {
      await resetPassword(resetEmail);
      setResetSent(true);
    } catch (error) {
      console.error("Erro ao enviar email de redefinição:", error);
      setErrors({ resetEmail: getErrorMessage(error.code) });
    } finally {
      setLoading(false);
    }
  };

  // Função para mapear códigos de erro para mensagens amigáveis
  const getErrorMessage = (errorCode) => {
    switch (errorCode) {
      case "auth/user-not-found":
        return "Usuário não encontrado. Verifique seu email ou registre-se.";
      case "auth/wrong-password":
        return "Senha incorreta. Tente novamente ou redefina sua senha.";
      case "auth/invalid-email":
        return "Email inválido. Por favor, verifique o formato.";
      case "auth/user-disabled":
        return "Esta conta foi desativada. Entre em contato com o suporte.";
      case "auth/too-many-requests":
        return "Muitas tentativas malsucedidas. Tente novamente mais tarde.";
      case "auth/invalid-credential":
        return "Credenciais inválidas. Verifique seu email e senha.";
      default:
        return "Ocorreu um erro. Por favor, tente novamente.";
    }
  };

  // Renderização do formulário de redefinição de senha
  const renderForgotPasswordForm = () => (
    <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md mx-auto">
      <h2 className="text-2xl font-bold text-center text-secondary mb-6">
        Redefinir Senha
      </h2>

      {resetSent ? (
        <div className="text-center">
          <div className="bg-green-100 text-green-700 p-4 rounded-lg mb-4">
            Email de redefinição enviado! Verifique sua caixa de entrada.
          </div>
          <button
            onClick={() => {
              setShowForgotPassword(false);
              setResetSent(false);
              setResetEmail("");
            }}
            className="text-primary hover:underline"
          >
            Voltar para o login
          </button>
        </div>
      ) : (
        <form onSubmit={handleResetPassword}>
          <div className="mb-6">
            <label
              htmlFor="resetEmail"
              className="block text-gray-700 font-medium mb-2"
            >
              Seu Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail size={18} className="text-gray-500" />
              </div>
              <input
                type="email"
                id="resetEmail"
                name="resetEmail"
                value={resetEmail}
                onChange={(e) => {
                  setResetEmail(e.target.value);
                  if (errors.resetEmail) setErrors({});
                }}
                placeholder="seu.email@exemplo.com"
                className={`w-full pl-10 pr-3 py-2 rounded-lg border ${
                  errors.resetEmail ? "border-red-500" : "border-gray-300"
                } focus:outline-none focus:ring-2 focus:ring-primary`}
              />
            </div>
            {errors.resetEmail && (
              <div className="mt-1 text-red-500 text-sm flex items-center">
                <AlertCircle size={14} className="mr-1" />
                {errors.resetEmail}
              </div>
            )}
          </div>

          <div className="flex justify-between items-center mt-6">
            <button
              type="button"
              onClick={() => setShowForgotPassword(false)}
              className="text-gray-600 hover:text-gray-800"
            >
              Voltar ao login
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-primary text-white py-2 px-6 rounded-lg hover:bg-primary-hover transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-70 flex items-center"
            >
              {loading ? (
                <>
                  <Loader size={18} className="animate-spin mr-2" />
                  Enviando...
                </>
              ) : (
                <>
                  Enviar email
                  <ArrowRight size={18} className="ml-2" />
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );

  // Renderização do formulário de login
  const renderLoginForm = () => (
    <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md mx-auto">
      <h2 className="text-2xl font-bold text-center text-secondary mb-6">
        Entre na sua conta
      </h2>

      {loginError && (
        <div className="mb-4 bg-red-100 text-red-700 p-4 rounded-lg flex items-start">
          <AlertCircle size={18} className="mr-2 mt-0.5 flex-shrink-0" />
          <p>{loginError}</p>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label
            htmlFor="email"
            className="block text-gray-700 font-medium mb-2"
          >
            Email
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail size={18} className="text-gray-500" />
            </div>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="seu.email@exemplo.com"
              className={`w-full pl-10 pr-3 py-2 rounded-lg border ${
                errors.email ? "border-red-500" : "border-gray-300"
              } focus:outline-none focus:ring-2 focus:ring-primary`}
            />
          </div>
          {errors.email && (
            <div className="mt-1 text-red-500 text-sm flex items-center">
              <AlertCircle size={14} className="mr-1" />
              {errors.email}
            </div>
          )}
        </div>

        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <label htmlFor="password" className="text-gray-700 font-medium">
              Senha
            </label>
            <button
              type="button"
              onClick={() => setShowForgotPassword(true)}
              className="text-sm text-primary hover:underline"
            >
              Esqueceu a senha?
            </button>
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock size={18} className="text-gray-500" />
            </div>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="********"
              className={`w-full pl-10 pr-3 py-2 rounded-lg border ${
                errors.password ? "border-red-500" : "border-gray-300"
              } focus:outline-none focus:ring-2 focus:ring-primary`}
            />
          </div>
          {errors.password && (
            <div className="mt-1 text-red-500 text-sm flex items-center">
              <AlertCircle size={14} className="mr-1" />
              {errors.password}
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary text-white py-2 rounded-lg hover:bg-primary-hover transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-70 flex items-center justify-center"
        >
          {loading ? (
            <>
              <Loader size={18} className="animate-spin mr-2" />
              Entrando...
            </>
          ) : (
            "Entrar"
          )}
        </button>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Não tem uma conta?{" "}
            <Link
              href="/register"
              className="text-primary hover:underline font-medium"
            >
              Cadastre-se
            </Link>
          </p>
        </div>
      </form>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        {showForgotPassword ? renderForgotPasswordForm() : renderLoginForm()}
      </div>
    </div>
  );
}
