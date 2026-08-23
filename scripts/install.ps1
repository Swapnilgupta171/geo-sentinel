# Kairo (GeoSentinel) Automated Installer for Windows PowerShell
$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "==================================================" -ForegroundColor Green
Write-Host "          Kairo — AI Reputation Setup             " -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Green
Write-Host ""

# 1. Check Node.js
try {
    $nodeVer = node -v
    Write-Host "✓ Node.js detected: $nodeVer" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Node.js is not installed. Please install Node.js (>= 20.14.0) and try again." -ForegroundColor Red
    exit 1
}

# 2. Install Dependencies
Write-Host ""
Write-Host "Installing dependencies via npm..." -ForegroundColor Yellow
npm install

# 3. Initialize .env.local safely
if (-not (Test-Path ".env.local")) {
    Write-Host ""
    Write-Host "Creating .env.local from template..." -ForegroundColor Yellow
    if (Test-Path ".env.example") {
        Copy-Item ".env.example" ".env.local"
    } else {
        Set-Content ".env.local" "BRIGHT_DATA_API_TOKEN=`nBRIGHT_DATA_COLLECTOR_ID=`nOPENAI_API_KEY="
    }
    Write-Host "✓ Created .env.local" -ForegroundColor Green
} else {
    Write-Host "✓ Existing .env.local preserved (will not overwrite secrets)" -ForegroundColor Green
}

# 4. Run System Doctor
Write-Host ""
node scripts/doctor.js

Write-Host ""
Write-Host "==================================================" -ForegroundColor Green
Write-Host " Setup complete! Next steps:" -ForegroundColor White
Write-Host " 1. Edit .env.local to add your API credentials:" -ForegroundColor White
Write-Host "    - BRIGHT_DATA_API_TOKEN" -ForegroundColor Gray
Write-Host "    - BRIGHT_DATA_COLLECTOR_ID" -ForegroundColor Gray
Write-Host "    - OPENAI_API_KEY" -ForegroundColor Gray
Write-Host " 2. Launch local development server:" -ForegroundColor White
Write-Host "    npm run dev" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Green
Write-Host ""
