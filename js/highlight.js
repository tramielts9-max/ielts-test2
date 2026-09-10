/**
 * js/highlight.js - Bôi đen văn bản để highlight hoặc xóa highlight
 */
export function initHighlighting(containerSelector = '.container') {
  let hlPopup = document.getElementById('hlPopup');
  let removeHlPopup = document.getElementById('removeHlPopup');

  if (!hlPopup) {
    hlPopup = document.createElement('div');
    hlPopup.id = 'hlPopup';
    hlPopup.className = 'hl-popup';
    hlPopup.innerHTML = '<button id="btnDoHighlight">🖍️ Highlight</button>';
    document.body.appendChild(hlPopup);
  }

  if (!removeHlPopup) {
    removeHlPopup = document.createElement('div');
    removeHlPopup.id = 'removeHlPopup';
    removeHlPopup.className = 'hl-popup';
    removeHlPopup.innerHTML = '<button id="btnRemoveHighlight">❌ Xóa Highlight</button>';
    document.body.appendChild(removeHlPopup);
  }

  const container = document.querySelector(containerSelector);
  let currentTargetSpan = null;
  let currentRange = null;

  hlPopup.style.position = 'fixed';
  removeHlPopup.style.position = 'fixed';

  document.addEventListener('mouseup', (e) => {
    if (hlPopup.contains(e.target) || removeHlPopup.contains(e.target)) return;

    const selection = window.getSelection();
    const selectedText = selection.toString().trim();

    if (e.target.classList.contains('user-highlight')) {
      currentTargetSpan = e.target;
      const rect = e.target.getBoundingClientRect();
      removeHlPopup.style.left = `${rect.left + rect.width / 2 - 55}px`;
      removeHlPopup.style.top = `${rect.top - 38}px`;
      removeHlPopup.style.display = 'block';
      hlPopup.style.display = 'none';
      return;
    } else {
      removeHlPopup.style.display = 'none';
    }

    if (selectedText.length > 0 && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      if (container && container.contains(range.commonAncestorContainer) && 
          e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
        currentRange = range.cloneRange();
        const rect = range.getBoundingClientRect();
        hlPopup.style.left = `${rect.left + rect.width / 2 - 45}px`;
        hlPopup.style.top = `${rect.top - 38}px`;
        hlPopup.style.display = 'block';
        return;
      }
    }
    hlPopup.style.display = 'none';
  });

  document.getElementById('btnDoHighlight')?.addEventListener('click', (e) => {
    e.stopPropagation();
    if (!currentRange) return;
    const span = document.createElement('span');
    span.className = 'user-highlight';
    try {
      currentRange.surroundContents(span);
    } catch {
      span.appendChild(currentRange.extractContents());
      currentRange.insertNode(span);
    }
    window.getSelection().removeAllRanges();
    hlPopup.style.display = 'none';
    currentRange = null;
  });

  document.getElementById('btnRemoveHighlight')?.addEventListener('click', (e) => {
    e.stopPropagation();
    if (currentTargetSpan) {
      const parent = currentTargetSpan.parentNode;
      while (currentTargetSpan.firstChild) {
        parent.insertBefore(currentTargetSpan.firstChild, currentTargetSpan);
      }
      parent.removeChild(currentTargetSpan);
      currentTargetSpan = null;
    }
    removeHlPopup.style.display = 'none';
  });

  document.addEventListener('mousedown', (e) => {
    if (!hlPopup.contains(e.target) && !removeHlPopup.contains(e.target)) {
      hlPopup.style.display = 'none';
      removeHlPopup.style.display = 'none';
    }
  });
}
