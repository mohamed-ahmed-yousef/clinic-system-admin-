'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import ActionMenu from '@/components/ActionMenu'
import UserStatusSwitch from '@/components/UserStatusSwitch'

const TIMEZONES = [
  { value: 'UTC', label: 'UTC' },
  { value: 'Africa/Cairo', label: 'Africa/Cairo (UTC+2/+3)' },
]

function getTimezoneLabel(timezone?: string | null) {
  return TIMEZONES.find((option) => option.value === timezone)?.label || timezone || 'UTC'
}

interface Brand {
  id: number
  name: string
  slug: string
  contactEmail: string | null
  isActive: boolean
}

interface Branch {
  id: number
  name: string
  address: string | null
  phone: string | null
  timezone: string | null
  isActive: boolean
  createdAt: string
}

export default function BrandDetailPage() {
  const { brandId } = useParams<{ brandId: string }>()
  const router = useRouter()

  const [brand, setBrand] = useState<Brand | null>(null)
  const [branches, setBranches] = useState<Branch[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [showEditBrandForm, setShowEditBrandForm] = useState(false)
  const [editBranch, setEditBranch] = useState<Branch | null>(null)
  const [formError, setFormError] = useState('')
  const [formLoading, setFormLoading] = useState(false)
  const [statusLoadingKey, setStatusLoadingKey] = useState<string | null>(null)
  const [form, setForm] = useState({
    name: '',
    address: '',
    phone: '',
    timezone: 'UTC',
    isActive: true,
  })
  const [brandForm, setBrandForm] = useState({
    name: '',
    slug: '',
    contactEmail: '',
    isActive: true,
  })
  const [branchEditForm, setBranchEditForm] = useState({
    name: '',
    phone: '',
    address: '',
    timezone: 'UTC',
    isActive: true,
  })

  async function fetchData() {
    setLoading(true)
    setError('')
    try {
      const [brandRes, branchRes] = await Promise.all([
        fetch(`/api/brands/${brandId}`),
        fetch(`/api/branches/brand/${brandId}`),
      ])
      const brandData = await brandRes.json()
      const branchData = await branchRes.json()

      if (!brandRes.ok) throw new Error(brandData.message || 'Failed to load brand')
      if (!branchRes.ok) throw new Error(branchData.message || 'Failed to load branches')

      setBrand(brandData.data)
      setBrandForm({
        name: brandData.data.name,
        slug: brandData.data.slug,
        contactEmail: brandData.data.contactEmail || '',
        isActive: brandData.data.isActive,
      })
      setBranches(branchData.data?.data || [])
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [brandId])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setFormError('')
    setFormLoading(true)
    try {
      const body: Record<string, unknown> = {
        brandId: Number(brandId),
        name: form.name,
        isActive: form.isActive,
      }
      if (form.address) body.address = form.address
      if (form.phone) body.phone = form.phone
      if (form.timezone) body.timezone = form.timezone

      const res = await fetch('/api/branches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || data.error || 'Failed to create branch')
      setShowForm(false)
      setForm({ name: '', address: '', phone: '', timezone: 'UTC', isActive: true })
      fetchData()
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Failed to create branch')
    } finally {
      setFormLoading(false)
    }
  }

  async function handleToggleBrandStatus(nextStatus: boolean) {
    if (!brand) return
    setStatusLoadingKey(`brand-${brand.id}`)
    try {
      const res = await fetch(`/api/brands/${brandId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: brandForm.name,
          slug: brandForm.slug,
          contactEmail: brandForm.contactEmail.trim() || null,
          isActive: nextStatus,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || data.error || 'Failed to update brand status')
      setBrand((currentBrand) => currentBrand ? { ...currentBrand, isActive: nextStatus } : currentBrand)
      setBrandForm((currentForm) => ({ ...currentForm, isActive: nextStatus }))
      if (!nextStatus) {
        setBranches((currentBranches) => currentBranches.map((branch) => ({ ...branch, isActive: false })))
      }
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to update brand status')
    } finally {
      setStatusLoadingKey(null)
    }
  }

  async function handleToggleBranchStatus(branch: Branch, nextStatus: boolean) {
    setStatusLoadingKey(`branch-${branch.id}`)
    try {
      const res = await fetch(`/api/branches/${branch.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: branch.name,
          phone: branch.phone,
          address: branch.address,
          timezone: branch.timezone || 'UTC',
          isActive: nextStatus,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || data.error || 'Failed to update branch status')
      setBranches((currentBranches) =>
        currentBranches.map((currentBranch) =>
          currentBranch.id === branch.id ? { ...currentBranch, isActive: nextStatus } : currentBranch,
        ),
      )
      if (editBranch?.id === branch.id) {
        setBranchEditForm((currentForm) => ({ ...currentForm, isActive: nextStatus }))
      }
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to update branch status')
    } finally {
      setStatusLoadingKey(null)
    }
  }

  async function handleBrandUpdate(e: React.FormEvent) {
    e.preventDefault()
    setFormError('')
    setFormLoading(true)
    try {
      const body: Record<string, unknown> = {
        name: brandForm.name,
        slug: brandForm.slug,
        isActive: brandForm.isActive,
      }
      body.contactEmail = brandForm.contactEmail.trim() || null

      const res = await fetch(`/api/brands/${brandId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || data.error || 'Failed to update brand')
      setShowEditBrandForm(false)
      await fetchData()
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Failed to update brand')
    } finally {
      setFormLoading(false)
    }
  }

  function openBranchEdit(branch: Branch) {
    setEditBranch(branch)
    setFormError('')
    setBranchEditForm({
      name: branch.name,
      phone: branch.phone || '',
      address: branch.address || '',
      timezone: branch.timezone || 'UTC',
      isActive: branch.isActive,
    })
  }

  async function handleBranchUpdate(e: React.FormEvent) {
    e.preventDefault()
    if (!editBranch) return
    setFormError('')
    setFormLoading(true)
    try {
      const body: Record<string, unknown> = {
        name: branchEditForm.name,
        isActive: branchEditForm.isActive,
      }
      body.phone = branchEditForm.phone.trim() || null
      body.address = branchEditForm.address.trim() || null
      body.timezone = branchEditForm.timezone || 'UTC'

      const res = await fetch(`/api/branches/${editBranch.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || data.error || 'Failed to update branch')
      setEditBranch(null)
      await fetchData()
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Failed to update branch')
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
    <div className="p-8 [&_a]:cursor-pointer [&_button]:cursor-pointer">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
        <Link href="/dashboard/brands" className="hover:text-gray-600 transition">Brands</Link>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        <span className="text-gray-700 font-medium">{brand?.name}</span>
      </div>

      {/* Brand Info Card */}
      {brand && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
          <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-700 text-2xl font-bold">
              {brand.name[0].toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-bold text-gray-900">{brand.name}</h1>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${brand.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                  {brand.isActive ? 'Active' : 'Inactive'}
                </span>
                <UserStatusSwitch
                  checked={brand.isActive}
                  disabled={statusLoadingKey === `brand-${brand.id}`}
                  ariaLabel={`Set ${brand.name} status`}
                  onChange={handleToggleBrandStatus}
                />
              </div>
              <div className="flex items-center gap-4 mt-1">
                <code className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{brand.slug}</code>
                {brand.contactEmail && <span className="text-sm text-gray-500">{brand.contactEmail}</span>}
              </div>
            </div>
          </div>
            <ActionMenu
              items={[
                {
                  label: 'Edit Brand',
                  onClick: () => {
                    setShowEditBrandForm(true)
                    setFormError('')
                  },
                },
              ]}
            />
          </div>
        </div>
      )}

      {/* Branches Section */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-800">Branches <span className="text-gray-400 font-normal text-base">({branches.length})</span></h2>
        <button
          onClick={() => { setShowForm(true); setFormError('') }}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Branch
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-visible">
        {branches.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <svg className="w-12 h-12 mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <p className="font-medium">No branches yet</p>
            <p className="text-sm mt-1">Click &ldquo;New Branch&rdquo; to add one</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Branch</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Phone</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Address</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Timezone</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Status</th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {branches.map((branch) => (
                <tr
                  key={branch.id}
                  className="hover:bg-gray-50 transition cursor-pointer"
                  onClick={() => router.push(`/dashboard/branches/${branch.id}`)}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-violet-100 rounded-lg flex items-center justify-center text-violet-700 text-sm font-bold">
                        {branch.name[0].toUpperCase()}
                      </div>
                      <span className="font-medium text-gray-900">{branch.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {branch.phone || <span className="text-gray-300">-</span>}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                    {branch.address || <span className="text-gray-300">-</span>}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {getTimezoneLabel(branch.timezone)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${branch.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {branch.isActive ? 'Active' : 'Inactive'}
                      </span>
                      <UserStatusSwitch
                        checked={branch.isActive}
                        disabled={statusLoadingKey === `branch-${branch.id}`}
                        ariaLabel={`Set ${branch.name} status`}
                        onChange={(nextValue) => handleToggleBranchStatus(branch, nextValue)}
                      />
                    </div>
                  </td>
                  <td className="relative px-6 py-4 text-right">
                    <ActionMenu
                      items={[
                        { label: 'View Staff', href: `/dashboard/branches/${branch.id}` },
                        { label: 'Edit', onClick: () => openBranchEdit(branch) },
                      ]}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Create Branch Modal */}
      {showForm && (
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
              <h2 className="text-lg font-semibold text-gray-900">New Branch</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600 transition">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleCreate} className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Branch Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Downtown Branch"
                  required
                  minLength={2}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone <span className="text-gray-400 font-normal">(optional)</span></label>
                <input
                  type="text"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="+20 100 000 0000"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Address <span className="text-gray-400 font-normal">(optional)</span></label>
                <input
                  type="text"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  placeholder="123 Main St, Cairo"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Timezone</label>
                <select
                  value={form.timezone}
                  onChange={(e) => setForm({ ...form, timezone: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                >
                  {TIMEZONES.map((timezone) => (
                    <option key={timezone.value} value={timezone.value}>
                      {timezone.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="branchActive"
                  checked={form.isActive}
                  onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                  className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
                <label htmlFor="branchActive" className="text-sm font-medium text-gray-700">Active</label>
              </div>

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
                  onClick={() => setShowForm(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition"
                >
                  {formLoading ? 'Creating...' : 'Create Branch'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Brand Modal */}
      {showEditBrandForm && (
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
              <h2 className="text-lg font-semibold text-gray-900">Edit Brand</h2>
              <button onClick={() => setShowEditBrandForm(false)} className="text-gray-400 hover:text-gray-600 transition">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleBrandUpdate} className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Brand Name</label>
                <input
                  type="text"
                  value={brandForm.name}
                  onChange={(e) => setBrandForm({ ...brandForm, name: e.target.value })}
                  required
                  minLength={2}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Slug</label>
                <input
                  type="text"
                  value={brandForm.slug}
                  onChange={(e) => setBrandForm({ ...brandForm, slug: e.target.value })}
                  required
                  minLength={2}
                  pattern="[a-z0-9-]+"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition font-mono text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Contact <span className="text-gray-400 font-normal">(optional)</span></label>
                <input
                  type="email"
                  value={brandForm.contactEmail}
                  onChange={(e) => setBrandForm({ ...brandForm, contactEmail: e.target.value })}
                  placeholder="contact@brand.com"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                />
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="brandDetailActive"
                  checked={brandForm.isActive}
                  onChange={(e) => setBrandForm({ ...brandForm, isActive: e.target.checked })}
                  className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
                <label htmlFor="brandDetailActive" className="text-sm font-medium text-gray-700">Active</label>
              </div>
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
                  onClick={() => setShowEditBrandForm(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition"
                >
                  {formLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Branch Modal */}
      {editBranch && (
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
              <h2 className="text-lg font-semibold text-gray-900">Edit Branch</h2>
              <button onClick={() => setEditBranch(null)} className="text-gray-400 hover:text-gray-600 transition">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleBranchUpdate} className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Branch Name</label>
                <input
                  type="text"
                  value={branchEditForm.name}
                  onChange={(e) => setBranchEditForm({ ...branchEditForm, name: e.target.value })}
                  required
                  minLength={2}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone <span className="text-gray-400 font-normal">(optional)</span></label>
                <input
                  type="text"
                  value={branchEditForm.phone}
                  onChange={(e) => setBranchEditForm({ ...branchEditForm, phone: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Address <span className="text-gray-400 font-normal">(optional)</span></label>
                <input
                  type="text"
                  value={branchEditForm.address}
                  onChange={(e) => setBranchEditForm({ ...branchEditForm, address: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Timezone</label>
                <select
                  value={branchEditForm.timezone}
                  onChange={(e) => setBranchEditForm({ ...branchEditForm, timezone: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                >
                  {TIMEZONES.map((timezone) => (
                    <option key={timezone.value} value={timezone.value}>
                      {timezone.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="editBranchActive"
                  checked={branchEditForm.isActive}
                  onChange={(e) => setBranchEditForm({ ...branchEditForm, isActive: e.target.checked })}
                  className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
                <label htmlFor="editBranchActive" className="text-sm font-medium text-gray-700">Active</label>
              </div>
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
                  onClick={() => setEditBranch(null)}
                  className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition"
                >
                  {formLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
