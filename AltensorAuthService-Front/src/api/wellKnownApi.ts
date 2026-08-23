import { apiClient } from './client';
import { JwksResponse } from '../types/permission.types';

export const wellKnownApi = {
  getJwks: () =>
    apiClient<JwksResponse>('/.well-known/jwks.json', {
      skipAuth: true
    })
};
