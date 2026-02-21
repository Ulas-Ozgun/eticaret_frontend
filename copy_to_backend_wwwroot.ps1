# Backend wwwroot klasörüne resimleri kopyalama scripti
# Kullanım: .\copy_to_backend_wwwroot.ps1 -BackendPath "C:\path\to\backend\wwwroot"

param(
    [Parameter(Mandatory=$true)]
    [string]$BackendPath
)

$SourcePath = Join-Path $PSScriptRoot "public\images"
$DestPath = Join-Path $BackendPath "images"

if (-not (Test-Path $SourcePath)) {
    Write-Host "❌ Kaynak klasör bulunamadı: $SourcePath" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path $BackendPath)) {
    Write-Host "📁 Backend wwwroot klasörü oluşturuluyor: $BackendPath" -ForegroundColor Yellow
    New-Item -ItemType Directory -Path $BackendPath -Force | Out-Null
}

Write-Host "📦 Resimler kopyalanıyor..." -ForegroundColor Cyan
Write-Host "   Kaynak: $SourcePath"
Write-Host "   Hedef: $DestPath"

# Tüm alt klasörleri kopyala
Get-ChildItem -Path $SourcePath -Recurse -Directory | ForEach-Object {
    $RelativePath = $_.FullName.Substring($SourcePath.Length + 1)
    $DestDir = Join-Path $DestPath $RelativePath
    
    if (-not (Test-Path $DestDir)) {
        New-Item -ItemType Directory -Path $DestDir -Force | Out-Null
    }
}

# Dosyaları kopyala
$FileCount = 0
Get-ChildItem -Path $SourcePath -Recurse -File | ForEach-Object {
    $RelativePath = $_.FullName.Substring($SourcePath.Length + 1)
    $DestFile = Join-Path $DestPath $RelativePath
    
    Copy-Item -Path $_.FullName -Destination $DestFile -Force
    $FileCount++
    
    if ($FileCount % 100 -eq 0) {
        Write-Host "   $FileCount dosya kopyalandı..." -ForegroundColor Gray
    }
}

Write-Host "✅ $FileCount resim başarıyla kopyalandı!" -ForegroundColor Green
Write-Host "📁 Hedef: $DestPath" -ForegroundColor Cyan




