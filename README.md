# Mining Equipment Management System

Sistema web para la gestión de equipos mineros, control de horómetros y seguimiento de mantenimientos preventivos.

## 🚀 Demo en producción

- **Frontend:** https://mining-equipment-management-eta.vercel.app
- **Backend:** https://mining-equipment-api.onrender.com
- **Health Check:** https://mining-equipment-api.onrender.com/health

## 📋 Funcionalidades

- Registro, consulta, edición y eliminación de equipos mineros.
- Gestión de equipos por tipo: camiones, excavadoras y perforadoras.
- Control y actualización de horómetros.
- Identificación automática de equipos que requieren mantenimiento.
- Registro de mantenimientos realizados.
- Historial de mantenimientos por equipo.
- Reinicio del ciclo de mantenimiento al registrar uno nuevo.
- Validación de operaciones para preservar el historial de mantenimiento.

### Intervalos de mantenimiento

| Tipo de equipo | Intervalo |
|---|---:|
| Camión | 250 horas |
| Excavadora | 200 horas |
| Perforadora | 150 horas |

Un equipo requiere mantenimiento cuando las horas transcurridas desde su último mantenimiento alcanzan o superan el intervalo definido para su tipo.

## 🛠️ Tecnologías

### Frontend
- React 19
- TypeScript
- Vite
- React Router
- Recharts
- Lucide React

### Backend
- Java 21
- Spring Boot 4.0.9
- Spring Data JPA
- Hibernate
- Spring Validation
- Spring Boot Actuator
- Maven

### Base de datos
- PostgreSQL
- Neon
- Flyway para migraciones

### Infraestructura y despliegue
- Git y GitHub
- Vercel
- Render
- Docker
- PowerShell

## 🏗️ Arquitectura

El proyecto está organizado en dos aplicaciones independientes:

- `frontend/`: aplicación web desarrollada con React y Vite.
- `backend/`: API REST desarrollada con Spring Boot.
- `scripts/`: automatización del proceso de despliegue.
- `.env.example`: referencia de las variables de entorno necesarias.

La aplicación utiliza PostgreSQL como base de datos y Flyway para administrar la evolución del esquema.

## ⚙️ Requisitos previos

- Git
- Java 21
- Node.js y npm
- PostgreSQL (o una instancia PostgreSQL accesible)
- PowerShell en Windows

## 💻 Instalación y ejecución local

### 1. Clonar el repositorio

```bash
git clone https://github.com/AnndriuuW/mining-equipment-management.git
cd mining-equipment-management
```

### 2. Configurar el backend

Crear `backend/.env` utilizando como referencia `.env.example` y configurar las variables:

```env
DB_URL=jdbc:postgresql://localhost:5432/mining_equipment
DB_USERNAME=postgres
DB_PASSWORD=tu_password
SERVER_PORT=8080
FRONTEND_URL=http://localhost:5173
```

Crear una base de datos llamada `mining_equipment` o ajustar la URL a la base de datos existente.

Desde PowerShell, ejecutar:

```powershell
.\backend\run-local.ps1
```

Flyway ejecutará las migraciones pendientes al iniciar la aplicación.

### 3. Configurar el frontend

Crear `frontend/.env.local`:

```env
VITE_API_URL=http://localhost:8080/api
```

Instalar dependencias:

```powershell
cd frontend
npm install
```

Iniciar el servidor de desarrollo:

```powershell
npm run dev
```

El frontend estará disponible en:

`http://localhost:5173`

## 🔌 API REST

| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/api/equipment` | Listar equipos |
| GET | `/api/equipment/{id}` | Consultar equipo |
| POST | `/api/equipment` | Registrar equipo |
| PUT | `/api/equipment/{id}` | Actualizar equipo |
| DELETE | `/api/equipment/{id}` | Eliminar equipo |
| GET | `/api/equipment-types` | Listar tipos de equipo |
| GET | `/api/equipment-types/{id}` | Consultar tipo de equipo |
| POST | `/api/maintenance/equipment/{equipmentId}` | Registrar mantenimiento |
| GET | `/api/maintenance/equipment/{equipmentId}/history` | Consultar historial |

### Health Check

```http
GET /health
```

Permite verificar el estado de disponibilidad del backend.

## 🧪 Pruebas y compilación

### Backend

Desde la raíz del proyecto:

```powershell
.\backend\mvnw.cmd -f .\backend\pom.xml clean verify
```

### Frontend

```powershell
cd frontend
npm ci
npm run build
```

## 🚀 Despliegue automatizado

El proyecto incluye un script de PowerShell que centraliza el proceso de publicación del frontend y backend.

### Validar requisitos sin desplegar

Desde la raíz del proyecto:

```powershell
.\scripts\deploy.ps1 -CheckOnly
```

### Ejecutar despliegue completo

```powershell
.\scripts\deploy.ps1
```

El proceso realiza las siguientes operaciones:

1. Verifica las herramientas y variables de entorno.
2. Comprueba el estado y sincronización del repositorio Git.
3. Verifica la autenticación de Vercel y Render.
4. Ejecuta las pruebas y compilación del backend.
5. Instala dependencias y construye el frontend.
6. Publica el frontend en Vercel.
7. Solicita el despliegue del backend en Render.
8. Espera la finalización del despliegue.
9. Verifica el estado del backend mediante `/health`.
10. Comprueba la disponibilidad del frontend.

El script devuelve un código de salida `0` cuando el proceso finaliza correctamente y `1` cuando ocurre un error.

### Variables privadas para despliegue

El archivo `.env` de la raíz debe contener las credenciales necesarias para interactuar con la API de Render:

```env
RENDER_API_KEY=
RENDER_SERVICE_ID=
```

No se deben publicar credenciales ni archivos `.env` en el repositorio.

## 🤖 Uso de inteligencia artificial

Se utilizaron herramientas de inteligencia artificial como apoyo durante el desarrollo:

- ChatGPT: asistencia técnica, revisión de código, depuración y documentación.
- Codex: apoyo en la implementación y corrección del script de despliegue.

Las decisiones de implementación, validación y pruebas del proyecto fueron revisadas durante el desarrollo.

## 📄 Licencia

Proyecto desarrollado con fines de evaluación técnica.
