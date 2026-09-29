import { getPartOptions, renderCharacterSVG } from './assets/oc-english/character.js';
import { wardrobeThumb } from './assets/oc-english/wardrobe.js';
import { OC_WARDROBE } from './assets/oc-english/wardrobe-data.js';
import { ACHIEVEMENT_DEFINITIONS, unlockAchievementIds } from './features/achievements.js';
import { createStorage } from './features/storage.js';
import { themeNeedsReview as isThemeReviewDue, recommendedThemeId as getRecommendedThemeId, dailyRouteThemeIds } from './features/map-route.js';

const CHILD_NAME = '荆宝';
let deferredInstallPrompt = null;
const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
const { getText: storageGet, load, save, saveText } = createStorage(() => showToast?.('这台设备暂时无法保存学习记录。'));
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
let globalSpeechRate = clamp(Number(storageGet('luna-global-speech-rate') || 1), .5, 1.5);

let THEMES = {
  color: { id: 'color', title: '色彩魔法', subtitle: '颜色魔法', words: ['red', 'yellow', 'blue'], rewards: ['hat_crown', 'top_dress', 'bottom_tutu', 'shoes_glass', 'back_wings'],
    rounds: [
      { type: 'learn', chip: '认识单词', word: 'red', image: 'assets/vocabulary/red.svg', zh: '看一看，这是 red。' },
      { type: 'learn', chip: '认识单词', word: 'yellow', image: 'assets/vocabulary/yellow.svg', zh: '看一看，这是 yellow。' },
      { type: 'learn', chip: '认识单词', word: 'blue', image: 'assets/vocabulary/blue.svg', zh: '看一看，这是 blue。' },
    ],
    reviewRounds: [
      { type: 'match', chip: '魔法复习', prompt: 'Which word matches?', word: 'red', image: 'assets/vocabulary/red.svg', zh: '看图片，选出对应的英文单词。', choices: ['red', 'blue'], correct: 'red' },
      { type: 'listen', chip: '听音找一找', prompt: 'Find yellow!', word: 'yellow', image: 'assets/vocabulary/yellow.svg', zh: '听一听，找到对应的图片。', choices: ['yellow', 'red'], correct: 'yellow' },
      { type: 'match', chip: '魔法复习', prompt: 'Which word matches?', word: 'blue', image: 'assets/vocabulary/blue.svg', zh: '看图片，选出对应的英文单词。', choices: ['yellow', 'blue'], correct: 'blue' },
    ],
  },
  animal: { id: 'animal', title: '动物花园', subtitle: '动物花园', words: ['cat', 'dog', 'rabbit'], rewards: ['hat_straw', 'held_bear', 'back_butterfly', 'shoes_sandal'],
    rounds: [
      { type: 'learn', chip: '认识单词', word: 'cat', image: 'assets/vocabulary/cat.svg', zh: '看一看，这是 cat。' },
      { type: 'learn', chip: '认识单词', word: 'dog', image: 'assets/vocabulary/dog.svg', zh: '看一看，这是 dog。' },
      { type: 'learn', chip: '认识单词', word: 'rabbit', image: 'assets/vocabulary/rabbit.svg', zh: '看一看，这是 rabbit。' },
    ],
    reviewRounds: [
      { type: 'match', chip: '魔法复习', prompt: 'Which word matches?', word: 'cat', image: 'assets/vocabulary/cat.svg', zh: '看图片，选出对应的英文单词。', choices: ['cat', 'dog'], correct: 'cat' },
      { type: 'listen', chip: '听音找一找', prompt: 'Find dog!', word: 'dog', image: 'assets/vocabulary/dog.svg', zh: '听一听，找到对应的图片。', choices: ['rabbit', 'dog'], correct: 'dog' },
      { type: 'match', chip: '魔法复习', prompt: 'Which word matches?', word: 'rabbit', image: 'assets/vocabulary/rabbit.svg', zh: '看图片，选出对应的英文单词。', choices: ['cat', 'rabbit'], correct: 'rabbit' },
    ],
  },
  action: { id: 'action', title: '朗诵小舞台', subtitle: '朗诵小舞台', words: ['春晓', '登鹳雀楼', '静夜思'], rewards: ['hat_cap', 'top_sport', 'bottom_shorts', 'shoes_sport', 'held_balloon'],
    rounds: [
      { type: 'recite', chip: '跟读朗诵', word: '春晓', text: '春眠不觉晓，处处闻啼鸟。', zh: '先听一听，再把这一句朗读出来。' },
      { type: 'recite', chip: '跟读朗诵', word: '登鹳雀楼', text: '白日依山尽，黄河入海流。', zh: '读得慢一点，让每个字都清楚。' },
      { type: 'recite', chip: '跟读朗诵', word: '静夜思', text: '床前明月光，疑是地上霜。', zh: '试着用好听的声音完整读一遍。' },
    ],
    reviewRounds: [
      { type: 'recite', chip: '朗诵回顾', word: '春晓', text: '春眠不觉晓，处处闻啼鸟。', zh: '再读一次，听听自己的节奏。' },
      { type: 'recite', chip: '朗诵回顾', word: '登鹳雀楼', text: '白日依山尽，黄河入海流。', zh: '再读一次，注意停顿。' },
      { type: 'recite', chip: '朗诵回顾', word: '静夜思', text: '床前明月光，疑是地上霜。', zh: '再读一次，把句子读完整。' },
    ],
  },
  number: { id: 'number', title: '数字魔法', subtitle: '数字魔法', words: ['one', 'two', 'three'], rewards: ['hat_wizard', 'gl_star', 'top_sailor', 'held_book'],
    rounds: [
      { type: 'learn', chip: '认识数字', word: 'one', image: 'assets/vocabulary/one.svg', zh: '看一看，这是 one，一颗星星。' },
      { type: 'learn', chip: '认识数字', word: 'two', image: 'assets/vocabulary/two.svg', zh: '看一看，这是 two，两朵花。' },
      { type: 'learn', chip: '认识数字', word: 'three', image: 'assets/vocabulary/three.svg', zh: '看一看，这是 three，三个气球。' },
    ],
    reviewRounds: [
      { type: 'match', chip: '魔法复习', prompt: 'Which word matches?', word: 'one', image: 'assets/vocabulary/one.svg', zh: '看数量，选出对应的英文单词。', choices: ['one', 'two'], correct: 'one' },
      { type: 'listen', chip: '听音找一找', prompt: 'Find two!', word: 'two', image: 'assets/vocabulary/two.svg', zh: '听一听，找到对应的数量图片。', choices: ['one', 'two'], correct: 'two' },
      { type: 'match', chip: '魔法复习', prompt: 'Which word matches?', word: 'three', image: 'assets/vocabulary/three.svg', zh: '看数量，选出对应的英文单词。', choices: ['two', 'three'], correct: 'three' },
      { type: 'action', chip: '数字动作', prompt: 'Clap three times!', word: 'three', image: 'assets/vocabulary/clap.svg', zh: '跟着露娜拍三下手，完成后点“我做完啦”。', actionLabel: '我做完啦' },
    ],
  },
};

