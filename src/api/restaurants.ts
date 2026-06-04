import client from './client';

export const getRestaurants = () => client.get('/restaurants');
export const getRestaurant = (id: string) => client.get(`/restaurants/${id}`);
