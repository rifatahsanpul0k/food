import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';

export default function DeliveryManagement() {
  const [applications, setApplications] = useState([]);
  const [deliveryPersons, setDeliveryPersons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');
  const { token } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    console.log('DeliveryManagement mounted, token:', token);
    if (token) {
      fetchData();
    } else {
      console.error('No token available');
      setLoading(false);
    }
  }, [token]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch pending applications
      const appsResponse = await fetch('http://localhost:4000/api/admin/delivery-applications', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!appsResponse.ok) {
        throw new Error(`Failed to fetch applications: ${appsResponse.status}`);
      }
      
      const appsData = await appsResponse.json();
      
      // Fetch all delivery persons
      const personsResponse = await fetch('http://localhost:4000/api/admin/delivery-persons', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!personsResponse.ok) {
        throw new Error(`Failed to fetch delivery persons: ${personsResponse.status}`);
      }
      
      const personsData = await personsResponse.json();
      
      setApplications(appsData);
      setDeliveryPersons(personsData);
    } catch (error) {
      console.error('Error fetching data:', error);
      alert(`Error loading delivery management data: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      const response = await fetch(`http://localhost:4000/api/admin/approve-delivery/${id}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        alert('Delivery person approved successfully!');
        fetchData(); // Refresh data
      }
    } catch (error) {
      console.error('Error approving delivery person:', error);
      alert('Error approving delivery person');
    }
  };

  const handleReject = async (id) => {
    const reason = prompt('Enter reason for rejection (optional):');
    
    try {
      const response = await fetch(`http://localhost:4000/api/admin/reject-delivery/${id}`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason })
      });
      
      if (response.ok) {
        alert('Application rejected successfully');
        fetchData(); // Refresh data
      }
    } catch (error) {
      console.error('Error rejecting application:', error);
      alert('Error rejecting application');
    }
  };

  const handleSuspend = async (id) => {
    const reason = prompt('Enter reason for suspension:');
    if (!reason) return;
    
    try {
      const response = await fetch(`http://localhost:4000/api/admin/suspend-delivery/${id}`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason })
      });
      
      if (response.ok) {
        alert('Delivery person suspended');
        fetchData(); // Refresh data
      }
    } catch (error) {
      console.error('Error suspending delivery person:', error);
      alert('Error suspending delivery person');
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="text-center py-8">Loading delivery management...</div>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="text-center py-8 text-red-600">
          Authentication required. Please log in as admin.
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/admin')}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            ← Back to Admin Dashboard
          </button>
          <h1 className="text-2xl font-bold">Delivery Person Management</h1>
        </div>
      </div>
      
      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('pending')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'pending'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Pending Applications ({applications.length})
          </button>
          <button
            onClick={() => setActiveTab('all')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'all'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            All Delivery Persons ({deliveryPersons.length})
          </button>
        </nav>
      </div>

      {/* Pending Applications Tab */}
      {activeTab === 'pending' && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Pending Applications</h2>
          {applications.length === 0 ? (
            <p className="text-gray-500">No pending applications</p>
          ) : (
            <div className="grid gap-4">
              {applications.map((app) => (
                <div key={app.id} className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-lg">{app.name}</h3>
                      <p className="text-gray-600">{app.email}</p>
                      <p className="text-gray-600">{app.phone}</p>
                      <div className="mt-2">
                        <span className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                          {app.vehicle_type}
                        </span>
                        <span className="ml-2 text-sm text-gray-500">
                          License: {app.license_number}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">
                        Applied: {new Date(app.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleApprove(app.id)}
                        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(app.id)}
                        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* All Delivery Persons Tab */}
      {activeTab === 'all' && (
        <div>
          <h2 className="text-xl font-semibold mb-4">All Delivery Persons</h2>
          {deliveryPersons.length === 0 ? (
            <p className="text-gray-500">No delivery persons found</p>
          ) : (
            <div className="grid gap-4">
              {deliveryPersons.map((person) => (
                <div key={person.id} className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-lg">{person.name}</h3>
                      <p className="text-gray-600">{person.email}</p>
                      <p className="text-gray-600">{person.phone}</p>
                      <div className="mt-2">
                        <span className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                          {person.vehicle_type}
                        </span>
                        <span className={`ml-2 px-2 py-1 rounded text-sm ${
                          person.status === 'active' ? 'bg-green-100 text-green-800' :
                          person.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {person.status}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">
                        Joined: {new Date(person.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      {person.status === 'active' && (
                        <button
                          onClick={() => handleSuspend(person.id)}
                          className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700"
                        >
                          Suspend
                        </button>
                      )}
                      {person.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleApprove(person.id)}
                            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleReject(person.id)}
                            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                          >
                            Reject
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
