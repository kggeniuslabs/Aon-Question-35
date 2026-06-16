import React, { useState, useEffect, useRef } from 'react';
import './App.css';

function App() {
  const [timeLeft, setTimeLeft] = useState(0);
  const [initialTime, setInitialTime] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [task, setTask] = useState('');
  const [soundOn, setSoundOn] = useState(true);
  const [autoReset, setAutoReset] = useState(false);
  const [status, setStatus] = useState('Ready');
  const [inputTime, setInputTime] = useState({ h: '', m: '', s: '' });
  const timerRef = useRef(null);

  useEffect(() => {
    if (!isActive) {
      const total =
        (Number(inputTime.h || 0) * 3600) +
        (Number(inputTime.m || 0) * 60) +
        Number(inputTime.s || 0);

      setTimeLeft(total);
      setInitialTime(total);
      setStatus(total > 0 ? 'Ready' : 'Waiting for input');
    }
  }, [inputTime, isActive]);

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      setStatus('Running');
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      clearInterval(timerRef.current);
      setIsActive(false);
      setStatus('Completed');

      if (soundOn) {
        const audio = new Audio('https://actions.google.com/sounds/v1/alarms/alarm_clock.ogg');
        audio.play().catch(() => {});
      }

      alert(`Time is up${task ? ` for ${task}` : ''}!`);

      if (autoReset) {
        setInputTime({ h: '', m: '', s: '' });
        setInitialTime(0);
      }
    } else if (!isActive && timeLeft > 0) {
      setStatus('Paused');
    }

    return () => clearInterval(timerRef.current);
  }, [isActive, timeLeft, soundOn, autoReset, task]);

  const handleToggle = () => {
    if (timeLeft > 0) {
      setIsActive((prev) => !prev);
    } else {
      alert('Please enter a valid time');
    }
  };

  const handleReset = () => {
    setIsActive(false);
    setTimeLeft(0);
    setInitialTime(0);
    setTask('');
    setStatus('Ready');
    setInputTime({ h: '', m: '', s: '' });
  };

  const handlePreset = (seconds) => {
    if (isActive) return;
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    setInputTime({
      h: hrs ? String(hrs) : '',
      m: mins ? String(mins) : '',
      s: secs ? String(secs) : '',
    });
  };

  const handleInputChange = (field, value) => {
    let clean = value.replace(/\D/g, '');

    if (field === 'm' || field === 's') {
      clean = clean === '' ? '' : String(Math.min(59, Number(clean)));
    }

    setInputTime((prev) => ({
      ...prev,
      [field]: clean,
    }));
  };

  const format = (totalSeconds) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;

    return {
      h: String(hrs).padStart(2, '0'),
      m: String(mins).padStart(2, '0'),
      s: String(secs).padStart(2, '0'),
    };
  };

  const t = format(timeLeft);
  const progress =
    initialTime > 0 ? Math.max(0, ((initialTime - timeLeft) / initialTime) * 100) : 0;

  return (
    <div className="app-shell">
      <div className="timer-card">
        <div className="card-top">
          <p className="eyebrow">Focus Timer</p>
          <span className={`status-badge ${status.toLowerCase().replace(/\s/g, '-')}`}>
            {status}
          </span>
        </div>

        <h1 className="title">Countdown Timer</h1>
        <p className="subtitle">Set a timer for study, work, breaks, or daily tasks.</p>

        <div className="display-card">
          <div className="display">
            <span>{t.h}</span>
            <span className="separator">:</span>
            <span>{t.m}</span>
            <span className="separator">:</span>
            <span>{t.s}</span>
          </div>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
        </div>

        <div className="preset-row">
          <button onClick={() => handlePreset(60)}>1 min</button>
          <button onClick={() => handlePreset(300)}>5 min</button>
          <button onClick={() => handlePreset(600)}>10 min</button>
          <button onClick={() => handlePreset(1500)}>25 min</button>
        </div>

        <div className="field-group">
          <label htmlFor="task">Task label</label>
          <input
            id="task"
            type="text"
            placeholder="e.g. Study session"
            value={task}
            onChange={(e) => setTask(e.target.value)}
            disabled={isActive}
          />
        </div>

        <div className="time-grid">
          <div className="field-group">
            <label htmlFor="hours">Hours</label>
            <input
              id="hours"
              type="text"
              inputMode="numeric"
              placeholder="00"
              value={inputTime.h}
              onChange={(e) => handleInputChange('h', e.target.value)}
              disabled={isActive}
            />
          </div>

          <div className="field-group">
            <label htmlFor="minutes">Minutes</label>
            <input
              id="minutes"
              type="text"
              inputMode="numeric"
              placeholder="00"
              value={inputTime.m}
              onChange={(e) => handleInputChange('m', e.target.value)}
              disabled={isActive}
            />
          </div>

          <div className="field-group">
            <label htmlFor="seconds">Seconds</label>
            <input
              id="seconds"
              type="text"
              inputMode="numeric"
              placeholder="00"
              value={inputTime.s}
              onChange={(e) => handleInputChange('s', e.target.value)}
              disabled={isActive}
            />
          </div>
        </div>

        <div className="toggle-grid">
          <label className="toggle-card">
            <input
              type="checkbox"
              checked={soundOn}
              onChange={() => setSoundOn((prev) => !prev)}
            />
            <span>Sound alert</span>
          </label>

          <label className="toggle-card">
            <input
              type="checkbox"
              checked={autoReset}
              onChange={() => setAutoReset((prev) => !prev)}
            />
            <span>Auto reset</span>
          </label>
        </div>

        <div className="actions">
          <button
            className={`main-btn ${isActive ? 'pause' : 'start'}`}
            onClick={handleToggle}
          >
            {isActive ? 'Pause Timer' : 'Start Timer'}
          </button>

          <button className="reset-btn" onClick={handleReset}>
            Reset All
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;