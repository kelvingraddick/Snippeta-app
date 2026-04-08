const sanitizeField = (value, { toLowerCase } = {}) => {
  if (value === null || value === undefined) {
    return value;
  }

  const trimmed = `${value}`.trim();
  return toLowerCase ? trimmed.toLowerCase() : trimmed;
};

export const sanitizeUserContactFields = (user = {}) => {
  if (!user || typeof user !== 'object') {
    return user;
  }

  return {
    ...user,
    email_address: sanitizeField(user.email_address, { toLowerCase: true }),
    phone_number: sanitizeField(user.phone_number),
  };
};
