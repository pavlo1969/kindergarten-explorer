// ─────────────────────────────────────────────────────────────────────────────
// Kindergarten Explorer — Location Data
// ─────────────────────────────────────────────────────────────────────────────
// Each location has:
//   id          – unique key
//   name        – display name
//   emoji       – room icon
//   kidEmoji    – emoji representing the kid in the placeholder
//   kidName     – kid's name shown in speech bubble
//   color       – primary color (used for nav buttons, map nodes)
//   bgGradient  – placeholder screen background
//   video       – path to video file (relative to index.html)
//   photo       – path to photo shown as background during navigation
//   speech      – text shown in speech bubble when no video
//   connections – { forward, backward, left, right } → location id or null
//   mapPos      – {x, y} position in the 300×310 mini-map SVG
// ─────────────────────────────────────────────────────────────────────────────

const STARTING_LOCATION = 'entrance';

const LOCATIONS = {
  playground: {
    id: 'playground',
    name: 'Playground',
    emoji: '🛝',
    kidEmoji: '👦',
    kidName: 'Liam',
    color: '#27AE60',
    bgGradient: 'linear-gradient(160deg, #56AB2F 0%, #A8E063 100%)',
    video: 'videos/playground.mp4',
    photo: 'photos/playground.webp',
    speech: "Hi! I'm Liam! This is our playground — I love the slide! 🌈",
    connections: { forward: 'entrance', backward: null, left: null, right: null },
    mapPos: { x: 150, y: 28 },
  },

  entrance: {
    id: 'entrance',
    name: 'Entrance',
    emoji: '🚪',
    kidEmoji: '👧',
    kidName: 'Sofia',
    color: '#E67E22',
    bgGradient: 'linear-gradient(160deg, #F7971E 0%, #FFD200 100%)',
    video: 'videos/entrance.mp4',
    photo: 'photos/entrance.jpeg',
    speech: "Hello! I'm Sofia! Welcome to our kindergarten! 🏫",
    connections: { forward: 'hallway', backward: 'playground', left: null, right: null },
    mapPos: { x: 150, y: 87 },
  },

  hallway: {
    id: 'hallway',
    name: 'Hallway',
    emoji: '🏃',
    kidEmoji: '🧒',
    kidName: 'Noah',
    color: '#8E44AD',
    bgGradient: 'linear-gradient(160deg, #9B59B6 0%, #C39BD3 100%)',
    video: 'videos/hallway.mp4',
    photo: 'photos/hallway.jpeg',
    speech: "Hey! I'm Noah! From here you can go to all the rooms! 🗺️",
    connections: { forward: 'classroom', backward: 'entrance', left: 'art_room', right: 'playroom' },
    mapPos: { x: 150, y: 148 },
  },

  art_room: {
    id: 'art_room',
    name: 'Art Room',
    emoji: '🎨',
    kidEmoji: '👩‍🎨',
    kidName: 'Olivia',
    color: '#E74C3C',
    bgGradient: 'linear-gradient(160deg, #FF416C 0%, #FF4B2B 100%)',
    video: 'videos/art_room.mp4',
    photo: 'photos/art_room.jpeg',
    speech: "Hi! I'm Olivia! We paint and draw amazing things here! 🖌️",
    connections: { forward: 'nap_room', backward: null, left: null, right: 'hallway' },
    mapPos: { x: 60, y: 148 },
  },

  playroom: {
    id: 'playroom',
    name: 'Play Room',
    emoji: '🧸',
    kidEmoji: '🧒',
    kidName: 'Ethan',
    color: '#E91E63',
    bgGradient: 'linear-gradient(160deg, #E91E63 0%, #FF80AB 100%)',
    video: 'videos/playroom.mp4',
    photo: 'photos/playroom.jpeg',
    speech: "Hey! I'm Ethan! We have SO many cool toys in here! 🚂",
    connections: { forward: 'library', backward: null, left: 'hallway', right: null },
    mapPos: { x: 240, y: 148 },
  },

  classroom: {
    id: 'classroom',
    name: 'Classroom',
    emoji: '📚',
    kidEmoji: '👩‍🎓',
    kidName: 'Mia',
    color: '#2980B9',
    bgGradient: 'linear-gradient(160deg, #2980B9 0%, #6DD5FA 100%)',
    video: 'https://github.com/pavlo1969/kindergarten-explorer/releases/download/v1.0/classroom.mp4',
    photo: 'photos/classroom.jpeg',
    speech: "Hi! I'm Mia! This is where we learn letters, numbers and stories! ✏️",
    connections: { forward: 'cafeteria', backward: 'hallway', left: null, right: null },
    mapPos: { x: 150, y: 210 },
  },

  nap_room: {
    id: 'nap_room',
    name: 'Nap Room',
    emoji: '😴',
    kidEmoji: '😴',
    kidName: 'Lucas',
    color: '#34495E',
    bgGradient: 'linear-gradient(160deg, #2C3E50 0%, #4CA1AF 100%)',
    video: 'videos/nap_room.mp4',
    photo: 'photos/nap_room.jpeg',
    speech: "Shhh… I'm Lucas! We rest here after playing all morning! 🌙",
    connections: { forward: null, backward: 'art_room', left: null, right: null },
    mapPos: { x: 60, y: 210 },
  },

  library: {
    id: 'library',
    name: 'Library',
    emoji: '📖',
    kidEmoji: '👧',
    kidName: 'Emma',
    color: '#795548',
    bgGradient: 'linear-gradient(160deg, #795548 0%, #D7B28A 100%)',
    video: 'videos/library.mp4',
    photo: 'photos/library.jpeg',
    speech: "Hi! I'm Emma! We have hundreds of magical books here! 📚",
    connections: { forward: null, backward: 'playroom', left: null, right: null },
    mapPos: { x: 240, y: 210 },
  },

  cafeteria: {
    id: 'cafeteria',
    name: 'Cafeteria',
    emoji: '🍎',
    kidEmoji: '👦',
    kidName: 'Ava',
    color: '#16A085',
    bgGradient: 'linear-gradient(160deg, #11998E 0%, #38EF7D 100%)',
    video: 'videos/cafeteria.mp4',
    photo: 'photos/cafeteria.jpeg',
    speech: "Yum! I'm Ava! We eat the most delicious lunches in here! 🥗",
    connections: { forward: null, backward: 'classroom', left: null, right: null },
    mapPos: { x: 150, y: 278 },
  },
};

// Connection pairs used to draw lines on the mini-map
const MAP_CONNECTIONS = [
  ['playground', 'entrance'],
  ['entrance',   'hallway'],
  ['hallway',    'art_room'],
  ['hallway',    'playroom'],
  ['hallway',    'classroom'],
  ['art_room',   'nap_room'],
  ['playroom',   'library'],
  ['classroom',  'cafeteria'],
];
