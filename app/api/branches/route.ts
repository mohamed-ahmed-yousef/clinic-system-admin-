import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { backendFetch } from '@/lib/backend'

async function getToken() {
  return (await cookies()).get('admin_token')?.value
}

export async function POST(request: NextRequest) {
  const token = await getToken()
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await request.json()
    const res = await backendFetch('/api/branches', token, {
      method: 'POST',
      body: JSON.stringify(body),
    })
    const data = await res.json()
    if (!res.ok) return NextResponse.json(data, { status: res.status })
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: 'Failed to create branch' }, { status: 500 })
  }
}
