// script.js
let timer;
let startTime;
let elapsedTime = 0;
let isRunning = false;
let currentDuration = 0;
let isPomodoro = false;
let pomodoroPhase = 'work';

const timeDisplay = document.getElementById('time');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const stopBtn = document.getElementById('stopBtn');
const alarm = document.getElementById('alarm');
const infoElem = document.getElementById('info');
const progressRing = document.querySelector('.progress-ring__circle');
const radius = progressRing.r.baseVal.value;
const circumference = radius * 2 * Math.PI;

progressRing.style.strokeDasharray = `${circumference} ${circumference}`;
progressRing.style.strokeDashoffset = circumference;

let pomodoroSettings = {
    work: 20 * 60,      // 20 minutes in seconds
    break: 20,          // 20 seconds
    longBreak: 20 * 60, // 20 minutes (if you want longer breaks later)
    phase: 'work',
    cycles: 0
};

function formatSeconds(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return [
        hours > 0 ? `${hours}h ` : '',
        minutes > 0 ? `${minutes}m ` : '',
        `${secs}s`
    ].join('');
}

function showInfo(message) {
    infoElem.textContent = message;
    console.log(message);
}

function setProgress(percent) {
    const offset = circumference - (percent * circumference);
    progressRing.style.strokeDashoffset = offset;
}

function setDuration(seconds) {
    currentDuration = seconds;
    elapsedTime = 0;
    updateDisplay(seconds);
    isPomodoro = true;
}

function setCustomDuration() {
    const minutes = parseInt(document.getElementById('customMinutes').value) || 0;
    const seconds = parseInt(document.getElementById('customSeconds').value) || 0;
    currentDuration = (minutes * 60) + seconds;
    elapsedTime = 0;
    updateDisplay(currentDuration);
    isPomodoro = currentDuration > pomodoroSettings.work;
    showInfo(`Custom timer set for ${formatSeconds(currentDuration)}`);
}

function updateDisplay(time) {
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = time % 60;
    timeDisplay.textContent =
        `${String(hours).padStart(2, '0')}:` +
        `${String(minutes).padStart(2, '0')}:` +
        `${String(seconds).padStart(2, '0')}`;

    setProgress(1 - (elapsedTime / currentDuration));
}

function startTimer() {
    if (!isRunning) {
        // Automatic 20-20-20 rule activation
        if (currentDuration > pomodoroSettings.work && !isPomodoro) {
            isPomodoro = true;
            pomodoroSettings.phase = 'work';
            currentDuration = pomodoroSettings.work;
        }

        isRunning = true;
        startTime = Date.now() - elapsedTime * 1000;
        document.getElementById('startTime').textContent = `Started at: ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

        timer = setInterval(() => {
            elapsedTime = Math.floor((Date.now() - startTime) / 1000);

            if (elapsedTime >= currentDuration) {
                if (isPomodoro) {
                    playAlarm();
                    showNotification(`${pomodoroSettings.phase} phase completed!`);
                    autoSwitchPomodoro();
                } else {
                    stopTimer();
                    playAlarm();
                    showNotification('Time is up!');
                }
            } else {
                updateDisplay(currentDuration - elapsedTime);
            }
        }, 1000);
        showInfo(isPomodoro ?? `Pomodoro ${pomodoroSettings.phase} phase started`);
    }
}

function pauseTimer() {
    clearInterval(timer);
    isRunning = false;
}

function stopTimer() {
    clearInterval(timer);
    isRunning = false;
    elapsedTime = 0;
    updateDisplay(currentDuration);
}

function playAlarm() {
    alarm.play();
    if (Notification.permission === 'granted') {
        new Notification('Timer Completed!', {
            body: `Your ${formatSeconds(currentDuration)} timer has finished!`,
            icon: 'https://img.icons8.com/fluency/48/timer.png'
        });
    }
}

function showNotification(message) {
    if (Notification.permission === 'granted') {
        new Notification('Timer Completed', {
            body: message,
            icon: 'https://img.icons8.com/fluency/48/timer.png'
        });
    } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
                new Notification(message);
            }
        });
    }
}

function autoSwitchPomodoro() {
    if (pomodoroSettings.phase === 'work') {
        pomodoroSettings.phase = 'break';
        currentDuration = pomodoroSettings.break;
    } else {
        pomodoroSettings.phase = 'work';
        currentDuration = pomodoroSettings.work;
        pomodoroSettings.cycles++;
    }
    updateDisplay(currentDuration);
    startTimer();
}

// Initialize notifications
if ('Notification' in window) {
    Notification.requestPermission();
}

// Handle background operation
document.addEventListener('visibilitychange', () => {
    if (document.hidden && isRunning) {
        new Notification('Timer running in background', {
            body: 'Your timer will continue running',
            icon: 'https://img.icons8.com/fluency/48/timer.png'
        });
    }
});