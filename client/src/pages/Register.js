import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import './Auth.css';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();

  const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    if (form.password !== form.confirm) return toast.error('Passwords do not match');
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      toast.success('Account created!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
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
          <h1 className="auth-title">Create account</h1>
          <p className="auth-subtitle">Start tracking your expenses today</p>

          <div className="field">
            <label>Full Name</label>
            <input name="name" value={form.name} onChange={handleChange} placeholder="Jane Doe" required />
          </div>
          <div className="field">
            <label>Email</label>
            <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="you@example.com" required />
          </div>
          <div className="field">
            <label>Password</label>
            <input type="password" name="password" value={form.password} onChange={handleChange} placeholder="Min. 6 characters" required />
          </div>
          <div className="field">
            <label>Confirm Password</label>
            <input type="password" name="confirm" value={form.confirm} onChange={handleChange} placeholder="••••••••" required />
          </div>

          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? <span className="spinner" /> : 'Create Account'}
          </button>

          <p className="auth-switch">Already have an account? <Link to="/login">Sign in</Link></p>
        </form>
      </div>
    </div>
  );
}
