import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '10kb' })); // Limit request body size

const PORT = process.env.PORT || 8080;

// Security: Rate limiting (simple in-memory implementation)
// In production, use Redis or a dedicated rate limiting service
const rateLimiter = new Map();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 20;

function checkRateLimit(sessionId) {
  const now = Date.now();
  const userRequests = rateLimiter.get(sessionId) || [];
  
  // Remove requests outside the time window
  const validRequests = userRequests.filter(timestamp => now - timestamp < RATE_LIMIT_WINDOW);
  
  if (validRequests.length >= RATE_LIMIT_MAX_REQUESTS) {
    return false;
  }
  
  validRequests.push(now);
  rateLimiter.set(sessionId, validRequests);
  return true;
}

// Security: Input validation and sanitization
function validateAndSanitizeInput(input) {
  if (!input || typeof input !== 'string') {
    return null;
  }
  
  // Trim whitespace
  let sanitized = input.trim();
  
  // Limit length
  if (sanitized.length > 1000) {
    sanitized = sanitized.substring(0, 1000);
  }
  
  // Remove potentially dangerous characters (basic sanitization)
  // Note: For production, use a proper sanitization library like DOMPurify
  sanitized = sanitized.replace(/<script[^>]*>.*?<\/script>/gi, '');
  sanitized = sanitized.replace(/<[^>]*>/g, '');
  
  return sanitized;
}

// Security: Validate session ID format
function validateSessionId(sessionId) {
  if (!sessionId || typeof sessionId !== 'string') {
    return false;
  }
  
  // Session ID should be alphanumeric and reasonable length
  return /^[a-zA-Z0-9_-]{1,50}$/.test(sessionId);
}

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

// Security: Add security headers
app.use((req, res, next) => {
  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY');
  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  // Enable XSS protection
  res.setHeader('X-XSS-Protection', '1; mode=block');
  // Referrer policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    apiConfigured: !!(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'dummy_key'),
    activeSessions: Object.keys(chatHistories).length
  });
});

app.post('/api/chat', async (req, res) => {
  try {
    const { message, sessionId = 'default' } = req.body;

    // Security: Validate session ID
    if (!validateSessionId(sessionId)) {
      return res.status(400).json({ error: "Invalid session ID" });
    }

    // Security: Validate and sanitize input
    const sanitizedMessage = validateAndSanitizeInput(message);
    if (!sanitizedMessage) {
      return res.status(400).json({ error: "Message is required and must be a valid string" });
    }

    // Security: Rate limiting
    if (!checkRateLimit(sessionId)) {
      return res.status(429).json({ 
        error: "Too many requests. Please try again later.",
        retryAfter: RATE_LIMIT_WINDOW / 1000
      });
    }

    console.log(`[${new Date().toISOString()}] Chat request - Session: ${sessionId}, Message: ${sanitizedMessage.substring(0, 50)}...`);

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

    // Security: Limit chat history size to prevent memory issues
    if (chatHistories[sessionId].length > 20) {
      chatHistories[sessionId] = chatHistories[sessionId].slice(-10);
    }

    const chat = model.startChat({
      history: chatHistories[sessionId],
    });

    console.log(`[${new Date().toISOString()}] Sending message to Gemini...`);
    const result = await chat.sendMessage(sanitizedMessage);
    const response = result.response.text();

    console.log(`[${new Date().toISOString()}] Got response from Gemini: ${response.substring(0, 50)}...`);

    // Update history manually if needed, but startChat manages it per instance. 
    // We update our stored history for future requests
    chatHistories[sessionId].push({ role: "user", parts: [{ text: sanitizedMessage }] });
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
