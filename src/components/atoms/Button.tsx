import type { ButtonHTMLAttributes } from 'react'

const BASE =
  'inline-flex cursor-pointer items-center justify-center transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-50'

const SOLID = 'min-h-10 gap-2 rounded-md text-sm font-medium'

const VARIANTS = {
  primary: `${SOLID} bg-primary text-white hover:bg-slate-700`,
  secondary: `${SOLID} border border-control bg-card text-foreground hover:bg-slate-100`,
  ghost: 'rounded hover:bg-slate-200',
  link: 'min-h-10 px-2 text-sm font-medium text-accent underline underline-offset-2',
}

const PADDING = { md: 'px-4', sm: 'px-3' }

export function Button({
  variant,
  size = 'md',
  type = 'button',
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant: keyof typeof VARIANTS
  size?: keyof typeof PADDING
}) {
  const padding =
    variant === 'primary' || variant === 'secondary' ? PADDING[size] : ''
  return (
    <button
      type={type}
      className={`${BASE} ${VARIANTS[variant]} ${padding} ${className}`}
      {...props}
    />
  )
}
