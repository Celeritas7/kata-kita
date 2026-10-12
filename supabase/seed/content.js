// Sample content, lifted from the prototype's constants (Kata Kita.html).
// `npm run seed:build` turns this into supabase/seed/seed.sql; demo mode reads it directly.
// parts / FORMS kinds: pre|root|suf, or p|r|s shorthand.

const TOPICS = [
  { id: 'all', name: 'Semua · All' }, { id: 'salam', name: 'Salam' }, { id: 'makan', name: 'Makan' },
  { id: 'jalan', name: 'Jalan' }, { id: 'wang', name: 'Wang' }, { id: 'pasar', name: 'Cakap pasar' },
];

const WORDS = [
  { id: 1, t: 'salam', ms: 'selamat pagi', en: 'good morning', syl: 'se·la·mat pa·gi', jawi: 'سلامت ڤاݢي', ex: 'Selamat pagi, cikgu!', exEn: 'Good morning, teacher!' },
  { id: 2, t: 'salam', ms: 'apa khabar', en: 'how are you?', syl: 'a·pa kha·bar', jawi: 'اڤ خبر', ex: 'Apa khabar? — Khabar baik.', exEn: 'How are you? — I’m well.' },
  { id: 3, t: 'salam', ms: 'terima kasih', en: 'thank you', syl: 'te·ri·ma ka·sih', jawi: 'تريما کاسيه', ex: 'Terima kasih banyak!', exEn: 'Thank you very much!' },
  { id: 4, t: 'salam', ms: 'belajar', en: 'to study', syl: 'be·la·jar', parts: [['bel', 'pre'], ['ajar', 'root']], jawi: 'بلاجر', ex: 'Saya belajar bahasa Melayu.', exEn: 'I’m learning Malay.' },
  { id: 5, t: 'salam', ms: 'tidak', en: 'no, not', syl: 'ti·dak', jawi: 'تيدق', ex: 'Saya tidak faham.', exEn: 'I don’t understand.', tag: 'spoken: tak' },
  { id: 6, t: 'makan', ms: 'makanan', en: 'food', syl: 'ma·ka·nan', parts: [['makan', 'root'], ['an', 'suf']], jawi: 'ماکنن', ex: 'Makanan di sini sedap.', exEn: 'The food here is delicious.' },
  { id: 7, t: 'makan', ms: 'sedap', en: 'delicious', syl: 'se·dap', jawi: 'سدڤ', ex: 'Wah, sedapnya!', exEn: 'Wow, so tasty!' },
  { id: 8, t: 'makan', ms: 'pedas', en: 'spicy', syl: 'pe·das', jawi: 'ڤدس', ex: 'Kurang pedas, ya.', exEn: 'Less spicy, please.' },
  { id: 9, t: 'makan', ms: 'bungkus', en: 'take away', syl: 'bung·kus', jawi: 'بوڠکوس', ex: 'Makan sini atau bungkus?', exEn: 'Eat here or take away?', tag: 'lit. wrap' },
  { id: 10, t: 'makan', ms: 'minuman', en: 'drink', syl: 'mi·nu·man', parts: [['minum', 'root'], ['an', 'suf']], jawi: 'مينومن', ex: 'Minuman apa yang ada?', exEn: 'What drinks are there?' },
  { id: 11, t: 'jalan', ms: 'perjalanan', en: 'journey', syl: 'per·ja·la·nan', parts: [['per', 'pre'], ['jalan', 'root'], ['an', 'suf']], jawi: 'ڤرجالنن', ex: 'Selamat dalam perjalanan!', exEn: 'Have a safe trip!' },
  { id: 12, t: 'jalan', ms: 'di mana', en: 'where', syl: 'di ma·na', jawi: 'دمان', ex: 'Tandas di mana?', exEn: 'Where’s the toilet?' },
  { id: 13, t: 'jalan', ms: 'berhenti', en: 'to stop', syl: 'ber·hen·ti', parts: [['ber', 'pre'], ['henti', 'root']], jawi: 'برهنتي', ex: 'Tolong berhenti di sini.', exEn: 'Please stop here.' },
  { id: 14, t: 'jalan', ms: 'kiri', en: 'left', syl: 'ki·ri', jawi: 'کيري', ex: 'Belok kiri di simpang.', exEn: 'Turn left at the junction.' },
  { id: 15, t: 'wang', ms: 'berapa', en: 'how much', syl: 'be·ra·pa', jawi: 'براڤ', ex: 'Berapa harga ini?', exEn: 'How much is this?' },
  { id: 16, t: 'wang', ms: 'murah', en: 'cheap', syl: 'mu·rah', jawi: 'موره', ex: 'Boleh murah sikit?', exEn: 'A little cheaper?' },
  { id: 17, t: 'wang', ms: 'membeli', en: 'to buy', syl: 'mem·be·li', parts: [['mem', 'pre'], ['beli', 'root']], jawi: 'ممبلي', ex: 'Saya mahu membeli buah.', exEn: 'I want to buy fruit.' },
  { id: 18, t: 'pasar', ms: 'jom', en: 'let’s go', syl: 'jom', jawi: 'جوم', ex: 'Jom pergi mamak!', exEn: 'Let’s go to the mamak!', tag: 'informal' },
  { id: 19, t: 'pasar', ms: 'tak apa', en: 'never mind', syl: 'tak a·pa', jawi: 'تق اڤ', ex: 'Tak apa, lain kali.', exEn: 'No worries, next time.', tag: 'informal' },
  { id: 20, t: 'pasar', ms: 'alamak', en: 'oh no!', syl: 'a·la·mak', jawi: 'الامق', ex: 'Alamak, hujan!', exEn: 'Oh no, it’s raining!', tag: 'slang' },
];

