'use client'

import { cn } from '@/lib/utils'

interface LogoProps {
  className?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  showText?: boolean
  variant?: 'default' | 'white' | 'dark'
}

export function Logo({ className, size = 'md', showText = true, variant = 'default' }: LogoProps) {
  const sizes = {
    sm: { icon: 24, text: 'text-lg' },
    md: { icon: 32, text: 'text-xl' },
    lg: { icon: 40, text: 'text-2xl' },
    xl: { icon: 56, text: 'text-4xl' },
  }

  const colors = {
    default: { primary: '#e50914', secondary: '#ffffff' },
    white: { primary: '#ffffff', secondary: '#ffffff' },
    dark: { primary: '#e50914', secondary: '#0a0a0a' },
  }

  const { icon, text } = sizes[size]
  const { primary, secondary } = colors[variant]

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <svg
        width={icon}
        height={icon}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="flex-shrink-0"
      >
        {/* Hexagonal Tech Symbol */}
        <path
          d="M24 4L42 14V34L24 44L6 34V14L24 4Z"
          fill={primary}
          fillOpacity="0.1"
        />
        <path
          d="M24 4L42 14V34L24 44L6 34V14L24 4Z"
          stroke={primary}
          strokeWidth="2"
          strokeLinejoin="round"
        />
        {/* Inner S Symbol */}
        <path
          d="M18 18C18 15.8 19.8 14 22 14H26C28.2 14 30 15.8 30 18C30 20.2 28.2 22 26 22H22C19.8 22 18 23.8 18 26C18 28.2 19.8 30 22 30H26C28.2 30 30 28.2 30 26"
          stroke={primary}
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        {/* Tech Dots */}
        <circle cx="24" cy="18" r="1.5" fill={primary} />
        <circle cx="24" cy="30" r="1.5" fill={primary} />
      </svg>
      {showText && (
        <div className="flex flex-col leading-none">
          <span 
            className={cn(
              'font-bold tracking-tight',
              text
            )}
            style={{ color: secondary }}
          >
            Soleer
          </span>
          <span 
            className={cn(
              'text-[0.6em] font-medium tracking-[0.3em] uppercase',
            )}
            style={{ color: primary }}
          >
            Hub
          </span>
        </div>
      )}
    </div>
  )
}

export function LogoIcon({ className, size = 32 }: { className?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M24 4L42 14V34L24 44L6 34V14L24 4Z"
        fill="#e50914"
        fillOpacity="0.1"
      />
      <path
        d="M24 4L42 14V34L24 44L6 34V14L24 4Z"
        stroke="#e50914"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M18 18C18 15.8 19.8 14 22 14H26C28.2 14 30 15.8 30 18C30 20.2 28.2 22 26 22H22C19.8 22 18 23.8 18 26C18 28.2 19.8 30 22 30H26C28.2 30 30 28.2 30 26"
        stroke="#e50914"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <circle cx="24" cy="18" r="1.5" fill="#e50914" />
      <circle cx="24" cy="30" r="1.5" fill="#e50914" />
    </svg>
  )
}
