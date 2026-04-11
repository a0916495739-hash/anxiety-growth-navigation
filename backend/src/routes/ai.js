const express = require('express');
const auth = require('../middleware/auth');

const router = express.Router();

const AI_ENABLED  = process.env.AI_ENABLED === 'true';
const AI_PREVIEW  = process.env.AI_PREVIEW === 'true';
const AI_MODEL    = process.env.AI_MODEL || 'claude'; // 'claude' | 'openai' | 'gemini'

const PREVIEW_MESSAGES = {
  zh: '你願意把這些說出來，已經很不容易了。不管今天發生什麼，你還在這裡，這本身就很重要。好好休息，明天的事明天再說。',
  en: "The fact that you wrote this down says a lot about your self-awareness. Whatever today brought, you showed up — and that matters. Be gentle with yourself tonight.",
};

function buildPrompt(lang) {
  const isZh = lang !== 'en';
  return isZh
    ? `你是一位溫柔、不評判的情緒陪伴者，使用者剛剛記錄了他的情緒。
你的任務：用 2-3 句話回應，讓他感到被理解、不孤單。
規則：
- 不給建議、不分析、不說教
- 不重複使用者的原文
- 語氣像朋友，不像心理師
- 如果有自傷跡象（想不開、不想活等），溫柔提醒他可以撥打 1925 安心專線
- 只回 2-3 句，不加標題、不加 bullet point`
    : `You are a gentle, non-judgmental emotional companion. The user just logged their feelings.
Your task: Respond in 2-3 sentences so they feel heard and less alone.
Rules:
- No advice, no analysis, no lecturing
- Don't repeat the user's words back to them
- Warm tone like a friend, not a therapist
- If there are signs of self-harm, gently mention they can call a crisis line
- Only 2-3 sentences. No headers, no bullet points.`;
}

async function callClaude(text, lang) {
  const Anthropic = require('@anthropic-ai/sdk');
  const client = new Anthropic.default({ apiKey: process.env.ANTHROPIC_API_KEY });
  const msg = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 200,
    system: buildPrompt(lang),
    messages: [{ role: 'user', content: text }],
  });
  return msg.content[0]?.text || '';
}

async function callOpenAI(text, lang) {
  const { OpenAI } = require('openai');
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const res = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    max_tokens: 200,
    messages: [
      { role: 'system', content: buildPrompt(lang) },
      { role: 'user',   content: text },
    ],
  });
  return res.choices[0]?.message?.content || '';
}

async function callGemini(text, lang) {
  const { GoogleGenerativeAI } = require('@google/generative-ai');
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  const result = await model.generateContent(`${buildPrompt(lang)}\n\n使用者說：${text}`);
  return result.response.text() || '';
}

const callers = {
  claude: { fn: callClaude, key: 'ANTHROPIC_API_KEY' },
  openai: { fn: callOpenAI, key: 'OPENAI_API_KEY'    },
  gemini: { fn: callGemini, key: 'GEMINI_API_KEY'    },
};

// POST /api/ai/emotion-feedback
router.post('/emotion-feedback', auth, async (req, res) => {
  const { text, lang } = req.body;

  // 預覽模式：回傳假資料，不呼叫任何 API
  if (AI_PREVIEW) {
    if (!req.userId) return res.json({ enabled: false });
    return res.json({ enabled: true, message: PREVIEW_MESSAGES[lang] || PREVIEW_MESSAGES.zh, model: 'preview' });
  }

  if (!AI_ENABLED) return res.json({ enabled: false });

  // 只允許登入用戶，訪客不消耗 AI 額度
  if (!req.userId) return res.json({ enabled: false });

  const caller = callers[AI_MODEL];
  if (!caller) {
    console.error(`[AI] Unknown AI_MODEL: "${AI_MODEL}". Use claude | openai | gemini`);
    return res.json({ enabled: false });
  }
  if (!process.env[caller.key]) {
    console.warn(`[AI] ${caller.key} is not set`);
    return res.json({ enabled: false });
  }

  if (!text?.trim()) return res.status(422).json({ error: 'text is required' });

  try {
    const reply = await caller.fn(text.trim(), lang);
    res.json({ enabled: true, message: reply, model: AI_MODEL });
  } catch (err) {
    console.error(`[AI] ${AI_MODEL} error:`, err.message);
    res.json({ enabled: false });
  }
});

module.exports = router;
