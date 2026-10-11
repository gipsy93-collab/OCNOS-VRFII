import app from './server/app.js';

const PORT = 3001;

app.listen(PORT, () => {
  console.log(`Agente OCNOS API en http://localhost:${PORT}`);
  console.log(`GEMINI_API_KEY: ${process.env.GEMINI_API_KEY ? 'configurada' : 'NO configurada'}`);
});
