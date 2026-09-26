import { getPartOptions, renderCharacterSVG } from './assets/oc-english/character.js';
import { wardrobeThumb } from './assets/oc-english/wardrobe.js';
import { OC_WARDROBE } from './assets/oc-english/wardrobe-data.js';

const CHILD_NAME = '荆宝';
const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const save = (key, value) => localStorage.setItem(key, JSON.stringify(value));
const load = (key, fallback) => {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; }
};

const THEMES = {
  color: { id: 'color', title: 'Color Magic', subtitle: '颜色魔法', words: ['red', 'yellow', 'blue'], rewards: ['hat_crown', 'top_dress', 'bottom_tutu', 'shoes_glass', 'back_wings'],
    rounds: [
      { type: 'learn', chip: '认识单词', word: 'red', image: 'assets/vocabulary/red.svg', zh: '看一看，这是 red。' },
      { type: 'learn', chip: '认识单词', word: 'yellow', image: 'assets/vocabulary/yellow.svg', zh: '看一看，这是 yellow。' },
      { type: 'learn', chip: '认识单词', word: 'blue', image: 'assets/vocabulary/blue.svg', zh: '看一看，这是 blue。' },
    ],
    reviewRounds: [
      { type: 'match', chip: '魔法复习', prompt: 'Which word matches?', word: 'red', image: 'assets/vocabulary/red.svg', zh: '看图片，选出对应的英文单词。', choices: ['red', 'blue'], correct: 'red' },
      { type: 'match', chip: '魔法复习', prompt: 'Which word matches?', word: 'yellow', image: 'assets/vocabulary/yellow.svg', zh: '看图片，选出对应的英文单词。', choices: ['yellow', 'red'], correct: 'yellow' },
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
      { type: 'match', chip: '魔法复习', prompt: 'Which word matches?', word: 'dog', image: 'assets/vocabulary/dog.svg', zh: '看图片，选出对应的英文单词。', choices: ['rabbit', 'dog'], correct: 'dog' },
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
      { type: 'match', chip: '魔法复习', prompt: 'Which word matches?', word: 'clap', image: 'assets/vocabulary/clap.svg', zh: '看图片，选出对应的英文单词。', choices: ['dance', 'clap'], correct: 'clap' },
      { type: 'match', chip: '魔法复习', prompt: 'Which word matches?', word: 'dance', image: 'assets/vocabulary/dance.svg', zh: '看图片，选出对应的英文单词。', choices: ['jump', 'dance'], correct: 'dance' },
    ],
  },
};


const WORD_TRANSLATIONS = {
  red: '红色', yellow: '黄色', blue: '蓝色',
  cat: '小猫', dog: '小狗', rabbit: '小兔子',
  jump: '跳一跳', clap: '拍拍手', dance: '跳舞',
};

const OC_CATEGORY_META = [
  { id: 'hair', label: '发型', slot: null }, { id: 'hat', label: '帽子', slot: 'hat' },
  { id: 'glasses', label: '眼镜', slot: 'glasses' }, { id: 'top', label: '上衣', slot: 'top' },
  { id: 'bottom', label: '下装', slot: 'bottom' }, { id: 'shoes', label: '鞋子', slot: 'shoes' },
  { id: 'held', label: '手持', slot: 'held' }, { id: 'back', label: '背饰', slot: 'back' },
  { id: 'earring', label: '耳饰', slot: 'earring' },
];
const OC_PART_OPTIONS = getPartOptions();
const starterAvatar = { skin: 0, hair: 3, hairColor: 3, eyes: 0, eyeColor: 2, mouth: 0, showBlush: true, outfit: { hat: '', glasses: '', top: 'top_starter', bottom: 'bottom_starter', shoes: 'shoes_starter', held: 'held_flower', back: '', earring: '' } };

