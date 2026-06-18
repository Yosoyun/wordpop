/* ============================================================
   WordPop — Progress Store
   ------------------------------------------------------------
   Everything is saved on THIS device (localStorage). No server,
   no internet needed. This is what the Parent Zone reads from.
   ============================================================ */

const Store = (function () {
  const KEY = "wordpop_save_v1";

  const fresh = () => ({
    learnerName: "",
    createdAt: Date.now(),
    pin: CONFIG.parentPinDefault,
    premium: false,                 // unlocks letters C–Z
    theme: null,                    // "sparkle" | "hero" (null = not chosen yet)
    settings: { voice: true, sfx: true, voiceName: null, rate: 0.86 },
    xp: 0,
    gems: 0,
    streak: { count: 0, lastDay: null },
    activeDays: {},                 // "2026-06-18": true  (for the streak calendar)
    totalSeconds: 0,                // total time spent learning
    lessons: {},                    // "A:0": { stars, completed, best } — progress per mini-lesson
    words: {},                      // "amazing": { seen, correct, wrong, mastered }
    errors: [],                     // every mistake, for the parent's error analysis
    feedback: []                    // lesson ratings & comments
  });

  let state = load();

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) return Object.assign(fresh(), JSON.parse(raw));
    } catch (e) {}
    return fresh();
  }

  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {}
  }

  function todayKey() {
    const d = new Date();
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  }

  /* Call once when a learning session starts to keep the streak alive. */
  function touchDay() {
    const t = todayKey();
    if (state.activeDays[t]) { save(); return; }
    state.activeDays[t] = true;

    const last = state.streak.lastDay;
    if (!last) {
      state.streak.count = 1;
    } else {
      const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1);
      const yKey = yesterday.getFullYear() + "-" + String(yesterday.getMonth() + 1).padStart(2, "0") + "-" + String(yesterday.getDate()).padStart(2, "0");
      state.streak.count = (last === yKey) ? state.streak.count + 1 : 1;
    }
    state.streak.lastDay = t;
    save();
  }

  function addSeconds(s) { state.totalSeconds += s; save(); }
  function addXp(n) { state.xp += n; save(); }
  function addGems(n) { state.gems += n; save(); }

  /* Record what happened with a single word during a question. */
  function recordWord(word, wasCorrect) {
    const k = word.toLowerCase();
    const w = state.words[k] || { seen: 0, correct: 0, wrong: 0, mastered: false };
    w.seen++;
    if (wasCorrect) { w.correct++; if (w.correct >= 2 && w.wrong <= w.correct) w.mastered = true; }
    else { w.wrong++; w.mastered = false; }
    state.words[k] = w;
    save();
  }

  /* Log a mistake so the parent can see exactly where the child struggles. */
  function logError(entry) {
    state.errors.unshift(Object.assign({ at: Date.now() }, entry));
    if (state.errors.length > 500) state.errors.length = 500;
    save();
  }

  /* Save a completed mini-lesson result (keeps the best score). */
  function completeLesson(id, stars) {
    const prev = state.lessons[id] || { stars: 0, completed: false };
    state.lessons[id] = {
      completed: true,
      stars: Math.max(prev.stars || 0, stars),
      best: Math.max(prev.best || 0, stars)
    };
    save();
  }

  function addFeedback(entry) {
    state.feedback.unshift(Object.assign({ at: Date.now() }, entry));
    save();
  }

  function level() { return Math.floor(state.xp / 100) + 1; }
  function xpIntoLevel() { return state.xp % 100; }

  /* A quick rollup for the Parent Dashboard. */
  function stats() {
    const words = Object.values(state.words);
    const attempted = words.length;
    const mastered = words.filter(w => w.mastered).length;
    const totalCorrect = words.reduce((s, w) => s + w.correct, 0);
    const totalWrong = words.reduce((s, w) => s + w.wrong, 0);
    const totalAns = totalCorrect + totalWrong;
    const accuracy = totalAns ? Math.round((totalCorrect / totalAns) * 100) : 0;
    // words that need practice = answered wrong at least once and not yet mastered
    const needPractice = Object.entries(state.words)
      .filter(([, w]) => w.wrong > 0 && !w.mastered)
      .map(([word, w]) => ({ word, wrong: w.wrong, correct: w.correct }))
      .sort((a, b) => b.wrong - a.wrong);
    return {
      attempted, mastered, accuracy, totalCorrect, totalWrong,
      needPractice,
      totalSeconds: state.totalSeconds,
      activeDays: Object.keys(state.activeDays).length,
      streak: state.streak.count,
      xp: state.xp, gems: state.gems, level: level()
    };
  }

  function get() { return state; }
  function setName(n) { state.learnerName = n; save(); }
  function setPin(p) { state.pin = p; save(); }
  function setPremium(v) { state.premium = !!v; save(); }
  function setTheme(t) { state.theme = t; save(); }
  function setSetting(k, v) { state.settings[k] = v; save(); }
  function reset() { state = fresh(); save(); }

  return {
    get, save, touchDay, addSeconds, addXp, addGems,
    recordWord, logError, completeLesson, addFeedback,
    stats, level, xpIntoLevel,
    setName, setPin, setPremium, setTheme, setSetting, reset, todayKey
  };
})();
