'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type ActionItem = {
  label: string
  href?: string
  onClick?: () => void
  tone?: 'default' | 'danger'
}

interface ActionMenuProps {
  items: ActionItem[]
}

export default function ActionMenu({ items }: ActionMenuProps) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function closeMenu() {
    setOpen(false)
  }

  return (
    <div
      ref={containerRef}
      className="relative inline-flex"
      onClick={(e) => e.stopPropagation()}
    >
      <Button
        aria-label="Open actions"
        aria-expanded={open}
        onClick={(e) => {
          e.stopPropagation()
          setOpen((value) => !value)
        }}
        variant="outline"
        size="icon"
        className="rounded-full text-gray-500 shadow-sm hover:border-gray-300 hover:text-gray-700"
      >
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6h.01M12 12h.01M12 18h.01" />
        </svg>
      </Button>

      {open && (
        <div className="absolute right-0 top-11 z-[200] min-w-40 rounded-xl border border-gray-200 bg-white p-1.5 shadow-xl">
          {items.map((item) => {
            const className = `flex w-full items-center rounded-lg px-3 py-2 text-sm font-medium transition ${
              item.tone === 'danger'
                ? 'text-red-600 hover:bg-red-50'
                : 'text-gray-700 hover:bg-gray-50'
            }`

            if (item.href) {
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={closeMenu}
                  className={className}
                >
                  {item.label}
                </Link>
              )
            }

            return (
              <Button
                key={item.label}
                type="button"
                variant="ghost"
                onClick={() => {
                  item.onClick?.()
                  closeMenu()
                }}
                className={cn(className, 'justify-start shadow-none')}
              >
                {item.label}
              </Button>
            )
          })}
        </div>
      )}
    </div>
  )
}