const PERIBAHASA = [
  { ms: 'Sedikit-sedikit, lama-lama jadi bukit.', lit: 'Little by little, in time it becomes a hill.', use: 'Ten words a day adds up', key: 'bukit = hill' },
  { ms: 'Di mana bumi dipijak, di situ langit dijunjung.', lit: 'Where you tread the earth, there you hold up the sky.', use: 'Respect local customs', key: 'dipijak = is stepped on' },
  { ms: 'Bagai aur dengan tebing.', lit: 'Like bamboo and the riverbank.', use: 'Two who hold each other up', key: 'tebing = riverbank' },
  { ms: 'Air dicincang tidak akan putus.', lit: 'Chopped water never breaks apart.', use: 'Family ties survive quarrels', key: 'dicincang = is chopped' },
];

const STOPS = [
  { n: 1, town: 'Kuala Lumpur', unit: 'Salam & kenalan', en: 'Greetings', x: 92, y: 560 },
  { n: 2, town: 'Melaka', unit: 'Nombor & wang', en: 'Numbers & money', x: 250, y: 470 },
  { n: 3, town: 'Pulau Pinang', unit: 'Di kedai mamak', en: 'Ordering food', x: 110, y: 365 },
  { n: 4, town: 'Ipoh', unit: 'Arah & bas', en: 'Directions & buses', x: 255, y: 262 },
  { n: 5, town: 'Kota Bharu', unit: 'Imbuhan meN-', en: 'The meN- prefix', x: 120, y: 160 },
  { n: 6, town: 'Kuching', unit: 'Cakap pasar', en: 'Street speech', x: 262, y: 66 },
];

// Stop 3's step titles; other stops use generic titles until their content is written.
const STOP_STEPS = [
  ['Dengar', 'Listen: an order at a mamak stall'],
  ['Kata', '10 words · swipe deck'],
  ['Main peranan', 'Role-play: you order'],
  ['Cabaran', 'Checkpoint: 5 questions'],
];

const ROOTS = { ajar: 'teach', makan: 'eat', jalan: 'road · walk', beli: 'buy', tulis: 'write' };

