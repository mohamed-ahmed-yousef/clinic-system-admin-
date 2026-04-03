'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import ActionMenu from '@/components/ActionMenu'
import UserStatusSwitch from '@/components/UserStatusSwitch'

interface Brand {
  id: number
  name: string
  slug: string
  logoUrl: string | null
  contactEmail: string | null
  isActive: boolean
  createdAt: string
}

export default function BrandsPage() {
  const router = useRouter()
  const [brands, setBrands] = useState<Brand[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editBrand, setEditBrand] = useState<Brand | null>(null)
  const [formError, setFormError] = useState('')
  const [formLoading, setFormLoading] = useState(false)
  const [statusLoadingId, setStatusLoadingId] = useState<number | null>(null)
  const [form, setForm] = useState({
    name: '',
    slug: '',
    contactEmail: '',
    logoUrl: '',
    isActive: true,
  })
  const [editForm, setEditForm] = useState({
    name: '',
    slug: '',
    contactEmail: '',
    isActive: true,
  })

  async function fetchBrands() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/brands')
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || data.error || 'Failed to load brands')
      setBrands(data.data?.data || [])
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load brands')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchBrands() }, [])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setFormError('')
    setFormLoading(true)
    try {
      const body: Record<string, unknown> = { name: form.name, slug: form.slug, isActive: form.isActive }
      if (form.contactEmail) body.contactEmail = form.contactEmail
      if (form.logoUrl) body.logoUrl = form.logoUrl

      const res = await fetch('/api/brands', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || data.error || 'Failed to create brand')
      setShowForm(false)
      setForm({ name: '', slug: '', contactEmail: '', logoUrl: '', isActive: true })
      fetchBrands()
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Failed to create brand')
    } finally {
      setFormLoading(false)
    }
  }

  async function handleToggleStatus(brand: Brand, nextStatus: boolean) {
    setStatusLoadingId(brand.id)
    try {
      const res = await fetch(`/api/brands/${brand.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: brand.name,
          slug: brand.slug,
          contactEmail: brand.contactEmail,
          isActive: nextStatus,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || data.error || 'Failed to update brand status')
      setBrands((currentBrands) =>
        currentBrands.map((currentBrand) =>
          currentBrand.id === brand.id ? { ...currentBrand, isActive: nextStatus } : currentBrand,
        ),
      )
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to update brand status')
    } finally {
      setStatusLoadingId(null)
    }
  }

  function openEditModal(brand: Brand) {
    setEditBrand(brand)
    setFormError('')
    setEditForm({
      name: brand.name,
      slug: brand.slug,
      contactEmail: brand.contactEmail || '',
      isActive: brand.isActive,
    })
  }

  async function handleEdit(e: React.FormEvent) {
    e.preventDefault()
    if (!editBrand) return
    setFormError('')
    setFormLoading(true)
    try {
      const body: Record<string, unknown> = {
        name: editForm.name,
        slug: editForm.slug,
        isActive: editForm.isActive,
      }
      body.contactEmail = editForm.contactEmail.trim() || null

      const res = await fetch(`/api/brands/${editBrand.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || data.error || 'Failed to update brand')
      setEditBrand(null)
      await fetchBrands()
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Failed to update brand')
    } finally {
      setFormLoading(false)
    }
  }

  function autoSlug(name: string) {
    return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
  }

  return (
    <div className="p-8 [&_a]:cursor-pointer [&_button]:cursor-pointer">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Brands</h1>
          <p className="text-gray-500 text-sm mt-1">Manage clinic brands and their branches</p>
        </div>
        <button
          onClick={() => { setShowForm(true); setFormError('') }}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Brand
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
          <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
          <button onClick={fetchBrands} className="ml-auto text-red-600 hover:underline font-medium">Retry</button>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-visible">
        {loading ? (
          <div className="flex items-center justify-center py-20 text-gray-400">
            <svg className="animate-spin w-6 h-6 mr-2" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Loading brands...
          </div>
        ) : brands.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <svg className="w-12 h-12 mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <p className="font-medium">No brands yet</p>
            <p className="text-sm mt-1">Click &ldquo;New Brand&rdquo; to create one</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Brand</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Slug</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Contact</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Status</th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {brands.map((brand) => (
                <tr
                  key={brand.id}
                  className="hover:bg-gray-50 transition cursor-pointer"
                  onClick={() => router.push(`/dashboard/brands/${brand.id}`)}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-700 text-sm font-bold">
                        {brand.name[0].toUpperCase()}
                      </div>
                      <span className="font-medium text-gray-900">{brand.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <code className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">{brand.slug}</code>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {brand.contactEmail || <span className="text-gray-300">-</span>}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${brand.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {brand.isActive ? 'Active' : 'Inactive'}
                      </span>
                      <UserStatusSwitch
                        checked={brand.isActive}
                        disabled={statusLoadingId === brand.id}
                        ariaLabel={`Set ${brand.name} status`}
                        onChange={(nextValue) => handleToggleStatus(brand, nextValue)}
                      />
                    </div>
                  </td>
                  <td className="relative px-6 py-4 text-right">
                    <ActionMenu
                      items={[
                        { label: 'View Branches', href: `/dashboard/brands/${brand.id}` },
                        { label: 'Edit', onClick: () => openEditModal(brand) },
                      ]}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Create Brand Modal */}
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
              <h2 className="text-lg font-semibold text-gray-900">Create New Brand</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600 transition">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleCreate} className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Brand Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => {
                    const name = e.target.value
                    setForm({ ...form, name, slug: autoSlug(name) })
                  }}
                  placeholder="e.g. Cairo Clinic"
                  required
                  minLength={2}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Slug</label>
                <input
                  type="text"
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  placeholder="e.g. cairo-clinic"
                  required
                  minLength={2}
                  pattern="[a-z0-9-]+"
                  title="Lowercase letters, numbers, and hyphens only"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition font-mono text-sm"
                />
                <p className="text-xs text-gray-400 mt-1">Auto-filled from name. Lowercase, hyphens only.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Contact Email <span className="text-gray-400 font-normal">(optional)</span></label>
                <input
                  type="email"
                  value={form.contactEmail}
                  onChange={(e) => setForm({ ...form, contactEmail: e.target.value })}
                  placeholder="contact@brand.com"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                />
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={form.isActive}
                  onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                  className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
                <label htmlFor="isActive" className="text-sm font-medium text-gray-700">Active</label>
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
                  {formLoading ? 'Creating...' : 'Create Brand'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Brand Modal */}
      {editBrand && (
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
              <button onClick={() => setEditBrand(null)} className="text-gray-400 hover:text-gray-600 transition">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleEdit} className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Brand Name</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  required
                  minLength={2}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Slug</label>
                <input
                  type="text"
                  value={editForm.slug}
                  onChange={(e) => setEditForm({ ...editForm, slug: e.target.value })}
                  required
                  minLength={2}
                  pattern="[a-z0-9-]+"
                  title="Lowercase letters, numbers, and hyphens only"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition font-mono text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Contact <span className="text-gray-400 font-normal">(optional)</span></label>
                <input
                  type="email"
                  value={editForm.contactEmail}
                  onChange={(e) => setEditForm({ ...editForm, contactEmail: e.target.value })}
                  placeholder="contact@brand.com"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                />
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="editBrandActive"
                  checked={editForm.isActive}
                  onChange={(e) => setEditForm({ ...editForm, isActive: e.target.checked })}
                  className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
                <label htmlFor="editBrandActive" className="text-sm font-medium text-gray-700">Active</label>
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
                  onClick={() => setEditBrand(null)}
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
