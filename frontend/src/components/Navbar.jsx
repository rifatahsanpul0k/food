import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Navbar() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);

  const navLinkClass = ({ isActive }) => `px-3 py-2 rounded-md text-sm font-medium ${
    isActive ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'
  }`;

  return (
    <header className="bg-white border-b sticky top-0 z-40">
      <nav className="container flex items-center justify-between h-16">
        <div className="flex items-center gap-6">
          <Link to="/" className="text-xl font-semibold text-gray-900">MealMate</Link>
          <div className="hidden md:flex items-center gap-1">
            <NavLink to="/" className={navLinkClass}>Home</NavLink>
            {user && <NavLink to="/orders" className={navLinkClass}>Orders</NavLink>}
            {user && user.role === 'admin' && (
              <>
                <NavLink to="/admin" className={navLinkClass}>Admin</NavLink>
                <NavLink to="/analytics" className={navLinkClass}>Analytics</NavLink>
                <NavLink to="/delivery-management" className={navLinkClass}>Delivery Management</NavLink>
                <NavLink to="/admin-profile" className={navLinkClass}>Admin Profile</NavLink>
              </>
            )}
            {user && user.role === 'delivery' && (
              <NavLink to="/delivery-dashboard" className={navLinkClass}>Delivery Dashboard</NavLink>
            )}
            {user && user.role !== 'admin' && user.role !== 'delivery' && (
              <>
                <NavLink to="/dashboard" className={navLinkClass}>Dashboard</NavLink>
                <NavLink to="/profile" className={navLinkClass}>Profile</NavLink>
              </>
            )}
          </div>
        </div>

        <div className="hidden md:flex items-center gap-3">
          {!user ? (
            <>
              <Link to="/login" className="btn">Login</Link>
              <Link to="/signup" className="inline-flex items-center gap-2 rounded-md bg-gray-900 hover:bg-black text-white px-4 py-2 text-sm font-semibold">Sign Up</Link>
              <Link to="/delivery-signup" className="inline-flex items-center gap-2 rounded-md bg-green-600 hover:bg-green-700 text-white px-4 py-2 text-sm font-semibold">Join as Delivery</Link>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600">Hi, {user.name}</span>
              <button onClick={logout} className="inline-flex items-center gap-2 rounded-md bg-gray-200 hover:bg-gray-300 text-gray-900 px-3 py-2 text-sm font-medium">Logout</button>
            </div>
          )}
        </div>

        <button className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:bg-gray-100" onClick={() => setOpen(!open)} aria-label="Toggle navigation">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </nav>

      {open && (
        <div className="md:hidden border-t bg-white">
          <div className="container py-2 flex flex-col gap-1">
            <NavLink to="/" className={navLinkClass} onClick={() => setOpen(false)}>Home</NavLink>
            {user && <NavLink to="/orders" className={navLinkClass} onClick={() => setOpen(false)}>Orders</NavLink>}
            {user && user.role === 'admin' && (
              <>
                <NavLink to="/admin" className={navLinkClass} onClick={() => setOpen(false)}>Admin</NavLink>
                <NavLink to="/analytics" className={navLinkClass} onClick={() => setOpen(false)}>Analytics</NavLink>
                <NavLink to="/delivery-management" className={navLinkClass} onClick={() => setOpen(false)}>Delivery Management</NavLink>
                <NavLink to="/admin-profile" className={navLinkClass} onClick={() => setOpen(false)}>Admin Profile</NavLink>
              </>
            )}
            {user && user.role === 'delivery' && (
              <NavLink to="/delivery-dashboard" className={navLinkClass} onClick={() => setOpen(false)}>Delivery Dashboard</NavLink>
            )}
            {user && user.role !== 'admin' && user.role !== 'delivery' && (
              <>
                <NavLink to="/dashboard" className={navLinkClass} onClick={() => setOpen(false)}>Dashboard</NavLink>
                <NavLink to="/profile" className={navLinkClass} onClick={() => setOpen(false)}>Profile</NavLink>
              </>
            )}
            {!user ? (
              <>
                <NavLink to="/login" className={navLinkClass} onClick={() => setOpen(false)}>Login</NavLink>
                <NavLink to="/signup" className={navLinkClass} onClick={() => setOpen(false)}>Sign Up</NavLink>
                <NavLink to="/delivery-signup" className={navLinkClass} onClick={() => setOpen(false)}>Join as Delivery</NavLink>
              </>
            ) : (
              <button onClick={() => { logout(); setOpen(false); }} className={navLinkClass}>Logout</button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
