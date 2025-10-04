# Simple Deploy Script for GAS
Write-Host "🚀 Starting GAS Deploy..." -ForegroundColor Green

# Check directory
if (!(Test-Path "backend\gg\src\Code.js")) {
    Write-Host "❌ Code.js not found!" -ForegroundColor Red
    exit 1
}

# Go to backend directory
Set-Location "backend\gg"

# Push files
Write-Host "📤 Pushing files..." -ForegroundColor Cyan
clasp push --force

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Push successful!" -ForegroundColor Green
    
    # Deploy
    Write-Host "🚀 Deploying..." -ForegroundColor Cyan
    $timestamp = Get-Date -Format "yyyyMMddTHHmm"
    clasp deploy --description "V$timestamp-TestConnectionFix"
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Deploy successful!" -ForegroundColor Green
        
        # List deployments
        Write-Host "📋 Current deployments:" -ForegroundColor Yellow
        clasp deployments
    } else {
        Write-Host "❌ Deploy failed!" -ForegroundColor Red
    }
} else {
    Write-Host "❌ Push failed!" -ForegroundColor Red
}

# Return to original directory
Set-Location "..\..\"

Write-Host "🎉 Done! Test with: frontend\refactor\test-file-protocol.html" -ForegroundColor Green