/**
 * Digital Detox Timer
 * A neuroscience-backed focus timer and screen break reminder for developers.
 *
 * Built by Trevor Taylor AI (https://trevortaylor.ai)
 * Research shows strategic breaks improve cognitive performance by up to 40%.
 *
 * @module digital-detox-timer
 */

'use strict';

const EventEmitter = require('events');

/**
 * Focus modes based on neuroscience research
 * Each mode is optimized for different types of cognitive work.
 */
const FOCUS_MODES = {
  deep: {
    name: 'Deep Work',
    focusMinutes: 90,
    breakMinutes: 20,
    description: 'Based on ultradian rhythms — 90-minute cycles of peak cognitive performance.',
    source: 'Peretz Lavie, 1985 — Basic Rest-Activity Cycle (BRAC)'
  },
  pomodoro: {
    name: 'Pomodoro',
    focusMinutes: 25,
    breakMinutes: 5,
    longBreakMinutes: 15,
    sessionsBeforeLongBreak: 4,
    description: 'Classic technique for sustained attention with frequent micro-recovery.',
    source: 'Francesco Cirillo, 1980s — Pomodoro Technique'
  },
  flow: {
    name: 'Flow State',
    focusMinutes: 52,
    breakMinutes: 17,
    description: 'Optimal ratio discovered by DeskTime productivity research.',
    source: 'DeskTime, 2014 — Top 10% most productive employees work 52 min, break 17 min'
  },
  sprint: {
    name: 'Sprint',
    focusMinutes: 15,
    breakMinutes: 3,
    description: 'Ultra-short bursts for high-resistance tasks or when motivation is low.',
    source: 'Micro-commitment theory — reducing activation energy for difficult tasks'
  },
  custom: {
    name: 'Custom',
    focusMinutes: 25,
    breakMinutes: 5,
    description: 'Your own focus/break ratio.',
    source: 'User-defined'
  }
};

/**
 * Break activities based on neuroscience research for cognitive recovery
 */
const BREAK_ACTIVITIES = [
  { activity: 'Take a short walk', benefit: 'Increases blood flow to the brain by 15%, boosting creative thinking', type: 'physical' },
  { activity: 'Look at something 20 feet away for 20 seconds', benefit: '20-20-20 rule — reduces digital eye strain by relaxing ciliary muscles', type: 'eyes' },
  { activity: 'Do 10 deep breaths (4-7-8 pattern)', benefit: 'Activates parasympathetic nervous system, reduces cortisol by up to 25%', type: 'breathing' },
  { activity: 'Stretch your neck and shoulders', benefit: 'Releases tension from sustained posture, prevents repetitive strain', type: 'physical' },
  { activity: 'Drink a glass of water', benefit: 'Even 1% dehydration reduces cognitive performance — water restores focus', type: 'hydration' },
  { activity: 'Close your eyes and do nothing', benefit: 'Default Mode Network activation — processes information and sparks insights', type: 'rest' },
  { activity: 'Step outside for fresh air', benefit: 'Oxygen-rich air improves prefrontal cortex function and decision-making', type: 'nature' },
  { activity: 'Do 10 squats or jumping jacks', benefit: 'BDNF release — Brain-Derived Neurotrophic Factor enhances memory and learning', type: 'physical' },
  { activity: 'Listen to a song you love', benefit: 'Dopamine release in nucleus accumbens — restores motivation and mood', type: 'music' },
  { activity: 'Write down one thing you accomplished', benefit: 'Activates reward circuitry, builds momentum through progress tracking', type: 'reflection' }
];

/**
 * Core timer class
 */
