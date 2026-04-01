import { useState, useEffect } from 'react';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import axios from '../../api/axios';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const EarningsTracker = () => {
  const [earningsData, setEarningsData] = useState({
    today: {
      total: 0,
      basePay: 0,
      tips: 0,
      bonuses: 0,
      jobs: 0
    },
    weekly: [],
    monthly: [],
    pending: 0,
    received: 0,
    nextPayout: null
  });

  const [selectedPeriod, setSelectedPeriod] = useState('week'); // week, month, year
  const [taxRate, setTaxRate] = useState(18); // Default 18% GST in India
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEarningsData();
    
    // Real-time updates every 30 seconds
    const interval = setInterval(() => {
      fetchEarningsData();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const fetchEarningsData = async () => {
    try {
      const { data } = await axios.get('/worker/earnings/detailed');
      setEarningsData(data);
    } catch (error) {
      console.error('Error fetching earnings:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate tax
  const calculateTax = (amount) => {
    return (amount * taxRate) / 100;
  };

  const totalEarnings = earningsData.today.total;
  const taxAmount = calculateTax(totalEarnings);
  const netEarnings = totalEarnings - taxAmount;

  // Weekly earnings chart data
  const weeklyChartData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Earnings (₹)',
        data: earningsData.weekly.length > 0 
          ? earningsData.weekly 
          : [1200, 1800, 1500, 2200, 1900, 2500, 2100],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 6,
        pointHoverRadius: 8,
        pointBackgroundColor: 'rgb(59, 130, 246)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2
      }
    ]
  };

  // Monthly comparison chart data
  const monthlyChartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        label: '2024',
        data: earningsData.monthly.length > 0 
          ? earningsData.monthly 
          : [35000, 42000, 38000, 45000, 48000, 52000, 49000, 55000, 51000, 58000, 54000, 60000],
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderRadius: 8
      },
      {
        label: '2023',
        data: [32000, 38000, 35000, 41000, 43000, 47000, 44000, 49000, 46000, 52000, 48000, 54000],
        backgroundColor: 'rgba(156, 163, 175, 0.5)',
        borderRadius: 8
      }
    ]
  };

  // Payment breakdown pie chart
  const breakdownChartData = {
    labels: ['Base Pay', 'Tips', 'Bonuses'],
    datasets: [
      {
        data: [
          earningsData.today.basePay || 1200,
          earningsData.today.tips || 300,
          earningsData.today.bonuses || 100
        ],
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)'
        ],
        borderWidth: 0
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          padding: 15,
          font: {
            size: 12,
            family: 'Inter'
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: {
          size: 14
        },
        bodyFont: {
          size: 13
        },
        callbacks: {
          label: function(context) {
            return `₹${context.parsed.y.toLocaleString()}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return '₹' + value.toLocaleString();
          }
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    }
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 20,
          font: {
            size: 12,
            family: 'Inter'
          }
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.parsed || 0;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: ₹${value.toLocaleString()} (${percentage}%)`;
          }
        }
      }
    }
  };

  // Calculate days until next payout
  const calculatePayoutCountdown = () => {
    if (!earningsData.nextPayout) {
      return { days: 7, hours: 0, minutes: 0 };
    }
    
    const now = new Date();
    const payoutDate = new Date(earningsData.nextPayout);
    const diff = payoutDate - now;
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    return { days, hours, minutes };
  };

  const payoutCountdown = calculatePayoutCountdown();

  if (loading) {
    return (
      <div className="earnings-tracker">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading earnings data...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="earnings-tracker">
        <div className="tracker-header">
          <div>
            <h1>Earnings Tracker</h1>
            <p className="subtitle">Real-time earnings and financial insights</p>
          </div>
          <div className="header-actions">
            <button className="export-btn">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              Export Report
            </button>
          </div>
        </div>

        {/* Today's Earnings - Live Updates */}
        <div className="live-earnings-section">
          <div className="live-indicator">
            <span className="live-dot"></span>
            <span>Live Updates</span>
          </div>

          <div className="today-earnings-grid">
            <div className="earnings-main-card">
              <h3>Today's Total Earnings</h3>
              <div className="earnings-amount">
                ₹{earningsData.today.total.toLocaleString()}
              </div>
              <div className="earnings-meta">
                <span className="jobs-count">
                  {earningsData.today.jobs} jobs completed
                </span>
                <span className="earnings-change positive">
                  +12.5% from yesterday
                </span>
              </div>

              <div className="earnings-breakdown-mini">
                <div className="breakdown-item">
                  <span className="label">Base Pay</span>
                  <span className="value">₹{earningsData.today.basePay.toLocaleString()}</span>
                </div>
                <div className="breakdown-item">
                  <span className="label">Tips</span>
                  <span className="value tips">₹{earningsData.today.tips.toLocaleString()}</span>
                </div>
                <div className="breakdown-item">
                  <span className="label">Bonuses</span>
                  <span className="value bonuses">₹{earningsData.today.bonuses.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="earnings-stats-cards">
              <div className="stat-card pending">
                <div className="stat-icon">⏳</div>
                <div className="stat-content">
                  <span className="stat-label">Pending</span>
                  <span className="stat-value">₹{earningsData.pending.toLocaleString()}</span>
                </div>
              </div>

              <div className="stat-card received">
                <div className="stat-icon">✓</div>
                <div className="stat-content">
                  <span className="stat-label">Received</span>
                  <span className="stat-value">₹{earningsData.received.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Breakdown Pie Chart */}
        <div className="section-grid">
          <div className="chart-card breakdown-card">
            <h3>Payment Breakdown</h3>
            <div className="chart-container-small">
              <Doughnut data={breakdownChartData} options={pieOptions} />
            </div>
            <div className="breakdown-summary">
              <div className="summary-item">
                <div className="color-indicator base"></div>
                <span>Base Pay: ₹{earningsData.today.basePay.toLocaleString()}</span>
              </div>
              <div className="summary-item">
                <div className="color-indicator tips"></div>
                <span>Tips: ₹{earningsData.today.tips.toLocaleString()}</span>
              </div>
              <div className="summary-item">
                <div className="color-indicator bonus"></div>
                <span>Bonuses: ₹{earningsData.today.bonuses.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Tax Calculator */}
          <div className="chart-card tax-card">
            <h3>Tax Estimation</h3>
            <div className="tax-calculator">
              <div className="tax-input-group">
                <label>Tax Rate (%)</label>
                <input
                  type="number"
                  value={taxRate}
                  onChange={(e) => setTaxRate(Number(e.target.value))}
                  min="0"
                  max="100"
                  className="tax-input"
                />
              </div>

              <div className="tax-breakdown">
                <div className="tax-item">
                  <span>Gross Earnings</span>
                  <span className="amount">₹{totalEarnings.toLocaleString()}</span>
                </div>
                <div className="tax-item deduction">
                  <span>Tax ({taxRate}%)</span>
                  <span className="amount negative">-₹{taxAmount.toFixed(2)}</span>
                </div>
                <div className="tax-item total">
                  <span>Net Earnings</span>
                  <span className="amount">₹{netEarnings.toFixed(2)}</span>
                </div>
              </div>

              <div className="tax-tip">
                💡 Tip: Keep receipts for business expenses to claim deductions
              </div>
            </div>
          </div>
        </div>

        {/* Weekly Earnings Graph */}
        <div className="chart-card">
          <div className="chart-header">
            <h3>Weekly Earnings Trend</h3>
            <div className="period-selector">
              <button 
                className={selectedPeriod === 'week' ? 'active' : ''}
                onClick={() => setSelectedPeriod('week')}
              >
                Week
              </button>
              <button 
                className={selectedPeriod === 'month' ? 'active' : ''}
                onClick={() => setSelectedPeriod('month')}
              >
                Month
              </button>
              <button 
                className={selectedPeriod === 'year' ? 'active' : ''}
                onClick={() => setSelectedPeriod('year')}
              >
                Year
              </button>
            </div>
          </div>
          <div className="chart-container">
            <Line data={weeklyChartData} options={chartOptions} />
          </div>
          <div className="chart-insights">
            <div className="insight-item">
              <span className="insight-label">Average Daily</span>
              <span className="insight-value">₹1,900</span>
            </div>
            <div className="insight-item">
              <span className="insight-label">Best Day</span>
              <span className="insight-value">Saturday (₹2,500)</span>
            </div>
            <div className="insight-item">
              <span className="insight-label">Growth</span>
              <span className="insight-value positive">+18%</span>
            </div>
          </div>
        </div>

        {/* Monthly Comparison Chart */}
        <div className="chart-card">
          <h3>Monthly Comparison</h3>
          <div className="chart-container">
            <Bar data={monthlyChartData} options={chartOptions} />
          </div>
          <div className="comparison-stats">
            <div className="comparison-item">
              <span>2024 Total</span>
              <span className="value">₹6,00,000</span>
            </div>
            <div className="comparison-item">
              <span>2023 Total</span>
              <span className="value">₹5,40,000</span>
            </div>
            <div className="comparison-item">
              <span>Year Growth</span>
              <span className="value positive">+11.1%</span>
            </div>
          </div>
        </div>

        {/* Payout Schedule Countdown */}
        <div className="payout-countdown-card">
          <div className="countdown-header">
            <h3>Next Payout In</h3>
            <span className="payout-schedule">Every Friday at 12:00 PM</span>
          </div>
          
          <div className="countdown-timer">
            <div className="countdown-unit">
              <div className="countdown-value">{payoutCountdown.days}</div>
              <div className="countdown-label">Days</div>
            </div>
            <div className="countdown-separator">:</div>
            <div className="countdown-unit">
              <div className="countdown-value">{payoutCountdown.hours}</div>
              <div className="countdown-label">Hours</div>
            </div>
            <div className="countdown-separator">:</div>
            <div className="countdown-unit">
              <div className="countdown-value">{payoutCountdown.minutes}</div>
              <div className="countdown-label">Minutes</div>
            </div>
          </div>

          <div className="payout-details">
            <div className="payout-detail-item">
              <span className="label">Payout Amount</span>
              <span className="value">₹{earningsData.pending.toLocaleString()}</span>
            </div>
            <div className="payout-detail-item">
              <span className="label">Method</span>
              <span className="value">Bank Transfer</span>
            </div>
            <div className="payout-detail-item">
              <span className="label">Account</span>
              <span className="value">HDFC ****3456</span>
            </div>
          </div>

          <button className="payout-history-btn">
            View Payout History →
          </button>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

        .earnings-tracker {
          font-family: 'Inter', sans-serif;
          padding: 2rem;
          background: #f8f9fa;
          min-height: 100vh;
        }

        .tracker-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }

        .tracker-header h1 {
          font-size: 2rem;
          font-weight: 800;
          color: #111827;
          margin-bottom: 0.5rem;
        }

        .subtitle {
          color: #6b7280;
          font-size: 0.95rem;
        }

        .header-actions {
          display: flex;
          gap: 1rem;
        }

        .export-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          background: #3b82f6;
          color: white;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .export-btn:hover {
          background: #2563eb;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        }

        /* Live Earnings Section */
        .live-earnings-section {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 2rem;
          border-radius: 16px;
          margin-bottom: 2rem;
          color: white;
        }

        .live-indicator {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 1.5rem;
          font-size: 0.9rem;
          font-weight: 500;
        }

        .live-dot {
          width: 8px;
          height: 8px;
          background: #10b981;
          border-radius: 50%;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.5;
            transform: scale(1.2);
          }
        }

        .today-earnings-grid {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 1.5rem;
        }

        .earnings-main-card {
          background: rgba(255, 255, 255, 0.15);
          backdrop-filter: blur(10px);
          padding: 2rem;
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .earnings-main-card h3 {
          font-size: 0.95rem;
          font-weight: 600;
          margin-bottom: 1rem;
          opacity: 0.9;
        }

        .earnings-amount {
          font-size: 3.5rem;
          font-weight: 800;
          margin-bottom: 1rem;
          letter-spacing: -1px;
        }

        .earnings-meta {
          display: flex;
          gap: 1.5rem;
          margin-bottom: 2rem;
          font-size: 0.9rem;
        }

        .jobs-count {
          opacity: 0.9;
        }

        .earnings-change {
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }

        .earnings-change.positive {
          color: #10b981;
        }

        .earnings-breakdown-mini {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.5rem;
          padding-top: 1.5rem;
          border-top: 1px solid rgba(255, 255, 255, 0.2);
        }

        .breakdown-item {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .breakdown-item .label {
          font-size: 0.85rem;
          opacity: 0.8;
        }

        .breakdown-item .value {
          font-size: 1.5rem;
          font-weight: 700;
        }

        .breakdown-item .value.tips {
          color: #10b981;
        }

        .breakdown-item .value.bonuses {
          color: #f59e0b;
        }

        .earnings-stats-cards {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .stat-card {
          background: rgba(255, 255, 255, 0.15);
          backdrop-filter: blur(10px);
          padding: 1.5rem;
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.2);
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .stat-icon {
          width: 48px;
          height: 48px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
        }

        .stat-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .stat-label {
          font-size: 0.85rem;
          opacity: 0.9;
        }

        .stat-value {
          font-size: 1.75rem;
          font-weight: 700;
        }

        /* Section Grid */
        .section-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        /* Chart Cards */
        .chart-card {
          background: white;
          padding: 2rem;
          border-radius: 12px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          margin-bottom: 2rem;
        }

        .chart-card h3 {
          font-size: 1.25rem;
          font-weight: 700;
          color: #111827;
          margin-bottom: 1.5rem;
        }

        .chart-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }

        .period-selector {
          display: flex;
          gap: 0.5rem;
          background: #f3f4f6;
          padding: 0.25rem;
          border-radius: 8px;
        }

        .period-selector button {
          padding: 0.5rem 1rem;
          border: none;
          background: transparent;
          color: #6b7280;
          font-weight: 600;
          font-size: 0.9rem;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .period-selector button.active {
          background: white;
          color: #3b82f6;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .chart-container {
          height: 300px;
          position: relative;
        }

        .chart-container-small {
          height: 250px;
          position: relative;
        }

        .chart-insights {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.5rem;
          margin-top: 2rem;
          padding-top: 2rem;
          border-top: 1px solid #e5e7eb;
        }

        .insight-item {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .insight-label {
          font-size: 0.85rem;
          color: #6b7280;
        }

        .insight-value {
          font-size: 1.5rem;
          font-weight: 700;
          color: #111827;
        }

        .insight-value.positive {
          color: #10b981;
        }

        /* Breakdown Card */
        .breakdown-card {
          margin-bottom: 0;
        }

        .breakdown-summary {
          margin-top: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .summary-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 0.9rem;
          color: #374151;
        }

        .color-indicator {
          width: 12px;
          height: 12px;
          border-radius: 3px;
        }

        .color-indicator.base {
          background: rgba(59, 130, 246, 0.8);
        }

        .color-indicator.tips {
          background: rgba(16, 185, 129, 0.8);
        }

        .color-indicator.bonus {
          background: rgba(245, 158, 11, 0.8);
        }

        /* Tax Card */
        .tax-card {
          margin-bottom: 0;
        }

        .tax-calculator {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .tax-input-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .tax-input-group label {
          font-size: 0.9rem;
          font-weight: 600;
          color: #374151;
        }

        .tax-input {
          padding: 0.75rem 1rem;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          font-size: 1rem;
          font-weight: 600;
          color: #111827;
          transition: border-color 0.2s;
        }

        .tax-input:focus {
          outline: none;
          border-color: #3b82f6;
        }

        .tax-breakdown {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .tax-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem 0;
        }

        .tax-item span:first-child {
          font-size: 0.9rem;
          color: #6b7280;
        }

        .tax-item .amount {
          font-size: 1.1rem;
          font-weight: 700;
          color: #111827;
        }

        .tax-item.deduction .amount {
          color: #ef4444;
        }

        .tax-item.total {
          border-top: 2px solid #e5e7eb;
          padding-top: 1rem;
          margin-top: 0.5rem;
        }

        .tax-item.total span:first-child {
          font-weight: 700;
          color: #111827;
        }

        .tax-item.total .amount {
          font-size: 1.5rem;
          color: #10b981;
        }

        .tax-tip {
          background: #eff6ff;
          padding: 1rem;
          border-radius: 8px;
          font-size: 0.85rem;
          color: #1e40af;
        }

        /* Comparison Stats */
        .comparison-stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.5rem;
          margin-top: 2rem;
          padding-top: 2rem;
          border-top: 1px solid #e5e7eb;
        }

        .comparison-item {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .comparison-item span:first-child {
          font-size: 0.85rem;
          color: #6b7280;
        }

        .comparison-item .value {
          font-size: 1.5rem;
          font-weight: 700;
          color: #111827;
        }

        .comparison-item .value.positive {
          color: #10b981;
        }

        /* Payout Countdown */
        .payout-countdown-card {
          background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
          padding: 2.5rem;
          border-radius: 16px;
          color: white;
        }

        .countdown-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }

        .countdown-header h3 {
          font-size: 1.5rem;
          font-weight: 700;
        }

        .payout-schedule {
          font-size: 0.9rem;
          opacity: 0.9;
        }

        .countdown-timer {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 1rem;
          margin-bottom: 3rem;
        }

        .countdown-unit {
          display: flex;
          flex-direction: column;
          align-items: center;
          background: rgba(255, 255, 255, 0.15);
          backdrop-filter: blur(10px);
          padding: 1.5rem 2rem;
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .countdown-value {
          font-size: 3rem;
          font-weight: 800;
          line-height: 1;
        }

        .countdown-label {
          font-size: 0.85rem;
          opacity: 0.9;
          margin-top: 0.5rem;
        }

        .countdown-separator {
          font-size: 2.5rem;
          font-weight: 700;
          opacity: 0.5;
        }

        .payout-details {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.5rem;
          padding: 1.5rem;
          background: rgba(255, 255, 255, 0.15);
          backdrop-filter: blur(10px);
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.2);
          margin-bottom: 1.5rem;
        }

        .payout-detail-item {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .payout-detail-item .label {
          font-size: 0.85rem;
          opacity: 0.9;
        }

        .payout-detail-item .value {
          font-size: 1.25rem;
          font-weight: 700;
        }

        .payout-history-btn {
          width: 100%;
          padding: 1rem;
          background: rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.3);
          color: white;
          font-weight: 600;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .payout-history-btn:hover {
          background: rgba(255, 255, 255, 0.3);
          transform: translateY(-2px);
        }

        /* Loading State */
        .loading-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 400px;
          gap: 1rem;
        }

        .spinner {
          width: 50px;
          height: 50px;
          border: 4px solid #e5e7eb;
          border-top-color: #3b82f6;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        /* Responsive */
        @media (max-width: 1200px) {
          .today-earnings-grid {
            grid-template-columns: 1fr;
          }

          .section-grid {
            grid-template-columns: 1fr;
          }

          .earnings-stats-cards {
            flex-direction: row;
          }
        }

        @media (max-width: 768px) {
          .earnings-tracker {
            padding: 1rem;
          }

          .tracker-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
          }

          .earnings-amount {
            font-size: 2.5rem;
          }

          .earnings-breakdown-mini {
            grid-template-columns: 1fr;
          }

          .chart-insights,
          .comparison-stats,
          .payout-details {
            grid-template-columns: 1fr;
          }

          .countdown-timer {
            gap: 0.5rem;
          }

          .countdown-unit {
            padding: 1rem 1.5rem;
          }

          .countdown-value {
            font-size: 2rem;
          }
        }
      `}</style>
    </>
  );
};

export default EarningsTracker;