# 🚀 Deploy Script for GAS Refactor
# Run this after making changes to push and deploy to GAS

Write-Host "🔄 Starting GAS Deploy Process..." -ForegroundColor Green
Write-Host "📂 Current Directory: $(Get-Location)" -ForegroundColor Yellow

# Check if we're in the correct directory
if (!(Test-Path "backend\gg\src\Code.js")) {
    Write-Host "❌ Error: Code.js not found. Make sure you're in the CompoundInterateAppsheet directory" -ForegroundColor Red
    Write-Host "📂 Expected: D:\CompoundInterateAppsheet" -ForegroundColor Yellow
    exit 1
}

# Step 1: Check clasp status
Write-Host "📋 Step 1: Checking clasp status..." -ForegroundColor Cyan
try {
    clasp status
    if ($LASTEXITCODE -ne 0) {
        Write-Host "⚠️  Warning: clasp status failed, but continuing..." -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠️  Warning: clasp command issue, but continuing..." -ForegroundColor Yellow
}

# Step 2: Push to GAS
Write-Host "📤 Step 2: Pushing files to GAS..." -ForegroundColor Cyan
try {
    Set-Location "backend\gg"
    clasp push --force
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Files pushed successfully!" -ForegroundColor Green
    } else {
        Write-Host "❌ Push failed!" -ForegroundColor Red
        Set-Location "..\..\"
        exit 1
    }
} catch {
    Write-Host "❌ Error during push: $($_.Exception.Message)" -ForegroundColor Red
    Set-Location "..\..\"
    exit 1
}

# Step 3: Deploy new version
Write-Host "🚀 Step 3: Creating new deployment..." -ForegroundColor Cyan
$deploymentDescription = "V$(Get-Date -Format 'yyyyMMddTHHmm')-RefactorWithTestConnection"
Write-Host "📝 Deployment Description: $deploymentDescription" -ForegroundColor Yellow

try {
    $deployResult = clasp deploy --description $deploymentDescription 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Deployment created successfully!" -ForegroundColor Green
        Write-Host "📄 Deploy Result:" -ForegroundColor Yellow
        Write-Host $deployResult -ForegroundColor White
        
        # Extract deployment ID if possible
        if ($deployResult -match "AK[a-zA-Z0-9_-]+") {
            $deploymentId = $matches[0]
            Write-Host "🆔 New Deployment ID: $deploymentId" -ForegroundColor Green
        }
    } else {
        Write-Host "❌ Deployment failed!" -ForegroundColor Red
        Write-Host "📄 Error Details:" -ForegroundColor Yellow
        Write-Host $deployResult -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Error during deployment: $($_.Exception.Message)" -ForegroundColor Red
}

# Step 4: List deployments
Write-Host "📋 Step 4: Listing all deployments..." -ForegroundColor Cyan
try {
    clasp deployments
} catch {
    Write-Host "⚠️  Warning: Could not list deployments" -ForegroundColor Yellow
}

# Return to original directory
Set-Location "..\..\"

Write-Host "" -ForegroundColor White
Write-Host "🎉 Deploy process completed!" -ForegroundColor Green
Write-Host "📝 Next steps:" -ForegroundColor Yellow
Write-Host "   1. Test the new deployment with: test-file-protocol.html" -ForegroundColor White
Write-Host "   2. Update deployment ID in your test files if needed" -ForegroundColor White
Write-Host "   3. Test connection, testConnection endpoint, and login" -ForegroundColor White
Write-Host "" -ForegroundColor White

# Optional: Open test file
$testFile = "frontend\refactor\test-file-protocol.html"
if (Test-Path $testFile) {
    $openTest = Read-Host "🌐 Open test file? (y/N)"
    if ($openTest -eq "y" -or $openTest -eq "Y") {
        Start-Process $testFile
        Write-Host "🚀 Test file opened in browser!" -ForegroundColor Green
    }
}

Write-Host "✅ Deploy script finished!" -ForegroundColor Green