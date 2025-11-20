/**
 * Authentication Middleware
 * Protects routes and handles authentication requirements
 */

import { useAuth } from '@/shared/composables/useAuth'

export function requireAuth(to, from, next) {
  const { isAuthenticated, initializeAuth } = useAuth()

  // Check if already authenticated
  if (isAuthenticated.value) {
    return next()
  }

  // Try to initialize authentication from stored token
  initializeAuth().then(authenticated => {
    if (authenticated) {
      return next()
    } else {
      // Redirect to login with return URL
      next({
        path: '/auth/login',
        query: { redirect: to.fullPath }
      })
    }
  })
}

export function requireGuest(to, from, next) {
  const { isAuthenticated } = useAuth()

  // Redirect authenticated users away from auth pages
  if (isAuthenticated.value) {
    return next('/')
  }

  return next()
}

export function requireRole(roles) {
  return (to, from, next) => {
    const { user, userRole, hasPermission } = useAuth()

    if (!user.value) {
      return next({
        path: '/auth/login',
        query: { redirect: to.fullPath }
      })
    }

    // Check if user has required role
    if (Array.isArray(roles)) {
      if (!roles.includes(userRole.value)) {
        return next({
          path: '/unauthorized',
          query: {
            requiredRole: roles.join(','),
            currentRole: userRole.value,
            reason: 'insufficient_role'
          }
        })
      }
    } else if (userRole.value !== roles) {
      return next({
        path: '/unauthorized',
        query: {
          requiredRole: roles,
          currentRole: userRole.value,
          reason: 'insufficient_role'
        }
      })
    }

    return next()
  }
}

export function requirePermission(permission) {
  return (to, from, next) => {
    const { user, hasPermission } = useAuth()

    if (!user.value) {
      return next({
        path: '/auth/login',
        query: { redirect: to.fullPath }
      })
    }

    if (!hasPermission.value(permission)) {
      return next({
        path: '/unauthorized',
        query: {
          requiredPermission: permission,
          currentRole: user.value?.role,
          reason: 'insufficient_permission'
        }
      })
    }

    return next()
  }
}

export function requireAnyPermission(permissions) {
  return (to, from, next) => {
    const { user, hasAnyPermission } = useAuth()

    if (!user.value) {
      return next({
        path: '/auth/login',
        query: { redirect: to.fullPath }
      })
    }

    if (!hasAnyPermission.value(permissions)) {
      return next({
        path: '/unauthorized',
        query: {
          requiredPermissions: permissions.join(','),
          currentRole: user.value?.role,
          reason: 'insufficient_permissions'
        }
      })
    }

    return next()
  }
}

// Biometric-specific middleware
export function requireBiometricEnrollment(to, from, next) {
  const { user, hasPermission } = useAuth()

  if (!user.value) {
    return next({
      path: '/auth/login',
      query: { redirect: to.fullPath }
    })
  }

  // Check if user has biometric enrollment
  if (!user.value.biometricEnrolled) {
    return next({
      path: '/biometric/enroll',
      query: {
        redirect: to.fullPath,
        reason: 'biometric_required'
      }
    })
  }

  return next()
}

export function auditRoute(to, from) {
  const { user } = useAuth()

  // Log route navigation for security audit
  const auditData = {
    userId: user.value?.id,
    from: from.fullPath,
    to: to.fullPath,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent
  }

  // Send audit log to server
  // This would be handled by the audit service
  console.log('ROUTE_AUDIT:', auditData)
}