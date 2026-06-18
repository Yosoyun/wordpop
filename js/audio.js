/* ============================================================
   WordPop — Audio Engine
   ------------------------------------------------------------
   100% offline. No files, no API keys.
   • Speech  : the browser's built-in voice (Web Speech API)
   • Effects : tiny musical notes synthesised with Web Audio
   The parent can pick the best-sounding installed voice + speed.
   ============================================================ */

const Audio = (function () {
  let ctx = null;
  let voiceOn = true;
  let sfxOn = true;
  let rate = 0.86;            // a little slow & clear for young readers
  let pitch = 1.12;           // friendly, slightly higher
  let preferredVoice = null;
  let chosenName = null;      // parent-selected voice name (overrides auto)
  let theme = "sparkle";      // changes the flavour of the sound effects
  let musicTimer = null, musicOn = false;
  let prefGender = null;      // "female" | "male" | null (auto)

  const FEMALE_RE = /(samantha|karen|moira|tessa|fiona|serena|allison|ava|susan|zira|hazel|victoria|kate|aria|jenny|libby|sonia|natasha|nicky|veena|female|woman|girl|google uk english female|google us english)/;
  const MALE_RE = /(daniel|alex|fred|thomas|tom |oliver|george|james|mark|david|guy|ryan|rishi|aaron|arthur|male|google uk english male|microsoft mark)/;
  function voiceGender(v) {
    const n = (v.name + " " + v.lang).toLowerCase();
    if (MALE_RE.test(n) && !FEMALE_RE.test(n)) return "male";
    if (FEMALE_RE.test(n)) return "female";
    return "unknown";
  }

  function allVoices() {
    if (!("speechSynthesis" in window)) return [];
    return window.speechSynthesis.getVoices().filter(v => /^en/i.test(v.lang));
  }

  function score(v) {
    const n = (v.name + " " + v.lang).toLowerCase();
    let s = 0;
    if (/^en/i.test(v.lang)) s += 5;
    // high-quality / pleasant voices across platforms
    if (/(samantha|karen|moira|tessa|fiona|serena|allison|ava|nicky|aria|jenny|libby|sonia|natasha)/.test(n)) s += 6;
    if (/google (us|uk) english/.test(n)) s += 5;
    if (/female/.test(n)) s += 3;
    if (/(zira|hazel|susan)/.test(n)) s += 2;
    if (/(india|en-in)/.test(n)) s += 1;
    if (/(compact|eloquence|whisper|novelty)/.test(n)) s -= 5;
    return s;
  }

  function chooseVoice() {
    const voices = allVoices();
    if (!voices.length) return;
    if (chosenName) {
      const match = voices.find(v => v.name === chosenName);
      if (match) { preferredVoice = match; return; }
    }
    let pool = voices;
    if (prefGender) {
      const g = voices.filter(v => voiceGender(v) === prefGender);
      if (g.length) pool = g;
    }
    preferredVoice = pool.slice().sort((a, b) => score(b) - score(a))[0] || null;
  }

  if ("speechSynthesis" in window) {
    chooseVoice();
    window.speechSynthesis.onvoiceschanged = chooseVoice;
  }

  function speak(text, opts) {
    if (!voiceOn || !("speechSynthesis" in window)) return;
    opts = opts || {};
    try {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      if (!preferredVoice) chooseVoice();
      if (preferredVoice) u.voice = preferredVoice;
      u.rate = opts.rate || rate;
      u.pitch = opts.pitch || pitch;
      u.volume = 1;
      window.speechSynthesis.speak(u);
    } catch (e) {}
  }

  /* speak a word slowly and clearly (used on flashcards) */
  function say(word) { speak(word, { rate: Math.max(0.7, rate - 0.06) }); }

  /* ---- microphone pronunciation check (works when online; degrades gracefully) ---- */
  function micSupported() { return !!(window.SpeechRecognition || window.webkitSpeechRecognition); }
  function listen(expected, cb) {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { cb && cb(null, ""); return null; }
    const norm = s => String(s).toLowerCase().replace(/[^a-z]/g, "");
    try {
      const r = new SR();
      r.lang = "en-US"; r.interimResults = false; r.maxAlternatives = 4;
      let done = false;
      r.onresult = (e) => {
        done = true;
        let ok = false, said = "";
        const alts = e.results[0];
        for (let i = 0; i < alts.length; i++) {
          const t = alts[i].transcript.trim();
          if (i === 0) said = t;
          if (norm(t) === norm(expected) || norm(t).indexOf(norm(expected)) > -1) ok = true;
        }
        cb && cb(ok, said);
      };
      r.onerror = () => { if (!done) { done = true; cb && cb(null, ""); } };
      r.onend = () => { if (!done) { done = true; cb && cb(null, ""); } };
      r.start();
      return r;
    } catch (e) { cb && cb(null, ""); return null; }
  }

  function ensureCtx() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (AC) ctx = new AC();
    }
    if (ctx && ctx.state === "suspended") ctx.resume();
    return ctx;
  }
  function tone(freq, start, dur, type, gain) {
    const c = ensureCtx(); if (!c) return;
    type = type || "sine"; gain = gain || 0.18;
    const osc = c.createOscillator(), g = c.createGain();
    osc.type = type; osc.frequency.value = freq;
    osc.connect(g); g.connect(c.destination);
    const t = c.currentTime + start;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(gain, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.start(t); osc.stop(t + dur + 0.02);
  }

  function correct() {
    if (!sfxOn) return;
    if (theme === "hero") { tone(392, 0, .16, "triangle", .18); tone(523.25, .08, .16, "triangle", .18); tone(659.25, .16, .3, "triangle", .2); }
    else { tone(659.25, 0, .14, "sine", .16); tone(880, .08, .14, "sine", .16); tone(1174.66, .16, .22, "sine", .13); tone(1567.98, .24, .2, "sine", .08); }
  }
  function wrong()   { if (!sfxOn) return; tone(311.13, 0, .18, "sine", .14); tone(246.94, .12, .26, "sine", .14); }
  function pop() {
    if (!sfxOn) return;
    if (theme === "hero") { tone(523, 0, .07, "square", .08); tone(784, .04, .07, "square", .06); }
    else { tone(988, 0, .06, "sine", .1); tone(1480, .04, .06, "sine", .07); }
  }
  function fanfare() {
    if (!sfxOn) return;
    const notes = theme === "hero" ? [392, 523.25, 659.25, 783.99, 1046.5] : [523.25, 659.25, 783.99, 1046.5, 1318.5];
    notes.forEach((f, i) => tone(f, i * .12, .32, theme === "hero" ? "triangle" : "sine", .16));
  }
  function tap()     { if (!sfxOn) return; tone(theme === "hero" ? 520 : 720, 0, .05, "sine", .08); }
  function sparkle() { if (!sfxOn) return; [1318, 1568, 2093].forEach((f, i) => tone(f, i * .05, .12, "sine", .06)); }

  /* gentle optional background music (soft random arpeggio per theme) */
  const SCALES = { sparkle: [523.25, 587.33, 659.25, 783.99, 880, 1046.5], hero: [392, 440, 523.25, 587.33, 659.25, 783.99] };
  function playPad() {
    const c = ensureCtx(); if (!c) return;
    const scale = SCALES[theme] || SCALES.sparkle;
    const n = 2 + Math.floor(Math.random() * 2);
    for (let i = 0; i < n; i++) {
      const f = scale[Math.floor(Math.random() * scale.length)];
      tone(f, i * 0.3, 0.8, theme === "hero" ? "triangle" : "sine", 0.04);
    }
  }
  function startMusic() { if (musicOn) return; musicOn = true; ensureCtx(); playPad(); musicTimer = setInterval(playPad, 2600); }
  function stopMusic() { musicOn = false; if (musicTimer) { clearInterval(musicTimer); musicTimer = null; } }

  return {
    speak, say,
    correct, wrong, pop, fanfare, tap, sparkle,
    setTheme: (t) => { theme = t; },
    startMusic, stopMusic, isMusicOn: () => musicOn,
    micSupported, listen,
    setGender: (g) => { prefGender = g; chosenName = null; chooseVoice(); },
    getGender: () => prefGender,
    listVoices: () => allVoices().map(v => ({ name: v.name, lang: v.lang, gender: voiceGender(v) })),
    setVoiceByName: (name) => { chosenName = name || null; chooseVoice(); },
    getVoiceName: () => preferredVoice ? preferredVoice.name : "",
    setRate: (r) => { rate = r; },
    getRate: () => rate,
    setVoice: (on) => { voiceOn = on; if (!on && window.speechSynthesis) window.speechSynthesis.cancel(); },
    setSfx: (on) => { sfxOn = on; },
    isVoiceOn: () => voiceOn,
    isSfxOn: () => sfxOn
  };
})();
