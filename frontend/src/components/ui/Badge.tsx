import React from 'react';
import { ServerStatus } from '@/types'

interface BadgeProps {
  status: ServerStatus
  className?: string;
}

const Badge: React.FC<BadgeProps> = ({ status, className = '' }) => {
  const colors = {
    connecting: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800/30 dark:text-yellow-300 border-yellow-400 dark:border-yellow-700',
    connected: 'bg-green-100 text-green-800 dark:bg-green-800/30 dark:text-green-300 border-green-400 dark:border-green-700',
    disconnected: 'bg-red-100 text-red-800 dark:bg-red-800/30 dark:text-red-300 border-red-400 dark:border-red-700',
  }

  const icons = {
    connecting: (
      <svg className="w-2 h-2 fill-current mr-1.5" viewBox="0 0 8 8">
        <circle cx="4" cy="4" r="3" />
      </svg>
    ),
    connected: (
      <svg className="w-2 h-2 fill-current mr-1.5" viewBox="0 0 8 8">
        <circle cx="4" cy="4" r="3" />
      </svg>
    ),
    disconnected: (
      <svg className="w-2 h-2 fill-current mr-1.5" viewBox="0 0 8 8">
        <circle cx="4" cy="4" r="3" />
      </svg>
    ),
  }

  return (
    <span
      className={`px-2.5 py-0.5 inline-flex items-center text-xs leading-5 font-medium rounded-full border ${colors[status]} ${className}`}
    >
      {icons[status]}
      {status}
    </span>
  )
}

export default Badge