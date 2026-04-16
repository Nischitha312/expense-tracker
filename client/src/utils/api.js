import axios from 'axios';

export const getExpenses = (params) => axios.get('/api/expenses', { params });
export const getSummary = (params) => axios.get('/api/expenses/summary', { params });
export const createExpense = (data) => axios.post('/api/expenses', data);
export const updateExpense = (id, data) => axios.put(`/api/expenses/${id}`, data);
export const deleteExpense = (id) => axios.delete(`/api/expenses/${id}`);

export const CATEGORIES = ['Food', 'Transport', 'Housing', 'Entertainment', 'Healthcare', 'Shopping', 'Education', 'Salary', 'Freelance', 'Investment', 'Other'];

export const CATEGORY_ICONS = {
  Food: '🍔', Transport: '🚗', Housing: '🏠', Entertainment: '🎮',
  Healthcare: '💊', Shopping: '🛍️', Education: '📚', Salary: '💼',
  Freelance: '💻', Investment: '📈', Other: '📦'
};

export const CATEGORY_COLORS = {
  Food: '#ff7043', Transport: '#42a5f5', Housing: '#ab47bc', Entertainment: '#ffa726',
  Healthcare: '#ef5350', Shopping: '#ec407a', Education: '#26c6da', Salary: '#22d3a5',
  Freelance: '#6c63ff', Investment: '#66bb6a', Other: '#78909c'
};

export const formatCurrency = (amount, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency, minimumFractionDigits: 2 }).format(amount);
};

export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};
