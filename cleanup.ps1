# PowerShell script to clean up and reinstall dependencies

# Stop any running Node.js processes
Write-Host "Stopping any running Node.js processes..."
Stop-Process -Name "node" -Force -ErrorAction SilentlyContinue

# Remove node_modules directories
Write-Host "Removing node_modules directories..."
Remove-Item -Path ".\node_modules" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path ".\Client\node_modules" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path ".\Server\node_modules" -Recurse -Force -ErrorAction SilentlyContinue

# Remove package-lock.json files
Write-Host "Removing package-lock.json files..."
Remove-Item -Path ".\package-lock.json" -Force -ErrorAction SilentlyContinue
Remove-Item -Path ".\Client\package-lock.json" -Force -ErrorAction SilentlyContinue
Remove-Item -Path ".\Server\package-lock.json" -Force -ErrorAction SilentlyContinue

# Remove root package.json (keep client and server ones)
Write-Host "Removing root package.json..."
Remove-Item -Path ".\package.json" -Force -ErrorAction SilentlyContinue

Write-Host "Cleanup complete!"
Write-Host ""
Write-Host "To reinstall dependencies, run:"
Write-Host "1. cd Server && npm install"
Write-Host "2. cd ..\Client && npm install"
