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

/**
 * Health check & status
 */
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    engine: 'Google Gemini 3.7 Flash',
    awsIntegrated: awsService.isConfigured(),
    timestamp: new Date().toISOString(),
  });
});

/**
 * List available quick-demo repositories
 */
app.get('/api/demos', (req: Request, res: Response) => {
  const demos = DEMO_REPOSITORIES.map(d => ({
    id: d.id,
    name: d.name,
    description: d.description,
    language: d.language,
    expectedScore: d.expectedScore,
  }));
  res.json(demos);
});

async function executeScan(
  scanId: string,
  repoName: string,
  getPacked: () => Promise<PackedRepository>,
  sourceUrl?: string,
  repoType: 'github' | 'upload' | 'demo' = 'demo'
) {
  const startTime = Date.now();
  try {
    await awsService.updateStatus({
      scanId,
      status: 'unpacking',
      progress: 15,
      currentStep: 'Unpacking and filtering codebase files...',
      repoName,
    });

    const packed = await getPacked();

    await awsService.updateStatus({
      scanId,
      status: 'analyzing',
      progress: 45,
      currentStep: `Ingesting ${packed.totalFiles} files into Gemini AI engine...`,
      repoName: packed.repoName,
    });

    await awsService.updateStatus({
      scanId,
      status: 'synthesizing_patches',
      progress: 75,
      currentStep: 'Synthesizing health scorecard & unified diff patches...',
      repoName: packed.repoName,
    });

    const report = await doctorService.analyzeCodebase(packed, scanId, sourceUrl, repoType);

    const duration = Date.now() - startTime;
    await awsService.saveReport(report, duration);

    console.log(`[Scan ${scanId}] Completed successfully in ${duration}ms for ${repoName}`);
  } catch (err: any) {
    console.error(`[Scan ${scanId}] Failed:`, err);
    await awsService.updateStatus({
      scanId,
      status: 'failed',
      progress: 100,
      currentStep: 'Analysis failed',
      repoName,
      error: err.message || 'Unknown error occurred during analysis',
    });
  }
}

/**
 * Trigger scan from GitHub URL or Demo Repo
 */
app.post('/api/scan', async (req: Request, res: Response): Promise<void> => {
  const { type, url, demoId } = req.body;
  const scanId = uuidv4();

  if (type === 'github') {
    if (!url) {
      res.status(400).json({ error: 'GitHub repository URL is required' });
      return;
    }

    const repoName = url.replace(/https?:\/\/github\.com\//i, '').replace(/\.git$/i, '');
    
    await awsService.updateStatus({
      scanId,
      status: 'queued',
      progress: 5,
      currentStep: 'Queued for GitHub repo fetch...',
      repoName,
    });

    executeScan(scanId, repoName, () => RepoPacker.packGitHubRepo(url), url, 'github');
    res.json({ scanId, repoName, status: 'queued' });
    return;
  }

  if (type === 'demo') {
    const demo = DEMO_REPOSITORIES.find(d => d.id === demoId) || DEMO_REPOSITORIES[0];
    await awsService.updateStatus({
      scanId,
      status: 'queued',
      progress: 5,
      currentStep: `Loading prepackaged demo repository (${demo.name})...`,
      repoName: demo.name,
    });

    executeScan(scanId, demo.name, async () => RepoPacker.packLocalDirectory(demo.path, demo.name), undefined, 'demo');
    res.json({ scanId, repoName: demo.name, status: 'queued' });
    return;
  }

  res.status(400).json({ error: 'Invalid scan type. Must be "github" or "demo"' });
});

/**
 * Trigger scan from uploaded ZIP file
 */
app.post('/api/upload', upload.single('repoZip'), async (req: Request, res: Response): Promise<void> => {
  if (!req.file) {
    res.status(400).json({ error: 'No ZIP file uploaded' });
    return;
  }

  const scanId = uuidv4();
  const repoName = req.file.originalname.replace(/\.zip$/i, '');
  const buffer = req.file.buffer;

  await awsService.updateStatus({
    scanId,
    status: 'queued',
    progress: 5,
    currentStep: 'Received ZIP archive. Queued for unpacking...',
    repoName,
  });

  executeScan(scanId, repoName, async () => RepoPacker.packZipBuffer(buffer, repoName), undefined, 'upload');
  res.json({ scanId, repoName, status: 'queued' });
});

/**
 * Poll scan status
 */
app.get('/api/status/:scanId', async (req: Request, res: Response): Promise<void> => {
  const scanId = String(req.params.scanId);
  const status = await awsService.getStatus(scanId);
  if (!status) {
    res.status(404).json({ error: 'Scan not found' });
    return;
  }
  res.json(status);
});

/**
 * Retrieve completed report
 */
app.get('/api/report/:scanId', async (req: Request, res: Response): Promise<void> => {
  const scanId = String(req.params.scanId);
  const report = await awsService.getReport(scanId);
  if (!report) {
    res.status(404).json({ error: 'Report not found or scan still in progress' });
    return;
  }
  res.json(report);
});

export default app;
