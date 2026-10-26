# AFTERLIGHT
### Every move leaves a mark.

**AFTERLIGHT** is a full-stack, multiplayer Tic-Tac-Toe platform built around strategic gameplay, atmospheric design, and object-oriented software engineering.

More than a traditional Tic-Tac-Toe game, AFTERLIGHT combines intelligent AI opponents, online multiplayer, player profiles, social connections, game invitations, persistent match history, and an interactive OOP learning experience.

> Every move leaves a mark. Every match tells a story.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [AI Opponents](#ai-opponents)
- [Technology Stack](#technology-stack)
- [Object-Oriented Design](#object-oriented-design)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Project Structure](#project-structure)
- [Testing](#testing)
- [Security](#security)
- [Academic Purpose](#academic-purpose)
- [License](#license)

## Overview

AFTERLIGHT is designed to demonstrate how a familiar game can become a complete software engineering project.

The platform combines a modern web interface with a Python backend, a reusable object-oriented game engine, persistent data storage, and real-time communication.

The project emphasizes clean architecture, maintainable code, testable business logic, and practical applications of object-oriented programming.

## Features

### Gameplay

- Interactive Tic-Tac-Toe board with animated moves.
- Turn tracking, win detection, and draw detection.
- New game and rematch functionality.
- Multiple AI difficulty levels.
- Persistent match history and player statistics.

### Online Multiplayer

- Create private rooms and share room codes.
- Play against another player in real time.
- Server-authoritative move validation.
- Turn enforcement and game-state synchronization.
- Reconnection handling where supported.

### Player Community

- Player search and public profiles.
- Send, accept, reject, and cancel friend requests.
- Manage a friends list.
- Invite friends to online matches.
- Notifications for social and game-related events.
- Block functionality and privacy controls where implemented.

### Authentication and Profiles

- User registration, login, and logout.
- Secure password hashing.
- Player profiles and game statistics.
- Protected endpoints and authenticated game actions.

### OOP Lab

An interactive learning section that connects the project's implementation to object-oriented programming concepts.

It is intended to demonstrate:

- Encapsulation and abstraction.
- Inheritance and polymorphism.
- Composition and separation of concerns.
- SOLID principles.
- How different AI strategies share a common interface.
- How the game engine validates and processes moves.

The OOP Lab should reflect the actual implementation rather than simulated examples.

## AI Opponents

AFTERLIGHT features three planned AI opponents with distinct strategies.

| Opponent | Strategy | Difficulty |
|---|---|---|
| Wanderer | Selects a random legal move | Easy |
| Sentinel | Uses strategic rules to select promising moves | Medium |
| The Unbroken | Uses Minimax with alpha-beta pruning | Unbeatable with correct implementation |

**The Unbroken** is designed to play optimally. It should never lose against legal play, although a draw against another perfect player is possible.

## Technology Stack

| Layer | Technology |
|---|---|
| Frontend | React, TypeScript, Vite |
| Styling | Tailwind CSS |
| Animation | Framer Motion |
| Routing | React Router |
| Icons | Lucide |
| Backend | Python, FastAPI |
| Database | MongoDB |
| Real-time communication | WebSockets |
| Testing | Pytest and frontend testing tools |
| Version control | Git and GitHub |

The Python game engine should remain independent of FastAPI and MongoDB. This separation makes it easier to test the game logic and potentially adapt the application to another backend framework or database.

## Object-Oriented Design

OOP is a central requirement of AFTERLIGHT, not simply a feature added to the documentation.

### Core domain classes

The design may include the following classes, depending on the final implementation:

- `Board` — maintains the board state and validates positions.
- `Player` — defines the common player interface.
- `HumanPlayer` — represents a human-controlled player.
- `BotPlayer` — defines common behavior for AI players.
- `RandomBot` — chooses a random legal move.
- `StrategicBot` — chooses moves using strategic rules.
- `UnbeatableBot` — implements optimal Minimax-based play.
- `Game` — manages turns, state transitions, and game completion.
- `Move` — represents an individual move.
- `GameResult` — represents the outcome of a match.

### Service layer

Separate services can coordinate application-level operations:

- `GameService`
- `MatchmakingService`
- `FriendshipService`
- `GameInvitationService`
- `MatchHistoryService`
- `PlayerStatisticsService`

Repository interfaces separate persistence from domain logic, allowing MongoDB implementations to be replaced without rewriting the game engine.

### Principles demonstrated

- **Encapsulation:** Protecting board state and validating moves through defined methods.
- **Abstraction:** Exposing common interfaces for players and bot strategies.
- **Inheritance:** Sharing behavior through appropriate base classes.
- **Polymorphism:** Allowing different bots to implement the same move-selection interface.
- **Composition:** Building a game from collaborating domain objects.
- **SOLID:** Organizing responsibilities and dependencies to make the system easier to extend and test.

## Architecture

AFTERLIGHT follows a layered architecture.

```text
React + TypeScript Frontend
          |
          | HTTP / REST API
          | WebSockets
          v
       FastAPI Backend
          |
          v
   Application Services
          |
          v
 Framework-Independent
    Python OOP Engine
          |
          v
    Repository Layer
          |
          v
       MongoDB
```

The frontend handles presentation and user interaction. FastAPI exposes HTTP and WebSocket interfaces. Application services coordinate operations, while the domain engine owns game rules and AI decisions. Repositories manage persistence.

WebSocket messages must be authenticated and authorized, and the server must validate all moves rather than trusting the browser.

## Getting Started

### Prerequisites

Install the following before running the application:

- Python 3.11 or a compatible version supported by the project.
- Node.js and npm.
- MongoDB, locally or through a hosted deployment.
- Git.

### 1. Clone the repository

```bash
git clone <YOUR_REPOSITORY_URL>
cd AFTERLIGHT
```

Replace `<YOUR_REPOSITORY_URL>` with your actual repository URL.

### 2. Configure the backend

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

Create a `.env` file in the backend directory using the variables documented below.

Start the backend:

```bash
uvicorn app.main:app --reload
```

This command assumes the FastAPI application is exposed as `app` in `app/main.py`. Adjust it if the repository uses a different entry point.

The API documentation is generally available at:

- Swagger UI: `http://127.0.0.1:8000/docs`
- ReDoc: `http://127.0.0.1:8000/redoc`

### 3. Configure the frontend

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

Open the local URL printed by Vite, typically `http://localhost:5173`.

### 4. Verify the application

Confirm that:

- The frontend can communicate with the backend.
- The backend can connect to MongoDB.
- Registration and login work with persistent accounts.
- Game moves are validated by the server.
- Match history persists across restarts.
- WebSocket connections work for multiplayer sessions.

## Environment Variables

Create environment files locally and never commit real credentials.

Example backend `.env`:

```dotenv
APP_ENV=development
SECRET_KEY=replace-with-a-strong-random-secret
MONGODB_URI=mongodb://localhost:27017
MONGODB_DATABASE=afterlight
FRONTEND_ORIGIN=http://localhost:5173
```

Example frontend `.env`:

```dotenv
VITE_API_BASE_URL=http://localhost:8000
```

These are example variable names. Keep them consistent with the application's actual configuration.

For production, use strong secrets, HTTPS, secure cookie settings where cookies are used, appropriate CORS restrictions, WebSocket origin checks, and rate limiting.

## Project Structure

A suggested structure is:

```text
AFTERLIGHT/
├── frontend/
│   ├── public/
│   │   └── images/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── types/
│   │   └── App.tsx
│   └── package.json
│
├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── core/
│   │   ├── domain/
│   │   ├── services/
│   │   ├── repositories/
│   │   ├── models/
│   │   ├── websocket/
│   │   └── main.py
│   ├── tests/
│   └── requirements.txt
│
├── docs/
│   ├── ARCHITECTURE.md
│   ├── API.md
│   ├── DATABASE.md
│   └── OOP_DESIGN.md
│
├── .gitignore
└── README.md
```

The actual repository structure may differ. Update this section as the implementation evolves.

## Testing

Testing should cover both domain logic and application behavior.

### Backend

```bash
cd backend
pytest
```

Important test cases include:

- Legal and illegal moves.
- Win, loss, and draw detection.
- Minimax correctness across reachable game states.
- Authentication and authorization.
- Duplicate friend requests and friendships.
- Expired or invalid game invitations.
- Concurrent moves and room-seat allocation.
- WebSocket access control.

### Frontend

```bash
cd frontend
npm run test
```

Use the actual test script configured in `package.json`. If the project does not yet have one, add a frontend testing setup before relying on this command.

Only report tests as passing after they have actually been executed.

## Security

Security is part of the design, not a final add-on.

- Hash passwords using a suitable password-hashing library.
- Never store plaintext passwords or commit secrets.
- Authenticate protected HTTP endpoints and WebSocket connections.
- Authorize room membership and invitation actions on the server.
- Validate every move and enforce turns on the backend.
- Use database constraints or atomic operations to prevent duplicate relationships and race conditions.
- Apply request validation, rate limiting, and appropriate CORS and WebSocket origin policies.
- Avoid exposing private account information in public profiles or API responses.


## Academic Purpose

AFTERLIGHT is a learning project developed to apply object-oriented programming and full-stack software engineering concepts in a practical application.

It demonstrates the relationship between domain modeling, algorithms, backend architecture, persistent storage, real-time communication, frontend development, and testing.

The project is intended for educational and portfolio use. Its security and deployment readiness should be assessed independently before any production use.

## License

Choose and add an appropriate open-source license before distributing the project. Until a license is added, do not assume that others have permission to reuse or redistribute the code.

---

**AFTERLIGHT — Every move leaves a mark.**
