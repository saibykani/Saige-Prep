# Starts a dedicated MongoDB for Saige-Prep with its data on a drive you choose.
# Useful when the system MongoDB's drive is low on space or you want Saige-Prep data isolated.
# Usage: powershell -ExecutionPolicy Bypass -File scripts\start-mongo.ps1 [-DataDir D:\saige-data] [-Port 27018]
param(
    [string]$DataDir = "D:\saige-data",
    [int]$Port = 27018,
    [string]$Mongod = "C:\Program Files\MongoDB\Server\8.2\bin\mongod.exe"
)

if (Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue) {
    Write-Output "Something is already listening on port $Port; assuming MongoDB is running."
    exit 0
}
if (-not (Test-Path $Mongod)) {
    Write-Error "mongod.exe not found at $Mongod. Pass -Mongod <path> or use docker compose."
    exit 1
}
New-Item -ItemType Directory -Force (Join-Path $DataDir "mongo") | Out-Null
Start-Process -WindowStyle Hidden -FilePath $Mongod -ArgumentList @(
    "--dbpath", (Join-Path $DataDir "mongo"),
    "--port", $Port,
    "--bind_ip", "127.0.0.1",
    "--logpath", (Join-Path $DataDir "mongod.log"),
    "--logappend"
)
Write-Output "MongoDB starting on 127.0.0.1:$Port (data: $DataDir\mongo). Set MONGODB_URI=mongodb://127.0.0.1:$Port in backend\.env."
