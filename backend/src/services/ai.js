import { GoogleGenerativeAI } from "@google/generative-ai";

const FALLBACK_CATEGORIES = {
  heart: "Cardiologist",
  cardiac: "Cardiologist",
  chest: "Pulmonologist",
  lung: "Pulmonologist",
  respiratory: "Pulmonologist",
  skin: "Dermatologist",
  rash: "Dermatologist",
  acne: "Dermatologist",
  bone: "Orthopedic",
  fracture: "Orthopedic",
  joint: "Orthopedic",
  spine: "Orthopedic",
  brain: "Neurologist",
  headache: "Neurologist",
  migraine: "Neurologist",
  seizure: "Neurologist",
  child: "Pediatrician",
  pediatric: "Pediatrician",
  eye: "Ophthalmologist",
  vision: "Ophthalmologist",
  ear: "ENT Specialist",
  throat: "ENT Specialist",
  hearing: "ENT Specialist",
  anxiety: "Psychiatrist",
  depression: "Psychiatrist",
  mental: "Psychiatrist",
  pregnancy: "Gynecologist",
  menstrual: "Gynecologist",
  uterine: "Gynecologist",
  diabetes: "Endocrinologist",
  thyroid: "Endocrinologist",
  hormone: "Endocrinologist",
  fever: "General Physician",
  cough: "General Physician",
  cold: "General Physician",
  infection: "General Physician",
  pain: "General Physician",
};

function ruleBasedAnalysis(text) {
  const lower = text.toLowerCase();
  for (const [keyword, category] of Object.entries(FALLBACK_CATEGORIES)) {
    if (lower.includes(keyword)) {
      return { category, confidence: "low", method: "rule-based", matchedKeyword: keyword };
    }
  }
  return { category: "General Physician", confidence: "low", method: "rule-based", matchedKeyword: null };
}

let genAI = null;
if (process.env.GEMINI_API_KEY) {
  genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
}

const SYSTEM_PROMPT = `You are a medical triage AI. Analyze the given medical text and respond with JSON only:
{
  "category": "one of: General Physician, Cardiologist, Dermatologist, Orthopedic, Neurologist, Pediatrician, Ophthalmologist, ENT Specialist, Psychiatrist, Gynecologist, Pulmonologist, Endocrinologist",
  "confidence": "high/medium/low",
  "reasoning": "brief explanation"
}`;

async function geminiAnalysis(text) {
  if (!genAI) throw new Error("Gemini API key not configured");

  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const result = await model.generateContent([
    { text: SYSTEM_PROMPT },
    { text: `---\n${text}\n---` },
  ]);
  const response = result.response.text();
  const cleaned = response.replace(/```json|```/g, "").trim();
  return JSON.parse(cleaned);
}

export async function analyzeText(text) {
  if (!text || text.trim().length === 0) {
    return { category: "General Physician", confidence: "low", method: "fallback-empty", matchedKeyword: null };
  }

  try {
    const aiResult = await geminiAnalysis(text);
    return { ...aiResult, method: "gemini" };
  } catch (err) {
    console.warn("Gemini analysis failed, using rule-based fallback:", err.message);
    return ruleBasedAnalysis(text);
  }
}
