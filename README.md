# VoteGyaan 🇮🇳

VoteGyaan is an intelligent, friendly, and non-partisan AI assistant that educates Indian citizens about the Indian election process. It features a full-stack React 19 + Node.js application powered by Google's Gemini AI.

## Architecture

- **Frontend**: React 19 + Vite + Vanilla CSS (Premium Glassmorphism Design)
- **Backend**: Node.js + Express
- **AI**: `@google/generative-ai` (Gemini API)
- **Deployment**: GCP Cloud Run (Containerized Frontend and Backend)

## Modules

1. **Interactive Election Journey Map**: Step-by-step visual of the process.
2. **Smart Q&A Assistant**: AI chatbot strictly grounded in Indian election facts.
3. **Election Timeline**: Gantt-style chart for key milestones.
4. **Glossary**: Searchable list of Indian election terms.
5. **Interactive Quiz**: Civic knowledge test.

---

## Local Development

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

This project is configured to be deployed as **two separate Cloud Run services** to your GCP project `votegyaan`.

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

1. Make sure you are in the `backend` directory:
```bash
cd backend
```
2. Deploy directly to Cloud Run from source:
```bash
gcloud run deploy votegyaan-backend \
  --source . \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars GEMINI_API_KEY=your_gemini_api_key_here
```
*(Replace `your_gemini_api_key_here` with your actual Gemini API key)*

3. **Take note of the Backend Service URL** provided after deployment.

### 2. Deploy the Frontend (React 19 + Nginx)

1. Update the frontend API endpoint:
   - In `frontend/src/components/ChatAssistant.jsx` and `frontend/src/components/Quiz.jsx`, replace `http://localhost:8080` with your new **Backend Service URL**.
2. Navigate to the `frontend` directory:
```bash
cd ../frontend
```
3. Deploy to Cloud Run from source:
```bash
gcloud run deploy votegyaan-frontend \
  --source . \
  --region us-central1 \
  --allow-unauthenticated
```

**Congratulations!** 🎉 Your VoteGyaan app is now live on Google Cloud Run.
