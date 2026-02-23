export const formatCurrency = (amount, currency = 'KZT') => {
  return new Intl.NumberFormat('kk-KZ', {
    style: 'currency',
    currency: currency
  }).format(amount);
};

export const formatPhone = (phone) => {
  const digits = phone.replace(/\D/g, '');
  return `+${digits.substring(0, 1)} (${digits.substring(1, 4)}) ${digits.substring(4, 7)}-${digits.substring(7, 11)}`;
};

export const maskCardNumber = (cardNumber) => {
  const cleaned = cardNumber.replace(/\D/g, '');
  return `${cleaned.substring(0, 4)} **** **** ${cleaned.substring(12)}`;
};

export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const validatePhone = (phone) => {
  const digits = phone.replace(/\D/g, '');
  return digits.length >= 10;
};
