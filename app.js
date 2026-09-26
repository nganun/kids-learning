import { getPartOptions, renderCharacterSVG } from './assets/oc-english/character.js';
import { wardrobeThumb } from './assets/oc-english/wardrobe.js';
import { OC_WARDROBE } from './assets/oc-english/wardrobe-data.js';

const CHILD_NAME = '荆宝';
let deferredInstallPrompt = null;
const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const storageGet = (key) => { try { return localStorage.getItem(key); } catch { return null; } };
const save = (key, value) => { try { localStorage.setItem(key, JSON.stringify(value)); return true; } catch { showToast?.('这台设备暂时无法保存学习记录。'); return false; } };
const saveText = (key, value) => { try { localStorage.setItem(key, value); return true; } catch { showToast?.('这台设备暂时无法保存学习记录。'); return false; } };
const load = (key, fallback) => { try { return JSON.parse(storageGet(key)) ?? fallback; } catch { return fallback; } };

let THEMES = {
  color: { id: 'color', title: 'Color Magic', subtitle: '颜色魔法', words: ['red', 'yellow', 'blue'], rewards: ['hat_crown', 'top_dress', 'bottom_tutu', 'shoes_glass', 'back_wings'],
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
  animal: { id: 'animal', title: 'Animal Garden', subtitle: '动物花园', words: ['cat', 'dog', 'rabbit'], rewards: ['hat_straw', 'held_bear', 'back_butterfly', 'shoes_sandal'],
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
  action: { id: 'action', title: 'Action Party', subtitle: '动作派对', words: ['jump', 'clap', 'dance'], rewards: ['hat_cap', 'top_sport', 'bottom_shorts', 'shoes_sport', 'held_balloon'],
    rounds: [
      { type: 'learn', chip: '认识单词', word: 'jump', image: 'assets/vocabulary/jump.svg', zh: '看一看，jump 是跳一跳。' },
      { type: 'learn', chip: '认识单词', word: 'clap', image: 'assets/vocabulary/clap.svg', zh: '看一看，clap 是拍拍手。' },
      { type: 'learn', chip: '认识单词', word: 'dance', image: 'assets/vocabulary/dance.svg', zh: '看一看，dance 是跳舞。' },
    ],
    reviewRounds: [
      { type: 'match', chip: '魔法复习', prompt: 'Which word matches?', word: 'jump', image: 'assets/vocabulary/jump.svg', zh: '看图片，选出对应的英文单词。', choices: ['jump', 'clap'], correct: 'jump' },
      { type: 'listen', chip: '听音找一找', prompt: 'Find clap!', word: 'clap', image: 'assets/vocabulary/clap.svg', zh: '听一听，找到对应的图片。', choices: ['dance', 'clap'], correct: 'clap' },
      { type: 'match', chip: '魔法复习', prompt: 'Which word matches?', word: 'dance', image: 'assets/vocabulary/dance.svg', zh: '看图片，选出对应的英文单词。', choices: ['jump', 'dance'], correct: 'dance' },
    ],
  },
  number: { id: 'number', title: 'Number Magic', subtitle: '数字魔法', words: ['one', 'two', 'three'], rewards: ['hat_wizard', 'gl_star', 'top_sailor', 'held_book'],
    rounds: [
      { type: 'learn', chip: '认识数字', word: 'one', image: 'assets/vocabulary/one.svg', zh: '看一看，这是 one，一颗星星。' },
      { type: 'learn', chip: '认识数字', word: 'two', image: 'assets/vocabulary/two.svg', zh: '看一看，这是 two，两朵花。' },
      { type: 'learn', chip: '认识数字', word: 'three', image: 'assets/vocabulary/three.svg', zh: '看一看，这是 three，三个气球。' },
    ],
    reviewRounds: [
      { type: 'match', chip: '魔法复习', prompt: 'Which word matches?', word: 'one', image: 'assets/vocabulary/one.svg', zh: '看数量，选出对应的英文单词。', choices: ['one', 'two'], correct: 'one' },
      { type: 'listen', chip: '听音找一找', prompt: 'Find two!', word: 'two', image: 'assets/vocabulary/two.svg', zh: '听一听，找到对应的数量图片。', choices: ['one', 'two'], correct: 'two' },
      { type: 'match', chip: '魔法复习', prompt: 'Which word matches?', word: 'three', image: 'assets/vocabulary/three.svg', zh: '看数量，选出对应的英文单词。', choices: ['two', 'three'], correct: 'three' },
    ],
  },
};

const ADMIN_DEFAULT = { pin: '2468', english: ['red', 'yellow', 'blue'], hanzi: ['人', '大人', '人口'] };
const adminContent = load('luna-admin-content-v1', ADMIN_DEFAULT);
function safeEnglishWords(value) { return String(value).split(/[，,；;\n]/).map((word) => word.trim().toLowerCase()).filter((word) => /^[a-z]{1,16}$/.test(word)).slice(0, 8); }
function safeHanzi(value) { return String(value).split(/[，,；;\n]/).map((term) => term.trim()).filter((term) => /^[\p{Script=Han}]{1,8}$/u.test(term)).slice(0, 8); }
function textCard(text, fill = '#f1e8ff') { return `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 180"><rect width="240" height="180" rx="28" fill="${fill}"/><text x="120" y="108" text-anchor="middle" font-family="sans-serif" font-size="${text.length > 5 ? 42 : 72}" font-weight="800" fill="#6744a5">${text}</text></svg>`)}`; }
function buildCustomTheme(id, title, subtitle, words, isHanzi = false) {
  const fallback = isHanzi ? ['人', '大人', '人口'] : ['red', 'yellow', 'blue'];
  const list = words.length >= 2 ? words : fallback;
  const rounds = list.map((word) => ({ type: 'learn', chip: isHanzi ? (word.length > 1 ? '认识词组' : '认识汉字') : '认识单词', word, image: isHanzi ? textCard(word, '#fff0dc') : wordImage(word) || textCard(word), zh: isHanzi ? `看一看，读一读“${word}”。` : `看一看，这是 ${word}。` }));
  const reviewRounds = list.map((word, index) => { const other = list[(index + 1) % list.length]; return { type: index % 2 ? 'listen' : 'match', chip: index % 2 ? '听音找一找' : '魔法复习', prompt: isHanzi ? `Find ${word}` : 'Which word matches?', word, image: isHanzi ? textCard(word, '#fff0dc') : wordImage(word) || textCard(word), zh: isHanzi ? '听一听，找到对应的汉字或词组。' : '看图片，选出对应的英文单词。', choices: [word, other], correct: word }; });
  return { id, title, subtitle, words: list, rewards: ['hat_wizard', 'gl_star', 'held_book'], rounds, reviewRounds };
}
function applyAdminContent() {
  THEMES.english = buildCustomTheme('english', 'My English', '我的英文', Array.isArray(adminContent.english) ? adminContent.english : ADMIN_DEFAULT.english);
  THEMES.hanzi = buildCustomTheme('hanzi', 'Hanzi Magic', '汉字魔法', Array.isArray(adminContent.hanzi) ? adminContent.hanzi : ADMIN_DEFAULT.hanzi, true);
}


const WORD_TRANSLATIONS = {
  red: '红色', yellow: '黄色', blue: '蓝色',
  cat: '小猫', dog: '小狗', rabbit: '小兔子',
  jump: '跳一跳', clap: '拍拍手', dance: '跳舞',
  one: '一', two: '二', three: '三',
};
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
  action: { name: '舞动广场', hint: '跳一跳，拍拍手', icon: 'spark' },
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
applyAdminContent();

const OC_CATEGORY_META = [
  { id: 'hair', label: '发型', slot: null }, { id: 'hat', label: '帽子', slot: 'hat' },
  { id: 'glasses', label: '眼镜', slot: 'glasses' }, { id: 'top', label: '上衣', slot: 'top' },
  { id: 'bottom', label: '下装', slot: 'bottom' }, { id: 'shoes', label: '鞋子', slot: 'shoes' },
  { id: 'held', label: '手持', slot: 'held' }, { id: 'back', label: '背饰', slot: 'back' },
  { id: 'earring', label: '耳饰', slot: 'earring' },
];
const OC_PART_OPTIONS = getPartOptions();
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
  screen: 'home', soundOn: true, childFriendlyVoice: storageGet('luna-child-friendly-voice') !== 'false', round: 0, completed: false, roundLocked: false,
  activeTheme: initialProfile.activeTheme || 'color', lessonMode: 'learn',
  completedThemes: initialProfile.completedThemes || [], learnedWords: initialProfile.learnedWords || [], wordProgress: initialProfile.wordProgress || {},
  stars: Number(initialProfile.stars || 0), daily: dailyFor(initialProfile),
  streak: initialProfile.streak || { count: 0, lastCompletedDate: '' },
  recordingEnabled: Boolean(initialProfile.recordingEnabled),
  ocTab: 'hair', ocOwned: initialProfile.ocOwned || ['top_starter', 'bottom_starter', 'shoes_starter', 'held_flower'],
  ocAvatar: initialProfile.ocAvatar || cloneStarterAvatar(),
};
function syncActiveProfile() {
  const profile = activeProfile();
  Object.assign(profile, {
    activeTheme: state.activeTheme, completedThemes: state.completedThemes, learnedWords: state.learnedWords, wordProgress: state.wordProgress,
    stars: state.stars, dailyDate: todayKey, daily: state.daily, streak: state.streak,
    recordingEnabled: state.recordingEnabled, ocOwned: state.ocOwned, ocAvatar: state.ocAvatar,
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
  return state.lessonMode === 'review' ? currentTheme().reviewRounds : currentTheme().rounds;
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
  state.recordingEnabled = Boolean(profile.recordingEnabled);
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
function speak(text, onend) {
  const run = ++speechRun;
  if (!state.soundOn || !('speechSynthesis' in window)) { onend?.(); return false; }
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = preferredEnglishVoice?.lang || 'en-US';
  utterance.voice = preferredEnglishVoice || chooseEnglishVoice();
  utterance.rate = state.childFriendlyVoice ? .80 : .84;
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
  if (!state.soundOn || !('speechSynthesis' in window)) { onend?.(); return false; }
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = preferredChineseVoice?.lang || 'zh-CN';
  utterance.voice = preferredChineseVoice || chooseChineseVoice();
  utterance.rate = state.childFriendlyVoice ? .76 : .82;
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
  state.screen = name;
  if (push && location.hash !== routeFor(name)) history.pushState({ screen: name, theme: state.activeTheme }, '', routeFor(name));
  $('.app-shell').classList.toggle('home-active', name === 'home');
  $$('.screen').forEach((screen) => screen.classList.toggle('active', screen.id === `${name}Screen`));
  $$('.nav-item').forEach((button) => button.classList.toggle('active', button.dataset.screen === name));
  if (name === 'lesson') renderRound();
  if (name === 'closet') renderWardrobe();
  $('#main').focus({ preventScroll: true });
}

function refreshDailyBoundary() { const next = localDateKey(); if (next !== todayKey) { todayKey = next; state.daily = dailyFor(activeProfile()); persistProgress(); renderHome(); updateProgress(); } }
function masteredWordCount() { return Object.values(state.wordProgress).filter((item) => item.mastered).length; }
function recordWordProgress(word, kind) { const key = `${state.activeTheme}:${word}`; const item = state.wordProgress[key] || { learn: 0, review: 0, mastered: false, dueDate: todayKey }; if (kind === 'learn') item.learn += 1; else item.review += 1; item.lastSeen = todayKey; item.mastered = item.learn >= 1 && item.review >= 2; item.dueDate = item.mastered ? new Date(Date.now() + 3 * 86400000).toISOString().slice(0, 10) : todayKey; state.wordProgress[key] = item; }
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
function themeNeedsReview(theme) {
  return theme.words.some((word) => { const progress = state.wordProgress[`${theme.id}:${word}`]; return progress?.mastered && progress.dueDate <= todayKey; });
}
function recommendedThemeId() {
  const due = Object.values(THEMES).find(themeNeedsReview);
  if (due) return due.id;
  return Object.values(THEMES).find((theme) => !state.completedThemes.includes(theme.id))?.id || state.activeTheme;
}
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
  $('#themeCards').innerHTML = Object.values(THEMES).map((theme) => {
    const done = state.completedThemes.includes(theme.id);
    const reviewDue = themeNeedsReview(theme);
    const unavailable = state.lessonMode === 'review' && !done;
    const map = MAP_META[theme.id] || { name: theme.title, hint: theme.subtitle, icon: 'spark' };
    const status = state.lessonMode === 'review' ? (done ? '再次探险' : '先完成学习') : (done ? '已经点亮 · 再去看看' : map.hint);
    return `<button class="theme-card map-node map-${theme.id} ${theme.id === state.activeTheme ? 'active' : ''} ${unavailable ? 'needs-learning' : ''} ${theme.id === recommended ? 'recommended' : ''} ${reviewDue ? 'review-due' : ''}" type="button" data-theme="${theme.id}" aria-label="${map.name}，${status}"><span class="theme-orb map-icon">${mapIcon(map.icon)}</span><span class="map-copy"><strong>${map.name}</strong></span></button>`;
  }).join('');
  $$('[data-theme]').forEach((button) => button.addEventListener('click', () => selectTheme(button.dataset.theme, true)));
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
  $('#progressLabel').textContent = state.completed ? (state.lessonMode === 'review' ? '复习完成啦！' : '魔法完成啦！') : `第 ${state.round + 1} 关，共 ${total} 关`;
  $('#progressFill').style.width = `${(Math.min(state.round, total) / total) * 100}%`;
}

function startLearnCountdown(seconds = 3) {
  const button = $('#learnNext');
  const label = $('#learnNextLabel');
  const progress = $('#learnCountdownProgress');
  if (!button || !label || !progress) return;
  clearInterval(learnCountdownTimer);
  let remaining = seconds;
  button.disabled = true;
  button.setAttribute('aria-disabled', 'true');
  label.textContent = `先听一听（${remaining}）`;
  progress.style.width = '0%';
  learnCountdownTimer = window.setInterval(() => {
    remaining -= 1;
    progress.style.width = `${((seconds - remaining) / seconds) * 100}%`;
    if (remaining <= 0) {
      clearInterval(learnCountdownTimer);
      button.disabled = false;
      button.removeAttribute('aria-disabled');
      label.textContent = '我认识啦';
      progress.style.width = '100%';
      button.classList.add('ready');
      return;
    }
    label.textContent = `先听一听（${remaining}）`;
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

function sentenceMarkup(word) {
  const sentence = WORD_SENTENCES[word];
  if (!sentence) return '';
  return `<div class="sentence-card"><b>${sentence.text}</b><span>${sentence.zh}</span><button type="button" data-sentence="${sentence.text}">听整句话</button></div>`;
}
function bindSentenceButtons(area) { $$('[data-sentence]', area).forEach((button) => button.addEventListener('click', () => speak(button.dataset.sentence))); }
function renderRound() {
  const theme = currentTheme();
  $('#lessonTitle').innerHTML = `${theme.title.split(' ')[0]}<br />${theme.title.split(' ').slice(1).join(' ')}`;
  if (state.completed) return renderCompletion();
  state.roundLocked = false;
  const game = currentRounds()[state.round];
  $('#roundChip').textContent = game.chip;
  $('#promptSpeak').onclick = () => speakForCurrentTheme(currentTheme().id === 'hanzi' ? game.word : (game.type === 'match' ? game.prompt : game.word));
  const area = $('#gameArea');
  if (game.type === 'learn') {
    const recordingAction = state.recordingEnabled ? '<button class="record-practice" id="recordPractice" type="button">跟我说一说</button><div id="practicePlayback"></div>' : '';
    area.innerHTML = `<div class="learn-word-card"><img src="${game.image}" alt="${game.word} 的图片" /><div><p>${currentTheme().id === 'hanzi' ? '看一看，听一听' : 'Look and listen'}</p><h2>${game.word}</h2><strong class="word-translation">中文：${(WORD_TRANSLATIONS[game.word] || game.word)}</strong><span>${game.zh}</span></div><button class="primary-button" id="learnNext" type="button" disabled aria-disabled="true"><span class="learn-next-copy"><span id="learnNextLabel">先听一听（3）</span><span class="learn-countdown-track" aria-hidden="true"><i id="learnCountdownProgress"></i></span></span><svg viewBox="0 0 24" aria-hidden="true"><path d="m9 5 7 7-7 7"/></svg></button></div>${sentenceMarkup(game.word)}${recordingAction}`;
    $('#learnNext').addEventListener('click', () => handleCorrect(game.word, 'learn'));
    $('#recordPractice')?.addEventListener('click', recordPractice);
    startLearnCountdown(3);
  } else if (game.type === 'listen') {
    area.innerHTML = `<div class="match-word-card"><img src="${game.image}" alt="${game.word} 的图片" /><div class="game-copy"><h2>Listen<br /><em>and find</em></h2><strong class="match-translation">中文：${game.zh}</strong><p>先听一遍，再点图片。</p></div></div><button class="review-listen-action" id="reviewListenAction" type="button">听一听 <svg viewBox="0 0 24" aria-hidden="true"><path d="M4 10v4h4l5 4V6L8 10H4Zm12.5 2A4.5 4.5 0 0 0 14 8v2a2.5 2.5 0 0 1 0 4v2a4.5 4.5 0 0 0 2.5-4Z"/></svg></button><div class="picture-choice-row">${game.choices.map((choice) => `<button class="picture-choice" type="button" data-choice="${choice}"><img src="${wordImage(choice)}" alt="${(WORD_TRANSLATIONS[choice] || choice)}" /><b>${(WORD_TRANSLATIONS[choice] || choice)}</b></button>`).join('')}</div>`;
    $('#reviewListenAction').addEventListener('click', () => { speakForCurrentTheme(game.word); $$('.picture-choice', area).forEach((button) => button.classList.add('attention')); setTimeout(() => $$('.picture-choice', area).forEach((button) => button.classList.remove('attention')), 900); });
    $$('[data-choice]', area).forEach((button) => button.addEventListener('click', () => handleChoice(button, game)));
  } else {
    area.innerHTML = `<div class="match-word-card"><img src="${game.image}" alt="${game.word} 的图片" /><div class="game-copy"><h2>${game.prompt.split(' ').slice(0, 2).join(' ')}<br /><em>${game.prompt.split(' ').slice(2).join(' ')}</em></h2><strong class="match-translation">中文：${(WORD_TRANSLATIONS[game.word] || game.word)}</strong><p>${game.zh}</p></div></div><button class="review-listen-action" id="reviewListenAction" type="button">先听一遍，再选单词 <svg viewBox="0 0 24" aria-hidden="true"><path d="M4 10v4h4l5 4V6L8 10H4Zm12.5 2A4.5 4.5 0 0 0 14 8v2a4.5 4.5 0 0 1 0 4v2a4.5 2.5 0 0 0 2.5-4Z"/></svg></button><div class="word-choice-row">${game.choices.map((choice) => `<button class="word-choice ${theme.id}" type="button" data-choice="${choice}"><b>${choice}</b><span>点一个单词</span></button>`).join('')}</div>`;
    $('#reviewListenAction').addEventListener('click', () => { speakForCurrentTheme(game.word); $$('.word-choice', area).forEach((button) => button.classList.add('attention')); setTimeout(() => $$('.word-choice', area).forEach((button) => button.classList.remove('attention')), 900); });
    $$('[data-choice]', area).forEach((button) => button.addEventListener('click', () => handleChoice(button, game)));
  }
  bindSentenceButtons(area);
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
  setDailyTask('round'); playSuccessChime(); showToast(`你认识了 ${word}！`); persistProgress(); updateProgress();
  setTimeout(() => {
    if (state.round >= currentRounds().length) { if (state.lessonMode === 'review') completeReview(); else completeTheme(); }
    renderRound();
  }, kind === 'learn' ? 1350 : 850);
}
function completeReview() {
  state.completed = true;
  persistProgress();
  showToast('复习完成，荆宝记得很棒！');
}
function completeTheme() {
  const theme = currentTheme(); state.completed = true;
  state.completedThemes = Array.from(new Set([...state.completedThemes, theme.id]));
  state.ocOwned = Array.from(new Set([...state.ocOwned, ...theme.rewards]));
  saveOcAvatar(); setDailyTask('theme'); persistProgress(); $('#newDot').hidden = false;
}
function renderCompletion() {
  const theme = currentTheme();
  const reviewing = state.lessonMode === 'review';
  $('#roundChip').textContent = reviewing ? '复习完成' : '完成啦'; $('#promptSpeak').onclick = () => speak(reviewing ? `Great review, ${childName()}!` : `Great job, ${childName()}!`);
  $('#gameArea').innerHTML = reviewing
    ? `<div class="completion"><div class="completion-crown">✦</div><h2>复习完成！<br /><em>${theme.title}</em></h2><p>荆宝已经把这些单词又记牢了一次。</p><button class="primary-button" type="button" id="backHome">回到魔法花园 <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 5 7 7-7 7"/></svg></button></div>`
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
  $('#ocActionButton').textContent = category?.id === 'hair' ? '点这里，给露娜换发型' : `点这里，挑选${category?.label || '装扮'}`;
  renderOcTabs(); renderOcItems();
}
function renderOcTabs() {
  $('#ocCategoryTabs').innerHTML = OC_CATEGORY_META.map((category) => `<button class="oc-category-tab ${state.ocTab === category.id ? 'active' : ''}" type="button" data-oc-tab="${category.id}">${category.label}</button>`).join('');
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
function renderParentProfileControls() {
  const select = $('#profileSelect');
  if (!select) return;
  select.innerHTML = profiles.map((profile) => `<option value="${profile.id}" ${profile.id === activeProfileId ? 'selected' : ''}>${profile.name}</option>`).join('');
  $('#recordingToggle').setAttribute('aria-pressed', String(state.recordingEnabled));
  $('#recordingToggle').textContent = state.recordingEnabled ? '录音跟读：已开启' : '录音跟读：已关闭';
  updateProgress();
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
  $('#parentGate').hidden = true; $('#parentContent').hidden = false;
  renderParentProfileControls();
  $('#profileSelect').focus();
}
function openParent() {
  prepareParentGate(); $('#parentModal').classList.add('open'); $('#parentModal').setAttribute('aria-hidden', 'false');
  setTimeout(() => $('#parentGateAnswer').focus(), 100);
}
function closeParent() {
  $('#parentModal').classList.remove('open'); $('#parentModal').setAttribute('aria-hidden', 'true'); $('#parentButton').focus();
}
function openAdmin() { $('#adminModal').classList.add('open'); $('#adminModal').setAttribute('aria-hidden', 'false'); $('#adminGate').hidden = false; $('#adminContent').hidden = true; $('#adminPin').value = ''; $('#adminError').hidden = true; setTimeout(() => $('#adminPin').focus(), 100); }
function closeAdmin() { $('#adminModal').classList.remove('open'); $('#adminModal').setAttribute('aria-hidden', 'true'); $('#parentButton').focus(); }
function unlockAdmin() { $('#adminGate').hidden = true; $('#adminContent').hidden = false; $('#adminEnglish').value = (adminContent.english || ADMIN_DEFAULT.english).join(', '); $('#adminHanzi').value = (adminContent.hanzi || ADMIN_DEFAULT.hanzi).join('，'); $('#adminNewPin').value = ''; }
function saveAdminContent() {
  const english = safeEnglishWords($('#adminEnglish').value); const hanzi = safeHanzi($('#adminHanzi').value); const pin = $('#adminNewPin').value.trim();
  if (english.length < 2 || hanzi.length < 2) { showToast('英文和汉字各至少填写 2 项。'); return; }
  adminContent.english = english; adminContent.hanzi = hanzi;
  if (pin) { if (!/^\d{4,12}$/.test(pin)) { showToast('PIN 需要是 4 到 12 位数字。'); return; } adminContent.pin = pin; }
  save('luna-admin-content-v1', adminContent); applyAdminContent();
  if (!THEMES[state.activeTheme]) state.activeTheme = 'color'; state.round = 0; state.completed = false;
  persistProgress(); renderHome(); closeAdmin(); showToast('学习内容已保存，花园里出现了新的英文和汉字课程。');
}
function exportProgress() {
  persistProgress();
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
    state.recordingEnabled = Boolean(profile.recordingEnabled); state.ocOwned = profile.ocOwned || []; state.ocAvatar = profile.ocAvatar || cloneStarterAvatar();
    state.round = 0; state.completed = false; state.roundLocked = false;
    persistProgress(); renderHome(); renderWardrobe(); renderParentProfileControls(); setScreen('home'); showToast('学习记录导入成功。');
  } catch {
    showToast('这个备份文件无法导入，请选择由魔法城堡导出的 JSON 文件。');
  }
}

