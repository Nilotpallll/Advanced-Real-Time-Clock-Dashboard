import { useEffect, useMemo, useState } from 'react'
import './App.css'

const timeZones = [
  { label: 'New York', value: 'America/New_York', region: 'North America' },
  { label: 'London', value: 'Europe/London', region: 'Europe' },
  { label: 'Dubai', value: 'Asia/Dubai', region: 'Middle East' },
  { label: 'Mumbai', value: 'Asia/Kolkata', region: 'Asia' },
  { label: 'Singapore', value: 'Asia/Singapore', region: 'Asia' },
  { label: 'Tokyo', value: 'Asia/Tokyo', region: 'Asia' },
  { label: 'Sydney', value: 'Australia/Sydney', region: 'Oceania' },
]

const previewZones = [
  { label: 'New York', value: 'America/New_York' },
  { label: 'London', value: 'Europe/London' },
  { label: 'Dubai', value: 'Asia/Dubai' },
  { label: 'Tokyo', value: 'Asia/Tokyo' },
]

const initialAlarms = [
  { id: 1, label: 'Morning sync', time: '08:30', active: true, triggered: false },
  { id: 2, label: 'Evening wrap-up', time: '18:00', active: true, triggered: false },
]

const featureIdeas = [
  { title: 'Focus booster', description: 'Auto-suggest a deep-work block when your next alarm is near.' },
  { title: 'Travel mode', description: 'Preview regional time instantly before your next meeting.' },
  { title: 'Smart reminder', description: 'Use a quick alarm label to keep your routine organized.' },
  { title: 'Night shift', description: 'Switch to the lighter theme for late-night planning.' },
]

function getTimeParts(date, timeZone, hour12) {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12,
  })

  const parts = formatter.formatToParts(date)
  const hour = Number(parts.find((part) => part.type === 'hour')?.value ?? 0)
  const minute = Number(parts.find((part) => part.type === 'minute')?.value ?? 0)
  const second = Number(parts.find((part) => part.type === 'second')?.value ?? 0)

  return { hour, minute, second }
}

function ClockFace({ hourAngle, minuteAngle, secondAngle, small = false, main = false }) {
  const mainPositions = [
    { label: 12, top: '8%', left: '50%' },
    { label: 1, top: '17%', left: '74%' },
    { label: 2, top: '31%', left: '87%' },
    { label: 3, top: '49%', left: '93%' },
    { label: 4, top: '67%', left: '87%' },
    { label: 5, top: '81%', left: '74%' },
    { label: 6, top: '90%', left: '50%' },
    { label: 7, top: '81%', left: '26%' },
    { label: 8, top: '67%', left: '13%' },
    { label: 9, top: '49%', left: '7%' },
    { label: 10, top: '31%', left: '13%' },
    { label: 11, top: '17%', left: '26%' },
  ]

  return (
    <div className={`clock-face ${small ? 'small' : ''} ${main ? 'main-clock' : ''}`}>
      {main
        ? mainPositions.map((position) => (
            <div key={position.label} className="clock-number" style={{ top: position.top, left: position.left }}>
              {position.label}
            </div>
          ))
        : Array.from({ length: 12 }, (_, index) => {
            const number = index === 0 ? 12 : index
            const angle = ((number % 12) * 30 - 90) * (Math.PI / 180)
            const radius = small ? 58 : 82
            const x = Math.cos(angle) * radius
            const y = Math.sin(angle) * radius

            return (
              <div key={number} className="clock-number" style={{ transform: `translate(-50%, -50%) translate(${x}px, ${y}px)` }}>
                {number}
              </div>
            )
          })}
      <div className="hand hour-hand" style={{ transform: `rotate(${hourAngle}deg)` }} />
      <div className="hand minute-hand" style={{ transform: `rotate(${minuteAngle}deg)` }} />
      <div className="hand second-hand" style={{ transform: `rotate(${secondAngle}deg)` }} />
      <div className="clock-center" />
    </div>
  )
}

function App() {
  const [now, setNow] = useState(new Date())
  const [selectedTimeZone, setSelectedTimeZone] = useState('Asia/Kolkata')
  const [hour12, setHour12] = useState(true)
  const [showSeconds, setShowSeconds] = useState(true)
  const [theme, setTheme] = useState('dark')
  const [alarms, setAlarms] = useState(initialAlarms)
  const [newAlarmTime, setNewAlarmTime] = useState('09:00')
  const [newAlarmLabel, setNewAlarmLabel] = useState('Deep work')
  const [ringingAlarm, setRingingAlarm] = useState(null)
  const [featureSpotlight, setFeatureSpotlight] = useState(featureIdeas[0])

  useEffect(() => {
    const intervalId = window.setInterval(() => setNow(new Date()), 1000)
    return () => window.clearInterval(intervalId)
  }, [])

  useEffect(() => {
    const currentKey = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
    const matchingAlarm = alarms.find((alarm) => alarm.active && alarm.time === currentKey && !alarm.triggered)

    if (matchingAlarm) {
      setAlarms((prev) =>
        prev.map((alarm) => (alarm.id === matchingAlarm.id ? { ...alarm, triggered: true } : alarm)),
      )
      setRingingAlarm(matchingAlarm.id)

      try {
        const AudioContext = window.AudioContext || window.webkitAudioContext
        if (AudioContext) {
          const context = new AudioContext()
          const oscillator = context.createOscillator()
          const gain = context.createGain()
          oscillator.type = 'sine'
          oscillator.frequency.value = 880
          gain.gain.value = 0.08
          oscillator.connect(gain)
          gain.connect(context.destination)
          oscillator.start()
          gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.45)
          oscillator.stop(context.currentTime + 0.45)
          context.close()
        }
      } catch {
        // Ignore audio errors in unsupported browsers.
      }
    }
  }, [alarms, now])

  const activeTimeZone = useMemo(() => {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: selectedTimeZone,
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
    })

    const timeFormatter = new Intl.DateTimeFormat('en-US', {
      timeZone: selectedTimeZone,
      hour: '2-digit',
      minute: '2-digit',
      second: showSeconds ? '2-digit' : undefined,
      hour12,
    })

    const parts = getTimeParts(now, selectedTimeZone, hour12)
    const hourAngle = ((parts.hour % 12) * 30) + (parts.minute * 0.5)
    const minuteAngle = parts.minute * 6
    const secondAngle = parts.second * 6

    return {
      dateLabel: formatter.format(now),
      timeLabel: timeFormatter.format(now),
      hourAngle,
      minuteAngle,
      secondAngle,
      zoneName: selectedTimeZone,
    }
  }, [hour12, now, selectedTimeZone, showSeconds])

  const worldClocks = useMemo(
    () =>
      timeZones.map((zone) => {
        const formatter = new Intl.DateTimeFormat('en-US', {
          timeZone: zone.value,
          hour: 'numeric',
          minute: '2-digit',
          hour12,
        })
        const dateFormatter = new Intl.DateTimeFormat('en-US', {
          timeZone: zone.value,
          month: 'short',
          day: 'numeric',
        })

        return {
          ...zone,
          time: formatter.format(now),
          date: dateFormatter.format(now),
        }
      }),
    [hour12, now],
  )

  const quickRegionClocks = useMemo(
    () =>
      previewZones.map((zone) => {
        const formatter = new Intl.DateTimeFormat('en-US', {
          timeZone: zone.value,
          hour: 'numeric',
          minute: '2-digit',
          hour12,
        })
        const dateFormatter = new Intl.DateTimeFormat('en-US', {
          timeZone: zone.value,
          month: 'short',
          day: 'numeric',
        })
        const parts = getTimeParts(now, zone.value, hour12)

        return {
          ...zone,
          time: formatter.format(now),
          date: dateFormatter.format(now),
          hourAngle: ((parts.hour % 12) * 30) + (parts.minute * 0.5),
          minuteAngle: parts.minute * 6,
          secondAngle: parts.second * 6,
        }
      }),
    [hour12, now],
  )

  const handleAddAlarm = () => {
    if (!newAlarmTime || !newAlarmLabel) return

    const newAlarm = {
      id: Date.now(),
      label: newAlarmLabel.trim(),
      time: newAlarmTime,
      active: true,
      triggered: false,
    }

    setAlarms((prev) => [...prev, newAlarm])
    setNewAlarmLabel('')
    setNewAlarmTime('09:30')
  }

  const handleToggleAlarm = (id) => {
    setAlarms((prev) => prev.map((alarm) => (alarm.id === id ? { ...alarm, active: !alarm.active } : alarm)))
  }

  const handleDismissAlarm = () => {
    setRingingAlarm(null)
  }

  const handleRandomFeature = () => {
    const nextFeature = featureIdeas[Math.floor(Math.random() * featureIdeas.length)]
    setFeatureSpotlight(nextFeature)
  }

  return (
    <div className={`app-shell ${theme}`}>
      <header className="hero-card">
        <div className="hero-copy">
          <p className="eyebrow">World clock dashboard</p>
          <h1>Professional real-time monitoring for every region.</h1>
          <p className="subtitle">
            Track live time, compare zones, and manage alarms from a polished control center.
          </p>
        </div>

        <div className="controls-panel">
          <label className="control-group">
            <span>Format</span>
            <select value={hour12 ? '12h' : '24h'} onChange={(event) => setHour12(event.target.value === '12h')}>
              <option value="12h">12-hour</option>
              <option value="24h">24-hour</option>
            </select>
          </label>

          <label className="control-group">
            <span>Seconds</span>
            <button type="button" className="toggle-btn" onClick={() => setShowSeconds((value) => !value)}>
              {showSeconds ? 'On' : 'Off'}
            </button>
          </label>

          <button type="button" className="theme-btn" onClick={() => setTheme((value) => (value === 'dark' ? 'light' : 'dark'))}>
            {theme === 'dark' ? '☀️ Light' : '🌙 Dark'}
          </button>
        </div>
      </header>

      <main className="dashboard-grid">
        <section className="panel clock-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Live focus panel</p>
              <h2>{selectedTimeZone}</h2>
            </div>
            <div className="status-pill">● Connected</div>
          </div>

          <div className="clock-display">
            <ClockFace
              hourAngle={activeTimeZone.hourAngle}
              minuteAngle={activeTimeZone.minuteAngle}
              secondAngle={activeTimeZone.secondAngle}
              main
            />

            <div className="digital-card">
              <p className="eyebrow">Digital clock</p>
              <h3>{activeTimeZone.timeLabel}</h3>
              <p>{activeTimeZone.dateLabel}</p>
            </div>
          </div>
        </section>

        <section className="panel second-focus-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Live focus panel</p>
              <h2>Regional pulse</h2>
            </div>
          </div>

          <div className="focus-strip">
            {quickRegionClocks.map((zone) => (
              <div key={zone.value} className="focus-watch-card">
                <ClockFace
                  hourAngle={zone.hourAngle}
                  minuteAngle={zone.minuteAngle}
                  secondAngle={zone.secondAngle}
                  small
                />
                <div className="focus-watch-meta">
                  <strong>{zone.label}</strong>
                  <span>{zone.time}</span>
                  <small>{zone.date}</small>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Time zone management</p>
              <h2>Regional comparison</h2>
            </div>
          </div>

          <div className="zone-list">
            {worldClocks.map((zone) => (
              <button
                key={zone.value}
                type="button"
                className={`zone-card ${selectedTimeZone === zone.value ? 'active' : ''}`}
                onClick={() => setSelectedTimeZone(zone.value)}
              >
                <div>
                  <strong>{zone.label}</strong>
                  <p>{zone.region}</p>
                </div>
                <div className="zone-meta">
                  <span>{zone.time}</span>
                  <small>{zone.date}</small>
                </div>
              </button>
            ))}
          </div>

        </section>

        <section className="panel alarm-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Alarm center</p>
              <h2>Stay on schedule</h2>
            </div>
          </div>

          <div className="alarm-form">
            <input
              type="text"
              value={newAlarmLabel}
              onChange={(event) => setNewAlarmLabel(event.target.value)}
              placeholder="Alarm label"
            />
            <input type="time" value={newAlarmTime} onChange={(event) => setNewAlarmTime(event.target.value)} />
            <button type="button" onClick={handleAddAlarm}>
              Add alarm
            </button>
          </div>

          {ringingAlarm ? (
            <div className="ringing-banner">
              <span>🔔</span>
              <div>
                <strong>Alarm ringing</strong>
                <p>{alarms.find((alarm) => alarm.id === ringingAlarm)?.label}</p>
              </div>
              <button type="button" onClick={handleDismissAlarm}>
                Dismiss
              </button>
            </div>
          ) : null}

          <div className="alarm-list">
            {alarms.map((alarm) => (
              <div key={alarm.id} className={`alarm-item ${alarm.triggered ? 'triggered' : ''}`}>
                <div>
                  <strong>{alarm.label}</strong>
                  <p>{alarm.time}</p>
                </div>
                <button type="button" className="toggle-btn" onClick={() => handleToggleAlarm(alarm.id)}>
                  {alarm.active ? 'Enabled' : 'Muted'}
                </button>
              </div>
            ))}
          </div>

          <div className="random-feature-card">
            <div className="random-feature-header">
              <strong>Random feature</strong>
              <button type="button" onClick={handleRandomFeature}>
                Surprise me
              </button>
            </div>
            <h3>{featureSpotlight.title}</h3>
            <p>{featureSpotlight.description}</p>
          </div>
        </section>
      </main>
    </div>
  )
}

export default App
