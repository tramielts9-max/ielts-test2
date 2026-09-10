/**
 * js/evaluator.js - Bộ máy chấm điểm, định dạng kết quả và nộp điểm Cloud
 */
import { CONFIG } from './config.js';
import { stateManager } from './state.js';

export class TestEvaluator {
  constructor(testData) {
    this.testData = testData || window.TEST_DATA || { answers: {} };
  }

  evaluate() {
    const answers = this.testData.answers;
    let score = 0;
    const total = Object.keys(answers).length;
    const details = [];

    const snapshot = {
      inputs: {},
      radios: {},
      thoughts: {},
      aiResponses: {}
    };

    for (const qKey in answers) {
      const expected = answers[qKey];
      const qDiv = document.getElementById(qKey);
      const textInput = document.getElementById(`${qKey}_input`);
      const radioSelected = document.querySelector(`input[name="${qKey}"]:checked`);
      const thoughtEl = document.getElementById(`${qKey}_thought`);

      let userVal = textInput ? textInput.value.trim() : (radioSelected ? radioSelected.value.trim() : '');
      if (textInput) snapshot.inputs[textInput.id] = userVal;
      if (radioSelected) snapshot.radios[qKey] = userVal;
      if (thoughtEl) snapshot.thoughts[thoughtEl.id] = thoughtEl.value;

      let isCorrect = false;
      if (radioSelected) {
        isCorrect = (userVal.toUpperCase() === String(expected).trim().toUpperCase());
      } else {
        const cleanVal = userVal.toLowerCase().replace(/\s+/g, ' ');
        if (Array.isArray(expected)) {
          isCorrect = expected.map(a => a.toLowerCase().trim()).includes(cleanVal);
        } else {
          isCorrect = (cleanVal === String(expected).toLowerCase().trim());
        }
      }

      if (isCorrect) score++;

      // Cập nhật DOM câu hỏi
      if (qDiv) {
        const resDiv = qDiv.querySelector('.result');
        const expDiv = qDiv.querySelector('.explanation');
        if (isCorrect) {
          if (resDiv) resDiv.innerHTML = "<span class='correct-text'>✓ Đúng</span>";
          qDiv.classList.add('correct-border');
          qDiv.classList.remove('incorrect-border');
        } else {
          const expStr = Array.isArray(expected) ? expected.join(' / ') : expected;
          if (resDiv) resDiv.innerHTML = `<span class='incorrect-text'>✗ Sai (Đáp án: <b>${expStr}</b>)</span>`;
          qDiv.classList.add('incorrect-border');
          qDiv.classList.remove('correct-border');
        }
        if (expDiv) expDiv.style.display = 'block';
      }

      // Cập nhật Badge nút chuyển nhanh (nếu có)
      const badge = document.getElementById(`badge_${qKey}`);
      if (badge) {
        badge.classList.toggle('status-correct', isCorrect);
        badge.classList.toggle('status-incorrect', !isCorrect);
      }

      details.push(`${qKey.toUpperCase()}: ${userVal || 'Trống'} (${isCorrect ? 'ĐÚNG' : 'SAI'})`);
    }

    return { score, total, details: details.join('\n'), snapshot };
  }

  async submitToCloud(resultData, studentName, studentEmail, timeSpent) {
    const scoreStr = `${resultData.score}/${resultData.total}`;
    const payload = {
      testTitle: this.testData.title || document.title,
      studentName,
      studentEmail,
      score: scoreStr,
      timeSpent,
      details: resultData.details
    };

    // Gửi điểm về Google Sheets
    if (CONFIG.AI_AND_SHEET_URL) {
      fetch(CONFIG.AI_AND_SHEET_URL, {
        method: "POST",
        mode: "no-cors",
        body: JSON.stringify({ action: "submit_score", ...payload })
      }).catch(() => {});
    }

    // Gửi Snapshot chi tiết về Google Drive
    if (CONFIG.DRIVE_STORAGE_URL) {
      const now = new Date();
      const timeStr = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')} - ${String(now.getDate()).padStart(2,'0')}/${String(now.getMonth()+1).padStart(2,'0')}/${now.getFullYear()}`;
      
      const attemptSnapshot = {
        id: "attempt_" + Date.now(),
        timestamp: timeStr,
        ...payload,
        pageUrl: window.location.pathname.split('/').pop(),
        ...resultData.snapshot
      };

      fetch(CONFIG.DRIVE_STORAGE_URL, {
        method: "POST",
        mode: "no-cors",
        body: JSON.stringify({ action: "save_attempt", attempt: attemptSnapshot })
      }).catch(() => {});
    }
  }
}
