# 🫧 WordPop — Learn Beautiful Words

A joyful, **Duolingo-style English vocabulary app for children in grades 1–5.**
Built for Ivanka — and for every child who loves discovering beautiful words.

Each letter of the alphabet teaches **25 carefully chosen words**, and every word comes with:

- 🖼️ a **picture** (emoji visual)
- 🔊 **audio** — the word and its example sentence read aloud
- 📖 a **child-friendly meaning**
- ✍️ an **example sentence**
- 🟢 **synonyms** (words that mean the same)
- 🔴 **antonyms** (words that mean the opposite)

…then the child plays through bubbly games, fixes any mistakes, earns stars, gems and streaks, and a grown-up can track everything in the **Parent Zone**.

---

## ✨ What makes it special

| Feature | What it does |
|---|---|
| **100% offline** | No internet, no servers, no accounts. Audio uses the device's built-in voice; everything saves on the device. |
| **Free to host** | Plain HTML/CSS/JavaScript — publish on GitHub Pages with one click. |
| **Teach → Practice → Fix** | The child meets words one at a time (flashcards), then plays games. **Wrong answers come back until she gets them right.** |
| **Error analysis** | Every mistake is logged so a parent can see exactly which words need work. |
| **Rewards** | Stars, XP, levels, gems, daily streaks and confetti keep her motivated. |
| **Parent Zone** | PIN-protected dashboard: accuracy, time spent, words mastered, streak calendar, error log. |
| **Free + Premium** | Letters A & B are free; C–Z are a Premium unlock (toggle in Parent Zone for now). |

---

## ▶️ How to open it

### Option A — just double-click (fully offline)
Open `index.html` in any modern browser (Chrome, Safari, Edge). That's it.

### Option B — local server (recommended for audio reliability)
```bash
cd wordpop
python3 -m http.server 4321
# then open http://localhost:4321
```

---

## 🌍 How to publish it on GitHub Pages (free, live for the world)

1. Create a new repository on GitHub (e.g. `wordpop`).
2. Upload the contents of this `wordpop/` folder (or push with git).
3. In the repo: **Settings → Pages → Build and deployment → Source: "Deploy from a branch" → Branch: `main` / `/root` → Save.**
4. Wait ~1 minute. Your app is live at `https://<your-username>.github.io/wordpop/`.
5. Share that link — it works on phones, tablets and computers.

> Git commands to push (after creating the empty repo on GitHub):
> ```bash
> git remote add origin https://github.com/<your-username>/wordpop.git
> git branch -M main
> git push -u origin main
> ```

---

## 🗂️ Project structure

```
wordpop/
├── index.html          ← the app shell
├── css/
│   └── styles.css      ← the whole look & feel (the "design system")
├── js/
│   ├── data.js         ← ★ THE WORDS live here (edit this to add content)
│   ├── audio.js        ← speech + sound effects (offline)
│   ├── store.js        ← progress tracking (saves to the device)
│   ├── quiz.js         ← auto-builds the games from the words
│   └── app.js          ← screens, lessons, Parent Zone
├── README.md
└── CONTENT_GUIDE.md    ← how to add new words & letters
```

**To add words or build a new letter, you only edit `js/data.js`.** See `CONTENT_GUIDE.md`.

---

## 🧭 Roadmap (what we can build next)

- [x] Letter **A** — 25 words, full game flow, Parent Zone *(done!)*
- [ ] Letters **B–Z** — 25 words each (650 words total)
- [ ] **Match-the-following** drag game & "tap the picture" game
- [ ] **Printable progress certificates** (Premium)
- [ ] **AI-generated illustrations** to replace/augment emoji
- [ ] **Multiple child profiles** on one device
- [ ] **Parent awareness guide** (how to use the app together)
- [ ] **Real payments** for Premium + landing/marketing page

---

## 🔒 Privacy

WordPop stores everything **on the child's own device** (browser local storage).
Nothing is uploaded, tracked or shared. There are no ads and no third-party services.

Made with 💜 for young readers.
