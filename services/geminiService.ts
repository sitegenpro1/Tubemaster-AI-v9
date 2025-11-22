import { ThumbnailGenResult } from "../types";

// --- CONFIGURATION ---

// Groq Config (Text Logic & Reasoning)
// Model: GPT-OSS-120B (via Groq)
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "openai/gpt-oss-120b"; 

// OpenRouter Config (Vision Analysis)
// Model: Grok 4.1 Fast (via OpenRouter)
const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";
const OPENROUTER_VISION_MODEL = "x-ai/grok-4.1-fast";

// --- API KEYS ---
// We provide fallbacks here to ensure the preview works immediately without .env setup.
// On Vercel, the Environment Variables will take precedence if set.
const FALLBACK_GROQ_KEY = "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";
const FALLBACK_OPENROUTER_KEY = "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";

// --- HELPERS ---

const getApiKey = (provider: 'GROQ' | 'OPENROUTER') => {
  let key = "";

  // 1. Try to get from Vite Environment (Standard for Vercel)
  // Cast import.meta to any to avoid TS error: Property 'env' does not exist on type 'ImportMeta'.
  const meta = import.meta as any;
  if (meta.env) {
    if (provider === 'GROQ') key = meta.env.VITE_GROQ_API_KEY;
    if (provider === 'OPENROUTER') key = meta.env.VITE_OPENROUTER_API_KEY;
  }

  // 2. Try to get from Process Env (Polyfill/Build)
  if (!key && typeof process !== 'undefined' && process.env) {
    if (provider === 'GROQ') key = process.env.VITE_GROQ_API_KEY;
    if (provider === 'OPENROUTER') key = process.env.VITE_OPENROUTER_API_KEY;
  }

  // 3. Fallback to Hardcoded Keys (Fixes "Missing Key" error in Preview)
  if (!key || key.includes("undefined") || key === "") {
    if (provider === 'GROQ') return FALLBACK_GROQ_KEY;
    if (provider === 'OPENROUTER') return FALLBACK_OPENROUTER_KEY;
  }

  // Clean up quotes if JSON.stringify added them
  return key ? key.replace(/"/g, '').trim() : "";
};

// Helper: Standard Fetch Wrapper for Groq/OpenRouter
const callLLM = async (
  url: string, 
  apiKey: string, // Internal usage
  model: string, 
  messages: any[], 
  jsonMode: boolean = true
): Promise<string> => {
  
  // Ensure we have a valid key
  const finalKey = apiKey || getApiKey(url.includes('groq') ? 'GROQ' : 'OPENROUTER');

  if (!finalKey) {
    throw new Error(`Configuration Error: API Key for ${url.includes('groq') ? 'Groq' : 'OpenRouter'} could not be found.`);
  }

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${finalKey}`,
      "Content-Type": "application/json",
      ...(url.includes("openrouter") ? { "HTTP-Referer": "https://tubemaster.ai", "X-Title": "TubeMaster" } : {})
    },
    body: JSON.stringify({
      model: model,
      messages: messages,
      temperature: 0.6,
      max_tokens: 4000,
      response_format: jsonMode ? { type: "json_object" } : undefined
    })
  });

  if (!response.ok) {
    const err = await response.text();
    let errorMessage = err;
    try {
        const jsonErr = JSON.parse(err);
        errorMessage = jsonErr.error?.message || err;
    } catch (e) { /* ignore */ }
    
    throw new Error(`API Error (${response.status}): ${errorMessage}`);
  }

  const data = await response.json();
  const content = data.choices[0]?.message?.content || "{}";
  
  // Clean reasoning tokens if present
  return content.replace(/<think>[\s\S]*?<\/think>/g, "").trim();
};

/**
 * Robust JSON cleaner. 
 */
const cleanJson = (text: string): string => {
  if (!text) return "{}";
  let clean = text.replace(/```json\s*/g, '').replace(/```\s*$/g, '');
  // Aggressive cleanup for reasoning traces
  clean = clean.replace(/<think>[\s\S]*?<\/think>/g, "");
  
  const firstBrace = clean.indexOf('{');
  const lastBrace = clean.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    clean = clean.substring(firstBrace, lastBrace + 1);
  }
  return clean;
};

// --- CLIENT SIDE IMAGE COMPRESSION ---
const compressImage = (base64Str: string): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = base64Str;
    img.crossOrigin = "Anonymous";

    img.onload = () => {
      // Limit dimensions to avoid API payload errors
      // 1024px is standard safe size for Vision models
      const MAX_DIMENSION = 1024;
      let width = img.width;
      let height = img.height;

      if (width > height) {
        if (width > MAX_DIMENSION) {
          height = Math.round((height * MAX_DIMENSION) / width);
          width = MAX_DIMENSION;
        }
      } else {
        if (height > MAX_DIMENSION) {
          width = Math.round((width * MAX_DIMENSION) / height);
          height = MAX_DIMENSION;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(base64Str); // Fallback to original if canvas fails
        return;
      }

      // Fill white background (handles transparent PNGs)
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);
      
      // Compress to JPEG at 70% quality
      // This drastically reduces size while maintaining visual clarity for AI
      const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
      resolve(dataUrl);
    };

    img.onerror = () => {
      console.warn("Image compression failed, sending original.");
      resolve(base64Str);
    };
  });
};

// --- SERVICES ---

// 1. Keyword Finder (Uses Groq)
export const findKeywords = async (topic: string): Promise<any[]> => {
  const prompt = `Act as a world-class YouTube SEO Expert.
    Analyze the topic: "${topic}" and generate exactly 10 high-potential keywords.
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
    
    Return strictly a JSON Object with a key "keywords" containing an array of objects.`;

  const content = await callLLM(
    GROQ_API_URL, 
    getApiKey('GROQ'), 
    GROQ_MODEL, 
    [{ role: "user", content: prompt }]
  );

  const parsed = JSON.parse(cleanJson(content));
  return parsed.keywords || parsed; 
};

// 2. Competitor Analysis (Uses Groq)
export const analyzeCompetitor = async (channelUrl: string): Promise<any> => {
  let pageText = "";
  try {
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
    pageText = `Channel URL: ${channelUrl} (Scrape failed, analyze based on likely content for this URL)`;
  }

  const prompt = `Analyze this YouTube channel data: ${pageText.substring(0, 1000)} 
  Identify 3 strengths, 3 weaknesses, 3 content gaps, and an action plan.
  Return strictly JSON with keys: channelName, subscriberEstimate, strengths, weaknesses, contentGaps, actionPlan.`;

  const content = await callLLM(
    GROQ_API_URL,
    getApiKey('GROQ'),
    GROQ_MODEL,
    [{ role: "user", content: prompt }]
  );

  return JSON.parse(cleanJson(content));
};

// 3. Script Generator (Uses Groq)
export const generateScript = async (title: string, audience: string): Promise<any> => {
  const prompt = `Write a YouTube script for "${title}" targeting "${audience}".
    Logic sections: Hook, Stakes, Context, Twist, Value, Retention Spike, Emotion, Re-engagement, Payoff.
    Return strictly JSON with keys: title, estimatedDuration, targetAudience, sections (array of {title, content, duration, visualCue, logicStep, psychologicalTrigger}).`;

  const content = await callLLM(
    GROQ_API_URL,
    getApiKey('GROQ'),
    GROQ_MODEL,
    [{ role: "user", content: prompt }]
  );
  
  return JSON.parse(cleanJson(content));
};

// 4. Title Generator (Uses Groq)
export const generateTitles = async (topic: string): Promise<string[]> => {
  const content = await callLLM(
    GROQ_API_URL,
    getApiKey('GROQ'),
    GROQ_MODEL,
    [{ role: "user", content: `Generate 10 click-worthy titles for: "${topic}". JSON object with key "titles".` }]
  );

  const parsed = JSON.parse(cleanJson(content));
  return parsed.titles || parsed;
};

// 5. Best Time (Uses Groq)
export const suggestBestTime = async (title: string, audience: string, tags: string = ""): Promise<string> => {
  const content = await callLLM(
    GROQ_API_URL,
    getApiKey('GROQ'),
    GROQ_MODEL,
    [{ role: "user", content: `Best time to publish: "${title}" for "${audience}". Explain why briefly.` }],
    false // Text response
  );
  return content;
};

// 6. Thumbnail Generator (Uses Pollinations.ai - No API Key Needed)
export const generateThumbnail = async (prompt: string, style: string, mood: string, optimize: boolean): Promise<ThumbnailGenResult> => {
  
  let finalPrompt = prompt;

  // Optional: Optimize prompt with Groq
  if (optimize) {
    try {
      const optPrompt = `Rewrite this image prompt for high-CTR. Style: ${style}. Mood: ${mood}. Original: "${prompt}". Output ONLY the raw prompt text, no quotes.`;
      const optimizedText = await callLLM(
        GROQ_API_URL,
        getApiKey('GROQ'),
        GROQ_MODEL,
        [{ role: "user", content: optPrompt }],
        false
      );
      finalPrompt = optimizedText.trim();
    } catch (e) {
      console.warn("Prompt optimization failed, using original.");
    }
  }

  const enhancedPrompt = `${finalPrompt}, ${style} style, ${mood} atmosphere, 4k resolution, high detailed`;
  const encodedPrompt = encodeURIComponent(enhancedPrompt);
  const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1280&height=720&model=flux&seed=${Math.floor(Math.random() * 100000)}`;

  await new Promise((resolve, reject) => {
    const img = new Image();
    img.src = imageUrl;
    img.onload = resolve;
    img.onerror = reject;
    setTimeout(resolve, 10000); 
  });

  return {
    imageUrl,
    originalPrompt: prompt,
    optimizedPrompt: finalPrompt,
    style,
    createdAt: Date.now()
  };
};

// 7. Thumbnail Compare (Uses OPENROUTER / xAI Grok Vision)
export const compareThumbnailsVision = async (
  imgABase64: string, 
  imgBBase64: string, 
  provider: 'GROQ' | 'OPENROUTER'
): Promise<any> => {
  
  // Parallel robust compression
  const [compressedA, compressedB] = await Promise.all([
    compressImage(imgABase64), 
    compressImage(imgBBase64)
  ]);
  
  const isSwapped = Math.random() > 0.5;
  const image1 = isSwapped ? compressedB : compressedA;
  const image2 = isSwapped ? compressedA : compressedB;

  const analysisPrompt = `
    Act as a specialized YouTube Thumbnail Optimization AI (Grok Vision).
    Evaluate Image 1 and Image 2.
    OUTPUT FORMAT (JSON ONLY):
    {
      "winner": "1" or "2",
      "score1": (0-10), "score2": (0-10),
      "reasoning": "Explanation",
      "breakdown": [{ "criterion": "Mobile Clarity", "winner": "1" or "2", "explanation": "..." }, ...]
    }
  `;

  const messages = [
    {
      role: "user",
      content: [
        { type: "text", text: analysisPrompt },
        { type: "text", text: "Image 1:" },
        { type: "image_url", image_url: { url: image1 } },
        { type: "text", text: "Image 2:" },
        { type: "image_url", image_url: { url: image2 } }
      ]
    }
  ];

  // Uses x-ai/grok-4.1-fast
  const content = await callLLM(
    OPENROUTER_API_URL,
    getApiKey('OPENROUTER'),
    OPENROUTER_VISION_MODEL,
    messages
  );

  const rawResult = JSON.parse(cleanJson(content));
  const mapWinner = (w: string) => {
    const cleanW = w?.toString().trim() || '';
    if (cleanW === '1' || cleanW.toLowerCase().includes('image 1')) return isSwapped ? 'B' : 'A';
    if (cleanW === '2' || cleanW.toLowerCase().includes('image 2')) return isSwapped ? 'A' : 'B';
    return 'A'; 
  };

  return {
    winner: mapWinner(rawResult.winner),
    scoreA: isSwapped ? rawResult.score2 : rawResult.score1,
    scoreB: isSwapped ? rawResult.score1 : rawResult.score2,
    reasoning: rawResult.reasoning,
    breakdown: rawResult.breakdown ? rawResult.breakdown.map((item: any) => ({
      criterion: item.criterion,
      winner: mapWinner(item.winner),
      explanation: item.explanation
    })) : []
  };
};

export const compareThumbnailsText = async () => { return {}; };
