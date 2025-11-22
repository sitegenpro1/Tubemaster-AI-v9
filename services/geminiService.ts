
import { GoogleGenAI } from "@google/genai";
import { ThumbnailGenResult } from "../types";

// --- Configuration ---
const GEMINI_API_KEY = process.env.API_KEY;
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

// Initialize Gemini Client ONLY for Image Generation (Imagen)
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY || "MISSING_KEY" });
const MODEL_IMAGE = "gemini-2.5-flash-image"; 

// --- Helper: Groq API Call (Text Logic) ---
const callGroq = async (systemPrompt: string, userPrompt: string, jsonMode: boolean = true, apiKeyOverride?: string): Promise<string> => {
  const key = apiKeyOverride || GROQ_API_KEY;
  
  if (!key) {
    throw new Error("Groq API Key is missing. Please set VITE_GROQ_API_KEY in your .env file or enter it in the settings.");
  }

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${key}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      response_format: jsonMode ? { type: "json_object" } : undefined,
      temperature: 0.7,
      max_tokens: 4096
    })
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Groq API Error: ${err}`);
  }

  const data = await response.json();
  return data.choices[0]?.message?.content || "{}";
};

// --- Helper: OpenRouter Vision API Call (xAI Grok) ---
const callOpenRouterVision = async (
  systemPrompt: string, 
  userPrompt: string, 
  imageParts: { url: string }[], 
  apiKeyOverride?: string
): Promise<string> => {
  
  const key = apiKeyOverride || OPENROUTER_API_KEY;
  if (!key) {
    throw new Error("OpenRouter API Key is missing. Please set VITE_OPENROUTER_API_KEY in .env or enter it in the UI.");
  }

  const messages: any[] = [
    { role: "system", content: systemPrompt },
    {
      role: "user",
      content: [
        { type: "text", text: userPrompt },
        ...imageParts.map(img => ({
          type: "image_url",
          image_url: { url: img.url }
        }))
      ]
    }
  ];

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${key}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://tubemaster.ai", 
      "X-Title": "TubeMaster AI"
    },
    body: JSON.stringify({
      // Using xAI Grok 2 Vision as requested
      model: "x-ai/grok-2-vision-1212", 
      messages: messages,
      response_format: { type: "json_object" },
      temperature: 0.5
    })
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`OpenRouter API Error: ${err}`);
  }

  const data = await response.json();
  return data.choices[0]?.message?.content || "{}";
};

// --- Helper: Client-side image compression ---
const compressImage = (base64Str: string): Promise<string> => {
  return new Promise((resolve) => {
    const timeoutId = setTimeout(() => resolve(base64Str), 4000);
    const img = new Image();
    img.src = base64Str;
    img.crossOrigin = "Anonymous";
    
    img.onload = () => {
      clearTimeout(timeoutId);
      const maxWidth = 1024;
      let width = img.width;
      let height = img.height;
      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(base64Str);
        return;
      }
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);
      // Export as JPEG 70%
      const compressed = canvas.toDataURL('image/jpeg', 0.7);
      resolve(compressed);
    };
    img.onerror = (err) => {
      clearTimeout(timeoutId);
      console.warn("Compression failed, sending original:", err);
      resolve(base64Str);
    };
  });
};

const cleanJson = (text: string): string => {
  if (!text) return "{}";
  let clean = text.replace(/```json\s*/g, '').replace(/```\s*$/g, '');
  const firstBrace = clean.indexOf('{');
  const lastBrace = clean.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    clean = clean.substring(firstBrace, lastBrace + 1);
  }
  return clean;
};

// --- Keyword Finder (Using Groq) ---
export const findKeywords = async (topic: string, apiKey?: string): Promise<any[]> => {
  const systemPrompt = `Act as a world-class YouTube SEO Expert. Return strictly JSON.`;
  const userPrompt = `Analyze the topic: "${topic}" and generate exactly 10 high-potential keywords.
    For EACH keyword, apply these 10 Logic Points:
    1. Search Volume: Estimate monthly searches.
    2. Difficulty (KD): 0-100 score.
    3. Opportunity Score: 0-100 score.
    4. Trend: Rising, Stable, Falling, Seasonal.
    5. Intent: Informational, Educational, Entertainment, Commercial.
    6. CPC: Estimate value ($).
    7. Competition Density: Low, Medium, High.
    8. Top Competitor: Name a likely channel.
    9. Video Age Avg: Fresh or Old.
    10. CTR Potential: High/Avg/Low.
    
    Return JSON Object with a key "keywords" containing an array of objects.`;

  const jsonStr = await callGroq(systemPrompt, userPrompt, true, apiKey);
  const parsed = JSON.parse(cleanJson(jsonStr));
  return parsed.keywords || parsed; 
};

// --- Competitor Analysis (Using Groq) ---
export const analyzeCompetitor = async (channelUrl: string, apiKey?: string): Promise<any> => {
  let pageText = "";
  try {
    // Simple proxy scrape to get metadata
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(channelUrl)}`;
    const response = await fetch(proxyUrl);
    if (!response.ok) throw new Error("Proxy Error");
    const data = await response.json();
    if (!data.contents) throw new Error("Could not fetch channel page");
    
    const html = data.contents;
    const titleMatch = html.match(/<title>(.*?)<\/title>/);
    const descMatch = html.match(/name="description" content="(.*?)"/);
    
    pageText = `Channel: ${titleMatch?.[1] || 'Unknown'}\nDesc: ${descMatch?.[1] || 'Unknown'}`;
  } catch (e) {
    pageText = `Channel URL: ${channelUrl} (Scrape failed, purely inferring from URL structure)`;
  }

  const systemPrompt = "Act as a YouTube Strategist. Return strictly JSON.";
  const userPrompt = `Analyze this YouTube channel info: ${pageText.substring(0, 2000)} 
  Identify 3 strengths, 3 weaknesses, 3 content gaps, and an action plan.
  Return JSON with keys: channelName, subscriberEstimate, strengths, weaknesses, contentGaps, actionPlan.`;

  const jsonStr = await callGroq(systemPrompt, userPrompt, true, apiKey);
  return JSON.parse(cleanJson(jsonStr));
};

