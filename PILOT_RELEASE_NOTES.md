# FlexiFit Pilot Release Notes 🚀

This document outlines the transition of FlexiFit from a class prototype into a pilot-ready product for urban professionals in Uganda.

## 🛠 Core Technical Transitions

### 1. From Demo to Production Logic
- **Authentication**: Removed "demo login" buttons. Implemented a full JWT-based authentication system with `bcrypt` password hashing.
- **Onboarding**: Replaced open registration with a **Trainer Invite Code** system. Clients must now be linked to a valid trainer to create an account.
- **Payment Flow**: Replaced simulated payments with a **Manual Verification Loop**. 
  - *Client*: Requests payment confirmation via the app.
  - *Trainer*: Verifies the MoMo/Bank transfer and confirms the subscription in the Trainer Portal.

### 2. AI & ML Integration
- **AI Vision Engine**: Switched the form-check backend from Claude to **Google Gemini 1.5 Flash**. This enables faster, multimodal analysis of exercise frames with structured JSON output.
- **On-Device ML**: Maintained MediaPipe Tasks Vision for real-time, privacy-first pose tracking and rep counting directly in the browser.

### 3. Cloud Readiness & Deployment
- **Infrastructure**: Configured for deployment as a single Node.js web service on **Render.com**.
- **Networking**: Updated server to bind to `0.0.0.0` and utilize `process.env.PORT`.
- **Reliability**: Added a `/healthz` endpoint for automated deployment health checks.

## ✨ New Feature Additions

### Trainer Portal Enhancements
- **Payment Management**: A new "Payment Confirmations" tab for trainers to manage and approve client subscriptions.
- **Business Scaling View**: Interactive ROI calculator demonstrating the transition from 1-on-1 gym training to asynchronous remote coaching.
- **Local Food Manager**: Ability for trainers to add custom Ugandan food items to the nutritional database.

### Client App Enhancements
- **Registration UI**: Integrated invite code input and role selection.
- **Account Security**: New "Settings" page allowing users to securely change their passwords.
- **Support Content**: Added a comprehensive **FAQ Page** and a **Privacy Policy** (detailing on-device ML privacy).
- **Feedback Loop**: Added a **Feedback Form** for pilot users to report experience and suggest improvements.

## 🔒 Security & Privacy
- **Role-Based Access Control (RBAC)**: Strict separation between Trainer and Client API routes.
- **Data Privacy**: Live pose tracking data remains on-device; only explicitly uploaded frames for AI analysis are processed via API.
- **Password Safety**: Implemented industry-standard salt/hash patterns for user credentials.

---
*Date: 2026-10-30*
*Version: 1.0.0-pilot*
