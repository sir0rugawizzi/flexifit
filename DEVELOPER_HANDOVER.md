# FlexiFit Developer Handover Guide 🛠️

This guide provides the necessary technical context to maintain, deploy, and extend the FlexiFit platform.

## 🚀 Quick Start & Deployment

### Local Development
1. **Dependencies**:
   ```bash
   npm install
   cd client && npm install
   ```
2. **Environment**: Copy `.env.example` to `.env` and fill in your secrets.
3. **Launch**:
   ```bash
   npm run start
   ```

### Render.com Deployment
- **Runtime**: Node.js
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Essential Env Vars**: `JWT_SECRET`, `GEMINI_API_KEY`, `SEED_PASSWORD`, `PORT`.

## 🏗 Architecture Overview

### The Data Adapter Pattern
FlexiFit uses a flexible database layer located in `server/src/db/`. 
- **LocalAdapter**: Uses SQLite for rapid local development and pilot phase.
- **OracleAdapter**: Designed to connect via ORDS REST API for enterprise-grade scaling.
- **Switching**: The system is designed to swap adapters via config without changing business logic in the routes.

### Authentication Flow
1. **Registration**: Clients $\rightarrow$ Invite Code $\rightarrow$ Trainer ID $\rightarrow$ DB.
2. **Session**: JWTs are issued upon login and stored in the client's `AuthContext`.
3. **Authorization**: The `requireAuth` middleware protects routes and validates user roles (Trainer vs Client).

### AI Vision Pipeline
The "Form Check" feature follows this flow:
1. **Frame Extraction**: The client app extracts key frames from a workout video.
2. **API Call**: Frames are sent to `server/src/services/geminiAi.js`.
3. **Multimodal Analysis**: Google Gemini 1.5 Flash analyzes the pose against biomechanical standards.
4. **Structured Feedback**: The server parses the JSON response and delivers specific correction tips to the user.

## 🛠 Maintenance Tasks

### Adding Local Foods
To add new Ugandan staples to the database:
- **UI**: Use the "Food Database" tab in the Trainer Portal.
- **Direct DB**: Insert into the `foods` table in `flexifit.sqlite` ensuring `country_code = 'UG'`.

### Resetting User Passwords
Since there is no "Forgot Password" email flow in the pilot:
- Trainers must manually update a client's password in the database or guide them through a secure reset if the trainer has administrative DB access.

---
*Last Updated: 2026-10-30*
