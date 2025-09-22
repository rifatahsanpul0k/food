import React from 'react';

export default function Footer() {
  return (
    <footer className="bg-white border-t mt-10">
      <div className="container py-8 grid gap-6 md:grid-cols-3 text-sm text-gray-600">
        <div>
          <h3 className="text-gray-900 font-semibold mb-2">MealMate</h3>
          <p className="leading-relaxed">Simple and fast food ordering. Discover restaurants, add your favorites, and track orders in one place.</p>
        </div>
        <div>
          <h4 className="text-gray-900 font-semibold mb-2">Links</h4>
          <ul className="space-y-1">
            <li><a href="/" className="hover:text-gray-900">Home</a></li>
            <li><a href="/orders" className="hover:text-gray-900">Orders</a></li>
            <li><a href="/analytics" className="hover:text-gray-900">Analytics</a></li>
          </ul>
        </div>
        <div>
          <h4 className="text-gray-900 font-semibold mb-2">Support</h4>
          <ul className="space-y-1">
            <li><a href="#" className="hover:text-gray-900">Help Center</a></li>
            <li><a href="#" className="hover:text-gray-900">Contact</a></li>
            <li><a href="#" className="hover:text-gray-900">Privacy</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t">
        <div className="container py-4 text-xs text-gray-500 flex items-center justify-between">
          <p>© {new Date().getFullYear()} MealMate. All rights reserved.</p>
          <p>Made with care.</p>
        </div>
      </div>
    </footer>
  );
}
