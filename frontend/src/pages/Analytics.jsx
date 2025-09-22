import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#6366F1', '#22C55E', '#EF4444', '#F59E0B', '#06B6D4'];

export default function Analytics() {
  const [topRestaurants, setTopRestaurants] = useState([]);
  const [popularDishes, setPopularDishes] = useState([]);
  const [revenuePerRestaurant, setRevenuePerRestaurant] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      
      const [topRestaurantsRes, popularDishesRes, revenueRes] = await Promise.all([
        fetch('http://localhost:4000/api/analytics/top-restaurants'),
        fetch('http://localhost:4000/api/analytics/popular-dishes'),
        fetch('http://localhost:4000/api/analytics/revenue-per-restaurant')
      ]);

      if (topRestaurantsRes.ok) {
        const data = await topRestaurantsRes.json();
        setTopRestaurants(data || []);
      }

      if (popularDishesRes.ok) {
        const data = await popularDishesRes.json();
        setPopularDishes(data || []);
      }

      if (revenueRes.ok) {
        const data = await revenueRes.json();
        setRevenuePerRestaurant(data || []);
      }

    } catch (err) {
      console.error('Analytics fetch error:', err);
      setError(err.message || 'Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div style={{textAlign: 'center', padding: '32px'}}>Loading analytics...</div>;
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '32px' }}>
        <div style={{ 
          padding: '16px', 
          backgroundColor: '#f8d7da', 
          color: '#721c24', 
          borderRadius: '4px',
          border: '1px solid #f5c6cb',
          marginBottom: '16px'
        }}>
          {error}
        </div>
        <button 
          onClick={fetchAnalytics}
          style={{ 
            padding: '8px 16px', 
            backgroundColor: '#007bff', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px', 
            cursor: 'pointer' 
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px' }}>Analytics Dashboard</h1>
      
      {/* Top Restaurants Chart */}
      <div style={{ 
        backgroundColor: 'white', 
        padding: '20px', 
        borderRadius: '8px', 
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)' 
      }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>
          Top Restaurants by Revenue
        </h3>
        {topRestaurants.length > 0 ? (
          <div style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topRestaurants}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => [`$${Number(value).toFixed(2)}`, 'Revenue']} />
                <Bar dataKey="revenue" fill="#6366F1" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
            No restaurant data available
          </div>
        )}
      </div>

      {/* Charts Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', 
        gap: '24px' 
      }}>
        {/* Popular Dishes */}
        <div style={{ 
          backgroundColor: 'white', 
          padding: '20px', 
          borderRadius: '8px', 
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)' 
        }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>
            Most Popular Dishes
          </h3>
          {popularDishes.length > 0 ? (
            <div style={{ height: '300px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={popularDishes}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => [value, 'Orders']} />
                  <Bar dataKey="total_quantity" fill="#22C55E" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
              No dish data available
            </div>
          )}
        </div>

        {/* Revenue Distribution */}
        <div style={{ 
          backgroundColor: 'white', 
          padding: '20px', 
          borderRadius: '8px', 
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)' 
        }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>
            Revenue Distribution
          </h3>
          {revenuePerRestaurant.length > 0 ? (
            <div style={{ height: '300px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie 
                    data={revenuePerRestaurant} 
                    dataKey="revenue" 
                    nameKey="name" 
                    outerRadius={100}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                  >
                    {revenuePerRestaurant.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`$${Number(value).toFixed(2)}`, 'Revenue']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
              No revenue data available
            </div>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '16px' 
      }}>
        <div style={{ 
          backgroundColor: 'white', 
          padding: '20px', 
          borderRadius: '8px', 
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <h4 style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>Total Restaurants</h4>
          <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#6366F1' }}>
            {topRestaurants.length}
          </p>
        </div>
        <div style={{ 
          backgroundColor: 'white', 
          padding: '20px', 
          borderRadius: '8px', 
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <h4 style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>Popular Dishes</h4>
          <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#22C55E' }}>
            {popularDishes.length}
          </p>
        </div>
        <div style={{ 
          backgroundColor: 'white', 
          padding: '20px', 
          borderRadius: '8px', 
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <h4 style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>Total Revenue</h4>
          <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#EF4444' }}>
            ${revenuePerRestaurant.reduce((sum, r) => sum + Number(r.revenue || 0), 0).toFixed(2)}
          </p>
        </div>
      </div>
    </div>
  );
}
