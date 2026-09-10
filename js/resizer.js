/**
 * js/resizer.js - Kéo thả thanh chia đôi màn hình
 */
export function initResizer(resizerId = 'dragResizer', leftBoxId = 'passageBox', rightBoxSelector = '.question-box') {
  const resizer = document.getElementById(resizerId) || document.querySelector('.resizer');
  const leftBox = document.getElementById(leftBoxId);
  const rightBox = document.querySelector(rightBoxSelector);
  const container = document.querySelector('.container');

  if (!resizer || !leftBox || !container) return;

  let isDragging = false;

  resizer.addEventListener('mousedown', () => {
    isDragging = true;
    resizer.classList.add('resizing');
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  });

  document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    const rect = container.getBoundingClientRect();
    const percent = Math.min(Math.max(((e.clientX - rect.left) / rect.width) * 100, 20), 80);

    leftBox.style.width = `${percent}%`;
    if (rightBox) {
      const resizerW = resizer.offsetWidth || 12;
      rightBox.style.width = `calc(${100 - percent}% - ${resizerW}px)`;
    }
  });

  document.addEventListener('mouseup', () => {
    if (isDragging) {
      isDragging = false;
      resizer.classList.remove('resizing');
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }
  });
}
