
# TubeMaster AI Suite

A commercial-grade AI toolkit for YouTube creators. This suite leverages **Google Gemini 2.5 Flash** and **Imagen 3/4** to provide data-driven insights, content generation, and psychological optimization for video production.

## ⚡ Features

### 1. 🕵️ Competitor Spy
Ethically analyze competitor channels using **AI Grounding (Web Search)**.
- Extracts "Content Gaps" (topics competitors are missing).
- Analyzes audience sentiment and channel weaknesses.
- Generates actionable "Attack Plans" to outperform rivals.

### 2. 🔑 Keyword Deep Explorer
Goes beyond simple search volume. Uses a **10-Point Logic System** to score keywords based on:
- Difficulty vs. Opportunity
- User Intent (Educational, Commercial, etc.)
- Trend Trajectory (Rising/Falling)
- Click-Through Rate (CTR) Potential

### 3. ✍️ Retention Script Writer
Generates scripts engineered for **Watch Time**.
- Automatically structures scripts with Hooks, Stakes, and Payoffs.
- Inserts "Pattern Interrupts" and Visual Cues for editors.
- Uses psychological triggers to reduce viewer drop-off.

### 4. 🎨 4K Thumbnail Generator
Creates high-CTR thumbnails using **Imagen 4.0**.
- **Auto-Prompt Optimization**: The AI rewrites your simple prompt into a professional photography prompt (lighting, composition, mood).
- Supports styles like Hyper-Realistic, 3D Render, Anime, and Cinematic.

### 5. 🆚 Thumbnail A/B Comparator
Simulates human eye-tracking and psychological response.
- Upload two thumbnails (A and B).
- The AI scores them on 10 criteria (Contrast, Curiosity Gap, Text Readability).
- Predicts a winner before you publish.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite, TypeScript
- **Styling**: Tailwind CSS
- **AI Integration**: Google GenAI SDK (Gemini 2.5 Flash, Imagen)
- **Routing**: React Router v7

---

## 🚀 Deployment

### Deploy to Vercel (Recommended)

1.  **Push to GitHub**: Upload this code to a GitHub repository.
2.  **Import to Vercel**:
    *   Go to [Vercel Dashboard](https://vercel.com).
    *   Click **Add New Project** and select your repo.
3.  **Environment Variables**:
    *   Go to **Settings > Environment Variables**.
    *   Add `VITE_GROQ_API_KEY` with your Groq API Key.
    *   Add `VITE_OPENROUTER_API_KEY` with your OpenRouter API Key.
    *   (Optional) Add `VITE_GEMINI_API_KEY` if using Gemini features specifically.
4.  **Deploy**: Vercel will automatically build and deploy the suite.

### Run Locally

1.  Install dependencies:
    ```bash
    npm install
    ```
2.  Create a `.env` file in the root:
    ```env
    VITE_GROQ_API_KEY=your_groq_key_here
    VITE_OPENROUTER_API_KEY=your_openrouter_key_here
    ```
3.  Start the dev server:
    ```bash
    npm run dev
    ```

---

## 📄 License

This project is designed for commercial use by creators.
