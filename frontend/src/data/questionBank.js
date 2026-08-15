/**
 * Predefined question bank. Creators pick up to 15 questions from here and
 * can also write their own, then customize the options + correct answers,
 * so the experience is fast and the questions stay fun and appropriate.
 */
export const CATEGORIES = ['Food', 'College', 'Personality', 'Entertainment', 'Personal & Fun'];

const O = (text, emoji) => ({ text, emoji });

export const QUESTION_BANK = [
  // ── Food ─────────────────────────────────────────────
  {
    id: 'food-1',
    category: 'Food',
    questionText: 'What is my favorite food?',
    defaultType: 'mcq',
    defaultOptions: [O('Pizza', '🍕'), O('Biryani', '🍛'), O('Idli', '🥘'), O('Burger', '🍔')],
  },
  {
    id: 'food-2',
    category: 'Food',
    questionText: 'What is my favorite snack?',
    defaultType: 'mcq',
    defaultOptions: [O('Fries', '🍟'), O('Popcorn', '🍿'), O('Chocolate', '🍫'), O('Cookies', '🍪')],
  },
  {
    id: 'food-3',
    category: 'Food',
    questionText: 'What is my favorite drink?',
    defaultType: 'mcq',
    defaultOptions: [O('Soft Drink', '🥤'), O('Coffee', '☕'), O('Bubble Tea', '🧋'), O('Milkshake', '🥛')],
  },
  {
    id: 'food-4',
    category: 'Food',
    questionText: 'What is my favorite dessert?',
    defaultType: 'mcq',
    defaultOptions: [O('Ice Cream', '🍦'), O('Cake', '🍰'), O('Donut', '🍩'), O('Brownie', '🍫')],
  },
  {
    id: 'food-5',
    category: 'Food',
    questionText: "What's my favorite cuisine?",
    defaultType: 'mcq',
    defaultOptions: [O('Indian', '🍛'), O('Italian', '🍝'), O('Chinese', '🥡'), O('Mexican', '🌮')],
  },
  {
    id: 'food-6',
    category: 'Food',
    questionText: "What's my favorite street food?",
    defaultType: 'mcq',
    defaultOptions: [O('Pani Puri', '🫓'), O('Momos', '🥟'), O('Samosa', '🥠'), O('Chaat', '🥗')],
  },
  {
    id: 'food-7',
    category: 'Food',
    questionText: 'Sweet or savory — which wins for me?',
    defaultType: 'mcq',
    defaultOptions: [O('Sweet', '🍬'), O('Savory', '🧂'), O('Both!', '😋'), O('Depends on the mood', '🤷')],
  },
  {
    id: 'food-8',
    category: 'Food',
    questionText: 'Can I handle spicy food?',
    defaultType: 'mcq',
    defaultOptions: [O('Bring it on', '🔥'), O('Medium spice', '🌶️'), O('Very mild', '😅'), O('No way', '🚫')],
  },

  // ── College ──────────────────────────────────────────
  {
    id: 'college-1',
    category: 'College',
    questionText: 'Which subject do I like the most?',
    defaultType: 'mcq',
    defaultOptions: [O('Programming', '💻'), O('Math', '📐'), O('English', '📖'), O('Science', '🧪')],
  },
  {
    id: 'college-2',
    category: 'College',
    questionText: 'Which subject do I hate the most?',
    defaultType: 'mcq',
    defaultOptions: [O('Math', '📐'), O('History', '📜'), O('Chemistry', '🧪'), O('Accounts', '📊')],
  },
  {
    id: 'college-3',
    category: 'College',
    questionText: 'What is my favorite place in college?',
    defaultType: 'mcq',
    defaultOptions: [O('Library', '📚'), O('Ground', '🏀'), O('Canteen', '🍔'), O('Computer Lab', '💻')],
  },
  {
    id: 'college-4',
    category: 'College',
    questionText: 'How do I usually reach college?',
    defaultType: 'mcq',
    defaultOptions: [O('Bus', '🚌'), O('Bike', '🏍️'), O('Car', '🚗'), O('Walk', '🚶')],
  },
  {
    id: 'college-5',
    category: 'College',
    questionText: 'What is my dream company?',
    defaultType: 'text',
    defaultOptions: [],
  },
  {
    id: 'college-6',
    category: 'College',
    questionText: 'Who is my favorite teacher?',
    defaultType: 'text',
    defaultOptions: [],
  },
  {
    id: 'college-7',
    category: 'College',
    questionText: "What's my nickname in college?",
    defaultType: 'text',
    defaultOptions: [],
  },
  {
    id: 'college-8',
    category: 'College',
    questionText: 'What time do I wake up on college days?',
    defaultType: 'mcq',
    defaultOptions: [O('6 AM', '🌅'), O('7 AM', '⏰'), O('8 AM', '😴'), O('9 AM or later', '🙈')],
  },
  {
    id: 'college-9',
    category: 'College',
    questionText: 'What do I do in a boring lecture?',
    defaultType: 'mcq',
    defaultOptions: [O('Sleep', '😴'), O('Scroll my phone', '📱'), O('Take notes', '📝'), O('Chat with friends', '💬')],
  },

  // ── Personality ──────────────────────────────────────
  {
    id: 'person-1',
    category: 'Personality',
    questionText: 'What makes me angry?',
    defaultType: 'text',
    defaultOptions: [],
  },
  {
    id: 'person-2',
    category: 'Personality',
    questionText: 'What makes me happy?',
    defaultType: 'text',
    defaultOptions: [],
  },
  {
    id: 'person-3',
    category: 'Personality',
    questionText: 'What am I scared of?',
    defaultType: 'text',
    defaultOptions: [],
  },
  {
    id: 'person-4',
    category: 'Personality',
    questionText: 'What is my biggest fear?',
    defaultType: 'text',
    defaultOptions: [],
  },
  {
    id: 'person-5',
    category: 'Personality',
    questionText: 'What is my best quality?',
    defaultType: 'text',
    defaultOptions: [],
  },
  {
    id: 'person-6',
    category: 'Personality',
    questionText: 'Am I a morning person or a night owl?',
    defaultType: 'mcq',
    defaultOptions: [O('Morning person', '🌅'), O('Night owl', '🦉'), O('Depends on the day', '😴')],
  },
  {
    id: 'person-7',
    category: 'Personality',
    questionText: 'How do I react when a friend is late?',
    defaultType: 'mcq',
    defaultOptions: [O('No problem at all', '😌'), O('Annoyed but silent', '😤'), O('I tease them', '😜'), O("I'm late too", '⏳')],
  },
  {
    id: 'person-8',
    category: 'Personality',
    questionText: "What's my texting style?",
    defaultType: 'mcq',
    defaultOptions: [O('Full sentences', '✍️'), O('Short & crisp', '⚡'), O('Emojis everywhere', '😂'), O('Voice notes', '🎤')],
  },
  {
    id: 'person-9',
    category: 'Personality',
    questionText: 'Introvert or extrovert?',
    defaultType: 'mcq',
    defaultOptions: [O('Introvert', '🐢'), O('Extrovert', '🦜'), O('Ambivert', '🦎')],
  },

  // ── Entertainment ────────────────────────────────────
  {
    id: 'ent-1',
    category: 'Entertainment',
    questionText: "What's my favorite movie genre?",
    defaultType: 'mcq',
    defaultOptions: [O('Action', '🎬'), O('Comedy', '😂'), O('Fantasy', '🧙'), O('Romance', '💔')],
  },
  {
    id: 'ent-2',
    category: 'Entertainment',
    questionText: "What's my favorite song genre?",
    defaultType: 'mcq',
    defaultOptions: [O('Pop', '🎤'), O('Rock', '🎸'), O('Hip-Hop', '🎧'), O('Classical', '🎻')],
  },
  {
    id: 'ent-3',
    category: 'Entertainment',
    questionText: 'Who is my favorite actor?',
    defaultType: 'text',
    defaultOptions: [],
  },
  {
    id: 'ent-4',
    category: 'Entertainment',
    questionText: "What's my favorite movie?",
    defaultType: 'mcq',
    defaultOptions: [O('Inception', '🎬'), O('Avengers', '🦸'), O('Harry Potter', '🧙'), O('3 Idiots', '😂')],
  },
  {
    id: 'ent-5',
    category: 'Entertainment',
    questionText: "What's my favorite web series?",
    defaultType: 'text',
    defaultOptions: [],
  },
  {
    id: 'ent-6',
    category: 'Entertainment',
    questionText: 'Which superhero would I be?',
    defaultType: 'mcq',
    defaultOptions: [O('Iron Man', '🤖'), O('Spider-Man', '🕷️'), O('Batman', '🦇'), O('Wonder Woman', '🦸')],
  },
  {
    id: 'ent-7',
    category: 'Entertainment',
    questionText: "What's my favorite anime?",
    defaultType: 'mcq',
    defaultOptions: [O('Naruto', '🍥'), O('One Piece', '🏴‍☠️'), O('Demon Slayer', '⚔️'), O('Attack on Titan', '🗼')],
  },
  {
    id: 'ent-8',
    category: 'Entertainment',
    questionText: 'Who is my favorite singer?',
    defaultType: 'text',
    defaultOptions: [],
  },
  {
    id: 'ent-9',
    category: 'Entertainment',
    questionText: 'Which movie have I watched the most times?',
    defaultType: 'text',
    defaultOptions: [],
  },
  {
    id: 'ent-10',
    category: 'Entertainment',
    questionText: "What's my perfect weekend plan?",
    defaultType: 'mcq',
    defaultOptions: [O('Netflix marathon', '🍿'), O('Gaming session', '🎮'), O('Out with friends', '🎉'), O('Sleeping in', '🛌')],
  },

  // ── Personal & Fun ───────────────────────────────────
  {
    id: 'fun-1',
    category: 'Personal & Fun',
    questionText: 'Who was my first crush?',
    defaultType: 'text',
    defaultOptions: [],
  },
  {
    id: 'fun-2',
    category: 'Personal & Fun',
    questionText: 'What is my dream destination?',
    defaultType: 'mcq',
    defaultOptions: [O('Bali', '🏝️'), O('Paris', '🗼'), O('Kashmir', '🏔️'), O('New York', '🗽')],
  },
  {
    id: 'fun-3',
    category: 'Personal & Fun',
    questionText: 'What is my biggest dream?',
    defaultType: 'text',
    defaultOptions: [],
  },
  {
    id: 'fun-4',
    category: 'Personal & Fun',
    questionText: 'Which game do I like?',
    defaultType: 'mcq',
    defaultOptions: [O('GTA', '🎮'), O('FIFA', '⚽'), O('Minecraft', '🧱'), O('PUBG', '🏆')],
  },
  {
    id: 'fun-5',
    category: 'Personal & Fun',
    questionText: 'What is my favorite color?',
    defaultType: 'mcq',
    defaultOptions: [O('Red', '🔴'), O('Blue', '🔵'), O('Green', '🟢'), O('Yellow', '🟡')],
  },
  {
    id: 'fun-6',
    category: 'Personal & Fun',
    questionText: "What do I usually do when I'm bored?",
    defaultType: 'text',
    defaultOptions: [],
  },
  {
    id: 'fun-7',
    category: 'Personal & Fun',
    questionText: 'What is one thing I cannot live without?',
    defaultType: 'text',
    defaultOptions: [],
  },
  {
    id: 'fun-8',
    category: 'Personal & Fun',
    questionText: "What's my favorite programming language?",
    defaultType: 'mcq',
    defaultOptions: [O('Python', '🐍'), O('Java', '☕'), O('JavaScript', '⚡'), O('Rust', '🦀')],
  },
  {
    id: 'fun-9',
    category: 'Personal & Fun',
    questionText: "What's my favorite sport?",
    defaultType: 'mcq',
    defaultOptions: [O('Football', '⚽'), O('Cricket', '🏏'), O('Basketball', '🏀'), O('Badminton', '🏸')],
  },
  {
    id: 'fun-10',
    category: 'Personal & Fun',
    questionText: "What's my favorite animal?",
    defaultType: 'mcq',
    defaultOptions: [O('Dog', '🐶'), O('Cat', '🐱'), O('Lion', '🦁'), O('Dolphin', '🐬')],
  },
  {
    id: 'fun-11',
    category: 'Personal & Fun',
    questionText: 'What would I do with a million rupees?',
    defaultType: 'text',
    defaultOptions: [],
  },
  {
    id: 'fun-12',
    category: 'Personal & Fun',
    questionText: "What's my most-used emoji?",
    defaultType: 'mcq',
    defaultOptions: [O('Laughing face', '😂'), O('Crying laughing', '🤣'), O('Cool face', '😎'), O('Heart', '❤️')],
  },
  {
    id: 'fun-13',
    category: 'Personal & Fun',
    questionText: 'If I could have dinner with anyone, who would it be?',
    defaultType: 'text',
    defaultOptions: [],
  },
  {
    id: 'fun-14',
    category: 'Personal & Fun',
    questionText: "What's my guilty pleasure?",
    defaultType: 'text',
    defaultOptions: [],
  },
  {
    id: 'fun-15',
    category: 'Personal & Fun',
    questionText: 'How long can I survive without my phone?',
    defaultType: 'mcq',
    defaultOptions: [O('An hour', '😰'), O('Half a day', '😬'), O('A full day', '💪'), O("I can't", '🙅')],
  },
  {
    id: 'fun-16',
    category: 'Personal & Fun',
    questionText: "What's my hidden talent?",
    defaultType: 'text',
    defaultOptions: [],
  },
  {
    id: 'fun-17',
    category: 'Personal & Fun',
    questionText: 'What would I name my pet?',
    defaultType: 'text',
    defaultOptions: [],
  },
  {
    id: 'fun-18',
    category: 'Personal & Fun',
    questionText: 'If I had a free day tomorrow, what would I do?',
    defaultType: 'text',
    defaultOptions: [],
  },
];

