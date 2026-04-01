import React from 'react';
import { 
  CheckCircle, 
  Truck, 
  PlayCircle, 
  CheckCircle2, 
  Clock,
  XCircle
} from 'lucide-react';

const LifecycleTimeline = ({ history, currentStatus }) => {
  const steps = [
    { status: 'pending', label: 'Requested', icon: Clock },
    { status: 'accepted', label: 'Confirmed', icon: CheckCircle },
    { status: 'on-the-way', label: 'On the Way', icon: Truck },
    { status: 'in-progress', label: 'In Progress', icon: PlayCircle },
    { status: 'completed', label: 'Completed', icon: CheckCircle2 }
  ];

  // If status is rejected or cancelled, change the flow
  if (currentStatus === 'rejected' || currentStatus === 'cancelled') {
    return (
      <div className="flex items-center space-x-2 text-red-500 p-4 bg-red-50 rounded-lg">
        <XCircle size={20} />
        <span className="font-semibold uppercase text-sm">
          Booking {currentStatus}
        </span>
      </div>
    );
  }

  const getStatusIndex = (status) => steps.findIndex(s => s.status === status);
  const currentIndex = getStatusIndex(currentStatus);

  return (
    <div className="w-full py-6">
      <div className="relative flex justify-between">
        {/* Connection Lines */}
        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-200 -translate-y-1/2 z-0" />
        <div 
          className="absolute top-1/2 left-0 h-0.5 bg-blue-600 -translate-y-1/2 z-0 transition-all duration-500" 
          style={{ width: `${(currentIndex / (steps.length - 1)) * 100}%` }}
        />

        {steps.map((step, index) => {
          const StepIcon = step.icon;
          const isCompleted = index <= currentIndex;
          const isCurrent = index === currentIndex;

          return (
            <div key={step.status} className="relative z-10 flex flex-col items-center">
              <div 
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                  isCompleted 
                    ? 'bg-blue-600 border-blue-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-400'
                } ${isCurrent ? 'ring-4 ring-blue-100' : ''}`}
              >
                <StepIcon size={20} />
              </div>
              <span className={`mt-2 text-xs font-medium ${
                isCompleted ? 'text-blue-600' : 'text-gray-400'
              }`}>
                {step.label}
              </span>
              {history && history.find(h => h.status === step.status) && (
                <span className="text-[10px] text-gray-400 mt-1">
                  {new Date(history.find(h => h.status === step.status).timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LifecycleTimeline;
