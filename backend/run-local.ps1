
$ErrorActionPreference = "Stop"

# Ubicarse en la carpeta backend
Set-Location $PSScriptRoot

# Verificar que exista el archivo .env
if (!(Test-Path ".env")) {
    Write-Error "No se encontro el archivo .env"
    exit 1
}

# Cargar variables de entorno
Get-Content ".env" | ForEach-Object {
    if ($_ -match '^\s*([^#][^=]*)=(.*)$') {
        $name = $matches[1].Trim()
        $value = $matches[2].Trim()

        [Environment]::SetEnvironmentVariable(
            $name,
            $value,
            "Process"
        )
    }
}

Write-Host "Variables de entorno cargadas correctamente."

# Ejecutar Spring Boot
& ".\mvnw.cmd" spring-boot:run

if ($LASTEXITCODE -ne 0) {
    exit $LASTEXITCODE
}
