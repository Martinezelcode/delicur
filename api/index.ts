import { VercelRequest, VercelResponse } from '@vercel/node';
import express from 'express';
import { registerRoutes } from '../server/routes.js';

// Cache the app instance
let app: express.Application | null = null;

// Initialize the Express app
async function createApp() {
  if (app) return app;
  
  app = express();
  await registerRoutes(app);
  return app;
}

// Vercel serverless function handler
export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const expressApp = await createApp();
    return expressApp(req as any, res as any);
  } catch (error) {
    console.error('Serverless function error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}