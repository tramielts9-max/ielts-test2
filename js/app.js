/**
 * js/app.js - Điểm khởi động tập trung cho mọi bài Test
 */
import { stateManager } from './state.js';
import { TestTimer } from './timer.js';
import { initHighlighting } from './highlight.js';
import { initResizer } from './resizer.js';
import { initAudioTranscriptSync } from './audio-sync.js';
import { askGemini } from './ai-assistant.js';
import { TestEvaluator } from './evaluator.js';

// Đưa các hàm cần tương tác từ giao diện ra window namespace
window.askGeminiAI = (qId) => askGemini(qId);
window.highlightText = (id) => {
  document.querySelectorAll('.hl-active').forEach(el => el.classList.remove('hl-active'));
  const target = document.getElementById(id);
  if (target) {
    target.classList.add('hl-active');
    target.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
};

function initApp() {
  const isListening = !!document.querySelector('audio') || window.location.pathname.includes('lis');

  // Khởi tạo Timer
  const timer = new TestTimer('timerDisplay', (sec) => {
    if (sec % 5 === 0) collectAndSaveState();
  });
  window.startTimer = () => timer.start();
  window.pauseTimer = () => timer.pause();

  // Khởi tạo các tiện ích Core
  initHighlighting();
  initResizer();
  if (isListening) initAudioTranscriptSync();

  // Đồng bộ thông tin học viên từ LocalStorage
  const user = stateManager.getUser();
  const nameInput = document.getElementById('studentNameInput');
  const emailInput = document.getElementById('studentEmailInput');
  if (nameInput && user.name) nameInput.value = user.name;
  if (emailInput && user.email) emailInput.value = user.email;

  // Xử lý nộp bài
  const evaluator = new TestEvaluator(window.TEST_DATA);
  window.checkAnswers = async () => {
    const studentName = nameInput ? nameInput.value.trim() : "";
    const studentEmail = emailInput ? emailInput.value.trim().toLowerCase() : "";

    if (!studentName || !studentEmail) {
      alert("⚠️ Vui lòng điền Họ tên và Email trước khi nộp bài!");
      return;
    }

    stateManager.saveUser(studentName, studentEmail);
    timer.stop();

    const evaluation = evaluator.evaluate();
    const scoreStr = `${evaluation.score}/${evaluation.total}`;
    
    const scoreBadge = document.getElementById('scoreBadge');
    const scoreText = document.getElementById('scoreText');
    if (scoreBadge) scoreBadge.style.display = 'block';
    if (scoreText) scoreText.innerText = scoreStr;

    document.body.classList.add('submitted-mode');
    document.getElementById('passageBox')?.classList.add('submitted');

    await evaluator.submitToCloud(evaluation, studentName, studentEmail, timer.formatTime(timer.seconds));
    alert(`🎉 Hoàn thành! Điểm của em: ${scoreStr}. Kết quả đã được lưu.`);
  };

  function collectAndSaveState() {
    const state = {
      seconds: timer.seconds,
      inputs: {},
      radios: {},
      thoughts: {}
    };
    document.querySelectorAll('input.fill-input').forEach(i => state.inputs[i.id] = i.value);
    document.querySelectorAll('input[type="radio"]:checked').forEach(r => state.radios[r.name] = r.value);
    document.querySelectorAll('.thought-box textarea').forEach(t => state.thoughts[t.id] = t.value);
    stateManager.saveTestProgress(state);
  }

  // Khôi phục tiến trình cũ nếu có
  const saved = stateManager.getSavedProgress();
  if (saved) {
    if (saved.seconds) timer.setTime(saved.seconds);
    if (saved.inputs) Object.entries(saved.inputs).forEach(([id, val]) => { const el = document.getElementById(id); if (el) el.value = val; });
    if (saved.radios) Object.entries(saved.radios).forEach(([name, val]) => { const el = document.querySelector(`input[name="${name}"][value="${val}"]`); if (el) el.checked = true; });
    if (saved.thoughts) Object.entries(saved.thoughts).forEach(([id, val]) => { const el = document.getElementById(id); if (el) el.value = val; });
  }
}

// Tự động chạy ngay bất kể thời điểm
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