const ADMIN_DEFAULT = {
  pin: '2468',
  // Default resource set derived from luna-learning-2026-09-29.json.
  english: ['red', 'green'],
  hanzi: ['人', '灶', '灶台', '面粉', '厨房', '小猫', '胡须', '入口', '兴高采烈', '白色'],
  englishGroups: [{ id: 'english-colors', name: '颜色单词', words: ['red', 'green'] }],
  hanziGroups: [
    { id: 'hanzi-kitchen', name: '厨房词汇', words: ['人', '灶', '灶台', '面粉', '厨房'] },
    { id: 'hanzi-life', name: '生活词语', words: ['小猫', '胡须', '入口', '兴高采烈', '白色'] },
  ],
  activeEnglishGroupId: 'english-colors',
  activeHanziGroupId: 'hanzi-kitchen',
  recitalPieces: [
    { id: 'recital-spring-dawn', title: '春晓', lines: ['春眠不觉晓，', '处处闻啼鸟。'] },
    { id: 'recital-tower', title: '登鹳雀楼', lines: ['白日依山尽，', '黄河入海流。'] },
  ],
  activeRecitalPieceId: 'recital-spring-dawn',
};
const adminContent = load('luna-admin-content-v1', ADMIN_DEFAULT);
function safeEnglishWords(value) { return String(value).split(/[，,；;\n]/).map((word) => word.trim().toLowerCase()).filter((word) => /^[a-z]{1,16}$/.test(word)).slice(0, 24); }
function safeHanzi(value) { return String(value).split(/[，,；;\n]/).map((term) => term.trim()).filter((term) => /^[\p{Script=Han}]{1,8}$/u.test(term)).slice(0, 24); }
function contentGroupKey(kind) { return `${kind}Groups`; }
function activeContentGroupKey(kind) { return `active${kind[0].toUpperCase()}${kind.slice(1)}GroupId`; }
function defaultContentWords(kind) { return kind === 'hanzi' ? ADMIN_DEFAULT.hanzi : ADMIN_DEFAULT.english; }
function normaliseContentWords(kind, words) { return kind === 'hanzi' ? safeHanzi(Array.isArray(words) ? words.join('，') : words) : safeEnglishWords(Array.isArray(words) ? words.join(',') : words); }
const editingContentGroupIds = { english: null, hanzi: null };
function contentGroups(kind) {
  const key = contentGroupKey(kind);
  const existing = Array.isArray(adminContent[key]) ? adminContent[key]
    .map((group, index) => ({ id: String(group?.id || `${kind}-${index + 1}`), name: typeof group?.name === 'string' ? group.name.trim().slice(0, 16) : `${kind === 'hanzi' ? '汉字' : '英文'}分组 ${index + 1}`, words: normaliseContentWords(kind, group?.words) })) : [];
  if (existing.length) { adminContent[key] = existing; return existing; }
  const legacy = normaliseContentWords(kind, adminContent[kind]);
  const fallback = legacy.length >= 2 ? legacy : defaultContentWords(kind);
  const initial = { id: `${kind}-basics`, name: kind === 'hanzi' ? '汉字启蒙' : '基础单词', words: fallback };
  adminContent[key] = [initial];
  return adminContent[key];
}
function activeContentGroup(kind) {
  const groups = contentGroups(kind); const key = activeContentGroupKey(kind);
  const valid = (group) => group.name && group.words.length >= 2;
  const active = groups.find((group) => group.id === adminContent[key] && valid(group)) || groups.find(valid) || groups[0];
  adminContent[key] = active.id;
  return active;
}
function editingContentGroup(kind) {
  const groups = contentGroups(kind); const editing = groups.find((group) => group.id === editingContentGroupIds[kind]);
  return editing || activeContentGroup(kind);
}
function saveContentConfiguration() { save('luna-admin-content-v1', adminContent); }
function normaliseRecitalLines(value) { return String(Array.isArray(value) ? value.join('\n') : value).split(/\n+/).map((line) => line.trim()).filter(Boolean).slice(0, 24); }
function recitalPieces() {
  const pieces = Array.isArray(adminContent.recitalPieces) ? adminContent.recitalPieces.map((piece, index) => ({ id: String(piece?.id || `recital-${index + 1}`), title: String(piece?.title || `朗诵第 ${index + 1} 篇`).trim().slice(0, 24), lines: normaliseRecitalLines(piece?.lines) })).filter((piece) => piece.title) : [];
  if (pieces.length) { adminContent.recitalPieces = pieces; return pieces; }
  adminContent.recitalPieces = ADMIN_DEFAULT.recitalPieces.map((piece) => ({ ...piece, lines: [...piece.lines] }));
  return adminContent.recitalPieces;
}
function activeRecitalPiece() { const pieces = recitalPieces(); const active = pieces.find((piece) => piece.id === adminContent.activeRecitalPieceId) || pieces[0]; adminContent.activeRecitalPieceId = active.id; return active; }
function buildRecitalTheme() {
  const piece = activeRecitalPiece(); const rounds = piece.lines.map((text, index) => ({ type: 'recite', chip: '逐行朗诵', word: `${piece.id}-${index + 1}`, title: piece.title, lineLabel: `第 ${index + 1} 句`, text, zh: '先听一听，再清楚地朗读这一句。' }));
  const reviewRounds = piece.lines.map((text, index) => ({ type: 'recite', chip: '逐行回顾', word: `${piece.id}-${index + 1}`, title: piece.title, lineLabel: `第 ${index + 1} 句`, text, zh: '再读一次，注意语速和停顿。' }));
  return { id: 'action', title: '朗诵小舞台', subtitle: piece.title, words: rounds.map((round) => round.word), rewards: ['hat_cap', 'top_sport', 'bottom_shorts', 'shoes_sport', 'held_balloon'], rounds, reviewRounds };
}
function textCard(text, fill = '#f1e8ff') { return `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 180"><rect width="240" height="180" rx="28" fill="${fill}"/><text x="120" y="108" text-anchor="middle" font-family="sans-serif" font-size="${text.length > 5 ? 42 : 72}" font-weight="800" fill="#6744a5">${text}</text></svg>`)}`; }
function buildCustomTheme(id, title, subtitle, words, isHanzi = false) {
  const fallback = isHanzi ? ['人', '大人', '人口'] : ['red', 'yellow', 'blue'];
  const list = words.length >= 2 ? words : fallback;
  const rounds = list.map((word) => ({ type: 'learn', chip: isHanzi ? (word.length > 1 ? '认识词组' : '认识汉字') : '认识单词', word, image: isHanzi ? textCard(word, '#fff0dc') : wordImage(word) || textCard(word), zh: isHanzi ? `看一看，读一读“${word}”。` : `看一看，这是 ${word}。` }));
  const reviewRounds = list.map((word, index) => { const other = list[(index + 1) % list.length]; return { type: index % 2 ? 'listen' : 'match', chip: index % 2 ? '听音找一找' : '魔法复习', prompt: isHanzi ? `Find ${word}` : 'Which word matches?', word, image: isHanzi ? textCard(word, '#fff0dc') : wordImage(word) || textCard(word), zh: isHanzi ? '听一听，找到对应的汉字或词组。' : '看图片，选出对应的英文单词。', choices: [word, other], correct: word }; });
  return { id, title, subtitle, words: list, rewards: ['hat_wizard', 'gl_star', 'held_book'], rounds, reviewRounds };
}
function installBundledLearningResources() {
  const version = Number(adminContent.bundledResourceVersion || 0);
  if (version >= 2) return;
  const appendMissingGroups = (kind, defaults) => {
    const key = contentGroupKey(kind);
    const existing = Array.isArray(adminContent[key]) ? adminContent[key] : [];
    defaults.forEach((group) => { if (!existing.some((item) => item?.id === group.id)) existing.push({ ...group, words: [...group.words] }); });
    adminContent[key] = existing;
  };
  appendMissingGroups('english', ADMIN_DEFAULT.englishGroups);
  appendMissingGroups('hanzi', ADMIN_DEFAULT.hanziGroups);
  adminContent.bundledResourceVersion = 2;
  save('luna-admin-content-v1', adminContent);
}
function applyAdminContent() {
  const english = activeContentGroup('english'); const hanzi = activeContentGroup('hanzi');
  THEMES.english = buildCustomTheme('english', '英文单词', english.name, english.words);
  THEMES.hanzi = buildCustomTheme('hanzi', '汉字魔法', hanzi.name, hanzi.words, true);
  THEMES.action = buildRecitalTheme();
}


const WORD_TRANSLATIONS = {
  red: '红色', green: '绿色', yellow: '黄色', blue: '蓝色',
  cat: '小猫', dog: '小狗', rabbit: '小兔子',
  jump: '跳一跳', clap: '拍拍手', dance: '跳舞',
  one: '一', two: '二', three: '三',
};
const HANZI_SCENES = {
  '大人': { label: '大人牵着小朋友', art: 'adult' }, '人口': { label: '小镇里的许多人', art: 'people' }, '小猫': { label: '花圃旁的小猫', art: 'cat' }, '太阳': { label: '天空中的太阳', art: 'sun' },
};
function hanziSceneMarkup(word) { const scene = HANZI_SCENES[word]; return scene ? `<div class="hanzi-scene scene-${scene.art}" aria-label="${scene.label}"><i></i><i></i><i></i><span>${scene.label}</span></div>` : ''; }
const WORD_SENTENCES = {
  red: { text: 'It is red.', zh: '它是红色的。' }, yellow: { text: 'It is yellow.', zh: '它是黄色的。' }, blue: { text: 'It is blue.', zh: '它是蓝色的。' },
  cat: { text: 'A little cat.', zh: '一只小猫。' }, dog: { text: 'A happy dog.', zh: '一只开心的小狗。' }, rabbit: { text: 'A little rabbit.', zh: '一只小兔子。' },
  jump: { text: 'I can jump!', zh: '我会跳！' }, clap: { text: 'Clap your hands!', zh: '拍拍手！' }, dance: { text: 'Let us dance!', zh: '我们一起跳舞！' },
  one: { text: 'One star.', zh: '一颗星星。' }, two: { text: 'Two flowers.', zh: '两朵花。' }, three: { text: 'Three balloons.', zh: '三个气球。' },
};
function wordImage(word) {
  return Object.values(THEMES).flatMap((theme) => theme.rounds).find((round) => round.word === word)?.image || '';
}
const MAP_META = {
  color: { name: '彩虹花园', hint: '找一找会发光的颜色', icon: 'flower' },
  animal: { name: '月光动物园', hint: '去和小动物打招呼', icon: 'paw' },
  action: { name: '朗诵小舞台', hint: '听一听，把文本读出来', icon: 'spark' },
  number: { name: '数字高塔', hint: '数一数城堡星星', icon: 'tower' },
  hanzi: { name: '汉字图书塔', hint: '打开会说话的文字', icon: 'book' },
  english: { name: '单词森林', hint: '收集新的英文叶片', icon: 'leaf' },
};
function mapIcon(type) {
  const paths = {
    flower: '<path d="M12 8.2C9 3.4 3.7 5.1 5.3 9.7c-4.7.4-4.7 6.1 0 6.5C3.7 20.9 9 22.6 12 17.8c3 4.8 8.3 3.1 6.7-1.6 4.7-.4 4.7-6.1 0-6.5C20.3 5.1 15 3.4 12 8.2Z"/><circle cx="12" cy="13" r="2.3"/>',
    paw: '<circle cx="7.2" cy="7.8" r="1.8"/><circle cx="12" cy="5.8" r="1.8"/><circle cx="16.8" cy="7.8" r="1.8"/><path d="M12 20c-3.5 0-6-2.1-6-4.7 0-2.2 2.2-4 4.2-3.1.7.3 1.2.3 1.8 0 2-.9 4.2.9 4.2 3.1C18 17.9 15.5 20 12 20Z"/>',
    spark: '<path d="m12 3 1.9 6.1L20 11l-6.1 1.9L12 19l-1.9-6.1L4 11l6.1-1.9L12 3Z"/>',
    tower: '<path d="M5 21h14M7 21V9l5-5 5 5v12M4 9h3M17 9h3M10 21v-5h4v5M10 11h4"/>',
    book: '<path d="M4.5 5.5A3.5 3.5 0 0 1 8 2h4v18H8a3.5 3.5 0 0 0-3.5 3V5.5ZM19.5 5.5A3.5 3.5 0 0 0 16 2h-4v18h4a3.5 3.5 0 0 1 3.5 3V5.5Z"/>',
    leaf: '<path d="M20 4C10 4 5 8.5 5 15c0 2.8 1.8 5 4.6 5C16 20 20 11.7 20 4Z"/><path d="M5 20c2.7-4.8 6.4-8 11-10"/>',
  };
  return `<svg viewBox="0 0 24 24" aria-hidden="true">${paths[type] || paths.spark}</svg>`;
}
installBundledLearningResources();
applyAdminContent();

const OC_CATEGORY_META = [
  { id: 'hair', label: '发型', slot: null }, { id: 'hat', label: '帽子', slot: 'hat' },
  { id: 'glasses', label: '眼镜', slot: 'glasses' }, { id: 'top', label: '上衣', slot: 'top' },
  { id: 'bottom', label: '下装', slot: 'bottom' }, { id: 'shoes', label: '鞋子', slot: 'shoes' },
  { id: 'held', label: '手持', slot: 'held' }, { id: 'back', label: '背饰', slot: 'back' },
  { id: 'earring', label: '耳饰', slot: 'earring' },
];
const OC_PART_OPTIONS = getPartOptions();
function wardrobeIcon(category) {
  const paths = {
    hair: '<path d="M5 11c0-5 3-8 7-8s7 3 7 8v5H5z"/><path d="M7 11c1 2 2 3 2 6m6-6c-1 2-2 3-2 6"/>',
    hat: '<path d="M7 11V8a5 5 0 0 1 10 0v3"/><path d="M4 12h16l-2 4H6z"/>',
    glasses: '<circle cx="8" cy="12" r="4"/><circle cx="16" cy="12" r="4"/><path d="M12 12h0M4 10l-2-1m18 1 2-1"/>',
    top: '<path d="m8 5 4 3 4-3 4 4-3 3v7H7v-7L4 9z"/>',
    bottom: '<path d="M7 4h10l-1 15h-3l-1-7-1 7H8z"/>',
    shoes: '<path d="M5 15h7l2-4 3 4c2 0 3 1 3 3H5z"/>',
    held: '<path d="M12 21V9"/><path d="m12 12-4-4m4 1 4-4"/><circle cx="8" cy="7" r="2"/><circle cx="16" cy="5" r="2"/>',
    back: '<path d="M12 20V8"/><path d="M11 11C7 5 3 7 5 12c1 3 4 4 6 4M13 11c4-6 8-4 6 1-1 3-4 4-6 4"/>',
    earring: '<path d="M12 4v5"/><circle cx="12" cy="15" r="4"/><circle cx="12" cy="4" r="1"/>',
  };
  return `<svg viewBox="0 0 24 24" aria-hidden="true">${paths[category] || paths.hat}</svg>`;
}
const starterAvatar = { skin: 0, hair: 3, hairColor: 3, eyes: 0, eyeColor: 2, mouth: 0, showBlush: true, outfit: { hat: '', glasses: '', top: 'top_starter', bottom: 'bottom_starter', shoes: 'shoes_starter', held: 'held_flower', back: '', earring: '' } };
const cloneStarterAvatar = () => JSON.parse(JSON.stringify(starterAvatar));

function freshDaily() { return { round: false, theme: false, dress: false, claimed: false }; }
function localDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
function createProfile(name = CHILD_NAME) {
  return {
    id: `profile-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name: name.trim() || CHILD_NAME,
    createdAt: new Date().toISOString(),
    activeTheme: 'color',
    completedThemes: [],
    learnedWords: [],
    wordProgress: {},
    stars: 0,
    dailyDate: localDateKey(),
    daily: freshDaily(),
    streak: { count: 0, lastCompletedDate: '' },
    recordingEnabled: false,
    world: {}, achievements: [], study: { date: localDateKey(), seconds: 0, limitMinutes: 5, backupAt: '' },
    ocOwned: ['top_starter', 'bottom_starter', 'shoes_starter', 'held_flower'],
    ocAvatar: cloneStarterAvatar(),
  };
}
function migrateLegacyProfile() {
  const profile = createProfile(CHILD_NAME);
  const legacyDate = storageGet('luna-daily-date');
  profile.activeTheme = storageGet('luna-active-theme') || profile.activeTheme;
  profile.completedThemes = load('luna-completed-themes', []);
  profile.stars = Number(storageGet('luna-stars') || 0);
  profile.dailyDate = legacyDate || localDateKey();
  profile.daily = legacyDate === localDateKey() ? load('luna-daily-tasks', freshDaily()) : freshDaily();
  profile.ocOwned = load('luna-oc-owned', profile.ocOwned);
  profile.ocAvatar = load('luna-oc-avatar', profile.ocAvatar);
  return profile;
}
let profiles = load('luna-profiles-v1', []);
if (!Array.isArray(profiles) || !profiles.length) profiles = [migrateLegacyProfile()];
let activeProfileId = storageGet('luna-active-profile-id') || profiles[0].id;
if (!profiles.some((profile) => profile.id === activeProfileId)) activeProfileId = profiles[0].id;
let todayKey = localDateKey();
function activeProfile() { return profiles.find((profile) => profile.id === activeProfileId) || profiles[0]; }
function childName() { return activeProfile()?.name || CHILD_NAME; }
function dailyFor(profile) { return profile.dailyDate === todayKey ? profile.daily : freshDaily(); }
const initialProfile = activeProfile();
const state = {
  screen: 'home', soundOn: true, childFriendlyVoice: storageGet('luna-child-friendly-voice') !== 'false', recitalMode: 'line', round: 0, completed: false, roundLocked: false,
  activeTheme: initialProfile.activeTheme || 'color', lessonMode: 'learn',
  completedThemes: initialProfile.completedThemes || [], learnedWords: initialProfile.learnedWords || [], wordProgress: initialProfile.wordProgress || {},
  stars: Number(initialProfile.stars || 0), daily: dailyFor(initialProfile),
  streak: initialProfile.streak || { count: 0, lastCompletedDate: '' },
  recordingEnabled: Boolean(initialProfile.recordingEnabled), world: initialProfile.world || {}, achievements: initialProfile.achievements || [], study: initialProfile.study || { date: todayKey, seconds: 0, limitMinutes: 5, backupAt: '' },
  ocTab: 'hair', ocOwned: initialProfile.ocOwned || ['top_starter', 'bottom_starter', 'shoes_starter', 'held_flower'],
  ocAvatar: initialProfile.ocAvatar || cloneStarterAvatar(),
};
function syncActiveProfile() {
  const profile = activeProfile();
  Object.assign(profile, {
    activeTheme: state.activeTheme, completedThemes: state.completedThemes, learnedWords: state.learnedWords, wordProgress: state.wordProgress,
    stars: state.stars, dailyDate: todayKey, daily: state.daily, streak: state.streak,
    recordingEnabled: state.recordingEnabled, world: state.world, achievements: state.achievements, study: state.study, ocOwned: state.ocOwned, ocAvatar: state.ocAvatar,
  });
}
function persistProgress() {
  syncActiveProfile();
  save('luna-profiles-v1', profiles);
  saveText('luna-active-profile-id', activeProfileId);
}
function saveOcAvatar() { persistProgress(); }
function currentTheme() {
  return THEMES[state.activeTheme] || THEMES.color;
}
function currentRounds() {
  const rounds = state.lessonMode === 'review' ? currentTheme().reviewRounds : currentTheme().rounds;
  return state.activeTheme === 'action' && state.recitalMode === 'whole' && rounds[0]?.type === 'recite' ? rounds.slice(0, 1) : rounds;
}
function switchProfile(id) {
  if (id === activeProfileId || !profiles.some((profile) => profile.id === id)) return;
  persistProgress();
  activeProfileId = id;
  const profile = activeProfile();
  state.activeTheme = profile.activeTheme || 'color';
  state.completedThemes = profile.completedThemes || [];
  state.learnedWords = profile.learnedWords || []; state.wordProgress = profile.wordProgress || {};
  state.stars = Number(profile.stars || 0);
  state.daily = dailyFor(profile);
  state.streak = profile.streak || { count: 0, lastCompletedDate: '' };
  state.recordingEnabled = Boolean(profile.recordingEnabled); state.world = profile.world || {}; state.achievements = profile.achievements || []; state.study = profile.study || { date: todayKey, seconds: 0, limitMinutes: 5, backupAt: '' };
  state.ocOwned = profile.ocOwned || [];
  state.ocAvatar = profile.ocAvatar || cloneStarterAvatar();
  state.round = 0; state.completed = false; state.roundLocked = false;
  persistProgress(); renderHome(); renderWardrobe(); updateProgress(); renderParentProfileControls();
}


