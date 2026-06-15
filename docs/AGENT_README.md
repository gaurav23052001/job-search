# Node.js Job Alert Agent (Telegram Edition)

## Overview

This project automatically searches for the latest **Node.js Developer jobs** from multiple job portals and sends notifications to Telegram.

The agent runs on a schedule using cron jobs and avoids sending duplicate job alerts.

---

# Architecture

```text
node-cron
    ↓
Google Search API (SerpAPI)
    ↓
LinkedIn
Naukri
Indeed
Wellfound
Cutshort
Instahyre
    ↓
Gemini AI (Free Tier)
    ↓
MongoDB (Duplicate Prevention)
    ↓
Telegram Bot Notification
```

---

# Features

* Search jobs every hour automatically.
* Search across multiple job platforms.
* Filter jobs based on skills and experience.
* Rank jobs using Gemini AI.
* Prevent duplicate notifications.
* Send alerts directly to Telegram.
* Easy to deploy on VPS or cloud platforms.

---

# Prerequisites

* Node.js (v18+ recommended)
* Telegram Account
* Google Account (for Gemini API)
* MongoDB Atlas Account
* SerpAPI Account

---

# Project Setup

## Step 1: Create Telegram Bot

1. Open Telegram.
2. Search for `@BotFather`.
3. Send:

```text
/newbot
```

4. Enter bot name.
5. Enter username.
6. Save the generated Bot Token.

---

## Step 2: Get Telegram Chat ID

1. Open your bot.
2. Click **Start**.
3. Send:

```text
hello
```

4. Open:

```text
https://api.telegram.org/bot<YOUR_TOKEN>/getUpdates
```

5. Copy:

```json
chat.id
```

Example:

```json
"chat": {
    "id": 1836891601
}
```

---

## Step 3: Create Gemini API Key

1. Visit:

```text
https://aistudio.google.com/
```

2. Create API Key.
3. Save the key.

---

## Step 4: Create SerpAPI Account

1. Visit:

```text
https://serpapi.com/
```

2. Create account.
3. Generate API Key.

---

## Step 5: Create MongoDB Atlas Database

1. Visit:

```text
https://www.mongodb.com/cloud/atlas
```

2. Create free cluster.
3. Create database user.
4. Copy connection string.

Example:

```text
mongodb+srv://username:password@cluster.mongodb.net/job-agent
```

---

# Installation

Initialize project:

```bash
npm init -y
```

Install dependencies:

```bash
npm install axios node-cron mongoose dotenv @google/generative-ai
```

---

# Folder Structure

```text
job-agent/
│
├── index.js
├── telegram.js
├── jobService.js
├── geminiService.js
├── db.js
├── models/
│   └── Job.js
│
├── .env
├── package.json
└── README.md
```

---

# Environment Variables

Create `.env`

```env
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=

SERP_API_KEY=

GEMINI_API_KEY=

MONGODB_URI=
```

---

# Job Search Process

Every hour:

```text
Cron Trigger
      ↓
Search jobs using SerpAPI
      ↓
Extract job details
      ↓
Gemini evaluates relevance
      ↓
Check MongoDB for duplicates
      ↓
Send Telegram notification
      ↓
Save Job ID
```

---

# Search Queries

The agent searches using queries like:

```text
site:linkedin.com/jobs "Node.js Developer" India

site:naukri.com "Node.js Developer"

site:indeed.com "Node.js Developer"

site:wellfound.com/jobs "Node.js"

site:cutshort.io/jobs "Node.js"

site:instahyre.com/jobs "Node.js"
```

---

# Gemini Filtering Criteria

Role:

```text
Backend Node.js Developer
```

Experience:

```text
3–5 Years
```

Skills:

```text
Node.js
NestJS
TypeScript
PostgreSQL
MongoDB
Redis
Socket.IO
OpenAI API
Stripe
Microservices
```

Gemini returns:

```json
{
    "matchScore": 92,
    "reason": "Strong match with NestJS and PostgreSQL experience."
}
```

---

# Telegram Notification Format

Example:

```text
🔔 NEW JOB ALERT

💼 Senior Node.js Developer

🏢 Company: XYZ Pvt Ltd

📍 Location: Remote

🎯 Match Score: 92%

🔗 Apply:
https://company.com/job

━━━━━━━━━━━━━
```

---

# Duplicate Prevention

Each job is stored in MongoDB:

```json
{
    "jobId": "company-title",
    "createdAt": "2026-06-15"
}
```

Before sending a notification:

```text
Exists in DB?
      ↓
YES → Ignore
NO  → Notify + Save
```

---

# Running Locally

Start the application:

```bash
node index.js
```

---

# Running with PM2

Install PM2:

```bash
npm install -g pm2
```

Start:

```bash
pm2 start index.js --name job-agent
```

Save:

```bash
pm2 save
```

Enable startup:

```bash
pm2 startup
```

---

# Future Enhancements

* Auto-apply using Easy Apply.
* Email notifications.
* WhatsApp notifications.
* Resume matching.
* Cover letter generation.
* Web dashboard.
* Multi-user support.

---

# Author

Gaurav Mishra

Backend Engineer

Tech Stack:

* Node.js
* Express.js
* MongoDB
* PostgreSQL
* Redis
* Socket.IO
* OpenAI
* Microservices
* NestJS
