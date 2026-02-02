# BookWise — Online Accounting Web App (WGU D424 Capstone)

BookWise is a full-stack online accounting web application. It supports true double-entry accounting using journal entries, role-based access control, account management (Chart of Accounts), search/filtering, and reporting.

## Live Demo (Deployed)

- **Web App:** https://bookwise-web.agreeablebay-fda76882.westus2.azurecontainerapps.io  
- **API (Swagger):** https://bookwise-api.agreeablebay-fda76882.westus2.azurecontainerapps.io/swagger

> The app is deployed on Microsoft Azure using containerized services.

---

## Features

### Authentication & Roles
- Register + login using ASP.NET Core Identity API endpoints
- Bearer token stored in browser localStorage
- Roles:
  - **Admin**: manage users + full access
  - **Bookkeeper**: manage accounts + create entries + run reports
  - **ReportViewer**: view data + run reports (read-only)
- Admin assigns roles to users via Admin UI and secured API

### Accounting (True Double-Entry)
- Source of truth: **Journal Entries** + **Journal Entry Lines**
- Validations:
  - minimum 2 lines per entry
  - each line must have either **Debit** or **Credit** (not both)
  - **total debits must equal total credits**

### Chart of Accounts (CRUD)
- Create, edit, delete accounts with:
  - unique **Account Code**
  - name
  - type (Asset/Liability/Equity/Revenue/Expense)

> Note: Accounts referenced by posted entries are protected by database constraints (data integrity).

### Transactions Hub + Search
- Search/filter journal entries with:
  - text search (description/reference/type)
  - date range filters
- Multi-row result display

### Reports
- Income / Expense / Chart / Custom reports
- Reports include:
  - title
  - generated date-time stamp
  - multi-row & multi-column tables

---

## Tech Stack

**Frontend**
- Angular (standalone components)
- SCSS styling
- Runtime configuration via `app-config.json`

**Backend**
- ASP.NET Core Web API (.NET 8)
- Entity Framework Core (SQL Server)
- ASP.NET Core Identity + Role-based authorization

**Database**
- Azure SQL Database

**Deployment**
- Docker containers
- Azure Container Registry (ACR)
- Azure Container Apps
- Deployment automation via PowerShell script

---

## Architecture Overview

**Frontend (Angular + nginx container)**  
- Served via nginx
- SPA routing support (refreshing `/accounts` works via nginx `try_files` fallback)
- Reads API base URL from runtime config:
  - `public/app-config.json`

**Backend (ASP.NET Core container)**  
- Exposes REST APIs + Identity endpoints
- Connects to Azure SQL using environment variable:
  - `ConnectionStrings__DefaultConnection`

---

## Repository Structure

```
/AccountingApp              # ASP.NET Core Web API (.NET 8)
/accounting-ng              # Angular standalone app
/Bookwise.Test              # Unit tests (xUnit)
/deployment-scripts         # Deployment automation scripts (PowerShell)
README.md
```

---

## Local Development Setup

### Prerequisites
- .NET SDK 8
- Node.js (LTS)
- npm
- Angular CLI
- SQL Server (LocalDB/SQL Express/Full SQL Server)
- Docker Desktop

### 1) Backend (API)
From the backend folder:
```bash
cd AccountingApp
dotnet restore
dotnet build
dotnet run
```

Local endpoints:
- API: `https://localhost:7119`
- Swagger: `https://localhost:7119/swagger`

### 2) Frontend (Angular)
From the frontend folder:
```bash
cd accounting-ng
npm install
ng serve
```

Local UI:
- `http://localhost:4200`

---

## Configuration

### Frontend API Base URL
BookWise uses runtime config:
- `accounting-ng/public/app-config.json`

Example:
```json
{
  "apiBaseUrl": "https://bookwise-api.agreeablebay-fda76882.westus2.azurecontainerapps.io"
}
```

### Backend Database Connection
Local dev uses `appsettings.json`, but production uses environment variables in Azure.

Environment variable used in Azure Container Apps:
- `ConnectionStrings__DefaultConnection`

---

## Deployment (Azure Containers)

### What’s deployed
- `bookwise-web` (nginx + Angular build)
- `bookwise-api` (ASP.NET Core Web API)
- ACR image registry: `bookwiseacr4821.azurecr.io`

### Deployment Automation Script
The repo includes a one-command deployment script in:
- `deployment-scripts/deploy-all.ps1`

Example usage:
```powershell
cd deployment-scripts
.\deploy-all.ps1 -ApiTag 1.4 -WebTag 1.3
```

This script:
1. logs in to Azure + ACR
2. builds and tags Docker images
3. pushes images to ACR
4. updates Azure Container Apps to new tags
5. prints deployed URLs and currently running image tags

---

## Testing

### Unit Tests (xUnit)
Unit tests live under:
- `Bookwise.Test`

Run:
```bash
dotnet test
```

---

## Notes
- The system enforces accounting correctness using:
  - backend validation rules
  - database referential integrity constraints (FK relationships)
- The deployed app demonstrates:
  - full-stack CRUD
  - secure role-based authorization
  - search with multi-row results
  - reporting with timestamps and structured output
  - container-based cloud deployment

---

## Acknowledgements
- Deployment and automation using Microsoft Azure + Docker
- Source control: GitLab / GitHub

