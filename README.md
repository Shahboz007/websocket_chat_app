# WebSocket Chat App

A real-time chat application for users and call center agents, built with Node.js, Express, Sequelize, PostgreSQL, and WebSocket. The app features modern UI/UX for both users and call center agents, JWT authentication, and persistent chat history.

## Features

- **Real-time chat** between users and call center agents using WebSocket.
- **JWT authentication** for both users and agents.
- **Modern, responsive UI** for all roles (login, registration, chat, dashboard).
- **Persistent chat history** (old messages are shown on refresh).
- **Role-based access** (user/callcenter).
- **Logout and session management**.
- **Beautiful chat bubbles** with avatars, sender labels, and timestamps.

## Screenshots

> _Add screenshots of the user chat and call center dashboard here for best effect!_

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/websocket_chat_app.git
cd websocket_chat_app
```

### 2. Install dependencies

```bash
yarn install
# or
npm install
```

### 3. Configure environment variables

Copy `.env-example` to `.env` and fill in your values:

```env
PORT=3000
DATABASE_URL="postgresql://chat_app_user:123456@localhost:5432/chat_app_db"
JWT_SECRET=your-secret-key
```

### 4. Set up the database

- Make sure PostgreSQL is running and the database in `DATABASE_URL` exists.
- The app will auto-create tables on first run.

### 5. Start the server

```bash
yarn start
# or
npm start
```

The app will be running at [http://localhost:3000](http://localhost:3000).

## Usage

- **User**: Register/login as a user, start a chat, and message with support.
- **Call Center Agent**: Register/login as an agent, see active chats, join any chat, and respond to users.
- **Both**: Enjoy a modern, mobile-friendly interface with real-time updates.

## Project Structure

```
websocket_chat_app/
├── server.js
├── src/
│   ├── app.js
│   ├── config/
│   ├── controllers/
│   ├── models/
│   ├── public/
│   ├── routes/
│   ├── services/
│   └── views/
├── package.json
└── .env-example
```

## Tech Stack

- **Backend**: Node.js, Express, WebSocket (`ws`), Sequelize, PostgreSQL
- **Frontend**: EJS, Bootstrap 5, Vanilla JS
- **Auth**: JWT

## Environment Variables

See `.env-example` for all required variables:

- `PORT` - Port to run the server
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret for JWT signing

## License

ISC 