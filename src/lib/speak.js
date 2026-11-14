const BUCKET = 'https://ulgrfumbwjovbjzjiems.supabase.co/storage/v1/object/public/vocabulary-assets';
const CLIPS = 'kata-kita/audio/ms';
const HASH = /^[a-f0-9]{8}$/;
let manifest;
let loading;
let activeAudio;
let playbackId = 0;

export function preloadMalayAudio() {
  if (manifest) return Promise.resolve(manifest);
  if (loading) return loading;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 4000);
  loading = fetch(`${BUCKET}/${CLIPS}/clips.json`, { signal: controller.signal })
    .then(response => response.ok ? response.json() : null)
    .then(data => {
      if (data?.lang === 'ms') {
        manifest = {
          shared: data.shared,
          f: new Set(Array.isArray(data.f) ? data.f.filter(hash => typeof hash === 'string' && HASH.test(hash)) : []),
          m: new Set(Array.isArray(data.m) ? data.m.filter(hash => typeof hash === 'string' && HASH.test(hash)) : []),
        };
      }
      return manifest;
    })
    .catch(() => undefined)
    .finally(() => {
      clearTimeout(timeout);
      loading = undefined;
    });
  return loading;
}

function recordedUrl(text, clips) {
  if (!clips) return null;
  let hash = 0x811c9dc5;
  for (const byte of new TextEncoder().encode(text)) {
    hash = Math.imul(hash ^ byte, 0x01000193) >>> 0;
  }
  const digest = hash.toString(16).padStart(8, '0');
  for (const voice of ['f', 'm']) {
    if (clips[voice].has(digest)) return `${BUCKET}/${CLIPS}/${voice}/${digest}.mp3`;
    const shared = clips.shared?.[voice]?.[text];
    if (typeof shared === 'string' && new RegExp(`^audio/ms/${voice}/[a-f0-9]{8}\\.mp3$`).test(shared)) {
      return `${BUCKET}/${shared}`;
    }
  }
  return null;
}

export function stopMalayAudio() {
  playbackId++;
  if (activeAudio) {
    activeAudio.pause();
    activeAudio.removeAttribute('src');
    activeAudio.load();
    activeAudio = undefined;
  }
  window.speechSynthesis?.cancel();
}

// Keep the cached-manifest path synchronous up to audio.play() for mobile browsers.
export async function speakMalay(text) {
  stopMalayAudio();
  const id = playbackId;
  const normalized = text.normalize('NFC').trim().replace(/\s+/gu, ' ');
  const clips = manifest ?? await preloadMalayAudio();
  if (id !== playbackId) return true;
  const url = recordedUrl(normalized, clips);
  if (url) {
    try {
      const audio = new Audio(url);
      activeAudio = audio;
      await audio.play();
      return true;
    } catch {
      if (id !== playbackId) return true;
      stopMalayAudio();
    }
  }
  return speakDevice(normalized);
}

function speakDevice(text) {
  const speech = window.speechSynthesis;
  if (!speech) return false;
  const voices = speech.getVoices();
  const voice = voices.find(voice => /^ms[-_]my$/i.test(voice.lang))
    ?? voices.find(voice => /^ms(?:[-_]|$)/i.test(voice.lang));
  if (!voice) return false;
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = voice.lang;
  utterance.voice = voice;
  speech.speak(utterance);
  return true;
}
