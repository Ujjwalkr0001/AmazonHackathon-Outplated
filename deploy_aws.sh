#!/usr/bin/env bash
set -e

echo "======================================================================"
echo "         AI CODEBASE DOCTOR - AWS SERVERLESS DEPLOYMENT"
echo "======================================================================"
echo ""

# Check AWS CLI
if ! command -v aws &> /dev/null; then
    echo "[ERROR] AWS CLI is not installed. Please install from https://aws.amazon.com/cli/"
    exit 1
fi

# Check SAM CLI
if ! command -v sam &> /dev/null; then
    echo "[ERROR] AWS SAM CLI is not installed. Please install from https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html"
    exit 1
fi

# Load Gemini API Key
if [ -f .env ]; then
    export $(grep -v '^#' .env | xargs)
fi

if [ -z "$GEMINI_API_KEY" ]; then
    read -sp "Enter your Google Gemini API Key: " GEMINI_API_KEY
    echo ""
fi

echo "[1/4] Building Frontend and Backend Artifacts..."
npm run build

echo ""
echo "[2/4] Validating AWS SAM Template..."
sam validate -t backend/template.yaml

echo ""
echo "[3/4] Building SAM Serverless Package..."
sam build -t backend/template.yaml

echo ""
echo "[4/4] Deploying to AWS Cloud (S3 + Lambda + DynamoDB + CloudWatch)..."
sam deploy \
  --stack-name ai-codebase-doctor \
  --parameter-overrides GeminiApiKey="$GEMINI_API_KEY" \
  --capabilities CAPABILITY_IAM \
  --resolve-s3

echo ""
echo "======================================================================"
echo "  DEPLOYMENT COMPLETE! Your Serverless Codebase Doctor is live on AWS!"
echo "======================================================================"