let learnCountdownTimer = null;
let preferredEnglishVoice = null;
let preferredChineseVoice = null;
let speechRun = 0;
function chooseEnglishVoice() {
  if (!('speechSynthesis' in window)) return null;
  const voices = window.speechSynthesis.getVoices();
  const english = voices.filter((voice) => /^en(-|_)/i.test(voice.lang));
  const preferredNames = [
    /Ava/i, /Samantha/i, /Aria/i, /Jenny/i, /Zira/i, /Google US English/i,
    /Microsoft.*(Natural|Online)/i, /Karen/i, /Moira/i,
  ];
  preferredEnglishVoice = preferredNames.map((pattern) => english.find((voice) => pattern.test(voice.name))).find(Boolean)
    || english.find((voice) => /en-US/i.test(voice.lang) && voice.localService === false)
    || english.find((voice) => /en-US/i.test(voice.lang))
    || english[0]
    || null;
  return preferredEnglishVoice;
}
function chooseChineseVoice() {
  if (!('speechSynthesis' in window)) return null;
  const chinese = window.speechSynthesis.getVoices().filter((voice) => /^zh(-|_)/i.test(voice.lang));
  const preferredNames = [/Xiaoxiao/i, /Ting-Ting/i, /Mei-Jia/i, /Google.*普通话/i, /Microsoft.*Natural/i];
  preferredChineseVoice = preferredNames.map((pattern) => chinese.find((voice) => pattern.test(voice.name))).find(Boolean)
    || chinese.find((voice) => /zh-CN/i.test(voice.lang) && voice.localService === false)
    || chinese.find((voice) => /zh-CN/i.test(voice.lang))
    || chinese[0]
    || null;
  return preferredChineseVoice;
}
function nativeTextToSpeech() {
  if (!window.Capacitor?.isNativePlatform?.()) return null;
  return window.Capacitor.Plugins?.MagicTextToSpeech || window.Capacitor.registerPlugin?.('MagicTextToSpeech') || null;
}
const requestedTtsLanguageInstall = new Set();
function speakWithNativeTts(text, options, onend) {
  const plugin = nativeTextToSpeech();
  if (!plugin) return false;
  const finish = () => onend?.();
  const start = () => plugin.speak({ text, volume: 1, category: 'ambient', queueStrategy: 0, ...options })
    .then(finish)
    .catch(() => {
      if (options.lang?.startsWith('zh')) {
        showToast('这台设备还没有可用的中文朗读语音，请安装系统中文语音后再试。');
        if (!requestedTtsLanguageInstall.has(options.lang)) { requestedTtsLanguageInstall.add(options.lang); plugin.openInstall?.().catch(() => {}); }
      }
      finish();
    });
  if (options.lang?.startsWith('zh') && plugin.isLanguageSupported) {
    plugin.isLanguageSupported({ lang: options.lang })
      .then(({ supported }) => {
        if (supported) start();
        else {
          showToast('这台设备还没有可用的中文朗读语音，请安装系统中文语音后再试。');
          if (!requestedTtsLanguageInstall.has(options.lang)) { requestedTtsLanguageInstall.add(options.lang); plugin.openInstall?.().catch(() => {}); }
          finish();
        }
      })
      .catch(start);
  } else start();
  return true;
}
function stopNativeTts() { nativeTextToSpeech()?.stop?.().catch(() => {}); }
function speak(text, onend) {
  const run = ++speechRun;
  if (!state.soundOn) { onend?.(); return false; }
  const nativeFinished = () => { if (run === speechRun) onend?.(); };
  const nativeRate = clamp((state.childFriendlyVoice ? .80 : .84) * globalSpeechRate, .1, 10);
  if (speakWithNativeTts(text, { lang: 'en-US', rate: nativeRate, pitch: state.childFriendlyVoice ? 1.12 : 1.05 }, nativeFinished)) return true;
  if (!('speechSynthesis' in window)) { nativeFinished(); return false; }
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = preferredEnglishVoice?.lang || 'en-US';
  utterance.voice = preferredEnglishVoice || chooseEnglishVoice();
  utterance.rate = clamp((state.childFriendlyVoice ? .80 : .84) * globalSpeechRate, .1, 10);
  utterance.pitch = state.childFriendlyVoice ? 1.12 : 1.05;
  utterance.volume = 1;
  const finish = () => { if (run === speechRun) onend?.(); };
  utterance.onend = finish;
  utterance.onerror = finish;
  window.speechSynthesis.speak(utterance);
  return true;
}
function speakChinese(text, onend) {
  const run = ++speechRun;
  if (!state.soundOn) { onend?.(); return false; }
  const nativeFinished = () => { if (run === speechRun) onend?.(); };
  const nativeRate = clamp((state.childFriendlyVoice ? .76 : .82) * globalSpeechRate, .1, 10);
  if (speakWithNativeTts(text, { lang: 'zh-CN', rate: nativeRate, pitch: state.childFriendlyVoice ? 1.14 : 1.04 }, nativeFinished)) return true;
  if (!('speechSynthesis' in window)) { nativeFinished(); return false; }
  // Browsers may keep a previous English utterance queued; clear it before a Chinese card speaks.
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = preferredChineseVoice?.lang || 'zh-CN';
  utterance.voice = preferredChineseVoice || chooseChineseVoice();
  utterance.rate = clamp((state.childFriendlyVoice ? .76 : .82) * globalSpeechRate, .1, 10);
  utterance.pitch = state.childFriendlyVoice ? 1.14 : 1.04;
  utterance.volume = 1;
  const finish = () => { if (run === speechRun) onend?.(); };
  utterance.onend = finish;
  utterance.onerror = finish;
  window.speechSynthesis.speak(utterance);
  return true;
}
chooseEnglishVoice();
chooseChineseVoice();
if ('speechSynthesis' in window) window.speechSynthesis.addEventListener('voiceschanged', () => { chooseEnglishVoice(); chooseChineseVoice(); });
function playSuccessChime() {
  if (!state.soundOn || !window.AudioContext && !window.webkitAudioContext) return;
  const Context = window.AudioContext || window.webkitAudioContext;
  const context = new Context();
  const now = context.currentTime;
  [659.25, 783.99].forEach((frequency, index) => {
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = 'sine'; oscillator.frequency.setValueAtTime(frequency, now + index * .12);
    gain.gain.setValueAtTime(.0001, now + index * .12);
    gain.gain.exponentialRampToValueAtTime(.11, now + index * .12 + .018);
    gain.gain.exponentialRampToValueAtTime(.0001, now + index * .12 + .34);
    oscillator.connect(gain).connect(context.destination);
    oscillator.start(now + index * .12); oscillator.stop(now + index * .12 + .36);
  });
  setTimeout(() => context.close(), 650);
}
function showToast(text) {
  const toast = $('#toast'); toast.textContent = text; toast.classList.add('show');
  clearTimeout(showToast.timer); showToast.timer = setTimeout(() => toast.classList.remove('show'), 2200);
}
function routeFor(name) { return name === 'lesson' ? `#lesson/${state.activeTheme}` : `#${name}`; }
function setScreen(name, { push = true } = {}) {
  refreshDailyBoundary();
  if (state.screen === 'lesson' && name !== 'lesson') finishLessonSession();
  if (name === 'lesson' && !canStartLesson()) { showToast('今天的探险时间已完成，明天再来吧！'); name = 'home'; }
  state.screen = name;
  if (push && location.hash !== routeFor(name)) history.pushState({ screen: name, theme: state.activeTheme }, '', routeFor(name));
  const lessonCrumb = $('#topbarLessonTitle'); lessonCrumb.querySelector('b').textContent = currentTheme().title;
  $('.app-shell').classList.toggle('home-active', name === 'home');
  $$('.screen').forEach((screen) => screen.classList.toggle('active', screen.id === `${name}Screen`));
  $$('.nav-item').forEach((button) => button.classList.toggle('active', button.dataset.screen === name));
  if (name === 'lesson') { lessonSessionStartedAt = Date.now(); renderRound(); }
  if (name === 'closet') renderWardrobe();
  $('#main').focus({ preventScroll: true });
}

