export const ACHIEVEMENT_DEFINITIONS = [
  { id: 'first-step', label: '第一次探险', condition: '完成任意 1 个学习关卡', unlocked: (state) => state.stars >= 1 },
  { id: 'castle-lights', label: '点亮三处地图', condition: '完成 3 个不同主题', unlocked: (state) => state.completedThemes.length >= 3 },
  { id: 'hanzi-reader', label: '汉字小书童', condition: '掌握 3 个汉字或词组', unlocked: (state) => Object.keys(state.wordProgress).filter((key) => key.startsWith('hanzi:') && state.wordProgress[key].mastered).length >= 3 },
  { id: 'week-streak', label: '连续学习 7 天', condition: '连续完成学习 7 天', unlocked: (state) => state.streak.count >= 7 },
  { id: 'magic-collector', label: '收集 10 项知识', condition: '掌握 10 项学习内容', unlocked: (_state, mastered) => mastered >= 10 },
];

export function unlockAchievementIds(state, masteredCount) {
  return ACHIEVEMENT_DEFINITIONS.filter((item) => item.unlocked(state, masteredCount)).map((item) => item.id);
}