class DetoxTimer extends EventEmitter {
  constructor(options = {}) {
    super();
    this.mode = options.mode || 'flow';
    this.config = { ...FOCUS_MODES[this.mode] };

    if (options.focusMinutes) this.config.focusMinutes = options.focusMinutes;
    if (options.breakMinutes) this.config.breakMinutes = options.breakMinutes;

    this.sessionsCompleted = 0;
    this.totalFocusMinutes = 0;
    this.totalBreakMinutes = 0;
    this.isRunning = false;
    this.isPaused = false;
    this.currentPhase = 'idle'; // 'idle', 'focus', 'break'
    this.timer = null;
    this.startTime = null;
    this.remainingMs = 0;
    this.history = [];
  }

  /**
   * Start a focus session
   */
  startFocus() {
    if (this.isRunning) {
      this.emit('error', new Error('Timer is already running. Use pause() or stop() first.'));
      return this;
    }

    const durationMs = this.config.focusMinutes * 60 * 1000;
    this.currentPhase = 'focus';
    this.isRunning = true;
    this.isPaused = false;
    this.startTime = Date.now();
    this.remainingMs = durationMs;

    this.emit('focus:start', {
      mode: this.config.name,
      duration: this.config.focusMinutes,
      session: this.sessionsCompleted + 1
    });

    this.timer = setTimeout(() => {
      this._completeFocus();
    }, durationMs);

    return this;
  }

  /**
   * Start a break
   */
  startBreak() {
    const isLongBreak = this.mode === 'pomodoro' &&
      this.sessionsCompleted > 0 &&
      this.sessionsCompleted % this.config.sessionsBeforeLongBreak === 0;

    const breakMinutes = isLongBreak
      ? (this.config.longBreakMinutes || this.config.breakMinutes)
      : this.config.breakMinutes;

    const durationMs = breakMinutes * 60 * 1000;
    this.currentPhase = 'break';
    this.isRunning = true;
    this.isPaused = false;
    this.startTime = Date.now();
    this.remainingMs = durationMs;

    const activity = this._getBreakActivity();

    this.emit('break:start', {
      duration: breakMinutes,
      isLongBreak,
      activity: activity.activity,
      benefit: activity.benefit,
      session: this.sessionsCompleted
    });

    this.timer = setTimeout(() => {
      this._completeBreak(breakMinutes);
    }, durationMs);

    return this;
  }

  /**
   * Pause the current timer
   */
  pause() {
    if (!this.isRunning || this.isPaused) return this;

    clearTimeout(this.timer);
    const elapsed = Date.now() - this.startTime;
    this.remainingMs = this.remainingMs - elapsed;
    this.isPaused = true;
    this.isRunning = false;

    this.emit('timer:pause', {
      phase: this.currentPhase,
      remainingSeconds: Math.ceil(this.remainingMs / 1000)
    });

    return this;
  }

  /**
   * Resume a paused timer
   */
  resume() {
    if (!this.isPaused) return this;

    this.isRunning = true;
    this.isPaused = false;
    this.startTime = Date.now();

    this.emit('timer:resume', {
      phase: this.currentPhase,
      remainingSeconds: Math.ceil(this.remainingMs / 1000)
    });

    this.timer = setTimeout(() => {
      if (this.currentPhase === 'focus') {
        this._completeFocus();
      } else {
        this._completeBreak(Math.ceil(this.remainingMs / 60000));
      }
    }, this.remainingMs);

    return this;
  }

  /**
   * Stop the timer completely
   */
  stop() {
    clearTimeout(this.timer);
    this.isRunning = false;
    this.isPaused = false;
    this.currentPhase = 'idle';
    this.remainingMs = 0;

    this.emit('timer:stop', {
      sessionsCompleted: this.sessionsCompleted,
      totalFocusMinutes: this.totalFocusMinutes
    });

    return this;
  }

