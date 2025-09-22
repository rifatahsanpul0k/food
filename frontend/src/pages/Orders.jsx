import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user, token } = useAuth();

  useEffect(() => { 
    if (user && token) {
      fetchOrders();
    } else if (!user) {
      setError('Please log in to view your orders');
      setLoading(false);
    } else if (!token) {
      setError('Authentication token missing. Please log in again.');
      setLoading(false);
    }
  }, [user, token]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError('');
      
      if (!token) {
        throw new Error('No authentication token available');
      }
      
      console.log('Fetching orders with token:', token ? 'Token present' : 'No token');
      const response = await fetch('http://localhost:4000/api/orders', { 
        headers: { 'Authorization': `Bearer ${token}` } 
      });
      
      console.log('Orders API response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to fetch orders (${response.status})`);
      }
      
      const data = await response.json();
      console.log('Orders data received:', data);
      setOrders(data || []);
    } catch (err) {
      console.error('Orders fetch error:', err);
      setError(err.message || 'Failed to load orders');
    } finally { 
      setLoading(false); 
    }
  };

  const cancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    try {
      if (!token) {
        throw new Error('No authentication token available');
      }
      
      const response = await fetch(`http://localhost:4000/api/orders/${orderId}/cancel`, { 
        method: 'PUT', 
        headers: { 
          'Authorization': `Bearer ${token}`, 
          'Content-Type': 'application/json' 
        } 
      });
      
      if (!response.ok) { 
        const errorData = await response.json().catch(() => ({})); 
        throw new Error(errorData.error || 'Failed to cancel order'); 
      }
      
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'CANCELLED' } : o));
      alert('Order cancelled successfully!');
    } catch (err) { 
      console.error('Cancel order error:', err); 
      alert(err.message || 'Failed to cancel order'); 
    }
  };

  const getStatusColor = (status) => {
    switch ((status || '').toLowerCase()) {
      case 'pending': return 'bg-yellow-500';
      case 'confirmed': return 'bg-sky-600';
      case 'preparing': return 'bg-orange-500';
      case 'ready': return 'bg-teal-500';
      case 'delivered': return 'bg-green-600';
      case 'cancelled': return 'bg-red-600';
      default: return 'bg-gray-500';
    }
  };

  const formatDate = (d) => { try { return new Date(d).toLocaleString(); } catch { return 'Unknown date'; } };

  if (loading) return <div className="text-center p-8">Loading orders...</div>;

  if (error) {
    return (
      <div className="text-center p-8">
        <div className="p-4 bg-red-100 text-red-800 rounded border border-red-200 mb-4">{error}</div>
        <button onClick={fetchOrders} className="btn">Retry</button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold mb-2">Your Orders</h1>
        <button 
          onClick={fetchOrders} 
          className="text-sm bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded"
        >
          Refresh
        </button>
      </div>
      
      {/* Debug info - remove in production */}
      {process.env.NODE_ENV === 'development' && (
        <div className="bg-gray-100 p-2 text-xs rounded">
          <div>User: {user ? `${user.name} (ID: ${user.id}, Role: ${user.role})` : 'Not logged in'}</div>
          <div>Token: {token ? 'Present' : 'Missing'}</div>
          <div>Orders count: {orders.length}</div>
        </div>
      )}
      
      {orders.length === 0 ? (
        <div className="text-center card p-10">
          <p className="text-gray-500 mb-3">No orders found</p>
          <a href="/" className="btn">Start Ordering</a>
        </div>
      ) : (
        orders.map((order) => (
          <div key={order.id} className="card">
            <div className="flex items-start justify-between pb-3 mb-3 border-b">
              <div>
                <h2 className="text-base font-semibold">Order #{order.id}</h2>
                <p className="text-sm text-gray-500">{formatDate(order.created_at)}</p>
                {order.customer_name && <p className="text-sm text-gray-500">Customer: {order.customer_name}</p>}
              </div>
              <div className="text-right">
                <span className={`px-3 py-1 rounded-full text-xs text-white font-semibold ${getStatusColor(order.status)}`}>{order.status || 'Unknown'}</span>
                <p className="mt-2 text-lg font-bold">${Number(order.total || 0).toFixed(2)}</p>
                {(order.status === 'PENDING' || order.status === 'CONFIRMED') && (
                  <button onClick={() => cancelOrder(order.id)} className="mt-2 px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs font-medium">Cancel Order</button>
                )}
              </div>
            </div>

            {order.items && order.items.length > 0 && (
              <div className="mb-3">
                <h3 className="text-sm font-semibold mb-2">Items:</h3>
                <div className="flex flex-col gap-1">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between py-1 border-b last:border-b-0">
                      <span className="text-sm">{item.name || `Item #${item.menu_item_id}`} × {item.quantity}</span>
                      <span className="text-sm font-medium">${(Number(item.price || 0) * Number(item.quantity || 1)).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {order.delivery_address && (
              <div className="p-3 bg-gray-50 rounded text-sm">
                <strong>Delivery Address:</strong><br />
                {order.delivery_address}
                {order.customer_phone && (<><br /><strong>Phone:</strong> {order.customer_phone}</>)}
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}
