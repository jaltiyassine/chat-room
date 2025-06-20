# Chat Room

A real-time chat application developed with Node.js, Fastify, and WebSockets, supporting group messaging, typing indicators, and live interactions.

## Features

- **Real-time group chat** via WebSockets
- **User join/leave notifications**
- **Typing indicators** (see when others are typing)
- **Color customization** for chat UI
- **Fast and lightweight** backend using Fastify
- **Handlebars** templating for flexible UI

## Demo

After launching the server, visit:  
```
http://localhost:3000/room
```

## Getting Started

### Prerequisites

- [Node.js 14.x](https://nodejs.org/) or newer

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/jaltiyassine/chat-room.git
   cd chat-room
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the server:**
   ```bash
   npm start
   ```

4. **Open your browser and navigate to** `http://localhost:3000/room`

## Usage

- Enter a username and join the chat room.
- Type and send messages in real time.
- See when other users are typing.
- Receive notifications when users join or leave.

## Project Structure

```
.
├── public/           # Static assets (JS, CSS, images)
├── src/
│   ├── pages/        # Handlebars templates (index.hbs, room.hbs)
│   ├── colors.json   # Color definitions for UI customization
│   └── seo.json      # SEO metadata
├── server.js         # Main server file (Fastify + WebSocket logic)
├── package.json      # Project config & dependencies
```

## Technical Overview

- **Backend:** Fastify serves HTTP routes and static files. WebSocket connections are handled with the `ws` package.
- **Frontend:** Handlebars views render the chat UI. JS connects to `/room/ws` for live messaging.
- **WebSocket Events:**
  - `chat`: Broadcast messages to all users
  - `start_typing`/`stop_typing`: Typing indicators
  - `system`: System notifications (join/leave)
- **Color Customization:** Users can select a color, validated against `src/colors.json`.

## Customization

- To add or modify colors, edit `src/colors.json`.
- For UI changes, edit Handlebars templates in `src/pages/`.

## License

MIT

---

**Author:** [jaltiyassine](https://github.com/jaltiyassine)