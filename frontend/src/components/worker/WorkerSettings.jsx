import { useState } from 'react';
import axios from '../../api/axios';

const WorkerSettings = () => {
  const [settings, setSettings] = useState({
    notifications: true,
    emailUpdates: false,
    smsAlerts: true,
    profileVisibility: 'public',
    language: 'en',
    timezone: 'UTC'
  });

  const [loading, setLoading] = useState(false);

  const handleSettingChange = (setting, value) => {
    setSettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await axios.put('/worker/settings', settings);
      alert('Settings saved successfully!');
    } catch (error) {
      alert('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="worker-settings">
      <div className="settings-header">
        <h1>Settings</h1>
        <p>Manage your account preferences and notifications</p>
      </div>

      <div className="settings-content">
        {/* Notification Settings */}
        <section className="settings-section">
          <h2>Notifications</h2>
          <div className="setting-item">
            <div className="setting-info">
              <label htmlFor="notifications">Push Notifications</label>
              <p>Receive notifications about new bookings and updates</p>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                id="notifications"
                checked={settings.notifications}
                onChange={(e) => handleSettingChange('notifications', e.target.checked)}
              />
              <span className="slider"></span>
            </label>
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <label htmlFor="emailUpdates">Email Updates</label>
              <p>Get weekly summaries and important updates via email</p>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                id="emailUpdates"
                checked={settings.emailUpdates}
                onChange={(e) => handleSettingChange('emailUpdates', e.target.checked)}
              />
              <span className="slider"></span>
            </label>
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <label htmlFor="smsAlerts">SMS Alerts</label>
              <p>Receive urgent alerts via SMS</p>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                id="smsAlerts"
                checked={settings.smsAlerts}
                onChange={(e) => handleSettingChange('smsAlerts', e.target.checked)}
              />
              <span className="slider"></span>
            </label>
          </div>
        </section>

        {/* Privacy Settings */}
        <section className="settings-section">
          <h2>Privacy</h2>
          <div className="setting-item">
            <div className="setting-info">
              <label htmlFor="profileVisibility">Profile Visibility</label>
              <p>Control who can see your profile information</p>
            </div>
            <select
              id="profileVisibility"
              value={settings.profileVisibility}
              onChange={(e) => handleSettingChange('profileVisibility', e.target.value)}
              className="setting-select"
            >
              <option value="public">Public</option>
              <option value="customers">Customers Only</option>
              <option value="private">Private</option>
            </select>
          </div>
        </section>

        {/* Preferences */}
        <section className="settings-section">
          <h2>Preferences</h2>
          <div className="setting-item">
            <div className="setting-info">
              <label htmlFor="language">Language</label>
              <p>Choose your preferred language</p>
            </div>
            <select
              id="language"
              value={settings.language}
              onChange={(e) => handleSettingChange('language', e.target.value)}
              className="setting-select"
            >
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
              <option value="de">German</option>
            </select>
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <label htmlFor="timezone">Timezone</label>
              <p>Set your local timezone</p>
            </div>
            <select
              id="timezone"
              value={settings.timezone}
              onChange={(e) => handleSettingChange('timezone', e.target.value)}
              className="setting-select"
            >
              <option value="UTC">UTC</option>
              <option value="EST">Eastern Time</option>
              <option value="PST">Pacific Time</option>
              <option value="GMT">Greenwich Mean Time</option>
            </select>
          </div>
        </section>

        {/* Account Actions */}
        <section className="settings-section">
          <h2>Account</h2>
          <div className="account-actions">
            <button className="action-btn secondary">Change Password</button>
            <button className="action-btn danger">Delete Account</button>
          </div>
        </section>

        <div className="settings-actions">
          <button
            onClick={handleSave}
            disabled={loading}
            className="save-btn"
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      <style>{`
        .worker-settings {
          max-width: 800px;
          margin: 0 auto;
          padding: 2rem;
        }

        .settings-header {
          margin-bottom: 3rem;
        }

        .settings-header h1 {
          font-size: 2rem;
          font-weight: 800;
          color: #111827;
          margin-bottom: 0.5rem;
        }

        .settings-header p {
          color: #6b7280;
          font-size: 1rem;
        }

        .settings-section {
          background: white;
          border-radius: 12px;
          padding: 2rem;
          margin-bottom: 2rem;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }

        .settings-section h2 {
          font-size: 1.25rem;
          font-weight: 700;
          color: #111827;
          margin-bottom: 1.5rem;
          padding-bottom: 0.5rem;
          border-bottom: 1px solid #e5e7eb;
        }

        .setting-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 0;
          border-bottom: 1px solid #f3f4f6;
        }

        .setting-item:last-child {
          border-bottom: none;
        }

        .setting-info {
          flex: 1;
          margin-right: 2rem;
        }

        .setting-info label {
          display: block;
          font-weight: 600;
          color: #111827;
          margin-bottom: 0.25rem;
        }

        .setting-info p {
          color: #6b7280;
          font-size: 0.9rem;
        }

        .toggle-switch {
          position: relative;
          display: inline-block;
          width: 50px;
          height: 24px;
        }

        .toggle-switch input {
          opacity: 0;
          width: 0;
          height: 0;
        }

        .slider {
          position: absolute;
          cursor: pointer;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: #ccc;
          transition: .4s;
          border-radius: 24px;
        }

        .slider:before {
          position: absolute;
          content: "";
          height: 18px;
          width: 18px;
          left: 3px;
          bottom: 3px;
          background-color: white;
          transition: .4s;
          border-radius: 50%;
        }

        input:checked + .slider {
          background-color: #3b82f6;
        }

        input:checked + .slider:before {
          transform: translateX(26px);
        }

        .setting-select {
          padding: 0.5rem 1rem;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          font-size: 0.9rem;
          color: #374151;
          background: white;
          cursor: pointer;
          min-width: 150px;
        }

        .account-actions {
          display: flex;
          gap: 1rem;
        }

        .action-btn {
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 8px;
          font-size: 0.9rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .action-btn.secondary {
          background: #e5e7eb;
          color: #374151;
        }

        .action-btn.secondary:hover {
          background: #d1d5db;
        }

        .action-btn.danger {
          background: #ef4444;
          color: white;
        }

        .action-btn.danger:hover {
          background: #dc2626;
        }

        .settings-actions {
          display: flex;
          justify-content: flex-end;
          margin-top: 2rem;
        }

        .save-btn {
          padding: 0.875rem 2rem;
          background: #3b82f6;
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .save-btn:hover:not(:disabled) {
          background: #2563eb;
        }

        .save-btn:disabled {
          background: #9ca3af;
          cursor: not-allowed;
        }

        @media (max-width: 768px) {
          .worker-settings {
            padding: 1rem;
          }

          .setting-item {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
          }

          .setting-info {
            margin-right: 0;
          }

          .account-actions {
            flex-direction: column;
          }

          .settings-actions {
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
};

export default WorkerSettings;
