import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Checkout() {
  const [cart, setCart] = useState([]);
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    phone: '',
    address: '',
    city: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    try {
      const cartData = localStorage.getItem('cart');
      const items = cartData ? JSON.parse(cartData) : [];
      if (items.length === 0) {
        navigate('/cart');
        return;
      }
      setCart(items);
      
      // Pre-fill form with user data if authenticated
      if (user) {
        setCustomerInfo(prev => ({
          ...prev,
          name: user.name || '',
          phone: user.phone || ''
        }));
      }
    } catch (err) {
      console.error('Checkout loading error:', err);
      navigate('/cart');
    }
  }, [navigate, user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validate form
      if (!customerInfo.name || !customerInfo.phone || !customerInfo.address) {
        throw new Error('Please fill in all required fields');
      }

      const orderData = {
        customerName: customerInfo.name,
        customerPhone: customerInfo.phone,
        deliveryAddress: customerInfo.address,
        city: customerInfo.city || 'N/A',
        items: cart.map(item => ({
          menuItemId: item.id,
          quantity: item.quantity,
          price: Number(item.price)
        })),
        totalAmount: cart.reduce((sum, item) => sum + (Number(item.price) * item.quantity), 0)
      };

      // Use appropriate endpoint based on authentication status
      const endpoint = user 
        ? 'http://localhost:4000/api/orders' 
        : 'http://localhost:4000/api/orders/guest';
      
      const headers = {
        'Content-Type': 'application/json',
      };
      
      // Add authorization header if user is authenticated
      if (user) {
        const token = localStorage.getItem('token');
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Order failed: ${errorData}`);
      }

      const result = await response.json();
      
      // Clear cart and redirect
      localStorage.removeItem('cart');
      alert(`Order placed successfully! Order ID: ${result.orderId}`);
      navigate('/orders');
    } catch (err) {
      console.error('Order error:', err);
      setError(err.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  const total = cart.reduce((sum, item) => sum + (Number(item.price) * item.quantity), 0);

  if (cart.length === 0) {
    return <div className="text-center p-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="card">
        <h1 className="text-xl font-bold mb-4">Checkout</h1>

        <div className="mb-6 p-4 bg-gray-50 rounded">
          <h2 className="text-base font-semibold mb-3">Order Summary</h2>
          {cart.map((item) => (
            <div key={item.id} className="flex items-center justify-between py-2 border-b">
              <span>{item.name} x {item.quantity}</span>
              <span>${(Number(item.price) * item.quantity).toFixed(2)}</span>
            </div>
          ))}
          <div className="flex items-center justify-between py-3 text-lg font-bold border-t mt-2">
            <span>Total:</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <h2 className="text-base font-semibold">Delivery Information</h2>
          {error && <div className="p-3 bg-red-100 text-red-800 rounded border border-red-200">{error}</div>}

          <div>
            <label className="block mb-1 font-medium">Full Name *</label>
            <input
              type="text"
              required
              value={customerInfo.name}
              onChange={(e) => setCustomerInfo({...customerInfo, name: e.target.value})}
              className="input"
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Phone Number *</label>
            <input
              type="tel"
              required
              value={customerInfo.phone}
              onChange={(e) => setCustomerInfo({...customerInfo, phone: e.target.value})}
              className="input"
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Delivery Address *</label>
            <textarea
              required
              rows="3"
              value={customerInfo.address}
              onChange={(e) => setCustomerInfo({...customerInfo, address: e.target.value})}
              className="input resize-y"
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">City</label>
            <input
              type="text"
              value={customerInfo.city}
              onChange={(e) => setCustomerInfo({...customerInfo, city: e.target.value})}
              className="input"
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate('/cart')}
              className="inline-flex items-center gap-2 rounded-md bg-gray-700 hover:bg-gray-800 text-white px-4 py-2 text-sm font-semibold"
            >
              Back to Cart
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn bg-green-600 hover:bg-green-700"
            >
              {loading ? 'Placing Order...' : `Place Order - $${total.toFixed(2)}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