export const QUESTION_BANK_BY_ID = Object.fromEntries(QUESTION_BANK.map((q) => [q.id, q]));

export function bankQuestionToConfig(q) {
  return {
    type: q.defaultType,
    options: q.defaultOptions.map((o) => ({ id: o.text.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 6) || 'x', ...o })),
    correctOptionId: null,
    textAnswer: '',
  };
}

export const EMOJI_PALETTE = [
  '🍕', '🍔', '🍛', '🥘', '🍟', '🍿', '🍫', '🍪', '🍦', '🍰', '🍩', '🥤',
  '☕', '🧋', '🥛', '⚽', '🏏', '🏀', '🏸', '🎮', '🎬', '🎤', '🎸', '🎧',
  '💻', '📐', '📖', '📚', '🧪', '📊', '🚌', '🏍️', '🚗', '🚶', '🐍', '☕',
  '🦀', '⚡', '🐶', '🐱', '🦁', '🐬', '🏝️', '🗼', '🏔️', '🗽', '🔴', '🔵',
  '🟢', '🟡', '🦸', '🧙', '😂', '💔', '🏆', '🧱', '🍝', '🥡', '🌮', '🫓',
  '🥟', '🥠', '🥗', '🍬', '🧂', '🌶️', '😅', '🚫', '🦉', '🐢', '🦜', '🦎',
  '🕷️', '⚔️', '🏴‍☠️', '😰', '😬', '💪', '🙅', '😤', '✍️', '😌', '⏳', '🛌', '❤️',
];
