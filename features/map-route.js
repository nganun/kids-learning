export function themeNeedsReview(theme, wordProgress, todayKey) {
  return theme.words.some((word) => {
    const progress = wordProgress[`${theme.id}:${word}`];
    return progress?.mastered && progress.dueDate <= todayKey;
  });
}

export function recommendedThemeId(themes, completedThemes, wordProgress, todayKey, activeTheme) {
  const due = Object.values(themes).find((theme) => themeNeedsReview(theme, wordProgress, todayKey));
  if (due) return due.id;
  return Object.values(themes).find((theme) => !completedThemes.includes(theme.id))?.id || activeTheme;
}

export function dailyRouteThemeIds(themes, completedThemes, wordProgress, todayKey) {
  const due = Object.values(themes).filter((theme) => themeNeedsReview(theme, wordProgress, todayKey)).slice(0, 2).map((theme) => theme.id);
  const fresh = Object.values(themes).find((theme) => !completedThemes.includes(theme.id));
  return Array.from(new Set([...due, fresh?.id].filter(Boolean))).slice(0, 3);
}
