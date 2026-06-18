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
    preferredVoice = voices.slice().sort((a, b) => score(b) - score(a))[0] || null;
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

  function correct() { if (!sfxOn) return; tone(523.25, 0, .18, "triangle"); tone(659.25, .09, .18, "triangle"); tone(783.99, .18, .26, "triangle"); }
  function wrong()   { if (!sfxOn) return; tone(311.13, 0, .18, "sine", .14); tone(246.94, .12, .26, "sine", .14); }
  function pop()     { if (!sfxOn) return; tone(880, 0, .07, "sine", .12); tone(1320, .04, .06, "sine", .08); }
  function fanfare() { if (!sfxOn) return; [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => tone(f, i * .12, .3, "triangle", .16)); }
  function tap()     { if (!sfxOn) return; tone(660, 0, .05, "sine", .08); }
  function sparkle() { if (!sfxOn) return; [1318, 1568, 2093].forEach((f, i) => tone(f, i * .05, .12, "sine", .06)); }

  return {
    speak, say,
    correct, wrong, pop, fanfare, tap, sparkle,
    listVoices: () => allVoices().map(v => ({ name: v.name, lang: v.lang })),
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
