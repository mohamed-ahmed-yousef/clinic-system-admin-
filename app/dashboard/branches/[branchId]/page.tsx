'use client'

import { useEffect, useState } from 'react'
import StaffEditModal from '@/components/StaffEditModal'
import { useParams } from 'next/navigation'
import Link from 'next/link'

interface Branch {
  id: number
  name: string
  address: string | null
  phone: string | null
  isActive: boolean
  brand?: { id: number; name: string }
}

interface StaffMember {
  id: number
  userId: number
  branchId: number
  role: string
  isActive: boolean
  user: { id: number; username: string; role: string }
}

const ROLE_COLORS: Record<string, string> = {
  admin: 'bg-purple-100 text-purple-700',
  doctor: 'bg-blue-100 text-blue-700',
  reception: 'bg-green-100 text-green-700',
  nurse: 'bg-cyan-100 text-cyan-700',
  terminal: 'bg-orange-100 text-orange-700',
}

const STAFF_ROLE_OPTIONS = [
  { value: 'reception', label: 'Reception' },
  { value: 'doctor', label: 'Doctor' },
  { value: 'admin', label: 'Admin' },
  { value: 'terminal', label: 'Terminal' },
]

export default function BranchDetailPage() {
  const { branchId } = useParams<{ branchId: string }>()

  const [branch, setBranch] = useState<Branch | null>(null)
  const [staff, setStaff] = useState<StaffMember[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showCreateUserForm, setShowCreateUserForm] = useState(false)
  const [editMember, setEditMember] = useState<StaffMember | null>(null)
  const [removeId, setRemoveId] = useState<number | null>(null)
  const [formError, setFormError] = useState('')
  const [formLoading, setFormLoading] = useState(false)
  const [removeLoading, setRemoveLoading] = useState(false)
  const [createForm, setCreateForm] = useState({
    username: '',
    password: '',
    userRole: 'doctor',
    doctorProfile: {
      nameAr: '',
      nameEn: '',
      titleAr: '',
      titleEn: '',
      consultationFee: '',
      examinationFee: '',
    },
  })

  const hasActiveDoctor = staff.some((member) => member.role === 'doctor' && member.isActive)

  async function fetchData() {
    setLoading(true)
    setError('')
    try {
      const [branchRes, staffRes] = await Promise.all([
        fetch(`/api/branches/${branchId}`),
        fetch(`/api/branches/${branchId}/staff`),
      ])

      const branchData = await branchRes.json()
      const staffData = await staffRes.json()

      if (!branchRes.ok) throw new Error(branchData.message || 'Failed to load branch')
      if (!staffRes.ok) throw new Error(staffData.message || 'Failed to load staff')

      setBranch(branchData.data)
      setStaff(staffData.data || [])
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [branchId])

  async function handleCreateUser(e: React.FormEvent) {
    e.preventDefault()
    setFormError('')
    setFormLoading(true)
    try {
      if (createForm.userRole === 'doctor' && hasActiveDoctor) {
        throw new Error('This branch already has an active doctor. Remove/disable the current doctor first.')
      }

      const brandId = branch?.brand?.id
      if (!brandId) {
        throw new Error('Cannot create user: missing brandId for this branch')
      }

      const createRes = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brandId,
          branchId: Number(branchId),
          username: createForm.username,
          password: createForm.password,
          role: createForm.userRole,
          ...(createForm.userRole === 'doctor'
            ? {
              doctorProfile: {
                nameAr: createForm.doctorProfile.nameAr,
                nameEn: createForm.doctorProfile.nameEn,
                titleAr: createForm.doctorProfile.titleAr,
                titleEn: createForm.doctorProfile.titleEn ? createForm.doctorProfile.titleEn : null,
                ...(createForm.doctorProfile.consultationFee !== '' ? { consultationFee: Number(createForm.doctorProfile.consultationFee) } : {}),
                ...(createForm.doctorProfile.examinationFee !== '' ? { examinationFee: Number(createForm.doctorProfile.examinationFee) } : {}),
              },
            }
            : {}),
        }),
      })
      const createData = await createRes.json()
      if (!createRes.ok) {
        throw new Error(createData.message || createData.error || 'Failed to create user')
      }

      setShowCreateUserForm(false)
      setCreateForm({
        username: '',
        password: '',
        userRole: 'doctor',
        doctorProfile: {
          nameAr: '',
          nameEn: '',
          titleAr: '',
          titleEn: '',
          consultationFee: '',
          examinationFee: '',
        },
      })
      fetchData()
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Failed to create user')
    } finally {
      setFormLoading(false)
    }
  }

  async function handleRemove(userId: number) {
    setRemoveLoading(true)
    try {
      const res = await fetch(`/api/branches/${branchId}/staff/${userId}`, { method: 'DELETE' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || data.error || 'Failed to remove staff')
      setRemoveId(null)
      fetchData()
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to remove staff')
    } finally {
      setRemoveLoading(false)
    }
  }

  function closeEditModal() {
    if (formLoading) return
    setEditMember(null)
    setFormError('')
  }

  async function handleSaveEdit({ username, password, role }: { username: string; password: string; role?: string }) {
    if (!editMember) return

    const nextUsername = username.trim()
    const nextPassword = password.trim()
    const nextRole = role?.trim() || editMember.role

    if (!nextUsername) {
      setFormError('Username is required')
      return
    }

    if (!nextPassword && nextUsername === editMember.user.username && nextRole === editMember.role) {
      setFormError('Change the username, password, or branch role')
      return
    }

    if (nextPassword && nextPassword.length < 6) {
      setFormError('Password must be at least 6 characters')
      return
    }

    setFormError('')
    setFormLoading(true)
    try {
      if (nextUsername !== editMember.user.username || nextPassword) {
        const userRes = await fetch(`/api/users/${editMember.userId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: nextUsername,
            ...(nextPassword ? { password: nextPassword } : {}),
          }),
        })
        const userData = await userRes.json()
        if (!userRes.ok) throw new Error(userData.message || userData.error || 'Failed to update user')
      }

      if (nextRole !== editMember.role) {
        const roleRes = await fetch(`/api/branches/${branchId}/staff/${editMember.userId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ role: nextRole }),
        })
        const roleData = await roleRes.json()
        if (!roleRes.ok) throw new Error(roleData.message || roleData.error || 'Failed to update role')
      }

      setEditMember(null)
      await fetchData()
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Failed to update staff account')
    } finally {
      setFormLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400">
        <svg className="animate-spin w-6 h-6 mr-2" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        Loading...
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
          <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
          <button onClick={fetchData} className="ml-auto text-red-600 hover:underline font-medium">Retry</button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
        <Link href="/dashboard/brands" className="hover:text-gray-600 transition">Brands</Link>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        {branch?.brand && (
          <>
            <Link href={`/dashboard/brands/${branch.brand.id}`} className="hover:text-gray-600 transition">
              {branch.brand.name}
            </Link>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </>
        )}
        <span className="text-gray-700 font-medium">{branch?.name ?? `Branch #${branchId}`}</span>
      </div>

      {/* Branch Info Card */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-violet-100 rounded-xl flex items-center justify-center text-violet-700 text-2xl font-bold">
            {branch?.name?.[0]?.toUpperCase() ?? '#'}
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-gray-900">{branch?.name ?? `Branch #${branchId}`}</h1>
              {branch && (
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${branch.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                  {branch.isActive ? 'Active' : 'Inactive'}
                </span>
              )}
            </div>
            <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
              {branch?.phone && <span>{branch.phone}</span>}
              {branch?.address && <span>{branch.address}</span>}
            </div>
          </div>
        </div>
      </div>

      {/* Staff Section */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-800">
          Staff <span className="text-gray-400 font-normal text-base">({staff.length})</span>
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setShowCreateUserForm(true)
              setFormError('')
              setCreateForm((prev) => (hasActiveDoctor && prev.userRole === 'doctor' ? { ...prev, userRole: 'reception' } : prev))
            }}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New User
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {staff.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <svg className="w-12 h-12 mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <p className="font-medium">No staff assigned yet</p>
            <p className="text-sm mt-1">Click &ldquo;Assign Staff&rdquo; to add members</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">User</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">System Role</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Branch Role</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Status</th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {staff.map((member) => (
                <tr
                  key={member.id}
                  className="hover:bg-gray-50 transition cursor-pointer"
                  onClick={() => setEditMember(member)}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 text-sm font-semibold">
                        {member.user.username[0].toUpperCase()}
                      </div>
                      <span className="font-medium text-gray-900">{member.user.username}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${ROLE_COLORS[member.user.role] || 'bg-gray-100 text-gray-700'}`}>
                      {member.user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {member.role}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${member.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {member.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={(e) => { e.stopPropagation(); setRemoveId(member.userId) }}
                      className="text-sm cursor-pointer text-red-500 hover:text-red-700 font-medium transition"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {editMember && (
        <StaffEditModal
          isOpen={Boolean(editMember)}
          username={editMember.user.username}
          role={editMember.role}
          roleLabel="Branch Role"
          roleOptions={STAFF_ROLE_OPTIONS}
          saving={formLoading}
          error={formError}
          onClose={closeEditModal}
          onSubmit={handleSaveEdit}
        />
      )}

      {/* Create User + Assign Modal */}
      {showCreateUserForm && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
          onMouseDown={(e) => {
            e.preventDefault()
            e.stopPropagation()
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md"
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">Create User for This Branch</h2>
              <button onClick={() => setShowCreateUserForm(false)} className="text-gray-400 hover:text-gray-600 transition">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Username</label>
                <input
                  type="text"
                  value={createForm.username}
                  onChange={(e) => setCreateForm({ ...createForm, username: e.target.value })}
                  placeholder="Enter username"
                  required
                  minLength={3}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
                <input
                  type="password"
                  value={createForm.password}
                  onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                  placeholder="Min. 6 characters"
                  required
                  minLength={6}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">System Role</label>
                <select
                  value={createForm.userRole}
                  onChange={(e) => setCreateForm({ ...createForm, userRole: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition bg-white"
                >
                  <option value="doctor" disabled={hasActiveDoctor}>Doctor</option>
                  <option value="reception">Reception</option>
                  <option value="nurse">Nurse</option>
                  <option value="admin">Admin</option>
                  <option value="terminal">Terminal</option>
                </select>
              </div>

              {hasActiveDoctor && createForm.userRole !== 'doctor' && (
                <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                  This branch already has a doctor. Creating another doctor is disabled.
                </div>
              )}

              {createForm.userRole === 'doctor' && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Doctor Name (AR)</label>
                      <input
                        type="text"
                        value={createForm.doctorProfile.nameAr}
                        onChange={(e) => setCreateForm({ ...createForm, doctorProfile: { ...createForm.doctorProfile, nameAr: e.target.value } })}
                        required
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Doctor Name (EN)</label>
                      <input
                        type="text"
                        value={createForm.doctorProfile.nameEn}
                        onChange={(e) => setCreateForm({ ...createForm, doctorProfile: { ...createForm.doctorProfile, nameEn: e.target.value } })}
                        required
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Title (AR)</label>
                      <input
                        type="text"
                        value={createForm.doctorProfile.titleAr}
                        onChange={(e) => setCreateForm({ ...createForm, doctorProfile: { ...createForm.doctorProfile, titleAr: e.target.value } })}
                        required
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Title (EN)</label>
                      <input
                        type="text"
                        value={createForm.doctorProfile.titleEn}
                        onChange={(e) => setCreateForm({ ...createForm, doctorProfile: { ...createForm.doctorProfile, titleEn: e.target.value } })}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Consultation Fee</label>
                      <input
                        type="number"
                        min={0}
                        step="0.01"
                        value={createForm.doctorProfile.consultationFee}
                        onChange={(e) => setCreateForm({ ...createForm, doctorProfile: { ...createForm.doctorProfile, consultationFee: e.target.value } })}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Examination Fee</label>
                      <input
                        type="number"
                        min={0}
                        step="0.01"
                        value={createForm.doctorProfile.examinationFee}
                        onChange={(e) => setCreateForm({ ...createForm, doctorProfile: { ...createForm.doctorProfile, examinationFee: e.target.value } })}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                      />
                    </div>
                  </div>
                </>
              )}

              {formError && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
                  <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {formError}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateUserForm(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition"
                >
                  {formLoading ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Remove Confirmation */}
      {removeId !== null && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
          onMouseDown={(e) => {
            e.preventDefault()
            e.stopPropagation()
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6"
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mx-auto mb-4">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">Remove Staff Member</h3>
            <p className="text-gray-500 text-sm text-center mb-6">
              This will deactivate the staff assignment. The user account will remain.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setRemoveId(null)}
                className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => handleRemove(removeId)}
                disabled={removeLoading}
                className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition"
              >
                {removeLoading ? 'Removing...' : 'Remove'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
