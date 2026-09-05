import { useState, useEffect } from 'react';
import api from '../api/client';
import TopBar from '../components/TopBar';

export default function LogWash() {
  const [phone, setPhone] = useState('');
  const [customer, setCustomer] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState('');
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState('');
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [newName, setNewName] = useState('');
  const [showNewCustomer, setShowNewCustomer] = useState(false);
  const [newMake, setNewMake] = useState('');
  const [newModel, setNewModel] = useState('');
  const [newPlate, setNewPlate] = useState('');
  const [showNewVehicle, setShowNewVehicle] = useState(false);

  // Load services and employees once, when the screen first opens
  useEffect(() => {
    api.get('/services').then((res) => setServices(res.data)).catch(() => {});
    api.get('/employees/active').then((res) => setEmployees(res.data)).catch(() => {});
  }, []);

  async function searchCustomer() {
    setError('');
    setResult(null);
    setCustomer(null);
    setVehicles([]);
    try {
      const res = await api.get(`/customers?phone=${encodeURIComponent(phone)}`);
      if (res.data.length > 0) {
        const found = res.data[0];
        setCustomer(found);
        const vRes = await api.get(`/vehicles?customer_id=${found.id}`);
        setVehicles(vRes.data);
        setShowNewCustomer(false);
      } else {
        setShowNewCustomer(true);
      }
    } catch (err) {
      setError('Could not search for customer.');
    }
  }

  async function createCustomer() {
    try {
      const res = await api.post('/customers', { name: newName, phone });
      setCustomer(res.data);
      setVehicles([]);
      setShowNewCustomer(false);
    } catch (err) {
      setError(err.response?.data?.error || 'Could not create customer.');
    }
  }

  async function createVehicle() {
    try {
      const res = await api.post('/vehicles', {
        customer_id: customer.id,
        make: newMake,
        model: newModel,
        plate: newPlate,
      });
      setVehicles([...vehicles, res.data]);
      setSelectedVehicle(String(res.data.id));
      setShowNewVehicle(false);
    } catch (err) {
      setError('Could not add vehicle.');
    }
  }

  async function submitWash(e) {
    e.preventDefault();
    setError('');
    setResult(null);

    if (!customer || !selectedVehicle || !selectedService || !selectedEmployee) {
      setError('Please complete every field before submitting.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/washes', {
        customer_id: customer.id,
        vehicle_id: selectedVehicle,
        employee_id: selectedEmployee,
        service_id: selectedService,
      });
      setResult(res.data);
      setPhone('');
      setCustomer(null);
      setVehicles([]);
      setSelectedVehicle('');
      setSelectedService('');
    } catch (err) {
      setError(err.response?.data?.error || 'Could not log the wash.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen">
      <TopBar title="Log a wash" />
      <div className="max-w-md mx-auto px-4 py-6">

        <div className="mb-6">
          <label className="block text-sm font-medium mb-1">Customer phone number</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="0821234567"
              className="flex-1 rounded-lg border border-gray-300 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[var(--color-teal)]"
            />
            <button
              onClick={searchCustomer}
              className="px-4 py-2.5 rounded-lg bg-[var(--color-ink)] text-white font-medium"
            >
              Find
            </button>
          </div>
        </div>

        {showNewCustomer && (
          <div className="mb-6 p-4 rounded-lg bg-white border border-gray-200">
            <p className="text-sm text-gray-600 mb-3">No customer found with that number. Add them:</p>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Customer name"
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 mb-3 focus:outline-none focus:ring-2 focus:ring-[var(--color-teal)]"
            />
            <button
              onClick={createCustomer}
              className="w-full py-2.5 rounded-lg bg-[var(--color-teal)] text-white font-medium"
            >
              Add customer
            </button>
          </div>
        )}

        {customer && (
          <div className="mb-6 p-4 rounded-lg bg-white border border-gray-200">
            <p className="font-medium mb-3">{customer.name} · visit #{customer.total_visits + 1}</p>

            <label className="block text-sm font-medium mb-1">Vehicle</label>
            <select
              value={selectedVehicle}
              onChange={(e) => setSelectedVehicle(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 mb-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-teal)]"
            >
              <option value="">Select a vehicle</option>
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.make} {v.model} {v.plate ? `(${v.plate})` : ''}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => setShowNewVehicle(!showNewVehicle)}
              className="text-sm text-[var(--color-teal)] font-medium mb-3"
            >
              + Add a new vehicle
            </button>

            {showNewVehicle && (
              <div className="mb-3 space-y-2">
                <input
                  type="text"
                  value={newMake}
                  onChange={(e) => setNewMake(e.target.value)}
                  placeholder="Make (e.g. Toyota)"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-teal)]"
                />
                <input
                  type="text"
                  value={newModel}
                  onChange={(e) => setNewModel(e.target.value)}
                  placeholder="Model (e.g. Corolla)"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-teal)]"
                />
                <input
                  type="text"
                  value={newPlate}
                  onChange={(e) => setNewPlate(e.target.value)}
                  placeholder="Plate"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-teal)]"
                />
                <button
                  type="button"
                  onClick={createVehicle}
                  className="w-full py-2 rounded-lg bg-[var(--color-ink)] text-white text-sm font-medium"
                >
                  Save vehicle
                </button>
              </div>
            )}

            <label className="block text-sm font-medium mb-1">Service</label>
            <select
              value={selectedService}
              onChange={(e) => setSelectedService(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 mb-3 focus:outline-none focus:ring-2 focus:ring-[var(--color-teal)]"
            >
              <option value="">Select a service</option>
              {services.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} — R{s.price}
                </option>
              ))}
            </select>

            <label className="block text-sm font-medium mb-1">Washed by</label>
            <select
              value={selectedEmployee}
              onChange={(e) => setSelectedEmployee(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 mb-4 focus:outline-none focus:ring-2 focus:ring-[var(--color-teal)]"
            >
              <option value="">Select an employee</option>
              {employees.map((e) => (
                <option key={e.id} value={e.id}>{e.name}</option>
              ))}
            </select>

            <button
              onClick={submitWash}
              disabled={loading}
              className="w-full py-3 rounded-lg bg-[var(--color-teal)] text-white font-semibold disabled:opacity-50"
            >
              {loading ? 'Logging...' : 'Log wash'}
            </button>
          </div>
        )}

        {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

        {result && (
          <div className={`p-4 rounded-lg border ${result.discount_applied ? 'bg-amber-50 border-[var(--color-amber)]' : 'bg-green-50 border-green-300'}`}>
            {result.discount_applied ? (
              <>
                <p className="font-semibold text-amber-800">Loyalty discount applied</p>
                <p className="text-sm text-amber-700 mt-1">{result.discount_reason} — {result.discount_percent}% off</p>
              </>
            ) : (
              <p className="font-semibold text-green-800">Wash logged successfully</p>
            )}
            <p className="text-sm mt-2">Final price: R{result.final_price}</p>
          </div>
        )}
      </div>
    </div>
  );
}