function refreshDailyBoundary() { const next = localDateKey(); if (next !== todayKey) { todayKey = next; state.daily = dailyFor(activeProfile()); state.study = { ...state.study, date: next, seconds: 0 }; persistProgress(); renderHome(); updateProgress(); } }
function masteredWordCount() { return Object.values(state.wordProgress).filter((item) => item.mastered).length; }
function recordWordProgress(word, kind) { const key = `${state.activeTheme}:${word}`; const item = state.wordProgress[key] || { learn: 0, review: 0, mastered: false, dueDate: todayKey }; if (kind === 'learn') item.learn += 1; else item.review += 1; item.lastSeen = todayKey; item.mastered = item.learn >= 1 && item.review >= 2; item.dueDate = item.mastered ? new Date(Date.now() + 3 * 86400000).toISOString().slice(0, 10) : todayKey; state.wordProgress[key] = item; }
function refreshAchievements() { unlockAchievementIds(state, masteredWordCount()).forEach((id) => { if (!state.achievements.includes(id)) { state.achievements.push(id); const label = ACHIEVEMENT_DEFINITIONS.find((item) => item.id === id)?.label || '新徽章'; showToast(`获得徽章：${label}！`); } }); }
let lessonSessionStartedAt = null;
function studyTodaySeconds() { return state.study.date === todayKey ? state.study.seconds : 0; }
function finishLessonSession() { if (!lessonSessionStartedAt) return; state.study.seconds += Math.floor((Date.now() - lessonSessionStartedAt) / 1000); lessonSessionStartedAt = null; persistProgress(); }
function canStartLesson() { const limit = Number(state.study.limitMinutes || 0); return !limit || studyTodaySeconds() < limit * 60; }
function updateDailyStreak() {
  const previous = state.streak.lastCompletedDate;
  if (previous === todayKey) return;
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  state.streak.count = previous === localDateKey(yesterday) ? state.streak.count + 1 : 1;
  state.streak.lastCompletedDate = todayKey;
}
function openDailyWrapUp() {
  $('#dailyWrapStreak').textContent = state.streak.count;
  $('#dailyWrapCopy').textContent = state.streak.count > 1 ? `已经连续学习 ${state.streak.count} 天，明天也来和露娜一起学英文吧。` : '今天的三个小目标都完成了，明天再见！';
  $('#dailyModal').classList.add('open'); $('#dailyModal').setAttribute('aria-hidden', 'false');
  setTimeout(() => $('#dailyWrapCloset').focus(), 200);
}
function closeDailyWrapUp() { $('#dailyModal').classList.remove('open'); $('#dailyModal').setAttribute('aria-hidden', 'true'); }
function setDailyTask(task) {
  if (state.daily[task]) return;
  state.daily[task] = true;
  const finishedToday = state.daily.round && state.daily.theme && state.daily.dress && !state.daily.claimed;
  if (finishedToday) {
    state.daily.claimed = true;
    updateDailyStreak();
    state.stars += 3;
    state.ocOwned = Array.from(new Set([...state.ocOwned, 'hat_ribbon']));
    showToast('今日任务完成！获得蝴蝶结发箍和 3 颗星星！');
  } else {
    showToast('今日魔法任务完成一项！');
  }
  persistProgress(); renderHome(); updateProgress();
  if (finishedToday) setTimeout(openDailyWrapUp, 350);
}
function mountHomeMap() {
  const scene = $('.garden-scene'); const map = $('.theme-map');
  if (scene && map && map.parentElement !== scene) scene.append(map);
}
function themeNeedsReview(theme) { return isThemeReviewDue(theme, state.wordProgress, todayKey); }
function recommendedThemeId() { return getRecommendedThemeId(THEMES, state.completedThemes, state.wordProgress, todayKey, state.activeTheme); }
function dailyRouteThemes() { return dailyRouteThemeIds(THEMES, state.completedThemes, state.wordProgress, todayKey); }
function renderHome() {
  const theme = currentTheme();
  $('#childNameGreeting').textContent = childName();
  $('#homeChildName').textContent = childName();
  $('#speechChildName').textContent = `Hi, ${childName()}!`;
  $('.mini-speak').dataset.say = `Hi, ${childName()}! Let's make magic!`;
  $('#todayThemeName').textContent = theme.title;
  $('#homePrimaryAction').setAttribute('aria-label', state.lessonMode === 'review' ? '继续探险复习' : '出发去探险');
  $('#todayThemeMeta').textContent = `${theme.subtitle} · 3 分钟 · ${theme.words.join(' / ')}`;
  $('#dailyMissionTitle').textContent = state.daily.claimed ? '今天的礼物已收到！' : '完成 3 个小目标';
  const tasks = [ ['round', '完成 1 个魔法小游戏'], ['theme', '完成 1 个魔法主题'], ['dress', '在衣橱换 1 件装扮'] ];
  $('#dailyTaskList').innerHTML = tasks.map(([id, label]) => `<li class="${state.daily[id] ? 'done' : ''}"><span>${state.daily[id] ? '✓' : '○'}</span>${label}</li>`).join('');
  const recommended = recommendedThemeId();
  const route = dailyRouteThemes();
  const routeButton = $('#dailyRoute');
  routeButton.hidden = !route.length;
  if (route.length) { const next = THEMES[route[0]]; routeButton.dataset.theme = next.id; routeButton.textContent = `今日路线：先去${MAP_META[next.id]?.name || next.title}`; }
  $('#themeCards').innerHTML = Object.values(THEMES).map((theme) => {
    const done = state.completedThemes.includes(theme.id);
    const reviewDue = themeNeedsReview(theme);
    const unavailable = state.lessonMode === 'review' && !done;
    const map = MAP_META[theme.id] || { name: theme.title, hint: theme.subtitle, icon: 'spark' };
    const status = state.lessonMode === 'review' ? (done ? '再次探险' : '先探索新知识') : (done ? '已经点亮 · 再去看看' : map.hint);
    return `<button class="theme-card map-node map-${theme.id} ${theme.id === state.activeTheme ? 'active' : ''} ${unavailable ? 'needs-learning' : ''} ${theme.id === recommended ? 'recommended' : ''} ${reviewDue ? 'review-due' : ''}" type="button" data-theme="${theme.id}" aria-label="${map.name}，${status}"><span class="map-copy"><strong>${map.name}</strong></span></button>`;
  }).join('');
  $$('[data-theme]').forEach((button) => button.addEventListener('click', () => selectTheme(button.dataset.theme, true)));
  $('#dailyRoute').onclick = () => selectTheme($('#dailyRoute').dataset.theme, true);
  $$('[data-lesson-mode]').forEach((button) => {
    const active = button.dataset.lessonMode === state.lessonMode;
    button.classList.toggle('active', active); button.setAttribute('aria-selected', String(active));
    button.addEventListener('click', () => { state.lessonMode = button.dataset.lessonMode; state.round = 0; state.completed = false; renderHome(); });
  });
}
function selectTheme(id, goToLesson = true) {
  if (state.lessonMode === 'review' && !state.completedThemes.includes(id)) { showToast('先完成这个主题的单词学习，再来复习吧。'); return; }
  state.activeTheme = id; state.round = 0; state.completed = false; state.roundLocked = false;
  persistProgress(); renderHome();
  if (goToLesson) setScreen('lesson');
}

function updateProgress() {
  const theme = currentTheme(); const total = currentRounds().length;
  $('#starTotal').textContent = 18 + state.stars;
  $('#parentStars').textContent = state.stars;
  $('#parentWords').textContent = masteredWordCount();
  $('#parentStreak').textContent = state.streak.count;
  $('#progressStars').textContent = `${Math.min(state.round, total)} / ${total}`;
  $('#progressLabel').textContent = state.completed ? (state.lessonMode === 'review' ? '魔法回顾完成啦！' : '魔法完成啦！') : `第 ${state.round + 1} 关，共 ${total} 关`;
  $('#progressFill').style.width = `${(Math.min(state.round, total) / total) * 100}%`;
}

function startLearnCountdown(seconds = 3) {
  const button = $('#learnNext');
  const label = $('#learnNextLabel');
  if (!button || !label) return;
  clearInterval(learnCountdownTimer);
  let remaining = seconds;
  button.disabled = true;
  button.setAttribute('aria-disabled', 'true');
  label.textContent = '继续';
  button.style.setProperty('--listen-progress', '0%');
  learnCountdownTimer = window.setInterval(() => {
    remaining -= 1;
    button.style.setProperty('--listen-progress', `${((seconds - remaining) / seconds) * 100}%`);
    if (remaining <= 0) {
      clearInterval(learnCountdownTimer);
      button.disabled = false;
      button.removeAttribute('aria-disabled');
      label.textContent = '继续';
      button.style.setProperty('--listen-progress', '100%');
      button.classList.add('ready');
      return;
    }
    label.textContent = '继续';
  }, 1000);
}

function speakForCurrentTheme(text, onend) {
  return currentTheme().id === 'hanzi' ? speakChinese(text, onend) : speak(text, onend);
}
function autoReadWordCard(word) {
  const card = $('.learn-word-card');
  const isHanzi = currentTheme().id === 'hanzi';
  const translation = WORD_TRANSLATIONS[word];
  card?.classList.add('is-speaking', isHanzi ? 'speaking-chinese' : 'speaking-english');
  // Hanzi cards read the character itself in Chinese. Other courses keep the
  // English-first, Chinese-explanation sequence.
  if (isHanzi) {
    speakChinese(word, () => card?.classList.remove('is-speaking', 'speaking-chinese'));
    return;
  }
  speak(word, () => {
    card?.classList.remove('speaking-english');
    card?.classList.add('speaking-chinese');
    window.setTimeout(() => speakChinese(translation, () => {
      card?.classList.remove('is-speaking', 'speaking-chinese');
    }), 120);
  });
}

