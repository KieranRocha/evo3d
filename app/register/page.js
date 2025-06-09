"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Mail, User, Calendar, Phone, Loader } from "lucide-react";
import { registerUser } from "../firebase/auth";

// Importando componentes reutilizáveis
import AuthCard from "../components/auth/AuthCard";
import AuthHeader from "../components/auth/AuthHeader";
import AuthFooter from "../components/auth/AuthFooter";
import FormInput from "../components/auth/FormInput";
import PasswordInput from "../components/auth/PasswordInput";
import PasswordStrength from "../components/auth/PasswordStrength";
import TermsCheckbox from "../components/auth/TermsCheckbox";
import { Button } from "../components/ui/Button";

// Funções utilitárias
import { formatPhone } from "../utils/common";

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
  const [registerError, setRegisterError] = useState(null);
  const [registerSuccess, setRegisterSuccess] = useState(false);

  const router = useRouter();

  // Função para lidar com alterações nos campos do formulário
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: null,
      }));
    }
  };

  // Função de manipulação do telefone com formatação
  const handlePhoneChange = (e) => {
    const formatted = formatPhone(e.target.value);
    setFormData((prev) => ({ ...prev, phone: formatted }));

    if (errors.phone) {
      setErrors((prev) => ({ ...prev, phone: null }));
    }
  };

  // Função de validação do formulário
  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Nome é obrigatório";
    }

    if (!formData.email) {
      newErrors.email = "Email é obrigatório";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email inválido";
    }

    if (formData.phone && !/^\(\d{2}\) \d{4,5}-\d{4}$/.test(formData.phone)) {
      newErrors.phone = "Formato inválido. Use (99) 99999-9999";
    }

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

    if (!formData.password) {
      newErrors.password = "Senha é obrigatória";
    } else if (formData.password.length < 8) {
      newErrors.password = "A senha deve ter pelo menos 8 caracteres";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Confirme sua senha";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "As senhas não coincidem";
    }

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

      setTimeout(() => {
        router.push("/login");
      }, 3000);
    } catch (error) {
      console.error("Erro ao registrar:", error);

      const errorMessage = getErrorMessage(error.code);
      setRegisterError(errorMessage);
    } finally {
      setLoading(false);
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

  // Renderiza tela de sucesso após o registro
  if (registerSuccess) {
    return (
      <AuthCard title="Registro Concluído" showBackButton={false}>
        <div className="text-center py-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
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
      </AuthCard>
    );
  }

  return (
    <AuthCard title="Crie sua conta" maxWidth="lg">
      <AuthHeader error={registerError} />

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Nome */}
          <div className="md:col-span-2">
            <FormInput
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              placeholder="Seu nome completo"
              label="Nome completo"
              icon={<User />}
              error={errors.name}
              required
            />
          </div>

          {/* Email */}
          <div className="md:col-span-2">
            <FormInput
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="seu.email@exemplo.com"
              label="Email"
              icon={<Mail />}
              error={errors.email}
              required
              autoComplete="email"
            />
          </div>

          {/* Telefone */}
          <div>
            <FormInput
              id="phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handlePhoneChange}
              placeholder="(99) 99999-9999"
              label="Telefone"
              labelExtra={
                <span className="text-gray-500 text-sm font-normal ml-1">
                  (opcional)
                </span>
              }
              icon={<Phone />}
              error={errors.phone}
              autoComplete="tel"
            />
          </div>

          {/* Data de nascimento */}
          <div>
            <FormInput
              id="birthdate"
              name="birthdate"
              type="date"
              value={formData.birthdate}
              onChange={handleChange}
              label="Data de nascimento"
              labelExtra={
                <span className="text-gray-500 text-sm font-normal ml-1">
                  (opcional)
                </span>
              }
              icon={<Calendar />}
              error={errors.birthdate}
            />
          </div>

          {/* Senha */}
          <div>
            <PasswordInput
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              label="Senha"
              error={errors.password}
              required
            />
            <PasswordStrength password={formData.password} />
          </div>

          {/* Confirmar Senha */}
          <div>
            <PasswordInput
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              label="Confirmar senha"
              error={errors.confirmPassword}
              required
            />
          </div>
        </div>

        {/* Termos e condições */}
        <TermsCheckbox
          checked={formData.acceptTerms}
          onChange={handleChange}
          error={errors.acceptTerms}
        />

        <Button
          type="submit"
          variant="primary"
          fullWidth
          size="lg"
          isLoading={loading}
          className="mt-6"
        >
          {loading ? "Registrando..." : "Criar conta"}
        </Button>
      </form>

      <AuthFooter
        text="Já tem uma conta?"
        linkText="Faça login"
        linkUrl="/login"
      />
    </AuthCard>
  );
}
