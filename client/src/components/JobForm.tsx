import { useState, useEffect } from 'react';
import { Job, Driver, Location } from '../types';

interface JobFormProps {
  job: Job | null;
  drivers: Driver[];
  locations: Location[];
  onSave: (job: Partial<Job>) => void;
  onClose: () => void;
}

const JobForm: React.FC<JobFormProps> = ({ job, drivers, locations, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    pickupDate: '',
    pickupTime: '',
    flightNumber: '',
    pickupLocation: '',
    dropoffLocation: '',
    driverId: '' as string | number | null,
    numberOfPassengers: 1,
    status: 'Unassigned' as 'Assigned' | 'Unassigned'
  });

  useEffect(() => {
    if (job) {
      setFormData({
        pickupDate: job.pickupDate || '',
        pickupTime: job.pickupTime || '',
        flightNumber: job.flightNumber || '',
        pickupLocation: job.pickupLocation || '',
        dropoffLocation: job.dropoffLocation || '',
        driverId: job.driverId || '',
        numberOfPassengers: job.numberOfPassengers || 1,
        status: job.status || 'Unassigned'
      });
    }
  }, [job]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      driverId: formData.driverId ? Number(formData.driverId) : null,
      status: formData.driverId ? 'Assigned' : 'Unassigned'
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'numberOfPassengers' ? parseInt(value) || 1 : value,
      status: name === 'driverId' ? (value ? 'Assigned' : 'Unassigned') : prev.status
    }));
  };

  // Get unique locations for dropdowns
  const allLocations = [
    ...locations.map(l => l.name),
    ...new Set([formData.pickupLocation, formData.dropoffLocation].filter(Boolean))
  ].filter(Boolean);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              {job ? 'Edit Job' : 'Create New Job'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pickup Date *
                </label>
                <input
                  type="date"
                  name="pickupDate"
                  value={formData.pickupDate}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pickup Time *
                </label>
                <input
                  type="time"
                  name="pickupTime"
                  value={formData.pickupTime}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Flight Number *
                </label>
                <input
                  type="text"
                  name="flightNumber"
                  value={formData.flightNumber}
                  onChange={handleChange}
                  required
                  placeholder="e.g., AA123"
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Number of Passengers *
                </label>
                <input
                  type="number"
                  name="numberOfPassengers"
                  value={formData.numberOfPassengers}
                  onChange={handleChange}
                  required
                  min="1"
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pickup Location *
                </label>
                <input
                  type="text"
                  name="pickupLocation"
                  value={formData.pickupLocation}
                  onChange={handleChange}
                  required
                  list="pickupLocations"
                  placeholder="Enter or select location"
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                />
                <datalist id="pickupLocations">
                  {allLocations.map((loc, idx) => (
                    <option key={idx} value={loc} />
                  ))}
                </datalist>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dropoff Location *
                </label>
                <input
                  type="text"
                  name="dropoffLocation"
                  value={formData.dropoffLocation}
                  onChange={handleChange}
                  required
                  list="dropoffLocations"
                  placeholder="Enter or select location"
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                />
                <datalist id="dropoffLocations">
                  {allLocations.map((loc, idx) => (
                    <option key={idx} value={loc} />
                  ))}
                </datalist>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Driver Assigned
                </label>
                <select
                  name="driverId"
                  value={formData.driverId || ''}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="">Unassigned</option>
                  {drivers.map((driver) => (
                    <option key={driver.id} value={driver.id}>
                      {driver.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                {job ? 'Update' : 'Create'} Job
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default JobForm;