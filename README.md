# MediTrack

A small clinic app where staff sign in, manage patients and book appointments.

| Layer | Technology |
| --- | --- |
| Client | Angular 21 (standalone components, signals, zoneless) in `apps/web` |
| Server | NestJS 11 + TypeORM in `apps/api` |
| Database | SQL Server 2022 (Docker locally, Azure SQL in the cloud) |
| Tooling | npm workspaces monorepo, Docker, GitHub Actions |

> Use fake data only. This project is for learning and must never hold real patient information.

## Project structure

```text
meditrack/
├── apps/
│   ├── api/            NestJS REST API (http://localhost:3000/api)
│   └── web/            Angular client (http://localhost:4200)
├── db/init/            SQL setup script (database + app login)
├── .env.example        Template for environment variables
├── docker-compose.yml  Full stack in containers (optional)
└── package.json        Workspace root and shared scripts
```

## Prerequisites

- [Node.js 22 LTS](https://nodejs.org) (npm 10+)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/), running
- [SQL Server Management Studio](https://learn.microsoft.com/sql/ssms/) (optional, for browsing the database)
- Git

Check your setup:

```bash
node -v
docker version
```

## First-time setup

### 1. Clone and install

```bash
git clone https://github.com/Mbanks-lab46/meditrack.git
cd meditrack
npm install
```

Always run `npm install` from the **root** folder. The repo has a single `package-lock.json`; never install inside `apps/api` or `apps/web`.

### 2. Create your environment files

```bash
cp .env.example .env
cp .env.example apps/api/.env
```

On Windows PowerShell, use `copy` instead of `cp`. Then edit both files:

| Variable | Local value | Purpose |
| --- | --- | --- |
| `SA_PASSWORD` | A strong password | SQL Server admin password (Docker) |
| `DB_HOST` | `localhost` | Database server |
| `DB_PORT` | `1433` | Database port |
| `DB_NAME` | `MediTrack` | Database name |
| `DB_USER` | `meditrack_app` | App login created by the setup script |
| `DB_PASSWORD` | `App_Passw0rd_Local!` | Must match the password in `db/init/001_create_database.sql` |
| `DB_ENCRYPT` | `false` | `true` for Azure SQL |
| `DB_TRUST_CERT` | `true` | Accept the local container's self-signed certificate |
| `DB_MIGRATIONS_RUN` | `false` | `true` to apply migrations automatically on API start |
| `JWT_SECRET` | A long random string | Signs login tokens |
| `CORS_ORIGINS` | `http://localhost:4200` | Origins allowed to call the API |

`.env` files are git-ignored. Never commit real secrets.

### 3. Start SQL Server

```bash
docker run -d --name meditrack-sql \
  -e "ACCEPT_EULA=Y" \
  -e "MSSQL_SA_PASSWORD=<your SA_PASSWORD>" \
  -e "MSSQL_PID=Developer" \
  -p 1433:1433 \
  -v meditrack-sqldata:/var/opt/mssql \
  mcr.microsoft.com/mssql/server:2022-latest
```

In Git Bash on Windows, start the command with `MSYS_NO_PATHCONV=1` so Git Bash doesn't rewrite the Linux paths (`/var/opt/mssql`, `/tmp/...`) into Windows paths. This applies to the `docker cp` and `docker exec` commands in step 4 too:

```bash
MSYS_NO_PATHCONV=1 docker run -d --name meditrack-sql ...
```

Wait about 20 seconds, then check it is ready:

```bash
docker logs meditrack-sql 2>&1 | grep "ready for client connections"
```

The password must have at least 8 characters with upper case, lower case, a digit and a symbol, or the container exits.

### 4. Create the database and app login

Run `db/init/001_create_database.sql` once against the server:

- **SSMS:** connect to `localhost,1433` with SQL Server Authentication (`sa` + your password, tick **Trust server certificate**), then **File → Open → File**, pick the script and press **Execute**.
- **Command line:**

  ```bash
  docker cp db/init/001_create_database.sql meditrack-sql:/tmp/init.sql
  docker exec meditrack-sql /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "<your SA_PASSWORD>" -C -i /tmp/init.sql
  ```

The script is safe to run more than once.

### 5. Create the tables

```bash
npm run migration:run -w apps/api
```

This applies every migration in `apps/api/src/migrations`. In SSMS, refresh **MediTrack → Tables** to see `Users`, `Patients`, `Appointments` and `migrations`.

## Running the app (local development)

Start SQL Server if it isn't running:

```bash
docker start meditrack-sql
```

Then use two terminals, both in the repo root:

```bash
# Terminal 1: API on http://localhost:3000 (restarts on file changes)
npm run dev:api

# Terminal 2: Angular on http://localhost:4200 (reloads on file changes)
npm run dev:web
```

Open **http://localhost:4200**, click **Create account**, and sign in.

To make your account an admin, run this in SSMS against `MediTrack`:

```sql
UPDATE dbo.Users SET Role = 'admin' WHERE Email = 'you@example.test';
```

Sign out and back in for the new role to take effect.

### Useful URLs

| URL | What it is |
| --- | --- |
| http://localhost:4200 | Angular app |
| http://localhost:3000/api/docs | Swagger UI: try every API endpoint |
| http://localhost:3000/api/health | Health check (API + database) |
| `localhost,1433` | SQL Server, for SSMS |

### How the client reaches the API

During development, Angular's dev server forwards every `/api` request to the API using `apps/web/proxy.conf.json`:

```json
{ "/api": { "target": "http://127.0.0.1:3000", "secure": false } }
```

Always start the client with `npm run dev:web` so the proxy is active.

## Running with Docker Compose (optional)

Runs SQL Server, the database setup script, the API and the Angular app in containers with one command. Stop the standalone SQL container first so port 1433 is free:

```bash
docker stop meditrack-sql
docker compose up --build
```

Open **http://localhost:4200**. Migrations run automatically when the API container starts.

| Command | What it does |
| --- | --- |
| `docker compose up -d` | Start in the background |
| `docker compose ps` | Show status and health |
| `docker compose logs -f api` | Follow the API logs |
| `docker compose down` | Stop everything (data is kept) |
| `docker compose down -v` | Stop and delete the database volume |

## Scripts

Run these from the repo root.

| Command | What it does |
| --- | --- |
| `npm run dev:api` | Start the API in watch mode |
| `npm run dev:web` | Start the Angular dev server with the API proxy |
| `npm run build` | Build both apps |
| `npm test` | Run all unit tests |
| `npm run lint` | Lint both apps |
| `npm test -w apps/web -- --watch=false` | Run client tests once (as CI does) |
| `npm run build -w apps/api` | Type-check and build the API only |

### Database migrations

The tables are defined by TypeORM entities (`*.entity.ts`). To change the schema:

1. Edit an entity.
2. Generate a migration:
   ```bash
   npm run migration:generate -w apps/api -- src/migrations/DescribeYourChange
   ```
3. Read the generated file in `apps/api/src/migrations`.
4. Apply it:
   ```bash
   npm run migration:run -w apps/api
   ```
5. Commit the migration file with your entity change.

Undo the most recent migration with `npm run migration:revert -w apps/api`.

## Troubleshooting

| Problem | Fix |
| --- | --- |
| `Login failed for user 'meditrack_app'` | Run `docker logs meditrack-sql 2>&1 \| grep -i "login failed"` and read the `Reason:`. "Failed to open the explicitly specified database" means the database user is missing; re-run the setup script. "Password did not match" means `apps/api/.env` and the script disagree. |
| SSMS certificate error | Tick **Trust server certificate** (local container only). |
| SQL container stops right after starting | The SA password is too weak. Check `docker logs meditrack-sql`. |
| Port 1433 already in use | Another SQL Server is running. Stop it, or map another port (`-p 14330:1433`) and update `DB_PORT`. |
| `404 Cannot POST /api/...` from port 4200 | The dev proxy isn't active. Start the client with `npm run dev:web`, and make sure the proxy target is `127.0.0.1`, not `localhost`. |
| `401 Unauthorized` after signing in | Sign out, clear `meditrack_token` from the browser's Local Storage, and sign in again. Tokens expire after 1 hour. |
| `400 property X should not exist` | The field isn't declared in the API's DTO. Add it with a class-validator decorator. |
| `npm error ERESOLVE` when adding Nest packages | Pin to the installed major: `npm i -w apps/api @nestjs/<package>@^11`. |
| `Nest can't resolve dependencies of XService` | The module is missing `TypeOrmModule.forFeature([Entity])` or an import of the module that exports the service. |

## Deployment

`main` deploys automatically through GitHub Actions:

- **API:** Docker image pushed to GitHub Container Registry, then deployed to Azure Container Apps.
- **Client:** production build uploaded to Azure Static Web Apps.
- **Database:** Azure SQL Database (free offer); migrations run when the API starts.

Workflows live in `.github/workflows/`. Pull requests into `main` run CI (lint, tests, build and migrations against a temporary SQL Server) and must pass before merging.
