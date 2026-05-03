import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 8080;

// Initialize Gemini API
// It uses the GEMINI_API_KEY from the environment
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "dummy_key");

const systemPrompt = `
You are VoteGyaan — an intelligent, friendly, and strictly non-partisan AI assistant that educates Indian citizens about the Indian election process. 

Your job is to power the Smart Q&A module of the VoteGyaan app.
You support English and Hinglish responses.

CORE KNOWLEDGE — INDIA ELECTION FACTS
BODIES & INSTITUTIONS:
- Election Commission of India (ECI) — Constitutional body (Art. 324)
- Established: January 25, 1950 (National Voters Day)
- Voter Helpline: 1950
- Official portal: voters.eci.gov.in

ELECTION TYPES IN INDIA:
- Lok Sabha (General Election) — every 5 years, 543 seats
- Rajya Sabha — biennial, 245 seats (Upper House)
- Vidhan Sabha (State Assembly) — 28 states + 3 UTs
- Local Body elections — Municipal, Panchayat
- Presidential & Vice-Presidential elections
- By-elections (Upchunav)

KEY NUMBERS:
- Voting age: 18 years
- Lok Sabha seats: 543
- Majority needed: 272 seats
- Rajya Sabha seats: 245
- Age to contest Lok Sabha: 25 years
- Age to contest Rajya Sabha: 30 years
- Security deposit Lok Sabha: ₹25,000 (₹12,500 for SC/ST)

RESPONSE RULES:
1. ALWAYS be non-partisan — never mention or favor any party or leader
2. Use simple language — imagine explaining to a first-time voter
3. For Hinglish queries, respond in Hinglish
4. Always cite ECI as the official source
5. Keep answers concise (3-5 lines) unless deep explanation is asked
6. End Q&A answers with: "Aur kuch jaanna chahte ho? 🗳️"
7. NEVER make up election dates — say "Check eci.gov.in for current dates"
8. NEVER comment on specific candidates, parties, or ongoing elections
9. If asked for opinion: "Main sirf process batata hoon, politics nahi! 😊"

GREETING:
"Jai Hind! 🇮🇳 Main hoon VoteGyaan — aapka chunav shiksha saathi!

Aap kya jaanna chahte hain?
1️⃣ Voter ID kaise banaye?
2️⃣ EVM aur VVPAT kya hai?
3️⃣ Polling Day pe kya karna hai?
4️⃣ Matganana (vote counting) kaise hoti hai?
5️⃣ Apne adhikar jaano (Know Your Rights)

Kuch bhi puchho — English ya Hinglish mein! 🗳️"
`;

// Quiz Data
const quizQuestions = [
  {
    "question": "What is the minimum voting age in India?",
    "options": ["16 years", "18 years", "21 years", "25 years"],
    "correct": "18 years",
    "explanation": "The voting age in India is 18 years, lowered from 21 years in 1989 by the 61st Amendment."
  },
  {
    "question": "How many seats are there in the Lok Sabha?",
    "options": ["500", "543", "550", "245"],
    "correct": "543",
    "explanation": "The Lok Sabha has 543 elected members representing various constituencies across India."
  },
  {
    "question": "In which year was NOTA (None of the Above) introduced in Indian elections?",
    "options": ["2001", "2010", "2013", "2019"],
    "correct": "2013",
    "explanation": "NOTA was introduced in 2013 following a Supreme Court directive, allowing voters to reject all candidates."
  },
  {
    "question": "When was the Election Commission of India established?",
    "options": ["1947", "1950", "1952", "1960"],
    "correct": "1950",
    "explanation": "The ECI was established on January 25, 1950. This day is now celebrated as National Voters' Day."
  },
  {
    "question": "What is the minimum age to contest Lok Sabha elections?",
    "options": ["18 years", "21 years", "25 years", "30 years"],
    "correct": "25 years",
    "explanation": "To become a Member of Parliament in the Lok Sabha, a candidate must be at least 25 years old."
  }
];

// In-memory simple chat history for demonstration
// In production, use a database or session store
const chatHistories = {};

app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

app.post('/api/chat', async (req, res) => {
  try {
    const { message, sessionId = 'default' } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    console.log(`[${new Date().toISOString()}] Chat request - Session: ${sessionId}, Message: ${message.substring(0, 50)}...`);

    // Check if the user hasn't set a real API key yet
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === "dummy_key") {
      console.warn("Using dummy API key. Returning mocked response.");
      // Small artificial delay to simulate API
      await new Promise(resolve => setTimeout(resolve, 1000));
      return res.json({
        response: "Hi there! I am Chunav Saathi. You haven't configured a real Google Gemini API key yet, so I'm running in offline/demo mode. Once you add your key to the backend `.env` file, I'll be able to answer your questions about the Indian elections!"
      });
    }

    console.log(`[${new Date().toISOString()}] Initializing Gemini model...`);
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      systemInstruction: systemPrompt,
    });

    if (!chatHistories[sessionId]) {
      chatHistories[sessionId] = [];
    }

    const chat = model.startChat({
      history: chatHistories[sessionId],
    });

    console.log(`[${new Date().toISOString()}] Sending message to Gemini...`);
    const result = await chat.sendMessage(message);
    const response = result.response.text();

    console.log(`[${new Date().toISOString()}] Got response from Gemini: ${response.substring(0, 50)}...`);

    // Update history manually if needed, but startChat manages it per instance. 
    // We update our stored history for future requests
    chatHistories[sessionId].push({ role: "user", parts: [{ text: message }] });
    chatHistories[sessionId].push({ role: "model", parts: [{ text: response }] });

    res.json({ response });
  } catch (error) {
    console.error("Error in chat API:", error);
    console.error("Error details:", JSON.stringify(error, null, 2));
    
    // Handle various error types
    if (error.status === 429 || error.code === 429) {
      return res.status(200).json({
        response: "Mujhe lagta hai abhi bahut saare log ek saath pooch rahe hain! 😅 Gemini API ka free quota thoda busy hai. Thodi der baad dobara try karein. (The AI is currently rate-limited. Please try again in a few minutes.) 🙏"
      });
    }
    
    if (error.status === 401 || error.code === 401) {
      return res.status(500).json({ 
        error: "API authentication failed. Please check GEMINI_API_KEY.",
        details: error.message 
      });
    }
    
    if (error.status === 400 || error.code === 400) {
      return res.status(500).json({ 
        error: "Invalid request to Gemini API.",
        details: error.message 
      });
    }
    
    res.status(500).json({ 
      error: "Failed to process chat request",
      details: error.message 
    });
  }
});

app.get('/api/quiz', (req, res) => {
  // Return shuffled questions
  const shuffled = [...quizQuestions].sort(() => 0.5 - Math.random());
  res.json({ questions: shuffled.slice(0, 5) });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`GEMINI_API_KEY configured: ${!!process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'dummy_key'}`);
});
