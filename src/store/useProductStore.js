// stores/useProductStore.js
import { create } from 'zustand';
import api from '../services/api';

export const useProductStore = create((set, get) => ({
  products: [],
  loading: false,
  
  getProducts: async () => {
    set({ loading: true });
    try {
      const { data } = await api.get('/products/admin');
      console.log('✅ Products loaded:', data.products?.length || 0);
      set({ products: data.products || [] });
    } catch (error) {
      console.error('Products fetch error:', error.response?.data || error.message);
      set({ products: [] }); // Empty on error
    } finally {
      set({ loading: false });
    }
  },

  createProduct: async (productData) => {
    try {
      const { data } = await api.post('/products/admin', productData, {
        headers: { 'Content-Type': 'application/json' }
      });
      return data;
    } catch (error) {
      console.error('Create error:', error);
      throw error;
    }
  },

  updateProduct: async (id, productData) => {
    const { data } = await api.put(`/products/admin/${id}`, productData);
    return data;
  },

  deleteProduct: async (id) => {
    const { data } = await api.delete(`/products/admin/${id}`);
    return data;
  }
}));
