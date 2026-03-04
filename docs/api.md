# API Reference

Base URL: `https://navigator.codebasics.io` (production) or `http://localhost:3000` (development).

All API routes are under `/api/`. Request and response bodies are JSON.

---

## GET /api/health

Health check endpoint used by Docker and load balancers.

**Auth required**: No

### Response

| Status | Body                                      |
| ------ | ----------------------------------------- |
| 200    | `{ "status": "ok", "timestamp": "..." }` |

### Example

```bash
curl http://localhost:3000/api/health
```

```json
{
  "status": "ok",
  "timestamp": "2026-03-04T10:30:00.000Z"
}
```

---

## GET /api/syllabus

Returns syllabus data (subjects and chapters). Supports a `type` query parameter to select which syllabus to load.

**Auth required**: No

### Query Parameters

| Parameter | Type   | Default       | Description                                                |
| --------- | ------ | ------------- | ---------------------------------------------------------- |
| `type`    | string | _(omitted)_   | `"free"` returns `data/free_syllabus.json`. Omit to return `data/syllabus_v3.json` (bootcamp). |

### Response

| Status | Body                                            |
| ------ | ----------------------------------------------- |
| 200    | `SyllabusData` object (see schema below)        |
| 500    | `{ "error": "Failed to read syllabus" }`        |

### SyllabusData Schema

```typescript
{
  subjects: Array<{
    id: string;
    name: string;
    displayName: string;
    color: string;
    category: "foundation" | "core-ai" | "specialization" | "career";
    chapterIds: string[];
    tags?: { category: string; level: string };
  }>;
  chapters: Array<{
    id: string;
    title: string;
    subjectId: string;
    topics: string[];
    durationWeeks: number;
    isProject?: boolean;
    isInternship?: boolean;
    resources?: Array<{ label: string; url: string }>;
  }>;
}
```

### Examples

```bash
# Fetch free-tier syllabus
curl http://localhost:3000/api/syllabus?type=free

# Fetch bootcamp syllabus
curl http://localhost:3000/api/syllabus
```

---

## PUT /api/syllabus

Updates the bootcamp syllabus (`data/syllabus_v3.json`). The write is atomic (temp file + rename) with an in-process write lock.

**Auth required**: Yes (admin cookie `admin_token`)

### Request Body

```typescript
{
  modules: any[];      // required (validated as array)
  phases: any[];       // required (validated as array)
  categories: any[];   // required (validated as array)
  subjects: Subject[];
  chapters: Chapter[];
}
```

### Response

| Status | Body                                           |
| ------ | ---------------------------------------------- |
| 200    | `{ "ok": true }`                               |
| 400    | `{ "error": "modules array is required" }`     |
| 400    | `{ "error": "phases array is required" }`      |
| 400    | `{ "error": "categories array is required" }`  |
| 400    | `{ "error": "Invalid request body" }`          |
| 401    | `{ "error": "Unauthorized" }`                  |

### Example

```bash
curl -X PUT http://localhost:3000/api/syllabus \
  -H "Content-Type: application/json" \
  -H "Cookie: admin_token=<token>" \
  -d '{
    "modules": [],
    "phases": [],
    "categories": [],
    "subjects": [...],
    "chapters": [...]
  }'
```

---

## POST /api/leads

Captures lead data (name, email, career preferences) and sends it to Google Sheets via webhook. Includes honeypot bot protection -- if the hidden `honeypot` field is non-empty, the request silently returns success without forwarding data.

**Auth required**: No

### Request Body (validated with Zod)

```typescript
{
  fullName: string;         // min 2 characters
  email: string;            // valid email format
  targetRoleLabel: string;
  weeklyHours: string;
  timelineLabel: string;
  learnerType?: string;
  selectedSkips?: string[];
  appVersion?: string;
  honeypot?: string;        // hidden field -- must be empty for real users
}
```

### Response

| Status | Body                                                          |
| ------ | ------------------------------------------------------------- |
| 200    | `{ "success": true }`                                         |
| 400    | `{ "error": "Invalid data", "details": { ... } }`            |
| 500    | `{ "error": "Internal Server Error" }`                        |

### Example

