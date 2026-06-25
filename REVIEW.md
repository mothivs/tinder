# Current Skills Demonstrated

- Built a working Express server with route modules, middleware, JSON parsing, cookies, static file serving, and file upload handling.
- Connected a Node.js app to MongoDB through Mongoose.
- Modeled core domain data with `User` and `Connection` schemas.
- Implemented password hashing with `bcryptjs`.
- Implemented login with JWT-based cookie authentication.
- Started extracting shared authentication behavior into `userAuth` middleware.
- Used environment variables for the main database connection and JWT secret.
- Practiced CRUD operations, route params, query params, status codes, and basic error handling.
- Added connection request flows that model real product behavior: send request, ignore user, accept request, reject request.
- Created a seed script with hashed passwords and dummy user data.
- Documented learning direction in `LEARNING.md`, with clear goals around API design, auth, database design, Redis, PostgreSQL, event-driven architecture, microservices, and system design.

# Architecture Review

The current architecture is a good early-stage learning app: Express routes, Mongoose models, middleware, config, and seed data are separated enough to understand the backend pieces individually.

The main improvement is to separate "learning experiments" from "application behavior." `app.js` still contains upload routes, static file routes, admin demo routes, and middleware experiments. As the app grows, `app.js` should become mostly application wiring: load config, register global middleware, mount route modules, connect to the database, and start the server.

The current route naming is still CRUD-oriented instead of product-oriented. For this project, routes like `/signup`, `/login`, `/profile`, `/profile/edit`, `/request/send/:status/:userId`, `/request/review/:status/:requestId`, `/connections`, and `/feed` will teach better API design than generic `/user/:id` routes.

The `userAuth` middleware is the right direction, but it should fully own JWT verification. Route handlers should trust `req.user` instead of verifying the token again. This reduces duplicated auth logic and makes authorization rules easier to reason about.

The app currently mixes authorization levels. For example, user creation is protected by `userAuth`, but signup normally should be public. Reading all users is protected, but still returns all users rather than a feed that excludes the current user and existing requests.

The model layer is still thin. Mongoose schemas define fields, but they do not yet fully express domain rules such as profile constraints, age limits, allowed gender values, unique usernames, connection uniqueness, or valid connection state transitions.

Error handling exists, but it is not yet centralized enough. Some routes return JSON, some return text, some expose raw error details, and some convert authentication failures into 500 errors. A consistent error shape will make the API easier to debug and test.

# Missing Backend Concepts

- Request validation: validate body, params, and query data before business logic runs.
- Centralized error handling: use a shared error middleware and avoid repeating `try/catch` response logic everywhere.
- Authentication vs authorization: authentication proves who the user is; authorization decides what that user can do.
- Public vs protected routes: signup and login should be public, profile and connection actions should be protected.
- Ownership checks: users should only update/delete their own profile unless an admin role exists.
- Schema-level domain rules: enums, min/max lengths, lowercasing, trimming, timestamps, indexes, and custom validators.
- Database indexes: unique indexes for email/userName/phone, indexes for feed queries, and compound indexes for connection lookup.
- Idempotency and race conditions: duplicate connection requests can still happen under concurrent requests unless the database prevents them.
- Pagination: `/user` and future `/feed` endpoints should not return unlimited data.
- Projection and data privacy: never return passwords, internal fields, or unnecessary personal data.
- Config management: define required env vars, fail fast if missing, and keep seed scripts using the same config path.
- Cookie security: use `httpOnly`, `sameSite`, `secure` in production, `maxAge`, and consistent logout behavior.
- Test strategy: unit tests for validators/middleware and integration tests for auth and connection flows.
- Logging strategy: avoid logging tokens and sensitive request bodies; use structured logs later.
- API contract discipline: consistent response format, status codes, and route naming.
- File upload security: validate file type, file size, filename generation, and storage strategy.

# Suggested Next Features

