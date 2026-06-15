# Job Alert Agent (Telegram Edition)

This is a Node.js-based Job Search & Notification Agent that automatically scans major job boards (LinkedIn, Naukri, Indeed) for Node.js developer roles in specific Indian cities (Delhi NCR, Noida, Gurugram, Faridabad, Lucknow), grades them using Gemini AI, and alerts you via Telegram.

The agent is designed to run completely **for free** on a schedule.

---

## 🏗️ Architecture & Search Strategy

The agent dynamically selects the search mechanism depending on what keys you configure in your `.env` file:

1. **Option A: Google Custom Search Engine (CSE) (Free 100 searches/day)**:
   * Uses Google Search API natively. 100 free requests per day is more than enough for 24 hourly scans.
2. **Option B: SerpAPI (Free 100 searches/month)**:
   * Useful if you have a key, but runs out of credits quickly on an hourly schedule.
3. **Option C: DuckDuckGo Scraper (100% Free & Unlimited)**:
   * Falls back automatically to scraping DuckDuckGo's static HTML if no search keys are defined.

---

## 📂 Project Structure

```text
job-agent/
├── src/
│   ├── app.js               # Entry point
│   ├── agent/
│   │   └── runAgent.js      # Main job search & notification logic
│   ├── config/
│   │   └── constants.js     # Target job sites and locations (Delhi NCR, Noida, etc.)
│   ├── cron/
│   │   └── searchJobs.js    # Schedule configuration (node-cron hourly trigger)
│   ├── services/
│   │   ├── gemini.service.js   # Gemini 3.5 relevance evaluator
│   │   ├── serpapi.service.js  # Search handler (Google CSE / SerpAPI / DuckDuckGo)
│   │   └── telegram.service.js # Telegram notifier
│   └── storage/
│       ├── jobs.js          # File storage read/write helper
│       └── jobs.json        # Duplicate prevention database (local JSON)
├── .env                     # Your private keys
├── package.json             # Dependencies
└── README.md                # Project documentation
```

---

## 🚀 Setup Steps

### Step 1: Create a Telegram Bot
1. Search for `@BotFather` on Telegram.
2. Send `/newbot` and follow the instructions to get your **Bot Token**.
3. Open your newly created bot and click **Start**. Send any message to it (e.g. `hello`).
4. Find your **Chat ID** by visiting:
   `https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates`
5. Copy the ID value under `"chat": { "id": 123456789 }`.

### Step 2: Get a Gemini API Key
1. Go to [Google AI Studio](https://aistudio.google.com/).
2. Click **Get API key** and click **Create API key** (fully free).

### Step 3: Get a Google Custom Search Engine (CSE) Key (Optional)
If you want to use native Google search for free:
1. Create a project in [Google Cloud Console](https://console.cloud.google.com/), enable the **Custom Search API**, and generate an API key (`GOOGLE_API_KEY`).
2. Go to the [Programmable Search Engine Console](https://programmablesearchengine.google.com/) and create a search engine.
3. Add `www.google.com/` as the site to search, and toggle **"Search the entire web"** to **ON**.
4. Copy the **Search engine ID** (`GOOGLE_CX`).

---

## ⚙️ Configuration

Create a `.env` file in the root folder (or fill the template):

```env
# Telegram Bot Configuration
BOT_TOKEN=your_telegram_bot_token
CHAT_ID=your_telegram_chat_id

# Google Gemini API Key
GEMINI_API_KEY=your_gemini_api_key

# Google Custom Search API (Optional)
GOOGLE_API_KEY=your_google_api_key
GOOGLE_CX=your_search_engine_id

# SerpAPI Key (Optional fallback)
SERP_API_KEY=
```

---

## 🏃 Running the Application

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Locally (Testing)
To run the search and notification routine immediately:
```bash
npm start
```

### 3. Run Permanently in Background (Production)
To run the scheduler in the background 24/7 on your local PC or a VPS, use **PM2**:

```bash
# Install PM2 globally
sudo npm install -g pm2

# Start the application
pm2 start src/app.js --name job-agent

# Persist and enable startup run
pm2 save
pm2 startup
```
