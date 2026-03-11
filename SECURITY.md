# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability in Career Navigator, please report it responsibly.

**Do NOT open a public issue.**

Instead, email us at **info@codebasics.io** with:

1. A description of the vulnerability
2. Steps to reproduce the issue
3. Any relevant screenshots or proof-of-concept

We will acknowledge receipt within 48 hours and aim to resolve confirmed vulnerabilities within 7 business days.

## Scope

The following are in scope:

- Authentication bypass or session hijacking
- Cross-site scripting (XSS)
- Cross-site request forgery (CSRF)
- Injection vulnerabilities (SQL, command, etc.)
- Sensitive data exposure
- Server-side request forgery (SSRF)

## Out of Scope

- Denial of service attacks
- Social engineering
- Vulnerabilities in third-party services we integrate with
- Issues that require physical access to the server

## Security Features

This application implements the following security measures:

- HMAC-SHA256 session tokens with timing-safe comparison
- Content Security Policy (CSP) headers
- HTTP Strict Transport Security (HSTS)
- CSRF origin verification on all mutating endpoints
- Rate limiting on authentication and public API endpoints
- Input validation via Zod schemas on all API routes
- httpOnly, secure, sameSite cookies
- Non-root Docker container with health checks
