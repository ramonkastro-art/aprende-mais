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

  // Tenta Groq → Gemini → OpenAI
  try {
    const text = await callGroq(userContent, systemPrompt);
    return res.status(200).json({ text, provider: 'groq' });
  } catch (groqErr) {
    console.warn('Groq falhou, tentando Gemini...', groqErr.message);
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
          error: `Groq: ${groqErr.message} | Gemini: ${geminiErr.message} | OpenAI: ${openaiErr.message}`,
        });
      }
    }
  }
};

/* ── Gemini 2.0 Flash (Google) — primário ── */
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

  // Status HTTP de erro (429 = quota, 403 = auth, 500 = server)
  if (!response.ok) {
    const msg = data.error?.message || `Erro HTTP ${response.status}`;
    throw new Error(msg);
  }

  // Erro explícito na resposta
  if (data.error) throw new Error(data.error.message);

  // Sem candidatos — pode ser bloqueio de segurança ou quota
  if (!data.candidates || !data.candidates[0]) {
    const reason = data.promptFeedback?.blockReason || 'Resposta vazia do Gemini';
    throw new Error(reason);
  }

  // finishReason diferente de STOP indica problema
  const finishReason = data.candidates[0].finishReason;
  if (finishReason && finishReason !== 'STOP' && finishReason !== 'MAX_TOKENS') {
    throw new Error(`Gemini encerrou com motivo: ${finishReason}`);
  }

  // Sem parts no conteúdo
  if (!data.candidates[0].content?.parts?.[0]?.text) {
    throw new Error('Gemini retornou conteúdo vazio');
  }

  return data.candidates[0].content.parts[0].text.trim();
}

/* ── Groq LLaMA (segundo fallback) ── */
async function callGroq(userContent, systemPrompt) {
  let textPrompt = '';
  let hasImage = false;
  if (typeof userContent === 'string') {
    textPrompt = userContent;
  } else {
    for (const part of userContent) {
      if (part.type === 'text') textPrompt += part.text;
      if (part.type === 'image' || part.type === 'document') {
        hasImage = true;
        textPrompt += '\n[ATENÇÃO: O professor enviou uma imagem da página do livro, mas este modelo não consegue visualizá-la. Use EXCLUSIVAMENTE as informações textuais fornecidas — componente, ano, volume e página — para gerar o material pedagógico. Seja específico ao máximo com base nesse contexto.]';
      }
    }
  }
  if (hasImage) {
    textPrompt += '\n\nIMPORTANTE: Como não tenho acesso à imagem, baseie todo o material no componente curricular, ano e volume informados. Seja fiel ao conteúdo típico do Aprende Brasil para esse contexto específico.';
  }

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      max_tokens: 8192,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: textPrompt },
      ],
    }),
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error?.message || `Groq HTTP ${response.status}`);
  }

  const data = await response.json();
  if (!data.choices?.[0]?.message?.content) throw new Error('Groq retornou resposta vazia');
  return data.choices[0].message.content.trim();
}

/* ── OpenAI — terceiro fallback ── */
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
