# AFTERLIGHT

Every move leaves a mark.

AFTERLIGHT is a Tic-Tac-Toe platform with three bot difficulties, real-time online rooms, friends, player search, match history and profiles. An OOP Learning Lab walks through the Python game engine behind it.

## Features

- **Play vs Bot** – Easy (random), Medium (wins and blocks), Unbeatable (minimax with alpha-beta pruning), with an AI Analysis panel.
- **Play Online** – private rooms over WebSockets, rematches and chat.
- **Players and Friends** – search players, send and answer friend requests, invite friends to a room, block users.
- **Match History and Profile** – results, final boards and stats saved in SQLite.
- **OOP Learning Lab** – class hierarchy, polymorphism and encapsulation demos, SOLID principles, presentation mode and an automated test runner.

## Stack

React 19, TypeScript, Vite, Tailwind CSS, Express, `ws`, a Python 3.10 domain engine and SQLite.

## Run it

```bash
npm install --legacy-peer-deps
npm run dev          # http://localhost:3000
npm run lint         # type check
npm run build        # production build
python3 backend/tests/test_engine.py
```

## Documentation

- `docs/OOP_DESIGN.md` – OOP and SOLID design
- `docs/ARCHITECTURE.md` – architecture and WebSocket protocol
- `docs/API.md` – REST API
- `docs/DATABASE.md` – schema
