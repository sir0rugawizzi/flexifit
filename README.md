# FlexiFit 🇺🇬

**Hybrid Personal-Coaching & Local Meal-Planning Platform for Urban Professionals in Uganda**

FlexiFit solves the high-cost, rigid gym dilemma for busy adults (25–45) in Kampala who prefer home or outdoor workouts. Generic global fitness apps ignore Ugandan food (*matooke, posho, cassava, tilapia, beans, g-nuts*) and offer zero human accountability. FlexiFit pairs clients with certified local trainers, delivering personalized guidance for ~70% less than in-person gym coaching, while empowering trainers to scale from 8 to 60+ remote clients and triple their monthly income.

---

## ⚡ Quick Start (Linux Mint 22 / Ubuntu 24.04 / macOS)

FlexiFit runs end-to-end out of the box in `local` mode using SQLite with full demo seeds.

### 1. Prerequisites
- **Node.js 20+** (`node -v`)
- **Git**

```bash
# Clone or navigate to the repository
cd flexifit

# Install dependencies (root, server, and client)
npm install
cd server && npm install && cd ..
cd client && npm install && cd ..
```

### 2. Configure Environment
```bash
cp .env.example .env
```
*(Optional: add your `ANTHROPIC_API_KEY` to `.env` to test live Claude Vision analysis. If left empty, FlexiFit seamlessly uses structured prototype sample feedback so the demo never breaks!)*

### 3. Run Development Mode
```bash
npm run dev
```
- Client PWA runs on: **`http://localhost:5173`**
- Express REST API runs on: **`http://localhost:3000`**

### 4. Run Production PWA
```bash
npm run build
npm start
```
The Express server serves the optimized production PWA bundle directly on **`http://localhost:3000`**.

### 5. Run Automated Tests
```bash
npm test
```
Runs 14 unit test suites covering:
- Auth & bcrypt password hashing
- Client compliance flag evaluation rules
- Ugandan food macro scaling calculations
- Joint angle geometry & rep-counting state machines

---

## 📱 How to Share FlexiFit with Groupmates

You have three easy ways to share the app with your university groupmates and lecturers:

### 🚀 Method 1: Instant Live Share (Recommended for Classroom & Phone Testing)
Run this single command from your terminal:
```bash
npm run share
```
**What happens:**
1. Starts the FlexiFit production server.
2. Generates a secure, temporary **public HTTPS URL** (`https://*.trycloudflare.com`).
3. Displays a **QR Code directly in your terminal**.
4. **Groupmates simply scan the QR code with their phone camera** (or click the URL) to access the app immediately!
5. **Install on Phone:** Groupmates can tap **"Add to Home Screen"** (Safari on iPhone) or **"Install App"** (Chrome on Android) to install FlexiFit as a full mobile app with its app icon!
6. All demo accounts and the 1-click **5-minute pitch mode bar** are ready to use.

---

### ☁️ Method 2: Free 24/7 Cloud Deployment (Render.com)
If you want a permanent link that stays online even when your computer is off:
1. Push this project to your GitHub repository:
   ```bash
   git add .
   git commit -m "FlexiFit app with sharing configuration"
   git push origin main
   ```
