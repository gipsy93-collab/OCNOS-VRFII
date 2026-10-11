import * as articleService from '../services/articleService.js';
import * as aiService from '../services/aiService.js';

export async function handleChat(req, res) {
  const { articleId, message, conversationHistory } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'message is required' });
  }

  try {
    let contextForAI = '';
    let detectedArticle = null;
    const allArticles = articleService.getArticles();

    // Priority 1: Article actively being read (from MulticaminoEngine)
    if (articleId) {
      const article = allArticles.find(a => a.id === articleId);
      if (article) {
        contextForAI = article.context;
        detectedArticle = { id: article.id, title: article.title, context: article.context };
      }
    }

    // Priority 2: User mentioned an article in chat
    if (!contextForAI) {
      const mentioned = articleService.detectArticleMention(message);
      if (mentioned && mentioned.context) {
        contextForAI = mentioned.context;
        detectedArticle = { id: mentioned.id, title: mentioned.title, context: mentioned.context };
      }
    }

    // Priority 3: Keyword matching
    if (!contextForAI) {
      const matched = articleService.matchArticles(message);
      if (matched.length > 0) {
        contextForAI = 'Articulos relevantes:\n' + matched.map(a =>
          `"${a.title}" de ${a.author} (${a.year}). DOI: ${a.doi}. Descripcion: ${a.desc}`
        ).join('\n\n');
      } else {
        contextForAI = allArticles.map(a =>
          `"${a.title}" de ${a.author} (${a.year}). DOI: ${a.doi}. Descripcion: ${a.desc}`
        ).join('\n');
      }
    }

    const reply = await aiService.generateChatResponse(message, conversationHistory, contextForAI, detectedArticle);

    // Quitamos 'context' del objeto que enviamos en los headers/response si queremos mantener la respuesta igual a la original
    const detectedArticleResponse = detectedArticle ? { id: detectedArticle.id, title: detectedArticle.title } : null;

    res.setHeader('X-Article-Detected', detectedArticleResponse ? JSON.stringify(detectedArticleResponse) : '');
    return res.status(200).json({ reply, detectedArticle: detectedArticleResponse });
  } catch (error) {
    console.error('API error:', error.message || error);
    if (error.stack) console.error(error.stack);

    // Check if it's the API key missing error specifically
    if (error.message === 'GEMINI_API_KEY not configured') {
        return res.status(500).json({ error: error.message });
    }

    return res.status(500).json({ error: `Error al procesar la pregunta: ${error.message || error}` });
  }
}
