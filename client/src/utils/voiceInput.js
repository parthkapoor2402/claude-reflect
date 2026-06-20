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

function setPromptValue(promptInput, text) {
  const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
    window.HTMLTextAreaElement.prototype,
    'value'
  ).set;
  nativeInputValueSetter.call(promptInput, text);
  promptInput.dispatchEvent(new Event('input', { bubbles: true }));
}

export function initVoiceInput() {
  if (!SpeechRecognitionAPI) return undefined;

  const btn = document.getElementById('voice-input-btn');
  const micIcon = document.getElementById('voice-icon-mic');
  const stopIcon = document.getElementById('voice-icon-stop');
  const promptInput = document.querySelector('#prompt-input');

  if (!btn || !promptInput || !micIcon || !stopIcon) return undefined;

  const recognition = new SpeechRecognitionAPI();

  recognition.lang = 'hi-IN';
  recognition.continuous = false;
  recognition.interimResults = true;
  recognition.maxAlternatives = 1;

  let isListening = false;
  let finalTranscript = '';
  let silenceTimer = null;
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
    silenceTimer = null;
    finalTranscript = '';
    hideToast();
  }

  recognition.onstart = () => {
    setListeningState(true);
    showToast('🎙 Listening...');
    finalTranscript = '';
  };

  recognition.onresult = (event) => {
    let interimTranscript = '';
    clearTimeout(silenceTimer);

    for (let i = event.resultIndex; i < event.results.length; i++) {
      const result = event.results[i];
      if (result.isFinal) {
        finalTranscript += `${result.transcript} `;
      } else {
        interimTranscript += result.transcript;
      }
    }

    const displayText = (finalTranscript + interimTranscript).trim();
    if (displayText) {
      setPromptValue(promptInput, displayText);
    }

    silenceTimer = setTimeout(() => {
      if (isListening) recognition.stop();
    }, SILENCE_TIMEOUT);
  };

  recognition.onend = () => {
    const text = (finalTranscript.trim() || promptInput.value.trim());

    if (!text || isGibberish(text)) {
      if (promptInput.value === text || isGibberish(promptInput.value)) {
        setPromptValue(promptInput, '');
      }
      showToast("Didn't catch that. Try again.", 2500);
    } else {
      setPromptValue(promptInput, text);
      showToast('✓ Done — review and press Send', 2000);
      promptInput.focus();
    }

    resetState();
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
