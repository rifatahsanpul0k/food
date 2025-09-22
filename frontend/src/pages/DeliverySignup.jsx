import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function DeliverySignup() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    vehicleType: '',
    licenseNumber: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validate vehicle type selection
    if (!formData.vehicleType) {
      setError('Please select a vehicle type');
      setLoading(false);
      return;
    }

    try {
      console.log('Submitting form data:', formData); // Debug log
      const response = await fetch('http://localhost:4000/api/auth/delivery-signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Registration failed');

      // Show success message for pending approval
      if (data.status === 'pending') {
        setError(''); // Clear any previous errors
        alert(`Application submitted successfully! 
        
Your delivery partner application has been received and is pending admin approval. 
You will be contacted once your application is reviewed.
        
Application ID: ${data.applicationId}`);
        navigate('/'); // Redirect to home page
      } else {
        login(data.user, data.token);
        navigate('/delivery-dashboard');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="w-full max-w-md card">
        <h1 className="text-xl font-bold text-center mb-6">Join as Delivery Partner</h1>
        
        {error && (
          <div className="p-3 bg-red-100 text-red-800 rounded border border-red-200 mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 font-medium">Full Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="input"
              placeholder="Enter your full name"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Email *</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="input"
              placeholder="Enter your email address"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Password *</label>
            <input
              type="password"
              required
              minLength="6"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="input"
              placeholder="Create a password (min 6 characters)"
            />
            <small className="text-xs text-gray-500">Minimum 6 characters</small>
          </div>

          <div>
            <label className="block mb-1 font-medium">Phone Number *</label>
            <input
              type="tel"
              required
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="input"
              placeholder="Enter your phone number"
            />
          </div>

                    <div>
            <label className="block mb-1 font-medium">Vehicle Type *</label>
            <select
              required
              value={formData.vehicleType}
              onChange={(e) => {
                console.log('Vehicle type selected:', e.target.value); // Debug log
                setFormData({ ...formData, vehicleType: e.target.value });
              }}
              className={`input ${!formData.vehicleType ? 'text-gray-400' : 'text-gray-900'}`}
            >
              <option value="" disabled className="text-gray-400">Select Vehicle Type</option>
              <option value="bike" className="text-gray-900">Motorcycle/Bike</option>
              <option value="bicycle" className="text-gray-900">Bicycle</option>
              <option value="car" className="text-gray-900">Car</option>
              <option value="scooter" className="text-gray-900">Scooter</option>
            </select>
            {formData.vehicleType && (
              <small className="text-xs text-green-600">✓ Vehicle type selected: {formData.vehicleType}</small>
            )}
          </div>

          <div>
            <label className="block mb-1 font-medium">License Number *</label>
            <input
              type="text"
              required
              value={formData.licenseNumber}
              onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
              className="input"
              placeholder="Enter your driving license number"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !formData.vehicleType}
            className={`btn bg-blue-600 hover:bg-blue-700 w-full ${loading || !formData.vehicleType ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {loading ? 'Registering...' : 'Join as Delivery Partner'}
          </button>
        </form>

        <div className="text-center mt-4 text-sm text-gray-600">
          <p>
            Already have an account? <Link to="/login" className="text-blue-600 hover:underline">Login</Link>
          </p>
        </div>

        <div className="text-center mt-4 text-sm text-gray-600">
          <p>
            Want to order food? <Link to="/signup" className="text-blue-600 hover:underline">Sign up as Customer</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