// key "pre|root|suf" → [surface parts, meaning, rule]
const FORMS = {
  '|ajar|': [[['ajar', 'r']], 'teach (root)', 'Rarely used alone. Add an affix to make a word.'],
  'ber|ajar|': [[['bel', 'p'], ['ajar', 'r']], 'to study', 'ber- becomes bel- before “ajar”. It’s the one famous exception.'],
  'meN|ajar|': [[['meng', 'p'], ['ajar', 'r']], 'to teach', 'meN- becomes meng- before a vowel.'],
  'meN|ajar|kan': [[['meng', 'p'], ['ajar', 'r'], ['kan', 's']], 'to teach (a subject)', '-kan points at the thing being taught.'],
  'di|ajar|': [[['di', 'p'], ['ajar', 'r']], 'is taught', 'di- makes it passive. It never changes the root.'],
  'di|ajar|kan': [[['di', 'p'], ['ajar', 'r'], ['kan', 's']], 'is taught (a subject)', 'Passive of mengajarkan.'],
  'peN|ajar|': [[['peng', 'p'], ['ajar', 'r']], 'instructor', 'peN- = the doer. Compare pelajar, “student”, built like belajar.'],
  'peN|ajar|an': [[['pel', 'p'], ['ajar', 'r'], ['an', 's']], 'lesson', 'pe-…-an makes the result. Pengajaran is “the act of teaching”.'],
  '|ajar|an': [[['ajar', 'r'], ['an', 's']], 'teaching, doctrine', '-an turns the action into a thing.'],
  '|makan|': [[['makan', 'r']], 'to eat', 'Everyday verb, no affix needed.'],
  'meN|makan|': [[['me', 'p'], ['makan', 'r']], 'to eat (something)', 'meN- becomes me- before m. Sounds formal.'],
  'di|makan|': [[['di', 'p'], ['makan', 'r']], 'is eaten', 'di- passive.'],
  'ter|makan|': [[['ter', 'p'], ['makan', 'r']], 'eaten by accident', 'ter- = it happened without meaning to.'],
  'peN|makan|': [[['pe', 'p'], ['makan', 'r']], 'eater', 'pemakan sayur = vegetarian.'],
  '|makan|an': [[['makan', 'r'], ['an', 's']], 'food', '-an: the thing you eat.'],
  'peN|makan|an': [[['pe', 'p'], ['makan', 'r'], ['an', 's']], 'nutrition, diet', 'pe-…-an: the whole system around eating.'],
  '|jalan|': [[['jalan', 'r']], 'road; to walk', 'Works alone in speech: “Jalan dulu!” (I’m off!).'],
  'ber|jalan|': [[['ber', 'p'], ['jalan', 'r']], 'to walk', 'ber- = doing it, no object.'],
  'meN|jalan|kan': [[['men', 'p'], ['jalan', 'r'], ['kan', 's']], 'to carry out, run', 'meN- becomes men- before j. -kan = make it go.'],
  'meN|jalan|i': [[['men', 'p'], ['jalan', 'r'], ['i', 's']], 'to undergo', '-i points at where/what you go through: menjalani latihan.'],
  'di|jalan|kan': [[['di', 'p'], ['jalan', 'r'], ['kan', 's']], 'is carried out', 'Passive of menjalankan.'],
  'peN|jalan|': [[['pe', 'p'], ['jalan', 'r']], 'walker', 'pejalan kaki = pedestrian.'],
  'per|jalan|an': [[['per', 'p'], ['jalan', 'r'], ['an', 's']], 'journey', 'per-…-an: the process. Selamat dalam perjalanan!'],
  '|jalan|an': [[['jalan', 'r'], ['an', 's']], 'the streets', 'makanan jalanan = street food.'],
  '|beli|': [[['beli', 'r']], 'buy (casual)', 'Fine in speech: “Nak beli apa?”'],
  'meN|beli|': [[['mem', 'p'], ['beli', 'r']], 'to buy', 'meN- becomes mem- before b.'],
  'meN|beli|kan': [[['mem', 'p'], ['beli', 'r'], ['kan', 's']], 'to buy for someone', '-kan = for the benefit of someone.'],
  'di|beli|': [[['di', 'p'], ['beli', 'r']], 'is bought', 'di- passive.'],
  'ter|beli|': [[['ter', 'p'], ['beli', 'r']], 'bought by mistake', 'ter- = unintended.'],
  'peN|beli|': [[['pem', 'p'], ['beli', 'r']], 'buyer', 'peN- becomes pem- before b, same as meN-.'],
  'peN|beli|an': [[['pem', 'p'], ['beli', 'r'], ['an', 's']], 'a purchase', 'pe-…-an: the act or result.'],
  '|beli|an': [[['beli', 'r'], ['an', 's']], 'item bought', 'Less common than pembelian.'],
  '|tulis|': [[['tulis', 'r']], 'write (root)', 'Usually takes an affix.'],
  'meN|tulis|': [[['me', 'p'], ['nulis', 'r']], 'to write', 'meN- + t → men-, and the t drops: menulis.'],
  'meN|tulis|kan': [[['me', 'p'], ['nulis', 'r'], ['kan', 's']], 'to write down', 'Same t-drop, plus -kan for the thing written.'],
  'di|tulis|': [[['di', 'p'], ['tulis', 'r']], 'is written', 'di- keeps the t.'],
  'ter|tulis|': [[['ter', 'p'], ['tulis', 'r']], 'in writing', 'ujian bertulis = written exam. tertulis = stated in writing.'],
  'peN|tulis|': [[['pe', 'p'], ['nulis', 'r']], 'writer', 'The t drops here too.'],
  'peN|tulis|an': [[['pe', 'p'], ['nulis', 'r'], ['an', 's']], 'the writing process', 'pe-…-an.'],
  '|tulis|an': [[['tulis', 'r'], ['an', 's']], 'writing, script', 'tulisan Jawi = Jawi script.'],
};

