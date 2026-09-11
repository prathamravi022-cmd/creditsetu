import { useState, useCallback } from 'react';
export function useVoiceInput() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const startListening = useCallback((lang) => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { alert('Speech recognition not supported'); return; }
    const r = new SR();
    r.lang = lang || 'hi-IN';
    r.continuous = false;
    r.interimResults = true;
    r.onstart = () => setIsListening(true);
    r.onend = () => setIsListening(false);
    r.onresult = (e) => setTranscript(Array.from(e.results).map(x => x[0].transcript).join(''));
    r.onerror = () => setIsListening(false);
    r.start();
  }, []);
  const stopListening = useCallback(() => setIsListening(false), []);
  return { isListening, transcript, setTranscript, startListening, stopListening };
}
