import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { getSummary, getExpenses, formatCurrency, CATEGORY_ICONS, CATEGORY_COLORS } from '../utils/api';
import AddExpenseModal from '../components/AddExpenseModal';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import './Dashboard.css';

export default function Dashboard() {
  const { user } = useAuth();
  const [summary, setSummary] = useState({ income: 0, expenses: 0, balance: 0, byCategory: [] });
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const now = new Date();

  const load = useCallback(async () => {
    try {
      const [sumRes, expRes] = await Promise.all([
        getSummary({ month: now.getMonth() + 1, year: now.getFullYear() }),
        getExpenses({ limit: 6 }),
      ]);
      setSummary(sumRes.data);
      setRecent(expRes.data.expenses);
    } catch {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const budgetPct = user?.monthlyBudget > 0 ? Math.min((summary.expenses / user.monthlyBudget) * 100, 100) : 0;
  const currency = user?.currency || 'USD';

  if (loading) return (
    <div className="page-loading">
      <div className="loading-spinner" />
    </div>
  );

  return (
    <div className="dashboard fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-sub">{format(now, 'MMMM yyyy')}</p>
        </div>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          <span>+</span> Add Transaction
        </button>
      </div>

      {/* Summary Cards */}
      <div className="cards-grid">
        <div className="summary-card balance">
          <div className="card-label">Net Balance</div>
          <div className="card-amount">{formatCurrency(summary.balance, currency)}</div>
          <div className="card-badge">{summary.balance >= 0 ? '↑ Positive' : '↓ Negative'}</div>
        </div>
        <div className="summary-card income">
          <div className="card-label">Total Income</div>
          <div className="card-amount green">{formatCurrency(summary.income, currency)}</div>
          <div className="card-badge green">↑ This month</div>
        </div>
        <div className="summary-card expenses">
          <div className="card-label">Total Expenses</div>
          <div className="card-amount red">{formatCurrency(summary.expenses, currency)}</div>
          <div className="card-badge red">↓ This month</div>
        </div>
      </div>

      {/* Budget Progress */}
      {user?.monthlyBudget > 0 && (
        <div className="budget-card">
          <div className="budget-header">
            <div>
              <span className="budget-label">Monthly Budget</span>
              <span className="budget-values">
                {formatCurrency(summary.expenses, currency)} / {formatCurrency(user.monthlyBudget, currency)}
              </span>
            </div>
            <span className={`budget-pct ${budgetPct > 80 ? 'danger' : budgetPct > 60 ? 'warn' : 'ok'}`}>{budgetPct.toFixed(0)}%</span>
          </div>
          <div className="progress-track">
            <div
              className={`progress-fill ${budgetPct > 80 ? 'danger' : budgetPct > 60 ? 'warn' : 'ok'}`}
              style={{ width: `${budgetPct}%` }}
            />
          </div>
        </div>
      )}

      <div className="two-col">
        {/* Recent Transactions */}
        <div className="panel">
          <div className="panel-header">
            <h2>Recent Transactions</h2>
            <a href="/transactions" className="panel-link">View all →</a>
          </div>
          {recent.length === 0 ? (
            <div className="empty-state">No transactions yet. Add one!</div>
          ) : (
            <div className="tx-list">
              {recent.map(tx => (
                <div key={tx._id} className="tx-item">
                  <div className="tx-icon" style={{ background: `${CATEGORY_COLORS[tx.category]}20`, color: CATEGORY_COLORS[tx.category] }}>
                    {CATEGORY_ICONS[tx.category]}
                  </div>
                  <div className="tx-info">
                    <span className="tx-title">{tx.title}</span>
                    <span className="tx-meta">{tx.category} · {format(new Date(tx.date), 'MMM d')}</span>
                  </div>
                  <span className={`tx-amount ${tx.type === 'income' ? 'income' : 'expense'}`}>
                    {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount, currency)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Category Breakdown */}
        <div className="panel">
          <div className="panel-header">
            <h2>Spending by Category</h2>
          </div>
          {summary.byCategory.length === 0 ? (
            <div className="empty-state">No expenses this month.</div>
          ) : (
            <div className="category-list">
              {summary.byCategory.slice(0, 6).map(cat => {
                const pct = summary.expenses > 0 ? (cat.total / summary.expenses) * 100 : 0;
                return (
                  <div key={cat._id} className="cat-row">
                    <div className="cat-left">
                      <span className="cat-icon">{CATEGORY_ICONS[cat._id]}</span>
                      <span className="cat-name">{cat._id}</span>
                    </div>
                    <div className="cat-bar-wrap">
                      <div className="cat-bar">
                        <div className="cat-bar-fill" style={{ width: `${pct}%`, background: CATEGORY_COLORS[cat._id] }} />
                      </div>
                      <span className="cat-amount">{formatCurrency(cat.total, currency)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <AddExpenseModal onClose={() => setShowModal(false)} onSaved={() => { setShowModal(false); load(); }} />
      )}
    </div>
  );
}
