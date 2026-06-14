param(
  [string]$Url = "https://plateforme-pi.vercel.app/api/webhook-geniuspay",
  [string]$Secret = "",
  [string]$UserId = "010307d9-46d8-435f-862e-e6cb6cbd6038",
  [int]$Amount = 1500
)

# Load .env if Secret not provided
if (-not $Secret) {
  $envFile = Join-Path (Get-Location) ".env"
  if (Test-Path $envFile) {
    Get-Content $envFile | ForEach-Object {
      if ($_ -match "^GENIUSPAY_WEBHOOK_SECRET=(.+)$") {
        $Secret = $matches[1]
      }
    }
  }
  if (-not $Secret) {
    $Secret = $env:GENIUSPAY_WEBHOOK_SECRET
  }
}

if (-not $Secret) {
  Write-Host "GENIUSPAY_WEBHOOK_SECRET not found in .env or env vars."
  exit 1
}

$timestamp = [int][double]::Parse((Get-Date -UFormat %s))

$payloadObj = @{
  event = "payment.success"
  data = @{
    reference = "SANDBOX_TEST"
    status = "success"
    amount = $Amount
    metadata = @{
      userId = $UserId
      user_id = $UserId
      kind = "abonnement"
      reference = "premium"
    }
  }
}

$raw = ($payloadObj | ConvertTo-Json -Depth 10 -Compress)

# Compute HMAC SHA256 of "<timestamp>.<raw>"
$toSign = "{0}.{1}" -f $timestamp, $raw
$secretBytes = [System.Text.Encoding]::UTF8.GetBytes($Secret)
$toSignBytes = [System.Text.Encoding]::UTF8.GetBytes($toSign)

# Correct .NET constructor usage for HMAC with key
$hmac = [System.Security.Cryptography.HMACSHA256]::new($secretBytes)
$sigBytes = $hmac.ComputeHash($toSignBytes)
$sigHex = ([System.BitConverter]::ToString($sigBytes)).Replace("-","").ToLower()

Write-Host "Timestamp: $timestamp"
Write-Host "Signature: $sigHex"
Write-Host "Payload: $raw"

$headers = @{
  "x-webhook-signature" = $sigHex
  "x-webhook-timestamp" = "$timestamp"
  "x-webhook-event"     = "payment.success"
}

try {
  Write-Host "`nSending POST to $Url ..."
  $resp = Invoke-RestMethod -Uri $Url -Method Post -Headers $headers -Body $raw -ContentType 'application/json' -Verbose
  Write-Host "`nResponse object:"
  $resp | ConvertTo-Json -Depth 5
} catch {
  Write-Host "`nRequest failed:"
  $_ | Format-List -Force
  exit 2
}