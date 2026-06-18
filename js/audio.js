/* ============================================================
   WordPop — Audio Engine
   ------------------------------------------------------------
   100% offline. No files, no API keys.
   • Speech  : the browser's built-in voice (Web Speech API)
   • Effects : tiny musical notes synthesised with Web Audio
   ============================================================ */

const Audio = (function () {
  let ctx = null;            // AudioContext (created on first use)
  let voiceOn = true;        // master toggle for speech
  let sfxOn = true;          // master toggle for sound effects
  let preferredVoice = null;

  /* Pick the nicest available English voice, preferring a child-friendly one. */
  function chooseVoice() {
    if (!("speechSynthesis" in window)) return;
    const voices = window.speechSynthesis.getVoices();
    if (!voices.length) return;
    const score = (v) => {
      const n = (v.name + " " + v.lang).toLowerCase();
      let s = 0;
      if (v.lang && v.lang.toLowerCase().startsWith("en")) s += 5;
      if (/(samantha|karen|moira|tessa|female|google us english|zira|aria|jenny)/.test(n)) s += 3;
      if (/(india|en-in)/.test(n)) s += 1;
      return s;
    };
    preferredVoice = voices.slice().sort((a, b) => score(b) - score(a))[0] || null;
  }

  if ("speechSynthesis" in window) {
    chooseVoice();
    window.speechSynthesis.onvoiceschanged = chooseVoice;
  }

  /* Speak a word or sentence aloud. */
  function speak(text, { rate = 0.92, pitch = 1.08 } = {}) {
    if (!voiceOn || !("speechSynthesis" in window)) return;
    try {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      if (preferredVoice) u.voice = preferredVoice;
      u.rate = rate; u.pitch = pitch; u.volume = 1;
      window.speechSynthesis.speak(u);
    } catch (e) { /* speech not available — fail silently */ }
  }

  function ensureCtx() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (AC) ctx = new AC();
    }
    if (ctx && ctx.state === "suspended") ctx.resume();
    return ctx;
  }

  /* Play a short tone. */
  function tone(freq, start, dur, type = "sine", gain = 0.18) {
    const c = ensureCtx(); if (!c) return;
    const osc = c.createOscillator();
    const g = c.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    osc.connect(g); g.connect(c.destination);
    const t = c.currentTime + start;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(gain, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.start(t); osc.stop(t + dur + 0.02);
  }

  /* A cheerful little chord/arpeggio for a correct answer. */
  function correct() {
    if (!sfxOn) return;
    tone(523.25, 0, 0.18, "triangle");   // C5
    tone(659.25, 0.09, 0.18, "triangle"); // E5
    tone(783.99, 0.18, 0.26, "triangle"); // G5
  }

  /* A soft, gentle "try again" — never harsh for a child. */
  function wrong() {
    if (!sfxOn) return;
    tone(311.13, 0, 0.18, "sine", 0.14);  // Eb4
    tone(246.94, 0.12, 0.26, "sine", 0.14); // B3
  }

  /* A bubble "pop". */
  function pop() {
    if (!sfxOn) return;
    tone(880, 0, 0.07, "sine", 0.12);
  }

  /* A triumphant fanfare for finishing a lesson / level up. */
  function fanfare() {
    if (!sfxOn) return;
    [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => tone(f, i * 0.12, 0.3, "triangle", 0.16));
  }

  function tap() {
    if (!sfxOn) return;
    tone(660, 0, 0.05, "sine", 0.08);
  }

  return {
    speak,
    correct, wrong, pop, fanfare, tap,
    setVoice: (on) => { voiceOn = on; if (!on && window.speechSynthesis) window.speechSynthesis.cancel(); },
    setSfx: (on) => { sfxOn = on; },
    isVoiceOn: () => voiceOn,
    isSfxOn: () => sfxOn
  };
})();
