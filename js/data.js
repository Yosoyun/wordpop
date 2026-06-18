/* ============================================================
   WordPop — Word Data
   ------------------------------------------------------------
   This is the HEART of the app. To add a new word, just add an
   object to a letter's `words` array. To build a whole new
   letter, fill its `words` array with 25 entries like Letter A.

   Each word object:
   {
     word:     "Amazing",          // the word itself
     pos:      "adjective",        // part of speech (naming / doing / describing word)
     emoji:    "🤩",                // the visual
     say:      "uh-MAY-zing",      // kid-friendly pronunciation
     tier:     2,                  // 1 = easiest (Grade 1) ... 5 = hardest (Grade 5)
     meaning:  "...",              // simple, child-friendly definition
     example:  "...",              // a sentence a child would understand
     synonyms: ["...", "..."],     // words that mean the SAME
     antonyms: ["...", "..."]      // words that mean the OPPOSITE ([] if none)
   }
   ============================================================ */

const CONFIG = {
  appName: "WordPop",                       // ← change the app name here
  tagline: "Pop a bubble, learn a beautiful word!",
  mascotName: "Pip",                        // ← the friendly mascot's name
  freeLetters: ["A", "B"],                  // letters playable for free
  parentPinDefault: "0000",                 // default Parent Zone PIN (changeable in-app)
  wordsPerCluster: 5                        // how many words per mini-lesson
};

