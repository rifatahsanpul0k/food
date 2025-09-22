import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Signup() {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', phone: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true); setError('');
    try {
      const response = await fetch('http://localhost:4000/api/auth/signup', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Signup failed');
      login(data.user, data.token);
      navigate('/dashboard');
    } catch (err) { setError(err.message); } finally { setLoading(false); }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="w-full max-w-sm card">
        <h1 className="text-xl font-bold text-center mb-6">Sign Up</h1>
        {error && <div className="p-3 bg-red-100 text-red-800 rounded border border-red-200 mb-4">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 font-medium">Full Name</label>
            <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="input" />
          </div>
          <div>
            <label className="block mb-1 font-medium">Email</label>
            <input type="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="input" />
          </div>
          <div>
            <label className="block mb-1 font-medium">Password</label>
            <input type="password" required minLength="6" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className="input" />
            <small className="text-xs text-gray-500">Minimum 6 characters</small>
          </div>
          <div>
            <label className="block mb-1 font-medium">Phone (Optional)</label>
            <input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="input" />
          </div>
          <button type="submit" disabled={loading} className={`btn bg-green-600 hover:bg-green-700 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}>{loading ? 'Creating Account...' : 'Sign Up'}</button>
        </form>
        <div className="text-center mt-4 text-sm text-gray-600">
          <p>
            Already have an account? <Link to="/login" className="text-blue-600 hover:underline">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
