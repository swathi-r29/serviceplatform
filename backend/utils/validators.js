const validateEmail = (email) => {
  return email && typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const validatePhone = (phone) => {
  if (!phone || typeof phone !== 'string') return false;
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');
  return cleaned.length === 10;
};

const validatePassword = (password) => {
  return password && typeof password === 'string' && password.length >= 6;
};

module.exports = {
  validateEmail,
  validatePhone,
  validatePassword
};