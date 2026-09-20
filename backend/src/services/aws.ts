import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, GetCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { CloudWatchClient, PutMetricDataCommand } from '@aws-sdk/client-cloudwatch';
import { ProjectHealthReport, ScanStatus } from '../types/doctor.js';

export class AwsDoctorService {
  private s3: S3Client | null = null;
  private ddbDoc: DynamoDBDocumentClient | null = null;
  private cloudWatch: CloudWatchClient | null = null;
  private bucketName: string;
  private tableName: string;
  private region: string;
  private isAwsConfigured: boolean = false;

  private localStore = new Map<string, ProjectHealthReport>();
  private statusStore = new Map<string, ScanStatus>();

  constructor() {
    this.region = process.env.AWS_REGION || 'us-east-1';
    this.bucketName = process.env.S3_BUCKET || 'codebase-doctor-archives';
    this.tableName = process.env.DYNAMODB_TABLE || 'CodebaseDoctorScans';

    if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
      try {
        const credentials = {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        };

        this.s3 = new S3Client({ region: this.region, credentials });
        const ddbClient = new DynamoDBClient({ region: this.region, credentials });
        this.ddbDoc = DynamoDBDocumentClient.from(ddbClient);
        this.cloudWatch = new CloudWatchClient({ region: this.region, credentials });
        this.isAwsConfigured = true;
        console.log(`[AWS] Codebase Doctor initialized with region: ${this.region}, S3: ${this.bucketName}, DynamoDB: ${this.tableName}`);
      } catch (err) {
        console.warn('[AWS] Failed to initialize AWS clients, running in local fallback mode:', err);
      }
    } else {
      console.log('[AWS] No AWS credentials provided in .env, running in seamless local fallback mode.');
    }
  }

  isConfigured(): boolean {
    return this.isAwsConfigured;
  }

  async updateStatus(status: ScanStatus): Promise<void> {
    this.statusStore.set(status.scanId, status);

    if (this.ddbDoc && this.isAwsConfigured) {
      try {
        await this.ddbDoc.send(new PutCommand({
          TableName: this.tableName,
          Item: {
            scanId: status.scanId,
            status: status.status,
            progress: status.progress,
            currentStep: status.currentStep,
            repoName: status.repoName,
            updatedAt: new Date().toISOString(),
          },
        }));
      } catch (err: any) {
        console.warn(`[AWS DynamoDB] Failed to update scan status for ${status.scanId}:`, err.message);
      }
    }
  }

  async getStatus(scanId: string): Promise<ScanStatus | null> {
    const local = this.statusStore.get(scanId);
    if (local) return local;

    if (this.ddbDoc && this.isAwsConfigured) {
      try {
        const res = await this.ddbDoc.send(new GetCommand({
          TableName: this.tableName,
          Key: { scanId },
        }));
        if (res.Item) {
          return res.Item as ScanStatus;
        }
      } catch (err: any) {
        console.warn(`[AWS DynamoDB] Failed to get scan status for ${scanId}:`, err.message);
      }
    }

    return null;
  }

  async saveReport(report: ProjectHealthReport, durationMs: number = 0): Promise<void> {
    this.localStore.set(report.scanId, report);
    this.statusStore.set(report.scanId, {
      scanId: report.scanId,
      status: 'completed',
      progress: 100,
      currentStep: 'Analysis complete',
      repoName: report.repoName,
      report,
    });

    if (this.isAwsConfigured) {
      if (this.s3) {
        try {
          const reportJson = JSON.stringify(report, null, 2);
          await this.s3.send(new PutObjectCommand({
            Bucket: this.bucketName,
            Key: `reports/${report.scanId}.json`,
            Body: Buffer.from(reportJson),
            ContentType: 'application/json',
          }));
          console.log(`[AWS S3] Uploaded report to s3://${this.bucketName}/reports/${report.scanId}.json`);
        } catch (err: any) {
          console.warn('[AWS S3] Failed to upload report to S3:', err.message);
        }
      }

      if (this.ddbDoc) {
        try {
          await this.ddbDoc.send(new PutCommand({
            TableName: this.tableName,
            Item: {
              ...report,
              ttl: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60),
            },
          }));
          console.log(`[AWS DynamoDB] Stored report ${report.scanId} in ${this.tableName}`);
        } catch (err: any) {
          console.warn('[AWS DynamoDB] Failed to save report to DynamoDB:', err.message);
        }
      }
    }
  }
}