```bash
curl -X POST http://localhost:3000/api/leads \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Priya Sharma",
    "email": "priya@example.com",
    "targetRoleLabel": "Data Scientist",
    "weeklyHours": "10-20",
    "timelineLabel": "6 months"
  }'
```

```json
{ "success": true }
```

---

## POST /api/feedback

Captures user feedback (star rating + optional comment) and sends it to Google Sheets via the same webhook.

**Auth required**: No

### Request Body (validated with Zod)

```typescript
{
  rating: number;    // integer, 1-5
  comment?: string;  // max 2000 characters, defaults to ""
}
```

### Response

| Status | Body                                                          |
| ------ | ------------------------------------------------------------- |
| 200    | `{ "success": true }`                                         |
| 400    | `{ "error": "Invalid data", "details": { ... } }`            |
| 500    | `{ "error": "Internal Server Error" }`                        |

### Example

```bash
curl -X POST http://localhost:3000/api/feedback \
  -H "Content-Type: application/json" \
  -d '{
    "rating": 5,
    "comment": "Very helpful roadmap, thanks!"
  }'
```

```json
{ "success": true }
```

---

## POST /api/admin/auth

Handles admin login and logout. Login verifies the password against the `ADMIN_PASSWORD` environment variable using HMAC-SHA256 with timing-safe comparison. On success, sets an httpOnly `admin_token` cookie (24-hour TTL).

**Auth required**: No (this is the auth endpoint itself)

**Rate limited**: 5 attempts per 15-minute window per IP address.

### Request Body

**Login:**

```typescript
{
  password: string;
}
```

**Logout:**

```typescript
{
  action: "logout";
}
```

### Response

**Login success:**

| Status | Body              | Headers                            |
| ------ | ----------------- | ---------------------------------- |
| 200    | `{ "ok": true }`  | `Set-Cookie: admin_token=<token>` |

**Login failure:**

| Status | Body                                                                  |
| ------ | --------------------------------------------------------------------- |
| 400    | `{ "error": "Password is required", "attemptsRemaining": N }`        |
| 401    | `{ "error": "Invalid password", "attemptsRemaining": N }`            |
| 429    | `{ "error": "Too many login attempts. Please try again later." }`    |

Rate limit headers on 429:
- `Retry-After: <seconds>`
- `X-RateLimit-Remaining: 0`

**Logout:**

| Status | Body              |
| ------ | ----------------- |
| 200    | `{ "ok": true }`  |

### Examples

```bash
# Login
curl -X POST http://localhost:3000/api/admin/auth \
  -H "Content-Type: application/json" \
  -d '{ "password": "your-admin-password" }' \
  -c cookies.txt

# Logout
curl -X POST http://localhost:3000/api/admin/auth \
  -H "Content-Type: application/json" \
  -d '{ "action": "logout" }' \
  -b cookies.txt
```

---

## GET /api/admin/check

Checks whether the current request is authenticated by verifying the `admin_token` cookie.

**Auth required**: Cookie (checked, not enforced -- returns status either way)

### Response

| Status | Body                              |
| ------ | --------------------------------- |
| 200    | `{ "authenticated": true }`       |
| 200    | `{ "authenticated": false }`      |

### Example

```bash
curl http://localhost:3000/api/admin/check \
  -b cookies.txt
```

```json
{ "authenticated": true }
```

---

## Error Handling

All endpoints return JSON error responses. Common patterns:

- **400 Bad Request**: Invalid input (Zod validation failure or missing required fields).
- **401 Unauthorized**: Missing or invalid admin cookie.
- **429 Too Many Requests**: Rate limit exceeded on login endpoint.
- **500 Internal Server Error**: Unexpected server error.

Zod validation errors follow this structure:

```json
{
  "error": "Invalid data",
  "details": {
    "_errors": [],
    "email": { "_errors": ["Invalid email address"] }
  }
}
```

## Authentication Flow

1. Client sends `POST /api/admin/auth` with `{ password }`.
2. Server checks rate limit by IP.
3. Server verifies password using HMAC-SHA256 + `timingSafeEqual`.
4. On success, server sets `admin_token` cookie (httpOnly, secure in production, sameSite: lax, 24h maxAge).
5. Subsequent requests include the cookie automatically.
6. Protected endpoints (`PUT /api/syllabus`) read the cookie from the `Cookie` header and verify the token with constant-time comparison.
