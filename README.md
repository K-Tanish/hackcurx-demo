# Sentira: The Emotional Intelligence Engine

Sentira is a sophisticated web-based emotional logging application. Designed to bridge the gap between raw human expression and data-driven self-awareness, the system utilizes a high-fidelity 8-Pillar Psychological matrix powered by Google Gemini 2.5 LLM technology to analyze, categorize, and contextually reflect user emotions.

## 🚀 Features
- **The "Zen Mode" Interface:** A minimalist, distraction-free environment that encourages self-reflection without overwhelming UI.
- **The Empathy Matrix (Powered by Gemini LLM):** A sophisticated backend utilizing an 8-Pillar Matrix (Peak Joy, Serenity, Appreciation, Overwhelmed, Hostility, Dejection, Apathy, Uncertainty) assessing text based on Arousal and Valence vectors. 
- **The Emotional Mirror System:** The UI's CSS gradient visually shifts and dynamically morphs into deep atmospheric colors perfectly reflecting the user's mood (e.g. Deep Ember for Overwhelmed, Foggy Violet for Uncertainty) to provide non-intrusive feedback.
- **SQLite Timeline Storage:** Full integration with a relational SQL persistence layer to track historical emotional flow.

## 🏗️ Architecture Stack
- **Frontend**: React, Vite, TypeScript, Tailwind/Vanilla CSS
- **Backend**: Node.js, Express, TypeScript, Sequelize ORM
- **Database**: SQLite3
- **Intelligence**: Google Generative AI (Gemini 2.5 Flash), Custom NLP Heuristics (Fallback Engine)

## 📦 Local Installation

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- Follow the steps sequentially to run both applications.

### 2. Configure the Backend (The Core)
Navigate to the server directory and set up the Intelligence API:

```bash
cd server
npm install
```

Create a `.env` file inside the `server/` directory and add your Google Gemini API Key:
```env
GEMINI_API_KEY=your_google_studio_api_key_here
```

Start the backend API layer:
```bash
npx tsx watch src/index.ts
```
*The database table will automatically deploy on the first boot on \`http://localhost:3001\`*

### 3. Configure the Frontend (The Mirror)
Open an entirely new terminal window, navigate to the client application, and start the GUI:

```bash
cd client-app
npm install
npm run dev
```
*The React UI will safely boot to \`http://localhost:5173\`*

---
**Disclaimer**: This project was rapidly architected during a Hackathon and serves as a foundational prototype for AI-driven qualitative UX modeling.
