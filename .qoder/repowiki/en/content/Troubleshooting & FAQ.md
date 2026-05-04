# Troubleshooting & FAQ

<cite>
**Referenced Files in This Document**
- [README.md](file://README.md)
- [package.json](file://package.json)
- [prisma/schema.prisma](file://prisma/schema.prisma)
- [src/hooks.server.ts](file://src/hooks.server.ts)
- [src/lib/server/auth.ts](file://src/lib/server/auth.ts)
- [src/routes/api/auth/[...all]/+server.ts](file://src/routes/api/auth/[...all]/+server.ts)
- [src/routes/api/calendar/+server.ts](file://src/routes/api/calendar/+server.ts)
- [src/routes/api/discover/+server.ts](file://src/routes/api/discover/+server.ts)
- [src/routes/api/search/+server.ts](file://src/routes/api/search/+server.ts)
- [src/lib/utils.ts](file://src/lib/utils.ts)
- [DESIGN.MD](file://DESIGN.MD)
- [SPEC.MD](file://SPEC.MD)
</cite>

## Table of Contents
1. [Introduction](#introduction)
2. [Installation Problems](#installation-problems)
3. [Database Connection Issues](#database-connection-issues)
4. [Authentication Failures](#authentication-failures)
5. [API Integration Errors](#api-integration-errors)
6. [Debugging Techniques](#debugging-techniques)
7. [Log Analysis Methods](#log-analysis-methods)
8. [Diagnostic Procedures](#diagnostic-procedures)
9. [Performance Issues](#performance-issues)
10. [Memory Leaks and Optimization](#memory-leaks-and-optimization)
11. [Step-by-Step Resolution Guides](#step-by-step-resolution-guides)
12. [Preventive Measures](#preventive-measures)
13. [Community Resources, Support Channels, and Contributions](#community-resources-support-channels-and-contributions)
14. [Conclusion](#conclusion)

## Introduction
This Troubleshooting & FAQ guide focuses on diagnosing and resolving common issues in Screenlog, including installation, database connectivity, authentication, and API integration. It also covers debugging, logging, diagnostics, performance, and optimization. The content is organized by problem category for quick navigation and actionable steps.

## Installation Problems
Common installation issues and resolutions:
- Node.js version mismatch
  - Ensure Node.js 20+ is installed. Use the official installer or a version manager.
  - Verify with the command-line tool.
- Missing environment variables
  - Copy the example environment file and add required variables for the database, Better Auth, and external APIs.
  - Confirm the presence of the environment file and required keys.
- Dependency installation failures
  - Clear the npm cache and reinstall dependencies.
  - Reinstall with a clean lockfile if necessary.
- Prisma schema mismatches
  - Run database migrations to align the schema with the current Prisma model.
- Development server startup
  - Start the development server and confirm the local URL is reachable.

**Section sources**
- [README.md:29-71](file://README.md#L29-L71)
- [package.json:1-47](file://package.json#L1-L47)

## Database Connection Issues
Symptoms:
- Migration fails or database not found
- Queries timeout or fail unexpectedly
- Prisma client reports invalid connection string

Resolutions:
- Validate DATABASE_URL format and connectivity
  - Confirm the connection string points to a valid PostgreSQL-compatible endpoint.
  - Test connectivity externally if using managed databases.
- Apply migrations
  - Run the migration command to initialize or update the schema.
- Review Prisma configuration
  - Ensure the datasource provider and URL are correctly configured.
- Check for adapter compatibility
  - Verify the Neon adapter configuration matches your deployment target.

**Section sources**
- [README.md:73-82](file://README.md#L73-L82)
- [prisma/schema.prisma:1-8](file://prisma/schema.prisma#L1-L8)
- [prisma/schema.prisma:10-31](file://prisma/schema.prisma#L10-L31)

## Authentication Failures
Symptoms:
- Login/signup redirects incorrectly
- Session not persisted or lost
- Unauthorized responses on protected routes

Root causes and fixes:
- Better Auth configuration
  - Ensure the Better Auth secret and base URL are set and match the deployment origin.
  - Confirm trusted origins include the application URL.
- Session retrieval in hooks
  - The server hook attempts to fetch the session from headers; ensure cookies are sent and not blocked.
- Auth API handler
  - The SvelteKit handler wraps Better Auth endpoints; verify the route is reachable and not blocked by middleware.
- Protected routes
  - Unauthenticated users receive unauthorized responses; ensure login completes and cookies are accepted.

**Section sources**
- [src/lib/server/auth.ts:1-27](file://src/lib/server/auth.ts#L1-L27)
- [src/hooks.server.ts:1-18](file://src/hooks.server.ts#L1-L18)
- [src/routes/api/auth/[...all]/+server.ts:1-7](file://src/routes/api/auth/[...all]/+server.ts#L1-L7)

## API Integration Errors
Symptoms:
- Discover or search endpoints return unauthorized or error responses
- Calendar endpoint fails with internal server errors

Diagnosis and fixes:
- Unauthorized responses
  - All API endpoints check for an authenticated user; ensure the client sends session cookies and the server can retrieve the session.
- Discover endpoint
  - The endpoint calls multiple content services concurrently; failures surface as a single error message. Check external API keys and service availability.
- Search endpoint
  - Requires a non-empty query; ensure the client passes a valid query parameter.
- Calendar endpoint
  - Builds grouped lists from tracked shows and episode progress; errors indicate database or timezone parsing issues. Validate user data and timezone handling.

**Section sources**
- [src/routes/api/discover/+server.ts:1-21](file://src/routes/api/discover/+server.ts#L1-L21)
- [src/routes/api/search/+server.ts:1-16](file://src/routes/api/search/+server.ts#L1-L16)
- [src/routes/api/calendar/+server.ts:1-82](file://src/routes/api/calendar/+server.ts#L1-L82)
- [src/hooks.server.ts:1-18](file://src/hooks.server.ts#L1-L18)

## Debugging Techniques
General techniques:
- Enable verbose logs for the server and database
- Inspect browser network tab for failed requests and response bodies
- Verify cookies and headers are present on protected requests
- Temporarily bypass external services by stubbing or mocking to isolate issues
- Use development tools to step through server hooks and API handlers

Application-specific tips:
- Check session retrieval in the server hook
- Validate environment variable loading for Better Auth and external APIs
- Confirm timezone handling in calendar logic

**Section sources**
- [src/hooks.server.ts:1-18](file://src/hooks.server.ts#L1-L18)
- [src/lib/server/auth.ts:1-27](file://src/lib/server/auth.ts#L1-L27)
- [src/lib/utils.ts:62-82](file://src/lib/utils.ts#L62-L82)

## Log Analysis Methods
- Server logs
  - Look for startup messages, migration outcomes, and runtime exceptions
- Database logs
  - Monitor connection attempts, query timeouts, and permission errors
- Client-side logs
  - Use browser console to capture network errors and JavaScript exceptions
- Error payloads
  - Many endpoints return structured error messages; inspect the message field for actionable details

**Section sources**
- [src/routes/api/discover/+server.ts:17-18](file://src/routes/api/discover/+server.ts#L17-L18)
- [src/routes/api/search/+server.ts:12-13](file://src/routes/api/search/+server.ts#L12-L13)
- [src/routes/api/calendar/+server.ts:78-80](file://src/routes/api/calendar/+server.ts#L78-L80)

## Diagnostic Procedures
Step-by-step diagnostics:
- Environment readiness
  - Confirm environment variables are loaded and accessible to the server process
- Database health
  - Connect to the database using the provided connection string; run a simple query
  - Apply pending migrations and verify schema
- Authentication flow
  - Complete login and verify session cookie presence
  - Navigate to a protected route and confirm successful session retrieval
- API endpoints
  - Call discover, search, and calendar endpoints with valid session
  - Capture and review response status and body
- External services
  - Validate TMDB API key and reachability
  - Confirm TVmaze key if used

**Section sources**
- [README.md:48-69](file://README.md#L48-L69)
- [prisma/schema.prisma:1-8](file://prisma/schema.prisma#L1-L8)
- [src/lib/server/auth.ts:1-27](file://src/lib/server/auth.ts#L1-L27)
- [src/routes/api/discover/+server.ts:1-21](file://src/routes/api/discover/+server.ts#L1-L21)
- [src/routes/api/search/+server.ts:1-16](file://src/routes/api/search/+server.ts#L1-L16)
- [src/routes/api/calendar/+server.ts:1-82](file://src/routes/api/calendar/+server.ts#L1-L82)

## Performance Issues
Common symptoms:
- Slow API responses
- High memory usage
- UI jank during navigation

Potential causes and mitigations:
- External API latency
  - Batch or cache results where appropriate; consider rate limiting and retries
- Database queries
  - Optimize joins and projections; add indexes as needed
- Client-side rendering
  - Defer heavy computations; leverage virtualization for long lists
- Timezone calculations
  - Minimize repeated timezone conversions; cache computed keys

**Section sources**
- [src/routes/api/calendar/+server.ts:14-52](file://src/routes/api/calendar/+server.ts#L14-L52)
- [src/lib/utils.ts:62-82](file://src/lib/utils.ts#L62-L82)

## Memory Leaks and Optimization
- Avoid retaining references to DOM nodes or large arrays after navigation
- Dispose of subscriptions and timers on route changes
- Limit concurrent external API calls; implement backpressure
- Use efficient data structures (e.g., sets for watched IDs)
- Prefer lazy loading for images and non-critical resources

**Section sources**
- [src/routes/api/calendar/+server.ts:20-24](file://src/routes/api/calendar/+server.ts#L20-L24)

## Step-by-Step Resolution Guides

### Installation Failure: Node Version Too Low
Steps:
1. Check current Node.js version.
2. Install Node.js 20+.
3. Reinstall dependencies.
4. Re-run the development server.

**Section sources**
- [README.md:31-46](file://README.md#L31-L46)

### Environment Variables Missing or Incorrect
Steps:
1. Copy the example environment file.
2. Fill in DATABASE_URL, BETTER_AUTH_SECRET, BETTER_AUTH_URL, and TMDB_API_KEY.
3. Restart the server to reload environment variables.

**Section sources**
- [README.md:48-59](file://README.md#L48-L59)

### Database Migration Errors
Steps:
1. Verify DATABASE_URL correctness.
2. Run the migration command to initialize or update the schema.
3. Confirm schema tables exist and are aligned with Prisma models.

**Section sources**
- [README.md:61-64](file://README.md#L61-L64)
- [prisma/schema.prisma:1-8](file://prisma/schema.prisma#L1-L8)

### Authentication Redirect Loop or Session Lost
Steps:
1. Confirm BETTER_AUTH_SECRET and BETTER_AUTH_URL are set.
2. Ensure trusted origins include the app URL.
3. Verify cookies are accepted and not blocked.
4. Re-login and test protected routes.

**Section sources**
- [src/lib/server/auth.ts:6-24](file://src/lib/server/auth.ts#L6-L24)
- [src/hooks.server.ts:1-18](file://src/hooks.server.ts#L1-L18)

### Unauthorized Responses on API Endpoints
Steps:
1. Authenticate and confirm session cookie is present.
2. Retry the request with the session attached.
3. Check server logs for session retrieval errors.

**Section sources**
- [src/routes/api/discover/+server.ts:6](file://src/routes/api/discover/+server.ts#L6)
- [src/routes/api/search/+server.ts:6](file://src/routes/api/search/+server.ts#L6)
- [src/routes/api/calendar/+server.ts:10](file://src/routes/api/calendar/+server.ts#L10)
- [src/hooks.server.ts:1-18](file://src/hooks.server.ts#L1-L18)

### Discover Endpoint Returns Error
Steps:
1. Ensure the user is authenticated.
2. Check external API keys and service availability.
3. Retry the request and inspect the returned error message.

**Section sources**
- [src/routes/api/discover/+server.ts:17-18](file://src/routes/api/discover/+server.ts#L17-L18)

### Calendar Endpoint Fails
Steps:
1. Confirm user has tracked shows and episode progress.
2. Validate timezone parameter and user timezone preference.
3. Inspect server logs for database or parsing errors.

**Section sources**
- [src/routes/api/calendar/+server.ts:14-80](file://src/routes/api/calendar/+server.ts#L14-L80)

## Preventive Measures
- Keep Node.js and dependencies updated
- Use strict environment variable validation
- Implement circuit breakers for external APIs
- Add monitoring and alerting for database and API health
- Regularly back up the database and test restore procedures
- Enforce CORS and trusted origin policies for Better Auth

**Section sources**
- [README.md:16-26](file://README.md#L16-L26)
- [src/lib/server/auth.ts:20-24](file://src/lib/server/auth.ts#L20-L24)

## Community Resources, Support Channels, and Contributions
- Project documentation and tech stack overview
- Contribution guidelines and design/spec documents for architectural context

**Section sources**
- [README.md:16-26](file://README.md#L16-L26)
- [DESIGN.MD:243-274](file://DESIGN.MD#L243-L274)
- [SPEC.MD:30-48](file://SPEC.MD#L30-L48)

## Conclusion
By following the categorized troubleshooting steps, validating environment and database configurations, and applying the recommended preventive measures, most issues in Screenlog can be resolved efficiently. Use the debugging and diagnostic procedures to isolate problems quickly, and consult the community resources for broader context and contributions.