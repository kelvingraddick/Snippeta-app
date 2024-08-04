import storage from './storage';
import api from './api';

class Login {
  constructor() {}

  withStorage = async () => {
    console.log('authenticator.js -> login.withStorage: Attempt to get credentials from storage..');
    const credentials = await storage.getCredentials();
    return !credentials ? null : await this.withCredentials(credentials.emailOrPhone, credentials.password);
  }

  withCredentials = async (emailOrPhone, password) => {
    const user = await api.login(emailOrPhone, password);
    if (user) {
      await storage.saveCredentials(emailOrPhone, password);
      user.password = null;
      console.log(`authenticator.js -> login.withCredentials: Logged in for user: ${JSON.stringify(user)}.`);
      return user;
    }
    return null;
  }
}

const login = new Login();

const logout = async () => {
  console.log('authenticator.js -> logout: Attempt to delete credentials from storage..');
  await storage.deleteCredentials();
};

export default {
  login,
  logout
};