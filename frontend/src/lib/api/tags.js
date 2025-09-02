import { apiRequest } from './utils';

export async function getAllTags() {
  return apiRequest('/game/tags/', { method: 'GET' });
}