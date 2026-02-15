/**
 * Admin Authentication Helper
 *
 * Simple token-based protection for admin/test routes.
 * Token is passed as a query param (?token=...) because
 * browsers cannot set custom headers on EventSource (SSE).
 *
 * Set ADMIN_SECRET_TOKEN in your .env / server environment.
 */

import { NextRequest } from 'next/server';

export function validateAdminToken(req: NextRequest): boolean {
  const secret = process.env.ADMIN_SECRET_TOKEN;

  // If no secret is configured, admin routes are disabled entirely
  if (!secret || secret.trim() === '') {
    return false;
  }

  // Accept token from query param (needed for EventSource / SSE)
  const { searchParams } = new URL(req.url);
  const queryToken = searchParams.get('token');

  if (queryToken && queryToken === secret) {
    return true;
  }

  // Also accept from Authorization header for non-SSE calls
  const authHeader = req.headers.get('Authorization');
  if (authHeader && authHeader === `Bearer ${secret}`) {
    return true;
  }

  return false;
}

export function unauthorizedResponse() {
  return new Response(
    JSON.stringify({ success: false, error: { code: 'UNAUTHORIZED', message: 'Invalid or missing admin token.' } }),
    { status: 401, headers: { 'Content-Type': 'application/json' } }
  );
}
