import { NextResponse } from 'next/server'

export async function POST() {
  const response = NextResponse.json({ success: true })
  response.cookies.delete({ name: 'admin_token', path: '/' })
  return response
}

export async function GET() {
  const response = NextResponse.redirect(new URL('/admin-123', 'http://localhost'))
  response.cookies.delete({ name: 'admin_token', path: '/' })
  return response
}
