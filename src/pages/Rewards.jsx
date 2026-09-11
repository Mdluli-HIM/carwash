import { useState } from 'react';
import api from '../api/client';
import { Phone, Gift, PartyPopper, Search, Clock, Droplets, CheckCircle2 } from 'lucide-react';

export default function Rewards() {
  const [phone, setPhone] = useState('');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);

  async function handleSearch(e) {
    e.preventDefault();
    if (!phone.trim()) {
      setError('Enter your phone number.');
      return;
    }
    setError('');
    setLoading(true);
    setSearched(true);
    try {
      const res = await api.get('/rewards?phone=' + encodeURIComponent(phone));
      setData(res.data);
    } catch (err) {
      setData(null);
      setError(err.response && err.response.status === 404
        ? "We couldn't find that number. Check with staff on your next visit!"
        : 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const statusSteps = ['pending', 'washing', 'done'];
  const statusLabels = {
    pending: 'Checked in',
    washing: 'Being washed',
    done: 'Ready for pickup',
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">

        <div className="text-center mb-6">
          <img src="/logo.png" alt="Kasi Wash" className="h-16 w-auto object-contain mx-auto mb-4" />
          <h1 className="text-xl font-bold" style={{ color: 'var(--color-ink)' }}>Check your rewards</h1>
          <p className="text-sm text-gray-500 mt-1">Enter your phone number to see how close you are to a discount</p>
        </div>

        <form onSubmit={handleSearch} className="bg-white rounded-2xl shadow-sm p-4 mb-4">
          <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 mb-3 focus-within:ring-2 focus-within:ring-[var(--color-primary)] focus-within:bg-white">
            <Phone size={16} className="text-gray-400 shrink-0" />
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="082 123 4567"
              className="w-full py-3 bg-transparent outline-none text-[15px]"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-white font-semibold disabled:opacity-50"
            style={{ backgroundColor: 'var(--color-primary)' }}
          >
            <Search size={16} />
            {loading ? 'Checking...' : 'Check my rewards'}
          </button>
        </form>

        {error && (
          <p className="text-sm text-red-600 text-center mb-4">{error}</p>
        )}

        {data && (
          <>
            <div className="bg-white rounded-2xl shadow-sm p-4 mb-4 text-center">
              <p className="text-lg font-bold" style={{ color: 'var(--color-ink)' }}>
                Hi {data.customer.name.split(' ')[0]}!
              </p>
              <p className="text-sm text-gray-500 mt-0.5">
                You've washed with us {data.customer.total_visits} time{data.customer.total_visits === 1 ? '' : 's'}
              </p>
            </div>

            {data.active_wash && (
              <div className="bg-white rounded-2xl shadow-sm p-4 mb-4">
                <p className="text-sm font-semibold mb-3" style={{ color: 'var(--color-ink)' }}>
                  Your car right now
                </p>
                <p className="text-xs text-gray-500 mb-3">
                  {data.active_wash.vehicle_make} {data.active_wash.vehicle_model}
                  {data.active_wash.vehicle_plate ? ' · ' + data.active_wash.vehicle_plate : ''}
                  {' · '}{data.active_wash.service_name}
                </p>
                <div className="flex items-center justify-between">
                  {statusSteps.map((step, idx) => {
                    const currentIdx = statusSteps.indexOf(data.active_wash.status);
                    const isActive = idx === currentIdx;
                  const isPast = idx < currentIdx;
                    const isDone = isActive || isPast;
                    const Icon = step === 'pending' ? Clock : step === 'washing' ? Droplets : CheckCircle2;
                    return (
                      <div key={step} className="flex-1 flex flex-col items-center">
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center mb-1.5"
                          style={{
                            backgroundColor: isDone ? 'var(--color-primary)' : 'var(--color-surface)',
                            color: isDone ? 'white' : '#9CA3AF',
                          }}
                        >
                          <Icon size={16} />
                        </div>
                        <p
                          className="text-[10px] text-center font-medium"
                          style={{ color: isDone ? 'var(--color-ink)' : '#9CA3AF' }}
                        >
                          {statusLabels[step]}
                        </p>
                        {idx < statusSteps.length - 1 && (
                          <div
                            className="h-0.5 w-full mt-[-24px] mb-[24px]"
                            style={{
                              backgroundColor: isPast ? 'var(--color-primary)' : '#E5E7EB',
                              marginLeft: '50%',
                            }}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="space-y-3">
              {data.progress.map((p, i) => (
                <div
                  key={i}
                  className="rounded-2xl p-4"
                  style={
                    p.eligible_now
                      ? { backgroundColor: 'var(--color-gold-soft)', border: '1px solid var(--color-gold)' }
                      : { backgroundColor: 'white' }
                  }
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                      style={{ backgroundColor: p.eligible_now ? 'white' : 'var(--color-surface)' }}
                    >
                      {p.eligible_now ? (
                        <PartyPopper size={18} style={{ color: 'var(--color-gold)' }} />
                      ) : (
                        <Gift size={18} style={{ color: 'var(--color-primary)' }} />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      {p.eligible_now ? (
                        <>
                          <p className="text-sm font-bold" style={{ color: '#8A5A00' }}>
                            You've earned {p.discount_percent}% off!
                          </p>
                          <p className="text-xs mt-0.5" style={{ color: '#8A5A00' }}>
                            Just mention it on your next wash
                          </p>
                        </>
                      ) : (
                        <>
                          <p className="text-sm font-semibold" style={{ color: 'var(--color-ink)' }}>
                            {p.remaining} more wash{p.remaining === 1 ? '' : 'es'} for {p.discount_percent}% off
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            Wash {p.threshold} times within {p.window_days} days
                          </p>
                          <div className="w-full h-2 rounded-full bg-gray-100 mt-2 overflow-hidden">
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: (Math.min(p.visits_in_window, p.threshold) / p.threshold * 100) + '%',
                                backgroundColor: 'var(--color-primary)',
                              }}
                            />
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {data.progress.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-4">No active rewards right now — check back soon!</p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