function lessonPrimaryActionsMarkup(name = '') {
  return `<div class="lesson-action-stack">${name ? `<strong class="word-action-name">${escapeHtml(name)}</strong>` : ''}<div class="lesson-primary-actions"><button class="repeat-current-button" id="repeatCurrent" type="button" aria-label="再读一遍，可按 R 键触发"><svg viewBox="0 0 24" aria-hidden="true"><path d="M4 10v4h4l5 4V6L8 10H4Zm12.5 2A4.5 4.5 0 0 0 14 8v2a2.5 2.5 0 0 1 0 4v2a2.5 2.5 0 0 0 2.5-4Z"/></svg><span>再读一遍</span><kbd aria-hidden="true">R</kbd></button><button class="primary-button" id="learnNext" type="button" disabled aria-disabled="true"><span class="learn-next-copy"><span id="learnNextLabel">继续</span></span><svg viewBox="0 0 24" aria-hidden="true"><path d="m9 5 7 7-7 7"/></svg></button></div></div>`;
}
function hanziLearnMarkup(game, recordingAction) {
  const parts = [...game.word];
  const related = parts.length > 1 ? parts : currentTheme().words.filter((item) => item !== game.word && item.includes(game.word)).slice(0, 2);
  const relatedMarkup = related.length ? related.map((item) => `<span>${item}</span>`).join('') : '<span>今天读一读</span>';
  return `<article class="hanzi-spellbook"><p class="hanzi-book-kicker">汉字图书塔 · 会说话的书页</p><button class="hanzi-glyph" data-hanzi-length="${parts.length}" id="hanziSpeak" type="button" aria-label="朗读 ${game.word}"><b>${game.word}</b><small>点一下，听读音</small></button><p class="hanzi-read-copy">${game.zh}</p>${hanziSceneMarkup(game.word)}<div class="hanzi-word-trail"><em>${parts.length > 1 ? '拆开看看' : '认识词组'}</em><div>${relatedMarkup}</div></div>${lessonPrimaryActionsMarkup()}${recordingAction}</article>`;
}
function sentenceMarkup(word) {
  const sentence = WORD_SENTENCES[word];
  if (!sentence) return '';
  return `<div class="sentence-card"><div class="sentence-main"><b>${sentence.text}</b><button type="button" data-sentence="${sentence.text}" aria-label="听整句话"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 10v4h4l5 4V6L8 10H4Zm12.5 2A4.5 4.5 0 0 0 14 8v2a2.5 2.5 0 0 1 0 4v2a4.5 4.5 0 0 0 2.5-4Z"/></svg></button></div><span>${sentence.zh}</span></div>`;
}
function bindSentenceButtons(area) { $$('[data-sentence]', area).forEach((button) => button.addEventListener('click', () => speak(button.dataset.sentence))); }
function renderLessonGroupSwitcher() {
  const container = $('#lessonGroupSwitcher'); const kind = state.activeTheme;
  if (!['english', 'hanzi'].includes(kind)) { container.hidden = true; container.replaceChildren(); return; }
  const groups = contentGroups(kind).filter((group) => group.name && group.words.length >= 2); const active = activeContentGroup(kind);
  if (groups.length < 2) { container.hidden = true; container.replaceChildren(); return; }
  container.hidden = false;
  container.innerHTML = `<span>${kind === 'hanzi' ? '汉字分组' : '英文分组'}</span><div role="tablist" aria-label="${kind === 'hanzi' ? '汉字' : '英文'}学习分组">${groups.map((group) => `<button type="button" role="tab" data-lesson-group="${escapeHtml(group.id)}" aria-selected="${group.id === active.id}" class="${group.id === active.id ? 'active' : ''}">${escapeHtml(group.name)}</button>`).join('')}</div>`;
  $$('[data-lesson-group]', container).forEach((button) => button.addEventListener('click', () => {
    const group = groups.find((item) => item.id === button.dataset.lessonGroup); if (!group || group.id === active.id) return;
    adminContent[activeContentGroupKey(kind)] = group.id; saveContentConfiguration(); applyAdminContent();
    state.round = 0; state.completed = false; state.roundLocked = false; persistProgress(); renderHome(); renderRound(); showToast(`开始学习“${group.name}”分组。`);
  }));
}
function addLessonShortcutHints(area) {
  $$('button.primary-button', area).forEach((button) => {
    if (button.querySelector('.keyboard-hint')) return;
    const hint = document.createElement('kbd'); hint.className = 'keyboard-hint'; hint.textContent = 'Space'; hint.setAttribute('aria-hidden', 'true');
    button.append(hint);
  });
}
function isTypingTarget(target) { return target instanceof HTMLElement && Boolean(target.closest('input, textarea, select, [contenteditable="true"]')); }
function replayCurrentPrompt() {
  const game = currentRounds()[state.round];
  if (!game) return;
  if (game.type === 'recite') { $('#reciteListen')?.click(); return; }
  speakForCurrentTheme(currentTheme().id === 'hanzi' ? game.word : (game.type === 'match' ? game.prompt : game.word));
}
function handleLessonShortcuts(event) {
  if (state.screen !== 'lesson' || isTypingTarget(event.target) || event.defaultPrevented) return;
  if (event.key.toLowerCase() === 'r') { event.preventDefault(); replayCurrentPrompt(); return; }
  if ((event.key === 'Enter' || event.key === ' ') && !(event.target instanceof HTMLElement && event.target.closest('button, a'))) {
    const action = [...$$('#gameArea button.primary-button')].find((button) => !button.disabled && !button.hidden);
    if (action) { event.preventDefault(); action.click(); }
  }
}
let recitalPlaybackId = 0;
function playRecitalLines(lines, card) {
  const playbackId = ++recitalPlaybackId;
  window.speechSynthesis?.cancel();
  const readLine = (index) => {
    if (playbackId !== recitalPlaybackId || index >= lines.length) return;
    const lineNodes = $$('[data-recital-line]', card);
    lineNodes.forEach((line, lineIndex) => line.classList.toggle('speaking', lineIndex === index));
    const currentLine = lineNodes[index];
    const manuscript = currentLine?.closest('.recital-manuscript');
    if (currentLine && manuscript) manuscript.scrollTo({ top: currentLine.offsetTop - (manuscript.clientHeight - currentLine.offsetHeight) / 2, behavior: 'smooth' });
    speakChinese(lines[index], () => {
      if (playbackId !== recitalPlaybackId) return;
      if (index + 1 < lines.length) window.setTimeout(() => readLine(index + 1), 260);
      else lineNodes.forEach((line) => line.classList.remove('speaking'));
    });
  };
  readLine(0);
}
function renderRound() {
  const theme = currentTheme();
  renderLessonGroupSwitcher();
  $('#topbarLessonTitle b').textContent = theme.title;
  if (state.completed) return renderCompletion();
  state.roundLocked = false;
  const game = currentRounds()[state.round];
  const area = $('#gameArea');
  if (game.type === 'learn') {
    const recordingAction = state.recordingEnabled ? '<button class="record-practice" id="recordPractice" type="button">跟我说一说</button><div id="practicePlayback"></div>' : '';
    area.innerHTML = currentTheme().id === 'hanzi'
      ? hanziLearnMarkup(game, recordingAction)
      : `<div class="learn-word-card"><img src="${game.image}" alt="${game.word} 的图片" /><div><p>看一看，听一听</p><h2>${game.word}</h2><span>${game.zh}</span></div>${sentenceMarkup(game.word)}${lessonPrimaryActionsMarkup(`中文：${WORD_TRANSLATIONS[game.word] || game.word}`)}</div>${recordingAction}`;
    $('#learnNext').addEventListener('click', () => handleCorrect(game.word, 'learn'));
    $('#hanziSpeak')?.addEventListener('click', () => speakChinese(game.word));
    $('#recordPractice')?.addEventListener('click', recordPractice);
    startLearnCountdown(3);
  } else if (game.type === 'recite') {
    const wholePiece = state.recitalMode === 'whole'; const piece = activeRecitalPiece(); const recitalText = wholePiece ? piece.lines.join('\n') : game.text; const lineLabel = wholePiece ? `整篇朗诵 · 共 ${piece.lines.length} 句` : game.lineLabel || '朗诵文本';
    const manuscript = wholePiece
      ? `<span class="recital-manuscript">${piece.lines.map((line, index) => `<span class="recital-line" data-recital-line="${index}">${escapeHtml(line)}</span>`).join('')}</span>`
      : `<span>“${escapeHtml(recitalText)}”</span>`;
    const recordingAction = state.recordingEnabled ? '<button class="record-practice" id="recordPractice" type="button">录下我的朗诵</button><div id="practicePlayback"></div>' : '';
    area.innerHTML = `<article class="recital-card"><div class="recital-curtain" aria-hidden="true"><i></i><i></i></div><p class="recital-kicker">朗诵小舞台</p><div class="recital-mode-switch" role="group" aria-label="朗诵方式"><button type="button" class="${wholePiece ? '' : 'active'}" data-recital-mode="line" aria-pressed="${!wholePiece}">单句朗诵</button><button type="button" class="${wholePiece ? 'active' : ''}" data-recital-mode="whole" aria-pressed="${wholePiece}">整篇朗诵</button></div><h2>${escapeHtml(game.title || game.word)}</h2><p class="recital-line-label">${escapeHtml(lineLabel)}</p><button class="recital-text ${wholePiece ? 'whole-piece' : ''}" id="reciteListen" type="button" aria-label="播放《${escapeHtml(game.title || game.word)}》朗诵">${manuscript}<small>${wholePiece ? '文稿可上下滚动；朗读时会自动定位到当前句' : '点文本，听露娜朗读'}</small></button><p class="recital-tip">${wholePiece ? '听完整篇后，试着一口气朗诵下来。' : game.zh}</p>${lessonPrimaryActionsMarkup()}${recordingAction}</article>`;
    const readText = () => wholePiece ? playRecitalLines(piece.lines, $('#reciteListen')) : (recitalPlaybackId += 1, speakChinese(recitalText));
    $('#reciteListen').addEventListener('click', readText);
    $$('[data-recital-mode]', area).forEach((button) => button.addEventListener('click', () => { const mode = button.dataset.recitalMode; if (mode !== state.recitalMode) { recitalPlaybackId += 1; state.recitalMode = mode; state.round = 0; state.completed = false; window.speechSynthesis?.cancel(); stopNativeTts(); renderRound(); } }));
    $('#learnNext').addEventListener('click', () => handleCorrect(game.word, state.lessonMode === 'review' ? 'review' : 'learn'));
    $('#recordPractice')?.addEventListener('click', recordPractice);
    startLearnCountdown(3); window.setTimeout(readText, 180);
  } else if (game.type === 'action') {
    area.innerHTML = `<div class="number-action-card"><img src="${game.image}" alt="拍手动作" /><div><p>数字动作</p><h2>${game.prompt}</h2><strong>${game.zh}</strong></div><button class="primary-button" id="actionDone" type="button">${game.actionLabel || '我做完啦'}</button></div>`;
    $('#actionDone').addEventListener('click', () => handleCorrect(game.word, 'action'));
    speak(game.prompt);
  } else if (game.type === 'listen') {
    area.innerHTML = `<div class="match-word-card"><img src="${game.image}" alt="${game.word} 的图片" /><div class="game-copy"><h2>听一听<br /><em>找一找</em></h2><strong class="match-translation">中文：${game.zh}</strong><p>先听一遍，再点图片。</p></div></div><button class="review-listen-action" id="reviewListenAction" type="button">听一听 <svg viewBox="0 0 24" aria-hidden="true"><path d="M4 10v4h4l5 4V6L8 10H4Zm12.5 2A4.5 4.5 0 0 0 14 8v2a2.5 2.5 0 0 1 0 4v2a4.5 4.5 0 0 0 2.5-4Z"/></svg></button><div class="picture-choice-row">${game.choices.map((choice) => `<button class="picture-choice" type="button" data-choice="${choice}"><img src="${wordImage(choice)}" alt="${(WORD_TRANSLATIONS[choice] || choice)}" /><b>${(WORD_TRANSLATIONS[choice] || choice)}</b></button>`).join('')}</div>`;
    $('#reviewListenAction').addEventListener('click', () => { speakForCurrentTheme(game.word); $$('.picture-choice', area).forEach((button) => button.classList.add('attention')); setTimeout(() => $$('.picture-choice', area).forEach((button) => button.classList.remove('attention')), 900); });
    $$('[data-choice]', area).forEach((button) => button.addEventListener('click', () => handleChoice(button, game)));
  } else {
    area.innerHTML = `<div class="match-word-card"><img src="${game.image}" alt="${game.word} 的图片" /><div class="game-copy"><h2>找一找<br /><em>对应单词</em></h2><strong class="match-translation">中文：${(WORD_TRANSLATIONS[game.word] || game.word)}</strong><p>${game.zh}</p></div></div><button class="review-listen-action" id="reviewListenAction" type="button">先听一遍，再选单词 <svg viewBox="0 0 24" aria-hidden="true"><path d="M4 10v4h4l5 4V6L8 10H4Zm12.5 2A4.5 4.5 0 0 0 14 8v2a4.5 4.5 0 0 1 0 4v2a4.5 2.5 0 0 0 2.5-4Z"/></svg></button><div class="word-choice-row">${game.choices.map((choice) => `<button class="word-choice ${theme.id}" type="button" data-choice="${choice}"><b>${choice}</b><span>点一个单词</span></button>`).join('')}</div>`;
    $('#reviewListenAction').addEventListener('click', () => { speakForCurrentTheme(game.word); $$('.word-choice', area).forEach((button) => button.classList.add('attention')); setTimeout(() => $$('.word-choice', area).forEach((button) => button.classList.remove('attention')), 900); });
    $$('[data-choice]', area).forEach((button) => button.addEventListener('click', () => handleChoice(button, game)));
  }
  bindSentenceButtons(area);
  $('#repeatCurrent')?.addEventListener('click', replayCurrentPrompt);
  addLessonShortcutHints(area);
  updateProgress();
  if (game.type === 'learn') autoReadWordCard(game.word);
}
async function recordPractice() {
  const button = $('#recordPractice'); const playback = $('#practicePlayback');
  if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) { showToast('这台设备暂不支持录音跟读。'); return; }
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream); const chunks = [];
    recorder.addEventListener('dataavailable', (event) => { if (event.data.size) chunks.push(event.data); });
    recorder.addEventListener('stop', () => {
      stream.getTracks().forEach((track) => track.stop());
      const audio = document.createElement('audio'); audio.controls = true; audio.className = 'practice-playback';
      audio.src = URL.createObjectURL(new Blob(chunks, { type: recorder.mimeType || 'audio/webm' }));
      playback.replaceChildren(audio); button.disabled = false; button.classList.remove('recording'); button.textContent = '再说一遍';
      showToast('录好啦，点播放按钮听听自己的声音！');
    });
    recorder.start(); button.disabled = true; button.classList.add('recording'); button.textContent = '正在听你说…';
    window.setTimeout(() => recorder.state === 'recording' && recorder.stop(), 2500);
  } catch {
    showToast('没有获得麦克风权限，可以请爸爸妈妈在浏览器设置中开启。');
  }
}

