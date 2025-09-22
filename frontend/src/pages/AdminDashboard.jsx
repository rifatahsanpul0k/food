import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AdminDashboard() {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({ totalOrders: 0, totalUsers: 0, totalRestaurants: 0, totalRevenue: 0 });
  const [recentOrders, setRecentOrders] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (!userData || !token) { navigate('/login'); return; }
    const parsedUser = JSON.parse(userData);
    if (parsedUser.role !== 'admin') { navigate('/dashboard'); return; }
    setUser(parsedUser);
    fetchAdminData();
  }, [navigate]);

  const fetchAdminData = async () => {
    try {
      const ordersResponse = await fetch('http://localhost:4000/api/orders');
      if (ordersResponse.ok) {
        const orders = await ordersResponse.json();
        setRecentOrders(orders.slice(0, 10));
        const totalRevenue = orders.reduce((sum, order) => sum + Number(order.total), 0);
        setStats(prev => ({ ...prev, totalOrders: orders.length, totalRevenue }));
      }
      const usersResponse = await fetch('http://localhost:4000/api/users');
      if (usersResponse.ok) {
        const users = await usersResponse.json();
        setStats(prev => ({ ...prev, totalUsers: users.length }));
      }
      const restaurantsResponse = await fetch('http://localhost:4000/api/restaurants');
      if (restaurantsResponse.ok) {
        const restaurants = await restaurantsResponse.json();
        setStats(prev => ({ ...prev, totalRestaurants: restaurants.length }));
      }
    } catch (err) {
      console.error('Failed to fetch admin data:', err);
    }
  };

  const handleLogout = () => { localStorage.removeItem('token'); localStorage.removeItem('user'); navigate('/login'); };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const response = await fetch(`http://localhost:4000/api/orders/${orderId}/status`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: newStatus }) });
      if (response.ok) fetchAdminData();
    } catch (err) { console.error('Failed to update order status:', err); }
  };

  if (!user) return <div className="p-6">Loading...</div>;

  return (
    <div className="container max-w-6xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="card flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold mb-1">Admin Dashboard</h1>
          <p className="text-gray-600">Welcome, {user.name}</p>
        </div>
        <button onClick={handleLogout} className="inline-flex items-center gap-2 rounded-md bg-red-600 hover:bg-red-700 text-white px-4 py-2 text-sm font-semibold">Logout</button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg bg-blue-600 text-white p-5 text-center">
          <h3 className="text-3xl font-bold mb-1">{stats.totalOrders}</h3>
          <p>Total Orders</p>
        </div>
        <div className="rounded-lg bg-green-600 text-white p-5 text-center">
          <h3 className="text-3xl font-bold mb-1">{stats.totalUsers}</h3>
          <p>Total Users</p>
        </div>
        <div className="rounded-lg bg-yellow-400 text-gray-900 p-5 text-center">
          <h3 className="text-3xl font-bold mb-1">{stats.totalRestaurants}</h3>
          <p>Total Restaurants</p>
        </div>
        <div className="rounded-lg bg-gray-900 text-white p-5 text-center">
          <h3 className="text-3xl font-bold mb-1">${stats.totalRevenue.toFixed(2)}</h3>
          <p>Total Revenue</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <button
            onClick={() => navigate('/delivery-management')}
            className="p-4 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="font-semibold text-blue-600">Delivery Management</div>
            <div className="text-sm text-gray-600">Manage delivery persons and applications</div>
          </button>
          <button
            onClick={() => navigate('/analytics')}
            className="p-4 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="font-semibold text-green-600">Analytics</div>
            <div className="text-sm text-gray-600">View detailed analytics and reports</div>
          </button>
          <button
            onClick={() => navigate('/admin-profile')}
            className="p-4 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="font-semibold text-purple-600">Admin Profile</div>
            <div className="text-sm text-gray-600">Manage your admin profile</div>
          </button>
          <button
            onClick={() => navigate('/orders')}
            className="p-4 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="font-semibold text-orange-600">All Orders</div>
            <div className="text-sm text-gray-600">View and manage all orders</div>
          </button>
        </div>
      </div>

      {/* Recent Orders Management */}
      <div className="card">
        <h2 className="text-lg font-semibold mb-4">Recent Orders Management</h2>
        {recentOrders.length === 0 ? (
          <p className="text-center text-gray-500 py-6">No orders found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  <th className="p-3 text-left border-b">Order ID</th>
                  <th className="p-3 text-left border-b">Date</th>
                  <th className="p-3 text-left border-b">Amount</th>
                  <th className="p-3 text-left border-b">Status</th>
                  <th className="p-3 text-left border-b">Actions</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.id}>
                    <td className="p-3 border-b">#{order.id}</td>
                    <td className="p-3 border-b">{new Date(order.created_at).toLocaleDateString()}</td>
                    <td className="p-3 border-b">${Number(order.total).toFixed(2)}</td>
                    <td className="p-3 border-b">
                      <span className={`px-2 py-1 rounded-full text-xs text-white ${
                        order.status === 'PENDING' ? 'bg-yellow-500' :
                        order.status === 'CONFIRMED' ? 'bg-sky-600' :
                        order.status === 'PREPARING' ? 'bg-orange-500' :
                        order.status === 'DELIVERED' ? 'bg-green-600' : 'bg-red-600'
                      }`}>{order.status}</span>
                    </td>
                    <td className="p-3 border-b space-x-2">
                      {order.status === 'PENDING' && (
                        <button onClick={() => updateOrderStatus(order.id, 'CONFIRMED')} className="px-2 py-1 rounded bg-green-600 hover:bg-green-700 text-white text-xs">Confirm</button>
                      )}
                      {order.status === 'CONFIRMED' && (
                        <button onClick={() => updateOrderStatus(order.id, 'PREPARING')} className="px-2 py-1 rounded bg-orange-500 hover:bg-orange-600 text-white text-xs">Prepare</button>
                      )}
                      {order.status === 'PREPARING' && (
                        <button onClick={() => updateOrderStatus(order.id, 'DELIVERED')} className="px-2 py-1 rounded bg-green-600 hover:bg-green-700 text-white text-xs">Deliver</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
