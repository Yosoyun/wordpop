/* ============================================================
   WordPop — Theme Engine (two "worlds")
   ------------------------------------------------------------
   • sparkle : glam / Barbie-inspired — pinks, hearts, sparkle
   • hero    : Avengers-inspired — bold red/blue/gold, comic energy
   Colours live in CSS ([data-theme="…"]). This file supplies the
   themed SVG decorations, mascot accessories & confetti colours.
   (All original art — no real Barbie/Marvel branding.)
   ============================================================ */

const Themes = (function () {

  // small decorative icons (24x24)
  const ICON = {
    heart: `<path d="M12 21 C2 13 5 4 12 8 C19 4 22 13 12 21Z"/>`,
    spark: `<path d="M12 1 l2.2 7.8 7.8 2.2 -7.8 2.2 -2.2 7.8 -2.2 -7.8 -7.8 -2.2 7.8 -2.2Z"/>`,
    star5: `<path d="M12 2 l2.9 6.2 6.8 .7 -5.1 4.6 1.4 6.7 -6 -3.4 -6 3.4 1.4 -6.7 -5.1 -4.6 6.8 -.7Z"/>`,
    bolt: `<path d="M13 1 L4 14 h6 l-2 9 9 -14 h-6Z"/>`,
    shield: `<path d="M12 1 l9 3 v7 c0 6 -4 10 -9 12 c-5 -2 -9 -6 -9 -12 V4Z"/>`,
    ring: `<circle cx="12" cy="12" r="9" fill="none" stroke-width="3"/>`
  };

  const THEMES = {
    sparkle: {
      key: "sparkle",
      name: "Sparkle World",
      blurb: "Glitter, hearts & rainbows ✨",
      emoji: "✨",
      mascot: "Stella",
      floaters: ["heart", "spark", "star5", "heart", "spark"],
      floatColors: ["#FF2E96", "#FFC93C", "#B45BE6", "#FF8FC7", "#7AC7FF"],
      confetti: ["#FF2E96", "#FF8FC7", "#FFC93C", "#B45BE6", "#7AC7FF", "#fff"]
    },
    hero: {
      key: "hero",
      name: "Super-Hero World",
      blurb: "Power, courage & action ⚡",
      emoji: "🛡️",
      mascot: "Zap",
      floaters: ["star5", "bolt", "shield", "star5", "bolt"],
      floatColors: ["#E63946", "#1F6FEB", "#FFC93C", "#2D9CDB", "#5B5BF0"],
      confetti: ["#E63946", "#1F6FEB", "#FFC93C", "#2D9CDB", "#FFD23F", "#fff"]
    }
  };

  /* ---- themed mascots (each world has its own character) ---- */
  function eyesFor(cx, cy, mood, dark) {
    if (mood === "oops") return `<ellipse cx="${-cx}" cy="${cy + 2}" rx="5" ry="7" fill="${dark}"/><ellipse cx="${cx}" cy="${cy + 2}" rx="5" ry="7" fill="${dark}"/>`;
    return `<circle cx="${-cx}" cy="${cy}" r="6" fill="${dark}"/><circle cx="${cx}" cy="${cy}" r="6" fill="${dark}"/>` +
      `<circle cx="${-cx + 2}" cy="${cy - 2}" r="2" fill="#fff"/><circle cx="${cx + 2}" cy="${cy - 2}" r="2" fill="#fff"/>`;
  }
  function mouthFor(mood, cy, dark) {
    switch (mood) {
      case "celebrate": return `<path d="M -14 ${cy} Q 0 ${cy + 22} 14 ${cy} Z" fill="${dark}"/><path d="M -8 ${cy + 8} Q 0 ${cy + 13} 8 ${cy + 8}" fill="#FF6B9D"/>`;
      case "think": return `<path d="M -9 ${cy + 6} Q 0 ${cy} 11 ${cy + 6}" fill="none" stroke="${dark}" stroke-width="4" stroke-linecap="round"/>`;
      case "oops": return `<ellipse cx="0" cy="${cy + 6}" rx="6" ry="8" fill="${dark}"/>`;
      default: return `<path d="M -14 ${cy} Q 0 ${cy + 16} 14 ${cy}" fill="none" stroke="${dark}" stroke-width="4" stroke-linecap="round"/>`;
    }
  }

  function sparkleMascot(mood, size) {
    const ink = "#5A2A55";
    return `<svg class="mascot mascot-${mood}" width="${size}" height="${size}" viewBox="-60 -70 120 135" aria-hidden="true">
      <ellipse cx="0" cy="56" rx="32" ry="8" fill="rgba(90,42,85,.12)"/>
      <path d="M 0 -52 L 13 -17 L 49 -16 L 20 6 L 30 42 L 0 21 L -30 42 L -20 6 L -49 -16 L -13 -17 Z" fill="url(#stellaG)" stroke="#FF2E96" stroke-width="2"/>
      <circle cx="-16" cy="6" r="8" fill="#FF8FC7" opacity=".55"/>
      <circle cx="16" cy="6" r="8" fill="#FF8FC7" opacity=".55"/>
      ${eyesFor(13, -4, mood, ink)}
      ${mouthFor(mood, 6, ink)}
      <path d="M 36 -36 l2 5.6 5.6 2 -5.6 2 -2 5.6 -2 -5.6 -5.6 -2 5.6 -2Z" fill="#fff"/>
      <defs><radialGradient id="stellaG" cx="40%" cy="28%" r="80%">
        <stop offset="0%" stop-color="#FFD0EA"/><stop offset="55%" stop-color="#FF5CB0"/><stop offset="100%" stop-color="#E0349A"/>
      </radialGradient></defs>
    </svg>`;
  }

  function heroMascot(mood, size) {
    const ink = "#0d2a5e";
    return `<svg class="mascot mascot-${mood}" width="${size}" height="${size}" viewBox="-60 -70 120 135" aria-hidden="true">
      <ellipse cx="0" cy="54" rx="32" ry="8" fill="rgba(13,42,94,.14)"/>
      <path d="M -20 16 L -52 50 L -8 44 Z" fill="#E63946"/>
      <path d="M 20 16 L 52 50 L 8 44 Z" fill="#E63946"/>
      <circle cx="0" cy="0" r="44" fill="url(#zapG)"/>
      <path d="M -44 -14 Q 0 -30 44 -14 Q 40 5 27 5 Q 12 5 0 -3 Q -12 5 -27 5 Q -40 5 -44 -14 Z" fill="#163e8a"/>
      <circle cx="-16" cy="-8" r="7" fill="#fff"/><circle cx="-15" cy="-7" r="3.2" fill="${ink}"/>
      <circle cx="16" cy="-8" r="7" fill="#fff"/><circle cx="17" cy="-7" r="3.2" fill="${ink}"/>
      ${mouthFor(mood, 16, ink)}
      <path d="M 0 -40 l2.6 6.6 7.2 .5 -5.5 4.7 1.8 7 -6.1 -3.9 -6.1 3.9 1.8 -7 -5.5 -4.7 7.2 -.5Z" fill="#FFC93C"/>
      <defs><radialGradient id="zapG" cx="38%" cy="26%" r="80%">
        <stop offset="0%" stop-color="#6BB0FF"/><stop offset="100%" stop-color="#1F6FEB"/>
      </radialGradient></defs>
    </svg>`;
  }

  function mascotSVG(key, mood, size) {
    mood = mood || "happy"; size = size || 96;
    return key === "hero" ? heroMascot(mood, size) : sparkleMascot(mood, size);
  }

  function current() { return (document.documentElement.getAttribute("data-theme")) || "sparkle"; }
  function meta(key) { return THEMES[key] || THEMES.sparkle; }

  function apply(key) {
    if (!THEMES[key]) key = "sparkle";
    document.documentElement.setAttribute("data-theme", key);
  }

  /* floating background decorations (rising, drifting) */
  function floatField(key, n) {
    const t = meta(key); n = n || 16;
    let out = "";
    for (let i = 0; i < n; i++) {
      const icon = t.floaters[i % t.floaters.length];
      const col = t.floatColors[i % t.floatColors.length];
      const size = 16 + Math.random() * 34;
      const left = Math.random() * 100;
      const delay = Math.random() * 9;
      const dur = 9 + Math.random() * 9;
      const spin = (Math.random() * 60 - 30);
      out += `<span class="floater" style="--s:${size}px;left:${left}%;animation-delay:${delay}s;animation-duration:${dur}s;transform:rotate(${spin}deg)">` +
        `<svg viewBox="0 0 24 24" fill="${col}">${ICON[icon]}</svg></span>`;
    }
    return out;
  }

  /* a themed accessory drawn on top of the mascot (Pip) */
  function mascotAccessory(key) {
    if (key === "hero") {
      // little hero mask + star badge
      return `<g class="pip-acc">
        <path d="M -26 -10 q 26 -14 52 0 q -8 10 -26 10 q -18 0 -26 -10Z" fill="#1F6FEB"/>
        <circle cx="-14" cy="-6" r="6" fill="#0d2a5e"/><circle cx="16" cy="-6" r="6" fill="#0d2a5e"/>
        <path d="M 0 30 l3 6 7 .6 -5 4.6 1.4 6.6 -6.4 -3.5 -6.4 3.5 1.4 -6.6 -5 -4.6 7 -.6Z" fill="#FFC93C"/>
      </g>`;
    }
    // sparkle: tiara + sparkles
    return `<g class="pip-acc">
      <path d="M -22 -34 L -10 -22 L 0 -36 L 10 -22 L 22 -34 L 18 -16 L -18 -16Z" fill="#FFC93C" stroke="#FF9F45" stroke-width="1.5"/>
      <circle cx="0" cy="-36" r="3.5" fill="#FF4FA3"/><circle cx="-22" cy="-34" r="3" fill="#7AC7FF"/><circle cx="22" cy="-34" r="3" fill="#B45BE6"/>
      <path d="M 30 -6 l1.6 4.4 4.4 1.6 -4.4 1.6 -1.6 4.4 -1.6 -4.4 -4.4 -1.6 4.4 -1.6Z" fill="#fff"/>
    </g>`;
  }

  function confettiColors(key) { return meta(key).confetti; }

  return { THEMES, apply, current, meta, floatField, mascotAccessory, mascotSVG, confettiColors, list: () => Object.values(THEMES) };
})();
