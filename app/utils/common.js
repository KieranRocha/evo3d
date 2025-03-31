/**
 * Formata um número de telefone para o padrão brasileiro (99) 99999-9999
 * @param {string} value - Valor bruto a ser formatado
 * @returns {string} Telefone formatado
 */
export const formatPhone = (value) => {
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

/**
 * Formata um CEP para o padrão 99999-999
 * @param {string} value - Valor bruto a ser formatado
 * @returns {string} CEP formatado
 */
export const formatZipCode = (value) => {
  if (!value) return value;

  const cep = value.replace(/\D/g, "").slice(0, 8);

  if (cep.length <= 5) {
    return cep;
  }
  return `${cep.slice(0, 5)}-${cep.slice(5)}`;
};

/**
 * Formata um documento (CPF ou CNPJ) para o padrão adequado
 * @param {string} value - Valor bruto a ser formatado
 * @returns {string} Documento formatado
 */
export const formatDocument = (value) => {
  if (!value) return value;

  const digits = value.replace(/\D/g, "");

  if (digits.length <= 11) {
    return digits
      .replace(/^(\d{3})(\d)/, "$1.$2")
      .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
      .replace(/^(\d{3})\.(\d{3})\.(\d{3})(\d)/, "$1.$2.$3-$4")
      .slice(0, 14);
  } else {
    return digits
      .replace(/^(\d{2})(\d)/, "$1.$2")
      .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
      .replace(/^(\d{2})\.(\d{3})\.(\d{3})(\d)/, "$1.$2.$3/$4")
      .replace(/^(\d{2})\.(\d{3})\.(\d{3})\/(\d{4})(\d)/, "$1.$2.$3/$4-$5")
      .slice(0, 18);
  }
};

/**
 * Valida um CPF
 * @param {string} cpf - CPF a ser validado (pode conter pontuação)
 * @returns {boolean} Verdadeiro se o CPF for válido
 */
export const validateCPF = (cpf) => {
  const cleanCPF = cpf.replace(/\D/g, "");

  if (cleanCPF.length !== 11 || /^(\d)\1{10}$/.test(cleanCPF)) {
    return false;
  }

  let sum = 0;
  let remainder;

  for (let i = 1; i <= 9; i++) {
    sum += parseInt(cleanCPF.substring(i - 1, i)) * (11 - i);
  }

  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCPF.substring(9, 10))) return false;

  sum = 0;
  for (let i = 1; i <= 10; i++) {
    sum += parseInt(cleanCPF.substring(i - 1, i)) * (12 - i);
  }

  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCPF.substring(10, 11))) return false;

  return true;
};

/**
 * Valida um CNPJ
 * @param {string} cnpj - CNPJ a ser validado (pode conter pontuação)
 * @returns {boolean} Verdadeiro se o CNPJ for válido
 */
export const validateCNPJ = (cnpj) => {
  const cleanCNPJ = cnpj.replace(/\D/g, "");

  if (cleanCNPJ.length !== 14 || /^(\d)\1{13}$/.test(cleanCNPJ)) {
    return false;
  }

  let size = cleanCNPJ.length - 2;
  let numbers = cleanCNPJ.substring(0, size);
  const digits = cleanCNPJ.substring(size);
  let sum = 0;
  let pos = size - 7;

  for (let i = size; i >= 1; i--) {
    sum += parseInt(numbers.charAt(size - i)) * pos--;
    if (pos < 2) pos = 9;
  }

  let result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (result !== parseInt(digits.charAt(0))) return false;

  size += 1;
  numbers = cleanCNPJ.substring(0, size);
  sum = 0;
  pos = size - 7;

  for (let i = size; i >= 1; i--) {
    sum += parseInt(numbers.charAt(size - i)) * pos--;
    if (pos < 2) pos = 9;
  }

  result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (result !== parseInt(digits.charAt(1))) return false;

  return true;
};

/**
 * Valida um documento (CPF ou CNPJ)
 * @param {string} document - Documento a ser validado
 * @returns {boolean} Verdadeiro se o documento for válido
 */
