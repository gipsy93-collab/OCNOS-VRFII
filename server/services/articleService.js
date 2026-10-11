import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let ARTICLES = [];

export function loadArticles() {
  // Ajustamos el path porque estamos en server/services/
  const agenteDir = path.join(__dirname, '..', '..', 'public', 'agente');
  if (!fs.existsSync(agenteDir)) {
    console.log(`Directorio de artículos no encontrado: ${agenteDir}`);
    return;
  }
  const files = fs.readdirSync(agenteDir).filter(f => f.endsWith('.json'));
  ARTICLES = files.map(file => {
    const data = JSON.parse(fs.readFileSync(path.join(agenteDir, file), 'utf-8'));
    return {
      id: data.article_id,
      title: data.title,
      author: data.authors,
      year: data.year,
      doi: data.doi,
      desc: data.welcome_message?.split('\n')[0]?.slice(0, 200) || '',
      context: data.context_for_ai || '',
    };
  });
  console.log(`Artículos cargados: ${ARTICLES.length}`);
}

export function getArticles() {
  return ARTICLES;
}

export function matchArticles(query) {
  const q = query.toLowerCase();
  return ARTICLES.filter(a => {
    const text = `${a.id} ${a.title} ${a.author} ${a.desc}`.toLowerCase();
    const terms = q.split(/\s+/).filter(t => t.length > 2);
    if (q.includes(a.id)) return true;
    return terms.some(t => text.includes(t));
  });
}

export function detectArticleMention(message) {
  const cmdMatch = message.match(/^\/articulo\s+(\S+)/i);
  if (cmdMatch) {
    const id = cmdMatch[1].toLowerCase();
    const article = ARTICLES.find(a => a.id === id);
    if (article) return article;
  }

  const idMatch = ARTICLES.find(a => message.toLowerCase().includes(a.id));
  if (idMatch) return idMatch;

  const matches = matchArticles(message);
  if (matches.length === 1) return matches[0];

  return null;
}
