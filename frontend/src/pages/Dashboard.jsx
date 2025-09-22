import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (!userData || !token) { navigate('/login'); return; }
    setUser(JSON.parse(userData));
    fetchUserOrders();
  }, [navigate]);

  const fetchUserOrders = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/orders');
      if (response.ok) {
        const data = await response.json();
        setOrders(data.slice(0, 5));
      }
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (!user) return <div className="p-6">Loading...</div>;

  return (
    <div className="container max-w-4xl mx-auto p-4">
      {/* Header */}
      <div className="card flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold mb-1">
            Welcome, {user.name}!
          </h1>
          <p className="text-gray-600">Email: {user.email}</p>
        </div>
        <button 
          onClick={handleLogout} 
          className="inline-flex items-center gap-2 rounded-md bg-red-600 hover:bg-red-700 text-white px-4 py-2 text-sm font-semibold"
        >
          Logout
        </button>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 sm:grid-cols-3 mb-6">
        <Link 
          to="/" 
          className="block rounded-lg bg-blue-600 text-white px-4 py-6 text-center font-semibold hover:bg-blue-700"
        >
          Browse Restaurants
        </Link>
        <Link 
          to="/orders" 
          className="block rounded-lg bg-green-600 text-white px-4 py-6 text-center font-semibold hover:bg-green-700"
        >
          View All Orders
        </Link>
        <Link 
          to="/cart" 
          className="block rounded-lg bg-yellow-400 text-gray-900 px-4 py-6 text-center font-semibold hover:bg-yellow-500"
        >
          View Cart
        </Link>
      </div>

      {/* Recent Orders */}
      <div className="card">
        <h2 className="text-lg font-semibold mb-4">
          Recent Orders
        </h2>
        
        {orders.length === 0 ? (
          <p className="text-center text-gray-500 py-6">
            No orders yet. Start by browsing restaurants!
          </p>
        ) : (
          orders.map((order) => (
            <div key={order.id} className="flex items-center justify-between border rounded-md p-3 mb-2">
              <div>
                <span className="font-semibold">Order #{order.id}</span>
                <span className="text-gray-500 ml-2">
                  {new Date(order.created_at).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className={`px-2 py-1 rounded-full text-xs text-white ${order.status === 'PENDING' ? 'bg-yellow-500' : 'bg-green-600'}`}>
                  {order.status}
                </span>
                <span className="font-semibold">
                  ${Number(order.total).toFixed(2)}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