- Build proper auth APIs: `POST /signup`, `POST /login`, `POST /logout`, and `GET /profile`.
- Fix and harden `userAuth`: import JWT, verify token, return 401 for invalid/expired token, attach `req.user`, and avoid repeated token verification in routes.
- Build profile APIs: `GET /profile`, `PATCH /profile`, and `DELETE /profile` for the logged-in user.
- Replace generic user listing with a real feed endpoint: `GET /feed?page=1&limit=10`.
- Add feed exclusion logic: exclude current user, accepted/rejected/ignored/interested users, and already connected users.
- Add `GET /connections` to return accepted connections for the logged-in user.
- Add `GET /requests/received` to show pending interested requests.
- Add database indexes to `Connection` for request pair lookup and status-based queries.
- Enforce duplicate connection prevention at the database level.
- Add stronger user schema fields: `age` or `dob`, `bio`, `photoUrl`, `skills`, `location`, and profile visibility fields.
- Add request validation using a validation library or explicit validation helper functions.
- Add tests for signup, login, profile authorization, request send, duplicate request, request review, connections list, and feed exclusion.
- Move upload handling into its own route module and add file validation.
- Add production-style config loading with required env var checks.
- Add a simple API documentation file with endpoint, auth requirement, request body, and response shape.

# Scalability Concerns

- Returning all users will not scale. Feed and connection list endpoints need pagination, limits, sorting, and indexes.
- Feed generation will become expensive as the connection table grows. You will need indexed exclusion queries, caching, or precomputed recommendations later.
- Duplicate connection prevention should not rely only on application logic. Concurrent requests can pass the duplicate check at the same time. Use compound unique indexes or normalized pair keys.
- MongoDB query patterns should be designed before data grows. Add indexes based on actual reads: `requestFromId`, `requestToId`, `status`, and pair lookup.
- JWT cookie auth is simple, but session invalidation, logout across devices, and token rotation require more design.
- Static file uploads on local disk will not work well across multiple servers. Later, use object storage such as S3-compatible storage and store only metadata in MongoDB.
- A single Express app is fine now, but future features like notifications, email, recommendations, moderation, and analytics should not all run inside request-response handlers.
- Logging with `console.log` is enough for learning, but production debugging needs structured logs, request IDs, and error tracking.
- Seed scripts using direct production-like credentials are risky. Keep environment-specific seed config and avoid destructive operations against the wrong database.
- Without tests, refactoring auth or connection logic will become risky as the app grows.

# System Design Topics Introduced

- API design: public routes, protected routes, resource naming, response contracts, status codes.
- Authentication: password hashing, JWTs, cookies, token expiry, logout behavior.
- Authorization: profile ownership, request ownership, admin vs normal user behavior.
- Data modeling: users, connection requests, status transitions, one-way vs two-way relationships.
- Indexing: unique fields, compound indexes, query-driven schema design.
- Consistency: preventing duplicate requests and handling concurrent writes.
- Pagination: cursor or page-based feed and connection listing.
- Privacy: limiting profile fields returned to different users.
- File storage: local disk vs object storage, public vs private assets.
- Caching: Redis can later cache feed pages, user sessions, rate limits, or frequently accessed profiles.
- Event-driven architecture: accepted connection events can later trigger notifications, email, analytics, or recommendation updates.
- Microservices boundaries: auth, profile, connection graph, notifications, media, and recommendation service are natural future boundaries.
- Observability: logs, metrics, request tracing, and error monitoring.
- Operational safety: env validation, seed safety, migrations, backups, and deployment config.

# Learning ROI Ranking

1. Fix and complete authentication middleware.
   Highest ROI because every protected backend system depends on clean auth. Learn JWT verification, 401 vs 403, cookie settings, middleware design, and route protection.

2. Build profile APIs around the logged-in user.
   This teaches ownership, authorization, safe updates, field whitelisting, and API design better than generic user CRUD.

3. Implement feed with pagination and exclusion logic.
   This introduces real backend thinking: query design, indexes, privacy, pagination, and product-specific data access.

