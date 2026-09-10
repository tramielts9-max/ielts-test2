/**
 * js/timer.js - Xử lý đồng hồ đếm thời gian
 */
export class TestTimer {
  constructor(displayElementId = 'timerDisplay', onTick = null) {
    this.seconds = 0;
    this.timerInterval = null;
    this.isRunning = false;
    this.displayEl = document.getElementById(displayElementId);
    this.onTick = onTick;
  }

  formatTime(totalSecs) {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }

  updateDisplay() {
    if (this.displayEl) {
      this.displayEl.innerText = this.formatTime(this.seconds);
    }
  }

  start() {
    if (!this.isRunning) {
      this.isRunning = true;
      this.timerInterval = setInterval(() => {
        this.seconds++;
        this.updateDisplay();
        if (this.onTick) this.onTick(this.seconds);
      }, 1000);
    }
  }

  pause() {
    if (this.isRunning) {
      this.isRunning = false;
      clearInterval(this.timerInterval);
    }
  }

  stop() {
    this.pause();
    document.querySelectorAll('audio').forEach(audio => audio.pause());
  }

  setTime(sec) {
    this.seconds = sec;
    this.updateDisplay();
  }
}
