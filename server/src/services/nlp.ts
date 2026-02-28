import { GoogleGenerativeAI, Schema, SchemaType } from "@google/generative-ai";
import dotenv from 'dotenv';
dotenv.config();

// The "Sentira v2" System Prompt
const SYSTEM_INSTRUCTION = `You are the core Emotional Intelligence Engine for Sentira.

Task: Analyze the user's raw_text and map it to exactly ONE of the 8 Pillars. You must ignore simple keyword matching and look for 'Arousal' and 'Valence'.

Mapping Rules:
PEAK_JOY: High energy + Positive (Excitement, happiness).
SERENITY: Low energy + Positive (Calm, peace).
APPRECIATION: Warmth + Positive (Gratitude, feeling blessed).
OVERWHELMED: High energy + Negative (Panic, stress, drowning under pressure).
HOSTILITY: Outward energy + Negative (Anger, rage, aggression).
DEJECTION: Low energy + Negative (Sadness, grief, utter exhaustion).
APATHY: Zero energy + Neutral/Negative (Boredom, numbness, 'I don't care', total lack of engagement).
UNCERTAINTY: High cognitive load + Neutral (Confusion, hesitation, decision-paralysis, questioning).

Execution Rules:
1. Zero-Bias Check: Evaluate Energy first. Active verbs (throwing, screaming, drowning) often push into High Energy.
2. Metaphor Analysis: Physical metaphors matter. "Drowning" = Overwhelmed; "Void/Heavy" = Dejection; "Burning" = Hostility.
3. The "Done" Distinction: "I'm done (give up)" = Apathy. "I'm done (exhausted)" = Dejection.
4. Short sentences without clear valence naturally drift to Apathy or Uncertainty.

Analyze the user's text and output a valid JSON response exactly matching the schema.`;

// Define Output Schema for Gemini Structured Output
const responseSchema: any = {
  type: SchemaType.OBJECT,
  properties: {
    sentiment: {
      type: SchemaType.STRING,
      enum: ["Positive", "Negative", "Neutral"],
      description: "The broad sentiment category."
    },
    emotion_type: {
      type: SchemaType.STRING,
      enum: ["PEAK_JOY", "SERENITY", "APPRECIATION", "OVERWHELMED", "HOSTILITY", "DEJECTION", "APATHY", "UNCERTAINTY"],
      description: "The primary psychological pillar."
    },
    confidence: {
      type: SchemaType.NUMBER,
      description: "Your confidence score from 0.0 to 1.0. Lower for ambiguous or extremely short text."
    },
    empathetic_response: {
      type: SchemaType.STRING,
      description: "A tailored, warm 1-sentence empathetic reflection on the user's specific state."
    }
  },
  required: ["sentiment", "emotion_type", "confidence", "empathetic_response"]
};

let genAI: GoogleGenerativeAI | null = null;
let model: any = null;

export async function initNLP() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey) {
    console.log('Initializing Gemini LLM Model (gemini-2.5-flash)...');
    genAI = new GoogleGenerativeAI(apiKey);
    model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: SYSTEM_INSTRUCTION,
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.1, // Keep it relatively deterministic
      }
    });
  } else {
    console.warn('⚠️ No GEMINI_API_KEY found in environment variables!');
    console.warn('⚠️ Sentira is falling back to the local hardcoded heuristic engine. Please add GEMINI_API_KEY to your server/.env file for the true LLM experience.');
  }
}

