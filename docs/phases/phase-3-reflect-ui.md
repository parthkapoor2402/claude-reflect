# Phase 3 — Reflect UI Layer

Build the complete Reflect UI layer. Wire it into the existing chat interface.

## Components

- `ReflectIndicator.jsx` — compact chip (amber/green/loading)
- `ReflectPanel.jsx` — expanded 4-dimension panel with feedback footer
- `MessageBubble.jsx` — reflect state, API call, expand/dismiss
- `useChat.js` — `reflectReady` custom event after streaming (~2s delay)

## Behaviour

- Reflect never blocks chat streaming
- ~2s after response completes → `reflectReady` event
- 500ms after loading starts → `POST /api/reflect`
- Errors → green indicator silently (fallback data)
- Dismiss + feedback stored in `localStorage` per message ID
