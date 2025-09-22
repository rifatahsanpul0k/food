import React, { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Cart() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Redirect delivery persons away from cart
  if (user && user.role === 'delivery') {
    return <Navigate to="/delivery-dashboard" replace />;
  }

  useEffect(() => {
    try {
      const cartData = localStorage.getItem('cart');
      setItems(cartData ? JSON.parse(cartData) : []);
    } catch (err) {
      console.error('Cart loading error:', err);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateQty = (id, delta) => {
    try {
      const updated = items
        .map((i) => (i.id === id ? { ...i, quantity: Math.max(0, i.quantity + delta) } : i))
        .filter((i) => i.quantity > 0);
      setItems(updated);
      localStorage.setItem('cart', JSON.stringify(updated));
    } catch (err) {
      console.error('Cart update error:', err);
    }
  };

  const removeItem = (id) => {
    try {
      const updated = items.filter((i) => i.id !== id);
      setItems(updated);
      localStorage.setItem('cart', JSON.stringify(updated));
    } catch (err) {
      console.error('Cart remove error:', err);
    }
  };

  const clearCart = () => { setItems([]); localStorage.removeItem('cart'); };

  const total = items.reduce((sum, i) => sum + (Number(i.price) * i.quantity), 0);

  if (loading) return <div className="text-center p-8">Loading cart...</div>;

  return (
    <div className="space-y-6">
      <div className="card">
        <h1 className="text-xl font-bold mb-4">Your Cart</h1>
        {items.length === 0 ? (
          <div className="text-center text-gray-500 p-10">
            <p className="mb-4">Your cart is empty</p>
            <Link to="/" className="btn">Browse Restaurants</Link>
          </div>
        ) : (
          <>
            {items.map((i) => (
              <div key={i.id} className="flex items-center justify-between py-4 border-b">
                <div className="flex-1">
                  <h3 className="text-sm font-semibold mb-0.5">{i.name}</h3>
                  <p className="text-xs text-gray-500">${Number(i.price).toFixed(2)} each</p>
                  <p className="text-xs text-gray-400">{i.category}</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <button className="w-8 h-8 bg-red-600 hover:bg-red-700 text-white rounded" onClick={() => updateQty(i.id, -1)}>-</button>
                    <span className="min-w-8 text-center font-semibold">{i.quantity}</span>
                    <button className="w-8 h-8 bg-green-600 hover:bg-green-700 text-white rounded" onClick={() => updateQty(i.id, 1)}>+</button>
                  </div>
                  <div className="min-w-[80px] text-right font-semibold">${(Number(i.price) * i.quantity).toFixed(2)}</div>
                  <button className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs" onClick={() => removeItem(i.id)}>Remove</button>
                </div>
              </div>
            ))}

            <div className="flex items-center justify-between mt-5 pt-5 border-t-2">
              <button className="px-3 py-2 bg-gray-700 hover:bg-gray-800 text-white rounded" onClick={clearCart}>Clear Cart</button>
              <div className="text-lg font-bold">Total: ${total.toFixed(2)}</div>
              <Link to="/checkout" className="btn bg-green-600 hover:bg-green-700">Checkout</Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
