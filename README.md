# 🧠 CreatorBrainOG

CreatorBrain is a high-performance AI content strategist for Instagram creators. It analyzes profile patterns, interaction metrics, and content themes to generate personalized growth blueprints.

## 🚀 One-Step Setup

1.  **Configure Environment**:
    Create a `types/.env.local` file and add your keys:
    ```bash
    GEMINI_API_KEY=your_google_gemini_key
    APIFY_TOKEN=your_apify_api_token
    ```

2.  **Run Application**:
    ```bash
    npm install
    npm run dev
    ```

That's it! The application now runs on a single unified server.

## 🛠️ Tech Stack
- **Frontend**: Next.js 14, TailwindCSS, Framer Motion
- **Scraping**: Pure `fetch` (Zero-dependency Apify API)
- **AI Engine**: Google Gemini 1.5 Flash (Free Tier)
- **State Management**: Zustand

## 📝 Key Features
- **Creator DNA**: Deep semantic analysis of visual and textual patterns.
- **Interaction Markers**: Real-time engagement calculation (Likes/Comments/Views).
- **Growth Blueprint**: personalized content suggestions based on high-performing trends.
- **Verification**: Built-in "Debug Data" section to verify data integrity.

## ⚖️ Legal & Security
- **No Login Required**: We do not store or ask for your Instagram credentials.
- **Privacy First**: Uses professional scraping infrastructure (Apify) for safe and legal data extraction.
