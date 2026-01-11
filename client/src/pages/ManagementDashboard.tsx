import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import JobForm from '../components/JobForm';
import JobList from '../components/JobList';
import { Job, Driver, Location } from '../types';

const ManagementDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [filters, setFilters] = useState({
    status: '',
    driverId: '',
    date: ''
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [filters]);

  const loadData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.driverId) params.append('driverId', filters.driverId);
      if (filters.date) params.append('date', filters.date);

      const [jobsRes, driversRes, locationsRes] = await Promise.all([
        axios.get(`/api/jobs?${params.toString()}`),
        axios.get('/api/drivers'),
        axios.get('/api/locations')
      ]);

      setJobs(jobsRes.data);
      setDrivers(driversRes.data);
      setLocations(locationsRes.data || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateJob = () => {
    setEditingJob(null);
    setIsFormOpen(true);
  };

  const handleEditJob = (job: Job) => {
    setEditingJob(job);
    setIsFormOpen(true);
  };

  const handleDeleteJob = async (id: number) => {
    if (!confirm('Are you sure you want to delete this job?')) return;

    try {
      await axios.delete(`/api/jobs/${id}`);
      loadData();
    } catch (error) {
      console.error('Error deleting job:', error);
      alert('Failed to delete job');
    }
  };

  const handleSaveJob = async (jobData: Partial<Job>) => {
    try {
      if (editingJob) {
        await axios.put(`/api/jobs/${editingJob.id}`, jobData);
      } else {
        await axios.post('/api/jobs', jobData);
      }
      setIsFormOpen(false);
      setEditingJob(null);
      loadData();
    } catch (error: any) {
      console.error('Error saving job:', error);
      alert(error.response?.data?.error || 'Failed to save job');
    }
  };

  const handleAssignDriver = async (jobId: number, driverId: number | null) => {
    try {
      await axios.put(`/api/jobs/${jobId}`, {
        driverId,
        status: driverId ? 'Assigned' : 'Unassigned'
      });
      loadData();
    } catch (error) {
      console.error('Error assigning driver:', error);
      alert('Failed to assign driver');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">
                Management Dashboard
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">Welcome, {user?.name}</span>
              <button
                onClick={() => navigate('/driver')}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Driver View
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
        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Transportation Jobs</h2>
          <button
            onClick={handleCreateJob}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            + Create New Job
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="">All Statuses</option>
                <option value="Assigned">Assigned</option>
                <option value="Unassigned">Unassigned</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Driver
              </label>
              <select
                value={filters.driverId}
                onChange={(e) => setFilters({ ...filters, driverId: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="">All Drivers</option>
                {drivers.map((driver) => (
                  <option key={driver.id} value={driver.id}>
                    {driver.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date
              </label>
              <input
                type="date"
                value={filters.date}
                onChange={(e) => setFilters({ ...filters, date: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8">Loading...</div>
        ) : (
          <JobList
            jobs={jobs}
            drivers={drivers}
            onEdit={handleEditJob}
            onDelete={handleDeleteJob}
            onAssignDriver={handleAssignDriver}
          />
        )}
      </div>

      {isFormOpen && (
        <JobForm
          job={editingJob}
          drivers={drivers}
          locations={locations}
          onSave={handleSaveJob}
          onClose={() => {
            setIsFormOpen(false);
            setEditingJob(null);
          }}
        />
      )}
    </div>
  );
};

export default ManagementDashboard;