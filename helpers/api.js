const login = async (emailOrPhone, password) => {
  console.log(`api.js -> login: Attempt to login with credentials for ${emailOrPhone}.`);
  
  var body = {
    email_or_phone: emailOrPhone,
    password: password,
  };

  const response = await fetch('http://www.snippeta.com/api/user/login.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  const json = await response.json();
  if (json.success && json.user) {    
    const user = json.user;
    user.password = null;
    console.log(`api.js -> login: Logged in for user: ${JSON.stringify(user)}.`);
    return user;
  }

  return null;
}

export default {
  login,
};