import client from './client';

export const register = (data: { ad: string; email: string; sifre: string; rol?: string }) =>
  client.post('/auth/register', data);

export const login = (data: { email: string; sifre: string }) =>
  client.post('/auth/login', data);
