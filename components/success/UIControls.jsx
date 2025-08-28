import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'

/**
 * UIControls - Notifications, Modals and UI Components
 * Extracted from success.js for bundle optimization
 * BUNDLE REDUCTION: Lazy loadable UI system
 */

/**
 * Notification Types Configuration
 */
const NOTIFICATION_TYPES = {
  success: {
    icon: '🎉',
    bgClass: 'bg-gradient-to-r from-emerald-500/90 to-green-500/90 text-white border-emerald-400/50',
    duration: 4000
  },
  error: {
    icon: '⚠️',
    bgClass: 'bg-gradient-to-r from-red-500/90 to-pink-500/90 text-white border-red-400/50',
    duration: 6000
  },
  info: {
    icon: '💡',
    bgClass: 'bg-gradient-to-r from-blue-500/90 to-indigo-500/90 text-white border-blue-400/50',
    duration: 3000
  },
  warning: {
    icon: '🔔',
    bgClass: 'bg-gradient-to-r from-yellow-500/90 to-orange-500/90 text-black border-yellow-400/50',
    duration: 5000
  }
}

/**
 * Notification Component
 */
const NotificationItem = ({ notification, onRemove }) => {
  const config = NOTIFICATION_TYPES[notification.type] || NOTIFICATION_TYPES.info

  React.useEffect(() => {
    const timer = setTimeout(() => {
      onRemove(notification.id)
    }, config.duration)

    return () => clearTimeout(timer)
  }, [notification.id, config.duration, onRemove])

  return (
    <motion.div
      initial={{ opacity: 0, y: -50, x: 50 }}
      animate={{ opacity: 1, y: 0, x: 0 }}
      exit={{ opacity: 0, x: 100 }}
      className={`p-4 rounded-xl shadow-2xl max-w-sm border backdrop-blur-lg ${config.bgClass}`}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          {config.icon}
        </div>
        <div className="flex-1">
          {notification.title && (
            <div className="font-semibold text-sm mb-1">{notification.title}</div>
          )}
          <div className="text-sm opacity-95">{notification.message}</div>
        </div>
        <button
          onClick={() => onRemove(notification.id)}
          className="text-current opacity-70 hover:opacity-100 ml-2"
        >
          ×
        </button>
      </div>
    </motion.div>
  )
}

/**
 * Notification System
 */
const NotificationSystem = ({ notifications = [], onRemove }) => {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      <AnimatePresence>
        {notifications.map(notification => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            onRemove={onRemove}
          />
        ))}
      </AnimatePresence>
    </div>
  )
}

/**
 * Loading Overlay Component
 */
const LoadingOverlay = ({ isVisible, title = "Ładowanie...", subtitle = "Proszę czekać" }) => {
  if (!isVisible) return null

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl p-8 max-w-sm w-full m-4 text-center"
      >
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-500 mx-auto mb-4"></div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600">{subtitle}</p>
      </motion.div>
    </div>
  )
}

/**
 * Language Toggle Component
 */
const LanguageToggle = ({ currentLanguage = 'pl', onLanguageChange }) => {
  const languages = [
    { code: 'pl', name: 'Polski', flag: '🇵🇱' },
    { code: 'en', name: 'English', flag: '🇺🇸' }
  ]

  return (
    <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg p-2">
      {languages.map(lang => (
        <button
          key={lang.code}
          onClick={() => onLanguageChange(lang.code)}
          className={`px-3 py-1 rounded-md text-sm font-medium transition-all ${
            currentLanguage === lang.code
              ? 'bg-white text-purple-600'
              : 'text-white hover:bg-white/20'
          }`}
        >
          <span className="mr-1">{lang.flag}</span>
          {lang.name}
        </button>
      ))}
    </div>
  )
}

/**
 * Action Button Component
 */