/* ---- LETTER A : fully built (25 beautiful words) ---- */
const LETTER_A = [
  {
    word: "Apple", pos: "naming word", emoji: "🍎", say: "AP-ul", tier: 1,
    meaning: "A round, crunchy fruit that grows on a tree. It can be red, green or yellow.",
    example: "I packed a shiny red apple in my lunch box.",
    synonyms: ["fruit"],
    antonyms: []   // a naming word like 'apple' has no opposite — that's a real lesson!
  },
  {
    word: "Animal", pos: "naming word", emoji: "🐾", say: "AN-i-mal", tier: 1,
    meaning: "A living creature that can move, eat and breathe — like a dog, lion or fish.",
    example: "My favourite animal is the elephant.",
    synonyms: ["creature", "beast"],
    antonyms: ["plant"]
  },
  {
    word: "Add", pos: "doing word", emoji: "➕", say: "AD", tier: 1,
    meaning: "To put two or more things together to make more.",
    example: "If you add 2 apples and 3 apples, you get 5 apples.",
    synonyms: ["combine", "total", "join"],
    antonyms: ["subtract", "remove", "take away"]
  },
  {
    word: "Angry", pos: "describing word", emoji: "😠", say: "ANG-gree", tier: 1,
    meaning: "Feeling very upset or mad about something.",
    example: "He was angry when his tower of blocks fell down.",
    synonyms: ["mad", "furious", "cross"],
    antonyms: ["calm", "happy", "pleased"]
  },
  {
    word: "Afraid", pos: "describing word", emoji: "😨", say: "uh-FRAYD", tier: 1,
    meaning: "Feeling scared that something bad might happen.",
    example: "The puppy was afraid of the loud thunder.",
    synonyms: ["scared", "frightened", "fearful"],
    antonyms: ["brave", "fearless", "bold"]
  },
  {
    word: "Awake", pos: "describing word", emoji: "🌅", say: "uh-WAYK", tier: 1,
    meaning: "Not sleeping — with your eyes open and your mind working.",
    example: "I was wide awake before the alarm even rang.",
    synonyms: ["alert", "up"],
    antonyms: ["asleep", "sleeping"]
  },
  {
    word: "Amazing", pos: "describing word", emoji: "🤩", say: "uh-MAY-zing", tier: 2,
    meaning: "So surprising and wonderful that it makes you say WOW!",
    example: "The fireworks in the night sky were amazing.",
    synonyms: ["wonderful", "awesome", "incredible"],
    antonyms: ["ordinary", "boring", "dull"]
  },
  {
    word: "Awesome", pos: "describing word", emoji: "🌟", say: "AW-sum", tier: 2,
    meaning: "Really, really great — the kind of thing that fills you with joy.",
    example: "We had an awesome time at the water park.",
    synonyms: ["amazing", "fantastic", "great"],
    antonyms: ["terrible", "awful", "bad"]
  },
  {
    word: "Active", pos: "describing word", emoji: "🏃", say: "AK-tiv", tier: 2,
    meaning: "Full of energy and always busy moving or doing things.",
    example: "My little brother is so active that he never sits still.",
    synonyms: ["lively", "energetic", "busy"],
    antonyms: ["lazy", "still", "idle"]
  },
  {
    word: "Appear", pos: "doing word", emoji: "👀", say: "uh-PEER", tier: 2,
    meaning: "To come into sight so you can suddenly see it.",
    example: "A bright rainbow began to appear after the rain.",
    synonyms: ["show up", "emerge", "arrive"],
    antonyms: ["disappear", "vanish", "hide"]
  },
  {
    word: "Arrive", pos: "doing word", emoji: "🛬", say: "uh-RYV", tier: 2,
    meaning: "To reach the place you were going to.",
    example: "We will arrive at Grandma's house by lunchtime.",
    synonyms: ["reach", "land", "come"],
    antonyms: ["leave", "depart", "go"]
  },
  {
    word: "Alert", pos: "describing word", emoji: "🚨", say: "uh-LURT", tier: 2,
    meaning: "Wide awake, watching carefully and ready to act.",
    example: "The guard dog stayed alert all through the night.",
    synonyms: ["watchful", "attentive", "sharp"],
    antonyms: ["sleepy", "careless", "drowsy"]
  },
  {
    word: "Adorable", pos: "describing word", emoji: "🥰", say: "uh-DOR-uh-bul", tier: 3,
    meaning: "So cute and sweet that you can't help but love it.",
    example: "The tiny kitten was absolutely adorable.",
    synonyms: ["cute", "lovable", "charming"],
    antonyms: ["ugly", "unpleasant"]
  },
  {
    word: "Adventure", pos: "naming word", emoji: "🗺️", say: "ad-VEN-cher", tier: 3,
    meaning: "An exciting trip or experience full of fun and surprises.",
    example: "Climbing the hill to find the hidden cave was a great adventure.",
    synonyms: ["journey", "quest", "expedition"],
    antonyms: ["boredom", "routine"]
  },
  {
    word: "Ancient", pos: "describing word", emoji: "🏺", say: "AYN-shunt", tier: 3,
    meaning: "Very, very old — from a long, long time ago.",
    example: "We saw ancient pots that were thousands of years old.",
    synonyms: ["old", "aged", "antique"],
    antonyms: ["new", "modern", "young"]
  },
  {
    word: "Apologize", pos: "doing word", emoji: "🙇", say: "uh-POL-uh-jyz", tier: 3,
    meaning: "To say sorry when you have done something wrong.",
    example: "I had to apologize for stepping on my friend's drawing.",
    synonyms: ["say sorry", "regret"],
    antonyms: ["blame", "insult"]
  },
  {
    word: "Applaud", pos: "doing word", emoji: "👏", say: "uh-PLAWD", tier: 3,
    meaning: "To clap your hands to show you liked something.",
    example: "The whole crowd began to applaud after the song.",
    synonyms: ["clap", "cheer", "praise"],
    antonyms: ["boo", "criticize"]
  },
  {
    word: "Accept", pos: "doing word", emoji: "🤝", say: "ak-SEPT", tier: 3,
    meaning: "To take something that is given to you, or to agree to it.",
    example: "She was happy to accept the birthday gift.",
    synonyms: ["take", "receive", "agree"],
    antonyms: ["refuse", "reject", "decline"]
  },
  {
    word: "Anxious", pos: "describing word", emoji: "😟", say: "ANGK-shus", tier: 4,
    meaning: "Feeling worried and nervous about something that might happen.",
    example: "I felt anxious before standing up to read in class.",
    synonyms: ["worried", "nervous", "uneasy"],
    antonyms: ["calm", "relaxed", "confident"]
  },
  {
    word: "Appreciate", pos: "doing word", emoji: "🙏", say: "uh-PREE-shee-ayt", tier: 4,
    meaning: "To be thankful for something and understand how good it is.",
    example: "I really appreciate the way you helped me clean up.",
    synonyms: ["value", "treasure", "be thankful"],
    antonyms: ["ignore", "dislike"]
  },
  {
    word: "Astonished", pos: "describing word", emoji: "😮", say: "uh-STON-isht", tier: 4,
    meaning: "So surprised that your mouth drops open in wonder.",
    example: "We were astonished to see snow falling in our town.",
    synonyms: ["amazed", "shocked", "stunned"],
    antonyms: ["unimpressed", "bored"]
  },
  {
    word: "Admire", pos: "doing word", emoji: "😍", say: "ad-MYR", tier: 4,
    meaning: "To look at someone or something with respect and great liking.",
    example: "I admire my teacher because she is so kind and clever.",
    synonyms: ["respect", "look up to", "praise"],
    antonyms: ["despise", "scorn"]
  },
  {
    word: "Aware", pos: "describing word", emoji: "💡", say: "uh-WAIR", tier: 4,
    meaning: "Knowing about something that is happening around you.",
    example: "Be aware of the cars when you cross the road.",
    synonyms: ["conscious", "mindful", "alert"],
    antonyms: ["unaware", "clueless"]
  },
  {
    word: "Abundant", pos: "describing word", emoji: "🌾", say: "uh-BUN-dunt", tier: 5,
    meaning: "There is so much of it — much more than enough.",
    example: "After the rain, there was abundant water in the lake.",
    synonyms: ["plentiful", "ample", "loads of"],
    antonyms: ["scarce", "rare", "few"]
  },
  {
    word: "Ambitious", pos: "describing word", emoji: "🎯", say: "am-BISH-us", tier: 5,
    meaning: "Having big dreams and working hard to reach them.",
    example: "She is ambitious and wants to become an astronaut one day.",
    synonyms: ["determined", "driven", "eager"],
    antonyms: ["lazy", "unmotivated"]
  }
];