function handleChoice(button, game) {
  if (state.roundLocked || button.disabled) return;
  if (button.dataset.choice === game.correct) { button.classList.add('correct'); handleCorrect(game.word); }
  else { button.classList.add('try-again'); button.disabled = true; speakForCurrentTheme(currentTheme().id === 'hanzi' ? game.word : game.prompt); showToast('再听一次，露娜相信你！'); }
}
function showWordCelebration(word) {
  const overlay = document.createElement('div');
  overlay.className = 'word-celebration';
  overlay.setAttribute('aria-hidden', 'true');
  overlay.innerHTML = `<div class="word-burst"></div><div class="celebration-word"><span>我认识了！</span><b>${word}</b><em>✦</em></div><i class="burst-star star-one">✦</i><i class="burst-star star-two">✦</i><i class="burst-star star-three">✦</i><i class="burst-star star-four">✦</i><i class="burst-confetti confetti-one"></i><i class="burst-confetti confetti-two"></i><i class="burst-confetti confetti-three"></i><i class="burst-confetti confetti-four"></i>`;
  $('#gameArea').append(overlay);
}
function handleCorrect(word, kind = 'match') {
  if (state.roundLocked) return;
  state.roundLocked = true; state.round += 1; state.stars += 1;
  if (kind === 'learn') { state.learnedWords = Array.from(new Set([...state.learnedWords, word])); showWordCelebration(word); }
  recordWordProgress(word, kind);
  refreshAchievements();
  setDailyTask('round'); playSuccessChime(); showToast(`你认识了 ${word}！`); persistProgress(); updateProgress();
  setTimeout(() => {
    if (state.round >= currentRounds().length) { if (state.lessonMode === 'review') completeReview(); else completeTheme(); }
    renderRound();
  }, kind === 'learn' ? 1350 : 850);
}
function completeReview() {
  state.completed = true;
  persistProgress();
  showToast('魔法回顾完成，记得很棒！');
}
function completeTheme() {
  const theme = currentTheme(); state.completed = true;
  state.world[theme.id] = Math.max(state.world[theme.id] || 0, 2);
  state.completedThemes = Array.from(new Set([...state.completedThemes, theme.id]));
  state.ocOwned = Array.from(new Set([...state.ocOwned, ...theme.rewards]));
  saveOcAvatar(); setDailyTask('theme'); persistProgress(); $('#newDot').hidden = false;
}
function renderCompletion() {
  const theme = currentTheme();
  const reviewing = state.lessonMode === 'review';
  $('#gameArea').innerHTML = reviewing
    ? `<div class="completion"><div class="completion-crown">✦</div><h2>魔法回顾完成！<br /><em>${theme.title}</em></h2><p>已经把这些学习内容又记牢了一次。</p><button class="primary-button" type="button" id="backHome">回到魔法城堡 <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 5 7 7-7 7"/></svg></button></div>`
    : `<div class="completion"><div class="completion-crown">♕</div><h2>你完成了<br /><em>${theme.title}!</em></h2><p>魔法礼盒里有新的 OC-English 装扮。</p><div class="reward-chest-preview"><i></i><b>✦</b></div><button class="primary-button" type="button" id="openReward">打开魔法礼盒 <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 5 7 7-7 7"/></svg></button></div>`;
  if (reviewing) $('#backHome').addEventListener('click', () => setScreen('home')); else $('#openReward').addEventListener('click', openReward);
  updateProgress();
}

function renderWardrobe() {
  $('#ocAvatar').innerHTML = renderCharacterSVG(state.ocAvatar, 1.45);
  $('#homeOcAvatar').innerHTML = renderCharacterSVG(state.ocAvatar, 1.1);
  $('#ocCollectionCount').textContent = `${state.ocOwned.length + 1} / ${OC_WARDROBE.length + OC_PART_OPTIONS.hair.length}`;
  const category = OC_CATEGORY_META.find((item) => item.id === state.ocTab);
  $('#ocLookName').textContent = '点一点右边的装扮，给露娜换新造型。';
  renderOcTabs(); renderOcItems();
}
function renderOcTabs() {
  $('#ocCategoryTabs').innerHTML = OC_CATEGORY_META.map((category) => `<button class="oc-category-tab ${state.ocTab === category.id ? 'active' : ''}" type="button" data-oc-tab="${category.id}">${wardrobeIcon(category.id)}<span>${category.label}</span></button>`).join('');
  $$('[data-oc-tab]').forEach((button) => button.addEventListener('click', () => { state.ocTab = button.dataset.ocTab; renderOcTabs(); renderOcItems(); }));
}
function renderOcItems() {
  const grid = $('#ocItemGrid');
  if (state.ocTab === 'hair') {
    grid.innerHTML = OC_PART_OPTIONS.hair.map((hair) => `<button class="oc-item-card ${state.ocAvatar.hair === hair.i ? 'equipped' : ''}" type="button" data-oc-hair="${hair.i}"><span class="oc-item-preview hair-preview">${renderCharacterSVG({ ...state.ocAvatar, hair: hair.i, outfit: {} }, .42)}</span><strong>${hair.name}</strong><small>${state.ocAvatar.hair === hair.i ? '正在使用' : '点一下试试'}</small></button>`).join('');
    $$('[data-oc-hair]').forEach((button) => button.addEventListener('click', () => { state.ocAvatar.hair = Number(button.dataset.ocHair); saveOcAvatar(); setDailyTask('dress'); renderWardrobe(); showToast('换了一个新发型！'); })); return;
  }
  const category = OC_CATEGORY_META.find((item) => item.id === state.ocTab);
  const items = OC_WARDROBE.filter((item) => item.slot === category.slot);
  grid.innerHTML = items.map((item) => { const owned = state.ocOwned.includes(item.id); const equipped = state.ocAvatar.outfit[category.slot] === item.id; return `<button class="oc-item-card ${owned ? '' : 'locked'} ${equipped ? 'equipped' : ''}" type="button" data-oc-item="${item.id}" ${owned ? '' : 'disabled'}><span class="oc-item-preview slot-${category.slot}">${owned ? wardrobeThumb(item.id) : '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 10V7a4 4 0 0 1 8 0v3"/><rect x="5" y="10" width="14" height="11" rx="2"/></svg>'}</span><strong>${item.name}</strong><small>${owned ? (equipped ? '正在使用' : '点一下试试') : '完成课程解锁'}</small></button>`; }).join('');
  $$('[data-oc-item]').forEach((button) => button.addEventListener('click', () => { state.ocAvatar.outfit[category.slot] = button.dataset.ocItem; saveOcAvatar(); setDailyTask('dress'); renderWardrobe(); showToast('露娜换好了新装扮！'); }));
}

