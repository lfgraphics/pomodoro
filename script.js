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
        showInfo(isPomodoro ? `Pomodoro ${pomodoroSettings.phase} phase started` : "Timer Started");
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
    // Mobile vibration
    if ('vibrate' in navigator) {
        navigator.vibrate([500, 200, 500]);
    }

    // Audio fallback
    const alarm = new Audio('notification.mp3');
    alarm.play().catch(() => {
        const fallbackAlarm = new Audio('data:audio/wav;base64,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qJrx4KOQjahZxWbcZgztj2c49nKmkId44S71j0c8eV9yDK6uPRzx5X18eDvjvQ6yKo9ZSS6l//8elePK/Lf//IInrOF/FvDoADYAGBMGb7FtErm5MXMlmPAJQVgWta7Zx2go+8xJ0UiCb8LHHdftWyLJE0QIAIsI+UbXu67dZMjmgDGCGl1H+vpF4NSDckSIkk7Vd+sxEhBQMRU8j/12UIRhzSaUdQ+rQU5kGeFxm+hb1oh6pWWmv3uvmReDl0UnvtapVaIzo1jZbf/pD6ElLqSX+rUmOQNpJFa/r+sa4e/pBlAABoAAAAA3CUgShLdGIxsY7AUABPRrgCABdDuQ5GC7DqPQCgbbJUAoRSUj+NIEig0YfyWUho1VBBBA//uQZB4ABZx5zfMakeAAAAmwAAAAF5F3P0w9GtAAACfAAAAAwLhMDmAYWMgVEG1U0FIGCBgXBXAtfMH10000EEEEEECUBYln03TTTdNBDZopopYvrTTdNa325mImNg3TTPV9q3pmY0xoO6bv3r00y+IDGid/9aaaZTGMuj9mpu9Mpio1dXrr5HERTZSmqU36A3CumzN/9Robv/Xx4v9ijkSRSNLQhAWumap82WRSBUqXStV/YcS+XVLnSS+WLDroqArFkMEsAS+eWmrUzrO0oEmE40RlMZ5+ODIkAyKAGUwZ3mVKmcamcJnMW26MRPgUw6j+LkhyHGVGYjSUUKNpuJUQoOIAyDvEyG8S5yfK6dhZc0Tx1KI/gviKL6qvvFs1+bWtaz58uUNnryq6kt5RzOCkPWlVqVX2a/EEBUdU1KrXLf40GoiiFXK///qpoiDXrOgqDR38JB0bw7SoL+ZB9o1RCkQjQ2CBYZKd/+VJxZRRZlqSkKiws0WFxUyCwsKiMy7hUVFhIaCrNQsKkTIsLivwKKigsj8XYlwt/WKi2N4d//uQRCSAAjURNIHpMZBGYiaQPSYyAAABLAAAAAAAACWAAAAApUF/Mg+0aohSIRobBAsMlO//Kk4soosy1JSFRYWaLC4qZBYWFRGZdwqKiwkNBVmoWFSJkWFxX4FFRQWR+LsS4W/rFRb/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////VEFHAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAU291bmRib3kuZGUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMjAwNGh0dHA6Ly93d3cuc291bmRib3kuZGUAAAAAAAAAACU=');
        fallbackAlarm.play();
    })
}

async function showNotification(message) {
    if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready;
        registration.showNotification('Timer Alert', {
            body: message,
            icon: 'https://img.icons8.com/fluency/48/timer.png',
            vibrate: [200, 100, 200],
            tag: 'timer-alert'
        }
        )
    }
    if (/(iPhone|iPad)/i.test(navigator.userAgent)) {
        document.title = "ALERT: " + message;
        setTimeout(() => document.title = "Smart Timer", 2000);
        if ('webkitAudioContext' in window) {
            const context = new webkitAudioContext();
            const oscillator = context.createOscillator();
            oscillator.connect(context.destination);
            oscillator.start();
            setTimeout(() => oscillator.stop(), 500);
        }
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
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/service-worker.js')
        .then(registration => {
            console.log('SW registered', registration);
        }).catch(err => { console.log(err) });
}
if ('Notification' in window) {
    Notification.requestPermission();
    showInfo(Notification.permission);
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