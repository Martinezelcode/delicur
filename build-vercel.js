#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('Building for Vercel deployment...');

// Build the frontend
console.log('Building frontend...');
execSync('vite build', { stdio: 'inherit', cwd: 'client' });

// Copy built files to root level for Vercel
console.log('Copying build files...');
if (fs.existsSync('dist')) {
  fs.rmSync('dist', { recursive: true });
}
fs.cpSync('client/dist', 'dist', { recursive: true });

console.log('Vercel build completed!');