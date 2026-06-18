/* ============================================================
   WordPop — Quiz Engine
   ------------------------------------------------------------
   Builds questions automatically from the word data. Supports:
     • meaning      — "What does ___ mean?"
     • word         — picture/meaning → choose the word
     • synonym      — choose the word that means the SAME
     • antonym      — choose the OPPOSITE
     • listen       — hear the word → choose the right one
     • fill         — finish the sentence with the right word
   Wrong answers are re-queued so the child FIXES them before moving on.
   ============================================================ */

const Quiz = (function () {

  // Simple deterministic-ish shuffle (Fisher–Yates with Math.random).
  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function pick(arr, n, exclude) {
    const pool = arr.filter(x => x !== exclude);
    return shuffle(pool).slice(0, n);
  }

  /* Build a set of varied questions for a group of words.
     `allWords` is the full letter list (used for plausible wrong options). */
  function build(groupWords, allWords) {
    const questions = [];
    const otherWords = allWords;

    groupWords.forEach((w) => {
      const types = pickTypes(w);
      types.forEach(t => {
        const q = makeQuestion(t, w, otherWords);
        if (q) questions.push(q);
      });
    });
    return shuffle(questions);
  }

  /* Choose 1–2 question styles per word depending on what data it has. */
  function pickTypes(w) {
    const options = ["meaning", "word", "listen", "fill"];
    if (w.synonyms && w.synonyms.length) options.push("synonym");
    if (w.antonyms && w.antonyms.length) options.push("antonym");
    return shuffle(options).slice(0, 2);
  }

  function makeQuestion(type, w, others) {
    switch (type) {
      case "meaning": {
        const wrong = pick(others, 3, w).map(o => o.meaning);
        return base(type, w, "What does this word mean?", w.word, shuffle([w.meaning, ...wrong]), w.meaning,
          "Remember: " + w.word + " means “" + w.meaning + "”");
      }
      case "word": {
        const wrong = pick(others, 3, w).map(o => o.word);
        return base(type, w, "Which word matches this?", w.emoji + "  " + w.meaning, shuffle([w.word, ...wrong]), w.word,
          "The word is “" + w.word + "” " + w.emoji);
      }
      case "synonym": {
        const correct = w.synonyms[0];
        const wrong = pick(others, 3, w).map(o => o.word.toLowerCase());
        return base(type, w, "Which word means the SAME as “" + w.word + "”?", w.emoji + "  " + w.word,
          shuffle([correct, ...wrong]), correct,
          "“" + capital(correct) + "” means the same as “" + w.word + "”.");
      }
      case "antonym": {
        const correct = w.antonyms[0];
        const wrong = (w.synonyms || []).concat(pick(others, 3, w).map(o => o.word.toLowerCase()));
        return base(type, w, "Which word is the OPPOSITE of “" + w.word + "”?", w.emoji + "  " + w.word,
          shuffle([correct, ...shuffle(wrong).slice(0, 3)]), correct,
          "The opposite of “" + w.word + "” is “" + capital(correct) + "”.");
      }
      case "listen": {
        const wrong = pick(others, 3, w).map(o => o.word);
        return base(type, w, "🔊 Listen, then tap the word you heard", "__LISTEN__", shuffle([w.word, ...wrong]), w.word,
          "You heard “" + w.word + "”.");
      }
      case "fill": {
        const blank = w.example.replace(new RegExp(w.word, "i"), "_____");
        if (blank === w.example) return makeQuestion("meaning", w, others);
        const wrong = pick(others, 3, w).map(o => o.word);
        return base(type, w, "Finish the sentence:", blank, shuffle([w.word, ...wrong]), w.word,
          "The full sentence is: “" + w.example + "”");
      }
    }
  }

  function base(type, w, prompt, stem, options, answer, why) {
    return { type, word: w.word, emoji: w.emoji, prompt, stem, options, answer, why, speakOnLoad: type === "listen" };
  }

  function capital(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

  return { build, shuffle };
})();
