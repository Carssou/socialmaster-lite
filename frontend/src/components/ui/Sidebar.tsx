import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  HomeIcon,
  UserIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
} from '@heroicons/react/24/outline'
import { cn } from '../../utils/cn'
import { Avatar, AvatarFallback, Badge } from './index'

interface SidebarProps {
  user?: {
    name: string
    email: string
    tier: string
  } | null
  loading?: boolean
  onLogout: () => void
}

interface NavigationItem {
  name: string
  href: string
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
  badge?: string
}

const navigation: NavigationItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { name: 'Social Accounts', href: '/accounts', icon: UserIcon },
  { name: 'Analytics', href: '/analytics', icon: ChartBarIcon },
  { name: 'Settings', href: '/settings', icon: Cog6ToothIcon },
]

export const Sidebar: React.FC<SidebarProps> = ({ user, loading, onLogout }) => {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const location = useLocation()

  const getUserInitials = (name?: string) => {
    if (!name) return 'U'
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const SidebarContent = ({ mobile = false }: { mobile?: boolean }) => (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className={cn(
        'flex items-center px-6 py-6',
        isCollapsed && !mobile ? 'justify-center px-4' : 'justify-between'
      )}>
        <motion.div
          initial={false}
          animate={{ opacity: isCollapsed && !mobile ? 0 : 1 }}
          transition={{ duration: 0.2 }}
          className={cn(isCollapsed && !mobile ? 'hidden' : 'block')}
        >
          <h1 className="text-xl font-bold text-gray-900">
            Social Master Lite
          </h1>
        </motion.div>
        
        {mobile && (
          <button
            onClick={() => setIsMobileOpen(false)}
            className="p-2 text-gray-500 hover:text-gray-700"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 pb-4">
        <ul className="space-y-2">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href
            return (
              <li key={item.name}>
                <Link
                  to={item.href}
                  onClick={() => mobile && setIsMobileOpen(false)}
                  className={cn(
                    'group flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'nav-active'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 border-l-4 border-transparent hover:border-gray-200'
                  )}
                >
                  <item.icon
                    className={cn(
                      'h-5 w-5 shrink-0 transition-colors icon',
                      isActive ? 'text-primary-500' : 'text-gray-400 group-hover:text-gray-500'
                    )}
                  />
                  
                  <motion.span
                    initial={false}
                    animate={{ 
                      opacity: isCollapsed && !mobile ? 0 : 1,
                      x: isCollapsed && !mobile ? -10 : 0
                    }}
                    transition={{ duration: 0.2 }}
                    className={cn(
                      'ml-3 truncate',
                      isCollapsed && !mobile ? 'hidden' : 'block'
                    )}
                  >
                    {item.name}
                  </motion.span>

                  {item.badge && (
                    <motion.div
                      initial={false}
                      animate={{ 
                        opacity: isCollapsed && !mobile ? 0 : 1,
                        scale: isCollapsed && !mobile ? 0 : 1
                      }}
                      transition={{ duration: 0.2 }}
                      className={cn(
                        'ml-auto',
                        isCollapsed && !mobile ? 'hidden' : 'block'
                      )}
                    >
                      <Badge variant="primary">{item.badge}</Badge>
                    </motion.div>
                  )}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* User section */}
      <div className="border-t border-gray-200 p-4">
        <div className={cn(
          'flex items-center',
          isCollapsed && !mobile ? 'justify-center' : 'justify-between'
        )}>
          <div className={cn(
            'flex items-center min-w-0',
            isCollapsed && !mobile ? 'justify-center' : 'flex-1'
          )}>
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-primary-100 text-primary-700 text-xs">
                {getUserInitials(user?.name)}
              </AvatarFallback>
            </Avatar>
            
            <motion.div
              initial={false}
              animate={{ 
                opacity: isCollapsed && !mobile ? 0 : 1,
                x: isCollapsed && !mobile ? -10 : 0
              }}
              transition={{ duration: 0.2 }}
              className={cn(
                'ml-3 min-w-0 flex-1',
                isCollapsed && !mobile ? 'hidden' : 'block'
              )}
            >
              {loading ? (
                <div className="space-y-1">
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-20"></div>
                  <div className="h-2 bg-gray-200 rounded animate-pulse w-16"></div>
                </div>
              ) : (
                <>
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {user?.name}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {user?.email}
                  </p>
                  <Badge variant="primary" className="mt-1 text-xs">
                    {user?.tier?.toUpperCase()} tier
                  </Badge>
                </>
              )}
            </motion.div>
          </div>

          <motion.button
            initial={false}
            animate={{ 
              opacity: isCollapsed && !mobile ? 0 : 1,
              scale: isCollapsed && !mobile ? 0 : 1
            }}
            transition={{ duration: 0.2 }}
            onClick={onLogout}
            className={cn(
              'p-2 text-gray-400 hover:text-gray-600 transition-colors',
              isCollapsed && !mobile ? 'hidden' : 'block'
            )}
            title="Sign out"
          >
            <ArrowRightOnRectangleIcon className="h-4 w-4" />
          </motion.button>
        </div>
      </div>

      {/* Collapse toggle - Desktop only */}
      {!mobile && (
        <div className="border-t border-gray-200 p-4">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="flex w-full items-center justify-center p-2 text-gray-400 hover:text-gray-600 transition-colors"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? (
              <ChevronDoubleRightIcon className="h-4 w-4" />
            ) : (
              <ChevronDoubleLeftIcon className="h-4 w-4" />
            )}
          </button>
        </div>
      )}
    </div>
  )

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden">
        <button
          type="button"
          className="p-2 text-gray-500 hover:text-gray-700"
          onClick={() => setIsMobileOpen(true)}
        >
          <Bars3Icon className="h-6 w-6" />
        </button>
      </div>

      {/* Desktop sidebar */}
      <motion.div
        initial={false}
        animate={{ width: isCollapsed ? 80 : 280 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:bg-white lg:border-r lg:border-gray-200 lg:shadow-sm"
      >
        <SidebarContent />
      </motion.div>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
              onClick={() => setIsMobileOpen(false)}
            />
            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="fixed inset-y-0 left-0 z-50 w-80 bg-white shadow-xl lg:hidden"
            >
              <SidebarContent mobile />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}