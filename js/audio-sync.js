/**
 * js/audio-sync.js - Đồng bộ Audio với từng mốc thời gian Transcript
 */
export function initAudioTranscriptSync(audioId = 'mainAudioElement', passageBoxId = 'passageBox') {
  const audio = document.getElementById(audioId) || document.querySelector('audio');
  const passageBox = document.getElementById(passageBoxId);
  const transcriptLines = Array.from(document.querySelectorAll('.transcript-line'));
  if (!audio || transcriptLines.length === 0) return;

  let isUserScrolling = false;
  let userScrollTimeout = null;

  if (passageBox) {
    const handleScroll = () => {
      isUserScrolling = true;
      clearTimeout(userScrollTimeout);
      userScrollTimeout = setTimeout(() => { isUserScrolling = false; }, 3500);
    };
    passageBox.addEventListener('wheel', handleScroll, { passive: true });
    passageBox.addEventListener('touchmove', handleScroll, { passive: true });
  }

  transcriptLines.forEach(line => {
    line.addEventListener('click', function(e) {
      if (['BUTTON', 'INPUT', 'TEXTAREA'].includes(e.target.tagName) || e.target.closest('.ai-assistant-box')) return;
      const startTime = parseFloat(this.getAttribute('data-start') || this.getAttribute('data-time'));
      if (!isNaN(startTime)) {
        audio.currentTime = startTime;
        audio.play();
        isUserScrolling = false;
      }
    });
  });

  audio.addEventListener('timeupdate', () => {
    const curTime = audio.currentTime;
    let activeLine = null;

    for (let i = 0; i < transcriptLines.length; i++) {
      const line = transcriptLines[i];
      const start = parseFloat(line.getAttribute('data-start') || line.getAttribute('data-time'));
      let end = parseFloat(line.getAttribute('data-end'));

      if (isNaN(end)) {
        const nextLine = transcriptLines[i + 1];
        end = nextLine ? parseFloat(nextLine.getAttribute('data-start') || nextLine.getAttribute('data-time')) : Infinity;
      }

      if (curTime >= start && curTime < end) {
        activeLine = line;
        break;
      }
    }

    transcriptLines.forEach(l => { if (l !== activeLine) l.classList.remove('playing-active'); });

    if (activeLine && !activeLine.classList.contains('playing-active')) {
      activeLine.classList.add('playing-active');
      if (!isUserScrolling && passageBox && passageBox.offsetParent !== null) {
        activeLine.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  });
}
