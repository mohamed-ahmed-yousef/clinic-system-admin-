'use client'

import { useEffect, useMemo, useState } from 'react'
import UserStatusSwitch from '@/components/UserStatusSwitch'

type Role = 'superAdmin' | 'admin' | 'doctor' | 'reception' | 'terminal' | 'nurse'

interface ScopedEntity {
  id: number
  name: string
}

interface User {
  id: number
  username: string
  role: Role
  isActive?: boolean
  brandId?: number | null
  branchId?: number | null
  brand?: ScopedEntity | null
  branch?: ScopedEntity | null
  branchAssignments?: Array<{
    isActive?: boolean
    branchId?: number | null
    branch?: {
      id: number
      name: string
      brandId?: number | null
      brand?: ScopedEntity | null
    } | null
  }>
  createdAt?: string
}

const ROLE_LABELS: Record<string, string> = {
  superAdmin: 'Super Admin',
  admin: 'Admin',
  doctor: 'Doctor',
  reception: 'Reception',
  terminal: 'Terminal',
  nurse: 'Nurse',
}

const ROLE_COLORS: Record<string, string> = {
  superAdmin: 'bg-slate-100 text-slate-700',
  admin: 'bg-purple-100 text-purple-700',
  doctor: 'bg-blue-100 text-blue-700',
  reception: 'bg-green-100 text-green-700',
  terminal: 'bg-orange-100 text-orange-700',
  nurse: 'bg-cyan-100 text-cyan-700',
}

function getScopeLabel(entity: ScopedEntity | null | undefined, id: number | null | undefined, fallback: string) {
  if (entity?.name) return entity.name
  if (id != null) return `${fallback} #${id}`
  return 'Unassigned'
}

function getUserBrandId(user: User) {
  return user.branchAssignments?.[0]?.branch?.brand?.id
    ?? user.branchAssignments?.[0]?.branch?.brandId
    ?? user.brand?.id
    ?? user.brandId
    ?? null
}

function getUserBranchId(user: User) {
  return user.branchAssignments?.[0]?.branch?.id
    ?? user.branchAssignments?.[0]?.branchId
    ?? user.branch?.id
    ?? user.branchId
    ?? null
}

function getUserBrand(user: User) {
  return user.branchAssignments?.[0]?.branch?.brand ?? user.brand ?? null
}

