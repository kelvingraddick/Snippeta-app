import validator from "./validator";

const register = async (user) => {
  console.log(`api.js -> register: Attempt to request register with email address ${user?.email_address}.`);
  if (validator.isValidUser(user)) {
    return await fetch('https://www.snippeta.com/api/user/register.php', {
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

  return await fetch('https://www.snippeta.com/api/user/login.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
}

const saveUser = async (user, authorizationToken) => {
  console.log(`api.js -> saveUser: Attempt to request saving user with id ${user?.id}.`);
  if (validator.isValidUser(user)) {
    return await fetch('https://www.snippeta.com/api/user/save.php', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${authorizationToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(user)
    });
  }
  return null;
}

const deleteUser = async (authorizationToken) => {
  console.log(`api.js -> deleteUser: Attempt to request deleting current user.`);
  return await fetch('https://www.snippeta.com/api/user/delete.php', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${authorizationToken}`,
      'Content-Type': 'application/json'
    },
  });
  return null;
}

const sendPasswordResetEmail = async (emailOrPhone) => {
  console.log(`api.js -> passwordResetEmail: Attempt to request password reset email for ${emailOrPhone}.`);
  return await fetch('https://www.snippeta.com/api/user/password/reset/email.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email_or_phone: emailOrPhone })
  });
  return null;
}

const getSnippets = async (parentId, includeNestedChildren, authorizationToken) => {
  console.log(`api.js -> getSnippets: Get snippets for parent ID ${parentId} and include nested children ${includeNestedChildren}.`);
  
  return await fetch(`https://www.snippeta.com/api/snippets/get.php?parent_id=${parentId}&include_nested_children=${includeNestedChildren}`, {
    method: 'GET',
    headers: { 
      'Authorization': `Basic ${authorizationToken}`,
      'Content-Type': 'application/json',
    },
  });
}

const getSnippetGroups = async (authorizationToken) => {
  console.log(`api.js -> getSnippetGroups: Get snippet groups.`);
  
  return await fetch(`https://www.snippeta.com/api/snippets/groups.php`, {
    method: 'GET',
    headers: { 
      'Authorization': `Basic ${authorizationToken}`,
      'Content-Type': 'application/json',
    },
  });
}

const searchSnippets = async (query, authorizationToken) => {
  console.log(`api.js -> searchSnippets: Search snippets with query ${query}.`);
  query = query && query.toLowerCase ? query.toLowerCase() : '';
  
  return await fetch(`https://www.snippeta.com/api/snippets/search.php?query=${query}`, {
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
    return await fetch('https://www.snippeta.com/api/snippet/save.php', {
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

  return await fetch('https://www.snippeta.com/api/snippet/remove.php', {
    method: 'POST',
    headers: { 
      'Authorization': `Basic ${authorizationToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ id }),
  });
};

const moveSnippet = async (snippet, option, groupId, authorizationToken) => {
  console.log(`api.js -> moveSnippet: Moving snippet with ID ${snippet?.id}, option ${option}, and group ID ${groupId}.`);
  if (validator.isValidSnippet(snippet)) {
    return await fetch('https://www.snippeta.com/api/snippet/move.php', {
      method: 'POST',
      headers: { 
        'Authorization': `Basic ${authorizationToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id: snippet?.id, option, group_id: groupId }),
    });
  }
  return null;
}

export default {
  register,
  login,
  saveUser,
  deleteUser,
  sendPasswordResetEmail,
  getSnippets,
  getSnippetGroups,
  searchSnippets,
  saveSnippet,
  deleteSnippet,
  moveSnippet,
};