// === MAIN TIMER LOGIC ===

fetch("config/site-config.json")
  .then(function (res) { return res.json(); })
  .then(function (data) {
    document.title = data.title;
    document.querySelector("header h1").textContent = data.title;
    document.getElementById("workshop-name").textContent = data.workshop;
  })
  .catch(function () {
    // Config is optional; HTML defaults are already present.
  });

const timerEl = document.getElementById("timer");
const startBtn = document.getElementById("start-btn");
const pauseBtn = document.getElementById("pause-btn");
const resetBtn = document.getElementById("reset-btn");
const modeLabel = document.getElementById("mode-label");
const sessionLog = document.getElementById("session-log");

const FOCUS_MINUTES = 25;
const BREAK_MINUTES = 5;

let audioContext = null;
let totalSeconds = FOCUS_MINUTES * 60;
let remaining = totalSeconds;
let interval = null;
let isRunning = false;
let isFocus = true;
let lastTimerColorClass = getTimerColorClass();

document.addEventListener("click", unlockAudio, { passive: true });

startBtn.addEventListener("click", function () {
  if (isRunning) return;
  unlockAudio();
  isRunning = true;
  startBtn.disabled = true;
  pauseBtn.disabled = false;

  interval = setInterval(function () {
    remaining--;
    updateDisplay();

    if (remaining <= 0) {
      clearInterval(interval);
      isRunning = false;
      logSession(isFocus ? "Focus" : "Break", isFocus ? FOCUS_MINUTES : BREAK_MINUTES);

      // switch mode
      isFocus = !isFocus;
      remaining = (isFocus ? FOCUS_MINUTES : BREAK_MINUTES) * 60;
      totalSeconds = remaining;
      modeLabel.textContent = isFocus ? "Focus" : "Break";
      updateDisplay();
      startBtn.disabled = false;
      pauseBtn.disabled = true;
    }
  }, 1000);
});

pauseBtn.addEventListener("click", function () {
  clearInterval(interval);
  isRunning = false;
  startBtn.disabled = false;
  pauseBtn.disabled = true;
});

resetBtn.addEventListener("click", function () {
  clearInterval(interval);
  isRunning = false;
  isFocus = true;
  remaining = FOCUS_MINUTES * 60;
  totalSeconds = remaining;
  modeLabel.textContent = "Focus";
  updateDisplay();
  startBtn.disabled = false;
  pauseBtn.disabled = true;
});

function updateDisplay() {
  var m = Math.floor(remaining / 60);
  var s = remaining % 60;
  var timerText = pad(m) + ":" + pad(s);
  var timerColorClass = getTimerColorClass();

  timerEl.setAttribute("aria-label", timerText);
  timerEl.innerHTML = renderTimerMarkup(timerText, timerColorClass);

  if (isRunning && timerColorClass !== lastTimerColorClass) {
    playColorChangeBell();
  }

  lastTimerColorClass = timerColorClass;
}

function renderTimerMarkup(timerText, timerColorClass) {
  return timerText
    .split("")
    .map(function (char) {
      if (char === ":") {
        return '<span class="timer-separator" aria-hidden="true">:</span>';
      }

      return '<span class="timer-digit ' + timerColorClass + '" aria-hidden="true">' + char + "</span>";
    })
    .join("");
}

function getTimerColorClass() {
  var colorClasses = ["timer-color-red", "timer-color-white", "timer-color-blue"];
  var colorIndex = Math.floor(remaining / 10) % colorClasses.length;
  return colorClasses[colorIndex];
}

function ensureAudioContext() {
  if (!audioContext) {
    var AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return null;
    audioContext = new AudioContextClass();
  }

  return audioContext;
}

function unlockAudio() {
  var context = ensureAudioContext();

  if (!context) return;

  if (context.state === "suspended") {
    context.resume();
  }
}

function playColorChangeBell() {
  var context = ensureAudioContext();

  if (!context || context.state !== "running") return;

  var now = context.currentTime;
  var gain = context.createGain();
  var oscA = context.createOscillator();
  var oscB = context.createOscillator();
  var oscC = context.createOscillator();

  oscA.type = "sine";
  oscA.frequency.setValueAtTime(880, now);
  oscA.frequency.exponentialRampToValueAtTime(660, now + 0.45);
  oscB.type = "triangle";
  oscB.frequency.setValueAtTime(1320, now);
  oscB.frequency.exponentialRampToValueAtTime(990, now + 0.42);
  oscC.type = "sine";
  oscC.frequency.setValueAtTime(1760, now);
  oscC.frequency.exponentialRampToValueAtTime(1320, now + 0.28);

  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.22, now + 0.03);
  gain.gain.exponentialRampToValueAtTime(0.08, now + 0.18);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.55);

  oscA.connect(gain);
  oscB.connect(gain);
  oscC.connect(gain);
  gain.connect(context.destination);

  oscA.start(now);
  oscB.start(now + 0.01);
  oscC.start(now + 0.02);
  oscA.stop(now + 0.5);
  oscB.stop(now + 0.46);
  oscC.stop(now + 0.32);
}

updateDisplay();
