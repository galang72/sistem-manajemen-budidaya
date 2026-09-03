import { NextResponse } from 'next/server';
import { getUserSessionCookieName } from '@/lib/auth';

export async function POST() {
  const response = NextResponse.json({ success: true, message: 'Logout berhasil' });
  response.cookies.delete(getUserSessionCookieName());
  return response;
}