// --- Script Generator (Using Groq) ---
export const generateScript = async (title: string, audience: string, apiKey?: string): Promise<any> => {
  const systemPrompt = "You are a professional YouTube Script Writer specializing in high-retention storytelling.";
  const userPrompt = `Write a YouTube script for "${title}" targeting "${audience}".
    Logic sections: Hook, Stakes, Context, Twist, Value, Retention Spike, Emotion, Re-engagement, Payoff.
    Return strictly JSON with keys: title, estimatedDuration, targetAudience, sections (array of objects with title, logicStep, content, visualCue, psychologicalTrigger).`;

  const jsonStr = await callGroq(systemPrompt, userPrompt, true, apiKey);
  return JSON.parse(cleanJson(jsonStr));
};

// --- Title Generator (Using Groq) ---
export const generateTitles = async (topic: string, apiKey?: string): Promise<string[]> => {
  const systemPrompt = "You are a Viral Title Expert.";
  const userPrompt = `Generate 10 click-worthy titles for: "${topic}". Return strictly JSON object with key "titles" (array of strings).`;

  const jsonStr = await callGroq(systemPrompt, userPrompt, true, apiKey);
  const parsed = JSON.parse(cleanJson(jsonStr));
  return parsed.titles || parsed;
};

// --- Best Time (Using Groq) ---
export const suggestBestTime = async (title: string, audience: string, tags: string = "", apiKey?: string): Promise<string> => {
  const systemPrompt = "You are a YouTube Analytics Expert.";
  const userPrompt = `Best time to publish: "${title}" for "${audience}". Tags: ${tags}. Explain why briefly. Return plain text.`;

  // Note: Using JSON mode false for plain text
  const text = await callGroq(systemPrompt, userPrompt, false, apiKey);
  return text;
};