4. Add connection list and received requests APIs.
   This turns the connection model into a graph-like data access problem and prepares you for joins/population, filtering, and efficient queries.

5. Add database indexes and duplicate request prevention.
   Very high system design value because it teaches race conditions, consistency, and why business rules should be protected by the database.

6. Add request validation and consistent error responses.
   This teaches API reliability, security, and maintainability. It also makes tests and frontend integration easier.

7. Write integration tests for auth and connection flows.
   This teaches backend confidence. Tests will help you refactor routes into cleaner architecture without breaking behavior.

8. Refactor app structure into routes, controllers, services, validators, and config.
   Useful after the current behavior is stable. Doing this too early can become folder decoration, but doing it now-ish will teach maintainable backend structure.

9. Improve user schema for a dating-style profile.
   Good product modeling practice: age, bio, gender enum, skills, photo, location, timestamps, and visibility rules.

10. Add rate limiting with Redis.
    Strong backend concept, especially for login and request-sending abuse prevention. Best learned after auth routes are clean.

11. Add notification events for accepted connections.
    Good introduction to event-driven architecture: emit an event when a request is accepted, then handle notification separately.

12. Move file uploads to a safer media module.
    Useful, but lower ROI than auth, data modeling, and feed design unless media becomes central to the app.

13. Add PostgreSQL version of one module.
    Valuable for learning relational modeling, joins, constraints, and transactions. Best attempted after MongoDB modeling is understood.

14. Split into microservices.
    Lowest immediate ROI. First build a clean modular monolith. Microservices become meaningful only after you understand boundaries, data ownership, events, deployment, and observability.

# Suggested Roadmap

## Phase 1

Stabilize the core backend foundation.

- Fix `userAuth` so authentication is reliable and reusable across protected routes.
- Separate public routes from protected routes: signup/login should be public, profile and connection APIs should require auth.
- Build proper profile APIs: `GET /profile`, `PATCH /profile`, and `DELETE /profile`.
- Remove duplicate JWT verification from route handlers and trust `req.user`.
- Standardize response shape, error status codes, and basic validation.
- Move secrets and seed configuration fully into environment-driven config.

Primary learning outcome: auth, middleware, route protection, ownership, and clean API behavior.

## Phase 2

Build product-shaped APIs and stronger data modeling.

- Implement `GET /feed` with pagination and exclusion logic.
- Implement `GET /connections` for accepted connections.
- Implement `GET /requests/received` for pending incoming requests.
- Add stronger schema rules for users and connections.
- Add database indexes for connection lookup, feed queries, and unique user fields.
- Enforce duplicate connection prevention at the database level.

Primary learning outcome: query design, indexing, relationship modeling, pagination, and data consistency.

## Phase 3

Make the app maintainable and production-like.

- Refactor routes into controllers, services, validators, and config modules.
- Add request validation for body, params, and query data.
- Add integration tests for signup, login, profile, feed, connection requests, and duplicate request handling.
- Move upload handling into a dedicated media module with file size/type validation.
- Add structured logging basics and avoid logging sensitive data.
- Add API documentation for routes, auth requirements, request bodies, and response shapes.

Primary learning outcome: maintainable backend architecture, testing, validation, observability, and safer refactoring.

## Phase 4

Introduce scaling and system design concepts deliberately.

- Add Redis for rate limiting login and request-sending APIs.
- Add caching for feed or frequently accessed profile data.
- Add event-driven behavior for accepted connections, such as notification events.
- Explore background jobs for notifications, emails, cleanup, or recommendation updates.
- Rebuild one small module in PostgreSQL to compare document modeling with relational modeling.
- Only after the modular monolith is clean, identify possible microservice boundaries such as auth, profiles, connection graph, media, notifications, and recommendations.

Primary learning outcome: caching, rate limiting, async processing, relational modeling, service boundaries, and system design tradeoffs.
