@echo off
setlocal enabledelayedexpansion

echo ======================================================================
echo          AI CODEBASE DOCTOR - AWS SERVERLESS DEPLOYMENT
echo ======================================================================
echo.

:: 1. Check AWS CLI
where aws >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] AWS CLI is not installed or not in PATH.
    echo Please install AWS CLI from: https://aws.amazon.com/cli/
    exit /b 1
)

:: 2. Check SAM CLI
where sam >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] AWS SAM CLI is not installed or not in PATH.
    echo Please install AWS SAM CLI from: https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html
    exit /b 1
)

:: 3. Read GEMINI_API_KEY from .env if present
set GEMINI_KEY=
if exist .env (
    for /f "tokens=1,2 delims==" %%a in (.env) do (
        if "%%a"=="GEMINI_API_KEY" set GEMINI_KEY=%%b
    )
)

if "%GEMINI_KEY%"=="" (
    set /p GEMINI_KEY="Enter your Google Gemini API Key: "
)

echo [1/4] Building Frontend and Backend Artifacts...
call npm run build
if %errorlevel% neq 0 (
    echo [ERROR] Build failed!
    exit /b 1
)

echo.
echo [2/4] Validating AWS SAM Template...
sam validate -t backend\template.yaml
if %errorlevel% neq 0 (
    echo [ERROR] SAM Template validation failed!
    exit /b 1
)

echo.
echo [3/4] Building SAM Serverless Package...
sam build -t backend\template.yaml
if %errorlevel% neq 0 (
    echo [ERROR] SAM build failed!
    exit /b 1
)

echo.
echo [4/4] Deploying to AWS Cloud (S3 + Lambda + DynamoDB + CloudWatch)...
sam deploy --stack-name ai-codebase-doctor --parameter-overrides GeminiApiKey=%GEMINI_KEY% --capabilities CAPABILITY_IAM --resolve-s3

echo.
echo ======================================================================
echo   DEPLOYMENT COMPLETE! Check the outputs above for your HTTP API URL.
echo ======================================================================
pause
