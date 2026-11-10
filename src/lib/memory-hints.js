const KEY = 'kk.hintLanguages';
const KNOWN_KEY = 'kk.knownHintWords';

export const HINT_LANGUAGES = [
  { id: 'sa', name: 'Sanskrit', defaultMode: 'familiar' },
  { id: 'ta', name: 'Tamil', defaultMode: 'familiar' },
  { id: 'id', name: 'Indonesian', defaultMode: 'reference' },
];

export const HINT_MODES = [
  ['familiar', 'Familiar'],
  ['reference', 'Reference'],
  ['off', 'Off'],
];

const VALID_MODES = new Set(HINT_MODES.map(([mode]) => mode));
const SANSKRIT_SOURCE = 'https://jml.um.edu.my/index.php/JOMAS/article/view/36432';
const TAMIL_SOURCE = 'https://brill.com/display/book/9789004529458/BP000002.pdf';
const TAMIL_SHOP_SOURCE = 'https://journals.openedition.org/archipel/pdf/490';

const sanskrit = (word, roman, note, source = SANSKRIT_SOURCE) =>
  ({ lang: 'sa', word, roman, note, kind: 'Sanskrit origin', source });
const tamil = (word, roman, note, source = TAMIL_SOURCE) => ({ lang: 'ta', word, roman, note, kind: 'Tamil connection', source });
const indonesian = (word, note, kind = 'Same or similar form') => ({ lang: 'id', word, note, kind });

// Match by Malay spelling so the hints also work with existing hosted vocabulary.
const HINTS = new Map(Object.entries({
  'selamat pagi': [indonesian('selamat pagi', 'The same morning greeting is used in Indonesian.')],
  'apa khabar': [indonesian('apa kabar', 'Same greeting. Indonesian writes kabar without the h.')],
  'terima kasih': [indonesian('terima kasih', 'The same phrase means “thank you”.')],
  belajar: [indonesian('belajar', 'Both languages use belajar for studying or learning.')],
  tidak: [indonesian('tidak', 'Both languages use tidak to negate verbs and adjectives.')],
  makanan: [indonesian('makanan', 'Both form “food” from makan (eat) + -an.')],
  pedas: [indonesian('pedas', 'The same word describes spicy food.')],
  bungkus: [indonesian('bungkus', 'Think of wrapping or packing something, including food to take away.')],
  minuman: [indonesian('minuman', 'Both form “drink” from minum (drink) + -an.')],
  perjalanan: [indonesian('perjalanan', 'Both use this form for a journey, from jalan.')],
  'di mana': [indonesian('di mana', 'The same two words ask “where?”.')],
  berhenti: [indonesian('berhenti', 'Both languages use this form for stopping.')],
  kiri: [indonesian('kiri', 'The same word means “left”.')],
  berapa: [indonesian('berapa', 'The same question word asks how much or how many.')],
  murah: [indonesian('murah', 'The same word means “cheap” or “inexpensive”.')],
  membeli: [indonesian('membeli', 'Both languages use membeli for “to buy”.')],
  jom: [indonesian('ayo', 'A common Indonesian equivalent. Learn jom for informal Malaysian Malay.', 'Different form')],
  catur: [
    sanskrit('चतुर्', 'catur', 'The Sanskrit form means “four”. Use that as a cue for chess in Malay.'),
    indonesian('catur', 'The same word means “chess”.'),
  ],
  madu: [
    sanskrit('मधु', 'madhu', 'Think of madhu, “honey”. Malay keeps the meaning and drops the h.'),
    indonesian('madu', 'The same word means “honey”.'),
  ],
  kedai: [
    tamil('கடை', 'kaṭai', 'Both words mean “shop”. Notice the similar sound.', TAMIL_SHOP_SOURCE),
    indonesian('kedai', 'Also means “shop” or “stall” in Indonesian.'),
  ],
  kapal: [
    tamil('கப்பல்', 'kappal', 'Both words mean “ship”. The Tamil form has a double p.'),
    indonesian('kapal', 'The same word means “ship”.'),
  ],
  katil: [
    tamil('கட்டில்', 'kaṭṭil', 'Think of the similar Tamil word for a cot or bedstead.'),
  ],
  contoh: [
    tamil('சௌத்து', 'cauttu', 'The recorded Tamil form means “pattern” or “sample”.'),
    indonesian('contoh', 'The same word means “example”.'),
  ],
  gajah: [
    sanskrit('गज', 'gaja', 'Both words mean “elephant”. Malay adds a final h.', TAMIL_SOURCE),
    indonesian('gajah', 'The same word means “elephant”.'),
  ],
  muka: [
    sanskrit('मुख', 'mukha', 'One Sanskrit sense is “face”, as in Malay muka.', TAMIL_SOURCE),
    indonesian('muka', 'Both languages use muka for “face”.'),
  ],
  raja: [
    sanskrit('राजा', 'rājā', 'The Sanskrit form and Malay raja both mean “king”.', 'https://sealang.net/archives/nusa/pdf/nusa-v19-p1-38.pdf'),
    indonesian('raja', 'The same word means “king”.'),
  ],
  percuma: [
    indonesian('percuma / gratis', 'For “free of charge”, use percuma in Malay and gratis in Indonesian. Indonesian percuma usually means “in vain”. Malay can also use percuma in that sense.', 'Usage difference'),
  ],
}));

export function getHintModes() {
  let saved;
  try { saved = JSON.parse(localStorage.getItem(KEY)); } catch { /* use defaults */ }
  return Object.fromEntries(HINT_LANGUAGES.map(({ id, defaultMode }) => [
    id, VALID_MODES.has(saved?.[id]) ? saved[id] : defaultMode,
  ]));
}

export function setHintMode(id, mode) {
  if (!HINT_LANGUAGES.some(language => language.id === id) || !VALID_MODES.has(mode)) return;
  localStorage.setItem(KEY, JSON.stringify({ ...getHintModes(), [id]: mode }));
}

function knownHintWords() {
  try {
    const words = JSON.parse(localStorage.getItem(KNOWN_KEY));
    return new Set(Array.isArray(words) ? words : []);
  } catch { return new Set(); }
}

export function setKnownHintWord(key, known) {
  const words = knownHintWords();
  if (known) words.add(key);
  else words.delete(key);
  localStorage.setItem(KNOWN_KEY, JSON.stringify([...words]));
}

export function hintsFor(word, modes = getHintModes(), knownWords = knownHintWords()) {
  const hints = HINTS.get(word.trim().toLowerCase()) ?? [];
  return ['familiar', 'reference'].flatMap(mode => hints.filter(hint => modes[hint.lang] === mode)
    .map(hint => {
      const key = `${hint.lang}:${hint.word}`;
      return { ...hint, mode, key, known: knownWords.has(key) };
    })).sort((a, b) => Number(b.known) - Number(a.known));
}
