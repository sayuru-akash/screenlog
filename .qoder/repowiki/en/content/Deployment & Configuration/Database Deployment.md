# Database Deployment

<cite>
**Referenced Files in This Document**
- [schema.prisma](file://prisma/schema.prisma)
- [prisma.config.ts](file://prisma.config.ts)
- [package.json](file://package.json)
- [db.ts](file://src/lib/server/db.ts)
- [README.md](file://README.md)
- [SKILL.md](file://.agents/skills/neon-postgres/SKILL.md)
</cite>

## Table of Contents
1. [Introduction](#introduction)
2. [Project Structure](#project-structure)
3. [Core Components](#core-components)
4. [Architecture Overview](#architecture-overview)
5. [Detailed Component Analysis](#detailed-component-analysis)
6. [Dependency Analysis](#dependency-analysis)
7. [Performance Considerations](#performance-considerations)
8. [Troubleshooting Guide](#troubleshooting-guide)
9. [Conclusion](#conclusion)
10. [Appendices](#appendices)

## Introduction
This document provides comprehensive database deployment guidance for Screenlog with Prisma ORM and Neon PostgreSQL. It covers schema management, migration strategies, connection configuration, deployment automation, seeding, backups, disaster recovery, performance optimization, and monitoring. The project integrates Prisma with Neon’s serverless driver and uses a shared Prisma client instance across the application.

## Project Structure
The database stack centers on:
- Prisma schema defining models and relations
- Prisma configuration for migrations and datasource
- Neon PostgreSQL as the data source
- A shared Prisma client singleton for database access

```mermaid
graph TB
A["Prisma Schema<br/>prisma/schema.prisma"] --> B["Prisma Client<br/>src/lib/server/db.ts"]
C["Prisma Config<br/>prisma.config.ts"] --> A
B --> D["Neon PostgreSQL<br/>DATABASE_URL"]
```

**Diagram sources**
- [schema.prisma:1-258](file://prisma/schema.prisma#L1-L258)
- [prisma.config.ts:1-15](file://prisma.config.ts#L1-L15)
- [db.ts:1-11](file://src/lib/server/db.ts#L1-L11)

**Section sources**
- [schema.prisma:1-258](file://prisma/schema.prisma#L1-L258)
- [prisma.config.ts:1-15](file://prisma.config.ts#L1-L15)
- [db.ts:1-11](file://src/lib/server/db.ts#L1-L11)
- [README.md:27-82](file://README.md#L27-L82)

## Core Components
- Prisma schema defines authentication tables (User, Session, Account, Verification), content tables (Show, Season, Episode, Movie), user content associations (UserShow, UserMovie, EpisodeProgress), activity tracking (Activity), and user preferences (UserPreference). It includes indexes and enums for status tracking.
- Prisma configuration sets the schema path, migration directory, and reads the datasource URL from environment variables.
- Neon PostgreSQL is configured via the DATABASE_URL environment variable. The project depends on the Neon serverless driver and Prisma adapter for Neon.
- The Prisma client is initialized as a singleton to avoid multiple client instances and to improve connection reuse during development.

**Section sources**
- [schema.prisma:10-258](file://prisma/schema.prisma#L10-L258)
- [prisma.config.ts:6-14](file://prisma.config.ts#L6-L14)
- [package.json:26-45](file://package.json#L26-L45)
- [db.ts:4-10](file://src/lib/server/db.ts#L4-L10)
- [README.md:54-59](file://README.md#L54-L59)

## Architecture Overview
The application uses a serverless-first architecture with Neon. Prisma manages schema and migrations, while the Neon serverless driver handles connections. The Prisma client is globally cached in development to reduce overhead.

```mermaid
graph TB
subgraph "Application Runtime"
FE["SvelteKit Routes<br/>src/routes/*"]
SRV["Server Utilities<br/>src/lib/server/*"]
end
subgraph "Database Layer"
PRISMA["Prisma Client<br/>src/lib/server/db.ts"]
NEON["Neon PostgreSQL<br/>DATABASE_URL"]
end
FE --> SRV
SRV --> PRISMA
PRISMA --> NEON
```

**Diagram sources**
- [db.ts:1-11](file://src/lib/server/db.ts#L1-L11)
- [schema.prisma:5-8](file://prisma/schema.prisma#L5-L8)
- [README.md:54-59](file://README.md#L54-L59)

## Detailed Component Analysis

### Prisma Schema and Models
The schema defines:
- Authentication domain: User, Session, Account, Verification
- Content domain: Show, Season, Episode, Movie
- User-content relationships: UserShow, UserMovie, EpisodeProgress
- Activity and preferences: Activity, UserPreference
- Indexes and enums for efficient querying and status tracking

```mermaid
erDiagram
USER {
string id PK
string email UK
boolean emailVerified
string name
string image
datetime createdAt
datetime updatedAt
}
SESSION {
string id PK
string userId FK
datetime expiresAt
string ipAddress
string userAgent
string token UK
datetime createdAt
datetime updatedAt
}
ACCOUNT {
string id PK
string userId FK
string accountId
string providerId
string accessToken
string refreshToken
datetime accessTokenExpiresAt
datetime refreshTokenExpiresAt
string scope
string idToken
string password
datetime createdAt
datetime updatedAt
}
VERIFICATION {
string id PK
string identifier
string value
datetime expiresAt
datetime createdAt
datetime updatedAt
string userId FK
}
SHOW {
string id PK
int tmdbId UK
int tvMazeId UK
string title
string overview
string posterPath
string backdropPath
datetime firstAirDate
string status
string type
string[] genres
string language
string network
int runtime
datetime createdAt
datetime updatedAt
}
SEASON {
string id PK
string showId FK
int seasonNumber
string name
string overview
string posterPath
datetime airDate
int episodeCount
datetime createdAt
datetime updatedAt
}
EPISODE {
string id PK
string seasonId FK
int episodeNumber
int seasonNumber
string name
string overview
string stillPath
datetime airDate
int runtime
datetime createdAt
datetime updatedAt
}
MOVIE {
string id PK
int tmdbId UK
string title
string overview
string posterPath
string backdropPath
datetime releaseDate
int runtime
string[] genres
string language
string status
datetime createdAt
datetime updatedAt
}
USER_SHOW {
string id PK
string userId FK
string showId FK
enum showStatus
datetime addedAt
datetime updatedAt
}
USER_MOVIE {
string id PK
string userId FK
string movieId FK
enum movieStatus
datetime addedAt
datetime updatedAt
}
EPISODE_PROGRESS {
string id PK
string userId FK
string episodeId FK
datetime watchedAt
datetime updatedAt
}
ACTIVITY {
string id PK
string userId FK
string type
string showId
string movieId
string episodeId
string metadata
datetime createdAt
}
USER_PREFERENCE {
string id PK
string userId UK
string theme
string region
string language
string timezone
datetime createdAt
datetime updatedAt
}
USER ||--o{ SESSION : "owns"
USER ||--o{ ACCOUNT : "owns"
USER ||--o{ VERIFICATION : "owns"
USER ||--o{ USER_SHOW : "tracks"
USER ||--o{ USER_MOVIE : "tracks"
USER ||--o{ EPISODE_PROGRESS : "progress"
USER ||--o{ ACTIVITY : "generates"
USER ||--|| USER_PREFERENCE : "has"
SHOW ||--o{ SEASON : "contains"
SEASON ||--o{ EPISODE : "contains"
SHOW ||--o{ USER_SHOW : "tracked_by"
MOVIE ||--o{ USER_MOVIE : "tracked_by"
EPISODE ||--o{ EPISODE_PROGRESS : "progress_for"
```

**Diagram sources**
- [schema.prisma:11-258](file://prisma/schema.prisma#L11-L258)

**Section sources**
- [schema.prisma:11-258](file://prisma/schema.prisma#L11-L258)

### Prisma Configuration
- Schema location is set to prisma/schema.prisma.
- Migrations directory is prisma/migrations.
- Datasource URL is read from process.env.DATABASE_URL.

```mermaid
flowchart TD
Start(["Load Prisma Config"]) --> SetSchema["Set schema path"]
SetSchema --> SetMigrations["Set migrations path"]
SetMigrations --> ReadEnv["Read DATABASE_URL from env"]
ReadEnv --> End(["Config Ready"])
```

**Diagram sources**
- [prisma.config.ts:6-14](file://prisma.config.ts#L6-L14)

**Section sources**
- [prisma.config.ts:6-14](file://prisma.config.ts#L6-L14)

### Database Connection Management
- A global singleton pattern caches the Prisma client to avoid multiple instances.
- In non-production environments, the client is stored in a global object to support hot reloading.

```mermaid
sequenceDiagram
participant App as "Application"
participant DB as "db.ts"
participant PC as "PrismaClient"
App->>DB : Import db
DB->>PC : Initialize if not present
DB-->>App : Export cached db
Note over DB,PC : Global cache avoids multiple clients
```

**Diagram sources**
- [db.ts:4-10](file://src/lib/server/db.ts#L4-L10)

**Section sources**
- [db.ts:4-10](file://src/lib/server/db.ts#L4-L10)

### Neon PostgreSQL Setup and Connection Pooling
- The project uses @neondatabase/serverless and @prisma/adapter-neon.
- Connection pooling is recommended for serverless environments; use the -pooler hostname suffix for pooled connections.
- For serverless runtimes with bursty concurrency, pooling is essential.

```mermaid
graph TB
APP["Application"] --> ADAPTER["@prisma/adapter-neon"]
ADAPTER --> DRIVER["@neondatabase/serverless"]
DRIVER --> POOL["PgBouncer Pooling<br/>-pooler hostname"]
POOL --> DB["Neon PostgreSQL"]
```

**Diagram sources**
- [package.json:27-29](file://package.json#L27-L29)
- [SKILL.md:159-169](file://.agents/skills/neon-postgres/SKILL.md#L159-L169)

**Section sources**
- [package.json:27-29](file://package.json#L27-L29)
- [SKILL.md:159-169](file://.agents/skills/neon-postgres/SKILL.md#L159-L169)

### Migration Strategies
- Use the documented Prisma migration command to initialize the database.
- Keep migrations under version control in prisma/migrations.

```mermaid
flowchart TD
Dev["Developer"] --> Cmd["Run Prisma migrate dev"]
Cmd --> Init["Initialize DB with schema"]
Init --> Review["Review generated migration files"]
Review --> Commit["Commit to version control"]
```

**Diagram sources**
- [README.md:61-64](file://README.md#L61-L64)

**Section sources**
- [README.md:61-64](file://README.md#L61-L64)

### Deployment Automation
- Set DATABASE_URL in your hosting environment.
- Use the standard Prisma migration command during deployment to apply schema changes.
- Ensure the Prisma client is bundled with the application build.

```mermaid
sequenceDiagram
participant CI as "CI/CD Pipeline"
participant Host as "Hosting Provider"
participant DB as "Neon PostgreSQL"
CI->>Host : Deploy application
CI->>Host : Set DATABASE_URL
CI->>Host : Run Prisma migration
Host->>DB : Apply schema changes
Host-->>CI : Deployment success
```

**Diagram sources**
- [README.md:54-59](file://README.md#L54-L59)
- [README.md:61-64](file://README.md#L61-L64)

**Section sources**
- [README.md:54-59](file://README.md#L54-L59)
- [README.md:61-64](file://README.md#L61-L64)

### Database Seeding Strategies
- Seed data can be added via Prisma seed scripts or manual SQL insertions.
- Keep seeds deterministic and idempotent for repeatable environments.

[No sources needed since this section provides general guidance]

### Backup Procedures and Disaster Recovery
- Use Neon’s branching and instant restore for point-in-time recovery.
- Branches can be created from historical points-in-time for recovery scenarios.

```mermaid
flowchart TD
A["Enable Branching/Instant Restore"] --> B["Create branch from point-in-time"]
B --> C["Test recovery in staging"]
C --> D["Promote branch to main if needed"]
```

**Diagram sources**
- [SKILL.md:135-145](file://.agents/skills/neon-postgres/SKILL.md#L135-L145)

**Section sources**
- [SKILL.md:135-145](file://.agents/skills/neon-postgres/SKILL.md#L135-L145)

### Monitoring and Observability
- Monitor query performance and connection usage through Neon’s observability features.
- Track slow queries and optimize indexes as needed.

[No sources needed since this section provides general guidance]

## Dependency Analysis
The project depends on Prisma and Neon for database operations. The adapter bridges Prisma and the Neon driver.

```mermaid
graph TB
Pkg["package.json"] --> Prisma["@prisma/client"]
Pkg --> Adapter["@prisma/adapter-neon"]
Pkg --> Neon["@neondatabase/serverless"]
Prisma --> Adapter
Adapter --> Neon
```

**Diagram sources**
- [package.json:26-45](file://package.json#L26-L45)

**Section sources**
- [package.json:26-45](file://package.json#L26-L45)

## Performance Considerations
- Use connection pooling for serverless runtimes with bursty concurrency.
- Optimize queries with existing indexes (e.g., Activity table index on userId and createdAt).
- Keep migrations minimal and incremental to reduce downtime during deployments.

**Section sources**
- [SKILL.md:159-169](file://.agents/skills/neon-postgres/SKILL.md#L159-L169)
- [schema.prisma:240](file://prisma/schema.prisma#L240)

## Troubleshooting Guide
- Verify DATABASE_URL format and connectivity to Neon.
- Ensure Prisma migrations are applied before starting the application.
- In development, confirm the singleton client is reused to avoid connection thrash.

**Section sources**
- [README.md:54-59](file://README.md#L54-L59)
- [README.md:61-64](file://README.md#L61-L64)
- [db.ts:4-10](file://src/lib/server/db.ts#L4-L10)

## Conclusion
Screenlog leverages Prisma and Neon PostgreSQL for a scalable, serverless backend. By following the migration and deployment strategies outlined here, and applying the performance and monitoring recommendations, you can maintain a reliable and efficient database infrastructure.

## Appendices
- Environment variables: DATABASE_URL, BETTER_AUTH_SECRET, BETTER_AUTH_URL, TMDB_API_KEY, TVMAZE_API_KEY.

**Section sources**
- [README.md:73-82](file://README.md#L73-L82)