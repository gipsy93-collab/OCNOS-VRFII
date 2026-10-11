import express from 'express';
import cors from 'cors';
import chatRoutes from './routes/chatRoutes.js';
import { loadArticles } from './services/articleService.js';

const app = express();

app.use(cors());
app.use(express.json());

// Initialize data
loadArticles();

// Register routes
app.use('/api/chat', chatRoutes);

export default app;
