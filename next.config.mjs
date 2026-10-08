/** @type {import('next').NextConfig} */
const SECURITY_HEADERS = [
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "worker-src 'self' blob:",                  // Allow workers from blobs
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",         // CSS inline de Next, Reveal y Google Fonts
      "img-src 'self' data: https:",
      "font-src 'self' data: https://fonts.gstatic.com",
      "connect-src 'self'",
      "frame-src 'self'",                         // iframe del deck (srcDoc)
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'"
    ].join('; ')
  }
];

const nextConfig = {
  headers: async () => [
    { source: '/:path*', headers: SECURITY_HEADERS }
  ]
};

export default nextConfig;