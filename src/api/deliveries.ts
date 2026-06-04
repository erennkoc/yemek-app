import client from './client';

export const getAvailableDeliveries = () => client.get('/deliveries/available');
export const getMyDeliveries = () => client.get('/deliveries/my');
export const acceptDelivery = (id: string) => client.patch(`/deliveries/${id}/accept`);
export const completeDelivery = (id: string) => client.patch(`/deliveries/${id}/complete`);
