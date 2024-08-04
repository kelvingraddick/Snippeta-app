const login = async (emailOrPhone, password) => {
  console.log(`api.js -> login: Attempt to request login with credentials for ${emailOrPhone}.`);
  
  var body = {
    email_or_phone: emailOrPhone,
    password: password,
  };

  return await fetch('http://www.snippeta.com/api/user/login.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
}

export default {
  login,
};