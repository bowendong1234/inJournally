# inJournally

inJournally is a full-stack web application that combines personal journaling with Spotify listening data to help contextualise each day through music.

By automatically tracking daily listening activity, each journal entry is paired with insights like your top tracks, artists, albums, and total streams creating a richer reflection experience.

🌐 **Live App:** https://injournally.vercel.app/

---

## ✨ Features

- 🎵 Automatic daily Spotify listening metrics  
- 📊 Top song, artist, album, and total streams per day (coming soon...)
- 📝 Rich text journaling editor  
- 🔐 User authentication  
- ☁️ Persistent cloud storage  
- 📱 Responsive UI (desktop-first)

---

## 🏗 Tech Stack

### Frontend
- React (Vite)
- JSX
- Firebase (Authentication + Firestore)
- Deployed on Vercel

### Backend
- Node.js
- Express
- Spotify Web API
- Deployed on Render

---

## 🧠 How It Works

1. Users authenticate with Spotify.
2. The backend polls the Spotify Web API to fetch daily listening data.
3. Listening metrics are stored and associated with the user’s journal entry.
4. The frontend provides the user with a Notion style text editor alongside contextual listening metrics.

---

## 🚀 Local Development Setup

### 1️⃣ Clone the repository

```bash
git clone https://github.com/bowendong1234/injournally.git
cd injournally
```

---

### 2️⃣ Setup the Client

```bash
cd client
npm install
npm run dev
```

Runs on: `http://localhost:5173`

---

### 3️⃣ Setup the Server

```bash
cd server
npm install
npm run dev
```

---

## 📌 Future Improvements

- Mobile-first redesign  
- Improved Spotify data visualisation  
- Weekly/monthly listening summaries  
- Entry tagging and search  
- Dark mode  

---

## 📄 License

Personal project.