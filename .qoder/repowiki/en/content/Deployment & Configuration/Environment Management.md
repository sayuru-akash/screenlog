# Environment Management

<cite>
**Referenced Files in This Document**
- [package.json](file://package.json)
- [prisma.config.ts](file://prisma.config.ts)
- [prisma/schema.prisma](file://prisma/schema.prisma)
- [src/lib/server/auth.ts](file://src/lib/server/auth.ts)
- [src/lib/server/db.ts](file://src/lib/server/db.ts)
- [src/hooks.server.ts](file://src/hooks.server.ts)
- [.agents/skills/better-auth-best-practices/SKILL.md](file://.agents/skills/better-auth-best-practices/SKILL.md)
- [.agents/skills/better-auth-security-best-practices/SKILL.MD](file://.agents/skills/better-auth-security-best-practices/SKILL.MD)
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
This document explains how Screenlog manages environment configuration and deployment environments. It focuses on:
- Required environment variables for authentication, database connectivity, and related services
- Environment-specific configuration patterns for development, staging, and production
- Secret management, configuration validation, and environment variable loading mechanisms
- Practical examples for .env file structure, Docker environment setup, and cloud platform configuration
- Security considerations and best practices for sensitive data

## Project Structure
Screenlog integrates environment-driven configuration across three primary areas:
- Authentication via Better Auth, which reads private environment variables
- Database connectivity via Prisma, which reads DATABASE_URL
- SvelteKit hooks that attach session context using Better Auth

```mermaid
graph TB
subgraph "Runtime"
Hooks["hooks.server.ts<br/>Attach session to locals"]
Auth["auth.ts<br/>Better Auth config"]
DB["db.ts<br/>Prisma client"]
end
subgraph "Configuration"
Env["Environment Variables"]
Dotenv["dotenv loaded by Prisma"]
Schema["schema.prisma<br/>env('DATABASE_URL')"]
end
Env --> Hooks
Env --> Auth
Env --> DB
Dotenv --> Schema
Schema --> DB
Auth --> DB
Hooks --> Auth
```

**Diagram sources**
- [src/hooks.server.ts:1-18](file://src/hooks.server.ts#L1-L18)
- [src/lib/server/auth.ts:1-27](file://src/lib/server/auth.ts#L1-L27)
- [src/lib/server/db.ts:1-11](file://src/lib/server/db.ts#L1-L11)
- [prisma.config.ts:1-15](file://prisma.config.ts#L1-L15)
- [prisma/schema.prisma:1-8](file://prisma/schema.prisma#L1-L8)

**Section sources**
- [src/hooks.server.ts:1-18](file://src/hooks.server.ts#L1-L18)
- [src/lib/server/auth.ts:1-27](file://src/lib/server/auth.ts#L1-L27)
- [src/lib/server/db.ts:1-11](file://src/lib/server/db.ts#L1-L11)
- [prisma.config.ts:1-15](file://prisma.config.ts#L1-L15)
- [prisma/schema.prisma:1-8](file://prisma/schema.prisma#L1-L8)

## Core Components
- Authentication service: Better Auth reads private environment variables for encryption secret and base URL. It also configures session behavior and cookie attributes.
- Database client: Prisma loads the data source URL from an environment variable and uses it to connect to PostgreSQL.
- SvelteKit hooks: The server hook fetches the current session and attaches user/session data to request locals for downstream handlers and pages.

Key environment variables:
- Authentication: BETTER_AUTH_SECRET, BETTER_AUTH_URL
- Database: DATABASE_URL

These variables are referenced in:
- Better Auth configuration
- Prisma configuration and schema
- SvelteKit server hooks

**Section sources**
- [src/lib/server/auth.ts:1-27](file://src/lib/server/auth.ts#L1-L27)
- [prisma.config.ts:11-14](file://prisma.config.ts#L11-L14)
- [prisma/schema.prisma:5-8](file://prisma/schema.prisma#L5-L8)
- [src/hooks.server.ts:4-17](file://src/hooks.server.ts#L4-L17)

## Architecture Overview
The environment configuration pipeline connects environment variables to runtime services:

```mermaid
sequenceDiagram
participant Proc as "Process"
participant Dotenv as "dotenv (Prisma)"
participant PrismaCfg as "prisma.config.ts"
participant Schema as "schema.prisma"
participant DB as "PrismaClient"
participant Auth as "Better Auth"
participant Hooks as "hooks.server.ts"
Proc->>Dotenv : Load .env (via Prisma)
Dotenv-->>Proc : Expose process.env.*
Proc->>PrismaCfg : Resolve datasource.url
PrismaCfg->>Schema : Read env("DATABASE_URL")
Schema-->>PrismaCfg : DATABASE_URL
PrismaCfg->>DB : Initialize with url
Proc->>Auth : Initialize with BETTER_AUTH_SECRET, BETTER_AUTH_URL
Hooks->>Auth : Get session from headers
Auth-->>Hooks : Session info
Hooks-->>Proc : event.locals.user/session
```

**Diagram sources**
- [prisma.config.ts:3-14](file://prisma.config.ts#L3-L14)
- [prisma/schema.prisma:5-8](file://prisma/schema.prisma#L5-L8)
- [src/lib/server/db.ts:1-11](file://src/lib/server/db.ts#L1-L11)
- [src/lib/server/auth.ts:4-24](file://src/lib/server/auth.ts#L4-L24)
- [src/hooks.server.ts:4-17](file://src/hooks.server.ts#L4-L17)

## Detailed Component Analysis

### Authentication Environment Management
Better Auth requires:
- A strong encryption secret for signing and encrypting tokens
- A base URL for the API origin, used for redirects and CORS/trusted origins

Environment variables:
- BETTER_AUTH_SECRET: Strong secret value
- BETTER_AUTH_URL: Base URL for the application

Behavior:
- Better Auth reads these variables at initialization
- The server hook retrieves the current session from request headers and exposes it to the request lifecycle

```mermaid
flowchart TD
Start(["Initialize Better Auth"]) --> ReadSecret["Read BETTER_AUTH_SECRET"]
ReadSecret --> ReadBaseURL["Read BETTER_AUTH_URL"]
ReadBaseURL --> Configure["Configure session, cookies, trusted origins"]
Configure --> Ready(["Auth ready"])
```

**Diagram sources**
- [src/lib/server/auth.ts:4-24](file://src/lib/server/auth.ts#L4-L24)

**Section sources**
- [src/lib/server/auth.ts:1-27](file://src/lib/server/auth.ts#L1-L27)
- [src/hooks.server.ts:4-17](file://src/hooks.server.ts#L4-L17)
- [.agents/skills/better-auth-best-practices/SKILL.md:15-29](file://.agents/skills/better-auth-best-practices/SKILL.md#L15-L29)

### Database Environment Management
Prisma loads the database URL from an environment variable and applies it during client initialization. The Prisma config imports dotenv to load .env values into process.env before reading the URL.

Key points:
- DATABASE_URL is read from process.env in both Prisma config and schema
- The Prisma client is globally cached in non-production environments to avoid reconnect overhead

```mermaid
flowchart TD
A["Load dotenv"] --> B["Resolve DATABASE_URL"]
B --> C["Prisma config datasource.url"]
C --> D["PrismaClient initialized"]
D --> E{"NODE_ENV != 'production'?"}
E --> |Yes| F["Cache PrismaClient globally"]
E --> |No| G["Use singleton per process"]
```

**Diagram sources**
- [prisma.config.ts:3-14](file://prisma.config.ts#L3-L14)
- [prisma/schema.prisma:5-8](file://prisma/schema.prisma#L5-L8)
- [src/lib/server/db.ts:1-11](file://src/lib/server/db.ts#L1-L11)

**Section sources**
- [prisma.config.ts:1-15](file://prisma.config.ts#L1-L15)
- [prisma/schema.prisma:1-8](file://prisma/schema.prisma#L1-L8)
- [src/lib/server/db.ts:1-11](file://src/lib/server/db.ts#L1-L11)

### SvelteKit Hook Integration
The server hook obtains the session from Better Auth using request headers and attaches user/session data to event.locals. This enables downstream handlers and pages to access authenticated context.

```mermaid
sequenceDiagram
participant Client as "Browser"
participant SvelteKit as "Server Hook"
participant Auth as "Better Auth"
participant Resolver as "Route Handler/Page"
Client->>SvelteKit : Request with Authorization headers
SvelteKit->>Auth : getSession({ headers })
Auth-->>SvelteKit : { user, session } or null
SvelteKit->>Resolver : resolve(event with event.locals.user/session)
Resolver-->>Client : Rendered response
```

**Diagram sources**
- [src/hooks.server.ts:4-17](file://src/hooks.server.ts#L4-L17)
- [src/lib/server/auth.ts:6-11](file://src/lib/server/auth.ts#L6-L11)

**Section sources**
- [src/hooks.server.ts:1-18](file://src/hooks.server.ts#L1-L18)
- [src/lib/server/auth.ts:1-27](file://src/lib/server/auth.ts#L1-L27)

## Dependency Analysis
Environment variables flow through the following dependency chain:
- dotenv (loaded by Prisma) populates process.env
- Prisma config reads DATABASE_URL from process.env
- Prisma schema references env("DATABASE_URL")
- Prisma client uses the resolved URL
- Better Auth reads BETTER_AUTH_SECRET and BETTER_AUTH_URL from process.env
- SvelteKit hooks use Better Auth to populate request locals

```mermaid
graph LR
Env[".env"] --> Dotenv["dotenv (Prisma)"]
Dotenv --> PEnv["process.env.*"]
PEnv --> DBURL["DATABASE_URL"]
PEnv --> AuthSecret["BETTER_AUTH_SECRET"]
PEnv --> AuthURL["BETTER_AUTH_URL"]
DBURL --> PrismaCfg["prisma.config.ts"]
DBURL --> Schema["schema.prisma"]
PrismaCfg --> DB["PrismaClient"]
Schema --> DB
AuthSecret --> Auth["Better Auth"]
AuthURL --> Auth
Auth --> Hooks["hooks.server.ts"]
```

**Diagram sources**
- [prisma.config.ts:3-14](file://prisma.config.ts#L3-L14)
- [prisma/schema.prisma:5-8](file://prisma/schema.prisma#L5-L8)
- [src/lib/server/db.ts:1-11](file://src/lib/server/db.ts#L1-L11)
- [src/lib/server/auth.ts:4-24](file://src/lib/server/auth.ts#L4-L24)
- [src/hooks.server.ts:4-17](file://src/hooks.server.ts#L4-L17)

**Section sources**
- [prisma.config.ts:1-15](file://prisma.config.ts#L1-L15)
- [prisma/schema.prisma:1-8](file://prisma/schema.prisma#L1-L8)
- [src/lib/server/db.ts:1-11](file://src/lib/server/db.ts#L1-L11)
- [src/lib/server/auth.ts:1-27](file://src/lib/server/auth.ts#L1-L27)
- [src/hooks.server.ts:1-18](file://src/hooks.server.ts#L1-L18)

## Performance Considerations
- Prisma client caching: In non-production environments, the Prisma client is cached globally to reduce repeated initialization overhead. This improves startup performance during development.
- Session retrieval: The server hook performs a single session lookup per request; keep middleware minimal to avoid latency.
- Environment loading: dotenv is imported by Prisma configuration, ensuring environment variables are available before Prisma attempts to connect.

[No sources needed since this section provides general guidance]

## Troubleshooting Guide
Common environment-related issues and resolutions:
- Missing or empty DATABASE_URL
  - Symptom: Prisma client fails to connect
  - Resolution: Ensure DATABASE_URL is present in .env and loaded by dotenv
- Missing BETTER_AUTH_SECRET or BETTER_AUTH_URL
  - Symptom: Authentication initialization errors or unexpected behavior
  - Resolution: Provide both variables; verify they are not empty and match expected formats
- Session not attached in hooks
  - Symptom: event.locals.user/session is null
  - Resolution: Confirm Better Auth is configured and the server hook is invoked; verify request headers contain valid session tokens
- Environment not loaded in Prisma
  - Symptom: Prisma cannot read DATABASE_URL
  - Resolution: Confirm dotenv is imported in prisma.config.ts and .env is present at runtime

**Section sources**
- [prisma.config.ts:3-14](file://prisma.config.ts#L3-L14)
- [prisma/schema.prisma:5-8](file://prisma/schema.prisma#L5-L8)
- [src/lib/server/auth.ts:4-24](file://src/lib/server/auth.ts#L4-L24)
- [src/hooks.server.ts:4-17](file://src/hooks.server.ts#L4-L17)

## Conclusion
Screenlog’s environment management centers on two pillars:
- Authentication: BETTER_AUTH_SECRET and BETTER_AUTH_URL drive secure session handling and origin configuration
- Database: DATABASE_URL powers Prisma connectivity and schema generation

By centralizing configuration in environment variables and leveraging dotenv through Prisma, the application achieves predictable, environment-aware behavior across development, staging, and production.

[No sources needed since this section summarizes without analyzing specific files]

## Appendices

### Environment Variable Reference
- BETTER_AUTH_SECRET: Strong secret used by Better Auth for cryptographic operations
- BETTER_AUTH_URL: Base URL for the application used by Better Auth for redirects and trusted origins
- DATABASE_URL: Connection string for the PostgreSQL database used by Prisma

**Section sources**
- [src/lib/server/auth.ts:4-24](file://src/lib/server/auth.ts#L4-L24)
- [prisma.config.ts:11-14](file://prisma.config.ts#L11-L14)
- [prisma/schema.prisma:5-8](file://prisma/schema.prisma#L5-L8)

### Environment-Specific Configuration Patterns
- Development
  - Use a local or ephemeral database URL
  - Set BETTER_AUTH_URL to localhost or a local reverse proxy
  - Keep BETTER_AUTH_SECRET as a strong, randomly generated value
- Staging
  - Point DATABASE_URL to a staging database
  - Set BETTER_AUTH_URL to the staging domain
  - Enforce strict trusted origins and secure cookies
- Production
  - Use a managed database URL with appropriate TLS
  - Set BETTER_AUTH_URL to the production domain
  - Enforce rate limiting, secure cookies, and encrypted session caching

[No sources needed since this section provides general guidance]

### Secret Management Best Practices
- Generate secrets securely and store them outside version control
- Prefer rotating secrets regularly and using platform-managed secret stores in production
- Avoid committing secrets to repositories or configuration files
- Use separate secrets for different environments

**Section sources**
- [.agents/skills/better-auth-best-practices/SKILL.md:25-28](file://.agents/skills/better-auth-best-practices/SKILL.md#L25-L28)
- [.agents/skills/better-auth-security-best-practices/SKILL.MD:6-28](file://.agents/skills/better-auth-security-best-practices/SKILL.MD#L6-L28)

### Configuration Validation and Loading Mechanisms
- dotenv is imported by Prisma configuration to load .env into process.env before Prisma reads DATABASE_URL
- Better Auth reads environment variables directly at initialization
- SvelteKit server hooks rely on Better Auth to resolve session state from request headers

**Section sources**
- [prisma.config.ts:3-14](file://prisma.config.ts#L3-L14)
- [src/lib/server/auth.ts:4-24](file://src/lib/server/auth.ts#L4-L24)
- [src/hooks.server.ts:4-17](file://src/hooks.server.ts#L4-L17)

### .env File Structure Example
- DATABASE_URL=postgresql://user:password@host:port/dbname?schema=public
- BETTER_AUTH_SECRET=<strong-secret-here>
- BETTER_AUTH_URL=https://your-app.com

[No sources needed since this section provides general guidance]

### Docker Environment Setup
- Mount a .env file or pass environment variables at container runtime
- Ensure the application runs with the correct NODE_ENV
- For development, expose ports and mount volumes for hot reload; for production, run with minimal privileges and readonly filesystems where possible

[No sources needed since this section provides general guidance]

### Cloud Platform Configuration
- Use platform-specific secret managers to inject environment variables at runtime
- For serverless or containerized platforms, configure environment variables via deployment interfaces
- Ensure network policies allow outbound connections to the database and any external services used by Better Auth

[No sources needed since this section provides general guidance]

### Security Considerations
- Treat BETTER_AUTH_SECRET and DATABASE_URL as secrets
- Restrict access to environment variables and logs
- Use HTTPS and secure cookies in production
- Implement rate limiting and trusted origins to mitigate common authentication threats
- Audit session creation and user updates for suspicious activity

**Section sources**
- [.agents/skills/better-auth-security-best-practices/SKILL.MD:182-216](file://.agents/skills/better-auth-security-best-practices/SKILL.MD#L182-L216)
- [.agents/skills/better-auth-security-best-practices/SKILL.MD:339-417](file://.agents/skills/better-auth-security-best-practices/SKILL.MD#L339-L417)