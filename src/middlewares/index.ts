import express, { Request, Response, NextFunction } from 'express';
import path from 'path';

export const errorHandler = (
  err: Error, 
  _req: Request, 
  res: Response, 
  _next: NextFunction
): void => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
  });
};

export const initMiddlewares = (app: express.Application): void => {
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.header('Access-Control-Allow-Credentials', 'true');
    
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
  });

  app.use(express.static('frontend/dist'));

  app.use((req, res, next) => {
    if (req.path !== '/sse' && req.path !== '/messages') {
      express.json()(req, res, next);
    } else {
      next();
    }
  });

  app.get('/', (_req: Request, res: Response) => {
    res.sendFile(path.join(process.cwd(), 'frontend', 'dist', 'index.html'));
  });

  app.use(errorHandler);
};