function freshDaily() { return { round: false, theme: false, dress: false, claimed: false }; }
const todayKey = new Date().toISOString().slice(0, 10);
const savedDaily = localStorage.getItem('luna-daily-date') === todayKey ? load('luna-daily-tasks', freshDaily()) : freshDaily();
const state = {
  screen: 'home', soundOn: true, childFriendlyVoice: localStorage.getItem('luna-child-friendly-voice') !== 'false', round: 0, completed: false, roundLocked: false,
  activeTheme: localStorage.getItem('luna-active-theme') || 'color',
  lessonMode: 'learn',
  completedThemes: load('luna-completed-themes', []),
  stars: Number(localStorage.getItem('luna-stars') || 0),
  daily: savedDaily,
  ocTab: 'hair', ocOwned: load('luna-oc-owned', ['top_starter', 'bottom_starter', 'shoes_starter', 'held_flower']),
  ocAvatar: load('luna-oc-avatar', starterAvatar),
};

function currentTheme() { return THEMES[state.activeTheme]; }
function currentRounds() { return state.lessonMode === 'review' ? currentTheme().reviewRounds : currentTheme().rounds; }
function persistProgress() {
  localStorage.setItem('luna-active-theme', state.activeTheme);
  save('luna-completed-themes', state.completedThemes);
  localStorage.setItem('luna-stars', String(state.stars));
  save('luna-daily-tasks', state.daily);
  localStorage.setItem('luna-daily-date', todayKey);
}
function saveOcAvatar() { save('luna-oc-avatar', state.ocAvatar); save('luna-oc-owned', state.ocOwned); }

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
  utterance.rate = .82;
  utterance.pitch = 1.04;
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
function setScreen(name) {
  state.screen = name;
  $$('.screen').forEach((screen) => screen.classList.toggle('active', screen.id === `${name}Screen`));
  $$('.nav-item').forEach((button) => button.classList.toggle('active', button.dataset.screen === name));
  if (name === 'lesson') renderRound();
  if (name === 'closet') renderWardrobe();
  $('#main').focus({ preventScroll: true });
}

function setDailyTask(task) {
  if (state.daily[task]) return;
  state.daily[task] = true;
  if (state.daily.round && state.daily.theme && state.daily.dress && !state.daily.claimed) {
    state.daily.claimed = true;
    state.stars += 3;
    state.ocOwned = Array.from(new Set([...state.ocOwned, 'hat_ribbon']));
    saveOcAvatar();
    showToast('今日任务完成！获得蝴蝶结发箍和 3 颗星星！');
  } else {
    showToast('今日魔法任务完成一项！');
  }
  persistProgress(); renderHome(); updateProgress();
}
function renderHome() {
  const theme = currentTheme();
  $('#todayThemeName').textContent = theme.title;
  $('#homePrimaryAction').querySelector('span').textContent = state.lessonMode === 'review' ? '开始单词复习' : '开始学习单词';
  $('#todayThemeMeta').textContent = `${theme.subtitle} · 3 分钟 · ${theme.words.join(' / ')}`;
  $('#dailyMissionTitle').textContent = state.daily.claimed ? '今天的礼物已收到！' : '完成 3 个小目标';
  const tasks = [ ['round', '完成 1 个英文小游戏'], ['theme', '完成 1 个魔法主题'], ['dress', '在衣橱换 1 件装扮'] ];
  $('#dailyTaskList').innerHTML = tasks.map(([id, label]) => `<li class="${state.daily[id] ? 'done' : ''}"><span>${state.daily[id] ? '✓' : '○'}</span>${label}</li>`).join('');
  $('#themeCards').innerHTML = Object.values(THEMES).map((theme) => {
    const done = state.completedThemes.includes(theme.id);
    const unavailable = state.lessonMode === 'review' && !done;
    return `<button class="theme-card ${theme.id} ${theme.id === state.activeTheme ? 'active' : ''} ${unavailable ? 'needs-learning' : ''}" type="button" data-theme="${theme.id}"><span class="theme-orb">${theme.id === 'color' ? '✦' : theme.id === 'animal' ? '♡' : '♪'}</span><strong>${theme.title}</strong><small>${theme.subtitle}</small><em>${state.lessonMode === 'review' ? (done ? '开始复习' : '先学习单词') : (done ? '已学过 · 可继续学习' : theme.words.slice(0, 3).join(' · '))}</em></button>`;
  }).join('');
  $$('[data-theme]').forEach((button) => button.addEventListener('click', () => selectTheme(button.dataset.theme, false)));
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
  $('#parentWords').textContent = state.completedThemes.length * 5 + Math.min(state.round, total);
  $('#progressStars').textContent = `${Math.min(state.round, total)} / ${total}`;
  $('#progressLabel').textContent = state.completed ? (state.lessonMode === 'review' ? '复习完成啦！' : '魔法完成啦！') : `第 ${state.round + 1} 关，共 ${total} 关`;
  $('#progressFill').style.width = `${(Math.min(state.round, total) / total) * 100}%`;
}

