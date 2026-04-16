import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import './Auth.css';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success('Welcome back!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-deco">
        <div className="deco-circle c1" />
        <div className="deco-circle c2" />
        <div className="deco-circle c3" />
        <div className="auth-brand">
          <span className="brand-icon">◈</span>
          <span className="brand-name">Spendly</span>
          <p className="brand-tagline">Track every penny. Own every decision.</p>
        </div>
      </div>

      <div className="auth-form-side">
        <form className="auth-form fade-in" onSubmit={handleSubmit}>
          <h1 className="auth-title">Welcome back</h1>
          <p className="auth-subtitle">Sign in to your account</p>

          <div className="field">
            <label>Email</label>
            <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="you@example.com" required />
          </div>
          <div className="field">
            <label>Password</label>
            <input type="password" name="password" value={form.password} onChange={handleChange} placeholder="••••••••" required />
          </div>

          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? <span className="spinner" /> : 'Sign In'}
          </button>

          <p className="auth-switch">Don't have an account? <Link to="/register">Create one</Link></p>
        </form>
      </div>
    </div>
  );
}