const ActionButton = ({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  className = '',
  ...props
}) => {
  const variants = {
    primary: 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700',
    secondary: 'bg-white/20 backdrop-blur-sm text-white border border-white/30 hover:bg-white/30',
    danger: 'bg-gradient-to-r from-red-500 to-pink-500 text-white hover:from-red-600 hover:to-pink-600',
    success: 'bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600'
  }

  const sizes = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg'
  }

  const baseClasses = `
    font-bold rounded-xl transition-all duration-300 
    disabled:opacity-50 disabled:cursor-not-allowed
    transform hover:scale-105 active:scale-95
    ${variants[variant]} 
    ${sizes[size]} 
    ${className}
  `

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={baseClasses}
      {...props}
    >
      {loading ? (
        <div className="flex items-center justify-center gap-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
          <span>Ładowanie...</span>
        </div>
      ) : (
        children
      )}
    </button>
  )
}

/**
 * Modal Backdrop Component
 */
const ModalBackdrop = ({ isVisible, onClose, children, className = '' }) => {
  if (!isVisible) return null

  return (
    <div 
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center"
      onClick={onClose}
    >
      <div 
        className={`bg-white rounded-2xl max-w-4xl max-h-[90vh] overflow-y-auto m-4 ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  )
}

/**
 * Progress Bar Component
 */
const ProgressBar = ({ 
  progress = 0, 
  showPercentage = true, 
  color = 'purple', 
  size = 'md',
  animated = true 
}) => {
  const colors = {
    purple: 'bg-purple-500',
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    red: 'bg-red-500',
    yellow: 'bg-yellow-500'
  }

  const sizes = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-4'
  }

  return (
    <div className="w-full">
      <div className={`w-full bg-gray-200 rounded-full ${sizes[size]}`}>
        <div 
          className={`${colors[color]} ${sizes[size]} rounded-full transition-all duration-500 ${
            animated ? 'animate-pulse' : ''
          }`}
          style={{ width: `${Math.min(Math.max(progress, 0), 100)}%` }}
        />
      </div>
      {showPercentage && (
        <div className="text-center text-sm text-gray-600 mt-1">
          {Math.round(progress)}%
        </div>
      )}
    </div>
  )
}

/**
 * Toast Notification Hook
 */
export const useNotifications = (notifications, setNotifications) => {
  const addNotification = React.useCallback((notification) => {
    const id = Date.now() + Math.random()
    const newNotification = {
      id,
      timestamp: new Date().toISOString(),
      ...notification
    }
    
    setNotifications(prev => [...prev, newNotification])
    return id
  }, [setNotifications])

  const removeNotification = React.useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }, [setNotifications])

  const clearAllNotifications = React.useCallback(() => {
    setNotifications([])
  }, [setNotifications])

  const showSuccess = React.useCallback((message, title = 'Sukces!') => {
    return addNotification({ type: 'success', message, title })
  }, [addNotification])

  const showError = React.useCallback((message, title = 'Błąd!') => {
    return addNotification({ type: 'error', message, title })
  }, [addNotification])

  const showInfo = React.useCallback((message, title = '') => {
    return addNotification({ type: 'info', message, title })
  }, [addNotification])

  const showWarning = React.useCallback((message, title = 'Uwaga!') => {
    return addNotification({ type: 'warning', message, title })
  }, [addNotification])

  return {
    addNotification,
    removeNotification,
    clearAllNotifications,
    showSuccess,
    showError,
    showInfo,
    showWarning
  }
}

/**
 * Main UIControls Component
 */
const UIControls = ({
  notifications = [],
  onNotificationRemove,
  isLoading = false,
  loadingTitle,
  loadingSubtitle,
  currentLanguage = 'pl',
  onLanguageChange,
  children
}) => {
  return (
    <>
      {/* Notification System */}
      <NotificationSystem 
        notifications={notifications}
        onRemove={onNotificationRemove}
      />

      {/* Loading Overlay */}
      <LoadingOverlay
        isVisible={isLoading}
        title={loadingTitle}
        subtitle={loadingSubtitle}
      />

      {/* Language Toggle */}
      {onLanguageChange && (
        <div className="fixed top-4 left-4 z-40">
          <LanguageToggle
            currentLanguage={currentLanguage}
            onLanguageChange={onLanguageChange}
          />
        </div>
      )}

      {/* Children content */}
      {children}
    </>
  )
}

export default UIControls
export {
  NotificationSystem,
  LoadingOverlay,
  LanguageToggle,
  ActionButton,
  ModalBackdrop,
  ProgressBar,
  NOTIFICATION_TYPES
}