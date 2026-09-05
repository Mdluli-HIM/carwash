import { useState, useEffect } from 'react';
import api from '../api/client';
import TopBar from '../components/TopBar';

export default function LogWash() {
  const [phone, setPhone] = useState('');
  const [searched, setSearched] = useState(false);
  const [showRegisterForm, setShowRegisterForm] = useState(false);
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
  const [newEmail, setNewEmail] = useState('');

  const [newMake, setNewMake] = useState('');
  const [newModel, setNewModel] = useState('');
  const [newColor, setNewColor] = useState('');
  const [newPlate, setNewPlate] = useState('');
  const [addingVehicle, setAddingVehicle] = useState(false);

  useEffect(() => {
    api.get('/services').then((res) => setServices(res.data)).catch(() => {});
    api.get('/employees/active').then((res) => setEmployees(res.data)).catch(() => {});
  }, []);

  function resetCustomerState() {
    setCustomer(null);
    setVehicles([]);
    setSelectedVehicle('');
    setNewName('');
    setNewEmail('');
    setAddingVehicle(false);
    setShowRegisterForm(false);
  }

  async function searchCustomer() {
    setError('');
    setResult(null);
    resetCustomerState();

    if (!phone.trim()) {
      setError('Enter a phone number first.');
      return;
    }

    try {
      const res = await api.get(`/customers?phone=${encodeURIComponent(phone)}`);
      setSearched(true);
      if (res.data.length > 0) {
        const found = res.data[0];
        setCustomer(found);
        const vRes = await api.get(`/vehicles?customer_id=${found.id}`);
        setVehicles(vRes.data);
        if (vRes.data.length === 0) {
          setAddingVehicle(true);
        }
      } else {
        // No match — offer registration right away instead of a dead end
        setShowRegisterForm(true);
      }
    } catch (err) {
      setError(ould not search for customer.');
    }
  }

  function openRegisterForm() {
    setError('');
    setResult(null);
    resetCustomerState();
    setShowRegisterForm(true);
  }

  async function registerCustomer() {
    if (!phone.trim()) {
      setError("Enter the customer's phone number.");
      return;
    }
    if (!newName.trim()) {
      setError("Enter the customer's name.");
      return;
    }
    setError('');
    try {
      const res = await api.post('/customers', {
        name: newName,
        phone,
        email: newEmail || undefined,
      });
      setCustomer(res.data);
      setVehicles([]);
      setShowRegisterForm(false);
      setAddingVehicle(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Could not register this customer.');
    }
  }

  async function createVehicle() {
    if (!newMake.trim() && !newModel.trim() && !newPlate.trim()) {
      setError('Add at least a make, model, or plate for the vehicle.');
      return;
    }
    setError('');
    try {
      const res = await api.post('/vehicles', {
        customer_id: customer.id,
        make: newMake || undefined,
        model: newModel || undefined,
        color: newColor || undefined,
        plate: newPlate || undefined,
      });
      setVehicles([...vehicles, res.data]);
      setSelectedVehicle(String(res.data.id));
      setAddingVehicle(false);
      setNewMake('');
      setNewModel('');
      setNewColor('');
      setNewPlate('');
    } catch (err) {
      setError('Could not add this vehicle.');
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
      setSearched(false);
      resetCustomerState();
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

        {/* Step 1: find or register a customer */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-1">Customer phone number</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={phone}
              onChange={(e) => { setPhone(e.target.value); setSearched(false); }}
              placeholder="0821234567"
              className="flex-1 rounded-lg border border-gray-300 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[var(--color-teal)]"
            />
            <button
              onClick={searchCustomer}
              className="px-4 py-2.5 rounded-lg bg-[var(--color-ink)] text-white font-medium"
            >
              Find
            </button>
            <button
              onClick={openRegisterForm}
              title="Add a new customer"
              aria-label="Add a new customer"
              className="w-11 h-11 flex items-center justify-center rounded-lg bg-[var(--color-teal)] text-white text-2xl leading-none font-medium shrink-0"
            >
              +
            </button>
          </div>
          {searched && !customer && !showRegisterForm && (
            <p className="text-sm text-gray-500 mt-2">No customer found with that number.</p>
          )}
        </div>

        {/* Register a new customer */}
        {showRegisterForm && (
          <div className="mb-6 p-4 rounded-lg bg-white border border-gray-200">
            <p className="text-sm text-gray-600 mb-3">Register a new customer</p>
            <label className="block text-sm font-medium mb-1">Phone number</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="0821234567"
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 mb-3 focus:outline-none focus:ring-2 focus:ring-[var(--color-teal)]"
            />
            <label className="block text-sm font-medium mb-1">Full name</label>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g. Thandi Mokoena"
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 mb-3 focus:outline-none focus:ring-2 focus:ring-[var(--color-teal)]"
            />
            <label className="block text-sm font-medium mb-1">Email (optional)</label>
            <input
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="thandi@example.com"
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 mb-4 focus:outline-none focus:ring-2 focus:ring-[var(--color-teal)]"
            />
            <div className="flex gap-2">
              <button
                onClick={registerCustomer}
                className="flex-1 py-2.5 rounded-lg bg-[var(--color-teal)] text-white font-medium"
              >
                Register customer
              </button>
              <button
                onClick={() => setShowRegisterForm(false)}
                className="px-4 py-2.5 rounded-lg border border-gray-300 font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Customer found or just registered */}
        {customer && (
          <div className="mb-6 p-4 rounded-lg bg-white border border-gray-200">
            <p className="font-medium mb-3">{customer.name} · visit #{customer.total_visits + 1}</p>

            {vehicles.legth > 0 && !addingVehicle && (
              <>
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
                  onClick={() => setAddingVehicle(true)}
                  className="text-sm text-[var(--color-teal)] font-medium mb-3"
                >
                  + Add another vehicle
                </button>
              </>
            )}

            {addingVehicle && (
              <div className="mb-3 p-3 rounded-lg bg-gray-50 border border-gray-200 space-y-2">
                <p className="text-sm font-medium text-gray-700">
                  {vehicles.length === 0 ? "Add this customer's first vehicle" : 'Add a vehicle'}
                </p>
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
                  value={newColor}
                  onChange={(e) => setNewColor(e.target.value)}
                  placeholder="Color"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-teal)]"
                />
                <input
                  type="text"
                  value={newPlate}
                  onChange={(e) => setNewPlate(e.target.value)}
                  placeholder="Plate"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-teal)]"
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={createVehicle}
                    className="flex-1 py-2 rounded-lg bg-[var(--color-ink)] text-white text-sm font-medium"
                  >
                    Save vehicle
                  </button>
                  {vehicles.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setAddingVehicle(false)}
                      className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            )}

            {!addingVehicle && (
              <>
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
                  disabled={loading || !selectedVehicle}
                  className="w-full py-3 rounded-lg bg-[var(--color-teal)] text-whitfont-semibold disabled:opacity-50"
                >
                  {loading ? 'Logging...' : 'Log wash'}
                </button>
              </>
            )}
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