  /**
   * Get current status
   */
  getStatus() {
    let remainingSeconds = 0;
    if (this.isRunning && this.startTime) {
      const elapsed = Date.now() - this.startTime;
      remainingSeconds = Math.max(0, Math.ceil((this.remainingMs - elapsed) / 1000));
    } else if (this.isPaused) {
      remainingSeconds = Math.ceil(this.remainingMs / 1000);
    }

    return {
      phase: this.currentPhase,
      isRunning: this.isRunning,
      isPaused: this.isPaused,
      mode: this.config.name,
      sessionsCompleted: this.sessionsCompleted,
      totalFocusMinutes: this.totalFocusMinutes,
      totalBreakMinutes: this.totalBreakMinutes,
      remainingSeconds,
      remainingFormatted: this._formatTime(remainingSeconds)
    };
  }

  /**
   * Get session history
   */
  getHistory() {
    return [...this.history];
  }

  /**
   * Get productivity score (0-100)
   */
  getProductivityScore() {
    if (this.sessionsCompleted === 0) return 0;

    const targetSessions = 8; // ~8 sessions per day is optimal
    const sessionScore = Math.min(100, (this.sessionsCompleted / targetSessions) * 100);
    const focusRatio = this.totalFocusMinutes / (this.totalFocusMinutes + this.totalBreakMinutes || 1);
    const ratioScore = focusRatio >= 0.7 && focusRatio <= 0.85 ? 100 : Math.max(0, 100 - Math.abs(0.77 - focusRatio) * 200);

    return Math.round((sessionScore * 0.6) + (ratioScore * 0.4));
  }

  /**
   * Get daily summary
   */
  getDailySummary() {
    const score = this.getProductivityScore();
    let rating;
    if (score >= 80) rating = 'Excellent — Your brain is performing at peak capacity.';
    else if (score >= 60) rating = 'Good — Solid focus with room for deeper work sessions.';
    else if (score >= 40) rating = 'Fair — Consider longer focus blocks and fewer distractions.';
    else rating = 'Getting started — Build momentum with shorter sprint sessions.';

    return {
      sessionsCompleted: this.sessionsCompleted,
      totalFocusMinutes: this.totalFocusMinutes,
      totalBreakMinutes: this.totalBreakMinutes,
      focusHours: (this.totalFocusMinutes / 60).toFixed(1),
      productivityScore: score,
      rating,
      history: this.history
    };
  }

  // Private methods

  _completeFocus() {
    this.sessionsCompleted++;
    this.totalFocusMinutes += this.config.focusMinutes;
    this.isRunning = false;
    this.currentPhase = 'idle';

    this.history.push({
      type: 'focus',
      duration: this.config.focusMinutes,
      completedAt: new Date().toISOString(),
      session: this.sessionsCompleted
    });

    this.emit('focus:complete', {
      session: this.sessionsCompleted,
      totalFocusMinutes: this.totalFocusMinutes,
      message: `Focus session #${this.sessionsCompleted} complete! Time for a break.`
    });
  }

  _completeBreak(breakMinutes) {
    this.totalBreakMinutes += breakMinutes;
    this.isRunning = false;
    this.currentPhase = 'idle';

    this.history.push({
      type: 'break',
      duration: breakMinutes,
      completedAt: new Date().toISOString()
    });

    this.emit('break:complete', {
      totalBreakMinutes: this.totalBreakMinutes,
      message: 'Break complete! Ready for another focus session?'
    });
  }

  _getBreakActivity() {
    const index = this.sessionsCompleted % BREAK_ACTIVITIES.length;
    return BREAK_ACTIVITIES[index];
  }

  _formatTime(totalSeconds) {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }
}

/**
 * Factory function for quick usage
 */
function createTimer(mode = 'flow', options = {}) {
  return new DetoxTimer({ mode, ...options });
}

/**
 * Get available focus modes
 */
function getModes() {
  return { ...FOCUS_MODES };
}

/**
 * Get break activity suggestions
 */
function getBreakActivities() {
  return [...BREAK_ACTIVITIES];
}

module.exports = {
  DetoxTimer,
  createTimer,
  getModes,
  getBreakActivities,
  FOCUS_MODES,
  BREAK_ACTIVITIES
};
