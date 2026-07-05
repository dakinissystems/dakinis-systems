# Smoke DLQ monitor — Internal API BullMQ endpoints.
param(
    [string]$InternalUrl = $env:DAKINIS_INTERNAL_API_URL,
    [string]$ServiceKey = $env:DAKINIS_INTERNAL_SERVICE_KEY,
    [switch]$ReplayJobId
)

$ErrorActionPreference = "Stop"

if (-not $InternalUrl) {
    $InternalUrl = "http://127.0.0.1:4083"
}

if (-not $ServiceKey) {
    $ServiceKey = $env:DAKINIS_INTERNAL_API_KEY
}

$headers = @{}
if ($ServiceKey) {
    $headers.Authorization = "Bearer $ServiceKey"
}

function Invoke-Internal {
    param([string]$Path, [string]$Method = "GET", [object]$Body)
    $uri = "$($InternalUrl.TrimEnd('/'))$Path"
    $params = @{
        Uri     = $uri
        Method  = $Method
        Headers = $headers
    }
    if ($Body) {
        $params.Body = ($Body | ConvertTo-Json -Compress)
        $params.ContentType = "application/json"
    }
    Invoke-RestMethod @params
}

Write-Host "DLQ smoke — Internal API at $InternalUrl" -ForegroundColor Green

$health = Invoke-Internal "/health"
Write-Host "Health eventBus:" ($health.eventBus | ConvertTo-Json -Compress)

$status = Invoke-Internal "/events/bus/status"
Write-Host "Bus status enabled=$($status.enabled) dlqDepth=$($status.dlqDepth)"

$dlq = Invoke-Internal "/events/dlq?limit=5"
Write-Host "DLQ items: $($dlq.count) depth=$($dlq.depth)"
if ($dlq.items -and $dlq.items.Count -gt 0) {
    $dlq.items | ForEach-Object {
        Write-Host "  - $($_.id) $($_.eventType) queue=$($_.originalQueue) err=$($_.error)"
    }
}

if ($ReplayJobId) {
    Write-Host "Replaying job $ReplayJobId..." -ForegroundColor Cyan
    $replay = Invoke-Internal "/events/dlq/replay" "POST" @{ jobId = $ReplayJobId }
    Write-Host ($replay | ConvertTo-Json -Compress)
}

Write-Host ""
Write-Host "OK — DLQ monitor endpoints reachable" -ForegroundColor Green
