import { useState, useContext, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-hot-toast';

const VerifyOTP = () => {
    const { verifyOTP, resendOTP } = useContext(AuthContext);
    const location = useLocation();
    const navigate = useNavigate();
    const query = new URLSearchParams(location.search);
    const email = query.get('email');

    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [loading, setLoading] = useState(false);
    const [resending, setResending] = useState(false);
    const [timer, setTimer] = useState(60);

    useEffect(() => {
        if (!email) {
            navigate('/register');
            return;
        }

        const interval = setInterval(() => {
            setTimer((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);

        return () => clearInterval(interval);
    }, [email, navigate]);

    const handleChange = (element, index) => {
        if (isNaN(element.value)) return false;

        const newOtp = [...otp];
        newOtp[index] = element.value;
        setOtp(newOtp);

        // Focus next input
        if (element.nextSibling && element.value) {
            element.nextSibling.focus();
        }
    };

    const handleKeyDown = (e, index) => {
        if (e.key === 'Backspace') {
            if (!otp[index] && e.target.previousSibling) {
                e.target.previousSibling.focus();
            }
        }
    };

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        const otpValue = otp.join('');
        if (otpValue.length !== 6) {
            toast.error('Please enter the 6-digit code');
            return;
        }

        setLoading(true);
        try {
            await verifyOTP(email, otpValue);
            toast.success('Email verified successfully!');
        } catch (err) {
            toast.error(err);
            setLoading(false);
        }
    };

    const handleResend = async () => {
        if (timer > 0) return;

        setResending(true);
        try {
            await resendOTP(email);
            toast.success('OTP sent again!');
            setTimer(60);
        } catch (err) {
            toast.error(err);
        } finally {
            setResending(false);
        }
    };

    return (
        <>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,700;0,800;1,600&family=DM+Sans:wght@300;400;500;600&display=swap');
        
        .verify-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f5ede2;
          font-family: 'DM Sans', sans-serif;
          padding: 2rem;
        }

        .verify-card {
          background: white;
          padding: 3rem 2.5rem;
          border-radius: 24px;
          box-shadow: 0 20px 50px rgba(0,0,0,0.08);
          max-width: 480px;
          width: 100%;
          text-align: center;
          animation: fadeUp .5s ease both;
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .verify-icon {
          width: 64px;
          height: 64px;
          background: rgba(196, 151, 93, 0.1);
          color: #c4975d;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1.5rem;
        }

        .verify-title {
          font-family: 'Playfair Display', serif;
          font-size: 2rem;
          color: #1a1a1a;
          margin-bottom: 0.5rem;
        }

        .verify-sub {
          color: #909090;
          font-size: 0.95rem;
          line-height: 1.6;
          margin-bottom: 2rem;
        }

        .verify-sub b { color: #1a1a1a; }

        .otp-grid {
          display: flex;
          gap: 0.75rem;
          justify-content: center;
          margin-bottom: 2rem;
        }

        .otp-input {
          width: 50px;
          height: 60px;
          border: 2px solid #ddd0bc;
          border-radius: 12px;
          text-align: center;
          font-size: 1.5rem;
          font-weight: 700;
          color: #1a1a1a;
          outline: none;
          transition: all 0.2s;
        }

        .otp-input:focus {
          border-color: #c4975d;
          box-shadow: 0 0 0 4px rgba(196,151,93,0.1);
        }

        .verify-btn {
          width: 100%;
          padding: 1rem;
          background: #1a1a1a;
          color: white;
          border: none;
          border-radius: 12px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
          margin-bottom: 1.5rem;
        }

        .verify-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(0,0,0,0.15);
        }

        .verify-btn:disabled {
          background: #c0b8ad;
          cursor: not-allowed;
          transform: none;
        }

        .resend-box {
          font-size: 0.9rem;
          color: #909090;
        }

        .resend-btn {
          background: none;
          border: none;
          color: #c4975d;
          font-weight: 600;
          cursor: pointer;
          padding: 0;
          margin-left: 0.5rem;
        }

        .resend-btn:disabled {
          color: #c0b8ad;
          cursor: not-allowed;
        }

        .back-link {
          display: block;
          margin-top: 2rem;
          color: #909090;
          text-decoration: none;
          font-size: 0.9rem;
          transition: color 0.2s;
        }

        .back-link:hover { color: #c4975d; }
      `}</style>

            <div className="verify-page">
                <div className="verify-card">
                    <div className="verify-icon">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                            <polyline points="22,6 12,13 2,6"></polyline>
                        </svg>
                    </div>

                    <h1 className="verify-title">Check your email</h1>
                    <p className="verify-sub">
                        We've sent a 6-digit verification code to<br />
                        <b>{email}</b>
                    </p>

                    <form onSubmit={handleSubmit}>
                        <div className="otp-grid">
                            {otp.map((data, index) => (
                                <input
                                    key={index}
                                    type="text"
                                    maxLength="1"
                                    className="otp-input"
                                    value={data}
                                    onChange={(e) => handleChange(e.target, index)}
                                    onKeyDown={(e) => handleKeyDown(e, index)}
                                    onFocus={(e) => e.target.select()}
                                />
                            ))}
                        </div>

                        <button type="submit" disabled={loading} className="verify-btn">
                            {loading ? 'Verifying...' : 'Verify Email'}
                        </button>
                    </form>

                    <div className="resend-box">
                        Didn't receive the code?
                        {timer > 0 ? (
                            <span style={{ marginLeft: '8px' }}>Resend in {timer}s</span>
                        ) : (
                            <button onClick={handleResend} disabled={resending} className="resend-btn">
                                {resending ? 'Sending...' : 'Resend now'}
                            </button>
                        )}
                    </div>

                    <Link to="/register" className="back-link">
                        ← Back to registration
                    </Link>
                </div>
            </div>
        </>
    );
};

export default VerifyOTP;
