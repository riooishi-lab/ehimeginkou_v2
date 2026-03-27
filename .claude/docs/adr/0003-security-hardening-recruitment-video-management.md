# 0003. Security hardening for recruitment video management

## Status

Proposed

## Date

2026-03-27

## Context

The recruitment video management feature (videos, students, analytics, watch portal) was implemented without authorization checks on admin server actions and without authentication on the public watch event API. A code review identified the following security and quality gaps:

1. **Missing authorization**: All 7 admin server actions (createStudent, deleteStudent, importStudentsCsv, createVideo, updateVideo, deleteVideo, toggleVideoPublish) lacked `checkIsAdminOrSuperAdmin()` calls, meaning any authenticated user could invoke them regardless of role.
2. **Unauthenticated watch event API**: The `/api/watch-event` endpoint accepted arbitrary `studentId` values from the client, allowing anyone to write fake watch events for any student.
3. **Exposed internal IDs**: Autoincrement database IDs were passed to client components and sent in API requests, leaking internal identifiers to external users (students).
4. **Unsafe type assertions**: `formData.get('category') as VideoCategory` bypassed runtime validation, and `Number.parseInt` on `durationSec` could produce `NaN` without detection.
5. **High cognitive complexity**: `importStudentsCsv` had a cognitive complexity of 36 (threshold: 30), making it difficult to understand and maintain.
6. **Unused dependencies**: `swr`, `babel-plugin-react-compiler`, and `prettier` were listed as dependencies but never imported.

## Decision

Apply the following security hardening and code quality improvements:

- **Authorization**: Add `checkIsAdminOrSuperAdmin()` guard at the top of every admin server action, following the established pattern from existing actions (e.g., `createTeam.ts`, `deleteUser.ts`).
- **Token-based API auth**: Replace `studentId` in the watch event API with a `token` field. The API validates the token against the `visibleStudent` table and resolves the `studentId` server-side, ensuring only valid, non-expired student tokens can record events.
- **Remove internal ID exposure**: Pass `token` (not `student.id`) from the server to client components (`StudentPortal` → `VideoPlayer`), and remove `studentName` from the full `VisibleStudent` object to minimize data sent to the client.
- **Type-safe validation**: Introduce an `isVideoCategory` type guard function to replace unsafe `as VideoCategory` assertions. Add `Number.isNaN` checks for `durationSec` parsing.
- **Complexity refactoring**: Extract helper functions (`resolveColumnIndices`, `optionalField`, `upsertStudent`, `errorImportResult`) from `importStudentsCsv` to reduce cognitive complexity from 36 to 13.
- **Dependency cleanup**: Remove `swr`, `babel-plugin-react-compiler`, and `prettier` from `package.json`.

## Consequences

### Positive

- All admin mutations are now role-gated, preventing privilege escalation by non-admin users
- Watch event API is authenticated via student token, preventing data pollution by unauthorized clients
- Internal database IDs are no longer exposed to external users
- Type guards provide runtime validation for enum values from form data
- `importStudentsCsv` is significantly easier to understand and modify (CC 36 → 13)
- Smaller dependency footprint reduces install time and attack surface

### Negative

- Each watch event API call now requires a database lookup to validate the token, adding latency (~1 query per request)
- The authorization check on every server action adds one database round-trip per invocation
- Separating the `isVideoCategory` check into its own `if` block slightly increases the line count of action files

## Compliance

- Biome lint passes with zero errors (`pnpm --filter web lint`)
- TypeScript type checking passes with zero errors (`npx tsc --noEmit`)
- Cognitive complexity of all functions in changed files is below 30 (verified via `ccts-json`)
- All admin server actions follow the same authorization pattern as existing actions (grep for `checkIsAdminOrSuperAdmin` confirms coverage)
- The watch event API schema now requires `token` instead of `studentId` (validated by Zod schema)

## Notes

- Author: Claude Code
- Version: 0.1
- Changelog:
  - 0.1: Initial proposed version
