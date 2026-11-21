import express from 'express';
import type { ErrorRequestHandler } from 'express';
import apiRouter from './routes/index.js';

const app = express();

app.use(express.json());
app.use('/api', apiRouter);

const handleError: ErrorRequestHandler = (error, _req, res, next) => {
  if (res.headersSent) {
    next(error);
    return;
  }
  if (error.type === 'entity.parse.failed' || error instanceof URIError) {
    res.status(400).json({ error: 'Malformed request.' });
    return;
  }
  if (error.type === 'entity.too.large') {
    res.status(413).json({ error: 'Request body is too large.' });
    return;
  }
  console.error('API request failed', error.code ?? error.name);
  res.status(500).json({ error: 'The server could not complete the request.' });
};

app.use(handleError);

export default app;
