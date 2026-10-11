import { GoogleGenAI } from '@google/genai';

const SYSTEM_PROMPT = `Eres Ocnos, un asistente amable y cercano de la revista Ocnos sobre lectura y alfabetizacion.
Responde en espanol con 2 o 3 oraciones. Se cordial, usa algun emoji sutil si viene al caso.
Si no hay contexto de articulo, presentate: "Hola, soy Ocnos, puedo ayudarte a explorar los articulos sobre lectura y alfabetizacion. ¿Que tema buscas?"
Cuando recomiendes un articulo, incluye SIEMPRE al final el DOI como URL simple en una linea aparte, ej: "https://doi.org/10.18239/ocnos_2023.22.2.342". No uses formato markdown.
Si el contexto incluye articulos especificos, responde con sus datos concretos.`;

export async function generateChatResponse(message, conversationHistory, contextForAI, detectedArticle) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY not configured');
  }

  const ai = new GoogleGenAI({ apiKey });

  const historyText = conversationHistory && conversationHistory.length > 0
    ? `Historial: ${conversationHistory.slice(-3).map(m => `${m.role}: ${m.text}`).join(' | ')}\n`
    : '';

  const fullPrompt = detectedArticle?.context
    ? `${historyText}Contexto del articulo "${detectedArticle.title}":\n${contextForAI}\nUsuario: ${message}`
    : `${historyText}Contexto:\n${contextForAI}\nUsuario: ${message}`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: fullPrompt,
    config: {
      systemInstruction: SYSTEM_PROMPT,
      temperature: 0.5,
      maxOutputTokens: 1024,
    },
  });

  return response.text.trim();
}
