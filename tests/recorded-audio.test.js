import { afterEach, expect, test, vi } from 'vitest';

afterEach(() => {
  vi.unstubAllGlobals();
  vi.resetModules();
});

function mockPlayer(data, play = vi.fn().mockResolvedValue(undefined)) {
  const speechSynthesis = { cancel: vi.fn(), getVoices: () => [{ lang: 'ms-MY' }], speak: vi.fn() };
  const audio = vi.fn(function (url) {
    this.src = url;
    this.play = play;
    this.pause = vi.fn();
    this.removeAttribute = vi.fn();
    this.load = vi.fn();
  });
  vi.stubGlobal('window', { speechSynthesis });
  vi.stubGlobal('Audio', audio);
  vi.stubGlobal('SpeechSynthesisUtterance', class { constructor(text) { this.text = text; } });
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => data }));
  return { audio, speechSynthesis };
}

test('plays an uploaded or reused recording before device speech', async () => {
  const { audio, speechSynthesis } = mockPlayer({
    lang: 'ms', f: ['23a03223'], m: [], shared: { f: { madu: 'audio/ms/f/4890bea8.mp3' } },
  });
  const { preloadMalayAudio, speakMalay, stopMalayAudio } = await import('../src/lib/speak.js');
  await preloadMalayAudio();
  expect(await speakMalay(' selamat   pagi ')).toBe(true);
  expect(audio.mock.calls[0][0]).toMatch(/kata-kita\/audio\/ms\/f\/23a03223\.mp3$/);
  expect(await speakMalay('madu')).toBe(true);
  expect(audio.mock.calls[1][0]).toMatch(/vocabulary-assets\/audio\/ms\/f\/4890bea8\.mp3$/);
  expect(speechSynthesis.speak).not.toHaveBeenCalled();
  stopMalayAudio();
  expect(audio.mock.instances[1].pause).toHaveBeenCalled();
});

test('falls back to a Malay device voice if a recording cannot play', async () => {
  const { speechSynthesis } = mockPlayer({ lang: 'ms', f: ['23a03223'] }, vi.fn().mockRejectedValue(new Error()));
  const { speakMalay } = await import('../src/lib/speak.js');
  expect(await speakMalay('selamat pagi')).toBe(true);
  expect(speechSynthesis.speak).toHaveBeenCalledWith(expect.objectContaining({ lang: 'ms-MY', text: 'selamat pagi' }));
});
