/* ============================================================
   WordPop — App Engine (screens, lessons, quizzes, parent zone)
   ============================================================ */

const App = (function () {
  const root = () => document.getElementById("app");

  // ---- in-memory session state ----
  let session = null;        // active quiz/flashcard session
  let sessionStart = 0;      // for time tracking
  let parentUnlocked = false;
  let memTimer = null;       // Memory Match timer

  /* ---------- tiny helpers ---------- */
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  const esc = (s) => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  function flushTime() {
    if (sessionStart) {
      Store.addSeconds(Math.round((Date.now() - sessionStart) / 1000));
      sessionStart = 0;
    }
  }
  function startTimer() { sessionStart = Date.now(); }

  /* ---------- mascot (themed: Stella for Sparkle, Zap for Hero) ---------- */
  function mascot(mood = "happy", size = 96) {
    return Themes.mascotSVG(Themes.current(), mood, size);
  }
  function mascotName() { return Themes.meta(Themes.current()).mascot || CONFIG.mascotName; }

  /* ---------- top HUD ---------- */
  function hud() {
    const s = Store.get();
    const st = Store.stats();
    return `
    <header class="hud">
      <div class="hud-pill streak" title="Day streak">🔥 <b>${st.streak}</b></div>
      <div class="hud-pill gems" title="Gems">💎 <b>${s.gems}</b></div>
      <div class="hud-pill xp" title="Experience">
        <span class="xp-label">Lvl ${st.level}</span>
        <span class="xp-track"><span class="xp-fill" style="width:${Store.xpIntoLevel()}%"></span></span>
      </div>
      <button class="hud-parent" data-go="parent" title="Parent Zone">👤</button>
    </header>`;
  }

  /* ============================================================
     SCREENS
     ============================================================ */

  function render(html) {
    root().innerHTML = html;
    bind();
  }

  /* ---- onboarding ---- */
  function screenOnboard() {
    flushTime();
    render(`
    <div class="screen onboard">
      <div class="bubbles-bg">${bubbleField()}</div>
      <div class="onboard-card pop-in">
        ${mascot("happy", 130)}
        <h1 class="logo">${esc(CONFIG.appName)}</h1>
        <p class="tagline">${esc(CONFIG.tagline)}</p>
        <p class="onboard-hi">Hi! I'm ${esc(mascotName())}. What's your name?</p>
        <input id="nameInput" class="big-input" placeholder="Type your name" maxlength="20" autocomplete="off"/>
        <button class="btn btn-primary btn-big" data-action="start-learning">Let's go! ✨</button>
        <button class="btn btn-ghost" data-go="parent">I'm a parent</button>
      </div>
    </div>`);
    const i = $("#nameInput"); if (i) i.focus();
  }

  /* ---- home: the alphabet path ---- */
  function screenHome() {
    flushTime();
    const s = Store.get();
    const greeting = s.learnerName ? `Hi ${esc(s.learnerName)}! ` : "";
    // find the "current" letter — first playable one that isn't fully done
    let currentLetter = null;
    for (const L of LETTERS) {
      const playable = (CONFIG.freeLetters.includes(L.letter) || s.premium) && L.words.length > 0;
      if (!playable) continue;
      const cl = clustersFor(L);
      const done = cl.filter((_, ci) => (s.lessons[L.letter + ":" + ci] || {}).completed).length;
      if (done < cl.length) { currentLetter = L.letter; break; }
    }
    const nodes = LETTERS.map((L, i) => letterNode(L, i, currentLetter)).join("");
    const activeToday = !!s.activeDays[Store.todayKey()];
    const st = Store.stats();
    const goalLine = activeToday
      ? `✅ Today's goal done! 🔥 ${st.streak}-day streak — keep it going!`
      : (st.streak > 0 ? `🔥 ${st.streak}-day streak! Do one lesson today to keep it.` : `Do one lesson a day to build a 🔥 streak!`);
    render(`
    <div class="screen home">
      <div class="bubbles-bg">${bubbleField()}</div>
      ${hud()}
      <div class="home-head">
        ${mascot("happy", 72)}
        <div>
          <h2 class="home-title">${greeting}Pick a letter 🫧</h2>
          <p class="home-sub">Pop the bubbles to learn beautiful words!</p>
        </div>
      </div>
      <div class="goal-line ${activeToday ? "met" : ""}">${goalLine}</div>
      ${reviewCardHtml()}
      <div class="path">${nodes}</div>
      <div class="home-foot">
        <button class="btn btn-soft" data-go="trophies">🏆 My Awards</button>
        ${s.premium ? `<span class="premium-tag">👑 Premium unlocked</span>` : `<button class="btn btn-soft go-premium" data-action="go-premium">✨ Unlock all 26 letters</button>`}
        <button class="btn btn-ghost" data-go="parent">👤 Parent Zone</button>
      </div>
    </div>`);
  }

  function letterNode(L, i, currentLetter) {
    const s = Store.get();
    const hasWords = L.words.length > 0;
    const free = CONFIG.freeLetters.includes(L.letter) || s.premium;
    const locked = !hasWords || (!free && L.status === "premium");
    const offset = Math.round(Math.sin(i * 0.85) * 58);   // gentle zigzag
    const isCurrent = L.letter === currentLetter;
    // count completed lessons
    let crown = "", fullyDone = false;
    if (hasWords) {
      const total = clustersFor(L).length;
      const done = clustersFor(L).filter((_, ci) => (s.lessons[L.letter + ":" + ci] || {}).completed).length;
      fullyDone = done >= total;
      if (done > 0) crown = `<span class="node-crown">${fullyDone ? "👑" : done + "/" + total}</span>`;
    }
    let badge = "";
    if (!hasWords) badge = `<span class="node-badge soon">soon</span>`;
    else if (L.status === "premium" && !s.premium) badge = `<span class="node-badge premium">⭐ premium</span>`;
    return `
      <div class="node-row" style="--off:${offset}px">
        ${isCurrent ? `<span class="node-flag">START</span>` : ""}
        <button class="node ${locked ? "locked" : "open"} ${isCurrent ? "current" : ""} ${fullyDone ? "done" : ""}" style="--c:${L.color}"
                data-letter="${L.letter}" ${locked ? "data-locked='1'" : ""}>
          <span class="node-shine"></span>
          <span class="node-letter">${L.letter}</span>
          ${locked ? `<span class="node-locktag">🔒</span>` : ""}
          ${crown}${badge}
        </button>
        <span class="node-caption">${esc(L.theme)}</span>
      </div>`;
  }

  /* deterministic per-child shuffle so every child rotates through ALL the
     words (not the same alphabetical 25), but the order stays stable for her
     so progress/stars keep their meaning. */
  function seededShuffle(arr, seed) {
    let t = seed >>> 0;
    const rnd = () => { t += 0x6D2B79F5; let x = Math.imul(t ^ (t >>> 15), 1 | t); x ^= x + Math.imul(x ^ (x >>> 7), 61 | x); return ((x ^ (x >>> 14)) >>> 0) / 4294967296; };
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
    return a;
  }
  function letterSeed(letter) {
    let h = (Store.get().createdAt || 1) % 1000000;
    for (let i = 0; i < letter.length; i++) h = (h * 31 + letter.charCodeAt(i)) >>> 0;
    return h;
  }

  /* break a letter's words into clusters (mini-lessons) + a review */
  function clustersFor(L) {
    const size = CONFIG.wordsPerCluster;
    const ordered = seededShuffle(L.words, letterSeed(L.letter));
    const groups = [];
    for (let i = 0; i < ordered.length; i += size) groups.push(ordered.slice(i, i + size));
    const clusters = groups.map((g, idx) => ({ kind: "lesson", words: g, title: "Lesson " + (idx + 1) }));
    if (ordered.length > size) clusters.push({ kind: "review", words: ordered.slice(0, 12), title: "Big Review 🏆" });
    return clusters;
  }

  /* ============================================================
     RETENTION: cumulative review + streaks + awards
     ============================================================ */

  // achievements (awarded once, celebrated when newly earned)
  const BADGES = [
    { id: "firstWord",    icon: "🌱", name: "First Word",     desc: "Learn your very first word", test: (st) => st.attempted >= 1 },
    { id: "tenWords",     icon: "⭐", name: "Word Star",       desc: "Master 10 words",            test: (st) => st.mastered >= 10 },
    { id: "fiftyWords",   icon: "💫", name: "Word Wizard",     desc: "Master 50 words",            test: (st) => st.mastered >= 50 },
    { id: "hundredWords", icon: "💯", name: "Word Hero",       desc: "Master 100 words",           test: (st) => st.mastered >= 100 },
    { id: "firstLetter",  icon: "🏅", name: "Letter Finisher", desc: "Finish a whole letter",      test: (st, x) => x.lettersDone >= 1 },
    { id: "threeLetters", icon: "🎖️", name: "Alphabet Star",   desc: "Finish 3 letters",           test: (st, x) => x.lettersDone >= 3 },
    { id: "streak3",      icon: "🔥", name: "On Fire",         desc: "Keep a 3-day streak",        test: (st) => st.streak >= 3 },
    { id: "streak7",      icon: "🏆", name: "Week Warrior",    desc: "Keep a 7-day streak",        test: (st) => st.streak >= 7 },
    { id: "firstReview",  icon: "🔁", name: "Memory Keeper",   desc: "Do your first review",       test: (st, x) => x.reviews >= 1 },
    { id: "reviewer",     icon: "🧠", name: "Brain Booster",   desc: "Do 10 reviews",              test: (st, x) => x.reviews >= 10 },
    { id: "sharp",        icon: "🎯", name: "Sharp Shooter",   desc: "Reach 90% accuracy",         test: (st) => st.accuracy >= 90 && (st.totalCorrect + st.totalWrong) >= 20 }
  ];

  function wordIndex() {
    if (wordIndex._c) return wordIndex._c;
    const m = {};
    LETTERS.forEach(L => L.words.forEach(w => { m[w.word.toLowerCase()] = w; }));
    wordIndex._c = m; return m;
  }

  // letters whose lesson clusters are all completed
  function completedLetters() {
    const s = Store.get();
    return LETTERS.filter(L => {
      if (!L.words.length) return false;
      if (!(CONFIG.freeLetters.includes(L.letter) || s.premium)) return false;
      const cl = clustersFor(L).filter(c => c.kind !== "review");
      return cl.length > 0 && cl.every((c, i) => (s.lessons[L.letter + ":" + i] || {}).completed);
    }).map(L => L.letter);
  }

  // every word she has already met
  function reviewPool() {
    const s = Store.get(), idx = wordIndex(), pool = [];
    Object.keys(s.words).forEach(k => { if (idx[k]) pool.push(idx[k]); });
    return pool;
  }

  // a review set weighted toward weak / not-yet-mastered words
  function weightedReview(n) {
    const s = Store.get(), idx = wordIndex(), weak = [], ok = [];
    Object.keys(s.words).forEach(k => {
      const w = idx[k]; if (!w) return;
      const st = s.words[k];
      (st.wrong > 0 || !st.mastered) ? weak.push(w) : ok.push(w);
    });
    const pick = [], wk = Quiz.shuffle(weak), okk = Quiz.shuffle(ok);
    while (pick.length < n && wk.length) pick.push(wk.shift());
    while (pick.length < n && okk.length) pick.push(okk.shift());
    return pick;
  }

  function checkBadges() {
    const st = Store.stats();
    const extra = { lettersDone: completedLetters().length, reviews: (Store.get().reviews || {}).total || 0 };
    const newly = [];
    BADGES.forEach(b => { if (b.test(st, extra) && Store.awardBadge(b.id)) newly.push(b); });
    if (newly.length) Audio.sparkle();
    return newly;
  }
  function badgesHtml(newly) {
    if (!newly || !newly.length) return "";
    return `<div class="new-badges"><p>New award${newly.length > 1 ? "s" : ""} unlocked! 🎖️</p><div class="badge-pop-row">` +
      newly.map(b => `<div class="badge-pop"><span class="badge-ic">${b.icon}</span><b>${esc(b.name)}</b></div>`).join("") +
      `</div></div>`;
  }

  function reviewCardHtml() {
    const pool = reviewPool();
    if (pool.length < 6) return "";
    const lettersIn = Array.from(new Set(pool.map(w => w.word[0].toUpperCase()))).sort().join(", ");
    const done = Store.reviewedToday();
    return `
      <div class="review-card ${done ? "done" : ""}">
        <div class="review-ic">🔁</div>
        <div class="review-body">
          <b>${done ? "Review done today! 🎉" : "Daily Review"}</b>
          <small>${done ? "Come back tomorrow to keep it strong" : "Lock in " + esc(lettersIn) + " — keep your words!"}</small>
        </div>
        <button class="btn ${done ? "btn-soft" : "btn-primary"}" data-action="start-review">${done ? "Again" : "Start"}</button>
      </div>`;
  }

  function startReview() {
    const sample = weightedReview(10);
    if (sample.length < 4) { toast("Learn a few more words first! 🌱"); return; }
    Store.touchDay(); startTimer();
    const pool = reviewPool();
    session = {
      id: "review", letter: "★", color: "#8A4FFF", allWords: pool,
      cluster: { kind: "review-mix", words: sample },
      questions: Quiz.build(sample, pool),
      qIndex: 0, wrongCount: 0, correctFirstTry: 0, answeredCount: 0, isReview: true
    };
    Audio.pop();
    renderQuestion();
  }

  function finishReview() {
    flushTime(); Audio.fanfare(); burstConfetti(130);
    Store.recordReview();
    const earnedXp = session.correctFirstTry * 10;
    Store.addGems(5);
    const newBadges = checkBadges();
    const name = Store.get().learnerName || "superstar";
    render(`
    <div class="screen complete" style="--c:#8A4FFF">
      <div class="bubbles-bg">${bubbleField()}</div>
      <div class="complete-card pop-in">
        ${mascot("celebrate", 120)}
        <h1>Review complete! 🔁</h1>
        <p class="review-done-msg">You kept your words strong, ${esc(name)}! 💪</p>
        <div class="reward-row">
          <div class="reward"><span>⚡</span><b>+${earnedXp}</b><small>XP</small></div>
          <div class="reward"><span>💎</span><b>+5</b><small>gems</small></div>
          <div class="reward"><span>🔥</span><b>${Store.stats().streak}</b><small>streak</small></div>
        </div>
        ${badgesHtml(newBadges)}
        <button class="btn btn-primary btn-big" data-action="finish-back">Keep it up! ✨</button>
      </div>
    </div>`);
  }

  /* ---- awards / trophies screen ---- */
  function screenTrophies() {
    flushTime();
    const s = Store.get();
    const earnedCount = BADGES.filter(b => s.badges[b.id]).length;
    const items = BADGES.map(b => {
      const earned = !!s.badges[b.id];
      return `<div class="trophy ${earned ? "earned" : "locked"}">
        <span class="trophy-ic">${earned ? b.icon : "🔒"}</span>
        <b>${esc(b.name)}</b><small>${esc(b.desc)}</small>
      </div>`;
    }).join("");
    render(`
    <div class="screen trophies-screen">
      <div class="parent-head">
        <button class="btn-back" data-go="home">←</button>
        <h2>🏆 My Awards</h2>
        <span class="learner-tag">${earnedCount}/${BADGES.length}</span>
      </div>
      <div class="trophy-grid">${items}</div>
    </div>`);
  }

  /* ---- letter map: mini-lessons within a letter ---- */
  function screenLetter(letter) {
    const L = LETTERS.find(x => x.letter === letter);
    if (!L || !L.words.length) return screenHome();
    const s = Store.get();
    const clusters = clustersFor(L);
    const items = clusters.map((c, ci) => {
      const id = L.letter + ":" + ci;
      const prog = s.lessons[id] || { completed: false, stars: 0 };
      // MASTERY GATE: the next lesson opens only once the previous is mastered (2★+)
      const prev = s.lessons[L.letter + ":" + (ci - 1)] || {};
      const prevMastered = ci === 0 || (prev.completed && (prev.stars || 0) >= 2);
      const locked = !prevMastered;
      const needsMaster = prog.completed && (prog.stars || 0) < 2;   // done but not yet mastered
      const stars = [1, 2, 3].map(n => `<span class="star ${prog.stars >= n ? "on" : ""}">★</span>`).join("");
      let right;
      if (locked) right = `<span class="lesson-lock">🔒</span>`;
      else if (needsMaster) right = `<span class="lesson-redo">↻</span>`;
      else if (prog.completed) right = `<span class="lesson-check">✓</span>`;
      else right = `<span class="lesson-go">▶</span>`;
      return `
        <button class="lesson-card ${locked ? "locked" : ""} ${prog.completed && !needsMaster ? "done" : ""} ${needsMaster ? "needs-master" : ""}"
                data-lesson="${id}" ${locked ? "data-locked='1'" : ""}>
          <span class="lesson-icon">${c.kind === "review" ? "🏆" : "🫧"}</span>
          <span class="lesson-body">
            <span class="lesson-title">${esc(c.title)}</span>
            <span class="lesson-stars">${stars}${needsMaster ? `<small class="master-hint"> — get ★★ to unlock next</small>` : ""}</span>
          </span>
          ${right}
        </button>`;
    }).join("");
    render(`
    <div class="screen letter-map" style="--c:${L.color}">
      ${hud()}
      <div class="letter-head">
        <button class="btn-back" data-go="home">←</button>
        <div class="letter-badge" style="--c:${L.color}">${L.letter}</div>
        <div>
          <h2>${esc(L.theme)}</h2>
          <p>${L.words.length} beautiful words to discover</p>
        </div>
      </div>
      <div class="lesson-list">${items}</div>
    </div>`);
  }

  /* ============================================================
     LESSON FLOW : flashcards → quiz → reward
     ============================================================ */

  function startLesson(id) {
    const [letter, ciStr] = id.split(":");
    const ci = parseInt(ciStr, 10);
    const L = LETTERS.find(x => x.letter === letter);
    const clusters = clustersFor(L);
    const cluster = clusters[ci];
    if (!cluster) return screenHome();

    Store.touchDay();
    startTimer();

    session = {
      id, letter, color: L.color, allWords: L.words,
      cluster, flashIndex: 0,
      questions: [], qIndex: 0, wrongCount: 0, correctFirstTry: 0, answeredCount: 0
    };

    if (cluster.kind === "review") {
      // review = a mixed quiz over a sample of the letter's words
      session.questions = Quiz.build(cluster.words, L.words);
      renderQuestion();
    } else {
      renderFlashcard();
    }
  }

  function renderFlashcard() {
    const c = session.cluster;
    const w = c.words[session.flashIndex];
    const n = c.words.length;
    Audio.speak(w.word);
    const syn = (w.synonyms || []).map(x => `<span class="chip chip-syn">${esc(x)}</span>`).join("") || `<span class="chip chip-muted">—</span>`;
    const ant = (w.antonyms && w.antonyms.length)
      ? w.antonyms.map(x => `<span class="chip chip-ant">${esc(x)}</span>`).join("")
      : `<span class="chip chip-muted">This word has no opposite 🙂</span>`;
    render(`
    <div class="screen flashcard" style="--c:${session.color}">
      <div class="lesson-top">
        <button class="btn-back" data-action="quit-lesson">✕</button>
        <div class="progress-bar"><span style="width:${(session.flashIndex / n) * 100}%"></span></div>
        <span class="lesson-counter">${session.flashIndex + 1}/${n}</span>
      </div>
      <div class="flash-stage pop-in" key="${session.flashIndex}">
        ${Art.has(w.word) ? `<div class="flash-art">${Art.svg(w.word)}</div>` : `<div class="flash-emoji">${w.emoji}</div>`}
        <div class="flash-wordline">
          <h1 class="flash-word">${esc(w.word)}</h1>
          <button class="speak-btn" data-action="speak" data-text="${esc(w.word)}" title="Hear it">🔊</button>
          ${Audio.micSupported() ? `<button class="speak-btn mic" data-action="flash-say" data-text="${esc(w.word)}" title="Say it yourself">🎤</button>` : ""}
        </div>
        <div class="flash-say">say it: <b>${esc(w.say || "")}</b> &nbsp;·&nbsp; <i>${esc(w.pos)}</i></div>
        <p class="flash-meaning">${esc(w.meaning)}</p>
        <div class="flash-example">“${esc(w.example)}”
          <button class="speak-btn small" data-action="speak" data-text="${esc(w.example)}">🔊</button>
        </div>
        <div class="flash-rows">
          <div class="flash-row"><span class="flash-label same">Same as</span><div class="chips">${syn}</div></div>
          <div class="flash-row"><span class="flash-label opp">Opposite</span><div class="chips">${ant}</div></div>
        </div>
      </div>
      <div class="lesson-actions">
        <button class="btn btn-primary btn-big" data-action="flash-next">
          ${session.flashIndex < n - 1 ? "Next word →" : "Start the game! 🎮"}
        </button>
      </div>
    </div>`);
  }

  function flashNext() {
    Audio.pop();
    if (session.flashIndex < session.cluster.words.length - 1) {
      session.flashIndex++;
      renderFlashcard();
    } else {
      // build quiz from this cluster
      session.questions = Quiz.build(session.cluster.words, session.allWords);
      session.qIndex = 0;
      renderQuestion();
    }
  }

  function lessonTopBar(total) {
    return `<div class="lesson-top">
        <button class="btn-back" data-action="quit-lesson">✕</button>
        <div class="progress-bar"><span style="width:${(session.qIndex / total) * 100}%"></span></div>
        <span class="lesson-counter">${session.qIndex + 1}/${total}</span>
      </div>`;
  }

  function renderQuestion() {
    const q = session.questions[session.qIndex];
    if (!q) return finishLesson();
    const total = session.questions.length;
    if (q.type === "match") return renderMatch(q, total);
    if (q.type === "spell") return renderSpell(q, total);
    if (q.type === "anagram") return renderAnagram(q, total);
    if (q.type === "memory") return renderMemory(q, total);
    if (q.type === "say") return renderSay(q, total);

    let stemHtml = "";
    if (q.stem === "__LISTEN__") {
      stemHtml = `<button class="big-speaker" data-action="speak" data-text="${esc(q.word)}">🔊<span>tap to hear</span></button>`;
    } else {
      const art = Art.has(q.word) && q.optionStyle !== "picture" && q.type !== "oddone" ? `<div class="q-art">${Art.svg(q.word)}</div>` : "";
      let stemText = q.stem;
      if (art && q.emoji && stemText.indexOf(q.emoji) === 0) stemText = stemText.slice(q.emoji.length).trim();
      stemHtml = art + (stemText ? `<div class="q-stem">${esc(stemText)}</div>` : "");
    }

    let optsHtml, optsClass = "opts";
    if (q.optionStyle === "picture") {
      optsClass = "opts opts-pic";
      optsHtml = q.options.map(o => {
        const vis = Art.has(o) ? `<span class="opt-art">${Art.svg(o)}</span>` : `<span class="opt-emoji">${(q.optionMeta && q.optionMeta[o]) || "❓"}</span>`;
        return `<button class="opt opt-pic" data-opt="${esc(o)}">${vis}<span class="opt-label">${esc(cap(o))}</span></button>`;
      }).join("");
    } else {
      optsHtml = q.options.map(o => `<button class="opt" data-opt="${esc(o)}">${esc(cap(o))}</button>`).join("");
    }

    render(`
    <div class="screen quiz" style="--c:${session.color}">
      ${lessonTopBar(total)}
      <div class="q-body pop-in">
        <div class="q-mascot">${mascot("think", 64)}</div>
        <h2 class="q-prompt">${esc(q.prompt)}</h2>
        ${stemHtml}
        <div class="${optsClass}">${optsHtml}</div>
      </div>
      <div class="feedback-bar" id="fb"></div>
    </div>`);
    if (q.speakOnLoad) setTimeout(() => Audio.speak(q.word), 300);
  }

  /* ---- match-the-following ---- */
  function renderMatch(q, total) {
    session._match = { items: q.items, selectedLeft: null, remaining: q.items.length };
    const lefts = q.items.map((it, i) =>
      `<button class="match-item match-left" data-mleft="${i}">
        ${Art.has(it.word) ? `<span class="mi-art">${Art.svg(it.word)}</span>` : `<span class="mi-emoji">${it.emoji}</span>`}
        <span class="mi-word">${esc(it.word)}</span>
      </button>`).join("");
    const order = Quiz.shuffle(q.items.map((_, i) => i));
    const rights = order.map(i =>
      `<button class="match-item match-right" data-mright="${i}">${esc(q.items[i].meaning)}</button>`).join("");
    render(`
    <div class="screen quiz match-screen" style="--c:${session.color}">
      ${lessonTopBar(total)}
      <div class="q-body pop-in">
        <h2 class="q-prompt">🔗 ${esc(q.prompt)}</h2>
        <p class="mem-hint">Tap a word 👉 then tap its meaning</p>
        <div class="match-grid">
          <div class="match-col">${lefts}</div>
          <div class="match-col">${rights}</div>
        </div>
      </div>
      <div class="feedback-bar" id="fb"></div>
    </div>`);
  }

  function matchTap(side, idx, btn) {
    const m = session._match;
    if (!m || btn.classList.contains("matched")) return;
    if (side === "left") {
      $$(".match-left").forEach(b => b.classList.remove("sel"));
      btn.classList.add("sel");
      m.selectedLeft = idx;
      Audio.tap();
      return;
    }
    // right tapped
    if (m.selectedLeft === null) { btn.classList.add("nudge"); setTimeout(() => btn.classList.remove("nudge"), 400); return; }
    const word = m.items[m.selectedLeft].word;
    const leftBtn = $(`.match-left[data-mleft="${m.selectedLeft}"]`);
    if (idx === m.selectedLeft) {
      // correct pair
      [leftBtn, btn].forEach(b => { b.classList.add("matched"); b.classList.remove("sel"); });
      Audio.correct();
      Store.recordWord(word, true); Store.addXp(5);
      m.selectedLeft = null; m.remaining--;
      if (m.remaining === 0) {
        Store.addGems(2); burstConfetti(20);
        showFeedback(true, { why: "You matched every word — brilliant!" }, () => { session.qIndex++; renderQuestion(); });
      }
    } else {
      // wrong pair
      [leftBtn, btn].forEach(b => { b.classList.add("nudge"); setTimeout(() => b.classList.remove("nudge"), 450); });
      btn.classList.remove("sel"); if (leftBtn) leftBtn.classList.remove("sel");
      Audio.wrong();
      session.wrongCount++;
      Store.recordWord(word, false);
      Store.logError({ letter: session.letter, word: word, type: "match", prompt: "Match to meaning", chosen: m.items[idx].word, correct: word });
      m.selectedLeft = null;
    }
  }

  /* ---- spelling game ---- */
  function renderSpell(q, total) {
    session._spell = { target: q.target, built: [] };
    setTimeout(() => Audio.say(q.word), 250);
    const visual = Art.has(q.word) ? `<div class="q-art">${Art.svg(q.word)}</div>` : `<div class="spell-emoji">${q.emoji}</div>`;
    const slots = q.target.split("").map((_, i) => `<span class="spell-slot" data-slot="${i}"></span>`).join("");
    const tiles = q.tiles.map((ch, i) => `<button class="spell-tile" data-tile="${i}" data-ch="${esc(ch)}">${esc(ch)}</button>`).join("");
    render(`
    <div class="screen quiz spell-screen" style="--c:${session.color}">
      ${lessonTopBar(total)}
      <div class="q-body pop-in">
        <h2 class="q-prompt">🔤 ${esc(q.prompt)}</h2>
        ${visual}
        <button class="speak-btn wide" data-action="speak" data-text="${esc(q.word)}">🔊 hear it</button>
        <div class="spell-slots">${slots}</div>
        <div class="spell-tiles">${tiles}</div>
        <button class="btn btn-soft spell-clear" data-action="spell-clear">⌫ Undo</button>
      </div>
      <div class="feedback-bar" id="fb"></div>
    </div>`);
  }

  function spellTap(btn) {
    const m = session._spell;
    if (!m || btn.disabled || btn.classList.contains("used")) return;
    m.built.push({ ch: btn.dataset.ch, tileIdx: btn.dataset.tile });
    btn.classList.add("used"); btn.disabled = true;
    Audio.tap();
    const slot = $$(".spell-slot")[m.built.length - 1];
    if (slot) { slot.textContent = btn.dataset.ch; slot.classList.add("filled"); }
    if (m.built.length === m.target.length) setTimeout(checkSpell, 200);
  }

  function spellClear() {
    const m = session._spell;
    if (!m || !m.built.length) return;
    const last = m.built.pop();
    const tile = $(`.spell-tile[data-tile="${last.tileIdx}"]`);
    if (tile) { tile.classList.remove("used"); tile.disabled = false; }
    const slot = $$(".spell-slot")[m.built.length];
    if (slot) { slot.textContent = ""; slot.classList.remove("filled"); }
    Audio.tap();
  }

  function checkSpell() {
    const m = session._spell;
    const q = session.questions[session.qIndex];
    const guess = m.built.map(b => b.ch).join("");
    if (guess === m.target) {
      Audio.correct(); burstConfetti(16);
      Store.recordWord(q.word, true); Store.addXp(10); Store.addGems(1);
      $$(".spell-slot").forEach(s => s.classList.add("right"));
      showFeedback(true, { why: q.why }, () => { session.qIndex++; renderQuestion(); });
    } else {
      Audio.wrong(); session.wrongCount++;
      Store.recordWord(q.word, false);
      Store.logError({ letter: session.letter, word: q.word, type: "spell", prompt: "Spell the word", chosen: guess, correct: m.target });
      // KIND retry: keep the correct letters, only clear from the first wrong one onward
      let keep = 0;
      while (keep < m.built.length && m.built[keep].ch === m.target[keep]) keep++;
      const slots = $$(".spell-slot");
      // gently flag the first wrong slot
      if (slots[keep]) slots[keep].classList.add("shake-slot");
      setTimeout(() => {
        // re-enable the tiles used after the correct prefix, and clear those slots
        for (let i = m.built.length - 1; i >= keep; i--) {
          const b = m.built[i];
          const tile = $(`.spell-tile[data-tile="${b.tileIdx}"]`);
          if (tile) { tile.classList.remove("used"); tile.disabled = false; }
        }
        m.built = m.built.slice(0, keep);
        slots.forEach((s, i) => {
          s.classList.remove("shake-slot");
          if (i >= keep) { s.textContent = ""; s.classList.remove("filled"); }
        });
      }, 600);
    }
  }

  /* ---- anagram (unscramble using the meaning as a clue) ---- */
  function renderAnagram(q, total) {
    session._spell = { target: q.target, built: [] };
    const visual = Art.has(q.word) ? `<div class="q-art">${Art.svg(q.word)}</div>` : `<div class="spell-emoji">${q.emoji}</div>`;
    const slots = q.target.split("").map((_, i) => `<span class="spell-slot" data-slot="${i}"></span>`).join("");
    const tiles = q.tiles.map((ch, i) => `<button class="spell-tile" data-tile="${i}" data-ch="${esc(ch)}">${esc(ch)}</button>`).join("");
    render(`
    <div class="screen quiz spell-screen" style="--c:${session.color}">
      ${lessonTopBar(total)}
      <div class="q-body pop-in">
        <h2 class="q-prompt">🧩 ${esc(q.prompt)}</h2>
        ${visual}
        <p class="anagram-clue">💡 ${esc(q.clue)}</p>
        <div class="spell-slots">${slots}</div>
        <div class="spell-tiles">${tiles}</div>
        <button class="btn btn-soft spell-clear" data-action="spell-clear">⌫ Undo</button>
      </div>
      <div class="feedback-bar" id="fb"></div>
    </div>`);
  }

  /* ---- Memory Match: flip cards to pair each word with its picture ---- */
  function renderMemory(q, total) {
    const cards = [];
    q.items.forEach((it, i) => {
      cards.push({ pair: i, kind: "word", label: it.word, word: it.word });
      cards.push({ pair: i, kind: "pic", emoji: it.emoji, word: it.word });
    });
    session._mem = { cards: Quiz.shuffle(cards), flipped: [], matched: 0, count: q.items.length, lock: false, seconds: 0 };
    const m = session._mem;
    // render the grid ONCE; taps update only the cards that change (no re-render = no "dancing")
    const cardsHtml = m.cards.map((c, i) => `<button class="mem-card" data-mem="${i}"><span class="mem-back">★</span></button>`).join("");
    render(`
    <div class="screen quiz memory-screen" style="--c:${session.color}">
      ${lessonTopBar(total)}
      <div class="q-body pop-in">
        <h2 class="q-prompt">🧠 Memory Match!</h2>
        <p class="mem-hint">Flip two cards — pair each word with its picture. <span id="memTimer">⏱️ 0s</span></p>
        <div class="mem-grid">${cardsHtml}</div>
      </div>
      <div class="feedback-bar" id="fb"></div>
    </div>`);
    clearInterval(memTimer);
    memTimer = setInterval(() => {
      if (!session || !session._mem) { clearInterval(memTimer); return; }
      session._mem.seconds++;
      const el = document.getElementById("memTimer");
      if (el) el.textContent = "⏱️ " + session._mem.seconds + "s";
    }, 1000);
  }
  function memFace(c) {
    return c.kind === "word"
      ? `<span class="mem-word">${esc(cap(c.label))}</span>`
      : (Art.has(c.word) ? `<span class="mem-art">${Art.svg(c.word)}</span>` : `<span class="mem-emoji">${c.emoji}</span>`);
  }
  function memEl(i) { return document.querySelector(`.mem-card[data-mem="${i}"]`); }

  function memoryTap(idx) {
    const m = session._mem;
    if (!m || m.lock) return;
    const c = m.cards[idx];
    if (!c || c.up || c.matched) return;
    const el = memEl(idx); if (!el) return;
    c.up = true; el.classList.add("up"); el.innerHTML = memFace(c);
    Audio.pop(); m.flipped.push(idx);
    if (m.flipped.length < 2) return;
    const ai = m.flipped[0], bi = m.flipped[1];
    const a = m.cards[ai], b = m.cards[bi];
    if (a.pair === b.pair) {
      a.matched = b.matched = true; m.matched++; m.flipped = [];
      [ai, bi].forEach(k => { const e = memEl(k); if (e) e.classList.add("matched"); });
      Audio.correct(); Store.recordWord(a.word, true); Store.addXp(5);
      if (m.matched === m.count) {
        clearInterval(memTimer); Store.addGems(2); burstConfetti(24);
        showFeedback(true, { why: "Amazing memory — done in " + m.seconds + "s! 🧠" }, () => { session.qIndex++; renderQuestion(); });
      }
    } else {
      m.lock = true; Audio.wrong();
      [ai, bi].forEach(k => { const e = memEl(k); if (e) e.classList.add("mem-miss"); });
      setTimeout(() => {
        if (!session || session._mem !== m) return;
        [ai, bi].forEach(k => { const e = memEl(k); if (e) { e.classList.remove("up", "mem-miss"); e.innerHTML = `<span class="mem-back">★</span>`; } });
        a.up = false; b.up = false; m.flipped = []; m.lock = false;
      }, 850);
    }
  }

  /* ---- pronunciation (say it!) ---- */
  function renderSay(q, total) {
    const supported = Audio.micSupported();
    const visual = Art.has(q.word) ? `<div class="q-art">${Art.svg(q.word)}</div>` : `<div class="spell-emoji">${q.emoji}</div>`;
    setTimeout(() => Audio.say(q.word), 250);
    render(`
    <div class="screen quiz say-screen" style="--c:${session.color}">
      ${lessonTopBar(total)}
      <div class="q-body pop-in">
        <h2 class="q-prompt">🎤 ${esc(q.prompt)}</h2>
        ${visual}
        <div class="say-word">${esc(q.word)}</div>
        <button class="speak-btn wide" data-action="speak" data-text="${esc(q.word)}">🔊 hear it first</button>
        <div class="say-status" id="sayStatus"></div>
        <button class="btn btn-primary btn-big mic-btn" data-action="say-listen">🎤 Tap &amp; say it</button>
        <button class="btn btn-ghost" data-action="say-skip">${supported ? "Skip this" : "I said it ✓ — continue"}</button>
      </div>
    </div>`);
  }

  function sayListen() {
    const q = session.questions[session.qIndex];
    const st = $("#sayStatus");
    if (st) { st.className = "say-status listening"; st.textContent = `🎙️ Listening… say “${q.word}”`; }
    Audio.listen(q.word, (ok, said) => {
      if (ok) {
        Audio.correct(); burstConfetti(16); Store.recordWord(q.word, true); Store.addXp(10);
        if (st) { st.className = "say-status ok"; st.textContent = "Perfect! 🎉"; }
        setTimeout(() => { session.qIndex++; renderQuestion(); }, 1000);
      } else if (ok === false) {
        Audio.wrong();
        if (st) { st.className = "say-status no"; st.textContent = `I heard “${said || "…"}”. Try again!`; }
      } else {
        if (st) { st.className = "say-status"; st.textContent = "🎤 Mic isn't available here — tap “I said it” to go on."; }
      }
    });
  }

  function saySkip() { const q = session.questions[session.qIndex]; Store.recordWord(q.word, true); session.qIndex++; renderQuestion(); }

  function answer(choice, btn) {
    const q = session.questions[session.qIndex];
    if (!q || btn.closest(".opts").classList.contains("locked")) return;
    const correct = norm(choice) === norm(q.answer);
    $(".opts").classList.add("locked");
    Store.recordWord(q.word, correct);

    if (correct) {
      btn.classList.add("right");
      Audio.correct();
      Store.addXp(10); Store.addGems(1);
      session.answeredCount++;
      if (!q._wasWrong) session.correctFirstTry++;
      showFeedback(true, q, () => { session.qIndex++; renderQuestion(); });
    } else {
      btn.classList.add("wrong");
      // highlight the correct option
      $$(".opt").forEach(b => { if (norm(b.dataset.opt) === norm(q.answer)) b.classList.add("right"); });
      Audio.wrong();
      session.wrongCount++;
      q._wasWrong = true;
      Store.logError({
        letter: session.letter, word: q.word, type: q.type,
        prompt: q.prompt, chosen: choice, correct: q.answer
      });
      // re-queue this question near the end so the child fixes it
      const requeue = Object.assign({}, q);
      session.questions.push(requeue);
      showFeedback(false, q, () => { session.qIndex++; renderQuestion(); });
    }
  }

  function showFeedback(ok, q, next) {
    const fb = $("#fb");
    fb.className = "feedback-bar show " + (ok ? "ok" : "no");
    fb.innerHTML = `
      <div class="fb-inner">
        <div class="fb-icon">${ok ? "🎉" : "💡"}</div>
        <div class="fb-text">
          <b>${ok ? pickPraise() : "Not quite — let's learn it!"}</b>
          <span>${esc(q.why)}</span>
        </div>
        <button class="btn ${ok ? "btn-success" : "btn-warn"}" data-action="continue">
          ${ok ? "Continue →" : "Got it, I'll try again →"}
        </button>
      </div>`;
    session._continue = next;
    // (no per-answer confetti — confetti is reserved for real milestones so it stays special)
  }

  function pickPraise() {
    const p = ["Brilliant! 🌟", "You got it! 🎉", "Amazing! 🤩", "Superstar! ⭐", "Way to go! 🚀", "Perfect! 💯"];
    return p[Math.floor(Math.random() * p.length)];
  }

  function finishLesson() {
    if (session.isReview) return finishReview();
    flushTime();
    Audio.fanfare();
    burstConfetti(120);
    const wrong = session.wrongCount;
    const stars = wrong === 0 ? 3 : wrong <= 2 ? 2 : 1;
    Store.completeLesson(session.id, stars);
    const earnedXp = session.correctFirstTry * 10;
    Store.addGems(stars * 2);
    const mastered = stars >= 2;
    const letterDone = mastered && completedLetters().includes(session.letter);
    const newBadges = checkBadges();
    const canReview = mastered && weightedReview(4).length >= 4;
    const starHtml = [1, 2, 3].map(n => `<span class="big-star ${stars >= n ? "on" : ""}" style="animation-delay:${n * .15}s">★</span>`).join("");
    render(`
    <div class="screen complete" style="--c:${session.color}">
      <div class="bubbles-bg">${bubbleField()}</div>
      <div class="complete-card pop-in">
        ${mascot(mastered ? "celebrate" : "think", 120)}
        <h1>${letterDone ? "Letter " + session.letter + " complete! 🎉" : (mastered ? "Lesson mastered! 🌟" : "Good try! 💪")}</h1>
        <div class="big-stars">${starHtml}</div>
        <div class="reward-row">
          <div class="reward"><span>⚡</span><b>+${earnedXp}</b><small>XP</small></div>
          <div class="reward"><span>💎</span><b>+${stars * 2}</b><small>gems</small></div>
          <div class="reward"><span>🔥</span><b>${Store.stats().streak}</b><small>streak</small></div>
        </div>
        ${badgesHtml(newBadges)}
        ${!mastered ? `<p class="master-msg">Get ★★ to <b>master</b> this and unlock the next lesson. You're so close — try again! 💪</p>
          <button class="btn btn-primary btn-big" data-action="retry-lesson">↻ Try again</button>` : ""}
        ${letterDone ? `<p class="lock-in-msg">Now lock letter ${session.letter} into memory! 🔁</p>` : ""}
        ${canReview ? `<button class="btn btn-success btn-big" data-action="start-review">🔁 Review &amp; remember</button>` : ""}
        <button class="btn ${(canReview || !mastered) ? "btn-ghost" : "btn-primary btn-big"}" data-action="finish-back">${mastered ? "Keep learning! ✨" : "Back to map"}</button>
      </div>
    </div>`);
  }

  /* ============================================================
     PARENT ZONE
     ============================================================ */

  function screenParentGate() {
    flushTime();
    if (parentUnlocked) return screenParent();
    render(`
    <div class="screen parent-gate">
      <div class="gate-card pop-in">
        <div class="gate-emoji">🔐</div>
        <h2>Parent Zone</h2>
        <p>Enter your 4-digit PIN<br><small>(default is 0000 — you can change it inside)</small></p>
        <input id="pinInput" class="pin-input" inputmode="numeric" maxlength="4" placeholder="• • • •"/>
        <div class="gate-err" id="gateErr"></div>
        <button class="btn btn-primary btn-big" data-action="check-pin">Enter</button>
        <button class="btn btn-ghost" data-go="home">← Back to learning</button>
      </div>
    </div>`);
    const i = $("#pinInput"); if (i) i.focus();
  }

  function screenParent() {
    flushTime();
    const s = Store.get();
    const st = Store.stats();
    const mins = Math.floor(st.totalSeconds / 60), secs = st.totalSeconds % 60;
    const timeStr = mins >= 60 ? Math.floor(mins / 60) + "h " + (mins % 60) + "m" : mins + "m " + secs + "s";

    // accuracy ring
    const ring = `conic-gradient(var(--ok) ${st.accuracy * 3.6}deg, #ECE3F5 0deg)`;

    // last 14 days streak strip
    const days = [];
    for (let d = 13; d >= 0; d--) {
      const dt = new Date(); dt.setDate(dt.getDate() - d);
      const k = dt.getFullYear() + "-" + String(dt.getMonth() + 1).padStart(2, "0") + "-" + String(dt.getDate()).padStart(2, "0");
      days.push(`<span class="day ${s.activeDays[k] ? "active" : ""}" title="${k}">${dt.getDate()}</span>`);
    }

    // needs-practice list
    const practice = st.needPractice.length
      ? st.needPractice.slice(0, 12).map(p => `<span class="practice-chip">${esc(cap(p.word))} <small>×${p.wrong}</small></span>`).join("")
      : `<p class="muted">No trouble words yet — great going! 🎉</p>`;

    // recent errors
    const errs = s.errors.slice(0, 15).map(e => `
      <tr>
        <td><b>${esc(cap(e.word))}</b></td>
        <td>${esc(typeLabel(e.type))}</td>
        <td class="bad">${esc(cap(e.chosen))}</td>
        <td class="good">${esc(cap(e.correct))}</td>
        <td class="when">${timeAgo(e.at)}</td>
      </tr>`).join("") || `<tr><td colspan="5" class="muted">No mistakes logged yet.</td></tr>`;

    render(`
    <div class="screen parent">
      <div class="parent-head">
        <button class="btn-back" data-go="home">←</button>
        <h2>👤 Parent Zone</h2>
        <span class="learner-tag">${s.learnerName ? esc(s.learnerName) : "Your child"}</span>
      </div>

      <div class="stat-grid">
        <div class="stat-card"><div class="ring" style="background:${ring}"><span>${st.accuracy}%</span></div><label>Accuracy</label></div>
        <div class="stat-card"><b class="big">${st.mastered}</b><small>of ${st.attempted}</small><label>Words mastered</label></div>
        <div class="stat-card"><b class="big">${timeStr}</b><label>Time learning</label></div>
        <div class="stat-card"><b class="big">🔥 ${st.streak}</b><label>Day streak</label></div>
        <div class="stat-card"><b class="big">${st.totalCorrect}</b><label>Correct answers</label></div>
        <div class="stat-card"><b class="big">Lvl ${st.level}</b><small>${s.xp} XP</small><label>Level</label></div>
      </div>

      <section class="panel">
        <h3>📅 Active days (last 2 weeks)</h3>
        <div class="day-strip">${days.join("")}</div>
      </section>

      <section class="panel">
        <h3>🎯 Words to practice <small>(missed & not yet mastered)</small></h3>
        <div class="practice-wrap">${practice}</div>
      </section>

      <section class="panel">
        <h3>📝 Error analysis <small>(most recent mistakes)</small></h3>
        <div class="table-wrap">
          <table class="err-table">
            <thead><tr><th>Word</th><th>Question</th><th>She chose</th><th>Correct</th><th>When</th></tr></thead>
            <tbody>${errs}</tbody>
          </table>
        </div>
      </section>

      <section class="panel">
        <h3>🌈 World <small>(theme for your child)</small></h3>
        <div class="world-switch">
          ${Themes.list().map(t => `<button class="world-btn world-${t.key} ${s.theme === t.key ? "active" : ""}" data-action="set-world" data-world="${t.key}">
            <span>${t.emoji}</span>${esc(t.name)}</button>`).join("")}
        </div>
      </section>

      <section class="panel">
        <h3>🔊 Voice <small>(reads words aloud)</small></h3>
        <div class="voice-gender">
          <button class="gbtn ${s.settings.voiceGender === "female" ? "active" : ""}" data-action="voice-female">👩 Female</button>
          <button class="gbtn ${s.settings.voiceGender === "male" ? "active" : ""}" data-action="voice-male">👨 Male</button>
        </div>
        ${voicePickerHtml(s)}
        <div class="voice-row">
          <label class="rate-label">🐢 Speed</label>
          <input type="range" min="0.6" max="1.1" step="0.02" value="${Audio.getRate()}" data-rate-slider class="rate-slider">
          <label class="rate-label">🐇</label>
        </div>
        <button class="btn btn-soft" data-action="test-voice">▶ Test the voice</button>
        <p class="muted tiny">Tip: voices come from the device. On phones &amp; tablets they usually sound best. Pick the one you like most.</p>
      </section>

      <section class="panel settings">
        <h3>⚙️ Settings</h3>
        <label class="toggle"><span>🔊 Word audio on</span><input type="checkbox" data-setting="voice" ${s.settings.voice ? "checked" : ""}></label>
        <label class="toggle"><span>🎵 Sound effects</span><input type="checkbox" data-setting="sfx" ${s.settings.sfx ? "checked" : ""}></label>
        <label class="toggle"><span>🎶 Background music</span><input type="checkbox" data-setting="music" ${s.settings.music ? "checked" : ""}></label>
        <label class="toggle"><span>⭐ Premium (unlock all letters — demo)</span><input type="checkbox" data-setting="premium" ${s.premium ? "checked" : ""}></label>
        <div class="setting-row">
          <button class="btn btn-soft" data-action="change-name">✏️ Set child's name</button>
          <button class="btn btn-soft" data-action="change-pin">🔑 Change PIN</button>
          <button class="btn btn-danger" data-action="reset">🗑️ Reset progress</button>
        </div>
      </section>

      <div class="parent-extra">
        <button class="btn btn-soft" data-go="about">ℹ️ About &amp; Help</button>
      </div>
      <p class="parent-foot">${esc(CONFIG.appName)} v${esc(CONFIG.version)} · All data stays on this device. Nothing is uploaded. 💜</p>
    </div>`);
  }

  /* ============================================================
     BIND EVENTS (event delegation)
     ============================================================ */

  function bind() {
    const r = root();

    r.onclick = (e) => {
      const t = e.target.closest("[data-go],[data-action],[data-letter],[data-lesson],[data-opt],[data-rate],[data-theme-pick],[data-mleft],[data-mright],[data-tile],[data-mem]");
      if (!t) return;

      if (t.dataset.mleft !== undefined) return matchTap("left", +t.dataset.mleft, t);
      if (t.dataset.mright !== undefined) return matchTap("right", +t.dataset.mright, t);
      if (t.dataset.mem !== undefined) return memoryTap(+t.dataset.mem);
      if (t.dataset.tile !== undefined) return spellTap(t);

      if (t.dataset.themePick) {
        const k = t.dataset.themePick;
        Store.setTheme(k); Themes.apply(k); Audio.setTheme(k);
        if (Store.get().settings.music) { Audio.stopMusic(); Audio.startMusic(); }
        Audio.sparkle();
        return screenHome();
      }

      if (t.dataset.go) { Audio.tap(); return route(t.dataset.go); }

      if (t.dataset.letter) {
        if (t.dataset.locked) { Audio.tap(); return openLockedLetter(t.dataset.letter); }
        Audio.pop(); return screenLetter(t.dataset.letter);
      }

      if (t.dataset.lesson) {
        if (t.dataset.locked) { Audio.wrong(); toast("⭐⭐ Master the lesson before this one to unlock it!"); return; }
        Audio.tap(); return startLesson(t.dataset.lesson);
      }

      if (t.dataset.opt !== undefined) return answer(t.dataset.opt, t);

      if (t.dataset.rate) { Audio.tap(); Store.addFeedback({ lesson: session && session.id, rating: +t.dataset.rate }); t.classList.add("picked"); return; }

      const a = t.dataset.action;
      if (a) handleAction(a, t);
    };

    // toggles
    $$("[data-setting]", r).forEach(inp => {
      inp.onchange = () => {
        const k = inp.dataset.setting;
        if (k === "premium") Store.setPremium(inp.checked);
        else { Store.setSetting(k, inp.checked); if (k === "voice") Audio.setVoice(inp.checked); if (k === "sfx") Audio.setSfx(inp.checked); if (k === "music") { inp.checked ? Audio.startMusic() : Audio.stopMusic(); } }
      };
    });

    // voice picker + speed
    const vs = $("[data-voice-select]", r);
    if (vs) vs.onchange = () => { Store.setSetting("voiceName", vs.value); Audio.setVoiceByName(vs.value); Audio.say("Hello!"); };
    const rs = $("[data-rate-slider]", r);
    if (rs) rs.onchange = () => { const v = parseFloat(rs.value); Store.setSetting("rate", v); Audio.setRate(v); Audio.say("Like this"); };

    // enter key on name / pin
    const ni = $("#nameInput"); if (ni) ni.onkeydown = (e) => { if (e.key === "Enter") handleAction("start-learning"); };
    const pi = $("#pinInput"); if (pi) pi.onkeydown = (e) => { if (e.key === "Enter") handleAction("check-pin"); };
  }

  function handleAction(a, t) {
    switch (a) {
      case "start-learning": {
        const v = ($("#nameInput") || {}).value;
        if (v && v.trim()) Store.setName(v.trim());
        Store.touchDay(); Audio.pop(); screenHome(); break;
      }
      case "speak": Audio.speak(t.dataset.text); break;
      case "spell-clear": spellClear(); break;
      case "say-listen": sayListen(); break;
      case "say-skip": saySkip(); break;
      case "flash-say": {
        const word = t.dataset.text; toast("🎙️ Listening…");
        Audio.listen(word, (ok, said) => {
          if (ok) { Audio.correct(); toast("Perfect! 🎉"); }
          else if (ok === false) { Audio.wrong(); toast(`I heard “${said || "…"}”. Try again!`); }
          else { toast("🎤 Mic isn't available here."); }
        });
        break;
      }
      case "start-review": startReview(); break;
      case "go-premium": Audio.tap(); screenPremium(); break;
      case "unlock-premium": Store.setPremium(true); Audio.fanfare(); burstConfetti(90); toast("🎉 Premium unlocked — all 26 letters are open!"); screenHome(); break;
      case "voice-female": Store.setSetting("voiceGender", "female"); Audio.setGender("female"); Audio.say("Hello! Let's learn!"); screenParent(); break;
      case "voice-male": Store.setSetting("voiceGender", "male"); Audio.setGender("male"); Audio.say("Hello! Let's learn!"); screenParent(); break;
      case "flash-next": flashNext(); break;
      case "continue": if (session && session._continue) { const n = session._continue; session._continue = null; n(); } break;
      case "quit-lesson": flushTime(); if (confirmLeave()) { clearInterval(memTimer); session = null; route("home"); } break;
      case "finish-back": clearInterval(memTimer); session = null; screenHome(); break;
      case "retry-lesson": { const id = session && session.id; if (id) startLesson(id); break; }
      case "check-pin": {
        const v = ($("#pinInput") || {}).value;
        if (v === Store.get().pin) { parentUnlocked = true; Audio.correct(); screenParent(); }
        else { $("#gateErr").textContent = "Oops, wrong PIN. Try again."; Audio.wrong(); }
        break;
      }
      case "set-world": { const k = t.dataset.world; Store.setTheme(k); Themes.apply(k); Audio.setTheme(k); if (Store.get().settings.music) { Audio.stopMusic(); Audio.startMusic(); } Audio.sparkle(); screenParent(); break; }
      case "test-voice": Audio.say("Hi! I am Pip. Let's learn beautiful words together!"); break;
      case "change-name": { const n = prompt("Child's name:", Store.get().learnerName || ""); if (n !== null) { Store.setName(n.trim()); screenParent(); } break; }
      case "change-pin": { const n = prompt("New 4-digit PIN:", ""); if (n && /^\d{4}$/.test(n)) { Store.setPin(n); alert("PIN updated."); } else if (n !== null) alert("PIN must be 4 digits."); break; }
      case "reset": { if (confirm("Erase ALL progress on this device? This cannot be undone.")) { Store.reset(); parentUnlocked = false; screenOnboard(); } break; }
    }
  }

  function confirmLeave() { return confirm("Leave this lesson? Your progress in it won't be saved."); }
  function openLockedLetter(letter) {
    const L = LETTERS.find(x => x.letter === letter);
    if (!L || !L.words.length) { toast("Letter " + letter + " is coming very soon! 🛠️"); return; }
    screenPremium(letter);
  }

  /* ---- professional Premium upgrade screen ---- */
  function screenPremium(letter) {
    flushTime();
    const L = letter ? LETTERS.find(x => x.letter === letter) : null;
    const totalWords = LETTERS.reduce((s, x) => s + x.words.length, 0);
    render(`
    <div class="screen premium-screen">
      <div class="bubbles-bg">${bubbleField()}</div>
      <div class="premium-card pop-in">
        <button class="btn-back" data-go="home">←</button>
        <div class="premium-crown">👑</div>
        <h1 class="logo">${esc(CONFIG.appName)} Premium</h1>
        <p class="tagline">Unlock the whole adventure ✨</p>
        ${L ? `<div class="premium-letter" style="--c:${L.color}">${letter}</div><p class="premium-sub">“${esc(L.theme)}” is a Premium letter.</p>` : ""}
        <ul class="premium-benefits">
          <li><span>🔤</span><div><b>All 26 letters</b><small>${totalWords >= 100 ? totalWords.toLocaleString() + "+" : "thousands of"} beautiful words</small></div></li>
          <li><span>🎮</span><div><b>Every game</b><small>match, spelling, pictures &amp; say-it-out-loud</small></div></li>
          <li><span>📊</span><div><b>Full parent analytics</b><small>progress, errors &amp; what to practise</small></div></li>
          <li><span>🏆</span><div><b>Both worlds</b><small>Sparkle &amp; Super-Hero, your child's choice</small></div></li>
          <li><span>📴</span><div><b>Works fully offline</b><small>no ads, no tracking, ever</small></div></li>
        </ul>
        <button class="btn btn-primary btn-big" data-action="unlock-premium">⭐ Unlock Premium</button>
        <p class="premium-free-note">The free version includes letters <b>${CONFIG.freeLetters.join(", ")}</b> — plenty to begin!</p>
      </div>
    </div>`);
  }

  /* ---- About / Help (professional info for parents) ---- */
  function screenAbout() {
    flushTime();
    render(`
    <div class="screen about-screen">
      <div class="about-card pop-in">
        <button class="btn-back" data-go="parent">←</button>
        <div class="about-hero">${mascot("happy", 84)}</div>
        <h1 class="logo">${esc(CONFIG.appName)}</h1>
        <p class="tagline">${esc(CONFIG.tagline)}</p>
        <div class="about-sec"><h3>📖 How it works</h3><p>Each word is taught with a picture, audio, a simple meaning, synonyms and opposites — then practised through games, spelling and saying it out loud. Wrong answers come back until they're fixed, so children build real understanding, step by step.</p></div>
        <div class="about-sec"><h3>👤 For parents</h3><p>Open the Parent Zone (PIN ${esc(CONFIG.parentPinDefault)}) any time to see accuracy, time spent, words mastered, daily streaks, and exactly which words need more practice.</p></div>
        <div class="about-sec"><h3>💜 Privacy</h3><p>Everything stays on this device. No accounts, no ads, no tracking — nothing is uploaded.</p></div>
        <p class="about-version">${esc(CONFIG.appName)} · version ${esc(CONFIG.version)}</p>
      </div>
    </div>`);
  }

  function route(name) {
    if (name === "home") {
      const s = Store.get();
      if (!s.learnerName) return screenOnboard();
      if (!s.theme) return screenThemePicker();
      return screenHome();
    }
    if (name === "parent") return screenParentGate();
    if (name === "premium") return screenPremium();
    if (name === "about") return screenAbout();
    if (name === "trophies") return screenTrophies();
    screenHome();
  }

  /* ---- choose your world (theme picker) ---- */
  function screenThemePicker(fromSettings) {
    flushTime();
    const cards = Themes.list().map(t => `
      <button class="world-card world-${t.key}" data-theme-pick="${t.key}">
        <span class="world-emoji">${t.emoji}</span>
        <span class="world-name">${esc(t.name)}</span>
        <span class="world-blurb">${esc(t.blurb)}</span>
        <span class="world-go">Choose ${t.emoji}</span>
      </button>`).join("");
    render(`
    <div class="screen world-pick">
      <div class="bubbles-bg">${bubbleField()}</div>
      <div class="world-head pop-in">
        ${mascot("happy", 96)}
        <h1 class="logo">Pick your world!</h1>
        <p class="tagline">Tap the one you love — you can switch any time.</p>
      </div>
      <div class="world-grid">${cards}</div>
      ${fromSettings ? `<button class="btn btn-ghost" data-go="parent">← Back</button>` : ""}
    </div>`);
  }

  /* ---------- bits & pieces ---------- */
  function cap(s) { return String(s).charAt(0).toUpperCase() + String(s).slice(1); }
  function norm(s) { return String(s).trim().toLowerCase(); }
  function typeLabel(t) { return { meaning: "Meaning", word: "Find word", synonym: "Same word", antonym: "Opposite", listen: "Listen", fill: "Fill blank" }[t] || t; }
  function voicePickerHtml(s) {
    const voices = Audio.listVoices();
    if (!voices.length) return `<p class="muted">Loading voices… if this stays empty, reopen this screen.</p>`;
    const cur = s.settings.voiceName || Audio.getVoiceName();
    const opts = voices.map(v => `<option value="${esc(v.name)}" ${v.name === cur ? "selected" : ""}>${esc(v.name)} · ${esc(v.lang)}</option>`).join("");
    return `<select class="voice-select" data-voice-select>${opts}</select>`;
  }
  function timeAgo(ts) {
    const s = Math.round((Date.now() - ts) / 1000);
    if (s < 60) return "just now";
    if (s < 3600) return Math.floor(s / 60) + "m ago";
    if (s < 86400) return Math.floor(s / 3600) + "h ago";
    return Math.floor(s / 86400) + "d ago";
  }
  function bubbleField() {
    // themed floating decorations (hearts/sparkles or stars/bolts)
    return (typeof Themes !== "undefined") ? Themes.floatField(Themes.current(), 6) : "";
  }
  function toast(msg) {
    let t = document.getElementById("toast");
    if (!t) { t = document.createElement("div"); t.id = "toast"; document.body.appendChild(t); }
    t.textContent = msg; t.className = "show";
    clearTimeout(toast._t); toast._t = setTimeout(() => t.className = "", 2600);
  }

  /* ---------- confetti ---------- */
  function burstConfetti(count) {
    let c = document.getElementById("confetti");
    if (!c) { c = document.createElement("canvas"); c.id = "confetti"; document.body.appendChild(c); }
    c.width = innerWidth; c.height = innerHeight;
    const ctx = c.getContext("2d");
    const cols = (typeof Themes !== "undefined") ? Themes.confettiColors(Themes.current()) : ["#FF7A5C", "#2EC4B6", "#FFC93C", "#8A4FFF", "#FF6B9D", "#6BCB77"];
    const parts = [];
    for (let i = 0; i < count; i++) parts.push({
      x: innerWidth / 2 + (Math.random() - .5) * 200, y: innerHeight / 3,
      vx: (Math.random() - .5) * 12, vy: -8 - Math.random() * 8,
      g: .35 + Math.random() * .2, s: 6 + Math.random() * 8,
      col: cols[i % cols.length], rot: Math.random() * 6, vr: (Math.random() - .5) * .4, life: 0
    });
    let raf;
    (function frame() {
      ctx.clearRect(0, 0, c.width, c.height);
      let alive = false;
      parts.forEach(p => {
        p.life++; p.vy += p.g; p.x += p.vx; p.y += p.vy; p.rot += p.vr;
        if (p.y < c.height + 20) alive = true;
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot);
        ctx.fillStyle = p.col; ctx.fillRect(-p.s / 2, -p.s / 2, p.s, p.s * .6); ctx.restore();
      });
      if (alive) raf = requestAnimationFrame(frame); else ctx.clearRect(0, 0, c.width, c.height);
    })();
  }

  /* ---------- boot ---------- */
  function init() {
    // apply saved theme + sound settings
    const s = Store.get();
    Themes.apply(s.theme || "sparkle");
    Audio.setTheme(s.theme || "sparkle");
    Audio.setVoice(s.settings.voice);
    Audio.setSfx(s.settings.sfx);
    if (s.settings.voiceGender) Audio.setGender(s.settings.voiceGender);
    if (s.settings.voiceName) Audio.setVoiceByName(s.settings.voiceName);
    if (s.settings.rate) Audio.setRate(s.settings.rate);
    if (s.settings.music) Audio.startMusic();
    // warm up speech voices
    if ("speechSynthesis" in window) window.speechSynthesis.getVoices();
    route("home");
  }

  return { init };
})();

document.addEventListener("DOMContentLoaded", App.init);
