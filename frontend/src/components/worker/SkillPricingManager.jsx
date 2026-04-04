import { useState, useEffect, useCallback } from 'react';
import axios from '../../api/axios';

const DURATION_OPTIONS = [30, 60, 90, 120, 180];

const defaultEntry = (skill) => ({
  skill,
  rate: 0,
  rateType: 'fixed',
  estimatedDuration: 60,
  isActive: false,
  _dirty: false,
});

const SkillPricingManager = () => {
  const [pricing, setPricing] = useState([]);
  const [unpricedSkills, setUnpricedSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // ─── Fetch ──────────────────────────────────────────────────────────────────
  const fetchPricing = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await axios.get('/worker/skill-pricing');

      // Merge server entries; mark all as clean
      const serverEntries = (data.skillPricing || []).map(sp => ({
        ...sp,
        _dirty: false,
      }));

      // Add placeholder rows for unpriced skills
      const unpriced = (data.unpricedSkills || []).map(defaultEntry);

      setPricing([...serverEntries, ...unpriced]);
      setUnpricedSkills(data.unpricedSkills || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load skill pricing.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPricing(); }, [fetchPricing]);

  // ─── Field change ────────────────────────────────────────────────────────────
  const handleChange = (index, field, value) => {
    setPricing(prev => {
      const next = [...prev];
      const entry = { ...next[index], [field]: value, _dirty: true };
      // Prevent negative rates
      if (field === 'rate') entry.rate = Math.max(0, parseFloat(value) || 0);
      next[index] = entry;
      return next;
    });
  };

  // ─── Save all ────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      // Strip internal _dirty flag before sending
      const payload = pricing.map(({ _dirty, ...rest }) => rest);
      await axios.put('/worker/skill-pricing', { skillPricing: payload });
      setSuccess('Pricing saved successfully!');
      // Refresh from server to get clean state
      await fetchPricing();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save pricing.');
    } finally {
      setSaving(false);
    }
  };

  // ─── Helpers ─────────────────────────────────────────────────────────────────
  const isNotVisible = (entry) => !entry.isActive || entry.rate === 0;
  const hasDirty = pricing.some(e => e._dirty);

  // ─── Loading skeleton ────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-40 bg-gray-100 rounded-2xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'Playfair Display, serif' }}>
            Skill Pricing
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Set individual rates for each service you offer.
          </p>
        </div>
        {unpricedSkills.length > 0 && (
          <span className="text-xs font-bold text-amber-700 bg-amber-100 px-3 py-1.5 rounded-full border border-amber-200">
            ⚠ {unpricedSkills.length} skill{unpricedSkills.length > 1 ? 's' : ''} unpriced
          </span>
        )}
      </div>

      {/* ── Alerts ── */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg text-sm text-red-700">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-r-lg text-sm text-green-700">
          {success}
        </div>
      )}

      {/* ── No skills ── */}
      {pricing.length === 0 && (
        <div className="text-center py-16 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
          <p className="text-gray-500 text-sm">
            You haven't added any skills yet. Add skills in your profile to configure pricing.
          </p>
        </div>
      )}

      {/* ── Skill Cards ── */}
      <div className="space-y-4">
        {pricing.map((entry, idx) => (
          <div
            key={entry.skill}
            className={`bg-white rounded-2xl border-2 transition-all duration-200 shadow-sm overflow-hidden ${
              entry.isActive
                ? 'border-orange-200'
                : 'border-gray-100 opacity-80'
            } ${entry._dirty ? 'ring-2 ring-amber-300' : ''}`}
          >
            {/* Card header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50 bg-gray-50/50">
              <div className="flex items-center gap-3">
                <span className="text-base font-bold text-gray-900">{entry.skill}</span>

                {/* Unsaved dot */}
                {entry._dirty && (
                  <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" title="Unsaved changes" />
                )}

                {/* Not Visible badge */}
                {isNotVisible(entry) && (
                  <span className="text-[10px] font-black uppercase tracking-wider text-red-600 bg-red-50 border border-red-100 px-2 py-0.5 rounded-full">
                    Not Visible to Customers
                  </span>
                )}
              </div>

              {/* Active toggle */}
              <label className="relative inline-flex items-center cursor-pointer gap-2">
                <span className="text-xs font-semibold text-gray-500">
                  {entry.isActive ? 'Active' : 'Inactive'}
                </span>
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={entry.isActive}
                  onChange={e => handleChange(idx, 'isActive', e.target.checked)}
                />
                <div className="w-10 h-5 bg-gray-200 rounded-full peer
                  peer-checked:after:translate-x-5
                  after:content-[''] after:absolute after:top-0.5 after:right-[22px]
                  after:bg-white after:rounded-full after:h-4 after:w-4
                  after:transition-all peer-checked:bg-[#e67e22]" />
              </label>
            </div>

            {/* Card body */}
            <div className="px-5 py-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Rate */}
              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-gray-400 mb-1.5">
                  Rate (₹)
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-3 flex items-center text-gray-400 font-bold text-sm pointer-events-none">
                    ₹
                  </span>
                  <input
                    type="number"
                    min="0"
                    value={entry.rate}
                    onChange={e => handleChange(idx, 'rate', e.target.value)}
                    className="w-full pl-7 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#e67e22] focus:border-transparent"
                    placeholder="0"
                  />
                </div>
                {entry.rate === 0 && (
                  <p className="text-[10px] text-amber-600 mt-1 font-medium">
                    ⚠ Rate is ₹0 — set a price to go visible
                  </p>
                )}
              </div>

              {/* Rate Type */}
              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-gray-400 mb-1.5">
                  Pricing Type
                </label>
                <div className="flex rounded-xl overflow-hidden border border-gray-200">
                  <button
                    type="button"
                    onClick={() => handleChange(idx, 'rateType', 'fixed')}
                    className={`flex-1 py-2.5 text-xs font-bold transition-colors ${
                      entry.rateType === 'fixed'
                        ? 'bg-[#e67e22] text-white'
                        : 'bg-white text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    Fixed Price
                  </button>
                  <button
                    type="button"
                    onClick={() => handleChange(idx, 'rateType', 'hourly')}
                    className={`flex-1 py-2.5 text-xs font-bold transition-colors border-l border-gray-200 ${
                      entry.rateType === 'hourly'
                        ? 'bg-[#e67e22] text-white'
                        : 'bg-white text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    Hourly Rate
                  </button>
                </div>
              </div>

              {/* Estimated Duration */}
              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-gray-400 mb-1.5">
                  Est. Duration
                </label>
                <select
                  value={entry.estimatedDuration}
                  onChange={e => handleChange(idx, 'estimatedDuration', parseInt(e.target.value))}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#e67e22] bg-white"
                >
                  {DURATION_OPTIONS.map(min => (
                    <option key={min} value={min}>
                      {min < 60 ? `${min} min` : `${min / 60}h ${min % 60 > 0 ? `${min % 60}m` : ''}`}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Price preview pill */}
            {entry.rate > 0 && (
              <div className="px-5 pb-4">
                <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#e67e22] bg-orange-50 border border-orange-100 px-3 py-1 rounded-full">
                  {entry.rateType === 'hourly'
                    ? `₹${entry.rate}/hr · ~${entry.estimatedDuration} min job`
                    : `₹${entry.rate} fixed · ~${entry.estimatedDuration} min`}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ── Save Button ── */}
      {pricing.length > 0 && (
        <div className="flex items-center justify-between pt-2">
          {hasDirty && (
            <p className="text-xs text-amber-600 font-semibold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
              You have unsaved changes
            </p>
          )}
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="ml-auto inline-flex items-center justify-center gap-2 px-8 py-3 rounded-full text-white font-bold text-sm shadow-md shadow-orange-100 transition-all hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
            style={{ background: saving ? '#ccc' : 'linear-gradient(135deg, #e67e22, #d35400)' }}
          >
            {saving ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Saving…
              </>
            ) : (
              'Save All Pricing'
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default SkillPricingManager;
