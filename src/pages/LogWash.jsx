import { useState, useEffect } from 'react';
import api from '../api/client';
import TopBar from '../components/TopBar';
import { Phone, Plus, Car, Sparkles, UserRound, CheckCircle2, PartyPopper, X } from 'lucide-react';

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
      const res = await api.get('/customers?search=' + encodeURIComponent(phone));
      setSearched(true);
      if (res.data.length > 0) {
        const found = res.data[0];
        setCustomer(found);
        const vRes = await api.get('/vehicles?customer_id=' + found.id);
        setVehicles(vRes.data);
        if (vRes.data.length === 0) {
          setAddingVehicle(true);
        }
      } else {
        setShowRegisterForm(true);
      }
    } catch (err) {
      setError('Could not search for customer.');
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
      setError('Enter the customer phone number.');
      return;
    }
    if (!newName.trim()) {
      setError('Enter the customer name.');
      return;
    }
    setError('');
    try {
      const res = await api.post('/customers', {
        name: newName,
        phone: phone,
        email: newEmail || undefined,
      });
      setCustomer(res.data);
      setVehicles([]);
      setShowRegisterForm(false);
      setAddingVehicle(true);
    } catch (err) {
      setError((err.response && err.response.data && err.response.data.error) || 'Could not register this customer.');
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
      setSelectedVehicle(res.data.id);
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
      setSelectedEmployee('');
    } catch (err) {
      setError((err.response && err.response.data && err.response.data.error) || 'Could not log the wash.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen pb-10">
      <TopBar title="Log a wash" showBadge={false} />
      <div className="max-w-md mx-auto px-4 pt-4">

        <div className="bg-white rounded-2xl shadow-sm p-4 mb-4">
          <label className="text-xs font-medium text-gray-500 mb-1.5 block">Customer name or phone</label>
          <div className="flex gap-2">
            <div className="flex-1 flex items-center gap-2 rounded-xl border border-gray-200 px-3 bg-gray-50 focus-within:ring-2 focus-within:ring-[var(--color-primary)] focus-within:bg-white">
              <Phone size={16} className="text-gray-400 shrink-0" />
              <input
                type="text"
                value={phone}
                onChange={(e) => { setPhone(e.target.value); setSearched(false); }}
                placeholder="082 123 4567"
                className="w-full py-3 bg-transparent outline-none text-[15px]"
              />
            </div>
            <button
              onClick={searchCustomer}
              className="px-5 rounded-xl text-white font-medium text-sm"
              style={{ backgroundColor: 'var(--color-ink)' }}
            >
              Find
            </button>
            <button
              onClick={openRegisterForm}
              title="Add a new customer"
              aria-label="Add a new customer"
              className="w-12 h-12 flex items-center justify-center rounded-xl text-white shrink-0"
              style={{ backgroundColor: 'var(--color-primary)' }}
            >
              <Plus size={20} />
            </button>
          </div>
          {searched && !customer && !showRegisterForm && (
            <p className="text-sm text-gray-500 mt-3">No customer found with that number.</p>
          )}
        </div>

        {showRegisterForm && (
          <div className="bg-white rounded-2xl shadow-sm p-4 mb-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center">
                  <UserRound size={16} style={{ color: 'var(--color-primary)' }} />
                </div>
                <p className="font-medium text-[15px]">New customer</p>
              </div>
              <button onClick={() => setShowRegisterForm(false)} className="text-gray-400">
                <X size={18} />
              </button>
            </div>
            <label className="text-xs font-medium text-gray-500 mb-1.5 block">Phone number</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="082 123 4567"
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-3 mb-3 text-[15px] outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:bg-white"
            />
            <label className="text-xs font-medium text-gray-500 mb-1.5 block">Full name</label>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Customer name"
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-3 mb-3 text-[15px] outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:bg-white"
            />
            <label className="text-xs font-medium text-gray-500 mb-1.5 block">Email (optional)</label>
            <input
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="customer@example.com"
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-3 mb-4 text-[15px] outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:bg-white"
            />
            <button
              onClick={registerCustomer}
              className="w-full py-3.5 rounded-xl text-white font-medium"
              style={{ backgroundColor: 'var(--color-primary)' }}
            >
              Register customer
            </button>
          </div>
        )}

        {customer && (
          <div className="bg-white rounded-2xl shadow-sm p-4 mb-4">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center">
                <UserRound size={18} style={{ color: 'var(--color-primary)' }} />
              </div>
              <div>
                <p className="font-medium text-[15px] leading-tight">{customer.name}</p>
                <p className="text-xs text-gray-500">Visit #{customer.total_visits + 1}</p>
              </div>
            </div>

            {vehicles.length > 0 && !addingVehicle && (
              <div className="mb-4">
                <label className="text-xs font-medium text-gray-500 mb-2 block">Vehicle</label>
                <div className="space-y-2">
                  {vehicles.map((v) => (
                    <button
                      key={v.id}
                      onClick={() => setSelectedVehicle(v.id)}
                      className={
                        'w-full flex items-center gap-3 p-3 rounded-xl border text-left transition ' +
                        (String(selectedVehicle) === String(v.id)
                          ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/5'
                          : 'border-gray-200')
                      }
                    >
                      <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                        <Car size={16} className="text-gray-500" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{v.make} {v.model}</p>
                        <p className="text-xs text-gray-500">{v.plate || 'No plate on file'}</p>
                      </div>
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => setAddingVehicle(true)}
                  className="flex items-center gap-1.5 text-sm font-medium mt-3"
                  style={{ color: 'var(--color-primary)' }}
                >
                  <Plus size={15} /> Add another vehicle
                </button>
              </div>
            )}

            {addingVehicle && (
              <div className="mb-4 p-3.5 rounded-xl bg-gray-50 border border-gray-200 space-y-2.5">
                <p className="text-sm font-medium text-gray-700 mb-1">
                  {vehicles.length === 0 ? 'Add their first vehicle' : 'Add a vehicle'}
                </p>
                <input
                  type="text"
                  value={newMake}
                  onChange={(e) => setNewMake(e.target.value)}
                  placeholder="Make (e.g. Toyota)"
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                />
                <input
                  type="text"
                  value={newModel}
                  onChange={(e) => setNewModel(e.target.value)}
                  placeholder="Model (e.g. Corolla)"
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                />
                <input
                  type="text"
                  value={newColor}
                  onChange={(e) => setNewColor(e.target.value)}
                  placeholder="Color"
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                />
                <input
                  type="text"
                  value={newPlate}
                  onChange={(e) => setNewPlate(e.target.value)}
                  placeholder="Plate"
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                />
                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={createVehicle}
                    className="flex-1 py-2.5 rounded-lg text-white text-sm font-medium"
                    style={{ backgroundColor: 'var(--color-ink)' }}
                  >
                    Save vehicle
                  </button>
                  {vehicles.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setAddingVehicle(false)}
                      className="px-4 py-2.5 rounded-lg border border-gray-300 text-sm font-medium"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            )}

            {!addingVehicle && (
              <>
                <label className="text-xs font-medium text-gray-500 mb-2 block">Service</label>
                <div className="space-y-2 mb-4">
                  {services.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setSelectedService(s.id)}
                      className={
                        'w-full flex items-center gap-3 p-3 rounded-xl border text-left transition ' +
                        (String(selectedService) === String(s.id)
                          ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/5'
                          : 'border-gray-200')
                      }
                    >
                      <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                        <Sparkles size={16} className="text-gray-500" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium">{s.name}</p>
                      </div>
                      <p className="text-sm font-semibold" style={{ color: 'var(--color-primary)' }}>R{s.price}</p>
                    </button>
                  ))}
                </div>

                <label className="text-xs font-medium text-gray-500 mb-2 block">Washed by</label>
                <div className="flex flex-wrap gap-2 mb-5">
                  {employees.map((emp) => (
                    <button
                      key={emp.id}
                      onClick={() => setSelectedEmployee(emp.id)}
                      className={
                        'px-4 py-2.5 rounded-full border text-sm font-medium transition ' +
                        (String(selectedEmployee) === String(emp.id)
                          ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/5 text-[var(--color-primary)]'
                          : 'border-gray-200 text-gray-600')
                      }
                    >
                      {emp.name}
                    </button>
                  ))}
                </div>

                <button
                  onClick={submitWash}
                  disabled={loading || !selectedVehicle}
                  className="w-full py-3.5 rounded-xl text-white font-semibold disabled:opacity-40"
                  style={{ backgroundColor: 'var(--color-primary)' }}
                >
                  {loading ? 'Logging...' : 'Log wash'}
                </button>
              </>
            )}
          </div>
        )}

        {error && (
          <p className="text-sm text-red-600 mb-4 px-1">{error}</p>
        )}

        {result && (
          <div
            className={
              'rounded-2xl p-4 flex items-start gap-3 ' +
              (result.discount_applied ? '' : 'bg-white shadow-sm')
            }
            style={result.discount_applied ? { backgroundColor: 'var(--color-amber-soft)' } : {}}
          >
            {result.discount_applied ? (
              <PartyPopper size={22} style={{ color: 'var(--color-amber)' }} className="shrink-0 mt-0.5" />
            ) : (
              <CheckCircle2 size={22} className="text-green-600 shrink-0 mt-0.5" />
            )}
            <div>
              {result.discount_applied ? (
                <>
                  <p className="font-semibold" style={{ color: '#8A5A00' }}>Loyalty discount applied</p>
                  <p className="text-sm mt-0.5" style={{ color: '#8A5A00' }}>
                    {result.discount_reason} - {result.discount_percent}% off
                  </p>
                </>
              ) : (
                <p className="font-semibold text-green-800">Wash logged successfully</p>
              )}
              <p className="text-sm mt-1.5 font-medium">Final price: R{result.final_price}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
