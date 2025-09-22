import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';

export default function UserProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    profileImage: null
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:4000/api/auth/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setProfile({
          name: data.name || '',
          email: data.email || '',
          phone: data.phone || '',
          address: data.address || '',
          city: data.city || '',
          profileImage: null
        });
        if (data.profile_image) {
          setImagePreview(`http://localhost:4000/uploads/profiles/${data.profile_image}`);
        }
      }
    } catch (err) {
      console.error('Failed to fetch profile:', err);
      setError('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError('Image size must be less than 5MB');
        return;
      }
      
      setProfile(prev => ({ ...prev, profileImage: file }));
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      
      formData.append('name', profile.name);
      formData.append('phone', profile.phone);
      formData.append('address', profile.address);
      formData.append('city', profile.city);
      
      if (profile.profileImage) {
        formData.append('profileImage', profile.profileImage);
      }

      const response = await fetch('http://localhost:4000/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        setSuccess('Profile updated successfully!');
        
        // Update local storage user data
        const currentUser = JSON.parse(localStorage.getItem('user'));
        const updatedUser = { ...currentUser, name: data.name };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        setTimeout(() => setSuccess(''), 3000);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update profile');
      }
    } catch (err) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        Loading profile...
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-4">
      <div className="card border-2 border-blue-600">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-blue-600">
          <h1 className="text-2xl font-bold text-blue-600 m-0">
            My Profile
          </h1>
        </div>

        {error && (
          <div className="p-3 bg-red-100 text-red-800 rounded border border-red-200 mb-4">
            {error}
          </div>
        )}

        {success && (
          <div className="p-3 bg-green-100 text-green-800 rounded border border-green-200 mb-4">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="flex flex-col items-center mb-6">
            <div className="w-28 h-28 rounded-full bg-gray-100 overflow-hidden ring-2 ring-blue-600">
              {imagePreview ? (
                <img 
                  src={imagePreview} 
                  alt="Profile" 
                  className="w-full h-full object-cover" 
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-blue-600 text-3xl font-semibold">
                  {profile.name?.[0] || 'U'}
                </div>
              )}
            </div>
            <label className="mt-3 inline-flex items-center gap-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-sm font-medium cursor-pointer">
              Choose Profile Image
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleImageChange}
                className="hidden"
              />
            </label>
            <p className="text-xs text-gray-500 mt-2">
              Max file size: 5MB (JPG, PNG, GIF)
            </p>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold text-blue-600 mb-4 border-b pb-2">
              Personal Information
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block mb-1 font-medium">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={profile.name}
                  onChange={handleInputChange}
                  required
                  className="input focus:border-blue-600"
                />
              </div>
              <div>
                <label className="block mb-1 font-medium">
                  Email
                </label>
                <input
                  type="email"
                  value={profile.email}
                  disabled
                  className="input bg-gray-100 text-gray-600"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Email cannot be changed
                </p>
              </div>
              <div>
                <label className="block mb-1 font-medium">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={profile.phone}
                  onChange={handleInputChange}
                  className="input focus:border-blue-600"
                  placeholder="Enter your phone number"
                />
              </div>
              <div>
                <label className="block mb-1 font-medium">
                  City
                </label>
                <input
                  type="text"
                  name="city"
                  value={profile.city}
                  onChange={handleInputChange}
                  className="input focus:border-blue-600"
                  placeholder="Enter your city"
                />
              </div>
            </div>
            <div className="mt-4">
              <label className="block mb-1 font-medium">
                Address
              </label>
              <textarea
                name="address"
                value={profile.address}
                onChange={handleInputChange}
                rows={3}
                className="input focus:border-blue-600 resize-y"
                placeholder="Enter your full address for deliveries..."
              />
            </div>
          </div>

          <div className="flex justify-center">
            <button
              type="submit"
              disabled={saving}
              className={`inline-flex items-center gap-2 rounded-md bg-blue-600 text-white px-5 py-2 text-sm font-medium ${saving ? 'opacity-70 cursor-not-allowed' : 'hover:bg-blue-700'}`}
            >
              {saving ? 'Saving...' : 'Update Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
