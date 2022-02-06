/* istanbul ignore file */
import path from 'path';
import cors from 'cors';
import { json as bodyParserJSON } from 'body-parser';
import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import { config } from 'dotenv';
import postRouter from './routes/post';
import { HTTPException } from './util/http-exception';

config({ path: path.resolve(__dirname, './.env') });

const PORT = process.env.PORT || 8000;

const app = express();

app.use(cors());

app.use(bodyParserJSON());

app.use('/api/post', postRouter);

app.use((error: unknown, _: Request, res: Response, next: NextFunction) => {
  const { statusCode, ...err } = HTTPException.getError(error);
  if (res.headersSent) {
    next(err);
  } else {
    res.status(statusCode).json(err);
  }
});

app.listen(PORT, () => {
  console.log('listening on port: ' + PORT);
});