function startLearnCountdown(seconds = 10) {
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

function autoReadWordCard(word) {
  const card = $('.learn-word-card');
  const translation = WORD_TRANSLATIONS[word];
  card?.classList.add('is-speaking', 'speaking-english');
  // Start inside the original tap event whenever possible. The former 420 ms
  // timeout made the card feel slow and could lose iOS's user-activation window.
  speak(word, () => {
    card?.classList.remove('speaking-english');
    card?.classList.add('speaking-chinese');
    window.setTimeout(() => speakChinese(translation, () => {
      card?.classList.remove('is-speaking', 'speaking-chinese');
    }), 120);
  });
}

function renderRound() {
  const theme = currentTheme();
  $('#lessonTitle').innerHTML = `${theme.title.split(' ')[0]}<br />${theme.title.split(' ').slice(1).join(' ')}`;
  if (state.completed) return renderCompletion();
  state.roundLocked = false;
  const game = currentRounds()[state.round];
  $('#roundChip').textContent = game.chip;
  $('#promptSpeak').onclick = () => speak(game.type === 'match' ? game.prompt : game.word);
  const area = $('#gameArea');
  if (game.type === 'learn') {
    area.innerHTML = `<div class="learn-word-card"><img src="${game.image}" alt="${game.word} 的图片" /><div><p>Look and listen</p><h2>${game.word}</h2><strong class="word-translation">中文：${WORD_TRANSLATIONS[game.word]}</strong><span>${game.zh}</span></div><button class="primary-button" id="learnNext" type="button" disabled aria-disabled="true"><span class="learn-next-copy"><span id="learnNextLabel">先听一听（10）</span><span class="learn-countdown-track" aria-hidden="true"><i id="learnCountdownProgress"></i></span></span><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 5 7 7-7 7"/></svg></button></div>`;
    $('#learnNext').addEventListener('click', () => handleCorrect(game.word, 'learn'));
    startLearnCountdown(10);
  } else {
    area.innerHTML = `<div class="match-word-card"><img src="${game.image}" alt="${game.word} 的图片" /><div class="game-copy"><h2>${game.prompt.split(' ').slice(0, 2).join(' ')}<br /><em>${game.prompt.split(' ').slice(2).join(' ')}</em></h2><strong class="match-translation">中文：${WORD_TRANSLATIONS[game.word]}</strong><p>${game.zh}</p></div></div><button class="review-listen-action" id="reviewListenAction" type="button">先听一遍，再选单词 <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 10v4h4l5 4V6L8 10H4Zm12.5 2A4.5 4.5 0 0 0 14 8v2a2.5 2.5 0 0 1 0 4v2a4.5 4.5 0 0 0 2.5-4Z"/></svg></button><div class="word-choice-row">${game.choices.map((choice) => `<button class="word-choice ${theme.id}" type="button" data-choice="${choice}"><b>${choice}</b><span>点一个单词</span></button>`).join('')}</div>`;
    $('#reviewListenAction').addEventListener('click', () => { speak(game.word); $$('.word-choice', area).forEach((button) => button.classList.add('attention')); setTimeout(() => $$('.word-choice', area).forEach((button) => button.classList.remove('attention')), 900); });
    $$('[data-choice]', area).forEach((button) => button.addEventListener('click', () => handleChoice(button, game)));
  }
  updateProgress();
  if (game.type === 'learn') autoReadWordCard(game.word);
}
function handleChoice(button, game) {
  if (state.roundLocked || button.disabled) return;
  if (button.dataset.choice === game.correct) { button.classList.add('correct'); handleCorrect(game.word); }
  else { button.classList.add('try-again'); button.disabled = true; speak(game.prompt); showToast('再听一次，露娜相信你！'); }
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
  if (kind === 'learn') showWordCelebration(word);
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
  $('#roundChip').textContent = reviewing ? '复习完成' : '完成啦'; $('#promptSpeak').onclick = () => speak(reviewing ? `Great review, ${CHILD_NAME}!` : `Great job, ${CHILD_NAME}!`);
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
  speak(`A magic gift for you, ${CHILD_NAME}!`); setTimeout(() => $('#claimReward').focus(), 650);
}
function closeReward() { $('#rewardModal').classList.remove('open'); $('#rewardModal').setAttribute('aria-hidden', 'true'); }
function openParent() { $('#parentModal').classList.add('open'); $('#parentModal').setAttribute('aria-hidden', 'false'); $('#closeParent').focus(); }
function closeParent() { $('#parentModal').classList.remove('open'); $('#parentModal').setAttribute('aria-hidden', 'true'); $('#parentButton').focus(); }

$$('[data-screen]').forEach((button) => button.addEventListener('click', () => setScreen(button.dataset.screen)));
$$('.mini-speak').forEach((button) => button.addEventListener('click', () => speak(button.dataset.say)));
$('#playToday').addEventListener('click', () => selectTheme(state.activeTheme, true));
$('#homePrimaryAction').addEventListener('click', () => selectTheme(state.activeTheme, true));
$('#ocActionButton').addEventListener('click', () => { $('#ocItemGrid').classList.add('child-choice-focus'); $('#ocItemGrid').scrollIntoView({ behavior: 'smooth', block: 'nearest' }); setTimeout(() => $('#ocItemGrid').classList.remove('child-choice-focus'), 1000); });
$('#soundToggle').addEventListener('click', () => { state.soundOn = !state.soundOn; $('#soundToggle').setAttribute('aria-pressed', String(state.soundOn)); $('#soundToggle').setAttribute('aria-label', state.soundOn ? '关闭声音' : '打开声音'); $('#soundToggle').classList.toggle('muted', !state.soundOn); if (!state.soundOn) window.speechSynthesis?.cancel(); });
$('#parentButton').addEventListener('click', openParent); $('#closeParent').addEventListener('click', closeParent);
$('#voiceTest').addEventListener('click', () => { chooseEnglishVoice(); speak(`Hello, ${CHILD_NAME}! I am Luna. Let us learn English together.`); });
$('#childVoiceToggle').addEventListener('click', () => { state.childFriendlyVoice = !state.childFriendlyVoice; localStorage.setItem('luna-child-friendly-voice', String(state.childFriendlyVoice)); $('#childVoiceToggle').setAttribute('aria-pressed', String(state.childFriendlyVoice)); $('#childVoiceToggle').textContent = state.childFriendlyVoice ? '儿童感朗读：已开启' : '儿童感朗读：已关闭'; showToast(state.childFriendlyVoice ? '已使用更慢、更明亮的朗读方式。' : '已使用标准英语朗读方式。'); });
$('#childVoiceToggle').setAttribute('aria-pressed', String(state.childFriendlyVoice)); $('#childVoiceToggle').textContent = state.childFriendlyVoice ? '儿童感朗读：已开启' : '儿童感朗读：已关闭';
$('#claimReward').addEventListener('click', () => { closeReward(); $('#newDot').hidden = false; setScreen('closet'); showToast('新的 OC-English 装扮已经放进衣橱！'); });
$('#parentModal').addEventListener('click', (event) => { if (event.target === $('#parentModal')) closeParent(); });
$('#resetProgress').addEventListener('click', () => { state.round = 0; state.completed = false; state.roundLocked = false; closeParent(); setScreen('home'); });
document.addEventListener('keydown', (event) => { if (event.key === 'Escape' && $('#parentModal').classList.contains('open')) closeParent(); if (event.key === 'Escape' && $('#rewardModal').classList.contains('open')) closeReward(); });

renderWardrobe(); renderHome(); updateProgress();
