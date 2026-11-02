'use strict';
// Single source of truth for response security headers (vercel.json is checked against it in tests).
const CSP="default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self'; connect-src 'self'; worker-src 'self'; manifest-src 'self'; media-src 'self' blob:; object-src 'none'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'";
const PERMISSIONS="geolocation=(), microphone=(), payment=(), usb=(), serial=(), interest-cohort=()";
const SECURITY_HEADERS={'Content-Security-Policy':CSP,'Permissions-Policy':PERMISSIONS,'Cross-Origin-Opener-Policy':'same-origin','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer','X-Frame-Options':'DENY'};
module.exports={CSP,PERMISSIONS,SECURITY_HEADERS};
