import client from './client';

export const createOrder = (data: any) => client.post('/orders', data);
export const getMyOrders = () => client.get('/orders/my');
export const getOrder = (id: string) => client.get(`/orders/${id}`);
export const getRestaurantOrders = () => client.get('/orders/restaurant');
export const updateOrderStatus = (id: string, durum: string) =>
  client.patch(`/orders/${id}/status`, { durum });
