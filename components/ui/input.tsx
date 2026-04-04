import * as React from 'react'
import { cn } from '@/lib/utils'

function Input({ className, ...props }: React.ComponentProps<'input'>) {
  return React.createElement('input', {
    'data-slot': 'input',
    className: cn(
      'w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition',
      className,
    ),
    ...props,
  })
}

export { Input }