/* ---- The full alphabet. A & B are free; C–Z are "Premium" (locked for now). ----
   To build the next letter, replace its empty `words: []` with 25 word objects
   exactly like Letter A above, and set status to "ready". */
const LETTERS = [
  { letter: "A", theme: "Awesome Adjectives & Friends", color: "#FF7A5C", status: "ready",       words: LETTER_A },
  { letter: "B", theme: "Brilliant Beginnings",          color: "#2EC4B6", status: "coming-soon", words: [] },
  { letter: "C", theme: "Curious Words",                 color: "#FFC93C", status: "premium",     words: [] },
  { letter: "D", theme: "Delightful Words",              color: "#8A4FFF", status: "premium",     words: [] },
  { letter: "E", theme: "Exciting Words",                color: "#4D96FF", status: "premium",     words: [] },
  { letter: "F", theme: "Fantastic Words",               color: "#FF6B9D", status: "premium",     words: [] },
  { letter: "G", theme: "Glorious Words",                color: "#6BCB77", status: "premium",     words: [] },
  { letter: "H", theme: "Happy Words",                   color: "#FF9F45", status: "premium",     words: [] },
  { letter: "I", theme: "Incredible Words",              color: "#00C2CB", status: "premium",     words: [] },
  { letter: "J", theme: "Joyful Words",                  color: "#F95738", status: "premium",     words: [] },
  { letter: "K", theme: "Kind Words",                    color: "#9B5DE5", status: "premium",     words: [] },
  { letter: "L", theme: "Lovely Words",                  color: "#00BBF9", status: "premium",     words: [] },
  { letter: "M", theme: "Magical Words",                 color: "#F15BB5", status: "premium",     words: [] },
  { letter: "N", theme: "Nice & Noble Words",            color: "#FEE440", status: "premium",     words: [] },
  { letter: "O", theme: "Outstanding Words",             color: "#FF7A5C", status: "premium",     words: [] },
  { letter: "P", theme: "Playful Words",                 color: "#2EC4B6", status: "premium",     words: [] },
  { letter: "Q", theme: "Quirky Words",                  color: "#FFC93C", status: "premium",     words: [] },
  { letter: "R", theme: "Radiant Words",                 color: "#8A4FFF", status: "premium",     words: [] },
  { letter: "S", theme: "Spectacular Words",             color: "#4D96FF", status: "premium",     words: [] },
  { letter: "T", theme: "Terrific Words",                color: "#FF6B9D", status: "premium",     words: [] },
  { letter: "U", theme: "Unique Words",                  color: "#6BCB77", status: "premium",     words: [] },
  { letter: "V", theme: "Vibrant Words",                 color: "#FF9F45", status: "premium",     words: [] },
  { letter: "W", theme: "Wonderful Words",               color: "#00C2CB", status: "premium",     words: [] },
  { letter: "X", theme: "eXtra Special Words",           color: "#F95738", status: "premium",     words: [] },
  { letter: "Y", theme: "Yummy & Young Words",           color: "#9B5DE5", status: "premium",     words: [] },
  { letter: "Z", theme: "Zippy Words",                   color: "#00BBF9", status: "premium",     words: [] }
];
