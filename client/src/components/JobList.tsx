import { Job, Driver } from '../types';
import { format } from 'date-fns';

interface JobListProps {
  jobs: Job[];
  drivers: Driver[];
  onEdit: (job: Job) => void;
  onDelete: (id: number) => void;
  onAssignDriver: (jobId: number, driverId: number | null) => void;
}

const JobList: React.FC<JobListProps> = ({
  jobs,
  drivers,
  onEdit,
  onDelete,
  onAssignDriver
}) => {
  if (jobs.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
        No jobs found. Create a new job to get started.
      </div>
    );
  }

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-md">
      <ul className="divide-y divide-gray-200">
        {jobs.map((job) => (
          <li key={job.id} className="px-6 py-4 hover:bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <h3 className="text-lg font-medium text-gray-900">
                      Flight {job.flightNumber}
                    </h3>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        job.status === 'Assigned'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {job.status}
                    </span>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => job.id && onEdit(job)}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => job.id && onDelete(job.id)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Pickup</p>
                    <p className="font-medium text-gray-900">
                      {job.pickupDate} at {job.pickupTime}
                    </p>
                    <p className="text-gray-600">{job.pickupLocation}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Dropoff</p>
                    <p className="font-medium text-gray-900">{job.dropoffLocation}</p>
                    {job.driverPickedUpAt && (
                      <p className="text-xs text-green-600 mt-1">
                        Picked up: {format(new Date(job.driverPickedUpAt), 'MMM d, yyyy h:mm a')}
                      </p>
                    )}
                    {job.driverDroppedOffAt && (
                      <p className="text-xs text-blue-600 mt-1">
                        Dropped off: {format(new Date(job.driverDroppedOffAt), 'MMM d, yyyy h:mm a')}
                      </p>
                    )}
                  </div>
                  <div>
                    <p className="text-gray-500">Driver & Passengers</p>
                    <div className="mb-2">
                      <select
                        value={job.driverId || ''}
                        onChange={(e) =>
                          job.id &&
                          onAssignDriver(
                            job.id,
                            e.target.value ? parseInt(e.target.value) : null
                          )
                        }
                        className="text-sm border border-gray-300 rounded px-2 py-1"
                      >
                        <option value="">Unassigned</option>
                        {drivers.map((driver) => (
                          <option key={driver.id} value={driver.id}>
                            {driver.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <p className="text-sm text-gray-600">
                      {job.numberOfPassengers} passenger{job.numberOfPassengers !== 1 ? 's' : ''}
                    </p>
                    {job.driverName && (
                      <p className="text-xs text-gray-500 mt-1">
                        Current: {job.driverName}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default JobList;