const SpeechRecognitionAPI =
  typeof window !== 'undefined'
    ? window.SpeechRecognition || window.webkitSpeechRecognition
    : undefined;

export const isSpeechSupported = !!SpeechRecognitionAPI;

function showToast(message, duration = 0) {
  const toast = document.getElementById('voice-status-toast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('visible');
  if (duration > 0) {
    setTimeout(() => toast.classList.remove('visible'), duration);
  }
}

function hideToast() {
  const toast = document.getElementById('voice-status-toast');
  if (!toast) return;
  toast.classList.remove('visible');
}

function isGibberish(text) {
  const cleaned = text.trim();
  if (cleaned.length < 2) return true;
  if (/^[^a-zA-Z\u0900-\u097F0-9]+$/.test(cleaned)) return true;
  if (/^(.)\1{4,}$/.test(cleaned)) return true;
  return false;
}

function getTranscript(result) {
  const alternative = result?.[0];
  return typeof alternative?.transcript === 'string' ? alternative.transcript : '';
}

export function initVoiceInput(setInputValue) {
  if (!SpeechRecognitionAPI || typeof setInputValue !== 'function') return undefined;

  const btn = document.getElementById('voice-input-btn');
  const micIcon = document.getElementById('voice-icon-mic');
  const stopIcon = document.getElementById('voice-icon-stop');
  const promptInput = document.querySelector('#prompt-input');

  if (!btn || !promptInput || !micIcon || !stopIcon) return undefined;

  const recognition = new SpeechRecognitionAPI();

  recognition.lang = 'en-IN';
  recognition.continuous = false;
  recognition.interimResults = true;
  recognition.maxAlternatives = 1;

  let isListening = false;
  let finalTranscript = '';
  let silenceTimer = null;
  let endTimer = null;
  const SILENCE_TIMEOUT = 3500;

  function setListeningState(listening) {
    isListening = listening;
    btn.classList.toggle('listening', listening);
    micIcon.style.display = listening ? 'none' : 'block';
    stopIcon.style.display = listening ? 'block' : 'none';
    btn.setAttribute('aria-label', listening ? 'Stop recording' : 'Voice input');
  }

  function resetState() {
    setListeningState(false);
    clearTimeout(silenceTimer);
    clearTimeout(endTimer);
    silenceTimer = null;
    endTimer = null;
    finalTranscript = '';
    hideToast();
  }

  recognition.onstart = () => {
    finalTranscript = '';
    setListeningState(true);
    showToast('🎙 Listening...');
  };

  recognition.onresult = (event) => {
    let interimTranscript = '';
    clearTimeout(silenceTimer);

    for (let i = event.resultIndex; i < event.results.length; i++) {
      const result = event.results[i];
      const transcript = getTranscript(result);
      if (!transcript) continue;

      if (result.isFinal) {
        finalTranscript += `${transcript} `;
      } else {
        interimTranscript += transcript;
      }
    }

    const displayText = `${finalTranscript || ''}${interimTranscript || ''}`.trim();
    if (displayText.length > 0) {
      setInputValue(displayText);
    }

    silenceTimer = setTimeout(() => {
      if (isListening) recognition.stop();
    }, SILENCE_TIMEOUT);
  };

  recognition.onend = () => {
    clearTimeout(endTimer);
    endTimer = setTimeout(() => {
      const text = finalTranscript.trim();

      if (!text || isGibberish(text)) {
        setInputValue('');
        showToast("Didn't catch that. Try again.", 2500);
      } else {
        setInputValue(text);
        showToast('✓ Done — review and press Send', 2000);
        promptInput.focus();
      }

      resetState();
    }, 80);
  };

  recognition.onerror = (event) => {
    switch (event.error) {
      case 'not-allowed':
      case 'permission-denied':
        showToast('Microphone access denied. Enable mic permissions.', 3000);
        break;
      case 'no-speech':
        showToast('No speech detected. Try again.', 2000);
        break;
      case 'network':
        showToast('Network error. Check your connection.', 2500);
        break;
      case 'aborted':
        break;
      default:
        showToast(`Voice error: ${event.error}`, 2500);
    }
    resetState();
  };

  const handleButtonClick = () => {
    if (isListening) {
      recognition.stop();
    } else {
      finalTranscript = '';
      setInputValue('');
      try {
        recognition.start();
      } catch (error) {
        if (error.name !== 'InvalidStateError') {
          showToast('Could not start voice input.', 2000);
        }
      }
    }
  };

  const handleKeyDown = (event) => {
    const isMac = navigator.platform.includes('Mac');
    const modifier = isMac ? event.metaKey : event.ctrlKey;
    if (modifier && event.shiftKey && event.key === 'm') {
      event.preventDefault();
      btn.click();
    }
  };

  btn.addEventListener('click', handleButtonClick);
  document.addEventListener('keydown', handleKeyDown);

  return () => {
    btn.removeEventListener('click', handleButtonClick);
    document.removeEventListener('keydown', handleKeyDown);
    clearTimeout(silenceTimer);
    clearTimeout(endTimer);
    if (isListening) {
      try {
        recognition.abort();
      } catch {
        /* ignore */
      }
    }
    resetState();
  };
}
