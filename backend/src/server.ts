import 'dotenv/config';
import express, { Request, Response } from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { RepoPacker, PackedRepository } from './services/repoPacker.js';
import { GeminiDoctorService } from './services/gemini.js';
import { AwsDoctorService } from './services/aws.js';
import { ScanStatus } from './types/doctor.js';

const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB zip limit
});

const awsService = new AwsDoctorService();
const doctorService = new GeminiDoctorService();

// Available demo repos
const DEMO_REPOSITORIES = [
  {
    id: 'vulnerable-node-api',
    name: 'Vulnerable Node.js Express API',
    description: 'Contains severe SQL Injection, hardcoded JWT secrets, N+1 query loop, and unpinned dependencies.',
    language: 'JavaScript / Node.js',
    expectedScore: '~35 / 100',
    path: path.resolve('demo-repos/vulnerable-node-api'),
  },
  {
    id: 'insecure-python-app',
    name: 'Insecure Python Flask Microservice',
    description: 'Contains Remote Command Injection via ping tool, debug mode enabled in production, and zero tests.',
    language: 'Python / Flask',
    expectedScore: '~40 / 100',
    path: path.resolve('demo-repos/insecure-python-app'),
  },
];

export default app;
