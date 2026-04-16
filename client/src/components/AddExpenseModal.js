import React, { useState, useEffect } from 'react';
import { createExpense, updateExpense, CATEGORIES } from '../utils/api';
import toast from 'react-hot-toast';
import './Modal.css';

const defaultForm = {
  title: '', amount: '', type: 'expense', category: 'Other',
  date: new Date().toISOString().split('T')[0], note: '',
};

export default function AddExpenseModal({ onClose, onSaved, editing }) {
  const [form, setForm] = useState(editing ? {
    ...editing,
    amount: editing.amount.toString(),
    date: new Date(editing.date).toISOString().split('T')[0],
  } : defaultForm);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handler = e => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.title.trim() || !form.amount) return toast.error('Title and amount are required');
    const amount = parseFloat(form.amount);
    if (isNaN(amount) || amount <= 0) return toast.error('Enter a valid positive amount');
    setLoading(true);
    try {
      if (editing) {
        await updateExpense(editing._id, { ...form, amount });
        toast.success('Transaction updated');
      } else {
        await createExpense({ ...form, amount });
        toast.success('Transaction added');
      }
      onSaved();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal fade-in">
        <div className="modal-header">
          <h2>{editing ? 'Edit Transaction' : 'Add Transaction'}</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Type Toggle */}
          <div className="type-toggle">
            <button type="button" className={`type-btn ${form.type === 'expense' ? 'active expense' : ''}`} onClick={() => set('type', 'expense')}>
              ↓ Expense
            </button>
            <button type="button" className={`type-btn ${form.type === 'income' ? 'active income' : ''}`} onClick={() => set('type', 'income')}>
              ↑ Income
            </button>
          </div>

          <div className="field">
            <label>Title</label>
            <input value={form.title} onChange={e => set('title', e.target.value)} placeholder="e.g. Grocery run" required />
          </div>

          <div className="field-row">
            <div className="field">
              <label>Amount</label>
              <input type="number" value={form.amount} onChange={e => set('amount', e.target.value)} placeholder="0.00" min="0.01" step="0.01" required />
            </div>
            <div className="field">
              <label>Date</label>
              <input type="date" value={form.date} onChange={e => set('date', e.target.value)} required />
            </div>
          </div>

          <div className="field">
            <label>Category</label>
            <select value={form.category} onChange={e => set('category', e.target.value)}>
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>

          <div className="field">
            <label>Note <span style={{ color: 'var(--text-dim)' }}>(optional)</span></label>
            <textarea value={form.note} onChange={e => set('note', e.target.value)} placeholder="Any additional details..." rows={2} />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? <span className="spinner" /> : editing ? 'Save Changes' : 'Add Transaction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
