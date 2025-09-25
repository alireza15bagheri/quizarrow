import { useEffect, useState } from 'react';

const DELAY_OPTIONS = [
  { label: 'Instant', value: 0 },
  { label: '15 seconds', value: 15000 },
  { label: '30 seconds', value: 30000 },
  { label: '1 minute', value: 60000 },
  { label: '5 minutes', value: 300000 },
];

const STORAGE_KEY = 'notification_delay_ms';

export default function NotificationDelaySelector() {
  const [delay, setDelay] = useState(() => {
    const savedValue = localStorage.getItem(STORAGE_KEY);
    return savedValue ? parseInt(savedValue, 10) : 0; // Default to 'Disabled'
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, delay);
  }, [delay]);

  const handleDelayChange = (e) => {
    setDelay(parseInt(e.target.value, 10));
  };

  return (
    <div className="form-control">
      <select
        className="select select-bordered select-sm"
        value={delay}
        onChange={handleDelayChange}
      >
        {DELAY_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}