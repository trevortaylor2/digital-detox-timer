#!/usr/bin/env node

/**
 * Digital Detox Timer — CLI
 * A neuroscience-backed focus timer for developers.
 *
 * Usage:
 *   npx digital-detox-timer [mode]
 *   npx digital-detox-timer --help
 *
 * Built by Trevor Taylor AI (https://trevortaylor.ai)
 */

'use strict';

const { DetoxTimer, FOCUS_MODES, BREAK_ACTIVITIES } = require('../src/index');

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  red: '\x1b[31m',
  white: '\x1b[37m',
  bgGreen: '\x1b[42m',
  bgBlue: '\x1b[44m',
  bgMagenta: '\x1b[45m'
};

const c = (color, text) => `${colors[color]}${text}${colors.reset}`;

// Parse arguments
const args = process.argv.slice(2);
const mode = args[0] || 'flow';

if (args.includes('--help') || args.includes('-h')) {
  printHelp();
  process.exit(0);
}

if (args.includes('--modes')) {
  printModes();
  process.exit(0);
}

if (args.includes('--science')) {
  printScience();
  process.exit(0);
}

if (args.includes('--version') || args.includes('-v')) {
  const pkg = require('../package.json');
  console.log(`digital-detox-timer v${pkg.version}`);
  process.exit(0);
}

// Validate mode
if (!FOCUS_MODES[mode]) {
  console.log(c('red', `\n  Error: Unknown mode "${mode}"\n`));
  console.log(`  Available modes: ${Object.keys(FOCUS_MODES).join(', ')}`);
  console.log(`  Run with --modes for details.\n`);
  process.exit(1);
}

// Start the timer
console.clear();
printBanner();

const timer = new DetoxTimer({ mode });
let interval;

// Event handlers
timer.on('focus:start', (data) => {
  console.log(c('green', `\n  ▶ FOCUS SESSION #${data.session} STARTED`));
  console.log(c('dim', `    Mode: ${data.mode} | Duration: ${data.duration} minutes`));
  console.log(c('dim', `    ${FOCUS_MODES[mode].description}\n`));
  startCountdown();
});

timer.on('focus:complete', (data) => {
  clearInterval(interval);
  console.log(`\r  ${c('green', '✓')} ${c('bold', data.message)}`);
  console.log(c('dim', `    Total focus today: ${data.totalFocusMinutes} minutes\n`));

  // Auto-start break
  setTimeout(() => {
    timer.startBreak();
  }, 1000);
});

timer.on('break:start', (data) => {
  console.log(c('cyan', `\n  ☕ BREAK TIME${data.isLongBreak ? ' (Long Break)' : ''} — ${data.duration} minutes`));
  console.log(c('yellow', `\n    💡 Suggestion: ${data.activity}`));
  console.log(c('dim', `       Why: ${data.benefit}\n`));
  startCountdown();
});

timer.on('break:complete', (data) => {
  clearInterval(interval);
  console.log(`\r  ${c('cyan', '✓')} ${c('bold', data.message)}\n`);

  // Show progress
  const summary = timer.getDailySummary();
  console.log(c('magenta', `  📊 Progress: ${summary.sessionsCompleted} sessions | ${summary.focusHours}h focused | Score: ${summary.productivityScore}/100`));
  console.log(c('dim', `     ${summary.rating}\n`));

  // Auto-start next focus
  console.log(c('dim', '  Starting next focus session in 3 seconds... (Ctrl+C to quit)\n'));
  setTimeout(() => {
    timer.startFocus();
  }, 3000);
});

// Countdown display
function startCountdown() {
  interval = setInterval(() => {
    const status = timer.getStatus();
    const icon = status.phase === 'focus' ? '🧠' : '☕';
    const color = status.phase === 'focus' ? 'green' : 'cyan';
    process.stdout.write(`\r  ${icon} ${c(color, status.remainingFormatted)} remaining    `);
  }, 1000);
}

// Handle Ctrl+C gracefully
process.on('SIGINT', () => {
  clearInterval(interval);
  timer.stop();
  const summary = timer.getDailySummary();

  console.log('\n');
  console.log(c('bold', '  ═══════════════════════════════════════'));
  console.log(c('bold', '  📋 SESSION SUMMARY'));
  console.log(c('bold', '  ═══════════════════════════════════════'));
  console.log(`  Sessions completed: ${c('green', summary.sessionsCompleted)}`);
  console.log(`  Total focus time:   ${c('green', summary.focusHours + ' hours')}`);
  console.log(`  Total break time:   ${c('cyan', summary.totalBreakMinutes + ' minutes')}`);
  console.log(`  Productivity score: ${c('magenta', summary.productivityScore + '/100')}`);
  console.log(c('dim', `  ${summary.rating}`));
  console.log(c('bold', '  ═══════════════════════════════════════'));
  console.log(c('dim', '\n  Built by Trevor Taylor AI — https://trevortaylor.ai\n'));
  process.exit(0);
});

