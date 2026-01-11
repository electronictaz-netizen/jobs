import { Driver } from '../types';
import { format } from 'date-fns';

interface DriverListProps {
  drivers: Driver[];
  onEdit: (driver: Driver) => void;
  onDelete: (id: number) => void;
}

const DriverList: React.FC<DriverListProps> = ({
  drivers,
  onEdit,
  onDelete
}) => {
  if (drivers.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
        No drivers found. Create a new driver account to get started.
      </div>
    );
  }

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-md">
      <ul className="divide-y divide-gray-200">
        {drivers.map((driver) => (
          <li key={driver.id} className="px-6 py-4 hover:bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <h3 className="text-lg font-medium text-gray-900">
                      {driver.name}
                    </h3>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => driver.id && onEdit(driver)}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => driver.id && onDelete(driver.id)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Email</p>
                    <p className="font-medium text-gray-900">{driver.email}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Phone</p>
                    <p className="font-medium text-gray-900">
                      {driver.phone || 'Not provided'}
                    </p>
                  </div>
                  {driver.createdAt && (
                    <div>
                      <p className="text-gray-500">Created</p>
                      <p className="text-gray-600">
                        {format(new Date(driver.createdAt), 'MMM d, yyyy')}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default DriverList;