export const validateDocument = (document) => {
  const cleanDoc = document.replace(/\D/g, "");

  if (cleanDoc.length === 11) {
    return validateCPF(cleanDoc);
  } else if (cleanDoc.length === 14) {
    return validateCNPJ(cleanDoc);
  }

  return false;
};

/**
 * Formata um valor monetário
 * @param {number} value - Valor a ser formatado
 * @param {number} decimals - Número de casas decimais (padrão: 2)
 * @returns {string} Valor formatado como R$ 99,99
 */
export const formatCurrency = (value, decimals = 2) => {
  if (value === null || value === undefined) return "R$ 0,00";

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
};

/**
 * Formata uma data para o padrão brasileiro
 * @param {Date|number} date - Data ou timestamp
 * @param {Object} options - Opções de formatação para Intl.DateTimeFormat
 * @returns {string} Data formatada (ex: 01/01/2023)
 */
export const formatDate = (date, options = {}) => {
  if (!date) return "";

  let dateObj = date;
  if (typeof date === "number") {
    dateObj = date < 10000000000 ? new Date(date * 1000) : new Date(date);
  } else if (date.seconds) {
    dateObj = new Date(date.seconds * 1000);
  }

  const defaultOptions = {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    ...options,
  };

  return new Intl.DateTimeFormat("pt-BR", defaultOptions).format(dateObj);
};

/**
 * Formata o status de um pedido
 * @param {string} status - Status do pedido
 * @returns {Object} Objeto com label e classe CSS para o status
 */
export const formatOrderStatus = (status) => {
  switch (status) {
    case "pending":
      return { label: "Pendente", color: "bg-yellow-100 text-yellow-800" };
    case "processing":
      return { label: "Em processamento", color: "bg-blue-100 text-blue-800" };
    case "shipping":
      return { label: "Em transporte", color: "bg-purple-100 text-purple-800" };
    case "delivered":
      return { label: "Entregue", color: "bg-green-100 text-green-800" };
    case "canceled":
      return { label: "Cancelado", color: "bg-red-100 text-red-800" };
    default:
      return { label: "Desconhecido", color: "bg-gray-100 text-gray-800" };
  }
};

/**
 * Formata um método de pagamento
 * @param {string} method - Código do método de pagamento
 * @returns {string} Nome formatado do método de pagamento
 */
export const formatPaymentMethod = (method) => {
  switch (method) {
    case "credit_card":
      return "Cartão de Crédito";
    case "debit_card":
      return "Cartão de Débito";
    case "pix":
      return "PIX";
    case "boleto":
      return "Boleto Bancário";
    default:
      return method || "Não especificado";
  }
};

/**
 * Formata o tamanho de um arquivo
 * @param {number} bytes - Tamanho em bytes
 * @param {number} decimals - Número de casas decimais
 * @returns {string} Tamanho formatado (ex: 1.5 MB)
 */
export const formatFileSize = (bytes, decimals = 2) => {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return (
    parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + " " + sizes[i]
  );
};

/**
 * Gera um ID único
 * @returns {string} ID único baseado em timestamp e número aleatório
 */
export const generateUniqueId = () => {
  return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Copia um texto para a área de transferência
 * @param {string} text - Texto a ser copiado
 * @returns {Promise<boolean>} Promessa que resolve para verdadeiro se a cópia for bem-sucedida
 */
export const copyToClipboard = async (text) => {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      const result = document.execCommand("copy");
      document.body.removeChild(textarea);
      return result;
    }
  } catch (error) {
    console.error("Erro ao copiar para área de transferência:", error);
    return false;
  }
};

/**
 * Converte um objeto File para um DataURL (Base64)
 * @param {File} file - Arquivo a ser convertido
 * @returns {Promise<string>} Promise que resolve para o DataURL
 */
export const fileToDataUrl = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

/**
 * Sanitiza uma string para ser usada em URLs
 * @param {string} text - Texto a ser sanitizado
 * @returns {string} Texto sanitizado (slug)
 */
export const slugify = (text) => {
  return text
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/--+/g, "-");
};

/**
 * Trunca um texto com ellipsis se exceder o tamanho máximo
 * @param {string} text - Texto a ser truncado
 * @param {number} maxLength - Tamanho máximo
 * @returns {string} Texto truncado
 */
