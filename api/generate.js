const dotenv = require('dotenv');
dotenv.config();

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const { userContent, systemPrompt } = req.body;

  if (!userContent || !systemPrompt) {
    return res.status(400).json({ error: 'Parâmetros inválidos' });
  }

  // Tenta Gemini primeiro, cai para OpenAI se falhar
  try {
    const text = await callGemini(userContent, systemPrompt);
    return res.status(200).json({ text, provider: 'gemini' });
  } catch (geminiErr) {
    console.warn('Gemini falhou, tentando OpenAI...', geminiErr.message);
    try {
      const text = await callOpenAI(userContent, systemPrompt);
      return res.status(200).json({ text, provider: 'openai' });
    } catch (openaiErr) {
      return res.status(500).json({
        error: `Gemini: ${geminiErr.message} | OpenAI: ${openaiErr.message}`,
      });
    }
  }
};

/* ── Gemini 2.5 Flash (Google) — primário ── */
async function callGemini(userContent, systemPrompt) {
  let textPrompt = '';
  let imagePart = null;

  if (typeof userContent === 'string') {
    textPrompt = userContent;
  } else {
    for (const part of userContent) {
      if (part.type === 'text') textPrompt = part.text;
      if (part.type === 'image' || part.type === 'document') {
        imagePart = {
          inlineData: {
            mimeType: part.source.media_type,
            data: part.source.data,
          },
        };
      }
    }
  }

  const parts = [];
  if (imagePart) parts.push(imagePart);
  parts.push({ text: systemPrompt + '\n\n' + textPrompt });

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts }],
        generationConfig: { maxOutputTokens: 8192 },
      }),
    }
  );

  const data = await response.json();
  console.log('Gemini status:', response.status);
  if (data.error) throw new Error(data.error.message);
  if (!data.candidates || !data.candidates[0]) throw new Error('Resposta vazia do Gemini');
  return data.candidates[0].content.parts[0].text.trim();
}

/* ── OpenAI — backup ── */
async function callOpenAI(userContent, systemPrompt) {
  let userMessage;

  if (typeof userContent === 'string') {
    userMessage = { role: 'user', content: userContent };
  } else {
    const parts = [];
    for (const part of userContent) {
      if (part.type === 'text') {
        parts.push({ type: 'text', text: part.text });
      }
      if (part.type === 'image') {
        parts.push({
          type: 'image_url',
          image_url: {
            url: `data:${part.source.media_type};base64,${part.source.data}`,
          },
        });
      }
      if (part.type === 'document') {
        parts.push({
          type: 'text',
          text: '[Arquivo PDF enviado. Analise com base na descrição e observações do professor.]',
        });
      }
    }
    userMessage = { role: 'user', content: parts };
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      max_tokens: 8192,
      messages: [
        { role: 'system', content: systemPrompt },
        userMessage,
      ],
    }),
  });

  const data = await response.json();
  if (data.error) throw new Error(data.error.message);
  return data.choices[0].message.content.trim();
}
