import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import './Settings.css';

export default function Settings() {
  const { user, updateProfile } = useAuth();
  const [profile, setProfile] = useState({ name: user?.name || '', currency: user?.currency || 'USD', monthlyBudget: user?.monthlyBudget || '' });
  const [password, setPassword] = useState({ current: '', next: '', confirm: '' });
  const [saving, setSaving] = useState(false);

  const handleProfile = async e => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateProfile({ name: profile.name, currency: profile.currency, monthlyBudget: parseFloat(profile.monthlyBudget) || 0 });
      toast.success('Profile updated');
    } catch {
      toast.error('Update failed');
    } finally {
      setSaving(false);
    }
  };

  const handlePassword = async e => {
    e.preventDefault();
    if (password.next !== password.confirm) return toast.error('Passwords do not match');
    if (password.next.length < 6) return toast.error('Min 6 characters');
    setSaving(true);
    try {
      await updateProfile({ password: password.next });
      setPassword({ current: '', next: '', confirm: '' });
      toast.success('Password changed');
    } catch {
      toast.error('Failed to change password');
    } finally {
      setSaving(false);
    }
  };

  const currencies = ['USD', 'EUR', 'GBP', 'INR', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY', 'BRL'];

  return (
    <div className="settings fade-in">
      <div className="page-header">
        <h1 className="page-title">Settings</h1>
        <p className="page-sub">Manage your account preferences</p>
      </div>

      <div className="settings-grid">
        {/* Profile */}
        <div className="settings-card">
          <h2 className="section-title">Profile</h2>
          <form onSubmit={handleProfile}>
            <div className="field">
              <label>Full Name</label>
              <input value={profile.name} onChange={e => setProfile(p => ({ ...p, name: e.target.value }))} placeholder="Your name" />
            </div>
            <div className="field">
              <label>Email</label>
              <input value={user?.email} disabled className="disabled" />
            </div>
            <div className="field">
              <label>Currency</label>
              <select value={profile.currency} onChange={e => setProfile(p => ({ ...p, currency: e.target.value }))}>
                {currencies.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="field">
              <label>Monthly Budget <span className="opt">(0 = no limit)</span></label>
              <input type="number" value={profile.monthlyBudget} onChange={e => setProfile(p => ({ ...p, monthlyBudget: e.target.value }))} placeholder="0.00" min="0" step="0.01" />
            </div>
            <button type="submit" className="save-btn" disabled={saving}>
              {saving ? <span className="spinner" /> : 'Save Changes'}
            </button>
          </form>
        </div>

        {/* Password */}
        <div className="settings-card">
          <h2 className="section-title">Change Password</h2>
          <form onSubmit={handlePassword}>
            <div className="field">
              <label>New Password</label>
              <input type="password" value={password.next} onChange={e => setPassword(p => ({ ...p, next: e.target.value }))} placeholder="Min. 6 characters" />
            </div>
            <div className="field">
              <label>Confirm New Password</label>
              <input type="password" value={password.confirm} onChange={e => setPassword(p => ({ ...p, confirm: e.target.value }))} placeholder="••••••••" />
            </div>
            <button type="submit" className="save-btn" disabled={saving}>
              {saving ? <span className="spinner" /> : 'Update Password'}
            </button>
          </form>

          {/* Account Info */}
          <div className="info-block">
            <h3>Account Info</h3>
            <div className="info-row"><span>Member since</span><span>{new Date(user?.createdAt).toLocaleDateString()}</span></div>
            <div className="info-row"><span>Currency</span><span>{user?.currency}</span></div>
            <div className="info-row"><span>Budget</span><span>{user?.monthlyBudget > 0 ? `${user.currency} ${user.monthlyBudget}/mo` : 'No limit'}</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
