export function speakMalay(text) {
  const speech = window.speechSynthesis;
  if (!speech) return false;
  const voices = speech.getVoices();
  const voice = voices.find(voice => /^ms[-_]my$/i.test(voice.lang))
    ?? voices.find(voice => /^ms(?:[-_]|$)/i.test(voice.lang));
  if (!voice) return false;
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = voice.lang;
  utterance.voice = voice;
  speech.cancel();
  speech.speak(utterance);
  return true;
}
