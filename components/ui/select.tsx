import * as React from 'react'
import { cn } from '@/lib/utils'

function Select({ className, children, ...props }: React.ComponentProps<'select'>) {
  return React.createElement(
    'select',
    {
      'data-slot': 'select',
      className: cn(
        'w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition',
        className,
      ),
      ...props,
    },
    children,
  )
}

export { Select }
