const express = require('express');
const rateLimit = require('express-rate-limit');
const auth = require('../middleware/auth');
const pool = require('../db/pool');

const router = express.Router();

// 每個 IP 每小時最多呼叫 AI 20 次（preview 模式也算，防爬）
const aiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'AI 使用次數已達上限，請一小時後再試' },
});

const AI_ENABLED  = process.env.AI_ENABLED === 'true';
const AI_PREVIEW  = process.env.AI_PREVIEW === 'true';
const AI_MODEL    = process.env.AI_MODEL || 'claude'; // 'claude' | 'openai' | 'gemini'

const PREVIEW_MESSAGES = {
  zh: '你願意把這些說出來，已經很不容易了。不管今天發生什麼，你還在這裡，這本身就很重要。好好休息，明天的事明天再說。',
  en: "The fact that you wrote this down says a lot about your self-awareness. Whatever today brought, you showed up — and that matters. Be gentle with yourself tonight.",
};

const PREVIEW_REPORT = {
  zh: `【本週情緒概覽】
這週你記錄了 5 次情緒，平均強度是 3.2 / 5。整體來說，你在主動觀察自己的內心狀態，這已經很不容易了。

【你可能沒注意到的模式】
焦慮和疲憊這兩個標籤出現了最多次，通常集中在週間。週末的記錄強度明顯低一些，或許你在那時候比較能讓自己喘息。

【給這週的你說一句話】
你已經把那些說不清楚的感覺寫下來了。光是這樣，就已經是一種照顧自己的方式。`,
  en: `[Weekly Emotion Overview]
You logged 5 emotions this week with an average intensity of 3.2 / 5. The fact that you're actively tracking your inner state says a lot.

[Patterns You Might Have Missed]
"Anxious" and "drained" appeared most frequently, usually on weekdays. Your weekend entries were noticeably lower in intensity — maybe that's when you let yourself breathe.

[A Note for This Week's You]
You put words to things that are hard to say. That alone is a way of taking care of yourself.`,
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
router.post('/emotion-feedback', aiLimiter, auth, async (req, res) => {
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

// GET /api/ai/weekly-report  — 取得本週快取報告（或說明尚未生成）
router.get('/weekly-report', auth, async (req, res) => {
  if (!req.userId) return res.json({ enabled: false });
  const weekStart = getWeekStart();
  try {
    const result = await pool.query(
      'SELECT report_zh, report_en, generated_at FROM weekly_reports WHERE user_id = $1 AND week_start = $2',
      [req.userId, weekStart]
    );
    if (result.rows.length > 0) {
      return res.json({ enabled: true, cached: true, ...result.rows[0], week_start: weekStart });
    }
    res.json({ enabled: true, cached: false, week_start: weekStart });
  } catch (err) {
    console.error('[AI] weekly-report GET error:', err.message);
    res.json({ enabled: false });
  }
});

// POST /api/ai/weekly-report — 生成本週週報（一週一次）
router.post('/weekly-report', aiLimiter, auth, async (req, res) => {
  if (!req.userId) return res.json({ enabled: false });

  const { lang } = req.body;
  const weekStart = getWeekStart();

  // 預覽模式
  if (AI_PREVIEW) {
    return res.json({
      enabled: true, cached: false,
      report_zh: PREVIEW_REPORT.zh,
      report_en: PREVIEW_REPORT.en,
      generated_at: new Date().toISOString(),
      week_start: weekStart,
    });
  }

  if (!AI_ENABLED) return res.json({ enabled: false });

  const caller = callers[AI_MODEL];
  if (!caller || !process.env[caller.key]) return res.json({ enabled: false });

  try {
    // 已有本週快取，直接回傳
    const cached = await pool.query(
      'SELECT report_zh, report_en, generated_at FROM weekly_reports WHERE user_id = $1 AND week_start = $2',
      [req.userId, weekStart]
    );
    if (cached.rows.length > 0) {
      return res.json({ enabled: true, cached: true, ...cached.rows[0], week_start: weekStart });
    }

    // 取得本週情緒記錄
    const records = await pool.query(
      `SELECT intensity, emotion_tags, trigger_event, raw_emotion, created_at
       FROM emotion_records
       WHERE user_id = $1 AND created_at >= $2
       ORDER BY created_at ASC`,
      [req.userId, weekStart]
    );

    const rows = records.rows;
    if (rows.length === 0) {
      return res.status(422).json({ error: 'NO_DATA' });
    }

    // 整理資料摘要（不直接傳原文，保護隱私）
    const avgIntensity = (rows.reduce((s, r) => s + (r.intensity || 0), 0) / rows.length).toFixed(1);
    const allTags = rows.flatMap((r) => r.emotion_tags || []);
    const tagCounts = allTags.reduce((acc, t) => { acc[t] = (acc[t] || 0) + 1; return acc; }, {});
    const topTags = Object.entries(tagCounts).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([t]) => t);
    const excerpts = rows
      .map((r) => r.raw_emotion || r.trigger_event || '')
      .filter(Boolean).slice(0, 3)
      .map((t) => t.slice(0, 60));

    const dataBlock = `
本週記錄次數：${rows.length} 次
平均情緒強度：${avgIntensity} / 5
最常出現的情緒標籤：${topTags.join('、') || '無'}
部分文字摘錄（節錄）：
${excerpts.map((e, i) => `${i + 1}. 「${e}」`).join('\n')}
`.trim();

    const systemZh = `你是一位溫柔的心理健康陪伴者。
請根據以下這週的情緒記錄數據，生成一份溫暖、個人化的週報。
格式必須是三段，每段有標題：
【本週情緒概覽】（2-3 句，描述這週的整體狀態）
【你可能沒注意到的模式】（2-3 句，從數據中觀察到的規律）
【給這週的你說一句話】（1-2 句，溫柔有力的收尾）
規則：不說教、不給建議、語氣像朋友、只用以上格式、不加其他標題或說明。`;

    const systemEn = `You are a warm mental health companion.
Based on the week's emotion data below, write a warm, personalized weekly report.
Format must be exactly three sections with these headers:
[Weekly Emotion Overview] (2-3 sentences on overall mood)
[Patterns You Might Have Missed] (2-3 sentences on patterns in the data)
[A Note for This Week's You] (1-2 warm closing sentences)
Rules: No advice, no lecturing, friendly tone, use only these headers, nothing else.`;

    const [reportZhText, reportEnText] = await Promise.all([
      caller.fn(dataBlock, 'zh').catch(() => ''),
      caller.fn(dataBlock, 'en').catch(() => ''),
    ]);

    // 替換掉 system prompt（callClaude 等用 buildPrompt，這裡要自訂）
    const reportZh = reportZhText || PREVIEW_REPORT.zh;
    const reportEn = reportEnText || PREVIEW_REPORT.en;

    // 寫入快取
    await pool.query(
      `INSERT INTO weekly_reports (user_id, week_start, report_zh, report_en)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (user_id, week_start) DO UPDATE SET report_zh=$3, report_en=$4, generated_at=NOW()`,
      [req.userId, weekStart, reportZh, reportEn]
    );

    res.json({ enabled: true, cached: false, report_zh: reportZh, report_en: reportEn, generated_at: new Date().toISOString(), week_start: weekStart });
  } catch (err) {
    console.error('[AI] weekly-report POST error:', err.message);
    res.json({ enabled: false });
  }
});

function getWeekStart() {
  const now = new Date();
  const day = now.getDay(); // 0=Sun
  const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Monday
  const monday = new Date(now.setDate(diff));
  return monday.toISOString().slice(0, 10);
}

module.exports = router;