// Start!
console.log(c('dim', `  Starting ${FOCUS_MODES[mode].name} mode...\n`));
timer.startFocus();

// Helper functions

function printBanner() {
  console.log(c('bold', '\n  ╔══════════════════════════════════════════════════════╗'));
  console.log(c('bold', '  ║                                                      ║'));
  console.log(c('bold', '  ║   🧠  DIGITAL DETOX TIMER                            ║'));
  console.log(c('bold', '  ║   Neuroscience-backed focus for developers            ║'));
  console.log(c('bold', '  ║                                                      ║'));
  console.log(c('bold', '  ╚══════════════════════════════════════════════════════╝'));
  console.log(c('dim', '  By Trevor Taylor AI — https://trevortaylor.ai\n'));
}

function printHelp() {
  console.log(`
  ${c('bold', 'Digital Detox Timer')} — Neuroscience-backed focus timer for developers

  ${c('bold', 'USAGE')}
    $ npx digital-detox-timer [mode]
    $ detox-timer [mode]

  ${c('bold', 'MODES')}
    deep       90 min focus / 20 min break (ultradian rhythms)
    pomodoro   25 min focus / 5 min break (classic technique)
    flow       52 min focus / 17 min break (optimal ratio)
    sprint     15 min focus / 3 min break (high-resistance tasks)

  ${c('bold', 'OPTIONS')}
    --help, -h       Show this help message
    --modes          Show detailed mode descriptions
    --science        Show the neuroscience behind each mode
    --version, -v    Show version number

  ${c('bold', 'EXAMPLES')}
    $ detox-timer deep        # 90-minute deep work sessions
    $ detox-timer pomodoro    # Classic 25/5 Pomodoro
    $ detox-timer flow        # 52/17 optimal ratio (default)
    $ detox-timer sprint      # Quick 15-minute sprints

  ${c('bold', 'PROGRAMMATIC USAGE')}
    const { createTimer } = require('digital-detox-timer');
    const timer = createTimer('flow');
    timer.on('focus:complete', () => console.log('Take a break!'));
    timer.startFocus();

  ${c('dim', 'Built by Trevor Taylor AI — https://trevortaylor.ai')}
  `);
}

function printModes() {
  console.log(`\n  ${c('bold', 'Available Focus Modes:')}\n`);
  Object.entries(FOCUS_MODES).forEach(([key, mode]) => {
    if (key === 'custom') return;
    console.log(`  ${c('green', key.padEnd(12))} ${mode.name}`);
    console.log(`  ${''.padEnd(12)} Focus: ${mode.focusMinutes} min | Break: ${mode.breakMinutes} min`);
    console.log(`  ${''.padEnd(12)} ${c('dim', mode.description)}`);
    console.log(`  ${''.padEnd(12)} ${c('dim', `Source: ${mode.source}`)}\n`);
  });
}

function printScience() {
  console.log(`\n  ${c('bold', '🧠 The Neuroscience Behind Digital Detox Timer')}\n`);
  console.log(c('dim', '  Research shows that strategic breaks improve cognitive performance'));
  console.log(c('dim', '  by up to 40%. Here\'s why each mode works:\n'));

  console.log(`  ${c('bold', '1. Ultradian Rhythms (Deep Work — 90 min)')}`);
  console.log(`     Your brain naturally cycles through 90-minute periods of high`);
  console.log(`     alertness. Working WITH this rhythm (not against it) maximizes`);
  console.log(`     output while preventing burnout.\n`);

  console.log(`  ${c('bold', '2. Attention Restoration (Pomodoro — 25 min)')}`);
  console.log(`     Sustained attention depletes prefrontal cortex resources.`);
  console.log(`     Frequent short breaks allow the anterior cingulate cortex to`);
  console.log(`     reset, maintaining consistent performance throughout the day.\n`);

  console.log(`  ${c('bold', '3. Optimal Work-Rest Ratio (Flow — 52/17)')}`);
  console.log(`     DeskTime's study of 5.5M daily records found the top 10%`);
  console.log(`     most productive people work 52 minutes then break for 17.`);
  console.log(`     This ratio balances dopamine-driven focus with recovery.\n`);

  console.log(`  ${c('bold', '4. Activation Energy (Sprint — 15 min)')}`);
  console.log(`     For high-resistance tasks, the brain's amygdala triggers`);
  console.log(`     avoidance. Ultra-short commitments bypass this response,`);
  console.log(`     building momentum through micro-accomplishments.\n`);

  console.log(c('dim', '  Learn more at https://trevortaylor.ai\n'));
}
