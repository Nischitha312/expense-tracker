import React, { useState, useEffect, useCallback } from 'react';
import { getSummary, getExpenses, formatCurrency, CATEGORY_COLORS } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line,
} from 'recharts';
import toast from 'react-hot-toast';
import { format, subMonths } from 'date-fns';
import './Analytics.css';

const CustomTooltip = ({ active, payload, label, currency }) => {
  if (active && payload?.length) {
    return (
      <div className="chart-tooltip">
        <p className="tt-label">{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color }}>
            {p.name}: {formatCurrency(p.value, currency)}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function Analytics() {
  const { user } = useAuth();
  const currency = user?.currency || 'USD';
  const [monthData, setMonthData] = useState([]);
  const [catData, setCatData] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [summary, setSummary] = useState({ income: 0, expenses: 0, balance: 0 });
  const [loading, setLoading] = useState(true);

  const loadTrend = useCallback(async () => {
    try {
      const months = Array.from({ length: 6 }, (_, i) => subMonths(new Date(), 5 - i));
      const results = await Promise.all(
        months.map(m => getSummary({ month: m.getMonth() + 1, year: m.getFullYear() }))
      );
      setMonthData(months.map((m, i) => ({
        month: format(m, 'MMM'),
        income: results[i].data.income,
        expenses: results[i].data.expenses,
      })));
    } catch {
      toast.error('Failed to load trend data');
    }
  }, []);

  const loadMonthly = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getSummary({ month: selectedMonth, year: selectedYear });
      setSummary(res.data);
      setCatData(res.data.byCategory.map(c => ({ name: c._id, value: c.total })));
    } catch {
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  }, [selectedMonth, selectedYear]);

  useEffect(() => { loadTrend(); }, [loadTrend]);
  useEffect(() => { loadMonthly(); }, [loadMonthly]);

  const months = Array.from({ length: 12 }, (_, i) => ({ value: i + 1, label: format(new Date(2024, i), 'MMMM') }));
  const years = [2022, 2023, 2024, 2025, 2026];

  return (
    <div className="analytics fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Analytics</h1>
          <p className="page-sub">Visual breakdown of your finances</p>
        </div>
        <div className="month-picker">
          <select value={selectedMonth} onChange={e => setSelectedMonth(+e.target.value)}>
            {months.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
          </select>
          <select value={selectedYear} onChange={e => setSelectedYear(+e.target.value)}>
            {years.map(y => <option key={y}>{y}</option>)}
          </select>
        </div>
      </div>

      {/* Summary Row */}
      <div className="stat-row">
        {[
          { label: 'Income', value: summary.income, cls: 'green' },
          { label: 'Expenses', value: summary.expenses, cls: 'red' },
          { label: 'Net Savings', value: summary.balance, cls: summary.balance >= 0 ? 'green' : 'red' },
          { label: 'Savings Rate', value: summary.income > 0 ? `${((summary.balance / summary.income) * 100).toFixed(1)}%` : '—', cls: '' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div className="stat-label">{s.label}</div>
            <div className={`stat-value ${s.cls}`}>
              {typeof s.value === 'number' ? formatCurrency(s.value, currency) : s.value}
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="charts-row">
        {/* 6-month trend */}
        <div className="chart-panel wide">
          <h3 className="chart-title">6-Month Income vs Expenses</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={monthData} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="month" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
              <Tooltip content={<CustomTooltip currency={currency} />} cursor={{ fill: 'var(--surface3)' }} />
              <Bar dataKey="income" name="Income" fill="var(--green)" radius={[4,4,0,0]} />
              <Bar dataKey="expenses" name="Expenses" fill="var(--red)" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Category Pie */}
        <div className="chart-panel">
          <h3 className="chart-title">Expenses by Category</h3>
          {catData.length === 0 ? (
            <div className="empty-state">No expense data</div>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={catData} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={3} dataKey="value">
                  {catData.map((entry, i) => (
                    <Cell key={i} fill={CATEGORY_COLORS[entry.name] || '#888'} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => formatCurrency(v, currency)} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, color: 'var(--text-muted)' }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Category Bars */}
      {catData.length > 0 && (
        <div className="chart-panel" style={{ marginTop: 16 }}>
          <h3 className="chart-title">Category Spending</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={catData} layout="vertical" margin={{ left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
              <XAxis type="number" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} width={90} />
              <Tooltip formatter={(v) => formatCurrency(v, currency)} cursor={{ fill: 'var(--surface3)' }} />
              <Bar dataKey="value" name="Amount" radius={[0,4,4,0]}>
                {catData.map((entry, i) => (
                  <Cell key={i} fill={CATEGORY_COLORS[entry.name] || '#888'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