// Gerai Mamak role-play (stop 3)
const MAMAK = [
  { them: 'Nak makan apa, bang?', them_en: 'What would you like, bro?',
    replies: [['Nasi lemak satu.', true, 'Perfect. Item + number is all you need.'], ['Saya nasi lemak.', false, '“I am nasi lemak”. Funny, but drop the saya.'], ['Berapa nasi lemak?', false, 'That asks how much it costs. Order first.']] },
  { them: 'Minum?', them_en: 'Something to drink?',
    replies: [['Teh tarik kurang manis.', true, 'kurang manis = less sweet. Very Malaysian.'], ['Minum teh tarik saya.', false, 'Word order is off. Just name the drink.'], ['Tidak minum manis.', false, 'Understandable, but “kurang manis” is how people say it.']] },
  { them: 'Makan sini ke bungkus?', them_en: 'Eat here or take away?',
    replies: [['Bungkus.', true, 'One word does it.'], ['Makan bungkus.', false, '“Eat take-away” mixes both answers.'], ['Sini bungkus.', false, 'Pick one: sini or bungkus.']] },
  { them: 'Tujuh ringgit lima puluh sen.', them_en: 'RM7.50.',
    replies: [['Terima kasih, bang!', true, 'Bagus! Order complete.'], ['Sama-sama.', false, 'That’s “you’re welcome”. He hasn’t thanked you yet.'], ['Tidak apa.', false, 'That means “never mind”. Pay and say thanks.']] },
];

// Dengar + Cabaran for stop 3 (new; not in the prototype). Affix answers use the FORMS key.
const QUESTIONS = [
  { unit: 3, step: 'dengar', kind: 'listen', prompt_ms: 'Apa yang dipesan?', prompt_en: 'What did they order?',
    audio_text: 'Nasi lemak satu, teh tarik kurang manis.',
    options: ['Nasi lemak satu, teh tarik kurang manis', 'Nasi lemak dua, teh tarik manis', 'Nasi goreng satu, teh o kurang manis'],
    answer: 'Nasi lemak satu, teh tarik kurang manis' },
  { unit: 3, step: 'dengar', kind: 'listen', prompt_ms: 'Apa soalannya?', prompt_en: 'What is the waiter asking?',
    audio_text: 'Makan sini ke bungkus?',
    options: ['Eat here or take away?', 'How much is it?', 'Anything to drink?'], answer: 'Eat here or take away?' },
  { unit: 3, step: 'dengar', kind: 'listen', prompt_ms: 'Berapa harganya?', prompt_en: 'How much is it?',
    audio_text: 'Tujuh ringgit lima puluh sen.',
    options: ['RM7.50', 'RM5.70', 'RM17.50'], answer: 'RM7.50' },

  { unit: 3, step: 'cabaran', kind: 'mcq', prompt_ms: 'bungkus', prompt_en: 'Choose the meaning',
    options: ['take away', 'delicious', 'spicy', 'drink'], answer: 'take away' },
  { unit: 3, step: 'cabaran', kind: 'type', prompt_en: 'Less sweet, please.',
    answer: 'kurang manis', alt: ['kurang manis ya', 'kurang manis, ya'] },
  { unit: 3, step: 'cabaran', kind: 'affix', prompt_en: 'a purchase', affix_root: 'beli', answer: 'peN|beli|an' },
  { unit: 3, step: 'cabaran', kind: 'listen', prompt_ms: 'Dengar & pilih', prompt_en: 'Listen and pick',
    audio_text: 'Teh tarik satu.', options: ['Teh tarik satu', 'Teh tarik dua', 'Teh o satu'], answer: 'Teh tarik satu' },
  { unit: 3, step: 'cabaran', kind: 'type', prompt_en: 'Eat here.', answer: 'makan sini' },
];

export default { TOPICS, WORDS, PERIBAHASA, STOPS, STOP_STEPS, ROOTS, FORMS, MAMAK, QUESTIONS };