function openReward() {
  const rewards = currentTheme().rewards;
  $('#rewardModal').classList.add('open'); $('#rewardModal').setAttribute('aria-hidden', 'false'); $('#rewardChest').classList.add('opening');
  const firstReward = OC_WARDROBE.find((item) => item.id === rewards[0]);
  const lastReward = OC_WARDROBE.find((item) => item.id === rewards[rewards.length - 1]);
  const firstThumb = $('#ocRewardDress'); const lastThumb = $('#ocRewardWings');
  firstThumb.className = `oc-reward-thumb slot-${firstReward?.slot || 'default'}`;
  lastThumb.className = `oc-reward-thumb slot-${lastReward?.slot || 'default'}`;
  firstThumb.innerHTML = wardrobeThumb(rewards[0]); lastThumb.innerHTML = wardrobeThumb(rewards[rewards.length - 1]);
  $('#ocRewardName1').textContent = firstReward?.name || '新装扮';
  $('#ocRewardName2').textContent = lastReward?.name || '新装扮';
  speak(`A magic gift for you, ${childName()}!`); setTimeout(() => $('#claimReward').focus(), 650);
}
function closeReward() { $('#rewardModal').classList.remove('open'); $('#rewardModal').setAttribute('aria-hidden', 'true'); }
let parentGateAnswer = 0;
let parentModeEnabled = storageGet('luna-parent-mode-enabled') === 'true';
function renderParentModeState() {
  const button = $('#parentButton'); const status = $('#parentModeStatus');
  button.classList.toggle('enabled', parentModeEnabled); button.setAttribute('aria-pressed', String(parentModeEnabled));
  button.textContent = parentModeEnabled ? '家长模式已启用' : '给爸爸妈妈';
  if (status) status.textContent = parentModeEnabled ? '家长模式已启用：再次打开无需答题。' : '家长模式未启用。';
}
function setParentModeEnabled(enabled) {
  parentModeEnabled = enabled; saveText('luna-parent-mode-enabled', String(enabled)); renderParentModeState();
}
function speechRateLabel(rate = globalSpeechRate) { if (rate < .85) return '慢速'; if (rate > 1.15) return '快速'; return '标准'; }
function renderSpeechRateControl() {
  const input = $('#speechRate'); const label = $('#speechRateValue');
  if (!input || !label) return;
  input.value = String(globalSpeechRate); input.setAttribute('aria-valuetext', `${speechRateLabel()}，${globalSpeechRate.toFixed(2)} 倍`);
  label.textContent = `${speechRateLabel()} · ${globalSpeechRate.toFixed(2)}×`;
}
function renderParentProfileControls() {
  const select = $('#profileSelect');
  if (!select) return;
  select.innerHTML = profiles.map((profile) => `<option value="${profile.id}" ${profile.id === activeProfileId ? 'selected' : ''}>${profile.name}</option>`).join('');
  $('#recordingToggle').setAttribute('aria-pressed', String(state.recordingEnabled));
  $('#recordingToggle').textContent = state.recordingEnabled ? '录音跟读：已开启' : '录音跟读：已关闭';
  $('#dailyLimitSelect').value = String(state.study.limitMinutes || 0); $('#parentStudyToday').textContent = `今天已探险 ${Math.floor(studyTodaySeconds() / 60)} 分钟`; $('#parentAchievements').textContent = state.achievements.length;
  renderSpeechRateControl();
  updateProgress();
}
let parentActiveTab = 'overview';
function setParentTab(tab) {
  parentActiveTab = ['overview', 'settings', 'tools'].includes(tab) ? tab : 'overview';
  $$('.parent-tab').forEach((button) => { const active = button.dataset.parentTab === parentActiveTab; button.classList.toggle('active', active); button.setAttribute('aria-selected', String(active)); });
  $$('.parent-tab-panel').forEach((panel) => { panel.hidden = panel.id !== `parentPanel${parentActiveTab[0].toUpperCase()}${parentActiveTab.slice(1)}`; });
}
function prepareParentGate() {
  const first = Math.floor(Math.random() * 7) + 7;
  const second = Math.floor(Math.random() * 6) + 3;
  parentGateAnswer = first + second;
  $('#parentGateQuestion').textContent = `请计算：${first} + ${second} = ?`;
  $('#parentGateAnswer').value = ''; $('#parentGateError').hidden = true;
  $('#parentGate').hidden = false; $('#parentContent').hidden = true;
}
function unlockParent() {
  setParentModeEnabled(true); $('#parentGate').hidden = true; $('#parentContent').hidden = false;
  renderParentProfileControls(); setParentTab('overview');
  $('#profileSelect').focus();
}
function openParent() {
  $('#parentModal').classList.add('open'); $('#parentModal').setAttribute('aria-hidden', 'false');
  if (parentModeEnabled) { unlockParent(); return; }
  prepareParentGate(); setTimeout(() => $('#parentGateAnswer').focus(), 100);
}
function closeParent() {
  $('#parentModal').classList.remove('open'); $('#parentModal').setAttribute('aria-hidden', 'true'); $('#parentButton').focus();
}
function disableParentMode() {
  setParentModeEnabled(false); closeParent(); showToast('家长模式已关闭；下次打开需要重新答题。');
}
function renderAdminContentSummary() {
  ['english', 'hanzi'].forEach((kind) => {
    const group = activeContentGroup(kind); const groups = contentGroups(kind);
    $(`#${kind}ConfigMeta`).textContent = `正在学习：${group.name} · ${groups.length} 个分组 · ${group.words.length} 项`;
  });
  const recital = activeRecitalPiece(); $('#recitalConfigMeta').textContent = `正在朗诵：《${recital.title}》· ${recital.lines.length} 句`;
}
function openAdmin() { $('#adminModal').classList.add('open'); $('#adminModal').setAttribute('aria-hidden', 'false'); $('#adminContent').hidden = false; renderAdminContentSummary(); setTimeout(() => $('#openEnglishConfig').focus(), 100); }
function closeAdmin() { $('#adminModal').classList.remove('open'); $('#adminModal').setAttribute('aria-hidden', 'true'); $('#parentButton').focus(); }
function groupTitle(kind) { return kind === 'hanzi' ? '汉字与词组' : '英文单词'; }
function groupWordLabel(kind) { return kind === 'hanzi' ? '汉字、词组或成语' : '英文单词'; }
function groupItemsPreview(group) { return group.words.length ? group.words.slice(0, 4).map((word) => `<span>${escapeHtml(word)}</span>`).join('') + (group.words.length > 4 ? `<i>+${group.words.length - 4}</i>` : '') : '<i>待写入内容</i>'; }
function renderContentGroupDirectory(kind) {
  const active = activeContentGroup(kind); const editing = editingContentGroup(kind); const groups = contentGroups(kind);
  $('#contentConfigSummary').innerHTML = `<div><b>${groups.length}</b><span>个分组</span></div><div><b>${groups.reduce((total, group) => total + group.words.length, 0)}</b><span>项内容</span></div><div><b>${active.words.length}</b><span>当前学习项</span></div>`;
  $('#contentGroupList').innerHTML = groups.map((group) => `<button class="content-group-card ${group.id === editing.id ? 'active' : ''}" type="button" data-content-group="${escapeHtml(group.id)}" aria-pressed="${group.id === editing.id}"><span class="content-group-card-head"><b>${escapeHtml(group.name || '未命名分组')}</b>${group.id === active.id ? '<em>正在学习</em>' : ''}</span><span class="content-group-card-meta">${group.words.length ? `${group.words.length} 项内容` : '待写入'}</span><span class="content-group-card-words">${groupItemsPreview(group)}</span></button>`).join('');
  $$('[data-content-group]', $('#contentGroupList')).forEach((button) => button.addEventListener('click', () => chooseContentGroup(button.dataset.contentGroup)));
}
function openContentConfig(kind) {
  const group = editingContentGroup(kind);
  $('#contentConfigType').value = kind; $('#contentConfigTitle').textContent = groupTitle(kind); $('#contentConfigDescription').textContent = `每个分组是一份独立的学习清单。新增分组会先以空白草稿显示；填写至少两项内容并保存后，才会成为${kind === 'hanzi' ? '汉字图书塔' : '单词森林'}当前使用的内容。`;
  renderContentGroupDirectory(kind);
  $('#contentGroupName').value = group.name; $('#contentGroupWords').value = group.words.join(kind === 'hanzi' ? '，' : ', ');
  $('#contentGroupNameLabel').textContent = `${kind === 'hanzi' ? '汉字' : '英文'}分组名称`; $('#contentGroupWordsLabel').textContent = `${groupWordLabel(kind)}（用逗号、分号或换行分隔）`;
  $('#contentConfigModal').classList.add('open'); $('#contentConfigModal').setAttribute('aria-hidden', 'false'); setTimeout(() => $('.content-group-card.active', $('#contentGroupList'))?.focus(), 80);
}
function closeContentConfig() { const kind = $('#contentConfigType').value; $('#contentConfigModal').classList.remove('open'); $('#contentConfigModal').setAttribute('aria-hidden', 'true'); if ($('#adminModal').classList.contains('open')) $(`#open${kind[0].toUpperCase()}${kind.slice(1)}Config`).focus(); else $('#parentButton').focus(); }
function selectedContentGroup(kind) { return editingContentGroup(kind); }
function refreshContentConfig(kind) { openContentConfig(kind); }
function chooseContentGroup(groupId) {
  const kind = $('#contentConfigType').value; const group = contentGroups(kind).find((item) => item.id === groupId) || editingContentGroup(kind);
  editingContentGroupIds[kind] = group.id; refreshContentConfig(kind);
}
function saveSelectedContentGroup() {
  const kind = $('#contentConfigType').value; const group = selectedContentGroup(kind); const name = $('#contentGroupName').value.trim().slice(0, 16); const words = normaliseContentWords(kind, $('#contentGroupWords').value);
  if (!name) { showToast('请为分组取一个名称。'); $('#contentGroupName').focus(); return; }
  if (words.length < 2) { showToast(`${kind === 'hanzi' ? '汉字' : '英文'}分组至少填写 2 项。`); $('#contentGroupWords').focus(); return; }
  group.name = name; group.words = words; adminContent[activeContentGroupKey(kind)] = group.id; editingContentGroupIds[kind] = group.id; saveContentConfiguration(); applyAdminContent(); renderAdminContentSummary();
  if (state.activeTheme === kind) { state.round = 0; state.completed = false; persistProgress(); }
  renderHome(); refreshContentConfig(kind); showToast(`“${name}”已保存，并设为正在学习。`);
}
function addContentGroup() {
  const kind = $('#contentConfigType').value; const groups = contentGroups(kind); const group = { id: `${kind}-${Date.now()}`, name: '', words: [] };
  groups.push(group); editingContentGroupIds[kind] = group.id; saveContentConfiguration(); refreshContentConfig(kind); $('#contentGroupName').focus(); showToast('已新增空白分组，请填写名称和学习内容。');
}
function deleteContentGroup() {
  const kind = $('#contentConfigType').value; const groups = contentGroups(kind);
  if (groups.length <= 1) { showToast('每种内容至少保留一个分组。'); return; }
  const group = selectedContentGroup(kind); const index = groups.findIndex((item) => item.id === group.id); const wasActive = group.id === adminContent[activeContentGroupKey(kind)]; groups.splice(index, 1);
  if (wasActive) adminContent[activeContentGroupKey(kind)] = (groups.find((item) => item.name && item.words.length >= 2) || groups[0]).id;
  editingContentGroupIds[kind] = (groups[Math.max(0, index - 1)] || groups[0]).id; saveContentConfiguration(); applyAdminContent(); renderAdminContentSummary();
  if (state.activeTheme === kind) { state.round = 0; state.completed = false; persistProgress(); }
  renderHome(); refreshContentConfig(kind); showToast('分组已删除。');
}
function renderRecitalPieceList() {
  const active = activeRecitalPiece(); const pieces = recitalPieces();
  $('#recitalPieceList').innerHTML = pieces.map((piece) => `<button class="content-group-card ${piece.id === active.id ? 'active' : ''}" type="button" data-recital-piece="${escapeHtml(piece.id)}" aria-pressed="${piece.id === active.id}"><span class="content-group-card-head"><b>${escapeHtml(piece.title)}</b>${piece.id === active.id ? '<em>正在朗诵</em>' : ''}</span><span class="content-group-card-meta">${piece.lines.length} 句文本</span><span class="content-group-card-words">${piece.lines.slice(0, 2).map((line) => `<span>${escapeHtml(line)}</span>`).join('')}${piece.lines.length > 2 ? `<i>+${piece.lines.length - 2}</i>` : ''}</span></button>`).join('');
  $$('[data-recital-piece]', $('#recitalPieceList')).forEach((button) => button.addEventListener('click', () => chooseRecitalPiece(button.dataset.recitalPiece)));
}
function openRecitalConfig() {
  const piece = activeRecitalPiece(); $('#recitalPieceTitle').value = piece.title; $('#recitalPieceLines').value = piece.lines.join('\n'); renderRecitalPieceList();
  $('#recitalConfigModal').classList.add('open'); $('#recitalConfigModal').setAttribute('aria-hidden', 'false'); setTimeout(() => $('.content-group-card.active', $('#recitalPieceList'))?.focus(), 80);
}
function closeRecitalConfig() { $('#recitalConfigModal').classList.remove('open'); $('#recitalConfigModal').setAttribute('aria-hidden', 'true'); $('#openRecitalConfig').focus(); }
function chooseRecitalPiece(id) { const piece = recitalPieces().find((item) => item.id === id) || activeRecitalPiece(); adminContent.activeRecitalPieceId = piece.id; saveContentConfiguration(); applyAdminContent(); renderAdminContentSummary(); if (state.activeTheme === 'action') { state.round = 0; state.completed = false; persistProgress(); } renderHome(); openRecitalConfig(); showToast(`已切换到《${piece.title}》，将按行朗诵。`); }
function saveRecitalPiece() {
  const piece = activeRecitalPiece(); const title = $('#recitalPieceTitle').value.trim().slice(0, 24); const lines = normaliseRecitalLines($('#recitalPieceLines').value);
  if (!title) { showToast('请填写篇目名称。'); $('#recitalPieceTitle').focus(); return; }
  if (!lines.length) { showToast('请至少添加一行朗诵文本。'); $('#recitalPieceLines').focus(); return; }
  piece.title = title; piece.lines = lines; saveContentConfiguration(); applyAdminContent(); renderAdminContentSummary(); if (state.activeTheme === 'action') { state.round = 0; state.completed = false; persistProgress(); } renderHome(); openRecitalConfig(); showToast(`《${title}》已保存，共 ${lines.length} 句。`);
}
function addRecitalPiece() { const pieces = recitalPieces(); const piece = { id: `recital-${Date.now()}`, title: '新朗诵篇目', lines: ['请填写第一句文本。'] }; pieces.push(piece); adminContent.activeRecitalPieceId = piece.id; saveContentConfiguration(); applyAdminContent(); renderAdminContentSummary(); openRecitalConfig(); $('#recitalPieceTitle').select(); showToast('已新增篇目，请填写标题和每一句文本。'); }
function deleteRecitalPiece() { const pieces = recitalPieces(); if (pieces.length <= 1) { showToast('至少保留一篇朗诵文本。'); return; } const piece = activeRecitalPiece(); pieces.splice(pieces.findIndex((item) => item.id === piece.id), 1); adminContent.activeRecitalPieceId = pieces[0].id; saveContentConfiguration(); applyAdminContent(); renderAdminContentSummary(); if (state.activeTheme === 'action') { state.round = 0; state.completed = false; persistProgress(); } renderHome(); openRecitalConfig(); showToast('篇目已删除。'); }
function exportProgress() {
  state.study.backupAt = new Date().toISOString(); persistProgress();
  const payload = { version: 1, exportedAt: new Date().toISOString(), activeProfileId, profiles };
  const url = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' }));
  const link = document.createElement('a'); link.href = url; link.download = `luna-learning-${todayKey}.json`; link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000); showToast('学习记录已经导出。');
}
async function importProgress(file) {
  if (!file) return;
  try {
    const data = JSON.parse(await file.text());
    if (data?.version !== 1 || !Array.isArray(data.profiles) || !data.profiles.length) throw new Error('invalid backup');
    if (!window.confirm('导入会替换这台设备现有的学习记录，确定继续吗？')) return;
    profiles = data.profiles.filter((profile) => profile?.id && profile?.name).map((profile) => ({ ...createProfile(profile.name), ...profile }));
    activeProfileId = profiles.some((profile) => profile.id === data.activeProfileId) ? data.activeProfileId : profiles[0].id;
    const profile = activeProfile();
    state.activeTheme = profile.activeTheme || 'color'; state.completedThemes = profile.completedThemes || []; state.learnedWords = profile.learnedWords || [];
    state.stars = Number(profile.stars || 0); state.daily = dailyFor(profile); state.streak = profile.streak || { count: 0, lastCompletedDate: '' };
    state.recordingEnabled = Boolean(profile.recordingEnabled); state.world = profile.world || {}; state.achievements = profile.achievements || []; state.study = profile.study || { date: todayKey, seconds: 0, limitMinutes: 5, backupAt: '' }; state.ocOwned = profile.ocOwned || []; state.ocAvatar = profile.ocAvatar || cloneStarterAvatar();
    state.round = 0; state.completed = false; state.roundLocked = false;
    persistProgress(); renderHome(); renderWardrobe(); renderParentProfileControls(); setScreen('home'); showToast('学习记录导入成功。');
  } catch {
    showToast('这个备份文件无法导入，请选择由魔法城堡导出的 JSON 文件。');
  }
}

