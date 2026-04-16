import React, { useState, useEffect, useCallback } from 'react';
import { getExpenses, deleteExpense, formatCurrency, CATEGORY_ICONS, CATEGORY_COLORS, CATEGORIES } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import AddExpenseModal from '../components/AddExpenseModal';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import './Transactions.css';

export default function Transactions() {
  const { user } = useAuth();
  const [data, setData] = useState({ expenses: [], total: 0, pages: 1 });
  const [filters, setFilters] = useState({ type: '', category: '', page: 1 });
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = { limit: 15, ...filters };
      if (!params.type) delete params.type;
      if (!params.category) delete params.category;
      const res = await getExpenses(params);
      setData(res.data);
    } catch {
      toast.error('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this transaction?')) return;
    try {
      await deleteExpense(id);
      toast.success('Deleted');
      load();
    } catch {
      toast.error('Failed to delete');
    }
  };

  const currency = user?.currency || 'USD';

  return (
    <div className="transactions fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Transactions</h1>
          <p className="page-sub">{data.total} total records</p>
        </div>
        <button className="btn-primary" onClick={() => { setEditing(null); setShowModal(true); }}>
          <span>+</span> Add Transaction
        </button>
      </div>

      {/* Filters */}
      <div className="filters">
        <select value={filters.type} onChange={e => setFilters(p => ({ ...p, type: e.target.value, page: 1 }))}>
          <option value="">All Types</option>
          <option value="expense">Expense</option>
          <option value="income">Income</option>
        </select>
        <select value={filters.category} onChange={e => setFilters(p => ({ ...p, category: e.target.value, page: 1 }))}>
          <option value="">All Categories</option>
          {CATEGORIES.map(c => <option key={c}>{c}</option>)}
        </select>
        <button className="btn-ghost-sm" onClick={() => setFilters({ type: '', category: '', page: 1 })}>Clear</button>
      </div>

      {/* Table */}
      <div className="table-wrap">
        {loading ? (
          <div className="table-loading">
            <div className="loading-spinner" />
          </div>
        ) : data.expenses.length === 0 ? (
          <div className="empty-state">No transactions found. Try adjusting filters.</div>
        ) : (
          <table className="tx-table">
            <thead>
              <tr>
                <th>Transaction</th>
                <th>Category</th>
                <th>Date</th>
                <th>Type</th>
                <th>Amount</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {data.expenses.map(tx => (
                <tr key={tx._id}>
                  <td>
                    <div className="tx-cell">
                      <div className="tx-icon-sm" style={{ background: `${CATEGORY_COLORS[tx.category]}20`, color: CATEGORY_COLORS[tx.category] }}>
                        {CATEGORY_ICONS[tx.category]}
                      </div>
                      <div>
                        <div className="tx-title-sm">{tx.title}</div>
                        {tx.note && <div className="tx-note">{tx.note}</div>}
                      </div>
                    </div>
                  </td>
                  <td><span className="cat-tag">{tx.category}</span></td>
                  <td className="date-cell">{format(new Date(tx.date), 'MMM d, yyyy')}</td>
                  <td><span className={`type-tag ${tx.type}`}>{tx.type}</span></td>
                  <td className={`amount-cell ${tx.type}`}>
                    {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount, currency)}
                  </td>
                  <td>
                    <div className="row-actions">
                      <button className="action-btn edit" onClick={() => { setEditing(tx); setShowModal(true); }}>✎</button>
                      <button className="action-btn delete" onClick={() => handleDelete(tx._id)}>✕</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {data.pages > 1 && (
        <div className="pagination">
          <button disabled={filters.page <= 1} onClick={() => setFilters(p => ({ ...p, page: p.page - 1 }))}>← Prev</button>
          <span>Page {filters.page} of {data.pages}</span>
          <button disabled={filters.page >= data.pages} onClick={() => setFilters(p => ({ ...p, page: p.page + 1 }))}>Next →</button>
        </div>
      )}

      {showModal && (
        <AddExpenseModal
          editing={editing}
          onClose={() => { setShowModal(false); setEditing(null); }}
          onSaved={() => { setShowModal(false); setEditing(null); load(); }}
        />
      )}
    </div>
  );
}
