# Sentira

Sentira is a web-based application for logging emotions and viewing them later. It analyzes user input and stores entries for review.

## Features
- Simple interface with a focus on quiet reflection.
- Text analysis for emotional classification.
- Visual feedback that changes with mood.
- Local storage of entries with SQLite.

## Architecture
- Frontend: React, Vite, TypeScript, CSS
- Backend: Node.js, Express, TypeScript
- Database: SQLite3

## Local Installation

### Prerequisites
- [Node.js](https://nodejs.org/) version 18 or higher

### Backend setup
1. Open a terminal and go to the `server` folder.
2. Run:
```bash
cd server
npm install
```
3. Create a `.env` file in the `server` folder and add the API key:
```env
GEMINI_API_KEY=your_google_studio_api_key_here
```
4. Start the backend:
```bash
npx tsx watch src/index.ts
```
The backend runs on `http://localhost:3001`.

### Frontend setup
1. Open a new terminal and go to the `client-app` folder.
2. Run:
```bash
cd client-app
npm install
npm run dev
```
The frontend runs on `http://localhost:5173`.

## Note
This project was created quickly for a hackathon and is a working prototype.
