# Creates a Desktop shortcut that runs the bundled run-app script
# Usage (after extracting the repo zip):
#   Right-click the script and select 'Run with PowerShell' (or run from an elevated shell)

$ShortcutPath = Join-Path -Path ([Environment]::GetFolderPath('Desktop')) -ChildPath 'All4Polo-AISaas - Run.lnk'
$WshShell = New-Object -ComObject WScript.Shell
$Shortcut = $WshShell.CreateShortcut($ShortcutPath)

# Make the shortcut run PowerShell which executes run-app.ps1 inside the repo folder
$RepoRoot = (Get-Location).Path
$Shortcut.TargetPath = "C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe"
$Shortcut.Arguments = "-NoProfile -ExecutionPolicy Bypass -File `"$RepoRoot\\scripts\\run-app.ps1`""
$Shortcut.WorkingDirectory = $RepoRoot
$Shortcut.IconLocation = "${RepoRoot}\\icon.ico"
$Shortcut.Save()

Write-Host "Shortcut created at: $ShortcutPath"