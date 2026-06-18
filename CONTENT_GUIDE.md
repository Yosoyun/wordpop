# ✍️ Content Guide — How to add words

All the words live in **one file**: [`js/data.js`](js/data.js).
You do **not** need to touch any other file to add content.

---

## 1. The shape of a word

Every word is a small block like this:

```js
{
  word:     "Amazing",                 // the word
  pos:      "describing word",         // naming word / doing word / describing word
  emoji:    "🤩",                       // the picture
  say:      "uh-MAY-zing",             // how to say it (kid-friendly)
  tier:     2,                         // 1 = Grade 1 (easy) ... 5 = Grade 5 (hard)
  meaning:  "So surprising and wonderful that it makes you say WOW!",
  example:  "The fireworks in the night sky were amazing.",
  synonyms: ["wonderful", "awesome", "incredible"],   // words that mean the SAME
  antonyms: ["ordinary", "boring", "dull"]            // OPPOSITES — use [] if none
}
```

### Tips for great kid content
- **Meaning:** short, warm, no hard words. Imagine explaining to a 6-year-old.
- **Example:** something from a child's world (toys, pets, family, school, food).
- **Emoji:** pick the clearest single emoji. Test that it shows the idea.
- **Antonyms:** naming words like *Apple* often have **no opposite** — that's fine, use `antonyms: []`. The app turns this into a little lesson ("This word has no opposite 🙂").
- **Tier:** spread a letter across tiers 1–5 so it works for every grade. Put easier words first.

---

## 2. Building a brand-new letter (e.g. Letter C)

In `js/data.js`, find the `LETTERS` list and change the letter's line:

```js
{ letter: "C", theme: "Curious Words", color: "#FFC93C", status: "premium", words: [] },
```

1. Create the 25 words as an array (like `LETTER_A` at the top of the file):

```js
const LETTER_C = [
  { word: "Calm", pos: "describing word", emoji: "😌", say: "KAHM", tier: 1,
    meaning: "Quiet and peaceful, not worried or excited.",
    example: "The lake was calm and still in the morning.",
    synonyms: ["peaceful", "relaxed", "quiet"],
    antonyms: ["angry", "wild", "noisy"] },
  // ... 24 more
];
```

2. Plug it in and mark it ready:

```js
{ letter: "C", theme: "Curious Words", color: "#FFC93C", status: "ready", words: LETTER_C },
```

That's it — the path, the lessons, the games and the Parent Zone all update automatically.

### `status` values
| status | meaning |
|---|---|
| `"ready"` | Playable (needs words in the array). |
| `"coming-soon"` | Shows a friendly "soon" badge, locked. |
| `"premium"` | Locked behind the Premium unlock. |

### Free vs Premium
At the top of `data.js`, `CONFIG.freeLetters` decides which letters are free:
```js
freeLetters: ["A", "B"],   // everything else with status "premium" is locked
```

---

## 3. Renaming the app / mascot

Also at the top of `data.js`:
```js
const CONFIG = {
  appName: "WordPop",        // change the title
  tagline: "Pop a bubble, learn a beautiful word!",
  mascotName: "Pip",         // the friendly character's name
  ...
};
```

---

## 4. Want me (Claude) to generate the words?

I can produce all 25 words for any letter — meanings, examples, synonyms, antonyms,
emoji and tiers — in this exact format, ready to paste in. Just say **"build Letter C"**
(or a batch like "build C through F") and I'll generate and drop them straight into `data.js`.
