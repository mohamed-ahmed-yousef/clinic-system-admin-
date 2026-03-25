'use client'

import { useId } from 'react'

type UserStatusSwitchProps = {
  checked: boolean
  onChange: (nextValue: boolean) => void
  disabled?: boolean
  ariaLabel?: string
}

export default function UserStatusSwitch({
  checked,
  onChange,
  disabled = false,
  ariaLabel = 'Toggle user status',
}: UserStatusSwitchProps) {
  const inputId = useId()

  return (
    <div className="inline-flex select-none">
      <input
        className="sr-only"
        id={inputId}
        type="checkbox"
        checked={checked}
        disabled={disabled}
        aria-label={ariaLabel}
        onChange={(event) => onChange(event.target.checked)}
      />
      <label
        className={['inline-block', disabled ? 'cursor-not-allowed opacity-60' : ''].join(' ')}
        htmlFor={inputId}
      >
        <div
          className={[
            'relative flex h-[16px] w-[30px] items-center rounded-full',
            'transition-all duration-200 [transition-timing-function:cubic-bezier(0.27,0.2,0.25,1.51)]',
            checked ? 'border-[#00da50] bg-[#00da50]' : 'border-[#e62626] bg-[#e62626]',
            disabled ? 'cursor-not-allowed' : 'cursor-pointer',
          ].join(' ')}
        >
          <span
            className={[
              'absolute h-[3px] w-[10px] rounded-[1px] bg-white transition-all duration-200 ease-in-out',
              checked ? 'left-[16px]' : 'left-[0.6px]',
            ].join(' ')}
          />
          <span
            className={[
              'absolute z-[1] flex h-[16px] w-[16px] items-center justify-center rounded-full border bg-white transition-all duration-200',
              '[transition-timing-function:cubic-bezier(0.27,0.2,0.25,1.51)]',
              checked
                ? 'left-[16px] border-[#00da50] shadow-[-1px_1px_2px_rgba(163,163,163,0.45)]'
                : 'left-[0.6px] border-[#e62626] shadow-[1px_1px_2px_rgba(146,146,146,0.45)]',
            ].join(' ')}
          >
            <svg
              viewBox="0 0 365.696 365.696"
              className={[
                'absolute h-[5px] w-[5px] text-[#e62626] transition-all duration-200',
                '[transition-timing-function:cubic-bezier(0.27,0.2,0.25,1.51)]',
                checked ? 'scale-0' : 'scale-100',
              ].join(' ')}
              aria-hidden="true"
            >
              <path
                fill="currentColor"
                d="M243.188 182.86 356.32 69.726c12.5-12.5 12.5-32.766 0-45.247L341.238 9.398c-12.504-12.503-32.77-12.503-45.25 0L182.86 122.528 69.727 9.374c-12.5-12.5-32.766-12.5-45.247 0L9.375 24.457c-12.5 12.504-12.5 32.77 0 45.25l113.152 113.152L9.398 295.99c-12.503 12.503-12.503 32.769 0 45.25L24.48 356.32c12.5 12.5 32.766 12.5 45.247 0l113.132-113.132L295.99 356.32c12.503 12.5 32.769 12.5 45.25 0l15.081-15.082c12.5-12.504 12.5-32.77 0-45.25zm0 0"
              />
            </svg>
            <svg
              viewBox="0 0 24 24"
              className={[
                'absolute h-[9px] w-[9px] text-[#00da50] transition-all duration-200',
                '[transition-timing-function:cubic-bezier(0.27,0.2,0.25,1.51)]',
                checked ? 'scale-100' : 'scale-0',
              ].join(' ')}
              aria-hidden="true"
            >
              <path
                fill="currentColor"
                d="M9.707 19.121a.997.997 0 0 1-1.414 0l-5.646-5.647a1.5 1.5 0 0 1 0-2.121l.707-.707a1.5 1.5 0 0 1 2.121 0L9 14.171l9.525-9.525a1.5 1.5 0 0 1 2.121 0l.707.707a1.5 1.5 0 0 1 0 2.121z"
              />
            </svg>
          </span>
        </div>
      </label>
    </div>
  )
}
