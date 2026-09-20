import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, GetCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { ProjectHealthReport, ScanStatus } from '../types/doctor.js';

export class AwsDoctorService {
  private s3: S3Client | null = null;
  private ddbDoc: DynamoDBDocumentClient | null = null;
  private bucketName: string;
  private tableName: string;
  private region: string;

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
        console.log(`[AWS] Codebase Doctor initialized with region: ${this.region}, S3: ${this.bucketName}, DynamoDB: ${this.tableName}`);
      } catch (err) {
        console.warn('[AWS] Failed to initialize S3/DynamoDB clients, running in local fallback mode:', err);
      }
    } else {
      console.log('[AWS] No AWS credentials provided in .env, running in seamless local fallback mode.');
    }
  }
}