// ----------------------------------------------------
// FALLBACK LOCAL HEURISTIC ENGINE (Used if no API Key)
// ----------------------------------------------------
function mockFallback(text: string) {
  const lower = text.toLowerCase();
  const words = lower.split(/\s+/).filter(w => w.length > 0);

  let confidence = words.length < 3 ? 0.60 : 0.85;

  if (lower.includes('drown')) return { sentiment: 'Negative', emotion_type: 'OVERWHELMED', confidence, empathetic_response: "It sounds like you are carrying too much weight. Remember to breathe." };
  if (lower.includes('weight') || lower.includes('void')) return { sentiment: 'Negative', emotion_type: 'DEJECTION', confidence, empathetic_response: "I hear the heaviness in your words. Please be gentle with yourself." };
  if (lower.includes('burn')) return { sentiment: 'Negative', emotion_type: 'HOSTILITY', confidence, empathetic_response: "That frustration is intense and valid. Give yourself time." };

  if (lower.includes('done')) {
    if (lower.includes('exhaust') || lower.includes('heavy') || lower.includes('tired')) return { sentiment: 'Negative', emotion_type: 'DEJECTION', confidence, empathetic_response: "You sound utterly drained. Rest is the most productive thing you can do right now." };
    if (lower.includes('give up') || lower.includes('bore') || lower.includes('care')) return { sentiment: 'Neutral', emotion_type: 'APATHY', confidence, empathetic_response: "It's completely okay to feel disconnected and numb sometimes." };
  }

  let energy = 0; let valence = 0;
  const activeVerbs = ['throw', 'run', 'shake', 'screaming', 'yelling', 'racing', 'pounding', 'smash', 'jump'];
  const hasActiveVerb = activeVerbs.some(v => lower.includes(v));

  const positiveWords = ['happy', 'great', 'awesome', 'good', 'smile', 'glad', 'thank', 'appreciate', 'calm', 'peace', 'blessed', 'joy', 'wonderful', 'love', 'fantastic'];
  const negativeWords = ['sad', 'bad', 'terrible', 'cry', 'upset', 'angry', 'mad', 'hate', 'stress', 'overwhelm', 'anxious', 'fear', 'pain', 'pressure', 'panic', 'fired', 'ruin', 'fail', 'worst'];

  const highEnergyWords = ['excited', 'pumped', 'thrill', 'panic', 'stress', 'angry', 'rage', 'furious', 'anxious', 'joy', 'dance', 'screaming', 'yelling', 'shaking'];
  const lowEnergyWords = ['calm', 'peace', 'tired', 'sleep', 'relax', 'exhaust', 'heavy', 'bored', 'numb', 'quiet', 'give up', 'don\'t care'];

  if (positiveWords.some(w => lower.includes(w))) valence = 1; else if (negativeWords.some(w => lower.includes(w))) valence = -1;
  if (hasActiveVerb) energy = 1; else if (highEnergyWords.some(w => lower.includes(w))) energy = 1; else if (lowEnergyWords.some(w => lower.includes(w))) energy = -1;

  let bestLabel = 'UNCERTAINTY';
  let sentimentStr = 'Neutral';

  if (valence === 1) {
    sentimentStr = 'Positive';
    if (energy === 1) bestLabel = 'PEAK_JOY'; else if (energy === -1) bestLabel = 'SERENITY'; else bestLabel = 'APPRECIATION';
  } else if (valence === -1) {
    sentimentStr = 'Negative';
    if (energy >= 0) {
      if (lower.includes('angry') || lower.includes('mad') || lower.includes('hate') || lower.includes('rage') || lower.includes('frustrat') || lower.includes('fired')) bestLabel = 'HOSTILITY';
      else bestLabel = 'OVERWHELMED';
    } else { bestLabel = 'DEJECTION'; }
  } else {
    let hasConfusionWords = ['unsure', 'confused', "don't know", 'maybe', 'lost', 'uncertain', 'doubt', 'why', 'how'].some(w => lower.includes(w));
    if (energy === 1 || hasConfusionWords) bestLabel = 'UNCERTAINTY'; else bestLabel = 'APATHY';
  }

  const responses: Record<string, string> = {
    PEAK_JOY: "Your energy is radiant—savor this excitement and let it carry you forward.",
    SERENITY: "You're in a beautiful state of balance. Notice how calm your mind feels right now.",
    APPRECIATION: "Holding onto that warmth and gratitude is a powerful way to ground yourself.",
    OVERWHELMED: "It sounds like you're carrying a lot right now. Take a deep breath; you don't have to carry it all.",
    HOSTILITY: "Your frustration is completely valid. Give yourself a moment to cool down.",
    DEJECTION: "I hear the weight in your words. Please be gentle with yourself as you navigate this.",
    APATHY: "It's completely okay to feel drained or numb today.",
    UNCERTAINTY: "Not knowing the answer right now is perfectly okay. Give yourself permission to pause.",
  };

  return {
    sentiment: sentimentStr,
    emotion_type: bestLabel,
    confidence,
    empathetic_response: responses[bestLabel] || "Recognizing how you feel is the first step."
  };
}

export async function analyzeText(text: string) {
  if (!model) await initNLP();

  // Try the primary LLM model first
  if (model) {
    try {
      console.log(`[LLM Inference Started] Prompt: "${text}"`);
      const result = await model.generateContent(text);
      const responseText = result.response.text();
      const parsed = JSON.parse(responseText);

      console.log(`[LLM Result]`, parsed);

      return {
        sentiment: parsed.sentiment,
        emotion_type: parsed.emotion_type,
        confidence: parsed.confidence,
        raw_label: 'gemini-llm',
        empathetic_response: parsed.empathetic_response
      };
    } catch (err) {
      console.error('[LLM Inference Failed] Falling back...', err);
      // Fallback below if LLM fails
    }
  }

  // Fallback to local heuristic
  console.log(`[Heuristic Inference Started] Prompt: "${text}"`);
  const localAnalysis = mockFallback(text);

  return {
    sentiment: localAnalysis.sentiment,
    emotion_type: localAnalysis.emotion_type,
    confidence: localAnalysis.confidence,
    raw_label: 'heuristic-fallback',
    empathetic_response: localAnalysis.empathetic_response
  };
}
