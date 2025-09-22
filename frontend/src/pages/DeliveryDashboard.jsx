import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function DeliveryDashboard() {
  const [deliveryPerson, setDeliveryPerson] = useState(null);
  const [availableOrders, setAvailableOrders] = useState([]);
  const [myOrders, setMyOrders] = useState([]);
  const [stats, setStats] = useState({ totalDeliveries: 0, todayDeliveries: 0, activeOrders: 0, totalEarnings: 0 });
  const [activeTab, setActiveTab] = useState('available');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (!userData || !token) {
      navigate('/login');
      return;
    }
    
    const parsedUser = JSON.parse(userData);
    if (parsedUser.role !== 'delivery') {
      navigate('/dashboard');
      return;
    }
    
    setDeliveryPerson(parsedUser);
    fetchDeliveryData();
  }, [navigate]);

  const fetchDeliveryData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };
      
      const [availableRes, myOrdersRes, statsRes] = await Promise.all([
        fetch('http://localhost:4000/api/delivery/available-orders', { headers }),
        fetch('http://localhost:4000/api/delivery/my-orders', { headers }),
        fetch('http://localhost:4000/api/delivery/stats', { headers })
      ]);

      if (availableRes.ok) setAvailableOrders(await availableRes.json());
      if (myOrdersRes.ok) setMyOrders(await myOrdersRes.json());
      if (statsRes.ok) setStats(await statsRes.json());
    } catch (err) {
      console.error('Failed to fetch delivery data:', err);
    } finally {
      setLoading(false);
    }
  };

  const acceptOrder = async (orderId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:4000/api/delivery/accept-order/${orderId}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        alert('Order accepted successfully!');
        fetchDeliveryData();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to accept order');
      }
    } catch (err) {
      console.error('Error accepting order:', err);
      alert('Failed to accept order');
    }
  };

  const updateOrderStatus = async (orderId, status, notes = '') => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:4000/api/delivery/update-status/${orderId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status, notes })
      });

      if (response.ok) {
        alert('Order status updated successfully!');
        fetchDeliveryData();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to update order status');
      }
    } catch (err) {
      console.error('Error updating order status:', err);
      alert('Failed to update order status');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'CONFIRMED': return 'bg-blue-500';
      case 'PREPARING': return 'bg-yellow-500';
      case 'READY': return 'bg-green-500';
      case 'OUT_FOR_DELIVERY': return 'bg-orange-500';
      case 'DELIVERED': return 'bg-green-600';
      case 'DELIVERY_FAILED': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;
  if (!deliveryPerson) return <div className="p-6">Access denied</div>;

  return (
    <div className="container max-w-6xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="card flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold mb-1">Delivery Dashboard</h1>
          <p className="text-gray-600">Welcome, {deliveryPerson.name}</p>
        </div>
        <button onClick={handleLogout} className="inline-flex items-center gap-2 rounded-md bg-red-600 hover:bg-red-700 text-white px-4 py-2 text-sm font-semibold">
          Logout
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg bg-blue-600 text-white p-5 text-center">
          <h3 className="text-3xl font-bold mb-1">{stats.totalDeliveries}</h3>
          <p>Total Deliveries</p>
        </div>
        <div className="rounded-lg bg-green-600 text-white p-5 text-center">
          <h3 className="text-3xl font-bold mb-1">{stats.todayDeliveries}</h3>
          <p>Today's Deliveries</p>
        </div>
        <div className="rounded-lg bg-orange-500 text-white p-5 text-center">
          <h3 className="text-3xl font-bold mb-1">{stats.activeOrders}</h3>
          <p>Active Orders</p>
        </div>
        <div className="rounded-lg bg-gray-900 text-white p-5 text-center">
          <h3 className="text-3xl font-bold mb-1">${stats.totalEarnings.toFixed(2)}</h3>
          <p>Total Earnings</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b">
        <button
          className={`px-4 py-2 font-medium ${activeTab === 'available' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab('available')}
        >
          Available Orders ({availableOrders.length})
        </button>
        <button
          className={`px-4 py-2 font-medium ${activeTab === 'my-orders' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab('my-orders')}
        >
          My Orders ({myOrders.length})
        </button>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {activeTab === 'available' ? (
          availableOrders.length === 0 ? (
            <div className="card text-center text-gray-500 py-8">No available orders at the moment</div>
          ) : (
            availableOrders.map((order) => (
              <div key={order.id} className="card">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-lg font-semibold">Order #{order.id}</h3>
                    <p className="text-gray-600">{order.restaurant_name}</p>
                    <p className="text-sm text-gray-500">{order.restaurant_location}</p>
                  </div>
                  <div className="text-right">
                    <span className={`px-3 py-1 rounded-full text-xs text-white font-semibold ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                    <p className="mt-2 text-lg font-bold">${Number(order.total).toFixed(2)}</p>
                  </div>
                </div>
                
                <div className="mb-3 p-3 bg-gray-50 rounded">
                  <p className="text-sm"><strong>Customer:</strong> {order.customer_name}</p>
                  <p className="text-sm"><strong>Phone:</strong> {order.customer_phone}</p>
                  <p className="text-sm"><strong>Address:</strong> {order.delivery_address}</p>
                  <p className="text-sm"><strong>Order Time:</strong> {new Date(order.created_at).toLocaleString()}</p>
                </div>

                <button
                  onClick={() => acceptOrder(order.id)}
                  className="btn bg-green-600 hover:bg-green-700"
                >
                  Accept Order
                </button>
              </div>
            ))
          )
        ) : (
          myOrders.length === 0 ? (
            <div className="card text-center text-gray-500 py-8">No orders assigned to you yet</div>
          ) : (
            myOrders.map((order) => (
              <div key={order.id} className="card">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-lg font-semibold">Order #{order.id}</h3>
                    <p className="text-gray-600">{order.restaurant_name}</p>
                    <p className="text-sm text-gray-500">{order.restaurant_location}</p>
                  </div>
                  <div className="text-right">
                    <span className={`px-3 py-1 rounded-full text-xs text-white font-semibold ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                    <p className="mt-2 text-lg font-bold">${Number(order.total).toFixed(2)}</p>
                  </div>
                </div>
                
                <div className="mb-3 p-3 bg-gray-50 rounded">
                  <p className="text-sm"><strong>Customer:</strong> {order.customer_name}</p>
                  <p className="text-sm"><strong>Phone:</strong> {order.customer_phone}</p>
                  <p className="text-sm"><strong>Address:</strong> {order.delivery_address}</p>
                  <p className="text-sm"><strong>Order Time:</strong> {new Date(order.created_at).toLocaleString()}</p>
                  {order.delivery_notes && (
                    <p className="text-sm"><strong>Notes:</strong> {order.delivery_notes}</p>
                  )}
                </div>

                <div className="flex gap-2">
                  {order.status === 'OUT_FOR_DELIVERY' && (
                    <>
                      <button
                        onClick={() => updateOrderStatus(order.id, 'DELIVERED')}
                        className="btn bg-green-600 hover:bg-green-700"
                      >
                        Mark as Delivered
                      </button>
                      <button
                        onClick={() => {
                          const notes = prompt('Enter delivery failure reason:');
                          if (notes) updateOrderStatus(order.id, 'DELIVERY_FAILED', notes);
                        }}
                        className="btn bg-red-600 hover:bg-red-700"
                      >
                        Mark as Failed
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))
          )
        )}
      </div>
    </div>
  );
}
