import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const API = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

export default function Restaurant() {
  const { id } = useParams();
  const { user } = useAuth();
  const [restaurant, setRestaurant] = useState(null);
  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const restaurantRes = await axios.get(`${API}/restaurants/${id}`);
        setRestaurant(restaurantRes.data);
        const menuRes = await axios.get(`${API}/restaurants/${id}/menu`);
        setMenu(menuRes.data);
      } catch (err) {
        console.error('API Error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const addToCart = (item) => {
    // Prevent delivery persons from ordering food
    if (user && user.role === 'delivery') {
      alert('Delivery persons cannot order food. You can only take and deliver orders.');
      return;
    }
    
    try {
      const cart = JSON.parse(localStorage.getItem('cart') || '[]');
      const existing = cart.find((c) => c.id === item.id);
      if (existing) existing.quantity += 1; else cart.push({ ...item, quantity: 1 });
      localStorage.setItem('cart', JSON.stringify(cart));

      const notification = document.createElement('div');
      notification.textContent = `Added ${item.name} to cart`;
      notification.className = 'fixed top-5 right-5 bg-green-600 text-white px-4 py-2 rounded shadow z-50';
      document.body.appendChild(notification);
      setTimeout(() => document.body.removeChild(notification), 1500);
    } catch (err) {
      console.error('Cart error:', err);
      alert('Failed to add to cart');
    }
  };

  if (loading) return <div className="text-center p-8">Loading restaurant...</div>;
  if (error) return <div className="text-center p-8 text-red-600">Error: {error}</div>;
  if (!restaurant) return <div className="text-center p-8">Restaurant not found</div>;

  return (
    <div className="space-y-6">
      <div className="card">
        <h1 className="text-2xl font-bold mb-1">{restaurant.name}</h1>
        <p className="text-gray-600 mb-2">{restaurant.location}</p>
        <span className="badge bg-yellow-100 text-yellow-800">{restaurant.rating}</span>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {menu.length > 0 ? (
          menu.map((m) => (
            <div key={m.id} className="card">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-base font-semibold mb-1">{m.name}</h3>
                  <p className="text-sm text-gray-500 mb-1">{m.category}</p>
                  {m.description && <p className="text-xs text-gray-400">{m.description}</p>}
                </div>
                <div className="text-right">
                  <div className="text-base font-semibold mb-2">${Number(m.price).toFixed(2)}</div>
                  <button
                    className={`px-3 py-2 rounded text-white text-sm ${m.is_available ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-400 cursor-not-allowed'}`}
                    onClick={() => addToCart(m)}
                    disabled={!m.is_available}
                  >
                    {m.is_available ? 'Add to Cart' : 'Unavailable'}
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="sm:col-span-2 lg:col-span-3 text-center p-10 text-gray-500">No menu items available for this restaurant.</div>
        )}
      </div>

      <div className="flex items-center justify-center gap-3">
        <Link to="/cart" className="btn bg-green-600 hover:bg-green-700">View Cart</Link>
        <Link to="/" className="inline-flex items-center gap-2 rounded-md bg-gray-700 hover:bg-gray-800 text-white px-4 py-2 text-sm font-semibold">Back to Restaurants</Link>
      </div>
    </div>
  );
}
