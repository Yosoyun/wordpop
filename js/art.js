/* ============================================================
   WordPop — Word Illustrations (custom vector art)
   ------------------------------------------------------------
   100% offline, tiny, razor-sharp at any size.
   Each illustration is a flat, friendly SVG in the app's palette.

   The app shows an illustration when one exists for a word,
   and falls back to the word's emoji otherwise. To add art for
   a word, add an entry keyed by the lowercased word.

   This is the "house style" sample set for Letter A — once the
   look is approved, the rest of the alphabet gets the same style.
   ============================================================ */

const Art = (function () {

  // soft rounded background tile every illustration sits on
  function tile(tint) {
    return `<rect x="6" y="6" width="108" height="108" rx="30" fill="${tint}"/>`;
  }

  const ART = {
    apple: `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
      ${tile('#FFE6DD')}
      <path d="M60 38 q-4 -10 -16 -11 q6 8 14 11Z" fill="#6BCB77"/>
      <rect x="58" y="28" width="5" height="12" rx="2" fill="#7A5230"/>
      <path d="M60 40 C40 40 32 56 34 74 C36 92 50 102 60 102 C70 102 84 92 86 74 C88 56 80 40 60 40Z" fill="#FF5C5C"/>
      <path d="M60 40 C50 40 44 50 44 50 C50 44 56 44 60 46Z" fill="#fff" opacity=".35"/>
      <ellipse cx="48" cy="60" rx="6" ry="9" fill="#fff" opacity=".4"/>
    </svg>`,

    angry: `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
      ${tile('#FFD9D9')}
      <circle cx="60" cy="62" r="34" fill="#FF7A5C"/>
      <path d="M34 50 L52 58" stroke="#3B2E5A" stroke-width="5" stroke-linecap="round"/>
      <path d="M86 50 L68 58" stroke="#3B2E5A" stroke-width="5" stroke-linecap="round"/>
      <circle cx="46" cy="64" r="5" fill="#3B2E5A"/>
      <circle cx="74" cy="64" r="5" fill="#3B2E5A"/>
      <path d="M46 82 Q60 74 74 82" fill="none" stroke="#3B2E5A" stroke-width="5" stroke-linecap="round"/>
      <path d="M88 36 q6 -8 10 -2 q-2 8 -10 6Z" fill="#FF5C5C"/>
    </svg>`,

    awake: `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
      ${tile('#FFF3D6')}
      <g stroke="#FFC93C" stroke-width="5" stroke-linecap="round">
        <line x1="60" y1="20" x2="60" y2="32"/>
        <line x1="30" y1="34" x2="38" y2="42"/>
        <line x1="90" y1="34" x2="82" y2="42"/>
        <line x1="22" y1="64" x2="34" y2="64"/>
        <line x1="98" y1="64" x2="86" y2="64"/>
      </g>
      <circle cx="60" cy="62" r="22" fill="#FFC93C"/>
      <circle cx="53" cy="60" r="3" fill="#7A5A00"/>
      <circle cx="67" cy="60" r="3" fill="#7A5A00"/>
      <path d="M52 70 Q60 78 68 70" fill="none" stroke="#7A5A00" stroke-width="3.5" stroke-linecap="round"/>
      <path d="M20 96 H100" stroke="#6BCB77" stroke-width="6" stroke-linecap="round"/>
    </svg>`,

    adventure: `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
      ${tile('#DDF3F0')}
      <circle cx="86" cy="36" r="12" fill="#FFC93C"/>
      <path d="M14 96 L46 46 L66 78 L80 58 L106 96Z" fill="#2EC4B6"/>
      <path d="M46 46 L58 64 L52 70 L40 56Z" fill="#fff" opacity=".5"/>
      <path d="M80 58 L88 70 L84 74 L76 64Z" fill="#fff" opacity=".5"/>
      <rect x="58" y="30" width="4" height="22" fill="#3B2E5A"/>
      <path d="M62 30 L80 36 L62 42Z" fill="#FF5C5C"/>
      <path d="M14 98 H106" stroke="#1E9E92" stroke-width="5" stroke-linecap="round"/>
    </svg>`,

    animal: `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
      ${tile('#EDE4FB')}
      <path d="M34 40 L40 64 L26 60Z" fill="#8A4FFF"/>
      <path d="M86 40 L80 64 L94 60Z" fill="#8A4FFF"/>
      <circle cx="60" cy="68" r="30" fill="#9B5DE5"/>
      <circle cx="49" cy="64" r="5" fill="#fff"/><circle cx="49" cy="65" r="2.5" fill="#3B2E5A"/>
      <circle cx="71" cy="64" r="5" fill="#fff"/><circle cx="71" cy="65" r="2.5" fill="#3B2E5A"/>
      <path d="M56 76 L64 76 L60 81Z" fill="#FF6B9D"/>
      <path d="M60 81 Q60 88 52 88 M60 81 Q60 88 68 88" fill="none" stroke="#3B2E5A" stroke-width="2.5"/>
      <g stroke="#fff" stroke-width="2" opacity=".7">
        <line x1="30" y1="72" x2="44" y2="74"/><line x1="30" y1="80" x2="44" y2="80"/>
        <line x1="90" y1="72" x2="76" y2="74"/><line x1="90" y1="80" x2="76" y2="80"/>
      </g>
    </svg>`,

    amazing: `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
      ${tile('#FFF3D6')}
      <path d="M60 30 l8 18 20 2 -15 14 5 20 -18 -11 -18 11 5 -20 -15 -14 20 -2Z" fill="#FFC93C" stroke="#FF9F45" stroke-width="2"/>
      <path d="M30 40 l3 7 7 1 -5 5 1 7 -6 -4 -6 4 1 -7 -5 -5 7 -1Z" fill="#FF6B9D"/>
      <path d="M92 70 l2.5 6 6 .8 -4.5 4 1 6 -5 -3 -5 3 1 -6 -4.5 -4 6 -.8Z" fill="#2EC4B6"/>
      <circle cx="40" cy="84" r="4" fill="#4D96FF"/>
      <circle cx="86" cy="40" r="3" fill="#8A4FFF"/>
    </svg>`
  };

  function has(word) { return !!ART[String(word).toLowerCase()]; }
  function svg(word) { return ART[String(word).toLowerCase()] || ""; }

  return { has, svg };
})();
