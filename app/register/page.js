"use client";
// app/register/page.js
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Mail,
  Lock,
  User,
  AlertCircle,
  Loader,
  CheckCircle,
  Eye,
  EyeOff,
  Calendar,
  Phone,
  ChevronLeft,
} from "lucide-react";
import { registerUser } from "../firebase/auth";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    birthdate: "",
    password: "",
    confirmPassword: "",
    acceptTerms: false,
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [registerError, setRegisterError] = useState(null);
  const [registerSuccess, setRegisterSuccess] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [passwordFeedback, setPasswordFeedback] = useState("");

  const router = useRouter();

  // Função para avaliar a força da senha
  useEffect(() => {
    if (!formData.password) {
      setPasswordStrength(0);
      setPasswordFeedback("");
      return;
    }

    let strength = 0;
    let feedback = [];

    // Tamanho da senha
    if (formData.password.length >= 8) {
      strength += 1;
    } else {
      feedback.push("A senha deve ter pelo menos 8 caracteres");
    }

    // Verifica se a senha contém letras maiúsculas
    if (/[A-Z]/.test(formData.password)) {
      strength += 1;
    } else {
      feedback.push("Inclua pelo menos uma letra maiúscula");
    }

    // Verifica se a senha contém letras minúsculas
    if (/[a-z]/.test(formData.password)) {
      strength += 1;
    } else {
      feedback.push("Inclua pelo menos uma letra minúscula");
    }

    // Verifica se a senha contém números
    if (/[0-9]/.test(formData.password)) {
      strength += 1;
    } else {
      feedback.push("Inclua pelo menos um número");
    }

    // Verifica se a senha contém caracteres especiais
    if (/[^A-Za-z0-9]/.test(formData.password)) {
      strength += 1;
    } else {
      feedback.push("Inclua pelo menos um caractere especial");
    }

    setPasswordStrength(strength);
    setPasswordFeedback(feedback.join(". "));
  }, [formData.password]);

  // Função de manipulação de alterações nos campos do formulário
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
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

    // Validação do nome
    if (!formData.name.trim()) {
      newErrors.name = "Nome é obrigatório";
    }

    // Validação de email
    if (!formData.email) {
      newErrors.email = "Email é obrigatório";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email inválido";
    }

    // Validação de telefone (opcional)
    if (formData.phone && !/^\(\d{2}\) \d{4,5}-\d{4}$/.test(formData.phone)) {
      newErrors.phone = "Formato inválido. Use (99) 99999-9999";
    }

    // Validação de data de nascimento (opcional)
    if (formData.birthdate) {
      const birthdate = new Date(formData.birthdate);
      const today = new Date();
      const age = today.getFullYear() - birthdate.getFullYear();

      if (isNaN(birthdate.getTime())) {
        newErrors.birthdate = "Data inválida";
      } else if (age < 18) {
        newErrors.birthdate = "Você deve ter pelo menos 18 anos";
      } else if (age > 120) {
        newErrors.birthdate = "Data de nascimento inválida";
      }
    }

    // Validação de senha
    if (!formData.password) {
      newErrors.password = "Senha é obrigatória";
    } else if (formData.password.length < 8) {
      newErrors.password = "A senha deve ter pelo menos 8 caracteres";
    } else if (passwordStrength < 3) {
      newErrors.password = "A senha é muito fraca";
    }

    // Validação de confirmação de senha
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Confirme sua senha";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "As senhas não coincidem";
    }

    // Validação dos termos
    if (!formData.acceptTerms) {
      newErrors.acceptTerms = "Você deve aceitar os termos e condições";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Função para lidar com o envio do formulário
  const handleSubmit = async (e) => {
    e.preventDefault();
    setRegisterError(null);

    if (!validateForm()) return;

    setLoading(true);

    try {
      await registerUser(
        formData.email,
        formData.password,
        formData.name,
        formData.phone || null,
        formData.birthdate || null
      );
      setRegisterSuccess(true);

      // Após 3 segundos, redireciona para a página de login
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    } catch (error) {
      console.error("Erro ao registrar:", error);

      // Mapeia os códigos de erro do Firebase para mensagens amigáveis
      const errorMessage = getErrorMessage(error.code);
      setRegisterError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Formatar telefone como (99) 99999-9999
  const formatPhone = (value) => {
    if (!value) return value;

    const phoneNumber = value.replace(/\D/g, "");

    if (phoneNumber.length <= 2) {
      return `(${phoneNumber}`;
    }
    if (phoneNumber.length <= 7) {
      return `(${phoneNumber.slice(0, 2)}) ${phoneNumber.slice(2)}`;
    }
    if (phoneNumber.length <= 11) {
      return `(${phoneNumber.slice(0, 2)}) ${phoneNumber.slice(
        2,
        7
      )}-${phoneNumber.slice(7)}`;
    }
    return `(${phoneNumber.slice(0, 2)}) ${phoneNumber.slice(
      2,
      7
    )}-${phoneNumber.slice(7, 11)}`;
  };

  const handlePhoneChange = (e) => {
    const formatted = formatPhone(e.target.value);
    setFormData((prev) => ({ ...prev, phone: formatted }));

    if (errors.phone) {
      setErrors((prev) => ({ ...prev, phone: null }));
    }
  };

  // Função para mapear códigos de erro para mensagens amigáveis
  const getErrorMessage = (errorCode) => {
    switch (errorCode) {
      case "auth/email-already-in-use":
        return "Este email já está em uso. Tente fazer login ou recuperar sua senha.";
      case "auth/invalid-email":
        return "Email inválido. Por favor, verifique o formato.";
      case "auth/weak-password":
        return "A senha é muito fraca. Use pelo menos 6 caracteres.";
      case "auth/operation-not-allowed":
        return "Operação não permitida. Entre em contato com o suporte.";
      case "auth/network-request-failed":
        return "Erro de rede. Verifique sua conexão com a internet.";
      default:
        return "Ocorreu um erro. Por favor, tente novamente.";
    }
  };

  // Caso o registro tenha sido bem-sucedido, mostra mensagem de sucesso
  if (registerSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md mx-auto text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-green-100 p-3 rounded-full">
              <CheckCircle size={40} className="text-green-600" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-secondary mb-2">
            Registro concluído com sucesso!
          </h2>
          <p className="text-gray-600 mb-6">
            Enviamos um email de verificação para {formData.email}.<br />
            Por favor, verifique sua caixa de entrada e confirme seu email.
          </p>
          <p className="text-gray-500">
            Você será redirecionado para a página de login em instantes...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-lg">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-center text-secondary">
              Crie sua conta
            </h2>
            <Link
              href="/"
              className="text-gray-500 hover:text-gray-700 flex items-center text-sm"
            >
              <ChevronLeft size={16} className="mr-1" />
              Voltar
            </Link>
          </div>

          {registerError && (
            <div className="mb-6 bg-red-100 text-red-700 p-4 rounded-lg flex items-start">
              <AlertCircle size={18} className="mr-2 mt-0.5 flex-shrink-0" />
              <p>{registerError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Nome */}
              <div className="md:col-span-2">
                <label
                  htmlFor="name"
                  className="block text-gray-700 font-medium mb-2"
                >
                  Nome completo <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User size={18} className="text-gray-500" />
                  </div>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Seu nome completo"
                    className={`w-full pl-10 pr-3 py-2 rounded-lg border ${
                      errors.name ? "border-red-500" : "border-gray-300"
                    } focus:outline-none focus:ring-2 focus:ring-primary`}
                  />
                </div>
                {errors.name && (
                  <div className="mt-1 text-red-500 text-sm flex items-center">
                    <AlertCircle size={14} className="mr-1" />
                    {errors.name}
                  </div>
                )}
              </div>

              {/* Email */}
              <div className="md:col-span-2">
                <label
                  htmlFor="email"
                  className="block text-gray-700 font-medium mb-2"
                >
                  Email <span className="text-red-500">*</span>
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

              {/* Telefone */}
              <div>
                <label
                  htmlFor="phone"
                  className="block text-gray-700 font-medium mb-2"
                >
                  Telefone{" "}
                  <span className="text-gray-500 text-sm font-normal">
                    (opcional)
                  </span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone size={18} className="text-gray-500" />
                  </div>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handlePhoneChange}
                    placeholder="(99) 99999-9999"
                    className={`w-full pl-10 pr-3 py-2 rounded-lg border ${
                      errors.phone ? "border-red-500" : "border-gray-300"
                    } focus:outline-none focus:ring-2 focus:ring-primary`}
                  />
                </div>
                {errors.phone && (
                  <div className="mt-1 text-red-500 text-sm flex items-center">
                    <AlertCircle size={14} className="mr-1" />
                    {errors.phone}
                  </div>
                )}
              </div>

              {/* Data de nascimento */}
              <div>
                <label
                  htmlFor="birthdate"
                  className="block text-gray-700 font-medium mb-2"
                >
                  Data de nascimento{" "}
                  <span className="text-gray-500 text-sm font-normal">
                    (opcional)
                  </span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar size={18} className="text-gray-500" />
                  </div>
                  <input
                    type="date"
                    id="birthdate"
                    name="birthdate"
                    value={formData.birthdate}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-3 py-2 rounded-lg border ${
                      errors.birthdate ? "border-red-500" : "border-gray-300"
                    } focus:outline-none focus:ring-2 focus:ring-primary`}
                  />
                </div>
                {errors.birthdate && (
                  <div className="mt-1 text-red-500 text-sm flex items-center">
                    <AlertCircle size={14} className="mr-1" />
                    {errors.birthdate}
                  </div>
                )}
              </div>

              {/* Senha */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-gray-700 font-medium mb-2"
                >
                  Senha <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock size={18} className="text-gray-500" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="********"
                    className={`w-full pl-10 pr-12 py-2 rounded-lg border ${
                      errors.password ? "border-red-500" : "border-gray-300"
                    } focus:outline-none focus:ring-2 focus:ring-primary`}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff size={18} className="text-gray-500" />
                    ) : (
                      <Eye size={18} className="text-gray-500" />
                    )}
                  </button>
                </div>
                {errors.password ? (
                  <div className="mt-1 text-red-500 text-sm flex items-center">
                    <AlertCircle size={14} className="mr-1" />
                    {errors.password}
                  </div>
                ) : formData.password ? (
                  <div className="mt-2">
                    <div className="flex items-center mb-1">
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div
                          className={`h-1.5 rounded-full ${
                            passwordStrength < 2
                              ? "bg-red-500"
                              : passwordStrength < 4
                              ? "bg-yellow-500"
                              : "bg-green-500"
                          }`}
                          style={{ width: `${(passwordStrength / 5) * 100}%` }}
                        ></div>
                      </div>
                      <span className="ml-2 text-xs text-gray-500">
                        {passwordStrength < 2
                          ? "Fraca"
                          : passwordStrength < 4
                          ? "Média"
                          : "Forte"}
                      </span>
                    </div>
                    {passwordFeedback && (
                      <p className="text-xs text-gray-500">
                        {passwordFeedback}
                      </p>
                    )}
                  </div>
                ) : null}
              </div>

              {/* Confirmar Senha */}
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-gray-700 font-medium mb-2"
                >
                  Confirmar senha <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock size={18} className="text-gray-500" />
                  </div>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="********"
                    className={`w-full pl-10 pr-12 py-2 rounded-lg border ${
                      errors.confirmPassword
                        ? "border-red-500"
                        : "border-gray-300"
                    } focus:outline-none focus:ring-2 focus:ring-primary`}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={18} className="text-gray-500" />
                    ) : (
                      <Eye size={18} className="text-gray-500" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <div className="mt-1 text-red-500 text-sm flex items-center">
                    <AlertCircle size={14} className="mr-1" />
                    {errors.confirmPassword}
                  </div>
                )}
              </div>

              {/* Termos e condições */}
              <div className="md:col-span-2 mt-2">
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="acceptTerms"
                      name="acceptTerms"
                      type="checkbox"
                      checked={formData.acceptTerms}
                      onChange={handleChange}
                      className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="acceptTerms" className="text-gray-700">
                      Eu concordo com os{" "}
                      <Link
                        href="/terms"
                        className="text-primary hover:underline"
                      >
                        termos e condições
                      </Link>{" "}
                      e com a{" "}
                      <Link
                        href="/privacy"
                        className="text-primary hover:underline"
                      >
                        política de privacidade
                      </Link>
                    </label>
                  </div>
                </div>
                {errors.acceptTerms && (
                  <div className="mt-1 text-red-500 text-sm flex items-center">
                    <AlertCircle size={14} className="mr-1" />
                    {errors.acceptTerms}
                  </div>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-6 bg-primary text-white py-2 rounded-lg hover:bg-primary-hover transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-70 flex items-center justify-center"
            >
              {loading ? (
                <>
                  <Loader size={18} className="animate-spin mr-2" />
                  Registrando...
                </>
              ) : (
                "Criar conta"
              )}
            </button>

            <div className="mt-6 text-center">
              <p className="text-gray-600">
                Já tem uma conta?{" "}
                <Link
                  href="/login"
                  className="text-primary hover:underline font-medium"
                >
                  Faça login
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
