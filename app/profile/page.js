"use client";
// app/profile/page.js
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  User,
  Mail,
  MapPin,
  Phone,
  Edit,
  Plus,
  Trash2,
  LogOut,
  Loader,
  Save,
  X,
  ChevronLeft,
  Package,
  Calendar,
  CheckCircle,
  AlertTriangle,
  Camera,
  Heart,
  ExternalLink,
  Settings,
  ShoppingBag,
  Clock,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import {
  updateUserProfile,
  addUserAddress,
  deleteUserAddress,
  setDefaultAddress,
  logoutUser,
  updateUserAvatar,
} from "../firebase/auth";
import ProtectedRoute from "../components/ProtectedRoute";

export default function ProfilePage() {
  const { user, userProfile, loading, isAuthenticated } = useAuth();
  const router = useRouter();

  // Estados para gerenciar tabs
  const [activeTab, setActiveTab] = useState("personal");

  // Estados para dados do perfil
  const [profileData, setProfileData] = useState({
    displayName: "",
    email: "",
    phone: "",
    birthdate: "",
    cpf: "",
  });

  // Estados para edição de perfil
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileError, setProfileError] = useState(null);
  const [profileSuccess, setProfileSuccess] = useState(null);

  // Estados para endereços
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [newAddress, setNewAddress] = useState({
    street: "",
    number: "",
    complement: "",
    neighborhood: "",
    city: "",
    state: "",
    zipCode: "",
  });
  const [addressError, setAddressError] = useState(null);
  const [addressSuccess, setAddressSuccess] = useState(null);
  const [savingAddress, setSavingAddress] = useState(false);
  const [deletingAddress, setDeletingAddress] = useState(null);
  const [settingDefaultAddress, setSettingDefaultAddress] = useState(null);

  // Estados para carregamento de avatar
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarError, setAvatarError] = useState(null);

  // Estado para logout
  const [loggingOut, setLoggingOut] = useState(false);

  // Estado para pedidos recentes
  const [recentOrders, setRecentOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  // Carregar dados do perfil quando disponíveis
  useEffect(() => {
    if (userProfile && !isEditingProfile) {
      setProfileData({
        displayName: userProfile.displayName || "",
        email: userProfile.email || "",
        phone: userProfile.phone || "",
        birthdate: userProfile.birthdate || "",
        cpf: userProfile.cpf || "",
      });
    }
  }, [userProfile, isEditingProfile]);

  // Buscar pedidos recentes
  useEffect(() => {
    if (user) {
      // Simulação de pedidos recentes - em produção, isso viria do Firestore
      setTimeout(() => {
        setRecentOrders([
          {
            id: "ORD123456",
            date: new Date(2024, 2, 15),
            status: "delivered",
            items: 3,
            total: 287.5,
          },
          {
            id: "ORD123123",
            date: new Date(2024, 2, 1),
            status: "processing",
            items: 1,
            total: 129.9,
          },
        ]);
        setOrdersLoading(false);
      }, 1000);
    }
  }, [user]);

  // Função para lidar com mudanças nos campos do formulário de perfil
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Função para lidar com mudanças nos campos do formulário de endereço
  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setNewAddress((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Função para formatar telefone
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
    setProfileData((prev) => ({ ...prev, phone: formatted }));
  };

  // Função para manipular o upload de avatar
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);

      // Criar preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Função para fazer upload do avatar
  const handleAvatarUpload = async () => {
    if (!avatarFile || !user) return;

    setUploadingAvatar(true);
    setAvatarError(null);

    try {
      await updateUserAvatar(user.uid, avatarFile);

      // Limpar estado após upload bem-sucedido
      setAvatarFile(null);
      showSuccessMessage("Avatar atualizado com sucesso!");
    } catch (error) {
      console.error("Erro ao atualizar avatar:", error);
      setAvatarError("Não foi possível atualizar o avatar. Tente novamente.");
    } finally {
      setUploadingAvatar(false);
    }
  };

  // Função para cancelar upload de avatar
  const cancelAvatarUpload = () => {
    setAvatarFile(null);
    setAvatarPreview(null);
  };

  // Função para salvar perfil
  const handleSaveProfile = async () => {
    if (!user) return;

    setSavingProfile(true);
    setProfileError(null);
    setProfileSuccess(null);

    try {
      // Verifica quais campos foram alterados
      const updates = {};

      if (profileData.displayName !== userProfile.displayName) {
        updates.displayName = profileData.displayName;
      }

      if (profileData.phone !== userProfile.phone) {
        updates.phone = profileData.phone;
      }

      if (profileData.birthdate !== userProfile.birthdate) {
        updates.birthdate = profileData.birthdate;
      }
      if (profileData.cpf !== userProfile.cpf) {
        updates.cpf = profileData.cpf;
      }

      // Se houver atualizações, envia para o Firestore
      if (Object.keys(updates).length > 0) {
        await updateUserProfile(user.uid, updates);
        showSuccessMessage("Perfil atualizado com sucesso!");
      }

      setIsEditingProfile(false);
    } catch (error) {
      console.error("Erro ao atualizar perfil:", error);
      setProfileError(
        "Ocorreu um erro ao salvar seus dados. Por favor, tente novamente."
      );
    } finally {
      setSavingProfile(false);
    }
  };

  // Função para validar endereço
  const validateAddress = () => {
    const requiredFields = ["street", "number", "city", "state", "zipCode"];
    const emptyFields = requiredFields.filter((field) => !newAddress[field]);

    if (emptyFields.length > 0) {
      setAddressError("Por favor, preencha todos os campos obrigatórios.");
      return false;
    }

    // Validação de CEP (formato 99999-999)
    const cepRegex = /^\d{5}-\d{3}$/;
    if (!cepRegex.test(newAddress.zipCode)) {
      setAddressError("CEP inválido. Use o formato 99999-999.");
      return false;
    }

    return true;
  };

  // Função para formatar CEP
  const formatCep = (value) => {
    if (!value) return value;

    const cep = value.replace(/\D/g, "");

    if (cep.length <= 5) {
      return cep;
    }
    return `${cep.slice(0, 5)}-${cep.slice(5, 8)}`;
  };

  const handleCepChange = (e) => {
    const formatted = formatCep(e.target.value);
    setNewAddress((prev) => ({ ...prev, zipCode: formatted }));
  };

  // Função para adicionar novo endereço
  const handleAddAddress = async () => {
    if (!user) return;

    if (!validateAddress()) return;

    setSavingAddress(true);
    setAddressError(null);
    setAddressSuccess(null);

    try {
      await addUserAddress(user.uid, newAddress);

      // Limpa o formulário e fecha a seção de adição
      setNewAddress({
        street: "",
        number: "",
        complement: "",
        neighborhood: "",
        city: "",
        state: "",
        zipCode: "",
      });
      setShowAddAddress(false);
      showSuccessMessage("Endereço adicionado com sucesso!");
    } catch (error) {
      console.error("Erro ao adicionar endereço:", error);
      setAddressError(
        "Ocorreu um erro ao adicionar o endereço. Por favor, tente novamente."
      );
    } finally {
      setSavingAddress(false);
    }
  };

  // Função para excluir um endereço
  const handleDeleteAddress = async (addressId) => {
    if (!user || !addressId) return;

    setDeletingAddress(addressId);

    try {
      await deleteUserAddress(user.uid, addressId);
      showSuccessMessage("Endereço removido com sucesso!");
    } catch (error) {
      console.error("Erro ao excluir endereço:", error);
      setAddressError("Não foi possível excluir o endereço. Tente novamente.");
    } finally {
      setDeletingAddress(null);
    }
  };

  // Função para definir endereço padrão
  const handleSetDefaultAddress = async (addressId) => {
    if (!user || !addressId) return;

    setSettingDefaultAddress(addressId);

    try {
      await setDefaultAddress(user.uid, addressId);
      showSuccessMessage("Endereço padrão atualizado!");
    } catch (error) {
      console.error("Erro ao definir endereço padrão:", error);
      setAddressError(
        "Não foi possível atualizar o endereço padrão. Tente novamente."
      );
    } finally {
      setSettingDefaultAddress(null);
    }
  };

  // Função para mostrar mensagem de sucesso temporária
  const showSuccessMessage = (message) => {
    if (activeTab === "personal" || activeTab === "profile") {
      setProfileSuccess(message);
      setTimeout(() => setProfileSuccess(null), 3000);
    } else if (activeTab === "addresses") {
      setAddressSuccess(message);
      setTimeout(() => setAddressSuccess(null), 3000);
    }
  };

  // Função para logout
  const handleLogout = async () => {
    setLoggingOut(true);

    try {
      await logoutUser();
      router.push("/");
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    } finally {
      setLoggingOut(false);
    }
  };

  // Formatar status do pedido
  const formatOrderStatus = (status) => {
    switch (status) {
      case "pending":
        return { label: "Pendente", color: "bg-yellow-100 text-yellow-800" };
      case "processing":
        return {
          label: "Em processamento",
          color: "bg-blue-100 text-blue-800",
        };
      case "shipping":
        return {
          label: "Em transporte",
          color: "bg-purple-100 text-purple-800",
        };
      case "delivered":
        return { label: "Entregue", color: "bg-green-100 text-green-800" };
      case "canceled":
        return { label: "Cancelado", color: "bg-red-100 text-red-800" };
      default:
        return { label: "Desconhecido", color: "bg-gray-100 text-gray-800" };
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Botão voltar e título */}
          <div className="flex justify-between items-center mb-8">
            <Link
              href="/"
              className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ChevronLeft size={18} className="mr-1" />
              <span>Voltar para Home</span>
            </Link>

            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="flex items-center text-gray-600 hover:text-red-600 transition-colors"
            >
              {loggingOut ? (
                <Loader size={18} className="animate-spin mr-2" />
              ) : (
                <LogOut size={18} className="mr-2" />
              )}
              <span>{loggingOut ? "Saindo..." : "Sair"}</span>
            </button>
          </div>

          {/* Cabeçalho do perfil */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
            <div className="bg-gradient-to-r from-primary to-secondary text-white p-8">
              <div className="flex flex-col md:flex-row items-center md:items-end">
                <div className="relative mb-4 md:mb-0 md:mr-6">
                  <div className="w-28 h-28 rounded-full bg-white/20 overflow-hidden border-4 border-white/40 flex items-center justify-center">
                    {avatarPreview ? (
                      <img
                        src={avatarPreview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : userProfile?.photoURL ? (
                      <img
                        src={userProfile.photoURL}
                        alt={userProfile.displayName || "Avatar"}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User
                        size={50}
                        strokeWidth={1.5}
                        className="text-white"
                      />
                    )}
                  </div>

                  {!avatarFile && (
                    <label
                      htmlFor="avatar-upload"
                      className="absolute bottom-0 right-0 bg-white rounded-full p-1.5 shadow-md cursor-pointer hover:bg-gray-100 transition-colors"
                    >
                      <Camera size={16} className="text-gray-700" />
                      <input
                        type="file"
                        id="avatar-upload"
                        accept="image/*"
                        className="hidden"
                        onChange={handleAvatarChange}
                      />
                    </label>
                  )}
                </div>

                <div className="text-center md:text-left flex-1">
                  <h1 className="text-3xl font-bold">
                    {userProfile?.displayName || "Usuário"}
                  </h1>
                  <p className="opacity-90 flex items-center justify-center md:justify-start mt-1">
                    <Mail size={16} className="mr-1.5" />
                    {userProfile?.email}
                  </p>
                </div>

                {avatarFile && (
                  <div className="flex items-center mt-4 md:mt-0">
                    <button
                      onClick={handleAvatarUpload}
                      disabled={uploadingAvatar}
                      className="flex items-center bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg mr-2 transition-colors"
                    >
                      {uploadingAvatar ? (
                        <>
                          <Loader size={16} className="animate-spin mr-2" />
                          Enviando...
                        </>
                      ) : (
                        <>
                          <Save size={16} className="mr-2" />
                          Salvar
                        </>
                      )}
                    </button>
                    <button
                      onClick={cancelAvatarUpload}
                      className="flex items-center bg-white/20 hover:bg-white/30 text-white px-3 py-2 rounded-lg transition-colors"
                    >
                      <X size={16} />
                    </button>
                  </div>
                )}
              </div>

              {avatarError && (
                <div className="mt-4 bg-red-100 text-red-700 p-3 rounded-lg text-sm flex items-center">
                  <AlertTriangle size={16} className="mr-2 flex-shrink-0" />
                  {avatarError}
                </div>
              )}
            </div>

            {/* Abas do perfil */}
            <div className="border-b border-gray-200">
              <nav className="flex overflow-x-auto">
                <button
                  className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                    activeTab === "personal"
                      ? "border-primary text-primary"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  } transition-colors duration-200`}
                  onClick={() => setActiveTab("personal")}
                >
                  <User size={16} className="inline-block mr-2" />
                  Informações Pessoais
                </button>
                <button
                  className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                    activeTab === "addresses"
                      ? "border-primary text-primary"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  } transition-colors duration-200`}
                  onClick={() => setActiveTab("addresses")}
                >
                  <MapPin size={16} className="inline-block mr-2" />
                  Endereços
                </button>
                <button
                  className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                    activeTab === "orders"
                      ? "border-primary text-primary"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  } transition-colors duration-200`}
                  onClick={() => setActiveTab("orders")}
                >
                  <Package size={16} className="inline-block mr-2" />
                  Pedidos Recentes
                </button>
              </nav>
            </div>
          </div>

          {/* Conteúdo da aba selecionada */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {/* Informações Pessoais */}
            {activeTab === "personal" && (
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-gray-800">
                    Informações Pessoais
                  </h2>
                  {!isEditingProfile ? (
                    <button
                      onClick={() => setIsEditingProfile(true)}
                      className="text-primary hover:text-primary-hover transition-colors flex items-center"
                    >
                      <Edit size={16} className="mr-1.5" />
                      Editar
                    </button>
                  ) : (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setIsEditingProfile(false);
                          // Revertendo para os dados originais
                          if (userProfile) {
                            setProfileData({
                              displayName: userProfile.displayName || "",
                              email: userProfile.email || "",
                              phone: userProfile.phone || "",
                              birthdate: userProfile.birthdate || "",
                            });
                          }
                        }}
                        className="text-gray-500 hover:text-gray-700 flex items-center transition-colors"
                      >
                        <X size={16} className="mr-1.5" />
                        Cancelar
                      </button>
                      <button
                        onClick={handleSaveProfile}
                        disabled={savingProfile}
                        className="text-green-600 hover:text-green-700 flex items-center transition-colors"
                      >
                        {savingProfile ? (
                          <Loader size={16} className="animate-spin mr-1.5" />
                        ) : (
                          <Save size={16} className="mr-1.5" />
                        )}
                        {savingProfile ? "Salvando..." : "Salvar"}
                      </button>
                    </div>
                  )}
                </div>

                {profileError && (
                  <div className="mb-6 bg-red-100 text-red-700 p-4 rounded-lg flex items-start">
                    <AlertTriangle
                      size={18}
                      className="mr-2 mt-0.5 flex-shrink-0"
                    />
                    <p>{profileError}</p>
                  </div>
                )}

                {profileSuccess && (
                  <div className="mb-6 bg-green-100 text-green-700 p-4 rounded-lg flex items-start">
                    <CheckCircle
                      size={18}
                      className="mr-2 mt-0.5 flex-shrink-0"
                    />
                    <p>{profileSuccess}</p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Nome completo */}
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      Nome completo
                    </label>
                    {isEditingProfile ? (
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <User size={18} className="text-gray-500" />
                        </div>
                        <input
                          type="text"
                          name="displayName"
                          value={profileData.displayName}
                          onChange={handleProfileChange}
                          className="w-full pl-10 pr-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
                          placeholder="Seu nome completo"
                        />
                      </div>
                    ) : (
                      <div className="flex items-center text-gray-800 border border-gray-200 rounded-lg p-2.5">
                        <User size={18} className="text-gray-500 mr-2" />
                        <span>
                          {userProfile?.displayName || "Não informado"}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      Email
                    </label>
                    <div className="flex items-center text-gray-800 border border-gray-200 rounded-lg p-2.5">
                      <Mail size={18} className="text-gray-500 mr-2" />
                      <span>{userProfile?.email || "Não informado"}</span>
                    </div>
                  </div>

                  {/* Telefone */}
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      Telefone
                    </label>
                    {isEditingProfile ? (
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Phone size={18} className="text-gray-500" />
                        </div>
                        <input
                          type="tel"
                          name="phone"
                          value={profileData.phone || ""}
                          onChange={handlePhoneChange}
                          className="w-full pl-10 pr-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
                          placeholder="(99) 99999-9999"
                        />
                      </div>
                    ) : (
                      <div className="flex items-center text-gray-800 border border-gray-200 rounded-lg p-2.5">
                        <Phone size={18} className="text-gray-500 mr-2" />
                        <span>{userProfile?.phone || "Não informado"}</span>
                      </div>
                    )}
                  </div>

                  {/* Data de Nascimento */}
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      Data de Nascimento
                    </label>
                    {isEditingProfile ? (
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Calendar size={18} className="text-gray-500" />
                        </div>
                        <input
                          type="date"
                          name="birthdate"
                          value={profileData.birthdate || ""}
                          onChange={handleProfileChange}
                          className="w-full pl-10 pr-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                    ) : (
                      <div className="flex items-center text-gray-800 border border-gray-200 rounded-lg p-2.5">
                        <Calendar size={18} className="text-gray-500 mr-2" />
                        <span>
                          {userProfile?.birthdate
                            ? new Date(
                                userProfile.birthdate
                              ).toLocaleDateString("pt-BR")
                            : "Não informado"}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Membro desde */}
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      Membro desde
                    </label>
                    <div className="flex items-center text-gray-800 border border-gray-200 rounded-lg p-2.5">
                      <Clock size={18} className="text-gray-500 mr-2" />
                      <span>
                        {userProfile?.createdAt
                          ? new Date(
                              userProfile.createdAt.seconds * 1000
                            ).toLocaleDateString("pt-BR")
                          : "Não disponível"}
                      </span>
                    </div>
                  </div>

                  {/* CPF */}
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      CPF
                    </label>
                    {isEditingProfile ? (
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <User size={18} className="text-gray-500" />
                        </div>
                        <input
                          type="text"
                          name="cpf"
                          value={profileData.cpf}
                          onChange={handleProfileChange}
                          className="w-full pl-10 pr-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
                          placeholder="Seu CPF"
                        />
                      </div>
                    ) : (
                      <div className="flex items-center text-gray-800 border border-gray-200 rounded-lg p-2.5">
                        <User size={18} className="text-gray-500 mr-2" />
                        <span>{userProfile?.cpf || "Não informado"}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Endereços */}
            {activeTab === "addresses" && (
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-gray-800">
                    Meus Endereços
                  </h2>
                  <button
                    onClick={() => setShowAddAddress(!showAddAddress)}
                    className="text-primary hover:text-primary-hover transition-colors flex items-center"
                  >
                    {showAddAddress ? (
                      <>
                        <X size={16} className="mr-1.5" />
                        Cancelar
                      </>
                    ) : (
                      <>
                        <Plus size={16} className="mr-1.5" />
                        Adicionar endereço
                      </>
                    )}
                  </button>
                </div>

                {addressError && (
                  <div className="mb-6 bg-red-100 text-red-700 p-4 rounded-lg flex items-start">
                    <AlertTriangle
                      size={18}
                      className="mr-2 mt-0.5 flex-shrink-0"
                    />
                    <p>{addressError}</p>
                  </div>
                )}

                {addressSuccess && (
                  <div className="mb-6 bg-green-100 text-green-700 p-4 rounded-lg flex items-start">
                    <CheckCircle
                      size={18}
                      className="mr-2 mt-0.5 flex-shrink-0"
                    />
                    <p>{addressSuccess}</p>
                  </div>
                )}

                {/* Lista de endereços */}
                {userProfile?.addresses && userProfile.addresses.length > 0 ? (
                  <div className="space-y-4 mb-6">
                    {userProfile.addresses.map((address) => (
                      <div
                        key={address.id}
                        className={`border rounded-lg p-4 ${
                          address.isDefault
                            ? "bg-blue-50 border-blue-200"
                            : "bg-white border-gray-200"
                        }`}
                      >
                        <div className="flex flex-col md:flex-row md:justify-between md:items-start">
                          <div className="flex-1">
                            <div className="flex items-start">
                              <MapPin
                                className={`mr-2 mt-1 flex-shrink-0 ${
                                  address.isDefault
                                    ? "text-blue-600"
                                    : "text-gray-500"
                                }`}
                              />
                              <div>
                                <div className="flex items-center">
                                  <p className="font-medium">
                                    {address.street}, {address.number}
                                    {address.complement &&
                                      ` - ${address.complement}`}
                                  </p>
                                  {address.isDefault && (
                                    <span className="ml-2 inline-block text-xs bg-blue-600 text-white px-2 py-0.5 rounded">
                                      Padrão
                                    </span>
                                  )}
                                </div>
                                <p className="text-gray-600">
                                  {address.neighborhood &&
                                    `${address.neighborhood}, `}
                                  {address.city} - {address.state}
                                </p>
                                <p className="text-gray-600">
                                  CEP: {address.zipCode}
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="flex mt-4 md:mt-0 space-x-2 md:ml-4">
                            {!address.isDefault && (
                              <button
                                onClick={() =>
                                  handleSetDefaultAddress(address.id)
                                }
                                disabled={settingDefaultAddress === address.id}
                                className="text-blue-600 hover:text-blue-800 transition-colors text-sm"
                                title="Definir como endereço padrão"
                              >
                                {settingDefaultAddress === address.id ? (
                                  <Loader size={16} className="animate-spin" />
                                ) : (
                                  "Tornar padrão"
                                )}
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteAddress(address.id)}
                              disabled={deletingAddress === address.id}
                              className="text-red-500 hover:text-red-700 transition-colors"
                              title="Remover endereço"
                            >
                              {deletingAddress === address.id ? (
                                <Loader size={16} className="animate-spin" />
                              ) : (
                                <Trash2 size={16} />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : !showAddAddress ? (
                  <div className="text-center py-10 bg-gray-50 rounded-lg border border-gray-200 mb-6">
                    <MapPin size={32} className="mx-auto text-gray-400 mb-2" />
                    <p className="text-gray-500 mb-4">
                      Você ainda não possui endereços cadastrados.
                    </p>
                    <button
                      onClick={() => setShowAddAddress(true)}
                      className="flex items-center mx-auto bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-hover transition-colors"
                    >
                      <Plus size={16} className="mr-1.5" />
                      Adicionar endereço
                    </button>
                  </div>
                ) : null}

                {/* Formulário para adicionar novo endereço */}
                {showAddAddress && (
                  <div className="border border-gray-200 rounded-lg p-6 bg-gray-50 mb-6">
                    <h3 className="font-medium text-lg text-gray-800 mb-4">
                      Novo Endereço
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Rua/Avenida */}
                      <div className="md:col-span-2">
                        <label className="block text-gray-700 text-sm font-medium mb-1">
                          Rua/Avenida <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="street"
                          value={newAddress.street}
                          onChange={handleAddressChange}
                          className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
                          placeholder="Ex: Av. Paulista"
                        />
                      </div>

                      {/* Número */}
                      <div>
                        <label className="block text-gray-700 text-sm font-medium mb-1">
                          Número <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="number"
                          value={newAddress.number}
                          onChange={handleAddressChange}
                          className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
                          placeholder="Ex: 1000"
                        />
                      </div>

                      {/* Complemento */}
                      <div>
                        <label className="block text-gray-700 text-sm font-medium mb-1">
                          Complemento
                        </label>
                        <input
                          type="text"
                          name="complement"
                          value={newAddress.complement}
                          onChange={handleAddressChange}
                          className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
                          placeholder="Ex: Apto 42, Bloco B"
                        />
                      </div>

                      {/* Bairro */}
                      <div>
                        <label className="block text-gray-700 text-sm font-medium mb-1">
                          Bairro
                        </label>
                        <input
                          type="text"
                          name="neighborhood"
                          value={newAddress.neighborhood}
                          onChange={handleAddressChange}
                          className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
                          placeholder="Ex: Centro"
                        />
                      </div>

                      {/* CEP */}
                      <div>
                        <label className="block text-gray-700 text-sm font-medium mb-1">
                          CEP <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="zipCode"
                          value={newAddress.zipCode}
                          onChange={handleCepChange}
                          className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
                          placeholder="99999-999"
                        />
                      </div>

                      {/* Cidade */}
                      <div>
                        <label className="block text-gray-700 text-sm font-medium mb-1">
                          Cidade <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="city"
                          value={newAddress.city}
                          onChange={handleAddressChange}
                          className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
                          placeholder="Ex: São Paulo"
                        />
                      </div>

                      {/* Estado */}
                      <div>
                        <label className="block text-gray-700 text-sm font-medium mb-1">
                          Estado <span className="text-red-500">*</span>
                        </label>
                        <select
                          name="state"
                          value={newAddress.state}
                          onChange={handleAddressChange}
                          className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                          <option value="">Selecione o estado</option>
                          <option value="AC">Acre</option>
                          <option value="AL">Alagoas</option>
                          <option value="AP">Amapá</option>
                          <option value="AM">Amazonas</option>
                          <option value="BA">Bahia</option>
                          <option value="CE">Ceará</option>
                          <option value="DF">Distrito Federal</option>
                          <option value="ES">Espírito Santo</option>
                          <option value="GO">Goiás</option>
                          <option value="MA">Maranhão</option>
                          <option value="MT">Mato Grosso</option>
                          <option value="MS">Mato Grosso do Sul</option>
                          <option value="MG">Minas Gerais</option>
                          <option value="PA">Pará</option>
                          <option value="PB">Paraíba</option>
                          <option value="PR">Paraná</option>
                          <option value="PE">Pernambuco</option>
                          <option value="PI">Piauí</option>
                          <option value="RJ">Rio de Janeiro</option>
                          <option value="RN">Rio Grande do Norte</option>
                          <option value="RS">Rio Grande do Sul</option>
                          <option value="RO">Rondônia</option>
                          <option value="RR">Roraima</option>
                          <option value="SC">Santa Catarina</option>
                          <option value="SP">São Paulo</option>
                          <option value="SE">Sergipe</option>
                          <option value="TO">Tocantins</option>
                        </select>
                      </div>
                    </div>

                    <div className="mt-6 flex justify-end">
                      <button
                        type="button"
                        onClick={() => setShowAddAddress(false)}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors mr-3"
                      >
                        Cancelar
                      </button>
                      <button
                        type="button"
                        onClick={handleAddAddress}
                        disabled={savingAddress}
                        className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors disabled:opacity-70 flex items-center"
                      >
                        {savingAddress ? (
                          <>
                            <Loader size={16} className="animate-spin mr-2" />
                            Salvando...
                          </>
                        ) : (
                          "Adicionar Endereço"
                        )}
                      </button>
                    </div>
                  </div>
                )}

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
                  <div className="flex items-start">
                    <AlertTriangle
                      size={18}
                      className="text-blue-600 mr-2 mt-0.5 flex-shrink-0"
                    />
                    <p>
                      O endereço marcado como <strong>padrão</strong> será usado
                      automaticamente em novos pedidos. Você pode alterar o
                      endereço de entrega durante o checkout.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Pedidos Recentes */}
            {activeTab === "orders" && (
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-gray-800">
                    Pedidos Recentes
                  </h2>
                  <Link
                    href="/orders"
                    className="text-primary hover:text-primary-hover transition-colors flex items-center"
                  >
                    Ver todos os pedidos
                    <ExternalLink size={14} className="ml-1.5" />
                  </Link>
                </div>

                {ordersLoading ? (
                  <div className="flex items-center justify-center py-10">
                    <Loader
                      size={24}
                      className="text-primary animate-spin mr-3"
                    />
                    <span className="text-gray-600">Carregando pedidos...</span>
                  </div>
                ) : recentOrders.length === 0 ? (
                  <div className="text-center py-10 bg-gray-50 rounded-lg border border-gray-200">
                    <ShoppingBag
                      size={32}
                      className="mx-auto text-gray-400 mb-2"
                    />
                    <p className="text-gray-500 mb-4">
                      Você ainda não realizou nenhum pedido.
                    </p>
                    <Link
                      href="/upload"
                      className="flex items-center mx-auto bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-hover transition-colors inline-flex"
                    >
                      Comece a comprar
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentOrders.map((order) => (
                      <div
                        key={order.id}
                        className="border border-gray-200 rounded-lg overflow-hidden"
                      >
                        <div className="bg-gray-50 p-4">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-center mb-2 sm:mb-0">
                              <Package
                                size={18}
                                className="text-primary mr-2"
                              />
                              <span className="font-medium">
                                Pedido #{order.id}
                              </span>
                            </div>

                            <div className="flex flex-wrap gap-3 items-center">
                              <div className="text-gray-500 text-sm flex items-center">
                                <Calendar size={14} className="mr-1" />
                                {order.date.toLocaleDateString("pt-BR")}
                              </div>

                              <div
                                className={`px-3 py-1 rounded-full text-xs font-medium ${
                                  formatOrderStatus(order.status).color
                                }`}
                              >
                                {formatOrderStatus(order.status).label}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="p-4 flex justify-between items-center">
                          <div>
                            <div className="text-sm text-gray-600">
                              <span className="font-medium">{order.items}</span>{" "}
                              {order.items === 1 ? "item" : "itens"}
                            </div>
                            <div className="font-medium text-lg">
                              R$ {order.total.toFixed(2)}
                            </div>
                          </div>

                          <Link
                            href={`/orders/${order.id}`}
                            className="bg-white border border-primary text-primary px-4 py-2 rounded-lg hover:bg-primary-50 transition-colors"
                          >
                            Ver detalhes
                          </Link>
                        </div>
                      </div>
                    ))}

                    <div className="text-center mt-6">
                      <Link
                        href="/orders"
                        className="text-primary hover:text-primary-hover transition-colors font-medium inline-flex items-center"
                      >
                        Ver histórico completo de pedidos
                        <ExternalLink size={14} className="ml-1.5" />
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
