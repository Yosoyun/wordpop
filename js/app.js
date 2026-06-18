/* ============================================================
   WordPop — App Engine (screens, lessons, quizzes, parent zone)
   ============================================================ */

const App = (function () {
  const root = () => document.getElementById("app");

  // ---- in-memory session state ----
  let session = null;        // active quiz/flashcard session
  let sessionStart = 0;      // for time tracking
  let parentUnlocked = false;

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
      <div class="path">${nodes}</div>
      <div class="home-foot">
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
          <span class="node-letter">${locked && !hasWords ? L.letter : (locked ? "🔒" : L.letter)}</span>
          ${crown}${badge}
        </button>
        <span class="node-caption">${esc(L.theme)}</span>
      </div>`;
  }

  /* break a letter's words into clusters (mini-lessons) + a review */
  function clustersFor(L) {
    const size = CONFIG.wordsPerCluster;
    const groups = [];
    for (let i = 0; i < L.words.length; i += size) groups.push(L.words.slice(i, i + size));
    const clusters = groups.map((g, idx) => ({ kind: "lesson", words: g, title: "Words " + (idx * size + 1) + "–" + (idx * size + g.length) }));
    if (L.words.length > size) clusters.push({ kind: "review", words: L.words, title: "Big Review 🏆" });
    return clusters;
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
      const prevDone = ci === 0 || (s.lessons[L.letter + ":" + (ci - 1)] || {}).completed;
      const locked = !prevDone;
      const stars = [1, 2, 3].map(n => `<span class="star ${prog.stars >= n ? "on" : ""}">★</span>`).join("");
      return `
        <button class="lesson-card ${locked ? "locked" : ""} ${prog.completed ? "done" : ""}"
                data-lesson="${id}" ${locked ? "data-locked='1'" : ""}>
          <span class="lesson-icon">${c.kind === "review" ? "🏆" : "🫧"}</span>
          <span class="lesson-body">
            <span class="lesson-title">${esc(c.title)}</span>
            <span class="lesson-stars">${stars}</span>
          </span>
          ${locked ? `<span class="lesson-lock">🔒</span>` : prog.completed ? `<span class="lesson-check">✓</span>` : `<span class="lesson-go">▶</span>`}
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
      // review jumps straight into a longer quiz over all words
      session.questions = Quiz.build(L.words, L.words);
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

    let stemHtml = "";
    if (q.stem === "__LISTEN__") {
      stemHtml = `<button class="big-speaker" data-action="speak" data-text="${esc(q.word)}">🔊<span>tap to hear</span></button>`;
    } else {
      const art = Art.has(q.word) && q.optionStyle !== "picture" ? `<div class="q-art">${Art.svg(q.word)}</div>` : "";
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
    if (ok) burstConfetti(10);
  }

  function pickPraise() {
    const p = ["Brilliant! 🌟", "You got it! 🎉", "Amazing! 🤩", "Superstar! ⭐", "Way to go! 🚀", "Perfect! 💯"];
    return p[Math.floor(Math.random() * p.length)];
  }

  function finishLesson() {
    flushTime();
    Audio.fanfare();
    burstConfetti(120);
    const wrong = session.wrongCount;
    const stars = wrong === 0 ? 3 : wrong <= 2 ? 2 : 1;
    Store.completeLesson(session.id, stars);
    const earnedXp = session.correctFirstTry * 10;
    Store.addGems(stars * 2);
    const starHtml = [1, 2, 3].map(n => `<span class="big-star ${stars >= n ? "on" : ""}" style="animation-delay:${n * .15}s">★</span>`).join("");
    render(`
    <div class="screen complete" style="--c:${session.color}">
      <div class="bubbles-bg">${bubbleField()}</div>
      <div class="complete-card pop-in">
        ${mascot("celebrate", 120)}
        <h1>Lesson complete!</h1>
        <div class="big-stars">${starHtml}</div>
        <div class="reward-row">
          <div class="reward"><span>⚡</span><b>+${earnedXp}</b><small>XP</small></div>
          <div class="reward"><span>💎</span><b>+${stars * 2}</b><small>gems</small></div>
          <div class="reward"><span>🎯</span><b>${session.correctFirstTry}</b><small>first try</small></div>
        </div>
        <div class="rate">
          <p>How was this lesson?</p>
          <div class="rate-faces">
            <button data-rate="3">😄</button>
            <button data-rate="2">🙂</button>
            <button data-rate="1">😕</button>
          </div>
        </div>
        <button class="btn btn-primary btn-big" data-action="finish-back">Keep learning! ✨</button>
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

      <p class="parent-foot">All data stays on this device. Nothing is uploaded. 💜</p>
    </div>`);
  }

  /* ============================================================
     BIND EVENTS (event delegation)
     ============================================================ */

  function bind() {
    const r = root();

    r.onclick = (e) => {
      const t = e.target.closest("[data-go],[data-action],[data-letter],[data-lesson],[data-opt],[data-rate],[data-theme-pick],[data-mleft],[data-mright]");
      if (!t) return;

      if (t.dataset.mleft !== undefined) return matchTap("left", +t.dataset.mleft, t);
      if (t.dataset.mright !== undefined) return matchTap("right", +t.dataset.mright, t);

      if (t.dataset.themePick) {
        const k = t.dataset.themePick;
        Store.setTheme(k); Themes.apply(k); Audio.setTheme(k);
        if (Store.get().settings.music) { Audio.stopMusic(); Audio.startMusic(); }
        Audio.sparkle();
        return screenHome();
      }

      if (t.dataset.go) { Audio.tap(); return route(t.dataset.go); }

      if (t.dataset.letter) {
        if (t.dataset.locked) { Audio.wrong(); return lockedToast(t.dataset.letter); }
        Audio.pop(); return screenLetter(t.dataset.letter);
      }

      if (t.dataset.lesson) {
        if (t.dataset.locked) { Audio.wrong(); return; }
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
      case "flash-next": flashNext(); break;
      case "continue": if (session && session._continue) { const n = session._continue; session._continue = null; n(); } break;
      case "quit-lesson": flushTime(); if (confirmLeave()) { session = null; route("home"); } break;
      case "finish-back": session = null; screenHome(); break;
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
  function lockedToast(letter) {
    const L = LETTERS.find(x => x.letter === letter);
    if (L && L.status === "coming-soon") toast("Letter " + letter + " is coming very soon! 🛠️");
    else toast("Letter " + letter + " is a ⭐ Premium letter. Unlock it in the Parent Zone!");
  }

  function route(name) {
    if (name === "home") {
      const s = Store.get();
      if (!s.learnerName) return screenOnboard();
      if (!s.theme) return screenThemePicker();
      return screenHome();
    }
    if (name === "parent") return screenParentGate();
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
    return (typeof Themes !== "undefined") ? Themes.floatField(Themes.current(), 16) : "";
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
