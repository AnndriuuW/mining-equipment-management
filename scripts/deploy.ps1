
# ============================================================
# MINING EQUIPMENT MANAGEMENT
# Despliegue automatizado: Vercel + Render
# ============================================================

param(
    [switch]$CheckOnly
)

$ErrorActionPreference = "Stop"

# Configuración
$ProjectRoot = Split-Path -Parent $PSScriptRoot
$FrontendUrl = "https://mining-equipment-management-eta.vercel.app"
$BackendUrl = "https://mining-equipment-api.onrender.com"
$VercelProjectId = "prj_KhXrQk7pl8v7IQM9lrJxptOf6n08"

function Write-Step {
    param([string]$Message)
    Write-Host "`n==> $Message" -ForegroundColor Cyan
}

function Stop-Deployment {
    param([string]$Message)
    Write-Host "`nERROR: $Message" -ForegroundColor Red
    exit 1
}

function Invoke-NativeCommand {
    param(
        [string]$Command,
        [string[]]$Arguments
    )

    & $Command @Arguments

    if ($LASTEXITCODE -ne 0) {
        throw "El comando '$Command' terminó con código $LASTEXITCODE."
    }
}

try {
    Set-Location $ProjectRoot

    # --------------------------------------------------------
    # 1. Verificar herramientas
    # --------------------------------------------------------

    Write-Step "Verificando herramientas necesarias"

    $RequiredCommands = @("git", "java", "node", "npm", "vercel")

    foreach ($Command in $RequiredCommands) {
        if (-not (Get-Command $Command -ErrorAction SilentlyContinue)) {
            throw "No se encontró la herramienta requerida: $Command"
        }

        Write-Host "OK: $Command"
    }

    if (-not (Test-Path ".\backend\mvnw.cmd")) {
        throw "No se encontró Maven Wrapper."
    }

    if (-not (Test-Path ".\frontend\package-lock.json")) {
        throw "No se encontró package-lock.json."
    }

    
# --------------------------------------------------------
# 2. Verificar configuración privada de Render
# --------------------------------------------------------

    Write-Step "Verificando configuración privada"

    $EnvFile = Join-Path $ProjectRoot ".env"

    if (-not (Test-Path $EnvFile)) {
        throw "No existe el archivo .env en la raíz del proyecto."
    }

    $EnvVariables = @{}

    foreach ($Line in Get-Content $EnvFile) {
        if ($Line -match '^\s*([A-Z_]+)\s*=(.*)$') {
            $EnvVariables[$Matches[1]] = $Matches[2].Trim()
        }
    }

    $RequiredEnv = @(
        "RENDER_API_KEY",
        "RENDER_SERVICE_ID"
    )

    foreach ($Name in $RequiredEnv) {
        if (-not $EnvVariables.ContainsKey($Name) -or
            [string]::IsNullOrWhiteSpace($EnvVariables[$Name])) {
            throw "Falta configurar $Name en .env."
        }
    }

    $RenderApiKey = $EnvVariables["RENDER_API_KEY"]
    $RenderServiceId = $EnvVariables["RENDER_SERVICE_ID"]

    if ($RenderServiceId -notmatch '^srv-[a-zA-Z0-9]+$') {
        throw "RENDER_SERVICE_ID no tiene un formato válido."
    }

    $RenderHeaders = @{
        Authorization = "Bearer $RenderApiKey"
        Accept = "application/json"
        "Content-Type" = "application/json"
    }

    Write-Host "Configuración de Render correcta."


    # --------------------------------------------------------
    # 3. Verificar Git
    # --------------------------------------------------------

    Write-Step "Verificando estado del repositorio"

    $Branch = (& git branch --show-current).Trim()

    if ($LASTEXITCODE -ne 0) {
        throw "No se pudo consultar la rama actual."
    }

    if ($Branch -ne "main") {
        throw "El despliegue solo se permite desde la rama main."
    }

    $GitStatus = & git status --porcelain

    if ($LASTEXITCODE -ne 0) {
        throw "No se pudo consultar el estado de Git."
    }

    if ($GitStatus) {
        throw "Hay cambios locales pendientes. Realiza commit antes de desplegar."
    }

    Invoke-NativeCommand "git" @("fetch", "origin")

    $SyncStatus = (& git rev-list --left-right --count "origin/main...HEAD").Trim()

    if ($LASTEXITCODE -ne 0) {
        throw "No se pudo comprobar la sincronización con origin/main."
    }

    if ($SyncStatus -ne "0`t0") {
        throw "La rama main no está sincronizada con origin/main. Ejecuta git pull o git push."
    }

    Write-Host "Repositorio limpio y sincronizado."

    # --------------------------------------------------------
    # 4. Verificar autenticación de Vercel
    # --------------------------------------------------------

    Write-Step "Verificando autenticación de Vercel"

    Invoke-NativeCommand "vercel" @("whoami")


    # --------------------------------------------------------
    # 4.1 Verificar acceso a la API de Render
    # --------------------------------------------------------

    Write-Step "Verificando acceso a la API de Render"

    $ServiceUrl = "https://api.render.com/v1/services/$RenderServiceId"

    $RenderService = Invoke-RestMethod `
        -Uri $ServiceUrl `
        -Method Get `
        -Headers $RenderHeaders `
        -TimeoutSec 30

    if ($RenderService.id -ne $RenderServiceId) {
        throw "Render devolvió un servicio diferente al esperado."
    }

    Write-Host "Render: autenticación y servicio verificados." -ForegroundColor Green

    # --------------------------------------------------------
    # 4.2 Modo de validación sin despliegue
    # --------------------------------------------------------

    if ($CheckOnly) {
        Write-Host "`n========================================" -ForegroundColor Green
        Write-Host " VALIDACIÓN COMPLETADA" -ForegroundColor Green
        Write-Host "========================================" -ForegroundColor Green

        Write-Host "Git: sincronizado"
        Write-Host "Vercel: autenticado"
        Write-Host "Render: autenticado"
        Write-Host "Credenciales: configuradas"
        Write-Host "No se realizó ningún despliegue."

        exit 0
    }

    # --------------------------------------------------------
    # 5. Compilar y probar backend
    # --------------------------------------------------------

    Write-Step "Ejecutando pruebas y compilación del backend"

    Invoke-NativeCommand ".\backend\mvnw.cmd" @(
        "-f", ".\backend\pom.xml",
        "clean",
        "verify"
    )

    # --------------------------------------------------------
    # 6. Compilar frontend
    # --------------------------------------------------------

    Write-Step "Instalando dependencias del frontend"

    Push-Location ".\frontend"

    try {
        Invoke-NativeCommand "npm" @("ci")

        Write-Step "Compilando frontend"

        Invoke-NativeCommand "npm" @("run", "build")
    }
    finally {
        Pop-Location
    }

    # --------------------------------------------------------
    # 7. Desplegar frontend en Vercel
    # --------------------------------------------------------

    Write-Step "Publicando frontend en Vercel"

    Invoke-NativeCommand "vercel" @(
        "deploy",
        "--prod",
        "--yes",
        "--project",
        $VercelProjectId
    )

   
    # --------------------------------------------------------
    # 8. Desplegar backend en Render mediante su API
    # --------------------------------------------------------

    Write-Step "Solicitando despliegue del backend en Render"

    $CommitSha = (& git rev-parse HEAD).Trim()

    if ($LASTEXITCODE -ne 0 -or -not $CommitSha) {
        throw "No se pudo obtener el commit actual."
    }

    $DeployBody = @{
        commitId = $CommitSha
        clearCache = "do_not_clear"
    } | ConvertTo-Json

    $DeployUrl = "https://api.render.com/v1/services/$RenderServiceId/deploys"

    $NewDeploy = Invoke-RestMethod `
        -Uri $DeployUrl `
        -Method Post `
        -Headers $RenderHeaders `
        -Body $DeployBody `
        -TimeoutSec 60

    $DeployId = $NewDeploy.id

    if ([string]::IsNullOrWhiteSpace($DeployId)) {
        throw "Render no devolvió el identificador del nuevo despliegue."
    }

    Write-Host "Despliegue solicitado correctamente."
    Write-Host "Commit: $CommitSha"
    Write-Host "ID del despliegue: $DeployId"

    # --------------------------------------------------------
    # 9. Esperar y verificar el despliegue de Render
    # --------------------------------------------------------

    Write-Step "Esperando que Render complete el despliegue"

    $DeployStatusUrl = "$DeployUrl/$DeployId"
    $Deadline = (Get-Date).AddMinutes(12)
    $RenderReady = $false

    $FailedStatuses = @(
        "build_failed",
        "update_failed",
        "pre_deploy_failed",
        "canceled",
        "deactivated"
    )

    while ((Get-Date) -lt $Deadline) {

        $DeployStatus = Invoke-RestMethod `
            -Uri $DeployStatusUrl `
            -Method Get `
            -Headers $RenderHeaders `
            -TimeoutSec 30

        $CurrentStatus = $DeployStatus.status

        Write-Host "Estado actual de Render: $CurrentStatus"

        if ($CurrentStatus -eq "live") {
            $RenderReady = $true
            break
        }

        if ($CurrentStatus -in $FailedStatuses) {
            throw "El despliegue de Render terminó con estado: $CurrentStatus"
        }

        Start-Sleep -Seconds 15
    }

    if (-not $RenderReady) {
        throw "Render no completó el despliegue dentro de los 12 minutos."
    }

    if ($DeployStatus.commit.id -and
        $DeployStatus.commit.id -ne $CommitSha) {
        throw "Render publicó un commit diferente al solicitado."
    }

    Write-Host "Render confirmó el nuevo despliegue: LIVE." -ForegroundColor Green

    # --------------------------------------------------------
    # 9.1 Verificar disponibilidad del backend
    # --------------------------------------------------------

    Write-Step "Verificando endpoint de salud"

    $Health = Invoke-RestMethod `
        -Uri "$BackendUrl/health" `
        -TimeoutSec 90

    if ($Health.status -ne "UP") {
        throw "El backend no reporta estado UP."
    }

    Write-Host "Backend: UP" -ForegroundColor Green

    # --------------------------------------------------------
    # 9.2 Verificar API de equipos
    # --------------------------------------------------------

    Write-Step "Verificando API de equipos"

    $Equipment = Invoke-RestMethod `
        -Uri "$BackendUrl/api/equipment" `
        -TimeoutSec 60

    Write-Host "API de equipos: responde correctamente."


    # --------------------------------------------------------
    # 10. Verificar frontend
    # --------------------------------------------------------

    Write-Step "Verificando frontend publicado"

    $FrontendResponse = Invoke-WebRequest `
        -Uri $FrontendUrl `
        -UseBasicParsing `
        -TimeoutSec 60

    if ($FrontendResponse.StatusCode -ne 200) {
        throw "El frontend no respondió con HTTP 200."
    }

    Write-Host "Frontend: HTTP 200" -ForegroundColor Green

    # --------------------------------------------------------
    # FINALIZACIÓN
    # --------------------------------------------------------

    Write-Host "`n========================================" -ForegroundColor Green
    Write-Host " DESPLIEGUE FINALIZADO CORRECTAMENTE" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green

    Write-Host "Frontend: $FrontendUrl"
    Write-Host "Backend:  $BackendUrl"
    Write-Host "Health:   $BackendUrl/health"

    exit 0
}
catch {
    Write-Host "`n========================================" -ForegroundColor Red
    Write-Host " DESPLIEGUE INTERRUMPIDO" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red

    Write-Host $_.Exception.Message -ForegroundColor Red

    exit 1
}
