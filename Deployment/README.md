# AWS Serverless Deployment Guide

This directory contains scripts and documentation for deploying the AI Codebase Doctor to AWS using the Serverless Application Model (SAM).

## Prerequisites

Before running the deployment scripts, ensure you have the following installed:

- **AWS CLI**: Version 2.x or higher
- **AWS SAM CLI**: Version 1.90+ (Serverless Application Model)
- **Node.js**: v18 or higher
- **Google Gemini API Key**: For AI-powered code auditing

## Installation

### AWS CLI
```bash
# macOS
brew install awscli

# Linux
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install
```

### AWS SAM CLI
```bash
# macOS/Linux
brew install aws/tap/aws-sam-cli

# Verify
sam --version
```

## Deployment Steps

### Linux / macOS (deploy_aws.sh)
```bash
chmod +x deploy_aws.sh
./deploy_aws.sh
```

### Windows (deploy_aws.bat)
```cmd
deploy_aws.bat
```

Both scripts perform the following 4-step pipeline:

1. **Build**: Compile frontend assets and backend TypeScript
2. **Validate**: Verify SAM template syntax and resource definitions
3. **Package**: Build SAM serverless artifacts and Lambda layers
4. **Deploy**: Provision AWS infrastructure (S3, Lambda, DynamoDB, CloudWatch)

## Resources Provisioned

Each deployment creates the following AWS resources via CloudFormation:

| Service | Resource | Purpose |
| --- | --- | --- |
| S3 | `codebase-doctor-archives-*` | Repository ZIP storage & report exports |
| Lambda | `ai-codebase-doctor-*` | Core scan orchestration runtime |
| DynamoDB | `CodebaseDoctorScans` | Scan metadata, health scores, and patches |
| CloudWatch | Namespace `CodebaseDoctor` | Custom metrics (`ScansCompleted`, `HealthScore`, etc.) |
| API Gateway | HTTP API | REST endpoints for Web UI / CLI integration |

## Environment Variables

The deployment scripts automatically load the following from your project `.env`:

```env
GEMINI_API_KEY=your_gemini_api_key
AWS_REGION=us-east-1
DYNAMODB_TABLE=CodebaseDoctorScans
S3_BUCKET=codebase-doctor-archives
```

## Post-Deployment

After successful deployment, the scripts output your API Gateway endpoint URL. You can:

1. Test the health check: `GET /api/health`
2. View CloudWatch metrics in the AWS Console
3. Check DynamoDB table for scan records
4. Download generated patches from the S3 bucket

## Cleanup

To remove all provisioned resources:
```bash
sam delete --stack-name ai-codebase-doctor
```