// --- Thumbnail Compare (Using OpenRouter / xAI Grok Vision) ---
export const compareThumbnailsVision = async (
  imgABase64: string, 
  imgBBase64: string, 
  provider: 'GROQ' | 'OPENROUTER', // Provider arg kept for compatibility but logic enforces OpenRouter for vision
  userKey?: string
): Promise<any> => {
  
  // 1. COMPRESSION STEP
  const [compressedA, compressedB] = await Promise.all([
    compressImage(imgABase64),
    compressImage(imgBBase64)
  ]);

  // 2. ANTI-BIAS MECHANISM
  const isSwapped = Math.random() > 0.5;
  const image1 = isSwapped ? compressedB : compressedA; 
  const image2 = isSwapped ? compressedA : compressedB; 

  const systemPrompt = "Act as a specialized YouTube Thumbnail Optimization AI. You evaluate images for CTR potential.";
  const userPrompt = `
    Evaluate Image 1 and Image 2 based on:
    1. Mobile Clarity
    2. Facial Dominance
    3. Text Readability
    4. Curiosity Gap
    5. Color Vibrancy
    6. Subject Isolation
    7. Rule of Thirds
    8. Emotional Impact
    9. Visual Hierarchy
    10. Lighting Quality

    OUTPUT FORMAT (JSON ONLY):
    {
      "winner": "1" or "2",
      "score1": (0-10 float), 
      "score2": (0-10 float),
      "reasoning": "Direct explanation.",
      "breakdown": [
        { "criterion": "Mobile Clarity", "winner": "1" or "2", "explanation": "..." },
        ...
      ]
    }
  `;

  // Call OpenRouter (xAI Grok)
  const jsonStr = await callOpenRouterVision(
    systemPrompt, 
    userPrompt, 
    [{ url: image1 }, { url: image2 }],
    userKey
  );

  const rawResult = JSON.parse(cleanJson(jsonStr));

  // MAP RESULTS BACK TO ORIGINAL A/B
  const mapWinner = (w: string) => {
    const cleanW = w?.toString().trim() || '';
    if (cleanW === '1' || cleanW.toLowerCase().includes('image 1')) return isSwapped ? 'B' : 'A';
    if (cleanW === '2' || cleanW.toLowerCase().includes('image 2')) return isSwapped ? 'A' : 'B';
    return 'A';
  };

  const score1 = rawResult.score1 || 0;
  const score2 = rawResult.score2 || 0;

  return {
    winner: mapWinner(rawResult.winner),
    scoreA: isSwapped ? score2 : score1,
    scoreB: isSwapped ? score1 : score2,
    reasoning: rawResult.reasoning,
    breakdown: rawResult.breakdown ? rawResult.breakdown.map((item: any) => ({
      criterion: item.criterion,
      winner: mapWinner(item.winner),
      explanation: item.explanation
    })) : []
  };
};

// --- Thumbnail Generator (Kept on Google GenAI / Imagen) ---
export const generateThumbnail = async (prompt: string, style: string, mood: string, optimize: boolean): Promise<ThumbnailGenResult> => {
  if (!GEMINI_API_KEY || GEMINI_API_KEY.includes("PLACEHOLDER")) {
    throw new Error("Thumbnail Generation requires a valid Google Gemini API Key. Groq does not support image generation.");
  }

  let finalPrompt = prompt;
  let optimizedPrompt = prompt;

  if (optimize) {
    try {
      // Try to use Groq for optimization if available, else skip
      if (GROQ_API_KEY) {
         optimizedPrompt = await callGroq(
          "You are a Prompt Engineer.", 
          `Rewrite this image prompt for high-CTR. Style: ${style}. Mood: ${mood}. Original: "${prompt}". Output ONLY the prompt text.`,
          false
        );
        finalPrompt = optimizedPrompt;
      }
    } catch (e) {
      console.warn("Optimization failed, using original");
    }
  }

  finalPrompt = `${finalPrompt}, ${style} style, ${mood} atmosphere, 8k resolution, detailed, high quality`;

  const response = await ai.models.generateContent({
    model: MODEL_IMAGE,
    contents: {
      parts: [{ text: finalPrompt }]
    },
    config: {
      imageConfig: {
        aspectRatio: "16:9"
      }
    }
  });

  let imageUrl = "";
  if (response.candidates?.[0]?.content?.parts) {
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        imageUrl = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        break;
      }
    }
  }

  if (!imageUrl) {
    throw new Error("No image generated.");
  }

  return {
    imageUrl: imageUrl,
    originalPrompt: prompt,
    optimizedPrompt: optimizedPrompt,
    style: style,
    createdAt: Date.now()
  };
};
