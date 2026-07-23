/**
 * Tests for Digital Detox Timer
 */

'use strict';

const { DetoxTimer, createTimer, getModes, getBreakActivities, FOCUS_MODES } = require('../src/index');

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ ${message}`);
    passed++;
  } else {
    console.log(`  ✗ ${message}`);
    failed++;
  }
}

console.log('\n  Digital Detox Timer — Test Suite\n');
console.log('  ─────────────────────────────────────\n');

// Test 1: Module exports
console.log('  Module Exports:');
assert(typeof DetoxTimer === 'function', 'DetoxTimer class is exported');
assert(typeof createTimer === 'function', 'createTimer factory is exported');
assert(typeof getModes === 'function', 'getModes is exported');
assert(typeof getBreakActivities === 'function', 'getBreakActivities is exported');
assert(typeof FOCUS_MODES === 'object', 'FOCUS_MODES constant is exported');

// Test 2: Timer creation
console.log('\n  Timer Creation:');
const timer1 = createTimer('flow');
assert(timer1 instanceof DetoxTimer, 'createTimer returns DetoxTimer instance');
assert(timer1.config.name === 'Flow State', 'Flow mode has correct name');
assert(timer1.config.focusMinutes === 52, 'Flow mode has 52 min focus');
assert(timer1.config.breakMinutes === 17, 'Flow mode has 17 min break');

const timer2 = createTimer('pomodoro');
assert(timer2.config.focusMinutes === 25, 'Pomodoro has 25 min focus');
assert(timer2.config.breakMinutes === 5, 'Pomodoro has 5 min break');
assert(timer2.config.longBreakMinutes === 15, 'Pomodoro has 15 min long break');

const timer3 = createTimer('deep');
assert(timer3.config.focusMinutes === 90, 'Deep work has 90 min focus');
assert(timer3.config.breakMinutes === 20, 'Deep work has 20 min break');

// Test 3: Custom options
console.log('\n  Custom Options:');
const customTimer = new DetoxTimer({ mode: 'custom', focusMinutes: 45, breakMinutes: 10 });
assert(customTimer.config.focusMinutes === 45, 'Custom focus minutes applied');
assert(customTimer.config.breakMinutes === 10, 'Custom break minutes applied');

// Test 4: Timer status
console.log('\n  Timer Status:');
const statusTimer = createTimer('sprint');
const status = statusTimer.getStatus();
assert(status.phase === 'idle', 'Initial phase is idle');
assert(status.isRunning === false, 'Timer is not running initially');
assert(status.isPaused === false, 'Timer is not paused initially');
assert(status.sessionsCompleted === 0, 'No sessions completed initially');
assert(status.totalFocusMinutes === 0, 'No focus minutes initially');

// Test 5: Focus modes
console.log('\n  Focus Modes:');
const modes = getModes();
assert(Object.keys(modes).length === 5, 'Five focus modes available');
assert(modes.deep !== undefined, 'Deep mode exists');
assert(modes.pomodoro !== undefined, 'Pomodoro mode exists');
assert(modes.flow !== undefined, 'Flow mode exists');
assert(modes.sprint !== undefined, 'Sprint mode exists');
assert(modes.custom !== undefined, 'Custom mode exists');

// Test 6: Break activities
console.log('\n  Break Activities:');
const activities = getBreakActivities();
assert(Array.isArray(activities), 'Break activities is an array');
assert(activities.length === 10, 'Ten break activities available');
assert(activities[0].activity !== undefined, 'Activity has activity field');
assert(activities[0].benefit !== undefined, 'Activity has benefit field');
assert(activities[0].type !== undefined, 'Activity has type field');

// Test 7: Event emission
console.log('\n  Event Emission:');
const eventTimer = createTimer('sprint');
let focusStarted = false;
eventTimer.on('focus:start', () => { focusStarted = true; });
eventTimer.startFocus();
assert(focusStarted === true, 'focus:start event emitted');
assert(eventTimer.isRunning === true, 'Timer is running after startFocus');
assert(eventTimer.currentPhase === 'focus', 'Phase is focus after startFocus');
eventTimer.stop();
assert(eventTimer.isRunning === false, 'Timer stopped after stop()');
assert(eventTimer.currentPhase === 'idle', 'Phase is idle after stop');

// Test 8: Pause and resume
console.log('\n  Pause and Resume:');
const pauseTimer = createTimer('sprint');
pauseTimer.startFocus();
pauseTimer.pause();
assert(pauseTimer.isPaused === true, 'Timer is paused after pause()');
assert(pauseTimer.isRunning === false, 'Timer is not running when paused');
pauseTimer.resume();
assert(pauseTimer.isPaused === false, 'Timer is not paused after resume()');
assert(pauseTimer.isRunning === true, 'Timer is running after resume()');
pauseTimer.stop();

// Test 9: Productivity score
console.log('\n  Productivity Score:');
const scoreTimer = createTimer('flow');
assert(scoreTimer.getProductivityScore() === 0, 'Score is 0 with no sessions');

// Test 10: Daily summary
console.log('\n  Daily Summary:');
const summaryTimer = createTimer('flow');
const summary = summaryTimer.getDailySummary();
assert(summary.sessionsCompleted === 0, 'Summary shows 0 sessions');
assert(summary.totalFocusMinutes === 0, 'Summary shows 0 focus minutes');
assert(summary.productivityScore === 0, 'Summary shows 0 score');
assert(typeof summary.rating === 'string', 'Summary has rating string');

// Results
console.log('\n  ─────────────────────────────────────');
console.log(`\n  Results: ${passed} passed, ${failed} failed, ${passed + failed} total\n`);

if (failed > 0) {
  process.exit(1);
}
