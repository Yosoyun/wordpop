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
    </svg>`,

    ball: `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
      ${tile('#DDF3F0')}
      <circle cx="60" cy="62" r="33" fill="#fff" stroke="#2EC4B6" stroke-width="3"/>
      <path d="M60 45 l12 9 -5 14 -14 0 -5 -14Z" fill="#3B2E5A"/>
      <path d="M44 78 l-7 -4 3 -8" fill="none" stroke="#3B2E5A" stroke-width="3" stroke-linecap="round"/>
      <path d="M76 78 l7 -4 -3 -8" fill="none" stroke="#3B2E5A" stroke-width="3" stroke-linecap="round"/>
      <path d="M72 38 l8 5 -2 7" fill="none" stroke="#3B2E5A" stroke-width="3" stroke-linecap="round"/>
      <path d="M48 38 l-8 5 2 7" fill="none" stroke="#3B2E5A" stroke-width="3" stroke-linecap="round"/>
    </svg>`,

    cat: `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
      ${tile('#FFE6DD')}
      <path d="M36 42 L46 66 L28 60Z" fill="#FF9F45"/>
      <path d="M84 42 L74 66 L92 60Z" fill="#FF9F45"/>
      <circle cx="60" cy="66" r="30" fill="#FF9F45"/>
      <ellipse cx="50" cy="64" rx="4.5" ry="6.5" fill="#3B2E5A"/>
      <ellipse cx="70" cy="64" rx="4.5" ry="6.5" fill="#3B2E5A"/>
      <path d="M56 76 L64 76 L60 81Z" fill="#FF6B9D"/>
      <path d="M60 81 Q60 87 53 87 M60 81 Q60 87 67 87" fill="none" stroke="#3B2E5A" stroke-width="2.5"/>
      <g stroke="#3B2E5A" stroke-width="2"><line x1="30" y1="74" x2="46" y2="76"/><line x1="30" y1="80" x2="46" y2="80"/><line x1="90" y1="74" x2="74" y2="76"/><line x1="90" y1="80" x2="74" y2="80"/></g>
    </svg>`,

    dog: `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
      ${tile('#DDEBFF')}
      <ellipse cx="33" cy="54" rx="11" ry="19" fill="#A6754C"/>
      <ellipse cx="87" cy="54" rx="11" ry="19" fill="#A6754C"/>
      <circle cx="60" cy="64" r="30" fill="#C68A5E"/>
      <circle cx="50" cy="60" r="4" fill="#3B2E5A"/>
      <circle cx="70" cy="60" r="4" fill="#3B2E5A"/>
      <ellipse cx="60" cy="74" rx="7" ry="5" fill="#3B2E5A"/>
      <path d="M60 79 Q60 87 51 84 M60 79 Q60 87 69 84" fill="none" stroke="#3B2E5A" stroke-width="2.5"/>
      <path d="M57 88 q3 4 6 0" fill="#FF6B9D"/>
    </svg>`,

    egg: `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
      ${tile('#FFF3D6')}
      <path d="M60 32 C43 32 37 60 37 75 C37 91 47 100 60 100 C73 100 83 91 83 75 C83 60 77 32 60 32Z" fill="#fff" stroke="#F0D9A0" stroke-width="2"/>
      <ellipse cx="52" cy="62" rx="7" ry="12" fill="#FFF6E9"/>
    </svg>`,

    fish: `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
      ${tile('#DDF3F0')}
      <path d="M28 62 Q50 40 78 50 Q92 56 92 62 Q92 68 78 74 Q50 84 28 62Z" fill="#FF9F45"/>
      <path d="M92 62 L107 51 L105 73Z" fill="#FF7A5C"/>
      <path d="M64 50 Q70 62 64 74" fill="none" stroke="#fff" stroke-width="2.5" opacity=".55"/>
      <circle cx="44" cy="58" r="4.5" fill="#fff"/><circle cx="44" cy="58" r="2.2" fill="#3B2E5A"/>
      <circle cx="84" cy="46" r="2.5" fill="#fff" opacity=".7"/>
    </svg>`,

    frog: `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
      ${tile('#E3F7E9')}
      <ellipse cx="60" cy="72" rx="32" ry="26" fill="#6BCB77"/>
      <circle cx="44" cy="48" r="12" fill="#6BCB77"/>
      <circle cx="76" cy="48" r="12" fill="#6BCB77"/>
      <circle cx="44" cy="47" r="6" fill="#fff"/><circle cx="44" cy="48" r="3" fill="#3B2E5A"/>
      <circle cx="76" cy="47" r="6" fill="#fff"/><circle cx="76" cy="48" r="3" fill="#3B2E5A"/>
      <path d="M44 78 Q60 90 76 78" fill="none" stroke="#3B7a47" stroke-width="4" stroke-linecap="round"/>
      <circle cx="49" cy="76" r="3" fill="#FF6B9D" opacity=".5"/><circle cx="71" cy="76" r="3" fill="#FF6B9D" opacity=".5"/>
    </svg>`,

    bird: `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
      ${tile('#DDF3F0')}
      <ellipse cx="56" cy="66" rx="30" ry="25" fill="#4D96FF"/>
      <circle cx="74" cy="50" r="16" fill="#4D96FF"/>
      <circle cx="79" cy="47" r="4.5" fill="#fff"/><circle cx="80" cy="47" r="2.2" fill="#3B2E5A"/>
      <path d="M90 49 L104 53 L90 57Z" fill="#FFC93C"/>
      <path d="M38 60 Q54 54 64 68 Q50 76 38 60Z" fill="#2E7BE0"/>
      <path d="M68 88 l-4 8 M78 88 l4 8" stroke="#FFC93C" stroke-width="3" stroke-linecap="round"/>
    </svg>`,

    box: `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
      ${tile('#FFF3D6')}
      <path d="M30 56 L60 44 L90 56 L60 68Z" fill="#E0A85C"/>
      <path d="M30 56 L60 68 L60 96 L30 84Z" fill="#C98C42"/>
      <path d="M90 56 L60 68 L60 96 L90 84Z" fill="#B87C36"/>
      <path d="M44 50 L74 62" stroke="#fff" stroke-width="2" opacity=".4"/>
    </svg>`,

    cake: `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
      ${tile('#FFE6F0')}
      <rect x="34" y="62" width="52" height="30" rx="6" fill="#FF8FC7"/>
      <path d="M34 72 q6.5 8 13 0 q6.5 8 13 0 q6.5 8 13 0 q6.5 8 13 0 V64 H34Z" fill="#fff"/>
      <rect x="58" y="40" width="4" height="20" fill="#FFC93C"/>
      <ellipse cx="60" cy="37" rx="4" ry="7" fill="#FF5C5C"/>
      <circle cx="46" cy="82" r="3" fill="#FFC93C"/><circle cx="74" cy="82" r="3" fill="#7AC7FF"/>
    </svg>`,

    cup: `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
      ${tile('#FFE6DD')}
      <path d="M40 50 H78 V76 a13 13 0 0 1 -13 13 H53 a13 13 0 0 1 -13 -13 Z" fill="#FF7A5C"/>
      <path d="M78 56 a11 11 0 0 1 0 20" fill="none" stroke="#FF7A5C" stroke-width="6"/>
      <rect x="40" y="50" width="38" height="7" rx="3" fill="#fff" opacity=".5"/>
      <path d="M52 38 q4 -8 0 -14 M62 38 q4 -8 0 -14" stroke="#C9BFD8" stroke-width="3" fill="none" stroke-linecap="round"/>
    </svg>`,

    door: `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
      ${tile('#EDE4FB')}
      <rect x="40" y="28" width="40" height="70" rx="5" fill="#8A4FFF"/>
      <rect x="46" y="35" width="28" height="26" rx="3" fill="#6E3BD0"/>
      <rect x="46" y="66" width="28" height="26" rx="3" fill="#6E3BD0"/>
      <circle cx="70" cy="64" r="3.5" fill="#FFC93C"/>
    </svg>`,

    dream: `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
      ${tile('#DDEBFF')}
      <ellipse cx="56" cy="68" rx="30" ry="17" fill="#fff"/>
      <circle cx="44" cy="62" r="14" fill="#fff"/><circle cx="64" cy="56" r="17" fill="#fff"/>
      <text x="72" y="46" font-size="15" fill="#7AC7FF" font-family="sans-serif" font-weight="bold">z</text>
      <text x="83" y="36" font-size="20" fill="#4D96FF" font-family="sans-serif" font-weight="bold">Z</text>
    </svg>`,

    give: `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
      ${tile('#E3F7E9')}
      <rect x="36" y="56" width="48" height="36" rx="4" fill="#FF6B9D"/>
      <rect x="56" y="56" width="8" height="36" fill="#fff"/>
      <rect x="36" y="68" width="48" height="8" fill="#fff"/>
      <path d="M60 56 q-14 -16 -20 -4 q-2 10 20 4Z" fill="#FFC93C"/>
      <path d="M60 56 q14 -16 20 -4 q2 10 -20 4Z" fill="#FFC93C"/>
      <circle cx="60" cy="55" r="4" fill="#FF9F45"/>
    </svg>`,

    hand: `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
      ${tile('#FFF3D6')}
      <rect x="48" y="54" width="30" height="36" rx="13" fill="#F4B07A"/>
      <rect x="50" y="38" width="6" height="28" rx="3" fill="#F4B07A"/>
      <rect x="58" y="32" width="6" height="34" rx="3" fill="#F4B07A"/>
      <rect x="66" y="34" width="6" height="32" rx="3" fill="#F4B07A"/>
      <rect x="74" y="40" width="6" height="26" rx="3" fill="#F4B07A"/>
      <rect x="38" y="56" width="9" height="18" rx="4.5" fill="#F4B07A" transform="rotate(-32 42 62)"/>
    </svg>`,

    hug: `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
      ${tile('#FFE6F0')}
      <circle cx="46" cy="52" r="15" fill="#FF8FC7"/>
      <circle cx="74" cy="52" r="15" fill="#7AC7FF"/>
      <path d="M30 96 q0 -26 16 -26 q16 0 16 26Z" fill="#FF8FC7"/>
      <path d="M58 96 q0 -26 16 -26 q16 0 16 26Z" fill="#7AC7FF"/>
      <path d="M40 74 q20 10 40 0" fill="none" stroke="#FF6B9D" stroke-width="4" stroke-linecap="round"/>
    </svg>`
  };

  function has(word) { return !!ART[String(word).toLowerCase()]; }
  function svg(word) { return ART[String(word).toLowerCase()] || ""; }

  return { has, svg };
})();
