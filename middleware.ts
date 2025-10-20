import { withAuth } from '@kinde-oss/kinde-auth-nextjs/middleware'

export default withAuth(
  async function middleware() {},
  {
    isReturnToCurrentPage: true,
    loginPage: '/api/auth/login',
    publicRoutes: [
      '/',
      '/landing',
      '/api/auth/:path*',
      '/api/me',
      '/_next/:path*',
      '/favicon.ico',
      '/Designer Metals Logo.png',
      '/api/customer-locations',
      '/api/geocode-customers'
    ]
  }
)

export const config = {
  matcher: [
    // Protect everything by default; allow publicRoutes above
    '/((?!.*\.).*)'
  ],
}


