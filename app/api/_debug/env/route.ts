import { NextResponse } from 'next/server'
import { getBackendUrl } from '@/lib/env'

export async function GET() {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  return NextResponse.json({
    VITE_API_BASE_URL: process.env.VITE_API_BASE_URL ?? null,
    BACKEND_URL: getBackendUrl(),
    NODE_ENV: process.env.NODE_ENV ?? null,
  })
}