2. Go to [Render.com](https://render.com) and sign up for a free account.
3. Click **New +** $\rightarrow$ **Web Service** $\rightarrow$ connect your GitHub repo.
4. Render will automatically detect the settings from `render.yaml`:
   - **Environment:** `Node`
   - **Build Command:** `cd server && npm install && cd ../client && npm install && npm run build`
   - **Start Command:** `node server/src/index.js`
5. Click **Create Web Service**. Within ~3 minutes you get a permanent URL like `https://flexifit.onrender.com` to submit to your lecturer or share on WhatsApp!

---

### 🐳 Method 3: Run with Docker (For Groupmates Running Code Locally)
Any groupmate who has Docker installed can run the complete full-stack app with zero setup:
```bash
docker compose up --build
```
Then open `http://localhost:3000` in their browser.

---

## 🔑 Demo Credentials

All seeded accounts share the password: **`password123`**  
*(Or simply click **"Demo as Trainer"** / **"Demo as Client"** on the login screen for 1-click access!)*

| Persona | Role | Email | Password | Scenario / Flag Status |
| :--- | :--- | :--- | :--- | :--- |
| **Coach Brian Mukasa** | Trainer | `brian@flexifit.ug` | `password123` | Independent certified strength coach (8+ yrs exp) |
| **Grace Akello** | Client | `akello@flexifit.ug` | `password123` | **Non-Compliant:** Missed weekly check-in (11d overdue) |
| **Denis Kigozi** | Client | `kigozi@flexifit.ug` | `password123` | **Needs Attention:** 7-day macro adherence at 45% (<70%) |
| **Faith Namubiru** | Client | `faith@flexifit.ug` | `password123` | **Needs Attention:** No workout logged in 5 days (>3d) |
| **David Ochieng** | Client | `ochieng@flexifit.ug` | `password123` | **On Track:** Borderline weigh-in (6 days ago) |
| **Ronald Tumusiime** | Client | `ronald@flexifit.ug` | `password123` | **On Track:** High consistency, muscle gain target |
| **Brenda Nalwanga** | Client | `brenda@flexifit.ug` | `password123` | **On Track:** 91% macro adherence, weight loss goal |

---

## ⏱️ The 5-Minute Pitch Walkthrough Script

Use the floating **"5-Min Pitch Mode"** bar at the top of the app to jump directly to each beat with 1 click:

### Beat 1: The Problem & Flagged Client Triage (0:00 – 1:00)
- **Presenter Action:** Click **[1. Flagged Triage]** in the pitch bar.
- **Storyline:** Show Coach Brian Mukasa's dashboard. In physical gyms, trainers lose track of clients once they leave. Here, the automated compliance queue instantly spots that **Grace Akello** missed her weekly check-in and **Denis Kigozi** had a low-macro week.
- **Highlight:** Tap the **"💬 Nudge"** button on Grace Akello's card. It generates a pre-filled, context-aware WhatsApp greeting (`wa.me`) ready to send in 1 tap, proving FlexiFit enhances the trainer's existing WhatsApp habit instead of fighting it.

### Beat 2: Ugandan High-Protein Meal Plan Builder (1:00 – 2:00)
- **Presenter Action:** Click **[2. Local Meal Plan]**.
- **Storyline:** Show how Coach Brian builds a balanced local meal plan using authentic Ugandan staples: steamed *matooke*, boiled *tilapia*, stewed *beans*, and *sukuma wiki*.
- **Highlight:** Point out the live macro balance bar updating calories, protein, carbs, and fats in real-time against client targets, proving that fitness nutrition is achievable with local food.

### Beat 3: Client Mobile PWA & Everyday Portion Logging (2:00 – 3:00)
- **Presenter Action:** Click **[3. Client Mobile PWA]**.
- **Storyline:** Switches to the mobile client view (Grace Akello). Show the **Today** schedule: daily macro progress ring, 5-day streak badge, and scheduled workout.
- **Highlight:** Open **"Log Meal"**. Show the **Area of Residence Portion Guide**: instead of demanding kitchen gram scales (which people in Kampala don't use), FlexiFit provides visual everyday estimators: *"2 fingers of matooke"*, *"1 fist of posho"*, *"1 ladle of g-nut sauce"*.
- **Call Button:** Show the **"Call Coach"** button opening Coach Brian's WhatsApp / Google Meet link.

### Beat 4: Visual AI Guidance — Live Pose & Video Form Check (3:00 – 4:00)
- **Presenter Action:** Click **[4. Live Pose & AI Form]**.
- **Mode A (Live Pose Tracking):** Demonstrates on-device angle tracking (MediaPipe). Start tracking to show real-time squat depth detection (`<90°`), joint angle HUD, rep counting, and audio/visual cues (*"Chest high"*, *"Drive knees outward"*). Emphasize that video never leaves the phone.
- **Mode B (AI Video Form Check):** Tap **"Sample Squat Clip"**. The browser extracts 5 canvas frames and submits them to Claude Vision. The screen returns structured cue cards: *What Looked Good*, *Corrections Needed*, *Coaching Cue*, and safety notes. Coach Brian can add his personal voice note/comment underneath.

### Beat 5: Business Economics & Scaling Model (4:00 – 5:00)
- **Presenter Action:** Click **[5. Trainer Economics]**.
- **Storyline:** Address the venture's financial feasibility.
  - *In-person gym model:* Capped at 8 clients @ UGX 300,000 = **UGX 2,400,000 / mo** (exhausting 1-on-1 hours, traffic jams).
  - *FlexiFit remote model:* Scalable to 60+ clients @ UGX 90,000 = **UGX 5,400,000 / mo** (2.3x more revenue while charging clients 70% less).
- **Mobile Money Simulation:** Open **"MoMo Subscription"** to trigger the authentic MTN Yellow / Airtel Red USSD popup (`*165#` / Enter PIN) followed by a simulated SMS push receipt notification.

---

## 🏛️ Oracle Autonomous Database & APEX Setup Guide

FlexiFit is engineered with a **Data Adapter Interface** (`server/src/db/adapter.js`). It runs in local SQLite mode by default, and switches to Oracle APEX / ORDS by setting `ORDS_BASE_URL` in `.env`.

### 1. Request a Free Workspace at apex.oracle.com
1. Go to [apex.oracle.com](https://apex.oracle.com/) and click **Get Started for Free** $\rightarrow$ **Request a Free Workspace**.
2. Fill out your name, email, and choose a workspace name (e.g. `flexifit_ug`).
3. Verify your email and set your password to log in.

### 2. Run the SQL Scripts in Order
In your APEX workspace, navigate to **SQL Workshop > SQL Scripts > Upload**:
1. Upload and run `db/oracle/01_schema.sql` (creates all `FLEXI_*` tables, indexes, and the `FLEXI_CLIENT_FLAGS_V` view).
2. Upload and run `db/oracle/02_seed_foods.sql` (populates the 60+ Ugandan foods).
3. Upload and run `db/oracle/03_seed_demo.sql` (populates Coach Brian Mukasa, 6 clients, and 4 weeks of history).
4. Upload and run `db/oracle/04_ords_rest.sql` (enables ORDS on your schema and deploys the `flexifit/v1` REST module with custom SQL handlers).

### 3. Retrieve Your ORDS Base URL
1. In APEX, go to **SQL Workshop > RESTful Services**.
2. Under **Modules**, click `flexifit_api` (`v1/`).
3. Copy the base URL (looks like: `https://xxxx.oraclecomputers.com/ords/<workspace>/flexifit/v1`).
4. Paste it into your project's `.env`:
   ```bash
   ORDS_BASE_URL=https://your-workspace.oraclecomputers.com/ords/your_schema/flexifit/v1
   ```
5. Restart the server (`npm start`). FlexiFit will output:
   ```
   FlexiFit server running on port 3000 [Oracle ORDS]
   ```

### 4. Oracle Troubleshooting Checklist
- **CORS Error in Browser:** ORDS REST endpoints are accessed exclusively through our Node Express backend proxy (`server/src/db/oracle.js`), preventing browser CORS blocking.
- **Storage Limits:** To stay well within free APEX workspace quotas, all video uploads remain on server disk storage (`/uploads`), with only lightweight metadata stored in Oracle.

---

## 🔒 Known Prototype Limitations

1. **Demo Authentication:** Seeded demo accounts use fixed sample credentials (`password123`) and fast 1-click login buttons for smooth classroom demonstrations.
2. **Mobile Money Simulation:** MTN MoMo and Airtel Money transactions simulate authentic USSD prompts and SMS notifications for UX validation; no real money moves.
3. **Local Video Storage:** Video clips are saved to local server disk (`/uploads`) rather than AWS S3/Cloud storage.
4. **Approximate Nutrition Data:** Macro values for local dishes (*matooke, katogo, kalo, tilapia*) are approximate reference averages from East African food composition tables, labelled in the UI as *"to be validated by a certified nutritionist"*.
