import express from 'express';
import cors from 'cors';
import matchesRouter from './routes/matchesRouter.js';
import dotenv from 'dotenv';

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// Route for matches API
app.use('/api/matches', matchesRouter);

export default app;
