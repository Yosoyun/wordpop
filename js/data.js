/* ============================================================
   WordPop — Config + the alphabet table.
   Word arrays (LETTER_A … LETTER_Z) live in js/words-all.js,
   loaded BEFORE this file. Edit content there; edit settings here.
   ============================================================ */

const CONFIG = {
  appName: "WordPop",                       // ← change the app name here
  tagline: "Pop a bubble, learn a beautiful word!",
  mascotName: "Pip",                        // ← the friendly mascot's name
  version: "1.0",
  freeLetters: ["A", "B", "C"],             // letters playable for free (the rest are Premium)
  parentPinDefault: "0000",                 // default Parent Zone PIN (changeable in-app)
  wordsPerCluster: 5                        // how many words per mini-lesson
};

const LETTERS = [
  { letter: "A", theme: "Awesome Adjectives & Friends", color: "#FF7A5C", status: "ready", words: LETTER_A },
  { letter: "B", theme: "Brilliant Beginnings", color: "#2EC4B6", status: "ready", words: LETTER_B },
  { letter: "C", theme: "Curious Words", color: "#FFC93C", status: "ready", words: LETTER_C },
  { letter: "D", theme: "Delightful Words", color: "#8A4FFF", status: "premium", words: LETTER_D },
  { letter: "E", theme: "Exciting Words", color: "#4D96FF", status: "premium", words: LETTER_E },
  { letter: "F", theme: "Fantastic Words", color: "#FF6B9D", status: "premium", words: LETTER_F },
  { letter: "G", theme: "Glorious Words", color: "#6BCB77", status: "premium", words: LETTER_G },
  { letter: "H", theme: "Happy Words", color: "#FF9F45", status: "premium", words: LETTER_H },
  { letter: "I", theme: "Incredible Words", color: "#00C2CB", status: "premium", words: LETTER_I },
  { letter: "J", theme: "Joyful Words", color: "#F95738", status: "premium", words: LETTER_J },
  { letter: "K", theme: "Kind Words", color: "#9B5DE5", status: "premium", words: LETTER_K },
  { letter: "L", theme: "Lovely Words", color: "#00BBF9", status: "premium", words: LETTER_L },
  { letter: "M", theme: "Magical Words", color: "#F15BB5", status: "premium", words: LETTER_M },
  { letter: "N", theme: "Nice & Noble Words", color: "#FEE440", status: "premium", words: LETTER_N },
  { letter: "O", theme: "Outstanding Words", color: "#FF7A5C", status: "premium", words: LETTER_O },
  { letter: "P", theme: "Playful Words", color: "#2EC4B6", status: "premium", words: LETTER_P },
  { letter: "Q", theme: "Quirky Words", color: "#FFC93C", status: "premium", words: LETTER_Q },
  { letter: "R", theme: "Radiant Words", color: "#8A4FFF", status: "premium", words: LETTER_R },
  { letter: "S", theme: "Spectacular Words", color: "#4D96FF", status: "premium", words: LETTER_S },
  { letter: "T", theme: "Terrific Words", color: "#FF6B9D", status: "premium", words: LETTER_T },
  { letter: "U", theme: "Unique Words", color: "#6BCB77", status: "premium", words: LETTER_U },
  { letter: "V", theme: "Vibrant Words", color: "#FF9F45", status: "premium", words: LETTER_V },
  { letter: "W", theme: "Wonderful Words", color: "#00C2CB", status: "premium", words: LETTER_W },
  { letter: "X", theme: "eXtra Special Words", color: "#F95738", status: "premium", words: LETTER_X },
  { letter: "Y", theme: "Yummy & Young Words", color: "#9B5DE5", status: "premium", words: LETTER_Y },
  { letter: "Z", theme: "Zippy Words", color: "#00BBF9", status: "premium", words: LETTER_Z },
];
