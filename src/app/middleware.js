import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

export function middleware(request) {
  const token = request.headers.get('authorization')?.split(' ')[1] || request.cookies.get('token')?.value; // Bearer <token>
  const verified = verifyToken(token);  
  // Restrict to protected API routes only (you can customize this)
  if (request.nextUrl.pathname.startsWith('/api') && !verified) {
    return NextResponse.json(
      { success: false, message: 'Unauthorized' },
      { status: 401 }
    );
  }
  // If verified, allow request to continue
  return NextResponse.next();
}

// Limit middleware to API routes
export const config = {
  matcher: ['/api/:path*'],
};
