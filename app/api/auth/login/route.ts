import { NextRequest, NextResponse } from 'next/server'

import { getBackendUrl } from '@/lib/env'

const BACKEND_URL = getBackendUrl()

export async function POST(request: NextRequest) {
  const { username, password } = await request.json()

  // Authenticate against the backend SuperAdmin table — no hardcoded credentials
  let backendRes: Response
  try {
    backendRes = await fetch(`${BACKEND_URL}/api/super-admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    })
  } catch {
    return NextResponse.json({ error: 'Cannot reach backend server' }, { status: 503 })
  }

  const data = await backendRes.json()

  if (!backendRes.ok) {
    return NextResponse.json(
      { error: data.message || 'Invalid credentials' },
      { status: 401 }
    )
  }

  const token: string = data.data.token

  const response = NextResponse.json({ success: true })
  response.cookies.set('admin_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 8, // 8 hours (matches backend JWT expiry)
    path: '/',
  })
  return response
}
