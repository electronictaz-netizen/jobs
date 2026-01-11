import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/client';
import { Job } from '../types';
import { format } from 'date-fns';

const DriverDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [flightStatuses, setFlightStatuses] = useState<Record<string, any>>({});

  useEffect(() => {
    if (user?.id) {
      loadJobs();
    }
  }, [user]);

  const loadJobs = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/api/drivers/${user?.id}/jobs`);
      setJobs(response.data);
    } catch (error) {
      console.error('Error loading jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePickup = async (jobId: number) => {
    try {
      await apiClient.post(`/api/jobs/${jobId}/pickup`);
      loadJobs();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to mark pickup');
    }
  };

  const handleDropoff = async (jobId: number) => {
    try {
      await apiClient.post(`/api/jobs/${jobId}/dropoff`);
      loadJobs();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to mark dropoff');
    }
  };

  const fetchFlightStatus = async (flightNumber: string) => {
    if (flightStatuses[flightNumber]) return;

    try {
      const response = await apiClient.get(`/api/flights/status/${flightNumber}`);
      setFlightStatuses((prev) => ({
        ...prev,
        [flightNumber]: response.data
      }));
    } catch (error: any) {
      setFlightStatuses((prev) => ({
        ...prev,
        [flightNumber]: { error: 'Unable to fetch flight status' }
      }));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">
                Driver Dashboard
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">Welcome, {user?.name}</span>
              <button
                onClick={() => navigate('/management')}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Management View
              </button>
              <button
                onClick={logout}
                className="text-sm text-gray-600 hover:text-gray-800"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">My Assigned Jobs</h2>

        {loading ? (
          <div className="text-center py-8">Loading...</div>
        ) : jobs.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
            No assigned jobs at this time.
          </div>
        ) : (
          <div className="grid gap-6">
            {jobs.map((job) => (
              <div
                key={job.id}
                className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Flight {job.flightNumber}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {job.pickupDate} at {job.pickupTime}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      job.status === 'Assigned'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {job.status}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Pickup Location</p>
                    <p className="text-sm text-gray-900">{job.pickupLocation}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Dropoff Location</p>
                    <p className="text-sm text-gray-900">{job.dropoffLocation}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Passengers</p>
                    <p className="text-sm text-gray-900">{job.numberOfPassengers}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Flight Status</p>
                    <button
                      onClick={() => fetchFlightStatus(job.flightNumber)}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      Check Status
                    </button>
                    {flightStatuses[job.flightNumber] && (
                      <div className="mt-1 text-xs text-gray-600">
                        {flightStatuses[job.flightNumber].status || 'Unknown'}
                      </div>
                    )}
                  </div>
                </div>

                <div className="border-t pt-4 mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm font-medium text-gray-700">Picked Up At</p>
                      <p className="text-sm text-gray-900">
                        {job.driverPickedUpAt
                          ? format(new Date(job.driverPickedUpAt), 'MMM d, yyyy h:mm a')
                          : 'Not yet picked up'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Dropped Off At</p>
                      <p className="text-sm text-gray-900">
                        {job.driverDroppedOffAt
                          ? format(new Date(job.driverDroppedOffAt), 'MMM d, yyyy h:mm a')
                          : 'Not yet dropped off'}
                      </p>
                    </div>
                  </div>

                  <div className="flex space-x-3">
                    {!job.driverPickedUpAt && (
                      <button
                        onClick={() => job.id && handlePickup(job.id)}
                        className="flex-1 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
                      >
                        Mark Picked Up
                      </button>
                    )}
                    {job.driverPickedUpAt && !job.driverDroppedOffAt && (
                      <button
                        onClick={() => job.id && handleDropoff(job.id)}
                        className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                      >
                        Mark Dropped Off
                      </button>
                    )}
                    {job.driverPickedUpAt && job.driverDroppedOffAt && (
                      <div className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-md text-center">
                        Completed
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DriverDashboard;