$$('[data-screen]').forEach((button) => button.addEventListener('click', () => setScreen(button.dataset.screen)));
$$('.mini-speak').forEach((button) => button.addEventListener('click', () => speak(button.dataset.say)));
$('#playToday').addEventListener('click', () => selectTheme(state.activeTheme, true));
$('#homePrimaryAction').addEventListener('click', () => selectTheme(state.activeTheme, true));
$('#ocActionButton').addEventListener('click', () => { $('#ocItemGrid').classList.add('child-choice-focus'); $('#ocItemGrid').scrollIntoView({ behavior: 'smooth', block: 'nearest' }); setTimeout(() => $('#ocItemGrid').classList.remove('child-choice-focus'), 1000); });
$('#soundToggle').addEventListener('click', () => { state.soundOn = !state.soundOn; $('#soundToggle').setAttribute('aria-pressed', String(state.soundOn)); $('#soundToggle').setAttribute('aria-label', state.soundOn ? '关闭声音' : '打开声音'); $('#soundToggle').classList.toggle('muted', !state.soundOn); if (!state.soundOn) window.speechSynthesis?.cancel(); });
$('#parentButton').addEventListener('click', openParent); $('#closeParent').addEventListener('click', closeParent);
$('#parentGateForm').addEventListener('submit', (event) => { event.preventDefault(); if (Number($('#parentGateAnswer').value) === parentGateAnswer) unlockParent(); else { $('#parentGateError').hidden = false; $('#parentGateAnswer').select(); } });
$('#profileSelect').addEventListener('change', (event) => switchProfile(event.target.value));
$('#createProfile').addEventListener('click', () => { const input = $('#newProfileName'); const name = input.value.trim(); if (!name) { input.focus(); return; } const profile = createProfile(name); profiles.push(profile); input.value = ''; switchProfile(profile.id); showToast(`已为 ${profile.name} 建立新的学习档案。`); });
$('#recordingToggle').addEventListener('click', () => { state.recordingEnabled = !state.recordingEnabled; persistProgress(); renderParentProfileControls(); showToast(state.recordingEnabled ? '已开启录音跟读；录音只留在当前页面。' : '已关闭录音跟读。'); });
$('#adminButton').addEventListener('click', () => { closeParent(); openAdmin(); });
$('#closeAdmin').addEventListener('click', closeAdmin);
$('#adminGateForm').addEventListener('submit', (event) => { event.preventDefault(); if ($('#adminPin').value === (adminContent.pin || ADMIN_DEFAULT.pin)) unlockAdmin(); else { $('#adminError').hidden = false; $('#adminPin').select(); } });
$('#saveAdminContent').addEventListener('click', saveAdminContent);
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
document.addEventListener('keydown', (event) => { if (event.key === 'Escape' && $('#parentModal').classList.contains('open')) closeParent(); if (event.key === 'Escape' && $('#rewardModal').classList.contains('open')) closeReward(); if (event.key === 'Escape' && $('#dailyModal').classList.contains('open')) closeDailyWrapUp(); if (event.key === 'Escape' && $('#adminModal').classList.contains('open')) closeAdmin(); });

$('.app-shell').classList.add('home-active'); mountHomeMap(); renderWardrobe(); renderHome(); updateProgress(); renderParentProfileControls(); if (location.hash) window.dispatchEvent(new PopStateEvent('popstate'));
