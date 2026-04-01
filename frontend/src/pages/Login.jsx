import { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Login = () => {
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password, role);
      setLoading(false);
    } catch (err) {
      setError(err);
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,800;1,700;1,800&family=DM+Sans:wght@300;400;500;600&display=swap');

        *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }

        .page {
          min-height: 100vh;
          display: grid;
          grid-template-columns: 1fr 1fr;
          font-family: 'DM Sans', sans-serif;
        }

        /* ═══════════════════════════
           LEFT — Pure dark panel
        ═══════════════════════════ */
        .left {
          background: #111009;
          position: relative;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 2.75rem 6rem;
          overflow: hidden;
        }

        /* Very subtle warm radial glow so it's not totally flat */
        .left::after {
          content: '';
          position: absolute;
          bottom: -120px;
          right: -120px;
          width: 480px;
          height: 480px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(196,151,93,0.09) 0%, transparent 70%);
          pointer-events: none;
        }

        .logo {
          font-family: 'Playfair Display', serif;
          font-style: italic;
          font-size: 1.55rem;
          color: #fff;
          text-decoration: none;
          letter-spacing: -0.2px;
          position: relative;
          z-index: 1;
        }

        .left-copy {
          position: relative;
          z-index: 1;
        }

        .big-headline {
          font-family: 'Playfair Display', serif;
          font-size: 6.5rem;
          font-weight: 800;
          color: #fff;
          line-height: 1.08;
          margin-bottom: 1.5rem;
          letter-spacing: -1px;
        }

        .big-headline em {
          color: #c4975d;
          font-style: italic;
        }

        .left-desc {
          font-size: 1rem;
          color: rgba(255,255,255,0.45);
          line-height: 1.7;
          max-width: 320px;
        }

        /* ═══════════════════════════
           RIGHT — Cream form panel
        ═══════════════════════════ */
        .right {
          background: #f0e8d8;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 3rem 3rem;
        }

        .form-wrap {
          width: 100%;
          max-width: 420px;
          animation: up 0.5s ease both;
        }

        @keyframes up {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .eyebrow {
          font-size: 0.72rem;
          font-weight: 600;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: #c4975d;
          margin-bottom: 0.6rem;
        }

        .page-title {
          font-family: 'Playfair Display', serif;
          font-size: 3rem;
          font-weight: 800;
          color: #111009;
          line-height: 1.05;
          margin-bottom: 0.5rem;
          letter-spacing: -1px;
        }

        .page-sub {
          font-size: 0.9rem;
          color: #9a9080;
          margin-bottom: 2.25rem;
          line-height: 1.5;
        }

        .page-sub a { color: #c4975d; font-weight: 600; text-decoration: none; }

        /* Role toggle */
        .rtoggle {
          display: grid;
          grid-template-columns: 1fr 1fr;
          background: #e5dace;
          border-radius: 12px;
          padding: 4px;
          margin-bottom: 2rem;
          gap: 3px;
        }

        .rtbtn {
          padding: 0.7rem 1rem;
          border: none;
          background: transparent;
          border-radius: 9px;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.9rem;
          font-weight: 500;
          color: #9a9080;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .rtbtn.on {
          background: #111009;
          color: #fff;
          box-shadow: 0 2px 12px rgba(0,0,0,0.22);
        }

        /* Error */
        .err {
          background: #fef2f2;
          border-left: 3px solid #ef4444;
          color: #dc2626;
          padding: 0.85rem 1rem;
          border-radius: 8px;
          margin-bottom: 1.25rem;
          font-size: 0.88rem;
        }

        /* Fields */
        .fgrp { margin-bottom: 1.35rem; }

        .flbl {
          display: block;
          font-size: 0.82rem;
          font-weight: 600;
          color: #3a3228;
          margin-bottom: 0.5rem;
          letter-spacing: 0.01em;
        }

        .finp {
          width: 100%;
          padding: 0.9rem 1.1rem;
          border: 1.5px solid #d8ccba;
          border-radius: 10px;
          font-size: 0.95rem;
          font-family: 'DM Sans', sans-serif;
          color: #111009;
          background: #faf6ef;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
        }

        .finp::placeholder { color: #c0b5a4; }

        .finp:focus {
          border-color: #c4975d;
          background: #fff;
          box-shadow: 0 0 0 3px rgba(196,151,93,0.13);
        }

        .forgot {
          display: block;
          text-align: right;
          font-size: 0.82rem;
          color: #c4975d;
          text-decoration: none;
          font-weight: 500;
          margin-top: 0.45rem;
          transition: color 0.2s;
        }

        .forgot:hover { color: #a67c45; }

        /* Submit */
        .sbtn {
          width: 100%;
          padding: 1rem 1.5rem;
          background: #111009;
          color: #fff;
          border: none;
          border-radius: 10px;
          font-size: 1rem;
          font-weight: 600;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer;
          transition: all 0.25s;
          margin-top: 0.25rem;
          position: relative;
          overflow: hidden;
          letter-spacing: 0.01em;
        }

        .sbtn-inner {
          position: relative;
          z-index: 1;
        }

        .sbtn::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, #c4975d 0%, #a67c45 100%);
          opacity: 0;
          transition: opacity 0.25s;
        }

        .sbtn:hover::before { opacity: 1; }
        .sbtn:hover { box-shadow: 0 6px 24px rgba(0,0,0,0.18); transform: translateY(-1px); }
        .sbtn:disabled { background: #c8bfb2; cursor: not-allowed; transform: none; box-shadow: none; }
        .sbtn:disabled::before { display: none; }

        /* Divider */
        .divider {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin: 1.6rem 0 1.4rem;
        }

        .dline { flex: 1; height: 1px; background: #d8ccba; }

        .dtxt {
          font-size: 0.75rem;
          font-weight: 600;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #c0b5a4;
          white-space: nowrap;
        }

        /* Google */
        .gbtn {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          padding: 0.9rem 1.1rem;
          border: 1.5px solid #d8ccba;
          border-radius: 10px;
          background: #fff;
          color: #3a3228;
          font-size: 0.93rem;
          font-weight: 500;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer;
          transition: all 0.22s;
        }

        .gbtn:hover {
          border-color: #c4975d;
          background: #fdf9f4;
          transform: translateY(-1px);
          box-shadow: 0 4px 14px rgba(0,0,0,0.07);
        }

        .cta {
          text-align: center;
          margin-top: 1.75rem;
          font-size: 0.88rem;
          color: #9a9080;
        }

        .cta a { color: #c4975d; font-weight: 600; text-decoration: none; }
        .cta a:hover { color: #a67c45; text-decoration: underline; }

        @media (max-width: 768px) {
          .page { grid-template-columns: 1fr; }
          .left { display: none; }
          .right { padding: 2.5rem 1.5rem; }
          .page-title { font-size: 2.2rem; }
        }
      `}</style>

      <div className="page">
        {/* ── LEFT ── */}
        <div className="left">
          <div className="left-copy">
            <h1 className="big-headline">
              Your home,<br />
              <em>perfectly</em><br />
              cared for.
            </h1>
            <p className="left-desc">
              Connect with verified professionals for every household need. Fast, reliable, and always at your doorstep.
            </p>
          </div>
        </div>

        {/* ── RIGHT ── */}
        <div className="right">
          <div className="form-wrap">
            <p className="eyebrow">Welcome back</p>
            <h2 className="page-title">Sign in<br />to your account</h2>
            <p className="page-sub">
              Join ServiceHub to find the best professionals for your home.
            </p>

            <div className="rtoggle">
              <button className={`rtbtn ${role === 'user' ? 'on' : ''}`} onClick={() => setRole('user')}>
                I'm a Customer
              </button>
              <button className={`rtbtn ${role === 'worker' ? 'on' : ''}`} onClick={() => setRole('worker')}>
                I'm a Provider
              </button>
            </div>

            {error && <div className="err">{error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="fgrp">
                <label className="flbl">Email address</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="finp"
                  placeholder="example@email.com"
                  required
                />
              </div>

              <div className="fgrp">
                <label className="flbl">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="finp"
                  placeholder="••••••••••••"
                  required
                />
                <a href="/forgot-password" className="forgot">Forgot password?</a>
              </div>

              <button type="submit" disabled={loading} className="sbtn">
                <span className="sbtn-inner">{loading ? 'Signing in...' : 'Sign In'}</span>
              </button>
            </form>

            <div className="divider">
              <div className="dline" />
              <span className="dtxt">or continue with</span>
              <div className="dline" />
            </div>

            <button
              onClick={() => window.location.href = 'http://localhost:5000/api/auth/google'}
              className="gbtn"
            >
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Continue with Google
            </button>

            <p className="cta">
              Already have an account? <Link to="/register">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;