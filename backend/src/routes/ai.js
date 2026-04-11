const express = require('express');
const auth = require('../middleware/auth');

const router = express.Router();

const AI_ENABLED = process.env.AI_ENABLED === 'true';

// POST /api/ai/emotion-feedback
// 送出情緒記錄後，取得 AI 個人化回應
router.post('/emotion-feedback', auth, async (req, res) => {
  if (!AI_ENABLED) {
    return res.json({ enabled: false });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return res.json({ enabled: false });
  }

  const { text, lang } = req.body;
  if (!text?.trim()) return res.status(422).json({ error: 'text is required' });

  try {
    const Anthropic = require('@anthropic-ai/sdk');
    const client = new Anthropic.default({ apiKey: process.env.ANTHROPIC_API_KEY });

    const isZh = lang !== 'en';
    const systemPrompt = isZh
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

    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 200,
      system: systemPrompt,
      messages: [{ role: 'user', content: text.trim() }],
    });

    const reply = message.content[0]?.text || '';
    res.json({ enabled: true, message: reply });
  } catch (err) {
    console.error('[AI] emotion-feedback error:', err.message);
    res.json({ enabled: false });
  }
});

module.exports = router;
