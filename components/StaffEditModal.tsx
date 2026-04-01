'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'

type RoleOption = {
  value: string
  label: string
}

type StaffEditModalProps = {
  isOpen: boolean
  username: string
  saving: boolean
  error?: string
  role?: string | null
  roleLabel?: string
  roleOptions?: RoleOption[]
  onClose: () => void
  onSubmit: (payload: { username: string; password: string; role?: string }) => void | Promise<void>
}

export default function StaffEditModal({
  isOpen,
  username,
  saving,
  error = '',
  role,
  roleLabel = 'Role',
  roleOptions,
  onClose,
  onSubmit,
}: StaffEditModalProps) {
  const [draftUsername, setDraftUsername] = useState(username)
  const [draftPassword, setDraftPassword] = useState('')
  const [draftRole, setDraftRole] = useState(role ?? '')

  useEffect(() => {
    if (!isOpen) return
    setDraftUsername(username)
    setDraftPassword('')
    setDraftRole(role ?? '')
  }, [isOpen, role, username])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onMouseDown={(e) => {
        e.preventDefault()
        e.stopPropagation()
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="mb-2 text-lg font-semibold text-gray-900">Edit Staff Account</h3>
        <p className="mb-6 text-sm text-gray-500">
          Update the username and optionally set a new password for {username}.
        </p>

        <div className="space-y-4">
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-gray-700">Username</span>
            <input
              value={draftUsername}
              onChange={(event) => setDraftUsername(event.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
              placeholder="Enter username"
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-gray-700">New password</span>
            <input
              type="password"
              value={draftPassword}
              onChange={(event) => setDraftPassword(event.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
              placeholder="Leave blank to keep current password"
            />
            <span className="mt-1.5 block text-xs text-gray-500">
              Leave blank if you only want to change the username.
            </span>
          </label>

          {roleOptions?.length ? (
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-gray-700">{roleLabel}</span>
              <select
                value={draftRole}
                onChange={(event) => setDraftRole(event.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
              >
                {roleOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          ) : null}
        </div>

        {error ? (
          <div className="mt-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <svg className="h-4 w-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            {error}
          </div>
        ) : null}

        <div className="mt-6 flex gap-3">
          <Button
            onClick={onClose}
            disabled={saving}
            variant="outline"
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={() =>
              void onSubmit({
                username: draftUsername,
                password: draftPassword,
                ...(roleOptions?.length ? { role: draftRole } : {}),
              })
            }
            disabled={saving}
            className="flex-1"
          >
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>
    </div>
  )
}
