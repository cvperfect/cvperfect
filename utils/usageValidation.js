// utils/usageValidation.js
import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client
const supabase = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
  ? createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )
  : null

/**
 * Validates if user has valid payment and available usage before optimization
 * @param {string} email - User email (already sanitized)
 * @param {boolean} allowDemo - Whether to allow demo mode (deprecated, always false)
 * @returns {Promise<{success: boolean, user?: object, error?: string, code?: string}>}
 */
export async function validateUsageBeforeOptimization(email, allowDemo = false) {
  // Check if Supabase is initialized
  if (!supabase) {
    return {
      success: false,
      error: 'Błąd konfiguracji bazy danych',
      code: 'DB_CONFIG_ERROR'
    }
  }

  try {
    // Fetch user from database
    const { data: user, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email.toLowerCase())
      .single()

    // User not found - payment required
    if (fetchError || !user) {
      console.log('❌ User not found:', email)
      return {
        success: false,
        error: 'Nie znaleziono użytkownika z wykupionym planem.',
        code: 'USER_NOT_FOUND'
      }
    }

    // Check if plan expired (if expires_at is set)
    if (user.expires_at) {
      const expiryDate = new Date(user.expires_at)
      const now = new Date()

      if (expiryDate < now) {
        console.log('❌ Plan expired for user:', email)
        return {
          success: false,
          error: 'Twój plan wygasł.',
          code: 'PLAN_EXPIRED'
        }
      }
    }

    // Check usage limit
    const usageCount = user.usage_count || 0
    const usageLimit = user.usage_limit || 0

    if (usageCount >= usageLimit) {
      console.log('❌ Usage limit exceeded for user:', email, {
        usageCount,
        usageLimit
      })
      return {
        success: false,
        error: 'Wykorzystałeś już wszystkie dostępne optymalizacje.',
        code: 'USAGE_LIMIT_EXCEEDED'
      }
    }

    // All checks passed - increment usage count
    const { error: updateError } = await supabase
      .from('users')
      .update({
        usage_count: usageCount + 1,
        last_used_at: new Date().toISOString()
      })
      .eq('email', email.toLowerCase())

    if (updateError) {
      console.error('❌ Error incrementing usage count:', updateError)
      // Don't block user if update fails, but log the error
    }

    console.log('✅ Usage validation passed for user:', email, {
      usageCount: usageCount + 1,
      usageLimit,
      remaining: usageLimit - usageCount - 1
    })

    return {
      success: true,
      user: {
        ...user,
        usage_count: usageCount + 1,
        remaining: usageLimit - usageCount - 1
      }
    }

  } catch (error) {
    console.error('❌ Usage validation error:', error)
    return {
      success: false,
      error: 'Błąd weryfikacji użycia. Spróbuj ponownie.',
      code: 'VALIDATION_ERROR'
    }
  }
}
