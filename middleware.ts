import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const isProtectedRoute = createRouteMatcher(['/dashboard(.*)'])
const isEmbedRoute = createRouteMatcher(['/embed(.*)'])

export default clerkMiddleware(async (auth, req) => {
  // Protect dashboard routes
  if (isProtectedRoute(req)) await auth.protect()

  // Add security headers to all responses
  const response = NextResponse.next()

  // Prevent MIME type sniffing
  response.headers.set('X-Content-Type-Options', 'nosniff')

  // Allow iframe embedding for embed routes, deny for all others
  if (isEmbedRoute(req)) {
    // Allow embedding from any origin for the widget
    response.headers.delete('X-Frame-Options')
  } else {
    // Prevent clickjacking attacks for non-embed routes
    response.headers.set('X-Frame-Options', 'DENY')
  }

  // Content Security Policy - dynamically add Clerk and Convex domains
  const clerkDomain = process.env.NEXT_PUBLIC_CLERK_FRONTEND_API_URL
    ? new URL(process.env.NEXT_PUBLIC_CLERK_FRONTEND_API_URL).origin
    : ''

  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL || ''
  const convexDomain = convexUrl ? new URL(convexUrl).origin : ''
  const convexWss = convexUrl ? convexUrl.replace('https://', 'wss://') : ''

  // Set Content Security Policy based on route
  const baseCsp = `default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' ${clerkDomain} https://js.stripe.com; style-src 'self' 'unsafe-inline'; connect-src 'self' ${clerkDomain} ${convexDomain} ${convexWss} https://api.stripe.com; frame-src 'self' ${clerkDomain} https://js.stripe.com https://hooks.stripe.com; img-src 'self' data: https:; worker-src blob:;`

  if (isEmbedRoute(req)) {
    // For embed routes, allow being framed from any origin
    response.headers.set('Content-Security-Policy', `${baseCsp} frame-ancestors *;`)
  } else {
    // For other routes, prevent framing
    response.headers.set('Content-Security-Policy', `${baseCsp} frame-ancestors 'none';`)
  }

  // Prevent search engines from indexing protected routes
  if (isProtectedRoute(req)) {
    response.headers.set('X-Robots-Tag', 'noindex, nofollow')
  }

  // Force HTTPS in production (HSTS - HTTP Strict Transport Security)
  if (process.env.NODE_ENV === 'production') {
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains'
    )
  }

  return response
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}