function getUserBranch(user: User) {
  return user.branchAssignments?.[0]?.branch ?? user.branch ?? null
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [statusLoadingId, setStatusLoadingId] = useState<number | null>(null)
  const [selectedBrand, setSelectedBrand] = useState('all')
  const [selectedBranch, setSelectedBranch] = useState('all')

  async function fetchUsers() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/users', { cache: 'no-store' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || data.message || 'Failed to load users')
      setUsers(data.data?.data || data.data || [])
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const brandOptions = useMemo(() => {
    const seen = new Map<string, string>()

    for (const user of users) {
      const brandId = getUserBrandId(user)
      const key = brandId != null ? String(brandId) : 'unassigned'
      const label = getScopeLabel(getUserBrand(user), brandId, 'Brand')
      if (!seen.has(key)) seen.set(key, label)
    }

    return Array.from(seen.entries())
      .map(([value, label]) => ({ value, label }))
      .sort((a, b) => a.label.localeCompare(b.label))
  }, [users])

  const branchOptions = useMemo(() => {
    const seen = new Map<string, string>()
    const sourceUsers =
      selectedBrand === 'all'
        ? users
        : users.filter((user) => String(getUserBrandId(user) ?? 'unassigned') === selectedBrand)

    for (const user of sourceUsers) {
      const branchId = getUserBranchId(user)
      const key = branchId != null ? String(branchId) : 'unassigned'
      const label = getScopeLabel(getUserBranch(user), branchId, 'Branch')
      if (!seen.has(key)) seen.set(key, label)
    }

    return Array.from(seen.entries())
      .map(([value, label]) => ({ value, label }))
      .sort((a, b) => a.label.localeCompare(b.label))
  }, [selectedBrand, users])

  const filteredUsers = useMemo(() => {
    return users
      .filter((user) => {
      const brandKey = String(getUserBrandId(user) ?? 'unassigned')
      const branchKey = String(getUserBranchId(user) ?? 'unassigned')

      if (selectedBrand !== 'all' && brandKey !== selectedBrand) return false
      if (selectedBranch !== 'all' && branchKey !== selectedBranch) return false

      return true
    })
      .sort((a, b) => {
        const aIsActive = a.isActive !== false
        const bIsActive = b.isActive !== false

        if (aIsActive !== bIsActive) {
          return aIsActive ? -1 : 1
        }

        return a.username.localeCompare(b.username, 'en', { sensitivity: 'base' })
      })
  }, [selectedBrand, selectedBranch, users])

  useEffect(() => {
    const branchExists = branchOptions.some((option) => option.value === selectedBranch)
    if (selectedBranch !== 'all' && !branchExists) {
      setSelectedBranch('all')
    }
  }, [branchOptions, selectedBranch])

  async function handleToggleStatus(user: User, nextStatus: boolean) {
    const brandId = getUserBrandId(user)
    const branchId = getUserBranchId(user)

    if (!brandId || !branchId) {
      alert('This user is missing brand or branch context, so status cannot be changed.')
      return
    }

    setStatusLoadingId(user.id)
    try {
      const res = await fetch(`/api/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: nextStatus, brandId, branchId }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || data.error || 'Failed to update user status')
      setUsers((currentUsers) =>
        currentUsers.map((currentUser) => {
          if (currentUser.id !== user.id) return currentUser

          return {
            ...currentUser,
            isActive: nextStatus,
            branchAssignments: currentUser.branchAssignments?.map((assignment, index) =>
              index === 0 ? { ...assignment, isActive: nextStatus } : assignment,
            ),
          }
        }),
      )
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to update user status')
    } finally {
      setStatusLoadingId(null)
    }
  }

  async function handleDelete(id: number) {
    setDeleteLoading(true)
    try {
      const res = await fetch(`/api/users/${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || data.error || 'Failed to deactivate user')
      setDeleteId(null)
      await fetchUsers()
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to deactivate user')
    } finally {
      setDeleteLoading(false)
    }
  }

  return (
    <div className="p-8">
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage activation by brand and branch. Create users from a specific branch page.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-500">
              Brand
            </span>
            <select
              value={selectedBrand}
              onChange={(event) => setSelectedBrand(event.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 shadow-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="all">All brands</option>
              {brandOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-500">
              Branch
            </span>
            <select
              value={selectedBranch}
              onChange={(event) => setSelectedBranch(event.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 shadow-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="all">All branches</option>
              {branchOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      {error && (
        <div className="mb-6 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <svg className="h-4 w-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          {error}
          <button onClick={fetchUsers} className="ml-auto font-medium text-red-600 hover:underline">
            Retry
          </button>
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        {loading ? (
          <div className="flex items-center justify-center py-20 text-gray-400">
            <svg className="mr-2 h-6 w-6 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Loading users...
          </div>
        ) : users.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <svg className="mb-3 h-12 w-12 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
            <p className="font-medium">No users yet</p>
            <p className="mt-1 text-sm">Create users from a specific branch page</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <svg className="mb-3 h-12 w-12 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2H3V4zm0 6h18m-18 0v10a1 1 0 001 1h16a1 1 0 001-1V10M9 14h6"
              />
            </svg>
            <p className="font-medium">No users match the selected brand/branch</p>
            <button
              onClick={() => {
                setSelectedBrand('all')
                setSelectedBranch('all')
              }}
              className="mt-2 text-sm font-medium text-indigo-600 hover:underline"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px]">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Username</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Brand</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Branch</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Created</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredUsers.map((user) => {
                  const isActive = user.isActive !== false

                  return (
                    <tr key={user.id} className="transition hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-sm font-semibold text-indigo-700">
                            {user.username[0]?.toUpperCase()}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{user.username}</div>
                            <div className="text-xs text-gray-400">#{user.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${ROLE_COLORS[user.role] || 'bg-gray-100 text-gray-700'}`}>
                          {ROLE_LABELS[user.role] || user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {getScopeLabel(getUserBrand(user), getUserBrandId(user), 'Brand')}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {getScopeLabel(getUserBranch(user), getUserBranchId(user), 'Branch')}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                              isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                            }`}
                          >
                            {isActive ? 'Active' : 'Inactive'}
                          </span>
                          <UserStatusSwitch
                            checked={isActive}
                            disabled={statusLoadingId === user.id}
                            ariaLabel={`Set ${user.username} status`}
                            onChange={(nextValue) => handleToggleStatus(user, nextValue)}
                          />
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {user.createdAt
                          ? new Date(user.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })
                          : '-'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => setDeleteId(user.id)}
                          className="text-sm font-medium text-red-500 transition hover:text-red-700"
                        >
                          Deactivate
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {deleteId !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onMouseDown={(e) => {
            e.preventDefault()
            e.stopPropagation()
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl"
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h3 className="mb-2 text-center text-lg font-semibold text-gray-900">Deactivate User</h3>
            <p className="mb-6 text-center text-sm text-gray-500">
              This will deactivate the user and move them to the bottom of the list. The account record will remain.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteId)}
                disabled={deleteLoading}
                className="flex-1 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-red-700 disabled:bg-red-400"
              >
                {deleteLoading ? 'Deactivating...' : 'Deactivate'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
