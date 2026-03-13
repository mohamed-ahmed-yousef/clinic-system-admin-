import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { backendFetch } from '@/lib/backend'

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ brandId: string }> }
) {
  const token = (await cookies()).get('admin_token')?.value
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { brandId } = await context.params
    const res = await backendFetch(`/api/branches/brand/${brandId}`, token)
    const data = await res.json()
    if (!res.ok) return NextResponse.json(data, { status: res.status })
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch branches' }, { status: 500 })
  }
}
