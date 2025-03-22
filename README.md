# ♟️ Realtime Multiplayer Chess Game

A full-stack online chess application built with **Next.js 15**, **Socket.IO**, **chess.js**, and **TypeScript**, supporting multiplayer matches, spectators, real-time chat, move history tracking, and game-over detection.

---

##  Features

-  Real-time chess gameplay via WebSockets
-  Spectator mode for public viewing
-  Chat with typing indicators
-  Clickable move history viewer
-  Background music & check sound effects
-  TailwindCSS for modern styling
-  Dynamic `gameId` via URL routing

---

## 🛠️ Tech Stack

| Frontend                            | Backend                     | Tooling / Config              |
|-------------------------------------|-----------------------------|-------------------------------|
| Next.js (App Router) + TypeScript   | Node.js + Express           | ESLint + Tailwind + PostCSS   |
| React + React-Chessboard            | Socket.IO (WebSocket logic) | TypeScript config, UUID       |
| Framer Motion for UI transitions    | chess.js for move logic     | Vite dev server               |

---

##  Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/harshit-ojha0324/Realtime-Multiplayer-Chess-Game.git
cd realtime-chess-game
```

### 2. Install dependencies

```bash
npm install
```

### 3. Start the backend server

```bash
node server.js
```

> Runs at: `http://localhost:5001`

### 4. Start the frontend (Next.js)

```bash
npm run dev
```

> Runs at: `http://localhost:3000`

---

##  Project Structure

```
.
├── app/
│   ├── page.tsx             # Main game component
│   └── layout.tsx           # Root layout (font, Tailwind base)
│   └── slideshow.js         # Rotating background image slideshow(future use)
│   └── SearchParamsComponent.js  # Handles setting `gameId` from URL
├── public/
│   ├── audios/              # Background & check sound effects
│   └── images/              # Game-over images (win/draw)
├── styles/
│   └── globals.css          # Tailwind & global styles
├── server.js                # WebSocket & game logic with Express
├── tsconfig.json            # TypeScript config
├── tailwind.config.ts       # Tailwind theme settings
├── postcss.config.mjs       # Tailwind plugin config
├── eslint.config.mjs        # ESLint config for Next.js & TS
├── package.json             # Dependencies & scripts
└── README.md                # Project documentation
```

---

##  Dependencies

```json
"next": "15.1.6",
"react": "^19.0.0",
"chess.js": "^1.0.0",
"react-chessboard": "^4.7.2",
"socket.io": "^4.8.1",
"express": "^4.21.2",
"framer-motion": "^12.4.1",
"uuid": "^11.0.5"
```

---

##  Linting

```bash
npm run lint
```

Uses ESLint with the Next.js recommended rules, TypeScript support, and accessible JSX (`jsx-a11y`).

---

##  How to Play

1. Open the site – it generates a unique `gameId`.
2. Share the URL for someone to join as Black.
3. The third+ user becomes a spectator.
4. Chat in real-time, view move history, and listen for check alerts!

---

##  Screenshots

![image](https://github.com/user-attachments/assets/3520f228-614e-40f1-8e97-d15cd38c3e64)

![image](https://github.com/user-attachments/assets/0ca7d077-0360-455a-9d61-ea4274f476de)

![image](https://github.com/user-attachments/assets/731cba64-6bdc-4fe8-920c-9f0d453a5e8f)

---

##  To-Do (Planned Features)

- [ ] Timers for competitive play
- [ ] Chess engine integration (e.g. Stockfish)
- [ ] Match history + player stats
- [ ] User auth and matchmaking
- [ ] Deployment to Vercel/Render

---

##  License

MIT License © 2025 

