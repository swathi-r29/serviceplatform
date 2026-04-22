import { useState, useEffect, useContext } from 'react';
import axios from '../../api/axios';
import { AuthContext } from '../../context/AuthContext';

const AdminSettings = () => {
  const { user } = useContext(AuthContext);
  const [settings, setSettings] = useState({
    systemNotifications: true,
    emailAlerts: true,
    maintenanceMode: false,
    allowNewRegistrations: true,
    defaultCommissionRate: 10,
    supportEmail: 'support@servicehub.com',
    systemTimezone: 'UTC',
    backupFrequency: 'daily'
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await axios.get('/admin/settings');
      setSettings(response.data);
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    }
  };

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSaveSettings = async () => {
    setLoading(true);
    try {
      await axios.put('/admin/settings', settings);
      alert('Settings saved successfully!');
    } catch (error) {
      alert('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 p-4 md:p-8">
      <div className="w-full max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Platform Settings</h1>
          <p className="text-slate-600 font-medium">Configure global platform parameters and system preferences.</p>
        </div>

        <div className="space-y-6">
          {/* System Settings */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
            <h2 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-4 mb-6 flex items-center gap-2">
              <div className="w-2 h-6 bg-brand-azure rounded-full"></div>
              System Configuration
            </h2>
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div>
                  <p className="font-bold text-slate-900">Maintenance Mode</p>
                  <p className="text-xs text-slate-500">Temporarily disable the platform for maintenance</p>
                </div>
                <button
                  onClick={() => handleSettingChange('maintenanceMode', !settings.maintenanceMode)}
                  className={`w-14 h-8 rounded-full transition-all relative ${settings.maintenanceMode ? 'bg-red-500' : 'bg-slate-300'}`}
                >
                  <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${settings.maintenanceMode ? 'left-7' : 'left-1'}`}></div>
                </button>
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div>
                  <p className="font-bold text-slate-900">Allow New Registrations</p>
                  <p className="text-xs text-slate-500">Enable/disable new user and worker registrations</p>
                </div>
                <button
                  onClick={() => handleSettingChange('allowNewRegistrations', !settings.allowNewRegistrations)}
                  className={`w-14 h-8 rounded-full transition-all relative ${settings.allowNewRegistrations ? 'bg-brand-azure' : 'bg-slate-300'}`}
                >
                  <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${settings.allowNewRegistrations ? 'left-7' : 'left-1'}`}></div>
                </button>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">Default Commission Rate (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={settings.defaultCommissionRate}
                    onChange={(e) => handleSettingChange('defaultCommissionRate', parseInt(e.target.value))}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-azure/20 outline-none transition-all font-medium"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">Support Email</label>
                  <input
                    type="email"
                    value={settings.supportEmail}
                    onChange={(e) => handleSettingChange('supportEmail', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-azure/20 outline-none transition-all font-medium"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">System Timezone</label>
                  <select
                    value={settings.systemTimezone}
                    onChange={(e) => handleSettingChange('systemTimezone', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-azure/20 outline-none transition-all font-medium appearance-none bg-white"
                  >
                    <option value="UTC">UTC (Universal)</option>
                    <option value="EST">EST (Eastern)</option>
                    <option value="PST">PST (Pacific)</option>
                    <option value="IST">IST (India)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">Backup Frequency</label>
                  <select
                    value={settings.backupFrequency}
                    onChange={(e) => handleSettingChange('backupFrequency', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-azure/20 outline-none transition-all font-medium appearance-none bg-white"
                  >
                    <option value="hourly">Hourly</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Notification Settings */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
            <h2 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-4 mb-6 flex items-center gap-2">
              <div className="w-2 h-6 bg-indigo-500 rounded-full"></div>
              Notifications & Alerts
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div>
                  <p className="font-bold text-slate-900">System Notifications</p>
                  <p className="text-xs text-slate-500">Receive notifications about system events</p>
                </div>
                <button
                  onClick={() => handleSettingChange('systemNotifications', !settings.systemNotifications)}
                  className={`w-14 h-8 rounded-full transition-all relative ${settings.systemNotifications ? 'bg-indigo-600' : 'bg-slate-300'}`}
                >
                  <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${settings.systemNotifications ? 'left-7' : 'left-1'}`}></div>
                </button>
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div>
                  <p className="font-bold text-slate-900">Email Alerts</p>
                  <p className="text-xs text-slate-500">Send email notifications for critical events</p>
                </div>
                <button
                  onClick={() => handleSettingChange('emailAlerts', !settings.emailAlerts)}
                  className={`w-14 h-8 rounded-full transition-all relative ${settings.emailAlerts ? 'bg-indigo-600' : 'bg-slate-300'}`}
                >
                  <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${settings.emailAlerts ? 'left-7' : 'left-1'}`}></div>
                </button>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="pt-6">
            <button
              onClick={handleSaveSettings}
              disabled={loading}
              className="w-full bg-brand-azure hover:bg-blue-600 text-white font-bold py-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 shadow-brand-azure/20"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Save Configuration
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
