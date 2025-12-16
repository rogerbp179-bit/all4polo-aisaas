# Small helper to start the app on Windows after extracting the repo
# It will install deps if needed and run the dev script
Set-Location $PSScriptRoot\..  # move to repo root
if (-Not (Test-Path node_modules)) {
  Write-Host "Installing dependencies..."
  npm install
}
Write-Host "Starting app (npm run dev)..."
npm run dev
