import React from 'react'
import { useLocation } from 'react-router-dom'
import { ChevronRightIcon } from '@heroicons/react/24/outline'
import { cn } from '../../utils/cn'

interface HeaderProps {
  className?: string
}

const routeTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/accounts': 'Social Accounts', 
  '/analytics': 'Analytics',
  '/settings': 'Settings',
}

const routeDescriptions: Record<string, string> = {
  '/dashboard': 'Overview of your social media performance',
  '/accounts': 'Manage your connected social media accounts',
  '/analytics': 'View metrics and AI-powered insights',
  '/settings': 'Manage your account settings and preferences',
}

export const Header: React.FC<HeaderProps> = ({ className }) => {
  const location = useLocation()
  const currentTitle = routeTitles[location.pathname] || 'Page'
  const currentDescription = routeDescriptions[location.pathname]

  // Generate breadcrumbs
  const generateBreadcrumbs = () => {
    const pathSegments = location.pathname.split('/').filter(Boolean)
    const breadcrumbs = [{ name: 'Home', href: '/dashboard' }]

    pathSegments.forEach((segment, index) => {
      const href = `/${pathSegments.slice(0, index + 1).join('/')}`
      const name = routeTitles[href] || segment.charAt(0).toUpperCase() + segment.slice(1)
      
      if (href !== '/dashboard') {
        breadcrumbs.push({ name, href })
      }
    })

    return breadcrumbs
  }

  const breadcrumbs = generateBreadcrumbs()

  return (
    <header className={cn('bg-white border-b border-gray-200', className)}>
      <div className="px-6 py-4">
        {/* Breadcrumbs */}
        <nav className="flex mb-2" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-2">
            {breadcrumbs.map((crumb, index) => (
              <li key={crumb.href} className="flex items-center">
                {index > 0 && (
                  <ChevronRightIcon className="h-4 w-4 text-gray-400 mx-2" />
                )}
                <span
                  className={cn(
                    'text-sm font-medium',
                    index === breadcrumbs.length - 1
                      ? 'text-gray-900'
                      : 'text-gray-500 hover:text-gray-700'
                  )}
                >
                  {crumb.name}
                </span>
              </li>
            ))}
          </ol>
        </nav>

        {/* Page title and description */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              {currentTitle}
            </h1>
            {currentDescription && (
              <p className="mt-1 text-sm text-gray-600">
                {currentDescription}
              </p>
            )}
          </div>

          {/* Optional: Add action buttons here for each page */}
          <div className="flex items-center space-x-3">
            {/* This space can be used for page-specific actions */}
          </div>
        </div>
      </div>
    </header>
  )
}