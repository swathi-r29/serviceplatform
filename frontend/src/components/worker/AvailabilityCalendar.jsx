import { useState, useEffect } from 'react';
import axios from '../../api/axios';

const AvailabilityCalendar = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [availability, setAvailability] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchAvailability();
  }, [currentMonth]);

  const fetchAvailability = async () => {
    try {
      const month = currentMonth.getMonth() + 1;
      const year = currentMonth.getFullYear();
      const { data } = await axios.get(`/availability?month=${month}&year=${year}`);
      setAvailability(data);
    } catch (error) {
      console.error(error);
    }
  };

  const getDaysInMonth = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];

    for (let i = 0; i < firstDay.getDay(); i++) {
      days.push(null);
    }

    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  };

  const isDateBlocked = (date) => {
    if (!date) return false;
    const dateStr = date.toISOString().split('T')[0];
    return availability.some(a => 
      new Date(a.date).toISOString().split('T')[0] === dateStr && a.isBlocked
    );
  };

  const blockDate = async (date, note) => {
    try {
      await axios.post('/availability/block', {
        date: date.toISOString(),
        note
      });
      fetchAvailability();
      setShowModal(false);
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to block date');
    }
  };

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Availability Calendar</h1>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-6">
          <button onClick={prevMonth} className="text-blue-600 hover:text-blue-800 text-2xl">←</button>
          <h2 className="text-2xl font-bold">
            {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
          </h2>
          <button onClick={nextMonth} className="text-blue-600 hover:text-blue-800 text-2xl">→</button>
        </div>

        <div className="grid grid-cols-7 gap-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center font-bold text-gray-600 p-2">
              {day}
            </div>
          ))}

          {getDaysInMonth().map((date, index) => (
            <div
              key={index}
              onClick={() => date && setSelectedDate(date)}
              className={`
                aspect-square p-2 border rounded-lg cursor-pointer text-center
                ${!date ? 'invisible' : ''}
                ${isDateBlocked(date) ? 'bg-red-100 border-red-300' : 'hover:bg-blue-50'}
                ${date && date.toDateString() === new Date().toDateString() ? 'border-blue-600 border-2' : ''}
              `}
            >
              {date && (
                <div>
                  <div className="font-semibold">{date.getDate()}</div>
                  {isDateBlocked(date) && <div className="text-xs text-red-600">Blocked</div>}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-6 flex gap-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-blue-600"></div>
            <span className="text-sm">Today</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-100 border border-red-300"></div>
            <span className="text-sm">Blocked</span>
          </div>
        </div>
      </div>

      {selectedDate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <h3 className="text-2xl font-bold mb-4">
              {selectedDate.toLocaleDateString()}
            </h3>
            <p className="text-gray-600 mb-6">
              {isDateBlocked(selectedDate) ? 'This date is blocked' : 'Block this date?'}
            </p>
            {!isDateBlocked(selectedDate) && (
              <button
                onClick={() => blockDate(selectedDate, 'Blocked by worker')}
                className="w-full bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 mb-3"
              >
                Block Date
              </button>
            )}
            <button
              onClick={() => setSelectedDate(null)}
              className="w-full bg-gray-500 text-white py-3 rounded-lg hover:bg-gray-600"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AvailabilityCalendar;