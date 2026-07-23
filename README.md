# 🧠 Digital Detox Timer

**A neuroscience-backed focus timer and screen break reminder for developers.**

Research shows that strategic breaks improve cognitive performance by up to 40%. This tool helps you work WITH your brain's natural rhythms — not against them.

[![npm version](https://img.shields.io/npm/v/digital-detox-timer.svg)](https://www.npmjs.com/package/digital-detox-timer)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)

---

## Why This Exists

Most developers work in long, unbroken stretches — leading to diminishing returns, eye strain, and burnout. The science is clear:

- **90-minute ultradian cycles** are your brain's natural rhythm for peak performance (Peretz Lavie, 1985)
- **The top 10% most productive people** work 52 minutes then break for 17 (DeskTime, 2014)
- **Even 5-minute breaks** restore attention and prevent prefrontal cortex depletion

Digital Detox Timer gives you science-backed focus modes with intelligent break suggestions that actually help your brain recover.

---

## Quick Start

```bash
# Run instantly with npx (no install needed)
npx digital-detox-timer

# Or install globally
npm install -g digital-detox-timer
detox-timer flow
```

---

## Focus Modes

| Mode | Focus | Break | Best For |
|------|-------|-------|----------|
| `deep` | 90 min | 20 min | Architecture, complex problem-solving |
| `pomodoro` | 25 min | 5 min | Sustained attention, routine tasks |
| `flow` | 52 min | 17 min | General development (default) |
| `sprint` | 15 min | 3 min | High-resistance tasks, getting started |

```bash
detox-timer deep       # 90-minute deep work sessions
detox-timer pomodoro   # Classic 25/5 Pomodoro
detox-timer flow       # 52/17 optimal ratio (default)
detox-timer sprint     # Quick 15-minute sprints
```

---

## Programmatic Usage

```javascript
const { createTimer, getModes, getBreakActivities } = require('digital-detox-timer');

// Create a timer
const timer = createTimer('flow');

// Listen to events
timer.on('focus:start', (data) => {
  console.log(`Focus session #${data.session} started (${data.duration} min)`);
});

timer.on('focus:complete', (data) => {
  console.log(data.message);
  timer.startBreak();
});

timer.on('break:start', (data) => {
  console.log(`Break suggestion: ${data.activity}`);
  console.log(`Why: ${data.benefit}`);
});

timer.on('break:complete', () => {
  // Get productivity metrics
  const summary = timer.getDailySummary();
  console.log(`Score: ${summary.productivityScore}/100`);
  
  // Start next session
  timer.startFocus();
});

// Start working
timer.startFocus();
```

---

## API Reference

### `createTimer(mode, options)`

Factory function to create a new timer instance.

- `mode` — One of: `'deep'`, `'pomodoro'`, `'flow'`, `'sprint'`, `'custom'`
- `options.focusMinutes` — Override focus duration
- `options.breakMinutes` — Override break duration

### `timer.startFocus()`

Start a focus session. Emits `focus:start` immediately and `focus:complete` when done.

### `timer.startBreak()`

Start a break. Emits `break:start` with an activity suggestion and `break:complete` when done.

### `timer.pause()` / `timer.resume()`

Pause and resume the current timer.

### `timer.stop()`

Stop the timer completely.

### `timer.getStatus()`

Returns current timer state:

```javascript
{
  phase: 'focus',           // 'idle', 'focus', or 'break'
  isRunning: true,
  isPaused: false,
  mode: 'Flow State',
  sessionsCompleted: 3,
  totalFocusMinutes: 156,
  totalBreakMinutes: 51,
  remainingSeconds: 1847,
  remainingFormatted: '30:47'
}
```

### `timer.getDailySummary()`

Returns productivity metrics and rating.

### `timer.getProductivityScore()`

Returns a 0-100 score based on sessions completed and focus/break ratio.

### `getModes()`

Returns all available focus modes with their configurations and scientific sources.

### `getBreakActivities()`

Returns all break activity suggestions with neuroscience-backed benefits.

---

## Events

| Event | Data | Description |
|-------|------|-------------|
| `focus:start` | `{ mode, duration, session }` | Focus session started |
| `focus:complete` | `{ session, totalFocusMinutes, message }` | Focus session ended |
| `break:start` | `{ duration, isLongBreak, activity, benefit }` | Break started |
| `break:complete` | `{ totalBreakMinutes, message }` | Break ended |
| `timer:pause` | `{ phase, remainingSeconds }` | Timer paused |
| `timer:resume` | `{ phase, remainingSeconds }` | Timer resumed |
| `timer:stop` | `{ sessionsCompleted, totalFocusMinutes }` | Timer stopped |

---

## The Science

Each break suggestion is backed by neuroscience research:

| Activity | Mechanism |
|----------|-----------|
| Short walk | Increases cerebral blood flow by 15%, boosting creative thinking |
| 20-20-20 rule | Relaxes ciliary muscles, preventing digital eye strain |
| 4-7-8 breathing | Activates parasympathetic nervous system, reduces cortisol 25% |
| Exercise burst | Triggers BDNF release — enhances memory and learning |
| Music | Dopamine release in nucleus accumbens — restores motivation |
| Eyes closed | Default Mode Network processes information, sparks insights |

---

## CLI Options

```
--help, -h       Show help message
--modes          Show detailed mode descriptions
--science        Show the neuroscience behind each mode
--version, -v    Show version number
```

---

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## License

MIT License — see [LICENSE](LICENSE) for details.

---

## About

Built by [Trevor Taylor AI](https://trevortaylor.ai) — Building intelligent solutions for real-world impact.

- 🌐 Website: [trevortaylor.ai](https://trevortaylor.ai)
- 📧 Contact: press@trevortaylor.ai
- 🏢 Company: Trevor Taylor AI LLC, Miami, FL
