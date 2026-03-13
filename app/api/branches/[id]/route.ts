import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { backendFetch } from '@/lib/backend'

async function getToken() {
  return (await cookies()).get('admin_token')?.value
}

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const token = await getToken()
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { id } = await context.params
    const res = await backendFetch(`/api/branches/${id}`, token)
    const data = await res.json()
    if (!res.ok) return NextResponse.json(data, { status: res.status })
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch branch' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const token = await getToken()
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { id } = await context.params
    const body = await request.json()
    const res = await backendFetch(`/api/branches/${id}`, token, {
      method: 'PUT',
      body: JSON.stringify(body),
    })
    const data = await res.json()
    if (!res.ok) return NextResponse.json(data, { status: res.status })
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: 'Failed to update branch' }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const token = await getToken()
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { id } = await context.params
    const res = await backendFetch(`/api/branches/${id}`, token, { method: 'DELETE' })
    const data = await res.json()
    if (!res.ok) return NextResponse.json(data, { status: res.status })
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: 'Failed to delete branch' }, { status: 500 })
  }
}
