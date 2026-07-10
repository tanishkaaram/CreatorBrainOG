<div align="center">
  <img src="https://via.placeholder.com/150" alt="CreatorBrain Logo" width="120" height="120">
  <h1>🧠 CreatorBrainOG</h1>
  <p>A high-performance AI content strategist for Instagram creators. Analyze profile patterns, interaction metrics, and content themes to generate personalized growth blueprints.</p>
  
  <p>
    <img alt="Next.js" src="https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js">
    <img alt="Tailwind CSS" src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white">
    <img alt="Framer Motion" src="https://img.shields.io/badge/Framer_Motion-0055FF?style=for-the-badge&logo=framer&logoColor=white">
    <img alt="Supabase" src="https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white">
  </p>
</div>

<br/>

## 📸 Screenshots & Walkthrough

Here is a quick look at how **CreatorBrain** works, from logging in to generating deep insights:

### 1. Welcome & Login
*The entry point for creators.*
<p align="center">
  <img src="./public/screenshots/1-login.png" alt="Login Page Placeholder" width="800">
</p>

### 2. Analysis Dashboard
*Real-time metrics, engagement calculations, and core data visualizations.*
<p align="center">
  <img src="./public/screenshots/2-dashboard.png" alt="Dashboard Placeholder" width="800">
</p>

### 3. Key Points & Growth Blueprint
*The AI-powered strategy, featuring semantic analysis and personalized suggestions.*
<p align="center">
  <img src="./public/screenshots/3-keypoints.png" alt="Keypoints Placeholder" width="800">
</p>

---

## 📝 Key Features

- 🧬 **Creator DNA**: Deep semantic analysis of visual and textual patterns.
- 📈 **Interaction Markers**: Real-time engagement calculation (Likes, Comments, Views).
- 🗺️ **Growth Blueprint**: Personalized content suggestions based on high-performing trends.
- 🔒 **No Login Required for Analysis**: We do not store or ask for your Instagram credentials; we use professional scraping infrastructure (Apify) for safe and legal data extraction.

## 🛠️ Tech Stack

- **Frontend**: [Next.js 14](https://nextjs.org/), [TailwindCSS](https://tailwindcss.com/), [Framer Motion](https://www.framer.com/motion/)
- **Backend & Auth**: [Supabase](https://supabase.com/), [NextAuth](https://next-auth.js.org/)
- **Scraping**: Pure `fetch` with Apify API
- **AI Engine**: Google Gemini 1.5 Flash
- **State Management**: Zustand

## 🚀 Setup & Installation

### 1. Clone the repository
```bash
git clone https://github.com/tanishkaaram/CreatorBrainOG.git
cd CreatorBrainOG
```

### 2. Secure Environment Setup 🔒

> **Note on Security:** Your `.gitignore` file is already correctly set up to ignore `.env` and `.env.local` files! This means your secrets will **never** be accidentally pushed to GitHub.

Copy the provided example environment file to create your local environment config:

```bash
cp .env.example .env.local
```

Next, open `.env.local` and add your API keys:
- **Supabase**: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **NextAuth**: `NEXTAUTH_SECRET` (generate with `openssl rand -base64 32`)
- **Gemini AI**: `GEMINI_API_KEY`
- **Apify**: `APIFY_TOKEN`

### 3. Install Dependencies & Run

```bash
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 🤝 Contributing

Contributions are always welcome! Feel free to open an issue or submit a Pull Request.

## ⚖️ Copyright & Usage Restriction

© 2026 Tanishka R (ReWearReality). All Rights Reserved.

This repository and its source code are provided for portfolio evaluation and recruiter review ONLY.

You are strictly prohibited from copying, cloning, modifying, distributing, or hosting this application (in whole or in part) for personal, educational, or commercial use without explicit written permission from the author.

---
<div align="center">
  <p>© 2026 Tanishka R. All Rights Reserved.</p>
</div>
