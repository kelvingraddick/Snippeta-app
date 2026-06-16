const sanitizeField = (value, { toLowerCase } = {}) => {
  if (value === null || value === undefined) {
    return value;
  }

  const trimmed = `${value}`.trim();
  return toLowerCase ? trimmed.toLowerCase() : trimmed;
};

const sanitizePhoneNumber = (value) => {
  const trimmedValue = sanitizeField(value);
  if (trimmedValue === null || trimmedValue === undefined || trimmedValue === '') {
    return trimmedValue;
  }

  const hasLeadingPlus = trimmedValue.startsWith('+');
  const digitsOnly = trimmedValue.replace(/\D/g, '');
  if (!digitsOnly) {
    return trimmedValue;
  }

  return hasLeadingPlus ? `+${digitsOnly}` : digitsOnly;
};

export const sanitizeCredentialIdentifier = (emailOrPhone) => {
  const trimmedValue = sanitizeField(emailOrPhone);
  if (trimmedValue === null || trimmedValue === undefined || trimmedValue === '') {
    return trimmedValue;
  }

  return trimmedValue.includes('@') ? trimmedValue.toLowerCase() : sanitizePhoneNumber(trimmedValue);
};

export const sanitizeUserContactFields = (user = {}) => {
  if (!user || typeof user !== 'object') {
    return user;
  }

  return {
    ...user,
    email_address: sanitizeField(user.email_address, { toLowerCase: true }),
    phone_number: sanitizePhoneNumber(user.phone_number),
  };
};
