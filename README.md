# VoteGyaan 🇮🇳

VoteGyaan is an intelligent, friendly, and non-partisan AI assistant that educates Indian citizens about the Indian election process. It features a full-stack React + Node.js application powered by Google's Gemini AI.

## 🌐 Live Demo

| Service | URL |
|---|---|
| **Frontend (App)** | https://votegyaan-frontend-938236899164.us-central1.run.app |
| **Backend API** | https://votegyaan-backend-938236899164.us-central1.run.app |

---

## Architecture

- **Frontend**: React + Vite + Vanilla CSS (Premium Glassmorphism Design)
- **Backend**: Node.js + Express
- **AI**: `@google/generative-ai` (Gemini API)
- **Deployment**: GCP Cloud Run (Containerized Frontend and Backend)
- **Container Registry**: Google Artifact Registry (`us-central1`)

## Modules

1. **Interactive Election Journey Map**: Step-by-step visual of the process.
2. **Smart Q&A Assistant**: AI chatbot strictly grounded in Indian election facts.
3. **Election Timeline**: Gantt-style chart for key milestones.
4. **Glossary**: Searchable list of Indian election terms.
5. **Interactive Quiz**: Civic knowledge test.

---

## Local Development

### Prerequisites
- Node.js **v20+** (required by Vite 8)
- A valid `GEMINI_API_KEY`

### 1. Start Backend

```bash
cd backend
npm install
# Create a .env file and add your GEMINI_API_KEY
echo "GEMINI_API_KEY=your_actual_key_here" > .env
npm start
```
*Runs on http://localhost:8080*

### 2. Start Frontend

```bash
cd frontend
npm install
npm run dev
```
*Runs on http://localhost:5173*

---

## GCP Deployment Guide

This project is deployed as **two separate Cloud Run services** under GCP project `votegyaan` (Project Number: `938236899164`).

### Prerequisites

1. Install Google Cloud SDK (`gcloud`).
2. Login and set your project:
```bash
gcloud auth login
gcloud config set project votegyaan
```
3. Enable necessary APIs:
```bash
gcloud services enable run.googleapis.com artifactregistry.googleapis.com cloudbuild.googleapis.com
```

### 1. Deploy the Backend (Express + Gemini API)

```bash
gcloud run deploy votegyaan-backend \
  --source ./backend \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars GEMINI_API_KEY=your_gemini_api_key_here
```
*(Replace `your_gemini_api_key_here` with your actual Gemini API key)*

Take note of the **Backend Service URL** provided after deployment.

### 2. Deploy the Frontend (React + Nginx)

1. Update the API endpoint in:
   - `frontend/src/components/ChatAssistant.jsx`
   - `frontend/src/components/Quiz.jsx`

   Replace `http://localhost:8080` with your **Backend Service URL**.

2. Deploy to Cloud Run from source:
```bash
gcloud run deploy votegyaan-frontend \
  --source ./frontend \
  --region us-central1 \
  --allow-unauthenticated \
  --port 8080
```

> **Note**: The `frontend/Dockerfile` uses `node:20-alpine` (required by Vite 8) and serves via Nginx on port `8080` (required by Cloud Run).

**Congratulations!** 🎉 Your VoteGyaan app is now live on Google Cloud Run.

---

## Repository

GitHub: https://github.com/aporiya/votegyaan
