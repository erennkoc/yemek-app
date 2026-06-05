import client from './client';

export const register = (data: { ad: string; email: string; sifre: string }) =>
  client.post('/auth/register', { ...data, rol: 'MUSTERI' });

export const login = (data: { email: string; sifre: string }) =>
  client.post('/auth/login', data);

export const sendOtp = (telefon: string) =>
  client.post('/auth/otp/send', { telefon });

export const verifyOtp = (telefon: string, kod: string) =>
  client.post('/auth/otp/verify', { telefon, kod });

export const googleAuth = (accessToken: string) =>
  client.post('/auth/google', { accessToken });

export const forgotPassword = (email: string) =>
  client.post('/auth/forgot-password', { email });

export const resetPassword = (data: { email: string; kod: string; yeniSifre: string }) =>
  client.post('/auth/reset-password', data);
