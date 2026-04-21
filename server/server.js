// server.js - Backend proxy cho ShopBot Extension

const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '50mb' }));
app.use(cors({ origin: '*', methods: ['POST', 'GET'] }));

// Xác thực extension secret
function authMiddleware(req, res, next) {
  const token = req.headers['x-extension-secret'];
  if (!token || token !== process.env.EXTENSION_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}

// Rate limiting đơn giản
const rateLimit = new Map();
const RATE_LIMIT = 30;
const RATE_WINDOW = 60000;

function rateLimitMiddleware(req, res, next) {
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  const entry = rateLimit.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimit.set(ip, { count: 1, resetAt: now + RATE_WINDOW });
    return next();
  }
  if (entry.count >= RATE_LIMIT) {
    return res.status(429).json({ error: 'Quá nhiều request, thử lại sau 1 phút.' });
  }
  entry.count++;
  next();
}

// Health check
app.get('/health', (req, res) => {
  res.json({ ok: true, service: 'ShopBot Proxy' });
});

// Proxy gọi Gemini API
app.post('/api/chat', authMiddleware, rateLimitMiddleware, async (req, res) => {
  try {
    const { system, messages, model } = req.body;
    const geminiModel = model || 'gemini-2.0-flash';

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Thiếu messages' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'Server chưa cấu hình API key' });
    }

    // Chuyển đổi format sang Gemini
    const contents = [];
    const systemText = system || '';

    for (const msg of messages) {
      const role = msg.role === 'assistant' ? 'model' : 'user';
      const parts = [];

      if (typeof msg.content === 'string') {
        const text = (role === 'user' && contents.length === 0 && systemText)
          ? systemText + '\n\n' + msg.content
          : msg.content;
        parts.push({ text });
      } else if (Array.isArray(msg.content)) {
        for (const item of msg.content) {
          if (item.type === 'text') {
            const text = (role === 'user' && contents.length === 0 && systemText)
              ? systemText + '\n\n' + item.text
              : item.text;
            parts.push({ text });
          } else if (item.type === 'image' && item.source?.type === 'base64') {
            parts.push({
              inline_data: {
                mime_type: item.source.media_type,
                data: item.source.data
              }
            });
          }
        }
      }

      if (parts.length > 0) contents.push({ role, parts });
    }

    // Gọi Gemini
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents,
          generationConfig: {
            maxOutputTokens: 8192,
            temperature: 0.7
          }
        })
      }
    );

    if (!geminiRes.ok) {
      const err = await geminiRes.json().catch(() => ({}));
      return res.status(geminiRes.status).json({
        error: err?.error?.message || `Gemini API lỗi ${geminiRes.status}`
      });
    }

    const data = await geminiRes.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    res.json({ text });

  } catch (err) {
    console.error('Server error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`✅ ShopBot proxy chạy tại http://localhost:${PORT}`);
});
