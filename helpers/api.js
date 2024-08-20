import validator from "./validator";

const register = async (user) => {
  console.log(`api.js -> register: Attempt to request register with email address ${user?.email_address}.`);
  if (validator.isValidUser(user)) {
    return await fetch('http://www.snippeta.com/api/user/register.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user)
    });
  }
  return null;
}

const login = async (emailOrPhone, password) => {
  console.log(`api.js -> login: Attempt to request login with credentials for ${emailOrPhone}.`);
  
  const body = {
    email_or_phone: emailOrPhone,
    password: password,
  };

  return await fetch('http://www.snippeta.com/api/user/login.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
}

const saveUser = async (user) => {
  console.log(`api.js -> saveUser: Attempt to request saving user with id ${user?.id}.`);
  if (validator.isValidUser(user)) {
    return await fetch('http://www.snippeta.com/api/user/save.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user)
    });
  }
  return null;
}

const getSnippets = async (parentId, authorizationToken) => {
  console.log(`api.js -> getSnippets: Get snippets for parent ID ${parentId}.`);
  
  return await fetch(`http://www.snippeta.com/api/snippets/get.php?parent_id=${parentId}`, {
    method: 'GET',
    headers: { 
      'Authorization': `Basic ${authorizationToken}`,
      'Content-Type': 'application/json',
    },
  });
}

const saveSnippet = async (snippet, authorizationToken) => {
  console.log(`api.js -> saveSnippet: Saving snippet with ID ${snippet?.id}.`);
  if (validator.isValidSnippet(snippet)) {
    return await fetch('http://www.snippeta.com/api/snippet/save.php', {
      method: 'POST',
      headers: { 
        'Authorization': `Basic ${authorizationToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(snippet),
    });
  }
  return null;
}

const deleteSnippet = async (id, authorizationToken) => {
  console.log(`api.js -> deleteSnippet: Deleting snippet with ID ${id}.`);

  return await fetch('http://www.snippeta.com/api/snippet/remove.php', {
    method: 'POST',
    headers: { 
      'Authorization': `Basic ${authorizationToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ id }),
  });
};

const moveSnippet = async (snippet, authorizationToken) => {
  console.log(`api.js -> moveSnippet: Moving snippet with ID ${snippet?.id}.`);
  if (validator.isValidSnippet(snippet)) {
    return await fetch('http://www.snippeta.com/api/snippet/move.php', {
      method: 'POST',
      headers: { 
        'Authorization': `Basic ${authorizationToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id: snippet?.id }),
    });
  }
  return null;
}

export default {
  register,
  login,
  saveUser,
  getSnippets,
  saveSnippet,
  deleteSnippet,
  moveSnippet,
};