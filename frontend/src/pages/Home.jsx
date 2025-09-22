import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const API = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

export default function Home() {
  const [restaurants, setRestaurants] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const restaurantRes = await axios.get(`${API}/restaurants`);
        setRestaurants(restaurantRes.data);

        const dishesRes = await axios.get(`${API}/analytics/popular-dishes`);
        const cats = [...new Set(dishesRes.data.map((d) => d.category))].slice(0, 6);
        setCategories(cats);
      } catch (err) {
        console.error('API Error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div className="text-center p-8">Loading restaurants...</div>;
  if (error) return <div className="text-center p-8 text-red-600">Error: {error}</div>;

  return (
    <div className="space-y-6">
      <section className="card">
        <h2 className="text-lg font-semibold mb-3">Popular Categories</h2>
        <div className="flex flex-wrap gap-2">
          {categories.length > 0 ? (
            categories.map((c) => (
              <span key={c} className="badge">{c}</span>
            ))
          ) : (
            <p className="text-gray-500">No categories available</p>
          )}
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {restaurants.length > 0 ? (
          restaurants.map((r) => (
            <Link
              key={r.id}
              to={`/restaurant/${r.id}`}
              className="card block hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-base font-semibold mb-1">{r.name}</h3>
                  <p className="text-sm text-gray-500">{r.location}</p>
                </div>
                <span className="badge bg-yellow-100 text-yellow-800">{r.rating}</span>
              </div>
            </Link>
          ))
        ) : (
          <div className="sm:col-span-2 lg:col-span-3 text-center p-10 text-gray-500">
            No restaurants found. Please check your database connection.
          </div>
        )}
      </section>
    </div>
  );
}