function openHanziBook() { const entries = Object.entries(state.wordProgress).filter(([key]) => key.startsWith('hanzi:')).map(([key, item]) => ({ word: key.split(':')[1], item })); const groups = [['已掌握', entries.filter(({ item }) => item.mastered)], ['正在学习', entries.filter(({ item }) => !item.mastered && item.learn)], ['等待复习', entries.filter(({ item }) => item.mastered && item.dueDate <= todayKey)]]; $('#hanziBookList').innerHTML = entries.length ? groups.map(([label, words]) => words.length ? `<section><h3>${label}</h3><div>${words.map(({ word }) => `<article><b>${word}</b><span>${label}</span></article>`).join('')}</div></section>` : '').join('') : '<p class="hanzi-book-empty">先去汉字图书塔完成探险吧。</p>'; $('#hanziBookModal').classList.add('open'); $('#hanziBookModal').setAttribute('aria-hidden', 'false'); setTimeout(() => $('#closeHanziBook').focus(), 80); }
function closeHanziBook() { $('#hanziBookModal').classList.remove('open'); $('#hanziBookModal').setAttribute('aria-hidden', 'true'); $('#hanziBookButton').focus(); }
function openAchievements() { $('#achievementList').innerHTML = ACHIEVEMENT_DEFINITIONS.map(({ id, label }) => `<article class="${state.achievements.includes(id) ? 'earned' : ''}"><b>${state.achievements.includes(id) ? '✦' : '○'}</b><span>${label}</span><small>${state.achievements.includes(id) ? '已获得' : '继续探险解锁'}</small></article>`).join(''); $('#achievementModal').classList.add('open'); $('#achievementModal').setAttribute('aria-hidden', 'false'); setTimeout(() => $('#closeAchievements').focus(), 80); }
function closeAchievements() { $('#achievementModal').classList.remove('open'); $('#achievementModal').setAttribute('aria-hidden', 'true'); $('#achievementButton').focus(); }
$$('[data-screen]').forEach((button) => button.addEventListener('click', () => setScreen(button.dataset.screen)));
$('#topbarLessonTitle').addEventListener('click', () => { if (state.screen !== 'lesson') setScreen('lesson'); });
$$('.mini-speak').forEach((button) => button.addEventListener('click', () => speak(button.dataset.say)));
$('#playToday').addEventListener('click', () => selectTheme(state.activeTheme, true));
$('#homePrimaryAction').addEventListener('click', () => selectTheme(state.activeTheme, true));
$('#magicHouse').addEventListener('click', () => { setScreen('closet'); showToast('欢迎来到魔法屋，给露娜换上新装吧！'); });
$('#soundToggle').addEventListener('click', () => { state.soundOn = !state.soundOn; $('#soundToggle').setAttribute('aria-pressed', String(state.soundOn)); $('#soundToggle').setAttribute('aria-label', state.soundOn ? '关闭声音' : '打开声音'); $('#soundToggle').classList.toggle('muted', !state.soundOn); if (!state.soundOn) { window.speechSynthesis?.cancel(); stopNativeTts(); } });
$('#parentButton').addEventListener('click', openParent); $('#closeParent').addEventListener('click', closeParent); $('#disableParentMode').addEventListener('click', disableParentMode);
$$('[data-parent-tab]').forEach((button) => button.addEventListener('click', () => setParentTab(button.dataset.parentTab)));
$('#parentGateForm').addEventListener('submit', (event) => { event.preventDefault(); if (Number($('#parentGateAnswer').value) === parentGateAnswer) unlockParent(); else { $('#parentGateError').hidden = false; $('#parentGateAnswer').select(); } });
$('#profileSelect').addEventListener('change', (event) => switchProfile(event.target.value));
$('#createProfile').addEventListener('click', () => { const input = $('#newProfileName'); const name = input.value.trim(); if (!name) { input.focus(); return; } const profile = createProfile(name); profiles.push(profile); input.value = ''; switchProfile(profile.id); showToast(`已为 ${profile.name} 建立新的学习档案。`); });
$('#dailyLimitSelect').addEventListener('change', (event) => { state.study.limitMinutes = Number(event.target.value); persistProgress(); renderParentProfileControls(); showToast(state.study.limitMinutes ? `已设置每日 ${state.study.limitMinutes} 分钟探险时间。` : '已取消每日探险时间限制。'); });
$('#speechRate').addEventListener('input', (event) => { globalSpeechRate = clamp(Number(event.target.value), .5, 1.5); saveText('luna-global-speech-rate', String(globalSpeechRate)); renderSpeechRateControl(); });
$('#speechRate').addEventListener('change', () => { window.speechSynthesis?.cancel(); showToast(`全局朗读语速已设为${speechRateLabel()}。`); });
$('#hanziBookButton').addEventListener('click', openHanziBook); $('#closeHanziBook').addEventListener('click', closeHanziBook); $('#achievementButton').addEventListener('click', openAchievements); $('#closeAchievements').addEventListener('click', closeAchievements);
$('#recordingToggle').addEventListener('click', () => { state.recordingEnabled = !state.recordingEnabled; persistProgress(); renderParentProfileControls(); showToast(state.recordingEnabled ? '已开启录音跟读；录音只留在当前页面。' : '已关闭录音跟读。'); });
$('#adminButton').addEventListener('click', () => { closeParent(); openAdmin(); });
$('#closeAdmin').addEventListener('click', closeAdmin);
$('#openEnglishConfig').addEventListener('click', () => openContentConfig('english')); $('#openHanziConfig').addEventListener('click', () => openContentConfig('hanzi')); $('#openRecitalConfig').addEventListener('click', openRecitalConfig);
$('#closeContentConfig').addEventListener('click', closeContentConfig); $('#saveContentGroup').addEventListener('click', saveSelectedContentGroup); $('#addContentGroup').addEventListener('click', addContentGroup); $('#deleteContentGroup').addEventListener('click', deleteContentGroup);
$('#contentConfigModal').addEventListener('click', (event) => { if (event.target === $('#contentConfigModal')) closeContentConfig(); });
$('#closeRecitalConfig').addEventListener('click', closeRecitalConfig); $('#addRecitalPiece').addEventListener('click', addRecitalPiece); $('#saveRecitalPiece').addEventListener('click', saveRecitalPiece); $('#deleteRecitalPiece').addEventListener('click', deleteRecitalPiece); $('#recitalConfigModal').addEventListener('click', (event) => { if (event.target === $('#recitalConfigModal')) closeRecitalConfig(); });
$('#exportProgress').addEventListener('click', exportProgress);
$('#importProgress').addEventListener('click', () => $('#importProgressFile').click());
$('#importProgressFile').addEventListener('change', (event) => { importProgress(event.target.files[0]); event.target.value = ''; });
function isStandaloneApp() {
  return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
}
function updateInstallButton() {
  const button = $('#installApp');
  if (!button) return;
  button.hidden = isStandaloneApp();
  button.textContent = deferredInstallPrompt ? '安装到手机桌面' : '怎样添加到桌面';
}
window.addEventListener('beforeinstallprompt', (event) => {
  event.preventDefault();
  deferredInstallPrompt = event;
  updateInstallButton();
});
window.addEventListener('appinstalled', () => {
  deferredInstallPrompt = null;
  updateInstallButton();
  showToast('魔法城堡已经安装到桌面啦！');
});
$('#installApp').addEventListener('click', async () => {
  if (!deferredInstallPrompt) {
    showToast('iPhone/iPad：Safari 点分享，再选“添加到主屏幕”；Android：浏览器菜单中选择“安装应用”。');
    return;
  }
  deferredInstallPrompt.prompt();
  await deferredInstallPrompt.userChoice;
  deferredInstallPrompt = null;
  updateInstallButton();
});
if ('serviceWorker' in navigator && location.protocol !== 'file:') {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./service-worker.js').then((registration) => {
      if (registration.waiting) showToast('城堡有新内容，重新打开后即可使用。');
      registration.addEventListener('updatefound', () => {
        const worker = registration.installing;
        worker?.addEventListener('statechange', () => { if (worker.state === 'installed' && navigator.serviceWorker.controller) showToast('城堡地图已更新，重新打开后即可使用。'); });
      });
    }).catch(() => {
      // The game remains fully usable online if an older browser cannot register a worker.
    });
  });
}
updateInstallButton();
$('#voiceTest').addEventListener('click', () => { chooseEnglishVoice(); speak(`Hello, ${childName()}! I am Luna. Let us learn English together.`); });
$('#childVoiceToggle').addEventListener('click', () => { state.childFriendlyVoice = !state.childFriendlyVoice; saveText('luna-child-friendly-voice', String(state.childFriendlyVoice)); $('#childVoiceToggle').setAttribute('aria-pressed', String(state.childFriendlyVoice)); $('#childVoiceToggle').textContent = state.childFriendlyVoice ? '儿童感朗读：已开启' : '儿童感朗读：已关闭'; showToast(state.childFriendlyVoice ? '已使用更慢、更明亮的朗读方式。' : '已使用标准英语朗读方式。'); });
$('#childVoiceToggle').setAttribute('aria-pressed', String(state.childFriendlyVoice)); $('#childVoiceToggle').textContent = state.childFriendlyVoice ? '儿童感朗读：已开启' : '儿童感朗读：已关闭';
$('#claimReward').addEventListener('click', () => { closeReward(); $('#newDot').hidden = false; setScreen('closet'); showToast('新的 OC-English 装扮已经放进衣橱！'); });
$('#dailyWrapHome').addEventListener('click', () => { closeDailyWrapUp(); setScreen('home'); });
$('#dailyWrapCloset').addEventListener('click', () => { closeDailyWrapUp(); setScreen('closet'); });
$('#parentModal').addEventListener('click', (event) => { if (event.target === $('#parentModal')) closeParent(); });
$('#resetProgress').addEventListener('click', () => { state.round = 0; state.completed = false; state.roundLocked = false; closeParent(); setScreen('home'); showToast('今天的挑战已经从第一关重新开始。'); });
document.addEventListener('visibilitychange', () => { if (!document.hidden) refreshDailyBoundary(); });
window.addEventListener('popstate', () => { const [,screen = 'home', theme] = location.hash.match(/^#([^/]+)\/?(.*)?/) || []; if (theme && THEMES[theme]) state.activeTheme = theme; setScreen(['home','lesson','closet'].includes(screen) ? screen : 'home', { push: false }); });
document.addEventListener('keydown', handleLessonShortcuts);
document.addEventListener('keydown', (event) => { if (event.key === 'Escape' && $('#recitalConfigModal').classList.contains('open')) closeRecitalConfig(); else if (event.key === 'Escape' && $('#contentConfigModal').classList.contains('open')) closeContentConfig(); else if (event.key === 'Escape' && $('#parentModal').classList.contains('open')) closeParent(); else if (event.key === 'Escape' && $('#rewardModal').classList.contains('open')) closeReward(); else if (event.key === 'Escape' && $('#dailyModal').classList.contains('open')) closeDailyWrapUp(); else if (event.key === 'Escape' && $('#adminModal').classList.contains('open')) closeAdmin(); else if (event.key === 'Escape' && $('#hanziBookModal').classList.contains('open')) closeHanziBook(); else if (event.key === 'Escape' && $('#achievementModal').classList.contains('open')) closeAchievements(); });

$('.app-shell').classList.add('home-active'); $('#topbarLessonTitle b').textContent = currentTheme().title; mountHomeMap(); renderWardrobe(); renderHome(); updateProgress(); renderParentModeState(); renderSpeechRateControl(); renderParentProfileControls(); if (location.hash) window.dispatchEvent(new PopStateEvent('popstate'));