export const truncateText = (text, maxLength) => {
  if (!text || text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
};

/**
 * Verifica se um CEP é válido
 * @param {string} cep - CEP a ser validado
 * @returns {boolean} Verdadeiro se o CEP for válido
 */
export const validateZipCode = (cep) => {
  const cleanCep = cep.replace(/\D/g, "");
  return cleanCep.length === 8;
};

/**
 * Verifica se um email é válido
 * @param {string} email - Email a ser validado
 * @returns {boolean} Verdadeiro se o email for válido
 */
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Remove a acentuação de uma string
 * @param {string} text - Texto com acentos
 * @returns {string} Texto sem acentos
 */
export const removeAccents = (text) => {
  return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
};

/**
 * Valida um nome completo (pelo menos nome e sobrenome)
 * @param {string} fullName - Nome completo a ser validado
 * @returns {boolean} Verdadeiro se o nome for válido
 */
export const validateFullName = (fullName) => {
  if (!fullName) return false;
  const parts = fullName.trim().split(" ");
  return parts.length >= 2 && parts[0].length > 0 && parts[1].length > 0;
};

/**
 * Extrai a extensão de um nome de arquivo
 * @param {string} filename - Nome do arquivo
 * @returns {string} Extensão do arquivo em minúsculas
 */
export const getFileExtension = (filename) => {
  if (!filename) return "";
  return filename.split(".").pop().toLowerCase();
};

/**
 * Verifica se um arquivo tem uma extensão suportada
 * @param {string} filename - Nome do arquivo
 * @param {Array<string>} allowedExtensions - Lista de extensões permitidas
 * @returns {boolean} Verdadeiro se a extensão for suportada
 */
export const isFileTypeSupported = (filename, allowedExtensions) => {
  const extension = getFileExtension(filename);
  return allowedExtensions.includes(extension);
};

/**
 * Remove itens duplicados de um array
 * @param {Array} array - Array com possíveis duplicatas
 * @param {string} [key] - Propriedade para comparação em arrays de objetos
 * @returns {Array} Array sem duplicatas
 */
export const removeDuplicates = (array, key) => {
  if (!key) {
    return [...new Set(array)];
  }

  return array.filter(
    (item, index, self) => index === self.findIndex((t) => t[key] === item[key])
  );
};

/**
 * Retorna apenas as propriedades que mudaram entre dois objetos
 * @param {Object} original - Objeto original
 * @param {Object} updated - Objeto atualizado
 * @returns {Object} Objeto contendo apenas as propriedades alteradas
 */
export const getChangedProperties = (original, updated) => {
  const changes = {};

  Object.keys(updated).forEach((key) => {
    if (JSON.stringify(original[key]) !== JSON.stringify(updated[key])) {
      changes[key] = updated[key];
    }
  });

  return changes;
};

/**
 * Calcula a idade a partir da data de nascimento
 * @param {Date|string} birthdate - Data de nascimento
 * @returns {number} Idade em anos
 */
export const calculateAge = (birthdate) => {
  if (!birthdate) return 0;

  const birthDate =
    typeof birthdate === "string" ? new Date(birthdate) : birthdate;
  const today = new Date();

  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }

  return age;
};

/**
 * Calcula o valor de parcela para um pagamento
 * @param {number} totalAmount - Valor total
 * @param {number} installments - Número de parcelas
 * @param {number} [interestRate=0] - Taxa de juros (percentual)
 * @returns {Object} Detalhes das parcelas
 */
export const calculateInstallment = (
  totalAmount,
  installments,
  interestRate = 0
) => {
  if (!totalAmount || installments <= 0) {
    return { installmentValue: 0, totalWithInterest: 0 };
  }

  if (interestRate === 0) {
    return {
      installmentValue: totalAmount / installments,
      totalWithInterest: totalAmount,
    };
  } else {
    const rate = interestRate / 100;
    const totalWithInterest = totalAmount * Math.pow(1 + rate, installments);
    return {
      installmentValue: totalWithInterest / installments,
      totalWithInterest,
    };
  }
};
