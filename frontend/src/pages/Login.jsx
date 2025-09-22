import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true); setError('');
    try {
      const response = await fetch('http://localhost:4000/api/auth/login', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify(formData) 
      });
      const data = await response.json();
      
      if (!response.ok) {
        // Handle specific delivery person status errors
        if (data.status === 'pending') {
          setError('Your delivery person application is pending admin approval. Please wait for approval before logging in.');
        } else if (data.status === 'suspended') {
          setError('Your delivery person account has been suspended. Please contact admin.');
        } else {
          setError(data.error || 'Login failed');
        }
        return;
      }
      
      login(data.user, data.token);
      
      // Navigate based on role
      if (data.user.role === 'admin') {
        navigate('/admin');
      } else if (data.user.role === 'delivery') {
        navigate('/delivery-dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (err) { 
      setError(err.message); 
    } finally { 
      setLoading(false); 
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="w-full max-w-sm card">
        <h1 className="text-xl font-bold text-center mb-6">Login</h1>
        {error && <div className="p-3 bg-red-100 text-red-800 rounded border border-red-200 mb-4">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 font-medium">Email</label>
            <input type="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="input" />
          </div>
          <div>
            <label className="block mb-1 font-medium">Password</label>
            <input type="password" required value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className="input" />
          </div>
          <button type="submit" disabled={loading} className={`btn ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}>{loading ? 'Logging in...' : 'Login'}</button>
        </form>
        <div className="text-center mt-4 text-sm text-gray-600">
          <p>
            Don't have an account? <Link to="/signup" className="text-blue-600 hover:underline">Sign up</Link>
          </p>
          <p className="mt-2">
            Want to deliver? <Link to="/delivery-signup" className="text-green-600 hover:underline">Apply as Delivery Partner</Link>
          </p>
        </div>
        <div className="text-center mt-4 p-3 bg-gray-50 rounded text-xs text-gray-600">
          <p className="mb-1">Demo Accounts:</p>
          <p>Admin: admin@mealmate.com / admin123</p>
          <p className="mt-1 text-orange-600">Note: Delivery person applications require admin approval</p>
        </div>
      </div>
    </div>
  );
}
