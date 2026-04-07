import { useState, useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Register = () => {
  const { register } = useContext(AuthContext);
  const location = useLocation();
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', phone: '',
    role: location.pathname === '/worker/register' ? 'worker' : 'user',
    address: '', location: '', skills: []
  });
  const categories = [
    'Plumbing', 'Electrical', 'Cleaning', 'Carpentry', 'Painting', 
    'Pest Control', 'Appliance Repair', 
    'Packers & Movers', 'Salon Services', 
    'Gardening', 'Smart Home', 'Other'
  ];
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [coords, setCoords] = useState(null);
  const [locating, setLocating] = useState(false);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleLocate = () => {
    if (!navigator.geolocation) return alert('Geolocation not supported by your browser');
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocating(false);
        // Small visual feedback with a dummy address if empty
        if (!formData.location) setFormData(prev => ({ ...prev, location: 'Current GPS Location' }));
      },
      (err) => {
        console.error(err);
        setLocating(false);
        alert('Could not get location. Please allow location access.');
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const userData = { ...formData };
      if (formData.role === 'worker') {
        if (coords) userData.locationCoords = coords;
      }
      await register(userData);
      setLoading(false);
    } catch (err) {
      setError(err);
      setLoading(false);
    }
  };

  const isWorker = formData.role === 'worker';

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,700;0,800;1,600&family=DM+Sans:wght@300;400;500;600&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }

        .rp { min-height: 100vh; display: grid; grid-template-columns: 1fr 1fr; font-family: 'DM Sans', sans-serif; }

        /* ── LEFT ── */
        .rp-left {
          position: relative;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 2.5rem 6rem;
          overflow: hidden;
        }

        /* Different photo for register — a happy worker / professional */
        .rp-bg {
          position: absolute; inset: 0;
          background-image: url('https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=900&q=80&fit=crop&crop=center');
          background-size: cover;
          background-position: center;
          z-index: 0;
        }

        .rp-overlay {
          position: absolute; inset: 0;
          background: linear-gradient(
            145deg,
            rgba(8,8,8,0.50) 0%,
            rgba(15,12,8,0.40) 50%,
            rgba(100,65,20,0.30) 85%,
            rgba(196,151,93,0.15) 100%
          );
          z-index: 1;
        }

        .rp-vignette {
          position: absolute; bottom: 0; left: 0; right: 0;
          height: 200px;
          background: linear-gradient(to top, rgba(196,151,93,0.2), transparent);
          z-index: 2;
          pointer-events: none;
        }

        .rp-logo {
          font-family: 'Playfair Display', serif;
          font-style: italic;
          font-size: 1.75rem;
          color: white;
          text-decoration: none;
          position: absolute;
          top: 2.5rem;
          left: 6rem;
          z-index: 5;
        }

        .rp-content-box {
          background: rgba(40, 30, 20, 0.4);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 20px;
          padding: 3rem 2.5rem;
          position: relative;
          z-index: 3;
          max-width: 500px;
          margin: 0 auto;
          box-shadow: 0 20px 40px rgba(0,0,0,0.4);
        }

        .pro-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.6rem;
          padding: 0.45rem 1.1rem;
          border: 1px solid rgba(196, 151, 93, 0.4);
          border-radius: 30px;
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 0.1em;
          color: #d4a96a;
          background: rgba(196, 151, 93, 0.08);
          margin-bottom: 2rem;
        }

        .pro-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: #d4a96a;
          box-shadow: 0 0 6px #d4a96a;
        }

        .rp-headline {
          font-family: 'Playfair Display', serif;
          font-size: 3rem;
          font-weight: 800;
          color: white;
          line-height: 1.12;
          margin-bottom: 1.5rem;
          text-shadow: 0 2px 10px rgba(0,0,0,0.4);
        }

        .rp-headline em { color: #d4a96a; font-style: italic; }

        .headline-separator {
          width: 60px;
          height: 3px;
          background: linear-gradient(90deg, #d4a96a, transparent);
          margin-bottom: 2rem;
          border-radius: 2px;
          box-shadow: 0 0 6px rgba(212, 169, 106, 0.4);
        }

        .perk-list { list-style: none; display: flex; flex-direction: column; gap: 1.25rem; }

        .perk-item {
          display: flex; align-items: center; gap: 1rem;
          color: rgba(255,255,255,0.85);
          font-size: 0.95rem;
          font-weight: 500;
        }

        .check-wrap {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: rgba(196, 151, 93, 0.15);
          border: 1px solid rgba(196, 151, 93, 0.35);
          color: #d4a96a;
          flex-shrink: 0;
        }

        /* ── RIGHT ── */
        .rp-right {
          background: #f5ede2;
          display: flex;
          align-items: flex-start;
          justify-content: center;
          padding: 2.5rem 2.5rem;
          overflow-y: auto;
        }

        .rp-form-wrap {
          width: 100%;
          max-width: 430px;
          padding-top: 1rem;
          animation: fadeUp .5s ease both;
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(18px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .f-eyebrow { font-size:.77rem; font-weight:600; text-transform:uppercase; letter-spacing:.13em; color:#c4975d; margin-bottom:.4rem; }
        .f-title { font-family:'Playfair Display',serif; font-size:2.2rem; font-weight:700; color:#1a1a1a; margin-bottom:.35rem; }
        .f-sub { color:#909090; font-size:.9rem; margin-bottom:1.6rem; }
        .f-sub a { color:#c4975d; font-weight:600; text-decoration:none; }

        .role-pill { display:flex; background:#ece4d6; border-radius:10px; padding:4px; margin-bottom:1.6rem; }

        .rpill-btn { flex:1; padding:.65rem 1rem; border:none; background:transparent; border-radius:8px; font-family:'DM Sans',sans-serif; font-size:.875rem; font-weight:500; color:#888; cursor:pointer; transition:all .22s; }
        .rpill-btn.on { background:#1a1a1a; color:white; box-shadow:0 2px 10px rgba(0,0,0,.18); }

        .section-lbl {
          font-size:.72rem; font-weight:700; text-transform:uppercase; letter-spacing:.1em;
          color:#c4975d; margin:1.35rem 0 .9rem;
          padding-bottom:.5rem; border-bottom:1px solid #e0d4c0;
        }

        .err { background:#fef2f2; border-left:3px solid #ef4444; color:#dc2626; padding:.875rem 1rem; border-radius:8px; margin-bottom:1.1rem; font-size:.9rem; }

        .grid2 { display:grid; grid-template-columns:1fr 1fr; gap:1rem; }

        .fgrp { margin-bottom:1rem; }
        .flbl { display:block; font-size:.82rem; font-weight:600; color:#3d3d3d; margin-bottom:.38rem; }
        .flbl-opt { font-weight:400; color:#aaa; }

        .finp, .ftxt {
          width:100%; padding:.8rem 1rem;
          border:1.5px solid #ddd0bc; border-radius:10px;
          font-size:.94rem; font-family:'DM Sans',sans-serif;
          color:#1a1a1a; background:white;
          transition:all .22s; outline:none;
        }

        .finp:focus, .ftxt:focus { border-color:#c4975d; box-shadow:0 0 0 3px rgba(196,151,93,.12); }
        .ftxt { resize:vertical; min-height:75px; }
        .fhint { font-size:.77rem; color:#b0a898; margin-top:.3rem; }

        .sbtn {
          width:100%; padding:1rem; background:#1a1a1a; color:white;
          border:none; border-radius:10px; font-size:1rem; font-weight:600;
          font-family:'DM Sans',sans-serif; cursor:pointer; transition:all .3s;
          margin-top:1.1rem; position:relative; overflow:hidden;
        }
        .sbtn::before { content:''; position:absolute; inset:0; background:linear-gradient(135deg,#c4975d,#a67c45); opacity:0; transition:opacity .3s; }
        .sbtn:hover::before { opacity:1; }
        .sbtn:hover { transform:translateY(-1px); box-shadow:0 6px 20px rgba(0,0,0,.18); }
        .sbtn:disabled { background:#c0b8ad; cursor:not-allowed; transform:none; box-shadow:none; }
        .sbtn:disabled::before { display:none; }
        .sbtn span { position:relative; z-index:1; }

        .divider { display:flex; align-items:center; gap:1rem; margin:1.25rem 0; }
        .dline { flex:1; height:1px; background:#ddd0bc; }
        .dtxt { font-size:.8rem; color:#b0a898; white-space:nowrap; }

        .gbtn {
          width:100%; display:flex; align-items:center; justify-content:center; gap:.75rem;
          padding:.82rem 1rem; border:1.5px solid #ddd0bc; border-radius:10px;
          background:white; color:#3d3d3d; font-size:.9rem; font-weight:500;
          font-family:'DM Sans',sans-serif; cursor:pointer; transition:all .22s;
        }
        .gbtn:hover { border-color:#c4975d; background:#faf7f2; transform:translateY(-1px); box-shadow:0 4px 12px rgba(0,0,0,.07); }

        .cta { text-align:center; margin-top:1.35rem; color:#909090; font-size:.9rem; }
        .cta a { color:#c4975d; font-weight:600; text-decoration:none; }

        /* Skill Tags */
        .skills-grid { display: flex; flex-wrap: wrap; gap: 0.6rem; margin-top: 0.8rem; }
        .skill-tag {
          padding: 0.5rem 1rem;
          background: #ece4d6;
          border: 1.5px solid transparent;
          border-radius: 30px;
          font-size: 0.82rem;
          font-weight: 500;
          color: #6d6d6d;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          user-select: none;
        }
        .skill-tag:hover {
          background: #e0d4c0;
          border-color: #c4975d;
          transform: translateY(-1px);
        }
        .skill-tag.selected {
          background: #1a1a1a;
          color: white;
          border-color: #1a1a1a;
          box-shadow: 0 4px 10px rgba(0,0,0,0.15);
        }

        @media (max-width:768px) {
          .rp { grid-template-columns:1fr; }
          .rp-left { display:none; }
          .rp-right { padding:2rem 1.25rem; }
          .grid2 { grid-template-columns:1fr; }
        }
      `}</style>

      <div className="rp">
        {/* LEFT — Photo panel */}
        <div className="rp-left">
          <div className="rp-bg" />
          <div className="rp-overlay" />
          <div className="rp-vignette" />



          <div className="rp-content-box">


            <h2 className="rp-headline">
              Join thousands of<br />
              <em>trusted</em> professionals.
            </h2>

            <div className="headline-separator" />

            <ul className="perk-list">
              <li className="perk-item">
                <div className="check-wrap">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                </div>
                Verified background checks on all professionals
              </li>
              <li className="perk-item">
                <div className="check-wrap">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                </div>
                Real-time job tracking & instant notifications
              </li>
              <li className="perk-item">
                <div className="check-wrap">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                </div>
                Transparent, upfront pricing — no surprises
              </li>
              <li className="perk-item">
                <div className="check-wrap">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                </div>
                24/7 dedicated customer support
              </li>
            </ul>
          </div>
        </div>

        {/* RIGHT — Form */}
        <div className="rp-right">
          <div className="rp-form-wrap">
            <p className="f-eyebrow">Get started</p>
            <h1 className="f-title">Create your account</h1>
            <p className="f-sub">Already have an account? <Link to="/login">Sign in</Link></p>

            <div className="role-pill">
              <button type="button" className={`rpill-btn ${!isWorker ? 'on' : ''}`} onClick={() => setFormData({ ...formData, role: 'user', skills: [] })}>I'm a Customer</button>
              <button type="button" className={`rpill-btn ${isWorker ? 'on' : ''}`} onClick={() => setFormData({ ...formData, role: 'worker' })}>I'm a Provider</button>
            </div>

            {error && <div className="err">{error}</div>}

            <form onSubmit={handleSubmit}>
              <p className="section-lbl">Personal Information</p>

              <div className="grid2">
                <div className="fgrp">
                  <label className="flbl">Full Name</label>
                  <input type="text" name="name" value={formData.name} onChange={handleChange} className="finp" placeholder="John Doe" required />
                </div>
                <div className="fgrp">
                  <label className="flbl">Phone</label>
                  <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="finp" placeholder="1234567890" required />
                </div>
              </div>

              <div className="fgrp">
                <label className="flbl">Email Address</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} className="finp" placeholder="you@example.com" required />
              </div>

              <div className="fgrp">
                <label className="flbl">Password</label>
                <input type="password" name="password" value={formData.password} onChange={handleChange} className="finp" placeholder="Min. 6 characters" minLength="6" required />
              </div>

              {!isWorker && (
                <div className="fgrp">
                  <label className="flbl">Address <span className="flbl-opt">(optional)</span></label>
                  <textarea name="address" value={formData.address} onChange={handleChange} className="ftxt" placeholder="Your delivery address" rows="2" />
                </div>
              )}

              {isWorker && (
                <>
                  <p className="section-lbl">Provider Details</p>
                  <div className="fgrp">
                    <label className="flbl">Service Location</label>
                    <div className="relative">
                      <input type="text" name="location" value={formData.location} onChange={handleChange} className="finp pr-12" placeholder="City, State" required />
                      <button 
                        type="button" 
                        onClick={handleLocate}
                        className={`absolute right-2 top-1.5 p-2 rounded-lg transition-colors ${coords ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                        title="Detect my current location"
                      >
                        {locating ? (
                          <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        )}
                      </button>
                    </div>
                    {coords && <p className="fhint text-green-600 font-medium mt-1">✓ Coordinates captured for Travel Charge</p>}
                  </div>
                  <div className="fgrp">
                    <label className="flbl">Skills & Services <span className="flbl-opt">(Select current expertise)</span></label>
                    <div className="skills-grid">
                      {categories.map(cat => (
                        <div 
                          key={cat}
                          onClick={() => {
                            const newSkills = formData.skills.includes(cat)
                              ? formData.skills.filter(s => s !== cat)
                              : [...formData.skills, cat];
                            setFormData({ ...formData, skills: newSkills });
                          }}
                          className={`skill-tag ${formData.skills.includes(cat) ? 'selected' : ''}`}
                        >
                          {cat}
                        </div>
                      ))}
                    </div>
                    <p className="fhint mt-2">You can select multiple skills. This helps AI match you with jobs.</p>
                  </div>
                </>
              )}

              <button type="submit" disabled={loading} className="sbtn">
                <span>{loading ? 'Creating Account...' : 'Create Account'}</span>
              </button>
            </form>

            <div className="divider"><div className="dline" /><span className="dtxt">or register with</span><div className="dline" /></div>

            <button onClick={() => window.location.href = 'http://localhost:5000/api/auth/google'} className="gbtn">
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Continue with Google
            </button>

            <p className="cta">Already have an account? <Link to="/login">Sign in here</Link></p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Register;