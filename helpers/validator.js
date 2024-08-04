import colors from './colors';
import { snippetTypes } from '../constants/snippetTypes';
import { snippetSources } from '../constants/snippetSources';
import { storageKeys } from '../constants/storageKeys';

const isValidCredentials = (credentials) => {
  let errorMessages = [];
  if (!credentials) {
    errorMessages.push('Credentials cannot be null.');
  }
  if (!credentials.emailOrPhone || credentials.emailOrPhone.length < 1 || credentials.emailOrPhone.length > 50) {
    errorMessages.push('Credentials email or phone must be between 1 and 50 characters.');
  }
  if (!credentials.password || credentials.password.length < 1 || credentials.password.length > 100) {
    errorMessages.push('Credentials password must be between 1 and 100 characters.');
  }
  if (errorMessages.length > 0) {
    throw new Error(errorMessages.join(' '));
  }
  return true;
}

const isValidSnippet = (snippet) => {
  let errorMessages = [];
  if (!snippet) {
    errorMessages.push('Snippet cannot be null.');
  }
  if (!snippet.id || !(snippet.id.startsWith(storageKeys.SNIPPET) || typeof(snippet.id) == 'number')) {
    errorMessages.push(`Snippet ID must start with '${storageKeys.SNIPPET}' or be a number.`);
  }
  if (snippet.parent_id && !(snippet.parent_id.startsWith(storageKeys.SNIPPET) || typeof(snippet.parent_id) == 'number')) {
    errorMessages.push(`Snippet parent ID must start with '${storageKeys.SNIPPET}' or be a number.`);
  }
  if (!Object.values(snippetTypes).includes(snippet.type)) {
    errorMessages.push(`Snippet type must be one of: ${Object.values(snippetTypes).join(', ')}.'`);
  }
  if (!Object.values(snippetSources).includes(snippet.source)) {
    errorMessages.push(`Snippet source must be one of: ${Object.values(snippetSources).join(', ')}.'`);
  }
  if (!snippet.title || snippet.title.length < 1 || snippet.title.length > 50) {
    errorMessages.push('Snippet title must be between 1 and 50 characters.');
  }
  if (!snippet.content || snippet.title.length < 1 || snippet.title.length > 1000) {
    errorMessages.push('sSippet content must be between 1 and 1000 characters.');
  }
  if (!colors.getById(snippet.color_id)) {
    errorMessages.push(`Snippet color ID must be a valid one of the valid color IDs (0-4).'`);
  }
  if (Object.prototype.toString.call(snippet.time) !== '[object Date]') {
    errorMessages.push('Snippet time must be a valid datetime.');
  }
  if (typeof(snippet.order_index) !== 'number') {
    errorMessages.push('Snippet order index must be a valid number.');
  }
  if (errorMessages.length > 0) {
    throw new Error(errorMessages.join(' '));
  }
  return true;
}

export default {
  isValidCredentials,
  isValidSnippet,
};