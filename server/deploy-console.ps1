# PowerShell script to create deployment ZIP for Elastic Beanstalk Console
# Run this from the project root (not the server directory)

Write-Host "Building TypeScript..." -ForegroundColor Green
if (Test-Path "server") {
    cd server
    npm run build
    cd ..
} else {
    Write-Host "Error: server directory not found. Run this from the project root." -ForegroundColor Red
    exit 1
}

Write-Host "Creating deployment package..." -ForegroundColor Green

# Get all files in server directory, excluding specific patterns
$filesToInclude = @()
Get-ChildItem -Path server -Recurse -File | ForEach-Object {
    $relativePath = $_.FullName.Replace((Get-Location).Path + "\", "")
    $exclude = $false
    
    # Check if file should be excluded
    if ($relativePath -match "\\node_modules\\" -or 
        $relativePath -match "\\.git\\" -or
        $relativePath -match "\\dist\\" -or
        $relativePath -match "\.db$" -or
        $relativePath -match "\.log$" -or
        $relativePath -match "\.env") {
        $exclude = $true
    }
    
    if (-not $exclude) {
        $filesToInclude += $_.FullName
    }
}

# Create ZIP file
if (Test-Path "server-deploy.zip") {
    Remove-Item "server-deploy.zip" -Force
}

Compress-Archive -Path $filesToInclude -DestinationPath server-deploy.zip -Force

Write-Host "`nDeployment package created: server-deploy.zip" -ForegroundColor Green
Write-Host "`nNext steps:" -ForegroundColor Yellow
Write-Host "1. Go to AWS Elastic Beanstalk Console"
Write-Host "2. Select your environment"
Write-Host "3. Click 'Upload and deploy'"
Write-Host "4. Upload server-deploy.zip"
Write-Host "5. Add a version label and deploy"
