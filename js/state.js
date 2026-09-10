/**
 * js/state.js - Quản lý trạng thái, phiên làm bài và LocalStorage
 */
import { CONFIG } from './config.js';

export class StateManager {
  constructor() {
    this.testKey = 'ielts_state_' + (window.location.pathname.split('/').pop() || 'default_test');
    this.isReviewMode = false;
  }

  getUser() {
    return {
      name: localStorage.getItem(CONFIG.STORAGE_KEYS.STUDENT_NAME) || '',
      email: localStorage.getItem(CONFIG.STORAGE_KEYS.STUDENT_EMAIL) || ''
    };
  }

  saveUser(name, email) {
    if (name) localStorage.setItem(CONFIG.STORAGE_KEYS.STUDENT_NAME, name.trim());
    if (email) localStorage.setItem(CONFIG.STORAGE_KEYS.STUDENT_EMAIL, email.trim().toLowerCase());
  }

  saveTestProgress(data) {
    if (this.isReviewMode) return;
    try {
      localStorage.setItem(this.testKey, JSON.stringify(data));
    } catch (e) {
      console.warn("Không thể lưu tiến trình bài làm:", e);
    }
  }

  getSavedProgress() {
    try {
      const raw = localStorage.getItem(this.testKey);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  clearProgress() {
    localStorage.removeItem(this.testKey);
  }
}

export const stateManager = new StateManager();
