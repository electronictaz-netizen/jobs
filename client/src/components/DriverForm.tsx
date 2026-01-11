import { useState, useEffect } from 'react';
import { Driver } from '../types';

interface DriverFormProps {
  driver: Driver | null;
  onSave: (driver: Partial<Driver> & { password?: string }) => void;
  onClose: () => void;
}

const DriverForm: React.FC<DriverFormProps> = ({ driver, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: ''
  });

  useEffect(() => {
    if (driver) {
      setFormData({
        name: driver.name || '',
        email: driver.email || '',
        password: '', // Don't populate password for edits
        phone: driver.phone || ''
      });
    } else {
      setFormData({
        name: '',
        email: '',
        password: '',
        phone: ''
      });
    }
  }, [driver]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const submitData: any = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone || undefined
    };

    // Only include password if provided (required for new drivers, optional for updates)
    if (formData.password || !driver) {
      submitData.password = formData.password;
    }

    onSave(submitData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              {driver ? 'Edit Driver Account' : 'Create New Driver Account'}
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
                  Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password {driver ? '(leave blank to keep current)' : '*'}
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required={!driver}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                />
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
                {driver ? 'Update' : 'Create'} Driver
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DriverForm;
